import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Download,
  Calendar,
  DollarSign,
  User,
  Building,
  Globe,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  TrendingUp,
  Hash,
  CreditCard,
  Smartphone,
  Banknote,
  Receipt,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import Swal from 'sweetalert2';

const B2BSellList = () => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateRange: '',
    packageType: '',
    paymentStatus: '',
    agentId: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedSell, setSelectedSell] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedSells, setSelectedSells] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSell, setEditingSell] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // Mock data for B2B sells
  const [sells, setSells] = useState([
    {
      id: '1',
      sellId: 'B2B-001',
      agentId: '1',
      agentName: 'Green Line Travels',
      agentContact: '+8801555667788',
      packageId: '1',
      packageName: 'Premium Haj Package 2024',
      packageType: 'haj',
      customerId: '1',
      customerName: 'Abdul Rahman',
      customerPhone: '+8801711223344',
      sellDate: '2024-01-15',
      sellPrice: 450000,
      discountAmount: 10000,
      finalPrice: 440000,
      commissionRate: 8,
      commissionAmount: 35200,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'partial',
      paidAmount: 200000,
      remainingAmount: 240000,
      notes: 'Customer requested early departure',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      sellId: 'B2B-002',
      agentId: '2',
      agentName: 'Nazmul Enterprise',
      agentContact: '+8801911334455',
      packageId: '2',
      packageName: 'Economy Umrah Package',
      packageType: 'umrah',
      customerId: '2',
      customerName: 'Fatima Begum',
      customerPhone: '+8801811223344',
      sellDate: '2024-01-16',
      sellPrice: 85000,
      discountAmount: 5000,
      finalPrice: 80000,
      commissionRate: 10,
      commissionAmount: 8000,
      paymentMethod: 'cash',
      paymentStatus: 'completed',
      paidAmount: 80000,
      remainingAmount: 0,
      notes: 'Full payment received',
      createdAt: '2024-01-16T14:20:00Z',
      updatedAt: '2024-01-16T14:20:00Z'
    },
    {
      id: '3',
      sellId: 'B2B-003',
      agentId: '1',
      agentName: 'Green Line Travels',
      agentContact: '+8801555667788',
      packageId: '1',
      packageName: 'Premium Haj Package 2024',
      packageType: 'haj',
      customerId: '3',
      customerName: 'Mohammad Ali',
      customerPhone: '+8801911334455',
      sellDate: '2024-01-17',
      sellPrice: 450000,
      discountAmount: 0,
      finalPrice: 450000,
      commissionRate: 8,
      commissionAmount: 36000,
      paymentMethod: 'installment',
      paymentStatus: 'pending',
      paidAmount: 0,
      remainingAmount: 450000,
      notes: 'Installment plan requested',
      createdAt: '2024-01-17T09:15:00Z',
      updatedAt: '2024-01-17T09:15:00Z'
    }
  ]);

  // Filtered and paginated data
  const filteredSells = useMemo(() => {
    let filtered = sells;

    if (searchTerm) {
      const query = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(sell => 
        sell.sellId.toLowerCase().includes(query) ||
        sell.agentName.toLowerCase().includes(query) ||
        sell.customerName.toLowerCase().includes(query) ||
        sell.packageName.toLowerCase().includes(query) ||
        sell.customerPhone.toLowerCase().includes(query)
      );
    }

    if (filters.packageType) {
      filtered = filtered.filter(sell => sell.packageType === filters.packageType);
    }

    if (filters.paymentStatus) {
      filtered = filtered.filter(sell => sell.paymentStatus === filters.paymentStatus);
    }

    if (filters.agentId) {
      filtered = filtered.filter(sell => sell.agentId === filters.agentId);
    }

    return filtered;
  }, [sells, searchTerm, filters]);

  const paginatedSells = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSells.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSells, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSells.length / itemsPerPage);

  // Statistics
  const stats = useMemo(() => {
    const totalSells = sells.length;
    const totalRevenue = sells.reduce((sum, sell) => sum + sell.finalPrice, 0);
    const totalCommission = sells.reduce((sum, sell) => sum + sell.commissionAmount, 0);
    const pendingAmount = sells.reduce((sum, sell) => sum + sell.remainingAmount, 0);
    const completedSells = sells.filter(sell => sell.paymentStatus === 'completed').length;
    const pendingSells = sells.filter(sell => sell.paymentStatus === 'pending').length;
    const partialSells = sells.filter(sell => sell.paymentStatus === 'partial').length;

    return {
      totalSells,
      totalRevenue,
      totalCommission,
      pendingAmount,
      completedSells,
      pendingSells,
      partialSells
    };
  }, [sells]);

  const handleView = (sell) => {
    setSelectedSell(sell);
    setShowSellModal(true);
  };

  const handleEdit = (sell) => {
    setEditingSell(sell);
    setEditFormData({
      paymentStatus: sell.paymentStatus,
      paidAmount: sell.paidAmount,
      notes: sell.notes
    });
    setShowEditModal(true);
  };

  const handleDelete = (sell) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `B2B Sell ${sell.sellId} মুছে ফেলতে চান? এই কাজটি অপরিবর্তনীয়।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'না, বাতিল করুন',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        setSells(prev => prev.filter(s => s.id !== sell.id));
        Swal.fire({
          title: 'মুছে ফেলা হয়েছে!',
          text: 'B2B Sell সফলভাবে মুছে ফেলা হয়েছে।',
          icon: 'success',
          confirmButtonColor: '#059669',
          confirmButtonText: 'ঠিক আছে'
        });
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedSells.length === 0) return;
    
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${selectedSells.length} টি B2B Sell মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'না, বাতিল করুন',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        setSells(prev => prev.filter(sell => !selectedSells.includes(sell.id)));
        setSelectedSells([]);
        setSelectAll(false);
        Swal.fire({
          title: 'মুছে ফেলা হয়েছে!',
          text: 'নির্বাচিত B2B Sell গুলো সফলভাবে মুছে ফেলা হয়েছে।',
          icon: 'success',
          confirmButtonColor: '#059669',
          confirmButtonText: 'ঠিক আছে'
        });
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSells([]);
      setSelectAll(false);
    } else {
      setSelectedSells(paginatedSells.map(sell => sell.id));
      setSelectAll(true);
    }
  };

  const handleSelectSell = (sellId) => {
    if (selectedSells.includes(sellId)) {
      setSelectedSells(selectedSells.filter(id => id !== sellId));
    } else {
      setSelectedSells([...selectedSells, sellId]);
    }
  };

  const handleEditSubmit = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSells(prev => prev.map(sell => 
        sell.id === editingSell.id 
          ? { 
              ...sell, 
              ...editFormData,
              remainingAmount: sell.finalPrice - editFormData.paidAmount,
              updatedAt: new Date().toISOString()
            }
          : sell
      ));
      setLoading(false);
      setShowEditModal(false);
      setEditingSell(null);
      Swal.fire({
        title: 'আপডেট হয়েছে!',
        text: 'B2B Sell সফলভাবে আপডেট করা হয়েছে।',
        icon: 'success',
        confirmButtonColor: '#059669',
        confirmButtonText: 'ঠিক আছে'
      });
    }, 1000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle },
      partial: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: Clock },
      pending: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: AlertCircle }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPackageTypeBadge = (type) => {
    const typeConfig = {
      haj: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: Building },
      umrah: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', icon: Globe }
    };
    
    const config = typeConfig[type];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              B2B Sell List
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              B2B এজেন্ট বিক্রয় তালিকা
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <Link
            to="/hajj-umrah/b2b-sell"
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm sm:text-base">নতুন B2B Sell</span>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm opacity-90">Total Sells</p>
              <p className="text-lg sm:text-xl font-semibold">{stats.totalSells}</p>
            </div>
            <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm opacity-90">Total Revenue</p>
              <p className="text-lg sm:text-xl font-semibold">৳{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm opacity-90">Total Commission</p>
              <p className="text-lg sm:text-xl font-semibold">৳{stats.totalCommission.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm opacity-90">Pending Amount</p>
              <p className="text-lg sm:text-xl font-semibold">৳{stats.pendingAmount.toLocaleString()}</p>
            </div>
            <Clock className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
          </div>
        </div>
      </div>

      {/* Payment Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-lg sm:text-xl font-semibold text-green-600 dark:text-green-400">{stats.completedSells}</p>
            </div>
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Partial</p>
              <p className="text-lg sm:text-xl font-semibold text-yellow-600 dark:text-yellow-400">{stats.partialSells}</p>
            </div>
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400">{stats.pendingSells}</p>
            </div>
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Sell ID, Agent, Customer, Package দিয়ে সার্চ করুন..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm sm:text-base">ফিল্টার</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Package Type
                </label>
                <select
                  value={filters.packageType}
                  onChange={(e) => setFilters(prev => ({ ...prev, packageType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="">All Types</option>
                  <option value="haj">Haj</option>
                  <option value="umrah">Umrah</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="partial">Partial</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <input
                  type="date"
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ dateRange: '', packageType: '', paymentStatus: '', agentId: '' })}
                  className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedSells.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {selectedSells.length} item(s) selected
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedSells([])}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sells Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sell ID</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agent</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Package</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Amount</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Commission</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Loading sells...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedSells.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShoppingCart className="w-12 h-12 text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No B2B sells found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSells.map((sell) => (
                <tr key={sell.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <input
                      type="checkbox"
                      checked={selectedSells.includes(sell.id)}
                      onChange={() => handleSelectSell(sell.id)}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center">
                      <Hash className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{sell.sellId}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">
                            {sell.agentName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {sell.agentName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sell.agentContact}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{sell.customerName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{sell.customerPhone}</p>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{sell.packageName}</p>
                      {getPackageTypeBadge(sell.packageType)}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">৳{sell.finalPrice.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Paid: ৳{sell.paidAmount.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">৳{sell.commissionAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{sell.commissionRate}%</p>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    {getStatusBadge(sell.paymentStatus)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => handleView(sell)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                        title="দেখুন"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(sell)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sell)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSells.length)} of {filteredSells.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showSellModal && selectedSell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  B2B Sell Details - {selectedSell.sellId}
                </h2>
                <button
                  onClick={() => setShowSellModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Agent Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Agent Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedSell.agentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Contact:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedSell.agentContact}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedSell.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Phone:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedSell.customerPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Package Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Package Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Package:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedSell.packageName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                      {getPackageTypeBadge(selectedSell.packageType)}
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Financial Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Sell Price:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">৳{selectedSell.sellPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Final Price:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">৳{selectedSell.finalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Commission:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">৳{selectedSell.commissionAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                      {getStatusBadge(selectedSell.paymentStatus)}
                    </div>
                  </div>
                </div>
              </div>

              {selectedSell.notes && (
                <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSell.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit B2B Sell - {editingSell.sellId}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={editFormData.paymentStatus}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paid Amount
                    </label>
                    <input
                      type="number"
                      value={editFormData.paidAmount}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BSellList;
