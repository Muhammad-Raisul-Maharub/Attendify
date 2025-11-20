import React from 'react';
import type { ClassSession } from '../../types';
import { XIcon, UsersIcon, UserIcon } from '../shared/icons';

interface LiveRosterProps {
  session: ClassSession;
  onClose: () => void;
}

const LiveRoster: React.FC<LiveRosterProps> = ({ session, onClose }) => {
    const attendanceCount = session.liveAttendance.length;
    const totalStudents = session.totalStudents;
    const attendancePercentage = totalStudents > 0 ? (attendanceCount / totalStudents) * 100 : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg flex flex-col transform transition-all animate-scale-in" style={{height: '90vh'}}>
                <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Live Roster</h2>
                        <p className="text-slate-500 dark:text-slate-400">{session.course.name}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto">
                    {session.liveAttendance.length > 0 ? (
                    <ul className="space-y-3">
                        {session.liveAttendance
                            .sort((a,b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())
                            .map((record, index) => (
                            <li key={record.student.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg animate-fade-in" style={{animationDelay: `${index * 50}ms`}}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{record.student.full_name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{record.student.student_id || ''}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Checked in at {new Date(record.checked_at).toLocaleTimeString()}</p>
                            </li>
                        ))}
                    </ul>
                    ) : (
                        <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                            <UsersIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600"/>
                            <p className="mt-4 text-slate-500 dark:text-slate-400">Waiting for students to check in...</p>
                        </div>
                    )}
                </div>
                
                <div className="p-6 border-t dark:border-slate-800">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-accent-500 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${attendancePercentage}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="w-4 h-4"/>
                            <span>{attendanceCount} / {totalStudents} Present</span>
                        </div>
                        <span>{Math.round(attendancePercentage)}%</span>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default LiveRoster;