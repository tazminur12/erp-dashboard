import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Calendar, 
  Receipt,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Modal, { ModalFooter } from '../../components/common/Modal';

const NewTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tripType: 'oneway',
    flightType: 'domestic', // International or Domestic
    date: '',
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
    agent: '', // Agent Name / ID
    purposeType: '',
    // Passenger types
    adultCount: 0,
    childCount: 0,
    infantCount: 0,
    customerDeal: 0,
    customerPaid: 0,
    customerDue: 0,
    // Vendor breakdown fields
    baseFare: 0,
    // Individual tax components
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
    // Consolidated taxes input (additional/other taxes)
    taxes: 0,
    // Computed
    totalTaxes: 0,
    // Tax on commission
    ait: 0,
    commissionRate: 0, // percentage
    plb: 0,
    salmaAirServiceCharge: 0, // Salma Air specific service charge
    vendorServiceCharge: 0, // Vendor service charge
    vendorAmount: 0,
    vendorPaidFh: 0,
    vendorDue: 0,
    profit: 0,
    dueDate: '',
    status: 'pending',
    segmentCount: 1,
    flownSegment: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showTaxes, setShowTaxes] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [touched, setTouched] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const markTouched = (name) => setTouched(prev => ({ ...prev, [name]: true }));

  const validate = (values) => {
    const errs = {};
    if (!values.date) errs.date = 'Selling date is required';
    if (!values.bookingId) errs.bookingId = 'Booking ID is required';
    if (!values.airline) errs.airline = 'Airline is required';

    if (values.tripType === 'multicity') {
      if (!values.segments || values.segments.length < 2) {
        errs.segments = 'Add at least 2 segments';
      } else {
        values.segments.forEach((seg, idx) => {
          if (!seg.origin || !seg.destination || !seg.date) {
            errs[`segment_${idx}`] = 'Fill origin, destination and date';
          }
        });
      }
    } else {
      if (!values.origin) errs.origin = 'Origin is required';
      if (!values.destination) errs.destination = 'Destination is required';
      if (!values.flightDate) errs.flightDate = 'Flight date is required';
      if (values.tripType === 'roundtrip' && !values.returnDate) {
        errs.returnDate = 'Return date is required for round trip';
      }
    }
    return errs;
  };

  // Auto-calculate vendor amount when breakdown fields change
  React.useEffect(() => {
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
    
    // Calculate AIT (Advance Income Tax) using BSP Bangladesh formula:
    // (Total Transaction Amount - Penalties - BD, UT, E5 tax) x 0.30%
    // Total Transaction Amount = baseFare + totalTaxes + salmaAirServiceCharge
    // Penalties = 0 (assuming no penalties in this context)
    // BD, UT, E5 tax = taxBD + ut + e5
    const totalTransactionAmount = baseFare + totalTaxes + salmaAirServiceCharge;
    const penalties = 0; // No penalties field currently
    const bdUtE5Tax = taxBD + ut + e5;
    const ait = Math.max(0, Math.round((totalTransactionAmount - penalties - bdUtE5Tax) * 0.003)); // 0.30% = 0.003
    
    // Vendor amount calculation includes all service charges
    const vendorAmount = baseFare + totalTaxes + ait + salmaAirServiceCharge + vendorServiceCharge - commissionAmount - plb;

    setFormData((prev) => ({
      ...prev,
      ait: ait,
      totalTaxes: Math.max(0, Math.round(totalTaxes)),
      vendorAmount: Math.max(0, Math.round(vendorAmount))
    }));
  }, [
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
    formData.vendorServiceCharge
  ]);

  // Auto-calc vendorDue and profit when dependencies change
  React.useEffect(() => {
    const toNumber = (v) => Number(v) || 0;
    const vendorAmount = toNumber(formData.vendorAmount);
    const vendorPaidFh = toNumber(formData.vendorPaidFh);
    const customerDeal = toNumber(formData.customerDeal);

    const vendorDue = Math.max(0, Math.round(vendorAmount - vendorPaidFh));
    const profit = Math.round(customerDeal - vendorAmount);

    if (vendorDue !== formData.vendorDue || profit !== formData.profit) {
      setFormData(prev => ({ ...prev, vendorDue, profit }));
    }
  }, [formData.vendorAmount, formData.vendorPaidFh, formData.customerDeal]);

  // Auto-calculate customer due from deal and paid
  React.useEffect(() => {
    const deal = Number(formData.customerDeal) || 0;
    const paid = Number(formData.customerPaid) || 0;
    const due = Math.max(0, Math.round(deal - paid));
    if (due !== formData.customerDue) {
      setFormData(prev => ({ ...prev, customerDue: due }));
    }
  }, [formData.customerDeal, formData.customerPaid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const errs = validate(formData);
    setValidationErrors(errs);
    if (Object.keys(errs).length > 0) {
      setLoading(false);
      return;
    }

    try {
      // Validate form (required fields for booking)
      // Already validated above

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess('Booking saved successfully!');
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          tripType: 'oneway',
          flightType: 'domestic',
          date: '',
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
          dueDate: '',
          status: 'pending',
          segmentCount: 1,
          flownSegment: false
        });
        setSuccess('');
      }, 3000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateFare = () => {
    // Simple fare calculation logic
    const baseFare = 5000 + (Math.random() * 15000);
    const tax = baseFare * 0.15;
    
    setFormData(prev => ({
      ...prev,
      baseFare: Math.round(baseFare),
      tax: Math.round(tax)
    }));
  };

  // Keep segment count in sync for multicity
  React.useEffect(() => {
    if (formData.tripType === 'multicity') {
      setFormData(prev => ({ ...prev, segmentCount: prev.segments?.length || 0 }));
    }
  }, [formData.tripType, formData.segments]);

  const handleSegmentChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.segments];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, segments: updated };
    });
  };

  const addSegment = () => {
    setFormData(prev => ({
      ...prev,
      segments: [...prev.segments, { origin: '', destination: '', date: '' }]
    }));
  };

  const removeSegment = (index) => {
    setFormData(prev => {
      if ((prev.segments?.length || 0) <= 2) return prev; // keep minimum 2 segments
      const updated = prev.segments.filter((_, i) => i !== index);
      return { ...prev, segments: updated };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/air-ticketing/tickets')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                নতুন টিকিট বিক্রয়
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                গ্রাহকের জন্য নতুন এয়ার টিকিট বুক করুন
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Booking & Agent Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-blue-600" />
              Booking Details
            </h2>
            
            {/* Top row: Date, Booking ID, Flight Type, Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selling Date *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => { handleChange(e); if (touched.date) setValidationErrors(validate({ ...formData, date: e.target.value })); }}
                    onBlur={() => { markTouched('date'); setValidationErrors(validate(formData)); }}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  {touched.date && validationErrors.date && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.date}</p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Booking ID *</label>
                <input
                  type="text"
                  name="bookingId"
                  id="bookingId"
                  value={formData.bookingId}
                  onChange={(e) => { handleChange(e); if (touched.bookingId) setValidationErrors(validate({ ...formData, bookingId: e.target.value })); }}
                  onBlur={() => { markTouched('bookingId'); setValidationErrors(validate(formData)); }}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Booking reference"
                  required
                />
                {touched.bookingId && validationErrors.bookingId && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.bookingId}</p>
                )}
              </div>
              <div>
                <label htmlFor="flightType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Route Category</label>
                <select
                  name="flightType"
                  id="flightType"
                  value={formData.flightType}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                   <option value="domestic">Domestic</option>
                   <option value="international">International</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                   <option value="booked">Booked</option>
                   <option value="issued">Issued</option>
                   <option value="partial">Partial Due</option>
                   <option value="flown">Flown</option>
                   <option value="refund">Refund Submitted</option>
                   <option value="refund settled">Refund Settled</option>
                   <option value="refunded">Refunded</option>
                   <option value="void">Void</option>
                   <option value="unconfirmed">Unconfirmed</option>
                   <option value="in progress">In Progress</option>
                   
                </select>
              </div>
            </div>

            {/* PNRs and Airline */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GDS PNR</label>
                <input
                  type="text"
                  name="gdsPnr"
                  value={formData.gdsPnr}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ABC123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Airlines PNR</label>
                <input
                  type="text"
                  name="airlinePnr"
                  value={formData.airlinePnr}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="DEF456"
                />
              </div>
              <div>
                <label htmlFor="airline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Airlines *</label>
                <input
                  type="text"
                  name="airline"
                  id="airline"
                  value={formData.airline}
                  onChange={(e) => { handleChange(e); if (touched.airline) setValidationErrors(validate({ ...formData, airline: e.target.value })); }}
                  onBlur={() => { markTouched('airline'); setValidationErrors(validate(formData)); }}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Airline name"
                  required
                />
                {touched.airline && validationErrors.airline && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.airline}</p>
                )}
              </div>
            </div>


            {/* Passenger Types */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Passenger Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adult</label>
                  <input
                    type="number"
                    name="adultCount"
                    value={formData.adultCount}
                    onChange={handleChange}
                    min="0"
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Child</label>
                  <input
                    type="number"
                    name="childCount"
                    value={formData.childCount}
                    onChange={handleChange}
                    min="0"
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Infant</label>
                  <input
                    type="number"
                    name="infantCount"
                    value={formData.infantCount}
                    onChange={handleChange}
                    min="0"
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Agent and Purpose */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Agent Name / ID</label>
                <input
                  type="text"
                  name="agent"
                  value={formData.agent}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Agent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issued By</label>
                <input
                  type="text"
                  name="purposeType"
                  value={formData.purposeType}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter issuer name"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Flight Specifics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-green-600" />
              Flight Specifics
            </h2>

            {/* Flight Type */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flight Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tripType: 'oneway' }))}
                    className={`px-3 py-2 rounded-lg border ${formData.tripType === 'oneway' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                  >
                    One Way
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tripType: 'roundtrip' }))}
                    className={`px-3 py-2 rounded-lg border ${formData.tripType === 'roundtrip' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                  >
                    Round Trip
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tripType: 'multicity' }))}
                    className={`px-3 py-2 rounded-lg border ${formData.tripType === 'multicity' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                  >
                    Multi City
                  </button>
                </div>
              </div>
            </div>

            {/* Route and Dates */}
            {formData.tripType !== 'multicity' ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Origin *</label>
                  <input
                    type="text"
                    name="origin"
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => { handleChange(e); if (touched.origin) setValidationErrors(validate({ ...formData, origin: e.target.value })); }}
                    onBlur={() => { markTouched('origin'); setValidationErrors(validate(formData)); }}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="DAC"
                    required
                  />
                  {touched.origin && validationErrors.origin && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.origin}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination *</label>
                  <input
                    type="text"
                    name="destination"
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => { handleChange(e); if (touched.destination) setValidationErrors(validate({ ...formData, destination: e.target.value })); }}
                    onBlur={() => { markTouched('destination'); setValidationErrors(validate(formData)); }}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="DXB"
                    required
                  />
                  {touched.destination && validationErrors.destination && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.destination}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="flightDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flight Date *</label>
                  <input
                    type="date"
                    name="flightDate"
                    id="flightDate"
                    value={formData.flightDate}
                    onChange={(e) => { handleChange(e); if (touched.flightDate) setValidationErrors(validate({ ...formData, flightDate: e.target.value })); }}
                    onBlur={() => { markTouched('flightDate'); setValidationErrors(validate(formData)); }}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  {touched.flightDate && validationErrors.flightDate && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.flightDate}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Return Date{formData.tripType === 'roundtrip' ? ' *' : ''}</label>
                  <input
                    type="date"
                    name="returnDate"
                    id="returnDate"
                    value={formData.returnDate}
                    onChange={(e) => { handleChange(e); if (touched.returnDate) setValidationErrors(validate({ ...formData, returnDate: e.target.value })); }}
                    onBlur={() => { markTouched('returnDate'); setValidationErrors(validate(formData)); }}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={formData.tripType === 'roundtrip'}
                  />
                  {touched.returnDate && validationErrors.returnDate && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.returnDate}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Multi City Segments</h3>
                  <button
                    type="button"
                    onClick={addSegment}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Segment
                  </button>
                </div>
                {formData.segments?.map((seg, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Origin *</label>
                      <input
                        type="text"
                        value={seg.origin}
                        onChange={(e) => handleSegmentChange(idx, 'origin', e.target.value)}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="DAC"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination *</label>
                      <input
                        type="text"
                        value={seg.destination}
                        onChange={(e) => handleSegmentChange(idx, 'destination', e.target.value)}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="DXB"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flight Date *</label>
                      <input
                        type="date"
                        value={seg.date}
                        onChange={(e) => handleSegmentChange(idx, 'date', e.target.value)}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div className="md:col-span-1 flex md:justify-end">
                      <button
                        type="button"
                        onClick={() => removeSegment(idx)}
                        disabled={(formData.segments?.length || 0) <= 2}
                        className={`w-full md:w-auto px-3 py-2 rounded-lg border ${((formData.segments?.length || 0) <= 2) ? 'text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed' : 'text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Financial Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-purple-600" />
              Financial Details
            </h2>

            {/* Customer finance */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Deal</label>
                <input
                  type="number"
                  name="customerDeal"
                  value={formData.customerDeal}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Paid</label>
                <input
                  type="number"
                  name="customerPaid"
                  value={formData.customerPaid}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Due</label>
                <input
                  type="number"
                  name="customerDue"
                  value={formData.customerDue}
                  readOnly
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 focus:outline-none text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Vendor Amount Breakdown */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vendor Amount Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Fare</label>
                  <input type="number" name="baseFare" value={formData.baseFare} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Taxes</label>
                  <input type="number" name="taxes" value={formData.taxes} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                </div>
                
                {/* Tax Details Section with Toggle */}
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => setShowTaxes(!showTaxes)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 mb-2"
                  >
                    <span>Tax Details</span>
                    {showTaxes ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  
                  {/* Collapsible Tax Fields */}
                  <div className={`transition-all duration-300 overflow-hidden ${showTaxes ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          BD
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Embarkation Fee (Bangladesh)
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="taxBD" value={formData.taxBD} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          E5
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            VAT on Embarkation Fee
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="e5" value={formData.e5} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          E7
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Advance Passenger Processing User Charge
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="e7" value={formData.e7} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          G8
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            International Arrival & Departure Fee
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="g8" value={formData.g8} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          OW
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Excise Duty (Bangladesh)
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="ow" value={formData.ow} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          P7
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Additional Service Tax (if applicable)
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="p7" value={formData.p7} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          P8
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Airport Development Fee (if applicable)
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="p8" value={formData.p8} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          TS
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Passenger Service Charge
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="ts" value={formData.ts} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          UT
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Travel Tax (International)
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="ut" value={formData.ut} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group relative">
                          YQ
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            Fuel Surcharge
                            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                        <input type="number" name="yq" value={formData.yq} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Taxes</label>
                  <input type="number" name="totalTaxes" value={formData.totalTaxes} readOnly className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 focus:outline-none text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AIT (Advance Income Tax)
                  </label>
                  <input 
                    type="number" 
                    name="ait" 
                    value={formData.ait} 
                    readOnly 
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 focus:outline-none text-gray-900 dark:text-white" 
                    placeholder="0" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commission Rate (%)</label>
                  <input type="number" name="commissionRate" value={formData.commissionRate} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PLB</label>
                  <input type="number" name="plb" value={formData.plb} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Salma Air Service Charge</label>
                  <input type="number" name="salmaAirServiceCharge" value={formData.salmaAirServiceCharge} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Service Charge</label>
                  <input type="number" name="vendorServiceCharge" value={formData.vendorServiceCharge} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                </div>
              </div>
            </div>

            {/* Vendor finance */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Amount</label>
                <input type="number" name="vendorAmount" value={formData.vendorAmount} readOnly className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 focus:outline-none text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Paid (FH)</label>
                <input
                  type="number"
                  name="vendorPaidFh"
                  value={formData.vendorPaidFh}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Due</label>
                <input
                  type="number"
                  name="vendorDue"
                  value={formData.vendorDue}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profit</label>
                <input
                  type="number"
                  name="profit"
                  value={formData.profit}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Segment Count</label>
                <input
                  type="number"
                  name="segmentCount"
                  value={formData.segmentCount}
                  onChange={handleChange}
                  min="1"
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center mt-7">
                <input
                  id="flownSegment"
                  type="checkbox"
                  name="flownSegment"
                  checked={formData.flownSegment}
                  onChange={(e) => setFormData(prev => ({ ...prev, flownSegment: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="flownSegment" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Flown Segment</label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate('/air-ticketing/tickets')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 inline mr-2" />
              ফিরে যান
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  const errs = validate(formData);
                  setValidationErrors(errs);
                  if (Object.keys(errs).length === 0) setShowPreview(true);
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
              >
                <Eye className="w-5 h-5 mr-2" />
                প্রিভিউ
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    বুক হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    টিকিট বুক করুন
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        {/* Preview Modal */}
        <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Preview Ticket" size="xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-semibold text-gray-900 dark:text-white">Booking</div>
              <div className="text-gray-700 dark:text-gray-300">Date: {formData.date || '-'}</div>
              <div className="text-gray-700 dark:text-gray-300">Booking ID: {formData.bookingId || '-'}</div>
              <div className="text-gray-700 dark:text-gray-300">Status: {formData.status}</div>
              <div className="text-gray-700 dark:text-gray-300">Airline: {formData.airline || '-'}</div>
              <div className="text-gray-700 dark:text-gray-300">Trip: {formData.tripType}</div>
              {formData.tripType !== 'multicity' ? (
                <>
                  <div className="text-gray-700 dark:text-gray-300">Route: {formData.origin || '-'} → {formData.destination || '-'}</div>
                  <div className="text-gray-700 dark:text-gray-300">Flight: {formData.flightDate || '-'}</div>
                  {formData.tripType === 'roundtrip' && (
                    <div className="text-gray-700 dark:text-gray-300">Return: {formData.returnDate || '-'}</div>
                  )}
                </>
              ) : (
                <div className="text-gray-700 dark:text-gray-300">
                  Segments:
                  <ul className="list-disc ml-5 mt-1">
                    {formData.segments?.map((s, i) => (
                      <li key={i}>{s.origin || '-'} → {s.destination || '-'} on {s.date || '-'}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-gray-900 dark:text-white">Finance</div>
              <div className="text-gray-700 dark:text-gray-300">Base Fare: {formData.baseFare}</div>
              <div className="text-gray-700 dark:text-gray-300">Taxes: {formData.totalTaxes}</div>
              <div className="text-gray-700 dark:text-gray-300">AIT: {formData.ait}</div>
              <div className="text-gray-700 dark:text-gray-300">Salma Air Service Charge: {formData.salmaAirServiceCharge}</div>
              <div className="text-gray-700 dark:text-gray-300">Vendor Service Charge: {formData.vendorServiceCharge}</div>
              <div className="text-gray-700 dark:text-gray-300">Vendor Amount: {formData.vendorAmount}</div>
              <div className="text-gray-700 dark:text-gray-300">Vendor Paid: {formData.vendorPaidFh}</div>
              <div className="text-gray-700 dark:text-gray-300">Vendor Due: {formData.vendorDue}</div>
              <div className="text-gray-700 dark:text-gray-300">Customer Deal: {formData.customerDeal}</div>
              <div className="text-gray-700 dark:text-gray-300">Customer Paid: {formData.customerPaid}</div>
              <div className="text-gray-700 dark:text-gray-300">Customer Due: {formData.customerDue}</div>
              <div className="text-gray-700 dark:text-gray-300">Profit: {formData.profit}</div>
            </div>
          </div>
          <ModalFooter>
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Close
            </button>
            <button
              onClick={async () => {
                setShowPreview(false);
                await new Promise(r => setTimeout(r, 50));
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                const form = document.querySelector('form');
                if (form) form.dispatchEvent(submitEvent);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Confirm & Save
            </button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default NewTicket;
