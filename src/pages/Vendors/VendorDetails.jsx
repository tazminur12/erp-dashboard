import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Building2, Phone, User, MapPin, Calendar, CreditCard, FileText, ArrowLeft, Clock, Edit,
  DollarSign, TrendingUp, TrendingDown, Wallet, Receipt, AlertCircle, CheckCircle,
  Briefcase, Globe, Mail, Hash, Calendar as CalendarIcon, Star, Loader2, Eye, Trash2, X
} from 'lucide-react';
import { useVendor, useVendorFinancials, useVendorBillsByVendor, useVendorBill, useUpdateVendorBill, useDeleteVendorBill } from '../../hooks/useVendorQueries';
import { useTransactions } from '../../hooks/useTransactionQueries';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';



const VendorDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('bills'); // 'information', 'financial', 'bills', 'transactions' - Start with bills tab (default)
  const [transactionPage, setTransactionPage] = useState(1);
  const transactionLimit = 10;
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    billNumber: '',
    billType: '',
    billDate: '',
    totalAmount: '',
    paidAmount: '',
    dueDate: '',
    paymentMethod: '',
    paymentStatus: 'pending',
    description: '',
    notes: ''
  });

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

  // Fetch selected bill for modal view
  const { 
    data: selectedBill, 
    isLoading: billLoading 
  } = useVendorBill(selectedBillId);

  // Mutations
  const updateVendorBillMutation = useUpdateVendorBill();
  const deleteVendorBillMutation = useDeleteVendorBill();

  // Fetch vendor transactions
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions
  } = useTransactions(
    { partyType: 'vendor', partyId: id },
    transactionPage,
    transactionLimit
  );

  // Handle refresh - refetch all data
  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchVendor(),
        refetchFinancials(),
        refetchBills(),
        refetchTransactions()
      ]);
    } catch (error) {
      console.error('Error refreshing vendor data:', error);
    }
  };

  const transactions = transactionsData?.transactions || [];

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Handle view bill modal
  const handleViewBill = (billId) => {
    setSelectedBillId(billId);
    setShowBillModal(true);
  };

  // Handle edit bill
  const handleEditBill = (bill) => {
    setEditFormData({
      billNumber: bill.billNumber || bill.billId || '',
      billType: bill.billType || '',
      billDate: bill.billDate ? new Date(bill.billDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      totalAmount: bill.totalAmount || bill.amount || '',
      paidAmount: bill.paidAmount || '',
      dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : '',
      paymentMethod: bill.paymentMethod || '',
      paymentStatus: bill.paymentStatus || 'pending',
      description: bill.description || '',
      notes: bill.notes || ''
    });
    setSelectedBillId(bill._id || bill.billId);
    setShowEditModal(true);
  };

  // Handle edit form change
  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save edited bill
  const handleSaveEdit = async () => {
    // Validate required fields
    if (!editFormData.billNumber || !editFormData.totalAmount) {
      Swal.fire({
        icon: 'warning',
        title: 'ভালidation',
        text: 'বিল নম্বর এবং মোট পরিমাণ আবশ্যক',
        confirmButtonText: 'ঠিক আছে'
      });
      return;
    }

    try {
      const billId = selectedBillId;
      await updateVendorBillMutation.mutateAsync({
        billId,
        updateData: {
          billNumber: editFormData.billNumber,
          billType: editFormData.billType,
          billDate: editFormData.billDate,
          totalAmount: Number(editFormData.totalAmount),
          paidAmount: Number(editFormData.paidAmount || 0),
          dueDate: editFormData.dueDate || undefined,
          paymentMethod: editFormData.paymentMethod || undefined,
          paymentStatus: editFormData.paymentStatus,
          description: editFormData.description || undefined,
          notes: editFormData.notes || undefined
        }
      });
      setShowEditModal(false);
      setSelectedBillId(null);
      refetchBills();
      refetchFinancials();
    } catch (error) {
      console.error('Failed to update bill:', error);
    }
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedBillId(null);
    setEditFormData({
      billNumber: '',
      billType: '',
      billDate: '',
      totalAmount: '',
      paidAmount: '',
      dueDate: '',
      paymentMethod: '',
      paymentStatus: 'pending',
      description: '',
      notes: ''
    });
  };

  // Handle delete bill
  const handleDeleteBill = async (bill) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `বিল "${bill.billNumber || bill.billId || 'N/A'}" মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      try {
        const billId = bill._id || bill.billId;
        await deleteVendorBillMutation.mutateAsync(billId);
        refetchBills();
        refetchFinancials();
      } catch (error) {
        console.error('Failed to delete bill:', error);
      }
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowBillModal(false);
    setSelectedBillId(null);
  };

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
      <div className="bg-gradient-to-r from-purple-100 via-blue-50 to-blue-100 rounded-2xl p-6 text-gray-900 shadow-lg">
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
              <div className="w-16 h-16 bg-white/80 rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-700" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{vendor.tradeName}</h1>
              <p className="text-gray-700 text-lg">{vendor.ownerName}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/80 rounded-full text-sm text-gray-900">
                  <Hash className="w-4 h-4" />
                  {vendor.vendorId}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full text-sm text-gray-900">
                  <CheckCircle className="w-4 h-4" />
                  {financial.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to={`/vendors/${vendor._id || vendor.vendorId}/bank-accounts`}
              className="inline-flex items-center gap-2 rounded-lg bg-white/80 hover:bg-white px-4 py-2 text-sm font-medium transition-colors text-gray-900"
            >
              <CreditCard className="w-4 h-4" />
              ব্যাংক একাউন্ট
            </Link>
            <Link 
              to={`/vendors/${vendor._id || vendor.vendorId}/edit`} 
              className="inline-flex items-center gap-2 rounded-lg bg-white/80 hover:bg-white px-4 py-2 text-sm font-medium transition-colors text-gray-900"
            >
              <Edit className="w-4 h-4" />
              ভেন্ডর সম্পাদনা
            </Link>
            <Link 
              to="/vendors" 
              className="inline-flex items-center gap-2 rounded-lg bg-white/80 hover:bg-white px-4 py-2 text-sm font-medium transition-colors text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              তালিকায় ফিরে যান
            </Link>
          </div>
        </div>
      </div>

      

      {/* Profile Totals - ভেন্ডর বিল, পরিশোধ, বকেয়া */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calculate financial totals same way as VendorList */}
        {(() => {
          // Use vendor's own financial data (same calculation as VendorList)
          const paidAmount = Math.max(0, Number(
            vendor.totalPaid ?? 
            vendor.paidAmount ?? 
            vendor.totalPaidAmount ?? 
            calculatedFinancials.totalPaid ??
            0
          ));
          const dueAmount = Math.max(0, Number(
            vendor.totalDue ?? 
            vendor.dueAmount ?? 
            vendor.outstandingAmount ?? 
            vendor.totalDueAmount ?? 
            calculatedFinancials.totalDue ??
            0
          ));
          const totalBill = Math.max(0, paidAmount + dueAmount);
          
          return (
            <>
              {/* ভেন্ডর বিল */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ভেন্ডর বিল</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {totalBill > 0 ? formatCurrency(totalBill) : '৳0'}
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
                      {paidAmount > 0 ? formatCurrency(paidAmount) : '৳0'}
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
                      {dueAmount > 0 ? formatCurrency(dueAmount) : '৳0'}
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
            </>
          );
        })()}
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
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'transactions'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                লেনদেনের ইতিহাস
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
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">অ্যাকশন</th>
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
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleViewBill(bill._id || bill.billId)}
                                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  title="বিস্তারিত দেখুন"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditBill(bill)}
                                  className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                  title="সম্পাদনা করুন"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBill(bill)}
                                  disabled={deleteVendorBillMutation.isPending}
                                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="মুছে ফেলুন"
                                >
                                  {deleteVendorBillMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
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

          {/* Bill View Modal */}
          <Modal
            isOpen={showBillModal}
            onClose={handleCloseModal}
            title="বিল বিবরণ"
            size="lg"
          >
            {billLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">বিল লোড হচ্ছে...</span>
              </div>
            ) : selectedBill ? (
              <div className="space-y-6">
                {/* Bill Header */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedBill.billNumber || selectedBill.billId || 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedBill.billType || '—'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    (selectedBill.paymentStatus === 'paid' || ((Number(selectedBill.totalAmount) || 0) - (Number(selectedBill.paidAmount) || 0)) <= 0)
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {(selectedBill.paymentStatus === 'paid' || ((Number(selectedBill.totalAmount) || 0) - (Number(selectedBill.paidAmount) || 0)) <= 0) ? 'পরিশোধিত' : 'বকেয়া'}
                  </span>
                </div>

                {/* Bill Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">বিল তারিখ</label>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedBill.billDate || selectedBill.createdAt)}</p>
                  </div>
                  {selectedBill.dueDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">পরিশোধের তারিখ</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(selectedBill.dueDate)}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">মোট পরিমাণ</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedBill.totalAmount || 0)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">পরিশোধিত</label>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(selectedBill.paidAmount || 0)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">বকেয়া</label>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(Math.max(0, (Number(selectedBill.totalAmount) || 0) - (Number(selectedBill.paidAmount) || 0)))}
                    </p>
                  </div>
                  {selectedBill.paymentMethod && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">পেমেন্ট পদ্ধতি</label>
                      <p className="text-gray-900 dark:text-white">{selectedBill.paymentMethod}</p>
                    </div>
                  )}
                  {selectedBill.description && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">বিবরণ</label>
                      <p className="text-gray-900 dark:text-white">{selectedBill.description}</p>
                    </div>
                  )}
                  {selectedBill.notes && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">নোট</label>
                      <p className="text-gray-900 dark:text-white">{selectedBill.notes}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      handleEditBill(selectedBill);
                      handleCloseModal();
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    সম্পাদনা করুন
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">বিল লোড করতে সমস্যা হয়েছে</p>
              </div>
            )}
          </Modal>

          {/* Edit Bill Modal */}
          <Modal
            isOpen={showEditModal}
            onClose={handleCloseEditModal}
            title="বিল সম্পাদনা করুন"
            size="lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    বিল নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.billNumber}
                    onChange={(e) => handleEditFormChange('billNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="বিল নম্বর"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    বিল ধরন
                  </label>
                  <input
                    type="text"
                    value={editFormData.billType}
                    onChange={(e) => handleEditFormChange('billType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="বিল ধরন"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    বিল তারিখ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editFormData.billDate}
                    onChange={(e) => handleEditFormChange('billDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    পরিশোধের তারিখ
                  </label>
                  <input
                    type="date"
                    value={editFormData.dueDate}
                    onChange={(e) => handleEditFormChange('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    মোট পরিমাণ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.totalAmount}
                    onChange={(e) => handleEditFormChange('totalAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    পরিশোধিত পরিমাণ
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.paidAmount}
                    onChange={(e) => handleEditFormChange('paidAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    পেমেন্ট পদ্ধতি
                  </label>
                  <select
                    value={editFormData.paymentMethod}
                    onChange={(e) => handleEditFormChange('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">নির্বাচন করুন</option>
                    <option value="cash">নগদ</option>
                    <option value="bank">ব্যাংক</option>
                    <option value="mobile-banking">মোবাইল ব্যাংকিং</option>
                    <option value="check">চেক</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    পেমেন্ট স্ট্যাটাস
                  </label>
                  <select
                    value={editFormData.paymentStatus}
                    onChange={(e) => handleEditFormChange('paymentStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="pending">বকেয়া</option>
                    <option value="partial">আংশিক</option>
                    <option value="paid">পরিশোধিত</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    বিবরণ
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => handleEditFormChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="বিলের বিবরণ"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    নোট
                  </label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => handleEditFormChange('notes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="অতিরিক্ত নোট"
                  />
                </div>
              </div>

              {/* Calculated Due Amount */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">বকেয়া পরিমাণ:</span>
                  <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(Math.max(0, (Number(editFormData.totalAmount) || 0) - (Number(editFormData.paidAmount) || 0)))}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updateVendorBillMutation.isPending}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updateVendorBillMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      সংরক্ষণ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      সংরক্ষণ করুন
                    </>
                  )}
                </button>
              </div>
            </div>
          </Modal>

          {/* Transaction History Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                    <span className="text-gray-600 dark:text-gray-400">লেনদেন লোড হচ্ছে...</span>
                  </div>
                </div>
              ) : transactionsError ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 dark:text-red-400">লেনদেন লোড করতে সমস্যা হয়েছে</p>
                  </div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">কোনো লেনদেন পাওয়া যায়নি</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">লেনদেন আইডি</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ধরন</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">পরিমাণ</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">পদ্ধতি</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">রেফারেন্স</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">তারিখ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {transactions.map((transaction) => {
                          const isDebit = transaction.transactionType === 'debit' || transaction.type === 'debit';
                          const amount = Number(transaction.amount || 0);
                          return (
                            <tr key={transaction._id || transaction.transactionId} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {transaction.transactionId || transaction._id || '—'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                  isDebit
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                }`}>
                                  {isDebit ? 'ডেবিট' : 'ক্রেডিট'}
                                </span>
                              </td>
                              <td className={`px-4 py-3 text-sm font-semibold ${
                                isDebit 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : 'text-green-600 dark:text-green-400'
                              }`}>
                                {isDebit ? '-' : '+'}{formatCurrency(amount)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {transaction.paymentMethod || transaction.paymentDetails?.method || '—'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                {transaction.reference || transaction.paymentDetails?.reference || '—'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                {transaction.createdAt || transaction.date
                                  ? new Date(transaction.createdAt || transaction.date).toLocaleDateString('bn-BD', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {transactionsData && transactionsData.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        পৃষ্ঠা {transactionPage} এর {transactionsData.totalPages} ({transactionsData.totalCount} টি লেনদেন)
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTransactionPage(prev => Math.max(1, prev - 1))}
                          disabled={transactionPage === 1}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          পূর্ববর্তী
                        </button>
                        <button
                          onClick={() => setTransactionPage(prev => Math.min(transactionsData.totalPages, prev + 1))}
                          disabled={transactionPage >= transactionsData.totalPages}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          পরবর্তী
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;


