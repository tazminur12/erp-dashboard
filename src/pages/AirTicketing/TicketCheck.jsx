import React, { useMemo, useState } from 'react';

export default function TicketCheck() {
  const reservationOfficers = useMemo(
    () => [
      { id: 'ro-1', name: 'Mahmudul Hasan' },
      { id: 'ro-2', name: 'Nusrat Jahan' },
      { id: 'ro-3', name: 'Tanvir Ahmed' }
    ],
    []
  );

  const [formValues, setFormValues] = useState({
    travelDate: '',
    firstName: '',
    lastName: '',
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
    if (!formValues.firstName) return setSubmittedMessage('Please enter first name.');
    if (!formValues.lastName) return setSubmittedMessage('Please enter last name.');
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
      firstName: '',
      lastName: '',
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Select Reservation Officer</label>
            <select
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.reservationOfficerId}
              onChange={e => updateValue('reservationOfficerId', e.target.value)}
              required
            >
              <option value="" disabled>Choose officer</option>
              {reservationOfficers.map(officer => (
                <option key={officer.id} value={officer.id}>{officer.name}</option>
              ))}
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

