import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useLoanDashboardSummary } from '../../hooks/useLoanQueries';

// Convert Arabic numerals to Bengali numerals
const toBengaliNumeral = (num) => {
  if (num === null || num === undefined || num === '...') return num;
  
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const numStr = String(num);
  
  // If it's a formatted number with commas, preserve the commas
  if (numStr.includes(',')) {
    return numStr.split(',').map(part => {
      return part.split('').map(char => {
        if (char >= '0' && char <= '9') {
          return bengaliDigits[parseInt(char)];
        }
        return char;
      }).join('');
    }).join(',');
  }
  
  // Convert each digit (only Arabic digits 0-9, leave other characters unchanged)
  return numStr.split('').map(char => {
    if (char >= '0' && char <= '9') {
      return bengaliDigits[parseInt(char)];
    }
    return char;
  }).join('');
};

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
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{toBengaliNumeral(value)}</p>
          {sub ? <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{toBengaliNumeral(sub)}</p> : null}
        </div>
        <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${colors[color] || colors.indigo} text-white flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const LoanDashboard = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    loanDirection: '',
    branchId: '',
  });

  const cleanedFilters = useMemo(() => {
    const entries = Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined);
    return Object.fromEntries(entries);
  }, [filters]);

  const { data, isLoading, isFetching, refetch, error } = useLoanDashboardSummary(cleanedFilters);
  const loading = isLoading || isFetching;

  const totals = data?.totals || { totalLoans: 0, active: 0, pending: 0, closed: 0, rejected: 0 };
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

  const transactions = data?.transactions || { totalTransactions: 0, totalDebit: 0, totalCredit: 0, netCashflow: 0, byDirection: [] };

  // Translate loan direction to Bangla
  const translateDirection = (direction) => {
    if (!direction) return 'অজানা';
    if (direction.toLowerCase() === 'giving') return 'ঋণ প্রদান';
    if (direction.toLowerCase() === 'receiving') return 'ঋণ গ্রহণ';
    return direction;
  };

  // Calculate balances
  const givingBalance = (givingFinancial.totalAmount || 0) - (givingFinancial.paidAmount || 0);
  const receivingBalance = (receivingFinancial.totalAmount || 0) - (receivingFinancial.paidAmount || 0);
  const totalBalance = givingBalance - receivingBalance;

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
              onClick={() => refetch()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              রিফ্রেশ
            </button>
          </div>
        </div>

        {error ? (
          <div className="p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error.message}</span>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Stat label="মোট লোন" value={loading ? '...' : totals.totalLoans?.toLocaleString()} icon={Calculator} sub={`সক্রিয় ${totals.active || 0}`} />
        </div>

        {/* সল্পমেয়াদী লেনদেন সারসংক্ষেপ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">মোট ঋণ গ্রহণ</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                  ৳{loading ? '...' : toBengaliNumeral((receivingFinancial.taken || 0).toLocaleString())}
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
                  ৳{loading ? '...' : toBengaliNumeral((givingFinancial.disbursed || 0).toLocaleString())}
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
                  ৳{loading ? '...' : toBengaliNumeral((receivingFinancial.repaid || 0).toLocaleString())}
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
                  ৳{loading ? '...' : toBengaliNumeral((givingFinancial.repaid || 0).toLocaleString())}
                </p>
              </div>
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* ব্যালেন্স সারসংক্ষেপ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">প্রদত্ত ঋণ ব্যালেন্স</p>
                <p className={`text-2xl font-semibold mt-1 ${givingBalance >= 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ৳{loading ? '...' : toBengaliNumeral(Math.abs(givingBalance).toLocaleString())}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {givingBalance >= 0 ? 'বকেয়া' : 'অতিরিক্ত পরিশোধ'}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">গ্রহীত ঋণ ব্যালেন্স</p>
                <p className={`text-2xl font-semibold mt-1 ${receivingBalance >= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  ৳{loading ? '...' : toBengaliNumeral(Math.abs(receivingBalance).toLocaleString())}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {receivingBalance >= 0 ? 'বকেয়া' : 'অতিরিক্ত পরিশোধ'}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">নেট ব্যালেন্স</p>
                <p className={`text-2xl font-semibold mt-1 ${totalBalance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {totalBalance >= 0 ? '+' : '-'}৳{loading ? '...' : toBengaliNumeral(Math.abs(totalBalance).toLocaleString())}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {totalBalance >= 0 ? 'নিট পাওনা' : 'নিট দেনা'}
                </p>
              </div>
              <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${totalBalance >= 0 ? 'from-emerald-500 to-green-500' : 'from-red-500 to-pink-500'} text-white flex items-center justify-center`}>
                <Calculator className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-indigo-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">লেনদেন</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">সম্পন্ন লোন লেনদেন</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
            <div>
              <p className="text-gray-500 dark:text-gray-400">মোট ট্রানজেকশন</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{toBengaliNumeral(transactions.totalTransactions?.toLocaleString())}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">টোটাল ডেবিট</p>
              <p className="text-lg font-semibold text-red-500">৳{toBengaliNumeral(transactions.totalDebit?.toLocaleString())}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">টোটাল ক্রেডিট</p>
              <p className="text-lg font-semibold text-emerald-600">৳{toBengaliNumeral(transactions.totalCredit?.toLocaleString())}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">নেট ক্যাশফ্লো</p>
              <p className={`text-lg font-semibold ${transactions.netCashflow >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {transactions.netCashflow >= 0 ? '+' : '-'}৳{toBengaliNumeral(Math.abs(transactions.netCashflow || 0).toLocaleString())}
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
                      <td className="py-2 pr-4 text-gray-900 dark:text-white">{translateDirection(row.loanDirection)}</td>
                      <td className="py-2 pr-4">{toBengaliNumeral(row.count?.toLocaleString())}</td>
                      <td className="py-2 pr-4 text-right text-red-500">৳{toBengaliNumeral(row.totalDebit?.toLocaleString())}</td>
                      <td className="py-2 pr-4 text-right text-emerald-600">৳{toBengaliNumeral(row.totalCredit?.toLocaleString())}</td>
                      <td className={`py-2 pr-4 text-right font-semibold ${row.netCashflow >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {row.netCashflow >= 0 ? '+' : '-'}৳{toBengaliNumeral(Math.abs(row.netCashflow || 0).toLocaleString())}
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
