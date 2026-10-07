'use client';

import React from 'react';
import { Truck, Plus, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onAddAgent: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isCached?: boolean; // kept for API compatibility — used by backend, not displayed
}

export function Header({ onAddAgent, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">DAMS</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                v1.0 Pro
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Delivery Agent Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          <button
            onClick={onAddAgent}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Delivery Agent</span>
          </button>
        </div>
      </div>
    </header>
  );
}
