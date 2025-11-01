import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft,
  User,
  DollarSign,
  Calendar,
  FileText,
  Percent,
  Clock,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Camera,
  Upload,
  CreditCard,
  MapPin,
  Building,
  Phone,
  Mail,
  Shield,
  FileCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../config/cloudinary.js';
import { useCreateLoanGiving } from '../../hooks/useLoanQueries';
import { useAccountQueries } from '../../hooks/useAccountQueries';

const NewLoanGiving = () => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const createLoanGivingMutation = useCreateLoanGiving();
  const accountQueries = useAccountQueries();
  const { data: bankAccounts = [], isLoading: accountsLoading } = accountQueries.useBankAccounts();

  const [formData, setFormData] = useState({
    // Personal Profile Information
    fullName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nidNumber: '',
    nidFrontImage: '',
    nidBackImage: '',
    profilePhoto: '',
    
    // Address Information
    presentAddress: '',
    permanentAddress: '',
    district: '',
    upazila: '',
    postCode: '',
    
    // Business Information
    businessName: '',
    businessType: '',
    businessAddress: '',
    businessRegistration: '',
    businessExperience: '',
    
    // Loan Details
    loanType: '', // Text field now
    amount: '',
    source: '',
    purpose: '',
    interestRate: '',
    duration: '',
    givenDate: new Date().toISOString().split('T')[0],
    
    // Contact Information
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Additional Information
    notes: '',
    
    // Bank Account for Transaction
    targetAccountId: ''
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState({
    profilePhoto: null,
    nidFrontImage: null,
    nidBackImage: null
  });
  const [imageUploading, setImageUploading] = useState({
    profilePhoto: false,
    nidFrontImage: false,
    nidBackImage: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const uploadToCloudinary = async (file, imageType) => {
    try {
      // Validate Cloudinary configuration first
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setImageUploading(prev => ({ ...prev, [imageType]: true }));
      
      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => ({
          ...prev,
          [imageType]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
      
      // Create FormData for Cloudinary upload
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'loans');
      
      // Upload to Cloudinary
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
      
      // Update form data with image URL
      setFormData(prev => ({ ...prev, [imageType]: imageUrl }));
      
      Swal.fire({
        title: 'Success!',
        text: 'Image uploaded to Cloudinary successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10B981',
        background: isDark ? '#1F2937' : '#F9FAFB'
      });
      
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to upload image. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
    } finally {
      setImageUploading(prev => ({ ...prev, [imageType]: false }));
    }
  };

  const handleImageUpload = (e, imageType) => {
    const file = e.target.files[0];
    if (file) {
      uploadToCloudinary(file, imageType);
    }
  };

  const removeImage = (imageType) => {
    setImagePreview(prev => ({
      ...prev,
      [imageType]: null
    }));
    setFormData(prev => ({
      ...prev,
      [imageType]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Information Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.fatherName.trim()) {
      newErrors.fatherName = 'Father\'s name is required';
    }

    if (!formData.motherName.trim()) {
      newErrors.motherName = 'Mother\'s name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select gender';
    }

    if (!formData.nidNumber.trim()) {
      newErrors.nidNumber = 'NID number is required';
    }

    // Address Validation
    if (!formData.presentAddress.trim()) {
      newErrors.presentAddress = 'Present address is required';
    }

    if (!formData.permanentAddress.trim()) {
      newErrors.permanentAddress = 'Permanent address is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'Please select district';
    }

    if (!formData.upazila.trim()) {
      newErrors.upazila = 'Please enter upazila';
    }

    // Business Information Validation
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.businessType.trim()) {
      newErrors.businessType = 'Business type is required';
    }

    // Loan Details Validation
    if (!formData.loanType.trim()) {
      newErrors.loanType = 'Loan type is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.source.trim()) {
      newErrors.source = 'Loan source is required';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Loan purpose is required';
    }

    if (!formData.interestRate || parseFloat(formData.interestRate) <= 0) {
      newErrors.interestRate = 'Please enter a valid interest rate';
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Please enter a valid duration';
    }

    // Contact Information Validation
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person name is required';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    } else if (!/^01[3-9]\d{8}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact name is required';
    }

    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Emergency phone number is required';
    } else if (!/^01[3-9]\d{8}$/.test(formData.emergencyPhone)) {
      newErrors.emergencyPhone = 'Please enter a valid emergency phone number';
    }

    // Bank Account Validation
    if (!formData.targetAccountId) {
      newErrors.targetAccountId = 'Please select a bank account';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields correctly.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
      return;
    }

    const loanData = {
      ...formData,
      amount: parseFloat(formData.amount),
      interestRate: parseFloat(formData.interestRate),
      duration: parseInt(formData.duration),
      status: 'Active',
      remainingAmount: parseFloat(formData.amount),
      createdBy: userProfile?.email || 'unknown_user',
      branchId: userProfile?.branchId || 'main_branch'
    };

    createLoanGivingMutation.mutate(loanData, {
      onSuccess: () => {
        Swal.fire({
          title: 'Success!',
          text: 'Loan has been successfully given.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10B981',
          background: isDark ? '#1F2937' : '#F9FAFB'
        });

        // Reset form
        setFormData({
          fullName: '',
          fatherName: '',
          motherName: '',
          dateOfBirth: '',
          gender: '',
          maritalStatus: '',
          nidNumber: '',
          nidFrontImage: '',
          nidBackImage: '',
          profilePhoto: '',
          presentAddress: '',
          permanentAddress: '',
          district: '',
          upazila: '',
          postCode: '',
          businessName: '',
          businessType: '',
          businessAddress: '',
          businessRegistration: '',
          businessExperience: '',
          loanType: '',
          amount: '',
          source: '',
          purpose: '',
          interestRate: '',
          duration: '',
          givenDate: new Date().toISOString().split('T')[0],
          contactPerson: '',
          contactPhone: '',
          contactEmail: '',
          emergencyContact: '',
          emergencyPhone: '',
          notes: '',
          targetAccountId: ''
        });
        setImagePreview({
          profilePhoto: null,
          nidFrontImage: null,
          nidBackImage: null
        });
      },
      onError: (error) => {
        Swal.fire({
          title: 'Error!',
          text: error.message || 'There was a problem giving the loan.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#EF4444',
          background: isDark ? '#1F2937' : '#FEF2F2'
        });
      }
    });
  };

  return (
    <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-green-50 via-white to-blue-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  New Loan Giving
                </h1>
                <p className={`mt-1 text-lg transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Fill in the required information for loan giving
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Profile Information */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information & Profile
                </h3>
              </div>

              {/* Profile Photo Upload */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Profile Photo *
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                    {imagePreview.profilePhoto ? (
                      <img 
                        src={imagePreview.profilePhoto} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'profilePhoto')}
                      className="hidden"
                      id="profilePhoto"
                    />
                    <label
                      htmlFor="profilePhoto"
                      className={`cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 ${
                        imageUploading.profilePhoto ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {imageUploading.profilePhoto ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {imageUploading.profilePhoto ? 'Uploading...' : 'Upload Photo'}
                    </label>
                    {imagePreview.profilePhoto && (
                      <button
                        type="button"
                        onClick={() => removeImage('profilePhoto')}
                        className="ml-2 text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.fullName
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Father's Name *
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  placeholder="Enter father's name"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.fatherName
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.fatherName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fatherName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mother's Name *
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  placeholder="Enter mother's name"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.motherName
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.motherName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.motherName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.dateOfBirth
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.gender
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.gender}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Marital Status
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  NID Number *
                </label>
                <input
                  type="text"
                  name="nidNumber"
                  value={formData.nidNumber}
                  onChange={handleInputChange}
                  placeholder="Enter NID number"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.nidNumber
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.nidNumber && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.nidNumber}
                  </p>
                )}
              </div>

              {/* NID Images Upload */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  NID Images *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* NID Front */}
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Front Side
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                      {imagePreview.nidFrontImage ? (
                        <div className="relative">
                          <img 
                            src={imagePreview.nidFrontImage} 
                            alt="NID Front Preview" 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage('nidFrontImage')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          {imageUploading.nidFrontImage ? (
                            <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                          ) : (
                            <FileCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'nidFrontImage')}
                            className="hidden"
                            id="nidFrontImage"
                            disabled={imageUploading.nidFrontImage}
                          />
                          <label
                            htmlFor="nidFrontImage"
                            className={`cursor-pointer text-blue-500 hover:text-blue-700 ${
                              imageUploading.nidFrontImage ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {imageUploading.nidFrontImage ? 'Uploading...' : 'Upload Image'}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NID Back */}
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Back Side
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                      {imagePreview.nidBackImage ? (
                        <div className="relative">
                          <img 
                            src={imagePreview.nidBackImage} 
                            alt="NID Back Preview" 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage('nidBackImage')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          {imageUploading.nidBackImage ? (
                            <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                          ) : (
                            <FileCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'nidBackImage')}
                            className="hidden"
                            id="nidBackImage"
                            disabled={imageUploading.nidBackImage}
                          />
                          <label
                            htmlFor="nidBackImage"
                            className={`cursor-pointer text-blue-500 hover:text-blue-700 ${
                              imageUploading.nidBackImage ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {imageUploading.nidBackImage ? 'Uploading...' : 'Upload Image'}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="lg:col-span-2 mt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Address Information
                </h3>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Present Address *
                </label>
                <textarea
                  name="presentAddress"
                  value={formData.presentAddress}
                  onChange={handleInputChange}
                  placeholder="Enter present address details"
                  rows="3"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none ${
                    errors.presentAddress
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.presentAddress && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.presentAddress}
                  </p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Permanent Address *
                </label>
                <textarea
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleInputChange}
                  placeholder="Enter permanent address details"
                  rows="3"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none ${
                    errors.permanentAddress
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.permanentAddress && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.permanentAddress}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  District *
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.district
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                  }`}
                >
                  <option value="">Select District</option>
                  <option value="ঢাকা">ঢাকা</option>
                  <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                  <option value="সিলেট">সিলেট</option>
                  <option value="রাজশাহী">রাজশাহী</option>
                  <option value="খুলনা">খুলনা</option>
                  <option value="বরিশাল">বরিশাল</option>
                  <option value="রংপুর">রংপুর</option>
                  <option value="ময়মনসিংহ">ময়মনসিংহ</option>
                </select>
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.district}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Upazila *
                </label>
                <input
                  type="text"
                  name="upazila"
                  value={formData.upazila}
                  onChange={handleInputChange}
                  placeholder="Enter upazila"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.upazila
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.upazila && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.upazila}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Post Code
                </label>
                <input
                  type="text"
                  name="postCode"
                  value={formData.postCode}
                  onChange={handleInputChange}
                  placeholder="Enter post code"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* Business Information */}
              <div className="lg:col-span-2 mt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-green-600" />
                  Business Information
                </h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Enter business name"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.businessName
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.businessName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Business Type *
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.businessType
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Type</option>
                  <option value="Business">Business</option>
                  <option value="Industry">Industry</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Service">Service</option>
                  <option value="Other">Other</option>
                </select>
                {errors.businessType && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.businessType}
                  </p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Business Address
                </label>
                <input
                  type="text"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  placeholder="Enter business address"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Business Registration Number
                </label>
                <input
                  type="text"
                  name="businessRegistration"
                  value={formData.businessRegistration}
                  onChange={handleInputChange}
                  placeholder="Enter registration number"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Business Experience (Years)
                </label>
                <input
                  type="number"
                  name="businessExperience"
                  value={formData.businessExperience}
                  onChange={handleInputChange}
                  placeholder="Enter years of experience"
                  min="0"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* Loan Details */}
              <div className="lg:col-span-2 mt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Loan Details
                </h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Loan Type *
                </label>
                <input
                  type="text"
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleInputChange}
                  placeholder="Enter loan type (e.g., Personal, Business, Agriculture)"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.loanType
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.loanType && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.loanType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Amount Given *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.amount
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Source *
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.source
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Source</option>
                  <option value="Bank">Bank</option>
                  <option value="NGO">NGO</option>
                  <option value="Personal">Personal</option>
                  <option value="Government">Government</option>
                  <option value="Other">Other</option>
                </select>
                {errors.source && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.source}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Purpose *
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.purpose
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Purpose</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                  <option value="House Purchase">House Purchase</option>
                  <option value="Medical">Medical</option>
                  <option value="Vehicle Purchase">Vehicle Purchase</option>
                  <option value="Other">Other</option>
                </select>
                {errors.purpose && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.purpose}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Interest Rate (%) *
                </label>
                <input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  max="100"
                  step="0.01"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.interestRate
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.interestRate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.interestRate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Duration (Months) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="1"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.duration
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.duration}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Given Date *
                </label>
                <input
                  type="date"
                  name="givenDate"
                  value={formData.givenDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* Bank Account Selection */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Bank Account for Transaction *
                </label>
                <select
                  name="targetAccountId"
                  value={formData.targetAccountId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.targetAccountId
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                  }`}
                  disabled={accountsLoading}
                >
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map((account) => (
                    <option key={account._id || account.id} value={account._id || account.id}>
                      {account.bankName || account.accountName} - {account.accountNumber} (Balance: ৳{(account.balance || account.currentBalance || account.initialBalance || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
                {errors.targetAccountId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.targetAccountId}
                  </p>
                )}
              </div>

              {/* Contact Information */}
              <div className="lg:col-span-2 mt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  Contact Information
                </h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Enter contact person name"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.contactPerson
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.contactPerson && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.contactPerson}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="01XXXXXXXXX"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.contactPhone
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.contactPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.contactEmail
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.contactEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact name"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.emergencyContact
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.emergencyContact && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.emergencyContact}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Emergency Phone Number *
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  placeholder="01XXXXXXXXX"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.emergencyPhone
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.emergencyPhone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.emergencyPhone}
                  </p>
                )}
              </div>

              {/* Additional Information */}
              <div className="lg:col-span-2 mt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Additional Information
                </h3>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Enter additional notes or information..."
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* Submit Button */}
              <div className="lg:col-span-2 mt-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={createLoanGivingMutation.isPending}
                    className="flex-1 bg-green-600 text-white py-4 px-8 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-lg shadow-lg"
                  >
                    {createLoanGivingMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Giving Loan...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Give Loan
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="sm:w-auto bg-gray-500 text-white py-4 px-8 rounded-xl hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-lg"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewLoanGiving;
