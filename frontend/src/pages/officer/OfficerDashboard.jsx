import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintsApi } from '../../services/api';
import KpiCard from '../../components/KpiCard';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import {
  HiBriefcase,
  HiClock,
  HiCheckCircle,
  HiExclamationTriangle,
  HiPencilSquare,
} from 'react-icons/hi2';

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status update modal state
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [targetStatus, setTargetStatus] = useState('IN_PROGRESS');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchAssigned = () => {
    setLoading(true);
    complaintsApi.list({ limit: 50 })
      .then((res) => {
        if (res.data.success) {
          setComplaints(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!activeComplaint) return;
    setUpdating(true);
    try {
      const res = await complaintsApi.updateStatus(activeComplaint.complaint_id, {
        status: targetStatus,
        remarks: remarks || `Field update by assigned officer to ${targetStatus}`,
      });
      if (res.data.success) {
        setActiveComplaint(null);
        setRemarks('');
        fetchAssigned();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status.');
    } finally {
      setUpdating(false);
    }
  };

  const totalAssigned = complaints.length;
  const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const highPriority = complaints.filter((c) => ['HIGH', 'CRITICAL'].includes(c.priority) && !['RESOLVED', 'CLOSED'].includes(c.status)).length;
  const overdue = complaints.filter((c) => c.due_date && new Date(c.due_date) < new Date() && !['RESOLVED', 'CLOSED'].includes(c.status)).length;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Field Operations Dashboard</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage assigned complaints, coordinate repair work, and document resolution remarks.
        </p>
      </div>

      {/* Operational KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard title="Total Assigned" value={totalAssigned} icon={HiBriefcase} color="civic" />
        <KpiCard title="In Progress" value={inProgress} icon={HiClock} color="amber" />
        <KpiCard title="Resolved" value={resolved} icon={HiCheckCircle} color="civic" />
        <KpiCard title="High / Critical" value={highPriority} icon={HiExclamationTriangle} color="rose" />
        <KpiCard title="Overdue SLA" value={overdue} icon={HiClock} color="rose" />
      </div>

      {/* Assigned Cases Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Assigned Work Queue</h2>

        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="Queue Clear"
            description="There are currently no civic complaints assigned to your department queue."
            icon={HiCheckCircle}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Case ID</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Ward Area</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Target Due</th>
                  <th className="px-4 py-3 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {complaints.map((c) => (
                  <tr key={c.complaint_id} className="hover:bg-gray-50/60 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">#{c.complaint_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{c.title}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.ward_name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.category_name}</td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {c.due_date ? new Date(c.due_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        to={`/citizen/complaints/${c.complaint_id}`}
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                      >
                        Inspect
                      </Link>
                      {!['RESOLVED', 'CLOSED'].includes(c.status) && (
                        <button
                          onClick={() => {
                            setActiveComplaint(c);
                            setTargetStatus(c.status === 'ASSIGNED' ? 'IN_PROGRESS' : 'RESOLVED');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-civic bg-civic-pale px-2.5 py-1 rounded hover:bg-civic hover:text-white transition"
                        >
                          <HiPencilSquare className="w-3.5 h-3.5" /> Update Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {activeComplaint && (
        <Modal
          isOpen={true}
          onClose={() => setActiveComplaint(null)}
          title={`Update Complaint #${activeComplaint.complaint_id}`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase block">Problem Title</span>
              <p className="text-sm font-bold text-gray-800">{activeComplaint.title}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="status-select">
                Target Transition Status
              </label>
              <select
                id="status-select"
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic bg-white"
              >
                {activeComplaint.status === 'ASSIGNED' && (
                  <option value="IN_PROGRESS">IN_PROGRESS (Dispatched work crew)</option>
                )}
                {activeComplaint.status === 'IN_PROGRESS' && (
                  <option value="RESOLVED">RESOLVED (Maintenance completed)</option>
                )}
                <option value="RESOLVED">RESOLVED (Direct resolution)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="status-remarks">
                Work Remarks & Resolution Information
              </label>
              <textarea
                id="status-remarks"
                rows={3}
                required
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Document repairs completed, materials used, or inspection outcome..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setActiveComplaint(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={updating}>
                Confirm Status Transition
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
