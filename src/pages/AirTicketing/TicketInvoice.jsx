import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  Mail, 
  Download,
  FileText,
  User,
  Phone,
  Mail as MailIcon,
  Calendar,
  MapPin,
  Plane,
  CreditCard,
  DollarSign,
  Receipt,
  Building,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';

const TicketInvoice = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
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
        customerAddress: 'House 45, Road 12, Dhanmondi, Dhaka-1205',
        travelDate: '2024-02-15',
        departureTime: '14:30',
        arrivalTime: '18:45',
        departureCity: 'Dhaka',
        arrivalCity: 'Dubai',
        airline: 'Biman Bangladesh Airlines',
        airlineCode: 'BG',
        seatClass: 'Economy',
        seatNumber: '12A',
        passengerCount: 1,
        baseFare: 35000,
        tax: 5250,
        serviceCharge: 500,
        totalFare: 40750,
        paymentMethod: 'Credit Card',
        transactionId: 'TXN123456789',
        bookingDate: '2024-01-20',
        status: 'confirmed',
        baggageAllowance: '20kg',
        mealOption: 'No Meal',
        flightNumber: 'BG-123',
        gate: 'A12',
        boardingTime: '14:00'
      },
      {
        id: 2,
        pnr: 'BS2401C3D4',
        customerName: 'ফাতেমা বেগম',
        customerPhone: '+880 1812-345679',
        customerEmail: 'fatema@example.com',
        customerAddress: 'House 78, Road 8, Banani, Dhaka-1213',
        travelDate: '2024-02-18',
        departureTime: '09:15',
        arrivalTime: '13:30',
        departureCity: 'Chittagong',
        arrivalCity: 'Doha',
        airline: 'US-Bangla Airlines',
        airlineCode: 'BS',
        seatClass: 'Business',
        seatNumber: '3B',
        passengerCount: 2,
        baseFare: 70000,
        tax: 10500,
        serviceCharge: 800,
        totalFare: 81300,
        paymentMethod: 'Mobile Banking',
        transactionId: 'TXN987654321',
        bookingDate: '2024-01-22',
        status: 'confirmed',
        baggageAllowance: '30kg',
        mealOption: 'Vegetarian',
        flightNumber: 'BS-456',
        gate: 'B8',
        boardingTime: '08:45'
      },
      {
        id: 3,
        pnr: 'VQ2401E5F6',
        customerName: 'মোহাম্মদ আলী',
        customerPhone: '+880 1912-345680',
        customerEmail: 'mohammad@example.com',
        customerAddress: 'House 23, Road 5, Gulshan-2, Dhaka-1212',
        travelDate: '2024-02-20',
        departureTime: '16:45',
        arrivalTime: '22:15',
        departureCity: 'Sylhet',
        arrivalCity: 'Istanbul',
        airline: 'NOVOAIR',
        airlineCode: 'VQ',
        seatClass: 'Economy',
        seatNumber: '15C',
        passengerCount: 1,
        baseFare: 42000,
        tax: 6300,
        serviceCharge: 500,
        totalFare: 48800,
        paymentMethod: 'Cash',
        transactionId: 'TXN456789123',
        bookingDate: '2024-01-25',
        status: 'confirmed',
        baggageAllowance: '20kg',
        mealOption: 'No Meal',
        flightNumber: 'VQ-789',
        gate: 'C15',
        boardingTime: '16:15'
      }
    ];

    setTickets(mockTickets);
    setFilteredTickets(mockTickets);
    
    // If ticketId is provided, find and select that ticket
    if (ticketId) {
      const ticket = mockTickets.find(t => t.id === parseInt(ticketId));
      if (ticket) {
        setSelectedTicket(ticket);
        setShowInvoiceModal(true);
      }
    }
    
    setLoading(false);
  }, [ticketId]);

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

  const handleViewInvoice = (ticket) => {
    setSelectedTicket(ticket);
    setShowInvoiceModal(true);
  };

  const handlePrintInvoice = (ticket) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${ticket.pnr}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #2563eb; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .company-info {
              text-align: center;
              margin-bottom: 30px;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .customer-info, .ticket-info {
              flex: 1;
            }
            .section {
              margin-bottom: 25px;
            }
            .section h3 {
              color: #2563eb;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
            }
            .label { 
              font-weight: bold; 
              color: #6b7280;
            }
            .value { 
              text-align: right; 
              color: #111827;
            }
            .total-row {
              border-top: 2px solid #2563eb;
              padding-top: 10px;
              margin-top: 15px;
              font-size: 18px;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="color: #2563eb; margin: 0;">AIR TICKET INVOICE</h1>
            <h2 style="margin: 10px 0; color: #374151;">PNR: ${ticket.pnr}</h2>
          </div>
          
          <div class="company-info">
            <h3 style="margin: 0; color: #2563eb;">Travel Agency Name</h3>
            <p style="margin: 5px 0;">123 Travel Street, Dhaka-1200, Bangladesh</p>
            <p style="margin: 5px 0;">Phone: +880 2-955-1234 | Email: info@travelagency.com</p>
          </div>
          
          <div class="invoice-details">
            <div class="customer-info">
              <div class="section">
                <h3>Customer Information</h3>
                <div class="row">
                  <span class="label">Name:</span>
                  <span class="value">${ticket.customerName}</span>
                </div>
                <div class="row">
                  <span class="label">Phone:</span>
                  <span class="value">${ticket.customerPhone}</span>
                </div>
                <div class="row">
                  <span class="label">Email:</span>
                  <span class="value">${ticket.customerEmail}</span>
                </div>
                <div class="row">
                  <span class="label">Address:</span>
                  <span class="value">${ticket.customerAddress}</span>
                </div>
              </div>
            </div>
            
            <div class="ticket-info">
              <div class="section">
                <h3>Ticket Information</h3>
                <div class="row">
                  <span class="label">Booking Date:</span>
                  <span class="value">${ticket.bookingDate}</span>
                </div>
                <div class="row">
                  <span class="label">Travel Date:</span>
                  <span class="value">${ticket.travelDate}</span>
                </div>
                <div class="row">
                  <span class="label">Flight:</span>
                  <span class="value">${ticket.flightNumber}</span>
                </div>
                <div class="row">
                  <span class="label">Status:</span>
                  <span class="value">${ticket.status}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h3>Journey Details</h3>
            <div class="row">
              <span class="label">From:</span>
              <span class="value">${ticket.departureCity} (${ticket.departureTime})</span>
            </div>
            <div class="row">
              <span class="label">To:</span>
              <span class="value">${ticket.arrivalCity} (${ticket.arrivalTime})</span>
            </div>
            <div class="row">
              <span class="label">Airline:</span>
              <span class="value">${ticket.airline}</span>
            </div>
            <div class="row">
              <span class="label">Class:</span>
              <span class="value">${ticket.seatClass} - Seat ${ticket.seatNumber}</span>
            </div>
            <div class="row">
              <span class="label">Passengers:</span>
              <span class="value">${ticket.passengerCount}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>Fare Breakdown</h3>
            <div class="row">
              <span class="label">Base Fare:</span>
              <span class="value">৳${ticket.baseFare.toLocaleString()}</span>
            </div>
            <div class="row">
              <span class="label">Tax:</span>
              <span class="value">৳${ticket.tax.toLocaleString()}</span>
            </div>
            <div class="row">
              <span class="label">Service Charge:</span>
              <span class="value">৳${ticket.serviceCharge.toLocaleString()}</span>
            </div>
            <div class="row total-row">
              <span class="label">Total Amount:</span>
              <span class="value">৳${ticket.totalFare.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>Payment Information</h3>
            <div class="row">
              <span class="label">Payment Method:</span>
              <span class="value">${ticket.paymentMethod}</span>
            </div>
            <div class="row">
              <span class="label">Transaction ID:</span>
              <span class="value">${ticket.transactionId}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing our travel services!</p>
            <p>This is a computer generated invoice. No signature required.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleEmailInvoice = async (ticket) => {
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(`Invoice for ${ticket.pnr} has been sent to ${ticket.customerEmail}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to send email. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const exportToPDF = (ticket) => {
    // Simulate PDF export
    setSuccess(`Invoice for ${ticket.pnr} is being prepared for download...`);
    setTimeout(() => setSuccess(''), 3000);
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading invoices...</p>
        </div>
      </div>
    );
  }

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
                টিকিট ইনভয়েস
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                গ্রাহকদের জন্য টিকিট ইনভয়েস তৈরি ও ব্যবস্থাপনা
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
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
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
                <option value="cancelled">বাতিলকৃত</option>
              </select>

              <select
                value={filters.airline}
                onChange={(e) => handleFilterChange('airline', e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">সব এয়ারলাইন</option>
                {airlines.map((airline) => (
                  <option key={airline.code} value={airline.code}>
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
                    পেমেন্ট
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
                          {ticket.flightNumber} • {ticket.seatClass}
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
                          {ticket.departureTime} - {ticket.arrivalTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ৳{ticket.totalFare.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Base: ৳{ticket.baseFare.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {ticket.paymentMethod}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {ticket.transactionId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewInvoice(ticket)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(ticket)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEmailInvoice(ticket)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          title="Email Invoice"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => exportToPDF(ticket)}
                          className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
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

        {/* Invoice Detail Modal */}
        {showInvoiceModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    টিকিট ইনভয়েস - {selectedTicket.pnr}
                  </h2>
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Company Header */}
                <div className="text-center border-b-2 border-blue-600 pb-6 mb-6">
                  <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    AIR TICKET INVOICE
                  </h1>
                  <div className="mt-2 text-gray-600 dark:text-gray-400">
                    <p className="font-semibold">Travel Agency Name</p>
                    <p>123 Travel Street, Dhaka-1200, Bangladesh</p>
                    <p>Phone: +880 2-955-1234 | Email: info@travelagency.com</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Customer Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      গ্রাহকের তথ্য
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">নাম:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{selectedTicket.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">ফোন:</span>
                        <span className="text-gray-900 dark:text-white">{selectedTicket.customerPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">ইমেইল:</span>
                        <span className="text-gray-900 dark:text-white">{selectedTicket.customerEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">ঠিকানা:</span>
                        <span className="text-gray-900 dark:text-white text-right">{selectedTicket.customerAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <Receipt className="w-5 h-5 mr-2 text-green-600" />
                      টিকিটের তথ্য
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">PNR:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{selectedTicket.pnr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">বুকিং তারিখ:</span>
                        <span className="text-gray-900 dark:text-white">{selectedTicket.bookingDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">ফ্লাইট নম্বর:</span>
                        <span className="text-gray-900 dark:text-white">{selectedTicket.flightNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">স্ট্যাটাস:</span>
                        <span className="text-gray-900 dark:text-white">{selectedTicket.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Journey Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Plane className="w-5 h-5 mr-2 text-purple-600" />
                    ভ্রমণের বিবরণ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">উৎস</label>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedTicket.departureCity}</p>
                      <p className="text-gray-500 dark:text-gray-400">{selectedTicket.departureTime}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">✈️</div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ফ্লাইট</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">গন্তব্য</label>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedTicket.arrivalCity}</p>
                      <p className="text-gray-500 dark:text-gray-400">{selectedTicket.arrivalTime}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">এয়ারলাইন</label>
                      <p className="text-gray-900 dark:text-white">{selectedTicket.airline}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">সিট ক্লাস</label>
                      <p className="text-gray-900 dark:text-white">{selectedTicket.seatClass}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">সিট নম্বর</label>
                      <p className="text-gray-900 dark:text-white">{selectedTicket.seatNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">যাত্রীর সংখ্যা</label>
                      <p className="text-gray-900 dark:text-white">{selectedTicket.passengerCount}</p>
                    </div>
                  </div>
                </div>

                {/* Fare Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    ভাড়ার বিবরণ
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Base Fare:</span>
                      <span className="text-gray-900 dark:text-white">৳{selectedTicket.baseFare.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Tax:</span>
                      <span className="text-gray-900 dark:text-white">৳{selectedTicket.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Service Charge:</span>
                      <span className="text-gray-900 dark:text-white">৳{selectedTicket.serviceCharge.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-gray-900 dark:text-white">মোট পরিমাণ:</span>
                        <span className="text-blue-600 dark:text-blue-400">৳{selectedTicket.totalFare.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                    পেমেন্টের তথ্য
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">পেমেন্ট মেথড</label>
                      <p className="text-gray-900 dark:text-white">{selectedTicket.paymentMethod}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">ট্রান্সেকশন আইডি</label>
                      <p className="text-gray-900 dark:text-white">{selectedTicket.transactionId}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    বন্ধ করুন
                  </button>
                  <button
                    onClick={() => handlePrintInvoice(selectedTicket)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    প্রিন্ট করুন
                  </button>
                  <button
                    onClick={() => handleEmailInvoice(selectedTicket)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    ইমেইল করুন
                  </button>
                  <button
                    onClick={() => exportToPDF(selectedTicket)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF ডাউনলোড
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketInvoice;
