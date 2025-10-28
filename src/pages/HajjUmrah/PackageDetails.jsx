import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Package,
  Calculator,
  DollarSign,
  Calendar,
  FileText,
  Tag,
  CheckCircle,
  AlertCircle,
  Eye,
  Printer,
  Share2,
  Download,
  Hotel,
  Plane
} from 'lucide-react';
import { usePackage, useDeletePackage } from '../../hooks/usePackageQueries';
import Swal from 'sweetalert2';

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: packageData, isLoading, error } = usePackage(id);
  const deletePackageMutation = useDeletePackage();

  const pkg = packageData || null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount || 0);
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Package className="w-5 h-5 mr-2 text-purple-600" />
                  মৌলিক তথ্য
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    প্যাকেজ নাম
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {pkg.packageName || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    প্যাকেজ আইডি
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">
                    {pkg._id?.slice(-6) || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    সাল
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {pkg.packageYear || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    মাস
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {pkg.packageMonth || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    প্যাকেজ টাইপ
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(pkg.packageType)}`}>
                    {pkg.packageType || 'N/A'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    কাস্টম প্যাকেজ টাইপ
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(pkg.customPackageType)}`}>
                    {pkg.customPackageType || 'N/A'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    রিয়াল রেট (SAR → BDT)
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {pkg.sarToBdtRate || 0}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    স্ট্যাটাস
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                    {pkg.status || 'N/A'}
                  </span>
                </div>

                {pkg.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      তৈরি করা হয়েছে
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(pkg.createdAt).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                )}
              </div>

              {pkg.notes && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    নোট
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {pkg.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            {pkg.totals && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                  খরচের বিস্তারিত
                </h2>

                {/* Passenger Type Totals */}
                {pkg.totals.passengerTotals && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      যাত্রীর ধরন অনুযায়ী খরচ
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Adult (প্রাপ্তবয়স্ক)</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(pkg.totals.passengerTotals.adult)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Child (শিশু)</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(pkg.totals.passengerTotals.child)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Infant (শিশু)</span>
                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(pkg.totals.passengerTotals.infant)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      বাংলাদেশ অংশ
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(pkg.totals.bangladeshCosts || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      সৌদি অংশ
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(pkg.totals.saudiCosts || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      হোটেল খরচ
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(pkg.totals.hotelCosts || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ফি
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(pkg.totals.fees || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ছাড়
                    </span>
                    <span className="text-sm font-semibold text-red-600">
                      -{formatCurrency(pkg.costs?.discount || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-t-2 border-gray-300 dark:border-gray-600 mt-3">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      মোট খরচ
                    </span>
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(pkg.totals.grandTotal || pkg.totals.subtotal || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Costs */}
            {pkg.costs && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  খরচের বিবরণ
                </h2>

                {/* Bangladesh Costs */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">বাংলাদেশ অংশ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pkg.costs.idCard > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">আইডি কার্ড ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.idCard)}</span>
                      </div>
                    )}
                    {pkg.costs.hajjKollan > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">হজ্জ কল্যাণ ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.hajjKollan)}</span>
                      </div>
                    )}
                    {pkg.costs.trainFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ট্রেনিং ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.trainFee)}</span>
                      </div>
                    )}
                    {pkg.costs.hajjGuide > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">হজ গাইড ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.hajjGuide)}</span>
                      </div>
                    )}
                    {pkg.costs.govtServiceCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">সার্ভিস চার্জ (সরকারি)</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.govtServiceCharge)}</span>
                      </div>
                    )}
                    {pkg.costs.licenseFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">লাইসেন্স চার্জ ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.licenseFee)}</span>
                      </div>
                    )}
                    {pkg.costs.transportFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">যাতায়াত ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.transportFee)}</span>
                      </div>
                    )}
                    {pkg.costs.visaFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ভিসা ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.visaFee)}</span>
                      </div>
                    )}
                    {pkg.costs.insuranceFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ইনস্যুরেন্স ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.insuranceFee)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Saudi Costs */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">সৌদি অংশ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pkg.costs.zamzamWater > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">জমজম পানি ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.zamzamWater)}</span>
                      </div>
                    )}
                    {pkg.costs.maktab > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">মক্তব ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.maktab)}</span>
                      </div>
                    )}
                    {pkg.costs.electronicsFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ইলেকট্রনিক্স ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.electronicsFee)}</span>
                      </div>
                    )}
                    {pkg.costs.groundServiceFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">গ্রাউন্ড সার্ভিস ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.groundServiceFee)}</span>
                      </div>
                    )}
                    {pkg.costs.makkahRoute > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">মক্কা রুট ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.makkahRoute)}</span>
                      </div>
                    )}
                    {pkg.costs.baggage > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ব্যাগেজ ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.baggage)}</span>
                      </div>
                    )}
                    {pkg.costs.serviceCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">সার্ভিস চার্জ ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.serviceCharge)}</span>
                      </div>
                    )}
                    {pkg.costs.monazzem > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">মোনাজ্জেম ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.monazzem)}</span>
                      </div>
                    )}
                    {pkg.costs.food > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">খাবার</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.food)}</span>
                      </div>
                    )}
                    {pkg.costs.ziyaraFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">জিয়ারা ফি</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(pkg.costs.ziyaraFee)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                  সারাংশ
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      মোট খরচ
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(pkg.totals?.grandTotal || pkg.totals?.subtotal || 0)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">প্যাকেজ টাইপ</span>
                      <span className="font-medium text-gray-900 dark:text-white">{pkg.customPackageType || pkg.packageType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">সাল</span>
                      <span className="font-medium text-gray-900 dark:text-white">{pkg.packageYear || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">স্ট্যাটাস</span>
                      <span className={`font-medium px-2 py-1 rounded-full text-xs ${getStatusColor(pkg.status)}`}>
                        {pkg.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;

