
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserIcon, CheckSquareIcon, XCircleIcon, ClockIcon, EditIcon, XIcon, CheckCircleIcon } from '../components/shared/icons';
import toast from 'react-hot-toast';
import { getStudentHistorySessions, getStudentSessions, updateProfileName } from '../services/mockApi';
import type { HistorySession, ClassSession } from '../types';
import { isFuture, parseISO, format } from 'date-fns';
import { Link } from 'react-router-dom';

const StudentProfileDashboard: React.FC = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistorySession[]>([]);
    const [upcomingSessions, setUpcomingSessions] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'student') {
            Promise.all([
                getStudentHistorySessions(user.id),
                getStudentSessions(user.id)
            ]).then(([historyData, allSessions]) => {
                setHistory(historyData);
                const futureSessions = allSessions
                    .filter(s => isFuture(parseISO(s.start_time)))
                    .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
                    .slice(0, 3); // Get the next 3 upcoming sessions
                setUpcomingSessions(futureSessions);
                setLoading(false);
            });
        }
    }, [user]);
    
    const totalAttended = history.filter(s => s.attended).length;
    const totalMissed = history.length - totalAttended;
    const attendancePercentage = history.length > 0 ? Math.round((totalAttended / history.length) * 100) : 100;
    const recentHistory = history.slice(0, 4);

    const StatCard: React.FC<{label: string, value: string | number, className?: string}> = ({label, value, className}) => (
        <div className={`bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center animate-fade-in ${className}`}>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    );
    
    if (loading) {
        return <div className="text-center text-slate-500">Loading student data...</div>;
    }

    return (
        <div className="space-y-8">
             <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Attendance Summary</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard label="Attendance Rate" value={`${attendancePercentage}%`} />
                    <StatCard label="Classes Attended" value={totalAttended} className="[animation-delay:100ms]"/>
                    <StatCard label="Classes Missed" value={totalMissed} className="[animation-delay:200ms]"/>
                </div>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Upcoming Classes</h3>
                    {upcomingSessions.length > 0 ? (
                         <ul className="space-y-4">
                            {upcomingSessions.map(session => (
                                <li key={session.id} className="flex items-center gap-4">
                                     <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex flex-col items-center justify-center font-bold text-primary-600 dark:text-primary-300">
                                        <span className="text-xs uppercase">{format(parseISO(session.start_time), 'MMM')}</span>
                                        <span className="text-xl">{format(parseISO(session.start_time), 'dd')}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{session.course.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            <ClockIcon className="w-4 h-4" />
                                            {format(parseISO(session.start_time), 'p')}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-6">No upcoming classes on the schedule.</p>
                    )}
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border dark:border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Recent History</h3>
                         <Link to="/history" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">View All</Link>
                    </div>
                     {recentHistory.length > 0 ? (
                         <ul className="space-y-3">
                            {recentHistory.map(session => (
                                <li key={session.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{session.course.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{format(parseISO(session.start_time), 'MMM dd, yyyy')}</p>
                                    </div>
                                    {session.attended ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                                            <CheckSquareIcon className="w-3.5 h-3.5" /> Present
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
                                            <XCircleIcon className="w-3.5 h-3.5" /> Absent
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-center text-slate-500 dark:text-slate-400 py-6">No attendance history found.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

const GenericProfileEditor: React.FC = () => {
    const { user } = useAuth();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = await updateProfileName(user.id, fullName);
        if (result.success) {
            toast.success(result.message);
            // Trigger reload to reflect changes in context
            setTimeout(() => window.location.reload(), 500);
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Password changed successfully! (Demo)");
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Personal Information</h3>
                <form className="space-y-4" onSubmit={handleUpdate}>
                     <div>
                        <label htmlFor="full-name" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                        <input type="text" id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2.5 bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
                        <input type="email" id="email" defaultValue={user.email} disabled className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="bg-primary-500 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>

             <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Change Password</h3>
                <form className="space-y-4" onSubmit={handleChangePassword}>
                     <div>
                        <label htmlFor="current-password"  className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
                        <input type="password" id="current-password" placeholder="••••••••" required className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2.5 bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent" />
                    </div>
                    <div>
                        <label htmlFor="new-password"  className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">New Password</label>
                        <input type="password" id="new-password" placeholder="••••••••" required className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2.5 bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent" />
                    </div>
                     <div className="pt-2">
                        <button type="submit" className="bg-primary-500 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">Change Password</button>
                    </div>
                </form>
            </div>
        </div>
    )
}


const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [savingName, setSavingName] = useState(false);

    useEffect(() => {
        if (user) setNewName(user.full_name);
    }, [user]);

    const handleNameSave = async () => {
        if (!user) return;
        setSavingName(true);
        const result = await updateProfileName(user.id, newName);
        
        if (result.success) {
            toast.success(result.message);
            setIsEditingName(false);
            // Ideally refresh user context here, but mockApi + generic reload works for demo
             setTimeout(() => window.location.reload(), 500); 
        } else {
            toast.error(result.message);
        }
        setSavingName(false);
    };
   
    if (!user) {
        return <div className="text-center">Loading profile...</div>;
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Profile</h2>
                <p className="text-slate-500 dark:text-slate-400">View and update your account details.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 flex flex-col items-center bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border dark:border-slate-800">
                    <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
                        <UserIcon className="w-16 h-16 text-slate-500 dark:text-slate-400" />
                    </div>
                    
                    {isEditingName ? (
                        <div className="w-full flex flex-col gap-2 mb-2">
                            <input 
                                type="text" 
                                value={newName} 
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full p-2 rounded-lg border border-primary-500 bg-white dark:bg-slate-900 text-center text-sm font-semibold"
                            />
                            <div className="flex gap-2 justify-center">
                                <button 
                                    onClick={handleNameSave}
                                    disabled={savingName}
                                    className="p-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                                >
                                    <CheckCircleIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setIsEditingName(false)}
                                    disabled={savingName}
                                    className="p-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                                >
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center">{user.full_name}</h3>
                            {['student', 'teacher'].includes(user.role) && (
                                <button onClick={() => setIsEditingName(true)} className="text-slate-400 hover:text-primary-500 transition-colors">
                                    <EditIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    <p className="text-slate-500 dark:text-slate-400 capitalize text-center">{user.role}</p>
                    {user.role === 'student' && user.student_id && (
                        <p className="text-sm mt-1 text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">ID: {user.student_id}</p>
                    )}
                     {['student', 'teacher'].includes(user.role) && (
                        <p className="text-xs text-slate-400 mt-4 text-center max-w-[200px]">Name changes are limited to 2 per 6 months.</p>
                    )}
                </div>

                <div className="lg:col-span-2">
                    {user.role === 'student' ? <StudentProfileDashboard /> : <GenericProfileEditor />}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
