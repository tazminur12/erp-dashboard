import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Printer, 
  XCircle, 
  Download,
  Calendar,
  MapPin,
  Plane,
  User,
  Phone,
  Mail,
  DollarSign,
  FileText
} from 'lucide-react';

const TicketList = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    airline: 'all',
    dateRange: 'all',
    customer: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

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
        totalFare: 45000,
        status: 'confirmed',
        bookingDate: '2024-01-20',
        passengerCount: 1,
        baggageAllowance: '20kg',
        mealOption: 'No Meal'
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
        totalFare: 85000,
        status: 'confirmed',
        bookingDate: '2024-01-22',
        passengerCount: 2,
        baggageAllowance: '30kg',
        mealOption: 'Vegetarian'
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
        totalFare: 52000,
        status: 'pending',
        bookingDate: '2024-01-25',
        passengerCount: 1,
        baggageAllowance: '20kg',
        mealOption: 'No Meal'
      },
      {
        id: 4,
        pnr: 'EK2401G7H8',
        customerName: 'আয়েশা খাতুন',
        customerPhone: '+880 1612-345681',
        customerEmail: 'ayesha@example.com',
        travelDate: '2024-02-22',
        departureCity: 'Dhaka',
        arrivalCity: 'Kuala Lumpur',
        airline: 'Emirates',
        airlineCode: 'EK',
        seatClass: 'First Class',
        totalFare: 120000,
        status: 'confirmed',
        bookingDate: '2024-01-28',
        passengerCount: 1,
        baggageAllowance: '40kg',
        mealOption: 'Special Meal'
      },
      {
        id: 5,
        pnr: 'QR2401I9J0',
        customerName: 'রহমান মিয়া',
        customerPhone: '+880 1512-345682',
        customerEmail: 'rahman@example.com',
        travelDate: '2024-02-25',
        departureCity: 'Rajshahi',
        arrivalCity: 'Singapore',
        airline: 'Qatar Airways',
        airlineCode: 'QR',
        seatClass: 'Economy',
        totalFare: 48000,
        status: 'cancelled',
        bookingDate: '2024-01-30',
        passengerCount: 1,
        baggageAllowance: '20kg',
        mealOption: 'No Meal'
      }
    ];

    setTickets(mockTickets);
    setFilteredTickets(mockTickets);
    setLoading(false);
  }, []);

  // Filter tickets based on search and filters
  useEffect(() => {
    let filtered = tickets;

    // Search by customer name, PNR, or phone
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customerPhone.includes(searchTerm)
      );
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    // Filter by airline
    if (filters.airline !== 'all') {
      filtered = filtered.filter(ticket => ticket.airlineCode === filters.airline);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const today = new Date();
      const travelDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(ticket => {
            const ticketDate = new Date(ticket.travelDate);
            return ticketDate.toDateString() === today.toDateString();
          });
          break;
        case 'week':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(ticket => {
            const ticketDate = new Date(ticket.travelDate);
            return ticketDate >= today && ticketDate <= weekFromNow;
          });
          break;
        case 'month':
          const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(ticket => {
            const ticketDate = new Date(ticket.travelDate);
            return ticketDate >= today && ticketDate <= monthFromNow;
          });
          break;
        default:
          break;
      }
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'নিশ্চিতকৃত';
      case 'pending':
        return 'অপেক্ষমান';
      case 'cancelled':
        return 'বাতিলকৃত';
      default:
        return status;
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleEditTicket = (ticketId) => {
    navigate(`/air-ticketing/edit-ticket/${ticketId}`);
  };

  const handlePrintTicket = (ticket) => {
    // Simulate printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket - ${ticket.pnr}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .ticket-info { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; }
            .value { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Air Ticket</h1>
            <h2>PNR: ${ticket.pnr}</h2>
          </div>
          <div class="ticket-info">
            <div class="row">
              <span class="label">Customer:</span>
              <span class="value">${ticket.customerName}</span>
            </div>
            <div class="row">
              <span class="label">From:</span>
              <span class="value">${ticket.departureCity}</span>
            </div>
            <div class="row">
              <span class="label">To:</span>
              <span class="value">${ticket.arrivalCity}</span>
            </div>
            <div class="row">
              <span class="label">Date:</span>
              <span class="value">${ticket.travelDate}</span>
            </div>
            <div class="row">
              <span class="label">Airline:</span>
              <span class="value">${ticket.airline}</span>
            </div>
            <div class="row">
              <span class="label">Total Fare:</span>
              <span class="value">৳${ticket.totalFare.toLocaleString()}</span>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCancelTicket = (ticketId) => {
    if (window.confirm('Are you sure you want to cancel this ticket?')) {
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: 'cancelled' }
          : ticket
      ));
    }
  };

  const exportToExcel = () => {
    // Simulate Excel export
    const csvContent = [
      ['PNR', 'Customer Name', 'Phone', 'Email', 'Travel Date', 'From', 'To', 'Airline', 'Class', 'Fare', 'Status'],
      ...filteredTickets.map(ticket => [
        ticket.pnr,
        ticket.customerName,
        ticket.customerPhone,
        ticket.customerEmail,
        ticket.travelDate,
        ticket.departureCity,
        ticket.arrivalCity,
        ticket.airline,
        ticket.seatClass,
        ticket.totalFare,
        ticket.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const airlines = [
    { code: 'BG', name: 'Biman Bangladesh Airlines' },
    { code: 'BS', name: 'US-Bangla Airlines' },
    { code: 'VQ', name: 'NOVOAIR' },
    { code: 'EK', name: 'Emirates' },
    { code: 'QR', name: 'Qatar Airways' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              টিকিট তালিকা
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              সমস্ত ইস্যুকৃত টিকিটের তালিকা ও ব্যবস্থাপনা
            </p>
          </div>
          <button
            onClick={() => navigate('/air-ticketing/new-ticket')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            নতুন টিকিট
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
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

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <Filter className="w-5 h-5 mr-2" />
              ফিল্টার
            </button>

            {/* Export */}
            <button
              onClick={exportToExcel}
              className="flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <Download className="w-5 h-5 mr-2" />
              Excel ডাউনলোড
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    স্ট্যাটাস
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">সব স্ট্যাটাস</option>
                    <option value="confirmed">নিশ্চিতকৃত</option>
                    <option value="pending">অপেক্ষমান</option>
                    <option value="cancelled">বাতিলকৃত</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    এয়ারলাইন
                  </label>
                  <select
                    value={filters.airline}
                    onChange={(e) => handleFilterChange('airline', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">সব এয়ারলাইন</option>
                    {airlines.map((airline) => (
                      <option key={airline.code} value={airline.code}>
                        {airline.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ভ্রমণের তারিখ
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">সব তারিখ</option>
                    <option value="today">আজ</option>
                    <option value="week">এই সপ্তাহ</option>
                    <option value="month">এই মাস</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    মোট টিকিট: {filteredTickets.length}
                  </label>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    মোট: {tickets.length}
                  </div>
                </div>
              </div>
            </div>
          )}
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
                    এয়ারলাইন
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ভাড়া
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    স্ট্যাটাস
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
                          {ticket.bookingDate}
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
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {ticket.customerEmail}
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
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {ticket.passengerCount} passenger(s)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {ticket.airline}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {ticket.airlineCode}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {ticket.baggageAllowance}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ৳{ticket.totalFare.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewTicket(ticket)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Ticket"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditTicket(ticket.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Edit Ticket"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintTicket(ticket)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          title="Print Ticket"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelTicket(ticket.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Cancel Ticket"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
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
      </div>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  টিকিট বিবরণ - {selectedTicket.pnr}
                </h2>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    গ্রাহকের তথ্য
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">নাম</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.customerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">ফোন</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.customerPhone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">ইমেইল</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.customerEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">যাত্রীর সংখ্যা</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.passengerCount}</p>
                    </div>
                  </div>
                </div>

                {/* Travel Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Plane className="w-5 h-5 mr-2 text-green-600" />
                    ভ্রমণের তথ্য
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">ভ্রমণের তারিখ</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.travelDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">বুকিং তারিখ</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.bookingDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">উৎস</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.departureCity}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">গন্তব্য</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.arrivalCity}</p>
                    </div>
                  </div>
                </div>

                {/* Airline & Fare */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                    এয়ারলাইন ও ভাড়া
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">এয়ারলাইন</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.airline}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">সিট ক্লাস</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.seatClass}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">ব্যাগেজ</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.baggageAllowance}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">মিল</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.mealOption}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">মোট ভাড়া</label>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{selectedTicket.totalFare.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">স্ট্যাটাস</h3>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusText(selectedTicket.status)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  বন্ধ করুন
                </button>
                <button
                  onClick={() => handlePrintTicket(selectedTicket)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  প্রিন্ট করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;
