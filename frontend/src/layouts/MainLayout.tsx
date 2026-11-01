import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <header className="sticky top-0 z-30 shadow-lg">
        <Navbar onMenuClick={() => setIsSidebarOpen((open) => !open)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </header>

      <main className="workspace-main flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-in fade-in duration-300">
        <Outlet />
      </main>
    </div>
  );
};
