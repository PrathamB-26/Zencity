import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintsApi, departmentsApi, usersApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { HiUserPlus, HiPencilSquare } from 'react-icons/hi2';

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Assign Modal
  const [assigningComplaint, setAssigningComplaint] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchComplaints = () => {
    setLoading(true);
    complaintsApi.list({
      page,
      limit: 15,
      status: statusFilter || undefined,
      search: search || undefined,
    })
      .then((res) => {
        if (res.data.success) {
          setComplaints(res.data.data);
          setTotalPages(res.data.pagination.totalPages || 1);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    departmentsApi.list().then((res) => {
      if (res.data.success) setDepartments(res.data.data);
    });
    usersApi.listOfficers().then((res) => {
      if (res.data.success) setOfficers(res.data.data);
    });
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter]);

  const handleOpenAssignModal = (complaint) => {
    setAssigningComplaint(complaint);
    setSelectedDept(complaint.department_id || (departments[0]?.department_id || ''));
    setSelectedOfficer(complaint.assigned_officer_id || '');
    setAssignRemarks('');
  };

  const handleConfirmAssignment = async (e) => {
    e.preventDefault();
    if (!assigningComplaint) return;
    setAssigning(true);
    try {
      const res = await complaintsApi.assign(assigningComplaint.complaint_id, {
        department_id: selectedDept,
        assigned_officer_id: selectedOfficer || null,
        remarks: assignRemarks || 'Assigned by municipal administrator.',
      });
      if (res.data.success) {
        setAssigningComplaint(null);
        fetchComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error assigning complaint.');
    } finally {
      setAssigning(false);
    }
  };

  const deptOfficers = officers.filter((o) => !selectedDept || o.department_id === parseInt(selectedDept, 10));

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Municipal Complaint Desk</h1>
          <p className="text-xs text-gray-500 mt-1">Review cases, dispatch departments, and assign field officers</p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted (Unassigned)</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" count={5} />
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints found"
            description="No cases match current filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Case ID</th>
                  <th className="px-4 py-3 text-left">Problem Title</th>
                  <th className="px-4 py-3 text-left">Ward Area</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Handling Officer</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {complaints.map((c) => (
                  <tr key={c.complaint_id} className="hover:bg-gray-50/60 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">#{c.complaint_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{c.title}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{c.ward_name}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-700">{c.department_name || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{c.officer_name || 'None'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        to={`/citizen/complaints/${c.complaint_id}`}
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                      >
                        Inspect
                      </Link>
                      <button
                        onClick={() => handleOpenAssignModal(c)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-civic bg-civic-pale px-2.5 py-1 rounded hover:bg-civic hover:text-white transition"
                      >
                        <HiUserPlus className="w-3.5 h-3.5" /> Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {assigningComplaint && (
        <Modal
          isOpen={true}
          onClose={() => setAssigningComplaint(null)}
          title={`Assign Case #${assigningComplaint.complaint_id}`}
        >
          <form onSubmit={handleConfirmAssignment} className="space-y-4">
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase block">Problem Title</span>
              <p className="text-sm font-bold text-gray-800">{assigningComplaint.title}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="assign-dept">
                Municipal Department <span className="text-rose-500">*</span>
              </label>
              <select
                id="assign-dept"
                required
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedOfficer('');
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic bg-white"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="assign-officer">
                Assign Field Officer
              </label>
              <select
                id="assign-officer"
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic bg-white"
              >
                <option value="">Allocate later (Queue for Department)</option>
                {deptOfficers.map((o) => (
                  <option key={o.user_id} value={o.user_id}>
                    {o.name} ({o.active_cases || 0} active cases)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="assign-remarks">
                Assignment Remarks / Instructions
              </label>
              <textarea
                id="assign-remarks"
                rows={3}
                value={assignRemarks}
                onChange={(e) => setAssignRemarks(e.target.value)}
                placeholder="Dispatched team, priority instructions, site notes..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setAssigningComplaint(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={assigning}>
                Confirm Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
