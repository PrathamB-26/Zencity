import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileDrawer from './MobileDrawer';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-civic-surface">
      <Navbar onToggleSidebar={() => setMobileSidebarOpen(true)} />
      
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {user && (
          <div className="hidden lg:block flex-shrink-0">
            <Sidebar />
          </div>
        )}

        {user && (
          <MobileDrawer
            isOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
