import { useState } from 'react';
import { 
  Scale, 
  Megaphone, 
  Laptop, 
  CreditCard, 
  Package, 
  Receipt, 
  RotateCcw, 
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  FileText,
  Calendar,
  Filter,
  Search,
  Download,
  Eye
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const OperatingExpenses = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  // Expense categories with their details
  const expenseCategories = [
    {
      id: 'legal-compliance',
      name: 'Legal and Compliance Costs',
      banglaName: 'আইনি ও নিয়ন্ত্রণ খরচ',
      icon: Scale,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: 'RJSC, Trade License, VAT, Legal fees',
      totalAmount: 125000,
      lastUpdated: '2024-01-15',
      itemCount: 12,
      subcategories: [
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
      ]
    },
    {
      id: 'marketing-branding',
      name: 'Marketing and Branding Expenses',
      banglaName: 'বিপণন ও ব্র্যান্ডিং খরচ',
      icon: Megaphone,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      description: 'Digital marketing, advertising, branding',
      totalAmount: 85000,
      lastUpdated: '2024-01-12',
      itemCount: 8
    },
    {
      id: 'it-software',
      name: 'IT and Software Expenses',
      banglaName: 'আইটি ও সফটওয়্যার খরচ',
      icon: Laptop,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      description: 'Software licenses, hardware, IT services',
      totalAmount: 95000,
      lastUpdated: '2024-01-14',
      itemCount: 15
    },
    {
      id: 'financial-bank',
      name: 'Financial and Bank Charges',
      banglaName: 'আর্থিক ও ব্যাংক চার্জ',
      icon: CreditCard,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      description: 'Bank fees, transaction charges, interest',
      totalAmount: 45000,
      lastUpdated: '2024-01-16',
      itemCount: 6
    },
    {
      id: 'asset-purchases',
      name: 'Asset Purchases',
      banglaName: 'সম্পদ ক্রয়',
      icon: Package,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      description: 'Office equipment, furniture, machinery',
      totalAmount: 180000,
      lastUpdated: '2024-01-10',
      itemCount: 9
    },
    {
      id: 'miscellaneous',
      name: 'Miscellaneous Operational Costs',
      banglaName: 'বিবিধ পরিচালন খরচ',
      icon: Receipt,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      iconColor: 'text-pink-600 dark:text-pink-400',
      description: 'General office expenses, utilities',
      totalAmount: 65000,
      lastUpdated: '2024-01-13',
      itemCount: 11
    },
    {
      id: 'tax-regulatory',
      name: 'Tax and Regulatory Payments',
      banglaName: 'কর ও নিয়ন্ত্রণ পেমেন্ট',
      icon: FileText,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      description: 'Income tax, VAT, regulatory fees',
      totalAmount: 150000,
      lastUpdated: '2024-01-11',
      itemCount: 7
    },
    {
      id: 'refunds-reimbursements',
      name: 'Refunds and Reimbursements',
      banglaName: 'প্রত্যর্পণ ও ক্ষতিপূরণ',
      icon: RotateCcw,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      iconColor: 'text-teal-600 dark:text-teal-400',
      description: 'Customer refunds, employee reimbursements',
      totalAmount: 35000,
      lastUpdated: '2024-01-09',
      itemCount: 5
    }
  ];

  // Filter categories based on search term
  const filteredCategories = expenseCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.banglaName.includes(searchTerm) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total expenses
  const totalExpenses = expenseCategories.reduce((sum, category) => sum + category.totalAmount, 0);

  const handleCategoryClick = (categoryId) => {
    navigate(`/office-management/operating-expenses/${categoryId}`);
  };

  const handleAddExpense = () => {
    navigate('/office-management/operating-expenses/add');
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Operating Expenses
                </h1>
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  ব্যবসায়িক পরিচালন খরচ ব্যবস্থাপনা
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleAddExpense}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </button>
              
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
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
                  ৳{totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
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
                  {expenseCategories.length}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className={`p-3 sm:p-4 rounded-xl shadow-lg border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  ৳{(totalExpenses * 0.3).toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className={`p-3 sm:p-4 rounded-xl shadow-lg border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg per Category</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  ৳{(totalExpenses / expenseCategories.length).toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
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
                placeholder="Search categories..."
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

        {/* Expense Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`p-4 sm:p-6 rounded-xl shadow-lg border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${category.bgColor} rounded-lg flex items-center justify-center`}>
                  <category.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${category.iconColor}`} />
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {category.banglaName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {category.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ৳{category.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 dark:text-gray-400">Items</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {category.itemCount}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Last Updated</span>
                  <span>{new Date(category.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className={`text-center py-8 sm:py-12 rounded-xl border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className={`mt-6 p-4 sm:p-6 rounded-xl shadow-lg border transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">View Reports</span>
            </button>
            
            <button className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Download className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Export Data</span>
            </button>
            
            <button className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Set Budget</span>
            </button>
            
            <button className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Eye className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatingExpenses;
