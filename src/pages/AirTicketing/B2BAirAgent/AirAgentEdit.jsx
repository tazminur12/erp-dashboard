import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Edit,
  Mail,
  MapPin,
  Eye,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAirAgent, useUpdateAirAgent } from '../../../hooks/useB2BAirAgentQueries';

const AirAgentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const updateMutation = useUpdateAirAgent();
  
  // Fetch agent data
  const { data: agent, isLoading: loading, error: fetchError } = useAirAgent(id);
  
  const [formData, setFormData] = useState({
    name: '',
    personalName: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh',
    nid: '',
    passport: '',
    tradeLicense: '',
    tinNumber: ''
  });

  // Load agent data into form when fetched
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        personalName: agent.personalName || '',
        email: agent.email || '',
        mobile: agent.mobile || '',
        address: agent.address || '',
        city: agent.city || '',
        state: agent.state || '',
        zipCode: agent.zipCode || '',
        country: agent.country || 'Bangladesh',
        nid: agent.nid || '',
        passport: agent.passport || '',
        tradeLicense: agent.tradeLicense || '',
        tinNumber: agent.tinNumber || ''
      });
    }
  }, [agent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form
      if (!formData.name) {
        throw new Error('Please fill Trade Name');
      }

      if (!formData.email || !formData.mobile) {
        throw new Error('Please fill Email and Mobile number');
      }

      // Update agent using mutation
      await updateMutation.mutateAsync({
        agentId: id,
        agentData: formData
      });
      
      // Navigate to agent details after successful update
      setTimeout(() => {
        navigate(`/air-ticketing/agent/${id}`);
      }, 1000);

    } catch (error) {
      // Error is handled by the mutation hook's onError
      console.error('Error updating agent:', error);
    }
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">যে এজেন্ট সম্পাদনা করতে চাচ্ছেন তা পাওয়া যায়নি।</p>
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => navigate(`/air-ticketing/agent/${id}`)}
                className="p-2 sm:p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  এজেন্ট সম্পাদনা
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  এজেন্টের তথ্য আপডেট করুন
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
            
            {/* Agent Information Section */}
            <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                  এজেন্ট তথ্য
                </h2>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trade Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                    placeholder="Your Trade Name"
                    required
                  />
                </div>
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
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Personal Name
                  </label>
                  <input
                    type="text"
                    name="personalName"
                    value={formData.personalName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                    placeholder="Personal/Real Name"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                    placeholder="agent@example.com"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                    placeholder="+880 1XXX XXXXXX"
                    required
                  />
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
              
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 resize-none"
                    placeholder="Street address, building, area"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                      placeholder="State/Division"
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ZIP/Post Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                      placeholder="ZIP/Postal Code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="India">India</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Nepal">Nepal</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Thailand">Thailand</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
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
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    National ID (NID)
                  </label>
                  <input
                    type="text"
                    name="nid"
                    value={formData.nid}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                    placeholder="National ID Number"
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    name="passport"
                    value={formData.passport}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                    placeholder="Passport Number"
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trade License
                  </label>
                  <input
                    type="text"
                    name="tradeLicense"
                    value={formData.tradeLicense}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                    placeholder="Trade License Number"
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    TIN Number
                  </label>
                  <input
                    type="text"
                    name="tinNumber"
                    value={formData.tinNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                    placeholder="Tax Identification Number"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate(`/air-ticketing/agent/${id}`)}
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>ফিরে যান</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate(`/air-ticketing/agent/${id}`)}
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  <span>বিস্তারিত দেখুন</span>
                </button>

                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400 font-medium flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  {updateMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span>আপডেট হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      <span>আপডেট করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AirAgentEdit;

