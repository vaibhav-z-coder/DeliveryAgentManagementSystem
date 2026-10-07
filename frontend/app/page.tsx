'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';
import { Header } from '../components/Header';
import { StatsOverview } from '../components/StatsOverview';
import { AgentTable } from '../components/AgentTable';
import { AgentModal } from '../components/AgentModal';
import { AgentDetailModal } from '../components/AgentDetailModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Pagination } from '../components/Pagination';
import { SkeletonTable } from '../components/SkeletonTable';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { agentApi, ApiError } from '../lib/api';
import { Agent, AgentFormData, DashboardStats, PaginationMeta } from '../types/agent';

export default function DashboardPage() {
  // State
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Query filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'fullName' | 'serviceArea'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Loading & Cache status
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCached, setIsCached] = useState<boolean | undefined>(undefined);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Modals & Actions
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [viewAgent, setViewAgent] = useState<Agent | null>(null);
  const [deleteAgentTarget, setDeleteAgentTarget] = useState<Agent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((p) => ({ ...p, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch agents and stats
  const fetchData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setBackendError(null);

      try {
        const [agentsRes, statsRes] = await Promise.all([
          agentApi.getAgents({
            page: pagination.page,
            limit: pagination.limit,
            status: statusFilter,
            search: debouncedSearch,
            sortBy,
            sortOrder,
          }),
          agentApi.getStats(),
        ]);

        setAgents(agentsRes.data);
        setPagination(agentsRes.pagination);
        setIsCached(agentsRes.cached);
        setStats(statsRes.data);
      } catch (err: any) {
        setBackendError(err.message || 'Failed to load delivery agents');
        addToast('error', 'Network Connection Error', err.message);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [pagination.page, pagination.limit, statusFilter, debouncedSearch, sortBy, sortOrder]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleCreateOrUpdate = async (formData: AgentFormData) => {
    try {
      if (modalMode === 'create') {
        const created = await agentApi.createAgent(formData);
        addToast('success', 'Agent Registered', `${created.fullName} has been added to your fleet.`);
      } else if (selectedAgent) {
        const updated = await agentApi.updateAgent(selectedAgent.id, formData);
        addToast('success', 'Agent Updated', `${updated.fullName}'s profile was updated successfully.`);
      }
      setIsModalOpen(false);
      setSelectedAgent(null);
      await fetchData(true);
    } catch (err: any) {
      addToast('error', 'Save Failed', err.message);
      throw err;
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    const nextStatus = agent.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      // Optimistic update
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, status: nextStatus } : a))
      );
      await agentApi.updateStatus(agent.id, nextStatus);
      addToast(
        'info',
        'Status Changed',
        `${agent.fullName} is now marked as ${nextStatus}.`
      );
      await fetchData(true);
    } catch (err: any) {
      // Rollback on failure
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, status: agent.status } : a))
      );
      addToast('error', 'Failed to update status', err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAgentTarget) return;
    try {
      setIsDeleting(true);
      await agentApi.deleteAgent(deleteAgentTarget.id);
      addToast(
        'success',
        'Agent Removed',
        `${deleteAgentTarget.fullName} has been deleted permanently.`
      );
      setDeleteAgentTarget(null);
      await fetchData(true);
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Header */}
      <Header
        onAddAgent={() => {
          setModalMode('create');
          setSelectedAgent(null);
          setIsModalOpen(true);
        }}
        onRefresh={() => fetchData(true)}
        isRefreshing={isRefreshing}
        isCached={isCached}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Backend Error Banner */}
        {backendError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Service Disconnected</p>
                <p className="text-xs text-rose-700">{backendError}</p>
              </div>
            </div>
            <button
              onClick={() => fetchData(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-rose-200 rounded-lg hover:bg-rose-100 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Dashboard Title & Quick Stats */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fleet Overview</h2>
            <p className="text-xs text-slate-500">
              Live monitoring, status controls, and caching performance for your active delivery agents.
            </p>
          </div>

          <StatsOverview
            stats={stats}
            loading={loading && !stats}
            currentFilter={statusFilter}
            onFilterChange={(st) => {
              setStatusFilter(st);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          />
        </div>

        {/* Filter Bar & Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search by agent name, email, phone, or service area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Pills & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs">
                {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setPagination((p) => ({ ...p, page: 1 }));
                    }}
                    className={`px-3 py-1 rounded-lg font-medium text-xs transition ${
                      statusFilter === st
                        ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="fullName">Agent Name</option>
                  <option value="serviceArea">Service Area</option>
                </select>

                <button
                  onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                  className="p-1.5 text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                  title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Delivery Fleet Directory</h3>
              <p className="text-[11px] text-slate-500">
                Manage contact info, area assignments, and live availability
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {pagination.total} Total Registered
            </span>
          </div>

          {loading ? (
            <SkeletonTable />
          ) : (
            <AgentTable
              agents={agents}
              onView={(agent) => setViewAgent(agent)}
              onEdit={(agent) => {
                setSelectedAgent(agent);
                setModalMode('edit');
                setIsModalOpen(true);
              }}
              onDelete={(agent) => setDeleteAgentTarget(agent)}
              onToggleStatus={handleToggleStatus}
              onAddNew={() => {
                setModalMode('create');
                setSelectedAgent(null);
                setIsModalOpen(true);
              }}
            />
          )}

          {/* Pagination */}
          {!loading && agents.length > 0 && (
            <Pagination
              meta={pagination}
              onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
              onLimitChange={(l) => setPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            />
          )}
        </div>
      </main>

      {/* Add / Edit Agent Modal */}
      <AgentModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedAgent}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAgent(null);
        }}
        onSubmit={handleCreateOrUpdate}
      />

      {/* View Agent Details Modal */}
      <AgentDetailModal
        isOpen={!!viewAgent}
        agent={viewAgent}
        onClose={() => setViewAgent(null)}
        onEdit={(agent) => {
          setViewAgent(null);
          setSelectedAgent(agent);
          setModalMode('edit');
          setIsModalOpen(true);
        }}
        onDelete={(agent) => {
          setViewAgent(null);
          setDeleteAgentTarget(agent);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteAgentTarget}
        agent={deleteAgentTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteAgentTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
