'use client';

import React from 'react';

export function SkeletonTable() {
  return (
    <div className="divide-y divide-slate-100 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-1/4">
            <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-1.5 w-full">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
          <div className="h-4 bg-slate-100 rounded w-28 hidden md:block" />
          <div className="h-4 bg-slate-100 rounded w-36 hidden lg:block" />
          <div className="h-4 bg-slate-100 rounded w-28 hidden sm:block" />
          <div className="h-6 bg-slate-200 rounded-full w-20" />
          <div className="h-8 bg-slate-100 rounded w-20" />
        </div>
      ))}
    </div>
  );
}
