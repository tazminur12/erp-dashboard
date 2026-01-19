import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import usePersonalCategoryQueries from '../../hooks/usePersonalCategoryQueries';
import { ArrowLeft, DollarSign } from 'lucide-react';

const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { usePersonalCategoryById } = usePersonalCategoryQueries();
  const { data: category, isLoading, isError, error } = usePersonalCategoryById(id);

  const Icon = React.useMemo(() => {
    if (!category?.icon) return DollarSign;
    try {
      const lib = require('lucide-react');
      return lib[category.icon] || DollarSign;
    } catch (_) {
      return DollarSign;
    }
  }, [category?.icon]);

  const palette = React.useMemo(() => {
    const colorKey = category?.color && category.color !== 'gray' ? category.color : 'sky';
    const light = {
      sky: { from: '#E0F2FE', to: '#BAE6FD', border: '#93C5FD', iconFrom: '#E0F2FE', iconTo: '#BAE6FD', icon: '#0369A1' },
      blue: { from: '#DBEAFE', to: '#BFDBFE', border: '#93C5FD', iconFrom: '#DBEAFE', iconTo: '#BFDBFE', icon: '#1D4ED8' },
      red: { from: '#FEE2E2', to: '#FECACA', border: '#FCA5A5', iconFrom: '#FEE2E2', iconTo: '#FECACA', icon: '#B91C1C' },
      green: { from: '#DCFCE7', to: '#BBF7D0', border: '#86EFAC', iconFrom: '#DCFCE7', iconTo: '#BBF7D0', icon: '#166534' },
      yellow: { from: '#FEF9C3', to: '#FEF08A', border: '#FDE047', iconFrom: '#FEF9C3', iconTo: '#FEF08A', icon: '#854D0E' },
      purple: { from: '#E9D5FF', to: '#DDD6FE', border: '#C4B5FD', iconFrom: '#E9D5FF', iconTo: '#DDD6FE', icon: '#6D28D9' },
      pink: { from: '#FCE7F3', to: '#FBCFE8', border: '#F9A8D4', iconFrom: '#FCE7F3', iconTo: '#FBCFE8', icon: '#9D174D' },
      orange: { from: '#FFEDD5', to: '#FED7AA', border: '#FDBA74', iconFrom: '#FFEDD5', iconTo: '#FED7AA', icon: '#9A3412' }
    };
    const dark = {
      sky: { from: '#0B1E34', to: '#0F2F46', border: '#38BDF8', iconFrom: '#0EA5E9', iconTo: '#38BDF8', icon: '#E0F2FE' },
      blue: { from: '#0B1E3A', to: '#0F2F6A', border: '#60A5FA', iconFrom: '#1D4ED8', iconTo: '#3B82F6', icon: '#DBEAFE' },
      red: { from: '#3F0A0A', to: '#7F1D1D', border: '#F87171', iconFrom: '#DC2626', iconTo: '#EF4444', icon: '#FEE2E2' },
      green: { from: '#062C1A', to: '#064E3B', border: '#4ADE80', iconFrom: '#16A34A', iconTo: '#22C55E', icon: '#DCFCE7' },
      yellow: { from: '#422006', to: '#854D0E', border: '#FACC15', iconFrom: '#D97706', iconTo: '#F59E0B', icon: '#FEF9C3' },
      purple: { from: '#2E1065', to: '#4C1D95', border: '#C4B5FD', iconFrom: '#7C3AED', iconTo: '#8B5CF6', icon: '#E9D5FF' },
      pink: { from: '#500724', to: '#831843', border: '#F472B6', iconFrom: '#BE185D', iconTo: '#DB2777', icon: '#FCE7F3' },
      orange: { from: '#451A03', to: '#7C2D12', border: '#FB923C', iconFrom: '#C2410C', iconTo: '#EA580C', icon: '#FFEDD5' }
    };
    const map = isDark ? dark : light;
    return map[colorKey] || (isDark ? dark.sky : light.sky);
  }, [category?.color, isDark]);

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ক্যাটাগরি বিবরণ</h1>
        </div>
      </div>

      <div className="rounded-2xl p-5 shadow-xl border" style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`, borderColor: palette.border }}>
        {isLoading && (
          <p className="text-gray-600 dark:text-gray-300">লোড হচ্ছে...</p>
        )}
        {isError && (
          <p className="text-red-600">{error?.message || 'ক্যাটাগরি লোড করতে ব্যর্থ'}</p>
        )}
        {!isLoading && !isError && category && (
          <div className="space-y-5">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center ring-2 shadow-lg" style={{ background: `linear-gradient(135deg, ${palette.iconFrom}, ${palette.iconTo})`, borderColor: palette.border }}>
                <Icon className="w-7 h-7" style={{ color: palette.icon }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{category.name}</h2>
                <p className="text-sm text-gray-700/80 dark:text-gray-300">ID: {category.id}</p>
              </div>
            </div>
            {category.description && (
              <div className="p-4 rounded-xl bg-white/70">
                <p className="text-xs text-gray-600">বর্ণনা</p>
                <p className="text-gray-900 font-medium mt-1">{category.description}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/70">
                <p className="text-xs text-gray-600">আইকন</p>
                <p className="text-gray-900 font-medium">{category.icon}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/70">
                <p className="text-xs text-gray-600">খরচের ধরন</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    category.type === 'regular'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                  }`}>
                    {category.type === 'regular' ? '📅 নিয়মিত' : '🎯 অনিয়মিত'}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/70">
                <p className="text-xs text-gray-600">মোট খরচ</p>
                <p className="text-gray-900 font-semibold">৳{Number(category.totalAmount || 0).toLocaleString('bn-BD')}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/70">
                <p className="text-xs text-gray-600">সর্বশেষ আপডেট</p>
                <p className="text-gray-900 font-medium">{category.lastUpdated ? new Date(category.lastUpdated).toLocaleDateString('bn-BD') : '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDetails;



