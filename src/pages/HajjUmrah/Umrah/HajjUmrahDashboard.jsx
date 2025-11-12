import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  MapPin,
  Plane,
  Building,
  UserCheck,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  List,
  Loader
} from 'lucide-react';
// useCustomerQueries hook removed - functionality disabled

const HajjUmrahDashboard = () => {
  // Customer data removed - using empty array
  const customers = [];
  const isLoading = false;
  const error = null;
  
  // Calculate real statistics from customer data
  const calculateStats = () => {
    const hajjCustomers = customers.filter(customer => 
      customer.customerType && customer.customerType.toLowerCase() === 'hajj'
    );
    const umrahCustomers = customers.filter(customer => 
      customer.customerType && customer.customerType.toLowerCase() === 'umrah'
    );
    const activeCustomers = customers.filter(customer => 
      customer.status === 'active' || customer.status === 'confirmed'
    );
    const paidCustomers = customers.filter(customer => 
      customer.paymentStatus === 'paid'
    );
    
    const totalRevenue = customers.reduce((sum, customer) => 
      sum + (customer.paidAmount || 0), 0
    );
    
    const pendingPayments = customers.reduce((sum, customer) => 
      sum + ((customer.totalAmount || 0) - (customer.paidAmount || 0)), 0
    );
    
    return {
      totalCustomers: customers.length,
      hajjCustomers: hajjCustomers.length,
      umrahCustomers: umrahCustomers.length,
      activeCustomers: activeCustomers.length,
      paidCustomers: paidCustomers.length,
      totalRevenue,
      pendingPayments
    };
  };
  
  const stats = calculateStats();
  
  // Generate recent bookings from real customer data
  const getRecentBookings = () => {
    return customers.slice(0, 5).map((customer, index) => ({
      id: customer.id || index + 1,
      customerName: customer.name || 'N/A',
      packageName: customer.packageInfo?.packageName || `${customer.customerType || 'Service'} Package`,
      amount: customer.totalAmount || 0,
      status: customer.status || 'pending',
      date: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
    }));
  };

  // Generate package performance from real customer data
  const getPackagePerformance = () => {
    const hajjCustomers = customers.filter(customer => 
      customer.customerType && customer.customerType.toLowerCase() === 'hajj'
    );
    const umrahCustomers = customers.filter(customer => 
      customer.customerType && customer.customerType.toLowerCase() === 'umrah'
    );
    const otherCustomers = customers.filter(customer => 
      !customer.customerType || 
      (customer.customerType.toLowerCase() !== 'hajj' && customer.customerType.toLowerCase() !== 'umrah')
    );

    return [
      {
        id: 1,
        name: 'Hajj Packages',
        bookings: hajjCustomers.length,
        capacity: 100,
        revenue: hajjCustomers.reduce((sum, customer) => sum + (customer.totalAmount || 0), 0),
        status: 'Active'
      },
      {
        id: 2,
        name: 'Umrah Packages',
        bookings: umrahCustomers.length,
        capacity: 150,
        revenue: umrahCustomers.reduce((sum, customer) => sum + (customer.totalAmount || 0), 0),
        status: 'Active'
      },
      {
        id: 3,
        name: 'Other Services',
        bookings: otherCustomers.length,
        capacity: 80,
        revenue: otherCustomers.reduce((sum, customer) => sum + (customer.totalAmount || 0), 0),
        status: 'Active'
      }
    ];
  };

  const [dashboardData, setDashboardData] = useState({
    // Overview Stats - Now using real data
    totalAgents: 45, // Keep mock data for agents
    activePackages: 12, // Keep mock data for packages
    totalBookings: stats.totalCustomers,
    totalRevenue: stats.totalRevenue,
    
    
    // Agent Performance
    topAgents: [
      {
        id: 1,
        name: 'Green Line Supplies',
        location: 'Sylhet',
        bookings: 45,
        revenue: 8925000,
        rating: 4.8
      },
      {
        id: 2,
        name: 'Nazmul Enterprise',
        location: 'Chattogram',
        bookings: 38,
        revenue: 7230000,
        rating: 4.6
      },
      {
        id: 3,
        name: 'Miraj Traders',
        location: 'Dhaka',
        bookings: 32,
        revenue: 6120000,
        rating: 4.5
      }
    ]
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bn-BD');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'Active':
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
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message || 'Failed to load dashboard data. Please try again.'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              হজ্জ ও উমরাহ ড্যাশবোর্ড
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              সামগ্রিক ব্যবস্থাপনা ও পরিসংখ্যান
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Link
            to="/hajj-umrah/package-creation"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">নতুন প্যাকেজ</span>
          </Link>
          <Link
            to="/hajj-umrah/agent/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">নতুন এজেন্ট</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট গ্রাহক</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400">+12%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">গত মাস থেকে</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">হজ্জ গ্রাহক</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.hajjCustomers}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400">+8%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">গত মাস থেকে</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">উমরাহ গ্রাহক</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.umrahCustomers}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400">+15%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">গত মাস থেকে</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট আয়</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400">+22%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">গত মাস থেকে</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-600" />
              সাম্প্রতিক বুকিং
            </h2>
            <Link
              to="/hajj-umrah/package-list"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
            >
              সব দেখুন
              <Eye className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {getRecentBookings().map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{booking.customerName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{booking.packageName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(booking.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(booking.amount)}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-1 capitalize">{booking.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            দ্রুত অ্যাকশন
          </h2>
          
          <div className="space-y-3">
            <Link
              to="/hajj-umrah/agent"
              className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-blue-700 dark:text-blue-300 font-medium">এজেন্ট তালিকা</span>
            </Link>
            
            <Link
              to="/hajj-umrah/package-list"
              className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
              <span className="text-purple-700 dark:text-purple-300 font-medium">প্যাকেজ তালিকা</span>
            </Link>
            
            <Link
              to="/hajj-umrah/agent/add"
              className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Plus className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-green-700 dark:text-green-300 font-medium">নতুন এজেন্ট</span>
            </Link>
            
            <Link
              to="/hajj-umrah/package-creation"
              className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <Plus className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3" />
              <span className="text-orange-700 dark:text-orange-300 font-medium">নতুন প্যাকেজ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Package Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-purple-600" />
          প্যাকেজ পারফরমেন্স
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  প্যাকেজ নাম
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  বুকিং
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  আয়
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  স্ট্যাটাস
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {getPackagePerformance().map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-3">
                        <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {pkg.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {pkg.bookings}/{pkg.capacity} যাত্রী
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(pkg.bookings / pkg.capacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {Math.round((pkg.bookings / pkg.capacity) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(pkg.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to="/hajj-umrah/package-list"
                      className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Agents */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Star className="w-5 h-5 mr-2 text-purple-600" />
          শীর্ষ এজেন্ট
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardData.topAgents.map((agent, index) => (
            <div key={agent.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {agent.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 text-sm font-medium">{agent.rating}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">বুকিং</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{agent.bookings}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">আয়</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(agent.revenue)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HajjUmrahDashboard;
