import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Banknote, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  Edit, 
  Trash2, 
  History, 
  Plus,
  Calendar,
  DollarSign,
  Activity,
  Shield,
  MapPin,
  Phone,
  Mail,
  Globe,
  Download,
  Share2,
  MoreVertical,
  Hash,
  Loader2
} from 'lucide-react';
import Modal, { ModalFooter } from '../../../components/common/Modal';
import SmallStat from '../../../components/common/SmallStat';
import { useAccountQueries } from '../../../hooks/useAccountQueries';
import { generateBankStatementPDF } from '../../../utils/bankpdf';
import Swal from 'sweetalert2';

// Transaction History Component
const TransactionHistory = ({ accountId }) => {
  const { useBankAccountTransactions } = useAccountQueries();
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState(''); // 'today', 'week', 'monthly', 'yearly', 'custom'
  const [filters, setFilters] = useState({
    type: '',
    fromDate: '',
    toDate: ''
  });

  // Calculate date range based on selection
  const getDateRange = (range) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    const toDate = today.toISOString().split('T')[0];

    let fromDate = '';

    switch (range) {
      case 'today':
        fromDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        fromDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'monthly':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        monthAgo.setHours(0, 0, 0, 0);
        fromDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'yearly':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        yearAgo.setHours(0, 0, 0, 0);
        fromDate = yearAgo.toISOString().split('T')[0];
        break;
      case 'custom':
        // Keep existing dates when custom is selected
        return { fromDate: filters.fromDate, toDate: filters.toDate };
      default:
        return { fromDate: '', toDate: '' };
    }

    return { fromDate, toDate };
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range === 'custom') {
      // Keep existing dates, just show custom inputs
      return;
    }
    const dates = getDateRange(range);
    setFilters(prev => ({
      ...prev,
      fromDate: dates.fromDate,
      toDate: dates.toDate
    }));
  };

  // Handle custom date changes
  const handleCustomDateChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const { data: transactionData, isLoading, error } = useBankAccountTransactions(accountId, {
    page,
    limit: 10,
    ...filters
  });

  // Helper function to check if a string is a MongoDB ObjectId
  const isObjectId = (str) => {
    if (!str || typeof str !== 'string') return false;
    // MongoDB ObjectId is 24 hex characters
    return /^[0-9a-fA-F]{24}$/.test(str);
  };

  // Helper function to get transaction description/purpose
  const getTransactionDescription = (transaction) => {
    // Check serviceCategory first (hajj, umrah, etc.)
    if (transaction.serviceCategory) {
      const category = String(transaction.serviceCategory).toLowerCase();
      // Skip if it's an ObjectId
      if (!isObjectId(category)) {
        if (category === 'hajj') return 'Hajj';
        if (category === 'umrah') return 'Umrah';
        if (category === 'loan-giving') return 'Loan Giving';
        if (category === 'loan-repayment') return 'Loan Repayment';
        if (category === 'money-exchange') return 'Money Exchange';
        if (category === 'air-ticketing') return 'Air Ticketing';
        if (category === 'visa-processing') return 'Visa Processing';
        // Return capitalized category name if it's not an ObjectId
        return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
    }
    
    // Check meta.selectedOption (for agent transactions)
    if (transaction.meta?.selectedOption) {
      const option = String(transaction.meta.selectedOption).toLowerCase();
      if (!isObjectId(option)) {
        if (option === 'hajj') return 'Hajj';
        if (option === 'umrah') return 'Umrah';
        return option.charAt(0).toUpperCase() + option.slice(1);
      }
    }
    
    // Check category field
    if (transaction.category) {
      if (typeof transaction.category === 'string') {
        // Skip if it's an ObjectId
        if (!isObjectId(transaction.category)) {
          return transaction.category;
        }
      } else if (typeof transaction.category === 'object') {
        // If category is an object, try to get name
        if (transaction.category.name) {
          return transaction.category.name;
        }
        // If category has _id but not name, skip it
        if (transaction.category._id && !transaction.category.name) {
          // Skip ObjectId, continue to next check
        }
      }
    }
    
    // Check notes if available
    if (transaction.notes && transaction.notes.trim()) {
      const notes = transaction.notes.trim();
      // Skip if notes is just an ObjectId
      if (!isObjectId(notes)) {
        return notes.length > 50 
          ? notes.substring(0, 50) + '...' 
          : notes;
      }
    }
    
    // Check description field
    if (transaction.description) {
      const desc = String(transaction.description);
      // Skip if description is an ObjectId
      if (!isObjectId(desc)) {
        return desc;
      }
    }
    
    // Default
    return 'N/A';
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">Error loading transactions</p>
      </div>
    );
  }

  const { transactions = [], pagination = {}, summary = {} } = transactionData || {};

  return (
    <div className="space-y-4">
      {/* Summary Statistics */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Transactions</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{summary.totalTransactions || 0}</p>
          </div>
          <div>
            <p className="text-xs text-green-600 dark:text-green-400">Total Credit</p>
            <p className="text-lg font-semibold text-green-700 dark:text-green-300">
              {summary.totalCredit?.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-red-600 dark:text-red-400">Total Debit</p>
            <p className="text-lg font-semibold text-red-700 dark:text-red-300">
              {summary.totalDebit?.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-purple-600 dark:text-purple-400">Transfer In</p>
            <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">
              {summary.totalTransferIn?.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-orange-600 dark:text-orange-400">Transfer Out</p>
            <p className="text-lg font-semibold text-orange-700 dark:text-orange-300">
              {summary.totalTransferOut?.toLocaleString() || '0'}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">Week</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Date</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setDateRange('');
                setFilters({type: '', fromDate: '', toDate: ''});
              }}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        </div>
        
        {/* Custom Date Inputs - Show only when Custom is selected */}
        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-300 dark:border-gray-600">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleCustomDateChange('fromDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleCustomDateChange('toDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Reference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    transaction.isTransfer
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                      : transaction.transactionType === 'credit' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {transaction.isTransfer ? 'Transfer' : transaction.transactionType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {transaction.isTransfer
                    ? transaction.transferDetails?.transferAmount?.toLocaleString() || '0'
                    : transaction.paymentDetails?.amount?.toLocaleString() || transaction.amount?.toLocaleString() || '0'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {getTransactionDescription(transaction)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {transaction.isTransfer
                    ? transaction.transferDetails?.reference || transaction.transactionId
                    : transaction.paymentDetails?.reference || transaction.transactionId || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                <span className="font-medium">{pagination.totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BankAccountsProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    useBankAccount, 
    useDeleteBankAccount, 
    useAdjustBankAccountBalance,
    useCreateBankAccountTransaction,
    useBankAccountTransactions
  } = useAccountQueries();
  
  const { data: bankAccount, isLoading, error } = useBankAccount(id);
  const deleteBankAccountMutation = useDeleteBankAccount();
  const adjustBalanceMutation = useAdjustBankAccountBalance();
  const createTransactionMutation = useCreateBankAccountTransaction();

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [balanceData, setBalanceData] = useState({
    amount: '',
    note: '',
    type: 'deposit',
    createdBy: 'SYSTEM',
    branchId: 'BRANCH001'
  });
  const [transactionData, setTransactionData] = useState({
    transactionType: 'credit',
    amount: '',
    description: '',
    reference: '',
    notes: '',
    createdBy: 'SYSTEM',
    branchId: 'BRANCH001'
  });
  const { data: statementTransactionsData } = useBankAccountTransactions(id, { 
    page: 1, 
    limit: 50,
    includeBalanceHistory: true 
  });
  const transactions = statementTransactionsData?.transactions ?? [];
  const statementSummary = statementTransactionsData?.summary || {};

  const totals = useMemo(() => {
    // Use summary data from API if available, otherwise calculate
    const deposits = statementSummary.totalCredit || transactions
      .filter(tx => !tx.isTransfer && tx.transactionType === 'credit')
      .reduce((sum, tx) => sum + (tx.paymentDetails?.amount || tx.amount || 0), 0);
    
    const withdrawals = statementSummary.totalDebit || transactions
      .filter(tx => !tx.isTransfer && tx.transactionType === 'debit')
      .reduce((sum, tx) => sum + (tx.paymentDetails?.amount || tx.amount || 0), 0);

    const transferIn = statementSummary.totalTransferIn || transactions
      .filter(tx => tx.isTransfer && tx.transferDetails?.toAccountId?.toString() === id)
      .reduce((sum, tx) => sum + (tx.transferDetails?.transferAmount || 0), 0);
    
    const transferOut = statementSummary.totalTransferOut || transactions
      .filter(tx => tx.isTransfer && tx.transferDetails?.fromAccountId?.toString() === id)
      .reduce((sum, tx) => sum + (tx.transferDetails?.transferAmount || 0), 0);

    const closingBalance = bankAccount?.currentBalance ?? 0;
    const openingBalance = bankAccount?.initialBalance ?? (closingBalance - deposits - transferIn + withdrawals + transferOut);

    const sortedDates = transactions
      .map(tx => new Date(tx.date || tx.createdAt))
      .filter(date => !Number.isNaN(date.getTime()))
      .sort((a, b) => a - b);

    const periodStart = sortedDates[0] || (bankAccount?.createdAt ? new Date(bankAccount.createdAt) : null);
    const periodEnd = sortedDates[sortedDates.length - 1] || (bankAccount?.updatedAt ? new Date(bankAccount.updatedAt) : new Date());

    return {
      deposits,
      withdrawals,
      transferIn,
      transferOut,
      openingBalance,
      closingBalance,
      periodStart,
      periodEnd
    };
  }, [transactions, bankAccount, statementSummary, id]);

  const formatCurrency = (value) => {
    if (!bankAccount?.currency) {
      return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return `${bankAccount.currency} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (value) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditAccount = () => {
    navigate(`/account/edit-bank-account/${id}`);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(`Are you sure you want to delete ${bankAccount?.bankName} account?`)) {
      try {
        await deleteBankAccountMutation.mutateAsync(id);
        navigate('/account/bank-accounts');
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleBalanceAdjustment = () => {
    setBalanceData({
      amount: '',
      note: '',
      type: 'deposit',
      createdBy: 'SYSTEM',
      branchId: 'BRANCH001'
    });
    setIsBalanceModalOpen(true);
  };

  const handleCreateTransaction = () => {
    setTransactionData({
      transactionType: 'credit',
      amount: '',
      description: '',
      reference: '',
      notes: '',
      createdBy: 'SYSTEM',
      branchId: 'BRANCH001'
    });
    setIsTransactionModalOpen(true);
  };

  const handleDownloadStatement = async () => {
    if (isGeneratingPdf || !bankAccount) {
      return;
    }

    try {
      setIsGeneratingPdf(true);

      // Prepare statement data
      const statementData = {
        bankAccount: {
          bankName: bankAccount.bankName,
          branchName: bankAccount.branchName,
          accountHolder: bankAccount.accountHolder,
          accountTitle: bankAccount.accountTitle,
          accountNumber: bankAccount.accountNumber,
          accountType: bankAccount.accountType,
          customerId: bankAccount.customerId,
          routingNumber: bankAccount.routingNumber,
          currency: bankAccount.currency || 'BDT',
          telephone: bankAccount.telephone,
          address: bankAccount.address,
          createdAt: bankAccount.createdAt
        },
        transactions: transactions.map(transaction => ({
          _id: transaction._id,
          date: transaction.date || transaction.createdAt,
          transactionType: transaction.transactionType,
          isTransfer: transaction.isTransfer,
          amount: transaction.amount,
          paymentDetails: transaction.paymentDetails,
          transferDetails: transaction.transferDetails,
          serviceCategory: transaction.serviceCategory,
          meta: transaction.meta,
          category: transaction.category,
          description: transaction.description,
          notes: transaction.notes,
          balanceAfter: transaction.paymentDetails?.balanceAfter ?? transaction.balanceAfter
        })),
        totals: {
          openingBalance: totals.openingBalance,
          deposits: totals.deposits,
          withdrawals: totals.withdrawals,
          transferIn: totals.transferIn,
          transferOut: totals.transferOut,
          closingBalance: totals.closingBalance
        },
        periodStart: totals.periodStart,
        periodEnd: totals.periodEnd
      };

      // Generate PDF
      const result = await generateBankStatementPDF(statementData, {
        download: true,
        filename: `Bank_Statement_${bankAccount.accountNumber || id || 'account'}_${new Date().toISOString().split('T')[0]}.pdf`
      });

      if (result.success) {
        Swal.fire({
          title: 'সফল!',
          text: 'ব্যাংক স্টেটমেন্ট সফলভাবে ডাউনলোড হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981'
        });
      } else {
        throw new Error(result.error || 'PDF generation failed');
      }
    } catch (error) {
      console.error('Statement generation failed:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'স্টেটমেন্ট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    try {
      await adjustBalanceMutation.mutateAsync({
        id,
        amount: balanceData.amount,
        type: balanceData.type,
        note: balanceData.note,
        createdBy: balanceData.createdBy,
        branchId: balanceData.branchId,
      });
      setIsBalanceModalOpen(false);
      setBalanceData({ amount: '', note: '', type: 'deposit', createdBy: 'SYSTEM', branchId: 'BRANCH001' });
    } catch (err) {
      console.error('Balance adjustment failed:', err);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTransactionMutation.mutateAsync({
        id,
        ...transactionData,
        amount: parseFloat(transactionData.amount),
      });
      setIsTransactionModalOpen(false);
      setTransactionData({
        transactionType: 'credit',
        amount: '',
        description: '',
        reference: '',
        notes: '',
        createdBy: 'SYSTEM',
        branchId: 'BRANCH001'
      });
    } catch (err) {
      console.error('Transaction creation failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bank account details...</p>
        </div>
      </div>
    );
  }

  if (error || !bankAccount) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The bank account you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/account/bank-accounts')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bank Accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/account/bank-accounts')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {bankAccount.bankName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Account Details & Transaction History
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={handleEditAccount}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Account
            </button>
            <button
              onClick={handleDeleteAccount}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Account Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Information</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBalanceAdjustment}
                    className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
                    title="Adjust Balance"
                  >
                    <Banknote className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCreateTransaction}
                    className="p-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors duration-200"
                    title="Create Transaction"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Bank Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{bankAccount.bankName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Account Number</p>
                      <p className="font-medium text-gray-900 dark:text-white">{bankAccount.accountNumber}</p>
                    </div>
                  </div>

                  {bankAccount.routingNumber && (
                    <div className="flex items-center space-x-3">
                      <Hash className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Routing Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">{bankAccount.routingNumber}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Account Type</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        bankAccount.accountType === 'Current' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        bankAccount.accountType === 'Savings' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                      }`}>
                        {bankAccount.accountType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Currency</p>
                      <p className="font-medium text-gray-900 dark:text-white">{bankAccount.currency}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Account Title</p>
                      <p className="font-medium text-gray-900 dark:text-white">{bankAccount.accountTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        bankAccount.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {bankAccount.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(bankAccount.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {bankAccount.branchName && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Branch</p>
                        <p className="font-medium text-gray-900 dark:text-white">{bankAccount.branchName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {bankAccount.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{bankAccount.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Balance Statistics */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Balance Overview</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {bankAccount.currency} {bankAccount.currentBalance?.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Initial Balance</p>
                  <p className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
                    {bankAccount.currency} {bankAccount.initialBalance?.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Balance Change</p>
                  <p className={`text-xl font-semibold ${
                    (bankAccount.currentBalance - bankAccount.initialBalance) >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {bankAccount.currency} {(bankAccount.currentBalance - bankAccount.initialBalance).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleBalanceAdjustment}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Banknote className="w-4 h-4 mr-2" />
                  Adjust Balance
                </button>
                <button
                  onClick={handleCreateTransaction}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Transaction
                </button>
                <button
                  onClick={handleDownloadStatement}
                  disabled={isGeneratingPdf}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Statement
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction History</h2>
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Account: {bankAccount.accountNumber}
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <TransactionHistory accountId={id} />
          </div>
        </div>

        {/* Balance Adjustment Modal */}
        <Modal
          isOpen={isBalanceModalOpen}
          onClose={() => setIsBalanceModalOpen(false)}
          title="Adjust Account Balance"
          size="md"
        >
          <form onSubmit={handleBalanceSubmit} className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Adjusting balance for {bankAccount?.bankName}
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Current Balance: {bankAccount?.currency} {bankAccount?.currentBalance?.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Type *
              </label>
              <select
                required
                value={balanceData.type}
                onChange={(e) => setBalanceData({...balanceData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={balanceData.amount}
                onChange={(e) => setBalanceData({...balanceData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Note
              </label>
              <textarea
                value={balanceData.note}
                onChange={(e) => setBalanceData({...balanceData, note: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Optional note about this transaction..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Created By
              </label>
              <input
                type="text"
                value={balanceData.createdBy}
                onChange={(e) => setBalanceData({...balanceData, createdBy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="User ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Branch ID
              </label>
              <input
                type="text"
                value={balanceData.branchId}
                onChange={(e) => setBalanceData({...balanceData, branchId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Branch ID"
              />
            </div>

            <ModalFooter>
              <button
                type="button"
                onClick={() => setIsBalanceModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                {balanceData.type === 'deposit' ? 'Add Deposit' : 'Process Withdrawal'}
              </button>
            </ModalFooter>
          </form>
        </Modal>

        {/* Transaction Creation Modal */}
        <Modal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          title="Create Bank Transaction"
          size="lg"
        >
          <form onSubmit={handleTransactionSubmit} className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Creating transaction for {bankAccount?.bankName}
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Current Balance: {bankAccount?.currency} {bankAccount?.currentBalance?.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction Type *
                </label>
                <select
                  required
                  value={transactionData.transactionType}
                  onChange={(e) => setTransactionData({...transactionData, transactionType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="credit">Credit (Deposit)</option>
                  <option value="debit">Debit (Withdrawal)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={transactionData.description}
                  onChange={(e) => setTransactionData({...transactionData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Transaction description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reference
                </label>
                <input
                  type="text"
                  value={transactionData.reference}
                  onChange={(e) => setTransactionData({...transactionData, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Reference number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Created By
                </label>
                <input
                  type="text"
                  value={transactionData.createdBy}
                  onChange={(e) => setTransactionData({...transactionData, createdBy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="User ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Branch ID
                </label>
                <input
                  type="text"
                  value={transactionData.branchId}
                  onChange={(e) => setTransactionData({...transactionData, branchId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Branch ID"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={transactionData.notes}
                  onChange={(e) => setTransactionData({...transactionData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <ModalFooter>
              <button
                type="button"
                onClick={() => setIsTransactionModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTransactionMutation.isPending}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors duration-200 flex items-center"
              >
                {createTransactionMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Transaction'
                )}
              </button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default BankAccountsProfile;
