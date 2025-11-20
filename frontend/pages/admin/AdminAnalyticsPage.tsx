
import React, { useState, useEffect, useMemo } from 'react';
import { getAllUsers, getAllCourses } from '../../services/mockApi';
import type { User } from '../../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { UsersIcon, BookOpenIcon, CheckCircleIcon, BarChartIcon } from '../../components/shared/icons';

const AdminAnalyticsPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [courseCount, setCourseCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getAllUsers(), getAllCourses()]).then(([u, c]) => {
            setUsers(u);
            setCourseCount(c.length);
            setLoading(false);
        });
    }, []);

    const roleDistribution = useMemo(() => {
        const counts = { student: 0, teacher: 0, admin: 0 };
        users.forEach(u => { if (counts[u.role] !== undefined) counts[u.role]++ });
        return [
            { name: 'Student', value: counts.student, color: '#10B981' },
            { name: 'Teacher', value: counts.teacher, color: '#A855F7' },
            { name: 'Admin', value: counts.admin, color: '#F43F5E' },
        ];
    }, [users]);

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-2 border-primary-600 rounded-full border-t-transparent"></div></div>;

    const StatCard: React.FC<{ title: string, value: string | number, icon: any, bgClass: string, iconColor: string }> = ({ title, value, icon: Icon, bgClass, iconColor }) => (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-transparent dark:border-slate-800 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${bgClass}`}>
                <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
                <p className="text-4xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">System Analytics</h2>
                <p className="text-slate-500 dark:text-slate-400">Overview of platform usage and statistics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Users" 
                    value={users.length} 
                    icon={UsersIcon} 
                    bgClass="bg-blue-50 dark:bg-blue-900/20" 
                    iconColor="text-blue-500 dark:text-blue-400"
                />
                <StatCard 
                    title="Active Classes" 
                    value={courseCount} 
                    icon={BookOpenIcon} 
                    bgClass="bg-purple-50 dark:bg-purple-900/20" 
                    iconColor="text-purple-500 dark:text-purple-400"
                />
                <StatCard 
                    title="System Status" 
                    value="Healthy" 
                    icon={CheckCircleIcon} 
                    bgClass="bg-green-50 dark:bg-green-900/20" 
                    iconColor="text-green-500 dark:text-green-400"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-transparent dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-6">User Distribution</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie 
                                    data={roleDistribution} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={85} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {roleDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{
                                        borderRadius: '8px', 
                                        border: '1px solid #e2e8f0', 
                                        backgroundColor: '#ffffff', 
                                        color: '#1e293b',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }} 
                                    itemStyle={{ color: '#1e293b' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-transparent dark:border-slate-800 flex flex-col items-center justify-center text-center min-h-[300px]">
                     <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                        <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
                            <BarChartIcon className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                        </div>
                        <p className="text-lg font-medium text-slate-400 dark:text-slate-500">Attendance Trends (System Wide)</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Requires more data accumulation.</p>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;
