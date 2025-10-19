import React, { useState } from 'react';
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
  MoreVertical
} from 'lucide-react';
import Modal, { ModalFooter } from '../../components/common/Modal';
import SmallStat from '../../components/common/SmallStat';
import { useAccountQueries } from '../../hooks/useAccountQueries';

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

const BankAccountsProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    useBankAccount, 
    useDeleteBankAccount, 
    useAdjustBankAccountBalance,
    useCreateBankAccountTransaction
  } = useAccountQueries();
  
  const { data: bankAccount, isLoading, error } = useBankAccount(id);
  const deleteBankAccountMutation = useDeleteBankAccount();
  const adjustBalanceMutation = useAdjustBankAccountBalance();
  const createTransactionMutation = useCreateBankAccountTransaction();

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
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
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Print Statement
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
