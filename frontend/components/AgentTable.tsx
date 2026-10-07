'use client';

import React from 'react';
import { Eye, Edit2, Trash2, MapPin, Phone, Mail, ToggleLeft, ToggleRight, UserPlus } from 'lucide-react';
import { Agent } from '../types/agent';

interface AgentTableProps {
  agents: Agent[];
  onView: (agent: Agent) => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onToggleStatus: (agent: Agent) => void;
  onAddNew: () => void;
}

export function AgentTable({
  agents,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddNew,
}: AgentTableProps) {
  if (agents.length === 0) {
    return (
      <div className="py-16 px-4 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
          <UserPlus className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No delivery agents found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
          There are no agents matching your current search or filter criteria. Start by registering your first delivery agent.
        </p>
        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/30"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Delivery Agent</span>
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600">
        <thead className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="py-3.5 px-6">Delivery Agent</th>
            <th className="py-3.5 px-4">Contact</th>
            <th className="py-3.5 px-4">Service Area</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 hidden lg:table-cell">Registered</th>
            <th className="py-3.5 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {agents.map((agent) => {
            const initials = agent.fullName
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            const createdDate = new Date(agent.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            const isActive = agent.status === 'ACTIVE';

            return (
              <tr
                key={agent.id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                {/* Agent Name & Email */}
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200/80 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 group-hover:border-indigo-200 transition">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <button
                        onClick={() => onView(agent)}
                        className="font-semibold text-slate-900 hover:text-indigo-600 text-left transition truncate block"
                      >
                        {agent.fullName}
                      </button>
                      <span className="text-[11px] text-slate-400 font-mono truncate block flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {agent.email}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{agent.phone}</span>
                  </div>
                </td>

                {/* Service Area */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-slate-600 max-w-xs truncate">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">{agent.serviceArea}</span>
                  </div>
                </td>

                {/* Status Badge & Toggle */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          isActive ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {agent.status}
                    </span>

                    <button
                      onClick={() => onToggleStatus(agent)}
                      className="text-slate-400 hover:text-indigo-600 transition p-0.5"
                      title={isActive ? 'Deactivate agent' : 'Activate agent'}
                    >
                      {isActive ? (
                        <ToggleRight className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </td>

                {/* Created At */}
                <td className="py-3.5 px-4 hidden lg:table-cell text-slate-400 font-mono text-[11px]">
                  {createdDate}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-6 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(agent)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(agent)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Edit Agent"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(agent)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Agent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
