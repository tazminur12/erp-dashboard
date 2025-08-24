import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { mockCustomers } from '../../lib/mock';
import { formatPhone, formatDate, formatStatus } from '../../lib/format';

const CustomerList = () => {
  const columns = [
    {
      key: 'id',
      header: 'ID',
      sortable: true
    },
    {
      key: 'name',
      header: 'নাম',
      sortable: true
    },
    {
      key: 'phone',
      header: 'ফোন',
      sortable: false,
      render: (value) => formatPhone(value)
    },
    {
      key: 'email',
      header: 'ইমেইল',
      sortable: true
    },
    {
      key: 'address',
      header: 'ঠিকানা',
      sortable: false
    },
    {
      key: 'status',
      header: 'অবস্থা',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        }`}>
          {formatStatus(value)}
        </span>
      )
    },
    {
      key: 'totalTransactions',
      header: 'মোট লেনদেন',
      sortable: true
    },
    {
      key: 'balance',
      header: 'ব্যালেন্স',
      sortable: true,
      render: (value) => `৳${value.toLocaleString('bn-BD')}`
    },
    {
      key: 'createdAt',
      header: 'যোগ হওয়ার তারিখ',
      sortable: true,
      render: (value) => formatDate(value)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              গ্রাহক তালিকা
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              সব গ্রাহকের তথ্য দেখুন এবং পরিচালনা করুন
            </p>
          </div>
        </div>
        
        <Link
          to="/customers/add"
          className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          নতুন গ্রাহক যোগ করুন
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                মোট গ্রাহক
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {mockCustomers.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                সক্রিয় গ্রাহক
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {mockCustomers.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                নিষ্ক্রিয় গ্রাহক
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {mockCustomers.filter(c => c.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                গড় লেনদেন
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round(mockCustomers.reduce((acc, c) => acc + c.totalTransactions, 0) / mockCustomers.length)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={mockCustomers}
        columns={columns}
        searchable={true}
        pagination={true}
        exportable={true}
        actions={true}
        pageSize={10}
      />
    </div>
  );
};

export default CustomerList;
