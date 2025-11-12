import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  BarChart3,
  RefreshCw,
  Filter,
  Download,
  Globe,
  ArrowUpCircle,
  ArrowDownCircle,
  Calculator
} from 'lucide-react';
import { useReserves, useExchangeDashboard } from '../../hooks/useMoneyExchangeQueries';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('reserves'); // 'reserves' or 'dashboard'
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Build filters for dashboard
  const dashboardFilters = useMemo(() => {
    const f = {};
    if (currencyFilter) f.currencyCode = currencyFilter;
    if (fromDate) f.fromDate = fromDate;
    if (toDate) f.toDate = toDate;
    return f;
  }, [currencyFilter, fromDate, toDate]);

  // Fetch reserves data
  const { data: reservesData, isLoading: reservesLoading, refetch: refetchReserves } = useReserves();
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useExchangeDashboard(dashboardFilters);

  const reserves = reservesData?.data || [];
  const reservesSummary = reservesData?.summary || { totalCurrencies: 0, totalReserveValue: 0 };

  const dashboardItems = dashboardData?.data || [];
  const dashboardSummary = dashboardData?.summary || {
    totalRealizedProfitLoss: 0,
    totalUnrealizedProfitLoss: 0,
    totalPurchaseCost: 0,
    totalSaleRevenue: 0,
    totalCurrentReserveValue: 0,
    totalCurrencies: 0,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumberLocal = (num, decimals = 2) => {
    if (num === 0 || num === null || num === undefined) return '0.00';
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const handleExportReserves = () => {
    const headers = ['Currency Code', 'Currency Name', 'Reserve', 'Weighted Avg Purchase Price', 'Current Reserve Value', 'Total Bought', 'Total Sold'];
    const rows = reserves.map((r) => [
      r.currencyCode,
      r.currencyName,
      r.reserve,
      r.weightedAveragePurchasePrice,
      r.currentReserveValue,
      r.totalBought,
      r.totalSold,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `currency_reserves_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportDashboard = () => {
    const headers = ['Currency Code', 'Currency Name', 'Total Bought', 'Total Sold', 'Current Reserve', 'Weighted Avg Purchase Price', 'Realized Profit/Loss', 'Total Purchase Cost', 'Total Sale Revenue'];
    const rows = dashboardItems.map((d) => [
      d.currencyCode,
      d.currencyName,
      d.totalBought,
      d.totalSold,
      d.currentReserve,
      d.weightedAveragePurchasePrice,
      d.realizedProfitLoss,
      d.totalPurchaseCost,
      d.totalSaleRevenue,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `exchange_dashboard_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setCurrencyFilter('');
    setFromDate('');
    setToDate('');
  };

  // Get unique currencies from reserves for filter dropdown
  const availableCurrencies = useMemo(() => {
    const currencies = new Set();
    reserves.forEach(r => currencies.add(r.currencyCode));
    dashboardItems.forEach(d => currencies.add(d.currencyCode));
    return Array.from(currencies).sort();
  }, [reserves, dashboardItems]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                মুদ্রা বিনিময় ড্যাশবোর্ড
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                মুদ্রা রিজার্ভ এবং লাভ/ক্ষতির বিশ্লেষণ
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (activeTab === 'reserves') refetchReserves();
                else refetchDashboard();
              }}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>
            <button
              onClick={() => {
                if (activeTab === 'reserves') handleExportReserves();
                else handleExportDashboard();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">এক্সপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('reserves')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'reserves'
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>মুদ্রা রিজার্ভ</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>লাভ/ক্ষতি বিশ্লেষণ</span>
              </div>
            </button>
          </div>
        </div>

        {/* Reserves Tab */}
        {activeTab === 'reserves' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট মুদ্রা</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {reservesSummary.totalCurrencies}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট রিজার্ভ মান</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {formatCurrency(reservesSummary.totalReserveValue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">গড় ক্রয় মূল্য</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {reserves.length > 0
                        ? formatCurrency(
                            reserves.reduce((sum, r) => sum + r.weightedAveragePurchasePrice, 0) / reserves.length
                          )
                        : formatCurrency(0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Reserves Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">মুদ্রা রিজার্ভ</h3>
              </div>
              <div className="overflow-x-auto">
                {reservesLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>লোড হচ্ছে...</p>
                  </div>
                ) : reserves.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Wallet className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>কোন রিজার্ভ পাওয়া যায়নি</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          মুদ্রা
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          রিজার্ভ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          গড় ক্রয় মূল্য
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          বর্তমান মান
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          মোট ক্রয়
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          মোট বিক্রয়
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {reserves.map((reserve) => (
                        <tr key={reserve.currencyCode} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {reserve.currencyCode}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {reserve.currencyName}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatNumberLocal(reserve.reserve, 2)} <span className="font-medium text-blue-600 dark:text-blue-400">{reserve.currencyCode}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatCurrency(reserve.weightedAveragePurchasePrice)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(reserve.currentReserveValue)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <ArrowDownCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {formatNumberLocal(reserve.totalBought, 2)} <span className="font-medium text-blue-600 dark:text-blue-400">{reserve.currencyCode}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <ArrowUpCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {formatNumberLocal(reserve.totalSold, 2)} <span className="font-medium text-blue-600 dark:text-blue-400">{reserve.currencyCode}</span>
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ফিল্টার</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    মুদ্রা
                  </label>
                  <select
                    value={currencyFilter}
                    onChange={(e) => setCurrencyFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">সব মুদ্রা</option>
                    {availableCurrencies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    থেকে তারিখ
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    পর্যন্ত তারিখ
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    রিসেট
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">লাভ/ক্ষতি (রিয়েলাইজড)</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      dashboardSummary.totalRealizedProfitLoss >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(dashboardSummary.totalRealizedProfitLoss)}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    dashboardSummary.totalRealizedProfitLoss >= 0
                      ? 'bg-green-100 dark:bg-green-900/20'
                      : 'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    {dashboardSummary.totalRealizedProfitLoss >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট ক্রয় খরচ</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {formatCurrency(dashboardSummary.totalPurchaseCost)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <ArrowDownCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট বিক্রয় আয়</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {formatCurrency(dashboardSummary.totalSaleRevenue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <ArrowUpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">বর্তমান রিজার্ভ মান</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                      {formatCurrency(dashboardSummary.totalCurrentReserveValue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">লাভ/ক্ষতি বিশ্লেষণ</h3>
              </div>
              <div className="overflow-x-auto">
                {dashboardLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>লোড হচ্ছে...</p>
                  </div>
                ) : dashboardItems.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>কোন ডেটা পাওয়া যায়নি</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          মুদ্রা
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          মোট ক্রয়
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          মোট বিক্রয়
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          বর্তমান রিজার্ভ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          গড় ক্রয় মূল্য
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          লাভ/ক্ষতি
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ক্রয় খরচ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          বিক্রয় আয়
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {dashboardItems.map((item) => (
                        <tr key={item.currencyCode} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.currencyCode}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {item.currencyName}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <ArrowDownCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {formatNumberLocal(item.totalBought, 2)} <span className="font-medium text-blue-600 dark:text-blue-400">{item.currencyCode}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <ArrowUpCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {formatNumberLocal(item.totalSold, 2)} <span className="font-medium text-blue-600 dark:text-blue-400">{item.currencyCode}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatNumberLocal(item.currentReserve, 2)} <span className="font-medium text-blue-600 dark:text-blue-400">{item.currencyCode}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatCurrency(item.weightedAveragePurchasePrice)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className={`text-sm font-semibold ${
                              item.realizedProfitLoss >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {formatCurrency(item.realizedProfitLoss)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatCurrency(item.totalPurchaseCost)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatCurrency(item.totalSaleRevenue)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

