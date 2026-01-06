import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Globe, Search, CheckCircle } from 'lucide-react';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useVendors } from '../../hooks/useVendorQueries';
import Swal from 'sweetalert2';

const AddVisaProcessing = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    applicantName: '',
    country: '',
    visaType: 'tourist',
    passportNumber: '',
    phone: '',
    email: '',
    address: '',
    appliedDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    vendorId: '',
    vendorName: '',
    vendorBill: '',
    othersBill: '',
    totalBill: '',
    status: 'pending',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Client search states
  const [clientQuery, setClientQuery] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Vendor search states
  const [vendorQuery, setVendorQuery] = useState('');
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const { data: vendorsData = [], isLoading: vendorsLoading } = useVendors();

  // Debounced client search - Additional Services customers
  useEffect(() => {
    const q = clientQuery.trim();
    if (!q || q.length < 2) {
      setClientResults([]);
      return;
    }

    let active = true;
    setClientLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await axiosSecure.get('/api/other/customers', { 
          params: { 
            q: q,
            page: 1,
            limit: 20,
            status: 'active'
          } 
        });
        const data = res?.data;
        
        let list = [];
        if (data?.success && Array.isArray(data.data)) {
          list = data.data;
        } else if (Array.isArray(data?.customers)) {
          list = data.customers;
        } else if (Array.isArray(data)) {
          list = data;
        }

        // Additional filtering if backend doesn't filter properly
        const normalizedQ = q.toLowerCase();
        const filtered = list.filter((c) => {
          const id = String(c.id || c.customerId || c._id || '').toLowerCase();
          const name = String(c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '').toLowerCase();
          const phone = String(c.phone || c.mobile || '');
          const email = String(c.email || '').toLowerCase();
          return (
            id.includes(normalizedQ) ||
            name.includes(normalizedQ) ||
            phone.includes(q) ||
            email.includes(normalizedQ)
          );
        });

        if (active) setClientResults(filtered.slice(0, 10));
      } catch (err) {
        if (active) setClientResults([]);
      } finally {
        if (active) setClientLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [clientQuery, axiosSecure]);

  // Filter vendors based on search query
  const filteredVendors = useMemo(() => {
    if (!vendorQuery.trim()) return vendorsData;
    const q = vendorQuery.toLowerCase();
    return vendorsData.filter((v) => {
      const tradeName = String(v.tradeName || '').toLowerCase();
      const ownerName = String(v.ownerName || '').toLowerCase();
      const contactNo = String(v.contactNo || '');
      return (
        tradeName.includes(q) ||
        ownerName.includes(q) ||
        contactNo.includes(vendorQuery)
      );
    });
  }, [vendorQuery, vendorsData]);

  // Calculate total bill
  useEffect(() => {
    const vendorBill = parseFloat(formData.vendorBill) || 0;
    const othersBill = parseFloat(formData.othersBill) || 0;
    setFormData(prev => ({
      ...prev,
      totalBill: (vendorBill + othersBill).toFixed(2)
    }));
  }, [formData.vendorBill, formData.othersBill]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectClient = (client) => {
    const clientName = client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || '';
    setFormData(prev => ({
      ...prev,
      clientId: client.id || client.customerId || client._id,
      clientName: clientName,
      applicantName: clientName,
      phone: client.phone || client.mobile || '',
      email: client.email || '',
      address: client.address || '',
    }));
    setClientQuery(clientName);
    setShowClientDropdown(false);
    setErrors(prev => ({ ...prev, clientName: '' }));
  };

  const handleSelectVendor = (vendor) => {
    setFormData(prev => ({
      ...prev,
      vendorId: vendor._id || vendor.vendorId,
      vendorName: vendor.tradeName || vendor.ownerName || '',
    }));
    setVendorQuery(vendor.tradeName || vendor.ownerName || '');
    setShowVendorDropdown(false);
    setErrors(prev => ({ ...prev, vendorId: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.appliedDate) {
      newErrors.appliedDate = 'Applied date is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: response } = await axiosSecure.post('/api/visa-processing-services', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visaProcessingServices'] });
      Swal.fire({
        title: 'সফল!',
        text: 'ভিসা প্রসেসিং সার্ভিস সফলভাবে যোগ করা হয়েছে',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
      });
      navigate('/additional-services/visa-processing');
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || 'ভিসা প্রসেসিং সার্ভিস যোগ করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        vendorBill: formData.vendorBill ? Number(formData.vendorBill) : 0,
        othersBill: formData.othersBill ? Number(formData.othersBill) : 0,
        totalBill: formData.totalBill ? Number(formData.totalBill) : 0,
        date: formData.appliedDate,
      };
      await createMutation.mutateAsync(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Helmet>
        <title>Add Visa Processing - Additional Services</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/additional-services/visa-processing')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Visa Processing
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Visa Processing</h1>
              <p className="text-gray-600 mt-2">Fill in the visa processing information below</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name - Searchable */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={clientQuery}
                    onChange={(e) => {
                      setClientQuery(e.target.value);
                      setShowClientDropdown(true);
                      if (!e.target.value) {
                        setFormData(prev => ({
                          ...prev,
                          clientId: '',
                          clientName: '',
                          applicantName: '',
                          phone: '',
                          email: '',
                          address: '',
                        }));
                      }
                    }}
                    onFocus={() => {
                      if (clientResults.length > 0 || clientQuery.length >= 2) {
                        setShowClientDropdown(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowClientDropdown(false), 200);
                    }}
                    placeholder="Search client by name, ID, phone, or email..."
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.clientName ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {showClientDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {clientLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
                      ) : clientResults.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No clients found</div>
                      ) : (
                        clientResults.map((c) => {
                          const clientName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'N/A';
                          return (
                            <button
                              key={String(c.id || c.customerId || c._id)}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSelectClient(c)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{clientName}</div>
                                  <div className="text-xs text-gray-500">ID: {c.id || c.customerId || c._id}</div>
                                </div>
                                <div className="text-sm text-gray-600">{c.phone || c.mobile}</div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
                {formData.clientName && (
                  <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Selected: {formData.clientName}
                  </div>
                )}
                {errors.clientName && <p className="mt-1 text-xs text-red-600">{errors.clientName}</p>}
              </div>

              {/* Address - Auto filled */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Address (auto-filled from client)"
                />
              </div>

              {/* Number - Auto filled */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number <span className="text-red-500">*</span>
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

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g. USA, UK, Canada"
                  required
                />
                {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country}</p>}
              </div>

              {/* Visa Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
                <select
                  name="visaType"
                  value={formData.visaType}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tourist">Tourist</option>
                  <option value="business">Business</option>
                  <option value="student">Student</option>
                  <option value="work">Work</option>
                  <option value="transit">Transit</option>
                  <option value="medical">Medical</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Passport Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. BN0123456"
                />
              </div>

              {/* Applied Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applied Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="appliedDate"
                  value={formData.appliedDate}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.appliedDate ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {errors.appliedDate && <p className="mt-1 text-xs text-red-600">{errors.appliedDate}</p>}
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  name="expectedDeliveryDate"
                  value={formData.expectedDeliveryDate}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Select Vendor */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={vendorQuery}
                    onChange={(e) => {
                      setVendorQuery(e.target.value);
                      setShowVendorDropdown(true);
                      if (!e.target.value) {
                        setFormData(prev => ({
                          ...prev,
                          vendorId: '',
                          vendorName: '',
                        }));
                      }
                    }}
                    onFocus={() => setShowVendorDropdown(true)}
                    onBlur={() => setTimeout(() => setShowVendorDropdown(false), 200)}
                    placeholder="Search vendor by name or contact..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {vendorsLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    </div>
                  )}
                  {showVendorDropdown && !vendorsLoading && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredVendors.length > 0 ? (
                        filteredVendors.map((vendor) => (
                          <button
                            key={vendor._id || vendor.vendorId}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelectVendor(vendor)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{vendor.tradeName || vendor.ownerName}</div>
                            <div className="text-xs text-gray-500">{vendor.contactNo}</div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No vendors found</div>
                      )}
                    </div>
                  )}
                </div>
                {formData.vendorName && (
                  <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Selected: {formData.vendorName}
                  </div>
                )}
              </div>

              {/* Vendor Bill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Bill (BDT)</label>
                <input
                  type="number"
                  name="vendorBill"
                  value={formData.vendorBill}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Other's Bill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other's Bill (BDT)</label>
                <input
                  type="number"
                  name="othersBill"
                  value={formData.othersBill}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Total Bill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Bill (BDT)</label>
                <input
                  type="number"
                  name="totalBill"
                  value={formData.totalBill}
                  readOnly
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:outline-none"
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
                  <option value="processing">Processing</option>
                  <option value="in_process">In Process</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
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
                placeholder="Additional notes about the visa processing"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/additional-services/visa-processing')}
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
                    Save Visa Processing
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

export default AddVisaProcessing;

