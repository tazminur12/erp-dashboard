import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExcelUploader, setShowExcelUploader] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [agentData, setAgentData] = useState([
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
  ]);

  const [formData, setFormData] = useState({
    agentId: '',
    name: '',
    tradeName: '',
    nid: '',
    dob: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    onWhatsapp: false,
    division: '',
    district: '',
    upazila: '',
    category: '',
    remarks: '',
    status: 'Active'
  });

  // Calculate statistics
  const totalAgents = agentData.length;
  const activeAgents = agentData.filter(agent => agent.status === 'Active').length;
  const inactiveAgents = agentData.filter(agent => agent.status === 'Inactive').length;
  const suspendedAgents = agentData.filter(agent => agent.status === 'Suspended').length;

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
              <span className="text-sm text-gray-500 dark:text-gray-400">({item.agentId})</span>
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
  ];

  const handleAddAgent = () => {
    navigate('/fly-oval/agents/add');
  };

  const handleEditAgent = (agent) => {
    setSelectedAgent(agent);
    setFormData({
      agentId: agent.agentId || '',
      name: agent.name,
      tradeName: agent.tradeName || '',
      nid: agent.nid || '',
      dob: agent.dob || '',
      email: agent.email,
      phone: agent.phone,
      whatsappNumber: agent.whatsappNumber || '',
      onWhatsapp: agent.onWhatsapp || false,
      division: agent.division || '',
      district: agent.district || '',
      upazila: agent.upazila || '',
      category: agent.category || '',
      remarks: agent.remarks || '',
      status: agent.status
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
      
      setLoading(false);
      setFormData({
        agentId: '',
        name: '',
        tradeName: '',
        nid: '',
        dob: '',
        email: '',
        phone: '',
        whatsappNumber: '',
        onWhatsapp: false,
        division: '',
        district: '',
        upazila: '',
        category: '',
        remarks: '',
        status: 'Active'
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
          label="Inactive Agents"
          value={inactiveAgents.toString()}
          icon={XCircle}
          color="gray"
        />
        <SmallStat
          label="Suspended Agents"
          value={suspendedAgents.toString()}
          icon={AlertCircle}
          color="red"
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Agent</h2>
                <button
                  onClick={() => {
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
                    <span>Update Agent</span>
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
                    <span className="text-gray-900 dark:text-white">{selectedAgent.division}, {selectedAgent.district}, {selectedAgent.upazila}</span>
                  </div>
                </div>

                {/* Agent Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {selectedAgent.agentId}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Agent ID</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {selectedAgent.category || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Category</div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Additional Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">NID:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedAgent.nid || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedAgent.dob || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">WhatsApp:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedAgent.whatsappNumber || 'N/A'}</span>
                    </div>
                    {selectedAgent.remarks && (
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Remarks:</span>
                        <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedAgent.remarks}</p>
                      </div>
                    )}
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
