import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { HiUserCircle, HiEnvelope, HiPhone, HiShieldCheck } from 'react-icons/hi2';

export default function ProfilePage() {
  const { user, role } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">User Profile</h1>
        <p className="text-xs text-gray-500 mt-1">Municipal account details and authorization role</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-civic-pale text-civic-dark flex items-center justify-center font-bold text-2xl">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-civic-pale text-civic-dark">
              {role}
            </span>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <HiEnvelope className="w-5 h-5 text-gray-400" />
            <div>
              <span className="text-xs text-gray-400 uppercase font-semibold block">Email</span>
              <span className="text-gray-900 font-medium">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HiPhone className="w-5 h-5 text-gray-400" />
            <div>
              <span className="text-xs text-gray-400 uppercase font-semibold block">Phone</span>
              <span className="text-gray-900 font-medium">{user.phone || 'Not provided'}</span>
            </div>
          </div>

          {user.department_name && (
            <div className="flex items-center gap-3">
              <HiShieldCheck className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold block">Assigned Department</span>
                <span className="text-gray-900 font-medium">{user.department_name}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
