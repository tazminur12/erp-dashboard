import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  RefreshCw, 
  RotateCcw, 
  DollarSign,
  Calendar,
  MapPin,
  Plane,
  User,
  Phone,
  Mail,
  Receipt,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Download
} from 'lucide-react';

const ReissueRefund = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionType, setActionType] = useState(''); // 'reissue' or 'refund'
  const [showActionForm, setShowActionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Form data for reissue/refund
  const [formData, setFormData] = useState({
    newTravelDate: '',
    newDepartureCity: '',
    newArrivalCity: '',
    newAirline: '',
    reason: '',
    additionalCharges: 0,
    refundAmount: 0,
    processingFee: 0,
    finalAmount: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    airline: 'all',
    dateRange: 'all'
  });

  // Mock data for tickets
  useEffect(() => {
    const mockTickets = [
      {
        id: 1,
        pnr: 'BG2401A1B2',
        customerName: 'আহমেদ হোসেন',
        customerPhone: '+880 1712-345678',
        customerEmail: 'ahmed@example.com',
        travelDate: '2024-02-15',
        departureCity: 'Dhaka',
        arrivalCity: 'Dubai',
        airline: 'Biman Bangladesh Airlines',
        airlineCode: 'BG',
        seatClass: 'Economy',
        originalFare: 45000,
        status: 'confirmed',
        bookingDate: '2024-01-20',
        passengerCount: 1,
        baggageAllowance: '20kg',
        mealOption: 'No Meal',
        canReissue: true,
        canRefund: true,
        reissueFee: 2000,
        refundFee: 1500
      },
      {
        id: 2,
        pnr: 'BS2401C3D4',
        customerName: 'ফাতেমা বেগম',
        customerPhone: '+880 1812-345679',
        customerEmail: 'fatema@example.com',
        travelDate: '2024-02-18',
        departureCity: 'Chittagong',
        arrivalCity: 'Doha',
        airline: 'US-Bangla Airlines',
        airlineCode: 'BS',
        seatClass: 'Business',
        originalFare: 85000,
        status: 'confirmed',
        bookingDate: '2024-01-22',
        passengerCount: 2,
        baggageAllowance: '30kg',
        mealOption: 'Vegetarian',
        canReissue: true,
        canRefund: true,
        reissueFee: 3000,
        refundFee: 2500
      },
      {
        id: 3,
        pnr: 'VQ2401E5F6',
        customerName: 'মোহাম্মদ আলী',
        customerPhone: '+880 1912-345680',
        customerEmail: 'mohammad@example.com',
        travelDate: '2024-02-20',
        departureCity: 'Sylhet',
        arrivalCity: 'Istanbul',
        airline: 'NOVOAIR',
        airlineCode: 'VQ',
        seatClass: 'Economy',
        originalFare: 52000,
        status: 'confirmed',
        bookingDate: '2024-01-25',
        passengerCount: 1,
        baggageAllowance: '20kg',
        mealOption: 'No Meal',
        canReissue: false,
        canRefund: true,
        reissueFee: 0,
        refundFee: 2000
      }
    ];

    setTickets(mockTickets);
    setFilteredTickets(mockTickets);
  }, []);

  // Filter tickets
  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customerPhone.includes(searchTerm)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    if (filters.airline !== 'all') {
      filtered = filtered.filter(ticket => ticket.airlineCode === filters.airline);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTicketAction = (ticket, action) => {
    setSelectedTicket(ticket);
    setActionType(action);
    setShowActionForm(true);
    
    // Reset form data
    setFormData({
      newTravelDate: ticket.travelDate,
      newDepartureCity: ticket.departureCity,
      newArrivalCity: ticket.arrivalCity,
      newAirline: ticket.airline,
      reason: '',
      additionalCharges: 0,
      refundAmount: 0,
      processingFee: action === 'refund' ? ticket.refundFee : ticket.reissueFee,
      finalAmount: 0
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateAmounts = () => {
    if (actionType === 'reissue') {
      const additionalCharges = Number(formData.additionalCharges);
      const processingFee = selectedTicket?.reissueFee || 0;
      const finalAmount = additionalCharges + processingFee;
      
      setFormData(prev => ({
        ...prev,
        finalAmount: finalAmount
      }));
    } else if (actionType === 'refund') {
      const refundAmount = Number(formData.refundAmount);
      const processingFee = selectedTicket?.refundFee || 0;
      const finalAmount = refundAmount - processingFee;
      
      setFormData(prev => ({
        ...prev,
        finalAmount: finalAmount
      }));
    }
  };

  useEffect(() => {
    calculateAmounts();
  }, [formData.additionalCharges, formData.refundAmount, actionType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.reason.trim()) {
        throw new Error('Please provide a reason for the action');
      }

      if (actionType === 'reissue') {
        if (!formData.newTravelDate || !formData.newDepartureCity || !formData.newArrivalCity) {
          throw new Error('Please fill in all required fields for reissue');
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (actionType === 'reissue') {
        setSuccess(`Ticket ${selectedTicket.pnr} has been successfully reissued! Additional charges: ৳${formData.finalAmount.toLocaleString()}`);
      } else {
        setSuccess(`Refund processed successfully for ticket ${selectedTicket.pnr}! Refund amount: ৳${formData.finalAmount.toLocaleString()}`);
      }

      // Reset form
      setTimeout(() => {
        setShowActionForm(false);
        setSelectedTicket(null);
        setActionType('');
        setFormData({
          newTravelDate: '',
          newDepartureCity: '',
          newArrivalCity: '',
          newAirline: '',
          reason: '',
          additionalCharges: 0,
          refundAmount: 0,
          processingFee: 0,
          finalAmount: 0
        });
        setSuccess('');
      }, 3000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cities = [
    'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur',
    'Dubai', 'Doha', 'Istanbul', 'Kuala Lumpur', 'Singapore', 'Bangkok', 'Delhi', 'Mumbai'
  ];

  const airlines = [
    { id: 1, name: 'Biman Bangladesh Airlines', iataCode: 'BG' },
    { id: 2, name: 'US-Bangla Airlines', iataCode: 'BS' },
    { id: 3, name: 'NOVOAIR', iataCode: 'VQ' },
    { id: 4, name: 'Air Astra', iataCode: '2A' },
    { id: 5, name: 'Emirates', iataCode: 'EK' },
    { id: 6, name: 'Qatar Airways', iataCode: 'QR' },
    { id: 7, name: 'Turkish Airlines', iataCode: 'TK' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                পুনরায় ইস্যু / রিফান্ড
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                বিদ্যমান টিকিট পুনরায় ইস্যু বা রিফান্ড করুন
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {success}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="PNR, গ্রাহকের নাম, বা ফোন নম্বর দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="confirmed">নিশ্চিতকৃত</option>
                <option value="pending">অপেক্ষমান</option>
              </select>

              <select
                value={filters.airline}
                onChange={(e) => handleFilterChange('airline', e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">সব এয়ারলাইন</option>
                {airlines.map((airline) => (
                  <option key={airline.id} value={airline.iataCode}>
                    {airline.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    টিকিট তথ্য
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    গ্রাহক
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ভ্রমণ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ভাড়া
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ফি
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {ticket.pnr}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {ticket.airline}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Class: {ticket.seatClass}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {ticket.customerName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {ticket.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {ticket.travelDate}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {ticket.departureCity} → {ticket.arrivalCity}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ৳{ticket.originalFare.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {ticket.canReissue && (
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            Reissue: ৳{ticket.reissueFee}
                          </div>
                        )}
                        {ticket.canRefund && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            Refund: ৳{ticket.refundFee}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {ticket.canReissue && (
                          <button
                            onClick={() => handleTicketAction(ticket, 'reissue')}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                            title="Reissue Ticket"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Reissue
                          </button>
                        )}
                        {ticket.canRefund && (
                          <button
                            onClick={() => handleTicketAction(ticket, 'refund')}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 flex items-center"
                            title="Refund Ticket"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                কোন টিকিট পাওয়া যায়নি
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                আপনার অনুসন্ধানের সাথে মিলে এমন কোন টিকিট নেই।
              </p>
            </div>
          )}
        </div>

        {/* Action Form Modal */}
        {showActionForm && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {actionType === 'reissue' ? 'টিকিট পুনরায় ইস্যু' : 'টিকিট রিফান্ড'} - {selectedTicket.pnr}
                  </h2>
                  <button
                    onClick={() => setShowActionForm(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Original Ticket Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      মূল টিকিটের তথ্য
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">গ্রাহক:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedTicket.customerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">ভ্রমণের তারিখ:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedTicket.travelDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">উৎস:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedTicket.departureCity}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">গন্তব্য:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedTicket.arrivalCity}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">মূল ভাড়া:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">৳{selectedTicket.originalFare.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Specific Fields */}
                  {actionType === 'reissue' ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        নতুন ভ্রমণের তথ্য
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            নতুন ভ্রমণের তারিখ *
                          </label>
                          <input
                            type="date"
                            name="newTravelDate"
                            value={formData.newTravelDate}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            নতুন এয়ারলাইন
                          </label>
                          <select
                            name="newAirline"
                            value={formData.newAirline}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {airlines.map((airline) => (
                              <option key={airline.id} value={airline.name}>
                                {airline.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            নতুন উৎস শহর
                          </label>
                          <select
                            name="newDepartureCity"
                            value={formData.newDepartureCity}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {cities.map((city, index) => (
                              <option key={index} value={city}>{city}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            নতুন গন্তব্য শহর
                          </label>
                          <select
                            name="newArrivalCity"
                            value={formData.newArrivalCity}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {cities.map((city, index) => (
                              <option key={index} value={city}>{city}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          অতিরিক্ত ভাড়া
                        </label>
                        <input
                          type="number"
                          name="additionalCharges"
                          value={formData.additionalCharges}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        রিফান্ড তথ্য
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          রিফান্ডের পরিমাণ
                        </label>
                        <input
                          type="number"
                          name="refundAmount"
                          value={formData.refundAmount}
                          onChange={handleFormChange}
                          max={selectedTicket.originalFare}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          সর্বোচ্চ: ৳{selectedTicket.originalFare.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Common Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      কারণ *
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="পুনরায় ইস্যু/রিফান্ডের কারণ লিখুন..."
                      required
                    />
                  </div>

                  {/* Fee Breakdown */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      ফি বিবরণ
                    </h3>
                    <div className="space-y-2 text-sm">
                      {actionType === 'reissue' && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Reissue Fee:</span>
                          <span className="text-gray-900 dark:text-white">৳{selectedTicket.reissueFee}</span>
                        </div>
                      )}
                      {actionType === 'refund' && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Refund Fee:</span>
                          <span className="text-gray-900 dark:text-white">৳{selectedTicket.refundFee}</span>
                        </div>
                      )}
                      {actionType === 'reissue' && formData.additionalCharges > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Additional Charges:</span>
                          <span className="text-gray-900 dark:text-white">৳{formData.additionalCharges}</span>
                        </div>
                      )}
                      {actionType === 'refund' && formData.refundAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Refund Amount:</span>
                          <span className="text-gray-900 dark:text-white">৳{formData.refundAmount}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-900 dark:text-white">
                            {actionType === 'reissue' ? 'Total Additional Cost:' : 'Net Refund Amount:'}
                          </span>
                          <span className="text-blue-600 dark:text-blue-400">
                            ৳{formData.finalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowActionForm(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      বাতিল করুন
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          প্রক্রিয়াকরণ...
                        </>
                      ) : (
                        <>
                          {actionType === 'reissue' ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              পুনরায় ইস্যু করুন
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              রিফান্ড করুন
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReissueRefund;
