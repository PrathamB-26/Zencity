import React from 'react';

export default function KpiCard({ title, value, subtext, icon: Icon, trend, color = 'civic' }) {
  const iconColors = {
    civic: 'bg-civic-pale text-civic-dark',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    purple: 'bg-indigo-50 text-indigo-700',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm transition hover:border-gray-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${iconColors[color] || iconColors.civic}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{value !== undefined ? value : '--'}</span>
        {trend && (
          <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-amber-600' : 'text-emerald-600'}`}>
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1 text-xs text-gray-500">{subtext}</p>}
    </div>
  );
}
