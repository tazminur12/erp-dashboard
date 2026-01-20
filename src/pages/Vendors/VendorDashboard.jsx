import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Building2, 
  Plus, 
  FileText, 
  Search,
  Download,
  Eye,
  Edit,
  MoreVertical,
  MapPin,
  Phone,
  User,
  Receipt,
  Wallet,
  TrendingDown
} from 'lucide-react';
import CardWidget from '../../components/common/CardWidget';
import { useVendorDashboard } from '../../hooks/useVendorQueries';
import Swal from 'sweetalert2';

const VendorDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('tradeName');
  
  // Fetch comprehensive dashboard data
  const { 
    data: dashboardData, 
    isLoading: loading, 
    error: dashboardError 
  } = useVendorDashboard();

  // Extract data from dashboard response
  const statistics = dashboardData?.statistics || {};
  const bills = dashboardData?.bills || {};
  const recentActivity = dashboardData?.recentActivity || {};
  const distribution = dashboardData?.distribution || {};
  
  // Get vendors from recent activity
  const vendors = useMemo(() => {
    const recentVendors = recentActivity?.vendors || [];
    return recentVendors.map(v => ({
      _id: v._id || v.vendorId,
      vendorId: v.vendorId || v._id,
      tradeName: v.tradeName || '',
      tradeLocation: v.tradeLocation || '',
      ownerName: v.ownerName || '',
      contactNo: v.contactNo || '',
      status: 'active' // Recent vendors are typically active
    }));
  }, [recentActivity]);

  // Show error if dashboard fails to load
  useEffect(() => {
    if (dashboardError) {
      const serverMsg = dashboardError?.message || 'Unknown error';
      console.error('Error loading vendor dashboard:', serverMsg);
      Swal.fire({
        icon: 'error',
        title: 'লোড ব্যর্থ',
        text: `ভেন্ডর পরিসংখ্যান/ডেটা লোড করতে পারেনি। ${serverMsg}`,
        confirmButtonColor: '#7c3aed'
      });
    }
  }, [dashboardError]);

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

  const byLocation = useMemo(() => {
    return distribution?.byLocation || [];
  }, [distribution]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>ভেন্ডর ড্যাশবোর্ড</title>
        <meta name="description" content="ভেন্ডর পরিসংখ্যান এবং কার্যক্রমের ওভারভিউ।" />
      </Helmet>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ভেন্ডর ও পার্টনার ড্যাশবোর্ড</h1>
            <p className="text-gray-600 dark:text-gray-400">ভেন্ডর ও পার্টনার সম্পর্ক পরিচালনা এবং পর্যবেক্ষণ করুন</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5">
            <Download className="w-4 h-4" /> এক্সপোর্ট
          </button>
          <Link
            to="/vendors/add"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> ভেন্ডর যোগ করুন
          </Link>
        </div>
      </div>

      {/* Stats Cards - Single Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <CardWidget 
          title="মোট ভেন্ডর" 
          value={loading ? '...' : Number(statistics.totalVendors || 0).toLocaleString('bn-BD')} 
          icon={Building2} 
          trend="" 
          trendValue="" 
          trendType="neutral" 
          iconColor="blue"
        />
        <CardWidget 
          title="মোট ভেন্ডর বিল" 
          value={loading ? '...' : Number(bills.totalBills || 0).toLocaleString('bn-BD')} 
          icon={Receipt} 
          trend="" 
          trendValue="" 
          trendType="neutral" 
          iconColor="gray"
        />
        <CardWidget 
          title="মোট বিল পরিমাণ" 
          value={loading ? '...' : `৳${Number(bills.totalAmount || 0).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}`} 
          icon={FileText} 
          trend="" 
          trendValue="" 
          trendType="neutral" 
          iconColor="orange"
        />
        <CardWidget 
          title="মোট পরিশোধিত" 
          value={loading ? '...' : `৳${Number(bills.totalPaid || 0).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}`} 
          icon={Wallet} 
          trend="" 
          trendValue="" 
          trendType="up" 
          iconColor="green"
          valueColor="text-green-600 dark:text-green-400"
        />
        <CardWidget 
          title="মোট বাকি" 
          value={loading ? '...' : `৳${Number(bills.totalDue || 0).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}`} 
          icon={TrendingDown} 
          trend="" 
          trendValue="" 
          trendType="down" 
          iconColor="red"
          valueColor="text-red-600 dark:text-red-400"
        />
      </div>

      {/* Vendor List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendor List */}
          <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">ভেন্ডর ওভারভিউ</h2>
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
                      className="w-64 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ভেন্ডর খুঁজুন..."
                    />
                  </div>
                  {/* Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">সব স্ট্যাটাস</option>
                    <option value="active">সক্রিয়</option>
                    <option value="inactive">নিষ্ক্রিয়</option>
                  </select>
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="tradeName">নাম অনুযায়ী সাজান</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">ভেন্ডর লোড হচ্ছে...</div>
              ) : filteredVendors.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">কোনো ভেন্ডর পাওয়া যায়নি</div>
              ) : filteredVendors.map((vendor) => (
                <div key={vendor._id || vendor.vendorId} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/vendors/${vendor._id || vendor.vendorId}`}
                            className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {vendor.tradeName}
                          </Link>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            vendor.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {vendor.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">অবস্থান অনুযায়ী ভেন্ডর</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-gray-500 dark:text-gray-400">লোড হচ্ছে...</div>
              ) : byLocation.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">কোনো অবস্থান ডেটা নেই</div>
              ) : byLocation.map((loc, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                      {loc.count}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{loc.location || loc._id || 'অজানা'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">দ্রুত কাজ</h3>
            <div className="space-y-3">
              <Link
                to="/vendors/add"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">নতুন ভেন্ডর যোগ করুন</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">একটি নতুন ভেন্ডর নিবন্ধন করুন</div>
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
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">সব ভেন্ডর দেখুন</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">ভেন্ডর তালিকা ব্রাউজ করুন</div>
                </div>
              </Link>
              <button className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">রিপোর্ট তৈরি করুন</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">ভেন্ডর ডেটা এক্সপোর্ট করুন</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
