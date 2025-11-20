
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getStudentHistorySessions } from '../../services/mockApi';
import type { HistorySession } from '../../types';
import { CheckSquareIcon, XCircleIcon, RefreshCwIcon, SearchIcon, ClockIcon } from '../../components/shared/icons';
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const HistorySkeleton: React.FC = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
             <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-xl animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="space-y-2">
                        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                </div>
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
        ))}
    </div>
);


const HistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistorySession[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters & Sort
    const [filterCourse, setFilterCourse] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    useEffect(() => {
        if (user) {
            getStudentHistorySessions(user.id).then(data => {
                setHistory(data);
                setLoading(false);
            });
        }
    }, [user]);

    const uniqueCourses = useMemo(() => {
        const courses = Array.from(new Set(history.map(s => s.course.name)));
        return courses.sort();
    }, [history]);

    const filteredHistory = useMemo(() => {
        let result = history.filter(session => {
            const matchesCourse = filterCourse === 'all' || session.course.name === filterCourse;
            let matchesDate = true;
            
            if (startDate && endDate) {
                matchesDate = isWithinInterval(parseISO(session.start_time), {
                    start: startOfDay(parseISO(startDate)),
                    end: endOfDay(parseISO(endDate))
                });
            } else if (startDate) {
                matchesDate = parseISO(session.start_time) >= startOfDay(parseISO(startDate));
            } else if (endDate) {
                 matchesDate = parseISO(session.start_time) <= endOfDay(parseISO(endDate));
            }

            return matchesCourse && matchesDate;
        });

        return result.sort((a, b) => {
            const timeA = new Date(a.start_time).getTime();
            const timeB = new Date(b.start_time).getTime();
            return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
        });
    }, [history, filterCourse, startDate, endDate, sortOrder]);

    const clearFilters = () => {
        setFilterCourse('all');
        setStartDate('');
        setEndDate('');
        setSortOrder('newest');
    }

    const hasActiveFilters = filterCourse !== 'all' || startDate !== '' || endDate !== '' || sortOrder !== 'newest';

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Attendance History</h2>
                    <p className="text-slate-500 dark:text-slate-400">Review your attendance record for past classes.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
                {/* Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pb-6 border-b dark:border-slate-700">
                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Filter by Course</label>
                        <div className="relative">
                            <select 
                                value={filterCourse} 
                                onChange={(e) => setFilterCourse(e.target.value)}
                                className="w-full h-[42px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none dark:text-slate-200 appearance-none transition-shadow"
                            >
                                <option value="all">All Courses</option>
                                {uniqueCourses.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Start Date</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full h-[42px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none dark:text-slate-200 transition-shadow text-slate-500"
                        />
                    </div>
                     <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">End Date</label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full h-[42px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none dark:text-slate-200 transition-shadow text-slate-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Sort By</label>
                        <div className="relative">
                            <select 
                                value={sortOrder} 
                                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                                className="w-full h-[42px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none dark:text-slate-200 appearance-none transition-shadow"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                        <button 
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                            className={`w-full h-[42px] flex items-center justify-center gap-1.5 border font-semibold rounded-lg transition-all duration-200 shadow-sm text-sm ${hasActiveFilters 
                                ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400' 
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                            }`}
                        >
                            <RefreshCwIcon className={`w-3.5 h-3.5 ${hasActiveFilters ? 'group-hover:rotate-180 transition-transform' : ''}`} />
                            Reset
                        </button>
                    </div>
                </div>

                {loading ? <HistorySkeleton /> : (
                    filteredHistory.length > 0 ? (
                        <ul className="space-y-4">
                            {filteredHistory.map(session => (
                                <li key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all duration-200 animate-fade-in group">
                                    <div className="flex items-start gap-5">
                                        {/* Date Block */}
                                        <div className="flex-shrink-0 w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex flex-col items-center justify-center border border-purple-100 dark:border-purple-800/30 text-purple-700 dark:text-purple-300">
                                            <span className="text-xs font-bold uppercase tracking-widest">{format(parseISO(session.start_time), 'MMM')}</span>
                                            <span className="text-2xl font-bold leading-none mt-0.5">{format(parseISO(session.start_time), 'dd')}</span>
                                        </div>
                                        
                                        {/* Course Info */}
                                        <div className="pt-1">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{session.course.name}</h3>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 flex flex-wrap items-center gap-x-2">
                                                <span className="font-medium text-slate-600 dark:text-slate-300">{session.course.code}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                <span>by {session.course.teacherName}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Right Side: Time & Status */}
                                    <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-8 pl-[84px] sm:pl-0">
                                         <div className="text-right hidden sm:block">
                                             <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Time</span>
                                             <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 justify-end">
                                                 {format(parseISO(session.start_time), 'h:mm a')} - {format(parseISO(session.end_time), 'h:mm a')}
                                             </span>
                                         </div>
                                         
                                         {/* Mobile Time (visible only on small screens) */}
                                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 sm:hidden">
                                              {format(parseISO(session.start_time), 'h:mm a')}
                                          </span>

                                        {session.attended ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50 min-w-[100px] justify-center">
                                                <CheckSquareIcon className="w-4 h-4" />
                                                Present
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 min-w-[100px] justify-center">
                                                <XCircleIcon className="w-4 h-4" />
                                                Absent
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 text-slate-400">
                                <SearchIcon className="w-8 h-8" />
                            </div>
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No records found</p>
                            <p className="mt-1 text-slate-500 dark:text-slate-400 max-w-xs mx-auto">No attendance records match your current filters.</p>
                            <button onClick={clearFilters} className="mt-4 text-sm font-bold text-primary-600 hover:underline">Clear Filters</button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};


export default HistoryPage;
