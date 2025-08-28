import React, { useState, useEffect } from 'react';
import { Plus, Save, Calculator, Package, DollarSign, Home, Plane } from 'lucide-react';
import Swal from 'sweetalert2';

const PackageCreation = () => {
  const [packages, setPackages] = useState([
    {
      id: 1,
      packageId: 'PKG2024001',
      year: '2024',
      makkahHouseFee: 50000,
      madinaHouseFee: 40000,
      airFare: 80000,
      totalCost: 170000,
      type: 'Haj',
      status: 'Active',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      packageId: 'PKG2024002',
      year: '2024',
      makkahHouseFee: 35000,
      madinaHouseFee: 30000,
      airFare: 70000,
      totalCost: 135000,
      type: 'Umrah',
      status: 'Active',
      createdAt: '2024-01-16'
    }
  ]);

  const [formData, setFormData] = useState({
    year: '',
    makkahHouseFee: '',
    madinaHouseFee: '',
    packageAirFare: '',
    type: 'Haj'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Auto-calculate total cost when fees change
  useEffect(() => {
    const makkah = parseFloat(formData.makkahHouseFee) || 0;
    const madina = parseFloat(formData.madinaHouseFee) || 0;
    const airFare = parseFloat(formData.packageAirFare) || 0;
    const total = makkah + madina + airFare;
    
    // Update form data with calculated total
    setFormData(prev => ({
      ...prev,
      totalCost: total
    }));
  }, [formData.makkahHouseFee, formData.madinaHouseFee, formData.packageAirFare]);

  const generatePackageId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PKG${year}${randomNum}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.year.trim()) {
      newErrors.year = 'হজ্জের বছর প্রয়োজন';
    }

    if (!formData.makkahHouseFee.trim()) {
      newErrors.makkahHouseFee = 'মক্কার বাড়ির ফি প্রয়োজন';
    } else if (parseFloat(formData.makkahHouseFee) <= 0) {
      newErrors.makkahHouseFee = 'মক্কার বাড়ির ফি ০ এর চেয়ে বেশি হতে হবে';
    }

    if (!formData.madinaHouseFee.trim()) {
      newErrors.madinaHouseFee = 'মদিনার বাড়ির ফি প্রয়োজন';
    } else if (parseFloat(formData.madinaHouseFee) <= 0) {
      newErrors.madinaHouseFee = 'মদিনার বাড়ির ফি ০ এর চেয়ে বেশি হতে হবে';
    }

    if (!formData.packageAirFare.trim()) {
      newErrors.packageAirFare = 'প্যাকেজ বিমান ভাড়া প্রয়োজন';
    } else if (parseFloat(formData.packageAirFare) <= 0) {
      newErrors.packageAirFare = 'প্যাকেজ বিমান ভাড়া ০ এর চেয়ে বেশি হতে হবে';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newPackage = {
        id: Date.now(),
        packageId: generatePackageId(),
        year: formData.year,
        makkahHouseFee: parseFloat(formData.makkahHouseFee),
        madinaHouseFee: parseFloat(formData.madinaHouseFee),
        airFare: parseFloat(formData.packageAirFare),
        totalCost: parseFloat(formData.totalCost),
        type: formData.type,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0]
      };

      setPackages(prev => [newPackage, ...prev]);
      
      // Reset form
      setFormData({
        year: '',
        makkahHouseFee: '',
        madinaHouseFee: '',
        packageAirFare: '',
        type: 'Haj'
      });
      
      setShowForm(false);
      
      // Show success message with SweetAlert
      Swal.fire({
        title: 'সফল!',
        text: 'প্যাকেজ সফলভাবে তৈরি করা হয়েছে!',
        icon: 'success',
        confirmButtonColor: '#059669',
        confirmButtonText: 'ঠিক আছে'
      });
      
    } catch (error) {
      console.error('Error creating package:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'ঠিক আছে'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Haj':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Umrah':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              হজ্জ ও উমরাহ প্যাকেজ তৈরি
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              নতুন হজ্জ ও উমরাহ প্যাকেজ তৈরি করুন
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm sm:text-base">{showForm ? 'ফর্ম বন্ধ করুন' : 'নতুন প্যাকেজ তৈরি করুন'}</span>
        </button>
      </div>

      {/* Package Creation Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 lg:pb-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-4">
                প্যাকেজ তথ্য
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  প্যাকেজের ধরন
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="Haj">হজ্জ প্যাকেজ</option>
                  <option value="Umrah">উমরাহ প্যাকেজ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  হজ্জের বছর <span className="text-red-500">*</span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.year ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">বছর নির্বাচন করুন</option>
                  <option value="2024">২০২৪</option>
                  <option value="2025">২০২৫</option>
                  <option value="2026">২০২৬</option>
                  <option value="2027">২০২৭</option>
                </select>
                {errors.year && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.year}</p>
                )}
              </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 lg:pb-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                বাড়ির ফি
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  মক্কার বাড়ির ফি (টাকা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="makkahHouseFee"
                  value={formData.makkahHouseFee}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1000"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.makkahHouseFee ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="50000"
                />
                {errors.makkahHouseFee && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.makkahHouseFee}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  মদিনার বাড়ির ফি (টাকা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="madinaHouseFee"
                  value={formData.madinaHouseFee}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1000"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.madinaHouseFee ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="40000"
                />
                {errors.madinaHouseFee && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.madinaHouseFee}</p>
                )}
              </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 lg:pb-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Plane className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                বিমান ভাড়া
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  প্যাকেজ বিমান ভাড়া (টাকা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="packageAirFare"
                  value={formData.packageAirFare}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1000"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.packageAirFare ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="80000"
                />
                {errors.packageAirFare && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.packageAirFare}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  মোট খরচ (টাকা)
                </label>
                <div className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(formData.totalCost || 0)}
                </div>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  স্বয়ংক্রিয়ভাবে গণনা করা হয়েছে
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 lg:pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full sm:w-auto px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'প্যাকেজ তৈরি করুন'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Packages List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 dark:text-white flex items-center">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
            প্যাকেজ তালিকা ({packages.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  প্যাকেজ আইডি
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ধরন
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  বছর
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  মক্কার ফি
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  মদিনার ফি
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  বিমান ভাড়া
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  মোট খরচ
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  স্ট্যাটাস
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  তারিখ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-mono truncate block">
                      {pkg.packageId}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(pkg.type)}`}>
                      {pkg.type}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                      {pkg.year}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                      {formatCurrency(pkg.makkahHouseFee)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                      {formatCurrency(pkg.madinaHouseFee)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                      {formatCurrency(pkg.airFare)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400 truncate block">
                      {formatCurrency(pkg.totalCost)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate block">
                      {pkg.createdAt}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackageCreation;
