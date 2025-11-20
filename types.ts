
export type Role = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  auth_uid: string;
  email: string;
  full_name: string;
  role: Role;
  student_id?: string;
  nameChangeHistory?: string[]; // ISO date strings
  password?: string;
  last_login?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  teacherName: string;
  teacherId: string;
}

export enum SessionStatus {
    SCHEDULED = 'scheduled',
    ONGOING = 'ongoing',
    PAUSED = 'paused',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface ClassSession {
  id: string;
  course: Course;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  room: string;
  totalStudents: number;
  liveAttendance: AttendanceRecord[];
  userHasAttended?: boolean;
  activePasscode?: string; // For manual entry
  passcodeExpiry?: string; // ISO string
}

export interface AttendanceRecord {
  id: string;
  student: User;
  checked_at: string;
}

export interface HistorySession extends ClassSession {
  attended: boolean;
}

export interface AuditLog {
    id: string;
    actorName: string;
    actorRole: string;
    action: string;
    target: string;
    timestamp: string;
}

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface ClassRoutine {
    id: string;
    day: DayOfWeek;
    start_time: string; // "HH:mm:ss"
    end_time: string; // "HH:mm:ss"
    course_code: string;
    course_name: string; 
    room: string;
    teacherId?: string; 
    teacherName?: string;
}
