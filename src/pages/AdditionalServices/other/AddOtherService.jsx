import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Package, Search, CheckCircle } from 'lucide-react';
import useAxiosSecure from '../../../hooks/UseAxiosSecure';
import { useVendors } from '../../../hooks/useVendorQueries';
import { useCreateOtherService } from '../../../hooks/useOtherServiceQueries';

const AddOtherService = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    serviceType: 'general',
    description: '',
    phone: '',
    email: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    vendorId: '',
    vendorName: '',
    vendorBill: '',
    othersBill: '',
    serviceCharge: '',
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
            limit: 20
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
    const serviceCharge = parseFloat(formData.serviceCharge) || 0;
    const total = vendorBill + othersBill + serviceCharge;
    setFormData(prev => ({
      ...prev,
      totalBill: total.toFixed(2)
    }));
  }, [formData.vendorBill, formData.othersBill, formData.serviceCharge]);

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
      newErrors.clientName = 'নাম প্রয়োজন';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'নম্বর প্রয়োজন';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'ইমেইল ফরম্যাট সঠিক নয়';
    }
    if (!formData.date) {
      newErrors.date = 'তারিখ প্রয়োজন';
    }
    if (!formData.serviceType) {
      newErrors.serviceType = 'সার্ভিসের ধরন প্রয়োজন';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useCreateOtherService();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Map frontend field names to backend field names
      const payload = {
        clientId: formData.clientId,
        clientName: formData.clientName,
        serviceType: formData.serviceType,
        serviceDate: formData.date, // Backend expects 'serviceDate'
        date: formData.date, // Also send 'date' for compatibility
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        status: formData.status,
        vendorId: formData.vendorId,
        vendorName: formData.vendorName,
        serviceFee: formData.serviceCharge ? Number(formData.serviceCharge) : 0, // Backend: serviceFee
        vendorCost: formData.vendorBill ? Number(formData.vendorBill) : 0, // Backend: vendorCost
        otherCost: formData.othersBill ? Number(formData.othersBill) : 0, // Backend: otherCost
        totalAmount: formData.totalBill ? Number(formData.totalBill) : 0, // Backend: totalAmount
        deliveryDate: formData.expectedDeliveryDate || null,
        notes: formData.notes,
      };
      await createMutation.mutateAsync(payload);
      navigate('/additional-services/others-service');
    } catch (error) {
      // Error is already handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Helmet>
        <title>Add Other Service - Additional Services</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/additional-services/others-service')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            অন্যান্য সার্ভিসে ফিরে যান
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">নতুন অন্যান্য সার্ভিস যোগ করুন</h1>
              <p className="text-gray-600 mt-2">নিচে অন্যান্য সার্ভিসের তথ্য পূরণ করুন</p>
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
                  নাম <span className="text-red-500">*</span>
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
                    placeholder="নাম, ID (OSC-0001), ফোন, বা ইমেইল দিয়ে ক্লায়েন্ট খুঁজুন..."
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.clientName ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {showClientDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {clientLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-500">খুঁজছি...</div>
                      ) : clientResults.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">কোন ক্লায়েন্ট পাওয়া যায়নি</div>
                      ) : (
                        clientResults.map((c) => {
                          const clientName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'N/A';
                          const customerId = c.customerId || c.id || c._id;
                          return (
                            <button
                              key={String(customerId)}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSelectClient(c)}
                              className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                      {customerId}
                                    </span>
                                  </div>
                                  <div className="text-sm font-medium text-gray-900 truncate">{clientName}</div>
                                </div>
                                <div className="text-sm text-gray-600 flex-shrink-0">{c.phone || c.mobile}</div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
                {formData.clientName && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>নির্বাচিত: {formData.clientName}</span>
                    </div>
                    {formData.clientId && (
                      <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {formData.clientId}
                      </span>
                    )}
                  </div>
                )}
                {errors.clientName && <p className="mt-1 text-xs text-red-600">{errors.clientName}</p>}
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  সার্ভিসের ধরন <span className="text-red-500">*</span>
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.serviceType ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="general">General Service</option>
                  <option value="consultation">Consultation</option>
                  <option value="documentation">Documentation</option>
                  <option value="translation">Translation</option>
                  <option value="attestation">Attestation</option>
                  <option value="medical">Medical Test</option>
                  <option value="training">Training</option>
                  <option value="other">Other</option>
                </select>
                {errors.serviceType && <p className="mt-1 text-xs text-red-600">{errors.serviceType}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  তারিখ <span className="text-red-500">*</span>
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

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">বিস্তারিত বর্ণনা</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="সার্ভিসের বিস্তারিত বর্ণনা লিখুন..."
                />
              </div>

              {/* Address - Auto filled */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ঠিকানা (ক্লায়েন্ট থেকে স্বয়ংক্রিয়ভাবে পূরণ)"
                />
              </div>

              {/* Number - Auto filled */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  নম্বর <span className="text-red-500">*</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
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

              {/* Expected Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রত্যাশিত ডেলিভারি তারিখ</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">ভেন্ডর নির্বাচন করুন</label>
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
                    placeholder="নাম বা যোগাযোগ দিয়ে ভেন্ডর খুঁজুন..."
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
                        <div className="px-3 py-2 text-sm text-gray-500">কোন ভেন্ডর পাওয়া যায়নি</div>
                      )}
                    </div>
                  )}
                </div>
                {formData.vendorName && (
                  <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    নির্বাচিত: {formData.vendorName}
                  </div>
                )}
              </div>

              {/* Vendor Bill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ভেন্ডর বিল (BDT)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">অন্যান্য বিল (BDT)</label>
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

              {/* Service Charge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">সার্ভিস চার্জ (BDT)</label>
                <input
                  type="number"
                  name="serviceCharge"
                  value={formData.serviceCharge}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Total Bill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">মোট বিল (BDT)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">পেন্ডিং</option>
                  <option value="in_process">প্রক্রিয়াধীন</option>
                  <option value="processing">প্রসেসিং</option>
                  <option value="completed">সম্পন্ন</option>
                  <option value="cancelled">বাতিল</option>
                  <option value="on_hold">হোল্ডে আছে</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="অন্যান্য সার্ভিস সম্পর্কে অতিরিক্ত নোট"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/additional-services/others-service')}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting || createMutation.isPending}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {(isSubmitting || createMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    সংরক্ষণ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    অন্যান্য সার্ভিস সংরক্ষণ করুন
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

export default AddOtherService;
