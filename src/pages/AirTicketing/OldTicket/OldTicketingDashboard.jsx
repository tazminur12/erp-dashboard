import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  History,
  CheckCircle,
  XCircle,
  Clock,
  Plane,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  Plus,
  FileCheck,
  RotateCcw
} from 'lucide-react';

const OldTicketingDashboard = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('all'); // 'today', 'week', 'month', 'all'

  // Mock data - Replace with actual API data
  const dashboardData = {
    summary: {
      totalCompleted: 156,
      totalRevenue: 2450000,
      totalProfit: 185000,
      averageProfit: 1186,
      totalPending: 12,
      totalFailed: 8
    },
    recentCompleted: [
      {
        id: 1,
        passengerName: 'মোহাম্মদ রহিম',
        airlineName: 'Biman Bangladesh',
        pnr: 'ABC123',
        oldDate: '2024-01-15',
        newDate: '2024-02-15',
        vendorAmount: 15000,
        totalAmount: 18000,
        profit: 3000,
        completedDate: '2024-01-12 10:30 AM'
      },
      {
        id: 2,
        passengerName: 'Fatema Khatun',
        airlineName: 'US-Bangla Airlines',
        pnr: 'XYZ789',
        oldDate: '2024-01-20',
        newDate: '2024-03-20',
        vendorAmount: 12000,
        totalAmount: 14500,
        profit: 2500,
        completedDate: '2024-01-11 02:15 PM'
      },
      {
        id: 3,
        passengerName: 'Karim Ahmed',
        airlineName: 'Emirates',
        pnr: 'EMI456',
        oldDate: '2024-01-18',
        newDate: '2024-02-28',
        vendorAmount: 25000,
        totalAmount: 28000,
        profit: 3000,
        completedDate: '2024-01-10 09:45 AM'
      },
      {
        id: 4,
        passengerName: 'Ayesha Begum',
        airlineName: 'Qatar Airways',
        pnr: 'QTR789',
        oldDate: '2024-01-22',
        newDate: '2024-03-15',
        vendorAmount: 30000,
        totalAmount: 35000,
        profit: 5000,
        completedDate: '2024-01-09 04:20 PM'
      },
      {
        id: 5,
        passengerName: 'Sabbir Hossain',
        airlineName: 'Fly Dubai',
        pnr: 'FLY321',
        oldDate: '2024-01-25',
        newDate: '2024-02-20',
        vendorAmount: 18000,
        totalAmount: 21000,
        profit: 3000,
        completedDate: '2024-01-08 11:00 AM'
      }
    ],
    airlineBreakdown: [
      { airline: 'Biman Bangladesh', count: 45, revenue: 810000, profit: 67500 },
      { airline: 'Emirates', count: 32, revenue: 896000, profit: 96000 },
      { airline: 'Qatar Airways', count: 28, revenue: 980000, profit: 140000 },
      { airline: 'US-Bangla Airlines', count: 25, revenue: 362500, profit: 62500 },
      { airline: 'Fly Dubai', count: 18, revenue: 378000, profit: 54000 },
      { airline: 'Others', count: 8, revenue: 168000, profit: 24000 }
    ],
    monthlyTrend: [
      { month: 'Dec 2023', completed: 42, revenue: 756000 },
      { month: 'Jan 2024', completed: 156, revenue: 2808000 }
    ]
  };

  const stats = [
    {
      title: 'Total Completed',
      value: dashboardData.summary.totalCompleted,
      icon: CheckCircle,
      accent: 'green',
      sub: 'Successfully completed services'
    },
    {
      title: 'Total Revenue',
      value: `৳${(dashboardData.summary.totalRevenue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      accent: 'blue',
      sub: `From ${dashboardData.summary.totalCompleted} services`
    },
    {
      title: 'Total Profit',
      value: `৳${(dashboardData.summary.totalProfit / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      accent: 'purple',
      sub: `Avg: ৳${dashboardData.summary.averageProfit.toLocaleString()}`
    },
    {
      title: 'Pending Services',
      value: dashboardData.summary.totalPending,
      icon: Clock,
      accent: 'amber',
      sub: 'Awaiting completion'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `৳${amount.toLocaleString()}`;
  };

  return (
    <>
      <Helmet>
        <title>Old Ticketing Service Dashboard - Bin Rashid ERP</title>
      </Helmet>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Old Ticketing Service Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Completed services summary and analytics
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/air-ticketing/old/ticket-check')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              Ticket Check
            </button>
            <button 
              onClick={() => navigate('/air-ticketing/old/ticket-reissue')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Reissue
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  {stat.sub && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.sub}</p>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                  stat.accent === 'green' ? 'from-emerald-500 to-green-500' :
                  stat.accent === 'blue' ? 'from-blue-500 to-indigo-500' :
                  stat.accent === 'purple' ? 'from-purple-500 to-pink-500' :
                  'from-amber-500 to-orange-500'
                } flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Completed Services - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Completed Services</h3>
                </div>
                <button 
                  onClick={() => navigate('/air-ticketing/old/ticket-check')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View All
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                {dashboardData.recentCompleted.map((service) => (
                  <div 
                    key={service.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {service.passengerName}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Airlines: </span>
                            <span className="text-gray-900 dark:text-white">{service.airlineName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">PNR: </span>
                            <span className="text-gray-900 dark:text-white font-mono">{service.pnr}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Old Date: </span>
                            <span className="text-gray-900 dark:text-white">{formatDate(service.oldDate)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">New Date: </span>
                            <span className="text-gray-900 dark:text-white">{formatDate(service.newDate)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Completed: {service.completedDate}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-sm">
                          <div className="text-gray-500 dark:text-gray-400 text-xs">Total</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(service.totalAmount)}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs">
                          <ArrowUpRight className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {formatCurrency(service.profit)} profit
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4">
            {/* Airline Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Airline Breakdown</h3>
              </div>
              
              <div className="space-y-3">
                {dashboardData.airlineBreakdown.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{item.airline}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Revenue: {formatCurrency(item.revenue)}</span>
                      <span className="text-green-600 dark:text-green-400">
                        +{formatCurrency(item.profit)}
                      </span>
                    </div>
                    {index < dashboardData.airlineBreakdown.length - 1 && (
                      <div className="border-b border-gray-200 dark:border-gray-700 mt-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/air-ticketing/old/ticket-reissue')}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm font-medium">New Ticket Reissue</span>
                </button>
                
                <button
                  onClick={() => navigate('/air-ticketing/old/ticket-check')}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <FileCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Check Ticket Status</span>
                </button>
              </div>
            </div>

            {/* Summary Info */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-semibold">Performance</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-indigo-100">Success Rate</span>
                  <span className="font-semibold">95.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-100">Avg. Processing Time</span>
                  <span className="font-semibold">2.5 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-100">Customer Satisfaction</span>
                  <span className="font-semibold">4.8/5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OldTicketingDashboard;
