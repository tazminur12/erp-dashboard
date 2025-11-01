import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Search, Filter, Eye, Edit, Trash2, Package, Calculator, Download, Share2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { usePackages, useDeletePackage } from '../../hooks/usePackageQueries';
import { useHajiList } from '../../hooks/UseHajiQueries';
import { useUmrahList } from '../../hooks/UseUmrahQuries';

const PackageList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Fetch packages using the hook
  const { data: packagesData, isLoading, refetch } = usePackages({});
  const deletePackageMutation = useDeletePackage();

  // Fetch all customers to calculate bookings and revenue
  const { data: hajiData, isLoading: hajiLoading } = useHajiList({ limit: 10000 });
  const { data: umrahData, isLoading: umrahLoading } = useUmrahList({ limit: 10000 });

  const packages = packagesData?.data || [];
  const allHajiCustomers = hajiData?.data || [];
  const allUmrahCustomers = umrahData?.data || [];

  const handleView = (pkg) => {
    navigate(`/hajj-umrah/package-list/${pkg._id}`);
  };

  const handleEdit = (pkg) => {
    navigate(`/hajj-umrah/package-list/${pkg._id}/edit`);
  };

  const handleDelete = (pkg) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${pkg.packageName || pkg.name} প্যাকেজ মুছে ফেলতে চান? এই কাজটি অপরিবর্তনীয়।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'না, বাতিল করুন',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        deletePackageMutation.mutate(pkg._id, {
          onSuccess: () => {
            refetch();
          }
        });
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Suspended':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeColor = (type) => {
    // Remove "Custom " prefix if present
    const cleanType = type?.replace(/^Custom\s+/i, '') || type;
    
    switch (cleanType) {
      case 'Haj':
      case 'Hajj':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Umrah':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getDisplayType = (type) => {
    // Remove "Custom " prefix if present for display
    if (!type) return 'Unknown';
    return type.replace(/^Custom\s+/i, '');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredPackages = packages.filter(pkg => {
    const pkgName = pkg.packageName || pkg.name || '';
    const matchesSearch = pkgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pkg._id?.slice(-6) || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || 
                       (pkg.customPackageType && selectedType === 'Haj') ||
                       (pkg.packageType && selectedType.toLowerCase() === pkg.packageType.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
                         (pkg.status && selectedStatus.toLowerCase() === pkg.status.toLowerCase());
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getBookingPercentage = (bookings, maxCapacity) => {
    if (maxCapacity === 0) return 0;
    return Math.round((bookings / maxCapacity) * 100);
  };

  // Calculate bookings and revenue for all packages
  const { totalBookings, totalRevenue } = useMemo(() => {
    let bookings = 0;
    let revenue = 0;

    // Combine all customers
    const allCustomers = [...allHajiCustomers, ...allUmrahCustomers];

    // Group customers by package ID
    const packageCustomersMap = new Map();

    allCustomers.forEach(customer => {
      // Check multiple possible fields for package assignment
      const packageId = customer.packageId || 
                       customer.packageInfo?.packageId || 
                       customer.packageInfo?._id;

      if (packageId) {
        if (!packageCustomersMap.has(packageId)) {
          packageCustomersMap.set(packageId, []);
        }
        packageCustomersMap.get(packageId).push(customer);
      }
    });

    // Calculate totals across all packages
    packageCustomersMap.forEach((customers) => {
      bookings += customers.length;
      customers.forEach(customer => {
        const totalAmount = parseFloat(customer.totalAmount) || 0;
        revenue += totalAmount;
      });
    });

    return { totalBookings: bookings, totalRevenue: revenue };
  }, [allHajiCustomers, allUmrahCustomers]);

  const totalPackages = packages.length;
  const activePackages = packages.filter(p => p.status === 'Active' || p.status === 'Draft').length;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <List className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              হজ্জ ও উমরাহ প্যাকেজ তালিকা
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              সব প্যাকেজের তথ্য ও ব্যবস্থাপনা
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto">
            <Download className="w-4 h-4" />
            <span className="text-sm sm:text-base">এক্সপোর্ট</span>
          </button>
          <button 
            onClick={() => navigate('/hajj-umrah/package-creation')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
          >
            <Package className="w-4 h-4" />
            <span className="text-sm sm:text-base">নতুন প্যাকেজ</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মোট প্যাকেজ</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{totalPackages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">সক্রিয় প্যাকেজ</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{activePackages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <List className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মোট বুকিং</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">মোট আয়</p>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="প্যাকেজ নাম বা আইডি দিয়ে সার্চ করুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">সব ধরন</option>
              <option value="Haj">হজ্জ</option>
              <option value="Umrah">উমরাহ</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">সব স্ট্যাটাস</option>
              <option value="Active">সক্রিয়</option>
              <option value="Inactive">নিষ্ক্রিয়</option>
              <option value="Draft">খসড়া</option>
              <option value="Suspended">স্থগিত</option>
            </select>
            
            <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm sm:text-base">ফিল্টার</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {(isLoading || hajiLoading || umrahLoading) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">প্যাকেজ লোড করা হচ্ছে...</p>
        </div>
      )}

      {/* Packages Table */}
      {!isLoading && !hajiLoading && !umrahLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    প্যাকেজ
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ধরন
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    বছর
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Adult
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Child
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Infant
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPackages.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">কোন প্যাকেজ নেই</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        এখনও কোন প্যাকেজ তৈরি করা হয়নি। একটি নতুন প্যাকেজ তৈরি করুন।
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPackages.map((pkg) => (
                    <tr key={pkg._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                          </div>
                          <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                              {pkg.packageName || pkg.name || 'Unnamed Package'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {pkg._id?.slice(-6) || pkg.packageId || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(pkg.customPackageType || pkg.type || 'Unknown')}`}>
                          {getDisplayType(pkg.customPackageType || pkg.type || 'Unknown')}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                          {pkg.packageYear || pkg.year || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 truncate block">
                          {formatCurrency(pkg.totals?.passengerTotals?.adult || 0)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 truncate block">
                          {formatCurrency(pkg.totals?.passengerTotals?.child || 0)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400 truncate block">
                          {formatCurrency(pkg.totals?.passengerTotals?.infant || 0)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status || 'Unknown')}`}>
                          {pkg.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => handleView(pkg)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                            title="দেখুন"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(pkg)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(pkg)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                            title="মুছুন"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default PackageList;
