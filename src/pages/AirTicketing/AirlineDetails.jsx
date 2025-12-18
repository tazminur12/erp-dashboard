import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
  Users,
  BarChart3,
  DollarSign,
  Award,
  Activity,
  Building,
  Map,
  Download,
  Share2,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import useAirlineQueries from '../../hooks/useAirlineQueries';

const AirlineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { useGetAirline } = useAirlineQueries();

  // Fetch airline data from API
  const { data: airline, isLoading, error, refetch } = useGetAirline(id);

  // Handle navigation to edit page
  const handleEdit = () => {
    // Navigate to edit page or open edit modal
    // For now, navigate back to list and we can implement edit modal later
    navigate(`/air-ticketing/airline`);
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

  const renderOverview = () => {
    if (!airline) return null;

    return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Routes</p>
                <p className="text-3xl font-bold text-blue-600">{airline.routes || 0}</p>
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
                <p className="text-3xl font-bold text-green-600">{airline.fleet || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Plane className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
          {airline.revenue && (
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
          )}
        
          {airline.employees && (
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
          )}
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
              {airline.headquarters && (
            <div className="flex items-start">
              <Building className="w-5 h-5 text-gray-400 mt-1 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Headquarters</p>
                <p className="text-sm text-gray-600">{airline.headquarters}</p>
              </div>
            </div>
              )}
              {airline.established && (
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-400 mt-1 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Established</p>
                <p className="text-sm text-gray-600">{airline.established}</p>
              </div>
            </div>
              )}
              {airline.country && (
            <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1 mr-3" />
              <div>
                    <p className="text-sm font-medium text-gray-900">Country</p>
                    <p className="text-sm text-gray-600">{airline.country}</p>
              </div>
            </div>
              )}
            </div>
            <div className="space-y-4">
            <div className="flex items-start">
              <Activity className="w-5 h-5 text-gray-400 mt-1 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(airline.status || 'Active')}`}>
                    {airline.status || 'Active'}
                </span>
                </div>
              </div>
              {airline.airlineId && (
                <div className="flex items-start">
                  <Award className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Airline ID</p>
                    <p className="text-sm text-gray-600">{airline.airlineId}</p>
                  </div>
                </div>
              )}
          </div>
        </div>
        
          {airline.description && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">About {airline.name}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{airline.description}</p>
        </div>
          )}
      </div>

      {/* Contact Information */}
        {(airline.phone || airline.email || airline.website) && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {airline.phone && (
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Phone</p>
              <p className="text-sm text-gray-600">{airline.phone}</p>
            </div>
          </div>
              )}
              {airline.email && (
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-600">{airline.email}</p>
            </div>
          </div>
              )}
              {airline.website && (
          <div className="flex items-center">
            <Globe className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Website</p>
                    <a 
                      href={airline.website.startsWith('http') ? airline.website : `https://${airline.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                {airline.website}
              </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
  };

  const renderRoutes = () => {
    if (!airline) return null;

    return (
    <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Map className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Route Network</h3>
            <p className="text-sm text-gray-600">Route information coming soon</p>
        </div>
      </div>
    </div>
  );
  };

  const renderFleet = () => {
    if (!airline) return null;

    return (
    <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Plane className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fleet Overview</h3>
            <p className="text-sm text-gray-600">Fleet information coming soon</p>
        </div>
        </div>
      </div>
    );
  };

  const renderFinancials = () => {
    if (!airline) return null;

    if (!airline.revenue && !airline.profit && !airline.passengerCapacity && !airline.cargoCapacity) {
      return (
        <div className="text-center py-12 text-gray-500">
          <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Financial information not available</p>
    </div>
  );
    }

    return (
    <div className="space-y-6">
      <Helmet>
        <title>Airline Details - {airline.name}</title>
        <meta name="description" content="View the details of the airline." />
      </Helmet>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(airline.revenue || airline.profit) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Profit</h3>
          <div className="space-y-4">
                {airline.revenue && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Annual Revenue</span>
              <span className="text-lg font-semibold text-green-600">{formatCurrency(airline.revenue)}</span>
            </div>
                )}
                {airline.profit && (
                  <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Annual Profit</span>
              <span className="text-lg font-semibold text-blue-600">{formatCurrency(airline.profit)}</span>
            </div>
                    {airline.revenue && airline.profit && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Profit Margin</span>
              <span className="text-lg font-semibold text-purple-600">
                {((airline.profit / airline.revenue) * 100).toFixed(1)}%
              </span>
            </div>
                    )}
                  </>
                )}
          </div>
        </div>
          )}

          {(airline.passengerCapacity || airline.cargoCapacity) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Metrics</h3>
          <div className="space-y-4">
                {airline.passengerCapacity && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Passenger Capacity</span>
              <span className="text-lg font-semibold text-orange-600">{formatNumber(airline.passengerCapacity)}</span>
            </div>
                )}
                {airline.cargoCapacity && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cargo Capacity (kg)</span>
              <span className="text-lg font-semibold text-indigo-600">{formatNumber(airline.cargoCapacity)}</span>
            </div>
                )}
                {airline.revenue && airline.passengerCapacity && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue per Passenger</span>
              <span className="text-lg font-semibold text-teal-600">
                {formatCurrency(airline.revenue / airline.passengerCapacity)}
              </span>
            </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPerformance = () => {
    if (!airline) return null;

    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-gray-500">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Performance metrics coming soon</p>
      </div>
    </div>
  );
  };

  const renderRecentTickets = () => {
    if (!airline) return null;

    return (
    <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Ticket Sales</h3>
            <p className="text-sm text-gray-600">Ticket information coming soon</p>
        </div>
      </div>
    </div>
  );
  };

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

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading airline details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading airline: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!airline) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Airline not found</p>
          <button
            onClick={() => navigate('/air-ticketing/airline')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Airlines
          </button>
        </div>
      </div>
    );
  }

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
            <button 
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center space-x-6">
            <img
              src={airline.logo || '/api/placeholder/120/80'}
              alt={airline.name}
              className="w-20 h-20 rounded-xl border border-gray-200 object-cover"
              onError={(e) => {
                e.target.src = '/api/placeholder/120/80';
              }}
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{airline.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                {airline.code && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {airline.code}
                </span>
                )}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(airline.status || 'Active')}`}>
                  {airline.status || 'Active'}
                </span>
                {airline.headquarters && (
                <span className="text-sm text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {airline.headquarters}
                </span>
                )}
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
