import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  RefreshCw,
  CalendarRange,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  Filter,
  Search
} from 'lucide-react';
import { useLoanDashboardSummary } from '../../hooks/useLoanQueries';

const Stat = ({ label, value, icon: Icon, color = 'indigo', sub }) => {
  const colors = {
    indigo: 'from-indigo-500 to-blue-500',
    emerald: 'from-emerald-500 to-green-500',
    amber: 'from-amber-500 to-orange-500',
    slate: 'from-slate-500 to-gray-600',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
          {sub ? <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p> : null}
        </div>
        <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${colors[color] || colors.indigo} text-white flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const Breakdown = ({ title, items, valueKey = 'count', amountKey }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <PieChart className="w-4 h-4 text-indigo-500" />
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
    </div>
    {items.length === 0 ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">কোন ডাটা পাওয়া যায়নি</p>
    ) : (
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-200">{item.label}</span>
            <div className="text-right">
              <p className="text-gray-900 dark:text-white font-medium">{item[valueKey]?.toLocaleString()}</p>
              {amountKey ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">৳{item[amountKey]?.toLocaleString()}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const LoanDashboard = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    loanDirection: '',
    status: '',
    branchId: '',
  });

  const cleanedFilters = useMemo(() => {
    const entries = Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined);
    return Object.fromEntries(entries);
  }, [filters]);

  const { data, isLoading, isFetching, refetch, error } = useLoanDashboardSummary(cleanedFilters);
  const loading = isLoading || isFetching;

  const totals = data?.totals || { totalLoans: 0, active: 0, pending: 0, closed: 0, rejected: 0 };
  const financial = data?.financial || { 
    totalAmount: 0, 
    paidAmount: 0, 
    totalDue: 0, 
    netCashFlow: 0,
    cashIn: 0,
    cashOut: 0
  };
  
  // Separate giving and receiving financial data
  const givingFinancial = data?.giving?.financial || {
    totalAmount: 0,
    paidAmount: 0,
    totalDue: 0,
    disbursed: 0,
    repaid: 0,
    netCashFlow: 0
  };
  
  const receivingFinancial = data?.receiving?.financial || {
    totalAmount: 0,
    paidAmount: 0,
    totalDue: 0,
    taken: 0,
    repaid: 0,
    netCashFlow: 0
  };

  const directionBreakdown = data?.directionBreakdown || [];
  const statusBreakdown = data?.statusBreakdown || [];
  const transactions = data?.transactions || { totalTransactions: 0, totalDebit: 0, totalCredit: 0, netCashflow: 0, byDirection: [] };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">লোন ড্যাশবোর্ড</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">ভলিউম ও প্রফিট/লস সারসংক্ষেপ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters({ fromDate: '', toDate: '', loanDirection: '', status: '', branchId: '' })}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              রিসেট
            </button>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              রিফ্রেশ
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Filter className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">ফিল্টার অপশন</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <CalendarRange className="w-3 h-3" />
                শুরু তারিখ
              </label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors py-2.5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <CalendarRange className="w-3 h-3" />
                শেষ তারিখ
              </label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors py-2.5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                লোন ডিরেকশন
              </label>
              <select
                value={filters.loanDirection}
                onChange={(e) => setFilters((prev) => ({ ...prev, loanDirection: e.target.value }))}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors py-2.5"
              >
                <option value="">সকল ডিরেকশন</option>
                <option value="giving">ঋণ প্রদান (Giving)</option>
                <option value="receiving">ঋণ গ্রহণ (Receiving)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                স্ট্যাটাস
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors py-2.5"
              >
                <option value="">সকল স্ট্যাটাস</option>
                <option value="active">সক্রিয় (Active)</option>
                <option value="pending">বিচারাধীন (Pending)</option>
                <option value="completed">সম্পন্ন (Completed)</option>
                <option value="rejected">প্রত্যাখ্যাত (Rejected)</option>
                <option value="overdue">মেয়াদ উত্তীর্ণ (Overdue)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Search className="w-3 h-3" />
                ব্রাঞ্চ আইডি
              </label>
              <input
                type="text"
                placeholder="Branch ID..."
                value={filters.branchId}
                onChange={(e) => setFilters((prev) => ({ ...prev, branchId: e.target.value }))}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors py-2.5"
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error.message}</span>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Stat label="মোট লোন" value={loading ? '...' : totals.totalLoans?.toLocaleString()} icon={Calculator} sub={`Active ${totals.active || 0}`} />
          <Stat label="পেন্ডিং" value={loading ? '...' : totals.pending?.toLocaleString()} icon={Clock} color="amber" />
          <Stat label="ক্লোজড" value={loading ? '...' : totals.closed?.toLocaleString()} icon={CheckCircle} color="emerald" />
          <Stat label="রিজেক্টেড" value={loading ? '...' : totals.rejected?.toLocaleString()} icon={Ban} color="slate" />
        </div>

        {/* সল্পমেয়াদী লেনদেন সারসংক্ষেপ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">মোট ঋণ গ্রহণ</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                  ৳{loading ? '...' : (receivingFinancial.taken || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">মোট ঋণ প্রদান</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                  ৳{loading ? '...' : (givingFinancial.disbursed || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">গ্রহীত ঋণ পরিশোধ</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                  ৳{loading ? '...' : (receivingFinancial.repaid || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">প্রদত্ত ঋণ আদায়</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                  ৳{loading ? '...' : (givingFinancial.repaid || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-500" />
              ফাইন্যান্স
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">মোট এমাউন্ট</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">৳{financial.totalAmount?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">পরিশোধ</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">৳{financial.paidAmount?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">ডিউ</p>
                <p className="text-lg font-semibold text-amber-600">৳{financial.totalDue?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">নেট ক্যাশফ্লো</p>
                <p className={`text-lg font-semibold ${financial.netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {financial.netCashFlow >= 0 ? <ArrowUpRight className="inline w-4 h-4" /> : <ArrowDownRight className="inline w-4 h-4" />}
                  ৳{Math.abs(financial.netCashFlow || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">ক্যাশ ইন</p>
                <p className="text-md font-medium text-emerald-600">৳{financial.cashIn?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">ক্যাশ আউট</p>
                <p className="text-md font-medium text-red-500">৳{financial.cashOut?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <Breakdown
            title="ডিরেকশন ব্রেকডাউন"
            items={directionBreakdown.map((d) => ({
              label: d.loanDirection || 'unknown',
              count: d.count || 0,
              totalAmount: d.totalAmount || 0,
            }))}
            valueKey="count"
            amountKey="totalAmount"
          />

          <Breakdown
            title="স্ট্যাটাস ব্রেকডাউন"
            items={statusBreakdown.map((s) => ({
              label: s.status || 'unknown',
              count: s.count || 0,
              totalAmount: s.totalAmount || 0,
            }))}
            valueKey="count"
            amountKey="totalAmount"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-indigo-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">লেনদেন</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Completed loan transactions</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
            <div>
              <p className="text-gray-500 dark:text-gray-400">মোট ট্রানজেকশন</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{transactions.totalTransactions?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">টোটাল ডেবিট</p>
              <p className="text-lg font-semibold text-red-500">৳{transactions.totalDebit?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">টোটাল ক্রেডিট</p>
              <p className="text-lg font-semibold text-emerald-600">৳{transactions.totalCredit?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">নেট ক্যাশফ্লো</p>
              <p className={`text-lg font-semibold ${transactions.netCashflow >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {transactions.netCashflow >= 0 ? '+' : '-'}৳{Math.abs(transactions.netCashflow || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-2 pr-4">ডিরেকশন</th>
                  <th className="py-2 pr-4">কাউন্ট</th>
                  <th className="py-2 pr-4 text-right">ডেবিট</th>
                  <th className="py-2 pr-4 text-right">ক্রেডিট</th>
                  <th className="py-2 pr-4 text-right">নেট</th>
                </tr>
              </thead>
              <tbody>
                {(transactions.byDirection || []).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-3 text-gray-500 dark:text-gray-400">কোন ট্রানজেকশন নেই</td>
                  </tr>
                ) : (
                  transactions.byDirection.map((row) => (
                    <tr key={row.loanDirection} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 pr-4 text-gray-900 dark:text-white">{row.loanDirection || 'unknown'}</td>
                      <td className="py-2 pr-4">{row.count?.toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right text-red-500">৳{row.totalDebit?.toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right text-emerald-600">৳{row.totalCredit?.toLocaleString()}</td>
                      <td className={`py-2 pr-4 text-right font-semibold ${row.netCashflow >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {row.netCashflow >= 0 ? '+' : '-'}৳{Math.abs(row.netCashflow || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDashboard;
