import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Users, Plus, Trash2, ArrowUpRight, ArrowDownLeft, Calendar, CalendarDays, Clock, Edit, DollarSign, ArrowLeft, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Helmet } from 'react-helmet-async';
import Modal, { ModalFooter } from '../../components/common/Modal';
import useFamilyMemberQueries from '../../hooks/useFamilyMemberQueries';

const FamilyMemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Family Member Query
  const { useFamilyMember } = useFamilyMemberQueries();
  const { data: selectedMember, isLoading, error } = useFamilyMember(id);

  const [timeFilter, setTimeFilter] = useState('monthly'); // 'monthly', 'yearly', 'alltime'
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when transactions change
  
  // Transaction Form State
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionFormData, setTransactionFormData] = useState({
    type: 'given', // 'given' (diyeche) or 'taken' (niyeche)
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    description: ''
  });

  // Get filtered transactions based on time filter
  // Note: This is still using localStorage for transactions as the lending transaction API might be separate
  const getFilteredTransactions = useMemo(() => {
    if (!selectedMember) return [];
    
    const memberId = selectedMember.id;
    const savedTransactions = localStorage.getItem('lendingTransactions');
    let transactions = [];
    
    if (savedTransactions) {
      try {
        const allTransactions = JSON.parse(savedTransactions);
        transactions = allTransactions[memberId] || [];
      } catch (e) {
        console.error('Error loading transactions:', e);
      }
    }
    
    const now = new Date();
    let startDate = null;
    
    if (timeFilter === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeFilter === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }
    // 'alltime' - no date filter
    
    if (startDate) {
      return transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= startDate;
      });
    }
    
    return transactions;
  }, [selectedMember, timeFilter, refreshKey]);

  // Calculate totals
  const calculateTotals = useMemo(() => {
    const transactions = getFilteredTransactions;
    let totalGiven = 0; // diyeche
    let totalTaken = 0; // niyeche
    
    transactions.forEach(tx => {
      const amount = Number(tx.amount) || 0;
      if (tx.type === 'given') {
        totalGiven += amount;
      } else {
        totalTaken += amount;
      }
    });
    
    return { totalGiven, totalTaken, balance: totalGiven - totalTaken };
  }, [getFilteredTransactions]);

  // Transaction Form Functions
  const resetTransactionForm = () => {
    setTransactionFormData({
      type: 'given',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      description: ''
    });
    setEditingTransaction(null);
  };

  const handleOpenTransactionModal = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setTransactionFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        date: transaction.date,
        description: transaction.description || ''
      });
    } else {
      resetTransactionForm();
    }
    setIsTransactionModalOpen(true);
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMember) return;
    
    const amount = Number(transactionFormData.amount);
    if (!amount || amount <= 0) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে বৈধ পরিমাণ লিখুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    try {
      const memberId = selectedMember.id;
      const savedTransactions = localStorage.getItem('lendingTransactions');
      let allTransactions = savedTransactions ? JSON.parse(savedTransactions) : {};
      const transactions = allTransactions[memberId] || [];
      
      if (editingTransaction) {
        // Update existing transaction
        const updated = transactions.map(tx => 
          tx.id === editingTransaction.id
            ? {
                ...tx,
                type: transactionFormData.type,
                amount: amount,
                date: transactionFormData.date,
                description: transactionFormData.description.trim(),
                updatedAt: new Date().toISOString()
              }
            : tx
        );
        allTransactions[memberId] = updated;
      } else {
        // Add new transaction
        const newTransaction = {
          id: Date.now().toString(),
          type: transactionFormData.type,
          amount: amount,
          date: transactionFormData.date,
          description: transactionFormData.description.trim(),
          createdAt: new Date().toISOString()
        };
        allTransactions[memberId] = [...transactions, newTransaction];
      }
      
      localStorage.setItem('lendingTransactions', JSON.stringify(allTransactions));
      setRefreshKey(prev => prev + 1);
      
      Swal.fire({
        title: 'সফল!',
        text: editingTransaction ? 'লেনদেন আপডেট করা হয়েছে।' : 'লেনদেন যোগ করা হয়েছে।',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      setIsTransactionModalOpen(false);
      resetTransactionForm();
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'লেনদেন সংরক্ষণ করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!selectedMember) return;
    
    const res = await Swal.fire({
      title: 'নিশ্চিত করুন',
      text: 'এই লেনদেন মুছে ফেলতে চান?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });
    
    if (!res.isConfirmed) return;
    
    try {
      const memberId = selectedMember.id;
      const savedTransactions = localStorage.getItem('lendingTransactions');
      let allTransactions = savedTransactions ? JSON.parse(savedTransactions) : {};
      const transactions = allTransactions[memberId] || [];
      const updated = transactions.filter(tx => tx.id !== transactionId);
      
      allTransactions[memberId] = updated;
      localStorage.setItem('lendingTransactions', JSON.stringify(allTransactions));
      setRefreshKey(prev => prev + 1);
      
      await Swal.fire({ 
        icon: 'success', 
        title: 'মুছে ফেলা হয়েছে', 
        timer: 900, 
        showConfirmButton: false 
      });
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'ত্রুটি', 
        text: 'লেনদেন মুছে ফেলতে ব্যর্থ', 
        confirmButtonColor: '#ef4444' 
      });
    }
  };

  const formatCurrency = (amount = 0) => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedMember) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {error ? `ত্রুটি: ${error.message || 'সদস্য লোড করতে সমস্যা হয়েছে'}` : 'সদস্য পাওয়া যায়নি'}
          </p>
          <button
            onClick={() => navigate('/personal/family-members')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>{selectedMember.name} - প্রোফাইল</title>
        <meta name="description" content={`${selectedMember.name} এর লেনদেনের ইতিহাস`} />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/personal/family-members')}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{selectedMember.name} - প্রোফাইল</h1>
            <p className="text-gray-600 dark:text-gray-400">লেনদেনের ইতিহাস এবং বিবরণ</p>
          </div>
        </div>
      </div>

      {/* Member Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4">
          {selectedMember.picture ? (
            <img
              src={selectedMember.picture}
              alt={selectedMember.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-purple-200 dark:border-purple-800"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center border-2 border-purple-200 dark:border-purple-800">
              <Users className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedMember.name}</h3>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">{selectedMember.relationship}</p>
            {selectedMember.fatherName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">পিতার নাম: {selectedMember.fatherName}</p>
            )}
            {selectedMember.motherName && (
              <p className="text-sm text-gray-600 dark:text-gray-400">মাতার নাম: {selectedMember.motherName}</p>
            )}
            {selectedMember.mobileNumber && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">মোবাইল: {selectedMember.mobileNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Time Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
        <div className="flex gap-2">
          <button
            onClick={() => setTimeFilter('monthly')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              timeFilter === 'monthly'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            মাসিক
          </button>
          <button
            onClick={() => setTimeFilter('yearly')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              timeFilter === 'yearly'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            বাৎসরিক
          </button>
          <button
            onClick={() => setTimeFilter('alltime')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              timeFilter === 'alltime'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            সর্বকালীন
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">দিয়েছেন (দিয়েছি)</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(calculateTotals.totalGiven)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">নিয়েছেন (নিয়েছি)</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(calculateTotals.totalTaken)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        <div className={`rounded-xl border p-6 ${
          calculateTotals.balance >= 0 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ব্যালেন্স</p>
              <p className={`text-2xl font-bold mt-1 ${
                calculateTotals.balance >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {formatCurrency(Math.abs(calculateTotals.balance))}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {calculateTotals.balance >= 0 ? 'আপনার পাওনা' : 'আপনার দেয়া'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              calculateTotals.balance >= 0
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : 'bg-orange-100 dark:bg-orange-900/30'
            }`}>
              <DollarSign className={`w-6 h-6 ${
                calculateTotals.balance >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Lending History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">লেনদেনের ইতিহাস</h4>
          <button
            onClick={() => handleOpenTransactionModal()}
            className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            নতুন লেনদেন
          </button>
        </div>

        <div className="overflow-x-auto">
          {getFilteredTransactions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">তারিখ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ধরন</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">পরিমাণ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">বর্ণনা</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredTransactions
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(tx.date).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          tx.type === 'given'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {tx.type === 'given' ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3" />
                              দিয়েছেন
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3" />
                              নিয়েছেন
                            </>
                          )}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm font-semibold ${
                        tx.type === 'given'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {tx.type === 'given' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {tx.description || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenTransactionModal(tx)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">কোন লেনদেন নেই</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                নতুন লেনদেন যোগ করতে উপরের বাটনে ক্লিক করুন
              </p>
              <button
                onClick={() => handleOpenTransactionModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                <Plus className="w-4 h-4" />
                নতুন লেনদেন যোগ করুন
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Form Modal */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          resetTransactionForm();
        }}
        title={editingTransaction ? 'লেনদেন সম্পাদনা করুন' : 'নতুন লেনদেন যোগ করুন'}
        size="md"
      >
        <form onSubmit={handleTransactionSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              লেনদেনের ধরন <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransactionFormData({ ...transactionFormData, type: 'given' })}
                className={`px-4 py-3 rounded-lg font-medium transition-all border-2 flex items-center justify-center gap-2 ${
                  transactionFormData.type === 'given'
                    ? 'bg-green-600 text-white border-green-600 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                দিয়েছেন (দিয়েছি)
              </button>
              <button
                type="button"
                onClick={() => setTransactionFormData({ ...transactionFormData, type: 'taken' })}
                className={`px-4 py-3 rounded-lg font-medium transition-all border-2 flex items-center justify-center gap-2 ${
                  transactionFormData.type === 'taken'
                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                নিয়েছেন (নিয়েছি)
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              পরিমাণ <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={transactionFormData.amount}
              onChange={(e) => setTransactionFormData({ ...transactionFormData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="পরিমাণ লিখুন"
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              তারিখ <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={transactionFormData.date}
              onChange={(e) => setTransactionFormData({ ...transactionFormData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              বর্ণনা
            </label>
            <textarea
              value={transactionFormData.description}
              onChange={(e) => setTransactionFormData({ ...transactionFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="লেনদেন সম্পর্কে অতিরিক্ত তথ্য (ঐচ্ছিক)"
              rows={3}
            />
          </div>

          <ModalFooter>
            <button
              type="button"
              onClick={() => {
                setIsTransactionModalOpen(false);
                resetTransactionForm();
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {editingTransaction ? 'আপডেট করুন' : 'যোগ করুন'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default FamilyMemberProfile;
