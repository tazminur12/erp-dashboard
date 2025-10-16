import React, { useState, useEffect } from 'react';
import { Plus, Banknote, Building2, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal, { ModalFooter } from '../../components/common/Modal';
import SmallStat from '../../components/common/SmallStat';
import useSecureAxios from '../../hooks/UseAxiosSecure';

const BankAccounts = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ totalAccounts: 0, totalBalance: 0, totalInitialBalance: 0, activeAccounts: 0 });
  const axiosSecure = useSecureAxios();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'Current',
    branchName: '',
    accountHolder: 'Miraj Industries Ltd.',
    initialBalance: '',
    currency: 'BDT',
    contactNumber: ''
  });
  const [balanceData, setBalanceData] = useState({
    amount: '',
    note: '',
    type: 'deposit'
  });

  // Load data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [listRes, statsRes] = await Promise.all([
          axiosSecure.get('/bank-accounts'),
          axiosSecure.get('/bank-accounts/stats/overview')
        ]);
        const serverBanks = listRes?.data?.data || [];
        setBanks(serverBanks);
        const serverStats = statsRes?.data?.data || {};
        setStats({
          totalAccounts: serverStats.totalAccounts || 0,
          totalBalance: serverStats.totalBalance || 0,
          totalInitialBalance: serverStats.totalInitialBalance || 0,
          activeAccounts: serverStats.activeAccounts || 0,
        });
      } catch (e) {
        setError('Failed to load bank accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axiosSecure]);

  // Table columns configuration
  const columns = [
    {
      key: 'bankName',
      header: 'Bank Name',
      sortable: true
    },
    {
      key: 'accountNumber',
      header: 'Account Number',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
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
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'branchName',
      header: 'Branch',
      sortable: true
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
    setIsAddModalOpen(true);
    setFormData({
      bankName: '',
      accountNumber: '',
      accountType: 'Current',
      branchName: '',
      accountHolder: 'Miraj Industries Ltd.',
      initialBalance: '',
      currency: 'BDT',
      contactNumber: ''
    });
  };

  const handleEditBank = (bank) => {
    setSelectedBank(bank);
    setFormData({
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      accountType: bank.accountType,
      branchName: bank.branchName,
      accountHolder: bank.accountHolder,
      initialBalance: bank.initialBalance,
      currency: bank.currency,
      contactNumber: bank.contactNumber
    });
    setIsEditModalOpen(true);
  };

  const handleBalanceAdjustment = (bank) => {
    setSelectedBank(bank);
    setBalanceData({
      amount: '',
      note: '',
      type: 'deposit'
    });
    setIsBalanceModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isAddModalOpen) {
        const payload = {
          ...formData,
          initialBalance: parseFloat(formData.initialBalance),
        };
        const res = await axiosSecure.post('/bank-accounts', payload);
        const created = res?.data?.data;
        if (created) {
          setBanks([...banks, created]);
        }
        setIsAddModalOpen(false);
      } else if (isEditModalOpen && selectedBank?._id) {
        const payload = { ...formData };
        if (payload.initialBalance !== undefined) {
          payload.initialBalance = parseFloat(payload.initialBalance);
        }
        const res = await axiosSecure.patch(`/bank-accounts/${selectedBank._id}`, payload);
        const updated = res?.data?.data;
        if (updated) {
          setBanks(banks.map(b => (b._id === updated._id ? updated : b)));
        }
        setIsEditModalOpen(false);
      }
      // refresh stats after mutation
      try {
        const statsRes = await axiosSecure.get('/bank-accounts/stats/overview');
        const s = statsRes?.data?.data || {};
        setStats({
          totalAccounts: s.totalAccounts || 0,
          totalBalance: s.totalBalance || 0,
          totalInitialBalance: s.totalInitialBalance || 0,
          activeAccounts: s.activeAccounts || 0,
        });
      } catch {}
    } catch (err) {
      setError('Save failed');
    }
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedBank?._id) return;
      const payload = {
        amount: parseFloat(balanceData.amount),
        type: balanceData.type,
        note: balanceData.note,
      };
      const res = await axiosSecure.post(`/bank-accounts/${selectedBank._id}/adjust-balance`, payload);
      const updated = res?.data?.data;
      if (updated) {
        setBanks(banks.map(b => (b._id === updated._id ? updated : b)));
      }
      setIsBalanceModalOpen(false);
      // refresh stats
      try {
        const statsRes = await axiosSecure.get('/bank-accounts/stats/overview');
        const s = statsRes?.data?.data || {};
        setStats({
          totalAccounts: s.totalAccounts || 0,
          totalBalance: s.totalBalance || 0,
          totalInitialBalance: s.totalInitialBalance || 0,
          activeAccounts: s.activeAccounts || 0,
        });
      } catch {}
    } catch (err) {
      setError('Balance adjustment failed');
    }
  };

  const handleDeleteBank = async (bank) => {
    if (!bank?._id) return;
    if (window.confirm(`Are you sure you want to delete ${bank.bankName} account?`)) {
      try {
        await axiosSecure.delete(`/bank-accounts/${bank._id}`);
        setBanks(banks.filter(b => b._id !== bank._id));
        // refresh stats
        try {
          const statsRes = await axiosSecure.get('/bank-accounts/stats/overview');
          const s = statsRes?.data?.data || {};
          setStats({
            totalAccounts: s.totalAccounts || 0,
            totalBalance: s.totalBalance || 0,
            totalInitialBalance: s.totalInitialBalance || 0,
            activeAccounts: s.activeAccounts || 0,
          });
        } catch {}
      } catch (err) {
        setError('Delete failed');
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SmallStat
            label="Total Accounts"
            value={stats.totalAccounts}
            icon={Building2}
            color="blue"
          />
          <SmallStat
            label="Total Balance"
            value={`BDT ${Number(stats.totalBalance).toLocaleString()}`}
            icon={Banknote}
            color="green"
          />
          <SmallStat
            label="Initial Balance"
            value={`BDT ${Number(stats.totalInitialBalance).toLocaleString()}`}
            icon={CreditCard}
            color="purple"
          />
          <SmallStat
            label="Active Accounts"
            value={`${stats.activeAccounts}/${stats.totalAccounts}`}
            icon={TrendingUp}
            color="yellow"
          />
        </div>

        {/* Bank Accounts Table */}
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
                onClick={() => handleEditBank(bank)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleBalanceAdjustment(bank)}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
                title="Adjust Balance"
              >
                <Banknote className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteBank(bank)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        />

        {/* Add Bank Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Bank Account"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Dutch Bangla Bank Limited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  placeholder="e.g., 1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type *
                </label>
                <select
                  required
                  value={formData.accountType}
                  onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Current">Current Account</option>
                  <option value="Savings">Savings Account</option>
                  <option value="Business">Business Account</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.branchName}
                  onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Dhanmondi Branch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Holder *
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Miraj Industries Ltd."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Initial Balance *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({...formData, initialBalance: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency *
                </label>
                <select
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="BDT">BDT (Bangladeshi Taka)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+8801712345678"
                />
              </div>
            </div>

            <ModalFooter>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Add Bank Account
              </button>
            </ModalFooter>
          </form>
        </Modal>

        {/* Edit Bank Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Bank Account"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type *
                </label>
                <select
                  required
                  value={formData.accountType}
                  onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Current">Current Account</option>
                  <option value="Savings">Savings Account</option>
                  <option value="Business">Business Account</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.branchName}
                  onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Holder *
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Initial Balance *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({...formData, initialBalance: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency *
                </label>
                <select
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="BDT">BDT (Bangladeshi Taka)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <ModalFooter>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Update Bank Account
              </button>
            </ModalFooter>
          </form>
        </Modal>

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
      </div>
    </div>
  );
};

export default BankAccounts;
