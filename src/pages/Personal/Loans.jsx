import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar,
  Target,
  TrendingDown,
  Download,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  Building2,
  Briefcase,
  Award,
  Gift,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Percent,
  AlertTriangle,
  Receipt,
  FileText
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SmallStat from '../../components/common/SmallStat';
import { useTheme } from '../../contexts/ThemeContext';

const PersonalLoans = () => {
  const { isDark } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [loanData, setLoanData] = useState([
    {
      id: 1,
      loanName: 'Home Loan',
      lender: 'BRAC Bank',
      loanType: 'Home Loan',
      principalAmount: 3000000,
      remainingAmount: 2500000,
      interestRate: 9.5,
      monthlyPayment: 25000,
      loanTerm: 15,
      startDate: '2023-01-01',
      nextPaymentDate: '2024-02-01',
      status: 'Active',
      description: 'Home loan for new apartment purchase'
    },
    {
      id: 2,
      loanName: 'Car Loan',
      lender: 'City Bank',
      loanType: 'Auto Loan',
      principalAmount: 800000,
      remainingAmount: 600000,
      interestRate: 12.0,
      monthlyPayment: 15000,
      loanTerm: 5,
      startDate: '2023-06-01',
      nextPaymentDate: '2024-02-01',
      status: 'Active',
      description: 'Car loan for Honda City purchase'
    },
    {
      id: 3,
      loanName: 'Personal Loan',
      lender: 'Dutch Bangla Bank',
      loanType: 'Personal Loan',
      principalAmount: 200000,
      remainingAmount: 120000,
      interestRate: 15.0,
      monthlyPayment: 8000,
      loanTerm: 3,
      startDate: '2023-09-01',
      nextPaymentDate: '2024-02-01',
      status: 'Active',
      description: 'Personal loan for medical expenses'
    },
    {
      id: 4,
      loanName: 'Education Loan',
      lender: 'Sonali Bank',
      loanType: 'Education Loan',
      principalAmount: 500000,
      remainingAmount: 0,
      interestRate: 8.0,
      monthlyPayment: 0,
      loanTerm: 4,
      startDate: '2020-01-01',
      nextPaymentDate: null,
      status: 'Paid Off',
      description: 'Education loan for university studies'
    },
    {
      id: 5,
      loanName: 'Credit Card Debt',
      lender: 'Standard Chartered',
      loanType: 'Credit Card',
      principalAmount: 100000,
      remainingAmount: 75000,
      interestRate: 24.0,
      monthlyPayment: 5000,
      loanTerm: 2,
      startDate: '2023-12-01',
      nextPaymentDate: '2024-02-15',
      status: 'Active',
      description: 'Credit card outstanding balance'
    }
  ]);

  const [formData, setFormData] = useState({
    loanName: '',
    lender: '',
    loanType: '',
    principalAmount: '',
    interestRate: '',
    monthlyPayment: '',
    loanTerm: '',
    startDate: '',
    nextPaymentDate: '',
    description: '',
    status: 'Active'
  });

  // Calculate statistics
  const totalLoanAmount = loanData.reduce((sum, item) => sum + item.principalAmount, 0);
  const totalRemainingAmount = loanData.reduce((sum, item) => sum + item.remainingAmount, 0);
  const totalMonthlyPayments = loanData.filter(item => item.status === 'Active').reduce((sum, item) => sum + item.monthlyPayment, 0);
  const activeLoans = loanData.filter(item => item.status === 'Active').length;
  const paidOffLoans = loanData.filter(item => item.status === 'Paid Off').length;
  const averageInterestRate = loanData.length > 0 
    ? loanData.reduce((sum, item) => sum + item.interestRate, 0) / loanData.length 
    : 0;

  // Table columns configuration
  const columns = [
    {
      key: 'loanName',
      header: 'Loan Name',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Calculator className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-white">{value}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.loanType}</p>
          </div>
        </div>
      )
    },
    {
      key: 'lender',
      header: 'Lender',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'principalAmount',
      header: 'Principal Amount',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900 dark:text-white">
          ৳{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'remainingAmount',
      header: 'Remaining Amount',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-red-600 dark:text-red-400">
          ৳{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'interestRate',
      header: 'Interest Rate',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Percent className="w-3 h-3 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">{value}%</span>
        </div>
      )
    },
    {
      key: 'monthlyPayment',
      header: 'Monthly Payment',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          ৳{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'nextPaymentDate',
      header: 'Next Payment',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className={value ? '' : 'text-gray-500 dark:text-gray-400'}>
            {value ? new Date(value).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Active' 
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            : value === 'Paid Off'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const handleAddLoan = () => {
    setSelectedLoan(null);
    setFormData({
      loanName: '',
      lender: '',
      loanType: '',
      principalAmount: '',
      interestRate: '',
      monthlyPayment: '',
      loanTerm: '',
      startDate: new Date().toISOString().split('T')[0],
      nextPaymentDate: '',
      description: '',
      status: 'Active'
    });
    setShowAddModal(true);
  };

  const handleEditLoan = (loan) => {
    setSelectedLoan(loan);
    setFormData({
      loanName: loan.loanName,
      lender: loan.lender,
      loanType: loan.loanType,
      principalAmount: loan.principalAmount.toString(),
      interestRate: loan.interestRate.toString(),
      monthlyPayment: loan.monthlyPayment.toString(),
      loanTerm: loan.loanTerm.toString(),
      startDate: loan.startDate,
      nextPaymentDate: loan.nextPaymentDate || '',
      description: loan.description,
      status: loan.status
    });
    setShowEditModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (selectedLoan) {
        // Update existing loan
        const updatedData = { 
          ...formData, 
          principalAmount: parseFloat(formData.principalAmount),
          interestRate: parseFloat(formData.interestRate),
          monthlyPayment: parseFloat(formData.monthlyPayment),
          loanTerm: parseInt(formData.loanTerm),
          remainingAmount: formData.status === 'Paid Off' ? 0 : parseFloat(formData.principalAmount)
        };
        setLoanData(prev => prev.map(item => 
          item.id === selectedLoan.id ? updatedData : item
        ));
        setShowEditModal(false);
      } else {
        // Add new loan
        const newLoan = {
          id: Date.now(),
          ...formData,
          principalAmount: parseFloat(formData.principalAmount),
          interestRate: parseFloat(formData.interestRate),
          monthlyPayment: parseFloat(formData.monthlyPayment),
          loanTerm: parseInt(formData.loanTerm),
          remainingAmount: parseFloat(formData.principalAmount)
        };
        setLoanData(prev => [...prev, newLoan]);
        setShowAddModal(false);
      }
      
      setLoading(false);
      setFormData({
        loanName: '',
        lender: '',
        loanType: '',
        principalAmount: '',
        interestRate: '',
        monthlyPayment: '',
        loanTerm: '',
        startDate: new Date().toISOString().split('T')[0],
        nextPaymentDate: '',
        description: '',
        status: 'Active'
      });
    }, 1000);
  };

  const handleDeleteLoan = (loan) => {
    if (window.confirm('Are you sure you want to delete this loan record?')) {
      setLoanData(prev => prev.filter(item => item.id !== loan.id));
    }
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Personal Loans
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your personal loans and track payment schedules
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handleAddLoan}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Loan</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label="Total Loan Amount"
          value={`৳${totalLoanAmount.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
        <SmallStat
          label="Remaining Debt"
          value={`৳${totalRemainingAmount.toLocaleString()}`}
          icon={TrendingDown}
          color="red"
        />
        <SmallStat
          label="Monthly Payments"
          value={`৳${totalMonthlyPayments.toLocaleString()}`}
          icon={Calendar}
          color="blue"
        />
        <SmallStat
          label="Active Loans"
          value={`${activeLoans} loans`}
          icon={Target}
          color="yellow"
        />
      </div>

      {/* Loan Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Outstanding Debt</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ৳{totalRemainingAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Payments</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ৳{totalMonthlyPayments.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Paid Off</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {paidOffLoans} loans
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={loanData}
        columns={columns}
        searchable={true}
        exportable={true}
        actions={true}
        onEdit={handleEditLoan}
        onDelete={handleDeleteLoan}
      />

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedLoan ? 'Edit Loan' : 'Add Loan'}
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
                    Loan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.loanName}
                    onChange={(e) => setFormData({ ...formData, loanName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="e.g., Home Loan, Car Loan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lender/Bank <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lender}
                    onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="e.g., BRAC Bank, City Bank"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loan Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.loanType}
                    onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Loan Type</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Auto Loan">Auto Loan</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Education Loan">Education Loan</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Business Loan">Business Loan</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Principal Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.principalAmount}
                      onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interest Rate (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="0.0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Monthly Payment <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyPayment}
                      onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Loan Term (Years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.loanTerm}
                      onChange={(e) => setFormData({ ...formData, loanTerm: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Next Payment Date
                    </label>
                    <input
                      type="date"
                      value={formData.nextPaymentDate}
                      onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Brief description of this loan..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Paid Off">Paid Off</option>
                    <option value="Default">Default</option>
                  </select>
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
                    <span>{selectedLoan ? 'Update' : 'Add'} Loan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalLoans;