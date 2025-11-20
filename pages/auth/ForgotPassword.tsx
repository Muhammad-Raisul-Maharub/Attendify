
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquareIcon } from '../../components/shared/icons';
import toast from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(`If an account with that email exists, a password reset link has been sent.`);
      setLoading(false);
      setEmail('');
    }, 1000);
  };

  return (
    <div 
        className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')" }}
    >
       <div className="absolute inset-0 bg-black/50"></div>
       <div className="relative w-full max-w-md space-y-6 bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 animate-scale-in">
        <div>
          <div className="flex items-center gap-3 mb-2 justify-center">
             <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <CheckSquareIcon className="w-7 h-7 text-primary-300" />
            </div>
            <span className="text-3xl font-bold text-white">Forgot Password</span>
          </div>
          <p className="mt-2 text-sm text-slate-300 text-center">
            Enter your email to receive a reset link.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleReset}>
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-slate-200 mb-1">Email address</label>
            <input id="email-address" name="email" type="email" required className="block w-full rounded-lg border border-white/20 bg-white/20 dark:bg-slate-900/20 px-3 py-2.5 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <button type="submit" disabled={loading} className="group relative flex w-full justify-center rounded-lg border border-transparent bg-primary-600 py-3 px-4 text-sm font-medium text-white hover:bg-primary-700 disabled:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
        <div className="text-center text-sm">
          <Link to="/login" className="font-medium text-primary-300 hover:text-white">
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
