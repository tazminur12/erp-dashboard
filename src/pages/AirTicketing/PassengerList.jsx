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
  
  const columns = useMemo(() => ([
    { 
      key: 'passenger', 
      header: 'Passenger', 
      render: (v, item) => {
        const photo = item.customerImage;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
              {photo ? (
                <img src={photo} alt={item.name || 'Passenger'} className="w-full h-full object-cover" />
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
      header: 'Contact', 
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
      header: 'Type', 
      sortable: true,
      render: (v) => (
        <span className="px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
          {v || 'N/A'}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (v, item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${item.isActive !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
          {item.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      key: 'payment', 
      header: 'Payment', 
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
              Due: ৳{due.toLocaleString()}
            </div>
          </div>
        );
      }
    },
  ]), []);

  const handleView = (item) => {
    const customerId = item.customerId || item._id;
    navigate(`/air-ticketing/passengers/${customerId}`);
  };

  const handleDelete = async (item) => {
    const res = await Swal.fire({
      title: 'Delete passenger?',
      text: `${item.name} will be removed from the list.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
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
  

  if (isError) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <p className="text-red-600 dark:text-red-400">Error loading passengers: {error?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Helmet>
        <title>Air Passenger List</title>
        <meta name="description" content="Manage and search air passengers in the system." />
      </Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Passenger List</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and search air passengers {totalPassengers ? `(${totalPassengers} total)` : ''}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <Link
            to="/air-ticketing/new-passenger"
            className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Passenger
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPassengers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">With Due</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{dueCount}</p>
            </div>
            <CreditCard className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Page Size</p>
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
              placeholder="Search by name, mobile, email, passport number, or customer ID..."
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
              { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
              { key: 'type', label: 'Customer Type', type: 'select', options: customerTypes }
            ]}
            onFilterChange={(vals) => setLocalFilters(vals)}
            className="md:col-span-1"
            showClearAll
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading passengers...</span>
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
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(item)}
                className="p-2 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-300"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item)}
                disabled={deleteMutation.isPending}
                className="p-2 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete"
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
