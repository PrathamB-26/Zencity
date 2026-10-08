import React from 'react';

export default function PriorityBadge({ priority }) {
  const styles = {
    LOW: 'bg-slate-50 text-slate-600 border-slate-200',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    CRITICAL: 'bg-red-50 text-red-700 border-red-200 font-semibold',
  };

  const labels = {
    LOW: 'Low Priority',
    MEDIUM: 'Medium Priority',
    HIGH: 'High Priority',
    CRITICAL: 'Critical SLA',
  };

  const currentClass = styles[priority] || 'bg-gray-50 text-gray-700 border-gray-200';
  const label = labels[priority] || priority;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${currentClass}`}>
      {label}
    </span>
  );
}
