import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Plane, DollarSign } from 'lucide-react';
import useAirCustomersQueries from '../../hooks/useAirCustomersQueries';
import { useEmployees } from '../../hooks/useHRQueries';
import useTicketCheckQueries from '../../hooks/useTicketCheckQueries';
import useAirlineQueries from '../../hooks/useAirlineQueries';

export default function TicketCheck() {
  const { useSearchAirCustomers } = useAirCustomersQueries();
  const { useCreateTicketCheck } = useTicketCheckQueries();
  const createMutation = useCreateTicketCheck();
  const { useAirlines } = useAirlineQueries();
  
  // Fetch active employees for reservation officers
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({
    status: 'active',
    limit: 100,
    page: 1
  });

  // Fetch airlines for searchable dropdown
  const { data: airlinesData, isLoading: airlinesLoading } = useAirlines({ 
    limit: 100
  });

  // Airlines list from database
  const airlinesList = useMemo(() => {
    if (!airlinesData?.airlines || airlinesData.airlines.length === 0) {
      return [];
    }
    
    return airlinesData.airlines
      .filter(airline => {
        const isActive = airline.status === 'Active' || airline.status === 'active' || airline.isActive === true;
        return isActive;
      })
      .map(airline => {
        const name = airline.name || airline.airlineName || airline.airline_name || airline.companyName || airline.tradeName;
        return name;
      })
      .filter(Boolean)
      .sort();
  }, [airlinesData]);

  const reservationOfficers = useMemo(() => {
    if (!employeesData?.employees) return [];
    return employeesData.employees.map(emp => ({
      id: emp._id || emp.id || emp.employeeId,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.employeeId || 'Unknown'
    }));
  }, [employeesData]);

  const [formValues, setFormValues] = useState({
    formDate: new Date().toISOString().split('T')[0], // Auto-filled with today's date
    passengerName: '',
    travellingCountry: '',
    passportNo: '',
    contactNo: '',
    isWhatsAppSame: true,
    whatsAppNo: '',
    airlineName: '',
    origin: '',
    destination: '',
    airlinesPnr: '', // Changed from bookingRef
    issuingAgentName: '',
    issuingAgentContact: '', // Added
    agentEmail: '', // Changed from email
    reservationOfficerId: '',
    serviceCharge: '' // Service Charge (BDT) - সম্পূর্ণ profit
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [passengerSearchTerm, setPassengerSearchTerm] = useState('');
  const [showPassengerResults, setShowPassengerResults] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  
  // Airline search states
  const [airlineSearchTerm, setAirlineSearchTerm] = useState('');
  const [showAirlineList, setShowAirlineList] = useState(false);
  const [filteredAirlines, setFilteredAirlines] = useState([]);

  const { data: passengerResults = [], isPending: isSearching } = useSearchAirCustomers(
    passengerSearchTerm,
    { enabled: passengerSearchTerm.trim().length >= 2 }
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

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowPassengerResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePassengerSelect = (passenger) => {
    setSelectedPassenger(passenger);
    setFormValues(prev => ({
      ...prev,
      passengerName: passenger.name || `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim(),
      passportNo: passenger.passportNumber || '',
      contactNo: passenger.mobile || passenger.phone || '',
      whatsAppNo: passenger.whatsappNo || passenger.mobile || '',
      agentEmail: passenger.email || '',
      isWhatsAppSame: !passenger.whatsappNo || passenger.whatsappNo === passenger.mobile
    }));
    setPassengerSearchTerm('');
    setShowPassengerResults(false);
  };

  function handleAirlineSelect(airline) {
    setAirlineSearchTerm(airline);
    updateValue('airlineName', airline);
    setShowAirlineList(false);
  }

  function updateValue(field, value) {
    setFormValues(prev => ({ ...prev, [field]: value }));
  }

  function validateEmail(email) {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Calculate profit automatically - Service Charge is completely profit
  const profit = useMemo(() => {
    const serviceCharge = parseFloat(formValues.serviceCharge) || 0;
    return serviceCharge; // Service Charge is completely profit
  }, [formValues.serviceCharge]);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmittedMessage('');

    if (!formValues.formDate) return setSubmittedMessage('তারিখ প্রয়োজন।');
    if (!formValues.passengerName) return setSubmittedMessage('যাত্রীর নাম লিখুন।');
    if (!formValues.travellingCountry) return setSubmittedMessage('ভ্রমণের দেশ লিখুন।');
    if (!formValues.passportNo) return setSubmittedMessage('পাসপোর্ট নম্বর লিখুন।');
    if (!formValues.contactNo) return setSubmittedMessage('যোগাযোগ নম্বর লিখুন।');
    if (!formValues.isWhatsAppSame && !formValues.whatsAppNo) return setSubmittedMessage('WhatsApp নম্বর লিখুন।');
    if (!formValues.airlineName) return setSubmittedMessage('এয়ারলাইন্সের নাম লিখুন।');
    if (!formValues.origin) return setSubmittedMessage('উৎপত্তি লিখুন।');
    if (!formValues.destination) return setSubmittedMessage('গন্তব্য লিখুন।');
    if (!formValues.airlinesPnr) return setSubmittedMessage('এয়ারলাইন্স PNR লিখুন।');
    if (!formValues.issuingAgentName) return setSubmittedMessage('ইস্যুকারী এজেন্টের নাম লিখুন।');
    if (!formValues.issuingAgentContact) return setSubmittedMessage('ইস্যুকারী এজেন্ট যোগাযোগ নম্বর লিখুন।');
    if (!validateEmail(formValues.agentEmail)) return setSubmittedMessage('সঠিক ইমেইল ঠিকানা লিখুন।');
    if (!formValues.reservationOfficerId) return setSubmittedMessage('রিজার্ভেশন অফিসার নির্বাচন করুন।');
    if (!formValues.serviceCharge) return setSubmittedMessage('সার্ভিস চার্জ (BDT) লিখুন।');

    setSubmitting(true);

    // Get reservation officer name
    const selectedOfficer = reservationOfficers.find(officer => officer.id === formValues.reservationOfficerId);
    const reservationOfficerName = selectedOfficer ? selectedOfficer.name : '';

    // Prepare payload
    const payload = {
      customerId: selectedPassenger?._id || null,
      formDate: formValues.formDate,
      passengerName: formValues.passengerName,
      travellingCountry: formValues.travellingCountry,
      passportNo: formValues.passportNo,
      contactNo: formValues.contactNo,
      isWhatsAppSame: formValues.isWhatsAppSame,
      whatsAppNo: formValues.isWhatsAppSame ? formValues.contactNo : formValues.whatsAppNo,
      airlineName: formValues.airlineName,
      origin: formValues.origin,
      destination: formValues.destination,
      airlinesPnr: formValues.airlinesPnr,
      issuingAgentName: formValues.issuingAgentName,
      issuingAgentContact: formValues.issuingAgentContact,
      agentEmail: formValues.agentEmail,
      reservationOfficerId: formValues.reservationOfficerId,
      reservationOfficerName: reservationOfficerName,
      serviceCharge: parseFloat(formValues.serviceCharge) || 0,
      profit: profit, // Service Charge is completely profit
      notes: ''
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setSubmitting(false);
        setSubmittedMessage('Ticket check created successfully!');
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
      passengerName: '',
      travellingCountry: '',
      passportNo: '',
      contactNo: '',
      isWhatsAppSame: true,
      whatsAppNo: '',
      airlineName: '',
      origin: '',
      destination: '',
      airlinesPnr: '',
      issuingAgentName: '',
      issuingAgentContact: '',
      agentEmail: '',
      reservationOfficerId: '',
      serviceCharge: ''
    });
    setSelectedPassenger(null);
    setPassengerSearchTerm('');
    setAirlineSearchTerm('');
    setSubmittedMessage('');
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">টিকেট চেক</h1>
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

          {/* Passenger Name with Search */}
          <div className="md:col-span-2 lg:col-span-1 relative" ref={searchRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              যাত্রীর নাম
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="যাত্রী খুঁজুন বা নাম লিখুন..."
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={passengerSearchTerm || formValues.passengerName}
                onChange={e => {
                  const value = e.target.value;
                  setPassengerSearchTerm(value);
                  if (!value) {
                    updateValue('passengerName', '');
                    setSelectedPassenger(null);
                  } else {
                    updateValue('passengerName', value);
                  }
                  setShowPassengerResults(value.trim().length >= 2);
                }}
                onFocus={() => {
                  if (passengerSearchTerm.trim().length >= 2 || passengerResults.length > 0) {
                    setShowPassengerResults(true);
                  }
                }}
                required
              />
              {selectedPassenger && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPassenger(null);
                    setPassengerSearchTerm('');
                    updateValue('passengerName', '');
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showPassengerResults && (passengerSearchTerm.trim().length >= 2 || passengerResults.length > 0) && (
              <div
                ref={resultsRef}
                className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {isSearching ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-blue-600" />
                    <p className="text-sm text-gray-500 mt-2">Searching...</p>
                  </div>
                ) : passengerResults.length > 0 ? (
                  <ul className="py-1">
                    {passengerResults.map((passenger) => {
                      const fullName = passenger.name || `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim();
                      return (
                        <li
                          key={passenger._id || passenger.id || passenger.customerId}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => handlePassengerSelect(passenger)}
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{fullName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {passenger.mobile || passenger.phone ? `Phone: ${passenger.mobile || passenger.phone}` : ''}
                            {passenger.passportNumber ? ` | Passport: ${passenger.passportNumber}` : ''}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : passengerSearchTerm.trim().length >= 2 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    কোন যাত্রী পাওয়া যায়নি
                  </div>
                ) : null}
              </div>
            )}
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

          {/* Travelling Country */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ভ্রমণের দেশ</label>
            <input
              type="text"
              placeholder="যেমনঃ Saudi Arabia"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.travellingCountry}
              onChange={e => updateValue('travellingCountry', e.target.value)}
              required
            />
          </div>

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

          {/* Issuing Agent Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ইস্যুকারী এজেন্টের নাম</label>
            <input
              type="text"
              placeholder="এজেন্টের সম্পূর্ণ নাম"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              রিজার্ভেশন অফিসার নির্বাচন করুন
            </label>
            <select
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              value={formValues.reservationOfficerId}
              onChange={e => updateValue('reservationOfficerId', e.target.value)}
              disabled={isLoadingEmployees}
              required
            >
              <option value="" disabled>
                {isLoadingEmployees ? 'লোড হচ্ছে...' : 'অফিসার নির্বাচন করুন'}
              </option>
              {reservationOfficers.length > 0 ? (
                reservationOfficers.map(officer => (
                  <option key={officer.id} value={officer.id}>{officer.name}</option>
                ))
              ) : !isLoadingEmployees ? (
                <option value="" disabled>কোন কর্মচারী পাওয়া যায়নি</option>
              ) : null}
            </select>
          </div>

          {/* Service Charge (BDT) - সম্পূর্ণ profit */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              <DollarSign className="w-4 h-4" />
              সার্ভিস চার্জ (BDT) <span className="text-red-500">*</span>
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
                value={formValues.serviceCharge}
                onChange={e => updateValue('serviceCharge', e.target.value)}
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">সার্ভিস চার্জ সম্পূর্ণ লাভ</p>
          </div>

          {/* Profit (Calculated from Service Charge) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">লাভ (প্রফিট)</label>
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
            <p className="mt-1 text-xs text-gray-500">সার্ভিস চার্জ = সম্পূর্ণ লাভ</p>
          </div>
        </div>

        {submittedMessage && (
          <div className="mt-4 text-sm text-blue-700 dark:text-blue-300">{submittedMessage}</div>
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

