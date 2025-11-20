import React, { ReactNode, useState } from 'react';
import SideNav from '../layout/SideNav';
import BottomNav from '../layout/BottomNav';
import Header from '../layout/Header';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      
      <SideNav isCollapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className={`flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        <Header />
        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6">
            {children}
        </main>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Layout;