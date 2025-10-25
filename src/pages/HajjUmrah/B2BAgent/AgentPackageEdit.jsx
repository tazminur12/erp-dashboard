import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Plus, 
  Save, 
  Package, 
  Calculator, 
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
  EyeOff,
  Users
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAgentPackage, useUpdateAgentPackage } from '../../../hooks/UseAgentPacakageQueries';
import { useAgents, useUpdateAgent } from '../../../hooks/useAgentQueries';

const AgentPackageEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // API hooks
  const { data: packageData, isLoading: packageLoading, error: packageError } = useAgentPackage(id);
  const updatePackageMutation = useUpdateAgentPackage();
  const updateAgentMutation = useUpdateAgent();
  const { data: agentsData, isLoading: agentsLoading } = useAgents(1, 100, '');
  
  const packageInfo = packageData || null;

  // Debug logging
  console.log('AgentPackageEdit Debug:', {
    id,
    packageData,
    packageLoading,
    packageError,
    packageInfo,
    agentsData,
    agentsLoading
  });

  // Form state
  const [formData, setFormData] = useState({
    packageName: '',
    packageYear: '',
    packageType: 'Regular',
    customPackageType: '',
    sarToBdtRate: '',
    notes: '',
    agentId: '',
    status: 'Active'
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

  // Bangladesh passenger types state
  const [bangladeshVisaPassengers, setBangladeshVisaPassengers] = useState([]);
  const [bangladeshAirfarePassengers, setBangladeshAirfarePassengers] = useState([]);
  const [bangladeshBusPassengers, setBangladeshBusPassengers] = useState([]);
  const [bangladeshTrainingOtherPassengers, setBangladeshTrainingOtherPassengers] = useState([]);

  // Saudi passenger types state
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

  // Other states
  const [attachments, setAttachments] = useState([]);
  const [discount, setDiscount] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({
    costDetails: false,
    bangladeshPortion: false,
    saudiPortion: false,
    attachments: false
  });

  // Modal states
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [passengerModalConfig, setPassengerModalConfig] = useState({ group: '', type: 'standard' });
  const [showBdCostModal, setShowBdCostModal] = useState(false);
  const [bdCostModalConfig, setBdCostModalConfig] = useState({ field: '', label: '' });
  const [newBdCost, setNewBdCost] = useState(0);
  const [showSaudiCostModal, setShowSaudiCostModal] = useState(false);
  const [saudiCostModalConfig, setSaudiCostModalConfig] = useState({ field: '', label: '' });
  const [newSaudiCost, setNewSaudiCost] = useState(0);
  const [newPassenger, setNewPassenger] = useState({
    type: 'Adult',
    count: 0,
    price: 0,
    hotelName: '',
    roomNumber: 0,
    perNight: 0,
    totalNights: 0,
    hajiCount: 0,
    days: 0,
    perDayPrice: 0
  });

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Cloudinary configuration
  const CLOUD_NAME = 'your-cloud-name';
  const UPLOAD_PRESET = 'your-upload-preset';

  // Load package data when component mounts
  useEffect(() => {
    if (packageInfo) {
      console.log('Loading package data into form:', packageInfo);
      console.log('Agent ID from package:', packageInfo.agentId);
      console.log('Agent object from package:', packageInfo.agent);
      console.log('Full package structure:', JSON.stringify(packageInfo, null, 2));
      setFormData({
        packageName: packageInfo.packageName || '',
        packageYear: packageInfo.packageYear || '',
        packageType: packageInfo.packageType || 'Regular',
        customPackageType: packageInfo.customPackageType || '',
        sarToBdtRate: packageInfo.sarToBdtRate || '',
        notes: packageInfo.notes || '',
        agentId: packageInfo.agentId || packageInfo.agent?._id || '',
        status: packageInfo.status || 'Active'
      });

      if (packageInfo.costs) {
        setCosts(packageInfo.costs);
      }

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
      if (packageInfo.saudiOthersPassengers) {
        setSaudiOthersPassengers(packageInfo.saudiOthersPassengers);
      }
      if (packageInfo.saudiCampFeePassengers) {
        setSaudiCampFeePassengers(packageInfo.saudiCampFeePassengers);
      }
      if (packageInfo.saudiAlMashayerPassengers) {
        setSaudiAlMashayerPassengers(packageInfo.saudiAlMashayerPassengers);
      }

      if (packageInfo.attachments) {
        setAttachments(packageInfo.attachments);
      }
      if (packageInfo.discount) {
        setDiscount(packageInfo.discount);
      }
    }
  }, [packageInfo]);

  // Calculate totals
  const calculateTotals = () => {
    const sarToBdtRate = parseFloat(formData.sarToBdtRate) || 1;
    
    // Bangladesh visa costs (passenger-specific)
    const bangladeshVisaCosts = bangladeshVisaPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );

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
      (parseFloat(costs.idCard) || 0) +
      (parseFloat(costs.hajjKollan) || 0) +
      (parseFloat(costs.trainFee) || 0) +
      (parseFloat(costs.hajjGuide) || 0) +
      (parseFloat(costs.govtServiceCharge) || 0) +
      (parseFloat(costs.licenseFee) || 0) +
      (parseFloat(costs.transportFee) || 0) +
      (parseFloat(costs.otherBdCosts) || 0);

    const bangladeshCosts = bangladeshVisaCosts + bangladeshAirfareCosts + bangladeshBusCosts + bangladeshTrainingOtherCosts + otherBangladeshCosts;

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
      sum + (passenger.count * passenger.perDayPrice * passenger.days), 0
    );
    const saudiMadinaFoodCosts = saudiMadinaFoodPassengers.reduce((sum, passenger) => 
      sum + (passenger.count * passenger.perDayPrice * passenger.days), 0
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
    const saudiCampFeeCosts = saudiCampFeePassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );
    const saudiAlMashayerCosts = saudiAlMashayerPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );
    const saudiOthersCosts = saudiOthersPassengers.reduce((sum, passenger) => 
      sum + (passenger.price * passenger.count), 0
    );

    const saudiPassengerCosts = saudiVisaCosts + saudiMakkahHotelCosts + saudiMadinaHotelCosts + 
      saudiMakkahFoodCosts + saudiMadinaFoodCosts + saudiMakkahZiyaraCosts + saudiMadinaZiyaraCosts + 
      saudiTransportCosts + saudiCampFeeCosts + saudiAlMashayerCosts + saudiOthersCosts;

    // Saudi costs (in SAR, convert to BDT)
    const saudiCostsInSAR = 
      (parseFloat(costs.airFare) || 0) +
      (parseFloat(costs.makkahHotel1) || 0) +
      (parseFloat(costs.makkahHotel2) || 0) +
      (parseFloat(costs.makkahHotel3) || 0) +
      (parseFloat(costs.madinaHotel1) || 0) +
      (parseFloat(costs.madinaHotel2) || 0) +
      (parseFloat(costs.zamzamWater) || 0) +
      (parseFloat(costs.maktab) || 0) +
      (parseFloat(costs.visaFee) || 0) +
      (parseFloat(costs.insuranceFee) || 0) +
      (parseFloat(costs.electronicsFee) || 0) +
      (parseFloat(costs.groundServiceFee) || 0) +
      (parseFloat(costs.makkahRoute) || 0) +
      (parseFloat(costs.baggage) || 0) +
      (parseFloat(costs.serviceCharge) || 0) +
      (parseFloat(costs.monazzem) || 0) +
      (parseFloat(costs.food) || 0) +
      (parseFloat(costs.ziyaraFee) || 0);

    const saudiCostsInBDT = saudiCostsInSAR * sarToBdtRate;

    const subtotal = bangladeshCosts + saudiPassengerCosts + saudiCostsInBDT;
    const discountAmount = parseFloat(discount) || 0;
    const total = subtotal - discountAmount;
    
    return {
      bangladeshCosts,
      saudiPassengerCosts,
      saudiCostsInBDT,
      subtotal,
      discount: discountAmount,
      total: Math.max(0, total)
    };
  };

  const totals = calculateTotals();

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCostChange = (e) => {
    const { name, value } = e.target;
    setCosts(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Passenger handlers
  const handleBangladeshVisaChange = (id, field, value) => {
    setBangladeshVisaPassengers(prev => 
      prev.map(passenger => 
        passenger.id === id ? { ...passenger, [field]: value } : passenger
      )
    );
  };

  const handleBangladeshAirfareChange = (id, field, value) => {
    setBangladeshAirfarePassengers(prev => 
      prev.map(passenger => 
        passenger.id === id ? { ...passenger, [field]: value } : passenger
      )
    );
  };

  const handleBangladeshBusChange = (id, field, value) => {
    setBangladeshBusPassengers(prev => 
      prev.map(passenger => 
        passenger.id === id ? { ...passenger, [field]: value } : passenger
      )
    );
  };

  const handleBangladeshTrainingOtherChange = (id, field, value) => {
    setBangladeshTrainingOtherPassengers(prev => 
      prev.map(passenger => 
        passenger.id === id ? { ...passenger, [field]: value } : passenger
      )
    );
  };

  const addBangladeshAirfarePassenger = () => {
    const newPassenger = {
      id: Date.now(),
      type: 'Adult',
      count: 0,
      price: 0
    };
    setBangladeshAirfarePassengers(prev => [...prev, newPassenger]);
  };

  const addBangladeshBusPassenger = () => {
    const newPassenger = {
      id: Date.now(),
      type: 'Adult',
      count: 0,
      price: 0
    };
    setBangladeshBusPassengers(prev => [...prev, newPassenger]);
  };

  const addBangladeshTrainingOtherPassenger = () => {
    const newPassenger = {
      id: Date.now(),
      type: 'Adult',
      count: 0,
      price: 0
    };
    setBangladeshTrainingOtherPassengers(prev => [...prev, newPassenger]);
  };

  const removeBangladeshVisaPassenger = (id) => {
    setBangladeshVisaPassengers(prev => prev.filter(passenger => passenger.id !== id));
  };

  const removeBangladeshAirfarePassenger = (id) => {
    setBangladeshAirfarePassengers(prev => prev.filter(passenger => passenger.id !== id));
  };

  const removeBangladeshBusPassenger = (id) => {
    setBangladeshBusPassengers(prev => prev.filter(passenger => passenger.id !== id));
  };

  const removeBangladeshTrainingOtherPassenger = (id) => {
    setBangladeshTrainingOtherPassengers(prev => prev.filter(passenger => passenger.id !== id));
  };

  // Saudi passenger handlers
  const createSaudiPassengerHandlers = (setter, prefix, isHotel = false, isFood = false) => ({
    add: () => {
      const newPassenger = {
        id: Date.now(),
        type: 'Adult',
        count: 0,
        price: 0,
        ...(isHotel && {
          hotelName: '',
          roomNumber: 0,
          perNight: 0,
          totalNights: 0,
          hajiCount: 0
        }),
        ...(isFood && {
          days: 0,
          perDayPrice: 0
        })
      };
      setter(prev => [...prev, newPassenger]);
    },
    remove: (id) => {
      setter(prev => prev.filter(passenger => passenger.id !== id));
    },
    change: (id, field, value) => {
      setter(prev => 
        prev.map(passenger => 
          passenger.id === id ? { ...passenger, [field]: value } : passenger
        )
      );
    }
  });

  const saudiVisaHandlers = createSaudiPassengerHandlers(setSaudiVisaPassengers, 'saudiVisa');
  const saudiMakkahHotelHandlers = createSaudiPassengerHandlers(setSaudiMakkahHotelPassengers, 'saudiMakkahHotel', true);
  const saudiMadinaHotelHandlers = createSaudiPassengerHandlers(setSaudiMadinaHotelPassengers, 'saudiMadinaHotel', true);
  const saudiMakkahFoodHandlers = createSaudiPassengerHandlers(setSaudiMakkahFoodPassengers, 'saudiMakkahFood', false, true);
  const saudiMadinaFoodHandlers = createSaudiPassengerHandlers(setSaudiMadinaFoodPassengers, 'saudiMadinaFood', false, true);
  const saudiMakkahZiyaraHandlers = createSaudiPassengerHandlers(setSaudiMakkahZiyaraPassengers, 'saudiMakkahZiyara');
  const saudiMadinaZiyaraHandlers = createSaudiPassengerHandlers(setSaudiMadinaZiyaraPassengers, 'saudiMadinaZiyara');
  const saudiTransportHandlers = createSaudiPassengerHandlers(setSaudiTransportPassengers, 'saudiTransport');
  const saudiCampFeeHandlers = createSaudiPassengerHandlers(setSaudiCampFeePassengers, 'saudiCampFee');
  const saudiAlMashayerHandlers = createSaudiPassengerHandlers(setSaudiAlMashayerPassengers, 'saudiAlMashayer');
  const saudiOthersHandlers = createSaudiPassengerHandlers(setSaudiOthersPassengers, 'saudiOthers');

  // Modal handlers
  const openPassengerModal = (group, type) => {
    setPassengerModalConfig({ group, type });
    setShowPassengerModal(true);
    setNewPassenger({
      type: 'Adult',
      count: 0,
      price: 0,
      hotelName: '',
      roomNumber: 0,
      perNight: 0,
      totalNights: 0,
      hajiCount: 0,
      days: 0,
      perDayPrice: 0
    });
  };

  const closePassengerModal = () => {
    setShowPassengerModal(false);
  };

  const handleNewPassengerChange = (field, value) => {
    setNewPassenger(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const savePassengerFromModal = () => {
    const id = Date.now();
    const count = newPassenger.count === '' ? 0 : newPassenger.count;
    const price = newPassenger.price === '' ? 0 : newPassenger.price;
    const roomNumber = newPassenger.roomNumber === '' ? 0 : newPassenger.roomNumber;
    const perNight = newPassenger.perNight === '' ? 0 : newPassenger.perNight;
    const totalNights = newPassenger.totalNights === '' ? 0 : newPassenger.totalNights;
    
    if (count <= 0) return;
    if (price <= 0) return;

    const base = { id, type: newPassenger.type, count: count, price: price };
    if (newPassenger.roomNumber) base.roomNumber = roomNumber;
    if (newPassenger.perNight) base.perNight = perNight;
    if (newPassenger.totalNights) base.totalNights = totalNights;

    // Add to appropriate passenger array based on context
    // This would need to be determined by the calling context
    setShowPassengerModal(false);
  };

  const openBdCostModal = (field, label) => {
    setCurrentModalField(field);
    setCurrentModalLabel(label);
    setShowBdCostModal(true);
  };

  const closeBdCostModal = () => {
    setShowBdCostModal(false);
  };

  const saveBdCost = () => {
    // Save Bangladesh cost logic
    setShowBdCostModal(false);
  };

  const openSaudiCostModal = (field, label) => {
    setCurrentModalField(field);
    setCurrentModalLabel(label);
    setShowSaudiCostModal(true);
  };

  const closeSaudiCostModal = () => {
    setShowSaudiCostModal(false);
  };

  const saveSaudiCost = () => {
    setCosts(prev => ({
      ...prev,
      [saudiCostModalConfig.field]: newSaudiCost
    }));
    setShowSaudiCostModal(false);
  };

  // File upload functionality
  const handleFileUpload = async (files) => {
    const fileArray = Array.from(files);
    setUploadingFiles(fileArray.map(file => file.name));
    
    try {
      const uploadPromises = fileArray.map(file => uploadToCloudinary(file));
      const uploadedFiles = await Promise.all(uploadPromises);
      
      setAttachments(prev => [...prev, ...uploadedFiles]);
      setUploadingFiles([]);
      
      Swal.fire({
        title: 'Success',
        text: 'Files uploaded successfully',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles([]);
      Swal.fire({
        title: 'Upload Error',
        text: 'Failed to upload files. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return {
        name: file.name,
        url: data.secure_url,
        publicId: data.public_id,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
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

    if (!formData.agentId) {
      newErrors.agentId = 'Please select an agent';
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

    const payload = {
      ...formData,
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
      saudiOthersPassengers,
      costs,
      totals,
      attachments,
      discount
    };

    updatePackageMutation.mutate({ id, updates: payload }, {
      onSuccess: () => {
        navigate(`/hajj-umrah/agent-packages/${id}`);
      }
    });
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

  const isFormValid = !!(formData.packageName.trim() && formData.packageYear);
  const isSubmitting = updatePackageMutation.isPending;
  const hasAgents = agentsData?.data?.length > 0;



  if (packageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If there's an error or no package data after loading, show error message
  if (packageError || (!packageLoading && !packageInfo)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Package Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested package could not be found.</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg border border-red-200 dark:border-red-700 mb-4">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Debug Info:</h4>
              <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <div>Package ID: {id}</div>
                <div>Package Loading: {packageLoading ? 'Yes' : 'No'}</div>
                <div>Package Error: {packageError ? JSON.stringify(packageError) : 'None'}</div>
                <div>Package Data: {packageData ? 'Found' : 'Not Found'}</div>
                <div>Package Info: {packageInfo ? 'Found' : 'Not Found'}</div>
              </div>
            </div>
          )}
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex-1 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Edit Agent Package
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Update package information and pricing
              </p>
            </div>
            <div></div>
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
                      placeholder="0.00 BDT"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      স্ট্যাটাস
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Draft">Draft</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      এজেন্ট নির্বাচন করুন <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.agentId}
                      onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.agentId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      required
                    >
                      <option value="">এজেন্ট নির্বাচন করুন</option>
                      {agentsData?.data?.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.tradeName} - {agent.ownerName} ({agent.contact})
                        </option>
                      ))}
                    </select>
                    {errors.agentId && (
                      <p className="text-sm text-red-500 mt-1">{errors.agentId}</p>
                    )}
                    {agentsLoading && (
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">এজেন্ট লোড হচ্ছে...</p>
                      </div>
                    )}
                    {!agentsLoading && agentsData?.data?.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">কোন এজেন্ট পাওয়া যায়নি। প্রথমে এজেন্ট যোগ করুন।</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    নোট
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="প্যাকেজ সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                  />
                </div>
              </div>

              {/* Cost Details Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Cost Details
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleSection('costDetails')}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {collapsedSections.costDetails ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    <span>{collapsedSections.costDetails ? 'Show' : 'Hide'}</span>
                  </button>
                </div>

                {!collapsedSections.costDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Air Fare */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Air Fare (SAR)
                      </label>
                      <input
                        type="number"
                        name="airFare"
                        value={costs.airFare}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Makkah Hotels */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Makkah Hotel 1 (SAR)
                      </label>
                      <input
                        type="number"
                        name="makkahHotel1"
                        value={costs.makkahHotel1}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Makkah Hotel 2 (SAR)
                      </label>
                      <input
                        type="number"
                        name="makkahHotel2"
                        value={costs.makkahHotel2}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Makkah Hotel 3 (SAR)
                      </label>
                      <input
                        type="number"
                        name="makkahHotel3"
                        value={costs.makkahHotel3}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Madina Hotels */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Madina Hotel 1 (SAR)
                      </label>
                      <input
                        type="number"
                        name="madinaHotel1"
                        value={costs.madinaHotel1}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Madina Hotel 2 (SAR)
                      </label>
                      <input
                        type="number"
                        name="madinaHotel2"
                        value={costs.madinaHotel2}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Saudi Fees */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Zamzam Water (SAR)
                      </label>
                      <input
                        type="number"
                        name="zamzamWater"
                        value={costs.zamzamWater}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Maktab (SAR)
                      </label>
                      <input
                        type="number"
                        name="maktab"
                        value={costs.maktab}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Visa Fee (SAR)
                      </label>
                      <input
                        type="number"
                        name="visaFee"
                        value={costs.visaFee}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Insurance Fee (SAR)
                      </label>
                      <input
                        type="number"
                        name="insuranceFee"
                        value={costs.insuranceFee}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Electronics Fee (SAR)
                      </label>
                      <input
                        type="number"
                        name="electronicsFee"
                        value={costs.electronicsFee}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ground Service Fee (SAR)
                      </label>
                      <input
                        type="number"
                        name="groundServiceFee"
                        value={costs.groundServiceFee}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Makkah Route (SAR)
                      </label>
                      <input
                        type="number"
                        name="makkahRoute"
                        value={costs.makkahRoute}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Baggage (SAR)
                      </label>
                      <input
                        type="number"
                        name="baggage"
                        value={costs.baggage}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Service Charge (SAR)
                      </label>
                      <input
                        type="number"
                        name="serviceCharge"
                        value={costs.serviceCharge}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monazzem (SAR)
                      </label>
                      <input
                        type="number"
                        name="monazzem"
                        value={costs.monazzem}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Food (SAR)
                      </label>
                      <input
                        type="number"
                        name="food"
                        value={costs.food}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ziyara Fee (SAR)
                      </label>
                      <input
                        type="number"
                        name="ziyaraFee"
                        value={costs.ziyaraFee}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Bangladesh Costs */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ID Card (BDT)
                      </label>
                      <input
                        type="number"
                        name="idCard"
                        value={costs.idCard}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hajj Kollan (BDT)
                      </label>
                      <input
                        type="number"
                        name="hajjKollan"
                        value={costs.hajjKollan}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Train Fee (BDT)
                      </label>
                      <input
                        type="number"
                        name="trainFee"
                        value={costs.trainFee}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hajj Guide (BDT)
                      </label>
                      <input
                        type="number"
                        name="hajjGuide"
                        value={costs.hajjGuide}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Govt Service Charge (BDT)
                      </label>
                      <input
                        type="number"
                        name="govtServiceCharge"
                        value={costs.govtServiceCharge}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        License Fee (BDT)
                      </label>
                      <input
                        type="number"
                        name="licenseFee"
                        value={costs.licenseFee}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Transport Fee (BDT)
                      </label>
                      <input
                        type="number"
                        name="transportFee"
                        value={costs.transportFee}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Other BD Costs (BDT)
                      </label>
                      <input
                        type="number"
                        name="otherBdCosts"
                        value={costs.otherBdCosts}
                        onChange={handleCostChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Discount Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                  Discount
                </h2>
                
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discount Amount (BDT)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Bangladesh Passenger Sections */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Bangladesh Passenger Management
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleSection('bangladeshPortion')}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {collapsedSections.bangladeshPortion ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    <span>{collapsedSections.bangladeshPortion ? 'Show' : 'Hide'}</span>
                  </button>
                </div>

                {!collapsedSections.bangladeshPortion && (
                  <div className="space-y-8">
                    {/* Bangladesh Visa Passengers */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bangladesh Visa Passengers</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const newPassenger = {
                              id: Date.now(),
                              type: 'Adult',
                              count: 0,
                              price: 0
                            };
                            setBangladeshVisaPassengers(prev => [...prev, newPassenger]);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Passenger</span>
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {bangladeshVisaPassengers.map((passenger, index) => (
                          <div key={passenger.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                              <select
                                value={passenger.type}
                                onChange={(e) => handleBangladeshVisaChange(passenger.id, 'type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              >
                                <option value="Adult">Adult</option>
                                <option value="Child">Child</option>
                                <option value="Infant">Infant</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Count</label>
                              <input
                                type="number"
                                value={passenger.count}
                                onChange={(e) => handleBangladeshVisaChange(passenger.id, 'count', parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (BDT)</label>
                              <input
                                type="number"
                                value={passenger.price}
                                onChange={(e) => handleBangladeshVisaChange(passenger.id, 'price', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => removeBangladeshVisaPassenger(passenger.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bangladesh Airfare Passengers */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bangladesh Airfare Passengers</h3>
                        <button
                          type="button"
                          onClick={addBangladeshAirfarePassenger}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Passenger</span>
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {bangladeshAirfarePassengers.map((passenger, index) => (
                          <div key={passenger.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                              <select
                                value={passenger.type}
                                onChange={(e) => handleBangladeshAirfareChange(passenger.id, 'type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              >
                                <option value="Adult">Adult</option>
                                <option value="Child">Child</option>
                                <option value="Infant">Infant</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Count</label>
                              <input
                                type="number"
                                value={passenger.count}
                                onChange={(e) => handleBangladeshAirfareChange(passenger.id, 'count', parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (BDT)</label>
                              <input
                                type="number"
                                value={passenger.price}
                                onChange={(e) => handleBangladeshAirfareChange(passenger.id, 'price', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => removeBangladeshAirfarePassenger(passenger.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bangladesh Bus Passengers */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bangladesh Bus Passengers</h3>
                        <button
                          type="button"
                          onClick={addBangladeshBusPassenger}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Passenger</span>
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {bangladeshBusPassengers.map((passenger, index) => (
                          <div key={passenger.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                              <select
                                value={passenger.type}
                                onChange={(e) => handleBangladeshBusChange(passenger.id, 'type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              >
                                <option value="Adult">Adult</option>
                                <option value="Child">Child</option>
                                <option value="Infant">Infant</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Count</label>
                              <input
                                type="number"
                                value={passenger.count}
                                onChange={(e) => handleBangladeshBusChange(passenger.id, 'count', parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (BDT)</label>
                              <input
                                type="number"
                                value={passenger.price}
                                onChange={(e) => handleBangladeshBusChange(passenger.id, 'price', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => removeBangladeshBusPassenger(passenger.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bangladesh Training/Other Passengers */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bangladesh Training/Other Passengers</h3>
                        <button
                          type="button"
                          onClick={addBangladeshTrainingOtherPassenger}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Passenger</span>
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {bangladeshTrainingOtherPassengers.map((passenger, index) => (
                          <div key={passenger.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                              <select
                                value={passenger.type}
                                onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              >
                                <option value="Adult">Adult</option>
                                <option value="Child">Child</option>
                                <option value="Infant">Infant</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Count</label>
                              <input
                                type="number"
                                value={passenger.count}
                                onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'count', parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (BDT)</label>
                              <input
                                type="number"
                                value={passenger.price}
                                onChange={(e) => handleBangladeshTrainingOtherChange(passenger.id, 'price', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => removeBangladeshTrainingOtherPassenger(passenger.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Debug Information */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Debug Info:</h4>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <div>Package Name: {formData.packageName.trim() ? '✓' : '✗'}</div>
                    <div>Package Year: {formData.packageYear ? '✓' : '✗'}</div>
                    <div>Agent ID: {formData.agentId ? '✓' : '✗'}</div>
                    <div>Has Agents: {hasAgents ? '✓' : '✗'}</div>
                    <div>Is Submitting: {isSubmitting ? '✓' : '✗'}</div>
                    <div>Form Valid: {isFormValid ? '✓' : '✗'}</div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>আপডেট হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>প্যাকেজ আপডেট করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-green-600" />
                Package Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Bangladesh Costs:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(totals.bangladeshCosts)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Saudi Passenger Costs:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(totals.saudiPassengerCosts)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Saudi Costs (BDT):</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(totals.saudiCostsInBDT)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(totals.subtotal)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{formatCurrency(totals.discount)}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(totals.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Passenger Modal */}
      {showPassengerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Passenger
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newPassenger.type}
                  onChange={(e) => handleNewPassengerChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="Adult">Adult</option>
                  <option value="Child">Child</option>
                  <option value="Infant">Infant</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Count
                </label>
                <input
                  type="number"
                  value={newPassenger.count}
                  onChange={(e) => handleNewPassengerChange('count', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={newPassenger.price}
                  onChange={(e) => handleNewPassengerChange('price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closePassengerModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={savePassengerFromModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bangladesh Cost Modal */}
      {showBdCostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Bangladesh Cost - {bdCostModalConfig.label}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (BDT)
              </label>
              <input
                type="number"
                value={newBdCost}
                onChange={(e) => setNewBdCost(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeBdCostModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={saveBdCost}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saudi Cost Modal */}
      {showSaudiCostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Saudi Cost - {saudiCostModalConfig.label}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (SAR)
              </label>
              <input
                type="number"
                value={newSaudiCost}
                onChange={(e) => setNewSaudiCost(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeSaudiCostModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={saveSaudiCost}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentPackageEdit;
