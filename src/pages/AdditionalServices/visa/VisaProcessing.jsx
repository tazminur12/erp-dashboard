import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, FileText, Phone, Mail, Calendar, Loader2, Globe } from 'lucide-react';
import Swal from 'sweetalert2';
import { useVisaProcessingServices, useDeleteVisaProcessingService } from '../../../hooks/useVisaProcessingQueries';

const VisaProcessing = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  // Fetch visa processing services using custom hook
  const { data, isLoading, error } = useVisaProcessingServices({
    page,
    limit,
    q: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    country: countryFilter !== 'all' ? countryFilter : undefined,
  });

  const services = data?.services || [];
  const pagination = data?.pagination || {
    page: 1,
    pages: 1,
    total: 0,
    limit: 20
  };

  // Delete mutation using custom hook
  const deleteMutation = useDeleteVisaProcessingService();

  const handleDelete = (service) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `এই ভিসা প্রসেসিং সার্ভিস কে মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল করুন'
    }).then((result) => {
      if (result.isConfirmed) {
        const id = service._id || service.id;
        deleteMutation.mutate(id);
      }
    });
  };

  const handleView = (service) => {
    const id = service._id || service.id;
    navigate(`/additional-services/visa-processing/${id}`);
  };

  const handleEdit = (service) => {
    const id = service._id || service.id;
    navigate(`/additional-services/visa-processing/edit/${id}`);
  };

  // Get unique countries from services
  const countries = Array.from(new Set(services.map(s => s.country).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Helmet>
        <title>ভিসা প্রসেসিং - অতিরিক্ত সেবা</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ভিসা প্রসেসিং</h1>
              <p className="text-gray-600 mt-2">ভিসা প্রসেসিং সেবা এবং আবেদন ব্যবস্থাপনা করুন</p>
            </div>
            <button
              onClick={() => navigate('/additional-services/visa-processing/add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              ভিসা প্রসেসিং যোগ করুন
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">মোট আবেদন</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">পেন্ডিং</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {services.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">প্রক্রিয়াধীন</p>
                <p className="text-2xl font-bold text-blue-600">
                  {services.filter(s => s.status === 'in_process' || s.status === 'processing').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">অনুমোদিত</p>
                <p className="text-2xl font-bold text-green-600">
                  {services.filter(s => s.status === 'approved' || s.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ভিসা আবেদন খুঁজুন..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="in_process">In Process</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <select
                value={countryFilter}
                onChange={(e) => {
                  setCountryFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">সব দেশ</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">ভিসা প্রসেসিং সেবা লোড করতে সমস্যা হয়েছে</p>
            </div>
          ) : services.length === 0 ? (
            <div className="p-8 text-center">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">কোন ভিসা প্রসেসিং সেবা পাওয়া যায়নি</p>
              <button
                onClick={() => navigate('/additional-services/visa-processing/add')}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                আপনার প্রথম ভিসা প্রসেসিং সেবা যোগ করুন
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">আবেদনকারীর নাম</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">দেশ</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">ভিসার ধরন</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">যোগাযোগ</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">স্ট্যাটাস</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">বিলের পরিমাণ</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">পরিশোধিত</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">বকেয়া</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">কার্যক্রম</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {services.map((service) => (
                      <tr key={service._id || service.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{service.applicantName || service.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                              ID: {service.applicationId || service.id || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                              {service.country || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                            {service.visaType || service.serviceType || 'Tourist'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {service.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                                <Phone className="w-4 h-4" />
                                {service.phone}
                              </div>
                            )}
                            {service.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                                <Mail className="w-4 h-4" />
                                {service.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-english ${
                              service.status === 'approved' || service.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : service.status === 'processing' || service.status === 'in_process'
                                ? 'bg-blue-100 text-blue-800'
                                : service.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                            style={{ fontFamily: "'Google Sans', sans-serif" }}
                          >
                            {service.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 font-medium">
                            ৳{service.totalAmount ? service.totalAmount.toLocaleString('bn-BD') : '০'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-green-600 font-medium">
                            ৳{service.paidAmount ? service.paidAmount.toLocaleString('bn-BD') : '০'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-red-600 font-medium">
                            ৳{service.dueAmount ? service.dueAmount.toLocaleString('bn-BD') : '০'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(service)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="বিস্তারিত দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(service)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="সম্পাদনা করুন"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(service)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-gray-600">
                    দেখানো হচ্ছে {((pagination.page - 1) * pagination.limit) + 1} থেকে{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} পর্যন্ত, মোট{' '}
                    {pagination.total} টি আবেদন
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      পূর্ববর্তী
                    </button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors font-english ${
                          pageNum === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                        style={{ fontFamily: "'Google Sans', sans-serif" }}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      পরবর্তী
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisaProcessing;
