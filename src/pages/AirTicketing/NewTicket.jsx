import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Plane, 
  CreditCard, 
  DollarSign,
  Receipt,
  Send,
  Download,
  Eye
} from 'lucide-react';

const NewTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    
    // Travel Information
    travelDate: '',
    departureCity: '',
    arrivalCity: '',
    passengerCount: 1,
    
    // Airline & Fare
    airline: '',
    baseFare: 0,
    tax: 0,
    serviceCharge: 0,
    totalFare: 0,
    
    // Payment
    paymentMethod: 'cash',
    transactionId: '',
    
    // Additional Details
    pnr: '',
    seatClass: 'economy',
    baggageAllowance: '20kg',
    mealOption: 'no-meal'
  });

  const [airlines] = useState([
    { id: 1, name: 'Biman Bangladesh Airlines', iataCode: 'BG', logo: '🛩️' },
    { id: 2, name: 'US-Bangla Airlines', iataCode: 'BS', logo: '✈️' },
    { id: 3, name: 'NOVOAIR', iataCode: 'VQ', logo: '🛫' },
    { id: 4, name: 'Air Astra', iataCode: '2A', logo: '🚁' },
    { id: 5, name: 'Emirates', iataCode: 'EK', logo: '🛬' },
    { id: 6, name: 'Qatar Airways', iataCode: 'QR', logo: '✈️' },
    { id: 7, name: 'Turkish Airlines', iataCode: 'TK', logo: '🛩️' }
  ]);

  const [cities] = useState([
    'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur',
    'Dubai', 'Doha', 'Istanbul', 'Kuala Lumpur', 'Singapore', 'Bangkok', 'Delhi', 'Mumbai'
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Calculate total fare when components change
  useEffect(() => {
    const total = Number(formData.baseFare) + Number(formData.tax) + Number(formData.serviceCharge);
    setFormData(prev => ({ ...prev, totalFare: total }));
  }, [formData.baseFare, formData.tax, formData.serviceCharge]);

  // Generate PNR
  useEffect(() => {
    if (formData.airline && formData.departureCity && formData.arrivalCity) {
      const airlineCode = airlines.find(a => a.id === Number(formData.airline))?.iataCode || 'XX';
      const date = new Date().toISOString().slice(2, 8).replace(/-/g, '');
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      const pnr = `${airlineCode}${date}${random}`;
      setFormData(prev => ({ ...prev, pnr }));
    }
  }, [formData.airline, formData.departureCity, formData.arrivalCity]);

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

    try {
      // Validate form
      if (!formData.customerName || !formData.customerPhone || !formData.travelDate || 
          !formData.departureCity || !formData.arrivalCity || !formData.airline) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.departureCity === formData.arrivalCity) {
        throw new Error('Departure and arrival cities cannot be the same');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess('Ticket booked successfully! PNR: ' + formData.pnr);
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          travelDate: '',
          departureCity: '',
          arrivalCity: '',
          passengerCount: 1,
          airline: '',
          baseFare: 0,
          tax: 0,
          serviceCharge: 0,
          totalFare: 0,
          paymentMethod: 'cash',
          transactionId: '',
          pnr: '',
          seatClass: 'economy',
          baggageAllowance: '20kg',
          mealOption: 'no-meal'
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
    const serviceCharge = 500;
    
    setFormData(prev => ({
      ...prev,
      baseFare: Math.round(baseFare),
      tax: Math.round(tax),
      serviceCharge: serviceCharge
    }));
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
          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              গ্রাহকের তথ্য
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  গ্রাহকের নাম *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="গ্রাহকের পূর্ণ নাম"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  যোগাযোগ নম্বর *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="০১১১১১১১১১১"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ইমেইল ঠিকানা
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="customer@email.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Travel Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Plane className="w-5 h-5 mr-2 text-green-600" />
              ভ্রমণের তথ্য
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ভ্রমণের তারিখ *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  উৎস শহর *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="departureCity"
                    value={formData.departureCity}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">শহর নির্বাচন করুন</option>
                    {cities.map((city, index) => (
                      <option key={index} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  গন্তব্য শহর *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="arrivalCity"
                    value={formData.arrivalCity}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">শহর নির্বাচন করুন</option>
                    {cities.map((city, index) => (
                      <option key={index} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  যাত্রীর সংখ্যা
                </label>
                <input
                  type="number"
                  name="passengerCount"
                  value={formData.passengerCount}
                  onChange={handleChange}
                  min="1"
                  max="9"
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Airline & Fare */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Plane className="w-5 h-5 mr-2 text-purple-600" />
              এয়ারলাইন ও ভাড়া
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  এয়ারলাইন নির্বাচন *
                </label>
                <select
                  name="airline"
                  value={formData.airline}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">এয়ারলাইন নির্বাচন করুন</option>
                  {airlines.map((airline) => (
                    <option key={airline.id} value={airline.id}>
                      {airline.logo} {airline.name} ({airline.iataCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={calculateFare}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <DollarSign className="w-5 h-5 inline mr-2" />
                  ভাড়া ক্যালকুলেট করুন
                </button>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Base Fare
                </label>
                <input
                  type="number"
                  name="baseFare"
                  value={formData.baseFare}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tax
                </label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Charge
                </label>
                <input
                  type="number"
                  name="serviceCharge"
                  value={formData.serviceCharge}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Fare
                </label>
                <div className="px-3 py-3 bg-gray-100 dark:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ৳{formData.totalFare.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              পেমেন্ট অপশন
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  পেমেন্ট মেথড *
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="cash">ক্যাশ</option>
                  <option value="card">কার্ড</option>
                  <option value="mobile-banking">মোবাইল ব্যাংকিং</option>
                  <option value="bank-transfer">ব্যাংক ট্রান্সফার</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ট্রান্সেকশন আইডি
                </label>
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="TXN123456789"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-orange-600" />
              অতিরিক্ত তথ্য
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PNR
                </label>
                <div className="px-3 py-3 bg-gray-100 dark:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600">
                  <span className="font-mono text-gray-900 dark:text-white">
                    {formData.pnr || 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seat Class
                </label>
                <select
                  name="seatClass"
                  value={formData.seatClass}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="economy">Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Baggage Allowance
                </label>
                <select
                  name="baggageAllowance"
                  value={formData.baggageAllowance}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="20kg">20kg</option>
                  <option value="25kg">25kg</option>
                  <option value="30kg">30kg</option>
                  <option value="40kg">40kg</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meal Option
                </label>
                <select
                  name="mealOption"
                  value={formData.mealOption}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="no-meal">No Meal</option>
                  <option value="veg-meal">Vegetarian</option>
                  <option value="non-veg-meal">Non-Vegetarian</option>
                  <option value="special-meal">Special Meal</option>
                </select>
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
      </div>
    </div>
  );
};

export default NewTicket;
