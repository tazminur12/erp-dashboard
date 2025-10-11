import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Save, 
  Calculator, 
  Package, 
  DollarSign, 
  Home, 
  Plane, 
  Upload, 
  X, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import Swal from 'sweetalert2';

const PackageCreation = () => {
  // Form state
  const [formData, setFormData] = useState({
    packageName: '',
    packageYear: '',
    packageType: 'Regular',
    customPackageType: '',
    passengerType: 'Adult',
    sarToBdtRate: '',
    notes: ''
  });

  // Cost fields state
  const [costs, setCosts] = useState({
    airFare: '',
    // Saudi - Hotels
    makkahHotel1: '',
    makkahHotel2: '',
    makkahHotel3: '',
    madinaHotel1: '',
    madinaHotel2: '',
    // Saudi - Fees
    zamzamWater: '',
    maktab: '',
    visaFee: '',
    insuranceFee: '',
    electronicsFee: '',
    groundServiceFee: '',
    makkahRoute: '',
    baggage: '',
    serviceCharge: '',
    monazzem: '',
    // Additional fields for Custom Umrah
    food: '',
    ziyaraFee: '',
    // Bangladesh Portion
    idCard: '',
    hajjKollan: '',
    trainFee: '',
    hajjGuide: '',
    govtServiceCharge: '',
    licenseFee: '',
    transportFee: '',
    otherBdCosts: ''
  });

  const [discount, setDiscount] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({
    costDetails: false,
    attachments: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Cloudinary configuration - Replace with your actual values
  const CLOUD_NAME = 'your-cloud-name';
  const UPLOAD_PRESET = 'your-upload-preset';

  // Calculate totals (SAR costs converted to BDT)
  const calculateTotals = () => {
    const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
    
    // Bangladesh portion costs (already in BDT)
    const bangladeshCosts = 
      (costs.airFare || 0) +
      (costs.idCard || 0) +
      (costs.hajjKollan || 0) +
      (costs.trainFee || 0) +
      (costs.hajjGuide || 0) +
      (costs.govtServiceCharge || 0) +
      (costs.licenseFee || 0) +
      (costs.transportFee || 0) +
      (costs.otherBdCosts || 0);

    // Saudi portion costs (convert from SAR to BDT)
    const saudiCostsRaw = 
      (costs.makkahHotel1 || 0) +
      (costs.makkahHotel2 || 0) +
      (costs.makkahHotel3 || 0) +
      (costs.madinaHotel1 || 0) +
      (costs.madinaHotel2 || 0) +
      (costs.zamzamWater || 0) +
      (costs.maktab || 0) +
      (costs.visaFee || 0) +
      (costs.insuranceFee || 0) +
      (costs.electronicsFee || 0) +
      (costs.groundServiceFee || 0) +
      (costs.makkahRoute || 0) +
      (costs.baggage || 0) +
      (costs.serviceCharge || 0) +
      (costs.monazzem || 0) +
      (costs.food || 0) +
      (costs.ziyaraFee || 0);

    const saudiCosts = saudiCostsRaw * sarToBdtRate;
    
    const subtotal = bangladeshCosts + saudiCosts;
    const grandTotal = Math.max(0, subtotal - (parseFloat(discount) || 0));

    const hotelCostsRaw =
      (costs.makkahHotel1 || 0) +
      (costs.makkahHotel2 || 0) +
      (costs.makkahHotel3 || 0) +
      (costs.madinaHotel1 || 0) +
      (costs.madinaHotel2 || 0);

    const serviceCostsRaw =
      (costs.groundServiceFee || 0);

    const feesRaw =
      (costs.visaFee || 0) +
      (costs.insuranceFee || 0) +
      (costs.electronicsFee || 0) +
      (costs.serviceCharge || 0);

    return {
      subtotal,
      grandTotal,
      hotelCosts: hotelCostsRaw * sarToBdtRate,
      serviceCosts: serviceCostsRaw * sarToBdtRate,
      fees: feesRaw * sarToBdtRate
    };
  };

  const totals = calculateTotals();

  // Handle input changes
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

  const handleCostChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    
    setCosts(prev => ({
      ...prev,
      [name]: numericValue
    }));
  };

  // File upload handlers
  const handleFileUpload = async (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== fileArray.length) {
      Swal.fire({
        title: 'Invalid Files',
        text: 'Please upload only images and PDFs under 10MB',
        icon: 'warning',
        confirmButtonColor: '#059669'
      });
      return;
    }

    for (const file of validFiles) {
      await uploadToCloudinary(file);
    }
  };

  const uploadToCloudinary = async (file) => {
    const uploadId = Date.now() + Math.random();
    setUploadingFiles(prev => [...prev, { id: uploadId, file, progress: 0 }]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name', CLOUD_NAME);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      
      setAttachments(prev => [...prev, {
        public_id: result.public_id,
        url: result.url,
        secure_url: result.secure_url,
        format: result.format,
        bytes: result.bytes,
        original_name: file.name
      }]);

      setUploadingFiles(prev => prev.filter(item => item.id !== uploadId));
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => prev.filter(item => item.id !== uploadId));
      Swal.fire({
        title: 'Upload Failed',
        text: `Failed to upload ${file.name}`,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.packageName.trim()) {
      newErrors.packageName = 'Package name is required';
    }

    if (!formData.packageYear) {
      newErrors.packageYear = 'Package year is required';
    }

    if (totals.subtotal <= 0) {
      newErrors.costs = 'At least one cost must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all required fields and add at least one cost',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        costs,
        totals,
        attachments,
        status: 'Draft',
        createdAt: new Date().toISOString()
      };

      console.log('Package Payload:', payload);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Swal.fire({
        title: 'Success!',
        text: 'Package created successfully!',
        icon: 'success',
        confirmButtonColor: '#059669'
      });

      // Reset form
      setFormData({
        packageName: '',
        packageYear: '',
        packageType: 'Regular',
        customPackageType: '',
        sarToBdtRate: '',
        notes: ''
      });
      setCosts(Object.fromEntries(Object.keys(costs).map(key => [key, ''])));
      setDiscount('');
      setAttachments([]);

    } catch (error) {
      console.error('Error creating package:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const isFormValid = formData.packageName.trim() && formData.packageYear && totals.subtotal > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <style jsx>{`
        /* Hide number input spinners */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          হজ ও উমরাহ প্যাকেজ তৈরি
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            পেশাদার হজ ও উমরাহ প্যাকেজ তৈরি করুন এবং পরিচালনা করুন
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-purple-600" />
                  মৌলিক তথ্য
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      প্যাকেজ নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="packageName"
                      value={formData.packageName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.packageName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="প্যাকেজের নাম লিখুন"
                    />
                    {errors.packageName && (
                      <p className="mt-1 text-sm text-red-600">{errors.packageName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      সাল <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="packageYear"
                      value={formData.packageYear}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.packageYear ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">বছর নির্বাচন করুন</option>
                      <option value="2010">২০১০</option>
                      <option value="2011">২০১১</option>
                      <option value="2012">২০১২</option>
                      <option value="2013">২০১৩</option>
                      <option value="2014">২০১৪</option>
                      <option value="2015">২০১৫</option>
                      <option value="2016">২০১৬</option>
                      <option value="2017">২০১৭</option>
                      <option value="2018">২০১৮</option>
                      <option value="2019">২০১৯</option>
                      <option value="2020">২০২০</option>
                      <option value="2021">২০২১</option>
                      <option value="2022">২০২২</option>
                      <option value="2023">২০২৩</option>
                      <option value="2024">২০২৪</option>
                      <option value="2025">২০২৫</option>
                      <option value="2026">২০২৬</option>
                      <option value="2027">২০২৭</option>
                      <option value="2028">২০২৮</option>
                      <option value="2029">২০২৯</option>
                      <option value="2030">২০৩০</option>
                    </select>
                    {errors.packageYear && (
                      <p className="mt-1 text-sm text-red-600">{errors.packageYear}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      প্যাকেজ টাইপ
                    </label>
                    <select
                      name="packageType"
                      value={formData.packageType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      কাস্টম প্যাকেজ টাইপ
                    </label>
                    <select
                      name="customPackageType"
                      value={formData.customPackageType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">কাস্টম প্যাকেজ নির্বাচন করুন</option>
                      <option value="Custom Hajj">Custom Hajj</option>
                      <option value="Custom Umrah">Custom Umrah</option>
                    </select>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      যাত্রীর ধরন
                    </label>
                    <select
                      name="passengerType"
                      value={formData.passengerType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Adult">Adult</option>
                      <option value="Child">Child</option>
                      <option value="Infant">Infrant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      রিয়াল রেট (SAR → BDT)
                    </label>
                    <input
                      type="number"
                      name="sarToBdtRate"
                      value={formData.sarToBdtRate}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>

                </div>
              </div>

              {/* Cost Details */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleSection('costDetails')}
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                      খরচের বিবরণ
                    </span>
                    {collapsedSections.costDetails ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    )}
                  </h2>
                </div>

                {!collapsedSections.costDetails && (
                  <div className="px-6 pb-6 space-y-8">
                    {/* Bangladesh Portion */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">বাংলাদেশ অংশ</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formData.customPackageType === 'Custom Umrah' ? (
                          // Show only airFare for Custom Umrah
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">বিমান ভাড়া</label>
                            <input type="number" name="airFare" value={costs.airFare} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                          </div>
                        ) : (
                          // Show all fields for other package types
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">বিমান ভাড়া</label>
                              <input type="number" name="airFare" value={costs.airFare} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">আইডি কার্ড ফি</label>
                              <input type="number" name="idCard" value={costs.idCard} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হজ্জ কল্যাণ ফি</label>
                              <input type="number" name="hajjKollan" value={costs.hajjKollan} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ট্রেনিং ফি</label>
                              <input type="number" name="trainFee" value={costs.trainFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হজ গাইড ফি</label>
                              <input type="number" name="hajjGuide" value={costs.hajjGuide} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সার্ভিস চার্জ (সরকারি)</label>
                              <input type="number" name="govtServiceCharge" value={costs.govtServiceCharge} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">লাইসেন্স চার্জ ফি</label>
                              <input type="number" name="licenseFee" value={costs.licenseFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাতায়াত ফি</label>
                              <input type="number" name="transportFee" value={costs.transportFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">অন্যান্য বাংলাদেশি খরচ</label>
                              <input type="number" name="otherBdCosts" value={costs.otherBdCosts} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Saudi Portion */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সৌদি অংশ</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Conditional rendering based on Custom Umrah selection */}
                        {formData.customPackageType === 'Custom Umrah' ? (
                          // Show only specific fields for Custom Umrah
                          <>
                            {/* Makkah Hotels */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা হোটেল</label>
                              <input type="number" name="makkahHotel1" value={costs.makkahHotel1} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            {/* Madina Hotels */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মদিনা হোটেল</label>
                              <input type="number" name="madinaHotel1" value={costs.madinaHotel1} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ভিসা ফি</label>
                              <input type="number" name="visaFee" value={costs.visaFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ইনস্যুরেন্স ফি</label>
                              <input type="number" name="insuranceFee" value={costs.insuranceFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">খাবার</label>
                              <input type="number" name="food" value={costs.food} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">জিয়ারা ফি</label>
                              <input type="number" name="ziyaraFee" value={costs.ziyaraFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হজ্ব গাইড ফি</label>
                              <input type="number" name="hajjGuide" value={costs.hajjGuide} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">অন্যান্য</label>
                              <input type="number" name="otherBdCosts" value={costs.otherBdCosts} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>
                          </>
                        ) : (
                          // Show all fields for other package types
                          <>
                            {/* Makkah Hotels */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা হোটেল 01</label>
                              <input type="number" name="makkahHotel1" value={costs.makkahHotel1} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা হোটেল 02</label>
                          <input type="number" name="makkahHotel2" value={costs.makkahHotel2} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা হোটেল 03</label>
                          <input type="number" name="makkahHotel3" value={costs.makkahHotel3} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>

                        {/* Madina Hotels */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মদিনা হোটেল 01</label>
                          <input type="number" name="madinaHotel1" value={costs.madinaHotel1} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মদিনা হোটেল 02</label>
                          <input type="number" name="madinaHotel2" value={costs.madinaHotel2} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">জমজম পানি ফি</label>
                          <input type="number" name="zamzamWater" value={costs.zamzamWater} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্তব ফি</label>
                          <input type="number" name="maktab" value={costs.maktab} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ভিসা ফি</label>
                          <input type="number" name="visaFee" value={costs.visaFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ইনস্যুরেন্স ফি</label>
                          <input type="number" name="insuranceFee" value={costs.insuranceFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ইলেকট্রনিক্স ফি</label>
                          <input type="number" name="electronicsFee" value={costs.electronicsFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">গ্রাউন্ড সার্ভিস ফি</label>
                          <input type="number" name="groundServiceFee" value={costs.groundServiceFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা রুট ফি</label>
                          <input type="number" name="makkahRoute" value={costs.makkahRoute} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ব্যাগেজ ফি</label>
                          <input type="number" name="baggage" value={costs.baggage} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সার্ভিস চার্জ ফি</label>
                          <input type="number" name="serviceCharge" value={costs.serviceCharge} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মোনাজ্জেম ফি</label>
                          <input type="number" name="monazzem" value={costs.monazzem} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Discount */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ছাড়</label>
                        <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Package Picture */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleSection('attachments')}
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <Upload className="w-4 h-4 mr-2 text-purple-600" />
                      Package Picture
                    </span>
                    {collapsedSections.attachments ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                  </h2>
                </div>

                {!collapsedSections.attachments && (
                  <div className="px-4 pb-4">
                    {/* Drop Zone */}
                    <div
                      ref={dropZoneRef}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Package Picture আপলোড করুন
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        ছবি এবং PDF (সর্বোচ্চ ১০MB)
                      </p>
                      <button
                        type="button"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        ফাইল নির্বাচন করুন
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />

                    {/* Uploading Files */}
                    {uploadingFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadingFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-xs text-gray-700 dark:text-gray-300">
                                {file.file.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs text-blue-600">আপলোড...</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Attached Files */}
                    {attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center space-x-2">
                              {file.format === 'pdf' ? (
                                <FileText className="w-4 h-4 text-red-600" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-green-600" />
                              )}
                              <div>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {file.original_name}
                                </span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {(file.bytes / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  নোট
                </h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="প্যাকেজ সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'প্যাকেজ তৈরি করুন'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                  খরচের সারসংক্ষেপ
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      হোটেল খরচ
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(totals.hotelCosts)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      সার্ভিস খরচ
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(totals.serviceCosts)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ফি
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(totals.fees)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ছাড়
                    </span>
                    <span className="text-sm font-semibold text-red-600">
                      -{formatCurrency(discount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b-2 border-gray-300 dark:border-gray-600">
                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                      উপমোট
                    </span>
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(totals.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg px-4">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      মোট
                    </span>
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(totals.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Package Picture Summary */}
                {attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Package Pictures ({attachments.length})
                    </h4>
                    <div className="space-y-1">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                          {file.format === 'pdf' ? (
                            <FileText className="w-3 h-3 text-red-500" />
                          ) : (
                            <ImageIcon className="w-3 h-3 text-green-500" />
                          )}
                          <span className="truncate">{file.original_name}</span>
                        </div>
                      ))}
                    </div>
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

export default PackageCreation;