
import React, { useState, useEffect, useRef } from 'react';
import type { ClassSession } from '../../types';
import { XIcon, CheckCircleIcon, QrCodeIcon, CheckSquareIcon } from '../shared/icons';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Html5QrcodeScanner } from "html5-qrcode";

interface ScannerModalProps {
  session?: ClassSession;
  onClose: () => void;
  onAttendanceSubmit: (code: string, sessionId?: string) => { success: boolean; message: string, session?: ClassSession };
}

const ScannerModal: React.FC<ScannerModalProps> = ({ session, onClose, onAttendanceSubmit }) => {
    const { user } = useAuth();
    const [passcode, setPasscode] = useState('');
    const [confirmationDetails, setConfirmationDetails] = useState<{ name: string; course: string; time: string } | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // If session is not provided, we are in global mode
    const isGlobalMode = !session;

    useEffect(() => {
        // Initialize scanner after mount
        const timer = setTimeout(() => {
            const element = document.getElementById('reader');
            if (element && !scannerRef.current && !confirmationDetails) {
                try {
                    const scanner = new Html5QrcodeScanner(
                        "reader", 
                        { 
                            fps: 10, 
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0,
                            showTorchButtonIfSupported: true
                        }, 
                        false
                    );
                    scannerRef.current = scanner;
                    
                    scanner.render(onScanResult, (errorMessage) => {
                        // console.log(errorMessage); // Ignore parse errors during scanning
                    });
                } catch (e) {
                    console.error("Scanner initialization failed", e);
                    setScanError("Could not start camera. Please allow camera permissions.");
                }
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
                scannerRef.current = null;
            }
        };
    }, [confirmationDetails]);

    const onScanResult = (decodedText: string, decodedResult: any) => {
        if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
        }
        
        try {
            const data = JSON.parse(decodedText);
            // If we have a specific session, enforce match
            if (session && data.sessionId && data.sessionId !== session.id) {
                 toast.error("This QR Code belongs to a different session.");
                 onClose(); // Or restart scanner?
                 return;
            }
            attemptAttendance(data.token, data.sessionId);
        } catch (e) {
            // Fallback for plain text codes
            attemptAttendance(decodedText);
        }
    };

    const handlePasscodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(passcode.length < 4) {
            toast.error('Please enter a valid passcode');
            return;
        }
        // Manual entry usually relies on the parent finding the session if global, or using the prop session
        attemptAttendance(passcode, session?.id);
    }

    const attemptAttendance = (code: string, sessionId?: string) => {
        const result = onAttendanceSubmit(code, sessionId);

        if (result.success) {
             // Use the returned session for details, or fall back to prop session
             const confirmedSession = result.session || session;
             setConfirmationDetails({
                name: user?.full_name || 'Student',
                course: confirmedSession?.course.name || 'Unknown Course',
                time: format(new Date(), 'p')
            });
            toast.success('Attendance marked!');
        } else {
             toast.error(result.message);
             onClose();
        }
    };

    const renderConfirmation = () => (
        <div className="flex flex-col items-center text-center animate-fade-in py-6">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-pop-and-flash">
                <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Checked In!</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Your attendance has been recorded.</p>
            
            <div className="w-full text-left bg-slate-50 dark:bg-slate-800 rounded-xl p-5 mt-8 space-y-3 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-sm text-slate-400 dark:text-slate-500">Name</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{confirmationDetails?.name}</span>
                </div>
                 <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-sm text-slate-400 dark:text-slate-500">Course</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{confirmationDetails?.course}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-sm text-slate-400 dark:text-slate-500">Time</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{confirmationDetails?.time}</span>
                </div>
            </div>

            <button
                onClick={onClose}
                className="mt-8 w-full bg-slate-800 dark:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
            >
                Done
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
            <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full ${confirmationDetails ? 'max-w-md' : 'max-w-4xl'} p-6 relative transform transition-all animate-scale-in border dark:border-slate-800 my-auto`}>
                 <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 z-10 bg-slate-100 dark:bg-slate-800 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <XIcon className="w-5 h-5" />
                </button>
                
                {!confirmationDetails && (
                    <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                         <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mark Attendance</h2>
                         {session ? (
                             <p className="text-slate-500 dark:text-slate-400">Session: <span className="font-semibold text-primary-600 dark:text-primary-400">{session.course.name}</span></p>
                         ) : (
                             <p className="text-slate-500 dark:text-slate-400">Scan the QR code shown by your teacher.</p>
                         )}
                    </div>
                )}

                {confirmationDetails ? renderConfirmation() : (
                    <div className={`flex flex-col ${isGlobalMode ? 'items-center' : 'lg:flex-row'} gap-8`}>
                        {/* Left Side: Scanner */}
                        <div className={`${isGlobalMode ? 'w-full max-w-md' : 'flex-1'} flex flex-col`}>
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <QrCodeIcon className="w-4 h-4" /> Scan QR Code
                            </h3>
                            <div className="relative w-full bg-black rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 min-h-[300px] flex-grow">
                                 {scanError ? (
                                     <div className="absolute inset-0 flex items-center justify-center text-white p-6 text-center">
                                         <div className="bg-red-500/20 p-4 rounded-xl border border-red-500/50">
                                            <p className="font-bold text-red-200 mb-2">Camera Error</p>
                                            <p className="text-sm text-red-100">{scanError}</p>
                                         </div>
                                     </div>
                                 ) : (
                                    <div id="reader" className="w-full h-full"></div>
                                 )}
                            </div>
                            <p className="text-xs text-slate-400 mt-2 text-center">Point camera at the teacher's screen</p>
                        </div>

                        {!isGlobalMode && (
                        <>
                            {/* Divider for Desktop */}
                            <div className="hidden lg:flex flex-col items-center justify-center">
                                <div className="h-full w-px bg-slate-200 dark:bg-slate-800 relative">
                                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 py-2 px-1 text-slate-300 dark:text-slate-600 font-bold text-xs rotate-90 tracking-widest">OR</span>
                                </div>
                            </div>

                            {/* Divider for Mobile */}
                            <div className="flex lg:hidden items-center gap-4 w-full">
                                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow"></div>
                                <span className="text-xs font-bold text-slate-300 dark:text-slate-600 uppercase">OR</span>
                                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow"></div>
                            </div>

                            {/* Right Side: Manual Entry (Only when session is pre-selected) */}
                            <div className="flex-1 flex flex-col justify-center w-full">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 h-full flex flex-col justify-center">
                                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 text-center">
                                        Enter Passcode manually
                                    </h3>
                                    <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                                        <input 
                                            type="text" 
                                            value={passcode}
                                            onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                                            placeholder="------"
                                            maxLength={6}
                                            className="w-full text-center text-3xl font-mono font-bold p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 uppercase placeholder:text-slate-200 tracking-[0.5em]"
                                        />
                                        <button 
                                            type="submit"
                                            className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                                        >
                                            <CheckSquareIcon className="w-5 h-5" />
                                            Submit Code
                                        </button>
                                    </form>
                                    <p className="text-xs text-slate-400 text-center mt-4">
                                        Ask your teacher for the 6-character code if you cannot scan.
                                    </p>
                                </div>
                            </div>
                        </>
                        )}
                    </div>
                )}
            </div>
             <style>{`
                #reader {
                    border: none !important;
                    width: 100%;
                    height: 100%;
                }
                #reader video {
                    object-fit: cover;
                    border-radius: 1rem;
                    width: 100% !important;
                    height: 100% !important;
                }
                #reader__scan_region {
                    background: transparent;
                }
                #reader__dashboard_section_csr button {
                    display: none; /* Clean UI */
                }
             `}</style>
        </div>
    );
};

export default ScannerModal;
