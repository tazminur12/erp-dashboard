import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plane, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Building2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Share2
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Modal, { ModalFooter } from '../../../components/common/Modal';
import { 
  useIATAAirlinesCappingInvestment,
  useUpdateIATAAirlinesCappingInvestment,
  useDeleteIATAAirlinesCappingInvestment
} from '../../../hooks/useInvestmentQueries';
import Swal from 'sweetalert2';

const IATAAirlinesCappingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    investmentType: 'IATA',
    airlineName: '',
    cappingAmount: '',
    investmentDate: '',
    maturityDate: '',
    interestRate: '',
    status: 'active',
    notes: ''
  });

  // Fetch investment from API
  const { data: investment, isLoading: investmentLoading, error: investmentError } = useIATAAirlinesCappingInvestment(id);
  const updateInvestmentMutation = useUpdateIATAAirlinesCappingInvestment();
  const deleteInvestmentMutation = useDeleteIATAAirlinesCappingInvestment();
  
  // Loading state
  if (investmentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">বিনিয়োগ লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (investmentError || !investment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">বিনিয়োগ পাওয়া যায়নি</p>
              <button
                onClick={() => navigate('/account/investments/iata-airlines-capping')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ফিরে যান
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate days remaining
  const daysRemaining = () => {
    if (!investment.maturityDate) return null;
    const today = new Date();
    const maturity = new Date(investment.maturityDate);
    const diff = maturity - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Calculate expected return
  const expectedReturn = () => {
    const principal = investment.cappingAmount || 0;
    const rate = investment.interestRate || 0;
    const years = 1; // Assuming 1 year for calculation
    return principal * (1 + (rate / 100) * years);
  };

  const handleEdit = () => {
    // Format dates for input fields (YYYY-MM-DD)
    const formatDateForInput = (date) => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    };
    
    setFormData({
      investmentType: investment.investmentType || 'IATA',
      airlineName: investment.airlineName || '',
      cappingAmount: investment.cappingAmount || '',
      investmentDate: formatDateForInput(investment.investmentDate),
      maturityDate: formatDateForInput(investment.maturityDate),
      interestRate: investment.interestRate || '',
      status: investment.status || 'active',
      notes: investment.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই বিনিয়োগ মুছে ফেলা হলে এটি পুনরুদ্ধার করা যাবে না!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteInvestmentMutation.mutateAsync(id);
        Swal.fire({
          title: 'মুছে ফেলা হয়েছে!',
          text: 'বিনিয়োগ সফলভাবে মুছে ফেলা হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        }).then(() => {
          navigate('/account/investments/iata-airlines-capping');
        });
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'বিনিয়োগ মুছে ফেলতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      }
    }
    setShowDeleteModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateInvestmentMutation.mutateAsync({
        id: id,
        ...formData,
        cappingAmount: parseFloat(formData.cappingAmount),
        interestRate: parseFloat(formData.interestRate)
      });
      
      Swal.fire({
        title: 'সফল!',
        text: 'বিনিয়োগ সফলভাবে আপডেট হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
      
      setShowEditModal(false);
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'বিনিয়োগ আপডেট করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mr-2" />
            সক্রিয়
          </span>
        );
      case 'matured':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            পরিপক্ক
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <XCircle className="w-4 h-4 mr-2" />
            বন্ধ
          </span>
        );
      default:
        return null;
    }
  };

  const days = daysRemaining();
  const expectedReturnAmount = expectedReturn();
  const profit = expectedReturnAmount - (investment.cappingAmount || 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Helmet>
        <title>IATA & Airlines Capping Details - {investment.airlineName}</title>
        <meta name="description" content={`Details for ${investment.airlineName} investment`} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/account/investments/iata-airlines-capping')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            {investment.logo ? (
              <div className="w-16 h-16 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 flex items-center justify-center shadow-md">
                <img 
                  src={investment.logo} 
                  alt={investment.airlineName || 'Logo'} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></div>';
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center shadow-md">
                <Plane className="w-8 h-8 text-blue-600" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                {investment.airlineName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                IATA & Airlines Capping Investment Details
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={updateInvestmentMutation.isPending}
            >
              {updateInvestmentMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  আপডেট হচ্ছে...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  সম্পাদনা করুন
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
              disabled={deleteInvestmentMutation.isPending}
            >
              {deleteInvestmentMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  মুছে ফেলছি...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  মুছে ফেলুন
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">বিনিয়োগ পরিমাণ</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ৳{(investment.cappingAmount || 0).toLocaleString('bn-BD')}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg p-6 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">আনুমানিক রিটার্ন</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ৳{expectedReturnAmount.toLocaleString('bn-BD')}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-lg p-6 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">আনুমানিক লাভ</p>
                <p className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ৳{profit.toLocaleString('bn-BD')}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md ${profit >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-pink-600'}`}>
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl shadow-lg p-6 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">দিন বাকি</p>
                <p className={`text-2xl font-bold mt-1 ${days !== null && days < 30 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {days !== null ? (days > 0 ? days : 'সম্পন্ন') : 'N/A'}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Investment Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                বিনিয়োগ তথ্য
              </h2>
              
              {/* Logo Display */}
              {investment.logo && (
                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    এয়ারলাইন লোগো
                  </label>
                  <div className="flex items-center justify-center">
                    <div className="w-32 h-32 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 flex items-center justify-center shadow-md">
                      <img 
                        src={investment.logo} 
                        alt={investment.airlineName || 'Airline Logo'} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement;
                          fallback.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></div>';
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    বিনিয়োগ টাইপ
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {investment.investmentType}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    এয়ারলাইন নাম
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {investment.airlineName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    বিনিয়োগ পরিমাণ
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ৳{(investment.cappingAmount || 0).toLocaleString('bn-BD')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    সুদের হার
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {investment.interestRate}%
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    বিনিয়োগ তারিখ
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {investment.investmentDate ? new Date(investment.investmentDate).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    পরিপক্কতার তারিখ
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {investment.maturityDate ? new Date(investment.maturityDate).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    স্ট্যাটাস
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(investment.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {investment.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  নোট
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {investment.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                দ্রুত কাজ
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                  <Download className="w-5 h-5 mr-2" />
                  PDF ডাউনলোড করুন
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200">
                  <Share2 className="w-5 h-5 mr-2" />
                  শেয়ার করুন
                </button>
              </div>
            </div>

            {/* Investment Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                বিনিয়োগ টাইমলাইন
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      বিনিয়োগ শুরু
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {investment.investmentDate ? new Date(investment.investmentDate).toLocaleDateString('bn-BD') : 'N/A'}
                    </p>
                  </div>
                </div>
                {investment.maturityDate && (
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${days !== null && days <= 0 ? 'bg-green-600' : 'bg-yellow-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        পরিপক্কতার তারিখ
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(investment.maturityDate).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="IATA & Airlines Capping বিনিয়োগ সম্পাদনা করুন"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              বিনিয়োগ টাইপ <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.investmentType}
              onChange={(e) => setFormData({ ...formData, investmentType: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="IATA">IATA</option>
              <option value="Airlines Capping">Airlines Capping</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              এয়ারলাইন নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.airlineName}
              onChange={(e) => setFormData({ ...formData, airlineName: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="এয়ারলাইন নাম লিখুন"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                বিনিয়োগ পরিমাণ (৳) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.cappingAmount}
                onChange={(e) => setFormData({ ...formData, cappingAmount: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                সুদের হার (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                বিনিয়োগ তারিখ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.investmentDate}
                onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                পরিপক্কতার তারিখ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.maturityDate}
                onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              স্ট্যাটাস <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="active">সক্রিয়</option>
              <option value="matured">পরিপক্ক</option>
              <option value="closed">বন্ধ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              নোট
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="অতিরিক্ত নোট লিখুন..."
            />
          </div>

          <ModalFooter>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              আপডেট করুন
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default IATAAirlinesCappingDetails;
