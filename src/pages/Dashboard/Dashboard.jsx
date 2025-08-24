import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CreditCard, 
  Building2, 
  Building, 
  Plane, 
  Home, 
  Globe,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
  Sun,
  Moon,
  User
} from 'lucide-react';
import CardWidget from '../../components/common/CardWidget';
import SmallStat from '../../components/common/SmallStat';
import { dashboardStats, recentActivities, quickActions } from '../../lib/mock';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrentUser, getUserEmail } from '../../firebase';

const Dashboard = () => {
  const { isDark, toggleTheme } = useTheme();
  const [userEmail, setUserEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setIsLoggedIn(true);
      setUserEmail(currentUser.email || getUserEmail() || '');
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            আপনার ব্যবসার সামগ্রিক অবস্থা দেখুন
          </p>
          {/* User Email Display */}
          {isLoggedIn && userEmail && (
            <div className="mt-2 flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Logged in as: {userEmail}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 mr-2" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 mr-2" />
                Dark Mode
              </>
            )}
          </button>

          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Quick Add
          </button>
        </div>
      </div>

      {/* All Stats in One Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {/* Main Stats */}
        <div className="lg:col-span-2">
          <CardWidget
            title="মোট গ্রাহক"
            value={dashboardStats.totalCustomers.toLocaleString('bn-BD')}
            icon={Users}
            trend="+12%"
            trendValue="গত মাসে"
            trendType="up"
          />
        </div>
        
        <div className="lg:col-span-2">
          <CardWidget
            title="মোট ডেবিট"
            value={`৳${dashboardStats.totalDebit.toLocaleString('bn-BD')}`}
            icon={TrendingDown}
            trend="+8%"
            trendValue="গত মাসে"
            trendType="up"
          />
        </div>
        
        <div className="lg:col-span-2">
          <CardWidget
            title="মোট ক্রেডিট"
            value={`৳${dashboardStats.totalCredit.toLocaleString('bn-BD')}`}
            icon={TrendingUp}
            trend="+15%"
            trendValue="গত মাসে"
            trendType="up"
          />
        </div>
        
        <div className="lg:col-span-2">
          <CardWidget
            title="ভেন্ডর বকেয়া"
            value={`৳${dashboardStats.vendorPaymentsDue.toLocaleString('bn-BD')}`}
            icon={Building2}
            trend="-5%"
            trendValue="গত মাসে"
            trendType="down"
          />
        </div>

        {/* Secondary Stats */}
        <div className="xl:col-span-2">
          <SmallStat
            label="হজ্জ এজেন্ট"
            value={dashboardStats.hajjUmrahAgents}
            icon={Building}
            color="purple"
          />
        </div>
        
        <div className="xl:col-span-2">
          <SmallStat
            label="টিকিট বিক্রি"
            value={dashboardStats.ticketsSold}
            icon={Plane}
            color="blue"
          />
        </div>
        
        <div className="xl:col-span-2">
          <SmallStat
            label="অফিস খরচ"
            value={`৳${dashboardStats.officeExpenses.toLocaleString('bn-BD')}`}
            icon={Home}
            color="red"
          />
        </div>
        
        <div className="xl:col-span-2">
          <SmallStat
            label="এক্সচেঞ্জ রেট"
            value={dashboardStats.exchangeRate}
            icon={Globe}
            color="green"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activities - Takes 2 columns on large screens */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                সাম্প্রতিক কার্যক্রম
              </h3>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/activities"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  সব কার্যক্রম দেখুন →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Takes 1 column on large screens */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                দ্রুত কার্যক্রম
              </h3>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {action.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              সাম্প্রতিক লেনদেন
            </h3>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    আহমেদ হোসেন
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    টিকিট কেনা
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    -৳১৫,০০০
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ২ ঘণ্টা আগে
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ফাতেমা বেগম
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    পেমেন্ট
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    +৳৮,০০০
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ৪ ঘণ্টা আগে
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              সিস্টেম অবস্থা
            </h3>
          </div>
          
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ডাটাবেস
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Online
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  API সার্ভার
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Online
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ব্যাকআপ
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
