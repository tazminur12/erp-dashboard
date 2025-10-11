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
  Clock
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import FilterBar from '../../components/common/FilterBar';
import Modal from '../../components/common/Modal';

const HajiList = () => {
  const navigate = useNavigate();
  const [hajis, setHajis] = useState([]);
  const [filteredHajis, setFilteredHajis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHaji, setSelectedHaji] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    package: 'all',
    dateRange: 'all'
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockHajis = [
      {
        id: 'H001',
        name: 'Md. Abdul Rahman',
        passport: 'A1234567',
        phone: '+8801712345678',
        email: 'abdul.rahman@email.com',
        address: 'Dhaka, Bangladesh',
        package: 'Premium Hajj 2024',
        status: 'confirmed',
        paymentStatus: 'paid',
        registrationDate: '2024-01-15',
        departureDate: '2024-06-10',
        agent: 'Al-Hijrah Travels',
        totalAmount: 450000,
        paidAmount: 450000,
        dueAmount: 0
      },
      {
        id: 'H002',
        name: 'Fatima Begum',
        passport: 'B2345678',
        phone: '+8801712345679',
        email: 'fatima.begum@email.com',
        address: 'Chittagong, Bangladesh',
        package: 'Standard Umrah 2024',
        status: 'pending',
        paymentStatus: 'partial',
        registrationDate: '2024-02-20',
        departureDate: '2024-03-15',
        agent: 'Madina Tours',
        totalAmount: 180000,
        paidAmount: 90000,
        dueAmount: 90000
      },
      {
        id: 'H003',
        name: 'Md. Karim Uddin',
        passport: 'C3456789',
        phone: '+8801712345680',
        email: 'karim.uddin@email.com',
        address: 'Sylhet, Bangladesh',
        package: 'Deluxe Hajj 2024',
        status: 'confirmed',
        paymentStatus: 'paid',
        registrationDate: '2024-01-10',
        departureDate: '2024-06-05',
        agent: 'Al-Hijrah Travels',
        totalAmount: 550000,
        paidAmount: 550000,
        dueAmount: 0
      }
    ];
    
    setHajis(mockHajis);
    setFilteredHajis(mockHajis);
    setLoading(false);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = hajis;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(haji =>
        haji.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        haji.passport.toLowerCase().includes(searchTerm.toLowerCase()) ||
        haji.phone.includes(searchTerm) ||
        haji.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(haji => haji.status === filters.status);
    }

    // Package filter
    if (filters.package !== 'all') {
      filtered = filtered.filter(haji => haji.package.toLowerCase().includes(filters.package.toLowerCase()));
    }

    setFilteredHajis(filtered);
  }, [hajis, searchTerm, filters]);

  const handleViewDetails = (haji) => {
    // Navigate to details page instead of showing modal
    navigate(`/hajj-umrah/haji/${haji.id}`);
  };

  const handleEdit = (haji) => {
    // Navigate to edit page
    console.log('Edit haji:', haji.id);
  };

  const handleDelete = (haji) => {
    if (window.confirm(`Are you sure you want to delete ${haji.name}?`)) {
      setHajis(hajis.filter(h => h.id !== haji.id));
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.pending}`}>
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
      key: 'id',
      header: 'Haji ID',
      sortable: true,
      render: (value, haji) => (
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {haji.id}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (value, haji) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{haji.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{haji.passport}</div>
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
            <span>{haji.phone}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
            <Mail className="w-3 h-3" />
            <span className="truncate">{haji.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'package',
      header: 'Package',
      sortable: true,
      render: (value, haji) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">{haji.package}</div>
          <div className="text-gray-500 dark:text-gray-400">{haji.agent}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, haji) => getStatusBadge(haji.status)
    },
    {
      key: 'payment',
      header: 'Payment',
      sortable: true,
      render: (value, haji) => (
        <div className="text-sm">
          {getPaymentBadge(haji.paymentStatus)}
          <div className="text-gray-500 dark:text-gray-400 mt-1">
            ৳{haji.paidAmount.toLocaleString()} / ৳{haji.totalAmount.toLocaleString()}
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
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'pending', label: 'Pending' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'completed', label: 'Completed' }
      ]
    },
    {
      label: 'Package',
      key: 'package',
      options: [
        { value: 'all', label: 'All Packages' },
        { value: 'hajj', label: 'Hajj' },
        { value: 'umrah', label: 'Umrah' }
      ]
    }
  ];

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
              <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {hajis.filter(h => h.status === 'confirmed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {hajis.filter(h => h.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ৳{hajis.reduce((sum, h) => sum + h.paidAmount, 0).toLocaleString()}
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
              placeholder="Search by name, passport, phone, or email..."
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
        actions={true}
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
                  <p className="text-gray-900 dark:text-white">{selectedHaji.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Passport</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.passport}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Phone</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.email}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Address</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.address}</p>
                </div>
              </div>
            </div>

            {/* Package Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Package Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Package</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.package}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Agent</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.agent}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedHaji.status)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Payment Status</label>
                  <div className="mt-1">{getPaymentBadge(selectedHaji.paymentStatus)}</div>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Total Amount</label>
                  <p className="text-gray-900 dark:text-white">৳{selectedHaji.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Paid Amount</label>
                  <p className="text-gray-900 dark:text-white">৳{selectedHaji.paidAmount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Due Amount</label>
                  <p className="text-gray-900 dark:text-white">৳{selectedHaji.dueAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Registration Date</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.registrationDate}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Departure Date</label>
                  <p className="text-gray-900 dark:text-white">{selectedHaji.departureDate}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HajiList;
