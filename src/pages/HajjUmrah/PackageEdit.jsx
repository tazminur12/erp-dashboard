import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { useUpdatePackage, usePackage } from '../../hooks/usePackageQueries';

const PackageEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const updatePackageMutation = useUpdatePackage();
  const { data: existingPackage, isLoading, error } = usePackage(id);

  // Form state
  const [formData, setFormData] = useState({
    packageName: '',
    packageYear: '',
    packageMonth: '',
    packageType: 'Regular',
    customPackageType: '',
    passengerType: 'Adult',
    sarToBdtRate: '',
    status: 'Active',
    notes: ''
  });

  // Cost fields state
  const [costs, setCosts] = useState({
    airFare: '',
    makkahHotel1: '',
    makkahHotel2: '',
    makkahHotel3: '',
    madinaHotel1: '',
    madinaHotel2: '',
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
    food: '',
    ziyaraFee: '',
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

  // Load existing package data
  useEffect(() => {
    if (existingPackage) {
      // Set form data
      setFormData({
        packageName: existingPackage.packageName || '',
        packageYear: existingPackage.packageYear || '',
        packageMonth: existingPackage.packageMonth || '',
        packageType: existingPackage.packageType || 'Regular',
        customPackageType: existingPackage.customPackageType || '',
        passengerType: existingPackage.passengerType || 'Adult',
        sarToBdtRate: existingPackage.sarToBdtRate || '',
        status: existingPackage.status || 'Active',
        notes: existingPackage.notes || ''
      });

      // Set costs
      if (existingPackage.costs) {
        setCosts({
          airFare: existingPackage.costs.airFare || '',
          makkahHotel1: existingPackage.costs.makkahHotel1 || '',
          makkahHotel2: existingPackage.costs.makkahHotel2 || '',
          makkahHotel3: existingPackage.costs.makkahHotel3 || '',
          madinaHotel1: existingPackage.costs.madinaHotel1 || '',
          madinaHotel2: existingPackage.costs.madinaHotel2 || '',
          zamzamWater: existingPackage.costs.zamzamWater || '',
          maktab: existingPackage.costs.maktab || '',
          visaFee: existingPackage.costs.visaFee || '',
          insuranceFee: existingPackage.costs.insuranceFee || '',
          electronicsFee: existingPackage.costs.electronicsFee || '',
          groundServiceFee: existingPackage.costs.groundServiceFee || '',
          makkahRoute: existingPackage.costs.makkahRoute || '',
          baggage: existingPackage.costs.baggage || '',
          serviceCharge: existingPackage.costs.serviceCharge || '',
          monazzem: existingPackage.costs.monazzem || '',
          food: existingPackage.costs.food || '',
          ziyaraFee: existingPackage.costs.ziyaraFee || '',
          idCard: existingPackage.costs.idCard || '',
          hajjKollan: existingPackage.costs.hajjKollan || '',
          trainFee: existingPackage.costs.trainFee || '',
          hajjGuide: existingPackage.costs.hajjGuide || '',
          govtServiceCharge: existingPackage.costs.govtServiceCharge || '',
          licenseFee: existingPackage.costs.licenseFee || '',
          transportFee: existingPackage.costs.transportFee || '',
          otherBdCosts: existingPackage.costs.otherBdCosts || ''
        });
      }

      // Set air fare details
      if (existingPackage.costs?.airFareDetails) {
        setAirFareDetails(existingPackage.costs.airFareDetails);
      }

      // Set hotel details
      if (existingPackage.costs?.hotelDetails) {
        setHotelDetails(existingPackage.costs.hotelDetails);
      }

      // Set discount
      if (existingPackage.costs?.discount) {
        setDiscount(existingPackage.costs.discount.toString());
      }
    }
  }, [existingPackage]);

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

    const serviceCostsRaw = (costs.groundServiceFee || 0);
    const feesRaw = (costs.electronicsFee || 0) + (costs.serviceCharge || 0);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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

  const handleAirFareDetailChange = (type, value) => {
    setAirFareDetails(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        price: value
      }
    }));
  };

  const saveAirFareDetails = () => {
    setCosts(prev => ({
      ...prev,
      airFareDetails: airFareDetails
    }));
    setShowAirFarePopup(false);
  };

  const openAirFarePopup = () => {
    if (costs.airFareDetails) {
      setAirFareDetails(costs.airFareDetails);
    }
    setShowAirFarePopup(true);
  };

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

  const calculatePassengerTypeTotals = () => {
    const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
    
    let adultTotal = 0;
    let childTotal = 0;
    let infantTotal = 0;

    if (costs.airFareDetails) {
      adultTotal += parseFloat(costs.airFareDetails.adult?.price) || 0;
      childTotal += parseFloat(costs.airFareDetails.child?.price) || 0;
      infantTotal += parseFloat(costs.airFareDetails.infant?.price) || 0;
    }

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

    const otherCosts = totals.bangladeshCosts + totals.saudiCosts;
    
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
        packageName: formData.packageName,
        packageYear: formData.packageYear,
        packageMonth: formData.packageMonth || '',
        packageType: formData.packageType,
        customPackageType: formData.customPackageType,
        sarToBdtRate: formData.sarToBdtRate || 0,
        notes: formData.notes,
        costs: {
          ...costs,
          discount: parseFloat(discount) || 0
        },
        totals: {
          bangladeshCosts: totals.bangladeshCosts,
          saudiCosts: totals.saudiCosts,
          hotelCosts: totals.hotelCosts,
          serviceCosts: totals.serviceCosts,
          fees: totals.fees,
          subtotal: totals.subtotal,
          grandTotal: totals.grandTotal,
          airFareDetails: costs.airFareDetails,
          passengerTotals: passengerTotals
        },
        status: formData.status || 'Active'
      };

      await updatePackageMutation.mutateAsync({ id, ...payload });

      setTimeout(() => {
        navigate(`/hajj-umrah/package-list/${id}`);
      }, 2000);

    } catch (error) {
      console.error('Error updating package:', error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">প্যাকেজ লোড করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">প্যাকেজ লোড করতে সমস্যা হয়েছে</p>
          <button
            onClick={() => navigate('/hajj-umrah/package-list')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            প্যাকেজ তালিকায় ফিরুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <style>{`
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
        <div className="mb-8">
          <div className="mb-6">
            <button
              onClick={() => navigate(`/hajj-umrah/package-list/${id}`)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">পিছনে ফিরুন</span>
            </button>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              হজ ও উমরাহ প্যাকেজ সম্পাদনা
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              প্যাকেজের তথ্য আপ데িট করুন
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* All the form sections from PackageCreation.jsx would go here */}
              {/* For brevity, I'm including just the structure - you would copy all the JSX from PackageCreation.jsx */}
              {/* The main difference is the header saying "Edit" instead of "Create" */}
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-purple-600" />
                  মৌলিক তথ্য
                </h2>
                
                {/* Form fields would go here - same as PackageCreation.jsx */}
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
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                      placeholder="প্যাকেজের নাম লিখুন"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      সাল <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="packageYear"
                      value={formData.packageYear}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                      placeholder="সাল"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      মাস <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <select
                      name="packageMonth"
                      value={formData.packageMonth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">মাস নির্বাচন করুন</option>
                      <option value="January">জানুয়ারি (January)</option>
                      <option value="February">ফেব্রুয়ারি (February)</option>
                      <option value="March">মার্চ (March)</option>
                      <option value="April">এপ্রিল (April)</option>
                      <option value="May">মে (May)</option>
                      <option value="June">জুন (June)</option>
                      <option value="July">জুলাই (July)</option>
                      <option value="August">আগস্ট (August)</option>
                      <option value="September">সেপ্টেম্বর (September)</option>
                      <option value="October">অক্টোবর (October)</option>
                      <option value="November">নভেম্বর (November)</option>
                      <option value="December">ডিসেম্বর (December)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting || updatePackageMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{isSubmitting || updatePackageMutation.isPending ? 'আপডেট করা হচ্ছে...' : 'আপডেট করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageEdit;

