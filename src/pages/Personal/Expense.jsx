import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, 
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
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Heart,
  Book,
  Gamepad2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SmallStat from '../../components/common/SmallStat';
import { useTheme } from '../../contexts/ThemeContext';

const PersonalExpense = () => {
  const { isDark } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [expenseData, setExpenseData] = useState([
    {
      id: 1,
      category: 'Food & Dining',
      subcategory: 'Restaurant',
      amount: 2500,
      description: 'Dinner at restaurant',
      date: '2024-01-15',
      paymentMethod: 'Credit Card',
      status: 'Paid',
      tags: ['dining', 'social']
    },
    {
      id: 2,
      category: 'Transportation',
      subcategory: 'Fuel',
      amount: 3000,
      description: 'Car fuel',
      date: '2024-01-16',
      paymentMethod: 'Cash',
      status: 'Paid',
      tags: ['transport', 'car']
    },
    {
      id: 3,
      category: 'Shopping',
      subcategory: 'Clothing',
      amount: 4500,
      description: 'New shirt and pants',
      date: '2024-01-18',
      paymentMethod: 'Debit Card',
      status: 'Paid',
      tags: ['clothing', 'personal']
    },
    {
      id: 4,
      category: 'Entertainment',
      subcategory: 'Movies',
      amount: 800,
      description: 'Cinema tickets',
      date: '2024-01-20',
      paymentMethod: 'Credit Card',
      status: 'Paid',
      tags: ['entertainment', 'movies']
    },
    {
      id: 5,
      category: 'Healthcare',
      subcategory: 'Medicine',
      amount: 1200,
      description: 'Prescription medicine',
      date: '2024-01-22',
      paymentMethod: 'Cash',
      status: 'Paid',
      tags: ['health', 'medicine']
    }
  ]);

  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    amount: '',
    description: '',
    date: '',
    paymentMethod: '',
    tags: '',
    status: 'Paid'
  });

  // Expense categories with icons
  const expenseCategories = {
    'Food & Dining': { icon: Utensils, color: 'orange' },
    'Transportation': { icon: Car, color: 'blue' },
    'Shopping': { icon: ShoppingCart, color: 'purple' },
    'Entertainment': { icon: Gamepad2, color: 'pink' },
    'Healthcare': { icon: Heart, color: 'red' },
    'Education': { icon: Book, color: 'green' },
    'Utilities': { icon: Home, color: 'yellow' },
    'Others': { icon: DollarSign, color: 'gray' }
  };

  // Calculate statistics
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const thisMonthExpenses = expenseData.filter(item => {
    const itemDate = new Date(item.date);
    const currentDate = new Date();
    return itemDate.getMonth() === currentDate.getMonth() && itemDate.getFullYear() === currentDate.getFullYear();
  }).reduce((sum, item) => sum + item.amount, 0);

  const categoryExpenses = expenseData.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const topCategory = Object.keys(categoryExpenses).reduce((a, b) => 
    categoryExpenses[a] > categoryExpenses[b] ? a : b, 'None'
  );

  // Table columns configuration
  const columns = [
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (value, item) => {
        const categoryInfo = expenseCategories[value] || { icon: DollarSign, color: 'gray' };
        const Icon = categoryInfo.icon;
        return (
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 bg-${categoryInfo.color}-100 dark:bg-${categoryInfo.color}-900/20 rounded-lg flex items-center justify-center`}>
              <Icon className={`w-4 h-4 text-${categoryInfo.color}-600 dark:text-${categoryInfo.color}-400`} />
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">{value}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.subcategory}</p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-red-600 dark:text-red-400">
          ৳{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      render: (value) => (
        <span className="text-gray-900 dark:text-white">{value}</span>
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
      key: 'paymentMethod',
      header: 'Payment Method',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {value === 'Credit Card' || value === 'Debit Card' ? (
            <CreditCard className="w-4 h-4 text-gray-400" />
          ) : (
            <Wallet className="w-4 h-4 text-gray-400" />
          )}
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Paid' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setFormData({
      category: '',
      subcategory: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      tags: '',
      status: 'Paid'
    });
    setShowAddModal(true);
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setFormData({
      category: expense.category,
      subcategory: expense.subcategory,
      amount: expense.amount.toString(),
      description: expense.description,
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      tags: expense.tags.join(', '),
      status: expense.status
    });
    setShowEditModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (selectedExpense) {
        // Update existing expense
        setExpenseData(prev => prev.map(item => 
          item.id === selectedExpense.id 
            ? { 
                ...item, 
                ...formData, 
                amount: parseFloat(formData.amount),
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
              }
            : item
        ));
        setShowEditModal(false);
      } else {
        // Add new expense
        const newExpense = {
          id: Date.now(),
          ...formData,
          amount: parseFloat(formData.amount),
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        setExpenseData(prev => [...prev, newExpense]);
        setShowAddModal(false);
      }
      
      setLoading(false);
      setFormData({
        category: '',
        subcategory: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        tags: '',
        status: 'Paid'
      });
    }, 1000);
  };

  const handleDeleteExpense = (expense) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      setExpenseData(prev => prev.filter(item => item.id !== expense.id));
    }
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Personal Expenses
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage your personal expenses by category
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handleAddExpense}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label="Total Expenses"
          value={`৳${totalExpenses.toLocaleString()}`}
          icon={DollarSign}
          color="red"
        />
        <SmallStat
          label="This Month"
          value={`৳${thisMonthExpenses.toLocaleString()}`}
          icon={Calendar}
          color="blue"
        />
        <SmallStat
          label="Top Category"
          value={topCategory}
          icon={PieChart}
          color="purple"
        />
        <SmallStat
          label="Avg. Daily"
          value={`৳${Math.round(thisMonthExpenses / 30).toLocaleString()}`}
          icon={Target}
          color="yellow"
        />
      </div>

      {/* Data Table */}
      <DataTable
        data={expenseData}
        columns={columns}
        searchable={true}
        exportable={true}
        actions={true}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedExpense ? 'Edit Expense' : 'Add Expense'}
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
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.keys(expenseCategories).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="e.g., Restaurant, Fuel, Clothing"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Brief description of the expense"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Digital Wallet">Digital Wallet</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Separate tags with commas (e.g., dining, social)"
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
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{selectedExpense ? 'Update' : 'Add'} Expense</span>
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

export default PersonalExpense;
