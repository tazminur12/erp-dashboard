import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Download,
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
  Package,
  Image as ImageIcon
} from 'lucide-react';
import { useUmrah, useUpdateUmrah } from '../../../hooks/UseUmrahQuries';
import { usePackages, useAssignPackageToPassenger } from '../../../hooks/usePackageQueries';

const UmrahHajiDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPackagePicker, setShowPackagePicker] = useState(false);
  const [packageSearch, setPackageSearch] = useState('');
  const [selectedPassengerType, setSelectedPassengerType] = useState('adult');

  const { data: umrah, isLoading, error } = useUmrah(id);
  const area = umrah?.area ?? umrah?.doc?.area ?? null;
  const division = umrah?.division ?? umrah?.doc?.division ?? null;
  const district = umrah?.district ?? umrah?.doc?.district ?? null;
  const upazila = umrah?.upazila ?? umrah?.doc?.upazila ?? null;
  const { data: packagesResp } = usePackages({ status: 'Active', limit: 200, page: 1 });
  const packageList = packagesResp?.data || packagesResp?.packages || [];

  // Mutation for updating umrah
  const updateUmrahMutation = useUpdateUmrah();
  const assignPackageMutation = useAssignPackageToPassenger();

  // Handle package selection with passenger type
  const handlePackageSelect = async (selectedPackage) => {
    try {
      const packageId = selectedPackage._id || selectedPackage.id;
      
      // Use the new assign passenger API
      await assignPackageMutation.mutateAsync({
        packageId: packageId,
        passengerId: id,
        passengerType: selectedPassengerType,
        passengerCategory: 'umrah'
      });
      
      setShowPackagePicker(false);
    } catch (error) {
      console.error('Error assigning package:', error);
      // Error is already handled by the mutation hook
    }
  };

  const getStatusBadge = (status, serviceStatus) => {
    const displayStatus = serviceStatus || status;
    if (!displayStatus) {
      return (
        <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          N/A
        </span>
      );
    }

    const normalized = displayStatus.toLowerCase ? displayStatus.toLowerCase() : String(displayStatus);
    
    // Define specific colors for each status
    let badgeClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    
    // Check for specific Umrah statuses
    if (normalized.includes('পাসপোর্ট রেডি নয়') || normalized.includes('passport not ready')) {
      badgeClasses = 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    } else if (normalized.includes('পাসপোর্ট রেডি') || normalized.includes('passport ready')) {
      badgeClasses = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400';
    } else if (normalized.includes('প্যাকেজ যুক্ত') || normalized.includes('package added')) {
      badgeClasses = 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    } else if (normalized.includes('রেডি ফর উমরাহ্‌') || normalized.includes('ready for umrah')) {
      badgeClasses = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (normalized.includes('উমরাহ্‌ সম্পন্ন') || normalized.includes('umrah completed')) {
      badgeClasses = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    } else if (normalized.includes('রিফান্ডেড') || normalized.includes('refunded')) {
      badgeClasses = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    } else if (normalized.includes('অন্যান্য') || normalized.includes('other')) {
      badgeClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    } else if (normalized === 'pending' || normalized.includes('pending')) {
      badgeClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    } else if (normalized === 'active' || normalized.includes('active')) {
      badgeClasses = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (normalized === 'inactive' || normalized.includes('inactive')) {
      badgeClasses = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    } else if (normalized.includes('রেডি') || normalized.includes('ready')) {
      badgeClasses = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (normalized.includes('নিবন্ধিত') || normalized.includes('registered')) {
      badgeClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    } else if (normalized.includes('আর্কাইভ') || normalized.includes('archive')) {
      badgeClasses = 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    } else {
      badgeClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
    }

    return (
      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${badgeClasses}`}>
        {displayStatus}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const paymentClasses = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      pending: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    const cls = paymentClasses[paymentStatus] || paymentClasses.pending;
    return <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${cls}`}>{(paymentStatus || 'pending').replace(/^./, c => c.toUpperCase())}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString('en-US');
  };

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Data</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message || 'Failed to load Umrah information. Please try again.'}</p>
        <button
          onClick={() => navigate('/umrah/haji-list')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Umrah List
        </button>
      </div>
    );
  }

  if (!umrah) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Umrah Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">The requested Umrah information could not be found.</p>
        <button
          onClick={() => navigate('/umrah/haji-list')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Umrah List
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: FileText },
    { id: 'package', label: 'Package Info', icon: Package },
    { id: 'financial', label: 'Financial', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: ImageIcon }
  ];

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center space-x-4 sm:block">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0">
              {(() => {
                const photoUrl = umrah.photo || umrah.photoUrl || umrah.image;
                return photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={umrah.name || 'Umrah Haji'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null;
              })()}
              <div className={`w-full h-full bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center ${(umrah.photo || umrah.photoUrl || umrah.image) ? 'hidden' : 'flex'}`}>
                <User className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 sm:hidden">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{umrah.name || 'N/A'}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{umrah.packageInfo?.packageName || umrah.packageName || 'Umrah'}</p>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="hidden sm:block">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{umrah.name || 'N/A'}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{umrah.packageInfo?.packageName || umrah.packageName || 'Umrah'}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">{umrah.mobile || umrah.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">{umrah.email || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{umrah.address || umrah.district || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2">
            {getStatusBadge(umrah.status, umrah.serviceStatus)}
            {getPaymentBadge(umrah.paymentStatus || 'pending')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Umrah ID</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{umrah.customerId || umrah._id || umrah.id || 'N/A'}</p>
            </div>
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manual Serial Number</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{umrah.manualSerialNumber || 'N/A'}</p>
            </div>
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">{umrah.packageInfo?.packageName || umrah.packageName || 'N/A'}</p>
            </div>
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">৳{formatNumber(umrah.totalAmount)}</p>
            </div>
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Created</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{formatDate(umrah.createdAt)}</p>
            </div>
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400 flex-shrink-0" />
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">৳{formatNumber(umrah.totalAmount)}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Paid Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">৳{formatNumber(umrah.paidAmount)}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Due Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">৳{formatNumber(Math.max(Number(umrah.totalAmount || 0) - Number(umrah.paidAmount || 0), 0))}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonal = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Full Name</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">{umrah.name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Umrah ID</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{umrah.customerId || umrah._id || umrah.id || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manual Serial Number</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{umrah.manualSerialNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Date of Birth</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{formatDate(umrah.dateOfBirth)}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Gender</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white capitalize">{umrah.gender || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">উমরাহ্‌ হাজ্বীর স্ট্যাটাস</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{umrah.serviceStatus || umrah.status || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mobile</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{umrah.mobile || umrah.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">WhatsApp</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{umrah.whatsappNo || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Email</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{umrah.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Address</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{umrah.address || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Area</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{area || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Division</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{division || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">District</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{district || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Upazila</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{upazila || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Passport Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Passport Number</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{umrah.passportNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Passport Type</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white capitalize">{umrah.passportType || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Issue Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{formatDate(umrah.issueDate)}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Expiry Date</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{formatDate(umrah.expiryDate)}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">NID Number</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{umrah.nidNumber || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPackage = () => {
    // Support both packageInfo object and flat package fields
    const packageInfo = umrah.packageInfo || umrah;
    
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Package Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package Name</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">{packageInfo.packageName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package ID</label>
              <p className="text-xs text-gray-900 dark:text-white break-all font-mono">{packageInfo.packageId || umrah.packageId || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package Type</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{packageInfo.packageType || umrah.packageType || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Custom Package Type</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{packageInfo.customPackageType || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package Year</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{packageInfo.packageYear || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package Month</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{packageInfo.packageMonth || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Travel Agent</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{umrah.agent || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Agent Contact</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{umrah.agentContact || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Departure Date</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{umrah.departureDate || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Return Date</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{umrah.returnDate || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Previous Hajj</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{umrah.previousHajj ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Previous Umrah</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{umrah.previousUmrah ? 'Yes' : 'No'}</p>
            </div>
          </div>
          {(umrah.specialRequirements || packageInfo.specialRequirements) && (
            <div className="mt-4">
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Special Requirements</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{umrah.specialRequirements || packageInfo.specialRequirements}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFinancial = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">৳{formatNumber(umrah.totalAmount)}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Paid Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">৳{formatNumber(umrah.paidAmount)}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Due Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">৳{formatNumber(Math.max(Number(umrah.totalAmount || 0) - Number(umrah.paidAmount || 0), 0))}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Uploaded Photos and Documents */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Uploaded Photos & Documents</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Photo */}
          {(() => {
            const photoUrl = umrah.photo || umrah.photoUrl || umrah.image;
            return photoUrl ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Photo</label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <img 
                    src={photoUrl} 
                    alt={`${umrah.name || 'Umrah Haji'} Photo`}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(photoUrl, '_blank')}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <a 
                  href={photoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-block"
                >
                  View Full Size
                </a>
              </div>
            ) : null;
          })()}
          
          {/* Passport Copy */}
          {(() => {
            const passportUrl = umrah.passportCopy || umrah.passportCopyUrl;
            return passportUrl ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Passport Copy</label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {passportUrl.match(/\.pdf(\?|$)/i) ? (
                    <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">PDF Document</p>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={passportUrl} 
                      alt={`${umrah.name || 'Umrah Haji'} Passport`}
                      className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(passportUrl, '_blank')}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <a 
                  href={passportUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-block"
                >
                  {passportUrl.match(/\.pdf(\?|$)/i) ? 'View PDF' : 'View Full Size'}
                </a>
              </div>
            ) : null;
          })()}
          
          {/* NID Copy */}
          {(() => {
            const nidUrl = umrah.nidCopy || umrah.nidCopyUrl;
            return nidUrl ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">NID Copy</label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {nidUrl.match(/\.pdf(\?|$)/i) ? (
                    <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">PDF Document</p>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={nidUrl} 
                      alt={`${umrah.name || 'Umrah Haji'} NID`}
                      className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(nidUrl, '_blank')}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <a 
                  href={nidUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-block"
                >
                  {nidUrl.match(/\.pdf(\?|$)/i) ? 'View PDF' : 'View Full Size'}
                </a>
              </div>
            ) : null;
          })()}
        </div>
        
        {/* Show message if no documents uploaded */}
        {!umrah.photo && !umrah.photoUrl && !umrah.image && !umrah.passportCopy && !umrah.passportCopyUrl && !umrah.nidCopy && !umrah.nidCopyUrl && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No photos or documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'personal':
        return renderPersonal();
      case 'package':
        return renderPackage();
      case 'financial':
        return renderFinancial();
      case 'documents':
        return renderDocuments();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => navigate('/umrah/haji-list')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Umrah Details - {umrah.name || 'N/A'}</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden sm:block">Complete information about the Umrah Haji</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
        <button 
          onClick={() => setShowPackagePicker(true)}
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
        >
          <Package className="w-4 h-4" />
          <span className="hidden sm:inline">Add Package</span>
        </button>
          <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => navigate(`/umrah/haji/${id}/edit`)}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>
      </div>

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

      <div className="min-h-[400px] sm:min-h-[600px]">{renderTabContent()}</div>

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
              <div className="mb-4 space-y-3">
                <input
                  type="text"
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                  placeholder="Search by name, type, year..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Passenger Type
                  </label>
                  <select
                    value={selectedPassengerType}
                    onChange={(e) => setSelectedPassengerType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="adult">Adult (প্রাপ্তবয়স্ক)</option>
                    <option value="child">Child (শিশু)</option>
                    <option value="infant">Infant (শিশু)</option>
                  </select>
                </div>
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
                  .map((p) => {
                    const passengerTotals = p.totals?.passengerTotals || {};
                    const selectedPrice = passengerTotals[selectedPassengerType] || 0;
                    
                    return (
                      <div key={p._id} className="flex items-center justify-between p-3 sm:p-4 border-l-2 border-l-purple-500">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">{p.packageName}</p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                            {p.packageType || 'N/A'} • {p.customPackageType || 'General'} • {p.packageYear || '-'}
                          </p>
                          {selectedPrice > 0 && (
                            <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                              Price: ৳{Number(selectedPrice).toLocaleString()} ({selectedPassengerType})
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePackageSelect(p)}
                            disabled={assignPackageMutation.isPending || !selectedPrice}
                            className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    );
                  })}
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

export default UmrahHajiDetails;


