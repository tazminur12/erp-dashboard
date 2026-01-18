import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Building2, X, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../../../contexts/ThemeContext';
import useSecureAxios from '../../../hooks/UseAxiosSecure';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../config/cloudinary';
import Swal from 'sweetalert2';

const EditFlyOvalAccount = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isDark } = useTheme();
  const axiosSecure = useSecureAxios();

  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'Current',
    accountCategory: 'bank',
    branchName: '',
    accountHolder: '',
    accountTitle: '',
    routingNumber: '',
    logo: null,
    initialBalance: '',
    currentBalance: '',
    currency: 'BDT',
    contactNumber: '',
    createdBy: '',
    branchId: ''
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [originalCurrentBalance, setOriginalCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  const mockAccounts = [
    {
      _id: '1',
      bankName: 'Dutch Bangla Bank',
      accountTitle: 'FlyOval Main Account',
      accountNumber: '1234567890',
      accountType: 'Current',
      accountCategory: 'bank',
      logo: null,
      initialBalance: 1000000,
      currentBalance: 1250000,
      currency: 'BDT',
      branchName: 'Gulshan Branch',
      accountHolder: 'Fly Oval Limited',
      routingNumber: '098765432',
      contactNumber: '+8801712345678',
      createdBy: 'SYSTEM',
      branchId: 'BRANCH001'
    }
  ];

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          const foundAccount = mockAccounts.find(a => a._id === id);
          if (foundAccount) {
            setFormData({
              bankName: foundAccount.bankName || '',
              accountNumber: foundAccount.accountNumber || '',
              accountType: foundAccount.accountType || 'Current',
              accountCategory: foundAccount.accountCategory || 'bank',
              branchName: foundAccount.branchName || '',
              accountHolder: foundAccount.accountHolder || '',
              accountTitle: foundAccount.accountTitle || '',
              routingNumber: foundAccount.routingNumber || '',
              logo: foundAccount.logo || null,
              initialBalance: foundAccount.initialBalance || '',
              currentBalance: foundAccount.currentBalance ?? foundAccount.balance ?? '',
              currency: foundAccount.currency || 'BDT',
              contactNumber: foundAccount.contactNumber || '',
              createdBy: foundAccount.createdBy || '',
              branchId: foundAccount.branchId || ''
            });
            setOriginalCurrentBalance(Number(foundAccount.currentBalance ?? foundAccount.balance ?? 0));
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Account Not Found',
              text: 'The requested account could not be found.'
            });
            navigate('/fly-oval/account');
          }
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching account:', error);
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load account details.'
        });
        navigate('/fly-oval/account');
      }
    };

    fetchAccount();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const uploadToCloudinary = async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setIsUploading(true);
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }
      
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'flyoval-bank-logos');
      
      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      const imageUrl = result.secure_url;
      
      setUploadedImageUrl(imageUrl);
      setFormData(prev => ({ ...prev, logo: imageUrl }));
      
      Swal.fire({
        title: 'Success!',
        text: 'Logo uploaded successfully!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to upload logo. Please try again.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadToCloudinary(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: null
    }));
    setUploadedImageUrl(null);
    setErrors(prev => ({
      ...prev,
      logo: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }

    if (!formData.routingNumber.trim()) {
      newErrors.routingNumber = 'Routing number is required';
    }

    if (!formData.accountCategory.trim()) {
      newErrors.accountCategory = 'Account category is required';
    }

    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }

    if (!formData.accountHolder.trim()) {
      newErrors.accountHolder = 'Account holder is required';
    }

    if (!formData.accountTitle.trim()) {
      newErrors.accountTitle = 'Account title is required';
    }

    if (!formData.initialBalance || parseFloat(formData.initialBalance) < 0) {
      newErrors.initialBalance = 'Valid initial balance is required';
    }

    if (formData.currentBalance === '' || Number.isNaN(Number(formData.currentBalance)) || parseFloat(formData.currentBalance) < 0) {
      newErrors.currentBalance = 'Valid current balance is required';
    }

    if (formData.contactNumber && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid contact number';
    }

    const validCategories = ['cash', 'bank', 'mobile_banking', 'check', 'others'];
    if (formData.accountCategory && !validCategories.includes(formData.accountCategory)) {
      newErrors.accountCategory = 'Please select a valid account category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        id,
        ...formData,
        initialBalance: parseFloat(formData.initialBalance),
        currentBalance: parseFloat(formData.currentBalance),
      };

      await axiosSecure.put(`/fly-oval/accounts/${id}`, payload);
      setOriginalCurrentBalance(Number(payload.currentBalance) || 0);
      
      Swal.fire({
        title: 'Success!',
        text: 'Account updated successfully!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate('/fly-oval/account');
      });
    } catch (error) {
      console.error('Error updating account:', error);
      Swal.fire({
        title: 'Error!',
        text: error?.response?.data?.message || 'Failed to update account. Please try again.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Your changes will not be saved.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Leave',
      cancelButtonText: 'No, Stay',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/fly-oval/account');
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center font-english fly-oval-customer-page" style={{ fontFamily: "'Google Sans', sans-serif" }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400" style={{ fontFamily: "'Google Sans', sans-serif" }}>Loading account details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 font-english fly-oval-customer-page" style={{ fontFamily: "'Google Sans', sans-serif" }}>
      <Helmet>
        <title>Edit Account - Fly Oval Limited</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Edit Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Update Fly Oval Limited account information
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Logo Upload Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Bank Logo
              </h3>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 relative">
                  {formData.logo || uploadedImageUrl ? (
                    <div className="relative group">
                      <img
                        src={formData.logo || uploadedImageUrl}
                        alt="Bank Logo Preview"
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Remove logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      ) : (
                        <Building2 className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <div className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isUploading 
                        ? 'cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                        : 'cursor-pointer border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`} style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {formData.logo || uploadedImageUrl ? 'Change Logo' : 'Upload Logo'}
                        </>
                      )}
                    </div>
                  </label>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    PNG, JPG, WebP up to 5MB
                  </p>
                  {errors.logo && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>{errors.logo}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                Bank Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.bankName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Dutch Bangla Bank Limited"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  />
                  {errors.bankName && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>{errors.bankName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Account Title *
                  </label>
                  <input
                    type="text"
                    name="accountTitle"
                    value={formData.accountTitle}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.accountTitle ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., FlyOval Main Account"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  />
                  {errors.accountTitle && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>{errors.accountTitle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono ${
                      errors.accountNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., 1234567890"
                    style={{ fontFamily: "'Google Sans', monospace" }}
                  />
                  {errors.accountNumber && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>{errors.accountNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Routing Number *
                  </label>
                  <input
                    type="text"
                    name="routingNumber"
                    value={formData.routingNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.routingNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., 098765432"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  />
                  {errors.routingNumber && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>{errors.routingNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Account Type *
                  </label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  >
                    <option value="Current">Current Account</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Business">Business Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Account Category *
                  </label>
                  <select
                    name="accountCategory"
                    value={formData.accountCategory}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.accountCategory ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="mobile_banking">Mobile Banking</option>
                    <option value="check">Check</option>
                    <option value="others">Others</option>
                  </select>
                  {errors.accountCategory && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>{errors.accountCategory}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.branchName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Gulshan Branch"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  />
                  {errors.branchName && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>{errors.branchName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Account Holder *
                  </label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.accountHolder ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Fly Oval Limited"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  />
                  {errors.accountHolder && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>{errors.accountHolder}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Initial Balance *
                  </label>
                  <input
                    type="number"
                    name="initialBalance"
                    value={formData.initialBalance}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.initialBalance ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0.00"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  />
                  {errors.initialBalance && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>{errors.initialBalance}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Current Balance *
                  </label>
                  <input
                    type="number"
                    name="currentBalance"
                    value={formData.currentBalance}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.currentBalance ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0.00"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  />
                  {errors.currentBalance && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>{errors.currentBalance}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Previous: {originalCurrentBalance?.toLocaleString?.('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Currency *
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  >
                    <option value="BDT">BDT (Bangladeshi Taka)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="SAR">SAR (Saudi Riyal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.contactNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="+8801712345678"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  />
                  {errors.contactNumber && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "'Google Sans', sans-serif" }}>{errors.contactNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Created By
                  </label>
                  <input
                    type="text"
                    name="createdBy"
                    value={formData.createdBy}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="User ID"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    Branch ID
                  </label>
                  <input
                    type="text"
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Branch ID"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
              >
                Update Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditFlyOvalAccount;
