import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  User
} from 'lucide-react';
import CardWidget from '../../components/common/CardWidget';
import SmallStat from '../../components/common/SmallStat';

// Mock data for demonstration
const DEMO_VENDORS = [
  {
    id: 'VND-0001',
    tradeName: 'Miraj Traders',
    tradeLocation: 'Dhaka, Bangladesh',
    ownerName: 'Abdul Karim',
    contactNo: '+8801711223344',
    dob: '1984-05-12',
    nid: '197845623412',
    passport: 'BA1234567',
    status: 'active',
    totalOrders: 45,
    totalAmount: 1250000,
    lastOrderDate: '2024-01-15',
    joinDate: '2023-01-15'
  },
  {
    id: 'VND-0002',
    tradeName: 'Nazmul Enterprise',
    tradeLocation: 'Chattogram',
    ownerName: 'Nazmul Hasan',
    contactNo: '+8801911334455',
    dob: '1990-08-21',
    nid: '199045623411',
    passport: 'EC7654321',
    status: 'active',
    totalOrders: 32,
    totalAmount: 890000,
    lastOrderDate: '2024-01-12',
    joinDate: '2023-03-20'
  },
  {
    id: 'VND-0003',
    tradeName: 'Green Line Supplies',
    tradeLocation: 'Sylhet',
    ownerName: 'Shahadat Hossain',
    contactNo: '+8801555667788',
    dob: '1988-12-01',
    nid: '188845623499',
    passport: 'ZP1122334',
    status: 'inactive',
    totalOrders: 18,
    totalAmount: 450000,
    lastOrderDate: '2023-12-20',
    joinDate: '2023-06-10'
  },
  {
    id: 'VND-0004',
    tradeName: 'City Hardware',
    tradeLocation: 'Khulna',
    ownerName: 'Rubel Mia',
    contactNo: '+8801311223344',
    dob: '1982-03-30',
    nid: '198245623477',
    passport: 'AA9988776',
    status: 'active',
    totalOrders: 67,
    totalAmount: 2100000,
    lastOrderDate: '2024-01-18',
    joinDate: '2022-11-05'
  },
  {
    id: 'VND-0005',
    tradeName: 'Delta Foods',
    tradeLocation: 'Rajshahi',
    ownerName: 'Sajid Khan',
    contactNo: '+8801811227788',
    dob: '1992-10-15',
    nid: '199245623401',
    passport: 'PK5566778',
    status: 'active',
    totalOrders: 28,
    totalAmount: 680000,
    lastOrderDate: '2024-01-14',
    joinDate: '2023-08-15'
  }
];

const VendorDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('totalAmount');

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const totalVendors = DEMO_VENDORS.length;
    const activeVendors = DEMO_VENDORS.filter(v => v.status === 'active').length;
    const totalOrders = DEMO_VENDORS.reduce((sum, v) => sum + v.totalOrders, 0);
    const totalAmount = DEMO_VENDORS.reduce((sum, v) => sum + v.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

    return {
      totalVendors,
      activeVendors,
      totalOrders,
      totalAmount,
      avgOrderValue
    };
  }, []);

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    let filtered = DEMO_VENDORS.filter(vendor => {
      const matchesSearch = vendor.tradeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vendor.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vendor.tradeLocation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort vendors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'totalAmount':
          return b.totalAmount - a.totalAmount;
        case 'totalOrders':
          return b.totalOrders - a.totalOrders;
        case 'tradeName':
          return a.tradeName.localeCompare(b.tradeName);
        case 'lastOrderDate':
          return new Date(b.lastOrderDate) - new Date(a.lastOrderDate);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, statusFilter, sortBy]);

  // Top performing vendors
  const topVendors = useMemo(() => {
    return DEMO_VENDORS
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <CardWidget
          title="Total Vendors"
          value={stats.totalVendors}
          icon={Building2}
          trend="+12%"
          trendValue="vs last month"
          trendType="up"
        />
        <CardWidget
          title="Active Vendors"
          value={stats.activeVendors}
          icon={Users}
          trend="+8%"
          trendValue="vs last month"
          trendType="up"
        />
        <CardWidget
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={Package}
          trend="+15%"
          trendValue="vs last month"
          trendType="up"
        />
        <CardWidget
          title="Total Revenue"
          value={`৳${(stats.totalAmount / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          trend="+22%"
          trendValue="vs last month"
          trendType="up"
        />
        <CardWidget
          title="Avg Order Value"
          value={`৳${stats.avgOrderValue.toLocaleString()}`}
          icon={TrendingUp}
          trend="+5%"
          trendValue="vs last month"
          trendType="up"
        />
      </div>

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
                    <option value="totalAmount">Sort by Revenue</option>
                    <option value="totalOrders">Sort by Orders</option>
                    <option value="tradeName">Sort by Name</option>
                    <option value="lastOrderDate">Sort by Last Order</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/vendors/${vendor.id}`}
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
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ৳{vendor.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {vendor.totalOrders} orders
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/vendors/${vendor.id}`}
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

        {/* Top Performers & Recent Activity */}
        <div className="space-y-6">
          {/* Top Performing Vendors */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Performers</h3>
            <div className="space-y-4">
              {topVendors.map((vendor, index) => (
                <div key={vendor.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                      index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                      'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{vendor.tradeName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{vendor.totalOrders} orders</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ৳{(vendor.totalAmount / 1000000).toFixed(1)}M
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
    </div>
  );
};

export default VendorDashboard;
