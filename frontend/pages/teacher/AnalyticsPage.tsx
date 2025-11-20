
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getTeacherSessions } from '../../services/mockApi';
import type { ClassSession } from '../../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { BarChartIcon, UsersIcon, CheckCircleIcon } from '../../components/shared/icons';

const TeacherAnalyticsPage: React.FC = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<string>('all');

    useEffect(() => {
        if (user) {
            getTeacherSessions(user.id).then(data => {
                setSessions(data.filter(s => s.status === 'completed' || s.status === 'ongoing'));
                setLoading(false);
            });
        }
    }, [user]);

    const uniqueCourses = useMemo(() => {
        const map = new Map();
        sessions.forEach(s => {
            if (!map.has(s.course.code)) {
                map.set(s.course.code, s.course.name);
            }
        });
        return Array.from(map.entries()).map(([code, name]) => ({ code, name })).sort((a, b) => a.code.localeCompare(b.code));
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        if (selectedCourse === 'all') return sessions;
        return sessions.filter(s => s.course.code === selectedCourse);
    }, [sessions, selectedCourse]);

    const stats = useMemo(() => {
        if (filteredSessions.length === 0) return { totalSessions: 0, avgAttendance: 0, totalStudents: 0 };
        
        const totalSessions = filteredSessions.length;
        let totalAttendancePct = 0;
        const uniqueStudents = new Set<string>();

        filteredSessions.forEach(s => {
            const pct = s.totalStudents > 0 ? (s.liveAttendance.length / s.totalStudents) * 100 : 0;
            totalAttendancePct += pct;
            s.liveAttendance.forEach(a => uniqueStudents.add(a.student.id));
        });

        return {
            totalSessions,
            avgAttendance: Math.round(totalAttendancePct / totalSessions),
            totalStudents: uniqueStudents.size
        };
    }, [filteredSessions]);

    const chartData = useMemo(() => {
        // Attendance by Course
        const courseMap = new Map<string, { total: number, count: number }>();
        filteredSessions.forEach(s => {
            const current = courseMap.get(s.course.code) || { total: 0, count: 0 };
            const pct = s.totalStudents > 0 ? (s.liveAttendance.length / s.totalStudents) * 100 : 0;
            courseMap.set(s.course.code, { total: current.total + pct, count: current.count + 1 });
        });

        const barData = Array.from(courseMap.entries()).map(([name, val]) => ({
            name,
            attendance: Math.round(val.total / val.count)
        }));

        // Attendance Trend (Last 5 sessions)
        const sortedSessions = [...filteredSessions].sort((a,b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()).slice(-5);
        const lineData = sortedSessions.map(s => ({
            date: format(parseISO(s.start_time), 'MMM dd'),
            course: s.course.code,
            attendance: s.totalStudents > 0 ? Math.round((s.liveAttendance.length / s.totalStudents) * 100) : 0
        }));

        return { barData, lineData };
    }, [filteredSessions]);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div></div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Analytics Dashboard</h2>
                    <p className="text-slate-500 dark:text-slate-400">Overview of your class performance and student engagement.</p>
                </div>
                <div className="w-full md:w-64">
                    <select 
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Courses</option>
                        {uniqueCourses.map(course => (
                            <option key={course.code} value={course.code}>
                                {course.code} - {course.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-xl">
                        <CheckCircleIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Sessions</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalSessions}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 rounded-xl">
                         <BarChartIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Avg. Attendance</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.avgAttendance}%</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                     <div className="p-3 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-xl">
                        <UsersIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Active Students</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalStudents}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Attendance by Course</h3>
                    <div className="h-72 w-full">
                        {chartData.barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.barData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} interval={0} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}} 
                                    contentStyle={{
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
                                        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
                                    }} 
                                />
                                <Bar dataKey="attendance" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-slate-400">No data available</div>}
                    </div>
                </div>

                 <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Recent Trend (Last 5 Sessions)</h3>
                     <div className="h-72 w-full">
                        {chartData.lineData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData.lineData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
                                        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
                                    }} 
                                />
                                <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-slate-400">No data available</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherAnalyticsPage;
