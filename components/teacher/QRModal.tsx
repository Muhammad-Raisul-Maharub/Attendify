
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { ClassSession } from '../../types';
import { XIcon, RefreshCwIcon, UsersIcon } from '../shared/icons';
import { setSessionPasscode } from '../../services/mockApi';
import toast from 'react-hot-toast';

interface QRModalProps {
  session: ClassSession;
  onClose: () => void;
  onEndSession: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ session, onClose, onEndSession }) => {
    const [timeLeft, setTimeLeft] = useState(60);
    const [initialDuration, setInitialDuration] = useState(60);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [justUpdated, setJustUpdated] = useState(false);
    const prevAttendanceCount = useRef(session.liveAttendance.length);
    const [sessionActive, setSessionActive] = useState(true);
    const [currentCode, setCurrentCode] = useState<string>('');

    const activatePasscode = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setCurrentCode(code);
        setSessionPasscode(session.id, code, 60);
        setTimeLeft(60);
        setInitialDuration(60);
        setSessionActive(true);
    }

    useEffect(() => {
        activatePasscode();
    }, []);

    const refreshToken = () => {
        setIsRefreshing(true);
        activatePasscode();
        setTimeout(() => setIsRefreshing(false), 300);
    };

    const adjustTime = (amount: number) => {
        if (!sessionActive) setSessionActive(true);
        setTimeLeft(prev => {
            const newVal = Math.max(0, prev + amount);
            setInitialDuration(Math.max(initialDuration, newVal)); 
            setSessionPasscode(session.id, currentCode, newVal);
            return newVal;
        });
    };

    useEffect(() => {
        if (timeLeft === 0 && sessionActive) {
             setSessionActive(false);
             toast('Passcode expired. Refresh to continue.', { icon: '⏳' });
        }
        
        if (!sessionActive) return;

        const timer = setTimeout(() => {
            setTimeLeft(t => t > 0 ? t - 1 : 0);
        }, 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, sessionActive]);

    useEffect(() => {
        if (session.liveAttendance.length > prevAttendanceCount.current) {
            setJustUpdated(true);
            const timer = setTimeout(() => setJustUpdated(false), 500);
            return () => clearTimeout(timer);
        }
        prevAttendanceCount.current = session.liveAttendance.length;
    }, [session.liveAttendance.length]);


    const qrValue = JSON.stringify({ sessionId: session.id, token: currentCode, active: sessionActive });
    const attendanceCount = session.liveAttendance.length;
    const totalStudents = session.totalStudents || 50; 
    const attendancePercentage = totalStudents > 0 ? (attendanceCount / totalStudents) * 100 : 0;

    // SVG Circular Progress Logic
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(1, timeLeft / (initialDuration || 1)); 
    const strokeDashoffset = circumference - progress * circumference;
    const progressColor = timeLeft > 10 ? '#10B981' : '#EF4444';

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 text-center transform transition-all animate-scale-in border dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-400 to-accent-500"></div>

                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="mb-6">
                     <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Attendance Session
                    </span>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-3 leading-tight">{session.course.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{sessionActive ? 'Live & Accepting' : 'Session Paused'}</p>
                </div>

                <div className="flex flex-col items-center justify-center gap-6">
                    {/* QR Code Box */}
                    <div className={`relative p-4 bg-white rounded-2xl shadow-sm border-2 ${sessionActive ? 'border-primary-500 shadow-primary-200 dark:shadow-none' : 'border-slate-200 dark:border-slate-700'} transition-all duration-300`}>
                         <div className={`transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'} ${!sessionActive ? 'opacity-40 grayscale' : ''}`}>
                            <QRCodeSVG value={qrValue} size={180} bgColor="transparent" fgColor={document.documentElement.classList.contains('dark') ? '#000' : '#000'} level="H" />
                        </div>
                        
                        {/* Timer Overlay on QR */}
                         <div className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                             <div className="relative w-12 h-12 flex items-center justify-center">
                                 <svg className="transform -rotate-90 w-12 h-12 absolute">
                                    <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                                    <circle cx="24" cy="24" r={radius} stroke={sessionActive ? progressColor : 'transparent'} strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-500 ease-linear" />
                                </svg>
                                <span className={`relative text-xs font-bold ${timeLeft <= 10 && sessionActive ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{timeLeft}s</span>
                             </div>
                         </div>
                    </div>

                    {/* Passcode Section */}
                    <div className="w-full">
                        <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">Student Passcode</p>
                        <div className="flex items-center justify-center gap-3">
                             <p className={`text-5xl font-mono font-bold tracking-widest text-slate-800 dark:text-slate-100 transition-all duration-300 ${isRefreshing ? 'opacity-50 blur-sm' : 'opacity-100'} ${!sessionActive ? 'line-through opacity-40' : ''}`}>
                                {currentCode}
                            </p>
                        </div>
                        
                        {/* Timer Controls */}
                        <div className="flex justify-center gap-2 mt-4">
                            <button onClick={() => adjustTime(-10)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors">-10s</button>
                            <button onClick={() => setSessionActive(!sessionActive)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors">
                                {sessionActive ? 'Pause' : 'Resume'}
                            </button>
                            <button onClick={() => adjustTime(30)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors">+30s</button>
                            <button onClick={refreshToken} disabled={isRefreshing} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1">
                                <RefreshCwIcon className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`}/> New Code
                            </button>
                        </div>
                    </div>
                </div>

                {/* Attendance Bar */}
                <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                     <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                            <UsersIcon className="w-5 h-5 text-primary-500"/>
                            <span className={`transition-all duration-300 ${justUpdated ? 'scale-110 text-primary-600' : ''}`}>{attendanceCount}</span>
                            <span className="text-slate-400 text-sm font-normal">/ {totalStudents} Joined</span>
                        </div>
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{Math.round(attendancePercentage)}%</span>
                     </div>
                     <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(236,72,153,0.5)] relative" style={{ width: `${Math.max(5, attendancePercentage)}%` }}>
                            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => {
                        onEndSession();
                        onClose();
                    }}
                    className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-red-500/20 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                    End Session
                </button>
            </div>
        </div>
    );
};

export default QRModal;
