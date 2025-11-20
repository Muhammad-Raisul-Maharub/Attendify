
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Role } from '../../types';
import { CheckSquareIcon } from '../../components/shared/icons';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    
    const result = await auth.signup({
        email,
        full_name: fullName,
        password,
        role,
        student_id: role === 'student' ? studentId : undefined
    });

    if (result.success) {
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } else {
      setError(result.message || 'Signup failed. Please try again.');
      toast.error(result.message || 'Signup failed');
    }
    setLoading(false);
  };
  
  const inputClasses = "block w-full rounded-lg border border-white/20 bg-white/20 dark:bg-slate-900/20 px-3 py-2.5 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent";
  const labelClasses = "block text-sm font-medium text-slate-200 mb-1";


  return (
    <div 
        className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative w-full max-w-md space-y-6 bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 animate-scale-in">
        <div>
          <div className="flex items-center gap-3 mb-2 justify-center">
            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <CheckSquareIcon className="w-7 h-7 text-primary-300" />
            </div>
            <span className="text-3xl font-bold text-white">Create Account</span>
          </div>
          <p className="mt-2 text-sm text-slate-300 text-center">
            Join Attendify to streamline your attendance.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label htmlFor="full-name" className={labelClasses}>Full Name</label>
            <input id="full-name" name="full-name" type="text" required className={inputClasses} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
            <div>
            <label htmlFor="email-address" className={labelClasses}>Email address</label>
            <input id="email-address" name="email" type="email" required className={inputClasses} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
            <div>
            <label htmlFor="password"  className={labelClasses}>Password</label>
            <input id="password" name="password" type="password" required className={inputClasses} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
            <div>
            <label htmlFor="confirm-password"  className={labelClasses}>Confirm Password</label>
            <input id="confirm-password" name="confirm-password" type="password" required className={inputClasses} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <div>
            <label htmlFor="role" className={labelClasses}>I am a</label>
            <select id="role" name="role" required value={role} onChange={(e) => setRole(e.target.value as Role)} className={`${inputClasses} appearance-none`}>
              <option className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white" value="student">Student</option>
              <option className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white" value="teacher">Teacher</option>
              <option className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white" value="admin">Admin</option>
            </select>
          </div>
          {role === 'student' && (
            <div>
                <label htmlFor="student-id" className={labelClasses}>Student ID</label>
                <input id="student-id" name="student-id" type="text" required className={inputClasses} placeholder="e.g. S001" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
            </div>
          )}
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <div>
            <button type="submit" disabled={loading} className="group relative flex w-full justify-center rounded-lg border border-transparent bg-primary-600 py-3 px-4 text-sm font-medium text-white hover:bg-primary-700 disabled:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <div className="text-center text-sm">
          <Link to="/login" className="font-medium text-primary-300 hover:text-white">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
