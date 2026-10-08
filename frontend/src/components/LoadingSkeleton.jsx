import React from 'react';

export default function LoadingSkeleton({ count = 3, type = 'card' }) {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        {items.map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-100 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}
