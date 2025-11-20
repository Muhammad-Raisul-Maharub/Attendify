import React from 'react';
import type { ClassSession } from '../../types';
import { ClockIcon, MapPinIcon, CheckCircleIcon, UserIcon } from './icons';
import { format } from 'date-fns';

interface CourseCardProps {
  session: ClassSession;
  children?: React.ReactNode;
}

const getStatusPill = (status: string) => {
    switch(status) {
        case 'ongoing': return <span className="absolute top-4 right-4 text-xs font-semibold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-full flex items-center gap-1.5"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>LIVE</span>;
        case 'completed': return <span className="absolute top-4 right-4 text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-full flex items-center gap-1.5"><CheckCircleIcon className="w-3 h-3" />Completed</span>;
        case 'scheduled': return <span className="absolute top-4 right-4 text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full flex items-center gap-1.5"><ClockIcon className="w-3 h-3" />Scheduled</span>;
        default: return null;
    }
}

const CourseCard: React.FC<CourseCardProps> = ({ session, children }) => {
    const { course, start_time, end_time, room, status } = session;
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    // Determine border color based on status for better visual distinction
    let borderClass = "border-transparent dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800";
    
    if (status === 'ongoing') {
        borderClass = "border-red-200 dark:border-red-900 shadow-md shadow-red-100 dark:shadow-none";
    } else if (status === 'completed') {
        borderClass = "border-green-200 dark:border-green-900";
    } else if (status === 'scheduled') {
        borderClass = "border-blue-200 dark:border-blue-900";
    }

    return (
        <div className={`bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 relative border ${borderClass} group hover:-translate-y-1`}>
            {getStatusPill(status)}
            <div className="flex flex-col h-full">
                <div className="mb-4 flex-grow">
                    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">{course.code}</p>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{course.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <UserIcon className="w-4 h-4" />
                        <span>{course.teacherName}</span>
                    </div>
                </div>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 border-t dark:border-slate-700 pt-4">
                    <div className="flex items-center gap-3">
                        <ClockIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <span>{format(startTime, 'p')} - {format(endTime, 'p')}</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <MapPinIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <span>Room {room}</span>
                    </div>
                </div>
                {children && <div className="mt-6">{children}</div>}
            </div>
        </div>
    );
};

export default CourseCard;