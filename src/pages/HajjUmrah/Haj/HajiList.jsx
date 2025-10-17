import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import DataTable from '../../../components/common/DataTable';
import FilterBar from '../../../components/common/FilterBar';
import Modal from '../../../components/common/Modal';
import ExcelUploader from '../../../components/common/ExcelUploader';
import { useCustomers } from '../../../hooks/useCustomerQueries';

const HajiList = () => {
  const navigate = useNavigate();
  const [filteredHajis, setFilteredHajis] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHaji, setSelectedHaji] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showExcelUploader, setShowExcelUploader] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    package: 'all',
    dateRange: 'all'
  });

  // Fetch customers with type "haj"
  const { data: customers = [], isLoading, error } = useCustomers();

  // Filter customers by customer type "haj"
  const hajis = customers.filter(customer => 
    customer.customerType && customer.customerType.toLowerCase() === 'haj'
  );

  // Filter and search functionality
  useEffect(() => {
    let filtered = hajis;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(haji =>
        (haji.name && haji.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (haji.passportNumber && haji.passportNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (haji.mobile && haji.mobile.includes(searchTerm)) ||
        (haji.email && haji.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (haji.customerId && haji.customerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (haji.nidNumber && haji.nidNumber.includes(searchTerm))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(haji => haji.status === filters.status);
    }

    // Package filter
    if (filters.package !== 'all') {
      filtered = filtered.filter(haji => 
        haji.customerType && haji.customerType.toLowerCase().includes(filters.package.toLowerCase())
      );
    }

    setFilteredHajis(filtered);
  }, [hajis, searchTerm, filters]);

  const handleViewDetails = (haji) => {
    // Navigate to details page using customerId
    navigate(`/hajj-umrah/haji/${haji.customerId}`);
  };

  const handleEdit = (haji) => {
    // Navigate to edit page with customer data
    navigate(`/hajj-umrah/haji/add?customerId=${haji.customerId}&edit=true`);
  };

  const handleDelete = (haji) => {
    const fullName = `${haji.firstName || ''} ${haji.lastName || ''}`.trim() || 'This haji';
    if (window.confirm(`Are you sure you want to delete ${fullName}?`)) {
      // This would need to be implemented with a delete mutation
      console.log('Delete haji:', haji.id);
    }
  };

  const handleExcelUpload = () => {
    setShowExcelUploader(true);
  };

  const handleExcelDataProcessed = (processedData) => {
    // Process the uploaded Excel data - this would need to be implemented with create mutation
    console.log('Excel data processed:', processedData);
    setShowExcelUploader(false);
    
    // Show success message
    alert(`Successfully processed ${processedData.length} Haji from Excel file!`);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.active}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const paymentClasses = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      pending: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentClasses[paymentStatus] || paymentClasses.pending}`}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      key: 'customerId',
      header: 'Haji ID',
      sortable: true,
        render: (value, haji) => (
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {haji.customerId || haji.id}
          </span>
        )
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (value, haji) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {haji.customerImage ? (
              <img 
                src={haji.customerImage} 
                alt={haji.name || 'Customer'} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center ${haji.customerImage ? 'hidden' : 'flex'}`}>
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {haji.name || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{haji.passportNumber || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (value, haji) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
            <Phone className="w-3 h-3" />
            <span>{haji.mobile || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
            <Mail className="w-3 h-3" />
            <span className="truncate">{haji.email || 'N/A'}</span>
          </div>
          {haji.whatsappNo && (
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <span>{haji.whatsappNo}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'address',
      header: 'Address',
      render: (value, haji) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">{haji.address || 'N/A'}</div>
          <div className="text-gray-500 dark:text-gray-400">
            {haji.district && haji.upazila ? `${haji.upazila}, ${haji.district}` : 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'customerType',
      header: 'Package',
      sortable: true,
      render: (value, haji) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">{haji.customerType || 'N/A'}</div>
          <div className="text-gray-500 dark:text-gray-400">{haji.referenceBy || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, haji) => getStatusBadge(haji.status || 'active')
    },
    {
      key: 'payment',
      header: 'Payment',
      sortable: true,
      render: (value, haji) => (
        <div className="text-sm">
          {getPaymentBadge(haji.paymentStatus || 'pending')}
          <div className="text-gray-500 dark:text-gray-400 mt-1">
            ৳{(haji.paidAmount || 0).toLocaleString()} / ৳{(haji.totalAmount || 0).toLocaleString()}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value, haji) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewDetails(haji)}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(haji)}
            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(haji)}
            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const filterOptions = [
    {
      label: 'Status',
      key: 'status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      label: 'Package',
      key: 'package',
      options: [
        { value: 'all', label: 'All Packages' },
        { value: 'haj', label: 'Haj' }
      ]
    }
  ];

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading Haji data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message || 'Failed to load Haji data. Please try again.'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Haji List</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all registered Haji</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handleExcelUpload}
            className="flex items-center space-x-2 px-4 py-2 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>
          <Link
            to="/hajj-umrah/haji/add"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Haji</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Haji</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{hajis.length}</p>
            </div>
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {hajis.filter(h => h.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {hajis.filter(h => h.status === 'inactive').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ৳{hajis.reduce((sum, h) => sum + (h.paidAmount || 0), 0).toLocaleString()}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, passport, mobile, email, customer ID, or NID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <FilterBar
            filters={filterOptions}
            onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredHajis}
        columns={columns}
        searchable={false}
        exportable={false}
        actions={false}
      />

      {/* Haji Details Modal */}
      {showModal && selectedHaji && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Haji Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Name</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Customer ID</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.customerId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Mobile</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.mobile || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.whatsappNo || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">NID Number</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.nidNumber || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Address</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Division</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.division || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">District</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.district || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Upazila</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.upazila || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Post Code</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.postCode || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Passport Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Passport Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Passport Number</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.passportNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Issue Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedHaji.issueDate ? new Date(selectedHaji.issueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Expiry Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedHaji.expiryDate ? new Date(selectedHaji.expiryDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedHaji.dateOfBirth ? new Date(selectedHaji.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Package Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Package Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Customer Type</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.customerType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Reference By</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.referenceBy || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Reference Customer ID</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.referenceCustomerId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedHaji.status || 'active')}</div>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Total Amount</label>
                  <p className="text-gray-900 dark:text-white">৳{(selectedHaji.totalAmount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Paid Amount</label>
                  <p className="text-gray-900 dark:text-white">৳{(selectedHaji.paidAmount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Due Amount</label>
                  <p className="text-gray-900 dark:text-white">৳{((selectedHaji.totalAmount || 0) - (selectedHaji.paidAmount || 0)).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Created At</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedHaji.createdAt ? new Date(selectedHaji.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Updated At</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedHaji.updatedAt ? new Date(selectedHaji.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Excel Uploader Modal */}
      {showExcelUploader && (
        <ExcelUploader
          isOpen={showExcelUploader}
          onClose={() => setShowExcelUploader(false)}
          onDataProcessed={handleExcelDataProcessed}
          title="Upload Haji Data from Excel"
          acceptedFields={[
            'name', 'passport', 'phone', 'email', 'address', 
            'package', 'agent', 'totalAmount', 'paidAmount', 
            'status', 'paymentStatus', 'registrationDate', 'departureDate'
          ]}
          requiredFields={['name', 'passport', 'phone', 'email', 'package']}
          sampleData={[
            [
              'Name', 'Passport', 'Phone', 'Email', 'Address', 
              'Package', 'Agent', 'Total Amount', 'Paid Amount', 
              'Status', 'Payment Status', 'Registration Date', 'Departure Date'
            ],
            [
              'Md. Abdul Rahman', 'A1234567', '+8801712345678', 'abdul.rahman@email.com', 
              'Dhaka, Bangladesh', 'Premium Hajj 2024', 'Al-Hijrah Travels', '450000', '450000', 
              'confirmed', 'paid', '2024-01-15', '2024-06-10'
            ],
            [
              'Fatima Begum', 'B2345678', '+8801712345679', 'fatima.begum@email.com', 
              'Chittagong, Bangladesh', 'Standard Umrah 2024', 'Madina Tours', '180000', '90000', 
              'pending', 'partial', '2024-02-20', '2024-03-15'
            ],
            [
              'Md. Karim Uddin', 'C3456789', '+8801712345680', 'karim.uddin@email.com', 
              'Sylhet, Bangladesh', 'Deluxe Hajj 2024', 'Al-Hijrah Travels', '550000', '550000', 
              'confirmed', 'paid', '2024-01-10', '2024-06-05'
            ]
          ]}
        />
      )}
    </div>
  );
};

export default HajiList;
