import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Edit, 
  Home, 
  Building2, 
  Plus,
  Eye,
  Trash2
} from 'lucide-react';
import { formatDate as formatDateShared } from '../../lib/format';
import { useTheme } from '../../contexts/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../hooks/UseAxiosSecure';

const CustomerDetails = () => {
  const { isDark } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Load customer details
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axiosSecure.get(`/customers/${id}`);
        
        if (response.data.success) {
          const customerData = response.data.customer;
          setCustomer(customerData);
          setEditForm(customerData);
        } else {
          setError(response.data.message || 'Customer not found');
        }
      } catch (error) {
        setError('Failed to load customer details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadCustomer();
    }
  }, [id, axiosSecure]);

  // Helper functions
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
  const handleEditCustomer = () => {
    navigate(`/customers/edit?id=${customer.id || customer.customerId}`);
  };

  const handleEditModeToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm(customer);
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const response = await axiosSecure.patch(`/customers/${customer.id || customer.customerId}`, editForm);
      
      if (response.data.success) {
        setCustomer(editForm);
        setIsEditing(false);
        Swal.fire({
          title: 'সফল!',
          text: 'কাস্টমার তথ্য সফলভাবে আপডেট করা হয়েছে।',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          background: isDark ? '#1F2937' : '#F0FDF4',
          color: isDark ? '#F9FAFB' : '#111827'
        });
      } else {
        throw new Error(response.data.message || 'Failed to update customer');
      }
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কাস্টমার তথ্য আপডেট করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        color: isDark ? '#F9FAFB' : '#111827'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm(customer);
    setIsEditing(false);
  };

  const handleDeleteCustomer = async () => {
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
      try {
        const response = await axiosSecure.delete(`/customers/${customer.id || customer.customerId}`);
        
        if (response.data.success) {
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'কাস্টমার সফলভাবে মুছে ফেলা হয়েছে।',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            background: isDark ? '#1F2937' : '#F0FDF4',
            color: isDark ? '#F9FAFB' : '#111827'
          }).then(() => {
            navigate('/customers');
          });
        } else {
          throw new Error(response.data.message || 'Failed to delete customer');
        }
      } catch (error) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'কাস্টমার মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
          background: isDark ? '#1F2937' : '#FEF2F2',
          color: isDark ? '#F9FAFB' : '#111827'
        });
      }
    }
  };

  const handleNewTransaction = () => {
    navigate(`/transactions/new?customer=${customer.id || customer.customerId}&name=${encodeURIComponent(customer.name)}`);
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return `${formatDateShared(dateString)} ${new Date(dateString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-2 lg:p-4 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-300">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              কাস্টমার তথ্য লোড হচ্ছে...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className={`min-h-screen p-2 lg:p-4 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <div className="w-5 h-5 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                !
              </div>
              {error || 'Customer not found'}
            </div>
            <button
              onClick={() => navigate('/customers')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Customer List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-2 lg:p-4 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/customers')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                    Customer Details
                  </h1>
                  <p className={`mt-1 text-sm lg:text-base transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    কাস্টমার বিস্তারিত তথ্য
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleNewTransaction}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    New Transaction
                  </button>
                  
                  <button
                    onClick={handleEditModeToggle}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Customer
                  </button>
                  
                  <button
                    onClick={handleDeleteCustomer}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Edit className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Customer Profile Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 mb-6">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            {/* Large Profile Picture */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center ring-4 ring-white dark:ring-gray-700 shadow-xl">
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
                  <div className="w-full h-full hidden items-center justify-center text-3xl lg:text-4xl font-bold text-blue-700 dark:text-blue-300">
                    {(customer.name || 'N A').split(' ').slice(0,2).map(s => s.charAt(0)).join('').toUpperCase()}
                  </div>
                  {!customer.customerImage && (
                    <span className="text-3xl lg:text-4xl font-bold text-blue-700 dark:text-blue-300">
                      {(customer.name || 'N A').split(' ').slice(0,2).map(s => s.charAt(0)).join('').toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Status indicator */}
                <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ring-4 ring-white dark:ring-gray-700 flex items-center justify-center ${
                  customer.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  <div className="w-4 h-4 rounded-full bg-white"></div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {customer.name}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-3">
                ID: {customer.id || customer.customerId}
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                {getCustomerTypeIcon(customer.customerType)}
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {getCustomerTypeLabel(customer.customerType)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  customer.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {customer.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
              </div>
              
              {/* Quick Contact Info */}
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 dark:text-gray-300">
                {customer.mobile || customer.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{customer.mobile || customer.phone}</span>
                  </div>
                ) : null}
                {customer.address ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate max-w-48">{customer.address}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Contact Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Contact Information</h4>
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="tel"
                  value={editForm.mobile || editForm.phone || ''}
                  onChange={(e) => handleFormChange('mobile', e.target.value)}
                  placeholder="Mobile Number"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
                <input
                  type="tel"
                  value={editForm.whatsappNo || ''}
                  onChange={(e) => handleFormChange('whatsappNo', e.target.value)}
                  placeholder="WhatsApp Number"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Mobile:</span> {customer.mobile || customer.phone || 'N/A'}
                </p>
                {customer.whatsappNo && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">WhatsApp:</span> {customer.whatsappNo}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Service Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Service Information</h4>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Type:</span> {getCustomerTypeLabel(customer.customerType)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  customer.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {customer.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
              </p>
              {customer.serviceType && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Service:</span> {customer.serviceType}
                </p>
              )}
            </div>
          </div>

          {/* Transaction Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Transaction Summary</h4>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Total Transactions:</span> {customer.totalTransactions || '0'}
              </p>
              <button
                onClick={handleNewTransaction}
                className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 text-sm"
              >
                Create New Transaction
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          
          {/* Basic Information */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                  মৌলিক তথ্য
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">নাম</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => handleFormChange('name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'border-gray-300'
                          }`}
                        />
                      ) : (
                        <p className="font-semibold text-gray-900 dark:text-white">{customer.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">মোবাইল</p>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.mobile || editForm.phone || ''}
                          onChange={(e) => handleFormChange('mobile', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'border-gray-300'
                          }`}
                        />
                      ) : (
                        <p className="font-semibold text-gray-900 dark:text-white">{customer.mobile || customer.phone}</p>
                      )}
                    </div>
                  </div>

                  {(customer.whatsappNo || isEditing) && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp</p>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editForm.whatsappNo || ''}
                            onChange={(e) => handleFormChange('whatsappNo', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'border-gray-300'
                            }`}
                          />
                        ) : (
                          <p className="font-semibold text-gray-900 dark:text-white">{customer.whatsappNo}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">ঠিকানা</p>
                      {isEditing ? (
                        <textarea
                          value={editForm.address || ''}
                          onChange={(e) => handleFormChange('address', e.target.value)}
                          rows={2}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'border-gray-300'
                          }`}
                        />
                      ) : (
                        <p className="font-semibold text-gray-900 dark:text-white">{customer.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                  অতিরিক্ত তথ্য
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">কাস্টমার আইডি</p>
                      <p className="font-mono font-semibold text-gray-900 dark:text-white">{customer.id || customer.customerId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                      {getCustomerTypeIcon(customer.customerType)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">ধরন</p>
                      {isEditing ? (
                        <select
                          value={editForm.customerType || ''}
                          onChange={(e) => handleFormChange('customerType', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Type</option>
                          <option value="Haj">হাজ্জ</option>
                          <option value="Umrah">ওমরাহ</option>
                          <option value="Air">এয়ার টিকেট</option>
                        </select>
                      ) : (
                        <p className="font-semibold text-gray-900 dark:text-white">{getCustomerTypeLabel(customer.customerType)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/20 rounded-lg flex items-center justify-center">
                      <div className={`w-4 h-4 rounded-full ${customer.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">স্ট্যাটাস</p>
                      <p className={`font-semibold ${customer.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {customer.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </p>
                    </div>
                  </div>

                  {(customer.passportNumber || isEditing) && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">পাসপোর্ট নম্বর</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.passportNumber || ''}
                            onChange={(e) => handleFormChange('passportNumber', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'border-gray-300'
                            }`}
                          />
                        ) : (
                          <p className="font-semibold text-gray-900 dark:text-white">{customer.passportNumber}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {customer.dateOfBirth && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">জন্ম তারিখ</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatDateShared(customer.dateOfBirth)}</p>
                      </div>
                    </div>
                  )}

                  {(customer.nidNumber || isEditing) && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">এনআইডি নম্বর</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.nidNumber || ''}
                            onChange={(e) => handleFormChange('nidNumber', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'border-gray-300'
                            }`}
                          />
                        ) : (
                          <p className="font-semibold text-gray-900 dark:text-white">{customer.nidNumber}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {customer.totalTransactions && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">মোট লেনদেন</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{customer.totalTransactions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          {(customer.division || customer.district || customer.upazila) && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                অবস্থান তথ্য
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {customer.division && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">বিভাগ</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{customer.division}</p>
                    </div>
                  </div>
                )}
                
                {customer.district && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">জেলা</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{customer.district}</p>
                    </div>
                  </div>
                )}
                
                {customer.upazila && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">উপজেলা</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{customer.upazila}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes and Reference */}
          {(customer.notes || customer.referenceBy) && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                অতিরিক্ত তথ্য
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customer.notes && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">নোটস</p>
                    <p className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {customer.notes}
                    </p>
                  </div>
                )}
                
                {customer.referenceBy && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">রেফারেন্স</p>
                    <p className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {customer.referenceBy}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Registration Date */}
          {(customer.createdAt || customer.registrationDate) && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                নিবন্ধন তথ্য
              </h3>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">নিবন্ধনের তারিখ</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(customer.createdAt || customer.registrationDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
