import React from 'react';
import Swal from 'sweetalert2';
import { DollarSign, Utensils, Car, ShoppingCart, Gamepad2, Heart, Book, Home, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import usePersonalCategoryQueries from '../../hooks/usePersonalCategoryQueries';
import { useTheme } from '../../contexts/ThemeContext';

const iconMap = {
  Utensils,
  Car,
  ShoppingCart,
  Gamepad2,
  Heart,
  Book,
  Home,
  DollarSign
};

const colorPalette = {
  sky: { from: '#E0F2FE', to: '#BAE6FD', border: '#93C5FD', iconFrom: '#E0F2FE', iconTo: '#BAE6FD', icon: '#0369A1' },
  blue: { from: '#DBEAFE', to: '#BFDBFE', border: '#93C5FD', iconFrom: '#DBEAFE', iconTo: '#BFDBFE', icon: '#1D4ED8' },
  red: { from: '#FEE2E2', to: '#FECACA', border: '#FCA5A5', iconFrom: '#FEE2E2', iconTo: '#FECACA', icon: '#B91C1C' },
  green: { from: '#DCFCE7', to: '#BBF7D0', border: '#86EFAC', iconFrom: '#DCFCE7', iconTo: '#BBF7D0', icon: '#166534' },
  yellow: { from: '#FEF9C3', to: '#FEF08A', border: '#FDE047', iconFrom: '#FEF9C3', iconTo: '#FEF08A', icon: '#854D0E' },
  purple: { from: '#E9D5FF', to: '#DDD6FE', border: '#C4B5FD', iconFrom: '#E9D5FF', iconTo: '#DDD6FE', icon: '#6D28D9' },
  pink: { from: '#FCE7F3', to: '#FBCFE8', border: '#F9A8D4', iconFrom: '#FCE7F3', iconTo: '#FBCFE8', icon: '#9D174D' },
  orange: { from: '#FFEDD5', to: '#FED7AA', border: '#FDBA74', iconFrom: '#FFEDD5', iconTo: '#FED7AA', icon: '#9A3412' }
};

const colorPaletteDark = {
  sky: { from: '#0B1E34', to: '#0F2F46', border: '#38BDF8', iconFrom: '#0EA5E9', iconTo: '#38BDF8', icon: '#E0F2FE' },
  blue: { from: '#0B1E3A', to: '#0F2F6A', border: '#60A5FA', iconFrom: '#1D4ED8', iconTo: '#3B82F6', icon: '#DBEAFE' },
  red: { from: '#3F0A0A', to: '#7F1D1D', border: '#F87171', iconFrom: '#DC2626', iconTo: '#EF4444', icon: '#FEE2E2' },
  green: { from: '#062C1A', to: '#064E3B', border: '#4ADE80', iconFrom: '#16A34A', iconTo: '#22C55E', icon: '#DCFCE7' },
  yellow: { from: '#422006', to: '#854D0E', border: '#FACC15', iconFrom: '#D97706', iconTo: '#F59E0B', icon: '#FEF9C3' },
  purple: { from: '#2E1065', to: '#4C1D95', border: '#C4B5FD', iconFrom: '#7C3AED', iconTo: '#8B5CF6', icon: '#E9D5FF' },
  pink: { from: '#500724', to: '#831843', border: '#F472B6', iconFrom: '#BE185D', iconTo: '#DB2777', icon: '#FCE7F3' },
  orange: { from: '#451A03', to: '#7C2D12', border: '#FB923C', iconFrom: '#C2410C', iconTo: '#EA580C', icon: '#FFEDD5' }
};

const PersonalExpense = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { usePersonalCategories, useDeletePersonalCategory } = usePersonalCategoryQueries();
  const { data: categories = [], isLoading } = usePersonalCategories();
  const deleteCategory = useDeletePersonalCategory();

  const totals = React.useMemo(() => {
    const grand = (categories || []).reduce((sum, c) => sum + Number(c.totalAmount || 0), 0);
    const byName = {};
    for (const c of categories) byName[c.name] = Number(c.totalAmount || 0);
    return { grand, byName };
  }, [categories]);

  const onDelete = async (name) => {
    const res = await Swal.fire({
      title: `Delete ${name}?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete'
    });
    if (!res.isConfirmed) return;
    try {
      await deleteCategory.mutateAsync({ name });
      await Swal.fire({ icon: 'success', title: 'Deleted', timer: 900, showConfirmButton: false });
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete category';
      await Swal.fire({ icon: 'error', title: 'Error', text: message, confirmButtonColor: '#ef4444' });
    }
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Expenses</h1>
            <p className="text-gray-600 dark:text-gray-400">Track expenses by colorful categories</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/personal/expense-categories')}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Plus className="w-4 h-4" />
          <span>Manage Categories</span>
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl p-5 border" style={{ background: `linear-gradient(135deg, ${(isDark ? colorPaletteDark.sky : colorPalette.sky).from}, ${(isDark ? colorPaletteDark.sky : colorPalette.sky).to})`, borderColor: (isDark ? colorPaletteDark.sky : colorPalette.sky).border }}>
          <p className="text-sm text-gray-700/90 dark:text-gray-200">Total Amount</p>
          <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">৳{Number(totals.grand || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Categories */}
      {!isLoading && categories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Categories</h3>
            <button
              onClick={() => navigate('/personal/expense-categories')}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Manage
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => {
              const name = c.name;
              const colorKey = c.color && c.color !== 'gray' ? c.color : 'sky';
              const pal = (isDark ? colorPaletteDark : colorPalette)[colorKey] || (isDark ? colorPaletteDark.sky : colorPalette.sky);
              const Icon = iconMap[c.icon] || DollarSign;
              const totalForCategory = Number(c.totalAmount || 0);
              const percent = totals.grand > 0 ? Math.min(100, Math.round((totalForCategory / totals.grand) * 100)) : 0;

              return (
                <div
                  key={name}
                  className="rounded-2xl p-5 border-2 transition-all duration-200 hover:shadow-2xl hover:scale-[1.01]"
                  style={{ background: `linear-gradient(135deg, ${pal.from}, ${pal.to})`, borderColor: pal.border }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center ring-2 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${pal.iconFrom}, ${pal.iconTo})`, boxShadow: '0 10px 20px rgba(0,0,0,0.06)', borderColor: pal.border }}
                    >
                      <Icon className="w-6 h-6" style={{ color: pal.icon }} />
                    </div>
                    <button
                      onClick={() => onDelete(name)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">{name}</h4>
                      <button
                        onClick={() => c.id && navigate(`/personal/expense-categories/${c.id}`)}
                        className="text-xs px-2.5 py-1 rounded-full border text-gray-800 bg-white/70 hover:bg-white"
                        style={{ borderColor: pal.border }}
                        title="View details"
                      >
                        View
                      </button>
                    </div>

                    {c.description && (
                      <p className="text-xs text-gray-700/90 dark:text-gray-300 mt-1 line-clamp-1">{c.description}</p>
                    )}

                    {c.lastUpdated && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Updated: {new Date(c.lastUpdated).toLocaleDateString()}</p>
                    )}

                    <div className="mt-3">
                      <p className="text-xs text-gray-700/90 dark:text-gray-300">Total</p>
                      <p className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">৳{totalForCategory.toLocaleString()}</p>
                      <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: '#FFFFFF80' }}>
                        <div className="h-2 rounded-full" style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${pal.border}, ${pal.icon})` }} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-700/80">{percent}% of total</span>
                        <span className="text-xs text-gray-700/80">৳{Number(totals.grand || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isLoading && categories.length === 0 && (
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700">
          <p className="text-sm text-amber-800 dark:text-amber-200">No personal expense categories found. Create categories to start tracking expenses.</p>
          <button onClick={() => navigate('/personal/expense-categories')} className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700">Manage Categories</button>
        </div>
      )}
    </div>
  );
};

export default PersonalExpense;


