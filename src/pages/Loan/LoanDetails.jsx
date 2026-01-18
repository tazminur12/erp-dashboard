import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useLoan, useGivingLoan, useReceivingLoan } from '../../hooks/useLoanQueries';
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Edit,
  Download,
  Loader2,
  CreditCard,
  Home,
  Briefcase,
  UserCircle,
  CalendarDays,
  FileCheck
} from 'lucide-react';
import Swal from 'sweetalert2';

// Convert Arabic numerals to Bengali numerals
const toBengaliNumeral = (num) => {
  if (num === null || num === undefined || num === '...') return num;
  
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const numStr = String(num);
  
  // If it's a formatted number with commas, preserve the commas
  if (numStr.includes(',')) {
    return numStr.split(',').map(part => {
      return part.split('').map(char => {
        if (char >= '0' && char <= '9') {
          return bengaliDigits[parseInt(char)];
        }
        return char;
      }).join('');
    }).join(',');
  }
  
  // Convert each digit (only Arabic digits 0-9, leave other characters unchanged)
  return numStr.split('').map(char => {
    if (char >= '0' && char <= '9') {
      return bengaliDigits[parseInt(char)];
    }
    return char;
  }).join('');
};

const LoanDetails = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { loan: loanFromState } = location.state || {};
  
  // Determine loan direction from state or fetch to determine which hook to use
  const loanDirection = loanFromState?.loanDirection;
  
  // Use appropriate hook based on loan direction, or generic if unknown
  const { data: givingData, isLoading: givingLoading } = useGivingLoan(loanDirection === 'giving' ? id : null);
  const { data: receivingData, isLoading: receivingLoading } = useReceivingLoan(loanDirection === 'receiving' ? id : null);
  const { data: genericData, isLoading: genericLoading } = useLoan((!loanDirection && id) ? id : null);
  
  const isLoading = givingLoading || receivingLoading || genericLoading;
  const loanData = givingData || receivingData || genericData;
  
  // Use API data if available (most up-to-date), otherwise fall back to state
  const loan = loanData?.loan || loanFromState;
  const transactionSummary = loanData?.transactionSummary;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'সক্রিয়';
      case 'completed':
        return 'সম্পন্ন';
      case 'pending':
        return 'বিচারাধীন';
      case 'rejected':
        return 'প্রত্যাখ্যাত';
      case 'closed':
        return 'বন্ধ';
      case 'overdue':
        return 'মেয়াদ উত্তীর্ণ';
      default:
        return status || 'অজানা';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      case 'closed':
        return <FileCheck className="w-5 h-5" />;
      case 'overdue':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount || 0);
    // Convert the numeric part to Bengali numerals, keep the currency symbol
    return formatted.replace(/([৳\s])([\d,]+)/g, (match, symbol, numbers) => {
      return symbol + toBengaliNumeral(numbers);
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  };

  if (isLoading && !loanFromState) {
    return (
      <div className={`min-h-screen p-3 lg:p-6 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-base">ঋণের তথ্য লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className={`min-h-screen p-3 lg:p-6 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ঋণ পাওয়া যায়নি
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              আপনি যে ঋণটি খুঁজছেন তা পাওয়া যায়নি বা মুছে ফেলা হয়েছে।
            </p>
            <button
              onClick={() => navigate('/loan/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              ঋণ তালিকায় ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isGiving = (loan.loanDirection || loan.type) === 'giving';
  const progressPercentage = loan.totalAmount ? Math.min(100, ((loan.paidAmount ?? 0) / loan.totalAmount) * 100) : 0;

  return (
    <div className={`min-h-screen p-3 lg:p-6 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className={`p-1.5 rounded-lg transition-colors duration-200 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 flex-1">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                isGiving
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-br from-green-500 to-green-600'
              }`}>
                {isGiving ? (
                  <TrendingDown className="w-5 h-5 text-white" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                  ঋণের বিস্তারিত তথ্য
                </h1>
                <p className={`mt-0.5 text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {isGiving ? 'ঋণ প্রদান' : 'ঋণ গ্রহণ'} - {loan.loanId || id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border transition-colors duration-300 mb-4 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className={`p-4 border-b ${
            isDark ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700' : 'border-gray-100 bg-gradient-to-r from-blue-50 to-green-50'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(loan.status)}`}>
                  {getStatusIcon(loan.status)}
                  {getStatusText(loan.status)}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                  isGiving 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  {isGiving ? 'ঋণ প্রদান' : 'ঋণ গ্রহণ'}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const loanDir = loan?.loanDirection || loan?.type;
                    if (loanDir === 'giving') {
                      navigate(`/loan/edit-giving/${id}`);
                    } else if (loanDir === 'receiving') {
                      navigate(`/loan/edit-receiving/${id}`);
                    } else {
                      navigate(`/loan/edit-receiving/${id}`);
                    }
                  }} 
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-sm font-medium"
                >
                  <Edit className="w-3.5 h-3.5" />
                  সম্পাদনা
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium shadow-md">
                  <Download className="w-3.5 h-3.5" />
                  ডাউনলোড
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4">
            {/* Personal & Contact Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <UserCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    ব্যক্তিগত তথ্য
                  </h3>
                </div>

                {/* Profile Photo */}
                {loan.profilePhoto && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">প্রোফাইল ছবি</p>
                    <div className="relative w-20 h-20 rounded-full border-2 border-white dark:border-gray-700 shadow-sm overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={loan.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600" style={{ display: 'none' }}>
                        <UserCircle className="w-10 h-10 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">পূর্ণ নাম</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-base">
                        {loan.fullName || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {(loan.firstName || loan.lastName) && (
                    <div className="grid grid-cols-2 gap-2.5">
                      {loan.firstName && (
                        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">নামের প্রথম অংশ</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.firstName}</p>
                        </div>
                      )}
                      {loan.lastName && (
                        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">নামের শেষ অংশ</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.lastName}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {loan.fatherName && (
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">পিতার নাম</p>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.fatherName}</p>
                    </div>
                  )}

                  {loan.motherName && (
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">মাতার নাম</p>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.motherName}</p>
                    </div>
                  )}

                  {loan.dateOfBirth && (
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">জন্ম তারিখ</p>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{formatDate(loan.dateOfBirth)}</p>
                    </div>
                  )}

                  {loan.nidNumber && (
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        জাতীয় পরিচয়পত্র নম্বর
                      </p>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.nidNumber}</p>
                    </div>
                  )}
                </div>

                {/* NID Images */}
                {(loan.nidFrontImage || loan.nidBackImage) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      জাতীয় পরিচয়পত্রের ছবি
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {loan.nidFrontImage && (
                        <div className="space-y-1.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400">এনআইডি সামনের দিক</p>
                          <div className="relative w-full aspect-[16/10] rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800 shadow-sm">
                            <img
                              src={loan.nidFrontImage}
                              alt="NID Front"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700" style={{ display: 'none' }}>
                              <FileText className="w-10 h-10 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      )}
                      {loan.nidBackImage && (
                        <div className="space-y-1.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400">এনআইডি পিছনের দিক</p>
                          <div className="relative w-full aspect-[16/10] rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800 shadow-sm">
                            <img
                              src={loan.nidBackImage}
                              alt="NID Back"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700" style={{ display: 'none' }}>
                              <FileText className="w-10 h-10 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact & Address Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    যোগাযোগ ও ঠিকানা
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {loan.contactPhone && (
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">মোবাইল নম্বর</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-base">
                          {loan.contactPhone}
                        </p>
                      </div>
                    </div>
                  )}

                  {loan.contactEmail && (
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">ইমেইল</p>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.contactEmail}</p>
                      </div>
                    </div>
                  )}

                  {loan.presentAddress && (
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <Home className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">বর্তমান ঠিকানা</p>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.presentAddress}</p>
                        {loan.district && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {loan.district}{loan.upazila ? `, ${loan.upazila}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {loan.permanentAddress && (
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">স্থায়ী ঠিকানা</p>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.permanentAddress}</p>
                      </div>
                    </div>
                  )}

                  {loan.emergencyContact && (
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">জরুরি যোগাযোগ</p>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.emergencyContact}</p>
                      {loan.emergencyPhone && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{loan.emergencyPhone}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Information (for receiving loans) */}
            {!isGiving && (loan.businessName || loan.businessType) && (
              <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    ব্যবসায়িক তথ্য
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {loan.businessName && (
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">ব্যবসার নাম</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{loan.businessName}</p>
                    </div>
                  )}
                  {loan.businessType && (
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">ব্যবসার ধরন</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{loan.businessType}</p>
                    </div>
                  )}
                  {loan.businessAddress && (
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 md:col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">ব্যবসার ঠিকানা</p>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{loan.businessAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loan Information */}
            <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  ঋণের তথ্য
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {loan.commencementDate && (
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">শুরুর তারিখ</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-base">
                      {formatDate(loan.commencementDate)}
                    </p>
                  </div>
                )}

                {loan.completionDate && (
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      <p className="text-xs font-medium text-green-700 dark:text-green-300">সমাপ্তির তারিখ</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-base">
                      {formatDate(loan.completionDate)}
                    </p>
                  </div>
                )}

                {loan.commitmentDate && (
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <p className="text-xs font-medium text-purple-700 dark:text-purple-300">কমিট্মেন্ট তারিখ</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-base">
                      {formatDate(loan.commitmentDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  আর্থিক সারসংক্ষেপ
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border shadow-md ${
                  isDark ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300'
                }`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">মোট ঋণের পরিমাণ</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(loan.totalAmount ?? 0)}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg border shadow-md ${
                  isDark ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-700' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                }`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <p className="text-xs font-semibold text-green-700 dark:text-green-300">মোট পরিশোধ</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(loan.paidAmount ?? 0)}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg border shadow-md ${
                  isDark ? 'bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-700' : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300'
                }`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">মোট বাকি</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(loan.totalDue ?? 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  পরিশোধের অগ্রগতি
                </h3>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {toBengaliNumeral(progressPercentage.toFixed(1))}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2 shadow-inner">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 shadow-md ${
                    progressPercentage >= 100 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : progressPercentage >= 50
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  }`}
                  style={{ width: `${Math.min(100, progressPercentage)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    পরিশোধ: <span className="text-green-600 dark:text-green-400 font-bold">{formatCurrency(loan.paidAmount ?? 0)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    বাকি: <span className="text-amber-600 dark:text-amber-400 font-bold">{formatCurrency(loan.totalDue ?? 0)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            {transactionSummary && transactionSummary.count > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2.5 mb-3">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    লেনদেনের ইতিহাস
                  </h3>
                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold">
                    {toBengaliNumeral(transactionSummary.count)} টি
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border ${
                    isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300'
                  }`}>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">মোট গ্রহণ</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(transactionSummary.totalReceived || 0)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg border ${
                    isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'
                  }`}>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">মোট প্রদান</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(transactionSummary.totalPaid || 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {loan.notes && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2.5 mb-3">
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">নোট</h3>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{loan.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;
