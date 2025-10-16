import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  MessageCircle,
  FileText,
  Building,
  User,
  Shield,
  Globe,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import Swal from 'sweetalert2';

const AgentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demo - replace with actual API call
  const mockAgents = [
    {
      id: 1,
      agentId: 'AG001',
      name: 'Ahmed Rahman',
      tradeName: 'Rahman Travels',
      email: 'ahmed.rahman@example.com',
      phone: '+8801712345678',
      whatsappNumber: '+8801712345678',
      onWhatsapp: true,
      nid: '1234567890123',
      dob: '1985-03-15',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Dhanmondi',
      category: 'B2B',
      remarks: 'Excellent performance, high customer satisfaction',
      status: 'Active'
    },
    {
      id: 2,
      agentId: 'AG002',
      name: 'Fatima Begum',
      tradeName: 'Begum Tours & Travels',
      email: 'fatima.begum@example.com',
      phone: '+8801712345679',
      whatsappNumber: '+8801712345679',
      onWhatsapp: true,
      nid: '2345678901234',
      dob: '1988-07-22',
      division: 'Chittagong',
      district: 'Chittagong',
      upazila: 'Panchlaish',
      category: 'Corporate',
      remarks: 'Reliable agent with good connections',
      status: 'Active'
    },
    {
      id: 3,
      agentId: 'AG003',
      name: 'Karim Uddin',
      tradeName: 'Uddin Aviation Services',
      email: 'karim.uddin@example.com',
      phone: '+8801712345680',
      whatsappNumber: '+8801712345680',
      onWhatsapp: true,
      nid: '3456789012345',
      dob: '1990-11-08',
      division: 'Sylhet',
      district: 'Sylhet',
      upazila: 'Zindabazar',
      category: 'Partner',
      remarks: 'Good track record, expanding business',
      status: 'Active'
    },
    {
      id: 4,
      agentId: 'AG004',
      name: 'Rashida Khan',
      tradeName: 'Khan Travel Agency',
      email: 'rashida.khan@example.com',
      phone: '+8801712345681',
      whatsappNumber: '+8801812345681',
      onWhatsapp: false,
      nid: '4567890123456',
      dob: '1982-12-03',
      division: 'Rajshahi',
      district: 'Rajshahi',
      upazila: 'Boalia',
      category: 'B2B',
      remarks: 'On temporary leave',
      status: 'Inactive'
    },
    {
      id: 5,
      agentId: 'AG005',
      name: 'Mohammad Ali',
      tradeName: 'Ali International Travels',
      email: 'mohammad.ali@example.com',
      phone: '+8801712345682',
      whatsappNumber: '+8801712345682',
      onWhatsapp: true,
      nid: '5678901234567',
      dob: '1979-05-18',
      division: 'Khulna',
      district: 'Khulna',
      upazila: 'Khalishpur',
      category: 'Corporate',
      remarks: 'Under investigation for policy violation',
      status: 'Suspended'
    }
  ];

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          const foundAgent = mockAgents.find(a => a.id === parseInt(id));
          if (foundAgent) {
            setAgent(foundAgent);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Agent Not Found',
              text: 'The requested agent could not be found.'
            });
            navigate('/fly-oval/agents');
          }
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching agent:', error);
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load agent details.'
        });
      }
    };

    fetchAgent();
  }, [id, navigate]);

  const handleWhatsAppClick = (phoneNumber) => {
    if (!phoneNumber.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'No WhatsApp Number',
        text: 'No WhatsApp number available for this agent'
      });
      return;
    }
    
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEdit = () => {
    navigate(`/fly-oval/agents/edit/${id}`);
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Active': { color: 'green', icon: CheckCircle, bgColor: 'bg-green-100 dark:bg-green-900/20', textColor: 'text-green-800 dark:text-green-400' },
      'Inactive': { color: 'yellow', icon: AlertCircle, bgColor: 'bg-yellow-100 dark:bg-yellow-900/20', textColor: 'text-yellow-800 dark:text-yellow-400' },
      'Suspended': { color: 'red', icon: XCircle, bgColor: 'bg-red-100 dark:bg-red-900/20', textColor: 'text-red-800 dark:text-red-400' }
    };
    return configs[status] || configs['Inactive'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Agent Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested agent could not be found.</p>
          <button
            onClick={() => navigate('/fly-oval/agents')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Agents
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(agent.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/fly-oval/agents')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agent Details</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage agent information</p>
              </div>
            </div>
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Agent</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{agent.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-3">{agent.tradeName}</p>
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span>{agent.status}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{agent.phone}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{agent.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{agent.whatsappNumber || 'N/A'}</span>
                  </div>
                  {agent.whatsappNumber && (
                    <button
                      onClick={() => handleWhatsAppClick(agent.whatsappNumber)}
                      className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                      title="Open WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{agent.division}, {agent.district}, {agent.upazila}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Agent Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Agent ID:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{agent.agentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{agent.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">WhatsApp:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {agent.onWhatsapp ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                  <p className="text-gray-900 dark:text-white">{agent.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Trade Name</label>
                  <p className="text-gray-900 dark:text-white">{agent.tradeName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">NID Number</label>
                  <p className="text-gray-900 dark:text-white">{agent.nid || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date of Birth</label>
                  <p className="text-gray-900 dark:text-white">{agent.dob || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Agent ID</label>
                  <p className="text-gray-900 dark:text-white font-mono">{agent.agentId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
                  <p className="text-gray-900 dark:text-white">{agent.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span>{agent.status}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">WhatsApp Available</label>
                  <p className="text-gray-900 dark:text-white">
                    {agent.onWhatsapp ? (
                      <span className="inline-flex items-center space-x-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Yes</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-red-600 dark:text-red-400">
                        <XCircle className="w-4 h-4" />
                        <span>No</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Division</label>
                  <p className="text-gray-900 dark:text-white">{agent.division}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">District</label>
                  <p className="text-gray-900 dark:text-white">{agent.district}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Upazila</label>
                  <p className="text-gray-900 dark:text-white">{agent.upazila}</p>
                </div>
              </div>
            </div>

            {/* Remarks */}
            {agent.remarks && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Remarks
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{agent.remarks}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetails;
