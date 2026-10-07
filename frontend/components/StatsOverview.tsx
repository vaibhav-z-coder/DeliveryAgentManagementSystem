'use client';

import React from 'react';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { DashboardStats } from '../types/agent';

interface StatsOverviewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onFilterChange: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  currentFilter: string;
}

export function StatsOverview({ stats, loading, onFilterChange, currentFilter }: StatsOverviewProps) {
  const total = stats?.total ?? 0;
  const active = stats?.active ?? 0;
  const inactive = stats?.inactive ?? 0;
  const recentlyAdded = stats?.recentlyAdded ?? 0;

  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
  const inactivePercent = total > 0 ? Math.round((inactive / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Agents */}
      <div
        onClick={() => onFilterChange('ALL')}
        className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 bg-white hover:shadow-md ${
          currentFilter === 'ALL'
            ? 'border-indigo-500 ring-2 ring-indigo-500/10'
            : 'border-slate-200/80 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Agents</span>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">
            {loading ? <span className="inline-block w-8 h-6 bg-slate-100 animate-pulse rounded" /> : total}
          </span>
          <span className="text-xs text-slate-500">Fleet wide</span>
        </div>
      </div>

      {/* Active Agents */}
      <div
        onClick={() => onFilterChange('ACTIVE')}
        className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 bg-white hover:shadow-md ${
          currentFilter === 'ACTIVE'
            ? 'border-emerald-500 ring-2 ring-emerald-500/10'
            : 'border-slate-200/80 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active</span>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-600">
            {loading ? <span className="inline-block w-8 h-6 bg-slate-100 animate-pulse rounded" /> : active}
          </span>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
            {activePercent}% of fleet
          </span>
        </div>
      </div>

      {/* Inactive Agents */}
      <div
        onClick={() => onFilterChange('INACTIVE')}
        className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 bg-white hover:shadow-md ${
          currentFilter === 'INACTIVE'
            ? 'border-amber-500 ring-2 ring-amber-500/10'
            : 'border-slate-200/80 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Inactive</span>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <UserX className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-600">
            {loading ? <span className="inline-block w-8 h-6 bg-slate-100 animate-pulse rounded" /> : inactive}
          </span>
          <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
            {inactivePercent}% offline
          </span>
        </div>
      </div>

      {/* Recently Added */}
      <div className="p-4 rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">New (Last 7d)</span>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-purple-600">
            {loading ? <span className="inline-block w-8 h-6 bg-slate-100 animate-pulse rounded" /> : recentlyAdded}
          </span>
          <span className="text-xs text-slate-500">Onboarded</span>
        </div>
      </div>
    </div>
  );
}
