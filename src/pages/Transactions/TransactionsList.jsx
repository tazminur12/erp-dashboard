import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  User,
  Tag,
  MoreHorizontal,
  X,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Swal from 'sweetalert2';

const TransactionsList = () => {
  const { isDark } = useTheme();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateRange: '',
    transactionType: '',
    category: '',
    paymentMethod: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Mock data for transactions
  const transactions = [
    {
      id: 'TXN-001',
      customerName: 'আহমেদ হোসেন',
      customerPhone: '+880 1712-345678',
      customerEmail: 'ahmed@example.com',
      type: 'credit',
      category: 'হাজ্জ প্যাকেজ',
      paymentMethod: 'ব্যাংক ট্রান্সফার',
      amount: 150000,
      date: '2024-01-15',
      status: 'completed',
      reference: 'REF-001',
      notes: 'হাজ্জ প্যাকেজের জন্য পেমেন্ট'
    },
    {
      id: 'TXN-002',
      customerName: 'ফাতেমা বেগম',
      customerPhone: '+880 1812-345679',
      customerEmail: 'fatema@example.com',
      type: 'credit',
      category: 'ওমরাহ প্যাকেজ',
      paymentMethod: 'মোবাইল ব্যাংকিং',
      amount: 85000,
      date: '2024-01-14',
      status: 'completed',
      reference: 'REF-002',
      notes: 'ওমরাহ প্যাকেজের জন্য পেমেন্ট'
    },
    {
      id: 'TXN-003',
      customerName: 'মোহাম্মদ আলী',
      customerPhone: '+880 1912-345680',
      customerEmail: 'mohammad@example.com',
      type: 'debit',
      category: 'এয়ার টিকেট',
      paymentMethod: 'চেক',
      amount: 45000,
      date: '2024-01-13',
      status: 'pending',
      reference: 'REF-003',
      notes: 'এয়ারলাইন টিকেটের জন্য পেমেন্ট'
    },
    {
      id: 'TXN-004',
      customerName: 'আয়েশা খাতুন',
      customerPhone: '+880 1612-345681',
      customerEmail: 'ayesha@example.com',
      type: 'credit',
      category: 'ভিসা সার্ভিস',
      paymentMethod: 'ব্যাংক ট্রান্সফার',
      amount: 25000,
      date: '2024-01-12',
      status: 'completed',
      reference: 'REF-004',
      notes: 'ভিসা প্রক্রিয়াকরণের জন্য পেমেন্ট'
    },
    {
      id: 'TXN-005',
      customerName: 'রহমান মিয়া',
      customerPhone: '+880 1512-345682',
      customerEmail: 'rahman@example.com',
      type: 'debit',
      category: 'হোটেল বুকিং',
      paymentMethod: 'মোবাইল ব্যাংকিং',
      amount: 35000,
      date: '2024-01-11',
      status: 'completed',
      reference: 'REF-005',
      notes: 'হোটেল রিজার্ভেশনের জন্য পেমেন্ট'
    },
    {
      id: 'TXN-006',
      customerName: 'সাবরিনা আক্তার',
      customerPhone: '+880 1412-345683',
      customerEmail: 'sabrina@example.com',
      type: 'credit',
      category: 'ইনসুরেন্স',
      paymentMethod: 'ব্যাংক ট্রান্সফার',
      amount: 18000,
      date: '2024-01-10',
      status: 'completed',
      reference: 'REF-006',
      notes: 'ভ্রমণ বীমার জন্য পেমেন্ট'
    },
    {
      id: 'TXN-007',
      customerName: 'ইমরান হোসেন',
      customerPhone: '+880 1312-345684',
      customerEmail: 'imran@example.com',
      type: 'debit',
      category: 'অন্যান্য সেবা',
      paymentMethod: 'চেক',
      amount: 22000,
      date: '2024-01-09',
      status: 'pending',
      reference: 'REF-007',
      notes: 'অন্যান্য ভ্রমণ সেবার জন্য পেমেন্ট'
    },
    {
      id: 'TXN-008',
      customerName: 'নাজমা খাতুন',
      customerPhone: '+880 1212-345685',
      customerEmail: 'nazma@example.com',
      type: 'credit',
      category: 'হাজ্জ প্যাকেজ',
      paymentMethod: 'মোবাইল ব্যাংকিং',
      amount: 200000,
      date: '2024-01-08',
      status: 'completed',
      reference: 'REF-008',
      notes: 'প্রিমিয়াম হাজ্জ প্যাকেজের জন্য পেমেন্ট'
    }
  ];

  // Filter options
  const filterOptions = {
    transactionType: [
      { value: '', label: 'সব টাইপ' },
      { value: 'credit', label: 'ক্রেডিট (আয়)' },
      { value: 'debit', label: 'ডেবিট (ব্যয়)' }
    ],
    category: [
      { value: '', label: 'সব ক্যাটাগরি' },
      { value: 'হাজ্জ প্যাকেজ', label: 'হাজ্জ প্যাকেজ' },
      { value: 'ওমরাহ প্যাকেজ', label: 'ওমরাহ প্যাকেজ' },
      { value: 'এয়ার টিকেট', label: 'এয়ার টিকেট' },
      { value: 'ভিসা সার্ভিস', label: 'ভিসা সার্ভিস' },
      { value: 'হোটেল বুকিং', label: 'হোটেল বুকিং' },
      { value: 'ইনসুরেন্স', label: 'ইনসুরেন্স' },
      { value: 'অন্যান্য সেবা', label: 'অন্যান্য সেবা' }
    ],
    paymentMethod: [
      { value: '', label: 'সব পেমেন্ট মেথড' },
      { value: 'ব্যাংক ট্রান্সফার', label: 'ব্যাংক ট্রান্সফার' },
      { value: 'মোবাইল ব্যাংকিং', label: 'মোবাইল ব্যাংকিং' },
      { value: 'চেক', label: 'চেক' }
    ]
  };

  // Filter and search logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = 
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerPhone.includes(searchTerm) ||
        transaction.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !filters.transactionType || transaction.type === filters.transactionType;
      const matchesCategory = !filters.category || transaction.category === filters.category;
      const matchesPaymentMethod = !filters.paymentMethod || transaction.paymentMethod === filters.paymentMethod;
      
      // Date range filter logic
      let matchesDate = true;
      if (filters.dateRange) {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        switch (filters.dateRange) {
          case 'today':
            matchesDate = transactionDate.toDateString() === today.toDateString();
            break;
          case 'yesterday':
            matchesDate = transactionDate.toDateString() === yesterday.toDateString();
            break;
          case 'last-week':
            matchesDate = transactionDate >= lastWeek;
            break;
          case 'last-month':
            matchesDate = transactionDate >= lastMonth;
            break;
        }
      }
      
      return matchesSearch && matchesType && matchesCategory && matchesPaymentMethod && matchesDate;
    });
  }, [searchTerm, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Helper functions
  const getTypeColor = (type) => {
    return type === 'credit' 
      ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
      : 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Event handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      dateRange: '',
      transactionType: '',
      category: '',
      paymentMethod: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleDownloadPDF = (transaction) => {
    Swal.fire({
      title: 'PDF ডাউনলোড হচ্ছে...',
      text: `${transaction.id} এর ইনভয়েস তৈরি হচ্ছে`,
      icon: 'info',
      showConfirmButton: false,
      timer: 2000,
      background: isDark ? '#1F2937' : '#F9FAFB'
    });
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  Transactions List
                </h1>
                <p className={`mt-2 text-lg transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  সব লেনদেনের তালিকা এবং পরিচালনা
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = '/transactions/new'}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <CreditCard className="w-5 h-5" />
                নতুন লেনদেন
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className={`mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Transaction ID, নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 border rounded-xl font-medium transition-all duration-200 ${
                showFilters
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600'
                  : isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              ফিল্টার
              {Object.values(filters).some(value => value !== '') && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Clear Filters Button */}
            {Object.values(filters).some(value => value !== '') && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-xl font-medium transition-all duration-200"
              >
                <X className="w-5 h-5" />
                ফিল্টার সরান
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    তারিখের পরিসর
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">সব তারিখ</option>
                    <option value="today">আজ</option>
                    <option value="yesterday">গতকাল</option>
                    <option value="last-week">গত সপ্তাহ</option>
                    <option value="last-month">গত মাস</option>
                  </select>
                </div>

                {/* Transaction Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    লেনদেনের ধরন
                  </label>
                  <select
                    value={filters.transactionType}
                    onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {filterOptions.transactionType.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {filterOptions.category.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    পেমেন্ট মেথড
                  </label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {filterOptions.paymentMethod.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className={`mb-4 bg-white dark:bg-gray-800 rounded-xl p-4 border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                মোট ফলাফল: <span className="font-semibold text-blue-600">{filteredTransactions.length}</span>
              </span>
              {Object.values(filters).some(value => value !== '') && (
                <span className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  ফিল্টারকৃত ফলাফল: <span className="font-semibold">{currentTransactions.length}</span>
                </span>
              )}
            </div>
            
            <button
              onClick={() => {
                setSearchTerm('');
                clearFilters();
              }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              রিসেট করুন
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`bg-gray-50 dark:bg-gray-700`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    Transaction ID
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    কাস্টমার
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    ধরন
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    ক্যাটাগরি
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    পেমেন্ট মেথড
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    পরিমাণ
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    তারিখ
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700`}>
                {currentTransactions.map((transaction) => (
                  <tr key={transaction.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                          {transaction.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {transaction.customerName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.customerPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                        {transaction.type === 'credit' ? 'ক্রেডিট' : 'ডেবিট'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {transaction.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {transaction.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        transaction.type === 'credit' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatAmount(transaction.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {formatDate(transaction.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewTransaction(transaction)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                          title="দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(transaction)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                          title="PDF ডাউনলোড"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {currentTransactions.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                কোন লেনদেন পাওয়া যায়নি
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || Object.values(filters).some(value => value !== '')
                  ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোন লেনদেন নেই'
                  : 'এখনও কোন লেনদেন যোগ করা হয়নি'
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border transition-colors duration-300 ${
            isDark ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  পৃষ্ঠা {currentPage} এর {totalPages}
                </span>
                <span className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  ({startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} এর {filteredTransactions.length})
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 1
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  আগে
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === totalPages
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  পরে
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  লেনদেনের বিবরণ
                </h3>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Transaction ID
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono">{selectedTransaction.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    রেফারেন্স
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedTransaction.reference}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    কাস্টমারের নাম
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedTransaction.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    ফোন নম্বর
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedTransaction.customerPhone}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    ইমেইল
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedTransaction.customerEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    লেনদেনের ধরন
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedTransaction.type)}`}>
                    {selectedTransaction.type === 'credit' ? 'ক্রেডিট' : 'ডেবিট'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    ক্যাটাগরি
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedTransaction.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    পেমেন্ট মেথড
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedTransaction.paymentMethod}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    পরিমাণ
                  </label>
                  <p className={`font-semibold ${
                    selectedTransaction.type === 'credit' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatAmount(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    তারিখ
                  </label>
                  <p className="text-gray-900 dark:text-white">{formatDate(selectedTransaction.date)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  নোট
                </label>
                <p className="text-gray-900 dark:text-white">{selectedTransaction.notes || 'কোন নোট নেই'}</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => handleDownloadPDF(selectedTransaction)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200"
              >
                <Download className="w-5 h-5" />
                PDF ডাউনলোড
              </button>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsList;
