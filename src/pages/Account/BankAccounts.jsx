import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Banknote, Building2, CreditCard, TrendingUp, AlertCircle, Edit, Trash2, History, Filter, Search, Eye } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal, { ModalFooter } from '../../components/common/Modal';
import SmallStat from '../../components/common/SmallStat';
import { useAccountQueries } from '../../hooks/useAccountQueries';
import Swal from 'sweetalert2';

// Transaction History Component
const TransactionHistory = ({ accountId }) => {
  const { useBankAccountTransactions } = useAccountQueries();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: ''
  });

  const { data: transactionData, isLoading, error } = useBankAccountTransactions(accountId, {
    page,
    limit: 10,
    ...filters
  });

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

  const { transactions = [], pagination = {} } = transactionData;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setFilters({type: '', startDate: '', endDate: ''})}
            className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
          >
            Clear
          </button>
        </div>
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
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
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
                    transaction.transactionType === 'credit' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {transaction.transactionType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {transaction.description || transaction.notes}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {transaction.paymentDetails?.amount?.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {transaction.paymentDetails?.reference || transaction.transactionId}
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

const BankAccounts = () => {
  const navigate = useNavigate();
  const { 
    useBankAccounts, 
    useBankAccountStats, 
    useDeleteBankAccount, 
    useAdjustBankAccountBalance,
    useBankAccountTransactions
  } = useAccountQueries();
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    accountType: '',
    accountCategory: '',
    currency: '',
    search: ''
  });
  
  const { data: banks = [], isLoading, error } = useBankAccounts(filters);
  const { data: stats = {} } = useBankAccountStats();
  const deleteBankAccountMutation = useDeleteBankAccount();
  const adjustBalanceMutation = useAdjustBankAccountBalance();

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [balanceData, setBalanceData] = useState({
    amount: '',
    note: '',
    type: 'deposit',
    createdBy: 'SYSTEM', // Default value
    branchId: 'BRANCH001' // Default value - should be dynamic
  });


  // Table columns configuration
  const columns = [
    {
      key: 'logo',
      header: 'Logo',
      sortable: false,
      render: (value) => (
        <div className="flex items-center justify-center">
          {value ? (
            <img 
              src={value} 
              alt="Bank Logo" 
              className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'bankName',
      header: 'Bank Name',
      sortable: true
    },
    {
      key: 'accountTitle',
      header: 'Account Title',
      sortable: true
    },
    {
      key: 'accountType',
      header: 'Account Type',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'Current' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
          value === 'Savings' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'accountCategory',
      header: 'Category',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'bank' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
          value === 'cash' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
          value === 'mobile_banking' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
          value === 'check' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }`}>
          {value?.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      key: 'initialBalance',
      header: 'Initial Balance',
      sortable: true,
      render: (value, item) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {item.currency} {value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'currentBalance',
      header: 'Current Balance',
      sortable: true,
      render: (value, item) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {item.currency} {value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
          {value}
        </span>
      )
    }
  ];


  const handleAddBank = () => {
    navigate('/account/add-bank-account');
  };

  const handleEditBank = (bank) => {
    navigate(`/account/edit-bank-account/${bank._id}`);
  };

  const handleBalanceAdjustment = (bank) => {
    setSelectedBank(bank);
    setBalanceData({
      amount: '',
      note: '',
      type: 'deposit',
      createdBy: 'SYSTEM',
      branchId: 'BRANCH001'
    });
    setIsBalanceModalOpen(true);
  };


  const handleViewTransactions = (bank) => {
    setSelectedBank(bank);
    setIsTransactionHistoryOpen(true);
  };

  const handleViewProfile = (bank) => {
    navigate(`/account/bank-accounts-profile/${bank._id}`);
  };


  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedBank?._id) return;
      await adjustBalanceMutation.mutateAsync({
        id: selectedBank._id,
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


  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      accountType: '',
      accountCategory: '',
      currency: '',
      search: ''
    });
  };

  const handleDeleteBank = async (bank) => {
    if (!bank?._id) return;
    
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark');
    
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `আপনি "${bank.bankName}" ব্যাংক অ্যাকাউন্টটি মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'না, বাতিল করুন',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      background: isDark ? '#1F2937' : '#F9FAFB',
      customClass: {
        title: 'text-red-600 font-bold text-xl',
        popup: 'rounded-2xl shadow-2xl',
        confirmButton: 'px-6 py-2 rounded-lg font-medium',
        cancelButton: 'px-6 py-2 rounded-lg font-medium'
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteBankAccountMutation.mutateAsync(bank._id);
        
        // Success message
        Swal.fire({
          title: 'সফল!',
          text: 'ব্যাংক অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          background: isDark ? '#1F2937' : '#F9FAFB',
          customClass: {
            title: 'text-green-600 font-bold text-xl',
            popup: 'rounded-2xl shadow-2xl'
          }
        });
      } catch (err) {
        console.error('Delete failed:', err);
        
        // Error message
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'ব্যাংক অ্যাকাউন্ট মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
          background: isDark ? '#1F2937' : '#FEF2F2',
          customClass: {
            title: 'text-red-600 font-bold text-xl',
            popup: 'rounded-2xl shadow-2xl'
          }
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bank Accounts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your bank accounts and track balances
            </p>
          </div>
          <button
            onClick={handleAddBank}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Bank Account
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Search banks..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Type
              </label>
              <select
                value={filters.accountType}
                onChange={(e) => handleFilterChange('accountType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="Current">Current</option>
                <option value="Savings">Savings</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Category
              </label>
              <select
                value={filters.accountCategory}
                onChange={(e) => handleFilterChange('accountCategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="mobile_banking">Mobile Banking</option>
                <option value="check">Check</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Currency
              </label>
              <select
                value={filters.currency}
                onChange={(e) => handleFilterChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Currencies</option>
                <option value="BDT">BDT</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SmallStat
            label="Total Accounts"
            value={stats.totalAccounts || 0}
            icon={Building2}
            color="blue"
          />
          <SmallStat
            label="Total Balance"
            value={`BDT ${Number(stats.totalBalance || 0).toLocaleString()}`}
            icon={Banknote}
            color="green"
          />
          <SmallStat
            label="Initial Balance"
            value={`BDT ${Number(stats.totalInitialBalance || 0).toLocaleString()}`}
            icon={CreditCard}
            color="purple"
          />
          <SmallStat
            label="Active Accounts"
            value={`${stats.activeAccounts || 0}/${stats.totalAccounts || 0}`}
            icon={TrendingUp}
            color="yellow"
          />
        </div>

        {/* Bank Accounts Table */}
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bank accounts...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-red-600 dark:text-red-400">Error loading bank accounts</p>
          </div>
        ) : (
          <DataTable
            data={banks}
            columns={columns}
            searchable={true}
            exportable={true}
            pagination={true}
            actions={true}
            pageSize={10}
            onEdit={handleEditBank}
            onDelete={handleDeleteBank}
            customActions={(bank) => (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewProfile(bank)}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditBank(bank)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBalanceAdjustment(bank)}
                  className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
                  title="Adjust Balance"
                >
                  <Banknote className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewTransactions(bank)}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors duration-200"
                  title="View Transactions"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBank(bank)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          />
        )}


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
                  Adjusting balance for {selectedBank?.bankName}
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Current Balance: {selectedBank?.currency} {selectedBank?.currentBalance.toLocaleString()}
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


        {/* Transaction History Modal */}
        <Modal
          isOpen={isTransactionHistoryOpen}
          onClose={() => setIsTransactionHistoryOpen(false)}
          title="Transaction History"
          size="xl"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Transaction history for {selectedBank?.bankName}
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Account: {selectedBank?.accountNumber} | Current Balance: {selectedBank?.currency} {selectedBank?.currentBalance?.toLocaleString()}
              </p>
            </div>

            <TransactionHistory accountId={selectedBank?._id} />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BankAccounts;
