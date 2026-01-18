import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Download,
  Filter,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SmallStat from '../../components/common/SmallStat';
import ExcelUploader from '../../components/common/ExcelUploader';
import { useTheme } from '../../contexts/ThemeContext';
import { Helmet } from 'react-helmet-async';

const Customers = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('B2B'); // 'B2B' or 'B2C'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExcelUploader, setShowExcelUploader] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for B2B customers
  const [b2bCustomers, setB2bCustomers] = useState([
    {
      id: 1,
      customerId: 'B2B001',
      companyName: 'Tech Solutions Ltd',
      contactPerson: 'John Smith',
      email: 'john.smith@techsolutions.com',
      phone: '+8801712345678',
      address: '123 Business Street, Dhaka',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Gulshan',
      businessType: 'Technology',
      registrationNumber: 'TRAD/12345/2020',
      taxId: 'TIN-123456789',
      status: 'Active',
      totalOrders: 45,
      totalSpent: 1250000,
      joinDate: '2020-03-15'
    },
    {
      id: 2,
      customerId: 'B2B002',
      companyName: 'Global Travel Agency',
      contactPerson: 'Sarah Johnson',
      email: 'sarah.j@globaltravel.com',
      phone: '+8801712345679',
      address: '456 Corporate Avenue, Chittagong',
      division: 'Chittagong',
      district: 'Chittagong',
      upazila: 'Agrabad',
      businessType: 'Travel & Tourism',
      registrationNumber: 'TRAD/23456/2019',
      taxId: 'TIN-234567890',
      status: 'Active',
      totalOrders: 32,
      totalSpent: 890000,
      joinDate: '2019-07-22'
    },
    {
      id: 3,
      customerId: 'B2B003',
      companyName: 'Premium Services Co',
      contactPerson: 'Michael Brown',
      email: 'michael.b@premiumservices.com',
      phone: '+8801712345680',
      address: '789 Trade Center, Sylhet',
      division: 'Sylhet',
      district: 'Sylhet',
      upazila: 'Zindabazar',
      businessType: 'Services',
      registrationNumber: 'TRAD/34567/2021',
      taxId: 'TIN-345678901',
      status: 'Inactive',
      totalOrders: 18,
      totalSpent: 450000,
      joinDate: '2021-11-08'
    }
  ]);

  // Mock data for B2C customers
  const [b2cCustomers, setB2cCustomers] = useState([
    {
      id: 1,
      customerId: 'B2C001',
      name: 'Ahmed Rahman',
      email: 'ahmed.rahman@example.com',
      phone: '+8801712345681',
      address: '123 Residential Area, Dhaka',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Dhanmondi',
      nid: '1234567890123',
      dob: '1985-03-15',
      occupation: 'Engineer',
      status: 'Active',
      totalOrders: 12,
      totalSpent: 125000,
      joinDate: '2022-05-10'
    },
    {
      id: 2,
      customerId: 'B2C002',
      name: 'Fatima Begum',
      email: 'fatima.begum@example.com',
      phone: '+8801712345682',
      address: '456 Home Street, Chittagong',
      division: 'Chittagong',
      district: 'Chittagong',
      upazila: 'Panchlaish',
      nid: '2345678901234',
      dob: '1988-07-22',
      occupation: 'Teacher',
      status: 'Active',
      totalOrders: 8,
      totalSpent: 89000,
      joinDate: '2022-08-15'
    },
    {
      id: 3,
      customerId: 'B2C003',
      name: 'Karim Uddin',
      email: 'karim.uddin@example.com',
      phone: '+8801712345683',
      address: '789 Local Road, Sylhet',
      division: 'Sylhet',
      district: 'Sylhet',
      upazila: 'Zindabazar',
      nid: '3456789012345',
      dob: '1990-11-08',
      occupation: 'Businessman',
      status: 'Inactive',
      totalOrders: 5,
      totalSpent: 45000,
      joinDate: '2023-01-20'
    }
  ]);

  const [formData, setFormData] = useState({
    customerId: '',
    // B2B fields
    companyName: '',
    contactPerson: '',
    businessType: '',
    registrationNumber: '',
    taxId: '',
    // B2C fields
    name: '',
    nid: '',
    dob: '',
    occupation: '',
    // Common fields
    email: '',
    phone: '',
    address: '',
    division: '',
    district: '',
    upazila: '',
    status: 'Active'
  });

  // Get current customers based on active tab
  const currentCustomers = activeTab === 'B2B' ? b2bCustomers : b2cCustomers;
  const setCurrentCustomers = activeTab === 'B2B' ? setB2bCustomers : setB2cCustomers;

  // Calculate statistics
  const totalCustomers = currentCustomers.length;
  const activeCustomers = currentCustomers.filter(c => c.status === 'Active').length;
  const inactiveCustomers = currentCustomers.filter(c => c.status === 'Inactive').length;
  const totalRevenue = currentCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  // Filter customers based on search term
  const filteredCustomers = currentCustomers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    if (activeTab === 'B2B') {
      return (
        customer.companyName?.toLowerCase().includes(searchLower) ||
        customer.contactPerson?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchTerm) ||
        customer.customerId?.toLowerCase().includes(searchLower)
      );
    } else {
      return (
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchTerm) ||
        customer.customerId?.toLowerCase().includes(searchLower)
      );
    }
  });

  // Table columns configuration for B2B
  const b2bColumns = [
    {
      key: 'companyName',
      header: 'Company Name',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleViewCustomer(item)}
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
              >
                {value}
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">({item.customerId})</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.contactPerson}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Contact',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900 dark:text-white">{value}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{item.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: 'businessType',
      header: 'Business Type',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-white">{value || 'N/A'}</span>
      )
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          ৳{value?.toLocaleString() || '0'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          'Active': { color: 'green', icon: CheckCircle },
          'Inactive': { color: 'yellow', icon: AlertCircle },
          'Suspended': { color: 'red', icon: XCircle }
        };
        const config = statusConfig[value] || statusConfig['Inactive'];
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            config.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
            config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <Icon className="w-3 h-3" />
            <span>{value}</span>
          </span>
        );
      }
    }
  ];

  // Table columns configuration for B2C
  const b2cColumns = [
    {
      key: 'name',
      header: 'Customer Name',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleViewCustomer(item)}
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
              >
                {value}
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">({item.customerId})</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contact',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900 dark:text-white">{value}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{item.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'occupation',
      header: 'Occupation',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-white">{value || 'N/A'}</span>
      )
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          ৳{value?.toLocaleString() || '0'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          'Active': { color: 'green', icon: CheckCircle },
          'Inactive': { color: 'yellow', icon: AlertCircle },
          'Suspended': { color: 'red', icon: XCircle }
        };
        const config = statusConfig[value] || statusConfig['Inactive'];
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            config.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
            config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <Icon className="w-3 h-3" />
            <span>{value}</span>
          </span>
        );
      }
    }
  ];

  const handleAddCustomer = () => {
    setFormData({
      customerId: '',
      companyName: '',
      contactPerson: '',
      businessType: '',
      registrationNumber: '',
      taxId: '',
      name: '',
      nid: '',
      dob: '',
      occupation: '',
      email: '',
      phone: '',
      address: '',
      division: '',
      district: '',
      upazila: '',
      status: 'Active'
    });
    setShowAddModal(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    if (activeTab === 'B2B') {
      setFormData({
        customerId: customer.customerId || '',
        companyName: customer.companyName || '',
        contactPerson: customer.contactPerson || '',
        businessType: customer.businessType || '',
        registrationNumber: customer.registrationNumber || '',
        taxId: customer.taxId || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        division: customer.division || '',
        district: customer.district || '',
        upazila: customer.upazila || '',
        status: customer.status || 'Active'
      });
    } else {
      setFormData({
        customerId: customer.customerId || '',
        name: customer.name || '',
        nid: customer.nid || '',
        dob: customer.dob || '',
        occupation: customer.occupation || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        division: customer.division || '',
        district: customer.district || '',
        upazila: customer.upazila || '',
        status: customer.status || 'Active'
      });
    }
    setShowEditModal(true);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleDeleteCustomer = (customer) => {
    if (window.confirm(`Are you sure you want to delete this customer?`)) {
      setCurrentCustomers(prev => prev.filter(item => item.id !== customer.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (selectedCustomer) {
        // Update existing customer
        setCurrentCustomers(prev => prev.map(customer => 
          customer.id === selectedCustomer.id 
            ? { ...customer, ...formData }
            : customer
        ));
        setShowEditModal(false);
      } else {
        // Add new customer
        const newCustomer = {
          id: Date.now(),
          customerId: activeTab === 'B2B' 
            ? `B2B${String(currentCustomers.length + 1).padStart(3, '0')}`
            : `B2C${String(currentCustomers.length + 1).padStart(3, '0')}`,
          ...formData,
          totalOrders: 0,
          totalSpent: 0,
          joinDate: new Date().toISOString().split('T')[0]
        };
        setCurrentCustomers(prev => [...prev, newCustomer]);
        setShowAddModal(false);
      }
      
      setLoading(false);
      setFormData({
        customerId: '',
        companyName: '',
        contactPerson: '',
        businessType: '',
        registrationNumber: '',
        taxId: '',
        name: '',
        nid: '',
        dob: '',
        occupation: '',
        email: '',
        phone: '',
        address: '',
        division: '',
        district: '',
        upazila: '',
        status: 'Active'
      });
      setSelectedCustomer(null);
    }, 1000);
  };

  const handleExcelDataProcessed = (processedData) => {
    const newCustomers = processedData.map((customerData, index) => ({
      id: Date.now() + index,
      customerId: activeTab === 'B2B' 
        ? `B2B${String(currentCustomers.length + index + 1).padStart(3, '0')}`
        : `B2C${String(currentCustomers.length + index + 1).padStart(3, '0')}`,
      ...customerData,
      totalOrders: 0,
      totalSpent: 0,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    }));

    setCurrentCustomers(prev => [...prev, ...newCustomers]);
    setShowExcelUploader(false);
    alert(`Successfully added ${newCustomers.length} customers from Excel file!`);
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      <Helmet>
        <title>Customers - Fly Oval Limited</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Customers
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage B2B and B2C customers for Fly Oval Limited
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setShowExcelUploader(true)}
            className="flex items-center space-x-2 px-4 py-2 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>
          <button 
            onClick={handleAddCustomer}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('B2B')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'B2B'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>B2B Customers</span>
              <span className="ml-2 py-0.5 px-2 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                {b2bCustomers.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('B2C')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'B2C'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>B2C Customers</span>
              <span className="ml-2 py-0.5 px-2 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                {b2cCustomers.length}
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label={`Total ${activeTab} Customers`}
          value={totalCustomers.toString()}
          icon={Users}
          color="blue"
        />
        <SmallStat
          label="Active Customers"
          value={activeCustomers.toString()}
          icon={CheckCircle}
          color="green"
        />
        <SmallStat
          label="Inactive Customers"
          value={inactiveCustomers.toString()}
          icon={XCircle}
          color="gray"
        />
        <SmallStat
          label="Total Revenue"
          value={`৳${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab} customers...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredCustomers}
        columns={activeTab === 'B2B' ? b2bColumns : b2cColumns}
        searchable={false}
        exportable={true}
        actions={true}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        onView={handleViewCustomer}
      />

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedCustomer ? 'Edit Customer' : `Add ${activeTab} Customer`}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'B2B' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="Enter company name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contact Person <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="Enter contact person name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Business Type
                        </label>
                        <input
                          type="text"
                          value={formData.businessType}
                          onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="Enter business type"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          value={formData.registrationNumber}
                          onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="Enter registration number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tax ID
                        </label>
                        <input
                          type="text"
                          value={formData.taxId}
                          onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="Enter tax ID"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Customer Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="Enter customer name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          NID Number
                        </label>
                        <input
                          type="text"
                          value={formData.nid}
                          onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="Enter NID number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Occupation
                        </label>
                        <input
                          type="text"
                          value={formData.occupation}
                          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="Enter occupation"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Common fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Division
                    </label>
                    <input
                      type="text"
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter division"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter district"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Upazila
                    </label>
                    <input
                      type="text"
                      value={formData.upazila}
                      onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter upazila"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedCustomer(null);
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{selectedCustomer ? 'Update Customer' : 'Add Customer'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 ${activeTab === 'B2B' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-purple-100 dark:bg-purple-900/20'} rounded-full flex items-center justify-center`}>
                    {activeTab === 'B2B' ? (
                      <Building2 className={`w-8 h-8 ${activeTab === 'B2B' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`} />
                    ) : (
                      <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {activeTab === 'B2B' ? selectedCustomer.companyName : selectedCustomer.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCustomer.email}</p>
                    {activeTab === 'B2B' && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer.contactPerson}</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {selectedCustomer.address || `${selectedCustomer.division || ''}, ${selectedCustomer.district || ''}, ${selectedCustomer.upazila || ''}`}
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {selectedCustomer.customerId}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Customer ID</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        ৳{selectedCustomer.totalSpent?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Additional Information</h4>
                  <div className="space-y-2">
                    {activeTab === 'B2B' ? (
                      <>
                        {selectedCustomer.businessType && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Business Type:</span>
                            <span className="text-sm text-gray-900 dark:text-white">{selectedCustomer.businessType}</span>
                          </div>
                        )}
                        {selectedCustomer.registrationNumber && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Registration Number:</span>
                            <span className="text-sm text-gray-900 dark:text-white">{selectedCustomer.registrationNumber}</span>
                          </div>
                        )}
                        {selectedCustomer.taxId && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tax ID:</span>
                            <span className="text-sm text-gray-900 dark:text-white">{selectedCustomer.taxId}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {selectedCustomer.nid && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">NID:</span>
                            <span className="text-sm text-gray-900 dark:text-white">{selectedCustomer.nid}</span>
                          </div>
                        )}
                        {selectedCustomer.dob && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth:</span>
                            <span className="text-sm text-gray-900 dark:text-white">{selectedCustomer.dob}</span>
                          </div>
                        )}
                        {selectedCustomer.occupation && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupation:</span>
                            <span className="text-sm text-gray-900 dark:text-white">{selectedCustomer.occupation}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Join Date:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedCustomer.joinDate || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedCustomer.totalOrders || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCustomer.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : selectedCustomer.status === 'Inactive'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {selectedCustomer.status === 'Active' && <CheckCircle className="w-3 h-3" />}
                        {selectedCustomer.status === 'Inactive' && <AlertCircle className="w-3 h-3" />}
                        {selectedCustomer.status === 'Suspended' && <XCircle className="w-3 h-3" />}
                        <span>{selectedCustomer.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Uploader Modal */}
      {showExcelUploader && (
        <ExcelUploader
          isOpen={showExcelUploader}
          onClose={() => setShowExcelUploader(false)}
          onDataProcessed={handleExcelDataProcessed}
          title={`Upload ${activeTab} Customer Data from Excel`}
          acceptedFields={activeTab === 'B2B' 
            ? ['companyName', 'contactPerson', 'email', 'phone', 'address', 'businessType', 'registrationNumber', 'taxId']
            : ['name', 'email', 'phone', 'address', 'nid', 'dob', 'occupation']
          }
          requiredFields={activeTab === 'B2B' 
            ? ['companyName', 'contactPerson', 'email', 'phone']
            : ['name', 'email', 'phone']
          }
          sampleData={activeTab === 'B2B' 
            ? [
                ['Company Name', 'Contact Person', 'Email', 'Phone', 'Address', 'Business Type', 'Registration Number', 'Tax ID'],
                ['Tech Solutions Ltd', 'John Smith', 'john@techsolutions.com', '+8801712345678', 'Dhaka, Bangladesh', 'Technology', 'TRAD/12345/2020', 'TIN-123456789']
              ]
            : [
                ['Name', 'Email', 'Phone', 'Address', 'NID', 'Date of Birth', 'Occupation'],
                ['Ahmed Rahman', 'ahmed@example.com', '+8801712345681', 'Dhaka, Bangladesh', '1234567890123', '1985-03-15', 'Engineer']
              ]
          }
        />
      )}
    </div>
  );
};

export default Customers;
