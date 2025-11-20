import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserIcon } from '../shared/icons';
import { navItems } from './navConfig';

const BottomNav: React.FC = () => {
    const { user } = useAuth();

     const getFilteredNavItems = () => {
        return navItems.filter(item => user && item.roles.includes(user.role)).map(item => ({
            ...item,
            href: item.href === '/' ? `/${user.role}` : item.href
        })).slice(0, 4); // Limit to 4 for bottom nav
    }

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 shadow-t-lg z-50">
            <ul className="flex justify-around h-16 items-center">
                {getFilteredNavItems().map((item) => (
                    <li key={item.label}>
                        <NavLink 
                            to={item.href}
                            end={item.href === `/${user?.role}`}
                            className={({isActive}) => `flex flex-col items-center gap-1 p-2 rounded-lg transition-all transform active:scale-95 ${
                                isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400'
                            }`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </NavLink>
                    </li>
                ))}
                 <li>
                    <Link to="/profile" className="flex flex-col items-center gap-1 p-2 rounded-lg text-slate-500 dark:text-slate-400 transition-all transform active:scale-95 hover:text-primary-600 dark:hover:text-primary-400">
                         <UserIcon className="w-6 h-6" />
                         <span className="text-xs font-medium">Profile</span>
                    </Link>
                </li>
            </ul>
        </nav>
    );
}

export default BottomNav;