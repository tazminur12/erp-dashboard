import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import useOtherCustomerQueries from '../../hooks/useOtherCustomerQueries';

const EditCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { useOtherCustomer, useUpdateOtherCustomer } = useOtherCustomerQueries();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    status: 'active',
    notes: '',
  });

  // Automatically generate full name from first and last name
  const fullName = useMemo(() => {
    const first = (formData.firstName || '').trim();
    const last = (formData.lastName || '').trim();
    return `${first} ${last}`.trim();
  }, [formData.firstName, formData.lastName]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch customer data
  const { data: customerData, isLoading, error: fetchError } = useOtherCustomer(id);
  const updateMutation = useUpdateOtherCustomer();

  // Load customer data into form when fetched
  useEffect(() => {
    if (customerData) {
      // If customer has firstName and lastName, use them
      // Otherwise, try to split the name field
      let firstName = customerData.firstName || '';
      let lastName = customerData.lastName || '';

      if (!firstName && !lastName && customerData.name) {
        const nameParts = customerData.name.trim().split(' ');
        if (nameParts.length > 1) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else {
          firstName = customerData.name;
          lastName = '';
        }
      }

      setFormData({
        firstName: firstName || '',
        lastName: lastName || '',
        phone: customerData.phone || '',
        email: customerData.email || '',
        address: customerData.address || '',
        city: customerData.city || '',
        country: customerData.country || '',
        status: customerData.status || customerData.isActive !== false ? 'active' : 'inactive',
        notes: customerData.notes || '',
      });
    }
  }, [customerData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Combine firstName and lastName into name for API
      const payload = {
        ...formData,
        name: fullName,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };
      await updateMutation.mutateAsync({ id, ...payload });
      navigate('/additional-services/customer-list');
    } catch (error) {
      // Error is already handled by the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading customer data</p>
              <button
                onClick={() => navigate('/additional-services/customer-list')}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Back to Customer List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Helmet>
        <title>Edit Customer - Additional Services</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/additional-services/customer-list')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Customer List
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
          <p className="text-gray-600 mt-2">Update the customer information below</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name (প্রথম নাম) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter first name"
                  required
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name (শেষ নাম) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter last name"
                  required
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
              </div>

              {/* Full Name (Auto-generated, Read-only) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name (পূর্ণ নাম) <span className="text-xs text-gray-500">(Auto-generated)</span>
                </label>
                <input
                  type="text"
                  value={fullName || 'Full name will appear here...'}
                  readOnly
                  disabled
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600 cursor-not-allowed"
                />
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
                  placeholder="customer@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter country"
                />
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
                placeholder="Additional notes about the customer"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/additional-services/customer-list')}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || updateMutation.isPending}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {(isSubmitting || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Customer
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

export default EditCustomer;

