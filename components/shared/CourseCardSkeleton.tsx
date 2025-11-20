import React from 'react';

const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-transparent dark:border-slate-800">
      <div className="animate-pulse">
        <div className="mb-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="space-y-3 border-t dark:border-slate-700 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          </div>
        </div>
        <div className="mt-6">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton;