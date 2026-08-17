import React from 'react';

export function TableSkeletonLoader({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden animate-pulse">
      <div className="bg-slate-100 h-10 border-b border-slate-200" />
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center px-4 py-3 gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-4 bg-slate-200 rounded flex-1"
                style={{ opacity: 1 - cIdx * 0.15 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <div className="h-3 w-1/3 bg-slate-200 rounded" />
          <div className="h-6 w-2/3 bg-slate-300 rounded" />
          <div className="h-3 w-1/2 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}
