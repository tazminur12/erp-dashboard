import React, { useMemo, useState, useEffect } from 'react';
import { Search, X, Plane, DollarSign } from 'lucide-react';
import useAirCustomersQueries from '../../hooks/useAirCustomersQueries';
import { useVendors } from '../../hooks/useVendorQueries';
import useEmployeeQueries from '../../hooks/useEmployeeQueries';

export default function OldTicketReissue() {
  const { useSearchAirCustomers } = useAirCustomersQueries();
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const { useEmployees } = useEmployeeQueries();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees({ status: 'active' });

  // Common airlines list
  const airlinesList = useMemo(
    () => [
      'Biman Bangladesh Airlines',
      'Saudi Airlines',
      'Emirates',
      'Qatar Airways',
      'Flydubai',
      'Air Arabia',
      'Turkish Airlines',
      'Malaysia Airlines',
      'Singapore Airlines',
      'Thai Airways',
      'Etihad Airways',
      'Gulf Air',
      'Kuwait Airways',
      'Oman Air'
    ].sort(),
    []
  );

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

    if (!formValues.formDate) return setSubmittedMessage('Please select date.');
    if (!formValues.firstName) return setSubmittedMessage('Please enter first name.');
    if (!formValues.lastName) return setSubmittedMessage('Please enter last name.');
    if (!formValues.travellingCountry) return setSubmittedMessage('Please enter travelling country.');
    if (!formValues.passportNo) return setSubmittedMessage('Please enter passport number.');
    if (!formValues.contactNo) return setSubmittedMessage('Please enter contact number.');
    if (!formValues.isWhatsAppSame && !formValues.whatsAppNo) return setSubmittedMessage('Please enter WhatsApp number.');
    if (!formValues.airlineName) return setSubmittedMessage('Please enter airlines name.');
    if (!formValues.origin) return setSubmittedMessage('Please enter origin.');
    if (!formValues.destination) return setSubmittedMessage('Please enter destination.');
    if (!formValues.airlinesPnr) return setSubmittedMessage('Please enter Airlines PNR.');
    if (!formValues.oldDate) return setSubmittedMessage('Please select old date.');
    if (!formValues.newDate) return setSubmittedMessage('Please select new date.');
    if (!formValues.reissueVendorId) return setSubmittedMessage('Please select reissue vendor.');
    if (!formValues.vendorAmount) return setSubmittedMessage('Please enter vendor amount.');
    if (!formValues.totalContractAmount) return setSubmittedMessage('Please enter total contract amount.');
    if (!formValues.issuingAgentName) return setSubmittedMessage('Please enter issuing agent name.');
    if (!formValues.issuingAgentContact) return setSubmittedMessage('Please enter issuing agent contact.');
    if (!validateEmail(formValues.agentEmail)) return setSubmittedMessage('Please enter a valid email.');
    if (!formValues.reservationOfficerId) return setSubmittedMessage('Please select reservation officer.');

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedMessage('Old ticket reissue information saved successfully.');
    }, 800);
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
        <h1 className="text-2xl font-semibold">Old Ticket Reissue</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">Old Ticketing Service</div>
      </div>

      <form onSubmit={handleSubmit} onReset={handleReset} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date (Auto) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date (Auto)</label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.formDate}
              readOnly
            />
          </div>

          {/* Passenger Search */}
          <div className="md:col-span-2 lg:col-span-1 relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Passenger Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, passport, contact..."
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
                  <div className="p-3 text-center text-sm text-gray-500">Searching...</div>
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
                  <div className="p-3 text-center text-sm text-gray-500">No passengers found</div>
                )}
              </div>
            )}
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Passenger First Name</label>
            <input
              type="text"
              placeholder="e.g. Rahim"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.firstName}
              onChange={e => updateValue('firstName', e.target.value)}
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Passenger Last Name</label>
            <input
              type="text"
              placeholder="e.g. Uddin"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.lastName}
              onChange={e => updateValue('lastName', e.target.value)}
              required
            />
          </div>

          {/* Travelling Country */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Travelling Country</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Passport No</label>
            <input
              type="text"
              placeholder="e.g. BN0123456"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.passportNo}
              onChange={e => updateValue('passportNo', e.target.value)}
              required
            />
          </div>

          {/* Contact No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Contact No</label>
            <input
              type="tel"
              placeholder="e.g. +8801XXXXXXXXX"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label htmlFor="waSame" className="text-sm text-gray-700 dark:text-gray-200">WhatsApp same as Contact No</label>
          </div>

          {/* WhatsApp No (conditional) */}
          {!formValues.isWhatsAppSame && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">WhatsApp No</label>
              <input
                type="tel"
                placeholder="e.g. +8801XXXXXXXXX"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              Airlines Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search airlines..."
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
                {filteredAirlines.length > 0 ? (
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
                  <div className="p-3 text-center text-sm text-gray-500">No airlines found</div>
                )}
              </div>
            )}
          </div>

          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Origin</label>
            <input
              type="text"
              placeholder="e.g. DAC"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.origin}
              onChange={e => updateValue('origin', e.target.value)}
              required
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Destination</label>
            <input
              type="text"
              placeholder="e.g. RUH"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.destination}
              onChange={e => updateValue('destination', e.target.value)}
              required
            />
          </div>

          {/* Airlines PNR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Airlines PNR</label>
            <input
              type="text"
              placeholder="e.g. ABC123"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.airlinesPnr}
              onChange={e => updateValue('airlinesPnr', e.target.value)}
              required
            />
          </div>

          {/* Old Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Old Date</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">New Date</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Reissue Vendor</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendor..."
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
                  <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
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
                  <div className="p-3 text-center text-sm text-gray-500">No vendors found</div>
                )}
              </div>
            )}
          </div>

          {/* Vendor Amount */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              <DollarSign className="w-4 h-4" />
              Vendor Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-7 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formValues.vendorAmount}
                onChange={e => updateValue('vendorAmount', e.target.value)}
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Amount paid to vendor</p>
          </div>

          {/* Total Contract Amount */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              <DollarSign className="w-4 h-4" />
              Total Contract Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-7 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formValues.totalContractAmount}
                onChange={e => updateValue('totalContractAmount', e.target.value)}
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Amount billed to customer</p>
          </div>

          {/* Profit (Calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Profit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
              <input
                type="text"
                className={`w-full pl-7 rounded-md border-2 px-3 py-2 font-semibold ${
                  profit >= 0 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}
                value={profit.toFixed(2)}
                readOnly
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Auto-calculated: Total - Vendor Amount</p>
          </div>

          {/* Issuing Agent Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Issuing Agent Name</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Issuing Agent Contact No</label>
            <input
              type="tel"
              placeholder="e.g. +8801XXXXXXXXX"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.issuingAgentContact}
              onChange={e => updateValue('issuingAgentContact', e.target.value)}
              required
            />
          </div>

          {/* Agent Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Agent Email</label>
            <input
              type="email"
              placeholder="agent@example.com"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.agentEmail}
              onChange={e => updateValue('agentEmail', e.target.value)}
            />
          </div>

          {/* Reservation Officer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Select Reservation Officer</label>
            <select
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.reservationOfficerId}
              onChange={e => updateValue('reservationOfficerId', e.target.value)}
              required
              disabled={employeesLoading}
            >
              <option value="" disabled>
                {employeesLoading ? 'Loading employees...' : 'Choose officer'}
              </option>
              {employees && employees.length > 0 ? (
                employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} {employee.employeeId ? `(${employee.employeeId})` : ''}
                  </option>
                ))
              ) : (
                !employeesLoading && <option value="" disabled>No employees found</option>
              )}
            </select>
          </div>
        </div>

        {submittedMessage && (
          <div className={`mt-4 text-sm ${submittedMessage.includes('success') ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            {submittedMessage}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
          <button
            type="reset"
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
