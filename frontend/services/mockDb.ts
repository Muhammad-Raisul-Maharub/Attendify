
import { User, ClassRoutine, ClassSession, AuditLog, SessionStatus } from '../types';
import { startOfWeek, nextDay, set, format, isPast, parseISO, addSeconds } from 'date-fns';

// --- Real-time Subscription System ---
type Subscriber = () => void;
let subscribers: Subscriber[] = [];

export const notify = () => {
    subscribers.forEach(callback => callback());
};

export const subscribeToChanges = (callback: Subscriber) => {
    subscribers.push(callback);
    callback();
};

export const unsubscribeFromChanges = (callback: Subscriber) => {
    subscribers = subscribers.filter(sub => sub !== callback);
};

// --- STORAGE KEYS ---
export const STORAGE_KEYS = {
    USERS: 'attendify_db_users',
    ROUTINE: 'attendify_db_routine',
    SESSIONS: 'attendify_db_sessions', 
    ADHOC_SESSIONS: 'attendify_db_adhoc_sessions', 
    LOGS: 'attendify_db_logs'
};

// --- DEFAULT DATA ---
const DEFAULT_USERS: User[] = [
  { id: '1', auth_uid: 'auth1', email: 'admin@attendify.app', full_name: 'System Admin', role: 'admin', nameChangeHistory: [], password: 'password123' },
  { id: '2', auth_uid: 'auth2', email: 'arif@attendify.app', full_name: 'Mohammad Arif Hasan Chowdhury', role: 'teacher', nameChangeHistory: [], password: 'password123' },
  { id: '3', auth_uid: 'auth3', email: 'zainal@attendify.app', full_name: 'Mohammad Zainal Abedin', role: 'teacher', nameChangeHistory: [], password: 'password123' },
  { id: '4', auth_uid: 'auth4', email: 'mahmudur@attendify.app', full_name: 'Md Mahmudur Rahman', role: 'teacher', nameChangeHistory: [], password: 'password123' },
  { id: '5', auth_uid: 'auth5', email: 'mubasshar@attendify.app', full_name: 'Mubasshar-Ul-Ishraq Tamim', role: 'teacher', nameChangeHistory: [], password: 'password123' },
  { id: '10', auth_uid: 'auth10', email: 'student@attendify.app', full_name: 'Alex Johnson', role: 'student', student_id: 'S001', nameChangeHistory: [], password: 'password123' },
  { id: '11', auth_uid: 'auth11', email: 'student2@attendify.app', full_name: 'Ben Stone', role: 'student', student_id: 'S002', nameChangeHistory: [], password: 'password123' },
];

const DEFAULT_ROUTINE: ClassRoutine[] = [
    { id: 'cr1', day: 'Sunday', start_time: '08:15:00', end_time: '10:00:00', course_code: 'CSE 413', course_name: 'Software Engineering', teacherName: 'Mohammad Arif Hasan Chowdhury', teacherId: '2', room: '1604' },
    { id: 'cr2', day: 'Sunday', start_time: '13:45:00', end_time: '15:30:00', course_code: 'CSE 417', course_name: 'Computer Graphics and Image Processing', teacherName: 'Mohammad Zainal Abedin', teacherId: '3', room: '1405' },
    { id: 'cr3', day: 'Monday', start_time: '08:15:00', end_time: '10:55:00', course_code: 'CSE 418', course_name: 'Computer Graphics and Image Processing Lab', teacherName: 'Mohammad Zainal Abedin', teacherId: '3', room: '402' },
    { id: 'cr4', day: 'Monday', start_time: '11:00:00', end_time: '13:45:00', course_code: 'CSE 414', course_name: 'Software Engineering Lab', teacherName: 'Mohammad Arif Hasan Chowdhury', teacherId: '2', room: '404' },
    { id: 'cr5', day: 'Monday', start_time: '13:45:00', end_time: '14:35:00', course_code: 'CSE 467', course_name: 'Advanced Database Management System', teacherName: 'Md Mahmudur Rahman', teacherId: '4', room: '107' },
    { id: 'cr6', day: 'Tuesday', start_time: '09:10:00', end_time: '10:00:00', course_code: 'CSE 413', course_name: 'Software Engineering', teacherName: 'Mohammad Arif Hasan Chowdhury', teacherId: '2', room: '1403' },
    { id: 'cr7', day: 'Tuesday', start_time: '11:00:00', end_time: '13:45:00', course_code: 'CSE 468', course_name: 'ADBMS Lab', teacherName: 'Md Mahmudur Rahman', teacherId: '4', room: '402' },
    { id: 'cr8', day: 'Tuesday', start_time: '13:45:00', end_time: '16:20:00', course_code: 'EEE 411', course_name: 'VLSI Design', teacherName: 'Mubasshar-Ul-Ishraq Tamim', teacherId: '5', room: '1407' },
    { id: 'cr9', day: 'Wednesday', start_time: '08:15:00', end_time: '10:00:00', course_code: 'CSE 410', course_name: 'System Analysis and Design Lab', teacherName: 'Mohammad Arif Hasan Chowdhury', teacherId: '2', room: '404' },
    { id: 'cr10', day: 'Wednesday', start_time: '10:05:00', end_time: '11:50:00', course_code: 'CSE 467', course_name: 'Advanced Database Management System', teacherName: 'Md Mahmudur Rahman', teacherId: '4', room: '1405' },
    { id: 'cr11', day: 'Wednesday', start_time: '11:55:00', end_time: '12:45:00', course_code: 'CSE 417', course_name: 'Computer Graphics and Image Processing', teacherName: 'Mohammad Zainal Abedin', teacherId: '3', room: '1405' },
];

// --- STATE ---
// Exporting 'let' variables allows other modules to read the live value.
// We provide setter functions to allow modification.
export let MOCK_USERS: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || JSON.stringify(DEFAULT_USERS));
export let CLASS_ROUTINE: ClassRoutine[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROUTINE) || JSON.stringify(DEFAULT_ROUTINE));
export let ADHOC_SESSIONS: ClassSession[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADHOC_SESSIONS) || '[]');
export let MOCK_SESSIONS: ClassSession[] = []; 
export let PERSISTED_SESSION_STATES: Partial<ClassSession>[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]'); 
export let AUDIT_LOGS: AuditLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');

// --- STATE SETTERS ---
export const setMockUsers = (users: User[]) => { MOCK_USERS = users; };
export const setClassRoutine = (routine: ClassRoutine[]) => { CLASS_ROUTINE = routine; };
export const setAdhocSessions = (sessions: ClassSession[]) => { ADHOC_SESSIONS = sessions; };
export const setMockSessions = (sessions: ClassSession[]) => { MOCK_SESSIONS = sessions; };
export const setAuditLogs = (logs: AuditLog[]) => { AUDIT_LOGS = logs; };

// --- PERSISTENCE ---
export const saveData = () => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
    localStorage.setItem(STORAGE_KEYS.ROUTINE, JSON.stringify(CLASS_ROUTINE));
    localStorage.setItem(STORAGE_KEYS.ADHOC_SESSIONS, JSON.stringify(ADHOC_SESSIONS));
    
    const routineStates = MOCK_SESSIONS
        .filter(s => !ADHOC_SESSIONS.find(adhoc => adhoc.id === s.id)) 
        .map(s => ({
            id: s.id,
            status: s.status,
            liveAttendance: s.liveAttendance,
            activePasscode: s.activePasscode,
            passcodeExpiry: s.passcodeExpiry
        }));

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(routineStates));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(AUDIT_LOGS));
};

// --- LOGIC ---
const dayNameToNumber: { [key: string]: 0 | 1 | 2 | 3 | 4 | 5 | 6 } = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

export function generateSessionsFromRoutine() {
    const today = new Date();
    const startOfThisWeek = startOfWeek(today);
    
    const routineSessions: ClassSession[] = [];
    
    CLASS_ROUTINE.forEach((routineItem) => {
        const dayIndex = dayNameToNumber[routineItem.day];
        const classDay = nextDay(startOfThisWeek, dayIndex);
        
        const [startHour, startMinute] = routineItem.start_time.split(':').map(Number);
        const [endHour, endMinute] = routineItem.end_time.split(':').map(Number);

        const startTime = set(classDay, { hours: startHour, minutes: startMinute, seconds: 0, milliseconds: 0 });
        const endTime = set(classDay, { hours: endHour, minutes: endMinute, seconds: 0, milliseconds: 0 });

        const now = new Date();
        let defaultStatus = SessionStatus.SCHEDULED;
        if (endTime < now) {
            defaultStatus = SessionStatus.COMPLETED;
        }

        const sessionId = `s-${routineItem.id}-${format(startTime, 'yyyyMMdd')}`;
        const persistedState = PERSISTED_SESSION_STATES.find(s => s.id === sessionId);

        routineSessions.push({
            id: sessionId,
            course: { 
                id: `c-${routineItem.course_code}`, 
                code: routineItem.course_code, 
                name: routineItem.course_name, 
                teacherName: routineItem.teacherName || 'Staff',
                teacherId: routineItem.teacherId || '0'
            },
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: persistedState && persistedState.status ? persistedState.status : defaultStatus,
            room: routineItem.room,
            totalStudents: MOCK_USERS.filter(u => u.role === 'student').length,
            liveAttendance: persistedState ? persistedState.liveAttendance || [] : [],
            activePasscode: persistedState ? persistedState.activePasscode : undefined,
            passcodeExpiry: persistedState ? persistedState.passcodeExpiry : undefined
        });
    });

    // Merge Routine + Ad-hoc
    MOCK_SESSIONS = [...routineSessions, ...ADHOC_SESSIONS];
    MOCK_SESSIONS.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

// Initialize on module load
generateSessionsFromRoutine();
