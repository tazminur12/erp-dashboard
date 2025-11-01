import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  Eye,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Plus,
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
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useLoans, useApproveLoan, useRejectLoan } from '../../hooks/useLoanQueries';
import { useAccountQueries } from '../../hooks/useAccountQueries';

const LoanList = () => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const approveLoanMutation = useApproveLoan();
  const rejectLoanMutation = useRejectLoan();
  const accountQueries = useAccountQueries();
  const { data: bankAccounts = [] } = accountQueries.useBankAccounts();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, giving, receiving
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed, overdue

  // Build filters object for API
  const filters = {
    ...(filterType !== 'all' && { loanDirection: filterType }),
    ...(filterStatus !== 'all' && { status: filterStatus }),
    ...(searchTerm && { search: searchTerm })
  };

  // Use the loan query hook
  const { data: loansData, isLoading: loading } = useLoans(filters, currentPage, 20);
  
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-BD');
  };

  const handleViewLoan = (loan) => {
    navigate(`/loan/details/${loan.loanId || loan._id}`, { state: { loan } });
  };

  const handleNewLoan = (type) => {
    navigate(`/loan/new-${type}`);
  };

  const handleApproveLoan = async (loan) => {
    // First, ask for bank account selection
    const accountOptions = bankAccounts.map(acc => 
      `${acc.bankName || acc.accountName} - ${acc.accountNumber} (Balance: ৳${(acc.balance || acc.currentBalance || 0).toLocaleString()})`
    ).join('\n');
    
    const { value: targetAccountId } = await Swal.fire({
      title: 'Select Bank Account for Transaction',
      text: 'Please select which bank account will receive this loan amount:',
      input: 'select',
      inputOptions: bankAccounts.reduce((options, acc) => {
        options[acc._id || acc.id] = `${acc.bankName || acc.accountName} - ${acc.accountNumber} (৳${(acc.balance || acc.currentBalance || 0).toLocaleString()})`;
        return options;
      }, {}),
      showCancelButton: true,
      confirmButtonText: 'Approve Loan',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      background: isDark ? '#1F2937' : '#FFFFFF',
      inputPlaceholder: 'Select account'
    });

    if (!targetAccountId) {
      return; // User cancelled
    }

    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `এই loan application (${loan.fullName}) approve করবেন?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, Approve করুন',
      cancelButtonText: 'না',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      background: isDark ? '#1F2937' : '#FFFFFF'
    });

    if (result.isConfirmed) {
      approveLoanMutation.mutate(
        {
          loanId: loan.loanId || loan._id,
          targetAccountId,
          approvedBy: userProfile?.email || 'unknown_user',
          notes: 'Approved from Loan List'
        },
        {
          onSuccess: () => {
            Swal.fire({
              title: 'সফল!',
              text: 'Loan application approve করা হয়েছে এবং transaction create করা হয়েছে।',
              icon: 'success',
              confirmButtonText: 'ঠিক আছে',
              confirmButtonColor: '#10B981',
              background: isDark ? '#1F2937' : '#FFFFFF'
            });
          },
          onError: (error) => {
            Swal.fire({
              title: 'ত্রুটি!',
              text: error.message || 'Loan approve করতে সমস্যা হয়েছে।',
              icon: 'error',
              confirmButtonText: 'ঠিক আছে',
              confirmButtonColor: '#EF4444',
              background: isDark ? '#1F2937' : '#FFFFFF'
            });
          }
        }
      );
    }
  };

  const handleRejectLoan = async (loan) => {
    const { value: rejectionReason } = await Swal.fire({
      title: 'Rejection Reason',
      text: 'Please provide a reason for rejection:',
      input: 'textarea',
      inputPlaceholder: 'Enter rejection reason...',
      showCancelButton: true,
      confirmButtonText: 'Reject Loan',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      background: isDark ? '#1F2937' : '#FFFFFF'
    });

    if (!rejectionReason) {
      return; // User cancelled
    }

    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `এই loan application (${loan.fullName}) reject করবেন?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, Reject করুন',
      cancelButtonText: 'না',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      background: isDark ? '#1F2937' : '#FFFFFF'
    });

    if (result.isConfirmed) {
      rejectLoanMutation.mutate(
        {
          loanId: loan.loanId || loan._id,
          rejectionReason: rejectionReason.trim(),
          rejectedBy: userProfile?.email || 'unknown_user',
          notes: 'Rejected from Loan List'
        },
        {
          onSuccess: () => {
            Swal.fire({
              title: 'সফল!',
              text: 'Loan application reject করা হয়েছে।',
              icon: 'success',
              confirmButtonText: 'ঠিক আছে',
              confirmButtonColor: '#10B981',
              background: isDark ? '#1F2937' : '#FFFFFF'
            });
          },
          onError: (error) => {
            Swal.fire({
              title: 'ত্রুটি!',
              text: error.message || 'Loan reject করতে সমস্যা হয়েছে।',
              icon: 'error',
              confirmButtonText: 'ঠিক আছে',
              confirmButtonColor: '#EF4444',
              background: isDark ? '#1F2937' : '#FFFFFF'
            });
          }
        }
      );
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
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                  Loan Management
                </h1>
                <p className={`mt-1 text-lg transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Manage all your loan transactions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => handleNewLoan('receiving')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <TrendingUp className="w-5 h-5" />
            New Loan Receiving
          </button>
          <button
            onClick={() => handleNewLoan('giving')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <TrendingDown className="w-5 h-5" />
            New Loan Giving
          </button>
        </div>

        {/* Search and Filters */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 p-6 mb-6 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
              >
                <option value="all">All Types</option>
                <option value="giving">Loan Giving</option>
                <option value="receiving">Loan Receiving</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center">
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
{loansData?.totalCount || loans.length} loan(s) found
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
                No loans found
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first loan transaction'
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
                      Loan Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Interest Rate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {(loan.loanDirection || loan.type) === 'giving' ? (
                            <TrendingDown className="w-5 h-5 text-blue-600" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {loan.loanDirection || loan.type} Loan
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {(loan.loanDirection || loan.type) === 'giving' ? loan.fullName : loan.fullName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {loan.businessName}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {loan.contactPhone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(loan.amount)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Remaining: {formatCurrency(loan.remainingAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {loan.interestRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {loan.duration} months
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatDate((loan.loanDirection || loan.type) === 'giving' ? loan.givenDate : (loan.appliedDate || loan.receivedDate))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {getStatusIcon(loan.status)}
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewLoan(loan)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          {/* Approve/Reject buttons for pending loan applications */}
                          {(loan.loanDirection || loan.type) === 'receiving' && loan.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApproveLoan(loan)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200 flex items-center gap-1"
                                title="Approve Loan"
                              >
                                <ThumbsUp className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectLoan(loan)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 flex items-center gap-1"
                                title="Reject Loan"
                              >
                                <ThumbsDown className="w-4 h-4" />
                                Reject
                              </button>
                            </>
                          )}
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

export default LoanList;
