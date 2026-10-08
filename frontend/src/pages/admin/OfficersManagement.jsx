import React, { useState, useEffect } from 'react';
import { usersApi } from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { HiBriefcase } from 'react-icons/hi2';

export default function OfficersManagement() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.listOfficers()
      .then((res) => {
        if (res.data.success) setOfficers(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Municipal Field Officers</h1>
        <p className="text-xs text-gray-500 mt-1">Directory of departmental staff and active casework load</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6"><LoadingSkeleton type="table" count={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Officer ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Assigned Department</th>
                  <th className="px-4 py-3 text-left">Contact Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-right">Active Cases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {officers.map((o) => (
                  <tr key={o.user_id} className="hover:bg-gray-50/60 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">#{o.user_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{o.name}</td>
                    <td className="px-4 py-3 text-gray-600 font-semibold">{o.department_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{o.email}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{o.phone || 'N/A'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-civic-pale text-civic-dark">
                        {o.active_cases || 0} active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
