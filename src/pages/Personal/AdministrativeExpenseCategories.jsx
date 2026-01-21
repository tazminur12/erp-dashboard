import React, { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Building2, DollarSign, Calendar, CalendarDays, ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import usePersonalCategoryQueries from '../../hooks/usePersonalCategoryQueries';

const ExpenseCategoriesPage = () => {
  const navigate = useNavigate();

  const iconOptions = useMemo(() => ({
    Building2,
    DollarSign,
    Calendar,
    CalendarDays
  }), []);

  const { usePersonalCategories, useCreatePersonalCategory } = usePersonalCategoryQueries();
  const { data: categories = [], isLoading } = usePersonalCategories();
  const createMutation = useCreatePersonalCategory();
  const [categoryForm, setCategoryForm] = useState({ 
    name: '', 
    icon: 'Building2', 
    description: '',
    type: 'regular', // 'regular' or 'irregular'
    frequency: 'monthly' // 'monthly' or 'annual' (only for regular)
  });
  const [saving, setSaving] = useState(false);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const name = categoryForm.name.trim();
    if (!name) return;
    
    if (categories.some((c) => (c?.name || '').toLowerCase() === name.toLowerCase())) {
      await Swal.fire({ 
        icon: 'error', 
        title: 'ইতিমধ্যে বিদ্যমান', 
        text: 'এই নামে একটি ক্যাটাগরি ইতিমধ্যে রয়েছে।', 
        confirmButtonColor: '#ef4444' 
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // For regular expenses, include frequency in description or as metadata
      // Since the backend might not have a frequency field, we'll add it to description
      let description = categoryForm.description.trim();
      if (categoryForm.type === 'regular') {
        const frequencyText = categoryForm.frequency === 'annual' ? 'বাৎসরিক' : 'মাসিক';
        if (description) {
          description = `${frequencyText} - ${description}`;
        } else {
          description = frequencyText;
        }
      }
      
      await createMutation.mutateAsync({ 
        name, 
        icon: categoryForm.icon, 
        description,
        type: categoryForm.type
      });
      
      setCategoryForm({ 
        name: '', 
        icon: 'Building2', 
        description: '', 
        type: 'regular',
        frequency: 'monthly'
      });
      
      await Swal.fire({ 
        icon: 'success', 
        title: 'ক্যাটাগরি যোগ করা হয়েছে', 
        text: `${name} সফলভাবে তৈরি করা হয়েছে।`, 
        timer: 1200, 
        showConfirmButton: false 
      });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'ক্যাটাগরি তৈরি করতে ব্যর্থ';
      console.error('Create category error:', err);
      await Swal.fire({ 
        icon: 'error', 
        title: 'ত্রুটি', 
        text: message, 
        confirmButtonColor: '#ef4444' 
      });
    } finally {
      setSaving(false);
    }
  };

  const SelectedIcon = iconOptions[categoryForm.icon] || Building2;

  return (
    <div className="space-y-8 p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">পরিচালন খরচের ক্যাটাগরি</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">পরিচালন খরচের ক্যাটাগরি তৈরি করুন</p>
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
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
              placeholder="যেমন: অফিস ভাড়া, বিদ্যুৎ বিল, ইন্টারনেট বিল, লাইসেন্স রিনিউ" 
              required 
            />
          </div>

          {/* Expense Type */}
          <div>
            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
              খরচের ধরন <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategoryForm({ ...categoryForm, type: 'regular' })}
                className={`px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                  categoryForm.type === 'regular'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                নিয়মিত খরচ
              </button>
              <button
                type="button"
                onClick={() => setCategoryForm({ ...categoryForm, type: 'irregular' })}
                className={`px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                  categoryForm.type === 'irregular'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                অনিয়মিত খরচ
              </button>
            </div>
          </div>

          {/* Frequency (Only for Regular Expenses) */}
          {categoryForm.type === 'regular' && (
            <div>
              <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                ফ্রিকোয়েন্সি <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCategoryForm({ ...categoryForm, frequency: 'monthly' })}
                  className={`px-4 py-3 rounded-lg font-medium transition-all border-2 flex items-center justify-center gap-2 ${
                    categoryForm.frequency === 'monthly'
                      ? 'bg-green-600 text-white border-green-600 shadow-md'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  মাসিক
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryForm({ ...categoryForm, frequency: 'annual' })}
                  className={`px-4 py-3 rounded-lg font-medium transition-all border-2 flex items-center justify-center gap-2 ${
                    categoryForm.frequency === 'annual'
                      ? 'bg-green-600 text-white border-green-600 shadow-md'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  বাৎসরিক
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {categoryForm.frequency === 'monthly' 
                  ? 'মাসিক: অফিস ভাড়া, বিদ্যুৎ বিল, ইন্টারনেট বিল ইত্যাদি'
                  : 'বাৎসরিক: লাইসেন্স রিনিউ, ডোমেইন বিল ইত্যাদি'}
              </p>
            </div>
          )}

          {/* Icon Picker */}
          <div>
            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
              আইকন নির্বাচন করুন
            </label>
            <div className="mb-4 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-md border-2 border-gray-200 dark:border-gray-700">
                  <SelectedIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(iconOptions).map(([key, IconComponent]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategoryForm({ ...categoryForm, icon: key })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    categoryForm.icon === key
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                  }`}
                >
                  <IconComponent className={`w-6 h-6 mx-auto ${
                    categoryForm.icon === key
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
              বর্ণনা
            </label>
            <textarea 
              value={categoryForm.description} 
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} 
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none" 
              placeholder="ক্যাটাগরি সম্পর্কে অতিরিক্ত তথ্য (ঐচ্ছিক)" 
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saving || !categoryForm.name.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  তৈরি করা হচ্ছে...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  ক্যাটাগরি তৈরি করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseCategoriesPage;
