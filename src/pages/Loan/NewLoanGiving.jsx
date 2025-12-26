import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft,
  User,
  FileText,
  Save,
  X,
  Loader2,
  AlertCircle,
  TrendingDown,
  Camera,
  Upload,
  MapPin,
  Phone,
  FileCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../config/cloudinary.js';
import { useCreateGivingLoan } from '../../hooks/useLoanQueries';

const NewLoanGiving = () => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createGivingLoan = useCreateGivingLoan();

  const [formData, setFormData] = useState({
    // Personal Profile Information
    firstName: '',
    lastName: '',
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
    
    // Contact Information
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Additional Information
    commencementDate: new Date().toISOString().split('T')[0], // Default to today
    completionDate: '',
    notes: '',
    
  
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
    setFormData(prev => {
      const nextState = { ...prev, [name]: value };
      // Auto-generate fullName from first and last name
      if (name === 'firstName' || name === 'lastName') {
        const nextFirst = name === 'firstName' ? value : nextState.firstName;
        const nextLast = name === 'lastName' ? value : nextState.lastName;
        nextState.fullName = `${(nextFirst || '').trim()} ${(nextLast || '').trim()}`.trim();
      }
      return nextState;
    });
    
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
        title: 'সফল!',
        text: 'ছবি সফলভাবে আপলোড করা হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        background: isDark ? '#1F2937' : '#F9FAFB'
      });
      
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
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

    // Required: only first and last name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'নামের প্রথম অংশ আবশ্যক';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'নামের শেষ অংশ আবশ্যক';
    }

    // Optional validations (format-only when provided)
    if (formData.nidNumber && !/^\d{10}$|^\d{13}$|^\d{17}$/.test(formData.nidNumber.replace(/\s/g, ''))) {
      newErrors.nidNumber = 'সঠিক জাতীয় পরিচয়পত্র নম্বর লিখুন';
    }
    if (formData.contactPhone && !/^01[3-9]\d{8}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'সঠিক মোবাইল নম্বর লিখুন';
    }
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'সঠিক ইমেইল ঠিকানা লিখুন';
    }
    if (formData.emergencyPhone && !/^01[3-9]\d{8}$/.test(formData.emergencyPhone)) {
      newErrors.emergencyPhone = 'সঠিক জরুরি যোগাযোগের মোবাইল নম্বর লিখুন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে সব আবশ্যক ক্ষেত্র সঠিকভাবে পূরণ করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
      return;
    }

    const loanData = {
      ...formData,
      loanDirection: 'giving',
      status: 'Active',
      createdBy: userProfile?.email || 'unknown_user',
      branchId: userProfile?.branchId || 'main_branch'
    };

    try {
      setIsSubmitting(true);
      const result = await createGivingLoan.mutateAsync(loanData);

      await Swal.fire({
        title: 'সফল!',
        text: result?.message || 'ঋণ সফলভাবে প্রদান করা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        background: isDark ? '#1F2937' : '#F9FAFB'
      });
      navigate('/loan/list');

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
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
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        emergencyContact: '',
        emergencyPhone: '',
        commencementDate: new Date().toISOString().split('T')[0],
        completionDate: '',
        notes: ''
      });
      setImagePreview({
        profilePhoto: null,
        nidFrontImage: null,
        nidBackImage: null
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: (error?.response?.data?.message) || error.message || 'ঋণ প্রদানে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
    } finally {
      setIsSubmitting(false);
    }
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
                  নতুন ঋণ প্রদান
                </h1>
                <p className={`mt-1 text-lg transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  ঋণ প্রদানের জন্য প্রয়োজনীয় তথ্য পূরণ করুন
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
                  ব্যক্তিগত তথ্য ও প্রোফাইল
                </h3>
              </div>

              {/* Profile Photo Upload */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  প্রোফাইল ছবি
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
                      {imageUploading.profilePhoto ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}
                    </label>
                    {imagePreview.profilePhoto && (
                      <button
                        type="button"
                        onClick={() => removeImage('profilePhoto')}
                        className="ml-2 text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        সরান
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  নামের প্রথম অংশ *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="নামের প্রথম অংশ লিখুন"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.firstName
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  নামের শেষ অংশ *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="নামের শেষ অংশ লিখুন"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.lastName
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  পূর্ণ নাম
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  readOnly
                  placeholder="পূর্ণ নাম"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  পিতার নাম
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  placeholder="পিতার নাম লিখুন"
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
                  মাতার নাম
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  placeholder="মাতার নাম লিখুন"
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
                  জন্ম তারিখ
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
                  লিঙ্গ
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
                  <option value="">লিঙ্গ নির্বাচন করুন</option>
                  <option value="Male">পুরুষ</option>
                  <option value="Female">মহিলা</option>
                  <option value="Other">অন্যান্য</option>
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
                  বৈবাহিক অবস্থা
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
                  <option value="">অবস্থা নির্বাচন করুন</option>
                  <option value="Single">অবিবাহিত</option>
                  <option value="Married">বিবাহিত</option>
                  <option value="Divorced">তালাকপ্রাপ্ত</option>
                  <option value="Widowed">বিধবা/বিধুর</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  জাতীয় পরিচয়পত্র নম্বর
                </label>
                <input
                  type="text"
                  name="nidNumber"
                  value={formData.nidNumber}
                  onChange={handleInputChange}
                  placeholder="জাতীয় পরিচয়পত্র নম্বর লিখুন"
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
                  জাতীয় পরিচয়পত্রের ছবি
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* NID Front */}
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      সামনের দিক
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
                            {imageUploading.nidFrontImage ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NID Back */}
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      পিছনের দিক
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
                            {imageUploading.nidBackImage ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}
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
                  ঠিকানা তথ্য
                </h3>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  বর্তমান ঠিকানা
                </label>
                <textarea
                  name="presentAddress"
                  value={formData.presentAddress}
                  onChange={handleInputChange}
                  placeholder="বর্তমান ঠিকানার বিস্তারিত লিখুন"
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
                  স্থায়ী ঠিকানা
                </label>
                <textarea
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleInputChange}
                  placeholder="স্থায়ী ঠিকানার বিস্তারিত লিখুন"
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
                  জেলা
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
                  <option value="">জেলা নির্বাচন করুন</option>
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
                  উপজেলা
                </label>
                <input
                  type="text"
                  name="upazila"
                  value={formData.upazila}
                  onChange={handleInputChange}
                  placeholder="উপজেলা লিখুন"
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
                  পোস্ট কোড
                </label>
                <input
                  type="text"
                  name="postCode"
                  value={formData.postCode}
                  onChange={handleInputChange}
                  placeholder="পোস্ট কোড লিখুন"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* Business Information removed as requested */}

              {/* Loan Details removed as requested */}

              {/* Bank Account Selection removed as requested */}

              {/* Contact Information */}
              <div className="lg:col-span-2 mt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  যোগাযোগের তথ্য
                </h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  যোগাযোগের ব্যক্তির নাম
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="যোগাযোগের ব্যক্তির নাম লিখুন"
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
                  মোবাইল নম্বর
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
                  ইমেইল ঠিকানা
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
                  জরুরি যোগাযোগের নাম
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="জরুরি যোগাযোগের নাম লিখুন"
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
                  জরুরি মোবাইল নম্বর
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
                  অতিরিক্ত তথ্য
                </h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  লোন শুরুর তারিখ
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="commencementDate"
                    value={formData.commencementDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  লোন শেষ তারিখ
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="completionDate"
                    value={formData.completionDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  নোট
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="অতিরিক্ত নোট বা তথ্য লিখুন..."
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
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 text-white py-4 px-8 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-lg shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        ঋণ প্রদান করা হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        ঋণ প্রদান করুন
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="sm:w-auto bg-gray-500 text-white py-4 px-8 rounded-xl hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-lg"
                  >
                    <X className="w-5 h-5" />
                    বাতিল
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
