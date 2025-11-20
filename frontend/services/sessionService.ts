
import { ClassSession, SessionStatus, User, HistorySession } from '../types';
import { MOCK_SESSIONS, ADHOC_SESSIONS, MOCK_USERS, generateSessionsFromRoutine, saveData, notify } from './mockDb';
import { addAuditLog } from './auditService';
import { isPast, parseISO, isAfter, addSeconds, startOfDay, startOfWeek, startOfMonth, format } from 'date-fns';

export const createAdHocSession = async (
    data: { courseName: string; courseCode: string; room: string; startTime: string; endTime: string; teacherId: string; teacherName: string }
): Promise<ClassSession> => {
    
    const newSession: ClassSession = {
        id: `adhoc-${Date.now()}`,
        course: {
            id: `c-${data.courseCode}`,
            code: data.courseCode,
            name: data.courseName,
            teacherName: data.teacherName,
            teacherId: data.teacherId
        },
        start_time: data.startTime,
        end_time: data.endTime,
        status: SessionStatus.SCHEDULED, 
        room: data.room,
        totalStudents: MOCK_USERS.filter(u => u.role === 'student').length,
        liveAttendance: []
    };

    ADHOC_SESSIONS.push(newSession);
    generateSessionsFromRoutine(); 
    addAuditLog(data.teacherName, 'Created Instant Session', data.courseName, 'teacher');
    saveData(); 
    notify(); 
    return new Promise(res => setTimeout(() => res(newSession), 300));
};

export const getStudentSessions = async (studentId: string): Promise<ClassSession[]> => {
    generateSessionsFromRoutine();
    return new Promise(res => setTimeout(() => res(JSON.parse(JSON.stringify(MOCK_SESSIONS))), 200));
};

export const getTeacherSessions = async (teacherId: string): Promise<ClassSession[]> => {
    generateSessionsFromRoutine();
    const filtered = MOCK_SESSIONS.filter(s => s.course.teacherId === teacherId);
    return new Promise(res => setTimeout(() => res(JSON.parse(JSON.stringify(filtered))), 200));
};

export const getStudentHistorySessions = async (studentId: string): Promise<HistorySession[]> => {
    generateSessionsFromRoutine();
    const pastSessions = MOCK_SESSIONS.filter(s => isPast(parseISO(s.end_time)) || s.status === SessionStatus.COMPLETED);
    
    const history: HistorySession[] = pastSessions.map(session => ({
        ...session,
        attended: session.liveAttendance.some(att => att.student.id === studentId)
    }));
    
    history.sort((a, b) => parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime());

    return new Promise(res => setTimeout(() => res(JSON.parse(JSON.stringify(history))), 200));
};

export const updateSessionStatus = (sessionId: string, status: SessionStatus, actor?: { name: string, role: string }) => {
    const session = MOCK_SESSIONS.find(s => s.id === sessionId);
    if (session) {
        session.status = status;
        if(status === SessionStatus.SCHEDULED) {
            session.liveAttendance = [];
            session.activePasscode = undefined;
        }
        
        const adHocIndex = ADHOC_SESSIONS.findIndex(s => s.id === sessionId);
        if (adHocIndex !== -1) {
            ADHOC_SESSIONS[adHocIndex] = { ...session, status };
        }

        addAuditLog(actor?.name || session.course.teacherName, 'Updated Session Status', `${session.course.code} - ${status}`, actor?.role || 'teacher');
        saveData();
        notify();
    }
    return session ? JSON.parse(JSON.stringify(session)) : undefined;
};

export const setSessionPasscode = (sessionId: string, passcode: string, durationSeconds: number) => {
    const session = MOCK_SESSIONS.find(s => s.id === sessionId);
    if (session) {
        session.activePasscode = passcode;
        session.passcodeExpiry = addSeconds(new Date(), durationSeconds).toISOString();
        
        const adHocIndex = ADHOC_SESSIONS.findIndex(s => s.id === sessionId);
        if (adHocIndex !== -1) {
            ADHOC_SESSIONS[adHocIndex].activePasscode = passcode;
            ADHOC_SESSIONS[adHocIndex].passcodeExpiry = session.passcodeExpiry;
        }

        saveData();
        notify();
    }
};

export const markAttendance = (sessionId: string, student: User, passcode?: string): {success: boolean, message: string} => {
    const session = MOCK_SESSIONS.find(s => s.id === sessionId);
    if (!session) return {success: false, message: 'Session not found'};
    if (session.status !== SessionStatus.ONGOING) return {success: false, message: 'Session is not active for attendance'};
    
    if (passcode !== undefined) {
        if (!session.activePasscode) return { success: false, message: 'No active passcode for this session.' };
        if (session.activePasscode.toUpperCase() !== passcode.toUpperCase()) return { success: false, message: 'Invalid passcode/QR code.' };
        if (session.passcodeExpiry && isAfter(new Date(), parseISO(session.passcodeExpiry))) {
             return { success: false, message: 'Passcode has expired. Ask teacher to refresh.' };
        }
    }

    const alreadyMarked = session.liveAttendance.some(a => a.student.id === student.id);
    if(alreadyMarked) return { success: false, message: 'Attendance already marked for this session' };

    const newRecord = {
        id: `att-${Date.now()}-${Math.random()}`,
        student,
        checked_at: new Date().toISOString()
    };
    session.liveAttendance.push(newRecord);

     const adHocIndex = ADHOC_SESSIONS.findIndex(s => s.id === sessionId);
     if (adHocIndex !== -1) {
         ADHOC_SESSIONS[adHocIndex].liveAttendance.push(newRecord);
     }

    saveData();
    notify();
    return { success: true, message: 'Attendance marked successfully!' };
};

export const exportAttendanceData = async (teacherId: string, period: 'daily' | 'weekly' | 'monthly', courseCode?: string): Promise<string> => {
    const sessions = await getTeacherSessions(teacherId);
    const now = new Date();
    
    let filteredSessions = sessions;
    if (courseCode && courseCode !== 'all') {
        filteredSessions = filteredSessions.filter(s => s.course.code === courseCode);
    }
    if (period === 'daily') {
        filteredSessions = filteredSessions.filter(s => isAfter(parseISO(s.start_time), startOfDay(now)));
    } else if (period === 'weekly') {
        filteredSessions = filteredSessions.filter(s => isAfter(parseISO(s.start_time), startOfWeek(now)));
    } else if (period === 'monthly') {
         filteredSessions = filteredSessions.filter(s => isAfter(parseISO(s.start_time), startOfMonth(now)));
    }

    let csvContent = "Session Date,Course Code,Course Name,Student Name,Student ID,Check-in Time\n";
    filteredSessions.forEach(session => {
        session.liveAttendance.forEach(record => {
            const row = [
                format(parseISO(session.start_time), 'yyyy-MM-dd HH:mm'),
                session.course.code,
                `"${session.course.name}"`,
                `"${record.student.full_name}"`,
                record.student.student_id || '',
                format(parseISO(record.checked_at), 'HH:mm:ss')
            ].join(",");
            csvContent += row + "\n";
        });
    });
    
    return new Promise(res => setTimeout(() => res(csvContent), 500));
};
