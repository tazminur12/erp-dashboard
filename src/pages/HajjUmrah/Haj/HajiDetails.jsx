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
  Users,
  Image as ImageIcon,
  Trash2,
  Copy,
  Shield,
  Receipt,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useHaji, useHajiList, useUpdateHaji, useAddHajiRelation, useDeleteHajiRelation, useHajiFamilySummary, useHajiTransactions } from '../../../hooks/UseHajiQueries';
import { useUmrah, useUpdateUmrah } from '../../../hooks/UseUmrahQuries';
import { usePackages, useAssignPackageToPassenger } from '../../../hooks/usePackageQueries';
import useLicenseQueries from '../../../hooks/useLicenseQueries';
import Swal from 'sweetalert2';

const HajiDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPackagePicker, setShowPackagePicker] = useState(false);
  const [packageSearch, setPackageSearch] = useState('');
  const [selectedPassengerType, setSelectedPassengerType] = useState('adult');
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [relationSearch, setRelationSearch] = useState('');
  const [selectedRelationType, setSelectedRelationType] = useState('relative');
  const [relationsState, setRelationsState] = useState([]);
  const [isSendingDueSms, setIsSendingDueSms] = useState(false);
  const [dueSmsStatus, setDueSmsStatus] = useState(null);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionFilters, setTransactionFilters] = useState({
    fromDate: '',
    toDate: '',
    transactionType: ''
  });

  // Determine if this is a Haji or Umrah based on query parameter
  const isUmrah = searchParams.get('type') === 'umrah';
  
  // Fetch data based on type
  const { data: hajiData, isLoading: hajiLoading, error: hajiError } = useHaji(id);
  const { data: umrahData, isLoading: umrahLoading, error: umrahError } = useUmrah(id);
  
  // Use the appropriate data based on type
  const haji = isUmrah ? umrahData : hajiData;
  const area = haji?.area ?? haji?.doc?.area ?? null;
  const isLoading = isUmrah ? umrahLoading : hajiLoading;
  const error = isUmrah ? umrahError : hajiError;

  // Load packages for selection (active ones, large page size for convenience)
  const { data: packagesResp } = usePackages({ status: 'Active', limit: 200, page: 1 });
  const packageList = packagesResp?.data || packagesResp?.packages || [];

  // Load licenses for display
  const { useLicenses } = useLicenseQueries();
  const { data: licensesResponse } = useLicenses();
  const licenseList = Array.isArray(licensesResponse) ? licensesResponse : licensesResponse?.data || [];

  // Load haji list for relation picker (large page for suggestions)
  const { data: hajiListResp, isLoading: hajiListLoading } = useHajiList({ limit: 500, page: 1 });
  const hajiList = hajiListResp?.data || hajiListResp?.haji || hajiListResp?.hajis || hajiListResp?.list || [];

  // Load transaction history (only for Haji, not Umrah)
  const { data: transactionsData, isLoading: transactionsLoading } = useHajiTransactions(
    !isUmrah ? id : null,
    {
      page: transactionPage,
      limit: 20,
      ...transactionFilters
    }
  );
  const transactions = transactionsData?.data || [];
  const transactionSummary = transactionsData?.summary || {};
  const transactionPagination = transactionsData?.pagination || {};

  // Helper function to get package name from multiple possible locations
  const getPackageName = (passenger) => {
    if (!passenger) return 'N/A';
    
    // Check populated package object first
    if (passenger.package?.packageName) {
      return passenger.package.packageName;
    }
    
    // Check packageInfo object
    if (passenger.packageInfo?.packageName) {
      return passenger.packageInfo.packageName;
    }
    
    // Check flat packageName field
    if (passenger.packageName) {
      return passenger.packageName;
    }
    
    // If we have a packageId, look it up from packageList
    const packageId = passenger.packageId || passenger.packageInfo?.packageId || passenger.package?._id || passenger.package?.id;
    if (packageId && packageList.length > 0) {
      const foundPackage = packageList.find(
        pkg => pkg._id === packageId || pkg.id === packageId || String(pkg._id) === String(packageId) || String(pkg.id) === String(packageId)
      );
      if (foundPackage?.packageName) {
        return foundPackage.packageName;
      }
    }
    
    return 'N/A';
  };

  // Helper function to get license name from multiple possible locations
  const getLicenseName = (passenger) => {
    if (!passenger) return 'N/A';
    
    // Check populated license object first
    if (passenger.license?.licenseName && passenger.license?.licenseNumber) {
      return `${passenger.license.licenseNumber} - ${passenger.license.licenseName}`;
    }
    
    // Check flat license fields
    if (passenger.licenseName && passenger.licenseNumber) {
      return `${passenger.licenseNumber} - ${passenger.licenseName}`;
    }
    
    // If we have a licenseId, look it up from licenseList
    const licenseId = passenger.licenseId || passenger.license?._id || passenger.license?.id;
    if (licenseId && licenseList.length > 0) {
      const foundLicense = licenseList.find(
        lic => lic._id === licenseId || lic.id === licenseId || String(lic._id) === String(licenseId) || String(lic.id) === String(licenseId)
      );
      if (foundLicense?.licenseNumber && foundLicense?.licenseName) {
        return `${foundLicense.licenseNumber} - ${foundLicense.licenseName}`;
      }
    }
    
    return 'N/A';
  };

  // Family summary (only meaningful for Haji)
  const { data: familySummaryData } = useHajiFamilySummary(!isUmrah ? id : undefined);

  // Mutations for updating haji/umrah
  const updateHajiMutation = useUpdateHaji();
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
        passengerCategory: isUmrah ? 'umrah' : 'haji'
      });
      
      setShowPackagePicker(false);
    } catch (error) {
      console.error('Error assigning package:', error);
      // Error is already handled by the mutation hook
    }
  };

  const handleVerifyTracking = () => {
    if (!haji?.trackingNo) return;
    const encoded = encodeURIComponent(haji.trackingNo);
    const url = `https://pilgrim.hajj.gov.bd/web/pilgrim-search?q=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyToClipboard = async (text, fieldName) => {
    if (!text || text === 'N/A') return;
    
    try {
      await navigator.clipboard.writeText(text);
      const isDark = document.documentElement.classList.contains('dark');
      Swal.fire({
        title: 'কপি হয়েছে!',
        text: `${fieldName} ক্লিপবোর্ডে কপি হয়েছে।`,
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        background: isDark ? '#1F2937' : '#F9FAFB',
        timer: 2000,
        showConfirmButton: true,
      });
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      const isDark = document.documentElement.classList.contains('dark');
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কপি করা যায়নি। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
      });
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
    
    // Check for specific Hajj statuses
    if (normalized.includes('পাসপোর্ট রেডি নয়') || normalized.includes('passport not ready')) {
      badgeClasses = 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    } else if (normalized.includes('পাসপোর্ট রেডি') || normalized.includes('passport ready')) {
      badgeClasses = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400';
    } else if (normalized.includes('প্যাকেজ যুক্ত') || normalized.includes('package added')) {
      badgeClasses = 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    } else if (normalized.includes('রেডি ফর হজ্ব') || normalized.includes('ready for hajj')) {
      badgeClasses = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (normalized.includes('হজ্ব সম্পন্ন') || normalized.includes('hajj completed')) {
      badgeClasses = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    } else if (normalized.includes('রিফান্ডেড') || normalized.includes('refunded')) {
      badgeClasses = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    } else if (normalized.includes('আর্কাইভ') || normalized.includes('archive')) {
      badgeClasses = 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
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
    } else if (normalized.includes('আনপেইড') || normalized.includes('unpaid')) {
      badgeClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
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

  // Sync initial relations into local state for UI updates
  useEffect(() => {
    if (!haji) return;
    const relations = Array.isArray(haji?.relations)
      ? haji.relations
      : Array.isArray(haji?.relationWith)
        ? haji.relationWith
        : Array.isArray(haji?.relatedHajis)
          ? haji.relatedHajis
          : Array.isArray(haji?.relatedPassengers)
            ? haji.relatedPassengers
            : [];
    setRelationsState(relations);
  }, [haji]);

  const addRelationMutation = useAddHajiRelation();
  const deleteHajiRelationMutation = useDeleteHajiRelation();
  const relationTypeOptions = [
    { value: 'mother', label: 'Mother' },
    { value: 'father', label: 'Father' },
    { value: 'wife', label: 'Wife' },
    { value: 'husband', label: 'Husband' },
    { value: 'brother', label: 'Brother' },
    { value: 'sister', label: 'Sister' },
    { value: 'son', label: 'Son' },
    { value: 'daughter', label: 'Daughter' },
    { value: 'relative', label: 'Relative' },
    { value: 'other', label: 'Other' },
  ];

  // SMS helpers for sending due reminders
  const smsApiKey = import.meta.env.VITE_SMS_API_KEY;
  const normalizePhoneForSms = (rawPhone) => {
    if (!rawPhone) return null;
    const digitsOnly = String(rawPhone).replace(/\D/g, '');
    if (digitsOnly.startsWith('880')) return digitsOnly;
    if (digitsOnly.startsWith('0')) return `88${digitsOnly}`;
    if (digitsOnly.startsWith('1')) return `880${digitsOnly}`;
    return digitsOnly || null;
  };

  const sendDueSms = async () => {
    const phone = haji?.mobile || haji?.phone;
    const to = normalizePhoneForSms(phone);
    const dueAmount =
      typeof haji?.due === 'number'
        ? haji.due
        : Math.max(Number(haji?.totalAmount || 0) - Number(haji?.paidAmount || 0), 0);

    if (!smsApiKey) {
      setDueSmsStatus({ type: 'error', message: 'SMS API key সেট করা নেই।' });
      return;
    }
    if (!to) {
      setDueSmsStatus({ type: 'error', message: 'সঠিক ফোন নম্বর পাওয়া যায়নি।' });
      return;
    }

    setIsSendingDueSms(true);
    setDueSmsStatus(null);

    const amountText = Number(dueAmount || 0).toLocaleString('en-US');
    const message = `আপনার বকেয়া রয়েছে ${amountText} BDT\nwww.salmaair.com`;

    const payload = new URLSearchParams();
    payload.append('api_key', smsApiKey);
    payload.append('msg', message);
    payload.append('to', to);
    payload.append('type', 'unicode'); // Bangla text needs unicode flag
    const approvedSender = 'Salma Air'; // masking sender approved by gateway
    const senderIdEnv = (import.meta.env.VITE_SMS_SENDER_ID || '').trim();
    const senderId = senderIdEnv && senderIdEnv !== approvedSender ? approvedSender : approvedSender;
    // Always use approved sender to avoid 413 Invalid Sender ID
    payload.append('senderid', senderId);
    payload.append('sender_id', senderId);

    try {
      const response = await fetch('https://api.sms.net.bd/sendsms', {
        method: 'POST',
        body: payload
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error('Due SMS failed response text:', errText);
        throw new Error(`SMS API responded with ${response.status}`);
      }
      const body = await response.text();
      setDueSmsStatus({ type: 'success', message: 'বকেয়ার SMS পাঠানো হয়েছে।' });
    } catch (err) {
      console.error('Failed to send due SMS:', err);
      setDueSmsStatus({ type: 'error', message: 'SMS পাঠানো যায়নি।' });
    } finally {
      setIsSendingDueSms(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: FileText },
    { id: 'package', label: 'Package Info', icon: Package },
    { id: 'financial', label: 'Financial', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: ImageIcon },
    { id: 'relations', label: 'Relation With', icon: Users },
    { id: 'transactions', label: 'Transaction History', icon: Receipt }
  ];

  // Navigate to the Haji list for linking relations
  const handleAssignRelationClick = () => {
    navigate(`/hajj-umrah/haji-list?assignRelationFor=${id}`);
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
              {(() => {
                const photoUrl = haji.photo || haji.photoUrl || haji.image;
                return photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt={haji.name || 'Haji'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null;
              })()}
              <div className={`w-full h-full bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center ${(haji.photo || haji.photoUrl || haji.image) ? 'hidden' : 'flex'}`}>
                <User className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 sm:hidden">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {haji.name || 'N/A'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{getPackageName(haji) || 'Haj'}</p>
              {haji.primaryHolderName && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Assigned With: <span className="font-semibold">{haji.primaryHolderName}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="hidden sm:block">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {haji.name || 'N/A'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{getPackageName(haji) || 'Haj'}</p>
              {haji.primaryHolderName && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                  Assigned With: <span className="font-semibold">{haji.primaryHolderName}</span>
                </p>
              )}
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
            {getStatusBadge(haji.status, haji.serviceStatus)}
            {getPaymentBadge(haji.paymentStatus || 'pending')}
          </div>
        </div>
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{isUmrah ? 'Umrah' : 'Haji'} ID</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{haji.customerId || haji._id || haji.id || 'N/A'}</p>
            </div>
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          </div>
        </div>
        {haji.primaryHolderName && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Assigned With</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{haji.primaryHolderName}</p>
              </div>
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            </div>
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manual Serial Number</p>
              <button
                onClick={() => handleCopyToClipboard(haji.manualSerialNumber, 'Manual Serial Number')}
                className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left w-full"
                title="কপি করতে ক্লিক করুন"
              >
                {haji.manualSerialNumber || 'N/A'}
              </button>
            </div>
            <Copy className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 flex-shrink-0 cursor-pointer hover:text-purple-700 dark:hover:text-purple-300" onClick={() => handleCopyToClipboard(haji.manualSerialNumber, 'Manual Serial Number')} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">PID No</p>
              <button
                onClick={() => handleCopyToClipboard(haji.pidNo, 'PID No')}
                className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left w-full"
                title="কপি করতে ক্লিক করুন"
              >
                {haji.pidNo || 'N/A'}
              </button>
            </div>
            <Copy className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-300" onClick={() => handleCopyToClipboard(haji.pidNo, 'PID No')} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">NG Serial No</p>
              <button
                onClick={() => handleCopyToClipboard(haji.ngSerialNo, 'NG Serial No')}
                className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left w-full"
                title="কপি করতে ক্লিক করুন"
              >
                {haji.ngSerialNo || 'N/A'}
              </button>
            </div>
            <Copy className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 dark:text-teal-400 flex-shrink-0 cursor-pointer hover:text-teal-700 dark:hover:text-teal-300" onClick={() => handleCopyToClipboard(haji.ngSerialNo, 'NG Serial No')} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tracking No</p>
              <button
                onClick={() => handleCopyToClipboard(haji.trackingNo, 'Tracking No')}
                className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left w-full"
                title="কপি করতে ক্লিক করুন"
              >
                {haji.trackingNo || 'N/A'}
              </button>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Copy className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600 dark:text-cyan-400 cursor-pointer hover:text-cyan-700 dark:hover:text-cyan-300" onClick={() => handleCopyToClipboard(haji.trackingNo, 'Tracking No')} />
              <button
                type="button"
                onClick={handleVerifyTracking}
                disabled={!haji.trackingNo}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-md ${
                  haji.trackingNo
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-sm hover:from-cyan-600 hover:to-emerald-600 focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-700'
                    : 'border border-gray-300 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:text-gray-500'
                }`}
                title={haji.trackingNo ? 'Verify tracking on pilgrim portal' : 'No tracking number'}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">{getPackageName(haji)}</p>
            </div>
            <Plane className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">License</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">{getLicenseName(haji)}</p>
            </div>
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
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
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            SMS যাবে নম্বর: <span className="font-medium text-gray-900 dark:text-white">{haji.mobile || haji.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            {dueSmsStatus && (
              <span
                className={`text-sm ${
                  dueSmsStatus.type === 'success'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {dueSmsStatus.message}
              </span>
            )}
            <button
              onClick={sendDueSms}
              disabled={isSendingDueSms || (!haji.mobile && !haji.phone)}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                isSendingDueSms || (!haji.mobile && !haji.phone)
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isSendingDueSms ? 'পাঠানো হচ্ছে...' : 'Due SMS পাঠান'}</span>
            </button>
          </div>
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
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.customerId || haji._id || haji.id || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manual Serial Number</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyToClipboard(haji.manualSerialNumber, 'Manual Serial Number')}
                className="text-sm sm:text-base text-gray-900 dark:text-white break-words hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left flex-1"
                title="কপি করতে ক্লিক করুন"
              >
                {haji.manualSerialNumber || 'N/A'}
              </button>
              <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex-shrink-0" onClick={() => handleCopyToClipboard(haji.manualSerialNumber, 'Manual Serial Number')} />
            </div>
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
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">হাজ্বীর স্ট্যাটাস</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.serviceStatus || haji.status || 'N/A'}</p>
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
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{getPackageName(haji)}</p>
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
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Area</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{area || 'N/A'}</p>
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
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">PID No</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyToClipboard(haji.pidNo, 'PID No')}
                className="text-sm sm:text-base text-gray-900 dark:text-white break-all hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left flex-1"
                title="কপি করতে ক্লিক করুন"
              >
                {haji.pidNo || 'N/A'}
              </button>
              <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex-shrink-0" onClick={() => handleCopyToClipboard(haji.pidNo, 'PID No')} />
            </div>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">NG Serial No</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyToClipboard(haji.ngSerialNo, 'NG Serial No')}
                className="text-sm sm:text-base text-gray-900 dark:text-white break-all hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left flex-1"
                title="কপি করতে ক্লিক করুন"
              >
                {haji.ngSerialNo || 'N/A'}
              </button>
              <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex-shrink-0" onClick={() => handleCopyToClipboard(haji.ngSerialNo, 'NG Serial No')} />
            </div>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tracking No</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyToClipboard(haji.trackingNo, 'Tracking No')}
                className="text-sm sm:text-base text-gray-900 dark:text-white break-all hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left flex-1"
                title="কপি করতে ক্লিক করুন"
              >
                {haji.trackingNo || 'N/A'}
              </button>
              <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex-shrink-0" onClick={() => handleCopyToClipboard(haji.trackingNo, 'Tracking No')} />
            </div>
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

  const renderPackageDetails = () => {
    // Support both packageInfo object and flat package fields
    const packageInfo = haji.packageInfo || haji;
    
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Package Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Package Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package Name</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">{getPackageName(haji)}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package ID</label>
              <p className="text-xs text-gray-900 dark:text-white break-all font-mono">{packageInfo.packageId || haji.packageId || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package Type</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{packageInfo.packageType || haji.packageType || 'N/A'}</p>
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
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.agent || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Agent Contact</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{haji.agentContact || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">License</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{getLicenseName(haji)}</p>
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
          {(haji.specialRequirements || packageInfo.specialRequirements) && (
            <div className="mt-4">
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Special Requirements</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{haji.specialRequirements || packageInfo.specialRequirements}</p>
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
  };

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
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            SMS যাবে নম্বর: <span className="font-medium text-gray-900 dark:text-white">{haji.mobile || haji.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            {dueSmsStatus && (
              <span
                className={`text-sm ${
                  dueSmsStatus.type === 'success'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {dueSmsStatus.message}
              </span>
            )}
            <button
              onClick={sendDueSms}
              disabled={isSendingDueSms || (!haji.mobile && !haji.phone)}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                isSendingDueSms || (!haji.mobile && !haji.phone)
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isSendingDueSms ? 'পাঠানো হচ্ছে...' : 'Due SMS পাঠান'}</span>
            </button>
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
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{getPackageName(haji)}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Package Type</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{haji.packageInfo?.packageType || haji.packageType || 'N/A'}</p>
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
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Assigned With</label>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">
              {(() => {
                const assignedBy = 
                  haji?.assignedBy?.name || 
                  haji?.assignedBy?.email ||
                  haji?.assignedBy ||
                  haji?.createdBy?.name ||
                  haji?.createdBy?.email ||
                  haji?.createdBy ||
                  haji?.createdByUser?.name ||
                  haji?.createdByUser?.email ||
                  haji?.createdByUser ||
                  haji?.assignedByUser?.name ||
                  haji?.assignedByUser?.email ||
                  haji?.assignedByUser ||
                  haji?.user?.name ||
                  haji?.user?.email ||
                  haji?.user ||
                  'N/A';
                return typeof assignedBy === 'object' ? (assignedBy.name || assignedBy.email || 'N/A') : assignedBy;
              })()}
            </p>
          </div>
          {haji.primaryHolderName && (
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Assigned With</label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words font-semibold">
                {haji.primaryHolderName}
              </p>
            </div>
          )}
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
      {/* Uploaded Photos and Documents */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Uploaded Photos & Documents</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Photo */}
          {(() => {
            const photoUrl = haji.photo || haji.photoUrl || haji.image;
            return photoUrl ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Photo</label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <img 
                    src={photoUrl} 
                    alt={`${haji.name || 'Haji'} Photo`}
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
            const passportUrl = haji.passportCopy || haji.passportCopyUrl;
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
                      alt={`${haji.name || 'Haji'} Passport`}
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
            const nidUrl = haji.nidCopy || haji.nidCopyUrl;
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
                      alt={`${haji.name || 'Haji'} NID`}
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
        {!haji.photo && !haji.photoUrl && !haji.image && !haji.passportCopy && !haji.passportCopyUrl && !haji.nidCopy && !haji.nidCopyUrl && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No photos or documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRelations = () => {
    const normalizeId = (value) => (value ? String(value) : null);
    const findHajiById = (idValue) => {
      const target = normalizeId(idValue);
      if (!target) return null;
      const fromFamily = (familySummaryData?.members || []).find((m) => normalizeId(m?._id) === target);
      if (fromFamily) return fromFamily;
      const fromList = (hajiList || []).find(
        (item) =>
          normalizeId(item._id) === target ||
          normalizeId(item.id) === target ||
          normalizeId(item.customerId) === target
      );
      if (fromList) return fromList;
      if (normalizeId(haji?._id) === target || normalizeId(haji?.customerId) === target) return haji;
      return null;
    };

    const resolveName = (relation) => {
      if (!relation) return 'N/A';
      if (typeof relation === 'string') return relation;
      const relId =
        relation.relatedHajiId ||
        relation.hajiId ||
        relation._id ||
        relation.id ||
        relation.customerId;
      const found = findHajiById(relId);
      const fallback =
        relation.name ||
        relation.hajiName ||
        relation.passengerName ||
        relation.relatedName ||
        relation.customerName ||
        relation.fullName ||
        relation.relationWith;
      return found?.name || fallback || 'Unknown Haji';
    };

    const resolveRelationType = (relation) => {
      if (!relation || typeof relation === 'string') return '';
      return (
        relation.relationType ||
        relation.type ||
        relation.relation ||
        relation.label ||
        relation.role ||
        ''
      );
    };

    const resolveContact = (relation) => {
      if (!relation || typeof relation === 'string') return '';
      const relId =
        relation.relatedHajiId ||
        relation.hajiId ||
        relation._id ||
        relation.id ||
        relation.customerId;
      const found = findHajiById(relId);
      return (
        relation.mobile ||
        relation.phone ||
        relation.contact ||
        relation.contactNumber ||
        found?.mobile ||
        found?.phone ||
        ''
      );
    };

    const filteredHajiList = (hajiList || []).filter((item) => {
      const query = relationSearch.trim().toLowerCase();
      if (!query) return true;
      const name = (item.name || '').toLowerCase();
      const mobile = (item.mobile || item.phone || '').toLowerCase();
      const customerId = String(item.customerId || item._id || '').toLowerCase();
      return name.includes(query) || mobile.includes(query) || customerId.includes(query);
    });

    const handleRelationSelect = async (selected) => {
      if (!selected) return;
      // Normalize IDs to strings for consistent comparison
      const normalizeId = (val) => val ? String(val) : null;
      const existingIds = new Set(
        relationsState.map((r) => {
          if (!r) return null;
          if (typeof r === 'string') return normalizeId(r);
          return normalizeId(r._id || r.id || r.hajiId || r.customerId || r.relatedHajiId);
        }).filter(Boolean)
      );
      const selectedId = normalizeId(selected._id || selected.id || selected.customerId);
      if (existingIds.has(selectedId)) {
        setShowRelationPicker(false);
        return;
      }
      try {
        await addRelationMutation.mutateAsync({
          primaryId: id,
          relatedHajiId: selectedId,
          relationType: selectedRelationType || 'relative',
        });
        // Optimistic local add for immediate UI response
        const newRelation = {
          hajiId: selectedId,
          name: selected.name,
          mobile: selected.mobile || selected.phone,
          relationType: selectedRelationType || 'relative',
        };
        setRelationsState((prev) => [...prev, newRelation]);
        setShowRelationPicker(false);
        setSelectedRelationType('relative');
      } catch (err) {
        console.error('Relation add failed:', err);
      }
    };

    const handleDeleteRelation = async (relatedId) => {
      if (!relatedId) return;
      
      const normalizeId = (val) => val ? String(val) : null;
      const relatedIdStr = normalizeId(relatedId);
      const primaryIdStr = normalizeId(id);
      
      if (!relatedIdStr || !primaryIdStr) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'অবৈধ ID পাওয়া যায়নি।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

      if (relatedIdStr === primaryIdStr) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'নিজের সাথে রিলেশন মুছে ফেলা যায় না।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

      // Find the relation to get the name for confirmation
      const relation = relationsState.find((r) => {
        if (!r) return false;
        if (typeof r === 'string') return normalizeId(r) === relatedIdStr;
        const relId = normalizeId(
          r.relatedHajiId || 
          r.relatedUmrahId || 
          r._id || 
          r.id || 
          r.hajiId || 
          r.customerId
        );
        return relId === relatedIdStr;
      });
      const relationName = resolveName(relation) || 'এই হাজি';

      Swal.fire({
        title: 'নিশ্চিত করুন',
        text: `আপনি কি ${relationName} এর সাথে রিলেশন মুছে ফেলতে চান?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
        cancelButtonText: 'বাতিল',
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteHajiRelationMutation.mutateAsync({
              primaryId: primaryIdStr,
              relatedId: relatedIdStr,
            });
            // Optimistic update: remove from local state
            setRelationsState((prev) =>
              prev.filter((r) => {
                if (!r) return false;
                if (typeof r === 'string') return normalizeId(r) !== relatedIdStr;
                const relId = normalizeId(
                  r.relatedHajiId || 
                  r.relatedUmrahId || 
                  r._id || 
                  r.id || 
                  r.hajiId || 
                  r.customerId
                );
                return relId !== relatedIdStr;
              })
            );
          } catch (err) {
            console.error('Relation delete failed:', err);
            // Error is already handled by the mutation hook
          }
        }
      });
    };

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Relation With</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Assign or view linked Hajis for this profile.</p>
            </div>
            <button
              onClick={() => setShowRelationPicker(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base hover:bg-blue-700"
            >
              Assign Relation Haji
            </button>
          </div>
          {haji.primaryHolderName && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Assigned By</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{haji.primaryHolderName}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Family summary (from backend aggregation) */}
        {familySummaryData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Family Total</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                ৳{Number(familySummaryData.familyTotal || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Family Paid</p>
              <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                ৳{Number(familySummaryData.familyPaid || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Family Due</p>
              <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                ৳{Number(familySummaryData.familyDue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">Linked Hajis</h4>
          {relationsState.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {relationsState.map((relation, idx) => {
                const name = resolveName(relation);
                const relationType = resolveRelationType(relation);
                const contact = resolveContact(relation);
                const relId =
                  relation?.relatedHajiId ||
                  relation?.relatedUmrahId ||
                  relation?.hajiId ||
                  relation?._id ||
                  relation?.id ||
                  relation?.customerId ||
                  null;
                const found = relId ? hajiList.find((item) => {
                  const normalized = (val) => (val ? String(val) : null);
                  return (
                    normalized(item._id) === String(relId) ||
                    normalized(item.id) === String(relId) ||
                    normalized(item.customerId) === String(relId)
                  );
                }) || (familySummaryData?.members || []).find((m) => String(m?._id) === String(relId)) : null;
                const displayId = found?.customerId || found?._id || relId;
                const key = relId || idx;
                const isDeleting = deleteHajiRelationMutation.isPending;
                return (
                  <div key={key} className="py-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        ID: {displayId || 'N/A'}
                      </p>
                      {(relationType || contact) && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {relationType ? `${relationType}` : ''}{relationType && contact ? ' • ' : ''}{contact}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteRelation(relId)}
                      disabled={isDeleting}
                      className="ml-3 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove relation"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-6">
              No relations added yet. Use the button above to assign related Hajis.
            </div>
          )}
        </div>

        {/* Relation Picker Modal */}
        {showRelationPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full mx-4">
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Assign Relation Haji</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Search and pick a Haji to link.</p>
                  </div>
                  <button
                    onClick={() => setShowRelationPicker(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <input
                  type="text"
                  value={relationSearch}
                  onChange={(e) => setRelationSearch(e.target.value)}
                  placeholder="Search by name, mobile or ID"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Relation Type
                  </label>
                  <select
                    value={selectedRelationType}
                    onChange={(e) => setSelectedRelationType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  >
                    {relationTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                  {hajiListLoading && (
                    <div className="p-4 text-sm text-gray-600 dark:text-gray-400">Loading hajis...</div>
                  )}
                  {!hajiListLoading && filteredHajiList.length === 0 && (
                    <div className="p-4 text-sm text-gray-600 dark:text-gray-400">No hajis found.</div>
                  )}
                  {!hajiListLoading &&
                    filteredHajiList.map((item) => {
                      const idValue = item.customerId || item._id || item.id;
                      // Normalize IDs to strings for comparison
                      const normalizeId = (val) => val ? String(val) : null;
                      
                      // Get all possible IDs from the item
                      const getItemIds = (it) => {
                        const ids = new Set();
                        if (it._id) ids.add(normalizeId(it._id));
                        if (it.id) ids.add(normalizeId(it.id));
                        if (it.customerId) ids.add(normalizeId(it.customerId));
                        return ids;
                      };
                      
                      // Get all possible IDs from a relation
                      const getRelationIds = (r) => {
                        if (!r) return new Set();
                        if (typeof r === 'string') {
                          return new Set([normalizeId(r)]);
                        }
                        const ids = new Set();
                        if (r._id) ids.add(normalizeId(r._id));
                        if (r.id) ids.add(normalizeId(r.id));
                        if (r.hajiId) ids.add(normalizeId(r.hajiId));
                        if (r.customerId) ids.add(normalizeId(r.customerId));
                        if (r.relatedHajiId) ids.add(normalizeId(r.relatedHajiId));
                        if (r.relatedUmrahId) ids.add(normalizeId(r.relatedUmrahId));
                        return ids;
                      };
                      
                      const itemIds = getItemIds(item);
                      const currentHajiId = normalizeId(id);
                      const currentHajiIds = new Set([
                        normalizeId(haji?._id),
                        normalizeId(haji?.id),
                        normalizeId(haji?.customerId)
                      ].filter(Boolean));
                      
                      // Check if this item is the current Haji (should not show as "Added")
                      const isCurrentHaji = Array.from(itemIds).some(id => currentHajiIds.has(id));
                      
                      // Check if already linked by comparing all possible IDs
                      const alreadyLinked = !isCurrentHaji && relationsState.some((r) => {
                        const relationIds = getRelationIds(r);
                        // Check if any item ID matches any relation ID
                        return Array.from(itemIds).some(itemId => relationIds.has(itemId));
                      });
                      
                      return (
                        <div
                          key={idValue}
                          className="flex items-center justify-between p-3 sm:p-4"
                        >
                    <div className="min-w-0">
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                              {item.name}
                              {alreadyLinked && (
                                <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-normal">(Added)</span>
                              )}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              ID: {idValue || 'N/A'} • {item.mobile || item.phone || 'No phone'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRelationSelect(item)}
                            disabled={alreadyLinked || addRelationMutation.isPending || isCurrentHaji}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm ${
                              alreadyLinked
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : isCurrentHaji
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : addRelationMutation.isPending
                                ? 'bg-blue-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {alreadyLinked ? 'Added' : isCurrentHaji ? 'Current' : addRelationMutation.isPending ? 'Saving...' : 'Select'}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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

  const renderTransactionHistory = () => {
    if (isUmrah) {
      return (
        <div className="p-6 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Transaction history is only available for Haji profiles.</p>
        </div>
      );
    }

    const formatAmount = (amount) => {
      return `৳${Number(amount || 0).toLocaleString()}`;
    };

    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {transactionSummary.totalTransactions || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Credit</p>
            <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
              {formatAmount(transactionSummary.totalCredit)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Debit</p>
            <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
              {formatAmount(transactionSummary.totalDebit)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Net Amount</p>
            <p className={`text-lg sm:text-xl font-bold ${
              (transactionSummary.netAmount || 0) >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatAmount(transactionSummary.netAmount)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">From Date</label>
              <input
                type="date"
                value={transactionFilters.fromDate}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, fromDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">To Date</label>
              <input
                type="date"
                value={transactionFilters.toDate}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, toDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction Type</label>
              <select
                value={transactionFilters.transactionType}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, transactionType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="">All Types</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setTransactionFilters({ fromDate: '', toDate: '', transactionType: '' });
                  setTransactionPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h3>
          {transactionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">No transactions found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                      <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                      <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th>
                      <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Payment Method</th>
                      <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-2 text-xs sm:text-sm text-gray-900 dark:text-white">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            tx.transactionType === 'credit'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {tx.transactionType === 'credit' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )}
                            {tx.transactionType?.toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td className={`py-3 px-2 text-xs sm:text-sm font-semibold ${
                          tx.transactionType === 'credit'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {tx.transactionType === 'credit' ? '+' : '-'}{formatAmount(tx.amount)}
                        </td>
                        <td className="py-3 px-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {tx.serviceCategory || 'N/A'}
                          {tx.subCategory && (
                            <span className="text-gray-500 dark:text-gray-500"> • {tx.subCategory}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {tx.paymentMethod || 'N/A'}
                        </td>
                        <td className="py-3 px-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={tx.notes || ''}>
                          {tx.notes || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {transactionPagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Page {transactionPagination.page} of {transactionPagination.totalPages} ({transactionPagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTransactionPage(prev => Math.max(1, prev - 1))}
                      disabled={transactionPagination.page <= 1}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setTransactionPage(prev => Math.min(transactionPagination.totalPages, prev + 1))}
                      disabled={transactionPagination.page >= transactionPagination.totalPages}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
    );
  };

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
      case 'documents':
        return renderDocuments();
      case 'relations':
        return renderRelations();
      case 'transactions':
        return renderTransactionHistory();
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
          <button 
            onClick={() => setShowPackagePicker(true)}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Add Package</span>
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

export default HajiDetails;
