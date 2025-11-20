
import { User } from '../types';
import { MOCK_USERS, setMockUsers, saveData, notify } from './mockDb';
import { addAuditLog } from './auditService';
import { subMonths, isAfter, parseISO } from 'date-fns';

export const getAllUsers = async (): Promise<User[]> => {
    return new Promise(res => setTimeout(() => res([...MOCK_USERS]), 200));
};

export const updateUser = async(user: User, actor?: { name: string, role: string }): Promise<User> => {
    setMockUsers(MOCK_USERS.map(u => u.id === user.id ? user : u));
    addAuditLog(actor?.name || 'System', 'Updated User', `${user.full_name} (${user.role})`, actor?.role);
    saveData();
    notify();
    return new Promise(res => setTimeout(() => res(user), 200));
};

export const updateProfileName = async (userId: string, newName: string): Promise<{success: boolean, message: string}> => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found' };
    
    if (!['student', 'teacher'].includes(user.role)) {
        return { success: false, message: 'Only students and teachers can edit their name this way' };
    }

    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    
    const recentChanges = (user.nameChangeHistory || []).filter(dateStr => 
        isAfter(parseISO(dateStr), sixMonthsAgo)
    );

    if (recentChanges.length >= 2) {
        return { success: false, message: 'You can only change your name twice every 6 months.' };
    }

    const oldName = user.full_name;
    user.full_name = newName;
    user.nameChangeHistory = [...(user.nameChangeHistory || []), now.toISOString()];
    
    addAuditLog(user.full_name, 'Updated Own Profile Name', `${oldName} -> ${newName}`, user.role);
    saveData();
    notify();
    return { success: true, message: 'Name updated successfully' };
};

export const addUser = async(user: Omit<User, 'id' | 'auth_uid'>, actor?: { name: string, role: string }): Promise<{success: boolean, message?: string, user?: User}> => {
    // Check for duplicate email
    const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingUser) {
        return new Promise(res => setTimeout(() => res({ success: false, message: 'Email already exists.' }), 200));
    }

    const newUser: User = {
        id: `u${Date.now()}`,
        auth_uid: `auth${Date.now()}`,
        ...user,
        nameChangeHistory: [],
        password: user.password || 'password123' 
    };
    MOCK_USERS.push(newUser);
    addAuditLog(actor?.name || 'System', 'Created User', newUser.full_name, actor?.role);
    saveData();
    notify();
    return new Promise(res => setTimeout(() => res({ success: true, user: newUser }), 200));
};

export const deleteUser = async(userId: string, actor?: { name: string, role: string }): Promise<{success: boolean}> => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if(user) {
        addAuditLog(actor?.name || 'System', 'Deleted User', user.full_name, actor?.role);
    }
    setMockUsers(MOCK_USERS.filter(u => u.id !== userId));
    saveData();
    notify();
    return new Promise(res => setTimeout(() => res({success: true}), 200));
};
