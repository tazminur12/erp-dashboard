import { useState } from 'react';
import { 
  ArrowLeft,
  Plus,
  DollarSign,
  Save,
  X,
  Calendar,
  FileText,
  CreditCard,
  Building2,
  Megaphone,
  Laptop,
  Package,
  Receipt,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const AddExpense = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Expense categories matching OperatingExpenses.jsx
  const expenseCategories = [
    {
      id: 'legal-compliance',
      name: 'Legal and Compliance Costs',
      banglaName: 'আইনি ও নিয়ন্ত্রণ খরচ',
      icon: Building2,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'marketing-branding',
      name: 'Marketing and Branding Expenses',
      banglaName: 'বিপণন ও ব্র্যান্ডিং খরচ',
      icon: Megaphone,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'it-software',
      name: 'IT and Software Expenses',
      banglaName: 'আইটি ও সফটওয়্যার খরচ',
      icon: Laptop,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'financial-bank',
      name: 'Financial and Bank Charges',
      banglaName: 'আর্থিক ও ব্যাংক চার্জ',
      icon: CreditCard,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'asset-purchases',
      name: 'Asset Purchases',
      banglaName: 'সম্পদ ক্রয়',
      icon: Package,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'miscellaneous',
      name: 'Miscellaneous Operational Costs',
      banglaName: 'বিবিধ পরিচালন খরচ',
      icon: Receipt,
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'tax-regulatory',
      name: 'Tax and Regulatory Payments',
      banglaName: 'কর ও নিয়ন্ত্রণ পেমেন্ট',
      icon: FileText,
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'refunds-reimbursements',
      name: 'Refunds and Reimbursements',
      banglaName: 'প্রত্যর্পণ ও ক্ষতিপূরণ',
      icon: RotateCcw,
      color: 'from-teal-500 to-teal-600'
    }
  ];

  // Default subcategories for each category (editable in UI)
  const defaultSubcategoriesByCategory = {
    'legal-compliance': [
      'RJSC Registration',
      'RJSC Renewals',
      'Trade Licenses',
      'Trade Licenses Renewals',
      'Civil Aviation Reg',
      'Civil Aviation Reg Renewals',
      'DPDT registration',
      'Patent applications',
      'CAAB challans',
      'VAT registrations',
      'Other permits',
      'Payment Gateway',
      'Legal',
      'Notary',
      'Consultancy fees'
    ],
    'marketing-branding': [
      'Digital Ads',
      'Print Materials',
      'Events',
      'Branding Assets',
      'Agency Services'
    ],
    'it-software': [
      'Software License',
      'Cloud Services',
      'Hardware Purchase',
      'IT Support',
      'Domain & Hosting'
    ],
    'financial-bank': [
      'Bank Fees',
      'Transaction Charges',
      'Interest',
      'Gateway Charges'
    ],
    'asset-purchases': [
      'Office Equipment',
      'Furniture',
      'Machinery',
      'Vehicle'
    ],
    'miscellaneous': [
      'Utilities',
      'Stationery',
      'Snacks & Refreshments',
      'Maintenance'
    ],
    'tax-regulatory': [
      'Income Tax',
      'VAT',
      'AIT',
      'Regulatory Fees'
    ],
    'refunds-reimbursements': [
      'Customer Refund',
      'Employee Reimbursement',
      'Vendor Adjustment'
    ]
  };

  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState(defaultSubcategoriesByCategory);
  const [newSubcategory, setNewSubcategory] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    reference: '',
    vendor: '',
    notes: '',
    status: 'Pending'
  });

  const [errors, setErrors] = useState({});

  // Get available subcategories for the selected category
  const availableSubcategories = formData.category ? (subcategoriesByCategory[formData.category] || []) : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Simulate API call
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // On success, navigate back to operating expenses
      navigate('/office-management/operating-expenses');
    } catch (error) {
      console.error('Error adding expense:', error);
      setErrors({ submit: 'Failed to add expense. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = expenseCategories.find(cat => cat.id === formData.category);

  return (
    <div className={`min-h-screen p-2 sm:p-4 lg:p-6 transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/office-management/operating-expenses')}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Add Operating Expense
              </h1>
              <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                নতুন পরিচালন খরচ যোগ করুন
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className={`p-4 sm:p-6 rounded-xl shadow-lg border transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expense Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  errors.category 
                    ? 'border-red-500' 
                    : isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Category</option>
                {expenseCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} - {category.banglaName}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subcategory
              </label>
              {/* Suggested subcategories when a category is selected */}
              {formData.category && availableSubcategories.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="sm:col-span-2">
                    <select
                      value={formData.subcategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                      className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select from suggestions</option>
                      {availableSubcategories.map((sc) => (
                        <option key={sc} value={sc}>{sc}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                      className={`flex-1 px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                      placeholder="New subcategory"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newSubcategory.trim()) return;
                        setSubcategoriesByCategory(prev => ({
                          ...prev,
                          [formData.category]: Array.from(new Set([...(prev[formData.category] || []), newSubcategory.trim()]))
                        }));
                        setFormData(prev => ({ ...prev, subcategory: newSubcategory.trim() }));
                        setNewSubcategory('');
                      }}
                      className="px-3 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Free text input always available */}
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter subcategory (e.g., RJSC Registration, Software License)"
              />
            </div>

            {/* Amount and Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (৳) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full pl-10 pr-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                      errors.amount 
                        ? 'border-red-500' 
                        : isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    required
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                      errors.date 
                        ? 'border-red-500' 
                        : isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.date}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  errors.description 
                    ? 'border-red-500' 
                    : isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                }`}
                placeholder="Enter expense description..."
                required
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Payment Method and Reference Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                  </div>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                      errors.paymentMethod 
                        ? 'border-red-500' 
                        : isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {errors.paymentMethod && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.paymentMethod}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Invoice/Receipt Number"
                />
              </div>
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vendor/Supplier
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter vendor or supplier name"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
                placeholder="Any additional information or notes..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Expense</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/office-management/operating-expenses')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
