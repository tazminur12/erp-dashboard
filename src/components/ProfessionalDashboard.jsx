import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plane, 
  Building, 
  Wallet, 
  Calculator, 
  FileText, 
  Receipt, 
  Building2, 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Shield, 
  Home, 
  CreditCard, 
  PiggyBank, 
  User,
  Package,
  Eye,
  ClipboardList,
  Database,
  Settings,
  UserCircle,
  Plus,
  List,
  Edit,
  BookOpen,
  Zap,
  Utensils,
  Bell,
  BellIcon,
  Search,
  FileSpreadsheet,
  History,
  Megaphone,
  Laptop,
  RotateCcw,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';
import { useCategoriesSummary, useTransactionsStats } from '../hooks/DashboardQueries';
import { useTransactionCategories } from '../hooks/useTransactionQueries';
import { getAllSubCategories } from '../utils/categoryUtils';

const ProfessionalDashboard = () => {
  const [dateRange, setDateRange] = useState({});
  
  // Fetch categories summary data
  const { data: summaryData, isLoading: isSummaryLoading, error: summaryError } = useCategoriesSummary(dateRange);
  
  // Fetch transactions stats grouped by category and subcategory
  const { data: statsData, isLoading: isStatsLoading, error: statsError } = useTransactionsStats({
    groupBy: 'category,subcategory',
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate
  });
  
  // Fetch categories for ID to name mapping
  const { data: apiCategories = [] } = useTransactionCategories();
  
  // Create ID to name mapping for categories and subcategories
  const categoryNameMap = useMemo(() => {
    const map = {};
    
    // Build map from local subcategories (from categoryUtils)
    try {
      const localSubCategories = getAllSubCategories();
      localSubCategories.forEach(sub => {
        if (sub.id) map[sub.id] = sub.name;
      });
    } catch (e) {
      console.warn('Error loading local subcategories:', e);
    }
    
    // Build map from API categories
    try {
      if (Array.isArray(apiCategories)) {
        apiCategories.forEach(category => {
          if (!category) return;
          
          // Handle string categories (fallback case)
          if (typeof category === 'string') {
            map[category] = category;
            return;
          }
          
          // Map category ID to name
          const categoryId = category._id || category.id || category.value || category.slug;
          const categoryName = category.name || category.label || category.title || category.categoryName;
          if (categoryId && categoryName) {
            map[categoryId] = categoryName;
          }
          
          // Map subcategory IDs to names
          const subCategories = category.subCategories || category.subcategories || [];
          subCategories.forEach(sub => {
            if (!sub) return;
            const subId = sub._id || sub.id || sub.value || sub.slug;
            const subName = sub.name || sub.label || sub.title || sub.categoryName;
            if (subId && subName) {
              map[subId] = subName;
            }
          });
        });
      }
    } catch (e) {
      console.warn('Error processing API categories:', e);
    }
    
    return map;
  }, [apiCategories]);
  
  // Function to resolve category name from ID
  const getCategoryName = (categoryNameOrId) => {
    if (!categoryNameOrId) return 'N/A';
    
    // First check if it's in the mapping (for MongoDB IDs or other IDs)
    if (categoryNameMap[categoryNameOrId]) {
      return categoryNameMap[categoryNameOrId];
    }
    
    // If it's already a readable name (not found in map), return as is
    return categoryNameOrId;
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };
  const businessModules = [
    {
      title: "হজ্জ ও ওমরাহ ব্যবস্থাপনা",
      description: "হাজী ব্যবস্থাপনা, প্যাকেজ তৈরি এবং এজেন্ট ব্যবস্থাপনা",
      icon: Building,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      iconColor: "text-white",
      profit: "৳850,000",
      profitChange: "+15.2%",
      profitType: "positive",
      monthlyTarget: "৳800,000",
      targetProgress: 106,
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
      profit: "৳620,000",
      profitChange: "+8.7%",
      profitType: "positive",
      monthlyTarget: "৳650,000",
      targetProgress: 95,
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
      profit: "৳480,000",
      profitChange: "+22.3%",
      profitType: "positive",
      monthlyTarget: "৳450,000",
      targetProgress: 107,
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
      profit: "৳320,000",
      profitChange: "+5.1%",
      profitType: "positive",
      monthlyTarget: "৳350,000",
      targetProgress: 91,
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
      profit: "৳180,000",
      profitChange: "-3.2%",
      profitType: "negative",
      monthlyTarget: "৳200,000",
      targetProgress: 90,
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
      profit: "৳280,000",
      profitChange: "+18.5%",
      profitType: "positive",
      monthlyTarget: "৳250,000",
      targetProgress: 112,
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
      profit: "৳150,000",
      profitChange: "+12.8%",
      profitType: "positive",
      monthlyTarget: "৳140,000",
      targetProgress: 107,
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
      profit: "৳-650,000",
      profitChange: "+2.1%",
      profitType: "negative",
      monthlyTarget: "৳-680,000",
      targetProgress: 96,
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
      profit: "৳85,000",
      profitChange: "+9.4%",
      profitType: "positive",
      monthlyTarget: "৳80,000",
      targetProgress: 106,
      routes: [
        { name: "নতুন বিনিময়", path: "/money-exchange/new", icon: Plus },
        { name: "বিনিময় তালিকা", path: "/money-exchange/list", icon: List }
      ]
    },
    {
      title: "গ্রাহক ব্যবস্থাপনা",
      description: "গ্রাহক তথ্য, যোগাযোগ এবং সম্পর্ক ব্যবস্থাপনা",
      icon: Users,
      color: "bg-gradient-to-br from-sky-500 to-blue-600",
      iconColor: "text-white",
      profit: "৳45,000",
      profitChange: "+6.8%",
      profitType: "positive",
      monthlyTarget: "৳40,000",
      targetProgress: 113,
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
      profit: "৳120,000",
      profitChange: "+14.2%",
      profitType: "positive",
      monthlyTarget: "৳110,000",
      targetProgress: 109,
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
      profit: "৳0",
      profitChange: "0%",
      profitType: "neutral",
      monthlyTarget: "৳0",
      targetProgress: 0,
      routes: [
        { name: "ব্যবহারকারী ব্যবস্থাপনা", path: "/settings/users", icon: Users },
        { name: "ব্যাকআপ ও পুনরুদ্ধার", path: "/settings/backup", icon: Database },
        { name: "প্রোফাইল", path: "/profile", icon: UserCircle }
      ]
    }
  ];

  const quickStats = [
    {
      title: "মোট আয়",
      value: "৳2,847,500",
      change: "+12.5%",
      changeType: "positive",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      subtitle: "এই মাসে"
    },
    {
      title: "নিট লাভ",
      value: "৳1,223,700",
      change: "+15.2%",
      changeType: "positive",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      subtitle: "মুনাফার হার: 43.0%"
    },
    {
      title: "মোট ব্যয়",
      value: "৳1,623,800",
      change: "+8.2%",
      changeType: "negative",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      subtitle: "অপারেশনাল খরচ"
    },
    {
      title: "সক্রিয় গ্রাহক",
      value: "1,247",
      change: "+5.3%",
      changeType: "positive",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      subtitle: "নতুন: 156 জন"
    },
    {
      title: "অপেক্ষমান অনুমোদন",
      value: "23",
      change: "-2.1%",
      changeType: "negative",
      icon: Bell,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      subtitle: "গড় সময়: ২ ঘন্টা"
    },
    {
      title: "ROI",
      value: "43.2%",
      change: "+3.8%",
      changeType: "positive",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      subtitle: "বিনিয়োগের উপর ফেরত"
    }
  ];

  const recentActivities = [
    { action: "নতুন হাজী যোগ করা হয়েছে", time: "২ ঘন্টা আগে", type: "success" },
    { action: "এয়ার টিকেট বিক্রয় সম্পন্ন", time: "৪ ঘন্টা আগে", type: "info" },
    { action: "ভিসা প্রসেসিং অনুমোদিত", time: "৬ ঘন্টা আগে", type: "success" },
    { action: "অ্যাকাউন্ট রিপোর্ট তৈরি", time: "৮ ঘন্টা আগে", type: "info" },
    { action: "নতুন কর্মচারী যোগ", time: "১ দিন আগে", type: "success" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ERP ব্যবস্থাপনা সিস্টেম
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              সমন্বিত ব্যবসায়িক প্রক্রিয়া এবং সম্পদ ব্যবস্থাপনা
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-sm text-blue-100">সিস্টেম স্ট্যাটাস</div>
                <div className="text-lg font-semibold">অনলাইন</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-sm text-blue-100">সক্রিয় ব্যবহারকারী</div>
                <div className="text-lg font-semibold">47</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-sm text-blue-100">আজকের লেনদেন</div>
                <div className="text-lg font-semibold">156</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className={`text-xs font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Performance Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">আর্থিক পারফরমেন্স বিশ্লেষণ</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Monthly Profit/Loss */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">মাসিক লাভ/ক্ষতি</h3>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">মোট আয়</span>
                  <span className="text-lg font-semibold text-green-600">৳2,847,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">মোট ব্যয়</span>
                  <span className="text-lg font-semibold text-red-600">৳1,623,800</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-white font-medium">নিট লাভ</span>
                    <span className="text-xl font-bold text-green-600">৳1,223,700</span>
                  </div>
                  <div className="text-sm text-green-600 mt-1">+12.5% গত মাস থেকে</div>
                </div>
              </div>
            </div>

            {/* Revenue by Module */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">মডিউল অনুযায়ী আয়</h3>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">হজ্জ ও ওমরাহ</span>
                  <span className="text-sm font-semibold text-blue-600">৳850,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">এয়ার টিকেটিং</span>
                  <span className="text-sm font-semibold text-green-600">৳620,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">ভিসা প্রসেসিং</span>
                  <span className="text-sm font-semibold text-purple-600">৳480,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">অন্যান্য</span>
                  <span className="text-sm font-semibold text-gray-600">৳897,500</span>
                </div>
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">খরচ বিশ্লেষণ</h3>
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">কর্মচারী বেতন</span>
                  <span className="text-sm font-semibold text-red-600">৳650,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">অপারেশনাল খরচ</span>
                  <span className="text-sm font-semibold text-red-600">৳420,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">মার্কেটিং</span>
                  <span className="text-sm font-semibold text-red-600">৳280,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">অন্যান্য</span>
                  <span className="text-sm font-semibold text-red-600">৳273,800</span>
                </div>
              </div>
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
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className={`${module.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    <module.icon className={`h-8 w-8 ${module.iconColor}`} />
                    <ChevronRight className="h-5 w-5 text-white/70" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
                  <p className="text-white/90 text-sm">{module.description}</p>
                </div>
                
                <div className="p-4">
                  {/* Performance Metrics */}
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">মাসিক আয়</span>
                      <span className={`text-sm font-semibold ${
                        module.profitType === 'positive' ? 'text-green-600' : 
                        module.profitType === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {module.profit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">পরিবর্তন</span>
                      <span className={`text-xs font-medium ${
                        module.profitType === 'positive' ? 'text-green-600' : 
                        module.profitType === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {module.profitChange}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          module.targetProgress >= 100 ? 'bg-green-500' : 
                          module.targetProgress >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(module.targetProgress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      লক্ষ্যমাত্রা: {module.monthlyTarget} ({module.targetProgress}%)
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    {module.routes.slice(0, 3).map((route, routeIndex) => (
                      <Link
                        key={routeIndex}
                        to={route.path}
                        className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        <route.icon className="h-4 w-4 mr-2" />
                        {route.name}
                      </Link>
                    ))}
                    {module.routes.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                        +{module.routes.length - 3} আরও বিকল্প
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">ক্যাটাগরি অনুযায়ী ক্রেডিট ও ডেবিট সারাংশ</h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {isSummaryLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : summaryError ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">ডাটা লোড করতে সমস্যা হয়েছে</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{summaryError?.message}</p>
            </div>
          ) : summaryData?.categories && summaryData.categories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">ক্যাটাগরি</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">মোট ক্রেডিট</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">মোট ডেবিট</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">নিট পরিমাণ</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.categories.map((category, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getCategoryName(category.categoryName)}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          {formatCurrency(category.totalCredit)}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          {formatCurrency(category.totalDebit)}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className={`font-bold ${
                          category.netAmount >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(category.netAmount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Grand Total */}
                  {summaryData.grandTotal && (
                    <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30">
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-900 dark:text-white">মোট</span>
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                          {formatCurrency(summaryData.grandTotal.totalCredit)}
                        </span>
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className="text-red-600 dark:text-red-400 font-bold text-lg">
                          {formatCurrency(summaryData.grandTotal.totalDebit)}
                        </span>
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className={`font-bold text-lg ${
                          summaryData.grandTotal.netAmount >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(summaryData.grandTotal.netAmount)}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">কোনো ডাটা পাওয়া যায়নি</p>
            </div>
          )}
        </div>

        {/* Transactions Stats by Category and Subcategory */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">ক্যাটাগরি ও সাবক্যাটাগরি অনুযায়ী লেনদেন পরিসংখ্যান</h3>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          {isStatsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : statsError ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">ডাটা লোড করতে সমস্যা হয়েছে</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{statsError?.message}</p>
            </div>
          ) : statsData?.data && statsData.data.length > 0 ? (
            <div className="space-y-6">
              {/* Grand Totals */}
              {statsData.totals && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">মোট ক্রেডিট</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(statsData.totals.totalCredit)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">মোট ডেবিট</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(statsData.totals.totalDebit)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">নিট পরিমাণ</p>
                      <p className={`text-2xl font-bold ${
                        statsData.totals.netAmount >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(statsData.totals.netAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category and Subcategory Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">ক্যাটাগরি</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">সাবক্যাটাগরি</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">মোট ক্রেডিট</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">মোট ডেবিট</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">নিট পরিমাণ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsData.data.map((item, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {getCategoryName(item.category) || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-700 dark:text-gray-300">
                            {getCategoryName(item.subcategory) || '-'}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            {formatCurrency(item.totalCredit)}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className="text-red-600 dark:text-red-400 font-semibold">
                            {formatCurrency(item.totalDebit)}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={`font-bold ${
                            item.netAmount >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatCurrency(item.netAmount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Period Info */}
              {statsData.period && (statsData.period.fromDate || statsData.period.toDate) && (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  {statsData.period.fromDate && statsData.period.toDate 
                    ? `সময়কাল: ${statsData.period.fromDate} থেকে ${statsData.period.toDate}`
                    : statsData.period.fromDate 
                      ? `শুরু: ${statsData.period.fromDate}`
                      : statsData.period.toDate 
                        ? `শেষ: ${statsData.period.toDate}`
                        : ''
                  }
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">কোনো ডাটা পাওয়া যায়নি</p>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সাম্প্রতিক কার্যক্রম</h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.type === 'success' ? 'bg-green-500' : 
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-gray-700 dark:text-gray-300">{activity.action}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">দ্রুত কাজ</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <Link
              to="/account/reports"
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <BarChart3 className="h-6 w-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">রিপোর্ট</span>
            </Link>
          </div>
        </div>

        {/* Business Analytics */}
        <div className="mt-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">ব্যবসায়িক বিশ্লেষণ ও ইনসাইট</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Top Performing Modules */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সেরা পারফরম্যান্স</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 dark:text-green-400 font-bold text-sm">1</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">হজ্জ ও ওমরাহ</span>
                  </div>
                  <span className="text-green-600 font-semibold">৳850K</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">এয়ার টিকেটিং</span>
                  </div>
                  <span className="text-blue-600 font-semibold">৳620K</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">3</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">ভিসা প্রসেসিং</span>
                  </div>
                  <span className="text-purple-600 font-semibold">৳480K</span>
                </div>
              </div>
            </div>

            {/* Growth Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">বৃদ্ধির প্রবণতা</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">মাসিক বৃদ্ধি</span>
                  <span className="text-green-600 font-semibold">+12.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">বছরিক বৃদ্ধি</span>
                  <span className="text-green-600 font-semibold">+28.7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">গ্রাহক বৃদ্ধি</span>
                  <span className="text-blue-600 font-semibold">+15.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">বাজারে অংশ</span>
                  <span className="text-purple-600 font-semibold">+8.2%</span>
                </div>
              </div>
            </div>

            {/* Cost Efficiency */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">খরচ দক্ষতা</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">সর্বোচ্চ খরচ</span>
                  <span className="text-red-600 font-semibold">কর্মচারী বেতন</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">দক্ষতা অনুপাত</span>
                  <span className="text-green-600 font-semibold">1.75:1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">ROI</span>
                  <span className="text-blue-600 font-semibold">43.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">মুনাফার হার</span>
                  <span className="text-green-600 font-semibold">43.0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সিস্টেম স্ট্যাটাস</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">ডাটাবেস সংযোগ</span>
                </div>
                <span className="text-sm text-green-600 font-medium">সক্রিয়</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">API সার্ভিস</span>
                </div>
                <span className="text-sm text-green-600 font-medium">সক্রিয়</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">ব্যাকআপ সিস্টেম</span>
                </div>
                <span className="text-sm text-yellow-600 font-medium">চলমান</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">সিকিউরিটি</span>
                </div>
                <span className="text-sm text-green-600 font-medium">সক্রিয়</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">আজকের সারসংক্ষেপ</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">নতুন রেজিস্ট্রেশন</span>
                <span className="text-lg font-semibold text-blue-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">অনুমোদন অপেক্ষমান</span>
                <span className="text-lg font-semibold text-yellow-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">আজকের লেনদেন</span>
                <span className="text-lg font-semibold text-green-600">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">মোট আয়</span>
                <span className="text-lg font-semibold text-green-600">৳47,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
