import React, { useMemo, useState } from 'react';
import { Calendar, RefreshCcw, Loader2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTransactions, useTransactionCategories } from '../../hooks/useTransactionQueries';
import { useAccountQueries } from '../../hooks/useAccountQueries';
import { formatDate, formatCurrency } from '../../lib/format';
import useCategoryQueries from '../../hooks/useCategoryQueries';

const ITEMS_PER_PAGE = 20;

const getCustomerName = (t) => {
  const name =
    t?.customerName ||
    t?.customer?.name ||
    t?.partyName ||
    t?.party?.name ||
    t?.customer?.fullName ||
    t?.customer?.customerName ||
    t?.party?.fullName ||
    t?.party?.currencyName ||
    '';

  if (!name || name.trim() === '' || name.toLowerCase() === 'unknown') {
    return 'N/A';
  }

  return name;
};

const buildCategoryHelpers = (apiCategories = [], categoriesWithSubs = []) => {
  const subCategoryIndex = {};
  const apiCategoryIndex = {};

  try {
    // Build API category index
    (apiCategories || []).forEach((c) => {
      if (!c) return;
      if (typeof c === 'string') {
        apiCategoryIndex[c] = c;
        return;
      }
      const id = c._id || c.id || c.value || c.slug;
      const name = c.name || c.label || c.title || c.categoryName || c.value;
      if (id && name) apiCategoryIndex[id] = name;
      if (name) apiCategoryIndex[name] = name;
    });

    // Build subcategory index from category tree
    (categoriesWithSubs || []).forEach((cat) => {
      if (!cat) return;
      const catId = cat.id || cat._id;
      const catName = cat.name;
      if (catId && catName) {
        apiCategoryIndex[catId] = catName;
      }

      const subs = cat.subCategories || cat.subcategories || [];
      subs.forEach((sub) => {
        const subId = sub.id || sub._id;
        const subName = sub.name;
        if (subId && subName) {
          subCategoryIndex[subId] = subName;
        }
      });
    });
  } catch (e) {
    // ignore mapping errors for safety
  }

  const getCategory = (tx) => {
    if (!tx) return 'N/A';

    // If category is an object, try common name fields
    if (tx.category && typeof tx.category === 'object') {
      const name =
        tx.category.name ||
        tx.category.label ||
        tx.category.title ||
        tx.category.categoryName;
      if (name) return name;
    }

    const raw =
      tx.category ||
      tx.categoryId ||
      tx.serviceCategory ||
      tx.paymentDetails?.category ||
      '';

    if (!raw) return 'N/A';

    // If it's already a readable name (not a MongoDB ObjectId), return it
    if (
      typeof raw === 'string' &&
      !raw.match(/^[0-9a-f]{24}$/i) &&
      raw.length < 30
    ) {
      return raw;
    }

    if (subCategoryIndex[raw]) {
      return subCategoryIndex[raw];
    }

    if (apiCategoryIndex[raw]) {
      return apiCategoryIndex[raw];
    }

    return 'N/A';
  };

  return getCategory;
};

const getPaymentMethodLabel = (method) => {
  if (!method) return 'N/A';
  if (method === 'bank') return 'ব্যাংক ট্রান্সফার';
  if (method === 'cheque') return 'চেক';
  if (method === 'mobile-banking') return 'মোবাইল ব্যাংকিং';
  return method;
};

const getAmount = (tx) => tx?.paymentDetails?.amount ?? tx?.amount ?? 0;

const TodayTransactions = () => {
  const [page, setPage] = useState(1);

  const { useBankAccount } = useAccountQueries();
  const categoryQueries = useCategoryQueries();
  const categoriesQueryResult = categoryQueries?.useCategories
    ? categoryQueries.useCategories()
    : null;
  const categoriesWithSubs = categoriesQueryResult?.data || [];
  const { data: apiCategories = [] } = useTransactionCategories();
  const getCategory = useMemo(
    () => buildCategoryHelpers(apiCategories, categoriesWithSubs),
    [apiCategories, categoriesWithSubs]
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useTransactions({ dateRange: 'today' }, page, ITEMS_PER_PAGE);

  const { transactions, totalPages } = useMemo(
    () => ({
      transactions: data?.transactions || [],
      totalPages: data?.totalPages || 1,
    }),
    [data]
  );

  const todayTotals = useMemo(() => {
    let income = 0;
    let expense = 0;

    (transactions || []).forEach((tx) => {
      const amount = Number(getAmount(tx)) || 0;
      if (!amount) return;

      if (tx.transactionType === 'credit') {
        income += amount;
      } else if (tx.transactionType === 'debit') {
        expense += amount;
      }
    });

    return { income, expense };
  }, [transactions]);

  // Fetch bank account to show current balance for specific ID
  const {
    data: cashAccount,
    isLoading: isCashLoading,
    error: cashError,
  } = useBankAccount('691349c9dd00549f2b8fccab');

  const currentBalanceDisplay = useMemo(() => {
    if (isCashLoading) return '...';
    if (cashError || !cashAccount) return '—';
    return `${cashAccount.currency || 'BDT'} ${Number(
      cashAccount.currentBalance || 0
    ).toLocaleString('bn-BD')}`;
  }, [isCashLoading, cashError, cashAccount]);

  const todayInfo = useMemo(() => {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('bn-BD', options);
    const weekday = now.toLocaleDateString('bn-BD', { weekday: 'long' });
    return { formattedDate, weekday };
  }, []);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="min-h-screen p-4 lg:p-8 transition-colors duration-300 bg-white dark:bg-gray-900">
      <Helmet>
        <title>Today Transactions</title>
        <meta name="description" content="View and manage all transactions for today." />
      </Helmet>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">আজকের লেনদেন</h1>
              <p className="text-gray-500 dark:text-gray-400">
                আজকের তারিখে হওয়া সব ট্রানজ্যাকশন
                <span className="ml-2 inline-flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{todayInfo.formattedDate}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-200">
                    {todayInfo.weekday}
                  </span>
                </span>
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              রিফ্রেশ
            </button>
          </div>

          {/* Current balance + today's income/expense summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* বর্তমান ব্যালেন্স */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
              <p className="text-xs font-medium text-blue-700/80 dark:text-blue-300/80">
                বর্তমান ব্যালেন্স (Cash Balance)
              </p>
              <p className="mt-1 text-xl font-semibold text-blue-900 dark:text-blue-100">
                {currentBalanceDisplay}
              </p>
            </div>

            {/* আজকের আয় */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4">
              <p className="text-xs font-medium text-green-700/80 dark:text-green-300/80">
                আজকের আয় (Credit)
              </p>
              <p className="mt-1 text-xl font-semibold text-green-700 dark:text-green-300">
                {formatCurrency(todayTotals.income || 0)}
              </p>
            </div>

            {/* আজকের ব্যয় */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-4">
              <p className="text-xs font-medium text-red-700/80 dark:text-red-300/80">
                আজকের ব্যয় (Debit)
              </p>
              <p className="mt-1 text-xl font-semibold text-red-700 dark:text-red-300">
                {formatCurrency(todayTotals.expense || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Desktop / Tablet table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">কাস্টমার</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">ধরন</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">ক্যাটাগরি</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">পেমেন্ট মেথড</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">পরিমাণ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading && (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center">
                    <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-300">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>লোড হচ্ছে...</span>
                    </div>
                  </td>
                </tr>
              )}

              {error && !isLoading && (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center gap-3 text-red-500">
                      <AlertCircle className="w-6 h-6" />
                      <p className="text-sm">{error?.response?.data?.message || error?.message || 'লোড করতে সমস্যা হয়েছে'}</p>
                      <button
                        onClick={() => refetch()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        আবার চেষ্টা করুন
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    আজ কোনো ট্রানজ্যাকশন নেই।
                  </td>
                </tr>
              )}

              {!isLoading && !error && transactions.map((tx) => (
                <tr key={tx._id || tx.transactionId} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {getCustomerName(tx)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      tx.transactionType === 'credit'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      <ArrowLeft className="w-3 h-3" />
                      {tx.transactionType === 'credit' ? 'ক্রেডিট' : 'ডেবিট'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {getCategory(tx)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {getPaymentMethodLabel(tx.paymentMethod)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(getAmount(tx))}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {tx.status || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-8 text-gray-600 dark:text-gray-300">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>লোড হচ্ছে...</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center gap-3 py-8 text-red-500">
              <AlertCircle className="w-6 h-6" />
              <p className="text-sm px-4 text-center">{error?.response?.data?.message || error?.message || 'লোড করতে সমস্যা হয়েছে'}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          )}

          {!isLoading && !error && transactions.length === 0 && (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              আজ কোনো ট্রানজ্যাকশন নেই।
            </div>
          )}

          {!isLoading && !error && transactions.map((tx) => (
            <div key={tx._id || tx.transactionId} className="px-4 py-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">কাস্টমার</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {getCustomerName(tx)}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  tx.transactionType === 'credit'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  <ArrowLeft className="w-3 h-3" />
                  {tx.transactionType === 'credit' ? 'ক্রেডিট' : 'ডেবিট'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ক্যাটাগরি</p>
                  <p className="text-gray-900 dark:text-white">{getCategory(tx)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">পরিমাণ</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(getAmount(tx))}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">পেমেন্ট মেথড</p>
                  <p className="text-gray-900 dark:text-white">
                    {getPaymentMethodLabel(tx.paymentMethod)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">স্ট্যাটাস</p>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {tx.status || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            পেজ {page} / {totalPages || 1}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => canPrev && setPage((p) => p - 1)}
              disabled={!canPrev}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <ArrowLeft className="w-4 h-4" />
              আগের
            </button>
            <button
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              পরের
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default TodayTransactions;
