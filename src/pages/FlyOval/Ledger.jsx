import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
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
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  PieChart,
  Target,
  TrendingUp,
  TrendingDown,
  Calculator,
  FileText,
  Receipt
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SmallStat from '../../components/common/SmallStat';
import { useTheme } from '../../contexts/ThemeContext';

const Ledger = () => {
  const { isDark } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');

  // Mock data - replace with actual API calls
  const [ledgerData, setLedgerData] = useState([
    {
      id: 1,
      entryId: 'LED-001',
      date: '2024-01-15',
      type: 'Credit',
      category: 'TopUp',
      description: 'Agent Ahmed Rahman TopUp',
      agentName: 'Ahmed Rahman',
      agentId: 'AG001',
      reference: 'TOPUP-001',
      amount: 50000,
      balance: 150000,
      notes: 'Regular monthly topup',
      createdBy: 'Admin User',
      createdAt: '2024-01-15T14:30:00'
    },
    {
      id: 2,
      entryId: 'LED-002',
      date: '2024-01-15',
      type: 'Debit',
      category: 'Commission',
      description: 'Commission from Sale SELL-001',
      agentName: 'Ahmed Rahman',
      agentId: 'AG001',
      reference: 'SELL-001',
      amount: 2500,
      balance: 147500,
      notes: 'Commission from air ticket sale',
      createdBy: 'System',
      createdAt: '2024-01-15T14:35:00'
    },
    {
      id: 3,
      entryId: 'LED-003',
      date: '2024-01-14',
      type: 'Credit',
      category: 'TopUp',
      description: 'Agent Karim Uddin TopUp',
      agentName: 'Karim Uddin',
      agentId: 'AG003',
      reference: 'TOPUP-003',
      amount: 75000,
      balance: 275000,
      notes: 'Weekly topup',
      createdBy: 'Admin User',
      createdAt: '2024-01-14T11:20:00'
    },
    {
      id: 4,
      entryId: 'LED-004',
      date: '2024-01-14',
      type: 'Debit',
      category: 'Sale',
      description: 'Hajj Package Sale',
      agentName: 'Karim Uddin',
      agentId: 'AG003',
      reference: 'SELL-003',
      amount: 450000,
      balance: -175000,
      notes: 'Hajj 2024 Premium package',
      createdBy: 'System',
      createdAt: '2024-01-14T11:25:00'
    },
    {
      id: 5,
      entryId: 'LED-005',
      date: '2024-01-13',
      type: 'Credit',
      category: 'TopUp',
      description: 'Agent Mohammad Ali TopUp',
      agentName: 'Mohammad Ali',
      agentId: 'AG005',
      reference: 'TOPUP-005',
      amount: 40000,
      balance: 160000,
      notes: 'Monthly topup',
      createdBy: 'Admin User',
      createdAt: '2024-01-13T13:10:00'
    },
    {
      id: 6,
      entryId: 'LED-006',
      date: '2024-01-13',
      type: 'Debit',
      category: 'Commission',
      description: 'Commission from Visa Sale',
      agentName: 'Mohammad Ali',
      agentId: 'AG005',
      reference: 'SELL-005',
      amount: 800,
      balance: 159200,
      notes: 'Commission from visa service',
      createdBy: 'System',
      createdAt: '2024-01-13T13:15:00'
    }
  ]);

  const [formData, setFormData] = useState({
    date: '',
    type: '',
    category: '',
    description: '',
    agentId: '',
    reference: '',
    amount: '',
    notes: ''
  });

  // Calculate statistics
  const totalEntries = ledgerData.length;
  const creditEntries = ledgerData.filter(item => item.type === 'Credit').length;
  const debitEntries = ledgerData.filter(item => item.type === 'Debit').length;
  const totalCredit = ledgerData.filter(item => item.type === 'Credit').reduce((sum, item) => sum + item.amount, 0);
  const totalDebit = ledgerData.filter(item => item.type === 'Debit').reduce((sum, item) => sum + item.amount, 0);
  const currentBalance = totalCredit - totalDebit;

  // Filter data based on selected filters
  const filteredData = ledgerData.filter(item => {
    const dateMatch = dateFilter === 'all' || 
      (dateFilter === 'today' && item.date === new Date().toISOString().split('T')[0]) ||
      (dateFilter === 'week' && new Date(item.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'month' && new Date(item.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    const typeMatch = typeFilter === 'all' || item.type === typeFilter;
    const agentMatch = agentFilter === 'all' || item.agentId === agentFilter;
    
    return dateMatch && typeMatch && agentMatch;
  });

  // Get unique agents for filter
  const agents = [...new Set(ledgerData.map(item => ({ id: item.agentId, name: item.agentName })))];

  // Table columns configuration
  const columns = [
    {
      key: 'entryId',
      header: 'Entry ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{value}</span>
      )
    },
    {
      key: 'date',
      header: 'Date',
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
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {value === 'Credit' ? (
            <ArrowUpCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <ArrowDownCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          )}
          <span className={`font-medium ${
            value === 'Credit' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (value) => {
        const categoryConfig = {
          'TopUp': { color: 'blue', icon: ArrowUpCircle },
          'Commission': { color: 'purple', icon: Calculator },
          'Sale': { color: 'green', icon: Receipt },
          'Refund': { color: 'orange', icon: RefreshCw }
        };
        const config = categoryConfig[value] || { color: 'gray', icon: FileText };
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            config.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
            config.color === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
            config.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
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
      key: 'description',
      header: 'Description',
      sortable: true,
      render: (value, item) => (
        <div>
          <span className="text-sm text-gray-900 dark:text-white">{value}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {item.agentName} ({item.agentId})
          </p>
        </div>
      )
    },
    {
      key: 'reference',
      header: 'Reference',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">{value}</span>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (value, item) => (
        <span className={`font-semibold ${
          item.type === 'Credit' 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {item.type === 'Credit' ? '+' : '-'}৳{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'balance',
      header: 'Balance',
      sortable: true,
      render: (value) => (
        <span className={`font-semibold ${
          value >= 0 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          ৳{value.toLocaleString()}
        </span>
      )
    }
  ];

  const handleAddEntry = () => {
    setSelectedEntry(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: '',
      category: '',
      description: '',
      agentId: '',
      reference: '',
      amount: '',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    setFormData({
      date: entry.date,
      type: entry.type,
      category: entry.category,
      description: entry.description,
      agentId: entry.agentId,
      reference: entry.reference,
      amount: entry.amount.toString(),
      notes: entry.notes
    });
    setShowEditModal(true);
  };

  const handleViewEntry = (entry) => {
    setSelectedEntry(entry);
    setShowViewModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (selectedEntry) {
        // Update existing entry
        setLedgerData(prev => prev.map(item => 
          item.id === selectedEntry.id 
            ? { 
                ...item, 
                ...formData, 
                amount: parseFloat(formData.amount),
                entryId: item.entryId // Keep existing entry ID
              }
            : item
        ));
        setShowEditModal(false);
      } else {
        // Add new entry
        const newEntry = {
          id: Date.now(),
          entryId: `LED-${String(Date.now()).slice(-6)}`,
          agentName: 'New Agent', // This would be fetched from agent data
          amount: parseFloat(formData.amount),
          balance: currentBalance + (formData.type === 'Credit' ? parseFloat(formData.amount) : -parseFloat(formData.amount)),
          createdBy: 'Admin User',
          createdAt: new Date().toISOString()
        };
        setLedgerData(prev => [...prev, { ...formData, ...newEntry }]);
        setShowAddModal(false);
      }
      
      setLoading(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: '',
        category: '',
        description: '',
        agentId: '',
        reference: '',
        amount: '',
        notes: ''
      });
    }, 1000);
  };

  const handleDeleteEntry = (entry) => {
    if (window.confirm(`Are you sure you want to delete entry ${entry.entryId}?`)) {
      setLedgerData(prev => prev.filter(item => item.id !== entry.id));
    }
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Financial Ledger
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track all financial transactions and maintain account balance
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handleAddEntry}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label="Current Balance"
          value={`৳${currentBalance.toLocaleString()}`}
          icon={DollarSign}
          color={currentBalance >= 0 ? "green" : "red"}
        />
        <SmallStat
          label="Total Credit"
          value={`৳${totalCredit.toLocaleString()}`}
          icon={TrendingUp}
          color="green"
        />
        <SmallStat
          label="Total Debit"
          value={`৳${totalDebit.toLocaleString()}`}
          icon={TrendingDown}
          color="red"
        />
        <SmallStat
          label="Total Entries"
          value={totalEntries.toString()}
          icon={FileText}
          color="blue"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SmallStat
          label="Credit Entries"
          value={creditEntries.toString()}
          icon={ArrowUpCircle}
          color="green"
        />
        <SmallStat
          label="Debit Entries"
          value={debitEntries.toString()}
          icon={ArrowDownCircle}
          color="red"
        />
        <SmallStat
          label="Net Position"
          value={totalCredit > totalDebit ? "Positive" : "Negative"}
          icon={totalCredit > totalDebit ? TrendingUp : TrendingDown}
          color={totalCredit > totalDebit ? "green" : "red"}
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Agents</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
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
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
        onView={handleViewEntry}
      />

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedEntry ? 'Edit Entry' : 'Add Entry'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Credit">Credit</option>
                      <option value="Debit">Debit</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="TopUp">TopUp</option>
                      <option value="Commission">Commission</option>
                      <option value="Sale">Sale</option>
                      <option value="Refund">Refund</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Agent ID
                    </label>
                    <input
                      type="text"
                      value={formData.agentId}
                      onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter agent ID"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter description"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reference
                    </label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter reference"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{selectedEntry ? 'Update' : 'Add'} Entry</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Entry Modal */}
      {showViewModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ledger Entry Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Entry Header */}
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedEntry.type === 'Credit' 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    {selectedEntry.type === 'Credit' ? (
                      <ArrowUpCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedEntry.entryId}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedEntry.description}
                    </p>
                  </div>
                </div>

                {/* Entry Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedEntry.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                      <p className={`text-sm font-medium ${
                        selectedEntry.type === 'Credit' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {selectedEntry.type}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedEntry.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Agent</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedEntry.agentName} ({selectedEntry.agentId})
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                      <p className={`text-lg font-semibold ${
                        selectedEntry.type === 'Credit' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {selectedEntry.type === 'Credit' ? '+' : '-'}৳{selectedEntry.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance</label>
                      <p className={`text-lg font-semibold ${
                        selectedEntry.balance >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        ৳{selectedEntry.balance.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference</label>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {selectedEntry.reference}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedEntry.createdBy}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedEntry.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {selectedEntry.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;
