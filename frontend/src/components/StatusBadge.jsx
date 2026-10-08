import React from 'react';

export default function StatusBadge({ status }) {
  const styles = {
    SUBMITTED: 'bg-slate-100 text-slate-700 border-slate-200',
    ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    CLOSED: 'bg-gray-100 text-gray-800 border-gray-300',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const labels = {
    SUBMITTED: 'Submitted',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
  };

  const currentClass = styles[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  const label = labels[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {label}
    </span>
  );
}
