import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  Target,
  RefreshCw,
  FileText,
  Printer,
  Share2,
  Eye,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import SmallStat from '../../components/common/SmallStat';
import { useTheme } from '../../contexts/ThemeContext';

const Reports = () => {
  const { isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('summary');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [reportData, setReportData] = useState({
    summary: {
      totalRevenue: 2500000,
      totalTopUps: 1250,
      totalSales: 890,
      totalCommission: 125000,
      activeAgents: 38,
      successRate: 85.5,
      averageTransaction: 2800,
      growthRate: 12.5
    },
    agentPerformance: [
      { name: 'Ahmed Rahman', transactions: 145, revenue: 125000, commission: 6250, rank: 1 },
      { name: 'Fatima Begum', transactions: 132, revenue: 98000, commission: 4900, rank: 2 },
      { name: 'Karim Uddin', transactions: 128, revenue: 87000, commission: 4350, rank: 3 },
      { name: 'Rashida Khan', transactions: 115, revenue: 76000, commission: 3800, rank: 4 },
      { name: 'Mohammad Ali', transactions: 108, revenue: 65000, commission: 3250, rank: 5 }
    ],
    monthlyTrend: [
      { month: 'Jan', revenue: 450000, transactions: 890, topUps: 1250 },
      { month: 'Feb', revenue: 520000, transactions: 920, topUps: 1180 },
      { month: 'Mar', revenue: 480000, transactions: 850, topUps: 1320 },
      { month: 'Apr', revenue: 550000, transactions: 980, topUps: 1450 },
      { month: 'May', revenue: 600000, transactions: 1050, topUps: 1580 },
      { month: 'Jun', revenue: 650000, transactions: 1120, topUps: 1620 }
    ],
    productBreakdown: [
      { product: 'Air Tickets', revenue: 1200000, percentage: 48, transactions: 450 },
      { product: 'Visa Services', revenue: 800000, percentage: 32, transactions: 280 },
      { product: 'Hajj Packages', revenue: 350000, percentage: 14, transactions: 120 },
      { product: 'Umrah Packages', revenue: 150000, percentage: 6, transactions: 40 }
    ],
    statusBreakdown: [
      { status: 'Completed', count: 890, percentage: 85.5, color: 'green' },
      { status: 'Pending', count: 120, percentage: 11.5, color: 'yellow' },
      { status: 'Failed', count: 30, percentage: 3.0, color: 'red' }
    ]
  });

  const reportTypes = [
    { id: 'summary', name: 'Summary Report', icon: BarChart3, description: 'Overall performance overview' },
    { id: 'agent', name: 'Agent Performance', icon: Users, description: 'Individual agent statistics' },
    { id: 'financial', name: 'Financial Report', icon: DollarSign, description: 'Revenue and commission analysis' },
    { id: 'transaction', name: 'Transaction Report', icon: Activity, description: 'Transaction details and trends' },
    { id: 'product', name: 'Product Analysis', icon: PieChart, description: 'Product-wise performance' }
  ];

  const periods = [
    { id: 'week', name: 'Last Week' },
    { id: 'month', name: 'Last Month' },
    { id: 'quarter', name: 'Last Quarter' },
    { id: 'year', name: 'Last Year' },
    { id: 'custom', name: 'Custom Range' }
  ];

  const handleGenerateReport = () => {
    setLoading(true);
    // Simulate report generation
    setTimeout(() => {
      setLoading(false);
      // In real implementation, this would generate and download the report
    }, 2000);
  };

  const handleExportReport = (format) => {
    // Simulate export functionality
    console.log(`Exporting report as ${format}`);
  };

  const renderSummaryReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label="Total Revenue"
          value={`৳${reportData.summary.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <SmallStat
          label="Total Transactions"
          value={reportData.summary.totalSales.toString()}
          icon={Activity}
          color="blue"
        />
        <SmallStat
          label="Success Rate"
          value={`${reportData.summary.successRate}%`}
          icon={CheckCircle}
          color="green"
        />
        <SmallStat
          label="Growth Rate"
          value={`${reportData.summary.growthRate}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat
          label="Total TopUps"
          value={reportData.summary.totalTopUps.toString()}
          icon={ArrowUpCircle}
          color="blue"
        />
        <SmallStat
          label="Total Commission"
          value={`৳${reportData.summary.totalCommission.toLocaleString()}`}
          icon={Target}
          color="purple"
        />
        <SmallStat
          label="Active Agents"
          value={reportData.summary.activeAgents.toString()}
          icon={Users}
          color="yellow"
        />
        <SmallStat
          label="Avg Transaction"
          value={`৳${reportData.summary.averageTransaction.toLocaleString()}`}
          icon={BarChart3}
          color="red"
        />
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Revenue trend chart</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction Status</h3>
          <div className="space-y-4">
            {reportData.statusBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    item.color === 'green' ? 'bg-green-500' :
                    item.color === 'yellow' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.status}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.count}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAgentReport = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Performance Ranking</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {reportData.agentPerformance.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    agent.rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    agent.rank === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300' :
                    agent.rank === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {agent.rank}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{agent.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{agent.transactions} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    ৳{agent.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ৳{agent.commission.toLocaleString()} commission
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductReport = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Performance</h3>
        <div className="space-y-4">
          {reportData.productBreakdown.map((product, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{product.product}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  ৳{product.revenue.toLocaleString()} ({product.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${product.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{product.transactions} transactions</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'summary':
        return renderSummaryReport();
      case 'agent':
        return renderAgentReport();
      case 'product':
        return renderProductReport();
      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Report Not Available</h3>
            <p className="text-gray-500 dark:text-gray-400">This report type is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate comprehensive reports and analytics for Fly Oval Limited
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-6">
          {/* Report Type Selection */}
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`p-3 rounded-lg border text-left transition-colors duration-200 ${
                    selectedReport === report.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <report.icon className={`w-4 h-4 ${
                      selectedReport === report.id 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      selectedReport === report.id 
                        ? 'text-blue-900 dark:text-blue-300' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {report.name}
                    </span>
                  </div>
                  <p className={`text-xs ${
                    selectedReport === report.id 
                      ? 'text-blue-700 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {report.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Period Selection */}
          <div className="flex flex-col space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>{period.name}</option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4" />
              )}
              <span>{loading ? 'Generating...' : 'Generate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Export Options</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Download report in various formats</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExportReport('PDF')}
              className="px-3 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
            >
              PDF
            </button>
            <button
              onClick={() => handleExportReport('Excel')}
              className="px-3 py-2 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-sm"
            >
              Excel
            </button>
            <button
              onClick={() => handleExportReport('CSV')}
              className="px-3 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm"
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReportContent()}

      {/* Report Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Generated on {new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Data refreshed every hour</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
