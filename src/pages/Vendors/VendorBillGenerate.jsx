import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Building2, 
  FileText, 
  Plus, 
  Save, 
  Search, 
  Calendar,
  DollarSign,
  Package,
  Receipt,
  Loader2,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Home,
  Plane,
  Building,
  Users,
  TrendingUp,
  TrendingDown,
  Star,
  Heart,
  Tag,
  Folder,
  Box,
  BarChart3,
  Settings,
  Truck,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useVendors, useCustomerTypes, useCreateVendorBill } from '../../hooks/useVendorQueries';
import { useAirTickets, useAirTicket } from '../../hooks/useAirTicketQueries';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import Swal from 'sweetalert2';

// Icon mapping for categories (same as CustomerManagment.jsx)
const iconMap = {
  'home': Home,
  'plane': Plane,
  'building': Building,
  'users': Users,
  'package': Package,
  'dollar': DollarSign,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'star': Star,
  'heart': Heart,
  'tag': Tag,
  'folder': Folder,
  'box': Box,
  'chart': BarChart3,
  'gear': Settings,
  'truck': Truck,
  'megaphone': Megaphone,
  'building2': Building2
};

// Default fallback bill types
const DEFAULT_BILL_TYPES = [
  { value: 'purchase', label: 'Purchase Order', icon: Package, description: 'Create a purchase order for goods/services' },
  { value: 'invoice', label: 'Invoice', icon: Receipt, description: 'Generate an invoice for vendor services' },
  { value: 'payment', label: 'Payment Voucher', icon: DollarSign, description: 'Record a payment to vendor' },
  { value: 'service', label: 'Service Bill', icon: FileText, description: 'Create a service bill' },
  { value: 'expense', label: 'Expense Bill', icon: Receipt, description: 'Record vendor-related expenses' },
  { value: 'air-ticket', label: 'Air Ticket', icon: Plane, description: 'Create air ticket vendor bill' },
  { value: 'others', label: 'Others', icon: FileText, description: 'Create other types of vendor bills' }
];

const VendorBillGenerate = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const axiosSecure = useAxiosSecure();

  // Fetch vendors and categories
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  const { data: categories = [], isLoading: categoriesLoading } = useCustomerTypes();
  const createVendorBillMutation = useCreateVendorBill();

  // Form state
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [showVendorList, setShowVendorList] = useState(false);
  const [billType, setBillType] = useState('');
  const [formData, setFormData] = useState({
    // Common fields
    billDate: new Date().toISOString().split('T')[0],
    billNumber: '',
    description: '',
    amount: '',
    tax: '',
    discount: '',
    totalAmount: '',
    paymentMethod: '',
    paymentStatus: 'pending',
    dueDate: '',
    notes: '',
    // Purchase Order specific
    items: [],
    deliveryDate: '',
    // Invoice specific
    invoiceNumber: '',
    terms: '',
    // Payment specific
    paymentDate: '',
    paymentReference: '',
    bankAccount: '',
    // Service/Expense specific
    category: '',
    serviceDescription: '',
    // Air Ticket specific fields
    tripType: 'oneway',
    flightType: 'domestic',
    bookingId: '',
    gdsPnr: '',
    airlinePnr: '',
    airline: '',
    origin: '',
    destination: '',
    flightDate: '',
    returnDate: '',
    segments: [
      { origin: '', destination: '', date: '' },
      { origin: '', destination: '', date: '' }
    ],
    agent: '',
    purposeType: '',
    adultCount: 0,
    childCount: 0,
    infantCount: 0,
    customerDeal: 0,
    customerPaid: 0,
    customerDue: 0,
    baseFare: 0,
    taxBD: 0,
    e5: 0,
    e7: 0,
    g8: 0,
    ow: 0,
    p7: 0,
    p8: 0,
    ts: 0,
    ut: 0,
    yq: 0,
    taxes: 0,
    totalTaxes: 0,
    ait: 0,
    commissionRate: 0,
    plb: 0,
    salmaAirServiceCharge: 0,
    vendorServiceCharge: 0,
    vendorAmount: 0,
    vendorPaidFh: 0,
    vendorDue: 0,
    profit: 0,
    segmentCount: 1,
    flownSegment: false,
    // Hajj/Umrah specific fields
    packageId: '',
    packageName: '',
    agentId: '',
    agentName: '',
    departureDate: '',
    customerCount: 0,
    // Hajj specific fields
    hajjYear: '',
    reasonForCollection: '',
    amountCollected: 0,
    hajjiCount: 0,
    totalPeople: 0,
    // Hotel specific fields
    hotelName: '',
    hotelLocation: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfNights: 0,
    numberOfRooms: 0,
    roomType: '',
    perNightRate: 0,
    totalRoomCost: 0,
    // Service charges and fees (for Hajj/Umrah/Hotel)
    visaFee: 0,
    serviceCharge: 0,
    groundServiceFee: 0,
    transportFee: 0,
    otherCharges: 0
  });

  const [touched, setTouched] = useState({});
  const vendorDropdownRef = useRef(null);
  const [showTaxes, setShowTaxes] = useState(false);
  
  // Air Ticket Search
  const [ticketSearchId, setTicketSearchId] = useState('');
  const [selectedTicketData, setSelectedTicketData] = useState(null);
  const [searchingTicket, setSearchingTicket] = useState(false);

  // Filter vendors based on search query
  const filteredVendors = useMemo(() => {
    if (!vendorSearchQuery.trim()) return vendors.slice(0, 50);
    const query = vendorSearchQuery.toLowerCase();
    return vendors.filter(v => 
      (v.vendorId || '').toLowerCase().includes(query) ||
      (v.tradeName || '').toLowerCase().includes(query) ||
      (v.ownerName || '').toLowerCase().includes(query) ||
      (v.contactNo || '').toLowerCase().includes(query)
    ).slice(0, 50);
  }, [vendorSearchQuery, vendors]);

  // Transform categories from CustomerManagment to bill types
  const billTypes = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map(cat => {
        const IconComponent = iconMap[cat.icon] || FileText;
        return {
          value: cat.value,
          label: cat.label,
          icon: IconComponent,
          description: `${cat.label} - ${cat.prefix || ''} prefix`,
          prefix: cat.prefix,
          type: cat.type
        };
      });
    }
    // Fallback to default bill types if no categories available
    return DEFAULT_BILL_TYPES;
  }, [categories]);

  // Check if selected bill type is air
  const isAirTicket = useMemo(() => {
    if (!billType) return false;
    const airType = billTypes.find(bt => bt.value === billType);
    return airType && (billType.toLowerCase().includes('air') || billType.toLowerCase().includes('ticket'));
  }, [billType, billTypes]);

  // Check if selected bill type is Hajj
  const isHajj = useMemo(() => {
    if (!billType) return false;
    return billType.toLowerCase().includes('hajj') || billType.toLowerCase().includes('haj');
  }, [billType]);

  // Check if selected bill type is Umrah
  const isUmrah = useMemo(() => {
    if (!billType) return false;
    return billType.toLowerCase().includes('umrah');
  }, [billType]);

  // Check if selected bill type is Hotel
  const isHotel = useMemo(() => {
    if (!billType) return false;
    return billType.toLowerCase().includes('hotel');
  }, [billType]);

  // Combined check for special forms
  const needsSpecialForm = useMemo(() => {
    return isAirTicket || isHajj || isUmrah || isHotel;
  }, [isAirTicket, isHajj, isUmrah, isHotel]);

  // Get selected bill type config
  const selectedBillTypeConfig = useMemo(() => {
    return billTypes.find(bt => bt.value === billType);
  }, [billType, billTypes]);

  // Handle click outside to close vendor dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(event.target)) {
        setShowVendorList(false);
      }
    };

    if (showVendorList) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVendorList]);

  // Calculate total amount (for non-special bills)
  useEffect(() => {
    if (!needsSpecialForm) {
      const amount = parseFloat(formData.amount) || 0;
      const tax = parseFloat(formData.tax) || 0;
      const discount = parseFloat(formData.discount) || 0;
      const total = amount + tax - discount;
      setFormData(prev => ({ ...prev, totalAmount: total > 0 ? total.toFixed(2) : '' }));
    }
  }, [formData.amount, formData.tax, formData.discount, needsSpecialForm]);

  // Hotel Calculations
  useEffect(() => {
    if (isHotel) {
      const nights = parseFloat(formData.numberOfNights) || 0;
      const perNight = parseFloat(formData.perNightRate) || 0;
      const rooms = parseFloat(formData.numberOfRooms) || 0;
      const visaFee = parseFloat(formData.visaFee) || 0;
      const serviceCharge = parseFloat(formData.serviceCharge) || 0;
      const groundServiceFee = parseFloat(formData.groundServiceFee) || 0;
      const transportFee = parseFloat(formData.transportFee) || 0;
      const otherCharges = parseFloat(formData.otherCharges) || 0;

      const totalRoomCost = nights * perNight * rooms;
      const totalAmount = totalRoomCost + visaFee + serviceCharge + groundServiceFee + transportFee + otherCharges;

      setFormData(prev => ({
        ...prev,
        totalRoomCost: Math.max(0, Math.round(totalRoomCost)),
        totalAmount: totalAmount > 0 ? totalAmount.toFixed(2) : '',
        amount: totalAmount > 0 ? totalAmount : prev.amount
      }));
    }
  }, [
    isHotel,
    formData.numberOfNights,
    formData.perNightRate,
    formData.numberOfRooms,
    formData.visaFee,
    formData.serviceCharge,
    formData.groundServiceFee,
    formData.transportFee,
    formData.otherCharges
  ]);

  // Hajj/Umrah Calculations
  useEffect(() => {
    if (isHajj || isUmrah) {
      // For both Hajj and Umrah: Calculate total as জন প্রতি টাকা × সংখ্যা
      const totalPeople = parseFloat(formData.totalPeople) || 0;
      const hajjiCount = parseFloat(formData.hajjiCount) || 0;
      const totalAmount = totalPeople * hajjiCount;

      setFormData(prev => ({
        ...prev,
        totalAmount: totalAmount > 0 ? totalAmount.toFixed(2) : '',
        amount: totalAmount > 0 ? totalAmount : prev.amount
      }));
    }
  }, [
    isHajj,
    isUmrah,
    formData.totalPeople,
    formData.hajjiCount
  ]);

  // Auto-calculate hotel nights from check-in/check-out dates
  useEffect(() => {
    if (isHotel && formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      
      if (checkOut > checkIn) {
        const diffTime = Math.abs(checkOut - checkIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays !== formData.numberOfNights) {
          setFormData(prev => ({ ...prev, numberOfNights: diffDays }));
        }
      }
    }
  }, [isHotel, formData.checkInDate, formData.checkOutDate]);

  // Air Ticket Calculations
  useEffect(() => {
    if (isAirTicket) {
      const toNumber = (v) => Number(v) || 0;
      const baseFare = toNumber(formData.baseFare);
      const taxes = toNumber(formData.taxes);
      const taxBD = toNumber(formData.taxBD);
      const e5 = toNumber(formData.e5);
      const e7 = toNumber(formData.e7);
      const g8 = toNumber(formData.g8);
      const ow = toNumber(formData.ow);
      const p7 = toNumber(formData.p7);
      const p8 = toNumber(formData.p8);
      const ts = toNumber(formData.ts);
      const ut = toNumber(formData.ut);
      const yq = toNumber(formData.yq);
      const commissionRate = toNumber(formData.commissionRate);
      const plb = toNumber(formData.plb);
      const salmaAirServiceCharge = toNumber(formData.salmaAirServiceCharge);
      const vendorServiceCharge = toNumber(formData.vendorServiceCharge);

      const commissionAmount = (baseFare * commissionRate) / 100;
      const totalTaxes = taxes + taxBD + e5 + e7 + g8 + ow + p7 + p8 + ts + ut + yq;
      
      const totalTransactionAmount = baseFare + totalTaxes + salmaAirServiceCharge;
      const penalties = 0;
      const bdUtE5Tax = taxBD + ut + e5;
      const ait = Math.max(0, Math.round((totalTransactionAmount - penalties - bdUtE5Tax) * 0.003));
      
      const vendorAmount = baseFare + totalTaxes + ait + salmaAirServiceCharge + vendorServiceCharge - commissionAmount - plb;
      const customerDeal = toNumber(formData.customerDeal);
      const vendorPaidFh = toNumber(formData.vendorPaidFh);
      const customerPaid = toNumber(formData.customerPaid);

      const vendorDue = Math.max(0, Math.round(vendorAmount - vendorPaidFh));
      const profit = Math.round(customerDeal - vendorAmount);
      const customerDue = Math.max(0, Math.round(customerDeal - customerPaid));

      setFormData(prev => ({
        ...prev,
        ait: ait,
        totalTaxes: Math.max(0, Math.round(totalTaxes)),
        vendorAmount: Math.max(0, Math.round(vendorAmount)),
        vendorDue,
        profit,
        customerDue,
        totalAmount: customerDeal > 0 ? customerDeal.toFixed(2) : prev.totalAmount,
        amount: customerDeal > 0 ? customerDeal : prev.amount
      }));
    }
  }, [
    isAirTicket,
    formData.baseFare,
    formData.taxes,
    formData.taxBD,
    formData.e5,
    formData.e7,
    formData.g8,
    formData.ow,
    formData.p7,
    formData.p8,
    formData.ts,
    formData.ut,
    formData.yq,
    formData.commissionRate,
    formData.plb,
    formData.salmaAirServiceCharge,
    formData.vendorServiceCharge,
    formData.customerDeal,
    formData.vendorPaidFh,
    formData.customerPaid
  ]);

  // Generate bill number using category prefix if available
  useEffect(() => {
    if (billType && !formData.billNumber) {
      const selectedType = billTypes.find(bt => bt.value === billType);
      const prefix = selectedType?.prefix 
        ? selectedType.prefix.toUpperCase() 
        : billType.toUpperCase().substring(0, 3);
      const timestamp = Date.now().toString().slice(-6);
      setFormData(prev => ({ 
        ...prev, 
        billNumber: `${prefix}-${timestamp}`,
        invoiceNumber: billType === 'invoice' ? `INV-${timestamp}` : prev.invoiceNumber
      }));
    }
  }, [billType, billTypes]);

  // Auto-calculate totalAmount for Others bill type
  useEffect(() => {
    if (billType === 'others' && formData.amount) {
      setFormData(prev => ({
        ...prev,
        totalAmount: formData.amount
      }));
    }
  }, [billType, formData.amount]);

  // Validation
  const errors = useMemo(() => {
    const errs = {};
    if (!selectedVendor) errs.vendor = 'Vendor selection is required';
    if (!billType) errs.billType = 'Bill type is required';
    if (!formData.billDate) errs.billDate = 'Bill date is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) errs.amount = 'Valid amount is required';
    if (billType === 'purchase' && !formData.deliveryDate) errs.deliveryDate = 'Delivery date is required';
    if (billType === 'payment' && !formData.paymentDate) errs.paymentDate = 'Payment date is required';
    if (billType === 'payment' && !formData.paymentMethod) errs.paymentMethod = 'Payment method is required';
    if (billType === 'others' && !formData.description) errs.description = 'বিলের ধরণ প্রয়োজন';
    if (billType === 'others' && !formData.totalAmount) errs.totalAmount = 'Total amount is required';
    return errs;
  }, [selectedVendor, billType, formData]);

  const hasError = (field) => touched[field] && errors[field];

  // Handle vendor selection
  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setVendorSearchQuery(vendor.vendorId || vendor._id);
    setShowVendorList(false);
    setTouched(prev => ({ ...prev, vendor: true }));
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Handle segment change for air tickets
  const handleSegmentChange = (index, field, value) => {
    setFormData(prev => {
      const segments = Array.isArray(prev.segments) ? prev.segments : [
        { origin: '', destination: '', date: '' },
        { origin: '', destination: '', date: '' }
      ];
      const updated = [...segments];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, segments: updated };
    });
  };

  const addSegment = () => {
    setFormData(prev => {
      const segments = Array.isArray(prev.segments) ? prev.segments : [
        { origin: '', destination: '', date: '' },
        { origin: '', destination: '', date: '' }
      ];
      return {
        ...prev,
        segments: [...segments, { origin: '', destination: '', date: '' }]
      };
    });
  };

  const removeSegment = (index) => {
    setFormData(prev => {
      const segments = Array.isArray(prev.segments) ? prev.segments : [
        { origin: '', destination: '', date: '' },
        { origin: '', destination: '', date: '' }
      ];
      if (segments.length <= 2) return prev;
      const updated = segments.filter((_, i) => i !== index);
      return { ...prev, segments: updated };
    });
  };

  // Handle Search by Ticket ID
  const handleSearchTicket = async () => {
    if (!ticketSearchId.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'টিকেট আইডি প্রয়োজন',
        text: 'অনুগ্রহ করে একটি টিকেট আইডি লিখুন',
      });
      return;
    }

    setSearchingTicket(true);
    try {
      const response = await axiosSecure.get(`/api/air-ticketing/tickets/${ticketSearchId}`);
      
      if (response.data && response.data.success) {
        const ticket = response.data.data;
        setSelectedTicketData(ticket);
        
        // Auto-fill form data with ticket information
        setFormData(prev => ({
          ...prev,
          bookingId: ticket.bookingId || ticket._id || '',
          gdsPnr: ticket.gdsPnr || '',
          airlinePnr: ticket.airlinePnr || '',
          airline: ticket.airline || '',
          origin: ticket.origin || '',
          destination: ticket.destination || '',
          flightDate: ticket.flightDate ? new Date(ticket.flightDate).toISOString().split('T')[0] : '',
          returnDate: ticket.returnDate ? new Date(ticket.returnDate).toISOString().split('T')[0] : '',
          tripType: ticket.tripType || 'oneway',
          flightType: ticket.flightType || 'domestic',
          adultCount: ticket.adultCount || 0,
          childCount: ticket.childCount || 0,
          infantCount: ticket.infantCount || 0,
          agent: ticket.agent || '',
          purposeType: ticket.purposeType || '',
          vendorAmount: ticket.vendorAmount || ticket.vendorDeal || 0,
          totalAmount: ticket.vendorAmount || ticket.vendorDeal || 0,
        }));
        
        Swal.fire({
          icon: 'success',
          title: 'টিকেট পাওয়া গেছে!',
          text: `টিকেট ${ticket.bookingId || ticket._id} সফলভাবে লোড হয়েছে`,
        });
      } else {
        throw new Error('টিকেট পাওয়া যায়নি');
      }
    } catch (error) {
      console.error('Ticket search error:', error);
      Swal.fire({
        icon: 'error',
        title: 'টিকেট পাওয়া যায়নি',
        text: error.message || 'টিকেট খুঁজে পাওয়া যায়নি। অনুগ্রহ করে আইডি চেক করুন।',
      });
      setSelectedTicketData(null);
    } finally {
      setSearchingTicket(false);
    }
  };

  // Handle bill type change
  const handleBillTypeChange = (type) => {
    setBillType(type);
    setTouched(prev => ({ ...prev, billType: true }));
    // Reset form data except common fields
    setFormData(prev => ({
      billDate: prev.billDate,
      billNumber: '',
      description: '',
      amount: '',
      tax: '',
      discount: '',
      totalAmount: '',
      paymentMethod: '',
      paymentStatus: 'pending',
      dueDate: '',
      notes: '',
      items: [],
      deliveryDate: '',
      invoiceNumber: '',
      terms: '',
      paymentDate: '',
      paymentReference: '',
      bankAccount: '',
      category: '',
      serviceDescription: '',
      // Air Ticket specific fields - reset to defaults
      tripType: 'oneway',
      flightType: 'domestic',
      bookingId: '',
      gdsPnr: '',
      airlinePnr: '',
      airline: '',
      origin: '',
      destination: '',
      flightDate: '',
      returnDate: '',
      segments: [
        { origin: '', destination: '', date: '' },
        { origin: '', destination: '', date: '' }
      ],
      agent: '',
      purposeType: '',
      adultCount: 0,
      childCount: 0,
      infantCount: 0,
      customerDeal: 0,
      customerPaid: 0,
      customerDue: 0,
      baseFare: 0,
      taxBD: 0,
      e5: 0,
      e7: 0,
      g8: 0,
      ow: 0,
      p7: 0,
      p8: 0,
      ts: 0,
      ut: 0,
      yq: 0,
      taxes: 0,
      totalTaxes: 0,
      ait: 0,
      commissionRate: 0,
      plb: 0,
      salmaAirServiceCharge: 0,
      vendorServiceCharge: 0,
      vendorAmount: 0,
      vendorPaidFh: 0,
      vendorDue: 0,
      profit: 0,
      segmentCount: 1,
      flownSegment: false,
      // Reset Hajj/Umrah fields
      packageId: '',
      packageName: '',
      agentId: '',
      agentName: '',
      departureDate: '',
      customerCount: 0,
      // Reset Hajj specific fields
      hajjYear: '',
      reasonForCollection: '',
      amountCollected: 0,
      hajjiCount: 0,
      totalPeople: 0,
      // Reset Hotel fields
      hotelName: '',
      hotelLocation: '',
      checkInDate: '',
      checkOutDate: '',
      numberOfNights: 0,
      numberOfRooms: 0,
      roomType: '',
      perNightRate: 0,
      totalRoomCost: 0,
      // Reset service charges
      visaFee: 0,
      serviceCharge: 0,
      groundServiceFee: 0,
      transportFee: 0,
      otherCharges: 0
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      vendor: true,
      billType: true,
      billDate: true,
      amount: true,
      ...(billType === 'purchase' && { deliveryDate: true }),
      ...(billType === 'payment' && { paymentDate: true, paymentMethod: true })
    });

    // Validate
    if (Object.keys(errors).length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in all required fields correctly.',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }

    // Prepare bill data
    const billData = {
      vendorId: selectedVendor.vendorId || selectedVendor._id,
      vendorName: selectedVendor.tradeName,
      billType,
      ...formData,
      totalAmount: parseFloat(formData.totalAmount) || 0,
      amount: parseFloat(formData.amount) || 0,
      tax: parseFloat(formData.tax) || 0,
      discount: parseFloat(formData.discount) || 0,
      createdBy: userProfile?.email || 'unknown',
      branchId: userProfile?.branchId || 'main_branch',
      createdAt: new Date().toISOString()
    };

    // Send to API using mutation
    createVendorBillMutation.mutate(billData, {
      onSuccess: () => {
        navigate('/vendors');
      }
    });
  };

  // Render form fields based on bill type
  const renderDynamicFields = () => {
    switch (billType) {
      case 'purchase':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Delivery Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  onBlur={() => setTouched(prev => ({ ...prev, deliveryDate: true }))}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    hasError('deliveryDate') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                />
              </div>
              {hasError('deliveryDate') && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Items Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe the items or services..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </>
        );

      case 'invoice':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                placeholder="Auto-generated"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Terms
              </label>
              <select
                name="terms"
                value={formData.terms}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select payment terms</option>
                <option value="net15">Net 15</option>
                <option value="net30">Net 30</option>
                <option value="net45">Net 45</option>
                <option value="net60">Net 60</option>
                <option value="due_on_receipt">Due on Receipt</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Invoice description..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </>
        );

      case 'payment':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleInputChange}
                  onBlur={() => setTouched(prev => ({ ...prev, paymentDate: true }))}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    hasError('paymentDate') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                />
              </div>
              {hasError('paymentDate') && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                onBlur={() => setTouched(prev => ({ ...prev, paymentMethod: true }))}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  hasError('paymentMethod') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                <option value="">Select payment method</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="mobile_banking">Mobile Banking</option>
                <option value="card">Card Payment</option>
              </select>
              {hasError('paymentMethod') && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Reference
              </label>
              <input
                type="text"
                name="paymentReference"
                value={formData.paymentReference}
                onChange={handleInputChange}
                placeholder="Transaction ID, Cheque No, etc."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bank Account (if applicable)
              </label>
              <input
                type="text"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleInputChange}
                placeholder="Bank name and account number"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </>
        );

      case 'service':
      case 'expense':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={categoriesLoading}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat._id} value={cat.value || cat.label}>
                    {cat.label || cat.value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="serviceDescription"
                value={formData.serviceDescription}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe the service or expense..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Render Air Ticket Form (similar to NewTicket.jsx)
  const renderAirTicketForm = () => {
    return (
      <div className="space-y-6">
        {/* Search by Ticket ID */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-purple-600" />
            সার্চ বাই টিকেট আইডি
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={ticketSearchId}
              onChange={(e) => setTicketSearchId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchTicket()}
              placeholder="টিকেট আইডি বা বুকিং আইডি লিখুন..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={searchingTicket}
            />
            <button
              type="button"
              onClick={handleSearchTicket}
              disabled={searchingTicket}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searchingTicket ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  খুঁজছি...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  খুঁজুন
                </>
              )}
            </button>
          </div>
          {selectedTicketData && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300">
                ✓ টিকেট পাওয়া গেছে: <strong>{selectedTicketData.bookingId || selectedTicketData._id}</strong> - 
                Auto GDS PNR: <strong>{selectedTicketData.gdsPnr || 'N/A'}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Booking Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Booking ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bookingId"
                value={formData.bookingId}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Booking reference"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GDS PNR
              </label>
              <input
                type="text"
                name="gdsPnr"
                value={formData.gdsPnr}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="ABC123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Airlines PNR
              </label>
              <input
                type="text"
                name="airlinePnr"
                value={formData.airlinePnr}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="DEF456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Airlines <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="airline"
                value={formData.airline}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Airline name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Route Category
              </label>
              <select
                name="flightType"
                value={formData.flightType}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="domestic">Domestic</option>
                <option value="international">International</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Agent Name / ID
              </label>
              <input
                type="text"
                name="agent"
                value={formData.agent}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Agent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Issued By
              </label>
              <input
                type="text"
                name="purposeType"
                value={formData.purposeType}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter issuer name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adult</label>
              <input
                type="number"
                name="adultCount"
                value={formData.adultCount}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Child</label>
              <input
                type="number"
                name="childCount"
                value={formData.childCount}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Infant</label>
              <input
                type="number"
                name="infantCount"
                value={formData.infantCount}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Flight Specifics */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-purple-600" />
            Flight Specifics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trip Type *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tripType: 'oneway' }))}
                  className={`px-3 py-2 rounded-lg border ${formData.tripType === 'oneway' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                >
                  One Way
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tripType: 'roundtrip' }))}
                  className={`px-3 py-2 rounded-lg border ${formData.tripType === 'roundtrip' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                >
                  Round Trip
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tripType: 'multicity' }))}
                  className={`px-3 py-2 rounded-lg border ${formData.tripType === 'multicity' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                >
                  Multi City
                </button>
              </div>
            </div>
          </div>

          {formData.tripType !== 'multicity' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origin *</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="DAC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination *</label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="DXB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Flight Date *</label>
                <input
                  type="date"
                  name="flightDate"
                  value={formData.flightDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Return Date{formData.tripType === 'roundtrip' ? ' *' : ''}
                </label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Multi City Segments</h4>
                <button
                  type="button"
                  onClick={addSegment}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add Segment
                </button>
              </div>
              {formData.segments?.map((seg, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origin *</label>
                    <input
                      type="text"
                      value={seg.origin}
                      onChange={(e) => handleSegmentChange(idx, 'origin', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="DAC"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination *</label>
                    <input
                      type="text"
                      value={seg.destination}
                      onChange={(e) => handleSegmentChange(idx, 'destination', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="DXB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Flight Date *</label>
                    <input
                      type="date"
                      value={seg.date}
                      onChange={(e) => handleSegmentChange(idx, 'date', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSegment(idx)}
                      disabled={(formData.segments?.length || 0) <= 2}
                      className={`px-3 py-2 rounded-lg border ${((formData.segments?.length || 0) <= 2) ? 'text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed' : 'text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial Details */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            Financial Details
          </h3>

          {/* Customer Finance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Deal</label>
              <input
                type="number"
                name="customerDeal"
                value={formData.customerDeal}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Paid</label>
              <input
                type="number"
                name="customerPaid"
                value={formData.customerPaid}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Due</label>
              <input
                type="number"
                name="customerDue"
                value={formData.customerDue}
                readOnly
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Vendor Amount Breakdown */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Vendor Amount Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Fare</label>
                <input
                  type="number"
                  name="baseFare"
                  value={formData.baseFare}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taxes</label>
                <input
                  type="number"
                  name="taxes"
                  value={formData.taxes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
              </div>
              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={() => setShowTaxes(!showTaxes)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 mt-6"
                >
                  <span>Tax Details</span>
                  {showTaxes ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Tax Fields */}
            {showTaxes && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BD</label>
                  <input type="number" name="taxBD" value={formData.taxBD} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E5</label>
                  <input type="number" name="e5" value={formData.e5} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E7</label>
                  <input type="number" name="e7" value={formData.e7} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">G8</label>
                  <input type="number" name="g8" value={formData.g8} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OW</label>
                  <input type="number" name="ow" value={formData.ow} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">P7</label>
                  <input type="number" name="p7" value={formData.p7} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">P8</label>
                  <input type="number" name="p8" value={formData.p8} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TS</label>
                  <input type="number" name="ts" value={formData.ts} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UT</label>
                  <input type="number" name="ut" value={formData.ut} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YQ</label>
                  <input type="number" name="yq" value={formData.yq} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Taxes</label>
                  <input type="number" name="totalTaxes" value={formData.totalTaxes} readOnly className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AIT</label>
                  <input type="number" name="ait" value={formData.ait} readOnly className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white" placeholder="0" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commission Rate (%)</label>
                <input type="number" name="commissionRate" value={formData.commissionRate} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PLB</label>
                <input type="number" name="plb" value={formData.plb} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salma Air Service Charge</label>
                <input type="number" name="salmaAirServiceCharge" value={formData.salmaAirServiceCharge} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Service Charge</label>
                <input type="number" name="vendorServiceCharge" value={formData.vendorServiceCharge} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0" />
              </div>
            </div>

            {/* Vendor Finance */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Amount</label>
                <input type="number" name="vendorAmount" value={formData.vendorAmount} readOnly className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Paid (FH)</label>
                <input
                  type="number"
                  name="vendorPaidFh"
                  value={formData.vendorPaidFh}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Due</label>
                <input
                  type="number"
                  name="vendorDue"
                  value={formData.vendorDue}
                  readOnly
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profit</label>
                <input
                  type="number"
                  name="profit"
                  value={formData.profit}
                  readOnly
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Hajj/Umrah Form
  const renderHajjUmrahForm = () => {
    // Show simplified form with only 4 fields for both Hajj and Umrah
    const typeLabel = isHajj ? 'Hajj' : 'Umrah';
    const yearFieldLabel = isHajj ? 'Hajj Year' : 'Umrah Year';
    const countFieldLabel = isHajj ? 'হাজী সংখ্যা' : 'উমরাহযাত্রী সংখ্যা';
    const totalDescription = isHajj 
      ? '(জন প্রতি টাকা × হাজী সংখ্যা)' 
      : '(জন প্রতি টাকা × উমরাহযাত্রী সংখ্যা)';
    
    return (
      <div className="space-y-6">
        <Helmet>
          <title>{typeLabel} Form</title>
        </Helmet>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            {typeLabel} Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {yearFieldLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hajjYear"
                value={formData.hajjYear}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 2024, 2025"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                কি বাবদ টাকা জমা হচ্ছে <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reasonForCollection"
                value={formData.reasonForCollection}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="টাকা জমা হওয়ার কারণ লিখুন"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {countFieldLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="hajjiCount"
                value={formData.hajjiCount}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                জন প্রতি টাকা <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 text-sm">৳</span>
                </div>
                <input
                  type="number"
                  name="totalPeople"
                  value={formData.totalPeople}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          
          {/* Calculate and display total amount */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Amount
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 text-sm">৳</span>
                  </div>
                  <input
                    type="text"
                    name="totalAmount"
                    value={(formData.totalPeople * formData.hajjiCount).toFixed(2) || formData.totalAmount}
                    readOnly
                    className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {totalDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Hotel Form
  const renderHotelForm = () => {
    return (
      <div className="space-y-6">
        {/* Hotel Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            Hotel Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hotel Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hotelName"
                value={formData.hotelName}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Hotel Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hotel Location
              </label>
              <input
                type="text"
                name="hotelLocation"
                value={formData.hotelLocation}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Makkah / Madina / Other"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Check-in Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Check-out Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Nights
              </label>
              <input
                type="number"
                name="numberOfNights"
                value={formData.numberOfNights}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Rooms <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="numberOfRooms"
                value={formData.numberOfRooms}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Room Type
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Room Type</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
                <option value="quad">Quad</option>
                <option value="suite">Suite</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rate per Night <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 text-sm">৳</span>
                </div>
                <input
                  type="number"
                  name="perNightRate"
                  value={formData.perNightRate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Room Cost
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 text-sm">৳</span>
                </div>
                <input
                  type="number"
                  name="totalRoomCost"
                  value={formData.totalRoomCost}
                  readOnly
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            Additional Charges
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Visa Fee
              </label>
              <input
                type="number"
                name="visaFee"
                value={formData.visaFee}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Service Charge
              </label>
              <input
                type="number"
                name="serviceCharge"
                value={formData.serviceCharge}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ground Service Fee
              </label>
              <input
                type="number"
                name="groundServiceFee"
                value={formData.groundServiceFee}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transport Fee
              </label>
              <input
                type="number"
                name="transportFee"
                value={formData.transportFee}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Other Charges
              </label>
              <input
                type="number"
                name="otherCharges"
                value={formData.otherCharges}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Amount
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 text-sm">৳</span>
                </div>
                <input
                  type="text"
                  name="totalAmount"
                  value={formData.totalAmount}
                  readOnly
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Others Form
  const renderOthersForm = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Bill Details
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                বিলের ধরণ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  hasError('description') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="বিলের ধরণ লিখুন (যেমন: পরিবহন খরচ, অফিস সরঞ্জাম, ইত্যাদি)"
              />
              {hasError('description') && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                পরিমাণ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 text-sm">৳</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  onBlur={() => setTouched(prev => ({ ...prev, amount: true }))}
                  min="0"
                  step="0.01"
                  className={`w-full pl-7 pr-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    hasError('amount') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {hasError('amount') && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                বিস্তারিত নোট
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="বিলের বিস্তারিত বিবরণ লিখুন..."
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 text-sm">৳</span>
                </div>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount || formData.amount}
                  onChange={handleInputChange}
                  onBlur={() => setTouched(prev => ({ ...prev, totalAmount: true }))}
                  min="0"
                  step="0.01"
                  className={`w-full pl-7 pr-3 py-3 rounded-lg border-2 bg-purple-50 dark:bg-purple-900/20 text-gray-900 dark:text-gray-100 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    hasError('totalAmount') ? 'border-red-500' : 'border-purple-300 dark:border-purple-700'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {hasError('totalAmount') && (
                <p className="mt-1 text-sm text-red-600">{errors.totalAmount}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                মোট বিল পরিমাণ
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Vendor Bill Generate
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Create and generate vendor bills</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/vendors')}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Main Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Vendor Selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              Step 1: Select Vendor
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vendor <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={vendorDropdownRef}>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={selectedVendor ? (selectedVendor.vendorId || selectedVendor._id) : vendorSearchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVendorSearchQuery(val);
                    setShowVendorList(true);
                    if (val === '') {
                      setSelectedVendor(null);
                    }
                    setTouched(prev => ({ ...prev, vendor: true }));
                  }}
                  onFocus={() => setShowVendorList(true)}
                  placeholder="Search vendor by ID, name, or contact..."
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    hasError('vendor') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                />
                {vendorsLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  </div>
                )}
                
                {showVendorList && !vendorsLoading && (
                  <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredVendors.length > 0 ? (
                      filteredVendors.map((vendor) => (
                        <button
                          type="button"
                          key={vendor._id || vendor.vendorId}
                          onClick={() => handleVendorSelect(vendor)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                            selectedVendor?._id === vendor._id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {vendor.vendorId || vendor._id}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {vendor.tradeName} • {vendor.ownerName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {vendor.tradeLocation} • {vendor.contactNo}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        No vendors found
                      </div>
                    )}
                  </div>
                )}
              </div>
              {hasError('vendor') && (
                <p className="mt-1 text-sm text-red-600">{errors.vendor}</p>
              )}
              {selectedVendor && (
                <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                    Selected: {selectedVendor.tradeName}
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {selectedVendor.ownerName} • {selectedVendor.contactNo}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Bill Type Selection */}
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Step 2: Select Bill Type
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bill Type <span className="text-red-500">*</span>
              </label>
              {categoriesLoading ? (
                <div className="flex items-center py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading bill types...</span>
                </div>
              ) : (
                <select
                  name="billType"
                  value={billType}
                  onChange={(e) => handleBillTypeChange(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, billType: true }))}
                  className={`w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    hasError('billType') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <option value="">Select Bill Type</option>
                  {billTypes.length > 0 ? (
                    billTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} {type.prefix ? `(${type.prefix})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No bill types available</option>
                  )}
                </select>
              )}
              {hasError('billType') && (
                <p className="mt-1 text-sm text-red-600">{errors.billType}</p>
              )}
            </div>
          </div>

          {/* Step 3: Form Fields */}
          {billType && (
            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                Step 3: Fill Bill Details
              </h2>

              {/* Show Special Forms based on bill type */}
              {isAirTicket ? (
                renderAirTicketForm()
              ) : isHajj || isUmrah ? (
                renderHajjUmrahForm()
              ) : isHotel ? (
                renderHotelForm()
              ) : billType === 'others' ? (
                renderOthersForm()
              ) : (
                <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Common Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bill Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="billDate"
                      value={formData.billDate}
                      onChange={handleInputChange}
                      onBlur={() => setTouched(prev => ({ ...prev, billDate: true }))}
                      className={`w-full pl-10 pr-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        hasError('billDate') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      }`}
                    />
                  </div>
                  {hasError('billDate') && (
                    <p className="mt-1 text-sm text-red-600">{errors.billDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bill Number
                  </label>
                  <input
                    type="text"
                    name="billNumber"
                    value={formData.billNumber}
                    onChange={handleInputChange}
                    placeholder="Auto-generated"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 text-sm">৳</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      onBlur={() => setTouched(prev => ({ ...prev, amount: true }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full pl-7 pr-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        hasError('amount') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      }`}
                    />
                  </div>
                  {hasError('amount') && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tax
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 text-sm">৳</span>
                    </div>
                    <input
                      type="number"
                      name="tax"
                      value={formData.tax}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 text-sm">৳</span>
                    </div>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Amount
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 text-sm">৳</span>
                    </div>
                    <input
                      type="text"
                      name="totalAmount"
                      value={formData.totalAmount}
                      readOnly
                      className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
                    />
                  </div>
                </div>

                {billType !== 'payment' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Payment Method
                      </label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select payment method</option>
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                        <option value="mobile_banking">Mobile Banking</option>
                        <option value="card">Card Payment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Payment Status
                      </label>
                      <select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Due Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Dynamic Fields Based on Bill Type */}
                {renderDynamicFields()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Additional notes or comments..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              </>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/vendors')}
              className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createVendorBillMutation.isPending || !selectedVendor || !billType}
              className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {createVendorBillMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Generate Bill
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorBillGenerate;

