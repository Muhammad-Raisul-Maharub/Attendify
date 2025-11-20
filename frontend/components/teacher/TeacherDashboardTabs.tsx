import React from 'react';

type View = 'today' | 'upcoming' | 'completed';

interface TeacherDashboardTabsProps {
  view: View;
  setView: (view: View) => void;
}

const tabs: { id: View; label: string }[] = [
  { id: 'today', label: "Today's Sessions" },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

const TeacherDashboardTabs: React.FC<TeacherDashboardTabsProps> = ({ view, setView }) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`${
              view === tab.id
                ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TeacherDashboardTabs;