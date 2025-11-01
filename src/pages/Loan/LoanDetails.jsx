import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useLoan, useRecordLoanPayment, useRecordLoanRepayment } from '../../hooks/useLoanQueries';
import { useAccountQueries } from '../../hooks/useAccountQueries';
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Edit,
  Download,
  Loader2,
  CreditCard,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

const LoanDetails = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { loan: loanFromState } = location.state || {};
  
  // Try to get loan from state first, otherwise fetch by ID
  const { data: loanData, isLoading } = useLoan(id && !loanFromState ? id : null);
  
  // Use loan from state if available, otherwise from API
  const loan = loanFromState || loanData?.loan;
  const transactionSummary = loanData?.transactionSummary;
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    targetAccountId: '',
    notes: ''
  });
  const [paymentErrors, setPaymentErrors] = useState({});
  
  // Queries for payment
  const recordPaymentMutation = useRecordLoanPayment(); // For Loan Giving (Borrower payment)
  const recordRepaymentMutation = useRecordLoanRepayment(); // For Loan Receiving (Repayment)
  const accountQueries = useAccountQueries();
  const { data: bankAccounts = [] } = accountQueries.useBankAccounts();

  if (isLoading && !loanFromState) {
    return (
      <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading loan details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Loan Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The loan you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/loan')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Loan List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'overdue':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateMonthlyPayment = () => {
    const principal = loan.amount;
    const rate = loan.interestRate / 100 / 12; // Monthly interest rate
    const periods = loan.duration;
    
    if (rate === 0) {
      return principal / periods;
    }
    
    return (principal * rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1);
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalInterest = (monthlyPayment * loan.duration) - loan.amount;

  return (
    <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                (loan.loanDirection || loan.type) === 'giving' 
                  ? 'bg-blue-100 dark:bg-blue-900/20' 
                  : 'bg-green-100 dark:bg-green-900/20'
              }`}>
                {(loan.loanDirection || loan.type) === 'giving' ? (
                  <TrendingDown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                  Loan Details
                </h1>
                <p className={`mt-1 text-lg transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {(loan.loanDirection || loan.type) === 'giving' ? 'Loan Given' : 'Loan Received'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          {/* Status Banner */}
          <div className={`p-6 border-b ${
            isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-100 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                  {getStatusIcon(loan.status)}
                  {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </span>
                <span className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {(loan.loanDirection || loan.type) === 'giving' ? 'Loan Given' : 'Loan Received'}
                </span>
              </div>
              <div className="flex gap-2">
                {/* Record Payment/Repayment button - only for active loans */}
                {loan.status === 'Active' && loan.remainingAmount > 0 && (
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    {(loan.loanDirection || loan.type) === 'giving' ? 'Record Payment' : 'Record Repayment'}
                  </button>
                )}
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Contact Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {loan.fullName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Business</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {loan.businessName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {loan.contactPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Loan Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Loan Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Loan Amount</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(loan.amount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Interest Rate</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {loan.interestRate}% per annum
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {loan.duration} months
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(loan.loanDirection || loan.type) === 'giving' ? 'Given Date' : (loan.appliedDate ? 'Applied Date' : 'Received Date')}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate((loan.loanDirection || loan.type) === 'giving' ? loan.givenDate : (loan.appliedDate || loan.receivedDate))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Payment Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50 border-blue-200'
                }`}>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Payment</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(monthlyPayment)}
                  </p>
                </div>
                
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-green-50 border-green-200'
                }`}>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Interest</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalInterest)}
                  </p>
                </div>
                
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-purple-50 border-purple-200'
                }`}>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Remaining Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(loan.remainingAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Payment Progress
              </h3>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${((loan.amount - loan.remainingAmount) / loan.amount) * 100}%` 
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Paid: {formatCurrency(loan.amount - loan.remainingAmount)}</span>
                <span>Remaining: {formatCurrency(loan.remainingAmount)}</span>
              </div>
            </div>

            {/* Transaction Summary */}
            {transactionSummary && transactionSummary.count > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Transaction History
                  <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                    {transactionSummary.count}
                  </span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className={`p-3 rounded-lg border ${
                    isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-green-50 border-green-200'
                  }`}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Received</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(transactionSummary.totalReceived)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg border ${
                    isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-red-50 border-red-200'
                  }`}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Paid</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(transactionSummary.totalPaid)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto ${isDark ? 'border border-gray-700' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {(loan.loanDirection || loan.type) === 'giving' ? 'Record Loan Payment' : 'Record Loan Repayment'}
              </h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentForm({ amount: '', paymentDate: new Date().toISOString().split('T')[0], targetAccountId: '', notes: '' });
                  setPaymentErrors({});
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              
              const errors = {};
              if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
                errors.amount = 'Valid amount required';
              }
              if (parseFloat(paymentForm.amount) > loan.remainingAmount) {
                errors.amount = `Cannot exceed remaining amount: ${formatCurrency(loan.remainingAmount)}`;
              }
              if (!paymentForm.targetAccountId) {
                errors.targetAccountId = 'Please select an account';
              }

              setPaymentErrors(errors);
              if (Object.keys(errors).length > 0) return;

              const isLoanGiving = (loan.loanDirection || loan.type) === 'giving';
              
              // Use the appropriate mutation based on loan direction
              if (isLoanGiving) {
                // Loan Giving: Borrower paying us (CREDIT transaction)
                recordPaymentMutation.mutate(
                  {
                    loanId: loan.loanId || loan._id,
                    paymentData: {
                      ...paymentForm,
                      amount: parseFloat(paymentForm.amount),
                      createdBy: 'SYSTEM',
                      branchId: loan.branchId || 'main_branch'
                    }
                  },
                  {
                    onSuccess: () => {
                      setShowPaymentModal(false);
                      setPaymentForm({ amount: '', paymentDate: new Date().toISOString().split('T')[0], targetAccountId: '', notes: '' });
                      setPaymentErrors({});
                    }
                  }
                );
              } else {
                // Loan Receiving: We paying back (DEBIT transaction - needs sourceAccountId)
                recordRepaymentMutation.mutate(
                  {
                    loanId: loan.loanId || loan._id,
                    repaymentData: {
                      ...paymentForm,
                      sourceAccountId: paymentForm.targetAccountId, // Rename for repayment API
                      amount: parseFloat(paymentForm.amount),
                      repaymentDate: paymentForm.paymentDate,
                      createdBy: 'SYSTEM',
                      branchId: loan.branchId || 'main_branch'
                    }
                  },
                  {
                    onSuccess: () => {
                      setShowPaymentModal(false);
                      setPaymentForm({ amount: '', paymentDate: new Date().toISOString().split('T')[0], targetAccountId: '', notes: '' });
                      setPaymentErrors({});
                    }
                  }
                );
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Amount *
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder={`Max: ${formatCurrency(loan.remainingAmount)}`}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      paymentErrors.amount ? 'border-red-500' : 'border-gray-300'
                    } ${isDark ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    step="0.01"
                    min="0"
                  />
                  {paymentErrors.amount && (
                    <p className="mt-1 text-sm text-red-600">{paymentErrors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {(loan.loanDirection || loan.type) === 'giving' ? 'Credit To Account *' : 'Debit From Account *'}
                  </label>
                  <select
                    value={paymentForm.targetAccountId}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, targetAccountId: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      paymentErrors.targetAccountId ? 'border-red-500' : 'border-gray-300'
                    } ${isDark ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  >
                    <option value="">Select Account</option>
                    {bankAccounts.map((account) => (
                      <option key={account._id || account.id} value={account._id || account.id}>
                        {account.bankName || account.accountName} - {account.accountNumber}
                      </option>
                    ))}
                  </select>
                  {paymentErrors.targetAccountId && (
                    <p className="mt-1 text-sm text-red-600">{paymentErrors.targetAccountId}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {(loan.loanDirection || loan.type) === 'giving' 
                      ? 'Where the borrower\'s payment will be credited (our account receives money)'
                      : 'Account from which repayment will be debited (our account pays money out)'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
                    }`}
                    placeholder="Additional notes about this payment..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentForm({ amount: '', paymentDate: new Date().toISOString().split('T')[0], targetAccountId: '', notes: '' });
                      setPaymentErrors({});
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recordPaymentMutation.isPending || recordRepaymentMutation.isPending}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {(recordPaymentMutation.isPending || recordRepaymentMutation.isPending) ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      (loan.loanDirection || loan.type) === 'giving' ? 'Record Payment' : 'Record Repayment'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDetails;
