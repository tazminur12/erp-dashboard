import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2, 
  Package, 
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
  IdCard
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useOtherService, useDeleteOtherService } from '../../../hooks/useOtherServiceQueries';

const OtherServiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Fetch service details
  const { data: service, isLoading, error } = useOtherService(id);
  const deleteMutation = useDeleteOtherService();

  const handleEdit = () => {
    navigate(`/additional-services/others-service/edit/${id}`);
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই অন্যান্য সার্ভিসটি মুছে ফেলতে চান?',
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
            navigate('/additional-services/others-service');
          }
        });
      }
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        label: 'পেন্ডিং', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock 
      },
      in_process: { 
        label: 'প্রক্রিয়াধীন', 
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Loader2 
      },
      processing: { 
        label: 'প্রসেসিং', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
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
      on_hold: { 
        label: 'হোল্ডে আছে', 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Clock 
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

  const getServiceTypeLabel = (type) => {
    const labels = {
      general: 'General Service',
      consultation: 'Consultation',
      documentation: 'Documentation',
      translation: 'Translation',
      attestation: 'Attestation',
      medical: 'Medical Test',
      training: 'Training',
      other: 'Other'
    };
    return labels[type] || type || 'General Service';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">অন্যান্য সার্ভিস খুঁজে পাওয়া যায়নি</h2>
            <p className="text-gray-600 mb-6">দুঃখিত, এই সার্ভিসটি খুঁজে পাওয়া যায়নি।</p>
            <button
              onClick={() => navigate('/additional-services/others-service')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              সার্ভিস তালিকায় ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Helmet>
        <title>{service.clientName || 'Other Service'} - Details</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/additional-services/others-service')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            সার্ভিস তালিকায় ফিরে যান
          </button>

          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1">অন্যান্য সার্ভিস বিস্তারিত</h1>
                  <p className="text-purple-100 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>সার্ভিস ID: {service._id || service.id || 'N/A'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
                  title="সম্পাদনা করুন"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 bg-white/20 hover:bg-red-500/50 backdrop-blur-sm rounded-lg transition-colors"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              মৌলিক তথ্য
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <IdCard className="w-4 h-4" />
                  ক্লায়েন্ট ID
                </label>
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200" style={{ fontFamily: "'Google Sans', monospace" }}>
                  {service.clientId || 'N/A'}
                </span>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">ক্লায়েন্টের নাম</label>
                <p className="text-gray-900 font-medium">{service.clientName || service.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">সার্ভিসের ধরন</label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  {getServiceTypeLabel(service.serviceType)}
                </span>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">স্ট্যাটাস</label>
                {getStatusBadge(service.status)}
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  ফোন নম্বর
                </label>
                <p className="text-gray-900 font-medium font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{service.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  ইমেইল
                </label>
                <p className="text-gray-900 font-medium font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{service.email || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  ঠিকানা
                </label>
                <p className="text-gray-900">{service.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              সার্ভিসের বিস্তারিত
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">বর্ণনা</label>
                <p className="text-gray-900">{service.description || 'কোন বর্ণনা নেই'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    তারিখ
                  </label>
                  <p className="text-gray-900 font-medium">{formatDate(service.serviceDate || service.date || service.appliedDate)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    প্রত্যাশিত ডেলিভারি
                  </label>
                  <p className="text-gray-900 font-medium">
                    {(service.deliveryDate || service.expectedDeliveryDate) ? formatDate(service.deliveryDate || service.expectedDeliveryDate) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">স্ট্যাটাস</label>
                  <div>{getStatusBadge(service.status)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          {service.vendorName && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                ভেন্ডর তথ্য
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">ভেন্ডরের নাম</label>
                  <p className="text-gray-900 font-medium">{service.vendorName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>Vendor ID</label>
                  <p className="text-gray-900 font-medium font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{service.vendorId || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Financial Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              আর্থিক তথ্য
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">ভেন্ডর বিল</label>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(service.vendorCost || service.vendorBill)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">অন্যান্য বিল</label>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(service.otherCost || service.othersBill)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">সার্ভিস চার্জ</label>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(service.serviceFee || service.serviceCharge)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600 mb-1 block">মোট বিল</label>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(service.totalAmount || service.totalBill)}</p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {service.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                অতিরিক্ত নোট
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{service.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">তৈরি করা হয়েছে:</span>{' '}
                {service.createdAt ? formatDate(service.createdAt) : 'N/A'}
              </div>
              <div>
                <span className="font-medium">শেষ আপডেট:</span>{' '}
                {service.updatedAt ? formatDate(service.updatedAt) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={() => navigate('/additional-services/others-service')}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ফিরে যান
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              সম্পাদনা করুন
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              মুছে ফেলুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherServiceDetails;
