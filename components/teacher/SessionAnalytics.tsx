import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ClassSession } from '../../types';
import { XIcon, BotIcon } from '../shared/icons';

interface SessionAnalyticsProps {
  session: ClassSession;
  onClose: () => void;
}

const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({ session, onClose }) => {
    const attendanceCount = session.liveAttendance.length;
    const absentCount = session.totalStudents - attendanceCount;
    const attendancePercentage = session.totalStudents > 0 ? (attendanceCount / session.totalStudents) * 100 : 0;
    
    const chartData = [
        { name: 'Present', value: attendanceCount, color: '#10B981' },
        { name: 'Absent', value: absentCount, color: '#EF4444' },
    ];
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col transform transition-all animate-scale-in" style={{height: '90vh'}}>
                 <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Session Analytics</h2>
                        <p className="text-slate-500 dark:text-slate-400">{session.course.name}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl animate-fade-in" style={{animationDelay: '100ms'}}>
                            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{Math.round(attendancePercentage)}%</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Attendance Rate</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl animate-fade-in" style={{animationDelay: '200ms'}}>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{attendanceCount}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Present</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl animate-fade-in" style={{animationDelay: '300ms'}}>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-500">{absentCount}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Absent</p>
                        </div>
                   </div>

                   <div style={{width: '100%', height: 200}}>
                     <ResponsiveContainer>
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 14}} className="text-slate-600 dark:text-slate-400" />
                            <Tooltip cursor={{fill: 'rgba(241, 245, 249, 0.5)'}} contentStyle={{borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#ffffff'}}/>
                            <Bar dataKey="value" barSize={30} radius={[0, 8, 8, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                   </div>
                   
                   <div>
                       <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2"><BotIcon className="w-5 h-5 text-primary-500"/> Session Summary</h3>
                        <div className="p-4 bg-primary-50 dark:bg-primary-900/40 rounded-lg text-slate-700 dark:text-slate-300 text-sm leading-relaxed border-l-4 border-primary-500">
                           <p>
                               The session for <strong>{session.course.name}</strong> concluded with an attendance rate of <strong>{Math.round(attendancePercentage)}%</strong>.
                               A total of <strong>{attendanceCount}</strong> out of <strong>{session.totalStudents}</strong> enrolled students were present.
                           </p>
                       </div>
                   </div>
                </div>
            </div>
        </div>
    );
};

export default SessionAnalytics;