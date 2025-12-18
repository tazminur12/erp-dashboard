import { useMemo, useState } from 'react';
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
import { useOpExCategories } from '../../hooks';

const OperatingExpenses = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  // Icon registry for persistence
  const ICONS = { Scale, Megaphone, Laptop, CreditCard, Package, Receipt, RotateCcw, FileText };

  const { data: apiCategories = [], isLoading } = useOpExCategories();

  // Map API categories to include icon component for rendering
  const expenseCategories = useMemo(() => {
    return (apiCategories || []).map((c) => ({
      ...c,
      icon: (ICONS[c.iconKey] || FileText),
      color: c.color || 'from-blue-500 to-blue-600',
      bgColor: c.bgColor || 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: c.iconColor || 'text-blue-600 dark:text-blue-400',
      totalAmount: typeof c.totalAmount === 'number' ? c.totalAmount : Number(c.totalAmount || 0),
      itemCount: typeof c.itemCount === 'number' ? c.itemCount : Number(c.itemCount || 0),
      lastUpdated: c.lastUpdated || new Date().toISOString(),
    }));
  }, [apiCategories]);

  // Filter categories based on search term
  const filteredCategories = expenseCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.banglaName.includes(searchTerm) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total expenses
  const totalExpenses = expenseCategories.reduce((sum, category) => sum + (Number(category.totalAmount) || 0), 0);

  const handleCategoryClick = (categoryId) => {
    navigate(`/office-management/operating-expenses/${categoryId}`);
  };

  const handleAddCategory = () => {
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
              onClick={handleAddCategory}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Category</span>
              <span className="sm:hidden">Category</span>
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
                  ৳{(totalExpenses).toLocaleString()}
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
            </select>
          </div>
        </div>

        {/* Expense Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {isLoading && (
            <div className={`p-6 rounded-xl shadow-lg border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading categories...</p>
            </div>
          )}
          {!isLoading && filteredCategories.map((category) => (
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
                  <span>{category.lastUpdated ? new Date(category.lastUpdated).toLocaleDateString() : '-'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {!isLoading && filteredCategories.length === 0 && (
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

      </div>
    </div>
  );
};

export default OperatingExpenses;
