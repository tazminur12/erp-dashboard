import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Building2, 
  Banknote, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
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
  Loader2
} from 'lucide-react';
import Modal, { ModalFooter } from '../../../components/common/Modal';
import SmallStat from '../../../components/common/SmallStat';
import { useTheme } from '../../../contexts/ThemeContext';
import useSecureAxios from '../../../hooks/UseAxiosSecure';
import Swal from 'sweetalert2';

// Transaction History Component
const TransactionHistory = ({ accountId }) => {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    fromDate: '',
    toDate: ''
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const getDateRange = (range) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
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
      default:
        return { fromDate: filters.fromDate, toDate: filters.toDate };
    }

    return { fromDate, toDate };
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range === 'custom') {
      return;
    }
    const dates = getDateRange(range);
    setFilters(prev => ({
      ...prev,
      fromDate: dates.fromDate,
      toDate: dates.toDate
    }));
  };

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
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
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
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              Clear
            </button>
          </div>
        </div>
        
        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-300 dark:border-gray-600">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                From Date
              </label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                To Date
              </label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({...filters, toDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Description
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  ৳{transaction.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  {transaction.description}
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

const FlyOvalAccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const axiosSecure = useSecureAxios();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [balanceData, setBalanceData] = useState({
    amount: '',
    note: '',
    type: 'deposit'
  });

  // Mock data - replace with actual API call
  const mockAccounts = [
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
      routingNumber: '098765432',
      contactNumber: '+8801712345678',
      createdAt: '2020-03-15'
    }
  ];

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          const foundAccount = mockAccounts.find(a => a._id === id);
          if (foundAccount) {
            setAccount(foundAccount);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Account Not Found',
              text: 'The requested account could not be found.'
            });
            navigate('/fly-oval/account');
          }
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching account:', error);
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load account details.'
        });
        navigate('/fly-oval/account');
      }
    };

    fetchAccount();
  }, [id, navigate]);

  const formatCurrency = (value) => {
    return `${account?.currency || 'BDT'} ${Number(value || 0).toLocaleString()}`;
  };

  const handleEditAccount = () => {
    navigate(`/fly-oval/account/edit/${id}`);
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${account?.bankName}" account?`,
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
        navigate('/fly-oval/account');
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleBalanceAdjustment = () => {
    setBalanceData({
      amount: '',
      note: '',
      type: 'deposit'
    });
    setIsBalanceModalOpen(true);
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    try {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center font-english fly-oval-customer-page" style={{ fontFamily: "'Google Sans', sans-serif" }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>Loading account details...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center font-english fly-oval-customer-page" style={{ fontFamily: "'Google Sans', sans-serif" }}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>Account Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4" style={{ fontFamily: "'Google Sans', sans-serif" }}>The account you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/fly-oval/account')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Accounts
          </button>
        </div>
      </div>
    );
  }

  const totals = useMemo(() => {
    return {
      deposits: 500000,
      withdrawals: 250000,
      openingBalance: account.initialBalance,
      closingBalance: account.currentBalance
    };
  }, [account]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 font-english fly-oval-customer-page" style={{ fontFamily: "'Google Sans', sans-serif" }}>
      <Helmet>
        <title>{account.bankName} - Account Details | Fly Oval Limited</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/fly-oval/account')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                {account.bankName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Account Details & Transaction History
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={handleEditAccount}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Account
            </button>
            <button
              onClick={handleDeleteAccount}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>Account Information</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBalanceAdjustment}
                    className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
                    title="Adjust Balance"
                  >
                    <Banknote className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>Bank Name</p>
                      <p className="font-medium text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>{account.bankName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>Account Number</p>
                      <p className="font-medium text-gray-900 dark:text-white font-mono" style={{ fontFamily: "'Google Sans', monospace" }}>{account.accountNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>Account Type</p>
                      <p className="font-medium text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>{account.accountType}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>Branch Name</p>
                      <p className="font-medium text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>{account.branchName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>Account Holder</p>
                      <p className="font-medium text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>{account.accountHolder}</p>
                    </div>
                  </div>
                  {account.contactNumber && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>Contact Number</p>
                        <p className="font-medium text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>{account.contactNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Balance Statistics */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4" style={{ fontFamily: "'Google Sans', sans-serif" }}>Balance Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      Initial Balance
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {formatCurrency(totals.openingBalance)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      Current Balance
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {formatCurrency(totals.closingBalance)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      Total Deposits
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {formatCurrency(totals.deposits)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      Total Withdrawals
                    </span>
                  </div>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {formatCurrency(totals.withdrawals)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
              Transaction History
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700" style={{ fontFamily: "'Google Sans', sans-serif" }}>
              <Download className="w-4 h-4" />
              Export Statement
            </button>
          </div>
          <TransactionHistory accountId={id} />
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
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  Adjusting balance for {account?.bankName}
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Current Balance: {formatCurrency(account?.currentBalance)}
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
      </div>
    </div>
  );
};

export default FlyOvalAccountDetails;
