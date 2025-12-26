import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Building2,
  CreditCard,
  Loader2,
  Search,
  CheckCircle,
  X,
  Save
} from 'lucide-react';
import {
  useVendorBankAccounts,
  useCreateVendorBankAccount,
  useUpdateVendorBankAccount,
  useDeleteVendorBankAccount
} from '../../hooks/useVendorBankQueries';
import { useVendor } from '../../hooks/useVendorQueries';
import Swal from 'sweetalert2';

const VendorBankAccounts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: vendor, isLoading: vendorLoading } = useVendor(id);
  const { data: bankAccounts = [], isLoading: accountsLoading, refetch } = useVendorBankAccounts(id);
  const createMutation = useCreateVendorBankAccount();
  const updateMutation = useUpdateVendorBankAccount();
  const deleteMutation = useDeleteVendorBankAccount();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'Savings',
    branchName: '',
    accountHolder: '',
    accountTitle: '',
    initialBalance: '',
    currency: 'BDT',
    contactNumber: '',
    isPrimary: false,
    notes: ''
  });

  const filteredAccounts = bankAccounts.filter(account =>
    account.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountNumber?.includes(searchTerm) ||
    account.accountHolder?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAdd = () => {
    setFormData({
      bankName: '',
      accountNumber: '',
      accountType: 'Savings',
      branchName: '',
      accountHolder: '',
      accountTitle: '',
      initialBalance: '',
      currency: 'BDT',
      contactNumber: '',
      isPrimary: false,
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      bankName: account.bankName || '',
      accountNumber: account.accountNumber || '',
      accountType: account.accountType || 'Savings',
      branchName: account.branchName || '',
      accountHolder: account.accountHolder || '',
      accountTitle: account.accountTitle || account.accountHolder || '',
      initialBalance: account.initialBalance || '',
      currency: account.currency || 'BDT',
      contactNumber: account.contactNumber || '',
      isPrimary: account.isPrimary || false,
      notes: account.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = async (account) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete bank account ${account.bankName} - ${account.accountNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      deleteMutation.mutate(
        { vendorId: id, accountId: account._id },
        {
          onSuccess: () => {
            refetch();
          }
        }
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.bankName || !formData.accountNumber || !formData.accountHolder) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Bank Name, Account Number, and Account Holder are required',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    if (showAddModal) {
      createMutation.mutate(
        {
          vendorId: id,
          bankAccountData: {
            ...formData,
            initialBalance: parseFloat(formData.initialBalance) || 0
          }
        },
        {
          onSuccess: () => {
            setShowAddModal(false);
            refetch();
          }
        }
      );
    } else if (showEditModal && editingAccount) {
      updateMutation.mutate(
        {
          vendorId: id,
          accountId: editingAccount._id,
          updateData: {
            ...formData,
            initialBalance: parseFloat(formData.initialBalance) || 0
          }
        },
        {
          onSuccess: () => {
            setShowEditModal(false);
            setEditingAccount(null);
            refetch();
          }
        }
      );
    }
  };

  const formatCurrency = (amount, currency = 'BDT') => {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
  };

  if (vendorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <Helmet>
        <title>Vendor Bank Accounts - {vendor?.tradeName}</title>
        <meta name="description" content={`Bank accounts for vendor ${vendor?.tradeName}`} />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/vendors/${id}`}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Vendor Details</span>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Bank Accounts
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {vendor?.tradeName} - Manage bank accounts
                </p>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Bank Account
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by bank name, account number, or account holder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Bank Accounts List */}
        {accountsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Bank Accounts Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try a different search term' : 'Add your first bank account to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Bank Account
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((account) => (
              <div
                key={account._id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {account.bankName}
                      </h3>
                      {account.isPrimary && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      A/C: {account.accountNumber}
                    </p>
                    {account.branchName && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Branch: {account.branchName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(account)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Holder</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {account.accountHolder}
                    </span>
                  </div>
                  {account.accountTitle && account.accountTitle !== account.accountHolder && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Account Title</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {account.accountTitle}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {account.accountType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Balance</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(account.currentBalance || account.initialBalance, account.currency)}
                    </span>
                  </div>
                  {account.contactNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Contact</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {account.contactNumber}
                      </span>
                    </div>
                  )}
                  {account.notes && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-500">{account.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Add Bank Account
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Type
                    </label>
                    <select
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                      <option value="Fixed Deposit">Fixed Deposit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Holder <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountHolder"
                      value={formData.accountHolder}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Title
                    </label>
                    <input
                      type="text"
                      name="accountTitle"
                      value={formData.accountTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Initial Balance
                    </label>
                    <input
                      type="number"
                      name="initialBalance"
                      value={formData.initialBalance}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="BDT">BDT</option>
                      <option value="USD">USD</option>
                      <option value="SAR">SAR</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isPrimary"
                        checked={formData.isPrimary}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Set as primary account
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Bank Account
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAccount(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Type
                    </label>
                    <select
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                      <option value="Fixed Deposit">Fixed Deposit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Holder <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountHolder"
                      value={formData.accountHolder}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Title
                    </label>
                    <input
                      type="text"
                      name="accountTitle"
                      value={formData.accountTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Initial Balance
                    </label>
                    <input
                      type="number"
                      name="initialBalance"
                      value={formData.initialBalance}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="BDT">BDT</option>
                      <option value="USD">USD</option>
                      <option value="SAR">SAR</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isPrimary"
                        checked={formData.isPrimary}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Set as primary account
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAccount(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Update
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorBankAccounts;

