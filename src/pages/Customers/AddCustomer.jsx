import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  ToggleLeft, 
  ToggleRight,
  Save,
  Building2,
  Plane,
  Home,
  Users
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';

const AddCustomer = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    // কাস্টমার তথ্য
    customerType: '',
    name: '',
    mobile: '',
    email: '',
    address: '',
    division: '',
    district: '',
    upazila: '',
    postCode: '',
    
    // পাসপোর্ট তথ্য
    passportNumber: '',
    issueDate: '',
    expiryDate: '',
    birthDate: '',
    nidNumber: '',
    
    // অতিরিক্ত তথ্য
    customerImage: null,
    isActive: true,
    notes: '',
    referenceBy: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Dropdown options
  const customerTypes = [
    { value: 'hajj', label: 'হাজ্জ', icon: Home },
    { value: 'umrah', label: 'ওমরাহ', icon: Home },
    { value: 'air', label: 'এয়ার', icon: Plane }
  ];

  const divisions = [
    'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'
  ];

  const districts = {
    'ঢাকা': ['ঢাকা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'টাঙ্গাইল', 'কিশোরগঞ্জ', 'মানিকগঞ্জ', 'মুন্সীগঞ্জ', 'রাজবাড়ী', 'মাদারীপুর', 'শরীয়তপুর', 'গোপালগঞ্জ', 'ফরিদপুর'],
    'চট্টগ্রাম': ['চট্টগ্রাম', 'কক্সবাজার', 'নোয়াখালী', 'চাঁদপুর', 'লক্ষ্মীপুর', 'কুমিল্লা', 'ফেনী', 'ব্রাহ্মণবাড়িয়া'],
    'রাজশাহী': ['রাজশাহী', 'নাটোর', 'নওগাঁ', 'জয়পুরহাট', 'পাবনা', 'সিরাজগঞ্জ', 'বগুড়া'],
    'খুলনা': ['খুলনা', 'বাগেরহাট', 'সাতক্ষীরা', 'যশোর', 'মাগুরা', 'নড়াইল', 'কুষ্টিয়া', 'মেহেরপুর', 'চুয়াডাঙ্গা'],
    'বরিশাল': ['বরিশাল', 'পটুয়াখালী', 'পিরোজপুর', 'ভোলা', 'ঝালকাঠি', 'বরগুনা'],
    'সিলেট': ['সিলেট', 'হবিগঞ্জ', 'মৌলভীবাজার', 'সুনামগঞ্জ'],
    'রংপুর': ['রংপুর', 'দিনাজপুর', 'কুড়িগ্রাম', 'লালমনিরহাট', 'নীলফামারী', 'পঞ্চগড়', 'ঠাকুরগাঁও'],
    'ময়মনসিংহ': ['ময়মনসিংহ', 'জামালপুর', 'শেরপুর', 'নেত্রকোণা']
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, [name]: file }));
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success popup
      Swal.fire({
        title: 'সফল!',
        text: 'সফলভাবে কাস্টমার যুক্ত হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        background: isDark ? '#1F2937' : '#F9FAFB',
        customClass: {
          title: 'text-green-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      
      // Reset form
      setFormData({
        customerType: '',
        name: '',
        mobile: '',
        email: '',
        address: '',
        division: '',
        district: '',
        upazila: '',
        postCode: '',
        passportNumber: '',
        issueDate: '',
        expiryDate: '',
        birthDate: '',
        nidNumber: '',
        customerImage: null,
        isActive: true,
        notes: '',
        referenceBy: ''
      });
      setImagePreview(null);
      
    } catch (error) {
      // Error popup
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কাস্টমার যুক্ত করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
    }
  };

  return (
    <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            নতুন কাস্টমার যুক্ত করুন
          </h1>
          <p className={`mt-2 text-lg transition-colors duration-300 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            আপনার ব্যবসায় নতুন কাস্টমার যোগ করুন
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* কাস্টমার তথ্য Section */}
          <div className={`rounded-2xl shadow-xl p-6 lg:p-8 border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>কাস্টমার তথ্য</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* কাস্টমারের ধরন */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  কাস্টমারের ধরন *
                </label>
                <div className="relative">
                  <select
                    name="customerType"
                    value={formData.customerType}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">ধরন নির্বাচন করুন</option>
                    {customerTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* নাম */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  নাম *
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="কাস্টমারের নাম লিখুন"
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* মোবাইল নাম্বার */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  মোবাইল নাম্বার *
                </label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    placeholder="০১১-১২৩৪৫৬৭৮"
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* ইমেইল */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  ইমেইল
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* বিভাগ */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  বিভাগ
                </label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">বিভাগ নির্বাচন করুন</option>
                  {divisions.map(division => (
                    <option key={division} value={division}>
                      {division}
                    </option>
                  ))}
                </select>
              </div>

              {/* জেলা */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  জেলা
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">জেলা নির্বাচন করুন</option>
                  {formData.division && districts[formData.division]?.map(district => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* উপজেলা */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  উপজেলা
                </label>
                <input
                  type="text"
                  name="upazila"
                  value={formData.upazila}
                  onChange={handleInputChange}
                  placeholder="উপজেলার নাম"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* পোস্ট কোড */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  পোস্ট কোড
                </label>
                <input
                  type="text"
                  name="postCode"
                  value={formData.postCode}
                  onChange={handleInputChange}
                  placeholder="১২৩৪"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* ঠিকানা - Full width */}
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  ঠিকানা
                </label>
                <div className="relative">
                  <MapPin className={`absolute left-3 top-3 w-5 h-5 transition-colors duration-300 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="বিস্তারিত ঠিকানা লিখুন..."
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>



          {/* পাসপোর্ট তথ্য Section */}
          <div className={`rounded-2xl shadow-xl p-6 lg:p-8 border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>পাসপোর্ট তথ্য</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* পাসপোর্ট নাম্বার */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  পাসপোর্ট নাম্বার
                </label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                  placeholder="A12345678"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* ইস্যু তারিখ */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  ইস্যু তারিখ
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* মেয়াদ শেষের তারিখ */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  মেয়াদ শেষের তারিখ
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* জন্ম তারিখ */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  জন্ম তারিখ
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* এনআইডি নাম্বার */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  এনআইডি নাম্বার
                </label>
                <input
                  type="text"
                  name="nidNumber"
                  value={formData.nidNumber}
                  onChange={handleInputChange}
                  placeholder="১২৩৪৫৬৭৮৯০"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* অতিরিক্ত তথ্য Section */}
          <div className={`rounded-2xl shadow-xl p-6 lg:p-8 border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>অতিরিক্ত তথ্য</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* কাস্টমার ছবি */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  কাস্টমার ছবি
                </label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${
                  isDark 
                    ? 'border-gray-600 hover:border-purple-400' 
                    : 'border-gray-300 hover:border-purple-400'
                }`}>
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className={`w-32 h-32 mx-auto rounded-lg object-cover border-2 transition-colors duration-300 ${
                          isDark ? 'border-gray-600' : 'border-gray-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, customerImage: null }));
                          setImagePreview(null);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        ছবি সরান
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className={`w-12 h-12 mx-auto transition-colors duration-300 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <div>
                        <label htmlFor="customerImage" className="cursor-pointer">
                          <span className="text-purple-600 hover:text-purple-700 font-medium">
                            ছবি আপলোড করুন
                          </span>
                          <span className={`text-sm block mt-1 transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            PNG, JPG, GIF (সর্বোচ্চ ৫MB)
                          </span>
                        </label>
                        <input
                          id="customerImage"
                          type="file"
                          name="customerImage"
                          accept="image/*"
                          onChange={handleInputChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active/Inactive Toggle */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  স্ট্যাটাস
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: true }))}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                      formData.isActive 
                        ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                        : isDark 
                          ? 'bg-gray-700 text-gray-300 border-2 border-gray-600' 
                          : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                    }`}
                  >
                    <ToggleRight className="w-5 h-5" />
                    <span className="font-medium">Active</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: false }))}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                      !formData.isActive 
                        ? 'bg-red-100 text-red-700 border-2 border-red-300' 
                        : isDark 
                          ? 'bg-gray-700 text-gray-300 border-2 border-gray-600' 
                          : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                    }`}
                  >
                    <ToggleLeft className="w-5 h-5" />
                    <span className="font-medium">Inactive</span>
                  </button>
                </div>
              </div>

              {/* Reference By */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Reference By
                </label>
                <input
                  type="text"
                  name="referenceBy"
                  value={formData.referenceBy}
                  onChange={handleInputChange}
                  placeholder="রেফারেন্সের নাম"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {/* নোট - Full width */}
              <div className="md:col-span-2 space-y-2">
                <label className={`block text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  নোট
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="কাস্টমার সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 hover:from-blue-700 hover:via-purple-700 hover:to-green-700"
            >
              <Save className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              কাস্টমার যুক্ত করুন
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;