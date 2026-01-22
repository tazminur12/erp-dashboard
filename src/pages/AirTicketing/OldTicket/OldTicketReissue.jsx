import React, { useMemo, useState, useEffect } from 'react';
import { Search, X, Plane, DollarSign, ChevronRight, CheckCircle, User, Building2, CreditCard, Receipt, ArrowLeft, Loader2, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import useAirCustomersQueries from '../../../hooks/useAirCustomersQueries';
import { useVendors, useVendor, useVendorBillsByVendor } from '../../../hooks/useVendorQueries';
import { useEmployees } from '../../../hooks/useHRQueries';
import useAirlineQueries from '../../../hooks/useAirlineQueries';
import useOldTicketReissueQueries from '../../../hooks/useOldTicketReissueQueries';
import Swal from 'sweetalert2';

export default function OldTicketReissue() {
  const navigate = useNavigate();
  const { useSearchAirCustomers, useAirCustomers } = useAirCustomersQueries();
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({ status: 'active', limit: 1000 });
  const employees = employeesData?.employees || [];
  const { useAirlines } = useAirlineQueries();
  const { useCreateOldTicketReissue } = useOldTicketReissueQueries();
  const createMutation = useCreateOldTicketReissue();
  
  // Initialize form values state first
  const [formValues, setFormValues] = useState({
    formDate: new Date().toISOString().split('T')[0],
    firstName: '',
    lastName: '',
    travellingCountry: '',
    passportNo: '',
    contactNo: '',
    isWhatsAppSame: true,
    whatsAppNo: '',
    airlineName: '',
    origin: '',
    destination: '',
    airlinesPnr: '',
    oldDate: '',
    newDate: '',
    reissueVendorId: '',
    reissueVendorName: '',
    vendorAmount: '',
    totalContractAmount: '',
    issuingAgentName: '',
    issuingAgentContact: '',
    agentEmail: '',
    reservationOfficerId: ''
  });
  
  // Step-by-step navigation
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // Fetch selected vendor details (after formValues is declared)
  const { data: selectedVendor, isLoading: vendorLoading } = useVendor(
    formValues.reissueVendorId || null
  );
  
  // Fetch vendor bills (after formValues is declared)
  const { data: vendorBills = [], isLoading: billsLoading } = useVendorBillsByVendor(
    formValues.reissueVendorId || null,
    { limit: 10 }
  );
  
  // Fetch airlines from database (without status filter to get all airlines)
  const { data: airlinesData, isLoading: airlinesLoading } = useAirlines({ 
    limit: 100
  });

  // Airlines list from database
  const airlinesList = useMemo(() => {
    if (!airlinesData?.airlines || airlinesData.airlines.length === 0) {
      
      return [];
    }
    
    console.log('Raw Airlines data:', airlinesData.airlines);
    
    const names = airlinesData.airlines
      // Filter only active airlines
      .filter(airline => {
        const isActive = airline.status === 'Active' || airline.status === 'active' || airline.isActive === true;
        return isActive;
      })
      // Extract airline names
      .map(airline => {
        // Try different property names for airline name
        const name = airline.name || airline.airlineName || airline.airline_name || airline.companyName || airline.tradeName;
        console.log('Extracting name from airline:', airline, '=> Name:', name);
        return name;
      })
      .filter(Boolean) // Remove null/undefined
      .sort(); // Sort alphabetically
    
    console.log('Final processed airline names:', names);
    return names;
  }, [airlinesData]);

  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');
  
  // Passenger search states
  const [passengerSearchTerm, setPassengerSearchTerm] = useState('');
  const [showPassengerList, setShowPassengerList] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  // Airline search states
  const [airlineSearchTerm, setAirlineSearchTerm] = useState('');
  const [showAirlineList, setShowAirlineList] = useState(false);
  const [filteredAirlines, setFilteredAirlines] = useState([]);

  // Vendor search states
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [showVendorList, setShowVendorList] = useState(false);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendorData, setSelectedVendorData] = useState(null);

  // Search passengers
  const { data: searchedPassengers = [], isLoading: searchingPassengers } = useSearchAirCustomers(
    passengerSearchTerm,
    { enabled: passengerSearchTerm.length > 1, limit: 10 }
  );
  
  // Fetch recent passengers for suggestions (when no search term)
  const { data: recentPassengersData, isLoading: loadingRecentPassengers } = useAirCustomers({
    page: 1,
    limit: 10,
    isActive: 'true'
  });
  const recentPassengers = recentPassengersData?.customers || [];

  // Filter airlines based on search
  useEffect(() => {
    if (airlineSearchTerm) {
      const filtered = airlinesList.filter(airline =>
        airline.toLowerCase().includes(airlineSearchTerm.toLowerCase())
      );
      setFilteredAirlines(filtered);
    } else {
      setFilteredAirlines(airlinesList);
    }
  }, [airlineSearchTerm, airlinesList]);

  // Filter vendors based on search
  useEffect(() => {
    if (vendors && vendorSearchTerm) {
      const filtered = vendors.filter(vendor =>
        (vendor.tradeName?.toLowerCase().includes(vendorSearchTerm.toLowerCase())) ||
        (vendor.ownerName?.toLowerCase().includes(vendorSearchTerm.toLowerCase())) ||
        (vendor.vendorId?.toLowerCase().includes(vendorSearchTerm.toLowerCase()))
      );
      setFilteredVendors(filtered);
    } else if (vendors) {
      setFilteredVendors(vendors);
    }
  }, [vendorSearchTerm, vendors]);

  // Calculate profit automatically
  const profit = useMemo(() => {
    const total = parseFloat(formValues.totalContractAmount) || 0;
    const vendorAmt = parseFloat(formValues.vendorAmount) || 0;
    return total - vendorAmt;
  }, [formValues.totalContractAmount, formValues.vendorAmount]);

  function updateValue(field, value) {
    setFormValues(prev => ({ ...prev, [field]: value }));
  }

  function handlePassengerSelect(passenger) {
    setSelectedPassenger(passenger);
    setPassengerSearchTerm(`${passenger.firstName} ${passenger.lastName}`);
    setFormValues(prev => ({
      ...prev,
      firstName: passenger.firstName || '',
      lastName: passenger.lastName || '',
      passportNo: passenger.passportNumber || '',
      contactNo: passenger.contactNumber || '',
      travellingCountry: passenger.travellingCountry || prev.travellingCountry
    }));
    setShowPassengerList(false);
  }

  function handleAirlineSelect(airline) {
    setAirlineSearchTerm(airline);
    updateValue('airlineName', airline);
    setShowAirlineList(false);
  }

  function handleVendorSelect(vendor) {
    const vendorId = vendor._id || vendor.vendorId;
    setVendorSearchTerm(vendor.tradeName || vendor.ownerName);
    updateValue('reissueVendorId', vendorId);
    updateValue('reissueVendorName', vendor.tradeName || vendor.ownerName);
    setSelectedVendorData(vendor);
    setShowVendorList(false);
  }
  
  // Step navigation functions
  const goToStep = (step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };
  
  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };
  
  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Passenger Information
        if (!formValues.firstName || !formValues.lastName || !formValues.travellingCountry || 
            !formValues.passportNo || !formValues.contactNo) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'অনুগ্রহ করে যাত্রীর সব আবশ্যক তথ্য দিন',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
          return false;
        }
        return true;
      case 2: // Flight Information
        if (!formValues.airlineName || !formValues.origin || !formValues.destination || 
            !formValues.airlinesPnr || !formValues.oldDate || !formValues.newDate) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'অনুগ্রহ করে সব ফ্লাইট তথ্য দিন',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
          return false;
        }
        return true;
      case 3: // Vendor Selection
        if (!formValues.reissueVendorId) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'অনুগ্রহ করে রিইস্যু ভেন্ডর নির্বাচন করুন',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
          return false;
        }
        return true;
      case 4: // Financial Details
        if (!formValues.vendorAmount || !formValues.totalContractAmount) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'অনুগ্রহ করে ভেন্ডর এমাউন্ট এবং মোট কন্ট্রাক্ট এমাউন্ট দিন',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
          return false;
        }
        return true;
      case 5: // Agent & Officer
        if (!formValues.issuingAgentName || !formValues.issuingAgentContact || 
            !formValues.reservationOfficerId) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'অনুগ্রহ করে ইস্যুকারী এজেন্ট এবং রিজার্ভেশন অফিসার নির্বাচন করুন',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
          return false;
        }
        if (formValues.agentEmail && !validateEmail(formValues.agentEmail)) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'সঠিক ইমেইল ঠিকানা দিন',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };
  
  // Step definitions
  const steps = [
    { number: 1, title: 'যাত্রী তথ্য', description: 'Passenger Information' },
    { number: 2, title: 'ফ্লাইট তথ্য', description: 'Flight Information' },
    { number: 3, title: 'ভেন্ডর নির্বাচন', description: 'Vendor Selection' },
    { number: 4, title: 'আর্থিক বিবরণ', description: 'Financial Details' },
    { number: 5, title: 'এজেন্ট ও অফিসার', description: 'Agent & Officer' }
  ];
  
  const getStepColor = (step, isActive, isCompleted) => {
    if (isCompleted) {
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-400',
        circle: 'bg-green-600 dark:bg-green-500'
      };
    }
    if (isActive) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-400',
        circle: 'bg-blue-600 dark:bg-blue-500'
      };
    }
    return {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-500 dark:text-gray-400',
      circle: 'bg-gray-400 dark:bg-gray-600'
    };
  };

  function validateEmail(email) {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    // Final validation
    if (!validateCurrentStep()) {
      return;
    }

    setSubmitting(true);

    // Get reservation officer name
    const selectedOfficer = employees.find(emp => {
      const empId = emp._id || emp.id || emp.employeeId;
      return empId === formValues.reservationOfficerId;
    });
    const reservationOfficerName = selectedOfficer 
      ? (selectedOfficer.fullName || selectedOfficer.name || 
         `${selectedOfficer.firstName || ''} ${selectedOfficer.lastName || ''}`.trim() || 
         selectedOfficer.employeeId || '')
      : '';

    // Prepare payload
    const payload = {
      customerId: selectedPassenger?._id || null,
      formDate: formValues.formDate,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      travellingCountry: formValues.travellingCountry,
      passportNo: formValues.passportNo,
      contactNo: formValues.contactNo,
      isWhatsAppSame: formValues.isWhatsAppSame,
      whatsAppNo: formValues.isWhatsAppSame ? formValues.contactNo : formValues.whatsAppNo,
      airlineName: formValues.airlineName,
      origin: formValues.origin,
      destination: formValues.destination,
      airlinesPnr: formValues.airlinesPnr,
      oldDate: formValues.oldDate,
      newDate: formValues.newDate,
      reissueVendorId: formValues.reissueVendorId,
      reissueVendorName: formValues.reissueVendorName,
      vendorAmount: parseFloat(formValues.vendorAmount) || 0,
      totalContractAmount: parseFloat(formValues.totalContractAmount) || 0,
      issuingAgentName: formValues.issuingAgentName,
      issuingAgentContact: formValues.issuingAgentContact,
      agentEmail: formValues.agentEmail,
      reservationOfficerId: formValues.reservationOfficerId,
      reservationOfficerName: reservationOfficerName,
      notes: ''
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setSubmitting(false);
        Swal.fire({
          title: 'সফল!',
          text: 'পুরাতন টিকেট রিইস্যু সফলভাবে তৈরি হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        });
        // Reset form
        handleReset();
        setCurrentStep(1);
      },
      onError: (error) => {
        setSubmitting(false);
        Swal.fire({
          title: 'ত্রুটি!',
          text: error.message || 'পুরাতন টিকেট রিইস্যু তৈরি করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      }
    });
  }

  function handleReset() {
    setFormValues({
      formDate: new Date().toISOString().split('T')[0],
      firstName: '',
      lastName: '',
      travellingCountry: '',
      passportNo: '',
      contactNo: '',
      isWhatsAppSame: true,
      whatsAppNo: '',
      airlineName: '',
      origin: '',
      destination: '',
      airlinesPnr: '',
      oldDate: '',
      newDate: '',
      reissueVendorId: '',
      reissueVendorName: '',
      vendorAmount: '',
      totalContractAmount: '',
      issuingAgentName: '',
      issuingAgentContact: '',
      agentEmail: '',
      reservationOfficerId: ''
    });
    setSubmittedMessage('');
    setSelectedPassenger(null);
    setPassengerSearchTerm('');
    setAirlineSearchTerm('');
    setVendorSearchTerm('');
    setSelectedVendorData(null);
    setCurrentStep(1);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Helmet>
        <title>পুরাতন টিকেট রিইস্যু - Old Ticket Reissue</title>
        <meta name="description" content="Create old ticket reissue request" />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/air-ticketing/old/ticket-reissue')}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Plane className="w-8 h-8 text-blue-600" />
                  পুরাতন টিকেট রিইস্যু
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Step-by-Step পুরাতন টিকেট রিইস্যু প্রক্রিয়া</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const stepColor = getStepColor(step.number, isActive, isCompleted);
              
              return (
                <div key={step.number} className="flex items-center min-w-0">
                  <button
                    onClick={() => goToStep(step.number)}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${stepColor.bg} ${stepColor.text} ${currentStep >= step.number ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${stepColor.circle} text-white`}>
                      {isCompleted ? <CheckCircle className="w-3 h-3" /> : step.number}
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-sm font-semibold">{step.title}</div>
                      <div className="text-xs opacity-75">{step.description}</div>
                    </div>
                  </button>
                  {index < steps.length - 1 && (
                    <ChevronRight className={`w-4 h-4 mx-1 transition-colors duration-300 ${
                      isCompleted ? 'text-green-500' : 'text-gray-400'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} onReset={handleReset} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          {/* Step 1: Passenger Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">যাত্রী তথ্য</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date (Auto) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">তারিখ (স্বয়ংক্রিয়)</label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.formDate}
              readOnly
            />
          </div>

          {/* Passenger Search */}
          <div className="md:col-span-2 lg:col-span-1 relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">যাত্রী অনুসন্ধান</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="নাম, পাসপোর্ট, যোগাযোগ দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={passengerSearchTerm}
                onChange={(e) => {
                  setPassengerSearchTerm(e.target.value);
                  setShowPassengerList(true);
                }}
                onFocus={() => setShowPassengerList(true)}
              />
              {passengerSearchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setPassengerSearchTerm('');
                    setSelectedPassenger(null);
                    setShowPassengerList(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            {showPassengerList && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {passengerSearchTerm.length > 1 ? (
                  searchingPassengers ? (
                    <div className="p-3 text-center text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                      খোঁজা হচ্ছে...
                    </div>
                  ) : searchedPassengers.length > 0 ? (
                    <>
                      {searchedPassengers.map((passenger) => (
                        <button
                          key={passenger._id || passenger.id || passenger.customerId}
                          type="button"
                          onClick={() => handlePassengerSelect(passenger)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {passenger.firstName || passenger.name?.split(' ')[0] || ''} {passenger.lastName || passenger.name?.split(' ').slice(1).join(' ') || ''}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {passenger.passportNumber || passenger.passport || ''} • {passenger.contactNumber || passenger.mobile || passenger.phone || ''}
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="p-3 text-center text-sm text-gray-500">কোন যাত্রী পাওয়া যায়নি</div>
                  )
                ) : (
                  loadingRecentPassengers ? (
                    <div className="p-3 text-center text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                      লোড হচ্ছে...
                    </div>
                  ) : recentPassengers.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      {recentPassengers.slice(0, 10).map((passenger) => {
                        const firstName = passenger.firstName || passenger.name?.split(' ')[0] || '';
                        const lastName = passenger.lastName || passenger.name?.split(' ').slice(1).join(' ') || '';
                        const fullName = passenger.name || `${firstName} ${lastName}`.trim() || 'N/A';
                        return (
                          <button
                            key={passenger._id || passenger.id || passenger.customerId}
                            type="button"
                            onClick={() => handlePassengerSelect(passenger)}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                          >
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {fullName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {passenger.passportNumber || passenger.passport || ''} • {passenger.contactNumber || passenger.mobile || passenger.phone || ''}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">যাত্রীর প্রথম নাম</label>
            <input
              type="text"
              placeholder="যেমনঃ Rahim"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.firstName}
              onChange={e => updateValue('firstName', e.target.value)}
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">যাত্রীর শেষ নাম</label>
            <input
              type="text"
              placeholder="যেমনঃ Uddin"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.lastName}
              onChange={e => updateValue('lastName', e.target.value)}
              required
            />
          </div>

          {/* Travelling Country */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ভ্রমণের দেশ</label>
            <input
              type="text"
              placeholder="e.g. Saudi Arabia"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.travellingCountry}
              onChange={e => updateValue('travellingCountry', e.target.value)}
              required
            />
          </div>

          {/* Passport No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">পাসপোর্ট নম্বর</label>
            <input
              type="text"
              placeholder="যেমনঃ BN0123456"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
              value={formValues.passportNo}
              onChange={e => updateValue('passportNo', e.target.value)}
              required
            />
          </div>

          {/* Contact No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">যোগাযোগ নম্বর</label>
            <input
              type="tel"
              placeholder="যেমনঃ +8801XXXXXXXXX"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
              style={{ fontFamily: "'Google Sans', sans-serif" }}
              value={formValues.contactNo}
              onChange={e => updateValue('contactNo', e.target.value)}
              required
            />
          </div>

          {/* WhatsApp same toggle */}
          <div className="flex items-center gap-3">
            <input
              id="waSame"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formValues.isWhatsAppSame}
              onChange={e => updateValue('isWhatsAppSame', e.target.checked)}
            />
            <label htmlFor="waSame" className="text-sm text-gray-700 dark:text-gray-200">WhatsApp যোগাযোগ নম্বরের মতো</label>
          </div>

          {/* WhatsApp No (conditional) */}
          {!formValues.isWhatsAppSame && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">WhatsApp নম্বর</label>
              <input
                type="tel"
                placeholder="যেমনঃ +8801XXXXXXXXX"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
                value={formValues.whatsAppNo}
                onChange={e => updateValue('whatsAppNo', e.target.value)}
                required={!formValues.isWhatsAppSame}
              />
            </div>
          )}

              </div>
            </div>
          )}

          {/* Step 2: Flight Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Plane className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">ফ্লাইট তথ্য</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Airlines Name (Searchable) */}
                <div className="relative">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    <Plane className="w-4 h-4" />
                    এয়ারলাইন্সের নাম
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="এয়ারলাইন খুঁজুন..."
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={airlineSearchTerm || formValues.airlineName}
                      onChange={(e) => {
                        setAirlineSearchTerm(e.target.value);
                        updateValue('airlineName', e.target.value);
                        setShowAirlineList(true);
                      }}
                      onFocus={() => setShowAirlineList(true)}
                      required
                    />
                    {airlineSearchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setAirlineSearchTerm('');
                          updateValue('airlineName', '');
                          setShowAirlineList(false);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                  
                  {showAirlineList && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {airlinesLoading ? (
                        <div className="p-3 text-center text-sm text-gray-500">এয়ারলাইন লোড হচ্ছে...</div>
                      ) : filteredAirlines.length > 0 ? (
                        filteredAirlines.map((airline, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAirlineSelect(airline)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm"
                          >
                            {airline}
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-sm text-gray-500">
                          {airlinesList.length === 0 
                            ? 'ডাটাবেসে কোন এয়ারলাইন নেই। Airline List page থেকে এয়ারলাইন যোগ করুন।' 
                            : 'আপনার অনুসন্ধানের সাথে কোন এয়ারলাইন মিলেনি।'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Origin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">উৎপত্তি</label>
                  <input
                    type="text"
                    placeholder="যেমনঃ DAC"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={formValues.origin}
                    onChange={e => updateValue('origin', e.target.value)}
                    required
                  />
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">গন্তব্য</label>
                  <input
                    type="text"
                    placeholder="যেমনঃ RUH"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={formValues.destination}
                    onChange={e => updateValue('destination', e.target.value)}
                    required
                  />
                </div>

                {/* Airlines PNR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">এয়ারলাইন্স PNR</label>
                  <input
                    type="text"
                    placeholder="যেমনঃ ABC123"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={formValues.airlinesPnr}
                    onChange={e => updateValue('airlinesPnr', e.target.value)}
                    required
                  />
                </div>

                {/* Old Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">পুরাতন তারিখ</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.oldDate}
                    onChange={e => updateValue('oldDate', e.target.value)}
                    required
                  />
                </div>

                {/* New Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">নতুন তারিখ</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.newDate}
                    onChange={e => updateValue('newDate', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Vendor Selection with Profile & Bills */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">ভেন্ডর নির্বাচন</h2>
              </div>
              
              <div className="space-y-6">
                {/* Vendor Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    রিইস্যু ভেন্ডর <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ভেন্ডর খুঁজুন... (ব্যবসায়িক নাম, মালিকের নাম, ভেন্ডর ID)"
                      className="w-full pl-10 pr-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={vendorSearchTerm}
                      onChange={(e) => {
                        setVendorSearchTerm(e.target.value);
                        setShowVendorList(true);
                      }}
                      onFocus={() => setShowVendorList(true)}
                      required
                    />
                    {vendorSearchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setVendorSearchTerm('');
                          updateValue('reissueVendorId', '');
                          updateValue('reissueVendorName', '');
                          setSelectedVendorData(null);
                          setShowVendorList(false);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                  
                  {showVendorList && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {vendorsLoading ? (
                        <div className="p-3 text-center text-sm text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                          লোড হচ্ছে...
                        </div>
                      ) : vendorSearchTerm ? (
                        filteredVendors.length > 0 ? (
                          filteredVendors.map((vendor) => (
                            <button
                              key={vendor._id}
                              type="button"
                              onClick={() => handleVendorSelect(vendor)}
                              className="w-full text-left px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {vendor.logo ? (
                                  <img src={vendor.logo} alt={vendor.tradeName} className="w-8 h-8 rounded object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-purple-600" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {vendor.tradeName || vendor.ownerName}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {vendor.vendorId} • {vendor.contactNo}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-sm text-gray-500">কোন ভেন্ডর পাওয়া যায়নি</div>
                        )
                      ) : (
                        filteredVendors.length > 0 ? (
                          <div className="max-h-40 overflow-y-auto">
                            {filteredVendors.slice(0, 10).map((vendor) => (
                              <button
                                key={vendor._id}
                                type="button"
                                onClick={() => handleVendorSelect(vendor)}
                                className="w-full text-left px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {vendor.logo ? (
                                    <img src={vendor.logo} alt={vendor.tradeName} className="w-8 h-8 rounded object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                      <Building2 className="w-4 h-4 text-purple-600" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {vendor.tradeName || vendor.ownerName}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {vendor.vendorId} • {vendor.contactNo}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-sm text-gray-500">কোন ভেন্ডর পাওয়া যায়নি</div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Vendor Profile & Bills */}
                {formValues.reissueVendorId && (selectedVendor || vendorLoading) && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    {vendorLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        <span className="ml-2 text-gray-600 dark:text-gray-400">ভেন্ডর তথ্য লোড হচ্ছে...</span>
                      </div>
                    ) : selectedVendor ? (
                      <>
                        {/* Vendor Profile */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-purple-600" />
                            ভেন্ডর প্রোফাইল
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ব্যবসায়িক নাম</label>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedVendor.tradeName || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">মালিকের নাম</label>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedVendor.ownerName || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">যোগাযোগ</label>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {selectedVendor.contactNo || 'N/A'}
                              </p>
                            </div>
                            {selectedVendor.email && (
                              <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ইমেইল</label>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {selectedVendor.email}
                                </p>
                              </div>
                            )}
                            {selectedVendor.tradeLocation && (
                              <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ঠিকানা</label>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {selectedVendor.tradeLocation}
                                </p>
                              </div>
                            )}
                            <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ভেন্ডর ID</label>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedVendor.vendorId || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Vendor Bills */}
                        {billsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <span className="ml-2 text-gray-600 dark:text-gray-400">বিল লোড হচ্ছে...</span>
                          </div>
                        ) : vendorBills.length > 0 ? (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <Receipt className="w-5 h-5 text-purple-600" />
                              ভেন্ডর বিল ({vendorBills.length})
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {vendorBills.map((bill) => (
                                <div
                                  key={bill._id || bill.billId}
                                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {bill.billNumber || `Bill #${bill._id || bill.billId}`}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {bill.billType || 'N/A'} • {bill.billDate ? new Date(bill.billDate).toLocaleDateString('bn-BD') : 'N/A'}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        ৳{(bill.totalAmount || 0).toLocaleString('bn-BD')}
                                      </p>
                                      <p className={`text-xs ${
                                        bill.paymentStatus === 'paid' 
                                          ? 'text-green-600 dark:text-green-400' 
                                          : bill.paymentStatus === 'partial'
                                          ? 'text-yellow-600 dark:text-yellow-400'
                                          : 'text-red-600 dark:text-red-400'
                                      }`}>
                                        {bill.paymentStatus === 'paid' ? 'পেইড' : bill.paymentStatus === 'partial' ? 'আংশিক' : 'বাকি'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">এই ভেন্ডরের কোন বিল নেই</p>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Financial Details */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">আর্থিক বিবরণ</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Vendor Amount */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    <DollarSign className="w-4 h-4" />
                    ভেন্ডর এমাউন্ট <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>৳</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-7 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 font-english"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                      value={formValues.vendorAmount}
                      onChange={e => updateValue('vendorAmount', e.target.value)}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">ভেন্ডরকে প্রদত্ত এমাউন্ট</p>
                </div>

                {/* Total Contract Amount */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    <DollarSign className="w-4 h-4" />
                    মোট কন্ট্রাক্ট এমাউন্ট <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>৳</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-7 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 font-english"
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                      value={formValues.totalContractAmount}
                      onChange={e => updateValue('totalContractAmount', e.target.value)}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">কাস্টমারকে বিল করা এমাউন্ট</p>
                </div>

                {/* Profit (Calculated) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">লাভ</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>৳</span>
                    <input
                      type="text"
                      className={`w-full pl-7 rounded-md border-2 px-3 py-2 font-semibold font-english ${
                        profit >= 0 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                          : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      }`}
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                      value={profit.toFixed(2)}
                      readOnly
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">স্বয়ংক্রিয় হিসাব: মোট - ভেন্ডর এমাউন্ট</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Agent & Officer */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">এজেন্ট ও অফিসার তথ্য</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Issuing Agent Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    ইস্যুকারী এজেন্টের নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Agent full name"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.issuingAgentName}
                    onChange={e => updateValue('issuingAgentName', e.target.value)}
                    required
                  />
                </div>

                {/* Issuing Agent Contact No */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    ইস্যুকারী এজেন্ট যোগাযোগ নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="যেমনঃ +8801XXXXXXXXX"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={formValues.issuingAgentContact}
                    onChange={e => updateValue('issuingAgentContact', e.target.value)}
                    required
                  />
                </div>

                {/* Agent Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    এজেন্ট ইমেইল
                  </label>
                  <input
                    type="email"
                    placeholder="agent@example.com"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                    style={{ fontFamily: "'Google Sans', sans-serif" }}
                    value={formValues.agentEmail}
                    onChange={e => updateValue('agentEmail', e.target.value)}
                  />
                </div>

                {/* Reservation Officer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    রিজার্ভেশন অফিসার নির্বাচন করুন <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.reservationOfficerId}
                    onChange={e => updateValue('reservationOfficerId', e.target.value)}
                    required
                    disabled={employeesLoading}
                  >
                    <option value="" disabled>
                      {employeesLoading ? 'লোড হচ্ছে...' : 'অফিসার নির্বাচন করুন'}
                    </option>
                    {employees && employees.length > 0 ? (
                      employees.map(employee => {
                        const employeeId = employee._id || employee.id || employee.employeeId;
                        const firstName = employee.firstName || '';
                        const lastName = employee.lastName || '';
                        const fullName = employee.fullName || employee.name || `${firstName} ${lastName}`.trim() || 'N/A';
                        const empId = employee.employeeId || employee.id || '';
                        return (
                          <option key={employeeId} value={employeeId}>
                            {fullName} {empId ? `(${empId})` : ''}
                          </option>
                        );
                      })
                    ) : (
                      !employeesLoading && <option value="" disabled>কোন কর্মচারী পাওয়া যায়নি</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button
              type="button"
              onClick={previousStep}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-md border-2 font-medium transition-all duration-200 ${
                currentStep === 1
                  ? 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              <ChevronRight className="w-4 h-4 inline-block rotate-180 mr-2" />
              পূর্ববর্তী
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ধাপ {currentStep} এর {totalSteps}
              </span>
            </div>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                পরবর্তী
                <ChevronRight className="w-4 h-4 inline-block ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 inline-block animate-spin mr-2" />
                    সংরক্ষণ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 inline-block mr-2" />
                    সংরক্ষণ করুন
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
