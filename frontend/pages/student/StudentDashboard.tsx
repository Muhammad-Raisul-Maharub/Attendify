
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getStudentSessions, markAttendance } from '../../services/mockApi';
import type { ClassSession } from '../../types';
import { SessionStatus } from '../../types';
import CourseCard from '../../components/shared/CourseCard';
import toast from 'react-hot-toast';
import ScannerModal from '../../components/student/ScannerModal';
import { isToday, isFuture, parseISO } from 'date-fns';
import CourseCardSkeleton from '../../components/shared/CourseCardSkeleton';
import { CheckCircleIcon, ChevronRightIcon, QrCodeIcon, RefreshCwIcon, EditIcon } from '../../components/shared/icons';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  const sessionsRef = useRef<ClassSession[]>([]);

  const [isPasscodeExpanded, setIsPasscodeExpanded] = useState(false);
  const [manualPasscode, setManualPasscode] = useState('');

  const [sectionsExpanded, setSectionsExpanded] = useState({ today: true, upcoming: true });

  const toggleSection = (section: 'today' | 'upcoming') => {
      setSectionsExpanded(prev => ({...prev, [section]: !prev[section]}));
  }

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  const fetchSessions = () => {
    if (!user) return;
    if (sessions.length === 0) setLoading(true);

    getStudentSessions(user.student_id || '').then(allSessions => {
      const oldSessions = sessionsRef.current;
      if (oldSessions.length > 0 && sessions.length > 0) { 
        allSessions.forEach(newSession => {
          const oldSession = oldSessions.find(s => s.id === newSession.id);
          if (oldSession && oldSession.status === SessionStatus.SCHEDULED && newSession.status === SessionStatus.ONGOING) {
            toast.success(`${newSession.course.name} session has started!`, { icon: '🔔' });
          }
        });
        toast.success("Dashboard updated");
      }
      
      const updatedSessions = allSessions.map(newSession => {
          const current = oldSessions.find(s => s.id === newSession.id);
          const hasAttendedInApi = newSession.liveAttendance.some(att => att.student.id === user.id);
          return {
              ...newSession,
              userHasAttended: current?.userHasAttended || hasAttendedInApi,
          };
      });

      setSessions(updatedSessions);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!user) return;
    fetchSessions();
  }, [user]);

  const handleMarkAttendance = (session: ClassSession) => {
    setSelectedSession(session);
    setShowScanner(true);
  };
  
  const handleGlobalScan = () => {
      setSelectedSession(null);
      setShowScanner(true);
  }

  const handleAttendanceSubmit = (code?: string, targetSessionId?: string): { success: boolean; message: string, session?: ClassSession } => {
    if (!user) return { success: false, message: 'User information missing' };
    
    let sessionId = targetSessionId || selectedSession?.id;
    
    if (!sessionId && code) {
        const matchedSession = sessions.find(s => s.status === SessionStatus.ONGOING && s.activePasscode?.toUpperCase() === code.toUpperCase());
        if (matchedSession) {
            sessionId = matchedSession.id;
        } else {
             return { success: false, message: 'Invalid passcode or no active session found for this code.' };
        }
    }

    if (!sessionId) {
         return { success: false, message: 'Could not identify session.' };
    }

    const result = markAttendance(sessionId, user, code);
    
    if (result.success) {
        const updatedSessions = sessions.map(s => {
          if (s.id === sessionId) {
            return { ...s, userHasAttended: true };
          }
          return s;
        });
        setSessions(updatedSessions);
        
        const session = updatedSessions.find(s => s.id === sessionId);
        return { ...result, session };
    }
    
    return result;
  };

  const handleManualPasscodeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (manualPasscode.length < 4) {
          toast.error("Please enter a valid code");
          return;
      }
      const result = handleAttendanceSubmit(manualPasscode);
      if (result.success) {
          toast.success("Attendance Marked Successfully!");
          setManualPasscode('');
          setIsPasscodeExpanded(false);
      } else {
          toast.error(result.message);
      }
  }

  const todaySessions = sessions.filter(s => isToday(parseISO(s.start_time)));
  const upcomingSessions = sessions.filter(s => isFuture(parseISO(s.start_time)));

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCardSkeleton /><CourseCardSkeleton /><CourseCardSkeleton />
        </div>
      );
    }

    const renderCardContent = (session: ClassSession) => {
      const hasAttended = session.userHasAttended || session.liveAttendance.some(att => att.student.id === user?.id);

      if (session.status === SessionStatus.ONGOING) {
        return hasAttended ? (
          <div className="w-full bg-accent-500/10 dark:bg-accent-500/20 text-accent-600 dark:text-accent-300 font-bold py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            Checked In
          </div>
        ) : (
          <button
            onClick={() => handleMarkAttendance(session)}
            className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-primary-700 transition-transform transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Mark Attendance
          </button>
        );
      }

      if (session.status === SessionStatus.SCHEDULED) {
        return <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold py-3 px-4 rounded-xl text-center">Starts Soon</div>;
      }
      
      if (session.status === SessionStatus.COMPLETED) {
        return (
          <div className={`w-full font-bold py-3 px-4 rounded-xl text-center ${hasAttended ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
            {hasAttended ? 'Attendance Marked' : 'Session Ended'}
          </div>
        )
      }

      return null;
    };

    return (
      <div className="space-y-8">
        
        {/* Quick Check-in Card */}
        <div className="bg-gradient-to-b from-primary-500 to-purple-600 rounded-3xl p-8 text-center shadow-xl shadow-primary-500/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 opacity-20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none"></div>
             
             <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-2xl font-bold text-white mb-2">Quick Check-in</h2>
                <p className="text-white/90 text-sm mb-8 max-w-md">
                    Mark your attendance instantly by scanning a QR code or entering the session passcode provided by your teacher.
                </p>

                <div className="w-full max-w-xs space-y-3">
                    <button 
                        onClick={handleGlobalScan}
                        className="w-full bg-white text-slate-900 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-transform active:scale-95 shadow-lg"
                    >
                        <QrCodeIcon className="w-6 h-6 text-slate-900" />
                        <span>Scan QR Code</span>
                    </button>
                    
                    <div className="w-full">
                        <button 
                            onClick={() => setIsPasscodeExpanded(!isPasscodeExpanded)}
                            className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/30 transition-all active:scale-95"
                        >
                             <EditIcon className="w-5 h-5" />
                             <span>Enter Passcode</span>
                             <ChevronRightIcon className={`w-4 h-4 ml-auto opacity-70 transition-transform duration-300 ${isPasscodeExpanded ? 'rotate-90' : 'rotate-0'}`} />
                        </button>
                        
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden mt-2 ${isPasscodeExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                             <form onSubmit={handleManualPasscodeSubmit} className="flex flex-col gap-3">
                                 <input 
                                    type="text" 
                                    value={manualPasscode}
                                    onChange={(e) => setManualPasscode(e.target.value.toUpperCase())}
                                    placeholder="CODE"
                                    className="w-full bg-black/20 border border-white/30 rounded-xl px-3 py-2.5 text-center text-white placeholder-white/40 font-mono font-bold text-lg tracking-[0.2em] focus:outline-none focus:bg-black/30 focus:border-white/50 uppercase"
                                    maxLength={6}
                                 />
                                 <button type="submit" className="w-full bg-white text-purple-700 font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-sm">
                                     Submit Code
                                 </button>
                             </form>
                        </div>
                    </div>
                </div>
             </div>
        </div>

        {/* Today's Classes Section */}
        <div className="space-y-4">
             <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <button 
                    onClick={() => toggleSection('today')}
                    className={`w-full flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none ${sectionsExpanded.today ? 'border-b border-slate-100 dark:border-slate-700/50' : ''}`}
                >
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Today's Classes</h3>
                        <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold px-2 py-0.5 rounded-full">{todaySessions.length}</span>
                    </div>
                    <div className={`p-2 rounded-full transition-all duration-300 ${sectionsExpanded.today ? 'bg-primary-50 dark:bg-primary-900/20 rotate-90' : 'bg-transparent'}`}>
                         <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition-colors ${sectionsExpanded.today ? 'text-primary-500' : ''}`} />
                    </div>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden bg-white dark:bg-slate-900/20 ${sectionsExpanded.today ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-5">
                        {todaySessions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {todaySessions.map(session => (
                                <CourseCard key={session.id} session={session}>
                                {renderCardContent(session)}
                                </CourseCard>
                            ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                 <p className="text-slate-500 dark:text-slate-400 text-sm">No classes scheduled for today.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

             {/* Upcoming Classes Section */}
             <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <button 
                    onClick={() => toggleSection('upcoming')}
                    className={`w-full flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none ${sectionsExpanded.upcoming ? 'border-b border-slate-100 dark:border-slate-700/50' : ''}`}
                >
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Upcoming Classes</h3>
                     <div className={`p-2 rounded-full transition-all duration-300 ${sectionsExpanded.upcoming ? 'bg-primary-50 dark:bg-primary-900/20 rotate-90' : 'bg-transparent'}`}>
                         <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition-colors ${sectionsExpanded.upcoming ? 'text-primary-500' : ''}`} />
                    </div>
                </button>
                 <div className={`transition-all duration-300 ease-in-out overflow-hidden bg-white dark:bg-slate-900/20 ${sectionsExpanded.upcoming ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-5">
                         {upcomingSessions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {upcomingSessions.map(session => <CourseCard key={session.id} session={session} />)}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-slate-500 dark:text-slate-400 text-sm">No upcoming classes.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-row justify-between items-center gap-4">
             <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    Hello,<br className="sm:hidden" /> {user?.full_name?.split(' ')[0]}!
                </h2>
                <div className="hidden sm:flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    {user?.student_id && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                            {user.student_id}
                        </span>
                    )}
                    <span>Ready to check in? Use quick actions below.</span>
                </div>
            </div>
             <button 
                onClick={fetchSessions} 
                className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors active:translate-y-0.5"
            >
                <RefreshCwIcon className="w-4 h-4 text-slate-400"/>
                <span className="hidden sm:inline">Refresh / View Results</span>
                <span className="sm:hidden">Refresh</span>
            </button>
        </div>
      </div>
      
      {renderContent()}

      {showScanner && (
        <ScannerModal
          session={selectedSession || undefined}
          onClose={() => { setShowScanner(false); setSelectedSession(null); }}
          onAttendanceSubmit={handleAttendanceSubmit}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
