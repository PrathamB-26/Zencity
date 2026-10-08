import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../services/api';
import { HiBars3, HiBell, HiArrowRightOnRectangle, HiUserCircle } from 'react-icons/hi2';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      notificationsApi.list()
        .then((res) => {
          if (res.data.success) {
            const count = res.data.data.filter((n) => !n.is_read).length;
            setUnreadCount(count);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Toggle navigation drawer"
            >
              <HiBars3 className="w-6 h-6" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-civic-dark flex items-center justify-center text-white font-bold text-lg shadow-sm">
              Z
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900 tracking-tight">ZenCity</span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-civic-pale text-civic-dark rounded">
                Smart City
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Notification icon */}
              <Link
                to={role === 'ADMIN' ? '/admin/dashboard' : role === 'OFFICER' ? '/officer/dashboard' : '/citizen/notifications'}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Notifications"
              >
                <HiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </Link>

              {/* User info */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-gray-900 leading-tight">{user.name}</span>
                  <span className="text-[11px] font-medium text-civic-accent uppercase tracking-wider">{role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign out"
                >
                  <HiArrowRightOnRectangle className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-civic transition">
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-civic hover:bg-civic-dark text-white px-3.5 py-1.5 rounded-lg transition shadow-sm"
              >
                Report a Problem
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
