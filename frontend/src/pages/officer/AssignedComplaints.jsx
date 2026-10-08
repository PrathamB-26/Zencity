import React, { useState, useEffect } from 'react';
import { complaintsApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Button from '../../components/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { HiBriefcase } from 'react-icons/hi2';

export default function AssignedComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    complaintsApi.list({ limit: 100 })
      .then((res) => {
        if (res.data.success) {
          setComplaints(res.data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = complaints.filter((c) => {
    if (filter === 'ACTIVE') return ['ASSIGNED', 'IN_PROGRESS'].includes(c.status);
    if (filter === 'RESOLVED') return ['RESOLVED', 'CLOSED'].includes(c.status);
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Assigned Complaints Directory</h1>
          <p className="text-xs text-gray-500 mt-1">Full case record assigned to your handling queue</p>
        </div>
        <div className="flex gap-2">
          {['ALL', 'ACTIVE', 'RESOLVED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === f ? 'bg-civic text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f} Cases
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" count={6} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No records found"
            description="No complaint matches the chosen status filter."
            icon={HiBriefcase}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Case ID</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Reported Locality</th>
                  <th className="px-4 py-3 text-left">Reported Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.map((c) => (
                  <tr key={c.complaint_id} className="hover:bg-gray-50/60 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">#{c.complaint_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{c.title}</td>
                    <td className="px-4 py-3 text-gray-600">{c.category_name}</td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.location_text || c.ward_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(c.created_at).toLocaleDateString()}
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
