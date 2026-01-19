import React, { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { DollarSign, Utensils, Car, ShoppingCart, Gamepad2, Heart, Book, Home, ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import usePersonalCategoryQueries from '../../hooks/usePersonalCategoryQueries';

const ExpenseCategoriesPage = () => {
  const navigate = useNavigate();

  const iconOptions = useMemo(() => ({
    Utensils,
    Car,
    ShoppingCart,
    Gamepad2,
    Heart,
    Book,
    Home,
    DollarSign
  }), []);

  const { usePersonalCategories, useCreatePersonalCategory } = usePersonalCategoryQueries();
  const { data: categories = [], isLoading } = usePersonalCategories();
  const createMutation = useCreatePersonalCategory();
  const [categoryForm, setCategoryForm] = useState({ 
    name: '', 
    icon: 'DollarSign', 
    description: '',
    type: 'regular' // 'regular' or 'irregular'
  });
  const [saving, setSaving] = useState(false);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const name = categoryForm.name.trim();
    if (!name) return;
      if (categories.some((c) => (c?.name || '').toLowerCase() === name.toLowerCase())) {
        await Swal.fire({ icon: 'error', title: 'ইতিমধ্যে বিদ্যমান', text: 'এই নামে একটি ক্যাটাগরি ইতিমধ্যে রয়েছে।', confirmButtonColor: '#ef4444' });
        return;
      }
    try {
      setSaving(true);
      await createMutation.mutateAsync({ 
        name, 
        icon: categoryForm.icon, 
        description: categoryForm.description.trim(),
        type: categoryForm.type // Include expense type
      });
      setCategoryForm({ name: '', icon: 'DollarSign', description: '', type: 'regular' });
      await Swal.fire({ icon: 'success', title: 'ক্যাটাগরি যোগ করা হয়েছে', text: `${name} সফলভাবে তৈরি করা হয়েছে।`, timer: 1200, showConfirmButton: false });
    } catch (err) {
      const message = err?.response?.data?.message || 'ক্যাটাগরি তৈরি করতে ব্যর্থ';
      await Swal.fire({ icon: 'error', title: 'ত্রুটি', text: message, confirmButtonColor: '#ef4444' });
    } finally {
      setSaving(false);
    }
  };

  // This page is only for creating categories now – no delete/list actions

  const SelectedIcon = iconOptions[categoryForm.icon] || DollarSign;

  return (
    <div className="space-y-8 p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">পারিবারিক খরচের ক্যাটাগরি</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">পারিবারিক খরচের ক্যাটাগরি তৈরি করুন</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleCreateCategory} className="space-y-8">
          {/* Category Name */}
          <div>
            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
              ক্যাটাগরি নাম <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={categoryForm.name} 
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} 
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" 
              placeholder="যেমন: খাবার, পরিবহন, বিনোদন" 
              required 
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
              আইকন নির্বাচন করুন
            </label>
            <div className="mb-4 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-md border-2 border-gray-200 dark:border-gray-700">
                  <SelectedIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">নির্বাচিত আইকন</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{categoryForm.icon}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4">
              {Object.entries(iconOptions).map(([key, IconComponent]) => {
                const isSelected = categoryForm.icon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, icon: key })}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                      isSelected
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg scale-105'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <IconComponent className={`w-6 h-6 mx-auto ${
                      isSelected
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <p className={`text-xs mt-2 text-center ${
                      isSelected
                        ? 'text-red-600 dark:text-red-400 font-semibold'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {key}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
              বর্ণনা
            </label>
            <input 
              type="text" 
              value={categoryForm.description} 
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} 
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" 
              placeholder="যেমন: মাসিক খাবারের খরচ, দৈনিক পরিবহন খরচ" 
            />
          </div>

          {/* Expense Type Selection */}
          <div>
            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
              খরচের ধরন <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setCategoryForm({ ...categoryForm, type: 'regular' })}
                className={`px-5 py-4 rounded-xl border-2 transition-all font-medium ${
                  categoryForm.type === 'regular'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg">📅</span>
                  <span>নিয়মিত খরচ</span>
                  <span className="text-xs opacity-75">মাসিক/দৈনিক খরচ</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setCategoryForm({ ...categoryForm, type: 'irregular' })}
                className={`px-5 py-4 rounded-xl border-2 transition-all font-medium ${
                  categoryForm.type === 'irregular'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span>অনিয়মিত খরচ</span>
                  <span className="text-xs opacity-75">এককালীন/বিশেষ খরচ</span>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={saving} 
              className="w-full px-6 py-4 text-lg font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>ক্যাটাগরি যোগ করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>ক্যাটাগরি যোগ করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Listing intentionally removed */}
    </div>
  );
};

export default ExpenseCategoriesPage;


