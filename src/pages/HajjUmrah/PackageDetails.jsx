import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Package,
  Calculator,
  FileText,
  AlertCircle,
  Printer,
  Users,
  User,
  CreditCard
} from 'lucide-react';
import { usePackage, useDeletePackage, usePackageCustomers } from '../../hooks/usePackageQueries';
import Swal from 'sweetalert2';

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: packageData, isLoading, error } = usePackage(id);
  const deletePackageMutation = useDeletePackage();
  const { data: customersData, isLoading: customersLoading } = usePackageCustomers(id);

  const pkg = packageData || null;
  const customers = customersData || { haji: [], umrah: [], all: [] };

  // Calculate total income from customers
  const calculateTotalIncome = () => {
    const allCustomers = customers.all || [];
    let totalIncome = 0;
    let totalPaid = 0;
    let totalDue = 0;

    allCustomers.forEach(customer => {
      const totalAmount = parseFloat(customer.totalAmount) || 0;
      const paidAmount = parseFloat(customer.paidAmount) || 0;
      const dueAmount = totalAmount - paidAmount;

      totalIncome += totalAmount;
      totalPaid += paidAmount;
      totalDue += Math.max(0, dueAmount);
    });

    return {
      totalIncome,
      totalPaid,
      totalDue,
      customerCount: allCustomers.length
    };
  };

  const incomeStats = calculateTotalIncome();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: FileText },
    { id: 'package', label: 'Package Info', icon: Package },
    { id: 'financial', label: 'Financial', icon: CreditCard }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
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

  const getHotelDisplayName = (hotelType) => {
    const hotelNames = {
      makkahHotel1: 'মক্কা হোটেল ০১',
      makkahHotel2: 'মক্কা হোটেল ০২',
      makkahHotel3: 'মক্কা হোটেল ০৩',
      madinaHotel1: 'মদিনা হোটেল ০১',
      madinaHotel2: 'মদিনা হোটেল ০২'
    };
    return hotelNames[hotelType] || hotelType;
  };

  const handleEdit = () => {
    navigate(`/hajj-umrah/package-list/${id}/edit`);
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `${pkg.packageName || 'এই'} প্যাকেজ মুছে ফেলতে চান? এই কাজটি অপরিবর্তনীয়।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'না, বাতিল করুন',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        deletePackageMutation.mutate(id, {
          onSuccess: () => {
            navigate('/hajj-umrah/package-list');
          }
        });
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">প্যাকেজ লোড করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">প্যাকেজ লোড করতে সমস্যা হয়েছে</p>
          <button
            onClick={() => navigate('/hajj-umrah/package-list')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            প্যাকেজ তালিকায় ফিরুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 no-print">
          <button
            onClick={() => navigate('/hajj-umrah/package-list')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">প্যাকেজ তালিকায় ফিরুন</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {pkg.packageName || 'Unnamed Package'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                প্যাকেজ বিস্তারিত তথ্য দেখুন এবং সম্পাদনা করুন
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
              <button
                onClick={() => navigate(`/hajj-umrah/package-list/${id}/customers`)}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Assign করা কাস্টমার</span>
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>সম্পাদনা করুন</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>মুছুন</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${isActive
                        ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">স্ট্যাটাস</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                          {pkg.status || 'N/A'}
                        </span>
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">প্যাকেজ টাইপ</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(pkg.packageType)}`}>
                          {pkg.packageType || 'N/A'}
                        </span>
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">রিয়াল রেট</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatNumber(pkg.sarToBdtRate)} SAR → BDT
                      </p>
                    </div>
                    <Calculator className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    প্যাকেজ নাম
                  </label>
                  <p className="text-base text-gray-900 dark:text-white font-semibold">
                    {pkg.packageName || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    প্যাকেজ আইডি
                  </label>
                  <p className="text-base text-gray-900 dark:text-white font-mono">
                    {pkg._id?.slice(-6) || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    সাল
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">
                    {pkg.packageYear || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    মাস
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">
                    {pkg.packageMonth || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    কাস্টম প্যাকেজ টাইপ
                  </label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(pkg.customPackageType)}`}>
                    {pkg.customPackageType || 'N/A'}
                  </span>
                </div>
                {pkg.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      তৈরি করা হয়েছে
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {new Date(pkg.createdAt).toLocaleDateString('en-US')}
                    </p>
                  </div>
                )}
              </div>

              {/* Cost Summary */}
              {pkg.totals?.passengerTotals && (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    যাত্রীর ধরন অনুযায়ী খরচ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Adult (প্রাপ্তবয়স্ক)</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(pkg.totals.passengerTotals.adult)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Child (শিশু)</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(pkg.totals.passengerTotals.child)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Infant (শিশু)</p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(pkg.totals.passengerTotals.infant)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    প্যাকেজ নাম
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {pkg.packageName || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    প্যাকেজ আইডি
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {pkg._id || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    সাল
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {pkg.packageYear || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    মাস
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {pkg.packageMonth || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    প্যাকেজ টাইপ
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(pkg.packageType)}`}>
                      {pkg.packageType || 'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    কাস্টম প্যাকেজ টাইপ
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(pkg.customPackageType)}`}>
                      {pkg.customPackageType || 'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    রিয়াল রেট (SAR → BDT)
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {formatNumber(pkg.sarToBdtRate)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    স্ট্যাটাস
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                      {pkg.status || 'N/A'}
                    </span>
                  </div>
                </div>

                {pkg.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      তৈরি করা হয়েছে
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {new Date(pkg.createdAt).toLocaleDateString('en-US')}
                    </p>
                  </div>
                )}
              </div>

              {pkg.notes && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    নোট
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-4 rounded-lg whitespace-pre-wrap">
                    {pkg.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Package Info Tab */}
          {activeTab === 'package' && pkg.costs && (
            <div className="space-y-6">

              {/* Bangladesh Costs */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">বাংলাদেশ অংশ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkg.costs.idCard !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">আইডি কার্ড ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.idCard)}</span>
                    </div>
                  )}
                  {pkg.costs.hajjKollan !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">হজ্জ কল্যাণ ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.hajjKollan)}</span>
                    </div>
                  )}
                  {pkg.costs.trainFee !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ট্রেনিং ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.trainFee)}</span>
                    </div>
                  )}
                  {pkg.costs.hajjGuide !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">হজ গাইড ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.hajjGuide)}</span>
                    </div>
                  )}
                  {pkg.costs.govtServiceCharge !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">সার্ভিস চার্জ (সরকারি)</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.govtServiceCharge)}</span>
                    </div>
                  )}
                  {pkg.costs.licenseFee !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">লাইসেন্স চার্জ ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.licenseFee)}</span>
                    </div>
                  )}
                  {pkg.costs.transportFee !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">যাতায়াত ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.transportFee)}</span>
                    </div>
                  )}
                  {pkg.costs.visaFee !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ভিসা ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.visaFee)}</span>
                    </div>
                  )}
                  {pkg.costs.insuranceFee !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ইনস্যুরেন্স ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.insuranceFee)}</span>
                    </div>
                  )}
                  {pkg.costs.otherBdCosts !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">অন্যান্য খরচ</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.otherBdCosts)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Air Fare */}
              {(pkg.costs.airFareDetails || pkg.costs.airFare !== undefined) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">বিমান ভাড়া</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pkg.costs.airFareDetails ? (
                      <>
                        {pkg.costs.airFareDetails.adult?.price !== undefined && (
                          <div className="flex items-center gap-x-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">বিমান ভাড়া (Adult)</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.airFareDetails.adult.price)}</span>
                          </div>
                        )}
                        {pkg.costs.airFareDetails.child?.price !== undefined && (
                          <div className="flex items-center gap-x-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">বিমান ভাড়া (Child)</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.airFareDetails.child.price)}</span>
                          </div>
                        )}
                        {pkg.costs.airFareDetails.infant?.price !== undefined && (
                          <div className="flex items-center gap-x-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">বিমান ভাড়া (Infant)</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.airFareDetails.infant.price)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      pkg.costs.airFare !== undefined && (
                        <div className="flex items-center gap-x-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">বিমান ভাড়া</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.airFare)}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Hotel Costs */}
              {(pkg.costs.hotelDetails || 
                pkg.costs.makkahHotel1 !== undefined || 
                pkg.costs.makkahHotel2 !== undefined || 
                pkg.costs.makkahHotel3 !== undefined || 
                pkg.costs.madinaHotel1 !== undefined || 
                pkg.costs.madinaHotel2 !== undefined) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">হোটেল ভাড়া</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pkg.costs.hotelDetails ? (
                      Object.keys(pkg.costs.hotelDetails).map((hotelType) => {
                        const hotel = pkg.costs.hotelDetails[hotelType];
                        const sarToBdtRate = pkg.sarToBdtRate || 1;
                        
                        return (
                          <React.Fragment key={hotelType}>
                            {hotel.adult?.price !== undefined && hotel.adult?.nights !== undefined && (
                              <div className="flex items-center gap-x-3">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {getHotelDisplayName(hotelType)} (Adult) - {hotel.adult.nights} রাত
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency((parseFloat(hotel.adult.price) || 0) * (parseFloat(hotel.adult.nights) || 0) * sarToBdtRate)}
                                </span>
                              </div>
                            )}
                            {hotel.child?.price !== undefined && hotel.child?.nights !== undefined && (
                              <div className="flex items-center gap-x-3">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {getHotelDisplayName(hotelType)} (Child) - {hotel.child.nights} রাত
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency((parseFloat(hotel.child.price) || 0) * (parseFloat(hotel.child.nights) || 0) * sarToBdtRate)}
                                </span>
                              </div>
                            )}
                            {hotel.infant?.price !== undefined && hotel.infant?.nights !== undefined && (
                              <div className="flex items-center gap-x-3">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {getHotelDisplayName(hotelType)} (Infant) - {hotel.infant.nights} রাত
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency((parseFloat(hotel.infant.price) || 0) * (parseFloat(hotel.infant.nights) || 0) * sarToBdtRate)}
                                </span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <>
                        {pkg.costs.makkahHotel1 !== undefined && (
                          <div className="flex items-center gap-x-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">মক্কা হোটেল ০১</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.makkahHotel1)}</span>
                          </div>
                        )}
                        {pkg.costs.makkahHotel2 !== undefined && (
                          <div className="flex items-center gap-x-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">মক্কা হোটেল ০২</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.makkahHotel2)}</span>
                          </div>
                        )}
                        {pkg.costs.makkahHotel3 !== undefined && (
                          <div className="flex items-center gap-x-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">মক্কা হোটেল ০৩</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.makkahHotel3)}</span>
                          </div>
                        )}
                        {pkg.costs.madinaHotel1 !== undefined && (
                          <div className="flex items-center gap-x-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">মদিনা হোটেল ০১</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.madinaHotel1)}</span>
                          </div>
                        )}
                        {pkg.costs.madinaHotel2 !== undefined && (
                          <div className="flex items-center gap-x-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">মদিনা হোটেল ০২</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.madinaHotel2)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Saudi Costs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সৌদি অংশ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkg.costs.zamzamWater !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">জমজম পানি ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.zamzamWater)}</span>
                    </div>
                  )}
                  {pkg.costs.maktab !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">মক্তব ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.maktab)}</span>
                    </div>
                  )}
                  {pkg.costs.electronicsFee !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ইলেকট্রনিক্স ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.electronicsFee)}</span>
                    </div>
                  )}
                  {pkg.costs.groundServiceFee !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">গ্রাউন্ড সার্ভিস ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.groundServiceFee)}</span>
                    </div>
                  )}
                  {pkg.costs.makkahRoute !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">মক্কা রুট ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.makkahRoute)}</span>
                    </div>
                  )}
                  {pkg.costs.baggage !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ব্যাগেজ ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.baggage)}</span>
                    </div>
                  )}
                  {pkg.costs.serviceCharge !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">সার্ভিস চার্জ ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.serviceCharge)}</span>
                    </div>
                  )}
                  {pkg.costs.monazzem !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">মোনাজ্জেম ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.monazzem)}</span>
                    </div>
                  )}
                  {pkg.costs.food !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">খাবার</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.food)}</span>
                    </div>
                  )}
                  {pkg.costs.ziyaraFee !== undefined && (
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">জিয়ারা ফি</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.ziyaraFee)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Total Income Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                  মোট আয় (Total Income)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">মোট কাস্টমার</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {incomeStats.customerCount}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border-2 border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">মোট আয় (Expected)</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(incomeStats.totalIncome)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border-2 border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">মোট গ্রহীত</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(incomeStats.totalPaid)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border-2 border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">বকেয়া</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(incomeStats.totalDue)}
                    </p>
                  </div>
                </div>

                {incomeStats.customerCount === 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      এখনও কোন কাস্টমার এই প্যাকেজে assign করা হয়নি। কাস্টমার assign করার পর এখানে আয়ের তথ্য দেখাবে।
                    </p>
                  </div>
                )}
              </div>

              {/* Cost Breakdown */}
              {pkg.totals && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                    খরচের বিস্তারিত
                  </h2>

                  {/* Passenger Type Totals */}
                  {pkg.totals.passengerTotals && (
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                        যাত্রীর ধরন অনুযায়ী খরচ
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Adult (প্রাপ্তবয়স্ক)</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(pkg.totals.passengerTotals.adult)}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Child (শিশু)</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(pkg.totals.passengerTotals.child)}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Infant (শিশু)</p>
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(pkg.totals.passengerTotals.infant)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Cost Summary */}
                {pkg.totals && (
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">মোট খরচের সারাংশ</h3>
                    <div className="space-y-2">
                      {pkg.totals.total !== undefined && (
                        <div className="flex justify-between items-center py-3 px-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                          <span className="text-base font-medium text-gray-700 dark:text-gray-300">মোট খরচ</span>
                          <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(pkg.totals.total)}
                          </span>
                        </div>
                      )}
                      {pkg.totals.totalBD !== undefined && (
                        <div className="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট খরচ (BDT)</span>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(pkg.totals.totalBD)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Profit/Loss Summary */}
                {incomeStats.customerCount > 0 && pkg.totals && (
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border-2 border-indigo-200 dark:border-indigo-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">লাভ/ক্ষতি (Profit/Loss)</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-3 px-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <span className="text-base font-medium text-gray-700 dark:text-gray-300">মোট আয়</span>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(incomeStats.totalIncome)}
                        </span>
                      </div>
                      {pkg.totals.total !== undefined && (
                        <div className="flex justify-between items-center py-3 px-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                          <span className="text-base font-medium text-gray-700 dark:text-gray-300">মোট খরচ</span>
                          <span className="text-xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(pkg.totals.total)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-3 px-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
                        <span className="text-base font-semibold text-gray-700 dark:text-gray-300">নিট লাভ/ক্ষতি</span>
                        <span className={`text-xl font-bold ${(incomeStats.totalIncome - (pkg.totals.total || 0)) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(incomeStats.totalIncome - (pkg.totals.total || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;

