import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Plane,
  Building,
  Phone,
  Mail,
  Globe,
  FileText,
  Settings,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const AirlinesList = () => {
  const navigate = useNavigate();
  const [airlines, setAirlines] = useState([]);
  const [filteredAirlines, setFilteredAirlines] = useState([]);
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [showAirlineModal, setShowAirlineModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    iataCode: '',
    logo: '',
    salesOffice: '',
    hotline: '',
    email: '',
    website: '',
    refundPolicy: '',
    reissueRule: '',
    baggageAllowance: '',
    cancellationPolicy: '',
    changePolicy: '',
    contactPerson: '',
    contactPhone: '',
    address: '',
    status: 'active'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    region: 'all'
  });

  // Mock data for airlines
  useEffect(() => {
    const mockAirlines = [
      {
        id: 1,
        name: 'Biman Bangladesh Airlines',
        iataCode: 'BG',
        logo: '🛩️',
        salesOffice: 'Dhaka Sales Office',
        hotline: '+880 2-955-1234',
        email: 'sales@biman-airlines.com',
        website: 'www.biman-airlines.com',
        refundPolicy: 'Full refund within 24 hours, 50% refund within 7 days',
        reissueRule: 'Reissue fee: ৳2000 + fare difference',
        baggageAllowance: 'Economy: 20kg, Business: 30kg, First: 40kg',
        cancellationPolicy: 'Cancellation fee: ৳1500 + 10% of fare',
        changePolicy: 'Date change fee: ৳1000, Route change: ৳2000',
        contactPerson: 'Ahmed Khan',
        contactPhone: '+880 1712-345678',
        address: 'Balaka Bhaban, Kurmitola, Dhaka-1229',
        status: 'active',
        region: 'Asia',
        totalTransactions: 1250,
        monthlyRevenue: 4500000,
        lastUpdated: '2024-01-15'
      },
      {
        id: 2,
        name: 'US-Bangla Airlines',
        iataCode: 'BS',
        logo: '✈️',
        salesOffice: 'Chittagong Sales Office',
        hotline: '+880 2-955-5678',
        email: 'info@us-bangla.com',
        website: 'www.us-bangla.com',
        refundPolicy: 'Full refund within 12 hours, 75% refund within 3 days',
        reissueRule: 'Reissue fee: ৳2500 + fare difference',
        baggageAllowance: 'Economy: 25kg, Business: 35kg',
        cancellationPolicy: 'Cancellation fee: ৳2000 + 15% of fare',
        changePolicy: 'Date change fee: ৳1500, Route change: ৳2500',
        contactPerson: 'Fatema Begum',
        contactPhone: '+880 1812-345679',
        address: 'House 77, Road 11, Banani, Dhaka-1213',
        status: 'active',
        region: 'Asia',
        totalTransactions: 980,
        monthlyRevenue: 3200000,
        lastUpdated: '2024-01-20'
      },
      {
        id: 3,
        name: 'NOVOAIR',
        iataCode: 'VQ',
        logo: '🛫',
        salesOffice: 'Sylhet Sales Office',
        hotline: '+880 2-955-9012',
        email: 'reservations@novoair.com',
        website: 'www.novoair.com',
        refundPolicy: 'Full refund within 6 hours, 60% refund within 24 hours',
        reissueRule: 'Reissue fee: ৳1800 + fare difference',
        baggageAllowance: 'Economy: 18kg, Business: 28kg',
        cancellationPolicy: 'Cancellation fee: ৳1200 + 8% of fare',
        changePolicy: 'Date change fee: ৳800, Route change: ৳1800',
        contactPerson: 'Mohammad Ali',
        contactPhone: '+880 1912-345680',
        address: 'House 15, Road 3, Dhanmondi, Dhaka-1205',
        status: 'active',
        region: 'Asia',
        totalTransactions: 750,
        monthlyRevenue: 2800000,
        lastUpdated: '2024-01-18'
      },
      {
        id: 4,
        name: 'Emirates',
        iataCode: 'EK',
        logo: '🛬',
        salesOffice: 'Dubai Sales Office',
        hotline: '+971 4-214-4444',
        email: 'dhaka@emirates.com',
        website: 'www.emirates.com',
        refundPolicy: 'Full refund within 48 hours, 80% refund within 7 days',
        reissueRule: 'Reissue fee: ৳3500 + fare difference',
        baggageAllowance: 'Economy: 30kg, Business: 40kg, First: 50kg',
        cancellationPolicy: 'Cancellation fee: ৳2500 + 20% of fare',
        changePolicy: 'Date change fee: ৳2000, Route change: ৳3500',
        contactPerson: 'Sarah Johnson',
        contactPhone: '+880 1612-345681',
        address: 'Gulshan-2, Dhaka-1212',
        status: 'active',
        region: 'Middle East',
        totalTransactions: 2100,
        monthlyRevenue: 8500000,
        lastUpdated: '2024-01-22'
      },
      {
        id: 5,
        name: 'Qatar Airways',
        iataCode: 'QR',
        logo: '✈️',
        salesOffice: 'Doha Sales Office',
        hotline: '+974 4-444-6666',
        email: 'dhaka@qatarairways.com',
        website: 'www.qatarairways.com',
        refundPolicy: 'Full refund within 36 hours, 70% refund within 5 days',
        reissueRule: 'Reissue fee: ৳3000 + fare difference',
        baggageAllowance: 'Economy: 28kg, Business: 38kg, First: 48kg',
        cancellationPolicy: 'Cancellation fee: ৳2200 + 18% of fare',
        changePolicy: 'Date change fee: ৳1800, Route change: ৳3000',
        contactPerson: 'Ali Hassan',
        contactPhone: '+880 1512-345682',
        address: 'Banani, Dhaka-1213',
        status: 'active',
        region: 'Middle East',
        totalTransactions: 1850,
        monthlyRevenue: 7200000,
        lastUpdated: '2024-01-25'
      }
    ];

    setAirlines(mockAirlines);
    setFilteredAirlines(mockAirlines);
    setLoading(false);
  }, []);

  // Filter airlines
  useEffect(() => {
    let filtered = airlines;

    if (searchTerm) {
      filtered = filtered.filter(airline =>
        airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airline.iataCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airline.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(airline => airline.status === filters.status);
    }

    if (filters.region !== 'all') {
      filtered = filtered.filter(airline => airline.region === filters.region);
    }

    setFilteredAirlines(filtered);
  }, [airlines, searchTerm, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleViewAirline = (airline) => {
    setSelectedAirline(airline);
    setShowAirlineModal(true);
  };

  const handleEditAirline = (airline) => {
    setFormData(airline);
    setShowAddModal(true);
  };

  const handleDeleteAirline = (airlineId) => {
    if (window.confirm('Are you sure you want to delete this airline?')) {
      setAirlines(prev => prev.filter(airline => airline.id !== airlineId));
      setSuccess('Airline deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleAddAirline = () => {
    setFormData({
      name: '',
      iataCode: '',
      logo: '',
      salesOffice: '',
      hotline: '',
      email: '',
      website: '',
      refundPolicy: '',
      reissueRule: '',
      baggageAllowance: '',
      cancellationPolicy: '',
      changePolicy: '',
      contactPerson: '',
      contactPhone: '',
      address: '',
      status: 'active'
    });
    setShowAddModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.name || !formData.iataCode) {
        throw new Error('Please fill in all required fields');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (formData.id) {
        // Update existing airline
        setAirlines(prev => prev.map(airline => 
          airline.id === formData.id ? { ...formData, lastUpdated: new Date().toISOString().split('T')[0] } : airline
        ));
        setSuccess('Airline updated successfully!');
      } else {
        // Add new airline
        const newAirline = {
          ...formData,
          id: Date.now(),
          totalTransactions: 0,
          monthlyRevenue: 0,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        setAirlines(prev => [...prev, newAirline]);
        setSuccess('Airline added successfully!');
      }

      // Reset form
      setTimeout(() => {
        setShowAddModal(false);
        setFormData({
          name: '',
          iataCode: '',
          logo: '',
          salesOffice: '',
          hotline: '',
          email: '',
          website: '',
          refundPolicy: '',
          reissueRule: '',
          baggageAllowance: '',
          cancellationPolicy: '',
          changePolicy: '',
          contactPerson: '',
          contactPhone: '',
          address: '',
          status: 'active'
        });
        setSuccess('');
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Name', 'IATA Code', 'Sales Office', 'Hotline', 'Email', 'Status', 'Total Transactions', 'Monthly Revenue'],
      ...filteredAirlines.map(airline => [
        airline.name,
        airline.iataCode,
        airline.salesOffice,
        airline.hotline,
        airline.email,
        airline.status,
        airline.totalTransactions,
        airline.monthlyRevenue
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airlines_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const regions = ['Asia', 'Middle East', 'Europe', 'North America', 'Africa'];
  const statuses = ['active', 'inactive', 'suspended'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading airlines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/air-ticketing/tickets')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                এয়ারলাইন তালিকা
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                সিস্টেমে যুক্ত সমস্ত এয়ারলাইনের তথ্য ও ব্যবস্থাপনা
              </p>
            </div>
          </div>
          <button
            onClick={handleAddAirline}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            নতুন এয়ারলাইন
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {success}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="এয়ারলাইনের নাম, IATA কোড, বা যোগাযোগের নাম দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">সব স্ট্যাটাস</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === 'active' ? 'সক্রিয়' : status === 'inactive' ? 'নিষ্ক্রিয়' : 'স্থগিত'}
                  </option>
                ))}
              </select>

              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">সব অঞ্চল</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>

              <button
                onClick={exportToExcel}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Airlines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAirlines.map((airline) => (
            <div key={airline.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{airline.logo}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {airline.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        IATA: {airline.iataCode}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    airline.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : airline.status === 'inactive'
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {airline.status === 'active' ? 'সক্রিয়' : airline.status === 'inactive' ? 'নিষ্ক্রিয়' : 'স্থগিত'}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Building className="w-4 h-4 mr-2" />
                    {airline.salesOffice}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    {airline.hotline}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 mr-2" />
                    {airline.email}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {airline.totalTransactions.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      মোট লেনদেন
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ৳{(airline.monthlyRevenue / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      মাসিক আয়
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewAirline(airline)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    দেখুন
                  </button>
                  <button
                    onClick={() => handleEditAirline(airline)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    সম্পাদনা
                  </button>
                  <button
                    onClick={() => handleDeleteAirline(airline.id)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    মুছুন
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAirlines.length === 0 && (
          <div className="text-center py-12">
            <Plane className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              কোন এয়ারলাইন পাওয়া যায়নি
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              আপনার অনুসন্ধানের সাথে মিলে এমন কোন এয়ারলাইন নেই।
            </p>
          </div>
        )}

        {/* Airline Detail Modal */}
        {showAirlineModal && selectedAirline && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedAirline.name} - বিস্তারিত তথ্য
                  </h2>
                  <button
                    onClick={() => setShowAirlineModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                      <Building className="w-5 h-5 mr-2 text-blue-600" />
                      মৌলিক তথ্য
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">IATA Code</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAirline.iataCode}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Sales Office</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAirline.salesOffice}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Hotline</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAirline.hotline}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAirline.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Website</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAirline.website}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                      <Users className="w-5 h-5 mr-2 text-green-600" />
                      যোগাযোগের তথ্য
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Contact Person</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAirline.contactPerson}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Contact Phone</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAirline.contactPhone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAirline.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Policies */}
                  <div className="space-y-4 lg:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-purple-600" />
                      নীতিমালা ও নিয়ম
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Refund Policy</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAirline.refundPolicy}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Reissue Rule</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAirline.reissueRule}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Baggage Allowance</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAirline.baggageAllowance}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Cancellation Policy</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAirline.cancellationPolicy}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Change Policy</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAirline.changePolicy}</p>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="space-y-4 lg:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                      পরিসংখ্যান
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedAirline.totalTransactions.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">মোট লেনদেন</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ৳{(selectedAirline.monthlyRevenue / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">মাসিক আয়</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {selectedAirline.lastUpdated}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">সর্বশেষ আপডেট</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowAirlineModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Airline Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formData.id ? 'এয়ারলাইন সম্পাদনা করুন' : 'নতুন এয়ারলাইন যোগ করুন'}
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">মৌলিক তথ্য</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          এয়ারলাইনের নাম *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          IATA কোড *
                        </label>
                        <input
                          type="text"
                          name="iataCode"
                          value={formData.iataCode}
                          onChange={handleFormChange}
                          maxLength="3"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          লোগো (Emoji)
                        </label>
                        <input
                          type="text"
                          name="logo"
                          value={formData.logo}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="✈️"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          স্ট্যাটাস
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="active">সক্রিয়</option>
                          <option value="inactive">নিষ্ক্রিয়</option>
                          <option value="suspended">স্থগিত</option>
                        </select>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">যোগাযোগের তথ্য</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sales Office
                        </label>
                        <input
                          type="text"
                          name="salesOffice"
                          value={formData.salesOffice}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hotline
                        </label>
                        <input
                          type="text"
                          name="hotline"
                          value={formData.hotline}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Policies */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">নীতিমালা ও নিয়ম</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Refund Policy
                        </label>
                        <textarea
                          name="refundPolicy"
                          value={formData.refundPolicy}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Reissue Rule
                        </label>
                        <textarea
                          name="reissueRule"
                          value={formData.reissueRule}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Baggage Allowance
                        </label>
                        <textarea
                          name="baggageAllowance"
                          value={formData.baggageAllowance}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cancellation Policy
                        </label>
                        <textarea
                          name="cancellationPolicy"
                          value={formData.cancellationPolicy}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      বাতিল করুন
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          সংরক্ষণ...
                        </>
                      ) : (
                        <>
                          {formData.id ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirlinesList;
