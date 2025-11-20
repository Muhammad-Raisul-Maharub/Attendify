
import { ClassRoutine } from '../types';
import { CLASS_ROUTINE, setClassRoutine, generateSessionsFromRoutine, saveData, notify } from './mockDb';
import { addAuditLog } from './auditService';

export const getAllCourses = async (): Promise<ClassRoutine[]> => {
    return new Promise(res => setTimeout(() => res([...CLASS_ROUTINE]), 200));
};

export const updateCourse = async (course: ClassRoutine, actor?: { name: string, role: string }): Promise<ClassRoutine> => {
    setClassRoutine(CLASS_ROUTINE.map(c => c.id === course.id ? course : c));
    generateSessionsFromRoutine();
    addAuditLog(actor?.name || 'System', 'Updated Class Schedule', `${course.course_code} - ${course.day}`, actor?.role);
    saveData();
    notify();
    return new Promise(res => setTimeout(() => res(course), 200));
};

export const addCourse = async (course: Omit<ClassRoutine, 'id'>, actor?: { name: string, role: string }): Promise<ClassRoutine> => {
    const newCourse: ClassRoutine = { id: `cr${Date.now()}`, ...course };
    CLASS_ROUTINE.push(newCourse);
    generateSessionsFromRoutine();
    addAuditLog(actor?.name || 'System', 'Added Class to Routine', `${course.course_code}`, actor?.role);
    saveData();
    notify();
    return new Promise(res => setTimeout(() => res(newCourse), 200));
};

export const deleteCourse = async (courseId: string, actor?: { name: string, role: string }): Promise<{success: boolean}> => {
    const course = CLASS_ROUTINE.find(c => c.id === courseId);
    setClassRoutine(CLASS_ROUTINE.filter(c => c.id !== courseId));
    generateSessionsFromRoutine();
    if (course) {
         addAuditLog(actor?.name || 'System', 'Deleted Class', course.course_code, actor?.role);
    }
    saveData();
    notify();
    return new Promise(res => setTimeout(() => res({success: true}), 200));
};
