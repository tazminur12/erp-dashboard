import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft,
  Edit,
  Download,
  Share,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Plane,
  Hotel,
  FileCheck,
  MessageCircle,
  Package,
  Users
} from 'lucide-react';
import { useHaji } from '../../../hooks/UseHajiQueries';
import { useUmrah } from '../../../hooks/UseUmrahQuries';
import { usePackages } from '../../../hooks/usePackageQueries';

const HajiDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPackagePicker, setShowPackagePicker] = useState(false);
  const [packageSearch, setPackageSearch] = useState('');

  // Determine if this is a Haji or Umrah based on query parameter
  const isUmrah = searchParams.get('type') === 'umrah';
  
  // Fetch data based on type
  const { data: hajiData, isLoading: hajiLoading, error: hajiError } = useHaji(id);
  const { data: umrahData, isLoading: umrahLoading, error: umrahError } = useUmrah(id);
  
  // Use the appropriate data based on type
  const haji = isUmrah ? umrahData : hajiData;
  const isLoading = isUmrah ? umrahLoading : hajiLoading;
  const error = isUmrah ? umrahError : hajiError;

  // Load packages for selection (active ones, large page size for convenience)
  const { data: packagesResp } = usePackages({ status: 'Active', limit: 200, page: 1 });
  const packageList = packagesResp?.data || packagesResp?.packages || [];

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return (
      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusClasses[status] || statusClasses.active}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const paymentClasses = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      pending: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return (
      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${paymentClasses[paymentStatus] || paymentClasses.pending}`}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </span>
    );
  };

  const getDocumentStatus = (doc) => {
    if (doc.uploaded && doc.verified) {
      return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />;
    } else if (doc.uploaded && !doc.verified) {
      return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />;
    } else {
      return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: FileText },
    { id: 'package', label: 'Package Info', icon: Package },
    { id: 'financial', label: 'Financial', icon: CreditCard }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ডেটা লোড করতে ত্রুটি</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.message || `${isUmrah ? 'উমরাহ' : 'হাজি'} তথ্য লোড করতে ব্যর্থ। আবার চেষ্টা করুন।`}
        </p>
        <button
          onClick={() => navigate(isUmrah ? '/hajj-umrah/umrah' : '/hajj-umrah/haji-list')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isUmrah ? 'উমরাহ' : 'হাজি'} তালিকায় ফিরুন
        </button>
      </div>
    );
  }

  if (!haji) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isUmrah ? 'উমরাহ' : 'হাজি'} পাওয়া যায়নি</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">অনুরোধকৃত {isUmrah ? 'উমরাহ' : 'হাজি'} তথ্য পাওয়া যায়নি।</p>
        <button
          onClick={() => navigate(isUmrah ? '/hajj-umrah/umrah' : '/hajj-umrah/haji-list')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isUmrah ? 'উমরাহ' : 'হাজি'} তালিকায় ফিরুন
        </button>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Personal Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center space-x-4 sm:block">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0">
              {haji.image ? (
                <img 
                  src={haji.image} 
                  alt={haji.name || 'Haji'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center ${haji.image ? 'hidden' : 'flex'}`}>
                <User className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 sm:hidden">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {haji.name || 'N/A'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{haji.packageName || 'Haj'}</p>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="hidden sm:block">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {haji.name || 'N/A'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{haji.packageName || 'Haj'}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">{haji.mobile || haji.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">{haji.email || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{haji.address || haji.district || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2">
            {getStatusBadge(haji.status || 'active')}
            {getPaymentBadge(haji.paymentStatus || 'pending')}
          </div>
        </div>
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{isUmrah ? 'Umrah' : 'Haji'} ID</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{haji._id || 'N/A'}</p>
            </div>
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">{haji.packageName || 'N/A'}</p>
            </div>
            <Plane className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">৳{Number(haji.totalAmount || 0).toLocaleString()}</p>
            </div>
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Created</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                {haji.createdAt ? new Date(haji.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Financial Summary (Quick View) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">৳{Number(haji.totalAmount || 0).toLocaleString()}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Paid Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">৳{Number(haji.paidAmount || 0).toLocaleString()}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Due Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">৳{Number((typeof haji.due === 'number' ? haji.due : Math.max((Number(haji.totalAmount || 0) - Number(haji.paidAmount || 0)), 0))).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <button 
            onClick={() => setShowPackagePicker(true)}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
          >
            <Package className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Add Package</span>
          </button>
          <button 
            onClick={() => navigate(isUmrah ? `/hajj-umrah/umrah/add?umrahId=${id}&edit=true` : `/hajj-umrah/haji/${id}/edit`)}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            <Edit className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Edit Information</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base">
            <Download className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Download Documents</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Print Details</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm sm:text-base">
            <Share className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Share Information</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Full Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">{haji.name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">First Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.firstName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Last Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.lastName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{isUmrah ? 'Umrah' : 'Haji'} ID</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji._id || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Date of Birth</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {haji.dateOfBirth ? new Date(haji.dateOfBirth).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Gender</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white capitalize">{haji.gender || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Marital Status</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white capitalize">{haji.maritalStatus || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Nationality</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.nationality || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Occupation</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.occupation || 'N/A'}</p>
          </div>
        </div>
        
        {/* Family Information */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Family Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Father's Name</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.fatherName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mother's Name</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.motherName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Spouse Name</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.spouseName || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Status and Reference Information */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Status & Reference Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.packageName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Status</label>
              <div className="mt-1">{getStatusBadge(haji.status || 'active')}</div>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Reference By</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.referenceBy || 'N/A'}</p>
            </div>
            <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Reference Haji ID</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.referenceHajiId || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mobile</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.mobile || haji.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">WhatsApp</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.whatsappNo || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Email</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.email || 'N/A'}</p>
          </div>
        </div>
        
        {/* Emergency Contact Information */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Emergency Contact</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Emergency Contact Name</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.emergencyContact || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Emergency Contact Phone</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.emergencyPhone || 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Address</label>
          <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.address || 'N/A'}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Division</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.division || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">District</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.district || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Upazila</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.upazila || 'N/A'}</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Post Code</label>
          <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.postCode || 'N/A'}</p>
        </div>
      </div>

      {/* Passport Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Passport Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Passport Number</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.passportNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Passport Type</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white capitalize">{haji.passportType || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Issue Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {haji.issueDate ? new Date(haji.issueDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Expiry Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {haji.expiryDate ? new Date(haji.expiryDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">NID Number</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.nidNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Passport First Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.passportFirstName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Passport Last Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.passportLastName || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPackageDetails = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Package Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Package Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">{haji.packageName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package Type</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.packageType || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Travel Agent</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.agent || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Agent Contact</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.agentContact || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Departure Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.departureDate || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Return Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.returnDate || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Previous Hajj Experience</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.previousHajj ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Previous Umrah Experience</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.previousUmrah ? 'Yes' : 'No'}</p>
          </div>
        </div>
        {haji.packageInfo?.specialRequirements && (
          <div className="mt-4">
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Special Requirements</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.packageInfo?.specialRequirements}</p>
          </div>
        )}
      </div>

      {/* Service Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Service Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Service Type</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white capitalize">{haji.serviceType || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Service Status</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white capitalize">{haji.serviceStatus || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Customer Type</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white capitalize">{haji.customerType || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Registration Status</label>
            <div className="mt-1">{getStatusBadge(haji.status || 'active')}</div>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Payment Status</label>
            <div className="mt-1">{getPaymentBadge(haji.paymentStatus || 'pending')}</div>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Registration Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {haji.createdAt ? new Date(haji.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancial = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Financial Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">৳{Number(haji.totalAmount || 0).toLocaleString()}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Paid Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">৳{Number(haji.paidAmount || 0).toLocaleString()}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Due Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">৳{Number((typeof haji.due === 'number' ? haji.due : Math.max((Number(haji.totalAmount || 0) - Number(haji.paidAmount || 0)), 0))).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Payment Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Payment Method</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white capitalize">{haji.paymentMethod || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Payment Status</label>
            <div className="mt-1">{getPaymentBadge(haji.paymentStatus || 'pending')}</div>
          </div>
        </div>
      </div>

      {/* Package Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Package Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.packageInfo?.packageName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package Type</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.packageType || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Travel Agent</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.agent || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Agent Contact</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.agentContact || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Departure Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.departureDate || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Return Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.returnDate || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Previous Hajj Experience</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.previousHajj ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Previous Umrah Experience</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.previousUmrah ? 'Yes' : 'No'}</p>
          </div>
        </div>
        {haji.packageInfo?.specialRequirements && (
          <div className="mt-4">
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Special Requirements</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.packageInfo?.specialRequirements}</p>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Created At</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {haji.createdAt ? new Date(haji.createdAt).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Updated At</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {haji.updatedAt ? new Date(haji.updatedAt).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Is Active</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">
              {haji.isActive ? 'Yes' : 'No'}
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Service Type</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white capitalize">{haji.serviceType || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Service Status</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white capitalize">{haji.serviceStatus || 'N/A'}</p>
          </div>
        </div>
        {haji.notes && (
          <div className="mt-4">
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Notes</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Document Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Passport</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {haji.documents?.passport?.expiry ? `Expires: ${haji.documents.passport.expiry}` : ''}
              </p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents?.passport || { uploaded: false, verified: false })}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Visa</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Status: {haji.documents?.visa?.status || 'N/A'}
              </p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents?.visa || { uploaded: false, verified: false })}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Medical Certificate</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {haji.documents?.medicalCertificate?.expiry ? `Expires: ${haji.documents.medicalCertificate.expiry}` : ''}
              </p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents?.medicalCertificate || { uploaded: false, verified: false })}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Vaccination Record</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents?.vaccinationRecord || { uploaded: false, verified: false })}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Travel Insurance</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents.travelInsurance)}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">NID</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents?.nid || { uploaded: false, verified: false })}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Birth Certificate</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents?.birthCertificate || { uploaded: false, verified: false })}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Marriage Certificate</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents?.marriageCertificate || { uploaded: false, verified: false })}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Bank Statement</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents?.bankStatement || { uploaded: false, verified: false })}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Employment Letter</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getDocumentStatus(haji.documents?.employmentLetter || { uploaded: false, verified: false })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccommodation = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Makkah Accommodation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Makkah Accommodation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Hotel Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">{haji.accommodation?.makkah?.hotel || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Room Number</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.accommodation?.makkah?.roomNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Check-in Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.accommodation?.makkah?.checkIn || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Check-out Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.accommodation?.makkah?.checkOut || 'N/A'}</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Address</label>
          <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.accommodation?.makkah?.address || 'N/A'}</p>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Amenities</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(haji.accommodation?.makkah?.amenities || []).map((amenity, index) => (
              <span key={index} className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs sm:text-sm">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Madinah Accommodation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Madinah Accommodation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Hotel Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">{haji.accommodation?.madinah?.hotel || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Room Number</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.accommodation?.madinah?.roomNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Check-in Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.accommodation?.madinah?.checkIn || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Check-out Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.accommodation?.madinah?.checkOut || 'N/A'}</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Address</label>
          <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.accommodation?.madinah?.address || 'N/A'}</p>
        </div>
        <div className="mt-3 sm:mt-4">
          <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Amenities</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(haji.accommodation?.madinah?.amenities || []).map((amenity, index) => (
              <span key={index} className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs sm:text-sm">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderItinerary = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Travel Itinerary</h3>
      <div className="space-y-3 sm:space-y-4">
        {(haji.itinerary || []).map((item, index) => (
          <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-words">{item.activity}</h4>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.time}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">{item.location}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEmergencyContacts = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Emergency Contacts</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {(haji.emergencyContacts || []).map((contact, index) => (
          <div key={index} className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-words">{contact.name}</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-all">{contact.phone}</p>
                <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs mt-1">
                  {contact.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Notes & Updates</h3>
      <div className="space-y-3 sm:space-y-4">
        {(haji.notes || []).map((note, index) => (
          <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{note.author}</span>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">{note.date}</span>
              </div>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white mt-1 break-words">{note.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'personal':
        return renderPersonalInfo();
      case 'package':
        return renderPackageDetails();
      case 'financial':
        return renderFinancial();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => navigate(isUmrah ? '/hajj-umrah/umrah' : '/hajj-umrah/haji-list')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {isUmrah ? 'Umrah' : 'Haji'} Details - {haji.name || 'N/A'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden sm:block">
              Complete information about the {isUmrah ? 'Umrah Haji' : 'Haji'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={() => navigate(isUmrah ? `/umrah/haji/${id}/edit` : `/hajj-umrah/haji/${id}/edit`)}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-w-fit ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px] sm:min-h-[600px]">
        {renderTabContent()}
      </div>

      {/* Package Picker Modal */}
      {showPackagePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full mx-4">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Select a Package</h3>
                <button
                  onClick={() => setShowPackagePicker(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                  placeholder="Search by name, type, year..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                {(packageList || [])
                  .filter((p) => {
                    const q = packageSearch.toLowerCase();
                    if (!q) return true;
                    const name = (p.packageName || '').toLowerCase();
                    const type = (p.packageType || '').toLowerCase();
                    const year = String(p.packageYear || '').toLowerCase();
                    const customType = (p.customPackageType || '').toLowerCase();
                    return name.includes(q) || type.includes(q) || year.includes(q) || customType.includes(q);
                  })
                  .map((p) => (
                    <div key={p._id} className="flex items-center justify-between p-3 sm:p-4">
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">{p.packageName}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                          {p.packageType || 'N/A'} • {p.customPackageType || 'General'} • {p.packageYear || '-'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/hajj-umrah/package-list/${p._id}`)}
                          className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs sm:text-sm"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                {packageList && packageList.length === 0 && (
                  <div className="p-6 text-center text-sm text-gray-600 dark:text-gray-400">No packages found.</div>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowPackagePicker(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HajiDetails;
