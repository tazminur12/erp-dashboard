import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  DollarSign,
  Package,
  User,
  Building,
  Plane,
  Hotel,
  FileText,
  Calculator,
  TrendingUp,
  TrendingDown,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  useAgentPackage, 
  useAssignCustomersToPackage, 
  useRemoveCustomerFromPackage,
  useAvailableCustomers,
  usePackageCustomers,
  useUpdateAgentPackage
} from '../../../hooks/UseAgentPacakageQueries';
import { useHajiList } from '../../../hooks/UseHajiQueries';
import { useUmrahList } from '../../../hooks/UseUmrahQuries';
import Swal from 'sweetalert2';

const AgentPackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Package details from API
  const { data: packageData, isLoading: packageLoading, error: packageError } = useAgentPackage(id);
  const packageInfo = packageData || null;
  
  // State for customer assignment
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerFilter, setCustomerFilter] = useState('all'); // 'all', 'hajj', 'umrah'
  
  // State for costing modal
  const [showCostingModal, setShowCostingModal] = useState(false);
  const [isEditingCosts, setIsEditingCosts] = useState(false);
  
  // Update mutation
  const updatePackageMutation = useUpdateAgentPackage();
  
  // Cost fields state (similar to AgentPackageCreation)
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
  
  // Passenger types state
  const [bangladeshVisaPassengers, setBangladeshVisaPassengers] = useState([]);
  const [bangladeshAirfarePassengers, setBangladeshAirfarePassengers] = useState([]);
  const [bangladeshBusPassengers, setBangladeshBusPassengers] = useState([]);
  const [bangladeshTrainingOtherPassengers, setBangladeshTrainingOtherPassengers] = useState([]);
  const [saudiVisaPassengers, setSaudiVisaPassengers] = useState([]);
  const [saudiMakkahHotelPassengers, setSaudiMakkahHotelPassengers] = useState([]);
  const [saudiMadinaHotelPassengers, setSaudiMadinaHotelPassengers] = useState([]);
  const [saudiMakkahFoodPassengers, setSaudiMakkahFoodPassengers] = useState([]);
  const [saudiMadinaFoodPassengers, setSaudiMadinaFoodPassengers] = useState([]);
  const [saudiMakkahZiyaraPassengers, setSaudiMakkahZiyaraPassengers] = useState([]);
  const [saudiMadinaZiyaraPassengers, setSaudiMadinaZiyaraPassengers] = useState([]);
  const [saudiTransportPassengers, setSaudiTransportPassengers] = useState([]);
  const [saudiCampFeePassengers, setSaudiCampFeePassengers] = useState([]);
  const [saudiAlMashayerPassengers, setSaudiAlMashayerPassengers] = useState([]);
  const [saudiOthersPassengers, setSaudiOthersPassengers] = useState([]);
  
  const [discount, setDiscount] = useState('');
  const [sarToBdtRate, setSarToBdtRate] = useState('');
  
  // Modal states
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [passengerModalConfig, setPassengerModalConfig] = useState({ group: '', type: 'standard' });
  const [newPassenger, setNewPassenger] = useState({
    type: 'Adult',
    count: 0,
    price: 0,
    roomNumber: 0,
    perNight: 0,
    totalNights: 0,
    days: 0,
    perDayPrice: 0
  });
  
  const [collapsedSections, setCollapsedSections] = useState({
    bangladesh: false,
    saudi: false,
    custom: false
  });
  
  // Initialize costs from packageInfo when modal opens
  React.useEffect(() => {
    if (showCostingModal && packageInfo) {
      // Initialize costs from package data
      if (packageInfo.costs) {
        setCosts(prev => ({ ...prev, ...packageInfo.costs }));
      }
      if (packageInfo.discount) {
        setDiscount(packageInfo.discount.toString());
      }
      if (packageInfo?.sarToBdtRate) {
        setSarToBdtRate(packageInfo.sarToBdtRate.toString());
      }
      // Initialize passenger arrays
      if (packageInfo.bangladeshVisaPassengers) {
        setBangladeshVisaPassengers(packageInfo.bangladeshVisaPassengers);
      }
      if (packageInfo.bangladeshAirfarePassengers) {
        setBangladeshAirfarePassengers(packageInfo.bangladeshAirfarePassengers);
      }
      if (packageInfo.bangladeshBusPassengers) {
        setBangladeshBusPassengers(packageInfo.bangladeshBusPassengers);
      }
      if (packageInfo.bangladeshTrainingOtherPassengers) {
        setBangladeshTrainingOtherPassengers(packageInfo.bangladeshTrainingOtherPassengers);
      }
      if (packageInfo.saudiVisaPassengers) {
        setSaudiVisaPassengers(packageInfo.saudiVisaPassengers);
      }
      if (packageInfo.saudiMakkahHotelPassengers) {
        setSaudiMakkahHotelPassengers(packageInfo.saudiMakkahHotelPassengers);
      }
      if (packageInfo.saudiMadinaHotelPassengers) {
        setSaudiMadinaHotelPassengers(packageInfo.saudiMadinaHotelPassengers);
      }
      if (packageInfo.saudiMakkahFoodPassengers) {
        setSaudiMakkahFoodPassengers(packageInfo.saudiMakkahFoodPassengers);
      }
      if (packageInfo.saudiMadinaFoodPassengers) {
        setSaudiMadinaFoodPassengers(packageInfo.saudiMadinaFoodPassengers);
      }
      if (packageInfo.saudiMakkahZiyaraPassengers) {
        setSaudiMakkahZiyaraPassengers(packageInfo.saudiMakkahZiyaraPassengers);
      }
      if (packageInfo.saudiMadinaZiyaraPassengers) {
        setSaudiMadinaZiyaraPassengers(packageInfo.saudiMadinaZiyaraPassengers);
      }
      if (packageInfo.saudiTransportPassengers) {
        setSaudiTransportPassengers(packageInfo.saudiTransportPassengers);
      }
      if (packageInfo.saudiCampFeePassengers) {
        setSaudiCampFeePassengers(packageInfo.saudiCampFeePassengers);
      }
      if (packageInfo.saudiAlMashayerPassengers) {
        setSaudiAlMashayerPassengers(packageInfo.saudiAlMashayerPassengers);
      }
      if (packageInfo.saudiOthersPassengers) {
        setSaudiOthersPassengers(packageInfo.saudiOthersPassengers);
      }
    }
  }, [showCostingModal, packageInfo]);
  
  // Helper to generate unique IDs
  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  // Handle cost changes
  const handleCostChange = (e) => {
    const { name, value } = e.target;
    setCosts(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Toggle section collapse
  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Open passenger modal
  const openPassengerModal = (group, type) => {
    setPassengerModalConfig({ group, type });
    setNewPassenger({
      type: 'Adult',
      count: 0,
      price: 0,
      roomNumber: 0,
      perNight: 0,
      totalNights: 0,
      days: 0,
      perDayPrice: 0
    });
    setShowPassengerModal(true);
  };
  
  // Close passenger modal
  const closePassengerModal = () => {
    setShowPassengerModal(false);
    setNewPassenger({
      type: 'Adult',
      count: 0,
      price: 0,
      roomNumber: 0,
      perNight: 0,
      totalNights: 0,
      days: 0,
      perDayPrice: 0
    });
  };
  
  // Add passenger
  const addPassenger = () => {
    const passenger = {
      id: generateId(),
      ...newPassenger
    };
    
    switch (passengerModalConfig.group) {
      case 'bdVisa':
        setBangladeshVisaPassengers(prev => [...prev, passenger]);
        break;
      case 'bdAirfare':
        setBangladeshAirfarePassengers(prev => [...prev, passenger]);
        break;
      case 'bdBus':
        setBangladeshBusPassengers(prev => [...prev, passenger]);
        break;
      case 'bdTraining':
        setBangladeshTrainingOtherPassengers(prev => [...prev, passenger]);
        break;
      case 'saVisa':
        setSaudiVisaPassengers(prev => [...prev, passenger]);
        break;
      case 'saMakkahHotel':
        setSaudiMakkahHotelPassengers(prev => [...prev, passenger]);
        break;
      case 'saMadinaHotel':
        setSaudiMadinaHotelPassengers(prev => [...prev, passenger]);
        break;
      case 'saMakkahFood':
        setSaudiMakkahFoodPassengers(prev => [...prev, passenger]);
        break;
      case 'saMadinaFood':
        setSaudiMadinaFoodPassengers(prev => [...prev, passenger]);
        break;
      case 'saMakkahZiyara':
        setSaudiMakkahZiyaraPassengers(prev => [...prev, passenger]);
        break;
      case 'saMadinaZiyara':
        setSaudiMadinaZiyaraPassengers(prev => [...prev, passenger]);
        break;
      case 'saTransport':
        setSaudiTransportPassengers(prev => [...prev, passenger]);
        break;
      case 'saCampFee':
        setSaudiCampFeePassengers(prev => [...prev, passenger]);
        break;
      case 'saAlMashayer':
        setSaudiAlMashayerPassengers(prev => [...prev, passenger]);
        break;
      case 'saOthers':
        setSaudiOthersPassengers(prev => [...prev, passenger]);
        break;
    }
    closePassengerModal();
  };
  
  // Remove passenger
  const removePassenger = (group, id) => {
    switch (group) {
      case 'bdVisa':
        setBangladeshVisaPassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'bdAirfare':
        setBangladeshAirfarePassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'bdBus':
        setBangladeshBusPassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'bdTraining':
        setBangladeshTrainingOtherPassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'saVisa':
        setSaudiVisaPassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'saMakkahHotel':
        setSaudiMakkahHotelPassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'saMadinaHotel':
        setSaudiMadinaHotelPassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'saMakkahFood':
        setSaudiMakkahFoodPassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'saMadinaFood':
        setSaudiMadinaFoodPassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'saMakkahZiyara':
        setSaudiMakkahZiyaraPassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'saMadinaZiyara':
        setSaudiMadinaZiyaraPassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'saTransport':
        setSaudiTransportPassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'saCampFee':
        setSaudiCampFeePassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'saAlMashayer':
        setSaudiAlMashayerPassengers(prev => prev.filter(p => p.id !== id));
        break;
      case 'saOthers':
        setSaudiOthersPassengers(prev => prev.filter(p => p.id !== id));
        break;
    }
  };
  
  // Update passenger field
  const updatePassenger = (group, id, field, value) => {
    const numValue = ['count', 'price', 'roomNumber', 'perNight', 'totalNights', 'days', 'perDayPrice'].includes(field) 
      ? (value === '' ? 0 : parseFloat(value) || 0) 
      : value;
    
    switch (group) {
      case 'bdVisa':
        setBangladeshVisaPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'bdAirfare':
        setBangladeshAirfarePassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'bdBus':
        setBangladeshBusPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'bdTraining':
        setBangladeshTrainingOtherPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'saVisa':
        setSaudiVisaPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'saMakkahHotel':
        setSaudiMakkahHotelPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'saMadinaHotel':
        setSaudiMadinaHotelPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'saMakkahFood':
        setSaudiMakkahFoodPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'saMadinaFood':
        setSaudiMadinaFoodPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'saMakkahZiyara':
        setSaudiMakkahZiyaraPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'saMadinaZiyara':
        setSaudiMadinaZiyaraPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'saTransport':
        setSaudiTransportPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'saCampFee':
        setSaudiCampFeePassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'saAlMashayer':
        setSaudiAlMashayerPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
      case 'saOthers':
        setSaudiOthersPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
        break;
    }
  };
  
  // Save costing data
  const handleSaveCosting = async () => {
    try {
      const updateData = {
        costs,
        discount: parseFloat(discount) || 0,
        sarToBdtRate: parseFloat(sarToBdtRate) || 1,
        bangladeshVisaPassengers,
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
        saudiCampFeePassengers,
        saudiAlMashayerPassengers,
        saudiOthersPassengers
      };
      
      await updatePackageMutation.mutateAsync({
        id,
        updates: updateData
      });
      
      setIsEditingCosts(false);
      setShowCostingModal(false);
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };
  
  // Fetch Hajj and Umrah customers
  const { data: hajiData, isLoading: hajiLoading } = useHajiList({ limit: 1000 });
  const { data: umrahData, isLoading: umrahLoading } = useUmrahList({ limit: 1000 });
  
  // Get assigned customers for this package
  const { data: assignedCustomersData, isLoading: assignedCustomersLoading } = usePackageCustomers(id);
  
  // Try multiple sources for assigned customers
  let assignedCustomers = [];
  if (assignedCustomersData?.data?.customers) {
    assignedCustomers = assignedCustomersData.data.customers;
  } else if (assignedCustomersData?.data) {
    assignedCustomers = assignedCustomersData.data;
  } else if (assignedCustomersData) {
    assignedCustomers = assignedCustomersData;
  } else if (packageInfo?.assignedCustomers) {
    assignedCustomers = packageInfo.assignedCustomers;
  } else if (packageInfo?.customers) {
    assignedCustomers = packageInfo.customers;
  }
  
  // Convert object to array if needed
  if (assignedCustomers && typeof assignedCustomers === 'object' && !Array.isArray(assignedCustomers)) {
    // If it's an object, convert it to an array
    assignedCustomers = Object.values(assignedCustomers);
  }
  
  // Ensure it's an array
  if (!Array.isArray(assignedCustomers)) {
    assignedCustomers = [];
  }
  
  // If assignedCustomers contains IDs (strings), we need to get the actual customer objects
  const getCustomerDetails = (customerId) => {
    // First try to find in Hajj customers
    const hajiCustomer = (hajiData?.data || []).find(customer => customer._id === customerId);
    if (hajiCustomer) return hajiCustomer;
    
    // Then try to find in Umrah customers
    const umrahCustomer = (umrahData?.data || []).find(customer => customer._id === customerId);
    if (umrahCustomer) return umrahCustomer;
    
    // If not found, return a placeholder object
    return {
      _id: customerId,
      name: 'Customer Not Found',
      mobile: 'N/A',
      email: 'N/A'
    };
  };
  
  // Convert customer IDs to customer objects
  const customerObjects = assignedCustomers.map(customer => {
    if (typeof customer === 'string') {
      // It's a customer ID, get the actual customer object
      return getCustomerDetails(customer);
    } else {
      // It's already a customer object
      return customer;
    }
  });
  
  // Use the customer objects for display
  const displayCustomers = customerObjects;
  
  
  // Combine all customers (Hajj + Umrah)
  const allCustomers = [
    ...(hajiData?.data || []),
    ...(umrahData?.data || [])
  ];
  
  // New hooks for customer assignment
  const assignCustomersMutation = useAssignCustomersToPackage();
  const removeCustomerMutation = useRemoveCustomerFromPackage();
  const { data: availableCustomersData, isLoading: availableCustomersLoading } = useAvailableCustomers(id, searchTerm);
  const availableCustomers = availableCustomersData?.data || [];
  
  // Filter customers based on search term and customer type
  const filteredCustomers = allCustomers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    
    // Apply customer type filter
    let matchesFilter = true;
    if (customerFilter === 'hajj') {
      // Check if customer is from Hajj data
      matchesFilter = (hajiData?.data || []).some(haji => haji._id === customer._id);
    } else if (customerFilter === 'umrah') {
      // Check if customer is from Umrah data
      matchesFilter = (umrahData?.data || []).some(umrah => umrah._id === customer._id);
    }
    
    // Apply search filter
    const matchesSearch = (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.mobile?.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer._id?.toLowerCase().includes(searchLower) ||
      customer.passportNumber?.toLowerCase().includes(searchLower) ||
      customer.nidNumber?.includes(searchTerm)
    );
    
    return matchesFilter && matchesSearch;
  });
  
  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    if (selectedCustomers.find(c => c._id === customer._id)) {
      setSelectedCustomers(selectedCustomers.filter(c => c._id !== customer._id));
    } else {
      setSelectedCustomers([...selectedCustomers, customer]);
    }
  };
  
  // Handle assign customers to package
  const handleAssignCustomers = async () => {
    if (selectedCustomers.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'কোনো যাত্রী নির্বাচন করা হয়নি',
        text: 'অনুগ্রহ করে কমপক্ষে একজন যাত্রী নির্বাচন করুন'
      });
      return;
    }
    
    try {
      await assignCustomersMutation.mutateAsync({
        packageId: id,
        customerIds: selectedCustomers.map(c => c._id)
      });
      
      setSelectedCustomers([]);
      setSearchTerm('');
      setCustomerFilter('all');
      setShowCustomerModal(false);
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };
  
  // Handle remove customer from package
  const handleRemoveCustomer = async (customerId) => {
    try {
      await removeCustomerMutation.mutateAsync({
        packageId: id,
        customerId: customerId
      });
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Get profit/loss data from backend (calculated in API)
  const profitLossData = packageInfo?.profitLoss ? {
    totalCost: packageInfo.profitLoss.costingPrice || 0,
    sellingPrice: packageInfo.profitLoss.packagePrice || 0,
    profitLoss: packageInfo.profitLoss.profitLoss || 0,
    profitLossPercentage: parseFloat(packageInfo.profitLoss.profitLossPercentage) || 0,
    isProfit: packageInfo.profitLoss.isProfit || false,
    isLoss: packageInfo.profitLoss.isLoss || false
  } : {
    totalCost: 0,
    sellingPrice: 0,
    profitLoss: 0,
    profitLossPercentage: 0,
    isProfit: true,
    isLoss: false
  };

  // Payment summary (total paid & remaining due)
  const computedPackageTotal = packageInfo?.totalPrice 
    ?? packageInfo?.totals?.grandTotal 
    ?? packageInfo?.totals?.subtotal 
    ?? 0;
  const computedTotalPaid = packageInfo?.paymentSummary?.totalPaid || 0;
  const paymentSummary = {
    totalPaid: computedTotalPaid,
    remainingDue: Math.max(computedPackageTotal - computedTotalPaid, 0),
    packageTotal: computedPackageTotal
  };
  
  if (packageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (packageError || !packageInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Package Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested package could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="rounded-2xl bg-white/70 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Package Details</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">{packageInfo.packageName}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{packageInfo.customPackageType || packageInfo.packageType}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-end">
              <button
                onClick={() => setShowCustomerModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Customers</span>
              </button>
              <button
                onClick={() => navigate(`/hajj-umrah/agent-packages/${id}/costing`)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <Calculator className="w-4 h-4" />
                <span>Add Costing</span>
              </button>
              <button
                onClick={() => navigate(`/hajj-umrah/agent-packages/${id}/edit`)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Package</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Package Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Package Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{packageInfo.packageName}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {packageInfo.customPackageType || packageInfo.packageType}
                </p>
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  packageInfo.isActive 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                }`}>
                  {packageInfo.isActive ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Inactive</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Package Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                Package Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Year:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{packageInfo.packageYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{packageInfo.packageType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{packageInfo.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Package Price:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ৳{(packageInfo.totalPrice || packageInfo.totals?.subtotal || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Profit & Loss Section */}
            {packageInfo?.profitLoss && (
              <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 ${
                profitLossData.isProfit 
                  ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10' 
                  : profitLossData.isLoss
                  ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  {profitLossData.isProfit ? (
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                  ) : profitLossData.isLoss ? (
                    <TrendingDown className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
                  ) : (
                    <Calculator className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                  )}
                  Profit & Loss
                </h3>
                <div className="space-y-4">
                  {/* Costing Price */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Costing Price</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(profitLossData.totalCost)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>

                  {/* Agent Package Price */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Agent Package Price</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(profitLossData.sellingPrice)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>

                  {/* Profit/Loss */}
                  <div className={`rounded-lg p-4 ${
                    profitLossData.isProfit 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : profitLossData.isLoss
                      ? 'bg-red-100 dark:bg-red-900/20'
                      : 'bg-gray-100 dark:bg-gray-700/50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {profitLossData.isProfit ? 'লাভ (Profit)' : profitLossData.isLoss ? 'ক্ষতি (Loss)' : 'লাভ/ক্ষতি (Profit/Loss)'}
                        </p>
                        <p className={`text-2xl font-bold ${
                          profitLossData.isProfit 
                            ? 'text-green-600 dark:text-green-400' 
                            : profitLossData.isLoss
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {profitLossData.isProfit ? '+' : ''}{formatCurrency(profitLossData.profitLoss)}
                        </p>
                        {profitLossData.profitLossPercentage !== 0 && (
                          <p className={`text-sm font-medium mt-1 flex items-center ${
                            profitLossData.isProfit 
                              ? 'text-green-600 dark:text-green-400' 
                              : profitLossData.isLoss
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {profitLossData.isProfit ? (
                              <TrendingUp className="w-4 h-4 mr-1" />
                            ) : profitLossData.isLoss ? (
                              <TrendingDown className="w-4 h-4 mr-1" />
                            ) : null}
                            {Math.abs(profitLossData.profitLossPercentage)}%
                          </p>
                        )}
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        profitLossData.isProfit 
                          ? 'bg-green-200 dark:bg-green-800/30' 
                          : profitLossData.isLoss
                          ? 'bg-red-200 dark:bg-red-800/30'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {profitLossData.isProfit ? (
                          <TrendingUp className={`w-6 h-6 ${profitLossData.isProfit ? 'text-green-600 dark:text-green-400' : ''}`} />
                        ) : profitLossData.isLoss ? (
                          <TrendingDown className={`w-6 h-6 ${profitLossData.isLoss ? 'text-red-600 dark:text-red-400' : ''}`} />
                        ) : (
                          <Calculator className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Customer Assignment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Assignment Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Assigned Customers
                </h3>
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Customers</span>
                </button>
              </div>


              {/* Customer List */}
              <div className="space-y-4">
                {assignedCustomersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Loading assigned customers...</p>
                    </div>
                  </div>
                ) : Array.isArray(displayCustomers) && displayCustomers.length > 0 ? (
                  displayCustomers.map((customer) => (
                    <div key={customer._id || customer.customerId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{customer.name || customer.customerName || 'N/A'}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.mobile || customer.phone || customer.contactNumber || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{customer._id || customer.customerId || 'N/A'}</span>
                          <button 
                            onClick={() => handleRemoveCustomer(customer._id || customer.customerId)}
                            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="Remove from package"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">No customers assigned yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Click "Add Customers" to assign customers to this package</p>
                  </div>
                )}
              </div>
            </div>

            {/* Package Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Package Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Package Name</label>
                  <p className="text-gray-900 dark:text-white">{packageInfo.packageName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Package Type</label>
                  <p className="text-gray-900 dark:text-white">{packageInfo.packageType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Year</label>
                  <p className="text-gray-900 dark:text-white">{packageInfo.packageYear}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                  <p className="text-gray-900 dark:text-white">{packageInfo.status}</p>
                </div>
                {packageInfo.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</label>
                    <p className="text-gray-700 dark:text-gray-300">{packageInfo.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Profit/Loss Summary (moved here under package details) */}
            {(packageInfo?.profitLoss || packageInfo?.paymentSummary) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Payment Summary */}
                <div className="rounded-xl p-6 border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    পেমেন্ট সারসংক্ষেপ
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">মোট মূল্য:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(packageInfo?.totalPrice ?? paymentSummary.packageTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">পরিশোধিত:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(paymentSummary.totalPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">বকেয়া:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(paymentSummary.remainingDue)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Customers</h3>
                <button
                  onClick={() => {
                    setShowCustomerModal(false);
                    setSearchTerm('');
                    setCustomerFilter('all');
                    setSelectedCustomers([]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Filter Buttons */}
              <div className="mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCustomerFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      customerFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    All Customers
                  </button>
                  <button
                    onClick={() => setCustomerFilter('hajj')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      customerFilter === 'hajj'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Hajj
                  </button>
                  <button
                    onClick={() => setCustomerFilter('umrah')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      customerFilter === 'umrah'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Umrah
                  </button>
                </div>
              </div>
              
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              {/* Customer List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {(availableCustomers.length > 0 ? availableCustomers : filteredCustomers).map((customer) => (
                  <div
                    key={customer._id}
                    onClick={() => handleCustomerSelect(customer)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCustomers.find(c => c._id === customer._id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{customer.name || 'N/A'}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{customer.mobile || customer.phone || 'N/A'}</p>
                        </div>
                      </div>
                      {selectedCustomers.find(c => c._id === customer._id) && (
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedCustomers.length} customer(s) selected
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowCustomerModal(false);
                      setSearchTerm('');
                      setCustomerFilter('all');
                      setSelectedCustomers([]);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignCustomers}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Assign Customers
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

               

      {/* Passenger Modal */}
      {showPassengerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">যাত্রী যোগ করুন</h3>
              <button
                onClick={closePassengerModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">যাত্রীর ধরন</label>
                <select
                  value={newPassenger.type}
                  onChange={(e) => setNewPassenger(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="Adult">Adult</option>
                  <option value="Child">Child</option>
                  <option value="Infant">Infant</option>
                </select>
              </div>
              
              {passengerModalConfig.type === 'hotel' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">রুম সংখ্যা</label>
                    <input
                      type="number"
                      value={newPassenger.roomNumber}
                      onChange={(e) => setNewPassenger(prev => ({ ...prev, roomNumber: e.target.value }))}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">প্রতি রাত (SAR)</label>
                    <input
                      type="number"
                      value={newPassenger.perNight}
                      onChange={(e) => setNewPassenger(prev => ({ ...prev, perNight: e.target.value }))}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মোট রাত</label>
                    <input
                      type="number"
                      value={newPassenger.totalNights}
                      onChange={(e) => setNewPassenger(prev => ({ ...prev, totalNights: e.target.value }))}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </>
              ) : passengerModalConfig.type === 'food' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                    <input
                      type="number"
                      value={newPassenger.count}
                      onChange={(e) => setNewPassenger(prev => ({ ...prev, count: e.target.value }))}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">কত দিন</label>
                    <input
                      type="number"
                      value={newPassenger.days}
                      onChange={(e) => setNewPassenger(prev => ({ ...prev, days: e.target.value }))}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">প্রতি দিন (SAR)</label>
                    <input
                      type="number"
                      value={newPassenger.perDayPrice}
                      onChange={(e) => setNewPassenger(prev => ({ ...prev, perDayPrice: e.target.value }))}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">সংখ্যা</label>
                    <input
                      type="number"
                      value={newPassenger.count}
                      onChange={(e) => setNewPassenger(prev => ({ ...prev, count: e.target.value }))}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {passengerModalConfig.group.startsWith('sa') ? 'মূল্য (SAR)' : 'মূল্য (BDT)'}
                    </label>
                    <input
                      type="number"
                      value={newPassenger.price}
                      onChange={(e) => setNewPassenger(prev => ({ ...prev, price: e.target.value }))}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </>
              )}
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={closePassengerModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  বাতিল
                </button>
                <button
                  onClick={addPassenger}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                >
                  যোগ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentPackageDetails;
