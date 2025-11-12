import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  History,
  Search,
  Download,
  Trash2,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Plus
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useExchanges, useDeleteExchange } from '../../hooks/useMoneyExchangeQueries';

const List = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  // Build filters for API
  const filters = useMemo(() => {
    const f = {
      page,
      limit: pageSize,
    };
    if (filterType !== 'all') {
      f.type = filterType === 'receive' ? 'Buy' : 'Sell';
    }
    if (filterCurrency !== 'all') {
      f.currencyCode = filterCurrency;
    }
    if (fromDate) {
      f.dateFrom = fromDate;
    }
    if (toDate) {
      f.dateTo = toDate;
    }
    if (searchTerm) {
      f.search = searchTerm;
    }
    return f;
  }, [page, pageSize, filterType, filterCurrency, fromDate, toDate, searchTerm]);

  // Fetch exchanges from API
  const { data: exchangesData, isLoading, refetch } = useExchanges(filters);
  const deleteExchange = useDeleteExchange();

  const transactions = exchangesData?.data || [];
  const pagination = exchangesData?.pagination || { page: 1, limit: 10, total: 0, pages: 0 };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('bn-BD-u-nu-latn', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (value, minimumFractionDigits = 2, maximumFractionDigits = 2) => {
    const numericValue = Number.isFinite(value) ? value : Number(value);
    if (!Number.isFinite(numericValue)) {
      return minimumFractionDigits > 0 ? `0.${'0'.repeat(minimumFractionDigits)}` : '0';
    }
    return numericValue.toLocaleString('bn-BD-u-nu-latn', {
      minimumFractionDigits,
      maximumFractionDigits,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'receive' ? 
      <ArrowDownCircle className="w-5 h-5 text-green-600" /> : 
      <ArrowUpCircle className="w-5 h-5 text-red-600" />;
  };

  // Transform API data to match component expectations
  const transformedTransactions = useMemo(() => {
    return transactions.map((t) => ({
      id: t.id,
      type: t.type === 'Buy' ? 'receive' : 'give',
      fromCurrency: t.currencyCode,
      toCurrency: 'BDT',
      amount: t.quantity,
      rate: t.exchangeRate,
      total: t.amount_bdt,
      date: t.date,
      time: t.createdAt ? new Date(t.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
      status: t.isActive ? 'completed' : 'cancelled',
      customer: t.fullName,
      reference: t.id,
      phone: t.mobileNumber,
    }));
  }, [transactions]);

  const totalReceive = transformedTransactions
    .filter(t => t.type === 'receive' && t.status === 'completed')
    .reduce((sum, t) => sum + t.total, 0);

  const totalGive = transformedTransactions
    .filter(t => t.type === 'give' && t.status === 'completed')
    .reduce((sum, t) => sum + t.total, 0);

  const handleSelectTransaction = (id) => {
    setSelectedTransactions(prev => 
      prev.includes(id) 
        ? prev.filter(transactionId => transactionId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === transformedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transformedTransactions.map(t => t.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTransactions.length === 0) return;
    
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `আপনি ${selectedTransactions.length}টি লেনদেন মুছে ফেলতে যাচ্ছেন। এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      try {
        // Delete all selected transactions
        await Promise.all(selectedTransactions.map(id => deleteExchange.mutateAsync(id)));
        setSelectedTransactions([]);
        refetch();
      } catch (error) {
        console.error('Failed to delete transactions:', error);
      }
    }
  };

  const handleDeleteSingle = async (id) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      try {
        await deleteExchange.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  const handleExport = () => {
    const headers = ['Date', 'Txn ID', 'Type', 'Currency From', 'Currency To', 'Rate', 'Quantity', 'Amount (BDT)'];
    const rows = transformedTransactions.map((t) => [
      t.date,
      t.reference,
      t.type === 'receive' ? 'Buy' : 'Sell',
      t.fromCurrency,
      t.toCurrency,
      t.rate,
      t.amount,
      t.total,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `exchange_list_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalPages = pagination.pages || 1;
  const currentPage = pagination.page || 1;
  const paged = transformedTransactions;

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCurrency('all');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-3 sm:mb-4">
            <History className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            লেনদেন তালিকা
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-2">
            মুদ্রা বিনিময়ের সমস্ত লেনদেন দেখুন এবং পরিচালনা করুন
          </p>
          <button
            onClick={() => navigate('/money-exchange/new')}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm sm:text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>নতুন লেনদেন</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">মোট গ্রহণ</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400 truncate">
                  {formatCurrency(totalReceive, 'BDT')}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">মোট প্রদান</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 truncate">
                  {formatCurrency(totalGive, 'BDT')}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">নিট লাভ</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
                  {formatCurrency(totalReceive - totalGive, 'BDT')}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">মোট লেনদেন</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">
                  {pagination.total || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Customer / Voucher / Phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="sm:col-span-1 lg:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">সব</option>
                <option value="receive">ক্রয় (Buy)</option>
                <option value="give">বিক্রয় (Sell)</option>
              </select>
            </div>
            <div className="sm:col-span-1 lg:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All</option>
                {['USD','EUR','GBP','SAR','AED','QAR','KWD','OMR','JPY','AUD','CAD','CHF','CNY','INR','PKR','SGD','THB','MYR'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-1 lg:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="sm:col-span-1 lg:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <button 
                onClick={resetFilters} 
                className="w-full px-3 sm:px-4 py-2 text-sm border rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>

            <div className="sm:col-span-2 lg:col-span-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 sm:gap-3">
                <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">Rows</label>
                <select
                  className="px-2 py-1.5 text-xs sm:text-sm border rounded-md dark:bg-gray-700 dark:text-white"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                >
                  {[5,10,20,50].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedTransactions.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Delete ({selectedTransactions.length})</span>
                    <span className="sm:hidden">Del ({selectedTransactions.length})</span>
                  </button>
                )}
                <button
                  onClick={handleExport}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Loading...
              </div>
            ) : paged.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No transactions found
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {paged.map((transaction) => (
                  <div key={transaction.id} className="p-4 space-y-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(transaction.id)}
                          onChange={() => handleSelectTransaction(transaction.id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0 mt-1"
                        />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getTypeIcon(transaction.type)}
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {transaction.type === 'receive' ? 'ক্রয় (Buy)' : 'বিক্রয় (Sell)'}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 hidden sm:inline">
                          {transaction.status === 'completed' ? 'সম্পন্ন' : 
                           transaction.status === 'pending' ? 'মুলতবি' : 'বাতিল'}
                        </span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">গ্রাহক</p>
                        <p className="font-medium text-gray-900 dark:text-white truncate">{transaction.customer}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">মুদ্রা</p>
                        <p className="font-medium text-gray-900 dark:text-white">{transaction.fromCurrency} → {transaction.toCurrency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">পরিমাণ</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatNumber(transaction.amount)} {transaction.fromCurrency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">হার</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatNumber(transaction.rate, 4, 4)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">মোট</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{formatCurrency(transaction.total, 'BDT')}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">তারিখ</p>
                        <p className="text-sm text-gray-900 dark:text-white">{transaction.date} {transaction.time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <button 
                        onClick={() => navigate(`/money-exchange/details/${transaction.id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="বিবরণ দেখুন"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => navigate(`/money-exchange/edit/${transaction.id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSingle(transaction.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 xl:px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.length === transformedTransactions.length && transformedTransactions.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ধরন
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    গ্রাহক
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    মুদ্রা
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    পরিমাণ
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    হার
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    মোট
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    তারিখ
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    কাজ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  paged.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 xl:px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => handleSelectTransaction(transaction.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(transaction.type)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {transaction.type === 'receive' ? 'ক্রয় (Buy)' : 'বিক্রয় (Sell)'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {transaction.customer}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                          {transaction.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
                        {transaction.fromCurrency} → {transaction.toCurrency}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
                        {formatNumber(transaction.amount)} {transaction.fromCurrency}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
                        {formatNumber(transaction.rate, 4, 4)}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(transaction.total, 'BDT')}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 whitespace-nowrap">
                          {transaction.status === 'completed' ? 'সম্পন্ন' : 
                           transaction.status === 'pending' ? 'মুলতবি' : 'বাতিল'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
                        {transaction.date}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {transaction.time}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => navigate(`/money-exchange/details/${transaction.id}`)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="বিবরণ দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/money-exchange/edit/${transaction.id}`)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="সম্পাদনা করুন"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSingle(transaction.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-gray-50 dark:bg-gray-700/30">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left">
              Showing <span className="font-medium">{pagination.total === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, pagination.total)}</span> of{' '}
              <span className="font-medium">{pagination.total}</span> results
            </div>
            <div className="inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm border rounded-l-md ${currentPage === 1 || isLoading ? 'text-gray-400 bg-white dark:bg-gray-800 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'}`}
              >
                <span className="hidden sm:inline">Prev</span>
                <span className="sm:hidden">‹</span>
              </button>
              <span className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border-t border-b bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm border rounded-r-md ${currentPage === totalPages || isLoading ? 'text-gray-400 bg-white dark:bg-gray-800 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'}`}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;
