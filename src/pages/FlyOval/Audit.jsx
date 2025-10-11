import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search,
  Download,
  Filter,
  Eye,
  Calendar,
  Users,
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  Activity,
  User,
  Settings,
  Database,
  Lock,
  Unlock,
  Key,
  AlertCircle
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SmallStat from '../../components/common/SmallStat';
import { useTheme } from '../../contexts/ThemeContext';

const Audit = () => {
  const { isDark } = useTheme();
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  // Mock data - replace with actual API calls
  const [auditData, setAuditData] = useState([
    {
      id: 1,
      auditId: 'AUD-001',
      timestamp: '2024-01-15T14:30:00',
      user: 'Admin User',
      userId: 'ADM001',
      action: 'CREATE',
      entity: 'Agent',
      entityId: 'AG006',
      description: 'Created new agent Ahmed Rahman',
      details: {
        oldValue: null,
        newValue: {
          name: 'Ahmed Rahman',
          email: 'ahmed.rahman@example.com',
          phone: '+8801712345678',
          commission: 5.5
        }
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'SUCCESS',
      riskLevel: 'LOW'
    },
    {
      id: 2,
      auditId: 'AUD-002',
      timestamp: '2024-01-15T14:25:00',
      user: 'Admin User',
      userId: 'ADM001',
      action: 'UPDATE',
      entity: 'TopUp',
      entityId: 'TOPUP-001',
      description: 'Updated TopUp transaction amount',
      details: {
        oldValue: { amount: 45000 },
        newValue: { amount: 50000 }
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'SUCCESS',
      riskLevel: 'MEDIUM'
    },
    {
      id: 3,
      auditId: 'AUD-003',
      timestamp: '2024-01-15T14:20:00',
      user: 'Agent User',
      userId: 'AG001',
      action: 'LOGIN',
      entity: 'Authentication',
      entityId: 'AUTH-001',
      description: 'User login successful',
      details: {
        loginMethod: 'email',
        sessionDuration: '2 hours 15 minutes'
      },
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      status: 'SUCCESS',
      riskLevel: 'LOW'
    },
    {
      id: 4,
      auditId: 'AUD-004',
      timestamp: '2024-01-15T14:15:00',
      user: 'System',
      userId: 'SYS001',
      action: 'DELETE',
      entity: 'Transaction',
      entityId: 'SELL-005',
      description: 'Transaction deleted due to payment failure',
      details: {
        reason: 'Payment verification failed',
        refundAmount: 16000
      },
      ipAddress: '127.0.0.1',
      userAgent: 'System Process',
      status: 'SUCCESS',
      riskLevel: 'HIGH'
    },
    {
      id: 5,
      auditId: 'AUD-005',
      timestamp: '2024-01-15T14:10:00',
      user: 'Admin User',
      userId: 'ADM001',
      action: 'PERMISSION_CHANGE',
      entity: 'User',
      entityId: 'AG002',
      description: 'Updated user permissions',
      details: {
        oldPermissions: ['READ', 'CREATE'],
        newPermissions: ['READ', 'CREATE', 'UPDATE']
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'SUCCESS',
      riskLevel: 'HIGH'
    },
    {
      id: 6,
      auditId: 'AUD-006',
      timestamp: '2024-01-15T14:05:00',
      user: 'Unknown',
      userId: 'UNK001',
      action: 'LOGIN_FAILED',
      entity: 'Authentication',
      entityId: 'AUTH-002',
      description: 'Failed login attempt',
      details: {
        attemptedEmail: 'hacker@example.com',
        failureReason: 'Invalid credentials'
      },
      ipAddress: '203.0.113.42',
      userAgent: 'Mozilla/5.0 (compatible; BadBot/1.0)',
      status: 'FAILED',
      riskLevel: 'CRITICAL'
    }
  ]);

  // Calculate statistics
  const totalAudits = auditData.length;
  const successfulActions = auditData.filter(item => item.status === 'SUCCESS').length;
  const failedActions = auditData.filter(item => item.status === 'FAILED').length;
  const highRiskActions = auditData.filter(item => item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL').length;
  const uniqueUsers = [...new Set(auditData.map(item => item.userId))].length;

  // Filter data based on selected filters
  const filteredData = auditData.filter(item => {
    const dateMatch = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(item.timestamp).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'week' && new Date(item.timestamp) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'month' && new Date(item.timestamp) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    const actionMatch = actionFilter === 'all' || item.action === actionFilter;
    const userMatch = userFilter === 'all' || item.userId === userFilter;
    
    return dateMatch && actionMatch && userMatch;
  });

  // Get unique actions and users for filter
  const actions = [...new Set(auditData.map(item => item.action))];
  const users = [...new Set(auditData.map(item => ({ id: item.userId, name: item.user })))];

  // Table columns configuration
  const columns = [
    {
      key: 'auditId',
      header: 'Audit ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{value}</span>
      )
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <span className="text-sm text-gray-900 dark:text-white">
              {new Date(value).toLocaleDateString()}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(value).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'user',
      header: 'User',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-white">{value}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.userId}</p>
          </div>
        </div>
      )
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (value) => {
        const actionConfig = {
          'CREATE': { color: 'green', icon: Plus },
          'UPDATE': { color: 'blue', icon: Edit },
          'DELETE': { color: 'red', icon: Trash2 },
          'LOGIN': { color: 'purple', icon: Key },
          'LOGIN_FAILED': { color: 'red', icon: XCircle },
          'PERMISSION_CHANGE': { color: 'orange', icon: Settings },
          'LOGOUT': { color: 'gray', icon: Lock }
        };
        const config = actionConfig[value] || { color: 'gray', icon: Activity };
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            config.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
            config.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
            config.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
            config.color === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
            config.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
          }`}>
            <Icon className="w-3 h-3" />
            <span>{value}</span>
          </span>
        );
      }
    },
    {
      key: 'entity',
      header: 'Entity',
      sortable: true,
      render: (value, item) => (
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.entityId}</p>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
          {value}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          'SUCCESS': { color: 'green', icon: CheckCircle },
          'FAILED': { color: 'red', icon: XCircle },
          'PENDING': { color: 'yellow', icon: Clock }
        };
        const config = statusConfig[value] || statusConfig['SUCCESS'];
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            config.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
            config.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
          }`}>
            <Icon className="w-3 h-3" />
            <span>{value}</span>
          </span>
        );
      }
    },
    {
      key: 'riskLevel',
      header: 'Risk Level',
      sortable: true,
      render: (value) => {
        const riskConfig = {
          'LOW': { color: 'green', icon: CheckCircle },
          'MEDIUM': { color: 'yellow', icon: AlertTriangle },
          'HIGH': { color: 'orange', icon: AlertCircle },
          'CRITICAL': { color: 'red', icon: XCircle }
        };
        const config = riskConfig[value] || riskConfig['LOW'];
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            config.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
            config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
            config.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <Icon className="w-3 h-3" />
            <span>{value}</span>
          </span>
        );
      }
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">{value}</span>
      )
    }
  ];

  const handleViewAudit = (audit) => {
    setSelectedAudit(audit);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Audit Trail
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and track all system activities and user actions
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label="Total Audits"
          value={totalAudits.toString()}
          icon={FileText}
          color="blue"
        />
        <SmallStat
          label="Successful Actions"
          value={successfulActions.toString()}
          icon={CheckCircle}
          color="green"
        />
        <SmallStat
          label="Failed Actions"
          value={failedActions.toString()}
          icon={XCircle}
          color="red"
        />
        <SmallStat
          label="High Risk Actions"
          value={highRiskActions.toString()}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SmallStat
          label="Unique Users"
          value={uniqueUsers.toString()}
          icon={Users}
          color="purple"
        />
        <SmallStat
          label="Success Rate"
          value={`${Math.round((successfulActions / totalAudits) * 100)}%`}
          icon={Activity}
          color="green"
        />
        <SmallStat
          label="Risk Level"
          value={highRiskActions > 0 ? "High Alert" : "Normal"}
          icon={highRiskActions > 0 ? AlertCircle : CheckCircle}
          color={highRiskActions > 0 ? "red" : "green"}
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Actions</option>
              {actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        searchable={true}
        exportable={true}
        actions={true}
        onView={handleViewAudit}
        onEdit={null}
        onDelete={null}
      />

      {/* View Audit Modal */}
      {showViewModal && selectedAudit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audit Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Audit Header */}
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedAudit.status === 'SUCCESS' 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    <Shield className={`w-6 h-6 ${
                      selectedAudit.status === 'SUCCESS' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedAudit.auditId}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedAudit.description}
                    </p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">Basic Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(selectedAudit.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">User</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedAudit.user} ({selectedAudit.userId})
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Action</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedAudit.action}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Entity</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedAudit.entity} ({selectedAudit.entityId})
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">System Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedAudit.status === 'SUCCESS' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {selectedAudit.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Level</label>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedAudit.riskLevel === 'LOW' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          selectedAudit.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          selectedAudit.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {selectedAudit.riskLevel}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Address</label>
                        <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedAudit.ipAddress}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">User Agent</label>
                        <p className="text-sm text-gray-900 dark:text-white break-all">
                          {selectedAudit.userAgent}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Change Details */}
                {selectedAudit.details && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Change Details</h4>
                    <div className="space-y-4">
                      {selectedAudit.details.oldValue && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Previous Value</label>
                          <pre className="text-sm text-gray-900 dark:text-white bg-red-50 dark:bg-red-900/20 p-2 rounded border mt-1">
                            {JSON.stringify(selectedAudit.details.oldValue, null, 2)}
                          </pre>
                        </div>
                      )}
                      {selectedAudit.details.newValue && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">New Value</label>
                          <pre className="text-sm text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20 p-2 rounded border mt-1">
                            {JSON.stringify(selectedAudit.details.newValue, null, 2)}
                          </pre>
                        </div>
                      )}
                      {selectedAudit.details.reason && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reason</label>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            {selectedAudit.details.reason}
                          </p>
                        </div>
                      )}
                      {selectedAudit.details.loginMethod && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Login Method</label>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            {selectedAudit.details.loginMethod}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {selectedAudit.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;
