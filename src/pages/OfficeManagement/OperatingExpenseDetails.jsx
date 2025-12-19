import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowLeft, Scale, Megaphone, Laptop, CreditCard, Package, Receipt, RotateCcw, FileText, Calendar, BarChart3, Pencil, X, Check, Trash2 } from 'lucide-react';
import { useOpExCategory, useUpdateOpExCategory, useDeleteOpExCategory } from '../../hooks';
import Swal from 'sweetalert2';

const ICONS = { Scale, Megaphone, Laptop, CreditCard, Package, Receipt, RotateCcw, FileText };

// Icons registry for rendering by iconKey

export default function OperatingExpenseDetails() {
  const { isDark } = useTheme();
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const { data: categoryData, isLoading } = useOpExCategory(categoryId);
  const updateCategory = useUpdateOpExCategory();
  const deleteCategory = useDeleteOpExCategory();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    banglaName: '',
    description: '',
    iconKey: 'FileText',
    color: '',
    bgColor: '',
    iconColor: ''
  });
  const category = useMemo(() => {
    if (!categoryData) return null;
    return {
      ...categoryData,
      icon: ICONS[categoryData.iconKey] || FileText,
      totalAmount: typeof categoryData.totalAmount === 'number' ? categoryData.totalAmount : Number(categoryData.totalAmount || 0),
      itemCount: typeof categoryData.itemCount === 'number' ? categoryData.itemCount : Number(categoryData.itemCount || 0),
    };
  }, [categoryData]);

  useEffect(() => {
    if (category) {
      setEditForm((prev) => ({
        ...prev,
        name: category.name || '',
        banglaName: category.banglaName || '',
        description: category.description || '',
        iconKey: categoryData?.iconKey || 'FileText',
        color: categoryData?.color || '',
        bgColor: categoryData?.bgColor || '',
        iconColor: categoryData?.iconColor || ''
      }));
    }
  }, [category, categoryData]);

  const totalAmount = category?.totalAmount || 0;
  const itemCount = category?.itemCount || 0;
  const lastUpdated = category?.lastUpdated ? new Date(category.lastUpdated).toLocaleDateString() : '-';

  const handleSaveCategory = () => {
    if (!categoryId) return;
    const payload = {
      id: categoryId,
      updates: {
        name: String(editForm.name || '').trim(),
        banglaName: editForm.banglaName || '',
        description: editForm.description || '',
        iconKey: editForm.iconKey || 'FileText',
        color: editForm.color || '',
        bgColor: editForm.bgColor || '',
        iconColor: editForm.iconColor || ''
      }
    };
    updateCategory.mutate(payload, {
      onSuccess: () => {
        setFeedback('Category updated successfully.');
        setIsEditing(false);
        setTimeout(() => setFeedback(''), 2000);
      },
      onError: (err) => {
        setFeedback(err?.response?.data?.message || 'Failed to update category.');
      }
    });
  };

  const handleDeleteCategory = async () => {
    if (!categoryId) return;
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      deleteCategory.mutate(categoryId, {
        onSuccess: () => {
          Swal.fire({
            title: 'Deleted!',
            text: 'Category has been deleted.',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
          navigate('/office-management/operating-expenses');
        },
        onError: (err) => {
          Swal.fire({
            title: 'Error!',
            text: err?.response?.data?.message || 'Failed to delete category.',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        }
      });
    }
  };


  return (
    <div className={`min-h-screen p-2 sm:p-4 lg:p-6 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={() => setIsEditing((v) => !v)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              {isEditing ? (<><X className="w-4 h-4" /> Cancel</>) : (<><Pencil className="w-4 h-4" /> Edit</>)}
            </button>
            
            <button
              onClick={handleDeleteCategory}
              disabled={deleteCategory.isPending}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors ${deleteCategory.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        <div className={`p-4 sm:p-6 rounded-xl shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-start gap-4">
            {category?.icon && (
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <category.icon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              </div>
            )}
            <div className="flex-1">
              {!isEditing && (
                <>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{category?.name || 'Category Details'}</h1>
                  {category?.banglaName && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{category.banglaName}</p>
                  )}
                </>
              )}
              {isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Name</label>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Bangla Name</label>
                    <input
                      value={editForm.banglaName}
                      onChange={(e) => setEditForm({ ...editForm, banglaName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                      placeholder="বাংলা নাম"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                      placeholder="Description"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Icon</label>
                    <select
                      value={editForm.iconKey}
                      onChange={(e) => setEditForm({ ...editForm, iconKey: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                    >
                      {Object.keys(ICONS).map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Color Gradient</label>
                    <input
                      value={editForm.color}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      placeholder="e.g. from-blue-500 to-blue-600"
                      className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">BG Color</label>
                    <input
                      value={editForm.bgColor}
                      onChange={(e) => setEditForm({ ...editForm, bgColor: e.target.value })}
                      placeholder="e.g. bg-blue-50"
                      className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Icon Color</label>
                    <input
                      value={editForm.iconColor}
                      onChange={(e) => setEditForm({ ...editForm, iconColor: e.target.value })}
                      placeholder="e.g. text-blue-600"
                      className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <button onClick={handleSaveCategory} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
                      <Check className="w-4 h-4" /> Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700 hover:bg-gray-800 text-white' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              )}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'}`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">৳{totalAmount.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'}`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{itemCount}</p>
                </div>
                <div className={`p-3 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'}`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    {lastUpdated}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {feedback && (
            <div className="mt-4">
              <p className={`text-sm ${feedback.includes('successfully') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


