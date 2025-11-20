
import React, { useState, useEffect } from 'react';
import { createAdHocSession, addCourse, updateCourse } from '../../services/mockApi';
import type { User, ClassRoutine } from '../../types';
import { XIcon, CalendarIcon, PlayIcon } from '../shared/icons';
import { format, addHours } from 'date-fns';
import toast from 'react-hot-toast';

interface UnifiedCreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: User | null;
  existingRoutineItem?: ClassRoutine | null; // If provided, we are editing a routine
}

type Mode = 'instant' | 'routine';

const UnifiedCreateClassModal: React.FC<UnifiedCreateClassModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  existingRoutineItem
}) => {
  // If editing, force 'routine' mode. If creating, default to 'instant' for dashboards, but maybe 'routine' for courses page?
  // We'll default to 'instant' as it's the "Create Session" primary action, but allow switching.
  const [mode, setMode] = useState<Mode>('instant');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    room: '',
    day: 'Sunday',
    startTime: format(new Date(), 'HH:mm'),
    endTime: format(addHours(new Date(), 1), 'HH:mm'),
  });

  useEffect(() => {
    if (existingRoutineItem) {
      setMode('routine');
      setFormData({
        courseName: existingRoutineItem.course_name,
        courseCode: existingRoutineItem.course_code,
        room: existingRoutineItem.room,
        day: existingRoutineItem.day,
        startTime: existingRoutineItem.start_time.substring(0, 5),
        endTime: existingRoutineItem.end_time.substring(0, 5),
      });
    } else {
      setMode('instant'); // Default for new
      setFormData({
        courseName: '',
        courseCode: '',
        room: '',
        day: 'Sunday',
        startTime: format(new Date(), 'HH:mm'),
        endTime: format(addHours(new Date(), 1), 'HH:mm'),
      });
    }
  }, [existingRoutineItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    try {
      if (mode === 'instant') {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const startISO = `${todayStr}T${formData.startTime}:00`;
        const endISO = `${todayStr}T${formData.endTime}:00`;

        if (formData.endTime <= formData.startTime) {
             toast.error('End time must be after start time');
             setLoading(false);
             return;
        }

        await createAdHocSession({
          courseName: formData.courseName,
          courseCode: formData.courseCode.toUpperCase(),
          room: formData.room,
          startTime: startISO,
          endTime: endISO,
          teacherId: currentUser.id,
          teacherName: currentUser.full_name
        });
        toast.success('Instant session started!');
      } else {
        // Routine Mode (Add or Update)
        const routineData = {
          day: formData.day as any,
          start_time: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
          end_time: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
          course_code: formData.courseCode.toUpperCase(),
          course_name: formData.courseName,
          room: formData.room,
          teacherId: existingRoutineItem?.teacherId || currentUser.id,
          teacherName: existingRoutineItem?.teacherName || currentUser.full_name
        };

        if (existingRoutineItem) {
          await updateCourse({ ...existingRoutineItem, ...routineData }, { name: currentUser.full_name, role: currentUser.role });
          toast.success('Class schedule updated!');
        } else {
          await addCourse(routineData, { name: currentUser.full_name, role: currentUser.role });
          toast.success('Class added to schedule!');
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-scale-in border dark:border-slate-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <XIcon className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold mb-1 text-slate-800 dark:text-slate-100">
          {existingRoutineItem ? 'Edit Class Schedule' : 'Create Session'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
            {existingRoutineItem ? 'Update the details for this recurring class.' : 'Start a class now or schedule one for later.'}
        </p>

        {/* Toggle Switch (Only if creating new) */}
        {!existingRoutineItem && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setMode('instant')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === 'instant'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <PlayIcon className="w-4 h-4" /> Instant
            </button>
            <button
              type="button"
              onClick={() => setMode('routine')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === 'routine'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <CalendarIcon className="w-4 h-4" /> Routine
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Code</label>
                <input
                    type="text"
                    required
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    placeholder="CSE 101"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase font-medium"
                />
            </div>
             <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Room</label>
                <input
                    type="text"
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="302"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Course Name</label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              placeholder="Intro to Programming"
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            />
          </div>

          {/* Routine Specific: Day */}
          {mode === 'routine' && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Day of Week</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
              >
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Start Time</label>
              <div className="relative">
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                  />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">End Time</label>
              <div className="relative">
                <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-bold transition-all shadow-lg ${
                  mode === 'instant' 
                    ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/30' 
                    : 'bg-accent-600 hover:bg-accent-700 shadow-accent-500/30'
              }`}
            >
              {loading ? 'Saving...' : mode === 'instant' ? 'Start Session Now' : existingRoutineItem ? 'Update Schedule' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedCreateClassModal;
