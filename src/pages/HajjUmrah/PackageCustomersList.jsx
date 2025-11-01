import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Search,
  Phone,
  Mail,
  User,
  Package,
  FileText,
  AlertCircle,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';
import { usePackage, usePackageCustomers, useAssignPackageToPassenger } from '../../hooks/usePackageQueries';
import { useHajiList } from '../../hooks/UseHajiQueries';
import { useUmrahList } from '../../hooks/UseUmrahQuries';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';

const PackageCustomersList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'hajj', 'umrah'
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [assignSearchTerm, setAssignSearchTerm] = useState('');
  const [assignCustomerType, setAssignCustomerType] = useState('all'); // 'all', 'hajj', 'umrah'

  const { data: packageData, isLoading: packageLoading } = usePackage(id);
  const { data: customersData, isLoading: customersLoading, error } = usePackageCustomers(id);
  const { data: hajiData, isLoading: hajiLoading } = useHajiList({ limit: 10000 });
  const { data: umrahData, isLoading: umrahLoading } = useUmrahList({ limit: 10000 });
  const assignPackageMutation = useAssignPackageToPassenger();
  const queryClient = useQueryClient();

  const pkg = packageData || null;
  const customers = customersData || { haji: [], umrah: [], all: [] };

  const isLoading = packageLoading || customersLoading || hajiLoading || umrahLoading;

  // Filter customers based on search term and active tab
  const filteredCustomers = (customers.all || []).filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.mobile?.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer._id?.toLowerCase().includes(searchLower) ||
      customer.passportNumber?.toLowerCase().includes(searchLower) ||
      customer.nidNumber?.includes(searchTerm) ||
      customer.customerId?.toLowerCase().includes(searchLower)
    );

    // Filter by tab
    if (activeTab === 'hajj') {
      const isHajj = (customers.haji || []).some(h => h._id === customer._id);
      return matchesSearch && isHajj;
    } else if (activeTab === 'umrah') {
      const isUmrah = (customers.umrah || []).some(u => u._id === customer._id);
      return matchesSearch && isUmrah;
    }

    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Get all customers (hajj + umrah) that are NOT assigned to this package
  const getAllUnassignedCustomers = () => {
    const hajiList = hajiData?.data || [];
    const umrahList = umrahData?.data || [];
    const assignedIds = (customers.all || []).map(c => c._id);

    const unassignedHaji = hajiList.filter(h => !assignedIds.includes(h._id));
    const unassignedUmrah = umrahList.filter(u => !assignedIds.includes(u._id));

    return {
      all: [...unassignedHaji, ...unassignedUmrah],
      haji: unassignedHaji,
      umrah: unassignedUmrah
    };
  };

  const unassignedCustomers = getAllUnassignedCustomers();

  // Filter unassigned customers for assign modal
  const getFilteredUnassignedCustomers = () => {
    const searchLower = assignSearchTerm.toLowerCase();
    
    return (unassignedCustomers.all || []).filter(customer => {
      const matchesSearch = (
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.mobile?.includes(assignSearchTerm) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer._id?.toLowerCase().includes(searchLower) ||
        customer.passportNumber?.toLowerCase().includes(searchLower) ||
        customer.nidNumber?.includes(assignSearchTerm) ||
        customer.customerId?.toLowerCase().includes(searchLower)
      );

      if (assignCustomerType === 'hajj') {
        const isHajj = (unassignedCustomers.haji || []).some(h => h._id === customer._id);
        return matchesSearch && isHajj;
      } else if (assignCustomerType === 'umrah') {
        const isUmrah = (unassignedCustomers.umrah || []).some(u => u._id === customer._id);
        return matchesSearch && isUmrah;
      }

      return matchesSearch;
    });
  };

  const filteredUnassignedCustomers = getFilteredUnassignedCustomers();

  // Handle customer selection for assign
  const handleCustomerSelect = (customer) => {
    if (selectedCustomers.find(c => c._id === customer._id)) {
      setSelectedCustomers(selectedCustomers.filter(c => c._id !== customer._id));
    } else {
      setSelectedCustomers([...selectedCustomers, customer]);
    }
  };

  // Handle assign customers
  const handleAssignCustomers = async () => {
    if (selectedCustomers.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'কোনো কাস্টমার নির্বাচন করা হয়নি',
        text: 'অনুগ্রহ করে কমপক্ষে একজন কাস্টমার নির্বাচন করুন'
      });
      return;
    }

    try {
      // Assign each customer one by one (silently without showing individual alerts)
      let successCount = 0;
      let errorCount = 0;

      for (const customer of selectedCustomers) {
        try {
          const isHajj = (unassignedCustomers.haji || []).some(h => h._id === customer._id);
          const customerType = isHajj ? 'hajj' : 'umrah';
          
          // Call mutation directly without showing individual success alerts
          await assignPackageMutation.mutateAsync({
            packageId: id,
            passengerId: customer._id,
            passengerType: 'adult', // Default to adult
            passengerCategory: customerType
          });
          successCount++;
        } catch (err) {
          errorCount++;
          console.error(`Error assigning customer ${customer.name}:`, err);
        }
      }

      // Close modal first
      setSelectedCustomers([]);
      setAssignSearchTerm('');
      setAssignCustomerType('all');
      setShowAssignModal(false);

      // Show single success alert for all assignments
      if (successCount > 0) {
        Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: `${successCount} জন কাস্টমার সফলভাবে প্যাকেজে অ্যাসাইন করা হয়েছে।`,
          timer: 3000,
          showConfirmButton: false,
          timerProgressBar: true,
        }).then(() => {
          // Refresh page data when alert auto-closes
          queryClient.invalidateQueries({ queryKey: ['packages'] });
          queryClient.invalidateQueries({ queryKey: ['haji', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['umrah', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['packages', 'detail', id] });
          queryClient.invalidateQueries({ queryKey: ['packages', 'detail', id, 'customers'] });
        });
      }

      // Show error alert if any failed
      if (errorCount > 0) {
        Swal.fire({
          icon: 'error',
          title: 'সতর্কতা',
          text: `${errorCount} জন কাস্টমার অ্যাসাইন করতে সমস্যা হয়েছে।`,
          timer: 3000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      console.error('Error assigning customers:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'কাস্টমার অ্যাসাইন করতে সমস্যা হয়েছে।',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">লোড করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">কাস্টমার লোড করতে সমস্যা হয়েছে</p>
          <button
            onClick={() => navigate(`/hajj-umrah/package-list/${id}`)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            প্যাকেজ ডিটেইলে ফিরুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/hajj-umrah/package-list/${id}`)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">প্যাকেজ ডিটেইলে ফিরুন</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <Package className="w-8 h-8 mr-3 text-purple-600" />
                {pkg?.packageName || 'Package'} - Assign করা কাস্টমার
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                এই প্যাকেজে assign করা সব কাস্টমারের তালিকা
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>কাস্টমার অ্যাসাইন করুন</span>
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="নাম, মোবাইল, ইমেইল, পাসপোর্ট নম্বর দিয়ে সার্চ করুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'all'
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                সব ({customers.all?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('hajj')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'hajj'
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                হজ ({customers.haji?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('umrah')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'umrah'
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                উমরাহ ({customers.umrah?.length || 0})
              </button>
            </div>
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                কোন কাস্টমার পাওয়া যায়নি
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm
                  ? 'আপনার সার্চের সাথে মিলিয়ে কোন কাস্টমার নেই'
                  : 'এই প্যাকেজে এখনও কোন কাস্টমার assign করা হয়নি'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      সিরিয়াল
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      কাস্টমার নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      মোবাইল
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ইমেইল
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      পাসপোর্ট নম্বর
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ধরন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      একশন
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCustomers.map((customer, index) => {
                    const isHajj = (customers.haji || []).some(h => h._id === customer._id);
                    const isUmrah = (customers.umrah || []).some(u => u._id === customer._id);
                    const customerType = isHajj ? 'হজ' : isUmrah ? 'উমরাহ' : 'N/A';

                    return (
                      <tr key={customer._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {customer.name || 'N/A'}
                              </div>
                              {customer.customerId && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  ID: {customer.customerId}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.mobile || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {customer.passportNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {customerType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              if (isHajj) {
                                navigate(`/hajj-umrah/haji/${customer._id}`);
                              } else if (isUmrah) {
                                navigate(`/hajj-umrah/umrah/${customer._id}?type=umrah`);
                              }
                            }}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          >
                            বিস্তারিত দেখুন
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট কাস্টমার</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{customers.all?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-lg p-3">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">হজ কাস্টমার</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{customers.haji?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">উমরাহ কাস্টমার</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{customers.umrah?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Customers Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Plus className="w-6 h-6 mr-2 text-purple-600" />
                কাস্টমার অ্যাসাইন করুন
              </h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedCustomers([]);
                  setAssignSearchTerm('');
                  setAssignCustomerType('all');
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="নাম, মোবাইল, ইমেইল, পাসপোর্ট নম্বর দিয়ে সার্চ করুন..."
                      value={assignSearchTerm}
                      onChange={(e) => setAssignSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setAssignCustomerType('all')}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      assignCustomerType === 'all'
                        ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    সব ({unassignedCustomers.all?.length || 0})
                  </button>
                  <button
                    onClick={() => setAssignCustomerType('hajj')}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      assignCustomerType === 'hajj'
                        ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    হজ ({unassignedCustomers.haji?.length || 0})
                  </button>
                  <button
                    onClick={() => setAssignCustomerType('umrah')}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      assignCustomerType === 'umrah'
                        ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    উমরাহ ({unassignedCustomers.umrah?.length || 0})
                  </button>
                </div>

                {selectedCustomers.length > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-300">
                      নির্বাচিত: {selectedCustomers.length} জন কাস্টমার
                    </p>
                  </div>
                )}
              </div>

              {/* Customer List */}
              <div className="flex-1 overflow-y-auto">
                {filteredUnassignedCustomers.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      কোন কাস্টমার পাওয়া যায়নি
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {assignSearchTerm
                        ? 'আপনার সার্চের সাথে মিলিয়ে কোন কাস্টমার নেই'
                        : 'সব কাস্টমার ইতিমধ্যে এই প্যাকেজে assign করা আছে'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                            <CheckCircle className="w-5 h-5" />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            সিরিয়াল
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            কাস্টমার নাম
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            মোবাইল
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            ইমেইল
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            পাসপোর্ট
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            ধরন
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUnassignedCustomers.map((customer, index) => {
                          const isSelected = selectedCustomers.some(c => c._id === customer._id);
                          const isHajj = (unassignedCustomers.haji || []).some(h => h._id === customer._id);
                          const isUmrah = (unassignedCustomers.umrah || []).some(u => u._id === customer._id);
                          const customerType = isHajj ? 'হজ' : isUmrah ? 'উমরাহ' : 'N/A';

                          return (
                            <tr
                              key={customer._id}
                              className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
                              onClick={() => handleCustomerSelect(customer)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {isSelected ? (
                                    <CheckCircle className="w-5 h-5 text-purple-600" />
                                  ) : (
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {customer.name || 'N/A'}
                                    </div>
                                    {customer.customerId && (
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        ID: {customer.customerId}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                  {customer.mobile || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                  {customer.email || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {customer.passportNumber || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                  {customerType}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedCustomers([]);
                    setAssignSearchTerm('');
                    setAssignCustomerType('all');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleAssignCustomers}
                  disabled={selectedCustomers.length === 0 || assignPackageMutation.isPending}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    selectedCustomers.length === 0 || assignPackageMutation.isPending
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {assignPackageMutation.isPending ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      অ্যাসাইন করা হচ্ছে...
                    </span>
                  ) : (
                    `${selectedCustomers.length} জন অ্যাসাইন করুন`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageCustomersList;

