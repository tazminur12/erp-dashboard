import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Download,
  Filter,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Settings,
  Star,
  FileSpreadsheet,
  Upload
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SmallStat from '../../components/common/SmallStat';
import ExcelUploader from '../../components/common/ExcelUploader';
import { useTheme } from '../../contexts/ThemeContext';

const AgentList = () => {
  const { isDark } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExcelUploader, setShowExcelUploader] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [agentData, setAgentData] = useState([
    {
      id: 1,
      name: 'Ahmed Rahman',
      email: 'ahmed.rahman@example.com',
      phone: '+8801712345678',
      address: 'Dhaka, Bangladesh',
      joinDate: '2023-01-15',
      status: 'Active',
      totalTransactions: 145,
      totalRevenue: 125000,
      commission: 5.5,
      rating: 4.8,
      lastActivity: '2024-01-15',
      documents: ['NID', 'Passport', 'Trade License']
    },
    {
      id: 2,
      name: 'Fatima Begum',
      email: 'fatima.begum@example.com',
      phone: '+8801712345679',
      address: 'Chittagong, Bangladesh',
      joinDate: '2023-02-20',
      status: 'Active',
      totalTransactions: 132,
      totalRevenue: 98000,
      commission: 5.0,
      rating: 4.6,
      lastActivity: '2024-01-14',
      documents: ['NID', 'Passport']
    },
    {
      id: 3,
      name: 'Karim Uddin',
      email: 'karim.uddin@example.com',
      phone: '+8801712345680',
      address: 'Sylhet, Bangladesh',
      joinDate: '2023-03-10',
      status: 'Active',
      totalTransactions: 128,
      totalRevenue: 87000,
      commission: 4.8,
      rating: 4.5,
      lastActivity: '2024-01-13',
      documents: ['NID', 'Trade License']
    },
    {
      id: 4,
      name: 'Rashida Khan',
      email: 'rashida.khan@example.com',
      phone: '+8801712345681',
      address: 'Rajshahi, Bangladesh',
      joinDate: '2023-04-05',
      status: 'Inactive',
      totalTransactions: 115,
      totalRevenue: 76000,
      commission: 4.5,
      rating: 4.3,
      lastActivity: '2023-12-20',
      documents: ['NID', 'Passport', 'Trade License']
    },
    {
      id: 5,
      name: 'Mohammad Ali',
      email: 'mohammad.ali@example.com',
      phone: '+8801712345682',
      address: 'Khulna, Bangladesh',
      joinDate: '2023-05-12',
      status: 'Suspended',
      totalTransactions: 108,
      totalRevenue: 65000,
      commission: 4.2,
      rating: 4.1,
      lastActivity: '2023-11-15',
      documents: ['NID']
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    commission: '',
    documents: []
  });

  // Calculate statistics
  const totalAgents = agentData.length;
  const activeAgents = agentData.filter(agent => agent.status === 'Active').length;
  const totalRevenue = agentData.reduce((sum, agent) => sum + agent.totalRevenue, 0);
  const totalTransactions = agentData.reduce((sum, agent) => sum + agent.totalTransactions, 0);

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      header: 'Agent Name',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-white">{value}</span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.rating}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contact',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">{value}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          'Active': { color: 'green', icon: CheckCircle },
          'Inactive': { color: 'yellow', icon: AlertCircle },
          'Suspended': { color: 'red', icon: XCircle }
        };
        const config = statusConfig[value] || statusConfig['Inactive'];
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            config.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
            config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <Icon className="w-3 h-3" />
            <span>{value}</span>
          </span>
        );
      }
    },
    {
      key: 'totalTransactions',
      header: 'Transactions',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {value}
        </span>
      )
    },
    {
      key: 'totalRevenue',
      header: 'Revenue',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ৳{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'commission',
      header: 'Commission',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {value}%
        </span>
      )
    },
    {
      key: 'joinDate',
      header: 'Join Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">
            {new Date(value).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">
            {new Date(value).toLocaleDateString()}
          </span>
        </div>
      )
    }
  ];

  const handleAddAgent = () => {
    setSelectedAgent(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      commission: '',
      documents: []
    });
    setShowAddModal(true);
  };

  const handleEditAgent = (agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      address: agent.address,
      commission: agent.commission.toString(),
      documents: agent.documents
    });
    setShowEditModal(true);
  };

  const handleViewAgent = (agent) => {
    setSelectedAgent(agent);
    setShowViewModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (selectedAgent) {
        // Update existing agent
        setAgentData(prev => prev.map(agent => 
          agent.id === selectedAgent.id 
            ? { 
                ...agent, 
                ...formData, 
                commission: parseFloat(formData.commission),
                documents: formData.documents
              }
            : agent
        ));
        setShowEditModal(false);
      } else {
        // Add new agent
        const newAgent = {
          id: Date.now(),
          ...formData,
          commission: parseFloat(formData.commission),
          joinDate: new Date().toISOString().split('T')[0],
          status: 'Active',
          totalTransactions: 0,
          totalRevenue: 0,
          rating: 0,
          lastActivity: new Date().toISOString().split('T')[0],
          documents: formData.documents
        };
        setAgentData(prev => [...prev, newAgent]);
        setShowAddModal(false);
      }
      
      setLoading(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        commission: '',
        documents: []
      });
    }, 1000);
  };

  const handleDeleteAgent = (agent) => {
    if (window.confirm(`Are you sure you want to delete ${agent.name}?`)) {
      setAgentData(prev => prev.filter(item => item.id !== agent.id));
    }
  };

  const handleExcelUpload = () => {
    setShowExcelUploader(true);
  };

  const handleExcelDataProcessed = (processedData) => {
    // Process the uploaded Excel data
    const newAgents = processedData.map((agentData, index) => ({
      id: Date.now() + index,
      ...agentData,
      joinDate: agentData.joinDate || new Date().toISOString().split('T')[0],
      status: 'Active',
      totalTransactions: 0,
      totalRevenue: 0,
      rating: 0,
      lastActivity: new Date().toISOString().split('T')[0],
      documents: []
    }));

    setAgentData(prev => [...prev, ...newAgents]);
    setShowExcelUploader(false);
    
    // Show success message
    alert(`Successfully added ${newAgents.length} agents from Excel file!`);
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Agent List
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage Fly Oval Limited agents and their performance
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handleExcelUpload}
            className="flex items-center space-x-2 px-4 py-2 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>
          <button 
            onClick={handleAddAgent}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Agent</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label="Total Agents"
          value={totalAgents.toString()}
          icon={Users}
          color="blue"
        />
        <SmallStat
          label="Active Agents"
          value={activeAgents.toString()}
          icon={CheckCircle}
          color="green"
        />
        <SmallStat
          label="Total Revenue"
          value={`৳${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
        <SmallStat
          label="Total Transactions"
          value={totalTransactions.toString()}
          icon={TrendingUp}
          color="yellow"
        />
      </div>

      {/* Data Table */}
      <DataTable
        data={agentData}
        columns={columns}
        searchable={true}
        exportable={true}
        actions={true}
        onEdit={handleEditAgent}
        onDelete={handleDeleteAgent}
        onView={handleViewAgent}
      />

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedAgent ? 'Edit Agent' : 'Add Agent'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Agent Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter agent name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Commission Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.commission}
                    onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="0.0"
                    required
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{selectedAgent ? 'Update' : 'Add'} Agent</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Agent Modal */}
      {showViewModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Agent Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Agent Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedAgent.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedAgent.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedAgent.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{selectedAgent.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{selectedAgent.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{selectedAgent.address}</span>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedAgent.totalTransactions}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ৳{selectedAgent.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedAgent.commission}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Commission Rate</div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.documents.map((doc, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Uploader Modal */}
      {showExcelUploader && (
        <ExcelUploader
          isOpen={showExcelUploader}
          onClose={() => setShowExcelUploader(false)}
          onDataProcessed={handleExcelDataProcessed}
          title="Upload Agent Data from Excel"
          acceptedFields={['name', 'email', 'phone', 'address', 'commission']}
          requiredFields={['name', 'email', 'phone']}
          sampleData={[
            ['Name', 'Email', 'Phone', 'Address', 'Commission'],
            ['Ahmed Rahman', 'ahmed.rahman@example.com', '+8801712345678', 'Dhaka, Bangladesh', '5.5'],
            ['Fatima Begum', 'fatima.begum@example.com', '+8801712345679', 'Chittagong, Bangladesh', '5.0'],
            ['Karim Uddin', 'karim.uddin@example.com', '+8801712345680', 'Sylhet, Bangladesh', '4.8']
          ]}
        />
      )}
    </div>
  );
};

export default AgentList;
