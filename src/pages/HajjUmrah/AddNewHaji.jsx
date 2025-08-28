import React, { useState } from 'react';
import { Building, Save, ArrowLeft, User, CreditCard, MapPin, Phone, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AddNewHaji = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hajiName: '',
    nationalId: '',
    trackingId: '',
    pidNo: '',
    yearOfHaj: '',
    passportNo: '',
    contactNumber: '',
    address: '',
    type: 'haj', // haj or umrah
    status: 'pending',
    package: '',
    emergencyContact: '',
    email: '',
    dateOfBirth: '',
    gender: 'male'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!formData.hajiName.trim()) {
      newErrors.hajiName = 'হাজীর নাম প্রয়োজন';
    }

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'জাতীয় পরিচয়পত্র নম্বর প্রয়োজন';
    } else if (formData.nationalId.length !== 13) {
      newErrors.nationalId = 'জাতীয় পরিচয়পত্র নম্বর ১৩ ডিজিটের হতে হবে';
    }

    if (!formData.trackingId.trim()) {
      newErrors.trackingId = 'ট্র্যাকিং আইডি প্রয়োজন';
    }

    if (!formData.pidNo.trim()) {
      newErrors.pidNo = 'PID নম্বর প্রয়োজন';
    }

    if (!formData.yearOfHaj.trim()) {
      newErrors.yearOfHaj = 'হজ্জের বছর প্রয়োজন';
    }

    if (!formData.passportNo.trim()) {
      newErrors.passportNo = 'পাসপোর্ট নম্বর প্রয়োজন';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'যোগাযোগের নম্বর প্রয়োজন';
    } else if (!/^(\+880|880|0)?1[3-9]\d{8}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'সঠিক মোবাইল নম্বর দিন';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'ঠিকানা প্রয়োজন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate tracking ID if not provided
      if (!formData.trackingId) {
        const prefix = formData.type === 'haj' ? 'HAJ' : 'UMR';
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        formData.trackingId = `${prefix}${year}${randomNum}`;
      }

      // Here you would typically send the data to your backend
      console.log('Submitting form data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message with SweetAlert
      Swal.fire({
        title: 'সফল!',
        text: 'হাজীর তথ্য সফলভাবে যোগ করা হয়েছে!',
        icon: 'success',
        confirmButtonColor: '#059669',
        confirmButtonText: 'ঠিক আছে'
      });
      
      navigate('/hajj-umrah/haji-list');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'ঠিক আছে'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTrackingId = () => {
    const prefix = formData.type === 'haj' ? 'HAJ' : 'UMR';
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newTrackingId = `${prefix}${year}${randomNum}`;
    setFormData(prev => ({ ...prev, trackingId: newTrackingId }));
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/hajj-umrah/haji-list')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              নতুন হাজী যোগ করুন
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              নতুন হাজীর তথ্য দিন
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          {/* Pilgrim Type Selection */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 lg:pb-6">
            <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-4">
              যাত্রীর ধরন নির্বাচন করুন
            </h3>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="haj"
                  checked={formData.type === 'haj'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                  হজ্জ যাত্রী
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="umrah"
                  checked={formData.type === 'umrah'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                  উমরাহ যাত্রী
                </span>
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-4 lg:mb-6 flex items-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
              মূল তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  হাজীর নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hajiName"
                  value={formData.hajiName}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.hajiName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="হাজীর পূর্ণ নাম দিন"
                />
                {errors.hajiName && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.hajiName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  জাতীয় পরিচয়পত্র নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleInputChange}
                  maxLength="13"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.nationalId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="১৩ ডিজিটের NID নম্বর"
                />
                {errors.nationalId && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.nationalId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ট্র্যাকিং আইডি <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    name="trackingId"
                    value={formData.trackingId}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.trackingId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="ট্র্যাকিং আইডি"
                  />
                  <button
                    type="button"
                    onClick={generateTrackingId}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
                  >
                    তৈরি করুন
                  </button>
                </div>
                {errors.trackingId && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.trackingId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PID নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pidNo"
                  value={formData.pidNo}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.pidNo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="PID নম্বর"
                />
                {errors.pidNo && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.pidNo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  হজ্জের বছর <span className="text-red-500">*</span>
                </label>
                <select
                  name="yearOfHaj"
                  value={formData.yearOfHaj}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.yearOfHaj ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">বছর নির্বাচন করুন</option>
                  <option value="2024">২০২৪</option>
                  <option value="2025">২০২৫</option>
                  <option value="2026">২০২৬</option>
                  <option value="2027">২০২৭</option>
                </select>
                {errors.yearOfHaj && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.yearOfHaj}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  লিঙ্গ
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="male">পুরুষ</option>
                  <option value="female">মহিলা</option>
                </select>
              </div>
            </div>
          </div>

          {/* Travel Information */}
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-4 lg:mb-6 flex items-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
              ভ্রমণ তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  পাসপোর্ট নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="passportNo"
                  value={formData.passportNo}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.passportNo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="পাসপোর্ট নম্বর"
                />
                {errors.passportNo && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.passportNo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  জন্ম তারিখ
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-4 lg:mb-6 flex items-center">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
              যোগাযোগের তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  যোগাযোগের নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.contactNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="+8801712345678"
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.contactNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ইমেইল
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  জরুরি যোগাযোগ
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="জরুরি যোগাযোগের নম্বর"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-4 lg:mb-6 flex items-center">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
              ঠিকানা
            </h3>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                বর্তমান ঠিকানা <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="বিস্তারিত ঠিকানা দিন"
              />
              {errors.address && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Package Selection */}
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-4 lg:mb-6 flex items-center">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
              প্যাকেজ নির্বাচন
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  প্যাকেজ
                </label>
                <select
                  name="package"
                  value={formData.package}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">প্যাকেজ নির্বাচন করুন</option>
                  <option value="premium">প্রিমিয়াম প্যাকেজ</option>
                  <option value="standard">স্ট্যান্ডার্ড প্যাকেজ</option>
                  <option value="economy">ইকোনমি প্যাকেজ</option>
                  <option value="umrah-package">উমরাহ প্যাকেজ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  স্ট্যাটাস
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="pending">অপেক্ষমান</option>
                  <option value="confirmed">নিশ্চিত</option>
                  <option value="processing">প্রক্রিয়াধীন</option>
                  <option value="cancelled">বাতিল</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 lg:pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/hajj-umrah/haji-list')}
              className="w-full sm:w-auto px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewHaji;
