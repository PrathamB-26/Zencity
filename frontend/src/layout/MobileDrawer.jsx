import React from 'react';
import Sidebar from './Sidebar';
import { HiXMark } from 'react-icons/hi2';

export default function MobileDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-64 max-w-[80%] bg-white shadow-xl flex flex-col h-full z-10 animate-slide-right">
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <span className="font-bold text-gray-900">ZenCity Menu</span>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-700">
            <HiXMark className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
