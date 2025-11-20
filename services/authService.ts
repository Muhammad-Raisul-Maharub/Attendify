
import { User, Role } from '../types';
import { MOCK_USERS, saveData, notify } from './mockDb';

export const loginUser = async (email: string, password: string, role: Role): Promise<{ success: boolean, user?: User, message?: string }> => {
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500));
    
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    
    if (!user) {
        return { success: false, message: 'User not found with this role.' };
    }
    
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password.' };
    }
    
    // Update last login and persist
    user.last_login = new Date().toISOString();
    saveData();
    notify();

    return { success: true, user };
};
