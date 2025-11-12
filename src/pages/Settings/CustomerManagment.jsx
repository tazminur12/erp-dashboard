import React, { useState } from 'react';
import { 
  X, 
  Home, 
  Plane, 
  Building, 
  Users, 
  Package, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  Heart,
  Tag,
  Folder,
  Box,
  BarChart3,
  Settings,
  Truck,
  Megaphone,
  Building2,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import { 
  useCustomerTypes, 
  useCreateCustomerType, 
  useUpdateCustomerType, 
  useDeleteCustomerType 
} from '../../hooks/useCustomerTypeQueries';

const CustomerManagment = () => {
  const { isDark } = useTheme();
  const axiosSecure = useAxiosSecure();
  
  // React Query hooks
  const { data: categories = [], isLoading: loading } = useCustomerTypes();
  const createMutation = useCreateCustomerType();
  const updateMutation = useUpdateCustomerType();
  const deleteMutation = useDeleteCustomerType();
  
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    prefix: '',
    icon: 'home',
    type: 'general'
  });
  const [editingCategory, setEditingCategory] = useState(null);

  // Category icons mapping
  const iconMap = {
    'home': <Home className="h-4 w-4" />,
    'plane': <Plane className="h-4 w-4" />,
    'building': <Building className="h-4 w-4" />,
    'users': <Users className="h-4 w-4" />,
    'package': <Package className="h-4 w-4" />,
    'dollar': <DollarSign className="h-4 w-4" />,
    'trending-up': <TrendingUp className="h-4 w-4" />,
    'trending-down': <TrendingDown className="h-4 w-4" />,
    'star': <Star className="h-4 w-4" />,
    'heart': <Heart className="h-4 w-4" />,
    'tag': <Tag className="h-4 w-4" />,
    'folder': <Folder className="h-4 w-4" />,
    'box': <Box className="h-4 w-4" />,
    'chart': <BarChart3 className="h-4 w-4" />,
    'gear': <Settings className="h-4 w-4" />,
    'truck': <Truck className="h-4 w-4" />,
    'megaphone': <Megaphone className="h-4 w-4" />,
    'building2': <Building2 className="h-4 w-4" />
  };

  // Icon options for dropdown
  const iconOptions = [
    { value: 'home', label: 'হোম (Home)' },
    { value: 'plane', label: 'বিমান (Plane)' },
    { value: 'building', label: 'ভবন (Building)' },
    { value: 'users', label: 'ব্যবহারকারী (Users)' },
    { value: 'package', label: 'প্যাকেজ (Package)' },
    { value: 'dollar', label: 'ডলার (Dollar)' },
    { value: 'trending-up', label: 'উর্ধ্বগতি (Trending Up)' },
    { value: 'trending-down', label: 'নিম্নগতি (Trending Down)' },
    { value: 'star', label: 'তারা (Star)' },
    { value: 'heart', label: 'হৃদয় (Heart)' },
    { value: 'tag', label: 'ট্যাগ (Tag)' },
    { value: 'folder', label: 'ফোল্ডার (Folder)' },
    { value: 'box', label: 'বক্স (Box)' },
    { value: 'chart', label: 'চার্ট (Chart)' },
    { value: 'gear', label: 'গিয়ার (Gear)' },
    { value: 'truck', label: 'ট্রাক (Truck)' },
    { value: 'megaphone', label: 'মেগাফোন (Megaphone)' },
    { value: 'building2', label: 'অফিস (Office)' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.value || !formData.label || !formData.prefix) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'সব তথ্য পূরণ করুন (Value, Label, Prefix)',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      return;
    }

    if (editingCategory) {
      // Update existing category
      const categoryId = editingCategory._id || editingCategory.id;
      updateMutation.mutate({
        customerTypeId: categoryId,
        updates: {
          value: formData.value,
          label: formData.label,
          prefix: formData.prefix,
          icon: formData.icon,
          type: formData.type
        }
      }, {
        onSuccess: () => {
          resetForm();
        }
      });
    } else {
      // Create new category
      createMutation.mutate(formData, {
        onSuccess: () => {
          resetForm();
        }
      });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      value: category.value,
      label: category.label,
      prefix: category.prefix,
      icon: category.icon,
      type: category.type
    });
  };

  // Check if customers are using this customer type
  const checkCustomersUsingType = async (customerTypeValue) => {
    try {
      const response = await axiosSecure.get(`/customers?type=${customerTypeValue}`);
      if (response.data.success) {
        const customers = response.data.customers || [];
        return customers.length;
      }
      return 0;
    } catch (error) {
      console.error('Error checking customers using type:', error);
      return 0;
    }
  };

  // View customers using this type
  const viewCustomersUsingType = async (customerTypeValue, customerTypeLabel) => {
    try {
      const response = await axiosSecure.get(`/customers?type=${customerTypeValue}`);
      if (response.data.success) {
        const customers = response.data.customers || [];
        
        if (customers.length === 0) {
          Swal.fire({
            title: 'কোন কাস্টমার নেই',
            text: 'এই টাইপের কোন কাস্টমার পাওয়া যায়নি।',
            icon: 'info',
            confirmButtonText: 'ঠিক আছে',
            background: isDark ? '#1F2937' : '#F9FAFB',
            customClass: {
              title: 'text-blue-600 font-bold text-xl',
              popup: 'rounded-2xl shadow-2xl'
            }
          });
          return;
        }

        // Create customer list HTML
        const customerList = customers.map(customer => 
          `<div class="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-600">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">${customer.name}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">ID: ${customer.customerId || customer.id}</div>
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              ${customer.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
            </div>
          </div>`
        ).join('');

        Swal.fire({
          title: `${customerTypeLabel} টাইপের কাস্টমার (${customers.length} জন)`,
          html: `
            <div class="max-h-64 overflow-y-auto">
              ${customerList}
            </div>
          `,
          icon: 'info',
          confirmButtonText: 'ঠিক আছে',
          background: isDark ? '#1F2937' : '#F9FAFB',
          customClass: {
            title: 'text-blue-600 font-bold text-xl',
            popup: 'rounded-2xl shadow-2xl'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কাস্টমার তালিকা লোড করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
    }
  };

  const handleDelete = async (categoryId, valueToDelete, categoryLabel) => {
    // First check if customers are using this type
    const customerCount = await checkCustomersUsingType(valueToDelete);
    
    if (customerCount > 0) {
      // Show enhanced confirmation with customer count and options
      const result = await Swal.fire({
        title: 'কাস্টমার টাইপ মুছতে পারবেন না',
        html: `
          <div class="text-center">
            <div class="text-red-500 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-lg mb-2">এই কাস্টমার টাইপ <strong>${customerCount} জন কাস্টমার</strong> ব্যবহার করছে।</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              কাস্টমার টাইপ মুছতে হলে আগে এই কাস্টমারদের অন্য টাইপে পরিবর্তন করতে হবে।
            </p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'কাস্টমার দেখুন',
        cancelButtonText: 'বাতিল করুন',
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#6B7280',
        background: isDark ? '#1F2937' : '#F9FAFB',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });

      if (result.isConfirmed) {
        // Show customers using this type
        await viewCustomersUsingType(valueToDelete, categoryLabel);
      }
      return;
    }

    // If no customers are using this type, proceed with normal deletion
    const confirmResult = await Swal.fire({
      title: 'নিশ্চিত করুন',
      text: 'আপনি কি এই কাস্টমার টাইপ মুছে ফেলতে চান?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'না, বাতিল করুন',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      background: isDark ? '#1F2937' : '#F9FAFB',
      customClass: {
        title: 'text-red-600 font-bold text-xl',
        popup: 'rounded-2xl shadow-2xl'
      }
    });

    if (confirmResult.isConfirmed) {
      deleteMutation.mutate({
        customerTypeId: categoryId,
        value: valueToDelete
      });
    }
  };

  const resetForm = () => {
    setFormData({
      value: '',
      label: '',
      prefix: '',
      icon: 'home',
      type: 'general'
    });
    setEditingCategory(null);
  };

  const getPrefixColor = (type) => {
    switch (type) {
      case 'service': return 'bg-blue-500';
      case 'customer': return 'bg-purple-500';
      case 'expense': return 'bg-red-500';
      case 'income': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            কাস্টমার টাইপ ব্যবস্থাপনা
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            আপনার ব্যবসার কাস্টমার টাইপ সংগঠিত এবং পরিচালনা করুন
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Add New Category Form */}
          <div className={`rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                নতুন কাস্টমার টাইপ যোগ করুন
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Value (ইংরেজি) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="hajj, umrah, air"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label (বাংলা) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="হাজ্জ, ওমরাহ, এয়ার"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prefix (প্রিফিক্স) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formData.prefix}
                  onChange={(e) => setFormData({...formData, prefix: e.target.value.toUpperCase()})}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="H, U, A"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  কাস্টমার আইডি জেনারেশনের জন্য (সর্বোচ্চ ৩ অক্ষর)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  আইকন (Icon)
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {iconOptions.map(icon => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                {editingCategory ? 'আপডেট করুন' : 'যোগ করুন'}
              </button>
            </form>
          </div>

          {/* Right Column - Current Categories List */}
          <div className={`rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                বর্তমান কাস্টমার টাইপসমূহ
              </h3>
            </div>

            <div className="p-6">
              {categories.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>কোন কাস্টমার টাইপ পাওয়া যায়নি</p>
                  <p className="text-sm">আপনার প্রথম কাস্টমার টাইপ তৈরি করতে শুরু করুন</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {categories.map(category => (
                    <div
                      key={category._id || category.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      } transition-colors duration-200`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="text-gray-600 dark:text-gray-400">
                          {iconMap[category.icon] || <Home className="h-4 w-4" />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {category.label}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({category.value})
                            </span>
                          </div>
                        </div>
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getPrefixColor(category.type)}`}>
                          {category.prefix}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                          title="সম্পাদনা"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id || category.id, category.value, category.label)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                          title="মুছে ফেলুন"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagment;


