import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import SmallStat from '../../components/common/SmallStat';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoanDashboard = () => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGiving: 0,
    totalReceiving: 0,
    activeLoans: 0,
    overdueLoans: 0,
    completedLoans: 0,
    totalInterest: 0,
    monthlyGiving: 0,
    monthlyReceiving: 0
  });

  // Mock data for demonstration
  const mockStats = {
    totalGiving: 250000,
    totalReceiving: 150000,
    activeLoans: 8,
    overdueLoans: 2,
    completedLoans: 12,
    totalInterest: 45000,
    monthlyGiving: 50000,
    monthlyReceiving: 30000
  };

  const recentLoans = [
    {
      id: 1,
      type: 'giving',
      borrowerName: 'John Doe',
      amount: 50000,
      status: 'active',
      date: '2024-01-15',
      businessName: 'ABC Trading'
    },
    {
      id: 2,
      type: 'receiving',
      lenderName: 'XYZ Bank',
      amount: 100000,
      status: 'active',
      date: '2024-02-01',
      businessName: 'My Business'
    },
    {
      id: 3,
      type: 'giving',
      borrowerName: 'Jane Smith',
      amount: 25000,
      status: 'completed',
      date: '2024-01-10',
      businessName: 'Smith Enterprises'
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setStats(mockStats);
        setLoading(false);
      }, 1000);
      
      // Uncomment when API is ready
      // const response = await axiosSecure.get('/loans/dashboard');
      // if (response.data.success) {
      //   setStats(response.data.data);
      // }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(mockStats); // Fallback to mock data
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-BD');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleViewLoan = (loan) => {
    navigate(`/loan/details/${loan.id}`, { state: { loan } });
  };

  const handleNewLoan = (type) => {
    navigate(`/loan/new-${type}`);
  };

  const handleViewAllLoans = () => {
    navigate('/loan/list');
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                  Loan Dashboard
                </h1>
                <p className={`mt-1 text-lg transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Overview of your loan portfolio
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleViewAllLoans}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                <Eye className="w-4 h-4" />
                View All Loans
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => handleNewLoan('receiving')}
            className="flex items-center justify-between p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold">New Loan Receiving</h3>
                <p className="text-green-100">Receive money from lenders</p>
              </div>
            </div>
            <ArrowUpRight className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => handleNewLoan('giving')}
            className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold">New Loan Giving</h3>
                <p className="text-blue-100">Lend money to borrowers</p>
              </div>
            </div>
            <ArrowDownRight className="w-6 h-6" />
          </button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SmallStat
            label="Total Loan Giving"
            value={formatCurrency(stats.totalGiving)}
            icon={TrendingDown}
            color="blue"
          />
          <SmallStat
            label="Total Loan Receiving"
            value={formatCurrency(stats.totalReceiving)}
            icon={TrendingUp}
            color="green"
          />
          <SmallStat
            label="Active Loans"
            value={stats.activeLoans}
            icon={Activity}
            color="purple"
          />
          <SmallStat
            label="Overdue Loans"
            value={stats.overdueLoans}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SmallStat
            label="Completed Loans"
            value={stats.completedLoans}
            icon={CheckCircle}
            color="green"
          />
          <SmallStat
            label="Total Interest"
            value={formatCurrency(stats.totalInterest)}
            icon={DollarSign}
            color="yellow"
          />
          <SmallStat
            label="Monthly Giving"
            value={formatCurrency(stats.monthlyGiving)}
            icon={Calendar}
            color="blue"
          />
          <SmallStat
            label="Monthly Receiving"
            value={formatCurrency(stats.monthlyReceiving)}
            icon={Calendar}
            color="green"
          />
        </div>

        {/* Charts and Recent Loans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Loan Type Distribution */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 p-6 ${
            isDark ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Loan Type Distribution
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Loan Giving
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatCurrency(stats.totalGiving)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Loan Receiving
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatCurrency(stats.totalReceiving)}
                </span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                    style={{ 
                      width: `${(stats.totalGiving / (stats.totalGiving + stats.totalReceiving)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Loans */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 p-6 ${
            isDark ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className={`text-xl font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Recent Loans
                </h3>
              </div>
              <button
                onClick={handleViewAllLoans}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentLoans.map((loan) => (
                <div
                  key={loan.id}
                  className={`p-4 rounded-xl border transition-colors duration-200 hover:shadow-md cursor-pointer ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                      : 'bg-gray-50 border-gray-200 hover:bg-white'
                  }`}
                  onClick={() => handleViewLoan(loan)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {loan.type === 'giving' ? (
                        <TrendingDown className="w-4 h-4 text-blue-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {loan.type === 'giving' ? loan.borrowerName : loan.lenderName}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                      {getStatusIcon(loan.status)}
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {loan.businessName}
                    </span>
                    <span className={`text-sm font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCurrency(loan.amount)}
                    </span>
                  </div>
                  <div className={`text-xs mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {formatDate(loan.date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Loan Status Overview */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 p-6 mt-8 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Loan Status Overview
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className={`text-2xl font-bold mb-1 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.activeLoans}
              </h4>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Active Loans
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className={`text-2xl font-bold mb-1 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.completedLoans}
              </h4>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Completed Loans
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h4 className={`text-2xl font-bold mb-1 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.overdueLoans}
              </h4>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Overdue Loans
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDashboard;
