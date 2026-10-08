import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiChartBar,
  HiClipboardDocumentList,
  HiMapPin,
  HiUsers,
  HiBuildingOffice2,
  HiTag,
  HiMap,
  HiDocumentText,
  HiCog6Tooth,
  HiPlusCircle,
  HiUserCircle,
  HiBell,
  HiBriefcase,
  HiMagnifyingGlass,
} from 'react-icons/hi2';

export default function Sidebar({ onClose }) {
  const { role } = useAuth();

  const citizenNav = [
    { label: 'Dashboard', to: '/citizen/dashboard', icon: HiChartBar },
    { label: 'Report a Problem', to: '/citizen/report', icon: HiPlusCircle },
    { label: 'My Complaints', to: '/citizen/complaints', icon: HiClipboardDocumentList },
    { label: 'Track Complaint', to: '/citizen/track', icon: HiMagnifyingGlass },
    { label: 'Notifications', to: '/citizen/notifications', icon: HiBell },
    { label: 'Profile', to: '/citizen/profile', icon: HiUserCircle },
  ];

  const officerNav = [
    { label: 'Operational Dashboard', to: '/officer/dashboard', icon: HiChartBar },
    { label: 'Assigned Complaints', to: '/officer/assigned', icon: HiBriefcase },
    { label: 'Profile', to: '/officer/profile', icon: HiUserCircle },
  ];

  const adminNav = [
    { label: 'Analytics Dashboard', to: '/admin/dashboard', icon: HiChartBar },
    { label: 'Complaint Management', to: '/admin/complaints', icon: HiClipboardDocumentList },
    { label: 'City Complaint Map', to: '/admin/map', icon: HiMapPin },
    { label: 'Users Directory', to: '/admin/users', icon: HiUsers },
    { label: 'Municipal Officers', to: '/admin/officers', icon: HiBriefcase },
    { label: 'Departments', to: '/admin/departments', icon: HiBuildingOffice2 },
    { label: 'Categories', to: '/admin/categories', icon: HiTag },
    { label: 'Wards & Zones', to: '/admin/wards', icon: HiMap },
    { label: 'Summary Reports', to: '/admin/reports', icon: HiDocumentText },
    { label: 'System Settings', to: '/admin/settings', icon: HiCog6Tooth },
  ];

  const items = role === 'ADMIN' ? adminNav : role === 'OFFICER' ? officerNav : citizenNav;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {role === 'ADMIN' ? 'MUNICIPAL ADMIN' : role === 'OFFICER' ? 'DEPARTMENT WORKFLOW' : 'CITIZEN PORTAL'}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-civic-pale text-civic-dark font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 text-xs text-gray-400">
        <p className="font-semibold text-gray-600">ZenCity Platform</p>
        <p>DBMS & Data Visualization</p>
      </div>
    </aside>
  );
}
