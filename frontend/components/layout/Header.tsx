import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CheckSquareIcon, UserIcon, LogOutIcon } from '../shared/icons';
import ThemeSwitcher from '../shared/ThemeSwitcher';

const Header: React.FC = () => {
    const { logout } = useAuth();
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 md:hidden">
            <Link to="/" className="flex items-center gap-2">
                <CheckSquareIcon className="w-8 h-8 text-primary" />
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Attendify</h1>
            </Link>
            <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <Link to="/profile" className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors p-2 rounded-md text-sm flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                </Link>
                 <button onClick={logout} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-colors p-2 rounded-md text-sm flex items-center gap-2">
                    <LogOutIcon className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

export default Header;