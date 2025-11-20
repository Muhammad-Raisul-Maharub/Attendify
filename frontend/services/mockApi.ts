
/**
 * @file mockApi.ts
 * @deprecated This file is now a facade for modular services. 
 * Please import from specific services in 'services/' directory for better maintainability.
 */

export * from './mockDb';
export * from './authService';
export * from './sessionService';
export * from './userService';
export * from './courseService';
export * from './auditService';

// Explicit exports for commonly used items to ensure IDE auto-import resolution
export { loginUser } from './authService';
export { createAdHocSession, getStudentSessions, getTeacherSessions, markAttendance } from './sessionService';
export { getAllUsers, addUser, updateUser, deleteUser } from './userService';
