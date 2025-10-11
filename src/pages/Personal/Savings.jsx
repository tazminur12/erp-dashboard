import React, { useState, useEffect } from 'react';
import { 
  PiggyBank, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar,
  Target,
  TrendingUp,
  Download,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  Building2,
  Briefcase,
  Award,
  Gift,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Percent
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SmallStat from '../../components/common/SmallStat';
import { useTheme } from '../../contexts/ThemeContext';

const PersonalSavings = () => {
  const { isDark } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSavings, setSelectedSavings] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [savingsData, setSavingsData] = useState([
    {
      id: 1,
      name: 'Emergency Fund',
      type: 'Fixed Deposit',
      bank: 'City Bank',
      amount: 100000,
      targetAmount: 500000,
      interestRate: 6.5,
      startDate: '2024-01-01',
      maturityDate: '2025-01-01',
      status: 'Active',
      description: 'Emergency fund for unexpected expenses',
      goalProgress: 20
    },
    {
      id: 2,
      name: 'Vacation Fund',
      type: 'Savings Account',
      bank: 'Dutch Bangla Bank',
      amount: 25000,
      targetAmount: 100000,
      interestRate: 4.5,
      startDate: '2024-01-15',
      maturityDate: '2024-12-31',
      status: 'Active',
      description: 'Saving for family vacation',
      goalProgress: 25
    },
    {
      id: 3,
      name: 'Car Fund',
      type: 'Term Deposit',
      bank: 'BRAC Bank',
      amount: 75000,
      targetAmount: 800000,
      interestRate: 7.0,
      startDate: '2023-12-01',
      maturityDate: '2025-06-01',
      status: 'Active',
      description: 'Saving to buy a car',
      goalProgress: 9.4
    },
    {
      id: 4,
      name: 'Education Fund',
      type: 'Mutual Fund',
      bank: 'Investment Company',
      amount: 150000,
      targetAmount: 500000,
      interestRate: 8.5,
      startDate: '2023-06-01',
      maturityDate: '2026-06-01',
      status: 'Active',
      description: 'Children education fund',
      goalProgress: 30
    },
    {
      id: 5,
      name: 'Retirement Fund',
      type: 'Pension Fund',
      bank: 'Government Scheme',
      amount: 200000,
      targetAmount: 2000000,
      interestRate: 6.0,
      startDate: '2023-01-01',
      maturityDate: '2035-01-01',
      status: 'Active',
      description: 'Long-term retirement planning',
      goalProgress: 10
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    bank: '',
    amount: '',
    targetAmount: '',
    interestRate: '',
    startDate: '',
    maturityDate: '',
    description: '',
    status: 'Active'
  });

  // Calculate statistics
  const totalSavings = savingsData.reduce((sum, item) => sum + item.amount, 0);
  const totalTarget = savingsData.reduce((sum, item) => sum + item.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSavings / totalTarget) * 100 : 0;
  const activeSavings = savingsData.filter(item => item.status === 'Active').reduce((sum, item) => sum + item.amount, 0);
  const averageInterestRate = savingsData.length > 0 
    ? savingsData.reduce((sum, item) => sum + item.interestRate, 0) / savingsData.length 
    : 0;

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      header: 'Savings Name',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
            <PiggyBank className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-white">{value}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.type}</p>
          </div>
        </div>
      )
    },
    {
      key: 'bank',
      header: 'Bank/Institution',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Current Amount',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ৳{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'targetAmount',
      header: 'Target Amount',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900 dark:text-white">
          ৳{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'goalProgress',
      header: 'Progress',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-600 h-2 rounded-full" 
              style={{ width: `${Math.min(value, 100)}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">{value}%</span>
        </div>
      )
    },
    {
      key: 'interestRate',
      header: 'Interest Rate',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Percent className="w-3 h-3 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">{value}%</span>
        </div>
      )
    },
    {
      key: 'maturityDate',
      header: 'Maturity Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : value === 'Matured'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const handleAddSavings = () => {
    setSelectedSavings(null);
    setFormData({
      name: '',
      type: '',
      bank: '',
      amount: '',
      targetAmount: '',
      interestRate: '',
      startDate: new Date().toISOString().split('T')[0],
      maturityDate: '',
      description: '',
      status: 'Active'
    });
    setShowAddModal(true);
  };

  const handleEditSavings = (savings) => {
    setSelectedSavings(savings);
    setFormData({
      name: savings.name,
      type: savings.type,
      bank: savings.bank,
      amount: savings.amount.toString(),
      targetAmount: savings.targetAmount.toString(),
      interestRate: savings.interestRate.toString(),
      startDate: savings.startDate,
      maturityDate: savings.maturityDate,
      description: savings.description,
      status: savings.status
    });
    setShowEditModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (selectedSavings) {
        // Update existing savings
        const updatedData = { 
          ...formData, 
          amount: parseFloat(formData.amount),
          targetAmount: parseFloat(formData.targetAmount),
          interestRate: parseFloat(formData.interestRate),
          goalProgress: (parseFloat(formData.amount) / parseFloat(formData.targetAmount)) * 100
        };
        setSavingsData(prev => prev.map(item => 
          item.id === selectedSavings.id ? updatedData : item
        ));
        setShowEditModal(false);
      } else {
        // Add new savings
        const newSavings = {
          id: Date.now(),
          ...formData,
          amount: parseFloat(formData.amount),
          targetAmount: parseFloat(formData.targetAmount),
          interestRate: parseFloat(formData.interestRate),
          goalProgress: (parseFloat(formData.amount) / parseFloat(formData.targetAmount)) * 100
        };
        setSavingsData(prev => [...prev, newSavings]);
        setShowAddModal(false);
      }
      
      setLoading(false);
      setFormData({
        name: '',
        type: '',
        bank: '',
        amount: '',
        targetAmount: '',
        interestRate: '',
        startDate: new Date().toISOString().split('T')[0],
        maturityDate: '',
        description: '',
        status: 'Active'
      });
    }, 1000);
  };

  const handleDeleteSavings = (savings) => {
    if (window.confirm('Are you sure you want to delete this savings record?')) {
      setSavingsData(prev => prev.filter(item => item.id !== savings.id));
    }
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Personal Savings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your savings goals and investment progress
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handleAddSavings}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Savings</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label="Total Savings"
          value={`৳${totalSavings.toLocaleString()}`}
          icon={PiggyBank}
          color="yellow"
        />
        <SmallStat
          label="Target Amount"
          value={`৳${totalTarget.toLocaleString()}`}
          icon={Target}
          color="blue"
        />
        <SmallStat
          label="Overall Progress"
          value={`${overallProgress.toFixed(1)}%`}
          icon={TrendingUp}
          color="green"
        />
        <SmallStat
          label="Avg. Interest Rate"
          value={`${averageInterestRate.toFixed(1)}%`}
          icon={Percent}
          color="purple"
        />
      </div>

      {/* Progress Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Savings Progress</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Progress</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              ৳{totalSavings.toLocaleString()} / ৳{totalTarget.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>0%</span>
            <span>{overallProgress.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={savingsData}
        columns={columns}
        searchable={true}
        exportable={true}
        actions={true}
        onEdit={handleEditSavings}
        onDelete={handleDeleteSavings}
      />

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedSavings ? 'Edit Savings' : 'Add Savings'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Savings Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="e.g., Emergency Fund, Vacation Fund"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Savings Account">Savings Account</option>
                    <option value="Fixed Deposit">Fixed Deposit</option>
                    <option value="Term Deposit">Term Deposit</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="Pension Fund">Pension Fund</option>
                    <option value="Investment">Investment</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bank/Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bank}
                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="e.g., City Bank, Dutch Bangla Bank"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="0.0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Maturity Date
                    </label>
                    <input
                      type="date"
                      value={formData.maturityDate}
                      onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Brief description of this savings goal..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Matured">Matured</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{selectedSavings ? 'Update' : 'Add'} Savings</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalSavings;
