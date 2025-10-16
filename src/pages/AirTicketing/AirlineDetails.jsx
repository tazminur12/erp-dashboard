import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Calendar, 
  Plane, 
  TrendingUp, 
  TrendingDown,
  Users,
  BarChart3,
  Clock,
  DollarSign,
  Award,
  Activity,
  Building,
  Map,
  Settings,
  Eye,
  Download,
  Share2,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const AirlineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for the airline - in real app, this would come from API
  const [airline, setAirline] = useState({
    id: parseInt(id),
    name: 'Biman Bangladesh Airlines',
    code: 'BG',
    country: 'Bangladesh',
    headquarters: 'Dhaka, Bangladesh',
    phone: '+880-2-8901000',
    email: 'info@biman-airlines.com',
    website: 'www.biman-airlines.com',
    established: '1972',
    status: 'Active',
    routes: 45,
    fleet: 18,
    logo: '/api/placeholder/120/80',
    description: 'Biman Bangladesh Airlines is the national flag carrier of Bangladesh. Established in 1972, it operates domestic and international flights to destinations across Asia, Europe, and the Middle East.',
    ceo: 'Dr. Abu Saleh Mostafa Kamal',
    employees: 4500,
    hub: 'Hazrat Shahjalal International Airport (DAC)',
    alliance: 'None',
    revenue: 850000000,
    profit: 120000000,
    passengerCapacity: 2500000,
    cargoCapacity: 150000
  });

  // Mock data for routes
  const routes = [
    { id: 1, from: 'DAC', to: 'LHR', fromCity: 'Dhaka', toCity: 'London', frequency: 'Daily', aircraft: 'Boeing 777-300ER', distance: '5,247 km' },
    { id: 2, from: 'DAC', to: 'DXB', fromCity: 'Dhaka', toCity: 'Dubai', frequency: 'Daily', aircraft: 'Boeing 787-8', distance: '3,254 km' },
    { id: 3, from: 'DAC', to: 'KUL', fromCity: 'Dhaka', toCity: 'Kuala Lumpur', frequency: '5x Weekly', aircraft: 'Boeing 737-800', distance: '2,156 km' },
    { id: 4, from: 'DAC', to: 'BKK', fromCity: 'Dhaka', toCity: 'Bangkok', frequency: '4x Weekly', aircraft: 'Boeing 737-800', distance: '1,789 km' },
    { id: 5, from: 'DAC', to: 'DEL', fromCity: 'Dhaka', toCity: 'New Delhi', frequency: 'Daily', aircraft: 'ATR 72-600', distance: '1,234 km' }
  ];

  // Mock data for fleet
  const fleet = [
    { id: 1, type: 'Boeing 777-300ER', registration: 'S2-AFR', capacity: 370, status: 'Active', deliveryDate: '2018-03-15', lastMaintenance: '2024-01-15' },
    { id: 2, type: 'Boeing 787-8', registration: 'S2-AFS', capacity: 254, status: 'Active', deliveryDate: '2019-07-22', lastMaintenance: '2024-01-10' },
    { id: 3, type: 'Boeing 737-800', registration: 'S2-AFT', capacity: 162, status: 'Active', deliveryDate: '2020-11-08', lastMaintenance: '2024-01-08' },
    { id: 4, type: 'ATR 72-600', registration: 'S2-AFU', capacity: 70, status: 'Maintenance', deliveryDate: '2021-05-12', lastMaintenance: '2024-01-05' }
  ];

  // Mock data for recent tickets
  const recentTickets = [
    { id: 'BG001', passenger: 'Ahmed Rahman', route: 'DAC → LHR', date: '2024-02-15', amount: 125000, status: 'Confirmed' },
    { id: 'BG002', passenger: 'Fatima Begum', route: 'DAC → DXB', date: '2024-02-14', amount: 85000, status: 'Confirmed' },
    { id: 'BG003', passenger: 'Karim Ali', route: 'DAC → KUL', date: '2024-02-13', amount: 95000, status: 'Pending' },
    { id: 'BG004', passenger: 'Sara Khan', route: 'DAC → BKK', date: '2024-02-12', amount: 78000, status: 'Confirmed' }
  ];

  // Mock data for performance metrics
  const performanceData = {
    onTimePerformance: 87.5,
    loadFactor: 82.3,
    customerSatisfaction: 4.2,
    safetyRating: 4.8
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'routes', name: 'Routes', icon: Map },
    { id: 'fleet', name: 'Fleet', icon: Plane },
    { id: 'financials', name: 'Financials', icon: DollarSign },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'tickets', name: 'Recent Tickets', icon: DollarSign }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Routes</p>
              <p className="text-3xl font-bold text-blue-600">{airline.routes}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Map className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fleet Size</p>
              <p className="text-3xl font-bold text-green-600">{airline.fleet}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Plane className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Annual Revenue</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(airline.revenue)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Employees</p>
              <p className="text-3xl font-bold text-orange-600">{formatNumber(airline.employees)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <Building className="w-5 h-5 text-gray-400 mt-1 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Headquarters</p>
                <p className="text-sm text-gray-600">{airline.headquarters}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-400 mt-1 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Established</p>
                <p className="text-sm text-gray-600">{airline.established}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Award className="w-5 h-5 text-gray-400 mt-1 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">CEO</p>
                <p className="text-sm text-gray-600">{airline.ceo}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <Plane className="w-5 h-5 text-gray-400 mt-1 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Main Hub</p>
                <p className="text-sm text-gray-600">{airline.hub}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="w-5 h-5 text-gray-400 mt-1 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Alliance</p>
                <p className="text-sm text-gray-600">{airline.alliance}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Activity className="w-5 h-5 text-gray-400 mt-1 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(airline.status)}`}>
                  {airline.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">About {airline.name}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{airline.description}</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Phone</p>
              <p className="text-sm text-gray-600">{airline.phone}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-600">{airline.email}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Globe className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Website</p>
              <a href={`https://${airline.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                {airline.website}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRoutes = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Route Network</h3>
          <p className="text-sm text-gray-600 mt-1">Complete list of destinations served by {airline.name}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cities</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aircraft</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{route.from}</span>
                      <ArrowLeft className="w-4 h-4 text-gray-400 mx-2 rotate-180" />
                      <span className="text-sm font-medium text-gray-900">{route.to}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{route.fromCity} → {route.toCity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {route.frequency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.aircraft}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFleet = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Fleet Overview</h3>
          <p className="text-sm text-gray-600 mt-1">Current aircraft in {airline.name} fleet</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aircraft</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Maintenance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fleet.map((aircraft) => (
                <tr key={aircraft.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{aircraft.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {aircraft.registration}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{aircraft.capacity} seats</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(aircraft.status)}`}>
                      {aircraft.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{aircraft.deliveryDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{aircraft.lastMaintenance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFinancials = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Profit</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Annual Revenue</span>
              <span className="text-lg font-semibold text-green-600">{formatCurrency(airline.revenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Annual Profit</span>
              <span className="text-lg font-semibold text-blue-600">{formatCurrency(airline.profit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Profit Margin</span>
              <span className="text-lg font-semibold text-purple-600">
                {((airline.profit / airline.revenue) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Passenger Capacity</span>
              <span className="text-lg font-semibold text-orange-600">{formatNumber(airline.passengerCapacity)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cargo Capacity (kg)</span>
              <span className="text-lg font-semibold text-indigo-600">{formatNumber(airline.cargoCapacity)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue per Passenger</span>
              <span className="text-lg font-semibold text-teal-600">
                {formatCurrency(airline.revenue / airline.passengerCapacity)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On-Time Performance</p>
              <p className="text-3xl font-bold text-green-600">{performanceData.onTimePerformance}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Load Factor</p>
              <p className="text-3xl font-bold text-blue-600">{performanceData.loadFactor}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-yellow-600">{performanceData.customerSatisfaction}</p>
                <Star className="w-5 h-5 text-yellow-500 ml-1" />
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Safety Rating</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-red-600">{performanceData.safetyRating}</p>
                <Award className="w-5 h-5 text-red-500 ml-1" />
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Award className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecentTickets = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Ticket Sales</h3>
          <p className="text-sm text-gray-600 mt-1">Latest ticket bookings for {airline.name} flights</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{ticket.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.passenger}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.route}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(ticket.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'routes': return renderRoutes();
      case 'fleet': return renderFleet();
      case 'financials': return renderFinancials();
      case 'performance': return renderPerformance();
      case 'tickets': return renderRecentTickets();
      default: return renderOverview();
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/air-ticketing/airline')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Airlines
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center space-x-6">
            <img
              src={airline.logo}
              alt={airline.name}
              className="w-20 h-20 rounded-xl border border-gray-200 object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{airline.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {airline.code}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(airline.status)}`}>
                  {airline.status}
                </span>
                <span className="text-sm text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {airline.headquarters}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default AirlineDetails;
