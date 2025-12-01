import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  User,
  Tag,
  MoreHorizontal,
  X,
  RefreshCw,
  Loader2,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  useTransactions, 
  useUpdateTransaction, 
  useDeleteTransaction,
  useBulkDeleteTransactions,
  useTransactionCategories
} from '../../hooks/useTransactionQueries';
import { generateTransactionPDF, generateSimplePDF } from '../../utils/pdfGenerator';
import { getAllSubCategories } from '../../utils/categoryUtils';
import useCategoryQueries from '../../hooks/useCategoryQueries';
import Swal from 'sweetalert2';
import { formatDate as formatDateShared } from '../../lib/format';

const TransactionsList = () => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateRange: '',
    transactionType: '',
    category: '',
    paymentMethod: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // React Query hooks
  const { 
    data: transactionsData, 
    isLoading: loading, 
    error,
    refetch 
  } = useTransactions(
    { 
      ...filters, 
      search: searchTerm 
    }, 
    currentPage, 
    itemsPerPage
  );


  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();
  const bulkDeleteMutation = useBulkDeleteTransactions();

  // Categories from API for ID->name mapping
  const { data: apiCategories = [] } = useTransactionCategories();
  
  // Get categories with subcategories from category queries
  const categoryQueries = useCategoryQueries();
  const categoriesQueryResult = categoryQueries?.useCategories ? categoryQueries.useCategories() : null;
  const categoriesWithSubs = categoriesQueryResult?.data || [];

  // Extract data from query result
  const transactions = transactionsData?.transactions || [];
  const totalCount = transactionsData?.totalCount || 0;
  const totalPages = transactionsData?.totalPages || 0;

  // Handle error state
  if (error) {
    console.error('Failed to load transactions:', error);
  }

  // Filter options
  const filterOptions = {
    transactionType: [
      { value: '', label: 'সব টাইপ' },
      { value: 'credit', label: 'ক্রেডিট (আয়)' },
      { value: 'debit', label: 'ডেবিট (ব্যয়)' }
    ],
    category: [
      { value: '', label: 'সব ক্যাটাগরি' },
      { value: 'হাজ্জ প্যাকেজ', label: 'হাজ্জ প্যাকেজ' },
      { value: 'ওমরাহ প্যাকেজ', label: 'ওমরাহ প্যাকেজ' },
      { value: 'এয়ার টিকেট', label: 'এয়ার টিকেট' },
      { value: 'ভিসা সার্ভিস', label: 'ভিসা সার্ভিস' },
      { value: 'হোটেল বুকিং', label: 'হোটেল বুকিং' },
      { value: 'ইনসুরেন্স', label: 'ইনসুরেন্স' },
      { value: 'অন্যান্য সেবা', label: 'অন্যান্য সেবা' }
    ],
    paymentMethod: [
      { value: '', label: 'সব পেমেন্ট মেথড' },
      { value: 'ব্যাংক ট্রান্সফার', label: 'ব্যাংক ট্রান্সফার' },
      { value: 'মোবাইল ব্যাংকিং', label: 'মোবাইল ব্যাংকিং' },
      { value: 'চেক', label: 'চেক' }
    ],
    status: [
      { value: '', label: 'সব স্ট্যাটাস' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  };

  // Since filtering is now handled by the API, we use the transactions directly
  const currentTransactions = transactions;

  // Helper functions
  const getTypeColor = (type) => {
    return type === 'credit' 
      ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
      : 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => formatDateShared(dateString);

  // Data access helpers with fallbacks for varying backend shapes
  // Detect personal expense bank-account transactions created from the debit flow
  const isPersonalExpenseTxn = (t) => {
    try {
      const desc = (t.description || t.details || '').toString();
      if (/^Personal\s+Expense/i.test(desc)) return true;
      if (Array.isArray(t.tags) && t.tags.some(tag => String(tag).toLowerCase().includes('personal'))) return true;
      if ((t.category === 'Bank Transaction' || !t.category) && t.paymentDetails?.category) return true;
    } catch (e) { /* ignore */ }
    return false;
  };

  const getCustomerName = (t) => {
    if (isPersonalExpenseTxn(t)) {
      const desc = (t.description || t.details || '').toString();
      const match = desc.match(/Personal\s+Expense\s*-\s*(.+)/i);
      const fromDescription = match?.[1]?.trim();
      return t.paymentDetails?.category || fromDescription || 'Personal Expense';
    }
    
    // Handle money-exchange transactions - show currency info if available
    if (t.partyType === 'money-exchange' || t.partyType === 'money_exchange') {
      const moneyExchangeInfo = t.moneyExchangeInfo || {};
      const currencyName = moneyExchangeInfo.currencyName || t.party?.currencyName;
      const fullName = moneyExchangeInfo.fullName || t.party?.fullName || t.partyName;
      const type = moneyExchangeInfo.type || '';
      const currencyCode = moneyExchangeInfo.currencyCode || '';
      
      // Format: "Buy/Sell - USD (US Dollar)" or just the name
      if (type && currencyName) {
        return `${type === 'Buy' ? 'ক্রয়' : type === 'Sell' ? 'বিক্রয়' : type} - ${currencyCode ? `${currencyCode} (${currencyName})` : currencyName}`;
      }
      if (currencyName) {
        return currencyName;
      }
      if (fullName && fullName !== 'Money Exchange' && fullName !== 'Unknown') {
        return fullName;
      }
    }
    
    // Try multiple fields and check for "Unknown" or empty values
    const name = 
      t.customerName ||
      t.customer?.name ||
      t.partyName ||
      t.party?.name ||
      t.customer?.fullName ||
      t.customer?.customerName ||
      t.party?.fullName ||
      t.party?.currencyName ||
      '';
    
    // If name is "Unknown", "unknown", empty, or just whitespace, return "N/A"
    if (!name || name.trim() === '' || name.toLowerCase() === 'unknown') {
      return 'N/A';
    }
    
    return name;
  };

  const getCustomerPhone = (t) => {
    if (isPersonalExpenseTxn(t)) return '';
    // Handle money-exchange transactions
    if (t.partyType === 'money-exchange' || t.partyType === 'money_exchange') {
      const moneyExchangeInfo = t.moneyExchangeInfo || {};
      return moneyExchangeInfo.mobileNumber || t.party?.mobileNumber || t.partyPhone || '';
    }
    return t.customerPhone || t.customer?.phone || t.party?.phone || t.party?.mobileNumber || '';
  };

  const subCategoryIndex = useMemo(() => {
    // Build a quick ID->name map for all known subcategories
    const map = {};
    try {
      const subs = getAllSubCategories();
      subs.forEach(s => { 
        if (s.id && s.name) {
          map[s.id] = s.name;
        }
      });
    } catch (e) { /* ignore */ }
    return map;
  }, []);

  const apiCategoryIndex = useMemo(() => {
    const map = {};
    try {
      // First, add categories from useTransactionCategories
      (apiCategories || []).forEach((c) => {
        if (!c) return;
        if (typeof c === 'string') {
          map[c] = c;
          return;
        }
        const id = c._id || c.id || c.value || c.slug;
        const name = c.name || c.label || c.title || c.categoryName || c.value;
        if (id && name) map[id] = name;
        if (name) map[name] = name; // allow direct name passthrough
      });
      
      // Then, add categories with subcategories from useCategoryQueries
      (categoriesWithSubs || []).forEach((cat) => {
        if (!cat) return;
        const catId = cat.id || cat._id;
        const catName = cat.name;
        if (catId && catName) {
          map[catId] = catName;
        }
        
        // Add subcategories
        const subs = cat.subCategories || cat.subcategories || [];
        subs.forEach((sub) => {
          const subId = sub.id || sub._id;
          const subName = sub.name;
          if (subId && subName) {
            map[subId] = subName;
          }
        });
      });
    } catch (e) { 
      console.error('Error building category index:', e);
    }
    return map;
  }, [apiCategories, categoriesWithSubs]);

  const getCategory = (t) => {
    // If this is a personal expense entry created via bank-account transaction,
    // prefer showing the selected personal category.
    if (isPersonalExpenseTxn(t)) {
      const desc = (t.description || t.details || '').toString();
      const match = desc.match(/Personal\s+Expense\s*-\s*(.+)/i);
      const fromDescription = match?.[1]?.trim();
      return fromDescription || t.paymentDetails?.category || 'Personal Expense';
    }
    
    // Support multiple shapes - check if category is an object first
    if (t.category && typeof t.category === 'object') {
      const name = t.category.name || t.category.label || t.category.title || t.category.categoryName;
      if (name) return name;
    }
    if (t.serviceCategory && typeof t.serviceCategory === 'object') {
      const name = t.serviceCategory.name || t.serviceCategory.label || t.serviceCategory.title;
      if (name) return name;
    }

    // Get raw category value (could be ID or name)
    const raw = t.category || t.categoryId || t.serviceCategory || t.paymentDetails?.category || '';
    
    if (!raw) return 'N/A';
    
    // If it's already a readable name (not an ID), return it
    if (typeof raw === 'string' && !raw.match(/^[0-9a-f]{24}$/i) && raw.length < 30) {
      // Check if it looks like a name (not a MongoDB ObjectId)
      return raw;
    }
    
    // Try to find in subcategory index first
    if (subCategoryIndex[raw]) {
      return subCategoryIndex[raw];
    }
    
    // Try to find in API category index
    if (apiCategoryIndex[raw]) {
      return apiCategoryIndex[raw];
    }
    
    // If we can't find a name, return "N/A" instead of showing the ID
    return 'N/A';
  };

  // Event handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      dateRange: '',
      transactionType: '',
      category: '',
      paymentMethod: '',
      status: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      transactionType: transaction.transactionType,
      category: transaction.category,
      paymentMethod: transaction.paymentMethod,
      paymentDetails: {
        bankName: transaction.paymentDetails?.bankName || '',
        accountNumber: transaction.paymentDetails?.accountNumber || '',
        chequeNumber: transaction.paymentDetails?.chequeNumber || '',
        mobileProvider: transaction.paymentDetails?.mobileProvider || '',
        transactionId: transaction.paymentDetails?.transactionId || '',
        amount: transaction.paymentDetails?.amount || '',
        reference: transaction.paymentDetails?.reference || ''
      },
      notes: transaction.notes || '',
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleDeleteTransaction = async (transaction) => {
    const result = await Swal.fire({
      title: 'লেনদেন মুছে ফেলুন?',
      text: `আপনি কি ${transaction.transactionId} লেনদেনটি মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল করুন',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      background: isDark ? '#1F2937' : '#F9FAFB'
    });

    if (result.isConfirmed) {
      const transactionId = transaction?._id || transaction?.transactionId;

      if (!transactionId) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'লেনদেন শনাক্ত করা যায়নি। পরে আবার চেষ্টা করুন।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
          background: isDark ? '#1F2937' : '#FEF2F2'
        });
        return;
      }

      deleteTransactionMutation.mutate({
        transactionId,
        deletedBy: userProfile?.email || userProfile?.name || 'unknown_user'
      });
    }
  };

  const handleDownloadPDF = async (transaction) => {
    try {
      // Show loading alert
      Swal.fire({
        title: 'PDF তৈরি হচ্ছে...',
        text: `${transaction.transactionId} এর রিসিট তৈরি হচ্ছে`,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        background: isDark ? '#1F2937' : '#F9FAFB'
      });

      // Prepare transaction data for PDF with all available information
      const pdfData = {
        transactionId: transaction.transactionId || transaction._id,
        transactionType: transaction.transactionType,
        status: transaction.status,
        customerId: transaction.customerId || transaction.customer?._id || transaction.customer?.id,
        customerName: getCustomerName(transaction),
        customerPhone: getCustomerPhone(transaction),
        customerEmail: transaction.customerEmail || transaction.customer?.email || transaction.party?.email,
        category: getCategory(transaction),
        paymentMethod: transaction.paymentMethod,
        paymentDetails: transaction.paymentDetails,
        notes: transaction.notes,
        date: transaction.date,
        createdBy: userProfile?.email || userProfile?.name || 'System',
        branchId: userProfile?.branchId || 'Main Branch',
        // Include additional fields if available
        invoiceId: transaction.invoiceId,
        customer: transaction.customer,
        party: transaction.party,
        partyType: transaction.partyType,
        debitAccount: transaction.debitAccount,
        creditAccount: transaction.creditAccount,
        sourceAccount: transaction.sourceAccount,
        destinationAccount: transaction.destinationAccount,
        customerBankAccount: transaction.customerBankAccount
      };

      // Try to generate PDF with HTML rendering first
      let result = await generateTransactionPDF(pdfData, isDark);
      
      // If HTML rendering fails, fallback to simple PDF
      if (!result.success) {
        console.log('HTML PDF generation failed, trying simple PDF...');
        result = generateSimplePDF(pdfData);
      }

      // Close loading alert
      Swal.close();

      if (result.success) {
        Swal.fire({
          title: 'সফল!',
          text: `PDF সফলভাবে ডাউনলোড হয়েছে: ${result.filename}`,
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          background: isDark ? '#1F2937' : '#F9FAFB',
          customClass: {
            title: 'text-green-600 font-bold text-xl',
            popup: 'rounded-2xl shadow-2xl'
          }
        });
      } else {
        throw new Error(result.error || 'PDF generation failed');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Swal.close();
      
      Swal.fire({
        title: 'ত্রুটি!',
        text: `PDF তৈরি করতে সমস্যা হয়েছে: ${error.message}`,
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

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateTransaction = async () => {
    // Validate required fields
    if (!editFormData.transactionType || !editFormData.category || !editFormData.paymentMethod) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
      return;
    }

    const updateData = {
      transactionType: editFormData.transactionType,
      category: editFormData.category,
      paymentMethod: editFormData.paymentMethod,
      paymentDetails: {
        bankName: editFormData.paymentDetails.bankName || null,
        accountNumber: editFormData.paymentDetails.accountNumber || null,
        chequeNumber: editFormData.paymentDetails.chequeNumber || null,
        mobileProvider: editFormData.paymentDetails.mobileProvider || null,
        transactionId: editFormData.paymentDetails.transactionId || null,
        amount: parseFloat(editFormData.paymentDetails.amount) || 0,
        reference: editFormData.paymentDetails.reference || null
      },
      notes: editFormData.notes || null,
      date: editFormData.date
    };

    updateTransactionMutation.mutate(
      { 
        transactionId: editingTransaction.transactionId, 
        data: updateData 
      },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setEditingTransaction(null);
        }
      }
    );
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle individual transaction selection
  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  // Handle select all transactions
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(currentTransactions.map(t => t.transactionId || t._id));
    }
    setSelectAll(!selectAll);
  };

  // Bulk PDF download
  const handleBulkDownloadPDF = async () => {
    if (selectedTransactions.length === 0) {
      Swal.fire({
        title: 'সতর্কতা!',
        text: 'কোন লেনদেন নির্বাচন করা হয়নি।',
        icon: 'warning',
        confirmButtonText: 'ঠিক আছে',
        background: isDark ? '#1F2937' : '#F9FAFB'
      });
      return;
    }

    try {
      // Show loading alert
      Swal.fire({
        title: 'PDF তৈরি হচ্ছে...',
        text: `${selectedTransactions.length}টি লেনদেনের PDF তৈরি হচ্ছে`,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        background: isDark ? '#1F2937' : '#F9FAFB'
      });

      let successCount = 0;
      let errorCount = 0;

      // Generate PDF for each selected transaction
      for (const transactionId of selectedTransactions) {
        const transaction = currentTransactions.find(t => (t.transactionId || t._id) === transactionId);
        if (transaction) {
          // Prepare transaction data for PDF with all available information
          const pdfData = {
            transactionId: transaction.transactionId || transaction._id,
            transactionType: transaction.transactionType,
            status: transaction.status,
            customerId: transaction.customerId || transaction.customer?._id || transaction.customer?.id,
            customerName: getCustomerName(transaction),
            customerPhone: getCustomerPhone(transaction),
            customerEmail: transaction.customerEmail || transaction.customer?.email || transaction.party?.email,
            category: getCategory(transaction),
            paymentMethod: transaction.paymentMethod,
            paymentDetails: transaction.paymentDetails,
            notes: transaction.notes,
            date: transaction.date,
            createdBy: userProfile?.email || userProfile?.name || 'System',
            branchId: userProfile?.branchId || 'Main Branch',
            // Include additional fields if available
            invoiceId: transaction.invoiceId,
            customer: transaction.customer,
            party: transaction.party,
            partyType: transaction.partyType,
            debitAccount: transaction.debitAccount,
            creditAccount: transaction.creditAccount,
            sourceAccount: transaction.sourceAccount,
            destinationAccount: transaction.destinationAccount,
            customerBankAccount: transaction.customerBankAccount
          };

          try {
            let result = await generateTransactionPDF(pdfData, isDark);
            if (!result.success) {
              result = generateSimplePDF(pdfData);
            }
            if (result.success) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            console.error(`PDF generation error for ${transactionId}:`, error);
            errorCount++;
          }
        }
      }

      // Close loading alert
      Swal.close();

      // Show results
      if (successCount > 0) {
        Swal.fire({
          title: 'সফল!',
          text: `${successCount}টি PDF সফলভাবে ডাউনলোড হয়েছে${errorCount > 0 ? `, ${errorCount}টি ব্যর্থ` : ''}`,
          icon: successCount === selectedTransactions.length ? 'success' : 'warning',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          background: isDark ? '#1F2937' : '#F9FAFB'
        });
      } else {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'কোন PDF তৈরি করা যায়নি।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
          background: isDark ? '#1F2937' : '#FEF2F2'
        });
      }

      // Clear selections
      setSelectedTransactions([]);
      setSelectAll(false);

    } catch (error) {
      console.error('Bulk PDF generation error:', error);
      Swal.close();
      
      Swal.fire({
        title: 'ত্রুটি!',
        text: `PDF তৈরি করতে সমস্যা হয়েছে: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
    }
  };

  return (
    <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  Transactions List
                </h1>
                <p className={`mt-2 text-lg transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  সব লেনদেনের তালিকা এবং পরিচালনা
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {selectedTransactions.length > 0 && (
                <button
                  onClick={handleBulkDownloadPDF}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  PDF ডাউনলোড ({selectedTransactions.length})
                </button>
              )}
              <button
                onClick={() => window.location.href = '/transactions/new'}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <CreditCard className="w-5 h-5" />
                নতুন লেনদেন
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className={`mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Transaction ID, নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 border rounded-xl font-medium transition-all duration-200 ${
                showFilters
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600'
                  : isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              ফিল্টার
              {Object.values(filters).some(value => value !== '') && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Clear Filters Button */}
            {Object.values(filters).some(value => value !== '') && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-xl font-medium transition-all duration-200"
              >
                <X className="w-5 h-5" />
                ফিল্টার সরান
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    তারিখের পরিসর
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">সব তারিখ</option>
                    <option value="today">আজ</option>
                    <option value="yesterday">গতকাল</option>
                    <option value="last-week">গত সপ্তাহ</option>
                    <option value="last-month">গত মাস</option>
                  </select>
                </div>

                {/* Transaction Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    লেনদেনের ধরন
                  </label>
                  <select
                    value={filters.transactionType}
                    onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {filterOptions.transactionType.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {filterOptions.category.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    পেমেন্ট মেথড
                  </label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {filterOptions.paymentMethod.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                স্ট্যাটাস
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-gray-300'
                }`}
              >
                {filterOptions.status.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className={`mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                  ডেটা লোড করতে সমস্যা
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  {error?.response?.data?.message || error?.message || 'অজানা ত্রুটি'}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 text-sm text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 underline"
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className={`mb-4 bg-white dark:bg-gray-800 rounded-xl p-4 border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                মোট ফলাফল: <span className="font-semibold text-blue-600">{totalCount}</span>
              </span>
              <span className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                বর্তমান পৃষ্ঠা: <span className="font-semibold">{currentTransactions.length}</span>
              </span>
              {selectedTransactions.length > 0 && (
                <span className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>
                  নির্বাচিত: <span className="font-semibold">{selectedTransactions.length}</span>
                </span>
              )}
            </div>
            
            <button
              onClick={() => {
                setSearchTerm('');
                clearFilters();
                refetch();
              }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              রিসেট করুন
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`bg-gray-50 dark:bg-gray-700`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    Transaction ID
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    কাস্টমার
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    ধরন
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    ক্যাটাগরি
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    পেমেন্ট মেথড
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    পরিমাণ
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    তারিখ
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    স্ট্যাটাস
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700`}>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="text-gray-600 dark:text-gray-400 text-lg">লেনদেন লোড হচ্ছে...</span>
                        <span className="text-gray-500 dark:text-gray-500 text-sm">অনুগ্রহ করে অপেক্ষা করুন</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                          <X className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            ডেটা লোড করতে সমস্যা
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {error?.response?.data?.message || error?.message || 'অজানা ত্রুটি'}
                          </p>
                          <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                          >
                            আবার চেষ্টা করুন
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : currentTransactions.map((transaction) => {
                  const transactionId = transaction.transactionId || transaction._id;
                  const isSelected = selectedTransactions.includes(transactionId);
                  
                  return (
                    <tr key={transactionId} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectTransaction(transactionId)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                            {transaction.transactionId}
                          </span>
                        </div>
                      </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {getCustomerName(transaction)}
                          </div>
                          {!!getCustomerPhone(transaction) && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {getCustomerPhone(transaction)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.transactionType)}`}>
                        {transaction.transactionType === 'credit' ? 'ক্রেডিট' : 'ডেবিট'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getCategory(transaction)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {transaction.paymentMethod === 'bank' ? 'ব্যাংক ট্রান্সফার' : 
                         transaction.paymentMethod === 'cheque' ? 'চেক' : 
                         transaction.paymentMethod === 'mobile-banking' ? 'মোবাইল ব্যাংকিং' : 
                         transaction.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        transaction.transactionType === 'credit' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatAmount(transaction.paymentDetails?.amount || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {formatDate(transaction.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor((transaction.status || '').toLowerCase())}`}>
                        {transaction.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewTransaction(transaction)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                          title="দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all duration-200"
                          title="সম্পাদনা করুন"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(transaction)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                          title="PDF ডাউনলোড"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {!loading && !error && currentTransactions.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                কোন লেনদেন পাওয়া যায়নি
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {searchTerm || Object.values(filters).some(value => value !== '')
                  ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোন লেনদেন নেই। অনুগ্রহ করে ভিন্ন শব্দ দিয়ে খুঁজুন।'
                  : 'এখনও কোন লেনদেন যোগ করা হয়নি। নতুন লেনদেন যোগ করে শুরু করুন।'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {searchTerm || Object.values(filters).some(value => value !== '') ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      clearFilters();
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    ফিল্টার সরান
                  </button>
                ) : (
                  <button
                    onClick={() => window.location.href = '/transactions/new'}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    নতুন লেনদেন যোগ করুন
                  </button>
                )}
                <button
                  onClick={() => refetch()}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  রিফ্রেশ করুন
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border transition-colors duration-300 ${
            isDark ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  পৃষ্ঠা {currentPage} এর {totalPages}
                </span>
                <span className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  ({((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} এর {totalCount})
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 1
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  আগে
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === totalPages
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  পরে
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  লেনদেনের বিবরণ
                </h3>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Transaction ID
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    রেফারেন্স
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedTransaction.paymentDetails?.reference || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    স্ট্যাটাস
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor((selectedTransaction.status || '').toLowerCase())}`}>
                    {selectedTransaction.status || 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    কাস্টমারের নাম
                  </label>
                  <p className="text-gray-900 dark:text-white">{getCustomerName(selectedTransaction)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    ফোন নম্বর
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedTransaction.customerPhone || selectedTransaction.customer?.phone || selectedTransaction.party?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    ইমেইল
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedTransaction.customerEmail || selectedTransaction.customer?.email || selectedTransaction.party?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    লেনদেনের ধরন
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedTransaction.transactionType)}`}>
                    {selectedTransaction.transactionType === 'credit' ? 'ক্রেডিট' : 'ডেবিট'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    ক্যাটাগরি
                  </label>
                  <p className="text-gray-900 dark:text-white">{getCategory(selectedTransaction)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    পেমেন্ট মেথড
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedTransaction.paymentMethod === 'bank' ? 'ব্যাংক ট্রান্সফার' : 
                     selectedTransaction.paymentMethod === 'cheque' ? 'চেক' : 
                     selectedTransaction.paymentMethod === 'mobile-banking' ? 'মোবাইল ব্যাংকিং' : 
                     selectedTransaction.paymentMethod}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    পরিমাণ
                  </label>
                  <p className={`font-semibold ${
                    selectedTransaction.transactionType === 'credit' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatAmount(selectedTransaction.paymentDetails?.amount || 0)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    তারিখ
                  </label>
                  <p className="text-gray-900 dark:text-white">{formatDate(selectedTransaction.date)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  নোট
                </label>
                <p className="text-gray-900 dark:text-white">{selectedTransaction.notes || 'কোন নোট নেই'}</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => handleDownloadPDF(selectedTransaction)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200"
              >
                <Download className="w-5 h-5" />
                PDF ডাউনলোড
              </button>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  লেনদেন সম্পাদনা করুন
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  লেনদেনের ধরন *
                </label>
                <select
                  name="transactionType"
                  value={editFormData.transactionType}
                  onChange={handleEditInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="credit">ক্রেডিট (আয়)</option>
                  <option value="debit">ডেবিট (ব্যয়)</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ক্যাটাগরি *
                </label>
                <select
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="hajj">হাজ্জ & উমরাহ</option>
                  <option value="air-ticket">এয়ার টিকেট</option>
                  <option value="visa">ভিসা সার্ভিস</option>
                  <option value="hotel">হোটেল বুকিং</option>
                  <option value="insurance">ইনসুরেন্স</option>
                  <option value="other">অন্যান্য সেবা</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  পেমেন্ট মেথড *
                </label>
                <select
                  name="paymentMethod"
                  value={editFormData.paymentMethod}
                  onChange={handleEditInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="bank">ব্যাংক ট্রান্সফার</option>
                  <option value="cheque">চেক</option>
                  <option value="mobile-banking">মোবাইল ব্যাংকিং</option>
                </select>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    পরিমাণ *
                  </label>
                  <input
                    type="number"
                    name="paymentDetails.amount"
                    value={editFormData.paymentDetails?.amount || ''}
                    onChange={handleEditInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    তারিখ *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={editFormData.date}
                    onChange={handleEditInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                {editFormData.paymentMethod === 'bank' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ব্যাংকের নাম
                      </label>
                      <input
                        type="text"
                        name="paymentDetails.bankName"
                        value={editFormData.paymentDetails?.bankName || ''}
                        onChange={handleEditInputChange}
                        placeholder="ব্যাংকের নাম"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        অ্যাকাউন্ট নম্বর
                      </label>
                      <input
                        type="text"
                        name="paymentDetails.accountNumber"
                        value={editFormData.paymentDetails?.accountNumber || ''}
                        onChange={handleEditInputChange}
                        placeholder="অ্যাকাউন্ট নম্বর"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </>
                )}

                {editFormData.paymentMethod === 'cheque' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        চেক নম্বর
                      </label>
                      <input
                        type="text"
                        name="paymentDetails.chequeNumber"
                        value={editFormData.paymentDetails?.chequeNumber || ''}
                        onChange={handleEditInputChange}
                        placeholder="চেক নম্বর"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ব্যাংকের নাম
                      </label>
                      <input
                        type="text"
                        name="paymentDetails.bankName"
                        value={editFormData.paymentDetails?.bankName || ''}
                        onChange={handleEditInputChange}
                        placeholder="ব্যাংকের নাম"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </>
                )}

                {editFormData.paymentMethod === 'mobile-banking' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        প্রোভাইডার
                      </label>
                      <input
                        type="text"
                        name="paymentDetails.mobileProvider"
                        value={editFormData.paymentDetails?.mobileProvider || ''}
                        onChange={handleEditInputChange}
                        placeholder="মোবাইল ব্যাংকিং প্রোভাইডার"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ট্রানজেকশন আইডি
                      </label>
                      <input
                        type="text"
                        name="paymentDetails.transactionId"
                        value={editFormData.paymentDetails?.transactionId || ''}
                        onChange={handleEditInputChange}
                        placeholder="ট্রানজেকশন আইডি"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    রেফারেন্স
                  </label>
                  <input
                    type="text"
                    name="paymentDetails.reference"
                    value={editFormData.paymentDetails?.reference || ''}
                    onChange={handleEditInputChange}
                    placeholder="রেফারেন্স"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  নোট
                </label>
                <textarea
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleEditInputChange}
                  rows="3"
                  placeholder="লেনদেন সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleUpdateTransaction}
                disabled={updateTransactionMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-all duration-200"
              >
                {updateTransactionMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    আপডেট হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    আপডেট করুন
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsList;
