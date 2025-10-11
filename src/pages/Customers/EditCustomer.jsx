import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  Save,
  ArrowLeft,
  Loader2,
  ChevronDown,
  Search,
  Building2,
  Plane,
  Home,
  Upload,
  Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import divisionData from '../../jsondata/AllDivision.json';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../config/cloudinary.js';
import useAxiosSecure from '../../hooks/UseAxiosSecure';

const EditCustomer = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  
  // States
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    customerType: '',
    name: '',
    mobile: '',
    whatsappNo: '',
    email: '',
    address: '',
    division: '',
    district: '',
    upazila: '',
    postCode: '',
    passportNumber: '',
    issueDate: '',
    expiryDate: '',
    dateOfBirth: '', // Backend এর সাথে match করার জন্য
    nidNumber: '',
    customerImage: null,
    isActive: true,
    notes: '',
    referenceBy: ''
  });

  const [useMobileAsWhatsApp, setUseMobileAsWhatsApp] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadedImageData, setUploadedImageData] = useState(null);
  
  // Division data
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  
  // Customer types
  const [customerTypes, setCustomerTypes] = useState([
    { value: 'Haj', label: 'হাজ্জ', icon: 'Home' },
    { value: 'Umrah', label: 'ওমরাহ', icon: 'Home' }
  ]);

  // Load initial data
  useEffect(() => {
    loadCustomers();
    loadDivisions();
  }, []);

  // Load customers from backend
  const loadCustomers = async () => {
    try {
      setCustomersLoading(true);
      const response = await axiosSecure.get('/customers');
      
      if (response.data.success) {
        setCustomers(response.data.customers || []);
      } else {
        setError('Failed to load customers');
      }
    } catch (error) {
      setError('Failed to load customers');
    } finally {
      setCustomersLoading(false);
    }
  };

  // Load divisions from JSON
  const loadDivisions = () => {
    if (divisionData.বাংলাদেশ) {
      setDivisions(divisionData.বাংলাদেশ.map(item => item.বিভাগ));
    }
  };

  // Load customer data when selected
  useEffect(() => {
    if (selectedCustomerId && customers.length > 0) {
      const customer = customers.find(c => (c.id || c.customerId) === selectedCustomerId);
      if (customer) {
        setSelectedCustomer(customer);
        populateFormData(customer);
      }
    }
  }, [selectedCustomerId, customers]);

  // Populate form with customer data
  const populateFormData = (customer) => {
    setFormData({
      customerType: customer.customerType || '',
      name: customer.name || '',
      mobile: customer.mobile || customer.phone || '',
      whatsappNo: customer.whatsappNo || '',
      email: customer.email || '',
      address: customer.address || '',
      division: customer.division || '',
      district: customer.district || '',
      upazila: customer.upazila || '',
      postCode: customer.postCode || '',
      passportNumber: customer.passportNumber || '',
      issueDate: customer.issueDate || '',
      expiryDate: customer.expiryDate || '',
              dateOfBirth: customer.dateOfBirth || '', // Backend এর সাথে match করার জন্য
      nidNumber: customer.nidNumber || '',
      customerImage: customer.customerImage || null,
      isActive: customer.isActive !== undefined ? customer.isActive : true,
      notes: customer.notes || '',
      referenceBy: customer.referenceBy || ''
    });

    // Set image data if exists
    if (customer.customerImage) {
      setUploadedImageUrl(customer.customerImage.cloudinaryUrl || '');
      setUploadedImageData(customer.customerImage);
    }

    // Set location data
    if (customer.division) {
      const division = divisionData.বাংলাদেশ.find(d => d.বিভাগ === customer.division);
      if (division) {
        setDistricts(division.জেলাসমূহ.map(d => d.জেলা));
      }
    }
    
    if (customer.district) {
      const division = divisionData.বাংলাদেশ.find(d => d.বিভাগ === customer.division);
      if (division) {
        const district = division.জেলাসমূহ.find(d => d.জেলা === customer.district);
        if (district) {
          setUpazilas(district.উপজেলাসমূহ);
        }
      }
    }
  };

  // Update districts when division changes
  useEffect(() => {
    if (formData.division) {
      const selectedDivision = divisionData.বাংলাদেশ.find(item => item.বিভাগ === formData.division);
      if (selectedDivision) {
        setDistricts(selectedDivision.জেলাসমূহ.map(item => item.জেলা));
        setFormData(prev => ({ ...prev, district: '', upazila: '' }));
        setUpazilas([]);
      }
    } else {
      setDistricts([]);
      setUpazilas([]);
    }
  }, [formData.division]);

  // Update upazilas when district changes
  useEffect(() => {
    if (formData.division && formData.district) {
      const selectedDivision = divisionData.বাংলাদেশ.find(item => item.বিভাগ === formData.division);
      if (selectedDivision) {
        const selectedDistrict = selectedDivision.জেলাসমূহ.find(item => item.জেলা === formData.district);
        if (selectedDistrict) {
          setUpazilas(selectedDistrict.উপজেলাসমূহ);
          setFormData(prev => ({ ...prev, upazila: '' }));
        }
      }
    } else {
      setUpazilas([]);
    }
  }, [formData.division, formData.district]);

  // Update WhatsApp number when mobile number changes and checkbox is checked
  useEffect(() => {
    if (useMobileAsWhatsApp && formData.mobile) {
      setFormData(prev => ({ ...prev, whatsappNo: formData.mobile }));
    } else if (!useMobileAsWhatsApp) {
      setFormData(prev => ({ ...prev, whatsappNo: '' }));
    }
  }, [formData.mobile, useMobileAsWhatsApp]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
        uploadToCloudinary(file);
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle WhatsApp checkbox change
  const handleWhatsAppCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setUseMobileAsWhatsApp(isChecked);
    
    if (isChecked && formData.mobile) {
      setFormData(prev => ({ ...prev, whatsappNo: formData.mobile }));
    } else if (!isChecked) {
      setFormData(prev => ({ ...prev, whatsappNo: '' }));
    }
  };

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration incomplete');
      }
      
      setImageUploading(true);
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      formData.append('folder', CLOUDINARY_CONFIG.FOLDER);
      
      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      const imageData = {
        publicId: result.public_id,
        downloadURL: result.secure_url,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        cloudinaryUrl: result.secure_url,
        thumbnailUrl: result.secure_url.replace('/upload/', '/upload/c_thumb,w_200,h_200/'),
        originalName: file.name,
        width: result.width,
        height: result.height,
        format: result.format,
      };
      
      setUploadedImageUrl(result.secure_url);
      setUploadedImageData(imageData);
      setFormData(prev => ({ ...prev, customerImage: imageData }));
      
      Swal.fire({
        title: 'সফল!',
        text: 'ছবি Cloudinary এ আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981'
      });
      
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ছবি আপলোড করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCustomerId) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কাস্টমার নির্বাচন করুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
      return;
    }
    
    if (!formData.customerType || !formData.name || !formData.mobile || !formData.address) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'সব প্রয়োজনীয় তথ্য পূরণ করুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const customerData = {
        ...formData,
        customerImage: uploadedImageData
      };
      
      const customerId = selectedCustomerId;
      const response = await axiosSecure.patch(`/customers/${customerId}`, customerData);
      
      if (response.data.success) {
        Swal.fire({
          title: 'সফল!',
          text: 'কাস্টমার তথ্য সফলভাবে আপডেট হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981'
        });
        
        // Update local state
        setCustomers(prev => prev.map(c => 
          (c.id || c.customerId) === customerId 
            ? { ...c, ...customerData }
            : c
        ));
        
        // Reset form
        setSelectedCustomerId('');
        setSelectedCustomer(null);
        setFormData({
          customerType: '', name: '', mobile: '', whatsappNo: '', email: '',
          address: '', division: '', district: '', upazila: '', postCode: '',
          passportNumber: '', issueDate: '', expiryDate: '', dateOfBirth: '', 
          nidNumber: '', customerImage: null, isActive: true, notes: '', referenceBy: ''
        });
        setImagePreview(null);
        setUploadedImageUrl('');
        setUploadedImageData(null);
        setDistricts([]);
        setUpazilas([]);
        setUseMobileAsWhatsApp(false);
        
      } else {
        throw new Error(response.data.message || 'Failed to update customer');
      }
      
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'কাস্টমার আপডেট করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtered customers for dropdown
  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile?.includes(searchTerm) ||
    customer.phone?.includes(searchTerm) ||
    (customer.id || customer.customerId)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-2 lg:p-4 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/customers')}
              className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                কাস্টমার সম্পাদনা
              </h1>
              <p className={`mt-1 text-sm lg:text-base transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                বিদ্যমান কাস্টমারের তথ্য আপডেট করুন
              </p>
            </div>
          </div>
        </div>

        {/* Customer Selection Section */}
        <div className={`mb-4 lg:mb-6 bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6 border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              কাস্টমার নির্বাচন করুন
            </h2>
          </div>

          {/* Customer Search and Dropdown */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="কাস্টমার খুঁজুন (নাম, মোবাইল, আইডি)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 lg:pl-12 pr-4 py-2 lg:py-3 border rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
              />
            </div>

            {/* Customer Dropdown */}
            <div className="mt-2 relative">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
                disabled={customersLoading}
              >
                <option value="">কাস্টমার নির্বাচন করুন</option>
                {filteredCustomers.map((customer) => (
                  <option key={customer.id || customer.customerId} value={customer.id || customer.customerId}>
                    {customer.name} - {customer.mobile || customer.phone} - {customer.id || customer.customerId}
                  </option>
                ))}
              </select>
              
              {customersLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>

            {/* Selected Customer Info */}
            {selectedCustomer && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <User className="w-4 h-4" />
                  <span className="font-medium">নির্বাচিত কাস্টমার:</span>
                  <span>{selectedCustomer.name}</span>
                  <span className="text-sm">({selectedCustomer.id || selectedCustomer.customerId})</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form - Only show when customer is selected */}
        {selectedCustomer && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Customer Information Section */}
            <div className={`rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6 border transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
                : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  কাস্টমার তথ্য
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    কাস্টমারের ধরন *
                  </label>
                  <select
                    name="customerType"
                    value={formData.customerType}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">ধরন নির্বাচন করুন</option>
                    {customerTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    নাম *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    WhatsApp নম্বর
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="useMobileAsWhatsApp"
                        checked={useMobileAsWhatsApp}
                        onChange={handleWhatsAppCheckboxChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="useMobileAsWhatsApp" className="text-sm text-gray-600 dark:text-gray-400">
                        এটিই WhatsApp No?
                      </label>
                    </div>
                    <input
                      type="tel"
                      name="whatsappNo"
                      value={formData.whatsappNo}
                      onChange={handleInputChange}
                      disabled={useMobileAsWhatsApp}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      } ${useMobileAsWhatsApp ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ইমেইল
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ঠিকানা *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className={`rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6 border transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
                : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  অবস্থান তথ্য
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Division */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    বিভাগ *
                  </label>
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">বিভাগ নির্বাচন করুন</option>
                    {divisions.map((division) => (
                      <option key={division} value={division}>
                        {division}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    প্রথমে বিভাগ নির্বাচন করুন
                  </p>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    জেলা *
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.division}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    } ${!formData.division ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">জেলা নির্বাচন করুন</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upazila */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    উপজেলা *
                  </label>
                  <select
                    name="upazila"
                    value={formData.upazila}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.district}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    } ${!formData.district ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">উপজেলা নির্বাচন করুন</option>
                    {upazilas.map((upazila) => (
                      <option key={upazila} value={upazila}>
                        {upazila}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/customers')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm lg:text-base"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    আপডেট হচ্ছে...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    আপডেট করুন
                  </div>
                )}
              </button>
            </div>
          </form>
        )}

        {/* No Customer Selected Message */}
        {!selectedCustomer && !customersLoading && (
          <div className={`text-center py-12 bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border transition-colors duration-300 ${
            isDark ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              কাস্টমার নির্বাচন করুন
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              সম্পাদনার জন্য উপরে থেকে একটি কাস্টমার নির্বাচন করুন
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditCustomer;
