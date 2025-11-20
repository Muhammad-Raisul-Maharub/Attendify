
import { AuditLog } from '../types';
import { AUDIT_LOGS, saveData } from './mockDb';

export const addAuditLog = (actorName: string, action: string, target: string, actorRole: string = 'system') => {
    AUDIT_LOGS.unshift({
        id: `log-${Date.now()}-${Math.random()}`,
        actorName,
        actorRole,
        action,
        target,
        timestamp: new Date().toISOString()
    });
    if (AUDIT_LOGS.length > 200) AUDIT_LOGS.pop();
    saveData();
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    return new Promise(res => setTimeout(() => res([...AUDIT_LOGS]), 300));
};
