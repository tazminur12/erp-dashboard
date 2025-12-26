import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plane,
  Building,
  Wallet,
  Calculator,
  FileText,
  Receipt,
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Home,
  PiggyBank,
  User,
  Package,
  Settings,
  UserCircle,
  Plus,
  List,
  Edit,
  BookOpen,
  Bell,
  Search,
  Database,
  CreditCard,
  Calendar,
  DollarSign,
  Activity,
  Shield,
  Loader2,
  RefreshCw,
  Filter,
  ShoppingCart,
  ClipboardList
} from 'lucide-react';
import { useDashboardSummary, useCategoriesSummary, useTransactionsStats } from '../hooks/DashboardQueries';
import { useHajjUmrahDashboardSummary } from '../hooks/useHajjUmrahDashboardQueries';
import { useAirTicketDashboardSummary } from '../hooks/useAirTicketQueries';
import { useTransactionCategories } from '../hooks/useTransactionQueries';
import { useAccountQueries } from '../hooks/useAccountQueries';
import { getAllSubCategories } from '../utils/categoryUtils';

const ProfessionalDashboard = () => {
  const [dateRange, setDateRange] = useState({ fromDate: '', toDate: '' });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const { useBankAccount } = useAccountQueries();

  // Fetch dashboard summary data
  const {
    data: dashboardSummary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary
  } = useDashboardSummary({
    fromDate: dateRange.fromDate || undefined,
    toDate: dateRange.toDate || undefined,
  });

  // Fetch categories summary data
  const {
    data: categoriesSummary,
    isLoading: isCategoriesLoading,
    error: categoriesError
  } = useCategoriesSummary({
    fromDate: dateRange.fromDate || undefined,
    toDate: dateRange.toDate || undefined,
  });

  // Fetch transactions stats grouped by category and subcategory
  const {
    data: transactionsStats,
    isLoading: isStatsLoading,
    error: statsError
  } = useTransactionsStats({
    groupBy: 'category,subcategory',
    fromDate: dateRange.fromDate || undefined,
    toDate: dateRange.toDate || undefined,
  });

  // Fetch categories for ID to name mapping
  const { data: apiCategories = [] } = useTransactionCategories();

  const { data: huDashboardData, isLoading: isHUloading, error: huError } = useHajjUmrahDashboardSummary();

  // Extract data from dashboard summary
  const summary = dashboardSummary?.data || {};
  const grandTotals = dashboardSummary?.grandTotals || {};
  const overview = summary.overview || {};
  const users = summary.users || {};
  const customers = summary.customers || {};
  const agents = summary.agents || {};
  const vendors = summary.vendors || {};
  const financial = summary.financial || {};
  const services = summary.services || {};
  const farm = summary.farm || {};
  const recentActivity = summary.recentActivity || {};

  const huOverview = huDashboardData?.overview || {};
  const huProfitLoss = huDashboardData?.profitLoss || {};

  const { data: airDashboardData, isLoading: isAirLoading, error: airError } = useAirTicketDashboardSummary({
    dateFrom: dateRange.fromDate || undefined,
    dateTo: dateRange.toDate || undefined,
  });
  const airTotals = airDashboardData?.totals || {};
  const airFinancials = airDashboardData?.financials || {};

  // Cash balance (similar to TodayTransactions)
  const {
    data: cashAccount,
    isLoading: isCashLoading,
    error: cashError,
  } = useBankAccount('691349c9dd00549f2b8fccab');

  const currentBalanceDisplay = React.useMemo(() => {
    if (isCashLoading) return '...';
    if (cashError || !cashAccount) return '—';
    return `${cashAccount.currency || 'BDT'} ${Number(
      cashAccount.currentBalance || 0
    ).toLocaleString('bn-BD')}`;
  }, [isCashLoading, cashError, cashAccount]);

  // Format currency
  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('bn-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    } catch {
      return `৳ ${Number(amount || 0).toLocaleString('bn-BD')}`;
    }
  };

  const formatPercentBn = (value) => {
    return `${Number(value || 0).toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Business modules configuration
  const businessModules = [
    {
      title: "হজ্জ ও ওমরাহ ব্যবস্থাপনা",
      description: "হাজী ব্যবস্থাপনা, প্যাকেজ তৈরি এবং এজেন্ট ব্যবস্থাপনা",
      icon: Building,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      iconColor: "text-white",
      routes: [
        { name: "হাজী তালিকা", path: "/hajj-umrah/haji-list", icon: List },
        { name: "নতুন হাজী যোগ", path: "/hajj-umrah/haji/add", icon: Plus },
        { name: "এজেন্ট তালিকা", path: "/hajj-umrah/agent", icon: Users },
        { name: "প্যাকেজ তৈরি", path: "/hajj-umrah/package-creation", icon: Package },
        { name: "B2B Sell", path: "/hajj-umrah/b2b-sell", icon: ShoppingCart },
        { name: "B2B Sell List", path: "/hajj-umrah/b2b-sell-list", icon: ClipboardList }
      ]
    },
    {
      title: "এয়ার টিকেটিং",
      description: "বিমানের টিকেট বিক্রয়, এজেন্ট ব্যবস্থাপনা এবং ইনভয়েস",
      icon: Plane,
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      iconColor: "text-white",
      routes: [
        { name: "নতুন টিকেট", path: "/air-ticketing/new-ticket", icon: Plus },
        { name: "টিকেট তালিকা", path: "/air-ticketing/tickets", icon: List },
        { name: "টিকেট ইনভয়েস", path: "/air-ticketing/invoice", icon: Receipt },
        { name: "এজেন্ট তালিকা", path: "/air-ticketing/agent", icon: Users }
      ]
    },
    {
      title: "ভিসা প্রসেসিং",
      description: "বিভিন্ন দেশের ভিসা প্রসেসিং এবং ব্যবস্থাপনা",
      icon: FileText,
      color: "bg-gradient-to-br from-purple-500 to-indigo-600",
      iconColor: "text-white",
      routes: [
        { name: "সৌদি ওমরাহ ভিসা", path: "/visa-processing/saudi-umrah", icon: FileText },
        { name: "ভারতীয় ট্যুরিস্ট ভিসা", path: "/visa-processing/indian-tourist", icon: Globe },
        { name: "মালয়েশিয়া ভিসা", path: "/visa-processing/malaysia-tourist", icon: Plane },
        { name: "নতুন ভিসা তৈরি", path: "/visa-processing/create-new", icon: Plus }
      ]
    },
    {
      title: "অ্যাকাউন্ট ব্যবস্থাপনা",
      description: "আয়-ব্যয়, সঞ্চয়, ঋণ এবং আর্থিক রিপোর্টিং",
      icon: Wallet,
      color: "bg-gradient-to-br from-yellow-500 to-orange-600",
      iconColor: "text-white",
      routes: [
        { name: "আয় ব্যবস্থাপনা", path: "/account/income", icon: TrendingUp },
        { name: "ব্যয় ব্যবস্থাপনা", path: "/account/expense", icon: TrendingDown },
        { name: "সঞ্চয় ও বিনিয়োগ", path: "/account/savings", icon: PiggyBank },
        { name: "আর্থিক রিপোর্ট", path: "/account/reports", icon: BarChart3 }
      ]
    },
    {
      title: "ক্রেডিট ব্যবস্থাপনা",
      description: "ঋণ প্রদান, ঋণ গ্রহণ এবং ঋণ ট্র্যাকিং",
      icon: Calculator,
      color: "bg-gradient-to-br from-red-500 to-pink-600",
      iconColor: "text-white",
      routes: [
        { name: "ঋণ তালিকা", path: "/loan/list", icon: List },
        { name: "নতুন ঋণ প্রদান", path: "/loan/new-giving", icon: TrendingDown },
        { name: "নতুন ঋণ গ্রহণ", path: "/loan/new-receiving", icon: TrendingUp },
        { name: "ঋণ ড্যাশবোর্ড", path: "/loan", icon: BarChart3 }
      ]
    },
    {
      title: "ফ্লাই ওভাল লিমিটেড",
      description: "এজেন্ট ব্যবস্থাপনা, টপ-আপ এবং বিক্রয় হিসাব",
      icon: Plane,
      color: "bg-gradient-to-br from-teal-500 to-green-600",
      iconColor: "text-white",
      routes: [
        { name: "এজেন্ট তালিকা", path: "/fly-oval/agents", icon: Users },
        { name: "টপ-আপ হিসাব", path: "/fly-oval/topup-history", icon: TrendingUp },
        { name: "বিক্রয় হিসাব", path: "/fly-oval/sell-history", icon: TrendingDown },
        { name: "লেজার", path: "/fly-oval/ledger", icon: BookOpen }
      ]
    },
    {
      title: "মিরাজ ইন্ডাস্ট্রিজ",
      description: "গবাদি পশু ব্যবস্থাপনা, দুধ উৎপাদন এবং স্বাস্থ্য রেকর্ড",
      icon: Building,
      color: "bg-gradient-to-br from-amber-500 to-yellow-600",
      iconColor: "text-white",
      routes: [
        { name: "গবাদি পশু ব্যবস্থাপনা", path: "/miraj-industries/cattle-management", icon: Users },
        { name: "দুধ উৎপাদন", path: "/miraj-industries/milk-production", icon: TrendingUp },
        { name: "স্বাস্থ্য রেকর্ড", path: "/miraj-industries/health-records", icon: Shield },
        { name: "আয়-খরচ রিপোর্ট", path: "/miraj-industries/financial-report", icon: BarChart3 }
      ]
    },
    {
      title: "অফিস ব্যবস্থাপনা",
      description: "এইচআর ব্যবস্থাপনা, বেতন এবং কর্মচারী রেকর্ড",
      icon: Home,
      color: "bg-gradient-to-br from-indigo-500 to-purple-600",
      iconColor: "text-white",
      routes: [
        { name: "কর্মচারী তালিকা", path: "/office-management/hr/employee/list", icon: Users },
        { name: "বেতন", path: "/office-management/hr/payroll", icon: Receipt },
        { name: "উপস্থিতি", path: "/office-management/hr/attendance", icon: ClipboardList },
        { name: "প্রভিডেন্ট ফান্ড", path: "/office-management/hr/provident-fund", icon: PiggyBank }
      ]
    },
    {
      title: "মুদ্রা বিনিময়",
      description: "বিভিন্ন মুদ্রার বিনিময় এবং রেকর্ড ব্যবস্থাপনা",
      icon: Globe,
      color: "bg-gradient-to-br from-rose-500 to-red-600",
      iconColor: "text-white",
      routes: [
        { name: "নতুন বিনিময়", path: "/money-exchange/new", icon: Plus },
        { name: "বিনিময় তালিকা", path: "/money-exchange/list", icon: List },
        { name: "ড্যাশবোর্ড", path: "/money-exchange/dashboard", icon: BarChart3 }
      ]
    },
    {
      title: "গ্রাহক ব্যবস্থাপনা",
      description: "গ্রাহক তথ্য, যোগাযোগ এবং সম্পর্ক ব্যবস্থাপনা",
      icon: Users,
      color: "bg-gradient-to-br from-sky-500 to-blue-600",
      iconColor: "text-white",
      routes: [
        { name: "গ্রাহক তালিকা", path: "/customers", icon: List },
        { name: "নতুন গ্রাহক", path: "/customers/add", icon: Plus },
        { name: "গ্রাহক সম্পাদনা", path: "/customers/edit", icon: Edit }
      ]
    },
    {
      title: "বিক্রয় ও ইনভয়েস",
      description: "ইনভয়েস তৈরি, বিক্রয় রেকর্ড এবং পেমেন্ট ট্র্যাকিং",
      icon: Receipt,
      color: "bg-gradient-to-br from-emerald-500 to-teal-600",
      iconColor: "text-white",
      routes: [
        { name: "ইনভয়েস তৈরি", path: "/sales-invoice/new", icon: Plus },
        { name: "অপেক্ষমান ইনভয়েস", path: "/sales-invoice/pending", icon: FileText },
        { name: "সব ইনভয়েস", path: "/sales-invoice/list", icon: List }
      ]
    },
    {
      title: "সেটিংস ও ব্যবস্থাপনা",
      description: "ব্যবহারকারী ব্যবস্থাপনা, ব্যাকআপ এবং সিস্টেম সেটিংস",
      icon: Settings,
      color: "bg-gradient-to-br from-gray-500 to-slate-600",
      iconColor: "text-white",
      routes: [
        { name: "ব্যবহারকারী ব্যবস্থাপনা", path: "/settings/users", icon: Users },
        { name: "ব্যাকআপ ও পুনরুদ্ধার", path: "/settings/backup", icon: Database },
        { name: "প্রোফাইল", path: "/profile", icon: UserCircle }
      ]
    }
  ];

  // Function to resolve category name from ID
  const getCategoryName = (categoryNameOrId) => {
    if (!categoryNameOrId) return 'N/A';
    // If it's already a readable name, return as is
    if (typeof categoryNameOrId === 'string' && !categoryNameOrId.match(/^[0-9a-fA-F]{24}$/)) {
      return categoryNameOrId;
    }
    return categoryNameOrId;
  };

  if (isSummaryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">ড্যাশবোর্ড ডাটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">ড্যাশবোর্ড ডাটা লোড করতে সমস্যা হয়েছে</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{summaryError.message}</p>
          <button
            onClick={() => refetchSummary()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section - সামগ্রিক সারাংশ */}

      {/* Grand Totals Summary pinned under header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h2 className="text-3xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                এক নজরে ব্যবসায়িক হালনাগাদ
              </h2>
            
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    মোট আয়
                  </p>
                  <p className="text-2xl font-semibold text-green-600">
                    {formatCurrency(grandTotals.totalRevenue || 0)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    মোট ব্যয়
                  </p>
                  <p className="text-2xl font-semibold text-red-600">
                    {formatCurrency(grandTotals.totalExpenses || 0)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    মোট ডিউ
                  </p>
                  <p className="text-2xl font-semibold text-orange-600">
                    {formatCurrency(grandTotals.totalDue || 0)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    মোট সম্পদ
                  </p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {formatCurrency(grandTotals.totalAssets || 0)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    নিট লাভ
                  </p>
                  <p
                    className={`text-2xl font-semibold ${(grandTotals.netProfit || 0) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                      }`}
                  >
                    {formatCurrency(grandTotals.netProfit || 0)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Total Advance Amount
                  </p>
                  <p className="text-2xl font-semibold text-purple-600">
                    {formatCurrency(grandTotals.totalAdvanceAmni || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-auto lg:min-w-[300px]">
              <div className="bg-blue-600/95 dark:bg-blue-700/95 rounded-2xl p-5 shadow-xl">
                <p className="text-sm font-medium text-blue-100">
                  বর্তমান ব্যালেন্স (Cash Balance)
                </p>
                <p className="mt-3 text-3xl font-extrabold text-white">
                  {currentBalanceDisplay}
                </p>
                <p className="mt-2 text-xs text-blue-100/80">
                  এই ব্যালেন্সটি নির্দিষ্ট ক্যাশ একাউন্ট থেকে নেওয়া হয়েছে
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              এয়ার টিকেটিং সারাংশ
            </h3>

            {airError && (
              <span className="text-sm text-red-600 dark:text-red-400">
                ডাটা লোড করতে সমস্যা হয়েছে
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট টিকেট</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isAirLoading ? '...' : (airTotals.tickets || 0)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">সেগমেন্ট</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isAirLoading ? '...' : (airTotals.segments || 0)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট যাত্রী</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isAirLoading
                  ? '...'
                  : (
                    (airTotals.passengers?.adults || 0) +
                    (airTotals.passengers?.children || 0) +
                    (airTotals.passengers?.infants || 0)
                  )}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                এডাল্ট {airTotals.passengers?.adults || 0},
                চিলড্রেন {airTotals.passengers?.children || 0},
                ইনফ্যান্ট {airTotals.passengers?.infants || 0}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">নেট প্রফিট</p>
              <p className="text-2xl font-bold text-green-600">
                {isAirLoading
                  ? formatCurrency(0)
                  : formatCurrency(airFinancials.profit || 0)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                এভারেজ প্রতি টিকেট
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {isAirLoading
                  ? formatCurrency(0)
                  : formatCurrency(airTotals.averageProfitPerTicket || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">/টিকেট</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">রাজস্ব</p>
              <p className="text-2xl font-bold text-indigo-600">
                {isAirLoading
                  ? formatCurrency(0)
                  : formatCurrency(airFinancials.revenue || 0)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">নেট মার্জিন</p>
              <p className="text-2xl font-bold text-orange-600">
                {isAirLoading
                  ? formatPercentBn(0)
                  : formatPercentBn(airFinancials.netMarginPct || 0)}
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">হজ্জ ও উমরাহ সারাংশ</h3>
            {huError && (
              <span className="text-sm text-red-600 dark:text-red-400">ডাটা লোড করতে সমস্যা হয়েছে</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট হাজি</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isHUloading ? '...' : (huOverview.totalHaji || 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট উমরাহ</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isHUloading ? '...' : (huOverview.totalUmrah || 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট আয়</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {isHUloading ? formatCurrency(0) : formatCurrency(huProfitLoss.combined?.totalRevenue || 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট লাভ/ক্ষতি</p>
                <p className={`text-xl font-bold ${huProfitLoss.combined?.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {isHUloading ? formatCurrency(0) : formatCurrency(huProfitLoss.combined?.profitLoss || 0)}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${huProfitLoss.combined?.isProfit ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                {huProfitLoss.combined?.isProfit ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট ব্যবহারকারী</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{overview.totalUsers || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট গ্রাহক</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{overview.totalCustomers || 0}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <User className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট এজেন্ট</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{overview.totalAgents || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট ভেন্ডর</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{overview.totalVendors || 0}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট শাখা</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{overview.totalBranches || 0}</p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                <Home className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">আয়</h3>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">মোট আয়</span>
                <span className="text-lg font-semibold text-green-600">{formatCurrency(grandTotals.totalRevenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">ক্রেডিট</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(financial.transactions?.totalCredit || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">ইনভয়েস (পেইড)</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(financial.invoices?.paidAmount || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">বিনিময় বিক্রয়</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(services.exchanges?.sellAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ব্যয়</h3>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">মোট ব্যয়</span>
                <span className="text-lg font-semibold text-red-600">{formatCurrency(grandTotals.totalExpenses || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">ডেবিট</span>
                <span className="text-sm font-medium text-red-600">{formatCurrency(financial.transactions?.totalDebit || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">বিনিময় ক্রয়</span>
                <span className="text-sm font-medium text-red-600">{formatCurrency(services.exchanges?.buyAmount || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">ফার্ম ব্যয়</span>
                <span className="text-sm font-medium text-red-600">{formatCurrency(farm.expenses?.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Net Profit Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">নিট লাভ</h3>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">নিট লাভ</span>
                <span className={`text-2xl font-bold ${(grandTotals.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(grandTotals.netProfit || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">ট্রানজেকশন নেট</span>
                <span className={`text-sm font-medium ${(financial.transactions?.netAmount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financial.transactions?.netAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">বিনিময় নেট</span>
                <span className={`text-sm font-medium ${(services.exchanges?.netAmount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(services.exchanges?.netAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">ফার্ম নেট</span>
                <span className={`text-sm font-medium ${(farm.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(farm.netProfit || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Users Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              ব্যবহারকারী পরিসংখ্যান
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">মোট</span>
                <span className="font-semibold text-gray-900 dark:text-white">{users.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">আজ</span>
                <span className="font-semibold text-gray-900 dark:text-white">{users.today || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">এই মাসে</span>
                <span className="font-semibold text-gray-900 dark:text-white">{users.thisMonth || 0}</span>
              </div>
              {users.byRole && Object.keys(users.byRole).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">রোল অনুযায়ী:</p>
                  <div className="space-y-2">
                    {Object.entries(users.byRole).map(([role, count]) => (
                      <div key={role} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{role}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customers Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-green-600" />
              গ্রাহক পরিসংখ্যান
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">মোট</span>
                <span className="font-semibold text-gray-900 dark:text-white">{customers.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">আজ</span>
                <span className="font-semibold text-gray-900 dark:text-white">{customers.today || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">এই মাসে</span>
                <span className="font-semibold text-gray-900 dark:text-white">{customers.thisMonth || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">হাজী</span>
                <span className="font-semibold text-gray-900 dark:text-white">{customers.haji || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">ওমরাহ</span>
                <span className="font-semibold text-gray-900 dark:text-white">{customers.umrah || 0}</span>
              </div>
              {customers.paymentStats && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">মোট পরিমাণ</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(customers.paymentStats.totalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">পেইড</span>
                    <span className="font-semibold text-green-600">{formatCurrency(customers.paymentStats.paidAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">ডিউ</span>
                    <span className="font-semibold text-red-600">{formatCurrency(customers.paymentStats.dueAmount || 0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Agents Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-purple-600" />
              এজেন্ট পরিসংখ্যান
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">মোট</span>
                <span className="font-semibold text-gray-900 dark:text-white">{agents.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">আজ</span>
                <span className="font-semibold text-gray-900 dark:text-white">{agents.today || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">এই মাসে</span>
                <span className="font-semibold text-gray-900 dark:text-white">{agents.thisMonth || 0}</span>
              </div>
              {agents.paymentStats && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">মোট পরিমাণ</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(agents.paymentStats.totalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">পেইড</span>
                    <span className="font-semibold text-green-600">{formatCurrency(agents.paymentStats.paidAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">ডিউ</span>
                    <span className="font-semibold text-red-600">{formatCurrency(agents.paymentStats.dueAmount || 0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vendors Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-orange-600" />
              ভেন্ডর পরিসংখ্যান
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">মোট</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vendors.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">আজ</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vendors.today || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">এই মাসে</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vendors.thisMonth || 0}</span>
              </div>
              {vendors.paymentStats && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">মোট পরিমাণ</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(vendors.paymentStats.totalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">পেইড</span>
                    <span className="font-semibold text-green-600">{formatCurrency(vendors.paymentStats.paidAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">ডিউ</span>
                    <span className="font-semibold text-red-600">{formatCurrency(vendors.paymentStats.dueAmount || 0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              লেনদেন
            </h3>
            {financial.transactions && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">মোট ক্রেডিট</span>
                  <span className="font-semibold text-green-600">{formatCurrency(financial.transactions.totalCredit || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">মোট ডেবিট</span>
                  <span className="font-semibold text-red-600">{formatCurrency(financial.transactions.totalDebit || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">নিট পরিমাণ</span>
                  <span className={`font-bold text-lg ${(financial.transactions.netAmount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(financial.transactions.netAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>মোট লেনদেন: {financial.transactions.totalCount || 0}</span>
                  <span>ক্রেডিট: {financial.transactions.creditCount || 0} | ডেবিট: {financial.transactions.debitCount || 0}</span>
                </div>
              </div>
            )}
          </div>

          {/* Invoices */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-purple-600" />
              ইনভয়েস
            </h3>
            {financial.invoices && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">মোট ইনভয়েস</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{financial.invoices.totalInvoices || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">মোট পরিমাণ</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(financial.invoices.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">পেইড</span>
                  <span className="font-semibold text-green-600">{formatCurrency(financial.invoices.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">ডিউ</span>
                  <span className="font-semibold text-red-600">{formatCurrency(financial.invoices.dueAmount || 0)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Accounts & Bank Accounts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-yellow-600" />
              অ্যাকাউন্ট ও ব্যাংক
            </h3>
            <div className="space-y-3">
              {financial.accounts && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">অ্যাকাউন্ট</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{financial.accounts.totalAccounts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">অ্যাকাউন্ট ব্যালেন্স</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(financial.accounts.totalBalance || 0)}</span>
                  </div>
                </>
              )}
              {financial.bankAccounts && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">ব্যাংক অ্যাকাউন্ট</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{financial.bankAccounts.totalBankAccounts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">ব্যাংক ব্যালেন্স</span>
                    <span className="font-semibold text-green-600">{formatCurrency(financial.bankAccounts.totalBalance || 0)}</span>
                  </div>
                </>
              )}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 dark:text-white font-medium">মোট সম্পদ</span>
                  <span className="font-bold text-lg text-green-600">{formatCurrency(grandTotals.totalAssets || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loans */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-red-600" />
              ঋণ
            </h3>
            {financial.loans && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">মোট ঋণ</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{financial.loans.totalLoans || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">মোট পরিমাণ</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(financial.loans.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">পেইড</span>
                  <span className="font-semibold text-green-600">{formatCurrency(financial.loans.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">ডিউ</span>
                  <span className="font-semibold text-red-600">{formatCurrency(financial.loans.dueAmount || 0)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Services & Farm */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Services */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              সেবা পরিসংখ্যান
            </h3>
            <div className="space-y-4">
              {services.packages && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">প্যাকেজ</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{services.packages.total || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>এজেন্ট প্যাকেজ</span>
                    <span>{services.packages.agentPackages || 0}</span>
                  </div>
                </div>
              )}
              {services.tickets && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">টিকেট</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{services.tickets.total || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">মোট পরিমাণ</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(services.tickets.totalAmount || 0)}</span>
                  </div>
                </div>
              )}
              {services.exchanges && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">মুদ্রা বিনিময়</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {services.exchanges.buyCount || 0} ক্রয় | {services.exchanges.sellCount || 0} বিক্রয়
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">ক্রয় পরিমাণ</span>
                      <span className="font-medium text-red-600">{formatCurrency(services.exchanges.buyAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">বিক্রয় পরিমাণ</span>
                      <span className="font-medium text-green-600">{formatCurrency(services.exchanges.sellAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">নিট পরিমাণ</span>
                      <span className={`font-bold ${(services.exchanges.netAmount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(services.exchanges.netAmount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Farm */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-amber-600" />
              ফার্ম পরিসংখ্যান
            </h3>
            <div className="space-y-4">
              {farm.cattle && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">গবাদি পশু</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{farm.cattle.total || 0}</span>
                  </div>
                  {farm.cattle.byStatus && Object.keys(farm.cattle.byStatus).length > 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      {Object.entries(farm.cattle.byStatus).map(([status, count]) => (
                        <div key={status} className="flex justify-between">
                          <span>{status}</span>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {farm.milkProduction && (
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">দুধ উৎপাদন</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{farm.milkProduction.totalProduction || 0} লিটার</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    রেকর্ড: {farm.milkProduction.totalRecords || 0}
                  </div>
                </div>
              )}
              {farm.employees && (
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">কর্মচারী</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {farm.employees.active || 0} / {farm.employees.total || 0}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    বেতন: {formatCurrency(farm.employees.totalSalary || 0)}
                  </div>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">আয়</span>
                  <span className="font-semibold text-green-600">{formatCurrency(farm.incomes?.total || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">ব্যয়</span>
                  <span className="font-semibold text-red-600">{formatCurrency(farm.expenses?.total || 0)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white font-medium">নিট লাভ</span>
                  <span className={`font-bold ${(farm.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(farm.netProfit || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              সাম্প্রতিক লেনদেন
            </h3>
            <div className="space-y-3">
              {recentActivity.transactions && recentActivity.transactions.length > 0 ? (
                recentActivity.transactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.transactionId || 'N/A'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tx.transactionType || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(tx.amount || 0)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">কোনো লেনদেন নেই</p>
              )}
            </div>
          </div>

          {/* Recent Customers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-green-600" />
              সাম্প্রতিক গ্রাহক
            </h3>
            <div className="space-y-3">
              {recentActivity.customers && recentActivity.customers.length > 0 ? (
                recentActivity.customers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{customer.customerId || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{customer.customerType || 'N/A'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">কোনো গ্রাহক নেই</p>
              )}
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-purple-600" />
              সাম্প্রতিক ইনভয়েস
            </h3>
            <div className="space-y-3">
              {recentActivity.invoices && recentActivity.invoices.length > 0 ? (
                recentActivity.invoices.map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.invoiceId || 'N/A'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">মোট: {formatCurrency(invoice.total || 0)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-semibold ${(invoice.due || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ডিউ: {formatCurrency(invoice.due || 0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(invoice.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">কোনো ইনভয়েস নেই</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Modules Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ব্যবসায়িক মডিউল</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {businessModules.length} টি মডিউল উপলব্ধ
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {businessModules.map((module, index) => (
              <Link
                key={index}
                to={module.routes[0]?.path || '#'}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className={`${module.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    <module.icon className={`h-8 w-8 ${module.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
                  <p className="text-white/90 text-sm">{module.description}</p>
                </div>

                <div className="p-4">
                  <div className="space-y-2">
                    {module.routes.slice(0, 3).map((route, routeIndex) => (
                      <div
                        key={routeIndex}
                        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        <route.icon className="h-4 w-4 mr-2" />
                        {route.name}
                      </div>
                    ))}
                    {module.routes.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                        +{module.routes.length - 3} আরও বিকল্প
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">দ্রুত কাজ</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              to="/hajj-umrah/haji/add"
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <Plus className="h-6 w-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">নতুন হাজী</span>
            </Link>
            <Link
              to="/air-ticketing/new-ticket"
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <Plane className="h-6 w-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">নতুন টিকেট</span>
            </Link>
            <Link
              to="/sales-invoice/new"
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <Receipt className="h-6 w-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ইনভয়েস</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
