import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Activity, 
  AlertTriangle,
  Milk,
  Package,
  DollarSign,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Trash2,
  Camera,
  Heart,
  Baby,
  Utensils,
  FileText,
  Building,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CattleDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCows: 0,
    totalMilkProduction: 0,
    feedStock: 0,
    sickCattle: 0,
    upcomingVaccinations: 0,
    monthlyExpense: 0,
    monthlyIncome: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Load dashboard data
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Mock data - replace with actual API calls
    setStats({
      totalCows: 45,
      totalMilkProduction: 1250, // liters
      feedStock: 85, // percentage
      sickCattle: 3,
      upcomingVaccinations: 8,
      monthlyExpense: 45000,
      monthlyIncome: 75000
    });

    setRecentActivities([
      { id: 1, type: 'milk', message: 'গরু #001 থেকে 25 লিটার দুধ উৎপাদন', time: '2 hours ago', icon: Milk },
      { id: 2, type: 'health', message: 'গরু #015 এর স্বাস্থ্য পরীক্ষা সম্পন্ন', time: '4 hours ago', icon: Heart },
      { id: 3, type: 'feed', message: 'খাদ্য সরবরাহ - 50 কেজি ঘাস', time: '6 hours ago', icon: Utensils },
      { id: 4, type: 'breeding', message: 'গরু #008 এর প্রজনন রেকর্ড আপডেট', time: '1 day ago', icon: Baby }
    ]);
  };

  const quickActions = [
    { 
      title: 'নতুন গরু যোগ করুন', 
      icon: Plus, 
      color: 'bg-blue-500', 
      action: () => navigate('/miraj-industries/cattle/add')
    },
    { 
      title: 'দুধ উৎপাদন রেকর্ড', 
      icon: Milk, 
      color: 'bg-green-500', 
      action: () => navigate('/miraj-industries/milk-production')
    },
    { 
      title: 'খাদ্য ব্যবস্থাপনা', 
      icon: Utensils, 
      color: 'bg-orange-500', 
      action: () => navigate('/miraj-industries/feed-management')
    },
    { 
      title: 'স্বাস্থ্য রেকর্ড', 
      icon: Heart, 
      color: 'bg-red-500', 
      action: () => navigate('/miraj-industries/health-records')
    },
    { 
      title: 'প্রজনন রেকর্ড', 
      icon: Baby, 
      color: 'bg-purple-500', 
      action: () => navigate('/miraj-industries/breeding-records')
    },
    { 
      title: 'খরচ আয় রিপোর্ট', 
      icon: BarChart3, 
      color: 'bg-indigo-500', 
      action: () => navigate('/miraj-industries/financial-report')
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Professional Cow Images Gallery - 3 Pictures Side by Side */}
      <div className="relative bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl overflow-hidden shadow-xl">
        <div className="w-full flex items-center justify-center p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {/* Cow 1 */}
            <div className="relative">
              <img 
                src="/Picture/cow1.jpg" 
                alt="গবাদি পশু ১" 
                className="w-full h-48 object-cover rounded-2xl shadow-xl border-4 border-white"
              />
              <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-lg shadow-lg">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span className="font-semibold text-xs">স্বাস্থ্যকর</span>
                </div>
              </div>
            </div>
            
            {/* Cow 2 */}
            <div className="relative">
              <img 
                src="/Picture/cow2.jpg" 
                alt="গবাদি পশু ২" 
                className="w-full h-48 object-cover rounded-2xl shadow-xl border-4 border-white"
              />
              <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-lg shadow-lg">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span className="font-semibold text-xs">স্বাস্থ্যকর</span>
                </div>
              </div>
            </div>
            
            {/* Cow 3 */}
            <div className="relative">
              <img 
                src="/Picture/cow3.jpg" 
                alt="গবাদি পশু ৩" 
                className="w-full h-48 object-cover rounded-2xl shadow-xl border-4 border-white"
              />
              <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-lg shadow-lg">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span className="font-semibold text-xs">স্বাস্থ্যকর</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মোট গরু</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCows}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+2 এই মাসে</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">আজকের দুধ উৎপাদন</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMilkProduction} লিটার</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Milk className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+5% গতকাল থেকে</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">খাদ্য স্টক</p>
              <p className="text-2xl font-bold text-gray-900">{stats.feedStock}%</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-orange-600">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span>নিম্ন স্টক সতর্কতা</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">অসুস্থ গরু</p>
              <p className="text-2xl font-bold text-red-600">{stats.sickCattle}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <Heart className="w-4 h-4 mr-1" />
            <span>চিকিৎসা প্রয়োজন</span>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">মাসিক আয়-খরচ</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">মোট আয়</span>
              <span className="text-green-600 font-semibold">৳{stats.monthlyIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">মোট খরচ</span>
              <span className="text-red-600 font-semibold">৳{stats.monthlyExpense.toLocaleString()}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">নিট লাভ</span>
                <span className="text-blue-600 font-bold">৳{(stats.monthlyIncome - stats.monthlyExpense).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">আসন্ন কার্যক্রম</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">আগামী সপ্তাহে {stats.upcomingVaccinations}টি টিকা</span>
            </div>
            <div className="flex items-center gap-3">
              <Baby className="w-5 h-5 text-purple-500" />
              <span className="text-gray-700">২টি গরুর বাচ্চা প্রসবের তারিখ আসন্ন</span>
            </div>
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-orange-500" />
              <span className="text-gray-700">খাদ্য সরবরাহের সময়</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions with Featured Image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">দ্রুত কার্যক্রম</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex flex-col items-center gap-2`}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-sm font-medium text-center">{action.title}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Featured Cow Image Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative">
            <img 
              src="/Picture/cow1.jpg" 
              alt="খামারের গরু" 
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h4 className="font-semibold text-lg">আমাদের খামার</h4>
              <p className="text-sm opacity-90">স্বাস্থ্যকর গবাদি পশু</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">মোট গরু</span>
              <span className="font-bold text-green-600">{stats.totalCows}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">দুধ উৎপাদন</span>
              <span className="font-bold text-blue-600">{stats.totalMilkProduction} লিটার</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">স্বাস্থ্য অবস্থা</span>
              <span className="flex items-center gap-1 text-green-600">
                <Heart className="w-4 h-4" />
                <span className="font-semibold">ভাল</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">সাম্প্রতিক কার্যক্রম</h3>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <activity.icon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900">{activity.message}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CattleDashboard;
