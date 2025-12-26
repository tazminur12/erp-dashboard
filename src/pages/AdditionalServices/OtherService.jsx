import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Package, Phone, Mail, Calendar, Loader2, Filter } from 'lucide-react';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';

const OtherService = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');

  // Fetch other services
  const { data, isLoading, error } = useQuery({
    queryKey: ['otherServices', page, search, statusFilter, serviceTypeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (serviceTypeFilter !== 'all') params.append('serviceType', serviceTypeFilter);

      const { data } = await axiosSecure.get(`/api/other-services?${params.toString()}`);
      return {
        services: data?.services || data?.data || [],
        pagination: data?.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: limit
        }
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  const services = data?.services || [];
  const pagination = data?.pagination || {};

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosSecure.delete(`/api/other-services/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otherServices'] });
      Swal.fire({
        title: 'সফল!',
        text: 'অন্যান্য সার্ভিস সফলভাবে মুছে ফেলা হয়েছে',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error?.response?.data?.message || 'অন্যান্য সার্ভিস মুছতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
      });
    },
  });

  const handleDelete = (service) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `এই সার্ভিস কে মুছে ফেলতে চান?`,
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
    navigate(`/additional-services/others-service/${id}`);
  };

  const handleEdit = (service) => {
    const id = service._id || service.id;
    navigate(`/additional-services/others-service/edit/${id}`);
  };

  // Get unique service types from services
  const serviceTypes = Array.from(new Set(services.map(s => s.serviceType).filter(Boolean)));

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
        <title>Other Services - Additional Services</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Other Services</h1>
              <p className="text-gray-600 mt-2">Manage other miscellaneous services</p>
            </div>
            <button
              onClick={() => navigate('/additional-services/others-service/add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Other Service
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.totalItems || 0}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <Package className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {services.filter(s => s.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
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
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {services.filter(s => s.status === 'completed').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
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
                placeholder="Search services..."
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
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="in_process">In Process</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <select
                value={serviceTypeFilter}
                onChange={(e) => {
                  setServiceTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Service Types</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">Error loading other services</p>
            </div>
          ) : services.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No other services found</p>
              <button
                onClick={() => navigate('/additional-services/others-service/add')}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Add your first service
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Client Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Service Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
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
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {service.serviceType || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 text-sm">
                            {service.description ? (service.description.length > 50 ? service.description.substring(0, 50) + '...' : service.description) : 'N/A'}
                          </p>
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
                              service.status === 'completed' || service.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : service.status === 'in_process'
                                ? 'bg-blue-100 text-blue-800'
                                : service.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {service.status || 'Active'}
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
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(service)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Edit Service"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(service)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete Service"
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
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-gray-600">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                    {pagination.totalItems} services
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          pageNum === pagination.currentPage
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
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

export default OtherService;

