
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllCourses, deleteCourse, getAllUsers } from '../services/mockApi';
import type { User, ClassRoutine } from '../types';
import { EditIcon, TrashIcon, XIcon, ClockIcon, UserIcon, RefreshCwIcon, BookOpenIcon, ChevronRightIcon, SearchIcon } from '../components/shared/icons';
import toast from 'react-hot-toast';
import UnifiedCreateClassModal from '../components/shared/UnifiedCreateClassModal';

type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

// --- DETAILS MODAL ---
const CourseDetailsModal: React.FC<{
    course: ClassRoutine;
    onClose: () => void;
}> = ({ course, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-scale-in border dark:border-slate-800">
                 <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><XIcon className="w-6 h-6"/></button>
                 
                 <div className="mb-6">
                     <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">{course.course_code}</span>
                     <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{course.course_name}</h2>
                 </div>

                 <div className="space-y-4">
                     <div className="flex items-start gap-3">
                         <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                             <UserIcon className="w-5 h-5" />
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Professor</p>
                             <p className="text-slate-800 dark:text-slate-200 font-medium">{course.teacherName}</p>
                         </div>
                     </div>
                     <div className="flex items-start gap-3">
                         <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                             <ClockIcon className="w-5 h-5" />
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Schedule</p>
                             <p className="text-slate-800 dark:text-slate-200 font-medium">{course.day}, {course.start_time.substring(0,5)} - {course.end_time.substring(0,5)}</p>
                         </div>
                     </div>
                      <div className="flex items-start gap-3">
                         <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                             <BookOpenIcon className="w-5 h-5" />
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Location</p>
                             <p className="text-slate-800 dark:text-slate-200 font-medium">Room {course.room}</p>
                         </div>
                     </div>
                 </div>
                 
                 <button onClick={onClose} className="w-full mt-8 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                     Close
                 </button>
            </div>
        </div>
    )
}

// --- ROUTINE TABLE COMPONENT ---
const RoutineTable: React.FC<{
    courses: ClassRoutine[];
    onEdit: (course: ClassRoutine) => void;
    onDelete: (id: string) => void;
    onView: (course: ClassRoutine) => void;
    canEdit: boolean;
}> = ({ courses, onEdit, onDelete, onView, canEdit }) => {
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const timeSlots = [
        { label: '8:15-9:05', start: '08:15' },
        { label: '9:10-10:00', start: '09:10' },
        { label: '10:05-10:55', start: '10:05' },
        { label: '11:00-11:50', start: '11:00' },
        { label: '11:55-12:45', start: '11:55' },
        { label: '12:45-1:45', start: '12:45' },
        { label: '1:45-2:35', start: '13:45' },
        { label: '2:40-3:30', start: '14:40' },
        { label: '3:30-4:20', start: '15:30' }
    ];

    const getCourseForSlot = (day: string, slotStart: string) => {
        return courses.find(c => c.day === day && c.start_time.substring(0, 5) === slotStart);
    };

    const isSlotOccupied = (day: string, slotStart: string) => {
        return courses.some(c => c.day === day && c.start_time.substring(0, 5) < slotStart && c.end_time.substring(0, 5) > slotStart);
    };

    const getSpan = (course: ClassRoutine, startIndex: number) => {
        let span = 1;
        for (let i = startIndex + 1; i < timeSlots.length; i++) {
            if (course.end_time.substring(0, 5) > timeSlots[i].start) {
                span++;
            } else {
                break;
            }
        }
        return span;
    };

    return (
        <div className="overflow-x-auto pb-4">
            <div className="min-w-[1000px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="grid grid-cols-[100px_repeat(9,1fr)] divide-x divide-slate-200 dark:divide-slate-700 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <div className="p-3 font-bold text-slate-600 dark:text-slate-300 text-sm flex items-center justify-center">Day</div>
                    {timeSlots.map((slot, i) => (
                        <div key={i} className="p-3 font-bold text-slate-600 dark:text-slate-300 text-xs text-center flex items-center justify-center bg-slate-100 dark:bg-slate-800/80">
                            {slot.label}
                        </div>
                    ))}
                </div>
                {days.map((day) => (
                    <div key={day} className="grid grid-cols-[100px_repeat(9,1fr)] divide-x divide-slate-200 dark:divide-slate-700 border-b border-slate-200 dark:border-slate-700 last:border-0">
                        <div className="p-3 font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center justify-center bg-slate-50 dark:bg-slate-900/30">
                            {day}
                        </div>
                        {timeSlots.map((slot, i) => {
                            if (isSlotOccupied(day, slot.start)) return null;

                            const course = getCourseForSlot(day, slot.start);
                            const span = course ? getSpan(course, i) : 1;
                            const gridStyle = span > 1 ? { gridColumn: `span ${span} / span ${span}` } : {};

                            return (
                                <div 
                                    key={i} 
                                    className="min-h-[80px] p-1 relative group"
                                    style={gridStyle}
                                >
                                    {course ? (
                                        <div 
                                            className="h-full w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-primary-100 dark:border-primary-900/30 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-500 transition-all cursor-pointer flex flex-col justify-between"
                                            onClick={() => onView(course)}
                                        >
                                            <div>
                                                <div className="font-bold text-primary-700 dark:text-primary-400 text-xs">{course.course_code}</div>
                                                <div className="text-[10px] leading-tight text-slate-600 dark:text-slate-300 font-medium line-clamp-2 mt-1" title={course.course_name}>{course.course_name}</div>
                                            </div>
                                            <div className="mt-1 flex justify-between items-end">
                                                 <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1 rounded">{course.room}</div>
                                                 {canEdit && (
                                                     <div className="hidden group-hover:flex gap-1 bg-white dark:bg-slate-800 shadow-sm rounded p-0.5 absolute top-1 right-1 border dark:border-slate-600">
                                                         <button onClick={(e) => { e.stopPropagation(); onEdit(course); }} className="p-1 hover:text-primary-600"><EditIcon className="w-3 h-3"/></button>
                                                         <button onClick={(e) => { e.stopPropagation(); onDelete(course.id); }} className="p-1 hover:text-red-600"><TrashIcon className="w-3 h-3"/></button>
                                                     </div>
                                                 )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full w-full"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

const CoursesPage: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<ClassRoutine[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<ClassRoutine | null>(null);
    const [viewingDetails, setViewingDetails] = useState<ClassRoutine | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'table'>(() => window.innerWidth < 1024 ? 'list' : 'table');
    
    const [teachers, setTeachers] = useState<User[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState('all');
    
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = new Date().getDay();
    const currentDayName = days[currentDayIndex];

    const [openDays, setOpenDays] = useState<string[]>([currentDayName]);

    const toggleDay = (day: string) => {
        setOpenDays(prev => 
            prev.includes(day) 
                ? prev.filter(d => d !== day) 
                : [...prev, day]
        );
    }
    
    const fetchData = () => {
        setLoading(true);
        Promise.all([
            getAllCourses(),
            getAllUsers()
        ]).then(([routineData, usersData]) => {
            setCourses(routineData);
            setTeachers(usersData.filter(u => u.role === 'teacher'));
            if (user?.role === 'teacher') {
                setSelectedTeacher(user.id);
            }
            setLoading(false);
            if (courses.length > 0) toast.success("Schedule refreshed");
        });
    };

    useEffect(() => {
        fetchData();
        // No real-time subscription
    }, [user]);

    const handleOpenModal = (course: ClassRoutine | null) => {
        setEditingCourse(course);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingCourse(null);
        setIsModalOpen(false);
    };

    const getActor = () => user ? { name: user.full_name, role: user.role } : undefined;

    const handleDeleteCourse = (courseId: string) => {
        if (window.confirm('Are you sure you want to cancel/delete this class?')) {
            const promise = deleteCourse(courseId, getActor());
            toast.promise(promise, {
                loading: 'Deleting class...',
                success: 'Class deleted successfully!',
                error: 'Failed to delete class.'
            });
            setTimeout(fetchData, 500);
        }
    };
    
    const filteredCourses = useMemo(() => {
        if (selectedTeacher === 'all') return courses;
        return courses.filter(c => c.teacherId === selectedTeacher);
    }, [courses, selectedTeacher]);

    const coursesByDay = days.map(day => ({
        day,
        courses: filteredCourses.filter(c => c.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time))
    })).filter(d => d.courses.length > 0);

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto animate-fade-in">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Class Schedule</h2>
                    <p className="text-slate-500 dark:text-slate-400">View and manage the weekly class routine.</p>
                </div>
                 <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
                    <button 
                        onClick={fetchData} 
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>

                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-sm font-bold">
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            List
                        </button>
                        <button 
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Table
                        </button>
                    </div>

                    {user?.role !== 'teacher' && (
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                                className="w-full sm:w-56 appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm text-sm font-medium"
                            >
                                <option value="all">All Teachers</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.full_name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                 <div className="flex justify-center py-12">
                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                 </div>
            ) : (
                <>
                {viewMode === 'table' ? (
                    <RoutineTable 
                        courses={filteredCourses} 
                        onEdit={handleOpenModal} 
                        onDelete={handleDeleteCourse} 
                        onView={setViewingDetails}
                        canEdit={user?.role === 'admin' || user?.role === 'teacher'}
                    />
                ) : (
                    coursesByDay.length > 0 ? (
                    <div className="space-y-6">
                        {coursesByDay.map(({ day, courses }) => {
                            const isOpen = openDays.includes(day);
                            const isToday = day === currentDayName;

                            return (
                                <div key={day} className="group relative">
                                     {/* Header */}
                                    <div 
                                        className="flex items-center py-4 cursor-pointer select-none" 
                                        onClick={() => toggleDay(day)}
                                    >
                                         {isToday && <div className="absolute left-0 top-5 bottom-5 w-1.5 bg-primary-500 rounded-full"></div>}
                                        
                                        <div className={`flex-grow flex items-center justify-between ${isToday ? 'pl-5' : 'pl-2'}`}>
                                             <div className="flex items-center gap-3">
                                                <h3 className={`text-xl font-bold ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {day}
                                                </h3>
                                                {isToday && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 tracking-wider">Today</span>}
                                            </div>
                                            <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-slate-100 dark:bg-slate-800 rotate-90' : ''}`}>
                                                 <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition-colors`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Collapsible Content */}
                                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className={`space-y-3 pb-2 ${isToday ? 'pl-5' : 'pl-2'}`}>
                                                {courses.map(course => {
                                                    const isMyCourse = user?.role === 'teacher' && course.teacherId === user.id;
                                                    const canEdit = user?.role === 'admin' || isMyCourse;

                                                    return (
                                                        <div key={course.id} className="bg-white dark:bg-slate-800/80 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-all border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600">
                                                           {/* Left Info */}
                                                           <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-3">
                                                                     <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider border border-slate-200 dark:border-slate-600">{course.course_code}</span>
                                                                     <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{course.course_name}</span>
                                                                </div>
                                                                 <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                                    <UserIcon className="w-3.5 h-3.5" />
                                                                    <span>{course.teacherName}</span>
                                                                    <span className="mx-1">•</span>
                                                                    <span>Room {course.room}</span>
                                                                </div>
                                                           </div>
                                                           
                                                           {/* Right Info & Actions */}
                                                           <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                                <div className="flex items-center gap-2 text-sm font-medium bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                                                     <ClockIcon className="w-4 h-4 text-slate-400"/>
                                                                     {course.start_time.substring(0,5)} - {course.end_time.substring(0,5)}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-slate-400">
                                                                    <button onClick={() => setViewingDetails(course)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors" title="Details"><SearchIcon className="w-5 h-5"/></button>
                                                                    {canEdit && (
                                                                        <>
                                                                        <button onClick={() => handleOpenModal(course)} className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg transition-colors" title="Edit"><EditIcon className="w-5 h-5"/></button>
                                                                        <button onClick={() => handleDeleteCourse(course.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors" title="Delete"><TrashIcon className="w-5 h-5"/></button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                           </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    ) : (
                        <div className="text-center py-16 bg-white dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                <RefreshCwIcon className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No classes found matching your filter.</p>
                            {user?.role !== 'teacher' && (
                                <button onClick={() => setSelectedTeacher('all')} className="mt-4 text-primary-600 dark:text-primary-400 hover:underline text-sm font-semibold">Clear Filters</button>
                            )}
                        </div>
                    )
                )}
                </>
            )}
            
            {isModalOpen && <UnifiedCreateClassModal isOpen={isModalOpen} onClose={handleCloseModal} onSuccess={fetchData} currentUser={user} existingRoutineItem={editingCourse} />}
            {viewingDetails && <CourseDetailsModal course={viewingDetails} onClose={() => setViewingDetails(null)} />}
        </div>
    );
};

export default CoursesPage;
