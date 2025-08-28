import React, { useState } from 'react';
import { List, Search, Filter, Eye, Edit, Trash2, Package, Calculator, Download, Share2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';

const PackageList = () => {
  const [packages, setPackages] = useState([
    {
      id: 1,
      packageId: 'PKG2024001',
      name: 'প্রিমিয়াম হজ্জ প্যাকেজ ২০২৪',
      year: '2024',
      type: 'Haj',
      makkahHouseFee: 50000,
      madinaHouseFee: 40000,
      airFare: 80000,
      totalCost: 170000,
      status: 'Active',
      bookings: 45,
      maxCapacity: 100,
      createdAt: '2024-01-15',
      description: 'উচ্চমানের হজ্জ প্যাকেজ, মক্কা-মদিনায় প্রিমিয়াম বাড়ি সহ'
    },
    {
      id: 2,
      packageId: 'PKG2024002',
      name: 'স্ট্যান্ডার্ড উমরাহ প্যাকেজ ২০২৪',
      year: '2024',
      type: 'Umrah',
      makkahHouseFee: 35000,
      madinaHouseFee: 30000,
      airFare: 70000,
      totalCost: 135000,
      status: 'Active',
      bookings: 78,
      maxCapacity: 150,
      createdAt: '2024-01-16',
      description: 'সাশ্রয়ী উমরাহ প্যাকেজ, মানসম্পন্ন বাড়ি ও বিমান সেবা'
    },
    {
      id: 3,
      packageId: 'PKG2024003',
      name: 'ইকোনমি হজ্জ প্যাকেজ ২০২৪',
      year: '2024',
      type: 'Haj',
      makkahHouseFee: 25000,
      madinaHouseFee: 20000,
      airFare: 60000,
      totalCost: 105000,
      status: 'Draft',
      bookings: 0,
      maxCapacity: 80,
      createdAt: '2024-01-17',
      description: 'সাশ্রয়ী হজ্জ প্যাকেজ, বাজেট-বান্ধব বিকল্প'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [modalType, setModalType] = useState('view');

  const handleView = (pkg) => {
    setSelectedPackage(pkg);
    setModalType('view');
    setShowModal(true);
  };

  const handleEdit = (pkg) => {
    setSelectedPackage(pkg);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = (pkg) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${pkg.name} প্যাকেজ মুছে ফেলতে চান? এই কাজটি অপরিবর্তনীয়।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'না, বাতিল করুন',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        setPackages(prev => prev.filter(p => p.id !== pkg.id));
        
        Swal.fire({
          title: 'মুছে ফেলা হয়েছে!',
          text: `${pkg.name} প্যাকেজ সফলভাবে মুছে ফেলা হয়েছে।`,
          icon: 'success',
          confirmButtonColor: '#059669',
          confirmButtonText: 'ঠিক আছে'
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
    switch (type) {
      case 'Haj':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Umrah':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.packageId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || pkg.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || pkg.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getBookingPercentage = (bookings, maxCapacity) => {
    if (maxCapacity === 0) return 0;
    return Math.round((bookings / maxCapacity) * 100);
  };

  const totalPackages = packages.length;
  const activePackages = packages.filter(p => p.status === 'Active').length;
  const totalBookings = packages.reduce((sum, p) => sum + p.bookings, 0);
  const totalRevenue = packages.reduce((sum, p) => sum + (p.totalCost * p.bookings), 0);

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
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto">
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

      {/* Packages Table */}
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
                  মোট খরচ
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  বুকিং
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
              {filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {pkg.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {pkg.packageId}
                        </div>
                      </div>
                    </div>
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
                    <span className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400 truncate block">
                      {formatCurrency(pkg.totalCost)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="min-w-0">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-900 dark:text-white">
                        <span>{pkg.bookings}/{pkg.maxCapacity}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {getBookingPercentage(pkg.bookings, pkg.maxCapacity)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${getBookingPercentage(pkg.bookings, pkg.maxCapacity)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                      {pkg.status}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalType === 'view' ? 'প্যাকেজ তথ্য দেখুন' :
          modalType === 'edit' ? 'প্যাকেজ সম্পাদনা করুন' :
          'প্যাকেজ মুছুন'
        }
      >
        {modalType === 'view' && selectedPackage && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  প্যাকেজ নাম
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedPackage.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  প্যাকেজ আইডি
                </label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">{selectedPackage.packageId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ধরন
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedPackage.type)}`}>
                  {selectedPackage.type}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  বছর
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedPackage.year}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">খরচের বিবরণ</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">মক্কার বাড়ির ফি</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(selectedPackage.makkahHouseFee)}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">মদিনার বাড়ির ফি</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(selectedPackage.madinaHouseFee)}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">বিমান ভাড়া</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(selectedPackage.airFare)}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">মোট খরচ</label>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(selectedPackage.totalCost)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  স্ট্যাটাস
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPackage.status)}`}>
                  {selectedPackage.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  বুকিং
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedPackage.bookings}/{selectedPackage.maxCapacity}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                বিবরণ
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{selectedPackage.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PackageList;
