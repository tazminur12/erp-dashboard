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

const AgentPackageCreation = () => {
  // Form state
  const [formData, setFormData] = useState({
    packageName: '',
    packageYear: '',
    packageType: 'Regular',
    customPackageType: '',
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


  // Bangladesh airfare passenger types state
  const [bangladeshAirfarePassengers, setBangladeshAirfarePassengers] = useState([]);
  
  // Bangladesh bus service passenger types state
  const [bangladeshBusPassengers, setBangladeshBusPassengers] = useState([]);
  
  // Bangladesh training/other passenger types state
  const [bangladeshTrainingOtherPassengers, setBangladeshTrainingOtherPassengers] = useState([]);

  // Saudi passenger types state for Custom Umrah
  const [saudiVisaPassengers, setSaudiVisaPassengers] = useState([]);
  const [saudiMakkahHotelPassengers, setSaudiMakkahHotelPassengers] = useState([]);
  const [saudiMadinaHotelPassengers, setSaudiMadinaHotelPassengers] = useState([]);
  const [saudiMakkahFoodPassengers, setSaudiMakkahFoodPassengers] = useState([]);
  const [saudiMadinaFoodPassengers, setSaudiMadinaFoodPassengers] = useState([]);
  const [saudiMakkahZiyaraPassengers, setSaudiMakkahZiyaraPassengers] = useState([]);
  const [saudiMadinaZiyaraPassengers, setSaudiMadinaZiyaraPassengers] = useState([]);
  const [saudiTransportPassengers, setSaudiTransportPassengers] = useState([]);
  const [saudiOthersPassengers, setSaudiOthersPassengers] = useState([]);

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

  // Calculate totals without passenger types
  const calculateTotals = () => {
    const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
    
    // Bangladesh airfare costs (passenger-specific)
    const bangladeshAirfareCosts = bangladeshAirfarePassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );

    // Bangladesh bus costs (passenger-specific)
    const bangladeshBusCosts = bangladeshBusPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );

    // Bangladesh training/other costs (passenger-specific)
    const bangladeshTrainingOtherCosts = bangladeshTrainingOtherPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );

    // Other Bangladesh costs (already in BDT)
    const otherBangladeshCosts = 
      (costs.idCard || 0) +
      (costs.hajjKollan || 0) +
      (costs.hajjGuide || 0) +
      (costs.govtServiceCharge || 0) +
      (costs.licenseFee || 0);

    const bangladeshCosts = bangladeshAirfareCosts + bangladeshBusCosts + bangladeshTrainingOtherCosts + otherBangladeshCosts;

    // Saudi passenger-specific costs for Custom Umrah
    const saudiVisaCosts = saudiVisaPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );
    const saudiMakkahHotelCosts = saudiMakkahHotelPassengers.reduce((sum, passenger) => 
      sum + (passenger.roomNumber * passenger.perNight * passenger.totalNights), 0
    );
    const saudiMadinaHotelCosts = saudiMadinaHotelPassengers.reduce((sum, passenger) => 
      sum + (passenger.roomNumber * passenger.perNight * passenger.totalNights), 0
    );
    const saudiMakkahFoodCosts = saudiMakkahFoodPassengers.reduce((sum, passenger) => 
      sum + (passenger.count * (passenger.days || 0) * (passenger.perDayPrice || 0)), 0
    );
    const saudiMadinaFoodCosts = saudiMadinaFoodPassengers.reduce((sum, passenger) => 
      sum + (passenger.count * (passenger.days || 0) * (passenger.perDayPrice || 0)), 0
    );
    const saudiMakkahZiyaraCosts = saudiMakkahZiyaraPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );
    const saudiMadinaZiyaraCosts = saudiMadinaZiyaraPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );
    const saudiTransportCosts = saudiTransportPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );
    const saudiOthersCosts = saudiOthersPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );

    // Saudi portion costs (convert from SAR to BDT)
    let saudiCostsRaw = 0;
    
    if (formData.customPackageType === 'Custom Umrah') {
      // For Custom Umrah, use passenger-specific costs
      saudiCostsRaw = 
        saudiVisaCosts +
        saudiMakkahHotelCosts +
        saudiMadinaHotelCosts +
        saudiMakkahFoodCosts +
        saudiMadinaFoodCosts +
        saudiMakkahZiyaraCosts +
        saudiMadinaZiyaraCosts +
        saudiTransportCosts +
        saudiOthersCosts;
    } else {
      // For other package types, use fixed costs
      saudiCostsRaw = 
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
    }

    const saudiCosts = saudiCostsRaw * sarToBdtRate;
    
    // Madina room calculation (removed for Custom Hajj and Umrah)
    const madinaRoomCost = 0;
    
    const subtotal = bangladeshCosts + saudiCosts + madinaRoomCost;
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
      totalAirFare: bangladeshAirfareCosts,
      hotelCosts: hotelCostsRaw * sarToBdtRate,
      serviceCosts: serviceCostsRaw * sarToBdtRate,
      fees: feesRaw * sarToBdtRate,
      bangladeshAirfarePassengers,
      bangladeshBusPassengers,
      bangladeshTrainingOtherPassengers,
      bangladeshBusCosts,
      bangladeshTrainingOtherCosts,
      // Saudi passenger data
      saudiVisaPassengers,
      saudiMakkahHotelPassengers,
      saudiMadinaHotelPassengers,
      saudiMakkahFoodPassengers,
      saudiMadinaFoodPassengers,
      saudiMakkahZiyaraPassengers,
      saudiMadinaZiyaraPassengers,
      saudiTransportPassengers,
      saudiOthersPassengers,
      saudiVisaCosts,
      saudiMakkahHotelCosts,
      saudiMadinaHotelCosts,
      saudiMakkahFoodCosts,
      saudiMadinaFoodCosts,
      saudiMakkahZiyaraCosts,
      saudiMadinaZiyaraCosts,
      saudiTransportCosts,
      saudiOthersCosts
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



  // Handle Bangladesh airfare passenger changes
  const handleBangladeshAirfareChange = (id, field, value) => {
    setBangladeshAirfarePassengers(prev => 
      prev.map(passenger => 
        passenger.id === id 
          ? { ...passenger, [field]: field === 'count' ? Math.max(0, parseInt(value) || 0) : parseFloat(value) || 0 }
          : passenger
      )
    );
  };

  // Add Bangladesh airfare passenger type
  const addBangladeshAirfarePassenger = () => {
    const newId = Date.now();
    setBangladeshAirfarePassengers(prev => [...prev, {
      id: newId,
      type: 'Adult',
      count: 0,
      price: 0
    }]);
  };

  // Remove Bangladesh airfare passenger type
  const removeBangladeshAirfarePassenger = (id) => {
    setBangladeshAirfarePassengers(prev => prev.filter(passenger => passenger.id !== id));
  };

  // Handle Bangladesh bus passenger changes
  const handleBangladeshBusChange = (id, field, value) => {
    setBangladeshBusPassengers(prev => 
      prev.map(passenger => 
        passenger.id === id 
          ? { ...passenger, [field]: field === 'count' ? Math.max(0, parseInt(value) || 0) : parseFloat(value) || 0 }
          : passenger
      )
    );
  };

  // Add Bangladesh bus passenger type
  const addBangladeshBusPassenger = () => {
    const newId = Date.now();
    setBangladeshBusPassengers(prev => [...prev, {
      id: newId,
      type: 'Adult',
      count: 0,
      price: 0
    }]);
  };

  // Remove Bangladesh bus passenger type
  const removeBangladeshBusPassenger = (id) => {
    setBangladeshBusPassengers(prev => prev.filter(passenger => passenger.id !== id));
  };

  // Handle Bangladesh training/other passenger changes
  const handleBangladeshTrainingOtherChange = (id, field, value) => {
    setBangladeshTrainingOtherPassengers(prev => 
      prev.map(passenger => 
        passenger.id === id 
          ? { ...passenger, [field]: field === 'count' ? Math.max(0, parseInt(value) || 0) : parseFloat(value) || 0 }
          : passenger
      )
    );
  };

  // Add Bangladesh training/other passenger type
  const addBangladeshTrainingOtherPassenger = () => {
    const newId = Date.now();
    setBangladeshTrainingOtherPassengers(prev => [...prev, {
      id: newId,
      type: 'Adult',
      count: 0,
      price: 0
    }]);
  };

  // Remove Bangladesh training/other passenger type
  const removeBangladeshTrainingOtherPassenger = (id) => {
    setBangladeshTrainingOtherPassengers(prev => prev.filter(passenger => passenger.id !== id));
  };

  // Saudi passenger handlers
  const createSaudiPassengerHandlers = (setter, prefix, isHotel = false, isFood = false) => ({
    handleChange: (id, field, value) => {
      setter(prev => 
        prev.map(passenger => 
          passenger.id === id 
            ? { 
                ...passenger, 
                [field]: field === 'count' || field === 'roomNumber' || field === 'totalNights' || field === 'hajiCount' || field === 'days'
                  ? Math.max(0, parseInt(value) || 0) 
                  : field === 'perNight' || field === 'perDayPrice' || field === 'price'
                    ? Math.max(0, parseFloat(value) || 0)
                    : value
              }
            : passenger
        )
      );
    },
    addPassenger: () => {
      const newId = Date.now();
      const basePassenger = {
        id: newId,
        type: 'Adult',
        count: 0,
        price: 0
      };
      
      if (isHotel) {
        setter(prev => [...prev, {
          ...basePassenger,
          hotelName: '',
          roomNumber: 0,
          perNight: 0,
          totalNights: 0,
          hajiCount: 0
        }]);
      } else if (isFood) {
        setter(prev => [...prev, {
          ...basePassenger,
          days: 0,
          perDayPrice: 0
        }]);
      } else {
        setter(prev => [...prev, basePassenger]);
      }
    },
    removePassenger: (id) => {
      setter(prev => prev.filter(passenger => passenger.id !== id));
    }
  });

  // Create handlers for all Saudi passenger types
  const saudiVisaHandlers = createSaudiPassengerHandlers(setSaudiVisaPassengers, 'visa');
  const saudiMakkahHotelHandlers = createSaudiPassengerHandlers(setSaudiMakkahHotelPassengers, 'makkahHotel', true);
  const saudiMadinaHotelHandlers = createSaudiPassengerHandlers(setSaudiMadinaHotelPassengers, 'madinaHotel', true);
  const saudiMakkahFoodHandlers = createSaudiPassengerHandlers(setSaudiMakkahFoodPassengers, 'makkahFood', false, true);
  const saudiMadinaFoodHandlers = createSaudiPassengerHandlers(setSaudiMadinaFoodPassengers, 'madinaFood', false, true);
  const saudiMakkahZiyaraHandlers = createSaudiPassengerHandlers(setSaudiMakkahZiyaraPassengers, 'makkahZiyara');
  const saudiMadinaZiyaraHandlers = createSaudiPassengerHandlers(setSaudiMadinaZiyaraPassengers, 'madinaZiyara');
  const saudiTransportHandlers = createSaudiPassengerHandlers(setSaudiTransportPassengers, 'transport');
  const saudiOthersHandlers = createSaudiPassengerHandlers(setSaudiOthersPassengers, 'others');

  // Helper function to render Saudi passenger type section
  const renderFoodPassengerSection = (title, passengers, handlers, colorClass) => (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{title}</label>
        <button
          type="button"
          onClick={handlers.addPassenger}
          className={`px-4 py-2 ${colorClass} text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium`}
        >
          + যাত্রী যোগ করুন
        </button>
      </div>
      
      {passengers.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>কোন যাত্রী যোগ করা হয়নি। "যাত্রী যোগ করুন" বাটনে ক্লিক করুন।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {passengers.map((passenger, index) => (
            <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                  <select
                    value={passenger.type}
                    onChange={(e) => handlers.handleChange(passenger.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Adult">Adult</option>
                    <option value="Child">Child</option>
                    <option value="Infant">Infant</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                  <input
                    type="number"
                    value={passenger.count}
                    onChange={(e) => handlers.handleChange(passenger.id, 'count', e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">কত দিন</label>
                  <input
                    type="number"
                    value={passenger.days || 0}
                    onChange={(e) => handlers.handleChange(passenger.id, 'days', e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">প্রতি দিন SAR</label>
                  <input
                    type="number"
                    value={passenger.perDayPrice || 0}
                    onChange={(e) => handlers.handleChange(passenger.id, 'perDayPrice', e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00 SAR"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (SAR)</label>
                  <input
                    type="number"
                    value={passenger.price}
                    onChange={(e) => handlers.handleChange(passenger.id, 'price', e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00 SAR"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => handlers.removePassenger(passenger.id)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    মুছুন
                  </button>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium">ক্যালকুলেশন:</div>
                <div className="text-xs">
                  {passenger.count} × {passenger.days || 0} × {(passenger.perDayPrice || 0).toLocaleString()} = {((passenger.count || 0) * (passenger.days || 0) * (passenger.perDayPrice || 0)).toLocaleString()} SAR
                </div>
                <div className="text-xs mt-1">
                  মোট: {passenger.count} × {(passenger.price || 0).toLocaleString()} = {((passenger.count || 0) * (passenger.price || 0)).toLocaleString()} SAR
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSaudiPassengerSection = (title, passengers, handlers, colorClass) => (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{title}</label>
        <button
          type="button"
          onClick={handlers.addPassenger}
          className={`px-4 py-2 ${colorClass} text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium`}
        >
          + যাত্রী যোগ করুন
        </button>
      </div>
      
      {passengers.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>কোন যাত্রী যোগ করা হয়নি। "যাত্রী যোগ করুন" বাটনে ক্লিক করুন।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {passengers.map((passenger, index) => (
            <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                  <select
                    value={passenger.type}
                    onChange={(e) => handlers.handleChange(passenger.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Adult">Adult</option>
                    <option value="Child">Child</option>
                    <option value="Infant">Infant</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                  <input
                    type="number"
                    value={passenger.count}
                    onChange={(e) => handlers.handleChange(passenger.id, 'count', e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (SAR)</label>
                  <input
                    type="number"
                    value={passenger.price}
                    onChange={(e) => handlers.handleChange(passenger.id, 'price', e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00 SAR"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => handlers.removePassenger(passenger.id)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    মুছুন
                  </button>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                মোট: {passenger.count} × {passenger.price.toLocaleString()} = {(passenger.count * passenger.price).toLocaleString()} SAR
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Helper function to render hotel passenger type section with enhanced fields
  const renderHotelPassengerSection = (title, passengers, handlers, colorClass) => (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{title}</label>
        <button
          type="button"
          onClick={handlers.addPassenger}
          className={`px-4 py-2 ${colorClass} text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium`}
        >
          + যাত্রী যোগ করুন
        </button>
      </div>
      
      {passengers.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>কোন যাত্রী যোগ করা হয়নি। "যাত্রী যোগ করুন" বাটনে ক্লিক করুন।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {passengers.map((passenger, index) => {
            const totalPerPerson = passenger.roomNumber * passenger.perNight * passenger.totalNights;
            return (
              <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                    <select
                      value={passenger.type}
                      onChange={(e) => handlers.handleChange(passenger.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Adult">Adult</option>
                      <option value="Child">Child</option>
                      <option value="Infant">Infant</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হোটেল নাম</label>
                    <input
                      type="text"
                      value={passenger.hotelName}
                      onChange={(e) => handlers.handleChange(passenger.id, 'hotelName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="হোটেল নাম"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">রুম সংখ্যা</label>
                    <input
                      type="number"
                      value={passenger.roomNumber}
                      onChange={(e) => handlers.handleChange(passenger.id, 'roomNumber', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">প্রতি রাত (SAR)</label>
                    <input
                      type="number"
                      value={passenger.perNight}
                      onChange={(e) => handlers.handleChange(passenger.id, 'perNight', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00 SAR"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মোট রাত</label>
                    <input
                      type="number"
                      value={passenger.totalNights}
                      onChange={(e) => handlers.handleChange(passenger.id, 'totalNights', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হাজী সংখ্যা</label>
                    <input
                      type="number"
                      value={passenger.hajiCount}
                      onChange={(e) => handlers.handleChange(passenger.id, 'hajiCount', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="font-medium">ক্যালকুলেশন:</div>
                    <div className="text-xs">
                      {passenger.roomNumber} × {passenger.perNight} × {passenger.totalNights} = {formatCurrency(totalPerPerson * (parseFloat(formData.sarToBdtRate) || 1))} BDT (প্রতি হাজীর জন্য)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlers.removePassenger(passenger.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    মুছুন
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

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
        bangladeshAirfarePassengers,
        bangladeshBusPassengers,
        bangladeshTrainingOtherPassengers,
        saudiVisaPassengers,
        saudiMakkahHotelPassengers,
        saudiMadinaHotelPassengers,
        saudiMakkahFoodPassengers,
        saudiMadinaFoodPassengers,
        saudiMakkahZiyaraPassengers,
        saudiMadinaZiyaraPassengers,
        saudiTransportPassengers,
        saudiOthersPassengers,
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
      setCosts(Object.fromEntries(Object.keys(costs || {}).map(key => [key, ''])));
      setBangladeshAirfarePassengers([]);
      setBangladeshBusPassengers([]);
      setBangladeshTrainingOtherPassengers([]);
      setSaudiVisaPassengers([]);
      setSaudiMakkahHotelPassengers([]);
      setSaudiMadinaHotelPassengers([]);
      setSaudiMakkahFoodPassengers([]);
      setSaudiMadinaFoodPassengers([]);
      setSaudiMakkahZiyaraPassengers([]);
      setSaudiMadinaZiyaraPassengers([]);
      setSaudiTransportPassengers([]);
      setSaudiOthersPassengers([]);
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
                      placeholder="0.00 SAR"
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
                    {/* Bangladesh Portion Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                        বাংলাদেশ অংশ
                      </h3>
                      
                      {/* Show simple form only for Custom Haj */}
                      {formData.customPackageType === 'Custom Haj' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                বিমান ভাড়া
                              </label>
                              <input 
                                type="number" 
                                name="bangladeshAirfare" 
                                value={costs.bangladeshAirfare || ''} 
                                onChange={handleCostChange} 
                                min="0" 
                                step="0.01" 
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                placeholder="0.00" 
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                হজ্জ কল্যাণ ফি
                              </label>
                              <input 
                                type="number" 
                                name="hajjKollan" 
                                value={costs.hajjKollan || ''} 
                                onChange={handleCostChange} 
                                min="0" 
                                step="0.01" 
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                placeholder="0.00" 
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                হজ গাইড ফি
                              </label>
                              <input 
                                type="number" 
                                name="hajjGuide" 
                                value={costs.hajjGuide || ''} 
                                onChange={handleCostChange} 
                                min="0" 
                                step="0.01" 
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                placeholder="0.00" 
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                লাইসেন্স চার্জ ফি
                              </label>
                              <input 
                                type="number" 
                                name="licenseFee" 
                                value={costs.licenseFee || ''} 
                                onChange={handleCostChange} 
                                min="0" 
                                step="0.01" 
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                placeholder="0.00" 
                              />
                            </div>

                            {/* Full width field */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                অন্যান্য বাংলাদেশি খরচ
                              </label>
                              <input 
                                type="number" 
                                name="otherBangladeshCosts" 
                                value={costs.otherBangladeshCosts || ''} 
                                onChange={handleCostChange} 
                                min="0" 
                                step="0.01" 
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                placeholder="0.00" 
                              />
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                আইডি কার্ড ফি
                              </label>
                              <input 
                                type="number" 
                                name="idCard" 
                                value={costs.idCard || ''} 
                                onChange={handleCostChange} 
                                min="0" 
                                step="0.01" 
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                placeholder="0.00" 
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                ট্রেনিং ফি
                              </label>
                              <input 
                                type="number" 
                                name="trainingFee" 
                                value={costs.trainingFee || ''} 
                                onChange={handleCostChange} 
                                min="0" 
                                step="0.01" 
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                placeholder="0.00" 
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                সার্ভিস চার্জ (সরকারি)
                              </label>
                              <input 
                                type="number" 
                                name="govtServiceCharge" 
                                value={costs.govtServiceCharge || ''} 
                                onChange={handleCostChange} 
                                min="0" 
                                step="0.01" 
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                placeholder="0.00" 
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                যাতায়াত ফি
                              </label>
                              <input 
                                type="number" 
                                name="transportFee" 
                                value={costs.transportFee || ''} 
                                onChange={handleCostChange} 
                                min="0" 
                                step="0.01" 
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                                placeholder="0.00" 
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Original complex form for other package types
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bangladesh Airfare Passenger Types */}
                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">বিমান ভাড়া (যাত্রীর ধরন অনুযায়ী)</label>
                            <button
                              type="button"
                              onClick={addBangladeshAirfarePassenger}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            >
                              + যাত্রী যোগ করুন
                            </button>
                          </div>
                          
                          {bangladeshAirfarePassengers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <p>কোন যাত্রী যোগ করা হয়নি। "যাত্রী যোগ করুন" বাটনে ক্লিক করুন।</p>
                          </div>
                        ) : (
                            <div className="space-y-4">
                              {bangladeshAirfarePassengers.map((passenger, index) => (
                                <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                                      <select
                                        value={passenger.type}
                                        onChange={(e) => handleBangladeshAirfareChange(passenger.id, 'type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                      >
                                        <option value="Adult">Adult</option>
                                        <option value="Child">Child</option>
                                        <option value="Infant">Infant</option>
                                      </select>
                            </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                                      <input
                                        type="number"
                                        value={passenger.count}
                                        onChange={(e) => handleBangladeshAirfareChange(passenger.id, 'count', e.target.value)}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="0"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (SAR)</label>
                                      <input
                                        type="number"
                                        value={passenger.price}
                                        onChange={(e) => handleBangladeshAirfareChange(passenger.id, 'price', e.target.value)}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="0.00 SAR"
                                      />
                                    </div>
                                    
                                    <div className="flex items-end">
                                      <button
                                        type="button"
                                        onClick={() => removeBangladeshAirfarePassenger(passenger.id)}
                                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                      >
                                        মুছুন
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                    মোট: {passenger.count} × {passenger.price.toLocaleString()} = {(passenger.count * passenger.price).toLocaleString()} টাকা
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {formData.customPackageType !== 'Custom Umrah' ? (
                          <>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">আইডি কার্ড ফি</label>
                              <input type="number" name="idCard" value={costs.idCard} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">হজ্জ কল্যাণ ফি</label>
                              <input type="number" name="hajjKollan" value={costs.hajjKollan} onChange={handleCostChange} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                            </div>

                            {/* Bangladesh Bus Service Passenger Types */}
                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">বাস সার্ভিস (যাত্রীর ধরন অনুযায়ী)</label>
                                <button
                                  type="button"
                                  onClick={addBangladeshBusPassenger}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                  + যাত্রী যোগ করুন
                                </button>
                              </div>
                              
                              {bangladeshBusPassengers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                  <p>কোন যাত্রী যোগ করা হয়নি। "যাত্রী যোগ করুন" বাটনে ক্লিক করুন।</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {bangladeshBusPassengers.map((passenger, index) => (
                                    <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                                          <select
                                            value={passenger.type}
                                            onChange={(e) => handleBangladeshBusChange(passenger.id, 'type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                          >
                                            <option value="Adult">Adult</option>
                                            <option value="Child">Child</option>
                                            <option value="Infant">Infant</option>
                                          </select>
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                                          <input
                                            type="number"
                                            value={passenger.count}
                                            onChange={(e) => handleBangladeshBusChange(passenger.id, 'count', e.target.value)}
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="0"
                                          />
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (SAR)</label>
                                          <input
                                            type="number"
                                            value={passenger.price}
                                            onChange={(e) => handleBangladeshBusChange(passenger.id, 'price', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="0.00 SAR"
                                          />
                                        </div>
                                        
                                        <div className="flex items-end">
                                          <button
                                            type="button"
                                            onClick={() => removeBangladeshBusPassenger(passenger.id)}
                                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                          >
                                            মুছুন
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                        মোট: {passenger.count} × {passenger.price.toLocaleString()} = {(passenger.count * passenger.price).toLocaleString()} টাকা
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Bangladesh Training/Other Passenger Types */}
                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ট্রেনিং/অন্যান্য খরচ (যাত্রীর ধরন অনুযায়ী)</label>
                                <button
                                  type="button"
                                  onClick={addBangladeshTrainingOtherPassenger}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                  + যাত্রী যোগ করুন
                                </button>
                              </div>
                              
                              {bangladeshTrainingOtherPassengers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                  <p>কোন যাত্রী যোগ করা হয়নি। "যাত্রী যোগ করুন" বাটনে ক্লিক করুন।</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {bangladeshTrainingOtherPassengers.map((passenger, index) => (
                                    <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                                          <select
                                            value={passenger.type}
                                            onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                          >
                                            <option value="Adult">Adult</option>
                                            <option value="Child">Child</option>
                                            <option value="Infant">Infant</option>
                                          </select>
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                                          <input
                                            type="number"
                                            value={passenger.count}
                                            onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'count', e.target.value)}
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="0"
                                          />
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (SAR)</label>
                                          <input
                                            type="number"
                                            value={passenger.price}
                                            onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'price', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="0.00 SAR"
                                          />
                                        </div>
                                        
                                        <div className="flex items-end">
                                          <button
                                            type="button"
                                            onClick={() => removeBangladeshTrainingOtherPassenger(passenger.id)}
                                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                          >
                                            মুছুন
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                        মোট: {passenger.count} × {passenger.price.toLocaleString()} = {(passenger.count * passenger.price).toLocaleString()} টাকা
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
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
                          </>
                        ) : (
                          // Custom Umrah - Show Bus Service and Training/Other passenger types
                          <>
                            {/* Bangladesh Bus Service Passenger Types for Custom Umrah */}
                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">বাস সার্ভিস (যাত্রীর ধরন অনুযায়ী)</label>
                                <button
                                  type="button"
                                  onClick={addBangladeshBusPassenger}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                  + যাত্রী যোগ করুন
                                </button>
                            </div>

                              {bangladeshBusPassengers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                  <p>কোন যাত্রী যোগ করা হয়নি। "যাত্রী যোগ করুন" বাটনে ক্লিক করুন।</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {bangladeshBusPassengers.map((passenger, index) => (
                                    <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                                          <select
                                            value={passenger.type}
                                            onChange={(e) => handleBangladeshBusChange(passenger.id, 'type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                          >
                                            <option value="Adult">Adult</option>
                                            <option value="Child">Child</option>
                                            <option value="Infant">Infant</option>
                                          </select>
                            </div>

                            <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                                          <input
                                            type="number"
                                            value={passenger.count}
                                            onChange={(e) => handleBangladeshBusChange(passenger.id, 'count', e.target.value)}
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="0"
                                          />
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (SAR)</label>
                                          <input
                                            type="number"
                                            value={passenger.price}
                                            onChange={(e) => handleBangladeshBusChange(passenger.id, 'price', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="0.00 SAR"
                                          />
                                        </div>
                                        
                                        <div className="flex items-end">
                                          <button
                                            type="button"
                                            onClick={() => removeBangladeshBusPassenger(passenger.id)}
                                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                          >
                                            মুছুন
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                        মোট: {passenger.count} × {passenger.price.toLocaleString()} = {(passenger.count * passenger.price).toLocaleString()} টাকা
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Bangladesh Training/Other Passenger Types for Custom Umrah */}
                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ট্রেনিং/অন্যান্য খরচ (যাত্রীর ধরন অনুযায়ী)</label>
                                <button
                                  type="button"
                                  onClick={addBangladeshTrainingOtherPassenger}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                  + যাত্রী যোগ করুন
                                </button>
                              </div>
                              
                              {bangladeshTrainingOtherPassengers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                  <p>কোন যাত্রী যোগ করা হয়নি। "যাত্রী যোগ করুন" বাটনে ক্লিক করুন।</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {bangladeshTrainingOtherPassengers.map((passenger, index) => (
                                    <div key={passenger.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                                          <select
                                            value={passenger.type}
                                            onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                          >
                                            <option value="Adult">Adult</option>
                                            <option value="Child">Child</option>
                                            <option value="Infant">Infant</option>
                                          </select>
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                                          <input
                                            type="number"
                                            value={passenger.count}
                                            onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'count', e.target.value)}
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="0"
                                          />
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (SAR)</label>
                                          <input
                                            type="number"
                                            value={passenger.price}
                                            onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'price', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="0.00 SAR"
                                          />
                                        </div>
                                        
                                        <div className="flex items-end">
                                          <button
                                            type="button"
                                            onClick={() => removeBangladeshTrainingOtherPassenger(passenger.id)}
                                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                          >
                                            মুছুন
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                        মোট: {passenger.count} × {passenger.price.toLocaleString()} = {(passenger.count * passenger.price).toLocaleString()} টাকা
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                        </div>
                      )}
                    </div>

                    {/* Saudi Portion Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                        সৌদি অংশ
                      </h3>
                      

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Conditional rendering based on Custom Umrah selection */}
                        {formData.customPackageType === 'Custom Umrah' ? (
                          // Show passenger-specific fields for Custom Umrah
                          <>
                            {/* Visa Costing */}
                            {renderSaudiPassengerSection(
                              "ভিসা খরচ (যাত্রীর ধরন অনুযায়ী)",
                              saudiVisaPassengers,
                              saudiVisaHandlers,
                              "bg-red-600 hover:bg-red-700"
                            )}

                            {/* Makkah Hotel */}
                            {renderHotelPassengerSection(
                              "মক্কা হোটেল (যাত্রীর ধরন অনুযায়ী)",
                              saudiMakkahHotelPassengers,
                              saudiMakkahHotelHandlers,
                              "bg-orange-600 hover:bg-orange-700"
                            )}

                            {/* Madina Hotel */}
                            {renderHotelPassengerSection(
                              "মদিনা হোটেল (যাত্রীর ধরন অনুযায়ী)",
                              saudiMadinaHotelPassengers,
                              saudiMadinaHotelHandlers,
                              "bg-green-600 hover:bg-green-700"
                            )}

                            {/* Makkah Food */}
                            {renderFoodPassengerSection(
                              "মক্কা খাবার (যাত্রীর ধরন অনুযায়ী)",
                              saudiMakkahFoodPassengers,
                              saudiMakkahFoodHandlers,
                              "bg-yellow-600 hover:bg-yellow-700"
                            )}

                            {/* Madina Food */}
                            {renderFoodPassengerSection(
                              "মদিনা খাবার (যাত্রীর ধরন অনুযায়ী)",
                              saudiMadinaFoodPassengers,
                              saudiMadinaFoodHandlers,
                              "bg-yellow-600 hover:bg-yellow-700"
                            )}

                            {/* Makka Ziyara */}
                            {renderSaudiPassengerSection(
                              "মক্কা জিয়ারা (যাত্রীর ধরন অনুযায়ী)",
                              saudiMakkahZiyaraPassengers,
                              saudiMakkahZiyaraHandlers,
                              "bg-indigo-600 hover:bg-indigo-700"
                            )}

                            {/* Madina Ziyara */}
                            {renderSaudiPassengerSection(
                              "মদিনা জিয়ারা (যাত্রীর ধরন অনুযায়ী)",
                              saudiMadinaZiyaraPassengers,
                              saudiMadinaZiyaraHandlers,
                              "bg-indigo-600 hover:bg-indigo-700"
                            )}

                            {/* Transport */}
                            {renderSaudiPassengerSection(
                              "পরিবহন (যাত্রীর ধরন অনুযায়ী)",
                              saudiTransportPassengers,
                              saudiTransportHandlers,
                              "bg-teal-600 hover:bg-teal-700"
                            )}

                            {/* Others */}
                            {renderSaudiPassengerSection(
                              "অন্যান্য (যাত্রীর ধরন অনুযায়ী)",
                              saudiOthersPassengers,
                              saudiOthersHandlers,
                              "bg-gray-600 hover:bg-gray-700"
                            )}
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

                    {/* Discount Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                        ছাড়
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ছাড়ের পরিমাণ</label>
                          <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        </div>
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

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                  খরচের সারসংক্ষেপ
                </h3>

                <div className="space-y-4">
                  <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          মোট বিমান ভাড়া
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(totals.totalAirFare)}
                    </span>
                    </div>
                    
                    {totals.bangladeshAirfarePassengers && totals.bangladeshAirfarePassengers.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {totals.bangladeshAirfarePassengers.map((passenger, index) => (
                          <div key={passenger.id} className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>{passenger.type}: {passenger.count} × {formatCurrency(passenger.price)}</span>
                            <span>{formatCurrency(passenger.count * passenger.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          বাস সার্ভিস খরচ
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(totals.bangladeshBusCosts)}
                      </span>
                    </div>
                    
                    {totals.bangladeshBusPassengers && totals.bangladeshBusPassengers.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {totals.bangladeshBusPassengers.map((passenger, index) => (
                          <div key={passenger.id} className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>{passenger.type}: {passenger.count} × {formatCurrency(passenger.price)}</span>
                            <span>{formatCurrency(passenger.count * passenger.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          ট্রেনিং/অন্যান্য খরচ
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(totals.bangladeshTrainingOtherCosts)}
                      </span>
                    </div>
                    
                    {totals.bangladeshTrainingOtherPassengers && totals.bangladeshTrainingOtherPassengers.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {totals.bangladeshTrainingOtherPassengers.map((passenger, index) => (
                          <div key={passenger.id} className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>{passenger.type}: {passenger.count} × {formatCurrency(passenger.price)}</span>
                            <span>{formatCurrency(passenger.count * passenger.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        মোট হোটেল খরচ
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(totals.hotelCosts)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        অন্যান্য খরচ
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(totals.serviceCosts)}
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

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPackageCreation;