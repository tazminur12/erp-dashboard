import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Search,
  User,
  Phone,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useLoans, useDeleteLoan } from '../../hooks/useLoanQueries';

const ReceivingList = () => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed, overdue
  const filterType = 'receiving';

  // Build filters object for API
  const filters = {
    loanDirection: filterType,
    ...(filterStatus !== 'all' && { status: filterStatus }),
    ...(searchTerm && { search: searchTerm })
  };

  // Use the loan query hook
  const { data: loansData, isLoading: loading } = useLoans(filters, currentPage, 20);
  const deleteLoanMutation = useDeleteLoan();
  
  const loans = loansData?.loans || [];

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
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'overdue':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleViewLoan = (loan) => {
    navigate(`/loan/details/${loan.loanId || loan._id}`, { state: { loan } });
  };

  const handleNewLoan = () => {
    navigate(`/loan/new-receiving`);
  };

  const handleDeleteLoan = async (loan) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: "আপনি এটি ফিরিয়ে আনতে পারবেন না!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!'
    });

    if (result.isConfirmed) {
      try {
        await deleteLoanMutation.mutateAsync(loan.loanId || loan._id);
        Swal.fire({
          title: 'মুছে ফেলা হয়েছে!',
          text: 'ঋণ সফলভাবে মুছে ফেলা হয়েছে।',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'ঋণ মুছে ফেলতে ব্যর্থ হয়েছে',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };
  

  if (loading) {
    return (
      <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  ঋণ গ্রহণ তালিকা
                </h1>
                <p className={`mt-1 text-lg transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  আপনার সকল গৃহীত ঋণের তালিকা
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={handleNewLoan}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <TrendingUp className="w-5 h-5" />
            নতুন ঋণ গ্রহণ
          </button>
        </div>

        {/* Search and Filters */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 p-6 mb-6 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ঋণ খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="active">সক্রিয়</option>
                <option value="completed">সম্পন্ন</option>
                <option value="overdue">মেয়াদ উত্তীর্ণ</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center">
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {loansData?.totalCount || loans.length} টি ঋণ পাওয়া গেছে
              </span>
            </div>
          </div>
        </div>

        {/* Loans Table */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 overflow-hidden ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          {loans.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className={`text-lg font-semibold mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                কোন ঋণ পাওয়া যায়নি
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {searchTerm || filterStatus !== 'all' 
                  ? 'আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করে চেষ্টা করুন'
                  : 'আপনার প্রথম ঋণ গ্রহণ করুন'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      নাম ও ঠিকানা
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ঋণের পরিমাণ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      পরিশোধ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      বকেয়া
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      কমিট্মেন্ট তারিখ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      স্ট্যাটাস
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      কার্যক্রম
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {loans.map((loan) => (
                    <tr key={loan.loanId || loan._id} className={`hover:${
                      isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                    } transition-colors duration-200`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleViewLoan(loan)}
                              className="text-left text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                            >
                              {loan.fullName}
                            </button>
                            
                            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {loan.contactPhone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency((loan.totalAmount ?? loan.amount ?? 0))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency((loan.paidAmount ?? 0))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-600 dark:text-red-400">
                          {formatCurrency((loan.totalDue ?? (typeof loan.remainingAmount === 'number' ? loan.remainingAmount : Math.max(0, (loan.totalAmount ?? loan.amount ?? 0) - (loan.paidAmount ?? 0)))))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {loan.commitmentDate ? new Date(loan.commitmentDate).toLocaleDateString('en-GB') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {getStatusIcon(loan.status)}
                          {loan.status === 'active' ? 'সক্রিয়' : 
                           loan.status === 'completed' ? 'সম্পন্ন' : 
                           loan.status === 'overdue' ? 'মেয়াদ উত্তীর্ণ' : 
                           loan.status === 'pending' ? 'বিচারাধীন' : 
                           loan.status === 'rejected' ? 'প্রত্যাখ্যাত' : 
                           loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewLoan(loan)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            দেখুন
                          </button>
                          
                          <button
                            onClick={() => handleDeleteLoan(loan)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 flex items-center gap-1 ml-3"
                            disabled={deleteLoanMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                            মুছুন
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceivingList;
