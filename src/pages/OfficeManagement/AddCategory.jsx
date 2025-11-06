import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useCreateOpExCategory } from '../../hooks';
import { 
  ArrowLeft,
  Save,
  FileText,
  Scale,
  Megaphone,
  Laptop,
  CreditCard,
  Package,
  Receipt,
  RotateCcw
} from 'lucide-react';

const ICONS = { FileText, Scale, Megaphone, Laptop, CreditCard, Package, Receipt, RotateCcw };
const ICON_OPTIONS = Object.keys(ICONS);

const COLOR_OPTIONS = [
  { color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400' },
  { color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400' },
  { color: 'from-green-500 to-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600 dark:text-green-400' },
  { color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20', iconColor: 'text-orange-600 dark:text-orange-400' },
  { color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', iconColor: 'text-indigo-600 dark:text-indigo-400' },
  { color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-900/20', iconColor: 'text-pink-600 dark:text-pink-400' },
  { color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-50 dark:bg-teal-900/20', iconColor: 'text-teal-600 dark:text-teal-400' },
  { color: 'from-red-500 to-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-600 dark:text-red-400' },
];

const AddCategory = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const createCategory = useCreateOpExCategory();
  const [form, setForm] = useState({
    name: '',
    banglaName: '',
    description: '',
    iconKey: 'FileText',
    colorIdx: 0,
  });
  const [error, setError] = useState('');
  const colors = COLOR_OPTIONS[form.colorIdx];

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    try {
      await createCategory.mutateAsync({
        name: form.name.trim(),
        banglaName: form.banglaName.trim(),
        description: form.description.trim(),
        iconKey: form.iconKey,
        color: COLOR_OPTIONS[form.colorIdx].color,
        bgColor: COLOR_OPTIONS[form.colorIdx].bgColor,
        iconColor: COLOR_OPTIONS[form.colorIdx].iconColor,
        totalAmount: 0,
        itemCount: 0,
        subcategories: []
      });
      navigate('/office-management/operating-expenses');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save. Please try again.');
    }
  };

  const IconPreview = ICONS[form.iconKey] || FileText;

  return (
    <div className={`min-h-screen p-2 sm:p-4 lg:p-6 transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 sm:mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate('/office-management/operating-expenses')}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${colors.color} rounded-lg flex items-center justify-center`}>
            <IconPreview className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Add Category</h1>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>নতুন ক্যাটাগরি যোগ করুন</p>
          </div>
        </div>

        <div className={`p-4 sm:p-6 rounded-xl shadow-lg border transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  placeholder="English name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bangla Name</label>
                <input
                  name="banglaName"
                  value={form.banglaName}
                  onChange={onChange}
                  className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  placeholder="বাংলা নাম"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={3}
                className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                placeholder="Short description"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((k) => {
                    const Icon = ICONS[k] || FileText;
                    const selected = form.iconKey === k;
                    return (
                      <button
                        type="button"
                        key={k}
                        onClick={() => setForm((p) => ({ ...p, iconKey: k }))}
                        aria-pressed={selected}
                        className={`flex items-center justify-center h-12 rounded-lg border transition-all ${
                          selected
                            ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900/40 bg-blue-50 dark:bg-blue-900/20'
                            : isDark
                              ? 'border-gray-600 hover:bg-gray-700'
                              : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        title={k}
                      >
                        <Icon className={`w-5 h-5 ${selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Theme</label>
                <select
                  name="colorIdx"
                  value={form.colorIdx}
                  onChange={(e) => setForm((p) => ({ ...p, colorIdx: Number(e.target.value) }))}
                  className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                >
                  {COLOR_OPTIONS.map((c, i) => (
                    <option key={i} value={i}>{c.color.replace('from-', '').replace(' to-', ' → ')}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{error}</div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                <span>Save Category</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/office-management/operating-expenses')}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;


