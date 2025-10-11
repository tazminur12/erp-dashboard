import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
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
  Camera,
  Upload,
  CreditCard,
  MapPin,
  Building,
  Phone,
  Mail
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const NewLoanReceiving = () => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Personal Profile Information
    fullName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nidNumber: '',
    nidFrontImage: null,
    nidBackImage: null,
    profilePhoto: null,
    
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
    loanType: 'Personal', // Personal or Pathisthanik
    amount: '',
    source: '',
    purpose: '',
    interestRate: '',
    duration: '',
    appliedDate: new Date().toISOString().split('T')[0],
    
    // Contact Information
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Additional Information
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState({
    profilePhoto: null,
    nidFrontImage: null,
    nidBackImage: null
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

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: 'Please upload image files only'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: 'File size cannot exceed 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => ({
          ...prev,
          [fieldName]: e.target.result
        }));
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors[fieldName]) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: ''
        }));
      }
    }
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

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select gender';
    }

    if (!formData.nidNumber.trim()) {
      newErrors.nidNumber = 'National ID number is required';
    } else if (!/^\d{10}$|^\d{13}$|^\d{17}$/.test(formData.nidNumber.replace(/\s/g, ''))) {
      newErrors.nidNumber = 'Please enter a valid NID number';
    }

    if (!formData.profilePhoto) {
      newErrors.profilePhoto = 'Profile photo is required';
    }

    if (!formData.nidFrontImage) {
      newErrors.nidFrontImage = 'NID front image is required';
    }

    if (!formData.nidBackImage) {
      newErrors.nidBackImage = 'NID back image is required';
    }

    // Address Validation
    if (!formData.presentAddress.trim()) {
      newErrors.presentAddress = 'Present address is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.upazila.trim()) {
      newErrors.upazila = 'Upazila is required';
    }

    // Contact Information Validation
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    } else if (!/^01[3-9]\d{8}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    // Loan Details Validation
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const loanData = {
        ...formData,
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate),
        duration: parseInt(formData.duration),
        status: 'Pending',
        createdBy: userProfile?.email || 'unknown_user',
        branchId: userProfile?.branchId || 'main_branch'
      };

      const response = await axiosSecure.post('/loans/receiving', loanData);

      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Loan application has been submitted successfully.',
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
          nidFrontImage: null,
          nidBackImage: null,
          profilePhoto: null,
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
          loanType: 'Personal',
          amount: '',
          source: '',
          purpose: '',
          interestRate: '',
          duration: '',
          appliedDate: new Date().toISOString().split('T')[0],
          contactPerson: '',
          contactPhone: '',
          contactEmail: '',
          emergencyContact: '',
          emergencyPhone: '',
          notes: ''
        });
        setImagePreview({
          profilePhoto: null,
          nidFrontImage: null,
          nidBackImage: null
        });
      }
    } catch (error) {
      console.error('Loan application error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'There was a problem submitting the loan application.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
    } finally {
      setLoading(false);
    }
  };

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
                  New Loan Application
                </h1>
                <p className={`mt-1 text-lg transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Fill in the required information for loan application
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
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Photo
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
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
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
                  Mother's Name
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  placeholder="Enter mother's name"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
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

              {/* NID Information */}
              <div className="lg:col-span-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  National ID Information
                </h4>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  National ID Number *
                </label>
                <input
                  type="text"
                  name="nidNumber"
                  value={formData.nidNumber}
                  onChange={handleInputChange}
                  placeholder="Enter National ID number"
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
                  NID Front Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center">
                  {imagePreview.nidFrontImage ? (
                    <div className="mb-2">
                      <img 
                        src={imagePreview.nidFrontImage} 
                        alt="NID Front Preview" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">NID Front Image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'nidFrontImage')}
                    className="hidden"
                    id="nidFrontImage"
                  />
                  <label
                    htmlFor="nidFrontImage"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
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
                  NID Back Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center">
                  {imagePreview.nidBackImage ? (
                    <div className="mb-2">
                      <img 
                        src={imagePreview.nidBackImage} 
                        alt="NID Back Preview" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">NID Back Image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'nidBackImage')}
                    className="hidden"
                    id="nidBackImage"
                  />
                  <label
                    htmlFor="nidBackImage"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
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
                  Address Information
                </h4>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Present Address *
                </label>
                <textarea
                  name="presentAddress"
                  value={formData.presentAddress}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Enter detailed present address"
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
                  District *
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="Enter district"
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
                  Upazila *
                </label>
                <input
                  type="text"
                  name="upazila"
                  value={formData.upazila}
                  onChange={handleInputChange}
                  placeholder="Enter upazila"
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
                  Contact Information
                </h4>
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
                  Email
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

              {/* Loan Type Selection */}
              <div className="lg:col-span-2 mt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Loan Details
                </h4>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Loan Type *
                </label>
                <select
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="Personal">Personal Loan</option>
                  <option value="Pathisthanik">Educational Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Loan Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                  Loan Source *
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                  Loan Purpose *
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                  <option value="Home Purchase">Home Purchase</option>
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                  max="360"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                  Application Date *
                </label>
                <input
                  type="date"
                  name="appliedDate"
                  value={formData.appliedDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter additional information about the loan application..."
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Submit Application
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

export default NewLoanReceiving;
