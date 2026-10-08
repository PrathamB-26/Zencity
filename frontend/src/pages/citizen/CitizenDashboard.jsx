import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintsApi } from '../../services/api';
import KpiCard from '../../components/KpiCard';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Button from '../../components/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import {
  HiPlusCircle,
  HiClipboardDocumentList,
  HiClock,
  HiCheckCircle,
  HiArchiveBox,
  HiArrowRight,
} from 'react-icons/hi2';

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintsApi.list({ limit: 6 })
      .then((res) => {
        if (res.data.success) {
          setComplaints(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const total = complaints.length;
  const submitted = complaints.filter((c) => c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length;
  const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;
  const closed = complaints.filter((c) => c.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Action */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Citizen Civic Portal</h1>
          <p className="text-xs text-gray-500 mt-1">
            Report neighborhood issues, monitor repair crews, and verify resolution quality.
          </p>
        </div>
        <Link to="/citizen/report">
          <Button size="lg" variant="primary" icon={HiPlusCircle}>
            Report a New Problem
          </Button>
        </Link>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard title="Submitted" value={submitted} icon={HiClock} color="civic" />
        <KpiCard title="In Progress" value={inProgress} icon={HiClock} color="amber" />
        <KpiCard title="Resolved" value={resolved} icon={HiCheckCircle} color="civic" />
        <KpiCard title="Closed" value={closed} icon={HiArchiveBox} color="civic" />
        <KpiCard title="Total Filed" value={total} icon={HiClipboardDocumentList} color="blue" />
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Your Recent Complaints</h2>
            <p className="text-xs text-gray-500">Track current status and dispatch progress</p>
          </div>
          <Link to="/citizen/complaints" className="text-xs font-semibold text-civic hover:underline flex items-center gap-1">
            View All Complaints <HiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={4} />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints reported yet"
            description="Have you observed a pothole, broken streetlight, or drainage issue in your ward?"
            actionText="Report First Problem"
            onAction={() => (window.location.href = '/citizen/report')}
            icon={HiClipboardDocumentList}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Case ID</th>
                  <th className="px-4 py-3 text-left">Problem Title</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Reported Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {complaints.map((c) => (
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
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/citizen/complaints/${c.complaint_id}`}
                        className="text-xs font-semibold text-civic hover:underline"
                      >
                        View Details
                      </Link>
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
