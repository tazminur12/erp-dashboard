import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar,
  Filter,
  Search,
  Download,
  PieChart,
  BarChart3,
  Target,
  Wallet,
  CreditCard,
  Building2,
  Briefcase,
  Award,
  Gift,
  RefreshCw
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SmallStat from '../../components/common/SmallStat';
import { useTheme } from '../../contexts/ThemeContext';

const PersonalIncome = () => {
  const { isDark } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [incomeData, setIncomeData] = useState([
    {
      id: 1,
      source: 'Salary',
      amount: 50000,
      category: 'Primary',
      date: '2024-01-15',
      description: 'Monthly salary from company',
      status: 'Received',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 2,
      source: 'Freelance Project',
      amount: 15000,
      category: 'Secondary',
      date: '2024-01-20',
      description: 'Web development project',
      status: 'Received',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 3,
      source: 'Investment Return',
      amount: 5000,
      category: 'Investment',
      date: '2024-01-25',
      description: 'Stock market returns',
      status: 'Received',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 4,
      source: 'Consulting Fee',
      amount: 8000,
      category: 'Secondary',
      date: '2024-01-30',
      description: 'Business consulting services',
      status: 'Pending',
      paymentMethod: 'Cash'
    }
  ]);

  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    category: '',
    date: '',
    description: '',
    paymentMethod: '',
    status: 'Received'
  });

  // Calculate statistics
  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const receivedIncome = incomeData.filter(item => item.status === 'Received').reduce((sum, item) => sum + item.amount, 0);
  const pendingIncome = incomeData.filter(item => item.status === 'Pending').reduce((sum, item) => sum + item.amount, 0);
  const thisMonthIncome = incomeData.filter(item => {
    const itemDate = new Date(item.date);
    const currentDate = new Date();
    return itemDate.getMonth() === currentDate.getMonth() && itemDate.getFullYear() === currentDate.getFullYear();
  }).reduce((sum, item) => sum + item.amount, 0);

  // Table columns configuration
  const columns = [
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ৳{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Primary' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
          value === 'Secondary' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
          'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'date',
      header: 'Date',
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
          value === 'Received' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {value === 'Bank Transfer' ? (
            <CreditCard className="w-4 h-4 text-gray-400" />
          ) : (
            <Wallet className="w-4 h-4 text-gray-400" />
          )}
          <span>{value}</span>
        </div>
      )
    }
  ];

  const handleAddIncome = () => {
    setSelectedIncome(null);
    setFormData({
      source: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'Bank Transfer',
      status: 'Received'
    });
    setShowAddModal(true);
  };

  const handleEditIncome = (income) => {
    setSelectedIncome(income);
    setFormData({
      source: income.source,
      amount: income.amount.toString(),
      category: income.category,
      date: income.date,
      description: income.description,
      paymentMethod: income.paymentMethod,
      status: income.status
    });
    setShowEditModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (selectedIncome) {
        // Update existing income
        setIncomeData(prev => prev.map(item => 
          item.id === selectedIncome.id 
            ? { ...item, ...formData, amount: parseFloat(formData.amount) }
            : item
        ));
        setShowEditModal(false);
      } else {
        // Add new income
        const newIncome = {
          id: Date.now(),
          ...formData,
          amount: parseFloat(formData.amount)
        };
        setIncomeData(prev => [...prev, newIncome]);
        setShowAddModal(false);
      }
      
      setLoading(false);
      setFormData({
        source: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        paymentMethod: 'Bank Transfer',
        status: 'Received'
      });
    }, 1000);
  };

  const handleDeleteIncome = (income) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      setIncomeData(prev => prev.filter(item => item.id !== income.id));
    }
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Personal Income
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your personal income sources and track earnings
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handleAddIncome}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label="Total Income"
          value={`৳${totalIncome.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <SmallStat
          label="Received"
          value={`৳${receivedIncome.toLocaleString()}`}
          icon={Target}
          color="blue"
        />
        <SmallStat
          label="Pending"
          value={`৳${pendingIncome.toLocaleString()}`}
          icon={RefreshCw}
          color="yellow"
        />
        <SmallStat
          label="This Month"
          value={`৳${thisMonthIncome.toLocaleString()}`}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Data Table */}
      <DataTable
        data={incomeData}
        columns={columns}
        searchable={true}
        exportable={true}
        actions={true}
        onEdit={handleEditIncome}
        onDelete={handleDeleteIncome}
      />

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedIncome ? 'Edit Income' : 'Add Income'}
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
                    Income Source <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="e.g., Salary, Freelance, Investment"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Investment">Investment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Digital Wallet">Digital Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="Received">Received</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Additional notes about this income..."
                  />
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{selectedIncome ? 'Update' : 'Add'} Income</span>
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

export default PersonalIncome;
