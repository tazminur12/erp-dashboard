import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Building2, Phone, User, MapPin, Calendar, CreditCard, FileText, ArrowLeft, Clock, Edit,
  DollarSign, TrendingUp, TrendingDown, Wallet, Receipt, AlertCircle, CheckCircle,
  Briefcase, Globe, Mail, Hash, Calendar as CalendarIcon, Star, Loader2
} from 'lucide-react';
import { useVendor, useVendorFinancials, useVendorBillsByVendor } from '../../hooks/useVendorQueries';



const VendorDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('bills'); // 'information', 'financial', 'bills' - Start with bills tab (default)

  // Use React Query hooks to fetch vendor data
  const { 
    data: vendor, 
    isLoading: loading, 
    error: vendorError,
    refetch: refetchVendor 
  } = useVendor(id);

  const { 
    data: financialData, 
    isLoading: financialLoading,
    error: financialError,
    refetch: refetchFinancials
  } = useVendorFinancials(id);

  // Fetch vendor bills
  const { 
    data: vendorBills = [], 
    isLoading: billsLoading,
    error: billsError,
    refetch: refetchBills
  } = useVendorBillsByVendor(id);

  // Handle refresh - refetch all data
  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchVendor(),
        refetchFinancials(),
        refetchBills()
      ]);
    } catch (error) {
      console.error('Error refreshing vendor data:', error);
    }
  };

  // Default financial data for fallback
  const defaultFinancialData = {
    totalOrders: 0,
    totalAmount: 0,
    outstandingAmount: 0,
    paidAmount: 0,
    lastPaymentDate: null,
    averageOrderValue: 0,
    creditLimit: 0,
    paymentTerms: 'Net 30',
    businessType: 'Unknown',
    registrationDate: null,
    rating: 0,
    status: 'Unknown'
  };

  // Calculate financial data from vendor bills if API data is not available
  const calculatedFinancials = useMemo(() => {
    if (vendorBills.length === 0) {
      return {
        totalBillAmount: 0,
        totalPaid: 0,
        totalDue: 0,
      };
    }

    const totalBillAmount = vendorBills.reduce((sum, bill) => sum + (Number(bill.totalAmount) || 0), 0);
    const totalPaid = vendorBills.reduce((sum, bill) => sum + (Number(bill.paidAmount) || 0), 0);
    const totalDue = Math.max(0, totalBillAmount - totalPaid); // Ensure non-negative

    return {
      totalBillAmount,
      totalPaid,
      totalDue,
    };
  }, [vendorBills]);

  // Use actual data merged with defaults to avoid undefined fields
  // If financialData is empty/zero, use calculated values from bills
  const financial = useMemo(() => {
    const apiFinancial = { ...defaultFinancialData, ...(financialData || {}) };
    
    // If API data is empty/zero, use calculated values from vendor bills
    if ((!apiFinancial.paidAmount || apiFinancial.paidAmount === 0) && calculatedFinancials.totalPaid > 0) {
      apiFinancial.paidAmount = calculatedFinancials.totalPaid;
    }
    if ((!apiFinancial.outstandingAmount || apiFinancial.outstandingAmount === 0) && calculatedFinancials.totalDue > 0) {
      apiFinancial.outstandingAmount = calculatedFinancials.totalDue;
    }
    if ((!apiFinancial.totalAmount || apiFinancial.totalAmount === 0) && calculatedFinancials.totalBillAmount > 0) {
      apiFinancial.totalAmount = calculatedFinancials.totalBillAmount;
    }
    
    return apiFinancial;
  }, [financialData, calculatedFinancials]);

  const formatCurrency = (amount = 0) => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;

  const recentTransactions = vendor?.recentActivity?.transactions || [];
  const recentBills = vendor?.recentActivity?.bills || [];

  const activityItems = useMemo(() => {
    const txItems = recentTransactions.map((tx, idx) => ({
      id: `tx-${tx.transactionId || idx}`,
      title: tx.transactionType ? (tx.transactionType === 'credit' ? 'ক্রেডিট' : tx.transactionType === 'debit' ? 'ডেবিট' : tx.transactionType.toUpperCase()) : 'লেনদেন',
      description: `${tx.reference || 'রেফারেন্স'} • ${formatCurrency(tx.amount)}${tx.paymentMethod ? ` • ${tx.paymentMethod}` : ''}`,
      time: tx.createdAt || tx.date || new Date().toISOString(),
      icon: tx.transactionType === 'debit' ? TrendingDown : TrendingUp,
      tone: tx.transactionType === 'debit' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
    }));

    const billItems = recentBills.map((bill, idx) => ({
      id: `bill-${bill.billId || idx}`,
      title: bill.billType || 'বিল',
      description: `${bill.billNumber || '—'} • ${formatCurrency(bill.totalAmount)} • পরিশোধিত ${formatCurrency(bill.paidAmount)}`,
      time: bill.createdAt || bill.billDate || new Date().toISOString(),
      icon: Receipt,
      tone: 'text-purple-600 dark:text-purple-400',
    }));

    return [...txItems, ...billItems].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
  }, [recentTransactions, recentBills]);

  // Handle error state: avoid modal; rely on inline not-found UI
  React.useEffect(() => {
    if (vendorError) {
      console.error('Vendor fetch error:', vendorError);
    }
  }, [vendorError]);

  // Debug logging
  React.useEffect(() => {
    console.log('VendorDetails - ID:', id);

  }, [id, loading, vendor, vendorError, financialLoading, financialData, financialError]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <div className="text-gray-500 dark:text-gray-400">ভেন্ডর তথ্য লোড হচ্ছে...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 dark:text-gray-400 text-lg">ভেন্ডর পাওয়া যায়নি</div>
            <Link to="/vendors" className="text-purple-600 hover:text-purple-700 mt-2 inline-block">
              ← ভেন্ডর তালিকায় ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Vendor Details - {vendor.tradeName}</title>
        <meta name="description" content={`Detailed information and financials for vendor ${vendor.tradeName}.`} />
      </Helmet>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {vendor.logo ? (
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src={vendor.logo}
                  alt={`${vendor.tradeName} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{vendor.tradeName}</h1>
              <p className="text-purple-100 text-lg">{vendor.ownerName}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                  <Hash className="w-4 h-4" />
                  {vendor.vendorId}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {financial.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to={`/vendors/${vendor._id || vendor.vendorId}/bank-accounts`}
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-medium transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              ব্যাংক একাউন্ট
            </Link>
            <Link 
              to={`/vendors/${vendor._id || vendor.vendorId}/edit`} 
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              ভেন্ডর সম্পাদনা
            </Link>
            <Link 
              to="/vendors" 
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              তালিকায় ফিরে যান
            </Link>
          </div>
        </div>
      </div>

      

      {/* Profile Totals - ভেন্ডর বিল, পরিশোধ, বকেয়া */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ভেন্ডর বিল */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ভেন্ডর বিল</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ৳{calculatedFinancials.totalBillAmount.toLocaleString('bn-BD')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                মোট {vendorBills.length} টি বিল
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        {/* পরিশোধ */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">পরিশোধ</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ৳{calculatedFinancials.totalPaid.toLocaleString('bn-BD')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {vendorBills.length > 0 
                  ? `${vendorBills.filter(b => {
                      const due = (Number(b.totalAmount) || 0) - (Number(b.paidAmount) || 0);
                      return due <= 0;
                    }).length} টি বিল পরিশোধিত`
                  : 'কোনো বিল নেই'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        {/* বকেয়া */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">বকেয়া</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ৳{calculatedFinancials.totalDue.toLocaleString('bn-BD')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {vendorBills.length > 0 
                  ? `${vendorBills.filter(b => {
                      const due = (Number(b.totalAmount) || 0) - (Number(b.paidAmount) || 0);
                      return due > 0;
                    }).length} টি বিল বকেয়া`
                  : 'কোনো বিল নেই'}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Tab Headers */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'financial'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                আর্থিক তথ্য
              </div>
            </button>
            <button
              onClick={() => setActiveTab('information')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'information'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                ভেন্ডর তথ্য
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bills')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'bills'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                ভেন্ডর বিল
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Vendor Information Tab */}
          {activeTab === 'information' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {vendor.logo && (
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                        <img
                          src={vendor.logo}
                          alt={`${vendor.tradeName} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ভেন্ডর লোগো</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">কোম্পানির ব্র্যান্ডিং</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Hash className="w-5 h-5 mt-1 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">ভেন্ডর আইডি</div>
                      <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.vendorId || vendor._id}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 mt-1 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">মালিকের নাম</div>
                      <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.ownerName}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">ব্যবসার অবস্থান</div>
                      <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.tradeLocation}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 mt-1 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">যোগাযোগের নম্বর</div>
                      <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.contactNo}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-1 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">জন্ম তারিখ</div>
                      <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.dob || 'প্রদান করা হয়নি'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 mt-1 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">এনআইডি নম্বর</div>
                      <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.nid || 'প্রদান করা হয়নি'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 mt-1 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">পাসপোর্ট নম্বর</div>
                      <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.passport || 'প্রদান করা হয়নি'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Financial Data Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              {financialLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                    <span className="text-gray-600 dark:text-gray-400">আর্থিক তথ্য লোড হচ্ছে...</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">পরিশোধিত পরিমাণ</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ৳{Number(financial.paidAmount || calculatedFinancials.totalPaid || 0).toLocaleString('bn-BD')}
                        </div>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">বকেয়া পরিমাণ</div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          ৳{Number(financial.outstandingAmount || calculatedFinancials.totalDue || 0).toLocaleString('bn-BD')}
                        </div>
                      </div>
                      <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">মোট বিল পরিমাণ</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ৳{Number(financial.totalAmount || calculatedFinancials.totalBillAmount || 0).toLocaleString('bn-BD')}
                        </div>
                      </div>
                      <Receipt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    {/* Optional breakdown if available on profile */}
                    {(vendor?.hajDue !== undefined || vendor?.umrahDue !== undefined) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="text-xs text-gray-600 dark:text-gray-400">হজ্জ বকেয়া</div>
                          <div className="text-lg font-semibold text-red-600 dark:text-red-400">৳{Number(vendor?.hajDue ?? 0).toLocaleString('bn-BD')}</div>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <div className="text-xs text-gray-600 dark:text-gray-400">উমরাহ বকেয়া</div>
                          <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">৳{Number(vendor?.umrahDue ?? 0).toLocaleString('bn-BD')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">ক্রেডিট লিমিট</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">৳{Number(financial.creditLimit ?? 0).toLocaleString('bn-BD')}</div>
                  </div>
                </div>
                </div>
              )}
            </div>
          )}

          {/* Vendor Bills Tab */}
          {activeTab === 'bills' && (
            <div className="space-y-6">
              {billsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                    <span className="text-gray-600 dark:text-gray-400">বিল লোড হচ্ছে...</span>
                  </div>
                </div>
              ) : billsError ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 dark:text-red-400">বিল লোড করতে সমস্যা হয়েছে</p>
                  </div>
                </div>
              ) : vendorBills.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">কোনো বিল পাওয়া যায়নি</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">বিল নম্বর</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">বিল ধরন</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">মোট পরিমাণ</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">পরিশোধিত</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">বকেয়া</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">স্ট্যাটাস</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">তারিখ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {vendorBills.map((bill) => {
                        const dueAmount = (Number(bill.totalAmount) || 0) - (Number(bill.paidAmount) || 0);
                        return (
                          <tr key={bill._id || bill.billId} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                              {bill.billNumber || bill.billId || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                              {bill.billType || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {formatCurrency(bill.totalAmount || 0)}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(bill.paidAmount || 0)}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                              {formatCurrency(dueAmount)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                bill.paymentStatus === 'paid' || dueAmount <= 0
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {bill.paymentStatus === 'paid' || dueAmount <= 0 ? 'পরিশোধিত' : 'বকেয়া'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {bill.billDate || bill.createdAt 
                                ? new Date(bill.billDate || bill.createdAt).toLocaleDateString('bn-BD')
                                : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;


