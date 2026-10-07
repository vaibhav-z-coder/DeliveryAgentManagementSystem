'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, CheckCircle, AlertCircle, Car, Shield } from 'lucide-react';
import { Agent, AgentFormData, AgentStatus } from '../types/agent';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AgentFormData) => Promise<void>;
  initialData?: Agent | null;
  mode: 'create' | 'edit';
}

export function AgentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: AgentModalProps) {
  const [formData, setFormData] = useState<AgentFormData>({
    fullName: '',
    phone: '',
    email: '',
    serviceArea: '',
    status: 'ACTIVE',
    vehicleType: '',
    vehicleNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        fullName: initialData.fullName,
        phone: initialData.phone,
        email: initialData.email,
        serviceArea: initialData.serviceArea,
        status: initialData.status,
        vehicleType: initialData.vehicleType || '',
        vehicleNumber: initialData.vehicleNumber || '',
      });
    } else {
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        serviceArea: '',
        status: 'ACTIVE',
        vehicleType: '',
        vehicleNumber: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
          return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/.test(value.trim()))
          return 'Please enter a valid phone number (min 7 digits)';
        return '';
      case 'serviceArea':
        if (!value.trim()) return 'Service area is required';
        if (value.trim().length < 2) return 'Service area must be at least 2 characters';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, (formData as any)[field] || '');
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {
      fullName: validateField('fullName', formData.fullName),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      serviceArea: validateField('serviceArea', formData.serviceArea),
    };

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      serviceArea: true,
    });

    const hasErrors = Object.values(newErrors).some((err) => err !== '');
    if (hasErrors) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      // Handled by parent toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'create' ? 'Add Delivery Agent' : 'Edit Delivery Agent'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'create'
                ? 'Register a new delivery agent to your fleet'
                : `Update profile and status for ${initialData?.fullName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="fullName"
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={() => handleBlur('fullName')}
                className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl border focus:outline-none transition ${
                  touched.fullName && errors.fullName
                    ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                    : touched.fullName && !errors.fullName
                    ? 'border-emerald-300 focus:border-emerald-500 bg-emerald-50/10'
                    : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
              {touched.fullName && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {errors.fullName ? (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
              )}
            </div>
            {touched.fullName && errors.fullName && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email Address & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl border focus:outline-none transition ${
                    touched.email && errors.email
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                      : touched.email && !errors.email
                      ? 'border-emerald-300 focus:border-emerald-500 bg-emerald-50/10'
                      : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
                {touched.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {errors.email ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                )}
              </div>
              {touched.email && errors.email && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phone')}
                  className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl border focus:outline-none transition ${
                    touched.phone && errors.phone
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                      : touched.phone && !errors.phone
                      ? 'border-emerald-300 focus:border-emerald-500 bg-emerald-50/10'
                      : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
                {touched.phone && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {errors.phone ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                )}
              </div>
              {touched.phone && errors.phone && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Service Area & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Area <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="serviceArea"
                  placeholder="e.g. Indiranagar, Bangalore"
                  value={formData.serviceArea}
                  onChange={handleChange}
                  onBlur={() => handleBlur('serviceArea')}
                  className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl border focus:outline-none transition ${
                    touched.serviceArea && errors.serviceArea
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                      : touched.serviceArea && !errors.serviceArea
                      ? 'border-emerald-300 focus:border-emerald-500 bg-emerald-50/10'
                      : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
                {touched.serviceArea && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {errors.serviceArea ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                )}
              </div>
              {touched.serviceArea && errors.serviceArea && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.serviceArea}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Agent Status <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Shield className="w-4 h-4" />
                </div>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none bg-white transition"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vehicle Optional Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Vehicle Type (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Car className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="vehicleType"
                  placeholder="e.g. Electric Scooter"
                  value={formData.vehicleType || ''}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Vehicle Number (Optional)
              </label>
              <input
                type="text"
                name="vehicleNumber"
                placeholder="e.g. KA-01-AB-1234"
                value={formData.vehicleNumber || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none uppercase transition"
              />
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50 shadow-sm shadow-indigo-600/30"
            >
              {isSubmitting
                ? mode === 'create'
                  ? 'Creating agent...'
                  : 'Updating agent...'
                : mode === 'create'
                ? 'Create Delivery Agent'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
