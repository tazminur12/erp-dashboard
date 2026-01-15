import React, { useMemo, useState, useEffect } from 'react';
import { Search, X, Plane, DollarSign } from 'lucide-react';
import useAirCustomersQueries from '../../hooks/useAirCustomersQueries';
import { useVendors } from '../../hooks/useVendorQueries';
import { useEmployees } from '../../hooks/useHRQueries';
import useAirlineQueries from '../../hooks/useAirlineQueries';
import useOldTicketReissueQueries from '../../hooks/useOldTicketReissueQueries';

export default function OldTicketReissue() {
  const { useSearchAirCustomers } = useAirCustomersQueries();
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({ status: 'active', limit: 1000 });
  const employees = employeesData?.employees || [];
  const { useAirlines } = useAirlineQueries();
  const { useCreateOldTicketReissue } = useOldTicketReissueQueries();
  const createMutation = useCreateOldTicketReissue();
  
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

  // Search passengers
  const { data: searchedPassengers = [], isLoading: searchingPassengers } = useSearchAirCustomers(
    passengerSearchTerm,
    { enabled: passengerSearchTerm.length > 1, limit: 10 }
  );

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
    setVendorSearchTerm(vendor.tradeName || vendor.ownerName);
    updateValue('reissueVendorId', vendor._id || vendor.vendorId);
    updateValue('reissueVendorName', vendor.tradeName || vendor.ownerName);
    setShowVendorList(false);
  }

  function validateEmail(email) {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmittedMessage('');

    if (!formValues.formDate) return setSubmittedMessage('তারিখ নির্বাচন করুন।');
    if (!formValues.firstName) return setSubmittedMessage('প্রথম নাম লিখুন।');
    if (!formValues.lastName) return setSubmittedMessage('শেষ নাম লিখুন।');
    if (!formValues.travellingCountry) return setSubmittedMessage('ভ্রমণের দেশ লিখুন।');
    if (!formValues.passportNo) return setSubmittedMessage('পাসপোর্ট নম্বর লিখুন।');
    if (!formValues.contactNo) return setSubmittedMessage('যোগাযোগ নম্বর লিখুন।');
    if (!formValues.isWhatsAppSame && !formValues.whatsAppNo) return setSubmittedMessage('WhatsApp নম্বর লিখুন।');
    if (!formValues.airlineName) return setSubmittedMessage('এয়ারলাইন্সের নাম লিখুন।');
    if (!formValues.origin) return setSubmittedMessage('উৎপত্তি লিখুন।');
    if (!formValues.destination) return setSubmittedMessage('গন্তব্য লিখুন।');
    if (!formValues.airlinesPnr) return setSubmittedMessage('এয়ারলাইন্স PNR লিখুন।');
    if (!formValues.oldDate) return setSubmittedMessage('পুরাতন তারিখ নির্বাচন করুন।');
    if (!formValues.newDate) return setSubmittedMessage('নতুন তারিখ নির্বাচন করুন।');
    if (!formValues.reissueVendorId) return setSubmittedMessage('রিইস্যু ভেন্ডর নির্বাচন করুন।');
    if (!formValues.vendorAmount) return setSubmittedMessage('ভেন্ডর এমাউন্ট লিখুন।');
    if (!formValues.totalContractAmount) return setSubmittedMessage('মোট কন্ট্রাক্ট এমাউন্ট লিখুন।');
    if (!formValues.issuingAgentName) return setSubmittedMessage('ইস্যুকারী এজেন্টের নাম লিখুন।');
    if (!formValues.issuingAgentContact) return setSubmittedMessage('ইস্যুকারী এজেন্ট যোগাযোগ নম্বর লিখুন।');
    if (!validateEmail(formValues.agentEmail)) return setSubmittedMessage('সঠিক ইমেইল ঠিকানা লিখুন।');
    if (!formValues.reservationOfficerId) return setSubmittedMessage('রিজার্ভেশন অফিসার নির্বাচন করুন।');

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
        setSubmittedMessage('Old ticket reissue created successfully!');
        // Reset form
        handleReset();
      },
      onError: () => {
        setSubmitting(false);
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
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">পুরাতন টিকেট রিইস্যু</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">পুরাতন টিকেটিং সেবা</div>
      </div>

      <form onSubmit={handleSubmit} onReset={handleReset} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
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
            
            {showPassengerList && passengerSearchTerm.length > 1 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchingPassengers ? (
                  <div className="p-3 text-center text-sm text-gray-500">খোঁজা হচ্ছে...</div>
                ) : searchedPassengers.length > 0 ? (
                  searchedPassengers.map((passenger) => (
                    <button
                      key={passenger._id}
                      type="button"
                      onClick={() => handlePassengerSelect(passenger)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {passenger.firstName} {passenger.lastName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {passenger.passportNumber} • {passenger.contactNumber}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-gray-500">কোন যাত্রী পাওয়া যায়নি</div>
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

          {/* Reissue Vendor (Auto Search) */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">রিইস্যু ভেন্ডর</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ভেন্ডর খুঁজুন..."
                className="w-full pl-10 pr-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    setShowVendorList(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            {showVendorList && vendorSearchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {vendorsLoading ? (
                  <div className="p-3 text-center text-sm text-gray-500">লোড হচ্ছে...</div>
                ) : filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => (
                    <button
                      key={vendor._id}
                      type="button"
                      onClick={() => handleVendorSelect(vendor)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {vendor.tradeName || vendor.ownerName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {vendor.vendorId} • {vendor.contactNo}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-gray-500">কোন ভেন্ডর পাওয়া যায়নি</div>
                )}
              </div>
            )}
          </div>

          {/* Vendor Amount */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              <DollarSign className="w-4 h-4" />
              ভেন্ডর এমাউন্ট
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>৳</span>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-7 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
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
              মোট কন্ট্রাক্ট এমাউন্ট
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>৳</span>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-7 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
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

          {/* Issuing Agent Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ইস্যুকারী এজেন্টের নাম</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ইস্যুকারী এজেন্ট যোগাযোগ নম্বর</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">এজেন্ট ইমেইল</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">রিজার্ভেশন অফিসার নির্বাচন করুন</label>
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

        {submittedMessage && (
          <div className={`mt-4 text-sm ${submittedMessage.includes('successfully') || submittedMessage.includes('সফল') ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            {submittedMessage}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন'}
          </button>
          <button
            type="reset"
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            রিসেট
          </button>
        </div>
      </form>
    </div>
  );
}
