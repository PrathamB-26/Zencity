import React from 'react';
import { HiCheck, HiClock, HiXMark } from 'react-icons/hi2';

const STAGES = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function ComplaintTimeline({ currentStatus, history = [] }) {
  const isRejected = currentStatus === 'REJECTED';
  const currentIndex = isRejected ? -1 : STAGES.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Stepper */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Complaint Lifecycle Progress</h4>

        {isRejected ? (
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-800 text-sm">
            <HiXMark className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>This complaint was <strong>REJECTED</strong>. Please review administrative remarks below.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {STAGES.map((stage, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isUpcoming = idx > currentIndex;

              let badgeBg = 'bg-gray-100 text-gray-400 border-gray-200';
              let Icon = HiClock;

              if (isPast) {
                badgeBg = 'bg-civic-pale text-civic-dark border-civic-light';
                Icon = HiCheck;
              } else if (isCurrent) {
                badgeBg = 'bg-civic text-white border-civic ring-2 ring-civic-light ring-offset-1';
                Icon = HiClock;
              }

              return (
                <div
                  key={stage}
                  className={`flex flex-col items-center text-center p-3 rounded-lg border transition ${
                    isCurrent ? 'bg-civic-surface border-civic' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border mb-2 ${badgeBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-medium uppercase tracking-wider ${isCurrent ? 'text-civic-dark font-bold' : isPast ? 'text-gray-800' : 'text-gray-400'}`}>
                    {stage.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-gray-500 mt-0.5">
                    {isCurrent ? 'Current' : isPast ? 'Completed' : 'Upcoming'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit History Log */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Status Transition & Activity Log</h4>
        {history.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No historical transitions recorded yet.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {history.map((item, idx) => (
              <div key={item.history_id || idx} className="relative">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-civic border-2 border-white ring-2 ring-civic-pale" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="font-semibold text-gray-900">
                    {item.old_status ? `${item.old_status} → ${item.new_status}` : `Initial: ${item.new_status}`}
                  </span>
                  <time>{new Date(item.changed_at).toLocaleString()}</time>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded p-2.5 mt-1">
                  {item.remarks || 'No detailed remarks provided.'}
                </p>
                {item.changer_name && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Updated by: <span className="font-medium text-gray-700">{item.changer_name}</span> ({item.changer_role || 'STAFF'})
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
