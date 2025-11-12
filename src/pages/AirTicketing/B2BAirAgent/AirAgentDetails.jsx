import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Building,
  Mail,
  MapPin,
  FileText,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Globe,
  Loader2
} from 'lucide-react';
import { useAirAgent } from '../../../hooks/useB2BAirAgentQueries';

const AirAgentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch agent data
  const { data: agent, isLoading: loading, error: fetchError } = useAirAgent(id);

  const getStatusBadge = (agent) => {
    const isActive = agent?.isActive !== false;
    const status = isActive ? 'Active' : 'Inactive';
    
    const statusConfig = {
      'Active': { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
        icon: CheckCircle 
      },
      'Inactive': { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', 
        icon: AlertCircle 
      },
      'Suspended': { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
        icon: XCircle 
      }
    };

    const config = statusConfig[status] || statusConfig['Inactive'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span>{status}</span>
      </span>
    );
  };

  const handleEdit = () => {
    navigate(`/air-ticketing/agent/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">এজেন্ট তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">এজেন্ট পাওয়া যায়নি</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">যে এজেন্ট দেখতে চাচ্ছেন তা পাওয়া যায়নি।</p>
          <button
            onClick={() => navigate('/air-ticketing/agent')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            এজেন্ট তালিকায় ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => navigate('/air-ticketing/agent')}
                className="p-2 sm:p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  এজেন্ট বিস্তারিত
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  এজেন্টের সকল তথ্য দেখুন
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(agent)}
              <button
                onClick={handleEdit}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">সম্পাদনা করুন</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            
            {/* Agent Information Section */}
            <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                  এজেন্ট তথ্য
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Trade Name
                  </label>
                  <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    {agent.name}
                  </p>
                </div>
                
                {agent.personalName && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Personal Name
                    </label>
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                      {agent.personalName}
                    </p>
                  </div>
                )}

                {(agent.agentId || agent.idCode) && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Agent ID
                    </label>
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                      {agent.agentId || agent.idCode}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                  যোগাযোগ তথ্য
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">
                      {agent.email}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Mobile
                  </label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                      {agent.mobile}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                  ঠিকানা তথ্য
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {agent.address && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Address
                    </label>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                        {agent.address}
                      </p>
                    </div>
                  </div>
                )}

                {agent.city && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      City
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                      {agent.city}
                    </p>
                  </div>
                )}

                {agent.state && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      State
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                      {agent.state}
                    </p>
                  </div>
                )}

                {agent.zipCode && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      ZIP/Post Code
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                      {agent.zipCode}
                    </p>
                  </div>
                )}

                {agent.country && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Country
                    </label>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                        {agent.country}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* KYC Information Section */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                  KYC তথ্য
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {agent.nid && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      National ID (NID)
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                      {agent.nid}
                    </p>
                  </div>
                )}

                {agent.passport && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Passport Number
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                      {agent.passport}
                    </p>
                  </div>
                )}

                {agent.tradeLicense && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Trade License
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                      {agent.tradeLicense}
                    </p>
                  </div>
                )}

                {agent.tinNumber && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      TIN Number
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                      {agent.tinNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {agent.createdAt && (
              <div className="pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {new Date(agent.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirAgentDetails;

