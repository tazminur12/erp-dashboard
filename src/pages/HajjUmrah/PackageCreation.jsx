import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Save, 
  Calculator, 
  Package, 
  DollarSign, 
  Home, 
  Plane, 
  X, 
  ChevronDown, 
  ChevronUp,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import Swal from 'sweetalert2';

const PackageCreation = () => {
  const navigate = useNavigate();
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
  const [collapsedSections, setCollapsedSections] = useState({
    costDetails: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Air fare popup state
  const [showAirFarePopup, setShowAirFarePopup] = useState(false);
  const [airFareDetails, setAirFareDetails] = useState({
    adult: { price: '' },
    child: { price: '' },
    infant: { price: '' }
  });

  // Hotel popup state
  const [showHotelPopup, setShowHotelPopup] = useState(false);
  const [currentHotelType, setCurrentHotelType] = useState('');
  const [hotelDetails, setHotelDetails] = useState({
    makkahHotel1: { 
      adult: { price: '', nights: '' },
      child: { price: '', nights: '' },
      infant: { price: '', nights: '' }
    },
    makkahHotel2: { 
      adult: { price: '', nights: '' },
      child: { price: '', nights: '' },
      infant: { price: '', nights: '' }
    },
    makkahHotel3: { 
      adult: { price: '', nights: '' },
      child: { price: '', nights: '' },
      infant: { price: '', nights: '' }
    },
    madinaHotel1: { 
      adult: { price: '', nights: '' },
      child: { price: '', nights: '' },
      infant: { price: '', nights: '' }
    },
    madinaHotel2: { 
      adult: { price: '', nights: '' },
      child: { price: '', nights: '' },
      infant: { price: '', nights: '' }
    }
  });

  const calculateTotalHotelCost = (hotelType) => {
    const hotel = hotelDetails[hotelType];
    const adultTotal = (parseFloat(hotel.adult.price) || 0) * (parseFloat(hotel.adult.nights) || 0);
    const childTotal = (parseFloat(hotel.child.price) || 0) * (parseFloat(hotel.child.nights) || 0);
    const infantTotal = (parseFloat(hotel.infant.price) || 0) * (parseFloat(hotel.infant.nights) || 0);
    return adultTotal + childTotal + infantTotal;
  };

  const calculateAllHotelCosts = () => {
    return Object.keys(hotelDetails).reduce((total, hotelType) => {
      return total + calculateTotalHotelCost(hotelType);
    }, 0);
  };

  // Calculate totals (SAR costs converted to BDT)
  const calculateTotals = () => {
    const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
    
    // Bangladesh portion costs (already in BDT)
    const bangladeshCosts = 
      (costs.idCard || 0) +
      (costs.hajjKollan || 0) +
      (costs.trainFee || 0) +
      (costs.hajjGuide || 0) +
      (costs.govtServiceCharge || 0) +
      (costs.licenseFee || 0) +
      (costs.transportFee || 0) +
      (costs.visaFee || 0) +
      (costs.insuranceFee || 0) +
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

    const hotelCostsRaw = costs.hotelDetails ? calculateAllHotelCosts() : 
      (costs.makkahHotel1 || 0) +
      (costs.makkahHotel2 || 0) +
      (costs.makkahHotel3 || 0) +
      (costs.madinaHotel1 || 0) +
      (costs.madinaHotel2 || 0);

    const serviceCostsRaw =
      (costs.groundServiceFee || 0);

    const feesRaw =
      (costs.electronicsFee || 0) +
      (costs.serviceCharge || 0);

    return {
      subtotal,
      grandTotal,
      bangladeshCosts,
      saudiCosts,
      hotelCosts: hotelCostsRaw * sarToBdtRate,
      serviceCosts: serviceCostsRaw * sarToBdtRate,
      fees: feesRaw * sarToBdtRate,
      airFareDetails: costs.airFareDetails
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

  // Air fare popup functions
  const handleAirFareDetailChange = (type, value) => {
    setAirFareDetails(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        price: value
      }
    }));
  };

  const calculateTotalAirFare = () => {
    const adultPrice = parseFloat(airFareDetails.adult.price) || 0;
    const childPrice = parseFloat(airFareDetails.child.price) || 0;
    const infantPrice = parseFloat(airFareDetails.infant.price) || 0;
    return adultPrice + childPrice + infantPrice;
  };

  const saveAirFareDetails = () => {
    setCosts(prev => ({
      ...prev,
      airFareDetails: airFareDetails
    }));
    setShowAirFarePopup(false);
  };

  const openAirFarePopup = () => {
    // Initialize with current airFareDetails if exists
    if (costs.airFareDetails) {
      setAirFareDetails(costs.airFareDetails);
    }
    setShowAirFarePopup(true);
  };

  // Hotel popup functions
  const handleHotelDetailChange = (hotelType, passengerType, field, value) => {
    setHotelDetails(prev => ({
      ...prev,
      [hotelType]: {
        ...prev[hotelType],
        [passengerType]: {
          ...prev[hotelType][passengerType],
          [field]: value
        }
      }
    }));
  };



  const saveHotelDetails = () => {
    setCosts(prev => ({
      ...prev,
      hotelDetails: hotelDetails
    }));
    setShowHotelPopup(false);
  };

  const openHotelPopup = (hotelType) => {
    setCurrentHotelType(hotelType);
    // Initialize with current hotelDetails if exists
    if (costs.hotelDetails) {
      setHotelDetails(costs.hotelDetails);
    }
    setShowHotelPopup(true);
  };

  const getHotelDisplayName = (hotelType) => {
    const names = {
      makkahHotel1: 'মক্কা হোটেল ০১',
      makkahHotel2: 'মক্কা হোটেল ০২', 
      makkahHotel3: 'মক্কা হোটেল ০৩',
      madinaHotel1: 'মদিনা হোটেল ০১',
      madinaHotel2: 'মদিনা হোটেল ০২'
    };
    return names[hotelType] || hotelType;
  };

  const getHotelSummary = (hotelType) => {
    const hotel = hotelDetails[hotelType];
    if (!hotel) return 'কোন যাত্রী যোগ করা হয়নি';
    
    const adultNights = hotel.adult.nights || '0';
    const childNights = hotel.child.nights || '0';
    const infantNights = hotel.infant.nights || '0';
    
    const parts = [];
    if (adultNights !== '0') parts.push(`Adult: ${adultNights} রাত`);
    if (childNights !== '0') parts.push(`Child: ${childNights} রাত`);
    if (infantNights !== '0') parts.push(`Infant: ${infantNights} রাত`);
    
    return parts.length > 0 ? parts.join(', ') : 'কোন যাত্রী যোগ করা হয়নি';
  };

  // Calculate totals by passenger type
  const calculatePassengerTypeTotals = () => {
    const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
    
    let adultTotal = 0;
    let childTotal = 0;
    let infantTotal = 0;

    // Air fare totals (different for each passenger type)
    if (costs.airFareDetails) {
      adultTotal += parseFloat(costs.airFareDetails.adult?.price) || 0;
      childTotal += parseFloat(costs.airFareDetails.child?.price) || 0;
      infantTotal += parseFloat(costs.airFareDetails.infant?.price) || 0;
    }

    // Hotel totals by passenger type (different for each passenger type)
    if (costs.hotelDetails) {
      Object.keys(hotelDetails).forEach(hotelType => {
        const hotel = hotelDetails[hotelType];
        if (hotel) {
          adultTotal += ((parseFloat(hotel.adult?.price) || 0) * (parseFloat(hotel.adult?.nights) || 0)) * sarToBdtRate;
          childTotal += ((parseFloat(hotel.child?.price) || 0) * (parseFloat(hotel.child?.nights) || 0)) * sarToBdtRate;
          infantTotal += ((parseFloat(hotel.infant?.price) || 0) * (parseFloat(hotel.infant?.nights) || 0)) * sarToBdtRate;
        }
      });
    }

    // Other costs (same price for all passenger types - each passenger pays full amount)
    // Calculate other costs excluding air fare and hotel costs
    const otherCosts = totals.bangladeshCosts + totals.saudiCosts;
    
    // Each passenger type pays the full amount of other costs (not distributed)
    adultTotal += otherCosts;
    childTotal += otherCosts;
    infantTotal += otherCosts;

    return {
      adult: adultTotal,
      child: childTotal,
      infant: infantTotal,
      total: adultTotal + childTotal + infantTotal
    };
  };

  const passengerTotals = calculatePassengerTypeTotals();

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
        <div className="mb-8">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/hajj-umrah/package-list')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">প্যাকেজ তালিকায় ফিরুন</span>
            </button>
          </div>
          
          {/* Title Section */}
          <div className="text-center">
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
                      <option value="">Select Year</option>
                      <option value="2030">2030</option>
                      <option value="2029">2029</option>
                      <option value="2028">2028</option>
                      <option value="2027">2027</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                      <option value="2020">2020</option>
                      <option value="2019">2019</option>
                      <option value="2018">2018</option>
                      <option value="2017">2017</option>
                      <option value="2016">2016</option>
                      <option value="2015">2015</option>
                      <option value="2014">2014</option>
                      <option value="2013">2013</option>
                      <option value="2012">2012</option>
                      <option value="2011">2011</option>
                      <option value="2010">2010</option>
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
                      <option value="Custom Hajj">Hajj</option>
                      <option value="Custom Umrah">Umrah</option>
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
                            <div className="flex items-center space-x-2">
                              <input 
                                type="text" 
                                value={costs.airFareDetails ? 
                                  `Adult: ${costs.airFareDetails.adult.price || '0'}, Child: ${costs.airFareDetails.child.price || '0'}, Infant: ${costs.airFareDetails.infant.price || '0'}` 
                                  : 'বিস্তারিত দেখুন'} 
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm" 
                                placeholder="বিস্তারিত দেখুন" 
                              />
                              <button
                                type="button"
                                onClick={openAirFarePopup}
                                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <Plus className="w-4 h-4" />
                                <span>বিস্তারিত</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Show all fields for other package types
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">বিমান ভাড়া</label>
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="text" 
                                  value={costs.airFareDetails ? 
                                    `Adult: ${costs.airFareDetails.adult.price || '0'}, Child: ${costs.airFareDetails.child.price || '0'}, Infant: ${costs.airFareDetails.infant.price || '0'}` 
                                    : 'বিস্তারিত দেখুন'} 
                                  readOnly
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm" 
                                  placeholder="বিস্তারিত দেখুন" 
                                />
                                <button
                                  type="button"
                                  onClick={openAirFarePopup}
                                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>বিস্তারিত</span>
                                </button>
                              </div>
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
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ভিসা ফি</label>
                              <input type="number" name="visaFee" value={costs.visaFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ইনস্যুরেন্স ফি</label>
                              <input type="number" name="insuranceFee" value={costs.insuranceFee} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
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
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা হোটেল (যাত্রীর ধরন অনুযায়ী)</label>
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="text" 
                                  value={getHotelSummary('makkahHotel1')} 
                                  readOnly
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm" 
                                  placeholder="কোন যাত্রী যোগ করা হয়নি। 'যাত্রী যোগ করুন' বাটনে ক্লিক করুন।" 
                                />
                                <button
                                  type="button"
                                  onClick={() => openHotelPopup('makkahHotel1')}
                                  className="px-2 py-2 sm:px-3 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-1 text-xs sm:text-sm"
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">যাত্রী যোগ করুন</span>
                                </button>
                              </div>
                            </div>

                            {/* Madina Hotels */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মদিনা হোটেল (যাত্রীর ধরন অনুযায়ী)</label>
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="text" 
                                  value={getHotelSummary('madinaHotel1')} 
                                  readOnly
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm" 
                                  placeholder="কোন যাত্রী যোগ করা হয়নি। 'যাত্রী যোগ করুন' বাটনে ক্লিক করুন।" 
                                />
                                <button
                                  type="button"
                                  onClick={() => openHotelPopup('madinaHotel1')}
                                  className="px-2 py-2 sm:px-3 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-1 text-xs sm:text-sm"
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">যাত্রী যোগ করুন</span>
                                  <span className="sm:hidden">যোগ</span>
                                </button>
                              </div>
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
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা হোটেল ০১ (যাত্রীর ধরন অনুযায়ী)</label>
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="text" 
                                  value={getHotelSummary('makkahHotel1')} 
                                  readOnly
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm" 
                                  placeholder="কোন যাত্রী যোগ করা হয়নি। 'যাত্রী যোগ করুন' বাটনে ক্লিক করুন।" 
                                />
                                <button
                                  type="button"
                                  onClick={() => openHotelPopup('makkahHotel1')}
                                  className="px-2 py-2 sm:px-3 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-1 text-xs sm:text-sm"
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">যাত্রী যোগ করুন</span>
                                  <span className="sm:hidden">যোগ</span>
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা হোটেল ০২ (যাত্রীর ধরন অনুযায়ী)</label>
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="text" 
                                  value={getHotelSummary('makkahHotel2')} 
                                  readOnly
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm" 
                                  placeholder="কোন যাত্রী যোগ করা হয়নি। 'যাত্রী যোগ করুন' বাটনে ক্লিক করুন।" 
                                />
                                <button
                                  type="button"
                                  onClick={() => openHotelPopup('makkahHotel2')}
                                  className="px-2 py-2 sm:px-3 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-1 text-xs sm:text-sm"
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">যাত্রী যোগ করুন</span>
                                  <span className="sm:hidden">যোগ</span>
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মক্কা হোটেল ০৩ (যাত্রীর ধরন অনুযায়ী)</label>
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="text" 
                                  value={getHotelSummary('makkahHotel3')} 
                                  readOnly
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm" 
                                  placeholder="কোন যাত্রী যোগ করা হয়নি। 'যাত্রী যোগ করুন' বাটনে ক্লিক করুন।" 
                                />
                                <button
                                  type="button"
                                  onClick={() => openHotelPopup('makkahHotel3')}
                                  className="px-2 py-2 sm:px-3 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-1 text-xs sm:text-sm"
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">যাত্রী যোগ করুন</span>
                                  <span className="sm:hidden">যোগ</span>
                                </button>
                              </div>
                            </div>

                            {/* Madina Hotels */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মদিনা হোটেল ০১ (যাত্রীর ধরন অনুযায়ী)</label>
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="text" 
                                  value={getHotelSummary('madinaHotel1')} 
                                  readOnly
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm" 
                                  placeholder="কোন যাত্রী যোগ করা হয়নি। 'যাত্রী যোগ করুন' বাটনে ক্লিক করুন।" 
                                />
                                <button
                                  type="button"
                                  onClick={() => openHotelPopup('madinaHotel1')}
                                  className="px-2 py-2 sm:px-3 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-1 text-xs sm:text-sm"
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">যাত্রী যোগ করুন</span>
                                  <span className="sm:hidden">যোগ</span>
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মদিনা হোটেল ০২ (যাত্রীর ধরন অনুযায়ী)</label>
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="text" 
                                  value={getHotelSummary('madinaHotel2')} 
                                  readOnly
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm" 
                                  placeholder="কোন যাত্রী যোগ করা হয়নি। 'যাত্রী যোগ করুন' বাটনে ক্লিক করুন।" 
                                />
                                <button
                                  type="button"
                                  onClick={() => openHotelPopup('madinaHotel2')}
                                  className="px-2 py-2 sm:px-3 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-1 text-xs sm:text-sm"
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">যাত্রী যোগ করুন</span>
                                  <span className="sm:hidden">যোগ</span>
                                </button>
                              </div>
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

          {/* Air Fare Popup Modal */}
          {showAirFarePopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      বিমান ভাড়া বিস্তারিত
                    </h3>
                    <button
                      onClick={() => setShowAirFarePopup(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Adult */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Adult</h4>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price (BDT)</label>
                        <input
                          type="number"
                          value={airFareDetails.adult.price}
                          onChange={(e) => handleAirFareDetailChange('adult', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Child */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Child</h4>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price (BDT)</label>
                        <input
                          type="number"
                          value={airFareDetails.child.price}
                          onChange={(e) => handleAirFareDetailChange('child', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Infant */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Infant</h4>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price (BDT)</label>
                        <input
                          type="number"
                          value={airFareDetails.infant.price}
                          onChange={(e) => handleAirFareDetailChange('infant', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAirFarePopup(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveAirFareDetails}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hotel Details Popup Modal */}
          {showHotelPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {getHotelDisplayName(currentHotelType)} - যাত্রীর ধরন অনুযায়ী
                    </h3>
                    <button
                      onClick={() => setShowHotelPopup(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Adult */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Adult</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price per Night (SAR)</label>
                          <input
                            type="number"
                            value={hotelDetails[currentHotelType]?.adult?.price || ''}
                            onChange={(e) => handleHotelDetailChange(currentHotelType, 'adult', 'price', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Number of Nights</label>
                          <input
                            type="number"
                            value={hotelDetails[currentHotelType]?.adult?.nights || ''}
                            onChange={(e) => handleHotelDetailChange(currentHotelType, 'adult', 'nights', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                            placeholder="0"
                            min="0"
                            step="1"
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        Total: {((parseFloat(hotelDetails[currentHotelType]?.adult?.price) || 0) * (parseFloat(hotelDetails[currentHotelType]?.adult?.nights) || 0)).toFixed(2)} SAR
                      </div>
                    </div>

                    {/* Child */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Child</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price per Night (SAR)</label>
                          <input
                            type="number"
                            value={hotelDetails[currentHotelType]?.child?.price || ''}
                            onChange={(e) => handleHotelDetailChange(currentHotelType, 'child', 'price', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Number of Nights</label>
                          <input
                            type="number"
                            value={hotelDetails[currentHotelType]?.child?.nights || ''}
                            onChange={(e) => handleHotelDetailChange(currentHotelType, 'child', 'nights', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                            placeholder="0"
                            min="0"
                            step="1"
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        Total: {((parseFloat(hotelDetails[currentHotelType]?.child?.price) || 0) * (parseFloat(hotelDetails[currentHotelType]?.child?.nights) || 0)).toFixed(2)} SAR
                      </div>
                    </div>

                    {/* Infant */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Infant</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price per Night (SAR)</label>
                          <input
                            type="number"
                            value={hotelDetails[currentHotelType]?.infant?.price || ''}
                            onChange={(e) => handleHotelDetailChange(currentHotelType, 'infant', 'price', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Number of Nights</label>
                          <input
                            type="number"
                            value={hotelDetails[currentHotelType]?.infant?.nights || ''}
                            onChange={(e) => handleHotelDetailChange(currentHotelType, 'infant', 'nights', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                            placeholder="0"
                            min="0"
                            step="1"
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        Total: {((parseFloat(hotelDetails[currentHotelType]?.infant?.price) || 0) * (parseFloat(hotelDetails[currentHotelType]?.infant?.nights) || 0)).toFixed(2)} SAR
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowHotelPopup(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveHotelDetails}
                      className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                  খরচের সারসংক্ষেপ
                </h3>

                <div className="space-y-4">
                  {/* Comprehensive Passenger Breakdown */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">সম্পূর্ণ খরচ বিস্তারিত (যাত্রীর ধরন অনুযায়ী)</h4>
                    
                    {/* Adult Breakdown */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Adult (প্রাপ্তবয়স্ক)</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(passengerTotals.adult)}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        {/* Air Fare */}
                        {totals.airFareDetails?.adult?.price && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">বিমান ভাড়া</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(totals.airFareDetails.adult.price)}
                            </span>
                          </div>
                        )}
                        
                        {/* Hotel Costs */}
                        {Object.keys(hotelDetails).map((hotelType) => {
                          const hotel = hotelDetails[hotelType];
                          const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
                          const adultHotelTotal = ((parseFloat(hotel.adult?.price) || 0) * (parseFloat(hotel.adult?.nights) || 0)) * sarToBdtRate;
                          
                          if (adultHotelTotal > 0) {
                            return (
                              <div key={hotelType} className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">{getHotelDisplayName(hotelType)}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(adultHotelTotal)}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })}
                        
                        {/* Other Costs (same for all passengers) */}
                        {(() => {
                          const otherCosts = totals.bangladeshCosts + totals.saudiCosts;
                          
                          if (otherCosts > 0) {
                            return (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">অন্যান্য খরচ (সমান)</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(otherCosts)}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Child Breakdown */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Child (শিশু)</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(passengerTotals.child)}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        {/* Air Fare */}
                        {totals.airFareDetails?.child?.price && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">বিমান ভাড়া</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(totals.airFareDetails.child.price)}
                            </span>
                          </div>
                        )}
                        
                        {/* Hotel Costs */}
                        {Object.keys(hotelDetails).map((hotelType) => {
                          const hotel = hotelDetails[hotelType];
                          const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
                          const childHotelTotal = ((parseFloat(hotel.child?.price) || 0) * (parseFloat(hotel.child?.nights) || 0)) * sarToBdtRate;
                          
                          if (childHotelTotal > 0) {
                            return (
                              <div key={hotelType} className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">{getHotelDisplayName(hotelType)}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(childHotelTotal)}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })}
                        
                        {/* Other Costs (same for all passengers) */}
                        {(() => {
                          const otherCosts = totals.bangladeshCosts + totals.saudiCosts;
                          
                          if (otherCosts > 0) {
                            return (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">অন্যান্য খরচ (সমান)</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(otherCosts)}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Infant Breakdown */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Infant (শিশু)</span>
                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(passengerTotals.infant)}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        {/* Air Fare */}
                        {totals.airFareDetails?.infant?.price && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">বিমান ভাড়া</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(totals.airFareDetails.infant.price)}
                            </span>
                          </div>
                        )}
                        
                        {/* Hotel Costs */}
                        {Object.keys(hotelDetails).map((hotelType) => {
                          const hotel = hotelDetails[hotelType];
                          const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
                          const infantHotelTotal = ((parseFloat(hotel.infant?.price) || 0) * (parseFloat(hotel.infant?.nights) || 0)) * sarToBdtRate;
                          
                          if (infantHotelTotal > 0) {
                            return (
                              <div key={hotelType} className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">{getHotelDisplayName(hotelType)}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(infantHotelTotal)}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })}
                        
                        {/* Other Costs (same for all passengers) */}
                        {(() => {
                          const otherCosts = totals.bangladeshCosts + totals.saudiCosts;
                          
                          if (otherCosts > 0) {
                            return (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">অন্যান্য খরচ (সমান)</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(otherCosts)}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      বাংলাদেশ অংশ
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(totals.bangladeshCosts)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      সৌদি অংশ
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(totals.saudiCosts)}
                    </span>
                  </div>


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

                  {/* Final Totals by Passenger Type */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">চূড়ান্ত মোট খরচ</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Adult (প্রাপ্তবয়স্ক)</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(passengerTotals.adult)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Child (শিশু)</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(passengerTotals.child)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Infant (শিশু)</span>
                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(passengerTotals.infant)}
                        </span>
                      </div>
                     
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCreation;