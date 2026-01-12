import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2, 
  Briefcase, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  DollarSign,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Globe
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useManpowerService, useDeleteManpowerService } from '../../../hooks/useManpowerServiceQueries';

const ManpowerServiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Fetch service details
  const { data: service, isLoading, error } = useManpowerService(id);
  const deleteMutation = useDeleteManpowerService();

  const handleEdit = () => {
    navigate(`/additional-services/manpower-service/edit/${id}`);
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই ম্যানপাওয়ার সার্ভিসটি মুছে ফেলতে চান?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল করুন'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id, {
          onSuccess: () => {
            navigate('/additional-services/manpower-service');
          }
        });
      }
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { 
        label: 'সক্রিয়', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock 
      },
      in_process: { 
        label: 'প্রক্রিয়াধীন', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Loader2 
      },
      completed: { 
        label: 'সম্পন্ন', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle 
      },
      cancelled: { 
        label: 'বাতিল', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle 
      },
      pending: { 
        label: 'অপেক্ষমাণ', 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Clock 
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    const StatusIcon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
        <StatusIcon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getServiceTypeLabel = (type) => {
    const types = {
      recruitment: 'নিয়োগ',
      placement: 'প্লেসমেন্ট',
      training: 'প্রশিক্ষণ',
      consultation: 'পরামর্শ',
      other: 'অন্যান্য'
    };
    return types[type] || type || 'নিয়োগ';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return `৳${parseFloat(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
          <p className="text-gray-600 mb-4">The manpower service you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/additional-services/manpower-service')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Helmet>
        <title>ম্যানপাওয়ার সার্ভিস বিস্তারিত - অতিরিক্ত সার্ভিস</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/additional-services/manpower-service')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>তালিকায় ফিরে যান</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              সম্পাদনা
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              মুছে ফেলুন
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client/Company Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  ক্লায়েন্ট/কোম্পানির তথ্য
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">ক্লায়েন্ট/কোম্পানির নাম</label>
                    <p className="text-gray-900 font-medium text-lg">{service.clientName || service.companyName || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">স্ট্যাটাস</label>
                    {getStatusBadge(service.status)}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      ফোন
                    </label>
                    <p className="text-gray-900 font-medium">{service.phone || '-'}</p>
                  </div>
                  
                  {service.email && (
                    <div>
                      <label className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        ইমেইল
                      </label>
                      <p className="text-gray-900 font-medium">{service.email}</p>
                    </div>
                  )}
                  
                  {service.address && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        ঠিকানা
                      </label>
                      <p className="text-gray-900">{service.address}</p>
                    </div>
                  )}

                  {service.country && (
                    <div>
                      <label className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />
                        দেশ
                      </label>
                      <p className="text-gray-900 font-medium">{service.country}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-6 h-6" />
                  সার্ভিসের তথ্য
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">সার্ভিসের ধরন</label>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                      <Briefcase className="w-3.5 h-3.5" />
                      {getServiceTypeLabel(service.serviceType)}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">পদবি/কাজের শিরোনাম</label>
                    <p className="text-gray-900 font-medium text-lg">{service.position || service.jobTitle || '-'}</p>
                  </div>
                  
                  {service.requiredCount && (
                    <div>
                      <label className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        প্রয়োজনীয় সংখ্যা
                      </label>
                      <p className="text-gray-900 font-semibold text-lg">{service.requiredCount}</p>
                    </div>
                  )}

                  {service.serviceId && (
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">সার্ভিস আইডি</label>
                      <p className="text-gray-700 font-mono text-sm">{service.serviceId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  গুরুত্বপূর্ণ তারিখ
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.appliedDate && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="text-sm text-gray-500 mb-1 block">আবেদনের তারিখ</label>
                      <p className="text-gray-900 font-semibold">{formatDate(service.appliedDate)}</p>
                    </div>
                  )}
                  
                  {service.completionDate && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <label className="text-sm text-green-600 mb-1 block">সমাপ্তির তারিখ</label>
                      <p className="text-green-900 font-semibold">{formatDate(service.completionDate)}</p>
                    </div>
                  )}

                  {service.startDate && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <label className="text-sm text-blue-600 mb-1 block">শুরুর তারিখ</label>
                      <p className="text-blue-900 font-semibold">{formatDate(service.startDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {service.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    নোট
                  </h2>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{service.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Financial & Meta */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  আর্থিক বিবরণ
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">মোট বিল</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(service.totalAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">জমা</span>
                    <span className="font-semibold text-green-600">{formatCurrency(service.paidAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 bg-red-50 -mx-6 px-6 py-4 rounded-b-lg">
                    <span className="font-semibold text-red-900">বকেয়া</span>
                    <span className="text-2xl font-bold text-red-600">{formatCurrency(service.dueAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Information */}
            {service.vendorName && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    ভেন্ডরের তথ্য
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">ভেন্ডরের নাম</label>
                      <p className="text-gray-900 font-semibold text-lg">{service.vendorName}</p>
                    </div>
                    
                    {service.vendorId && (
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">ভেন্ডর আইডি</label>
                        <p className="text-gray-600 font-mono text-sm">{service.vendorId}</p>
                      </div>
                    )}

                    {service.vendorBill && (
                      <div className="pt-3 border-t border-gray-200">
                        <label className="text-sm text-gray-500 mb-1 block">ভেন্ডর বিল</label>
                        <p className="text-purple-900 font-semibold text-lg">{formatCurrency(service.vendorBill)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Meta Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-600 px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  সিস্টেম তথ্য
                </h2>
              </div>
              
              <div className="p-6 space-y-3 text-sm">
                {service._id && (
                  <div>
                    <label className="text-gray-500 mb-1 block">সার্ভিস আইডি</label>
                    <p className="text-gray-700 font-mono text-xs break-all">{service._id}</p>
                  </div>
                )}
                
                {service.createdAt && (
                  <div>
                    <label className="text-gray-500 mb-1 block">তৈরি করা হয়েছে</label>
                    <p className="text-gray-700">{new Date(service.createdAt).toLocaleString('bn-BD')}</p>
                  </div>
                )}
                
                {service.updatedAt && (
                  <div>
                    <label className="text-gray-500 mb-1 block">শেষ আপডেট</label>
                    <p className="text-gray-700">{new Date(service.updatedAt).toLocaleString('bn-BD')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManpowerServiceDetails;
