import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  MapPin,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useAirAgents, useDeleteAirAgent } from '../../../hooks/useB2BAirAgentQueries';
import Swal from 'sweetalert2';

const AgentList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Fetch agents with search and filters
  const { data: agentsData, isLoading: loading, refetch } = useAirAgents({
    page,
    limit,
    q: searchTerm || undefined,
  });

  const deleteMutation = useDeleteAirAgent();

  const agents = agentsData?.data || [];
  const pagination = agentsData?.pagination || { total: 0, page: 1, limit: 20, pages: 0 };

  // Filter agents based on status (client-side filter for status)
  const filteredAgents = agents.filter(agent => {
    if (statusFilter === 'all') return true;
    // Map API status to display status
    const isActive = agent.isActive !== false;
    if (statusFilter === 'Active') return isActive;
    if (statusFilter === 'Inactive') return !isActive;
    return true;
  });

  const handleDelete = async (agent) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `আপনি কি ${agent.name} মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল করুন',
      background: document.documentElement.classList.contains('dark') ? '#1F2937' : '#F9FAFB',
    });

    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync(agent._id || agent.agentId || agent.id);
        refetch();
      } catch (error) {
        // Error is handled by the mutation hook's onError
        console.error('Error deleting agent:', error);
      }
    }
  };

  const getStatusBadge = (agent) => {
    const isActive = agent.isActive !== false;
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
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        <span>{status}</span>
      </span>
    );
  };

  // Calculate statistics
  const totalAgents = pagination.total || agents.length;
  const activeAgents = agents.filter(agent => agent.isActive !== false).length;
  const inactiveAgents = agents.filter(agent => agent.isActive === false).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/air-ticketing')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                এয়ার টিকিট এজেন্ট তালিকা
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                সকল এয়ার টিকিট এজেন্ট দেখুন এবং পরিচালনা করুন
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/air-ticketing/agent/add')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>নতুন এজেন্ট যোগ করুন</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট এজেন্ট</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalAgents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">সক্রিয়</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{activeAgents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">নিষ্ক্রিয়</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{inactiveAgents}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ফিল্টার করা</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{filteredAgents.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <Filter className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="নাম, ID, ইমেইল, বা মোবাইল দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="Active">সক্রিয়</option>
                <option value="Inactive">নিষ্ক্রিয়</option>
                <option value="Suspended">স্থগিত</option>
              </select>
            </div>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {searchTerm || statusFilter !== 'all' ? 'কোন এজেন্ট পাওয়া যায়নি' : 'কোন এজেন্ট যোগ করা হয়নি'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => navigate('/air-ticketing/agent/add')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  প্রথম এজেন্ট যোগ করুন
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      এজেন্ট তথ্য
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      যোগাযোগ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ঠিকানা
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      স্ট্যাটাস
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      কাজ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {agent.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {agent.agentId || agent.idCode || agent._id}
                            </div>
                            {agent.personalName && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {agent.personalName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-2 mb-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{agent.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{agent.mobile}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{agent.city}, {agent.state}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {agent.country}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(agent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/air-ticketing/agent/${agent._id || agent.agentId || agent.id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/air-ticketing/agent/${agent._id || agent.agentId || agent.id}/edit`)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(agent)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentList;
