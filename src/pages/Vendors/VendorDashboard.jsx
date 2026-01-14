import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Building2, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreVertical,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  Users,
  Package,
  Activity,
  User,
  ShoppingCart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Receipt,
  Wallet,
  TrendingDown
} from 'lucide-react';
import CardWidget from '../../components/common/CardWidget';
import SmallStat from '../../components/common/SmallStat';
import useSecureAxios from '../../hooks/UseAxiosSecure.js';
import useAxios from '../../hooks/Axios.js';
import { useVendorBills, useVendorAnalytics, useVendorBillsSummary } from '../../hooks/useVendorQueries';
import Swal from 'sweetalert2';

// Initial stats shape matching API response
const initialStats = {
  total: 0,
  today: 0,
  thisMonth: 0,
  withNID: 0,
  withPassport: 0,
  byLocation: []
};

// Initial dashboard data
const initialDashboardData = {
  overview: null,
  summary: null,
  vendorAnalytics: null,
  orderAnalytics: null
};

const VendorDashboard = () => {
  const axiosSecure = useSecureAxios();
  const axiosPublic = useAxios();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('tradeName');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(initialStats);
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [showComprehensiveView, setShowComprehensiveView] = useState(false);
  
  // Fetch all vendor bills
  const { data: vendorBills = [], isLoading: billsLoading } = useVendorBills();
  
  // Fetch vendor bills summary using the hook
  const { 
    data: billsSummary, 
    isLoading: billsSummaryLoading, 
    error: billsSummaryError 
  } = useVendorBillsSummary();
  
  // Fetch vendor analytics using the hook
  const { 
    data: vendorAnalytics, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useVendorAnalytics();

  const fetchDashboardData = async () => {
    try {
      // Fetch order analytics (vendor analytics is handled by hook)
      const orderAnalyticsRes = await axiosSecure.get('/orders/analytics');

      setDashboardData(prev => ({
        ...prev,
        orderAnalytics: orderAnalyticsRes.data
      }));

    } catch (error) {
      console.error('Error loading order analytics:', error);
      // Don't show error for comprehensive data as it's optional
    }
  };

  const handleRefresh = () => {
    refetchAnalytics();
    fetchDashboardData();
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        
        // Fetch vendor data and comprehensive dashboard data in parallel
        const [statsRes, vendorsRes] = await Promise.all([
          axiosSecure.get('/vendors/stats/overview'),
          axiosSecure.get('/vendors')
        ]);

        const apiStats = statsRes.data?.stats || {};
        setStats({
          total: apiStats.total || 0,
          today: apiStats.today || 0,
          thisMonth: apiStats.thisMonth || 0,
          withNID: apiStats.withNID || 0,
          withPassport: apiStats.withPassport || 0,
          byLocation: Array.isArray(apiStats.byLocation) ? apiStats.byLocation : []
        });

        const vendorsData = vendorsRes.data?.vendors || vendorsRes.data || [];
        const transformed = vendorsData.map(v => ({
          _id: v._id || v.id,
          vendorId: v.vendorId || v.id || v._id,
          tradeName: v.tradeName || '',
          tradeLocation: v.tradeLocation || '',
          ownerName: v.ownerName || '',
          contactNo: v.contactNo || '',
          dob: v.dob || '',
          nid: v.nid || '',
          passport: v.passport || '',
          status: v.isActive === false ? 'inactive' : 'active'
        }));
        setVendors(transformed);

        // Fetch order analytics (vendor analytics is handled by hook)
        await fetchDashboardData();

      } catch (error) {
        const serverMsg = error?.response?.data?.message || error?.message || 'Unknown error';
        console.error('Error loading vendor dashboard:', serverMsg);
        Swal.fire({
          icon: 'error',
          title: 'Load failed',
          text: `Could not load vendor stats/data. ${serverMsg}`,
          confirmButtonColor: '#7c3aed'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [axiosSecure]);

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    let filtered = vendors.filter(vendor => {
      const matchesSearch = vendor.tradeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vendor.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vendor.tradeLocation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort vendors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tradeName':
          return a.tradeName.localeCompare(b.tradeName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, statusFilter, sortBy, vendors]);

  const byLocation = useMemo(() => Array.isArray(stats.byLocation) ? stats.byLocation : [], [stats.byLocation]);
  
  // Use vendor bills summary from API, fallback to calculated values if not available
  const billStats = useMemo(() => {
    // Prefer API summary data if available
    if (billsSummary) {
      return {
        totalBills: billsSummary.totalBills || 0,
        totalAmount: billsSummary.totalAmount || 0,
        totalPaid: billsSummary.totalPaid || 0,
        totalDue: billsSummary.totalDue || 0
      };
    }
    
    // Fallback: Calculate from vendorBills array if summary not available
    if (!Array.isArray(vendorBills) || vendorBills.length === 0) {
      return {
        totalBills: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0
      };
    }
    
    const totalBills = vendorBills.length;
    const totalAmount = vendorBills.reduce((sum, bill) => sum + (parseFloat(bill.totalAmount) || 0), 0);
    const totalPaid = vendorBills.reduce((sum, bill) => sum + (parseFloat(bill.paidAmount) || 0), 0);
    const totalDue = Math.max(0, totalAmount - totalPaid);
    
    return {
      totalBills,
      totalAmount,
      totalPaid,
      totalDue
    };
  }, [billsSummary, vendorBills]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Vendor Dashboard</title>
        <meta name="description" content="Overview of vendor statistics and activities." />
      </Helmet>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendor Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and monitor vendor relationships</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowComprehensiveView(!showComprehensiveView)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5"
          >
            <BarChart3 className="w-4 h-4" /> 
            {showComprehensiveView ? 'Vendor View' : 'Comprehensive View'}
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5">
            <Download className="w-4 h-4" /> Export
          </button>
          <Link
            to="/vendors/add"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </Link>
        </div>
      </div>

      {/* Stats Cards - Single Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <CardWidget 
          title="মোট ভেন্ডর" 
          value={stats.total} 
          icon={Building2} 
          trend="" 
          trendValue="" 
          trendType="neutral" 
        />
        <CardWidget 
          title="মোট ভেন্ডর বিল" 
          value={billsSummaryLoading ? '...' : billStats.totalBills} 
          icon={Receipt} 
          trend="" 
          trendValue="" 
          trendType="neutral" 
        />
        <CardWidget 
          title="মোট বিল পরিমাণ" 
          value={billsSummaryLoading ? '...' : `৳${billStats.totalAmount.toLocaleString('en-BD', { maximumFractionDigits: 0 })}`} 
          icon={FileText} 
          trend="" 
          trendValue="" 
          trendType="neutral" 
        />
        <CardWidget 
          title="মোট পরিশোধিত" 
          value={billsSummaryLoading ? '...' : `৳${billStats.totalPaid.toLocaleString('en-BD', { maximumFractionDigits: 0 })}`} 
          icon={Wallet} 
          trend="" 
          trendValue="" 
          trendType="up" 
        />
        <CardWidget 
          title="মোট বাকি" 
          value={billsSummaryLoading ? '...' : `৳${billStats.totalDue.toLocaleString('en-BD', { maximumFractionDigits: 0 })}`} 
          icon={TrendingDown} 
          trend="" 
          trendValue="" 
          trendType="down" 
        />
      </div>

      {/* Comprehensive Dashboard Header */}
      {showComprehensiveView && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Analytics Dashboard</h3>
            <button 
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      )}

      {/* Vendor Analytics */}
      {showComprehensiveView && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Vendor Analytics</h3>
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500 dark:text-gray-400">Loading analytics...</div>
              </div>
            ) : analyticsError ? (
              <div className="text-red-500 dark:text-red-400 text-sm">Failed to load analytics</div>
            ) : vendorAnalytics ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Vendors</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{vendorAnalytics.totalVendors || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Vendors</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{vendorAnalytics.activeVendors || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Inactive Vendors</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{vendorAnalytics.inactiveVendors || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">New This Month</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{vendorAnalytics.newThisMonth || 0}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-sm">No analytics data available</div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Vendors by Location</h3>
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500 dark:text-gray-400">Loading locations...</div>
              </div>
            ) : analyticsError ? (
              <div className="text-red-500 dark:text-red-400 text-sm">Failed to load location data</div>
            ) : vendorAnalytics?.topLocations && vendorAnalytics.topLocations.length > 0 ? (
              <div className="space-y-3">
                {vendorAnalytics.topLocations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-400">
                        {location.count || 0}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{location.location || 'Unknown'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-sm">No location data available</div>
            )}
          </div>
        </div>
      )}

      {/* Order Analytics */}
      {showComprehensiveView && dashboardData.orderAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Status Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{dashboardData.orderAnalytics.completedOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">{dashboardData.orderAnalytics.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cancelled</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{dashboardData.orderAnalytics.cancelledOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Processing</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{dashboardData.orderAnalytics.processingOrders}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Revenue Analytics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">${dashboardData.orderAnalytics.totalRevenue?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
                <span className="font-semibold text-green-600 dark:text-green-400">${dashboardData.orderAnalytics.monthlyRevenue?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Order</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">${dashboardData.orderAnalytics.averageOrderValue?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Trends</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Today's Orders</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{dashboardData.orderAnalytics.todayOrders}</span>
                  {dashboardData.orderAnalytics.todayOrdersChange > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{dashboardData.orderAnalytics.weeklyOrders}</span>
                  {dashboardData.orderAnalytics.weeklyOrdersChange > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{dashboardData.orderAnalytics.monthlyOrders}</span>
                  {dashboardData.orderAnalytics.monthlyOrdersChange > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor List - Only show in normal view */}
      {!showComprehensiveView && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendor List */}
          <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vendors Overview</h2>
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Search vendors..."
                    />
                  </div>
                  {/* Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="tradeName">Sort by Name</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading vendors...</div>
              ) : filteredVendors.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">No vendors found</div>
              ) : filteredVendors.map((vendor) => (
                <div key={vendor._id || vendor.vendorId} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/vendors/${vendor._id || vendor.vendorId}`}
                            className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400"
                          >
                            {vendor.tradeName}
                          </Link>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            vendor.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {vendor.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {vendor.ownerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {vendor.tradeLocation}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {vendor.contactNo}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/vendors/${vendor._id || vendor.vendorId}`}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </Link>
                        <button className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By Location & Quick Actions */}
        <div className="space-y-6">
          {/* Vendors by Location */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Vendors by Location</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-gray-500 dark:text-gray-400">Loading...</div>
              ) : byLocation.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">No location data</div>
              ) : byLocation.map((loc, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-400">
                      {loc.count}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{loc._id || 'Unknown'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/vendors/add"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Add New Vendor</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Register a new vendor</div>
                </div>
              </Link>
              <Link
                to="/vendors"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">View All Vendors</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Browse vendor list</div>
                </div>
              </Link>
              <button className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Generate Report</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Export vendor data</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* No Comprehensive Data State */}
      {showComprehensiveView && !vendorAnalytics && !dashboardData.orderAnalytics && !analyticsLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Dashboard Data</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to load comprehensive dashboard data. Please check your connection and try again.</p>
          <button 
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
