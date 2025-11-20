import React from 'react';
import { useLocation } from 'react-router-dom';
import { BarChartIcon, BookOpenIcon, CheckSquareIcon } from '../components/shared/icons';

const pageConfig: { [key: string]: { icon: React.ElementType; title: string; } } = {
  '/courses': { icon: BookOpenIcon, title: 'Courses' },
  '/history': { icon: CheckSquareIcon, title: 'Attendance History' },
  '/analytics': { icon: BarChartIcon, title: 'Analytics' },
};

const PlaceholderPage: React.FC = () => {
    const location = useLocation();
    const config = pageConfig[location.pathname] || { icon: BookOpenIcon, title: 'Page' };
    const { icon: Icon, title } = config;

    return (
        <div className="flex flex-col items-center justify-center text-center h-[70vh] bg-white dark:bg-slate-800/50 rounded-2xl p-6 border dark:border-slate-800">
            <Icon className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 capitalize">{title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">This feature is currently under construction and will be available in a future update. We appreciate your patience!</p>
        </div>
    );
};

export default PlaceholderPage;
