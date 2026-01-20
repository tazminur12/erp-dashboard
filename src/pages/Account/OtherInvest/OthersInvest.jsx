import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Building2,
  FileText,
  Briefcase,
  Loader2
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Modal, { ModalFooter } from '../../../components/common/Modal';
import { 
  useOthersInvestInvestments,
  useDeleteOthersInvestInvestment,
  useUpdateOthersInvestInvestment
} from '../../../hooks/useInvestmentQueries';
import Swal from 'sweetalert2';

const OthersInvest = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [formData, setFormData] = useState({
    investmentName: '',
    investmentType: '',
    investmentAmount: '',
    investmentDate: '',
    maturityDate: '',
    interestRate: '',
    returnAmount: '',
    status: 'active',
    description: '',
    notes: '',
    logo: null
  });

  // Fetch investments from API
  const { data: investmentsData, isLoading: investmentsLoading, refetch } = useOthersInvestInvestments({
    page: 1,
    limit: 100,
    ...(filterType !== 'all' && { status: filterType }),
    ...(searchTerm && { q: searchTerm })
  });
  
  const investments = investmentsData?.data || [];
  const deleteInvestmentMutation = useDeleteOthersInvestInvestment();
  const updateInvestmentMutation = useUpdateOthersInvestInvestment();

  const handleAdd = () => {
    navigate('/account/investments/others-invest/add');
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    // Format dates for input fields (YYYY-MM-DD)
    const formatDateForInput = (date) => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    };
    
    setFormData({
      investmentName: item.investmentName || '',
      investmentType: item.investmentType || '',
      investmentAmount: item.investmentAmount || '',
      investmentDate: formatDateForInput(item.investmentDate),
      maturityDate: formatDateForInput(item.maturityDate),
      interestRate: item.interestRate || '',
      returnAmount: item.returnAmount || '',
      status: item.status || 'active',
      description: item.description || '',
      notes: item.notes || '',
      logo: item.logo || null
    });
    setShowEditModal(true);
  };

  const handleView = (item) => {
    navigate(`/account/investments/others-invest/${item.id || item._id}`);
  };

  const handleDelete = async (id) => {
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
        });
        refetch();
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (showEditModal && selectedItem) {
      try {
        await updateInvestmentMutation.mutateAsync({
          id: selectedItem.id || selectedItem._id,
          ...formData,
          investmentAmount: parseFloat(formData.investmentAmount),
          returnAmount: formData.returnAmount ? parseFloat(formData.returnAmount) : 0,
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
        setSelectedItem(null);
        setFormData({
          investmentName: '',
          investmentType: '',
          investmentAmount: '',
          investmentDate: '',
          maturityDate: '',
          interestRate: '',
          returnAmount: '',
          status: 'active',
          description: '',
          notes: '',
          logo: null
        });
        refetch();
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'বিনিয়োগ আপডেট করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      }
    }
  };

  // Filtering is now handled by the API, but we can add client-side filtering if needed
  const filteredInvestments = investments.filter(item => {
    if (searchTerm) {
      const matchesSearch = (item.investmentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.investmentType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;
    }
    if (filterType !== 'all') {
      return item.status === filterType;
    }
    return true;
  });

  const totalInvestment = investments.reduce((sum, item) => sum + (item.investmentAmount || 0), 0);
  const totalReturn = investments.reduce((sum, item) => sum + (item.returnAmount || 0), 0);
  const activeInvestments = investments.filter(item => item.status === 'active').length;
  const expectedProfit = totalReturn - totalInvestment;
  
  // Loading state
  if (investmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">বিনিয়োগ লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Helmet>
        <title>Others Invest - Investments</title>
        <meta name="description" content="Other investments management" />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/account/investments')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-8 h-8 text-purple-600" />
                Others Invest
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                অন্যান্য বিনিয়োগ ব্যবস্থাপনা
              </p>
            </div>
          </div>
          
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            নতুন বিনিয়োগ যোগ করুন
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-lg p-6 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট বিনিয়োগ</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ৳{totalInvestment.toLocaleString('bn-BD')}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg p-6 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট রিটার্ন</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ৳{totalReturn.toLocaleString('bn-BD')}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">আনুমানিক লাভ</p>
                <p className={`text-2xl font-bold mt-1 ${expectedProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ৳{expectedProfit.toLocaleString('bn-BD')}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md ${expectedProfit >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-pink-600'}`}>
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl shadow-lg p-6 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">সক্রিয় বিনিয়োগ</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {activeInvestments}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="বিনিয়োগ নাম, টাইপ বা বিবরণ দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="active">সক্রিয়</option>
                <option value="matured">পরিপক্ক</option>
                <option value="closed">বন্ধ</option>
              </select>
              <button className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
                <Download className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-700 dark:text-gray-300">এক্সপোর্ট</span>
              </button>
            </div>
          </div>
        </div>

        {/* Investments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">লোগো</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">বিনিয়োগ নাম</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">বিনিয়োগ টাইপ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">বিনিয়োগ পরিমাণ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">রিটার্ন পরিমাণ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">বিনিয়োগ তারিখ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">স্ট্যাটাস</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvestments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">কোন বিনিয়োগ পাওয়া যায়নি</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvestments.map((investment) => (
                    <tr key={investment.id || investment._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 flex items-center justify-center overflow-hidden">
                          {investment.logo && !imageErrors[investment.id || investment._id] ? (
                            <img 
                              src={investment.logo} 
                              alt={investment.investmentName || 'Logo'} 
                              className="w-full h-full object-contain"
                              onError={() => {
                                setImageErrors(prev => ({
                                  ...prev,
                                  [investment.id || investment._id]: true
                                }));
                              }}
                            />
                          ) : (
                            <Briefcase className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {investment.investmentName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
                          {investment.investmentType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        ৳{(investment.investmentAmount || 0).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                        ৳{(investment.returnAmount || 0).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {investment.investmentDate ? new Date(investment.investmentDate).toLocaleDateString('bn-BD') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          investment.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : investment.status === 'matured'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {investment.status === 'active' ? 'সক্রিয়' : investment.status === 'matured' ? 'পরিপক্ক' : 'বন্ধ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(investment)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="ভিউ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(investment)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="আপডেট"
                            disabled={updateInvestmentMutation.isPending}
                          >
                            {updateInvestmentMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Edit className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(investment.id || investment._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="ডিলিট"
                            disabled={deleteInvestmentMutation.isPending}
                          >
                            {deleteInvestmentMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="বিনিয়োগ সম্পাদনা করুন"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              বিনিয়োগ নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.investmentName}
              onChange={(e) => setFormData({ ...formData, investmentName: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="বিনিয়োগের নাম লিখুন"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              বিনিয়োগ টাইপ <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.investmentType}
              onChange={(e) => setFormData({ ...formData, investmentType: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">টাইপ নির্বাচন করুন</option>
              <option value="Stock">Stock</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Mutual Fund">Mutual Fund</option>
              <option value="Fixed Deposit">Fixed Deposit</option>
              <option value="Bond">Bond</option>
              <option value="Cryptocurrency">Cryptocurrency</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                বিনিয়োগ পরিমাণ (৳) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.investmentAmount}
                onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                রিটার্ন পরিমাণ (৳)
              </label>
              <input
                type="number"
                value={formData.returnAmount}
                onChange={(e) => setFormData({ ...formData, returnAmount: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                সুদের হার (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                স্ট্যাটাস <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="active">সক্রিয়</option>
                <option value="matured">পরিপক্ক</option>
                <option value="closed">বন্ধ</option>
              </select>
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
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              বিবরণ
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="বিনিয়োগের বিবরণ লিখুন..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              নোট
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              আপডেট করুন
            </button>
          </ModalFooter>
        </form>
      </Modal>

    </div>
  );
};

export default OthersInvest;
