import React, { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { DollarSign, Utensils, Car, ShoppingCart, Gamepad2, Heart, Book, Home, Plus, Trash2, ArrowLeft, Search, Eye, Edit, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import usePersonalCategoryQueries from '../../hooks/usePersonalCategoryQueries';
import { useTheme } from '../../contexts/ThemeContext';
import { Helmet } from 'react-helmet-async';

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

const PersonalExpense = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { usePersonalCategories, useDeletePersonalCategory } = usePersonalCategoryQueries();
  const { data: categories = [], isLoading } = usePersonalCategories();
  const deleteCategory = useDeletePersonalCategory();
  
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totals = React.useMemo(() => {
    const grand = (categories || []).reduce((sum, c) => sum + Number(c.totalAmount || 0), 0);
    const byName = {};
    for (const c of categories) byName[c.name] = Number(c.totalAmount || 0);
    return { grand, byName };
  }, [categories]);

  // Filter categories based on search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return Array.isArray(categories) ? categories : [];
    return Array.isArray(categories) ? categories.filter((c) =>
      [c.name, c.description]
        .filter(Boolean)
        .some((x) => x.toLowerCase().includes(q))
    ) : [];
  }, [query, categories]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const formatCurrency = (amount = 0) => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;

  const onDelete = async (name, id) => {
    const res = await Swal.fire({
      title: `${name} মুছে ফেলবেন?`,
      text: 'এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });
    if (!res.isConfirmed) return;
    try {
      await deleteCategory.mutateAsync({ name, id });
      await Swal.fire({ icon: 'success', title: 'মুছে ফেলা হয়েছে', timer: 900, showConfirmButton: false });
    } catch (err) {
      const message = err?.response?.data?.message || 'ক্যাটাগরি মুছে ফেলতে ব্যর্থ';
      await Swal.fire({ icon: 'error', title: 'ত্রুটি', text: message, confirmButtonColor: '#ef4444' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>পারিবারিক খরচসমূহ</title>
        <meta name="description" content="পারিবারিক খরচের ক্যাটাগরি তালিকা দেখুন এবং পরিচালনা করুন।" />
      </Helmet>
      
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">পারিবারিক খরচসমূহ</h1>
            <p className="text-gray-600 dark:text-gray-400">সব পারিবারিক খরচের ক্যাটাগরি</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => { setPage(1); setQuery(e.target.value); }}
              className="w-full sm:w-72 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="ক্যাটাগরি খুঁজুন..."
            />
          </div>
          <Link
            to="/personal/expense-categories"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2.5"
          >
            <Plus className="w-4 h-4" /> নতুন ক্যাটাগরি
          </Link>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট ক্যাটাগরি</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {categories.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট খরচ</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totals.grand)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">গড় খরচ</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {categories.length > 0 ? formatCurrency(totals.grand / categories.length) : '৳0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ক্যাটাগরি</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">বর্ণনা</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">মোট খরচ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">শতাংশ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">সর্বশেষ আপডেট</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      লোড হচ্ছে...
                    </div>
                  </td>
                </tr>
              ) : paged.length > 0 ? paged.map((c) => {
                const name = c.name;
                const Icon = iconMap[c.icon] || DollarSign;
                const totalForCategory = Number(c.totalAmount || 0);
                const percent = totals.grand > 0 ? Math.min(100, Math.round((totalForCategory / totals.grand) * 100)) : 0;

                return (
                  <tr key={c.id || name} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                          <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {c.description || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(totalForCategory)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-2 bg-purple-600 dark:bg-purple-400 rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
                          {percent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {c.lastUpdated ? new Date(c.lastUpdated).toLocaleDateString('bn-BD') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {c.id && (
                          <Link
                            to={`/personal/expense-categories/${c.id}`}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </Link>
                        )}
                        <button
                          onClick={() => onDelete(name, c.id)}
                          disabled={deleteCategory.isPending}
                          className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-60 disabled:cursor-not-allowed"
                          title="মুছে ফেলুন"
                        >
                          {deleteCategory.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    {query ? 'কোন ক্যাটাগরি পাওয়া যায়নি' : 'কোন ক্যাটাগরি নেই। নতুন ক্যাটাগরি তৈরি করুন।'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            দেখানো হচ্ছে <span className="font-medium">{paged.length}</span> এর <span className="font-medium">{filtered.length}</span> ক্যাটাগরি
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              আগে
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-200">পৃষ্ঠা {currentPage} এর {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              পরে
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalExpense;
