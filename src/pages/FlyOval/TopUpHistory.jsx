import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Download,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Smartphone,
  Building,
  ArrowUpCircle,
  BarChart3,
  PieChart,
  Target,
  Upload
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SmallStat from '../../components/common/SmallStat';
import ExcelUploader from '../../components/common/ExcelUploader';
import { useTheme } from '../../contexts/ThemeContext';

const TopUpHistory = () => {
  const { isDark } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExcelUploader, setShowExcelUploader] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - replace with actual API calls
  const [topUpData, setTopUpData] = useState([
    {
      id: 1,
      transactionId: 'TOPUP-001',
      agentName: 'Ahmed Rahman',
      agentId: 'AG001',
      amount: 50000,
      method: 'Bank Transfer',
      bankName: 'BRAC Bank',
      referenceNumber: 'BR123456789',
      date: '2024-01-15',
      time: '14:30',
      status: 'Completed',
      processedBy: 'Admin User',
      processedAt: '2024-01-15T14:35:00',
      notes: 'Regular monthly topup',
      commission: 2500,
      balanceBefore: 100000,
      balanceAfter: 150000
    },
    {
      id: 2,
      transactionId: 'TOPUP-002',
      agentName: 'Fatima Begum',
      agentId: 'AG002',
      amount: 25000,
      method: 'Mobile Banking',
      bankName: 'Dutch Bangla Bank',
      referenceNumber: 'DB987654321',
      date: '2024-01-15',
      time: '16:45',
      status: 'Pending',
      processedBy: null,
      processedAt: null,
      notes: 'Emergency topup request',
      commission: 1250,
      balanceBefore: 75000,
      balanceAfter: null
    },
    {
      id: 3,
      transactionId: 'TOPUP-003',
      agentName: 'Karim Uddin',
      agentId: 'AG003',
      amount: 75000,
      method: 'Bank Transfer',
      bankName: 'City Bank',
      referenceNumber: 'CB456789123',
      date: '2024-01-14',
      time: '11:20',
      status: 'Completed',
      processedBy: 'Admin User',
      processedAt: '2024-01-14T11:25:00',
      notes: 'Weekly topup',
      commission: 3750,
      balanceBefore: 200000,
      balanceAfter: 275000
    },
    {
      id: 4,
      transactionId: 'TOPUP-004',
      agentName: 'Rashida Khan',
      agentId: 'AG004',
      amount: 30000,
      method: 'Cash Deposit',
      bankName: 'Sonali Bank',
      referenceNumber: 'SB789123456',
      date: '2024-01-14',
      time: '09:15',
      status: 'Failed',
      processedBy: 'Admin User',
      processedAt: '2024-01-14T09:20:00',
      notes: 'Invalid reference number',
      commission: 1500,
      balanceBefore: 50000,
      balanceAfter: 50000
    },
    {
      id: 5,
      transactionId: 'TOPUP-005',
      agentName: 'Mohammad Ali',
      agentId: 'AG005',
      amount: 40000,
      method: 'Bank Transfer',
      bankName: 'Standard Chartered',
      referenceNumber: 'SC321654987',
      date: '2024-01-13',
      time: '13:10',
      status: 'Completed',
      processedBy: 'Admin User',
      processedAt: '2024-01-13T13:15:00',
      notes: 'Monthly topup',
      commission: 2000,
      balanceBefore: 120000,
      balanceAfter: 160000
    }
  ]);

  const [formData, setFormData] = useState({
    agentId: '',
    amount: '',
    method: '',
    bankName: '',
    referenceNumber: '',
    notes: ''
  });

  // Calculate statistics
  const totalTopUps = topUpData.length;
  const completedTopUps = topUpData.filter(item => item.status === 'Completed').length;
  const pendingTopUps = topUpData.filter(item => item.status === 'Pending').length;
  const totalAmount = topUpData.reduce((sum, item) => sum + item.amount, 0);
  const totalCommission = topUpData.reduce((sum, item) => sum + item.commission, 0);
  const completedAmount = topUpData.filter(item => item.status === 'Completed').reduce((sum, item) => sum + item.amount, 0);

  // Filter data based on selected filters
  const filteredData = topUpData.filter(item => {
    const dateMatch = dateFilter === 'all' || 
      (dateFilter === 'today' && item.date === new Date().toISOString().split('T')[0]) ||
      (dateFilter === 'week' && new Date(item.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'month' && new Date(item.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    const statusMatch = statusFilter === 'all' || item.status === statusFilter;
    
    return dateMatch && statusMatch;
  });

  // Table columns configuration
  const columns = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <ArrowUpCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{value}</span>
        </div>
      )
    },
    {
      key: 'agentName',
      header: 'Agent',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-white">{value}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.agentId}</p>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ৳{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'method',
      header: 'Payment Method',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          {value === 'Bank Transfer' ? (
            <Building className="w-4 h-4 text-gray-400" />
          ) : value === 'Mobile Banking' ? (
            <Smartphone className="w-4 h-4 text-gray-400" />
          ) : (
            <CreditCard className="w-4 h-4 text-gray-400" />
          )}
          <div>
            <span className="text-sm text-gray-900 dark:text-white">{value}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.bankName}</p>
          </div>
        </div>
      )
    },
    {
      key: 'referenceNumber',
      header: 'Reference',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">{value}</span>
      )
    },
    {
      key: 'date',
      header: 'Date & Time',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <span className="text-sm text-gray-900 dark:text-white">
              {new Date(value).toLocaleDateString()}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.time}</p>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          'Completed': { color: 'green', icon: CheckCircle },
          'Pending': { color: 'yellow', icon: Clock },
          'Failed': { color: 'red', icon: XCircle }
        };
        const config = statusConfig[value] || statusConfig['Pending'];
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
    }
  ];

  const handleAddTopUp = () => {
    setSelectedTransaction(null);
    setFormData({
      agentId: '',
      amount: '',
      method: '',
      bankName: '',
      referenceNumber: '',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      agentId: transaction.agentId,
      amount: transaction.amount.toString(),
      method: transaction.method,
      bankName: transaction.bankName,
      referenceNumber: transaction.referenceNumber,
      notes: transaction.notes
    });
    setShowEditModal(true);
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (selectedTransaction) {
        // Update existing transaction
        setTopUpData(prev => prev.map(item => 
          item.id === selectedTransaction.id 
            ? { 
                ...item, 
                ...formData, 
                amount: parseFloat(formData.amount),
                commission: parseFloat(formData.amount) * 0.05
              }
            : item
        ));
        setShowEditModal(false);
      } else {
        // Add new transaction
        const newTransaction = {
          id: Date.now(),
          transactionId: `TOPUP-${String(Date.now()).slice(-6)}`,
          agentName: 'New Agent', // This would be fetched from agent data
          agentId: formData.agentId,
          amount: parseFloat(formData.amount),
          method: formData.method,
          bankName: formData.bankName,
          referenceNumber: formData.referenceNumber,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          status: 'Pending',
          processedBy: null,
          processedAt: null,
          notes: formData.notes,
          commission: parseFloat(formData.amount) * 0.05,
          balanceBefore: 0,
          balanceAfter: null
        };
        setTopUpData(prev => [...prev, newTransaction]);
        setShowAddModal(false);
      }
      
      setLoading(false);
      setFormData({
        agentId: '',
        amount: '',
        method: '',
        bankName: '',
        referenceNumber: '',
        notes: ''
      });
    }, 1000);
  };

  const handleDeleteTransaction = (transaction) => {
    if (window.confirm(`Are you sure you want to delete transaction ${transaction.transactionId}?`)) {
      setTopUpData(prev => prev.filter(item => item.id !== transaction.id));
    }
  };

  const handleExcelDataProcessed = async (processedData) => {
    setLoading(true);
    
    try {
      // Simulate API call to save data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Convert processed data to topUpData format
      const newTopUpRecords = processedData.map((record, index) => ({
        id: Date.now() + index,
        transactionId: `TOPUP-${String(Date.now() + index).slice(-6)}`,
        agentName: record.name || 'Unknown Agent',
        agentId: record.agentId || `AG${String(index + 1).padStart(3, '0')}`,
        amount: parseFloat(record.amount) || 0,
        method: record.method || 'Bank Transfer',
        bankName: record.bankName || '',
        referenceNumber: record.referenceNumber || '',
        date: record.date || new Date().toISOString().split('T')[0],
        time: record.time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        status: record.status || 'Pending',
        processedBy: null,
        processedAt: null,
        notes: record.notes || '',
        commission: (parseFloat(record.amount) || 0) * 0.05,
        balanceBefore: 0,
        balanceAfter: null
      }));
      
      setTopUpData(prev => [...prev, ...newTopUpRecords]);
      
      // Show success message
      alert(`Successfully uploaded ${processedData.length} top-up records!`);
      
    } catch (error) {
      console.error('Error processing Excel data:', error);
      alert('Error processing Excel data. Please try again.');
    } finally {
      setLoading(false);
      setShowExcelUploader(false);
    }
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              TopUp History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage agent top-up transactions
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setShowExcelUploader(true)}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Upload className="w-4 h-4" />
            <span>Excel Upload</span>
          </button>
          <button 
            onClick={handleAddTopUp}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add TopUp</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label="Total TopUps"
          value={totalTopUps.toString()}
          icon={ArrowUpCircle}
          color="green"
        />
        <SmallStat
          label="Completed"
          value={completedTopUps.toString()}
          icon={CheckCircle}
          color="blue"
        />
        <SmallStat
          label="Pending"
          value={pendingTopUps.toString()}
          icon={Clock}
          color="yellow"
        />
        <SmallStat
          label="Total Amount"
          value={`৳${totalAmount.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SmallStat
          label="Completed Amount"
          value={`৳${completedAmount.toLocaleString()}`}
          icon={Target}
          color="green"
        />
        <SmallStat
          label="Total Commission"
          value={`৳${totalCommission.toLocaleString()}`}
          icon={BarChart3}
          color="blue"
        />
        <SmallStat
          label="Success Rate"
          value={`${Math.round((completedTopUps / totalTopUps) * 100)}%`}
          icon={PieChart}
          color="purple"
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
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
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        onView={handleViewTransaction}
      />

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedTransaction ? 'Edit TopUp' : 'Add TopUp'}
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
                    Agent ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.agentId}
                    onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter agent ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Method</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                    <option value="Cash Deposit">Cash Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter bank name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter reference number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter notes"
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{selectedTransaction ? 'Update' : 'Add'} TopUp</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Transaction Modal */}
      {showViewModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Transaction Header */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <ArrowUpCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedTransaction.transactionId}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedTransaction.agentName} ({selectedTransaction.agentId})
                    </p>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        ৳{selectedTransaction.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Commission</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        ৳{selectedTransaction.commission.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.method}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.bankName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference</label>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {selectedTransaction.referenceNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedTransaction.date).toLocaleDateString()} at {selectedTransaction.time}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status and Processing Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedTransaction.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      selectedTransaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                  {selectedTransaction.processedBy && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Processed by {selectedTransaction.processedBy} at{' '}
                      {new Date(selectedTransaction.processedAt).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedTransaction.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {selectedTransaction.notes}
                    </p>
                  </div>
                )}
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
          title="Upload TopUp History Data"
          acceptedFields={['name', 'agentId', 'amount', 'method', 'bankName', 'referenceNumber', 'date', 'time', 'status', 'notes']}
          requiredFields={['agentId', 'amount', 'method']}
          sampleData={[
            ['Agent Name', 'Agent ID', 'Amount', 'Method', 'Bank Name', 'Reference Number', 'Date', 'Time', 'Status', 'Notes'],
            ['Ahmed Rahman', 'AG001', '50000', 'Bank Transfer', 'BRAC Bank', 'BR123456789', '2024-01-15', '14:30', 'Pending', 'Regular monthly topup'],
            ['Fatima Begum', 'AG002', '25000', 'Mobile Banking', 'Dutch Bangla Bank', 'DB987654321', '2024-01-15', '16:45', 'Pending', 'Emergency topup request'],
            ['Karim Uddin', 'AG003', '75000', 'Bank Transfer', 'City Bank', 'CB456789123', '2024-01-14', '11:20', 'Completed', 'Weekly topup']
          ]}
        />
      )}
    </div>
  );
};

export default TopUpHistory;
