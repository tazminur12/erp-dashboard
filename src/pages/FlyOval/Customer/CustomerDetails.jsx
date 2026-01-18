import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  User,
  Building2,
  FileText,
  Loader2,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  CreditCard,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Clock,
  MessageCircle,
  Download,
  Share2,
  History,
  BarChart3
} from 'lucide-react';
import useSecureAxios from '../../../hooks/UseAxiosSecure';
import Swal from 'sweetalert2';
import { useTheme } from '../../../contexts/ThemeContext';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useSecureAxios();
  const { isDark } = useTheme();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API call
  const mockB2BCustomers = [
    {
      id: 1,
      customerId: 'B2B001',
      type: 'B2B',
      agentId: 'AG001',
      agencyName: 'Tech Solutions Ltd',
      ownersName: 'John Smith',
      email: 'john.smith@techsolutions.com',
      contactNo: '+8801712345678',
      address: '123 Business Street, Dhaka',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Gulshan',
      zipCode: '1212',
      businessType: 'Technology',
      registrationNumber: 'TRAD/12345/2020',
      taxId: 'TIN-123456789',
      status: 'Active',
      totalOrders: 45,
      totalSpent: 1250000,
      joinDate: '2020-03-15',
      lastOrderDate: '2024-01-15',
      transactions: [
        { id: 1, date: '2024-01-15', amount: 50000, type: 'Purchase', status: 'Completed' },
        { id: 2, date: '2024-01-10', amount: 75000, type: 'Purchase', status: 'Completed' },
        { id: 3, date: '2024-01-05', amount: 30000, type: 'Refund', status: 'Pending' }
      ]
    }
  ];

  const mockB2CCustomers = [
    {
      id: 1,
      customerId: 'B2C001',
      type: 'B2C',
      firstName: 'Ahmed',
      lastName: 'Rahman',
      email: 'ahmed.rahman@example.com',
      contactNo: '+8801712345681',
      address: '123 Residential Area, Dhaka',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Dhanmondi',
      zipCode: '1205',
      nid: '1234567890123',
      dob: '1985-03-15',
      occupation: 'Engineer',
      status: 'Active',
      totalOrders: 12,
      totalSpent: 125000,
      joinDate: '2022-05-10',
      lastOrderDate: '2024-01-12',
      transactions: [
        { id: 1, date: '2024-01-12', amount: 15000, type: 'Purchase', status: 'Completed' },
        { id: 2, date: '2024-01-08', amount: 25000, type: 'Purchase', status: 'Completed' },
        { id: 3, date: '2024-01-03', amount: 10000, type: 'Purchase', status: 'Completed' }
      ]
    }
  ];

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        // Simulate API call - replace with actual API
        setTimeout(() => {
          const allCustomers = [...mockB2BCustomers, ...mockB2CCustomers];
          const foundCustomer = allCustomers.find(c => c.id === parseInt(id) || c.customerId === id);
          
          if (foundCustomer) {
            setCustomer(foundCustomer);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Customer Not Found',
              text: 'The requested customer could not be found.'
            });
            navigate('/fly-oval/customers');
          }
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching customer:', error);
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load customer details.'
        });
        navigate('/fly-oval/customers');
      }
    };

    fetchCustomer();
  }, [id, navigate]);

  const handleCopyId = (customerId) => {
    navigator.clipboard.writeText(customerId).then(() => {
      Swal.fire({
        title: 'Copied!',
        text: 'Customer ID copied to clipboard',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { color: 'green', icon: CheckCircle },
      'Inactive': { color: 'yellow', icon: AlertCircle },
      'Suspended': { color: 'red', icon: XCircle }
    };
    const config = statusConfig[status] || statusConfig['Active'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
        config.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
        config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      }`} style={{ fontFamily: "'Google Sans', sans-serif" }}>
        <Icon className="w-4 h-4" />
        <span>{status}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 font-english fly-oval-customer-page" style={{ fontFamily: "'Google Sans', sans-serif" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 font-english fly-oval-customer-page" style={{ fontFamily: "'Google Sans', sans-serif" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Customer not found
              </p>
              <button
                onClick={() => navigate('/fly-oval/customers')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Back to Customers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const customerName = customer.type === 'B2B' 
    ? customer.agencyName 
    : `${customer.firstName || ''} ${customer.lastName || ''}`.trim();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 font-english fly-oval-customer-page" style={{ fontFamily: "'Google Sans', sans-serif" }}>
      <Helmet>
        <title>{customerName} - Customer Details | Fly Oval Limited</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/fly-oval/customers')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Customers
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              {/* Customer ID Badge */}
              <div className="mb-3">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-mono font-semibold" style={{ fontFamily: "'Google Sans', monospace" }}>
                    {customer.customerId}
                  </span>
                  <button
                    onClick={() => handleCopyId(customer.customerId)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5 transition-colors"
                    title="Copy ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                {customerName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                {customer.type === 'B2B' ? 'Business Customer' : 'Individual Customer'} Details
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {getStatusBadge(customer.status)}
              <button
                onClick={() => navigate(`/fly-oval/customers/edit/${id}`)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                <Edit className="w-4 h-4" />
                Edit Customer
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" style={{ fontFamily: "'Google Sans', sans-serif" }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  {customer.type === 'B2B' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  {customer.type === 'B2B' ? 'Business Information' : 'Personal Information'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.type === 'B2B' ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          Agency Name
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          {customer.agencyName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          Owner's Name
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          {customer.ownersName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          Agent ID
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          {customer.agentId || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          Business Type
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          {customer.businessType || 'N/A'}
                        </p>
                      </div>
                      {customer.registrationNumber && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                            Registration Number
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                            {customer.registrationNumber}
                          </p>
                        </div>
                      )}
                      {customer.taxId && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                            Tax ID
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                            {customer.taxId}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          First Name
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          {customer.firstName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          Last Name
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          {customer.lastName || 'N/A'}
                        </p>
                      </div>
                      {customer.nid && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                            NID Number
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                            {customer.nid}
                          </p>
                        </div>
                      )}
                      {customer.dob && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                            Date of Birth
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                            {formatDate(customer.dob)}
                          </p>
                        </div>
                      )}
                      {customer.occupation && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                            Occupation
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                            {customer.occupation}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  <Phone className="w-5 h-5" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        Phone
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {customer.contactNo || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {customer.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        Address
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {customer.address || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {customer.division && `${customer.division}, ${customer.district}, ${customer.upazila}`}
                        {customer.zipCode && ` - ${customer.zipCode}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Quick Info */}
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  Statistics
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        Total Orders
                      </span>
                    </div>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      {customer.totalOrders || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        Total Spent
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      {formatCurrency(customer.totalSpent || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        Join Date
                      </span>
                    </div>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      {formatDate(customer.joinDate)}
                    </span>
                  </div>
                  {customer.lastOrderDate && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          Last Order
                        </span>
                      </div>
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        {formatDate(customer.lastOrderDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => window.open(`mailto:${customer.email}`, '_blank')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </button>
                  <button
                    onClick={() => window.open(`tel:${customer.contactNo}`, '_blank')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  >
                    <Phone className="w-4 h-4" />
                    Call Customer
                  </button>
                  <button
                    onClick={() => navigate(`/fly-oval/customers/edit/${id}`)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Transaction History
              </h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
            
            {customer.transactions && customer.transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        Type
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          {formatDate(transaction.date)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          {transaction.type}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(transaction.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  No transactions found
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Order Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Total Orders
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {customer.totalOrders || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Average Order Value
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {customer.totalOrders > 0 
                      ? formatCurrency(Math.round(customer.totalSpent / customer.totalOrders))
                      : formatCurrency(0)
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Financial Summary
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Total Spent
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {formatCurrency(customer.totalSpent || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Customer Since
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {formatDate(customer.joinDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
