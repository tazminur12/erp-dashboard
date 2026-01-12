import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2, 
  Globe, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  CreditCard,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Plane,
  DollarSign
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useVisaProcessingService, useDeleteVisaProcessingService } from '../../../hooks/useVisaProcessingQueries';

const VisaProcessingDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Fetch service details
  const { data: service, isLoading, error } = useVisaProcessingService(id);
  const deleteMutation = useDeleteVisaProcessingService();

  const handleEdit = () => {
    navigate(`/additional-services/visa-processing/edit/${id}`);
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই ভিসা প্রসেসিং সার্ভিসটি মুছে ফেলতে চান?',
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
            navigate('/additional-services/visa-processing');
          }
        });
      }
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        label: 'অপেক্ষমাণ', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock 
      },
      processing: { 
        label: 'প্রসেসিং', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Loader2 
      },
      in_process: { 
        label: 'চলমান', 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: Clock 
      },
      approved: { 
        label: 'অনুমোদিত', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle 
      },
      completed: { 
        label: 'সম্পন্ন', 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: CheckCircle 
      },
      rejected: { 
        label: 'প্রত্যাখ্যাত', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle 
      },
      cancelled: { 
        label: 'বাতিল', 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: XCircle 
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
        <StatusIcon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getVisaTypeLabel = (type) => {
    const types = {
      tourist: 'পর্যটন',
      business: 'ব্যবসায়িক',
      student: 'শিক্ষার্থী',
      work: 'কর্মসংস্থান',
      transit: 'ট্রানজিট',
      medical: 'চিকিৎসা',
      other: 'অন্যান্য'
    };
    return types[type] || type;
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
          <p className="text-gray-600 mb-4">The visa processing service you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/additional-services/visa-processing')}
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
        <title>Visa Processing Details - Additional Services</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/additional-services/visa-processing')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to List</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
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
              Delete
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Client Information
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Client Name</label>
                    <p className="text-gray-900 font-medium">{service.clientName || '-'}</p>
                  </div>
                  
                  {service.applicantName && service.applicantName !== service.clientName && (
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">Applicant Name</label>
                      <p className="text-gray-900 font-medium">{service.applicantName}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      Phone
                    </label>
                    <p className="text-gray-900 font-medium">{service.phone || '-'}</p>
                  </div>
                  
                  {service.email && (
                    <div>
                      <label className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </label>
                      <p className="text-gray-900 font-medium">{service.email}</p>
                    </div>
                  )}
                  
                  {service.address && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Address
                      </label>
                      <p className="text-gray-900">{service.address}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visa Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  Visa Information
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Country</label>
                    <p className="text-gray-900 font-medium text-lg">{service.country}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Visa Type</label>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      <Plane className="w-3.5 h-3.5" />
                      {getVisaTypeLabel(service.visaType)}
                    </span>
                  </div>
                  
                  {service.passportNumber && (
                    <div>
                      <label className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        Passport Number
                      </label>
                      <p className="text-gray-900 font-medium">{service.passportNumber}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Status</label>
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Important Dates
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="text-sm text-gray-500 mb-1 block">Applied Date</label>
                    <p className="text-gray-900 font-semibold">{formatDate(service.appliedDate)}</p>
                  </div>
                  
                  {service.expectedDeliveryDate && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <label className="text-sm text-blue-600 mb-1 block">Expected Delivery</label>
                      <p className="text-blue-900 font-semibold">{formatDate(service.expectedDeliveryDate)}</p>
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
                    Notes
                  </h2>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{service.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Financial & Vendor */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Details
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Vendor Bill</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(service.vendorBill)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Others Bill</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(service.othersBill)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 bg-emerald-50 -mx-6 px-6 py-4 rounded-b-lg">
                    <span className="font-semibold text-emerald-900">Total Bill</span>
                    <span className="text-2xl font-bold text-emerald-600">{formatCurrency(service.totalBill)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Information */}
            {service.vendorName && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Vendor Details
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">Vendor Name</label>
                      <p className="text-gray-900 font-semibold text-lg">{service.vendorName}</p>
                    </div>
                    
                    {service.vendorId && (
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Vendor ID</label>
                        <p className="text-gray-600 font-mono text-sm">{service.vendorId}</p>
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
                  System Info
                </h2>
              </div>
              
              <div className="p-6 space-y-3 text-sm">
                {service._id && (
                  <div>
                    <label className="text-gray-500 mb-1 block">Service ID</label>
                    <p className="text-gray-700 font-mono text-xs break-all">{service._id}</p>
                  </div>
                )}
                
                {service.createdAt && (
                  <div>
                    <label className="text-gray-500 mb-1 block">Created At</label>
                    <p className="text-gray-700">{new Date(service.createdAt).toLocaleString('en-US')}</p>
                  </div>
                )}
                
                {service.updatedAt && (
                  <div>
                    <label className="text-gray-500 mb-1 block">Last Updated</label>
                    <p className="text-gray-700">{new Date(service.updatedAt).toLocaleString('en-US')}</p>
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

export default VisaProcessingDetails;
