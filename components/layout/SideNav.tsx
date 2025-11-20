import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CheckSquareIcon, UserIcon, LogOutIcon, ChevronLeftIcon } from '../shared/icons';
import { navItems } from './navConfig';

interface SideNavProps {
    isCollapsed: boolean;
    setCollapsed: (c: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ isCollapsed, setCollapsed }) => {
    const { user, logout } = useAuth();
    
    const getFilteredNavItems = () => {
        return navItems.filter(item => user && item.roles.includes(user.role)).map(item => ({
            ...item,
            href: item.href === '/' ? `/${user.role}` : item.href,
        }));
    }

    const filteredNavItems = getFilteredNavItems();

    return (
        <aside className={`flex-col fixed inset-y-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center gap-2 h-16 border-b border-slate-100 dark:border-slate-800 px-6 ${isCollapsed ? 'justify-center' : ''}`}>
                <CheckSquareIcon className="w-8 h-8 text-primary flex-shrink-0" />
                <h1 className={`text-xl font-bold text-slate-800 dark:text-slate-100 transition-opacity ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Attendify</h1>
            </div>
            <nav className="flex flex-col p-3 flex-grow">
                <ul className="space-y-1">
                    {filteredNavItems.map((item) => (
                         <li key={item.label} data-tip={item.label}>
                         <NavLink
                            to={item.href}
                            end={item.href === `/${user?.role}`}
                            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group relative ${isCollapsed ? 'justify-center' : ''} ${
                                isActive ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                         >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className={`transition-opacity whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>{item.label}</span>
                             {isCollapsed && <span className="absolute left-full ml-4 w-auto p-2 min-w-max rounded-md shadow-md text-white bg-slate-800 text-xs font-bold transition-all duration-100 scale-0 group-hover:scale-100 z-50">{item.label}</span>}
                         </NavLink>
                     </li>
                    ))}
                </ul>
            </nav>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <Link to="/profile" className={`flex items-center gap-3 mb-4 group hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="flex-shrink-0">
                         <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border border-slate-300 dark:border-slate-600 group-hover:border-primary-400 transition-colors">
                             <UserIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-primary-500" />
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col min-w-0 overflow-hidden">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug truncate text-left" title={user?.full_name}>
                                {user?.full_name}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize font-medium text-left">
                                {user?.role}
                            </span>
                        </div>
                    )}
                </Link>
                
                <button 
                    onClick={logout} 
                    className={`flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg p-2 w-full transition-colors text-sm font-bold ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <LogOutIcon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
            
             <button onClick={() => setCollapsed(!isCollapsed)} className="absolute -right-3 top-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1.5 text-slate-500 hover:text-primary focus:outline-none shadow-sm z-10">
                <ChevronLeftIcon className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
            </button>
        </aside>
    );
};

export default SideNav;