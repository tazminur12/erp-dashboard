import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plane,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  RefreshCw,
  Eye,
  Plus,
  Download,
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import SmallStat from '../../components/common/SmallStat';
import DataTable from '../../components/common/DataTable';
import { useTheme } from '../../contexts/ThemeContext';

const FlyOvalDashboard = () => {
  const { isDark } = useTheme();

  // Mock data - replace with actual API calls
  const [dashboardData, setDashboardData] = useState({
    totalAgents: 45,
    activeAgents: 38,
    totalTopUps: 1250,
    totalSales: 890,
    totalRevenue: 2500000,
    monthlyRevenue: 450000,
    pendingTransactions: 12,
    completedTransactions: 875
  });

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 1,
      type: 'TopUp',
      agentName: 'Ahmed Rahman',
      amount: 50000,
      date: '2024-01-15',
      status: 'Completed',
      reference: 'TXN-001'
    },
    {
      id: 2,
      type: 'Sell',
      agentName: 'Fatima Begum',
      amount: 25000,
      date: '2024-01-15',
      status: 'Pending',
      reference: 'TXN-002'
    },
    {
      id: 3,
      type: 'TopUp',
      agentName: 'Karim Uddin',
      amount: 75000,
      date: '2024-01-14',
      status: 'Completed',
      reference: 'TXN-003'
    },
    {
      id: 4,
      type: 'Sell',
      agentName: 'Rashida Khan',
      amount: 30000,
      date: '2024-01-14',
      status: 'Completed',
      reference: 'TXN-004'
    },
    {
      id: 5,
      type: 'TopUp',
      agentName: 'Mohammad Ali',
      amount: 40000,
      date: '2024-01-13',
      status: 'Failed',
      reference: 'TXN-005'
    }
  ]);

  const [topAgents, setTopAgents] = useState([
    { name: 'Ahmed Rahman', transactions: 145, revenue: 125000, rank: 1 },
    { name: 'Fatima Begum', transactions: 132, revenue: 98000, rank: 2 },
    { name: 'Karim Uddin', transactions: 128, revenue: 87000, rank: 3 },
    { name: 'Rashida Khan', transactions: 115, revenue: 76000, rank: 4 },
    { name: 'Mohammad Ali', transactions: 108, revenue: 65000, rank: 5 }
  ]);

  // Table columns for recent transactions
  const transactionColumns = [
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'TopUp' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'agentName',
      header: 'Agent',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Users className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          ৳{value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          'Completed': { color: 'green', icon: CheckCircle },
          'Pending': { color: 'yellow', icon: Clock },
          'Failed': { color: 'red', icon: XCircle }
        };
        const config = statusConfig[value] || statusConfig['Pending'];
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            config.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
            config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <Icon className="w-3 h-3" />
            <span>{value}</span>
          </span>
        );
      }
    }
  ];

  // Table columns for top agents
  const agentColumns = [
    {
      key: 'rank',
      header: 'Rank',
      sortable: true,
      render: (value) => (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          value === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
          value === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' :
          value === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {value}
        </div>
      )
    },
    {
      key: 'name',
      header: 'Agent Name',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
        </div>
      )
    },
    {
      key: 'transactions',
      header: 'Transactions',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {value}
        </span>
      )
    },
    {
      key: 'revenue',
      header: 'Revenue',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ৳{value.toLocaleString()}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Fly Oval Limited Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Overview of Fly Oval Limited operations and performance
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label="Total Agents"
          value={dashboardData.totalAgents.toString()}
          icon={Users}
          color="blue"
        />
        <SmallStat
          label="Active Agents"
          value={dashboardData.activeAgents.toString()}
          icon={Activity}
          color="green"
        />
        <SmallStat
          label="Total Revenue"
          value={`৳${dashboardData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
        <SmallStat
          label="Monthly Revenue"
          value={`৳${dashboardData.monthlyRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="yellow"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label="Total TopUps"
          value={dashboardData.totalTopUps.toString()}
          icon={TrendingUp}
          color="green"
        />
        <SmallStat
          label="Total Sales"
          value={dashboardData.totalSales.toString()}
          icon={TrendingDown}
          color="red"
        />
        <SmallStat
          label="Pending Transactions"
          value={dashboardData.pendingTransactions.toString()}
          icon={Clock}
          color="yellow"
        />
        <SmallStat
          label="Completed Transactions"
          value={dashboardData.completedTransactions.toString()}
          icon={CheckCircle}
          color="blue"
        />
      </div>

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</span>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Revenue chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Transaction Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Distribution</h3>
            <div className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">This month</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">TopUp Transactions</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {dashboardData.totalTopUps} ({Math.round((dashboardData.totalTopUps / (dashboardData.totalTopUps + dashboardData.totalSales)) * 100)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Sell Transactions</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {dashboardData.totalSales} ({Math.round((dashboardData.totalSales / (dashboardData.totalTopUps + dashboardData.totalSales)) * 100)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
              View All
            </button>
          </div>
        </div>
        <div className="p-6">
          <DataTable
            data={recentTransactions}
            columns={transactionColumns}
            searchable={false}
            exportable={false}
            actions={false}
            pageSize={5}
          />
        </div>
      </div>

      {/* Top Agents */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Agents</h3>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
              View All Agents
            </button>
          </div>
        </div>
        <div className="p-6">
          <DataTable
            data={topAgents}
            columns={agentColumns}
            searchable={false}
            exportable={false}
            actions={false}
            pageSize={5}
          />
        </div>
      </div>
    </div>
  );
};

export default FlyOvalDashboard;
