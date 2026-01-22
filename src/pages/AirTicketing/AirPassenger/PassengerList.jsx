import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import DataTable from '../../components/common/DataTable';
import FilterBar from '../../components/common/FilterBar';
import { Plus, Eye, Edit, Trash2, Loader2, Search, Users, Phone, Mail, CreditCard, CheckCircle, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAirCustomersQueries from '../../hooks/useAirCustomersQueries';

const PassengerList = () => {
  const navigate = useNavigate();
  const { useAirCustomers, useDeleteAirCustomer } = useAirCustomersQueries();
  
  // State for pagination and filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(50);
  const [localFilters, setLocalFilters] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Fetch air customers
  const { data: airCustomersData, isPending: isLoading, isError, error } = useAirCustomers({
    page,
    limit,
    search,
    isActive: 'true'
  });
  
  const customers = airCustomersData?.customers || [];
  const pagination = airCustomersData?.pagination || {};
  const totalPassengers = pagination?.total || customers.length;
  
  // Delete mutation
  const deleteMutation = useDeleteAirCustomer();
  
  // Derive unique customer types for filter options
  const [customerTypes, setCustomerTypes] = useState([]);
  useEffect(() => {
    const types = Array.from(new Set(customers.map(c => c.customerType).filter(Boolean)));
    setCustomerTypes(types.map(t => ({ value: t, label: t })));
  }, [customers]);
  
  // Apply local filters (status, type)
  const filteredCustomers = useMemo(() => {
    let list = customers;
    if (localFilters.status) {
      if (localFilters.status === 'active') list = list.filter(c => c.isActive !== false);
      if (localFilters.status === 'inactive') list = list.filter(c => c.isActive === false);
    }
    if (localFilters.type) {
      list = list.filter(c => (c.customerType || '').toLowerCase() === localFilters.type.toLowerCase());
    }
    return list;
  }, [customers, localFilters]);
  
  // Stats
  const activeCount = useMemo(() => filteredCustomers.filter(c => c.isActive !== false).length, [filteredCustomers]);
  const dueCount = useMemo(() => filteredCustomers.filter(c => (c.totalDue || c.calculatedTotalDue || 0) > 0).length, [filteredCustomers]);
  
  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredCustomers.map(c => c.customerId || c._id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const columns = useMemo(() => ([
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      render: (_, item) => {
        const id = item.customerId || item._id;
        return (
          <input
            type="checkbox"
            checked={selectedIds.includes(id)}
            onChange={() => handleSelectOne(id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        );
      }
    },
    { 
      key: 'passenger', 
      header: 'যাত্রী', 
      render: (v, item) => {
        const photo = item.customerImage;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
              {photo ? (
                <img src={photo} alt={item.name || 'যাত্রী'} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{item.name || 'N/A'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{item.passportNumber || 'N/A'}</div>
            </div>
          </div>
        );
      }
    },
    { 
      key: 'contact', 
      header: 'যোগাযোগ', 
      render: (v, item) => (
        <div className="text-sm">
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <Phone className="w-4 h-4" />
            <span>{item.mobile || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <Mail className="w-4 h-4" />
            <span className="truncate">{item.email || 'N/A'}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'customerType', 
      header: 'ধরন', 
      sortable: true,
      render: (v) => (
        <span className="px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
          {v || 'N/A'}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'অবস্থা', 
      render: (v, item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${item.isActive !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
          {item.isActive !== false ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
        </span>
      )
    },
    { 
      key: 'payment', 
      header: 'পেমেন্ট', 
      render: (v, item) => {
        const total = item.totalAmount || item.calculatedTotalAmount || 0;
        const paid = item.paidAmount || item.calculatedPaidAmount || 0;
        const due = item.totalDue || item.calculatedTotalDue || 0;
        return (
          <div className="text-sm">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <CreditCard className="w-4 h-4" />
              <span>৳{paid.toLocaleString()} / ৳{total.toLocaleString()}</span>
            </div>
            <div className={`text-xs ${due > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
              বকেয়া: ৳{due.toLocaleString()}
            </div>
          </div>
        );
      }
    },
  ]), [filteredCustomers, selectedIds]);

  const handleView = (item) => {
    const customerId = item.customerId || item._id;
    navigate(`/air-ticketing/passengers/${customerId}`);
  };

  const handleDelete = async (item) => {
    const res = await Swal.fire({
      title: 'যাত্রী মুছে ফেলবেন?',
      text: `${item.name} তালিকা থেকে সরানো হবে।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'মুছে ফেলুন',
      confirmButtonColor: '#ef4444'
    });
    
    if (res.isConfirmed) {
      const customerId = item.customerId || item._id;
      deleteMutation.mutate(customerId);
    }
  };
  
  const handleEdit = (item) => {
    const customerId = item.customerId || item._id;
    navigate(`/air-ticketing/passengers/edit/${customerId}`);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const res = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `আপনি ${selectedIds.length} জন যাত্রী মুছে ফেলতে যাচ্ছেন। এটি পূর্বাবস্থায় ফেরানো যাবে না।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, নির্বাচিত মুছে ফেলুন',
      confirmButtonColor: '#ef4444'
    });

    if (res.isConfirmed) {
      try {
        // Sequentially delete to avoid overwhelming the server or hitting rate limits
        // In a real app, you should have a bulk delete endpoint
        let successCount = 0;
        for (const id of selectedIds) {
          try {
            await deleteMutation.mutateAsync(id);
            successCount++;
          } catch (err) {
            console.error(`Failed to delete customer ${id}`, err);
          }
        }
        
        setSelectedIds([]);
        Swal.fire('Deleted!', `${successCount} passengers have been deleted.`, 'success');
      } catch (err) {
        Swal.fire('Error', 'An error occurred during deletion.', 'error');
      }
    }
  };
  

  if (isError) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <p className="text-red-600 dark:text-red-400">যাত্রী লোড করতে ত্রুটি: {error?.message || 'অজানা ত্রুটি'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Helmet>
        <title>এয়ার যাত্রী তালিকা</title>
        <meta name="description" content="সিস্টেমে এয়ার যাত্রীদের পরিচালনা এবং অনুসন্ধান করুন।" />
      </Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">যাত্রী তালিকা</h1>
            <p className="text-gray-600 dark:text-gray-400">এয়ার যাত্রীদের পরিচালনা এবং অনুসন্ধান করুন {totalPassengers ? `(মোট ${totalPassengers})` : ''}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <Download className="w-4 h-4 mr-2" />
            এক্সপোর্ট
          </button>
          <Link
            to="/air-ticketing/new-passenger"
            className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            নতুন যাত্রী
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">মোট</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPassengers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">সক্রিয়</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">বকেয়া আছে</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{dueCount}</p>
            </div>
            <CreditCard className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">পৃষ্ঠার আকার</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{limit}</p>
            </div>
            <Search className="w-8 h-8 text-gray-600 dark:text-gray-300" />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="নাম, মোবাইল, ইমেইল, পাসপোর্ট নম্বর, বা গ্রাহক আইডি দিয়ে অনুসন্ধান করুন..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <FilterBar
            filters={[
              { key: 'status', label: 'অবস্থা', type: 'select', options: [{ value: 'active', label: 'সক্রিয়' }, { value: 'inactive', label: 'নিষ্ক্রিয়' }] },
              { key: 'type', label: 'গ্রাহকের ধরন', type: 'select', options: customerTypes }
            ]}
            onFilterChange={(vals) => setLocalFilters(vals)}
            className="md:col-span-1"
            showClearAll
          />
        </div>
      </div>

      {/* Selected Items Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {selectedIds.length} টি আইটেম নির্বাচিত
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                সব পৃষ্ঠায় মোট {totalPassengers} টি আইটেম নির্বাচন করবেন?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              বাতিল
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              নির্বাচিত মুছে ফেলুন
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">যাত্রী লোড হচ্ছে...</span>
        </div>
      ) : (
        <DataTable
          data={filteredCustomers}
          columns={columns}
          pageSize={limit}
          exportable
          searchable={false}
          actions
          className="overflow-hidden"
          customActions={(item) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleView(item)}
                className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300"
                title="দেখুন"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(item)}
                className="p-2 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-300"
                title="সম্পাদনা"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item)}
                disabled={deleteMutation.isPending}
                className="p-2 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
};

export default PassengerList;
