'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Car,
  Copy,
  Check,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Agent } from '../types/agent';

interface AgentDetailModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export function AgentDetailModal({
  agent,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: AgentDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !agent) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(agent.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedCreated = new Date(agent.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const formattedUpdated = new Date(agent.updatedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold uppercase shadow-inner">
              {agent.fullName.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{agent.fullName}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    agent.status === 'ACTIVE'
                      ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                      : 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                  }`}
                >
                  {agent.status}
                </span>
              </div>
              <p className="text-xs text-indigo-100 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {agent.serviceArea}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* UUID Badge */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Agent ID (UUID)</span>
              <span className="font-mono text-xs text-slate-700 font-medium select-all">{agent.id}</span>
            </div>
            <button
              onClick={handleCopyId}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition"
              title="Copy ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                Email Address
              </span>
              <p className="text-xs font-medium text-slate-900 break-all">{agent.email}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                Phone Number
              </span>
              <p className="text-xs font-medium text-slate-900">{agent.phone}</p>
            </div>
          </div>

          {/* Vehicle Info */}
          {(agent.vehicleType || agent.vehicleNumber) && (
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Car className="w-3.5 h-3.5 text-purple-500" />
                Assigned Vehicle
              </span>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-slate-700 font-medium">{agent.vehicleType || 'Not specified'}</span>
                {agent.vehicleNumber && (
                  <span className="font-mono font-semibold px-2 py-0.5 bg-white rounded border border-slate-200 text-slate-800">
                    {agent.vehicleNumber}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Metadata Timestamps */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Created: {formattedCreated}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Updated: {formattedUpdated}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onDelete(agent);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Agent
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(agent);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
