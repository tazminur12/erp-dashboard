import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, 
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
  ArrowDownCircle,
  BarChart3,
  PieChart,
  Target,
  Package,
  ShoppingCart
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SmallStat from '../../components/common/SmallStat';
import { useTheme } from '../../contexts/ThemeContext';

const SellHistory = () => {
  const { isDark } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');

  // Mock data - replace with actual API calls
  const [sellData, setSellData] = useState([
    {
      id: 1,
      transactionId: 'SELL-001',
      agentName: 'Ahmed Rahman',
      agentId: 'AG001',
      customerName: 'Mohammad Ali',
      customerPhone: '+8801711111111',
      productType: 'Air Ticket',
      productName: 'Dhaka to Dubai',
      quantity: 2,
      unitPrice: 25000,
      totalAmount: 50000,
      commission: 2500,
      netAmount: 47500,
      paymentMethod: 'Bank Transfer',
      bankName: 'BRAC Bank',
      referenceNumber: 'BR123456789',
      date: '2024-01-15',
      time: '14:30',
      status: 'Completed',
      processedBy: 'Admin User',
      processedAt: '2024-01-15T14:35:00',
      notes: 'Economy class tickets'
    },
    {
      id: 2,
      transactionId: 'SELL-002',
      agentName: 'Fatima Begum',
      agentId: 'AG002',
      customerName: 'Rashida Khan',
      customerPhone: '+8801722222222',
      productType: 'Visa Service',
      productName: 'Saudi Umrah Visa',
      quantity: 1,
      unitPrice: 15000,
      totalAmount: 15000,
      commission: 750,
      netAmount: 14250,
      paymentMethod: 'Mobile Banking',
      bankName: 'Dutch Bangla Bank',
      referenceNumber: 'DB987654321',
      date: '2024-01-15',
      time: '16:45',
      status: 'Pending',
      processedBy: null,
      processedAt: null,
      notes: 'Urgent visa processing'
    },
    {
      id: 3,
      transactionId: 'SELL-003',
      agentName: 'Karim Uddin',
      agentId: 'AG003',
      customerName: 'Abdul Rahman',
      customerPhone: '+8801733333333',
      productType: 'Hajj Package',
      productName: 'Hajj 2024 Premium',
      quantity: 1,
      unitPrice: 450000,
      totalAmount: 450000,
      commission: 22500,
      netAmount: 427500,
      paymentMethod: 'Bank Transfer',
      bankName: 'City Bank',
      referenceNumber: 'CB456789123',
      date: '2024-01-14',
      time: '11:20',
      status: 'Completed',
      processedBy: 'Admin User',
      processedAt: '2024-01-14T11:25:00',
      notes: 'Premium Hajj package with accommodation'
    },
    {
      id: 4,
      transactionId: 'SELL-004',
      agentName: 'Rashida Khan',
      agentId: 'AG004',
      customerName: 'Fatima Begum',
      customerPhone: '+8801744444444',
      productType: 'Air Ticket',
      productName: 'Dhaka to London',
      quantity: 1,
      unitPrice: 75000,
      totalAmount: 75000,
      commission: 3750,
      netAmount: 71250,
      paymentMethod: 'Cash Deposit',
      bankName: 'Sonali Bank',
      referenceNumber: 'SB789123456',
      date: '2024-01-14',
      time: '09:15',
      status: 'Failed',
      processedBy: 'Admin User',
      processedAt: '2024-01-14T09:20:00',
      notes: 'Payment verification failed'
    },
    {
      id: 5,
      transactionId: 'SELL-005',
      agentName: 'Mohammad Ali',
      agentId: 'AG005',
      customerName: 'Karim Uddin',
      customerPhone: '+8801755555555',
      productType: 'Visa Service',
      productName: 'Indian Tourist Visa',
      quantity: 2,
      unitPrice: 8000,
      totalAmount: 16000,
      commission: 800,
      netAmount: 15200,
      paymentMethod: 'Bank Transfer',
      bankName: 'Standard Chartered',
      referenceNumber: 'SC321654987',
      date: '2024-01-13',
      time: '13:10',
      status: 'Completed',
      processedBy: 'Admin User',
      processedAt: '2024-01-13T13:15:00',
      notes: 'Family visa application'
    }
  ]);

  const [formData, setFormData] = useState({
    agentId: '',
    customerName: '',
    customerPhone: '',
    productType: '',
    productName: '',
    quantity: '',
    unitPrice: '',
    paymentMethod: '',
    bankName: '',
    referenceNumber: '',
    notes: ''
  });

  // Calculate statistics
  const totalSales = sellData.length;
  const completedSales = sellData.filter(item => item.status === 'Completed').length;
  const pendingSales = sellData.filter(item => item.status === 'Pending').length;
  const totalAmount = sellData.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalCommission = sellData.reduce((sum, item) => sum + item.commission, 0);
  const completedAmount = sellData.filter(item => item.status === 'Completed').reduce((sum, item) => sum + item.totalAmount, 0);

  // Filter data based on selected filters
  const filteredData = sellData.filter(item => {
    const dateMatch = dateFilter === 'all' || 
      (dateFilter === 'today' && item.date === new Date().toISOString().split('T')[0]) ||
      (dateFilter === 'week' && new Date(item.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'month' && new Date(item.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    const statusMatch = statusFilter === 'all' || item.status === statusFilter;
    const productMatch = productFilter === 'all' || item.productType === productFilter;
    
    return dateMatch && statusMatch && productMatch;
  });

  // Get unique product types for filter
  const productTypes = [...new Set(sellData.map(item => item.productType))];

  // Table columns configuration
  const columns = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <ArrowDownCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
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
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (value, item) => (
        <div>
          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.customerPhone}</p>
        </div>
      )
    },
    {
      key: 'productName',
      header: 'Product',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          {item.productType === 'Air Ticket' ? (
            <Package className="w-4 h-4 text-gray-400" />
          ) : item.productType === 'Visa Service' ? (
            <CreditCard className="w-4 h-4 text-gray-400" />
          ) : (
            <ShoppingCart className="w-4 h-4 text-gray-400" />
          )}
          <div>
            <span className="text-sm text-gray-900 dark:text-white">{value}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {item.productType} × {item.quantity}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      sortable: true,
      render: (value, item) => (
        <div>
          <span className="font-semibold text-red-600 dark:text-red-400">
            ৳{value.toLocaleString()}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Net: ৳{item.netAmount.toLocaleString()}
          </p>
        </div>
      )
    },
    {
      key: 'paymentMethod',
      header: 'Payment',
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

  const handleAddSale = () => {
    setSelectedTransaction(null);
    setFormData({
      agentId: '',
      customerName: '',
      customerPhone: '',
      productType: '',
      productName: '',
      quantity: '',
      unitPrice: '',
      paymentMethod: '',
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
      customerName: transaction.customerName,
      customerPhone: transaction.customerPhone,
      productType: transaction.productType,
      productName: transaction.productName,
      quantity: transaction.quantity.toString(),
      unitPrice: transaction.unitPrice.toString(),
      paymentMethod: transaction.paymentMethod,
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
        const totalAmount = parseFloat(formData.quantity) * parseFloat(formData.unitPrice);
        const commission = totalAmount * 0.05;
        const netAmount = totalAmount - commission;
        
        setSellData(prev => prev.map(item => 
          item.id === selectedTransaction.id 
            ? { 
                ...item, 
                ...formData, 
                quantity: parseInt(formData.quantity),
                unitPrice: parseFloat(formData.unitPrice),
                totalAmount: totalAmount,
                commission: commission,
                netAmount: netAmount
              }
            : item
        ));
        setShowEditModal(false);
      } else {
        // Add new transaction
        const totalAmount = parseFloat(formData.quantity) * parseFloat(formData.unitPrice);
        const commission = totalAmount * 0.05;
        const netAmount = totalAmount - commission;
        
        const newTransaction = {
          id: Date.now(),
          transactionId: `SELL-${String(Date.now()).slice(-6)}`,
          agentName: 'New Agent', // This would be fetched from agent data
          agentId: formData.agentId,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          productType: formData.productType,
          productName: formData.productName,
          quantity: parseInt(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          totalAmount: totalAmount,
          commission: commission,
          netAmount: netAmount,
          paymentMethod: formData.paymentMethod,
          bankName: formData.bankName,
          referenceNumber: formData.referenceNumber,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          status: 'Pending',
          processedBy: null,
          processedAt: null,
          notes: formData.notes
        };
        setSellData(prev => [...prev, newTransaction]);
        setShowAddModal(false);
      }
      
      setLoading(false);
      setFormData({
        agentId: '',
        customerName: '',
        customerPhone: '',
        productType: '',
        productName: '',
        quantity: '',
        unitPrice: '',
        paymentMethod: '',
        bankName: '',
        referenceNumber: '',
        notes: ''
      });
    }, 1000);
  };

  const handleDeleteTransaction = (transaction) => {
    if (window.confirm(`Are you sure you want to delete transaction ${transaction.transactionId}?`)) {
      setSellData(prev => prev.filter(item => item.id !== transaction.id));
    }
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sell History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage sales transactions
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handleAddSale}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sale</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label="Total Sales"
          value={totalSales.toString()}
          icon={ArrowDownCircle}
          color="red"
        />
        <SmallStat
          label="Completed"
          value={completedSales.toString()}
          icon={CheckCircle}
          color="green"
        />
        <SmallStat
          label="Pending"
          value={pendingSales.toString()}
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
          value={`${Math.round((completedSales / totalSales) * 100)}%`}
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Products</option>
              {productTypes.map(type => (
                <option key={type} value={type}>{type}</option>
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
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        onView={handleViewTransaction}
      />

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedTransaction ? 'Edit Sale' : 'Add Sale'}
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
                      Agent ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.agentId}
                      onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter agent ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter customer phone"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Product Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.productType}
                      onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Air Ticket">Air Ticket</option>
                      <option value="Visa Service">Visa Service</option>
                      <option value="Hajj Package">Hajj Package</option>
                      <option value="Umrah Package">Umrah Package</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter quantity"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter unit price"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Enter bank name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{selectedTransaction ? 'Update' : 'Add'} Sale</span>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sale Details</h2>
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
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <ArrowDownCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
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

                {/* Customer and Product Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">Customer Information</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.customerName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.customerPhone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">Product Information</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.productType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.productName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Financial Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Unit Price</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        ৳{selectedTransaction.unitPrice.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</label>
                      <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                        ৳{selectedTransaction.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Commission</label>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        ৳{selectedTransaction.commission.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900 dark:text-white">Net Amount</span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        ৳{selectedTransaction.netAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment and Status Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Payment Information</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Method</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.paymentMethod}</p>
                      </div>
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
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Transaction Details</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(selectedTransaction.date).toLocaleDateString()} at {selectedTransaction.time}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedTransaction.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          selectedTransaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {selectedTransaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
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
    </div>
  );
};

export default SellHistory;
