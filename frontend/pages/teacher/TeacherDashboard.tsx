
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getTeacherSessions, updateSessionStatus, exportAttendanceData } from '../../services/mockApi';
import type { ClassSession } from '../../types';
import { SessionStatus } from '../../types';
import CourseCard from '../../components/shared/CourseCard';
import QRModal from '../../components/teacher/QRModal';
import LiveRoster from '../../components/teacher/LiveRoster';
import SessionAnalytics from '../../components/teacher/SessionAnalytics';
import { PlayIcon, BarChartIcon, SearchIcon, CheckSquareIcon, BookOpenIcon, PlusCircleIcon, RefreshCwIcon, ChevronRightIcon } from '../../components/shared/icons';
import { isToday, isFuture, parseISO, isPast } from 'date-fns';
import CourseCardSkeleton from '../../components/shared/CourseCardSkeleton';
import TeacherDashboardTabs from '../../components/teacher/TeacherDashboardTabs';
import toast from 'react-hot-toast';
import UnifiedCreateClassModal from '../../components/shared/UnifiedCreateClassModal';

type View = 'today' | 'upcoming' | 'completed';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'qr' | 'roster' | 'analytics' | null>(null);
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  const [view, setView] = useState<View>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  
  // Export State
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [exportCourse, setExportCourse] = useState('all');

  const fetchSessions = () => {
      if (!user) return;
      if (sessions.length === 0) setLoading(true);
      
      getTeacherSessions(user.id).then(teacherSessions => {
          setSessions(teacherSessions);
          
          if (selectedSession) {
              const updated = teacherSessions.find(s => s.id === selectedSession.id);
              if(updated) setSelectedSession(updated);
          }
          setLoading(false);
          if (sessions.length > 0) toast.success("Attendance data refreshed");
      });
  }

  useEffect(() => {
    if (!user) return;
    fetchSessions();
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

  const handleSessionAction = (session: ClassSession, action: SessionStatus) => {
    const updatedSession = updateSessionStatus(session.id, action);
    if(updatedSession) {
        setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
        
        if (action === SessionStatus.ONGOING) {
            setSelectedSession(updatedSession);
            setActiveModal('qr');
        } else if (action === SessionStatus.COMPLETED) {
             setSelectedSession(null);
             setActiveModal(null);
        }
    }
  };
  
  const openModal = (session: ClassSession, modal: 'qr' | 'roster' | 'analytics') => {
      setSelectedSession(session);
      setActiveModal(modal);
  }

  const closeModal = () => {
    if (activeModal !== 'qr' || selectedSession?.status !== SessionStatus.ONGOING) {
        setSelectedSession(null);
    }
    setActiveModal(null);
  }

  const handleExport = async (period: 'daily' | 'weekly' | 'monthly') => {
      if(!user) return;
      setShowExportModal(false);
      toast.promise(exportAttendanceData(user.id, period, exportCourse), {
          loading: 'Generating CSV...',
          success: (csv) => {
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `attendance_${exportCourse}_${period}_${new Date().toISOString().split('T')[0]}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              return 'Export downloaded!';
          },
          error: 'Failed to export data'
      });
  };

  const renderSessionCard = (session: ClassSession) => (
      <CourseCard key={session.id} session={session}>
        <div className="flex flex-col sm:flex-row gap-2">
        {session.status === SessionStatus.SCHEDULED && (
            <button onClick={() => handleSessionAction(session, SessionStatus.ONGOING)} className="flex-1 bg-primary-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-primary-700 transition-all transform hover:scale-105 active:scale-100 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                <PlayIcon className="w-5 h-5"/> Start Session
            </button>
        )}
        {session.status === SessionStatus.ONGOING && (
             <>
                <button onClick={() => openModal(session, 'qr')} className="flex-1 bg-accent-500 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-teal-600 transition-colors">Show QR</button>
                <button onClick={() => openModal(session, 'roster')} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Live Roster</button>
             </>
        )}
        {session.status === SessionStatus.COMPLETED && (
            <button onClick={() => openModal(session, 'analytics')} className="flex-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold py-2.5 px-4 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900 flex items-center justify-center gap-2 transition-colors">
                <BarChartIcon className="w-5 h-5" /> Analytics
            </button>
        )}
        </div>
      </CourseCard>
  );

  const getVisibleSessions = () => {
    let filtered = sessions;
    
    if (filterCourse !== 'all') {
        filtered = filtered.filter(s => s.course.code === filterCourse);
    }

    switch(view) {
        case 'today': filtered = filtered.filter(s => isToday(parseISO(s.start_time))); break;
        case 'upcoming': filtered = filtered.filter(s => isFuture(parseISO(s.start_time))); break;
        case 'completed': filtered = filtered.filter(s => s.status === SessionStatus.COMPLETED || (isPast(parseISO(s.end_time)) && s.status !== SessionStatus.ONGOING)); break;
    }

    if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        filtered = filtered.filter(s => 
            s.course.name.toLowerCase().includes(lowerQ) || 
            s.course.code.toLowerCase().includes(lowerQ)
        );
    }

    return filtered;
  }

  const renderContent = () => {
    if(loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CourseCardSkeleton /><CourseCardSkeleton /><CourseCardSkeleton />
            </div>
        );
    }
    
    const visibleSessions = getVisibleSessions();

    return visibleSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleSessions.map(renderSessionCard)}
        </div>
    ) : (
         <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 dark:text-slate-500 text-lg">
                No sessions found for this selection.
            </p>
             {view === 'today' && (
                 <button onClick={() => setShowCreateModal(true)} className="mt-4 text-primary-600 font-semibold hover:underline">Create one now?</button>
             )}
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Updated Centered Header Card matching Screenshot 2 */}
      <div className="max-w-md mx-auto w-full">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Welcome, {user?.full_name?.split(' ')[0]}!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Manage your class sessions here.</p>

            <div className="flex flex-col gap-3 mb-6">
                 <button onClick={fetchSessions} className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                    <RefreshCwIcon className="w-4 h-4 text-slate-500" />
                    Refresh
                </button>

                <button onClick={() => setShowCreateModal(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                    <PlusCircleIcon className="w-5 h-5" />
                    Create Session
                </button>

                 <button onClick={() => setShowExportModal(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                    <CheckSquareIcon className="w-4 h-4 text-slate-500" />
                    Export
                </button>
            </div>

            <div className="space-y-3">
                 <div className="relative">
                    <select
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                        className="w-full appearance-none bg-slate-100 dark:bg-slate-900 border-none text-slate-700 dark:text-slate-200 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm"
                    >
                        <option value="all">All Courses</option>
                        {uniqueCourses.map(c => (
                            <option key={c.code} value={c.code}>{c.code}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <ChevronRightIcon className="w-4 h-4 rotate-90" />
                    </div>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                    />
                    <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
            </div>
        </div>
      </div>

      <TeacherDashboardTabs view={view} setView={setView} />
      
      <div>{renderContent()}</div>

      {selectedSession && activeModal === 'qr' && <QRModal session={selectedSession} onClose={closeModal} onEndSession={() => handleSessionAction(selectedSession, SessionStatus.COMPLETED)} />}
      {selectedSession && activeModal === 'roster' && <LiveRoster session={selectedSession} onClose={closeModal} />}
      {selectedSession && activeModal === 'analytics' && <SessionAnalytics session={selectedSession} onClose={closeModal} />}
      
      {showCreateModal && user && (
          <UnifiedCreateClassModal 
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)} 
            onSuccess={() => { fetchSessions(); setView('today'); }} 
            currentUser={user}
        />
      )}

       {showExportModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-scale-in">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Export Attendance Data</h3>
                <p className="text-slate-500 mb-6 text-sm">Select the course and time range to download records.</p>
                
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Course</label>
                    <div className="relative">
                         <select 
                            value={exportCourse}
                            onChange={(e) => setExportCourse(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Courses</option>
                            {uniqueCourses.map(c => (
                                <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                            ))}
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                            <BookOpenIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time Period</label>
                    <button onClick={() => handleExport('daily')} className="w-full p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors font-medium">
                        Daily Report (Today)
                    </button>
                    <button onClick={() => handleExport('weekly')} className="w-full p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors font-medium">
                        Weekly Report (This Week)
                    </button>
                    <button onClick={() => handleExport('monthly')} className="w-full p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors font-medium">
                        Monthly Report (This Month)
                    </button>
                </div>
                 <button onClick={() => setShowExportModal(false)} className="mt-6 w-full py-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium">
                    Cancel
                </button>
            </div>
          </div>
      )}

    </div>
  );
};

export default TeacherDashboard;
