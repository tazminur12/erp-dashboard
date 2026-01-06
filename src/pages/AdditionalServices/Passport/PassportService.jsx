import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, FileCheck, Phone, Mail, Calendar, Loader2, Filter } from 'lucide-react';
import { usePassportServices, useDeletePassportService } from '../../../hooks/usePassportServiceQueries';
import Swal from 'sweetalert2';

const PassportService = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch passport services
  const { data, isLoading, error } = usePassportServices({
    page,
    limit,
    q: search,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const services = data?.services || [];
  const pagination = data?.pagination || {};

  // Delete mutation
  const deleteMutation = useDeletePassportService();

  const handleDelete = (service) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `এই পাসপোর্ট সার্ভিস কে মুছে ফেলতে চান?`,
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
    navigate(`/additional-services/passport-service/${id}`);
  };

  const handleEdit = (service) => {
    const id = service._id || service.id;
    navigate(`/additional-services/passport-service/edit/${id}`);
  };

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
        <title>Passport Service - Additional Services</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">পাসপোর্ট সার্ভিস</h1>
              <p className="text-gray-600 mt-2">পাসপোর্ট সার্ভিস এবং আবেদন ব্যবস্থাপনা করুন</p>
            </div>
            <button
              onClick={() => navigate('/additional-services/passport-service/add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              পাসপোর্ট সার্ভিস যোগ করুন
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">মোট সার্ভিস</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">বিচারাধীন</p>
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
                  {services.filter(s => s.status === 'in_process').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">সম্পন্ন</p>
                <p className="text-2xl font-bold text-green-600">
                  {services.filter(s => s.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FileCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="পাসপোর্ট সার্ভিস খুঁজুন..."
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
                <option value="pending">বিচারাধীন</option>
                <option value="in_process">প্রক্রিয়াধীন</option>
                <option value="completed">সম্পন্ন</option>
                <option value="cancelled">বাতিল</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">পাসপোর্ট সার্ভিস লোড করতে সমস্যা হয়েছে</p>
            </div>
          ) : services.length === 0 ? (
            <div className="p-8 text-center">
              <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">কোন পাসপোর্ট সার্ভিস পাওয়া যায়নি</p>
              <button
                onClick={() => navigate('/additional-services/passport-service/add')}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                আপনার প্রথম পাসপোর্ট সার্ভিস যোগ করুন
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">ক্লায়েন্টের নাম</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">পাসপোর্ট নম্বর</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">সার্ভিসের ধরন</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">যোগাযোগ</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">স্ট্যাটাস</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">তারিখ</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">কর্ম</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {services.map((service) => (
                      <tr key={service._id || service.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{service.clientName || service.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">ID: {service.serviceId || service.id || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900">{service.passportNumber || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {service.serviceType === 'new_passport' ? 'নতুন পাসপোর্ট' : 
                             service.serviceType === 'renewal' ? 'পাসপোর্ট নবায়ন' :
                             service.serviceType === 'replacement' ? 'পাসপোর্ট প্রতিস্থাপন' :
                             service.serviceType === 'visa_stamping' ? 'ভিসা স্ট্যাম্পিং' :
                             service.serviceType || 'স্ট্যান্ডার্ড'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {service.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                {service.phone}
                              </div>
                            )}
                            {service.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                {service.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              service.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : service.status === 'in_process'
                                ? 'bg-blue-100 text-blue-800'
                                : service.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {service.status === 'pending' ? 'বিচারাধীন' :
                             service.status === 'in_process' ? 'প্রক্রিয়াধীন' :
                             service.status === 'completed' ? 'সম্পন্ন' :
                             service.status === 'cancelled' ? 'বাতিল' :
                             service.status || 'বিচারাধীন'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {service.date ? new Date(service.date).toLocaleDateString() : 'N/A'}
                          </div>
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
                              title="সার্ভিস সম্পাদনা করুন"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(service)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="সার্ভিস মুছুন"
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
                    {((pagination.page - 1) * pagination.limit) + 1} থেকে{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} দেখানো হচ্ছে, মোট{' '}
                    {pagination.total} টি সার্ভিস
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
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          pageNum === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
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

export default PassportService;

