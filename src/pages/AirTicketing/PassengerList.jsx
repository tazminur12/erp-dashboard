import React, { useMemo, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import { Plus, Eye, Trash2, Loader2, Search } from 'lucide-react';
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
  
  // Fetch air customers
  const { data: airCustomersData, isPending: isLoading, isError, error } = useAirCustomers({
    page,
    limit,
    search,
    isActive: 'true'
  });
  
  const customers = airCustomersData?.customers || [];
  const pagination = airCustomersData?.pagination || {};
  
  // Delete mutation
  const deleteMutation = useDeleteAirCustomer();
  
  const columns = useMemo(() => ([
    { key: 'customerId', header: 'Customer ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'mobile', header: 'Mobile', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'passportNumber', header: 'Passport No', sortable: true },
    { key: 'division', header: 'Division', sortable: true },
    { key: 'customerType', header: 'Type', sortable: true },
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
  

  if (isError) {
    return (
      <div className="px-2 sm:px-4 lg:px-6 py-4">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">Error loading passengers: {error?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 lg:px-6 py-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Air Passenger List</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage and search air customers {pagination.total ? `(${pagination.total} total)` : ''}
          </p>
        </div>
        <Link
          to="/air-ticketing/new-passenger"
          className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors duration-200 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Passenger
        </Link>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, mobile, email, passport number, or customer ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on new search
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading passengers...</span>
        </div>
      ) : (
        <DataTable
          data={customers}
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
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                title="View"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>
              <button
                onClick={() => handleDelete(item)}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
};

export default PassengerList;

