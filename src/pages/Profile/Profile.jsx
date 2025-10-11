import React, { useState, useEffect } from 'react';
import { 
  UserCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X,
  Camera,
  Building,
  Clock
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import Swal from 'sweetalert2';

const Profile = () => {
  const { isDark } = useTheme();
  const { userProfile, token, loading: authLoading, updateProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    branch: '',
    department: '',
    joinDate: '',
    lastLogin: '',
    status: 'active',
    avatar: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    department: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userProfile && typeof userProfile === 'object') {
      setProfileData({
        name: userProfile?.name || userProfile?.displayName || 'নাম নেই',
        email: userProfile?.email || 'ইমেইল নেই',
        phone: userProfile?.phone || 'ফোন নম্বর নেই',
        address: userProfile?.address || 'ঠিকানা নেই',
        role: userProfile?.role || 'Super Admin',
        branch: userProfile?.branchName || 'মূল শাখা',
        department: userProfile?.department || 'প্রশাসন',
        joinDate: userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('bn-BD') : 'তারিখ নেই',
        lastLogin: userProfile?.lastLoginAt ? new Date(userProfile.lastLoginAt).toLocaleDateString('bn-BD') : 'কখনো নয়',
        status: userProfile?.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়',
        avatar: userProfile?.photoURL || ''
      });

      setFormData({
        name: userProfile?.name || userProfile?.displayName || '',
        phone: userProfile?.phone || '',
        address: userProfile?.address || '',
        department: userProfile?.department || ''
      });
    }
  }, [userProfile]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'নাম প্রয়োজন';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'ফোন নম্বর প্রয়োজন';
    } else if (!/^01[3-9]\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'সঠিক ফোন নম্বর লিখুন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!userProfile || !userProfile.email) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'ইমেইল তথ্য পাওয়া যায়নি',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#F9FAFB'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosSecure.patch(`/users/profile/${userProfile.email}`, formData);
      
      if (response.data.success) {
        // Update local profile data with the response data
        const updatedUser = response.data.user;
        
        // Update the global userProfile state in AuthContext
        await updateProfile({
          name: updatedUser?.name || updatedUser?.displayName,
          phone: updatedUser?.phone,
          address: updatedUser?.address,
          department: updatedUser?.department,
          updatedAt: updatedUser?.updatedAt
        });

        // Update local state
        setProfileData(prev => ({
          ...prev,
          name: updatedUser?.name || updatedUser?.displayName || prev.name,
          phone: updatedUser?.phone || prev.phone,
          address: updatedUser?.address || prev.address,
          department: updatedUser?.department || prev.department,
          lastLogin: updatedUser?.updatedAt ? new Date(updatedUser.updatedAt).toLocaleDateString('bn-BD') : prev.lastLogin
        }));

        Swal.fire({
          title: 'সফল!',
          text: 'প্রোফাইল সফলভাবে আপডেট হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          background: isDark ? '#1F2937' : '#F9FAFB'
        });

        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে';
      Swal.fire({
        title: 'ত্রুটি!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#F9FAFB'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profileData.name,
      phone: profileData.phone,
      address: profileData.address,
      department: profileData.department
    });
    setErrors({});
    setIsEditing(false);
  };

  // Show loading state while userProfile is being fetched
  if (authLoading || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">প্রোফাইল লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            প্রোফাইল
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            আপনার ব্যক্তিগত তথ্য দেখুন এবং সম্পাদনা করুন
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 ${
              isDark ? 'border-gray-700' : 'border-gray-100'
            }`}>
              <div className="p-6 text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Basic Info */}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {profileData.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {profileData.email}
                </p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profileData.status === 'সক্রিয়' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {profileData.status}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditing ? 'সম্পাদনা বন্ধ করুন' : 'সম্পাদনা করুন'}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 ${
              isDark ? 'border-gray-700' : 'border-gray-100'
            }`}>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  ব্যক্তিগত তথ্য
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <UserCircle className="w-4 h-4 inline mr-2" />
                      নাম
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.name
                            ? 'border-red-500 focus:ring-red-500'
                            : isDark 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'border-gray-300'
                        }`}
                        placeholder="আপনার নাম লিখুন"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                        {profileData.name}
                      </p>
                    )}
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      ইমেইল
                    </label>
                    <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                      {profileData.email}
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      ফোন নম্বর
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.phone
                            ? 'border-red-500 focus:ring-red-500'
                            : isDark 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'border-gray-300'
                        }`}
                        placeholder="01XXXXXXXXX"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                        {profileData.phone}
                      </p>
                    )}
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Shield className="w-4 h-4 inline mr-2" />
                      ভূমিকা
                    </label>
                    <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                      {profileData.role}
                    </p>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      ঠিকানা
                    </label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'border-gray-300'
                        }`}
                        placeholder="আপনার ঠিকানা লিখুন"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                        {profileData.address}
                      </p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Building className="w-4 h-4 inline mr-2" />
                      বিভাগ
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'border-gray-300'
                        }`}
                        placeholder="আপনার বিভাগ লিখুন"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                        {profileData.department}
                      </p>
                    )}
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Building className="w-4 h-4 inline mr-2" />
                      শাখা
                    </label>
                    <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                      {profileData.branch}
                    </p>
                  </div>

                  {/* Join Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      যোগদানের তারিখ
                    </label>
                    <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                      {profileData.joinDate}
                    </p>
                  </div>

                  {/* Last Login */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      শেষ লগইন
                    </label>
                    <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                      {profileData.lastLogin}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                      বাতিল
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          সংরক্ষণ হচ্ছে...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          সংরক্ষণ করুন
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
