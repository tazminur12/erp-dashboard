import React, { useState, useEffect } from 'react';
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
  Camera,
  Upload,
  CreditCard,
  MapPin,
  Building,
  Phone,
  Mail
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../config/cloudinary.js';
import { useReceivingLoan, useUpdateReceivingLoan } from '../../hooks/useLoanQueries';

const EditLoanReceiving = () => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateLoan = useUpdateReceivingLoan();
  const { data: loanData, isLoading: loanLoading } = useReceivingLoan(id);
  const loan = loanData?.loan;

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
    
    // Business Information
    businessName: '',
    businessType: '',
    businessAddress: '',
    businessRegistration: '',
    businessExperience: '',
    
    
    // Contact Information
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Additional Information
    commencementDate: new Date().toISOString().split('T')[0],
    completionDate: '',
    commitmentDate: '',
    notes: ''
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

  // Load loan data into form
  useEffect(() => {
    if (loan) {
      const formatDate = (date) => {
        if (!date) return '';
        if (typeof date === 'string' && date.includes('T')) {
          return date.split('T')[0];
        }
        return date;
      };

      setFormData({
        firstName: loan.firstName || '',
        lastName: loan.lastName || '',
        fullName: loan.fullName || `${loan.firstName || ''} ${loan.lastName || ''}`.trim(),
        fatherName: loan.fatherName || '',
        motherName: loan.motherName || '',
        dateOfBirth: formatDate(loan.dateOfBirth),
        gender: loan.gender || '',
        maritalStatus: loan.maritalStatus || '',
        nidNumber: loan.nidNumber || '',
        nidFrontImage: loan.nidFrontImage || '',
        nidBackImage: loan.nidBackImage || '',
        profilePhoto: loan.profilePhoto || '',
        presentAddress: loan.presentAddress || '',
        permanentAddress: loan.permanentAddress || '',
        district: loan.district || '',
        upazila: loan.upazila || '',
        postCode: loan.postCode || '',
        businessName: loan.businessName || '',
        businessType: loan.businessType || '',
        businessAddress: loan.businessAddress || '',
        businessRegistration: loan.businessRegistration || '',
        businessExperience: loan.businessExperience || '',
        contactPerson: loan.contactPerson || '',
        contactPhone: loan.contactPhone || '',
        contactEmail: loan.contactEmail || '',
        emergencyContact: loan.emergencyContact || '',
        emergencyPhone: loan.emergencyPhone || '',
        commencementDate: formatDate(loan.commencementDate) || new Date().toISOString().split('T')[0],
        completionDate: formatDate(loan.completionDate),
        commitmentDate: formatDate(loan.commitmentDate),
        notes: loan.notes || ''
      });

      // Set image previews if images exist
      if (loan.profilePhoto) {
        setImagePreview(prev => ({ ...prev, profilePhoto: loan.profilePhoto }));
      }
      if (loan.nidFrontImage) {
        setImagePreview(prev => ({ ...prev, nidFrontImage: loan.nidFrontImage }));
      }
      if (loan.nidBackImage) {
        setImagePreview(prev => ({ ...prev, nidBackImage: loan.nidBackImage }));
      }
    }
  }, [loan]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const nextState = { ...prev, [name]: value };
      // Auto-generate fullName from firstName + lastName
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
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setImageUploading(prev => ({ ...prev, [imageType]: true }));
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => ({
          ...prev,
          [imageType]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
      
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'loans');
      
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
        text: 'ছবি আপলোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'নামের প্রথম অংশ আবশ্যক';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'নামের শেষ অংশ আবশ্যক';
    }

    if (formData.nidNumber && !/^\d{10}$|^\d{13}$|^\d{17}$/.test(formData.nidNumber.replace(/\s/g, ''))) {
      newErrors.nidNumber = 'সঠিক জাতীয় পরিচয়পত্র নম্বর লিখুন';
    }

    if (formData.contactPhone && !/^01[3-9]\d{8}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'সঠিক মোবাইল নম্বর লিখুন';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'সঠিক ইমেইল ঠিকানা লিখুন';
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

    try {
      setIsSubmitting(true);
      const result = await updateLoan.mutateAsync({
        loanId: id,
        payload: formData
      });

      await Swal.fire({
        title: 'সফল!',
        text: 'ঋণের তথ্য সফলভাবে আপডেট করা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        background: isDark ? '#1F2937' : '#F9FAFB'
      });
      // Use loanId from loan object (should be available since loan is loaded), or from result, or fallback to id
      const loanIdToNavigate = loan?.loanId || result?.loan?.loanId || id;
      if (!loanIdToNavigate) {
        console.error('No loanId available for navigation');
        navigate('/loan/dashboard');
        return;
      }
      // Pass loan object in state so LoanDetails can use it immediately
      navigate(`/loan/details/${loanIdToNavigate}`, { 
        state: { loan: result?.loan || loan } 
      });

    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'ঋণের তথ্য আপডেট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loanLoading) {
    return (
      <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
        <div className="max-w-4xl mx-auto flex items-center justify-center h-72">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">ঋণ পাওয়া যায়নি</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">এই ID দিয়ে কোনো ঋণ পাওয়া যায়নি।</p>
            <button
              onClick={() => navigate('/loan/receiving-list')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ঋণের তালিকায় ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
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
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ঋণ আবেদন সম্পাদনা করুন
                </h1>
                <p className={`mt-1 text-lg transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  ঋণ আবেদনের তথ্য আপডেট করুন
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form - Same structure as NewLoanReceiving */}
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
                    {imagePreview.profilePhoto || formData.profilePhoto ? (
                      <img 
                        src={imagePreview.profilePhoto || formData.profilePhoto} 
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
                      className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                        imageUploading.profilePhoto ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {imageUploading.profilePhoto ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {imageUploading.profilePhoto ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}
                    </label>
                    {errors.profilePhoto && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.profilePhoto}
                      </p>
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
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
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

              {/* NID Information */}
              <div className="lg:col-span-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  জাতীয় পরিচয়পত্র তথ্য
                </h4>
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

              {/* NID Image Uploads */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  জাতীয় পরিচয়পত্রের সামনের ছবি
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center">
                  {imagePreview.nidFrontImage || formData.nidFrontImage ? (
                    <div className="mb-2">
                      <img 
                        src={imagePreview.nidFrontImage || formData.nidFrontImage} 
                        alt="NID Front Preview" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="py-8">
                      {imageUploading.nidFrontImage ? (
                        <Loader2 className="w-12 h-12 text-green-500 mx-auto mb-2 animate-spin" />
                      ) : (
                        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      )}
                      <p className="text-gray-500">{imageUploading.nidFrontImage ? 'আপলোড হচ্ছে...' : 'জাতীয় পরিচয়পত্রের সামনের ছবি'}</p>
                    </div>
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
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                      imageUploading.nidFrontImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {imageUploading.nidFrontImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {imageUploading.nidFrontImage ? 'আপলোড হচ্ছে...' : 'আপলোড করুন'}
                  </label>
                  {errors.nidFrontImage && (
                    <p className="mt-2 text-sm text-red-600 flex items-center justify-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nidFrontImage}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  জাতীয় পরিচয়পত্রের পিছনের ছবি
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center">
                  {imagePreview.nidBackImage || formData.nidBackImage ? (
                    <div className="mb-2">
                      <img 
                        src={imagePreview.nidBackImage || formData.nidBackImage} 
                        alt="NID Back Preview" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="py-8">
                      {imageUploading.nidBackImage ? (
                        <Loader2 className="w-12 h-12 text-green-500 mx-auto mb-2 animate-spin" />
                      ) : (
                        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      )}
                      <p className="text-gray-500">{imageUploading.nidBackImage ? 'আপলোড হচ্ছে...' : 'জাতীয় পরিচয়পত্রের পিছনের ছবি'}</p>
                    </div>
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
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                      imageUploading.nidBackImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {imageUploading.nidBackImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {imageUploading.nidBackImage ? 'আপলোড হচ্ছে...' : 'আপলোড করুন'}
                  </label>
                  {errors.nidBackImage && (
                    <p className="mt-2 text-sm text-red-600 flex items-center justify-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nidBackImage}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="lg:col-span-2 mt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  ঠিকানা তথ্য
                </h4>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  বর্তমান ঠিকানা
                </label>
                <textarea
                  name="presentAddress"
                  value={formData.presentAddress}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="বর্তমান ঠিকানার বিস্তারিত লিখুন"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  জেলা
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="জেলা লিখুন"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.district
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                  }`}
                />
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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

              {/* Contact Information */}
              <div className="lg:col-span-2 mt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  যোগাযোগের তথ্য
                </h4>
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                  ইমেইল
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                  লোন শুরুর তারিখ
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="commencementDate"
                    value={formData.commencementDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  কমিট্মেন্ট তারিখ
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="commitmentDate"
                    value={formData.commitmentDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  অতিরিক্ত নোট
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="ঋণ আবেদন সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <X className="w-4 h-4" />
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    আপডেট করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    আপডেট করুন
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLoanReceiving;
