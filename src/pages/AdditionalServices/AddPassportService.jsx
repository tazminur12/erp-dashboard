import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, FileCheck } from 'lucide-react';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';

const AddPassportService = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    clientName: '',
    passportNumber: '',
    serviceType: 'new_passport',
    phone: '',
    email: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: '',
    amount: '',
    paidAmount: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: response } = await axiosSecure.post('/api/passport-services', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passportServices'] });
      Swal.fire({
        title: 'সফল!',
        text: 'পাসপোর্ট সার্ভিস সফলভাবে যোগ করা হয়েছে',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
      });
      navigate('/additional-services/passport-service');
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || 'পাসপোর্ট সার্ভিস যোগ করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
      });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    if (!formData.passportNumber.trim()) {
      newErrors.passportNumber = 'Passport number is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: formData.amount ? Number(formData.amount) : 0,
        paidAmount: formData.paidAmount ? Number(formData.paidAmount) : 0,
      };
      await createMutation.mutateAsync(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Helmet>
        <title>Add Passport Service - Additional Services</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/additional-services/passport-service')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Passport Service
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Passport Service</h1>
              <p className="text-gray-600 mt-2">Fill in the passport service information below</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.clientName ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter client name"
                  required
                />
                {errors.clientName && <p className="mt-1 text-xs text-red-600">{errors.clientName}</p>}
              </div>

              {/* Passport Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.passportNumber ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g. BN0123456"
                  required
                />
                {errors.passportNumber && <p className="mt-1 text-xs text-red-600">{errors.passportNumber}</p>}
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="new_passport">New Passport</option>
                  <option value="renewal">Passport Renewal</option>
                  <option value="replacement">Passport Replacement</option>
                  <option value="visa_stamping">Visa Stamping</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="+8801XXXXXXXXX"
                  required
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="client@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (BDT)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount (BDT)</label>
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_process">In Process</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full address"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes about the passport service"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/additional-services/passport-service')}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || createMutation.isPending}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {(isSubmitting || createMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Passport Service
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPassportService;

