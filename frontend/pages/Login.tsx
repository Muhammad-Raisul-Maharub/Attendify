
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types';
import toast from 'react-hot-toast';

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
    </svg>
);


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  // navigate is not strictly needed for success as App.tsx handles redirect, 
  // but useful for manual overrides if needed.
  const navigate = useNavigate(); 
  const auth = useAuth();

  // Effect to handle redirect when user state changes
  useEffect(() => {
    if (auth.user) {
        navigate(`/${auth.user.role}`);
    }
  }, [auth.user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await auth.login(email, password, role);

    if (result.success) {
      toast.success(`Welcome back!`, { icon: '👋' });
      // Navigation is handled by the useEffect above or App.tsx guard
    } else {
      toast.error(result.message || 'Invalid credentials.', { duration: 4000 });
      setLoading(false);
    }
  };
  
  const quickLogin = async (quickEmail: string, quickRole: Role) => {
    // Update form state to reflect the action
    setEmail(quickEmail);
    setPassword('password123');
    setRole(quickRole);
    setLoading(true);

    // Explicitly use the quickRole for login to ensure we target the correct user type
    const result = await auth.login(quickEmail, 'password123', quickRole);
    
    if (result.success) {
      toast.success(`Welcome back!`);
      // Navigation is handled by the useEffect above or App.tsx guard
    } else {
      toast.error(result.message || 'Quick login failed.');
      setLoading(false);
    }
  }

  return (
    <div 
        className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')" }}
    >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative w-full max-w-md bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 animate-scale-in">
          <div className="text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-500/30">
                      <CheckIcon className="w-7 h-7 text-primary-300" />
                  </div>
                  <span className="text-3xl font-bold text-white tracking-tight">Attendify</span>
              </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Sign in to your account
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Your smart attendance solution
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-slate-200 mb-1">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-lg border border-white/20 bg-white/20 dark:bg-slate-900/20 px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

               <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-lg border border-white/20 bg-white/20 dark:bg-slate-900/20 px-3 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-200 mb-1">Role</label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="block w-full rounded-lg border border-white/20 bg-white/20 dark:bg-slate-900/20 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none bg-white/20 transition-colors"
                  >
                    <option className="bg-slate-800 text-white" value="student">Student</option>
                    <option className="bg-slate-800 text-white" value="teacher">Teacher</option>
                    <option className="bg-slate-800 text-white" value="admin">Admin</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            
            <div className="flex items-center justify-end text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-300 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-xl bg-primary-600 py-3.5 px-4 text-sm font-bold text-white hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-400 dark:focus:ring-offset-slate-900 transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

           <div className="text-center text-sm mt-6">
             <p className="text-slate-300">Don't have an account? <Link to="/signup" className="font-bold text-white hover:text-primary-300 transition-colors ml-1">Sign Up</Link></p>
          </div>

          {/* Quick Login Section */}
          <div className="mt-8 pt-6 border-t border-white/10 relative">
              <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Quick Demo Access
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  type="button"
                  onClick={() => quickLogin('student@attendify.app', 'student')} 
                  className="group flex flex-col items-center justify-center py-3 px-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 mb-2 shadow-[0_0_8px_rgba(74,222,128,0.5)] group-hover:scale-125 transition-transform"></span>
                  <span className="text-sm font-semibold text-white group-hover:text-green-300 transition-colors">Student</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => quickLogin('arif@attendify.app', 'teacher')} 
                  className="group flex flex-col items-center justify-center py-3 px-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400 mb-2 shadow-[0_0_8px_rgba(192,132,252,0.5)] group-hover:scale-125 transition-transform"></span>
                  <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">Teacher</span>
                </button>

                <button 
                  type="button"
                  onClick={() => quickLogin('admin@attendify.app', 'admin')} 
                  className="group flex flex-col items-center justify-center py-3 px-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="w-2 h-2 rounded-full bg-red-400 mb-2 shadow-[0_0_8px_rgba(248,113,113,0.5)] group-hover:scale-125 transition-transform"></span>
                  <span className="text-sm font-semibold text-white group-hover:text-red-300 transition-colors">Admin</span>
                </button>
              </div>
          </div>
        </div>
    </div>
  );
};

export default LoginPage;
    