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
  AlertCircle
} from 'lucide-react';
import { usePackage, usePackageCustomers } from '../../hooks/usePackageQueries';

const PackageCustomersList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'hajj', 'umrah'

  const { data: packageData, isLoading: packageLoading } = usePackage(id);
  const { data: customersData, isLoading: customersLoading, error } = usePackageCustomers(id);

  const pkg = packageData || null;
  const customers = customersData || { haji: [], umrah: [], all: [] };

  const isLoading = packageLoading || customersLoading;

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
    </div>
  );
};

export default PackageCustomersList;

