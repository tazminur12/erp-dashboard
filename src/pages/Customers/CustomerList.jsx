import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  MoreHorizontal,
  X,
  RefreshCw,
  Building2,
  Plane,
  Home,
  FileText
} from 'lucide-react';
import { formatDate as formatDateShared } from '../../lib/format';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  useCustomers, 
  useServiceTypes, 
  useServiceStatuses,
  useDeleteCustomer,
  useUpdateCustomerStatus,
  useUpdateCustomerServiceType,
  useUpdateCustomerServiceStatus
} from '../../hooks/useCustomerQueries';
import Swal from 'sweetalert2';

const CustomerList = () => {
  const { isDark } = useTheme();
  
  // React Query hooks
  const { data: customers = [], isLoading: loading, error } = useCustomers();
  const { data: serviceTypes = [], isLoading: serviceTypesLoading } = useServiceTypes();
  
  // Mutation hooks
  const deleteCustomerMutation = useDeleteCustomer();
  const updateStatusMutation = useUpdateCustomerStatus();
  const updateServiceTypeMutation = useUpdateCustomerServiceType();
  const updateServiceStatusMutation = useUpdateCustomerServiceStatus();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    customerType: '',
    registrationDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Service status management
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const { data: serviceStatuses = [], isLoading: serviceStatusesLoading } = useServiceStatuses(selectedServiceType);
  const [editingService, setEditingService] = useState(null);



  // Filter options
  const filterOptions = {
    status: [
      { value: '', label: 'সব স্ট্যাটাস' },
      { value: 'active', label: 'সক্রিয়' },
      { value: 'inactive', label: 'নিষ্ক্রিয়' }
    ],
    customerType: [
      { value: '', label: 'সব ধরন' },
      { value: 'hajj', label: 'হাজ্জ' },
      { value: 'umrah', label: 'ওমরাহ' },
      { value: 'air', label: 'এয়ার টিকেট' }
    ]
  };

  // Filter and search logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Handle both 'id' and 'customerId' fields
      const customerId = customer.id || customer.customerId || '';
      const customerName = customer.name || '';
      const customerPhone = customer.phone || customer.mobile || '';
      
      const matchesSearch = 
        customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerPhone.includes(searchTerm);
      
      const matchesStatus = !filters.status || customer.status === filters.status;
      const matchesType = !filters.customerType || customer.customerType === filters.customerType;
      
      // Date filter logic
      let matchesDate = true;
      if (filters.registrationDate) {
        const customerDate = new Date(customer.createdAt || customer.registrationDate);
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        
        switch (filters.registrationDate) {
          case 'last-week':
            matchesDate = customerDate >= lastWeek;
            break;
          case 'last-month':
            matchesDate = customerDate >= lastMonth;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [customers, searchTerm, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Helper functions
  const getStatusColor = (status) => {
    return status === 'active'
      ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
      : 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getServiceStatusColor = (status) => {
    if (!status) return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('pending') || statusLower.includes('waiting') || statusLower.includes('processing')) {
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    }
    if (statusLower.includes('approved') || statusLower.includes('confirmed') || statusLower.includes('completed') || statusLower.includes('active')) {
      return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    }
    if (statusLower.includes('rejected') || statusLower.includes('cancelled') || statusLower.includes('failed') || statusLower.includes('inactive')) {
      return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    }
    if (statusLower.includes('review') || statusLower.includes('verification') || statusLower.includes('document')) {
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    }
    if (statusLower.includes('on hold') || statusLower.includes('suspended') || statusLower.includes('paused')) {
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    }
    
    // Default color for unknown status
    return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  };

  const getCustomerTypeIcon = (type) => {
    switch (type) {
      case 'Haj':
        return <Home className="w-4 h-4 text-green-600" />;
      case 'Umrah':
        return <Building2 className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCustomerTypeLabel = (type) => {
    switch (type) {
      case 'Haj':
        return 'হাজ্জ';
      case 'Umrah':
        return 'ওমরাহ';
      default:
        return 'অন্যান্য';
    }
  };



  // Event handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      customerType: '',
      registrationDate: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleViewCustomer = (customer) => {
    // Navigate to customer details page
    window.location.href = `/customers/details/${customer.id || customer.customerId}`;
  };

  const handleEditCustomer = async (customer) => {
    try {
      // Navigate to edit page with customer ID
      window.location.href = `/customers/edit?id=${customer.id || customer.customerId}`;
    } catch (error) {
    Swal.fire({
        title: 'ত্রুটি!',
        text: 'এডিট পেজে যেতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handleDeleteCustomer = async (customer) => {
    const result = await Swal.fire({
      title: 'কাস্টমার মুছতে চান?',
      text: `${customer.name} এর সব তথ্য মুছে যাবে!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'না, বাতিল করুন',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      background: isDark ? '#1F2937' : '#FEF2F2',
      color: isDark ? '#F9FAFB' : '#111827'
    });

    if (result.isConfirmed) {
      const customerId = customer.id || customer.customerId;
      deleteCustomerMutation.mutate(customerId);
    }
  };

  const handleNewTransaction = (customer) => {
    // Navigate to new transaction page with customer pre-selected
    const customerId = customer.id || customer.customerId;
    window.location.href = `/transactions/new?customer=${customerId}&name=${encodeURIComponent(customer.name)}`;
  };

  // Update customer status (active/inactive)
  const handleStatusToggle = (customer) => {
    const customerId = customer.id || customer.customerId;
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    
    updateStatusMutation.mutate({ customerId, status: newStatus });
  };

  // Load service statuses when service type changes
  const loadServiceStatuses = (serviceType) => {
    setSelectedServiceType(serviceType);
  };

  // Handle service type edit
  const handleServiceTypeEdit = (customer, newServiceType) => {
    const customerId = customer.id || customer.customerId;
    
    updateServiceTypeMutation.mutate({ customerId, serviceType: newServiceType });
    setEditingService(null);
  };

  // Handle service status edit
  const handleServiceStatusEdit = (customer, newServiceStatus) => {
    const customerId = customer.id || customer.customerId;
    
    updateServiceStatusMutation.mutate({ customerId, serviceStatus: newServiceStatus });
    setEditingService(null);
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Format date function (English)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return `${formatDateShared(dateString)} ${new Date(dateString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className={`min-h-screen p-2 lg:p-4 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg lg:rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  Customer List
                </h1>
                <p className={`mt-1 lg:mt-2 text-sm lg:text-base transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  সব কাস্টমারের তালিকা এবং পরিচালনা
                </p>
              </div>
            </div>
            
            <button
              onClick={() => window.location.href = '/customers/add'}
              className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg lg:rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm lg:text-base"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              + Add New Customer
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="mb-6 text-center py-8">
            <div className="inline-flex items-center gap-2 text-lg text-gray-600 dark:text-gray-300">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              কাস্টমার তথ্য লোড হচ্ছে...
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <div className="w-5 h-5 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                !
              </div>
              {error}
            </div>
          </div>
        )}

        {/* Search and Filters Section */}
        <div className={`mb-4 lg:mb-6 bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6 border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Customer ID, নাম বা ফোন দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 lg:pl-12 pr-4 py-2 lg:py-3 border rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base ${
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    স্ট্যাটাস
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {filterOptions.status.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    কাস্টমার টাইপ
                  </label>
                  <select
                    value={filters.customerType}
                    onChange={(e) => handleFilterChange('customerType', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {filterOptions.customerType.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Registration Date Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    নিবন্ধনের তারিখ
                  </label>
                  <select
                    value={filters.registrationDate}
                    onChange={(e) => handleFilterChange('registrationDate', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">সব তারিখ</option>
                    <option value="last-week">গত সপ্তাহ</option>
                    <option value="last-month">গত মাস</option>
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
                মোট কাস্টমার: <span className="font-semibold text-blue-600">{filteredCustomers.length}</span>
              </span>
              {Object.values(filters).some(value => value !== '') && (
                <span className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  ফিল্টারকৃত ফলাফল: <span className="font-semibold">{currentCustomers.length}</span>
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

        {/* Customers Table */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>

          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`bg-gray-50 dark:bg-gray-700`}>
                <tr>
                  <th className={`px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    Customer Name
                  </th>
                  <th className={`px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    Customer ID
                  </th>
                  <th className={`px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    Phone Number
                  </th>
                  <th className={`px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    Address
                  </th>
                  <th className={`px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    Service Type
                  </th>
                  <th className={`px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    Service Status
                  </th>
                  <th className={`px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700`}>
                {currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            কাস্টমার তথ্য লোড হচ্ছে...
                          </div>
                        ) : error ? (
                          <div className="text-red-500">
                            ❌ {error}
                          </div>
                        ) : (
                          <div>
                            📭 কোন কাস্টমার পাওয়া যায়নি
                            <br />
                            <span className="text-sm">মোট কাস্টমার: {customers.length}, ফিল্টার করা: {filteredCustomers.length}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentCustomers.map((customer, index) => (
                  <tr key={customer.id || customer.customerId || `customer-${index}`} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center ring-2 ring-white dark:ring-gray-700">
                          {customer.customerImage ? (
                            <img
                              src={typeof customer.customerImage === 'string' 
                                ? customer.customerImage 
                                : customer.customerImage.cloudinaryUrl || customer.customerImage.downloadURL}
                              alt={customer.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                            />
                          ) : null}
                          <div className="w-full h-full hidden items-center justify-center text-sm font-semibold text-blue-700 dark:text-blue-300">
                            {(customer.name || 'N A').split(' ').slice(0,2).map(s => s.charAt(0)).join('').toUpperCase()}
                          </div>
                          {!customer.customerImage && (
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                              {(customer.name || 'N A').split(' ').slice(0,2).map(s => s.charAt(0)).join('').toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-3 lg:ml-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {customer.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            {getCustomerTypeIcon(customer.customerType)}
                            {getCustomerTypeLabel(customer.customerType)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                        {customer.id || customer.customerId || 'N/A'}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        {customer.phone || customer.mobile || 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="truncate max-w-32">{customer.address || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      {editingService?.customerId === (customer.id || customer.customerId) && editingService?.field === 'serviceType' ? (
                        <select
                          value={customer.serviceType || ''}
                          onChange={(e) => {
                            const newServiceType = e.target.value;
                            handleServiceTypeEdit(customer, newServiceType);
                          }}
                          onBlur={() => setEditingService(null)}
                          className={`text-sm border rounded-lg px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300'
                          }`}
                          autoFocus
                        >
                          <option value="">Select Service</option>
                          {serviceTypes.map((service) => {
                            const value = service?.id || service?.value || service?.slug || service;
                            const label = service?.name || service?.label || service?.title || service;
                            return (
                              <option key={String(value)} value={String(value)}>
                                {String(label)}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingService({ customerId: customer.id || customer.customerId, field: 'serviceType' })}
                          className={`text-sm px-2 py-1 rounded-lg border hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 ${
                            isDark 
                              ? 'border-gray-600 text-gray-300 hover:text-white' 
                              : 'border-gray-300 text-gray-700 hover:text-purple-600'
                          }`}
                          title="Click to edit service type"
                        >
                          {customer.serviceType ? 
                            serviceTypes.find(s => (s?.id || s?.value || s?.slug || s) === customer.serviceType)?.name || 
                            serviceTypes.find(s => (s?.id || s?.value || s?.slug || s) === customer.serviceType)?.label || 
                            serviceTypes.find(s => (s?.id || s?.value || s?.slug || s) === customer.serviceType)?.title || 
                            customer.serviceType
                            : 'Not Set'
                          }
                        </button>
                      )}
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      {editingService?.customerId === (customer.id || customer.customerId) && editingService?.field === 'serviceStatus' ? (
                        <select
                          value={customer.serviceStatus || ''}
                          onChange={(e) => {
                            const newServiceStatus = e.target.value;
                            handleServiceStatusEdit(customer, newServiceStatus);
                          }}
                          onBlur={() => setEditingService(null)}
                          disabled={!customer.serviceType}
                          className={`text-sm border rounded-lg px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300'
                          } ${!customer.serviceType ? 'opacity-50 cursor-not-allowed' : ''}`}
                          autoFocus
                        >
                          <option value="">Select Status</option>
                          {serviceStatuses.map((status) => {
                            const value = status?.id || status?.value || status?.slug || status;
                            const label = status?.name || status?.label || status?.title || status;
                            return (
                              <option key={String(value)} value={String(value)}>
                                {String(label)}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <button
                          onClick={() => {
                            if (customer.serviceType) {
                              loadServiceStatuses(customer.serviceType);
                              setEditingService({ customerId: customer.id || customer.customerId, field: 'serviceStatus' });
                            }
                          }}
                          disabled={!customer.serviceType}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:scale-105 transition-all duration-200 ${getServiceStatusColor(customer.serviceStatus)} ${!customer.serviceType ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={customer.serviceType ? "Click to edit service status" : "Select service type first"}
                        >
                          {customer.serviceStatus ? 
                            serviceStatuses.find(s => (s?.id || s?.value || s?.slug || s) === customer.serviceStatus)?.name || 
                            serviceStatuses.find(s => (s?.id || s?.value || s?.slug || s) === customer.serviceStatus)?.label || 
                            serviceStatuses.find(s => (s?.id || s?.value || s?.slug || s) === customer.serviceStatus)?.title || 
                            customer.serviceStatus
                            : 'Not Set'
                          }
                        </button>
                      )}
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(customer)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:scale-105 transition-all duration-200 ${getStatusColor(customer.status || 'active')}`}
                        title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                      >
                        {(customer.status || 'active') === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </button>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                          title="দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                          title="এডিট"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                          title="মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleNewTransaction(customer)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200"
                          title="নতুন লেনদেন"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {currentCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                কোন কাস্টমার পাওয়া যায়নি
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || Object.values(filters).some(value => value !== '')
                  ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোন কাস্টমার নেই'
                  : 'এখনও কোন কাস্টমার যোগ করা হয়নি'
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
                  ({startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} এর {filteredCustomers.length})
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

    </div>
  );
};

export default CustomerList;
