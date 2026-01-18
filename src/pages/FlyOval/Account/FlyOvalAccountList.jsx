import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Banknote, Building2, CreditCard, TrendingUp, AlertCircle, Edit, Trash2, History, Filter, Search, Eye, Copy } from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import Modal, { ModalFooter } from '../../../components/common/Modal';
import SmallStat from '../../../components/common/SmallStat';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../../../contexts/ThemeContext';
import Swal from 'sweetalert2';
import useSecureAxios from '../../../hooks/UseAxiosSecure';

// Transaction History Component
const TransactionHistory = ({ accountId }) => {
  const axiosSecure = useSecureAxios();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: ''
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock transactions - replace with actual API call
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTransactions([
        { id: 1, date: '2024-01-15', type: 'credit', description: 'Top-up from Agent', amount: 50000, reference: 'TXN-001' },
        { id: 2, date: '2024-01-14', type: 'debit', description: 'Sell to Customer', amount: 25000, reference: 'TXN-002' },
        { id: 3, date: '2024-01-13', type: 'credit', description: 'Top-up from Agent', amount: 75000, reference: 'TXN-003' }
      ]);
      setLoading(false);
    }, 500);
  }, [accountId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            <option value="">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setFilters({type: '', startDate: '', endDate: ''})}
            className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Reference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    transaction.type === 'credit' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`} style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  ৳{transaction.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  {transaction.reference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FlyOvalAccountList = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const axiosSecure = useSecureAxios();
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    accountType: '',
    accountCategory: '',
    currency: '',
    search: ''
  });
  
  // Mock data - replace with actual API call
  const [accounts, setAccounts] = useState([
    {
      _id: '1',
      bankName: 'Dutch Bangla Bank',
      accountTitle: 'FlyOval Main Account',
      accountNumber: '1234567890',
      accountType: 'Current',
      accountCategory: 'bank',
      logo: null,
      initialBalance: 1000000,
      currentBalance: 1250000,
      currency: 'BDT',
      status: 'Active',
      branchName: 'Gulshan Branch',
      accountHolder: 'Fly Oval Limited',
      routingNumber: '098765432'
    },
    {
      _id: '2',
      bankName: 'Brac Bank',
      accountTitle: 'FlyOval Savings Account',
      accountNumber: '9876543210',
      accountType: 'Savings',
      accountCategory: 'bank',
      logo: null,
      initialBalance: 500000,
      currentBalance: 750000,
      currency: 'BDT',
      status: 'Active',
      branchName: 'Dhanmondi Branch',
      accountHolder: 'Fly Oval Limited',
      routingNumber: '123456789'
    }
  ]);

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [balanceData, setBalanceData] = useState({
    amount: '',
    note: '',
    type: 'deposit'
  });

  // Calculate statistics
  const stats = {
    totalAccounts: accounts.length,
    totalBalance: accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0),
    totalInitialBalance: accounts.reduce((sum, acc) => sum + (acc.initialBalance || 0), 0),
    activeAccounts: accounts.filter(acc => acc.status === 'Active').length
  };

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
      sortable: true,
      render: (value) => (
        <span style={{ fontFamily: "'Google Sans', sans-serif" }}>{value}</span>
      )
    },
    {
      key: 'accountTitle',
      header: 'Account Title',
      sortable: true,
      render: (value) => (
        <span style={{ fontFamily: "'Google Sans', sans-serif" }}>{value}</span>
      )
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
        }`} style={{ fontFamily: "'Google Sans', sans-serif" }}>
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
        }`} style={{ fontFamily: "'Google Sans', sans-serif" }}>
          {value?.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      key: 'initialBalance',
      header: 'Initial Balance',
      sortable: true,
      render: (value, item) => (
        <span className="font-semibold text-green-600 dark:text-green-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
          {item.currency} {value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'currentBalance',
      header: 'Current Balance',
      sortable: true,
      render: (value, item) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
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
        }`} style={{ fontFamily: "'Google Sans', sans-serif" }}>
          {value}
        </span>
      )
    }
  ];

  const handleAddAccount = () => {
    navigate('/fly-oval/account/add');
  };

  const handleEditAccount = (account) => {
    navigate(`/fly-oval/account/edit/${account._id}`);
  };

  const handleBalanceAdjustment = (account) => {
    setSelectedAccount(account);
    setBalanceData({
      amount: '',
      note: '',
      type: 'deposit'
    });
    setIsBalanceModalOpen(true);
  };

  const handleCopyAccountInfo = async (account) => {
    if (!account) return;

    const info = [
      `Bank Name: ${account.bankName || ''}`,
      `Account Name: ${account.accountTitle || ''}`,
      `Account Number: ${account.accountNumber || ''}`,
      `Routing Number: ${account.routingNumber || ''}`,
      `Branch: ${account.branchName || ''}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(info);
      Swal.fire({
        title: 'Copied!',
        text: 'Account details copied to clipboard.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleViewTransactions = (account) => {
    setSelectedAccount(account);
    setIsTransactionHistoryOpen(true);
  };

  const handleViewProfile = (account) => {
    navigate(`/fly-oval/account/details/${account._id}`);
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedAccount?._id) return;
      // API call here
      setIsBalanceModalOpen(false);
      setBalanceData({ amount: '', note: '', type: 'deposit' });
      Swal.fire({
        title: 'Success!',
        text: 'Balance adjusted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
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

  const handleDeleteAccount = async (account) => {
    if (!account?._id) return;
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${account.bankName}" account?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280'
    });

    if (result.isConfirmed) {
      try {
        // API call here
        Swal.fire({
          title: 'Success!',
          text: 'Account deleted successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 font-english fly-oval-customer-page" style={{ fontFamily: "'Google Sans', sans-serif" }}>
      <Helmet>
        <title>Account Management - Fly Oval Limited</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
              Account Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
              Manage Fly Oval Limited bank accounts and track balances
            </p>
          </div>
          <button
            onClick={handleAddAccount}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Account
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Search accounts..."
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Account Type
              </label>
              <select
                value={filters.accountType}
                onChange={(e) => handleFilterChange('accountType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                <option value="">All Types</option>
                <option value="Current">Current</option>
                <option value="Savings">Savings</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Account Category
              </label>
              <select
                value={filters.accountCategory}
                onChange={(e) => handleFilterChange('accountCategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Currency
              </label>
              <select
                value={filters.currency}
                onChange={(e) => handleFilterChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
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
                style={{ fontFamily: "'Google Sans', sans-serif" }}
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

        {/* Accounts Table */}
        <DataTable
          data={accounts}
          columns={columns}
          searchable={true}
          exportable={true}
          pagination={true}
          actions={true}
          pageSize={10}
          onEdit={handleEditAccount}
          onDelete={handleDeleteAccount}
          customActions={(account) => (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopyAccountInfo(account)}
                className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-colors duration-200"
                title="Copy Account Info"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewProfile(account)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditAccount(account)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleBalanceAdjustment(account)}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
                title="Adjust Balance"
              >
                <Banknote className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewTransactions(account)}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors duration-200"
                title="View Transactions"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteAccount(account)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />

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
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  Adjusting balance for {selectedAccount?.bankName}
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Current Balance: {selectedAccount?.currency} {selectedAccount?.currentBalance?.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Transaction Type *
              </label>
              <select
                required
                value={balanceData.type}
                onChange={(e) => setBalanceData({...balanceData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
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
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Note
              </label>
              <textarea
                value={balanceData.note}
                onChange={(e) => setBalanceData({...balanceData, note: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Optional note about this transaction..."
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              />
            </div>

            <ModalFooter>
              <button
                type="button"
                onClick={() => setIsBalanceModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
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
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  Transaction history for {selectedAccount?.bankName}
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Account: {selectedAccount?.accountNumber} | Current Balance: {selectedAccount?.currency} {selectedAccount?.currentBalance?.toLocaleString()}
              </p>
            </div>

            <TransactionHistory accountId={selectedAccount?._id} />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default FlyOvalAccountList;
