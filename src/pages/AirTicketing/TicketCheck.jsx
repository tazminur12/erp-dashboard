import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import useAirCustomersQueries from '../../hooks/useAirCustomersQueries';
import { useEmployees } from '../../hooks/useHRQueries';

export default function TicketCheck() {
  const { useSearchAirCustomers } = useAirCustomersQueries();
  
  // Fetch active employees for reservation officers
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({
    status: 'active',
    limit: 100,
    page: 1
  });

  const reservationOfficers = useMemo(() => {
    if (!employeesData?.employees) return [];
    return employeesData.employees.map(emp => ({
      id: emp._id || emp.id || emp.employeeId,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.employeeId || 'Unknown'
    }));
  }, [employeesData]);

  const [formValues, setFormValues] = useState({
    travelDate: '',
    passengerName: '',
    travellingCountry: '',
    passportNo: '',
    contactNo: '',
    isWhatsAppSame: true,
    whatsAppNo: '',
    airlineName: '',
    route: '',
    bookingRef: '',
    issuingAgentName: '',
    email: '',
    reservationOfficerId: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [passengerSearchTerm, setPassengerSearchTerm] = useState('');
  const [showPassengerResults, setShowPassengerResults] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  const { data: passengerResults = [], isPending: isSearching } = useSearchAirCustomers(
    passengerSearchTerm,
    { enabled: passengerSearchTerm.trim().length >= 2 }
  );

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
      email: passenger.email || '',
      isWhatsAppSame: !passenger.whatsappNo || passenger.whatsappNo === passenger.mobile
    }));
    setPassengerSearchTerm('');
    setShowPassengerResults(false);
  };

  function updateValue(field, value) {
    setFormValues(prev => ({ ...prev, [field]: value }));
  }

  function validateEmail(email) {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmittedMessage('');

    if (!formValues.travelDate) return setSubmittedMessage('Please select travel date.');
    if (!formValues.passengerName) return setSubmittedMessage('Please enter passenger name.');
    if (!formValues.travellingCountry) return setSubmittedMessage('Please enter travelling country.');
    if (!formValues.passportNo) return setSubmittedMessage('Please enter passport number.');
    if (!formValues.contactNo) return setSubmittedMessage('Please enter contact number.');
    if (!formValues.isWhatsAppSame && !formValues.whatsAppNo) return setSubmittedMessage('Please enter WhatsApp number.');
    if (!formValues.airlineName) return setSubmittedMessage('Please enter airlines name.');
    if (!formValues.route) return setSubmittedMessage('Please enter route.');
    if (!formValues.bookingRef) return setSubmittedMessage('Please enter booking reference.');
    if (!formValues.issuingAgentName) return setSubmittedMessage('Please enter issuing agent name.');
    if (!validateEmail(formValues.email)) return setSubmittedMessage('Please enter a valid email.');
    if (!formValues.reservationOfficerId) return setSubmittedMessage('Please select reservation officer.');

    setSubmitting(true);
    // Simulate submit
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedMessage('Ticket check information saved successfully.');
    }, 800);
  }

  function handleReset() {
    setFormValues({
      travelDate: '',
      passengerName: '',
      travellingCountry: '',
      passportNo: '',
      contactNo: '',
      isWhatsAppSame: true,
      whatsAppNo: '',
      airlineName: '',
      route: '',
      bookingRef: '',
      issuingAgentName: '',
      email: '',
      reservationOfficerId: ''
    });
    setSelectedPassenger(null);
    setPassengerSearchTerm('');
    setSubmittedMessage('');
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Ticket Check</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">Old Ticketing Service</div>
      </div>

      <form onSubmit={handleSubmit} onReset={handleReset} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date</label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.travelDate}
              onChange={e => updateValue('travelDate', e.target.value)}
              required
            />
          </div>

          {/* Passenger Name with Search */}
          <div className="md:col-span-2 lg:col-span-1 relative" ref={searchRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Passenger Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search passenger or enter name..."
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
                    No passengers found
                  </div>
                ) : null}
              </div>
            )}
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

          {/* Airlines Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Airlines Name</label>
            <input
              type="text"
              placeholder="e.g. Saudi Airlines"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.airlineName}
              onChange={e => updateValue('airlineName', e.target.value)}
              required
            />
          </div>

          {/* Route */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Route</label>
            <input
              type="text"
              placeholder="e.g. DAC → RUH"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.route}
              onChange={e => updateValue('route', e.target.value)}
              required
            />
          </div>

          {/* Booking Ref */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Booking Ref</label>
            <input
              type="text"
              placeholder="e.g. ABC123"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.bookingRef}
              onChange={e => updateValue('bookingRef', e.target.value)}
              required
            />
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

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
            <input
              type="email"
              placeholder="agent@example.com"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.email}
              onChange={e => updateValue('email', e.target.value)}
            />
          </div>

          {/* Reservation Officer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Select Reservation Officer
            </label>
            <select
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              value={formValues.reservationOfficerId}
              onChange={e => updateValue('reservationOfficerId', e.target.value)}
              disabled={isLoadingEmployees}
              required
            >
              <option value="" disabled>
                {isLoadingEmployees ? 'Loading employees...' : 'Choose officer'}
              </option>
              {reservationOfficers.length > 0 ? (
                reservationOfficers.map(officer => (
                  <option key={officer.id} value={officer.id}>{officer.name}</option>
                ))
              ) : !isLoadingEmployees ? (
                <option value="" disabled>No employees found</option>
              ) : null}
            </select>
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

