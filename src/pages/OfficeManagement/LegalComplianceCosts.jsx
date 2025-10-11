import { useState } from 'react';
import { 
  Scale, 
  Plus,
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Download,
  Eye,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Building2,
  User,
  CreditCard
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const LegalComplianceCosts = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [editItem, setEditItem] = useState(null);

  // Form state for adding new expense
  const [formData, setFormData] = useState({
    subcategory: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    reference: '',
    vendor: '',
    notes: ''
  });

  // Legal and Compliance subcategories
  const subcategories = [
    {
      id: 'rjsc-registration',
      name: 'RJSC Registration',
      banglaName: 'RJSC নিবন্ধন',
      icon: Building2,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'rjsc-renewals',
      name: 'RJSC Renewals',
      banglaName: 'RJSC নবায়ন',
      icon: Building2,
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: 'trade-licenses',
      name: 'Trade Licenses',
      banglaName: 'বাণিজ্যিক লাইসেন্স',
      icon: FileText,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'trade-licenses-renewals',
      name: 'Trade Licenses Renewals',
      banglaName: 'বাণিজ্যিক লাইসেন্স নবায়ন',
      icon: FileText,
      color: 'from-green-500 to-green-700'
    },
    {
      id: 'civil-aviation-reg',
      name: 'Civil Aviation Reg',
      banglaName: 'সিভিল এভিয়েশন নিয়ন্ত্রণ',
      icon: Building2,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'civil-aviation-reg-renewals',
      name: 'Civil Aviation Reg Renewals',
      banglaName: 'সিভিল এভিয়েশন নিয়ন্ত্রণ নবায়ন',
      icon: Building2,
      color: 'from-purple-500 to-purple-700'
    },
    {
      id: 'dpdt-registration',
      name: 'DPDT registration',
      banglaName: 'DPDT নিবন্ধন',
      icon: User,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'patent-applications',
      name: 'Patent applications',
      banglaName: 'পেটেন্ট আবেদন',
      icon: FileText,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'caab-challans',
      name: 'CAAB challans',
      banglaName: 'CAAB চালান',
      icon: CreditCard,
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'vat-registrations',
      name: 'VAT registrations',
      banglaName: 'VAT নিবন্ধন',
      icon: FileText,
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 'other-permits',
      name: 'Other permits',
      banglaName: 'অন্যান্য অনুমতি',
      icon: FileText,
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'payment-gateway',
      name: 'Payment Gateway',
      banglaName: 'পেমেন্ট গেটওয়ে',
      icon: CreditCard,
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'legal',
      name: 'Legal',
      banglaName: 'আইনি খরচ',
      icon: Scale,
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      id: 'notary',
      name: 'Notary',
      banglaName: 'নোটারি',
      icon: Scale,
      color: 'from-amber-500 to-amber-600'
    },
    {
      id: 'consultancy-fees',
      name: 'Consultancy fees',
      banglaName: 'পরামর্শ ফি',
      icon: User,
      color: 'from-emerald-500 to-emerald-600'
    }
  ];

  // Mock expense data
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      subcategory: 'rjsc-registration',
      amount: 15000,
      description: 'RJSC Company Registration Fee',
      date: '2024-01-15',
      paymentMethod: 'Bank Transfer',
      reference: 'RJSC-2024-001',
      vendor: 'RJSC Office',
      notes: 'Initial company registration',
      status: 'Completed'
    },
    {
      id: 2,
      subcategory: 'trade-licenses',
      amount: 8500,
      description: 'Trade License Application',
      date: '2024-01-12',
      paymentMethod: 'Cash',
      reference: 'TL-2024-002',
      vendor: 'City Corporation',
      notes: 'New trade license application',
      status: 'Pending'
    },
    {
      id: 3,
      subcategory: 'legal',
      amount: 25000,
      description: 'Legal Consultation Fees',
      date: '2024-01-10',
      paymentMethod: 'Bank Transfer',
      reference: 'LEGAL-2024-003',
      vendor: 'ABC Law Associates',
      notes: 'Contract review and legal advice',
      status: 'Completed'
    },
    {
      id: 4,
      subcategory: 'vat-registrations',
      amount: 12000,
      description: 'VAT Registration Process',
      date: '2024-01-08',
      paymentMethod: 'Bank Transfer',
      reference: 'VAT-2024-004',
      vendor: 'NBR Office',
      notes: 'VAT registration and documentation',
      status: 'Completed'
    },
    {
      id: 5,
      subcategory: 'civil-aviation-reg',
      amount: 18000,
      description: 'Civil Aviation Registration',
      date: '2024-01-05',
      paymentMethod: 'Bank Transfer',
      reference: 'CAAB-2024-005',
      vendor: 'CAAB Office',
      notes: 'Aviation business registration',
      status: 'In Progress'
    }
  ]);

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(expense => {
    const subcategory = subcategories.find(sub => sub.id === expense.subcategory);
    return (
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subcategory && subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Calculate total expenses by subcategory
  const getSubcategoryTotal = (subcategoryId) => {
    return expenses
      .filter(expense => expense.subcategory === subcategoryId)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Calculate grand total
  const grandTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newExpense = {
      id: expenses.length + 1,
      ...formData,
      amount: parseFloat(formData.amount),
      status: 'Pending'
    };
    setExpenses(prev => [...prev, newExpense]);
    setFormData({
      subcategory: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      reference: '',
      vendor: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const toggleExpanded = (subcategoryId) => {
    setExpandedItems(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  const handleEdit = (expense) => {
    setEditItem(expense);
    setFormData({
      subcategory: expense.subcategory,
      amount: expense.amount.toString(),
      description: expense.description,
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      reference: expense.reference,
      vendor: expense.vendor,
      notes: expense.notes
    });
    setShowAddForm(true);
  };

  const handleDelete = (expenseId) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
  };

  return (
    <div className={`min-h-screen p-2 sm:p-4 lg:p-6 transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/office-management/operating-expenses')}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Legal and Compliance Costs
                </h1>
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  আইনি ও নিয়ন্ত্রণ খরচ ব্যবস্থাপনা
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className={`p-3 sm:p-4 rounded-xl shadow-lg border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  ৳{grandTotal.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className={`p-3 sm:p-4 rounded-xl shadow-lg border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {subcategories.length}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className={`p-3 sm:p-4 rounded-xl shadow-lg border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {expenses.filter(e => e.status === 'Completed').length}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className={`p-3 sm:p-4 rounded-xl shadow-lg border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {expenses.filter(e => e.status === 'Pending').length}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-3 sm:p-4 rounded-xl shadow-lg border mb-4 sm:mb-6 transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
              />
            </div>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300'
              }`}
            >
              <option value="current-month">Current Month</option>
              <option value="last-month">Last Month</option>
              <option value="current-year">Current Year</option>
              <option value="last-year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Add Expense Form */}
        {showAddForm && (
          <div className={`p-4 sm:p-6 rounded-xl shadow-lg border mb-4 sm:mb-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editItem ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditItem(null);
                  setFormData({
                    subcategory: '',
                    amount: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    paymentMethod: '',
                    reference: '',
                    vendor: '',
                    notes: ''
                  });
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Subcategory *
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Expense description"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Mobile Banking">Mobile Banking</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Reference
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="Reference number"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Vendor
                </label>
                <input
                  type="text"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleInputChange}
                  placeholder="Vendor name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional notes"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditItem(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {editItem ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subcategories List */}
        <div className="space-y-3 sm:space-y-4">
          {subcategories.map((subcategory) => {
            const categoryExpenses = filteredExpenses.filter(expense => expense.subcategory === subcategory.id);
            const totalAmount = getSubcategoryTotal(subcategory.id);
            const isExpanded = expandedItems[subcategory.id];

            return (
              <div
                key={subcategory.id}
                className={`rounded-xl shadow-lg border transition-colors duration-300 ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}
              >
                <div
                  onClick={() => toggleExpanded(subcategory.id)}
                  className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${subcategory.color} rounded-lg flex items-center justify-center`}>
                        <subcategory.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          {subcategory.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {subcategory.banglaName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-right">
                        <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                          ৳{totalAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {categoryExpenses.length} expenses
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-600 p-4 sm:p-6">
                    {categoryExpenses.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No expenses found for this category
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {categoryExpenses.map((expense) => (
                          <div
                            key={expense.id}
                            className={`p-3 sm:p-4 rounded-lg border transition-colors duration-300 ${
                              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                      {expense.description}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {expense.reference} • {expense.vendor}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                      ৳{expense.amount.toLocaleString()}
                                    </p>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                      expense.status === 'Completed' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        : expense.status === 'Pending'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    }`}>
                                      {expense.status}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center gap-4">
                                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                                    <span>{expense.paymentMethod}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleEdit(expense)}
                                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(expense.id)}
                                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors duration-200"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-600" />
                                    </button>
                                  </div>
                                </div>
                                
                                {expense.notes && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                    {expense.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LegalComplianceCosts;
