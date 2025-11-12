import React, { useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Banknote, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  Edit, 
  Trash2, 
  History, 
  Plus,
  Calendar,
  DollarSign,
  Activity,
  Shield,
  MapPin,
  Phone,
  Mail,
  Globe,
  Download,
  Share2,
  MoreVertical,
  Hash,
  Loader2
} from 'lucide-react';
import Modal, { ModalFooter } from '../../components/common/Modal';
import SmallStat from '../../components/common/SmallStat';
import { useAccountQueries } from '../../hooks/useAccountQueries';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

// Transaction History Component
const TransactionHistory = ({ accountId }) => {
  const { useBankAccountTransactions } = useAccountQueries();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: ''
  });

  const { data: transactionData, isLoading, error } = useBankAccountTransactions(accountId, {
    page,
    limit: 10,
    ...filters
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">Error loading transactions</p>
      </div>
    );
  }

  const { transactions = [], pagination = {} } = transactionData;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setFilters({type: '', startDate: '', endDate: ''})}
            className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Reference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    transaction.transactionType === 'credit' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {transaction.transactionType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {transaction.description || transaction.notes}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {transaction.paymentDetails?.amount?.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {transaction.paymentDetails?.reference || transaction.transactionId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                <span className="font-medium">{pagination.totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BankAccountsProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    useBankAccount, 
    useDeleteBankAccount, 
    useAdjustBankAccountBalance,
    useCreateBankAccountTransaction,
    useBankAccountTransactions
  } = useAccountQueries();
  
  const { data: bankAccount, isLoading, error } = useBankAccount(id);
  const deleteBankAccountMutation = useDeleteBankAccount();
  const adjustBalanceMutation = useAdjustBankAccountBalance();
  const createTransactionMutation = useCreateBankAccountTransaction();

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [balanceData, setBalanceData] = useState({
    amount: '',
    note: '',
    type: 'deposit',
    createdBy: 'SYSTEM',
    branchId: 'BRANCH001'
  });
  const [transactionData, setTransactionData] = useState({
    transactionType: 'credit',
    amount: '',
    description: '',
    reference: '',
    notes: '',
    createdBy: 'SYSTEM',
    branchId: 'BRANCH001'
  });
  const statementRef = useRef(null);
  const { data: statementTransactionsData } = useBankAccountTransactions(id, { page: 1, limit: 50 });
  const transactions = statementTransactionsData?.transactions ?? [];

  const totals = useMemo(() => {
    const deposits = transactions
      .filter(tx => tx.transactionType === 'credit')
      .reduce((sum, tx) => sum + (tx.paymentDetails?.amount || tx.amount || 0), 0);
    const withdrawals = transactions
      .filter(tx => tx.transactionType === 'debit')
      .reduce((sum, tx) => sum + (tx.paymentDetails?.amount || tx.amount || 0), 0);

    const closingBalance = bankAccount?.currentBalance ?? 0;
    const openingBalance = bankAccount?.initialBalance ?? (closingBalance - deposits + withdrawals);

    const sortedDates = transactions
      .map(tx => new Date(tx.date))
      .filter(date => !Number.isNaN(date.getTime()))
      .sort((a, b) => a - b);

    const periodStart = sortedDates[0] || (bankAccount?.createdAt ? new Date(bankAccount.createdAt) : null);
    const periodEnd = sortedDates[sortedDates.length - 1] || (bankAccount?.updatedAt ? new Date(bankAccount.updatedAt) : new Date());

    return {
      deposits,
      withdrawals,
      openingBalance,
      closingBalance,
      periodStart,
      periodEnd
    };
  }, [transactions, bankAccount]);

  const formatCurrency = (value) => {
    if (!bankAccount?.currency) {
      return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return `${bankAccount.currency} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (value) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditAccount = () => {
    navigate(`/account/edit-bank-account/${id}`);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(`Are you sure you want to delete ${bankAccount?.bankName} account?`)) {
      try {
        await deleteBankAccountMutation.mutateAsync(id);
        navigate('/account/bank-accounts');
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleBalanceAdjustment = () => {
    setBalanceData({
      amount: '',
      note: '',
      type: 'deposit',
      createdBy: 'SYSTEM',
      branchId: 'BRANCH001'
    });
    setIsBalanceModalOpen(true);
  };

  const handleCreateTransaction = () => {
    setTransactionData({
      transactionType: 'credit',
      amount: '',
      description: '',
      reference: '',
      notes: '',
      createdBy: 'SYSTEM',
      branchId: 'BRANCH001'
    });
    setIsTransactionModalOpen(true);
  };

  const handleDownloadStatement = async () => {
    if (!statementRef.current || isGeneratingPdf) {
      return;
    }

    try {
      setIsGeneratingPdf(true);
      const canvas = await html2canvas(statementRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);

      let heightLeft = pdfHeight;
      const pageHeight = pdf.internal.pageSize.getHeight();
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `bank-statement-${bankAccount?.accountNumber || id || 'account'}.pdf`;
      pdf.save(fileName);

      Swal.fire({
        title: 'সফল!',
        text: 'ব্যাংক স্টেটমেন্ট সফলভাবে ডাউনলোড হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981'
      });
    } catch (error) {
      console.error('Statement generation failed:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'স্টেটমেন্ট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    try {
      await adjustBalanceMutation.mutateAsync({
        id,
        amount: balanceData.amount,
        type: balanceData.type,
        note: balanceData.note,
        createdBy: balanceData.createdBy,
        branchId: balanceData.branchId,
      });
      setIsBalanceModalOpen(false);
      setBalanceData({ amount: '', note: '', type: 'deposit', createdBy: 'SYSTEM', branchId: 'BRANCH001' });
    } catch (err) {
      console.error('Balance adjustment failed:', err);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTransactionMutation.mutateAsync({
        id,
        ...transactionData,
        amount: parseFloat(transactionData.amount),
      });
      setIsTransactionModalOpen(false);
      setTransactionData({
        transactionType: 'credit',
        amount: '',
        description: '',
        reference: '',
        notes: '',
        createdBy: 'SYSTEM',
        branchId: 'BRANCH001'
      });
    } catch (err) {
      console.error('Transaction creation failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bank account details...</p>
        </div>
      </div>
    );
  }

  if (error || !bankAccount) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The bank account you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/account/bank-accounts')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bank Accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div
        ref={statementRef}
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: '794px',
          padding: '32px',
          backgroundColor: '#FFFFFF',
          color: '#111827',
          fontFamily: 'Inter, Arial, sans-serif',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {bankAccount?.logo ? (
              <img src={bankAccount.logo} alt="Bank Logo" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {bankAccount?.bankName?.[0] || 'B'}
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{bankAccount?.bankName || 'Bank Name'}</h1>
              <p style={{ color: '#6B7280' }}>{bankAccount?.branchName || 'Branch Name'}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-block', padding: '6px 18px', borderRadius: '999px', background: '#13288F', color: '#FFFFFF', fontWeight: 600, fontSize: '14px' }}>
              Bank Statement
            </span>
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#6B7280' }}>
              Generated on {formatDate(new Date())}
            </p>
          </div>
        </div>

        <hr style={{ margin: '24px 0', borderColor: '#E5E7EB' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '24px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: '#F9FAFB' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Account Holder</h2>
            <p style={{ fontWeight: 600 }}>{bankAccount?.accountHolder || 'N/A'}</p>
            <p style={{ color: '#6B7280', marginTop: '8px' }}>
              Title: {bankAccount?.accountTitle || 'N/A'}
              <br />
              Created By: {bankAccount?.createdBy || 'N/A'}
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: '#F9FAFB' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Account Details</h2>
            <p style={{ fontWeight: 600 }}>Account Number: {bankAccount?.accountNumber || 'N/A'}</p>
            <p style={{ marginTop: '6px' }}>Routing Number: {bankAccount?.routingNumber || 'N/A'}</p>
            <p style={{ marginTop: '6px' }}>Branch ID: {bankAccount?.branchId || 'N/A'}</p>
            <p style={{ marginTop: '6px', color: '#6B7280' }}>
              Statement Period:{' '}
              {totals.periodStart && totals.periodEnd
                ? `${formatDate(totals.periodStart)} - ${formatDate(totals.periodEnd)}`
                : 'N/A'}
            </p>
          </div>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Account Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>Opening Balance</p>
              <p style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>{formatCurrency(totals.openingBalance)}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>Deposits</p>
              <p style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', color: '#059669' }}>{formatCurrency(totals.deposits)}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>Withdrawals</p>
              <p style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', color: '#DC2626' }}>{formatCurrency(totals.withdrawals)}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>Closing Balance</p>
              <p style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>{formatCurrency(totals.closingBalance)}</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Transaction Details</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', border: '1px solid #E5E7EB' }}>
            <thead style={{ background: '#13288F', color: '#FFFFFF' }}>
              <tr>
                <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Withdrawals</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Deposits</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => {
                  const amount = transaction.paymentDetails?.amount || transaction.amount || 0;
                  const isCredit = transaction.transactionType === 'credit';
                  const balance = transaction.paymentDetails?.balanceAfter ?? transaction.balanceAfter ?? null;

                  return (
                    <tr key={transaction._id} style={{ borderBottom: '1px solid #E5E7EB', background: '#FFFFFF' }}>
                      <td style={{ padding: '10px' }}>{formatDate(transaction.date) || '—'}</td>
                      <td style={{ padding: '10px' }}>{transaction.description || transaction.notes || '—'}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: !isCredit ? '#DC2626' : '#111827' }}>
                        {!isCredit ? formatCurrency(amount) : '—'}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', color: isCredit ? '#059669' : '#111827' }}>
                        {isCredit ? formatCurrency(amount) : '—'}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        {balance !== null ? formatCurrency(balance) : formatCurrency(totals.closingBalance)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>No transactions recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>Prepared by</p>
            <p style={{ fontWeight: 600, marginTop: '6px' }}>{bankAccount?.branchName || 'Branch Manager'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>Authorized Signature</p>
            <div style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '999px', border: '1px dashed #9CA3AF', color: '#1F2937', fontWeight: 600, display: 'inline-block' }}>
              {bankAccount?.bankName || 'Finance Department'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/account/bank-accounts')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {bankAccount.bankName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Account Details & Transaction History
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={handleEditAccount}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Account
            </button>
            <button
              onClick={handleDeleteAccount}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Account Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Information</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBalanceAdjustment}
                    className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
                    title="Adjust Balance"
                  >
                    <Banknote className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCreateTransaction}
                    className="p-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors duration-200"
                    title="Create Transaction"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Bank Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{bankAccount.bankName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Account Number</p>
                      <p className="font-medium text-gray-900 dark:text-white">{bankAccount.accountNumber}</p>
                    </div>
                  </div>

                  {bankAccount.routingNumber && (
                    <div className="flex items-center space-x-3">
                      <Hash className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Routing Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">{bankAccount.routingNumber}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Account Type</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        bankAccount.accountType === 'Current' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        bankAccount.accountType === 'Savings' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                      }`}>
                        {bankAccount.accountType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Currency</p>
                      <p className="font-medium text-gray-900 dark:text-white">{bankAccount.currency}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Account Title</p>
                      <p className="font-medium text-gray-900 dark:text-white">{bankAccount.accountTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        bankAccount.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {bankAccount.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(bankAccount.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {bankAccount.branchName && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Branch</p>
                        <p className="font-medium text-gray-900 dark:text-white">{bankAccount.branchName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {bankAccount.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{bankAccount.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Balance Statistics */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Balance Overview</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {bankAccount.currency} {bankAccount.currentBalance?.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Initial Balance</p>
                  <p className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
                    {bankAccount.currency} {bankAccount.initialBalance?.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Balance Change</p>
                  <p className={`text-xl font-semibold ${
                    (bankAccount.currentBalance - bankAccount.initialBalance) >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {bankAccount.currency} {(bankAccount.currentBalance - bankAccount.initialBalance).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleBalanceAdjustment}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Banknote className="w-4 h-4 mr-2" />
                  Adjust Balance
                </button>
                <button
                  onClick={handleCreateTransaction}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Transaction
                </button>
                <button
                  onClick={handleDownloadStatement}
                  disabled={isGeneratingPdf}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Statement
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction History</h2>
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Account: {bankAccount.accountNumber}
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <TransactionHistory accountId={id} />
          </div>
        </div>

        {/* Balance Adjustment Modal */}
        <Modal
          isOpen={isBalanceModalOpen}
          onClose={() => setIsBalanceModalOpen(false)}
          title="Adjust Account Balance"
          size="md"
        >
          <form onSubmit={handleBalanceSubmit} className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Adjusting balance for {bankAccount?.bankName}
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Current Balance: {bankAccount?.currency} {bankAccount?.currentBalance?.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Type *
              </label>
              <select
                required
                value={balanceData.type}
                onChange={(e) => setBalanceData({...balanceData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={balanceData.amount}
                onChange={(e) => setBalanceData({...balanceData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Note
              </label>
              <textarea
                value={balanceData.note}
                onChange={(e) => setBalanceData({...balanceData, note: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Optional note about this transaction..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Created By
              </label>
              <input
                type="text"
                value={balanceData.createdBy}
                onChange={(e) => setBalanceData({...balanceData, createdBy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="User ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Branch ID
              </label>
              <input
                type="text"
                value={balanceData.branchId}
                onChange={(e) => setBalanceData({...balanceData, branchId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Branch ID"
              />
            </div>

            <ModalFooter>
              <button
                type="button"
                onClick={() => setIsBalanceModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                {balanceData.type === 'deposit' ? 'Add Deposit' : 'Process Withdrawal'}
              </button>
            </ModalFooter>
          </form>
        </Modal>

        {/* Transaction Creation Modal */}
        <Modal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          title="Create Bank Transaction"
          size="lg"
        >
          <form onSubmit={handleTransactionSubmit} className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Creating transaction for {bankAccount?.bankName}
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Current Balance: {bankAccount?.currency} {bankAccount?.currentBalance?.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction Type *
                </label>
                <select
                  required
                  value={transactionData.transactionType}
                  onChange={(e) => setTransactionData({...transactionData, transactionType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="credit">Credit (Deposit)</option>
                  <option value="debit">Debit (Withdrawal)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={transactionData.description}
                  onChange={(e) => setTransactionData({...transactionData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Transaction description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reference
                </label>
                <input
                  type="text"
                  value={transactionData.reference}
                  onChange={(e) => setTransactionData({...transactionData, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Reference number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Created By
                </label>
                <input
                  type="text"
                  value={transactionData.createdBy}
                  onChange={(e) => setTransactionData({...transactionData, createdBy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="User ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Branch ID
                </label>
                <input
                  type="text"
                  value={transactionData.branchId}
                  onChange={(e) => setTransactionData({...transactionData, branchId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Branch ID"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={transactionData.notes}
                  onChange={(e) => setTransactionData({...transactionData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <ModalFooter>
              <button
                type="button"
                onClick={() => setIsTransactionModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTransactionMutation.isPending}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors duration-200 flex items-center"
              >
                {createTransactionMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Transaction'
                )}
              </button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default BankAccountsProfile;
