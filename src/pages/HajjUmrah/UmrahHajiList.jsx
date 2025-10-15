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
  User,
  CreditCard,
  CheckCircle,
  Clock,
  Upload
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import FilterBar from '../../components/common/FilterBar';
import ExcelUploader from '../../components/common/ExcelUploader';

const UmrahHajiList = () => {
  const navigate = useNavigate();
  const [pilgrims, setPilgrims] = useState([]);
  const [filteredPilgrims, setFilteredPilgrims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExcelUploader, setShowExcelUploader] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all'
  });

  useEffect(() => {
    const mock = [
      {
        id: 'U001',
        name: 'Abu Bakar',
        passport: 'U1234567',
        phone: '+8801700000001',
        email: 'abu@example.com',
        package: 'Standard Umrah 2024',
        status: 'pending',
        paymentStatus: 'partial',
        registrationDate: '2024-10-01',
        departureDate: '2024-11-15',
        agent: 'Madina Tours',
        totalAmount: 120000,
        paidAmount: 60000,
        dueAmount: 60000
      },
      {
        id: 'U002',
        name: 'Aisha Siddiqah',
        passport: 'U2345678',
        phone: '+8801700000002',
        email: 'aisha@example.com',
        package: 'Deluxe Umrah 2024',
        status: 'confirmed',
        paymentStatus: 'paid',
        registrationDate: '2024-09-15',
        departureDate: '2024-10-20',
        agent: 'Al-Hijrah Travels',
        totalAmount: 180000,
        paidAmount: 180000,
        dueAmount: 0
      }
    ];
    setPilgrims(mock);
    setFilteredPilgrims(mock);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = pilgrims;
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.passport.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    setFilteredPilgrims(filtered);
  }, [pilgrims, searchTerm, filters]);

  const columns = [
    { key: 'id', header: 'ID', sortable: true, render: (_, p) => (
      <span className="font-medium text-blue-600 dark:text-blue-400">{p.id}</span>
    ) },
    { key: 'name', header: 'Name', sortable: true, render: (_, p) => (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{p.passport}</div>
        </div>
      </div>
    ) },
    { key: 'contact', header: 'Contact', render: (_, p) => (
      <div className="text-sm">
        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
          <Phone className="w-3 h-3" />
          <span>{p.phone}</span>
        </div>
        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
          <Mail className="w-3 h-3" />
          <span className="truncate">{p.email}</span>
        </div>
      </div>
    ) },
    { key: 'package', header: 'Package', sortable: true, render: (_, p) => (
      <div className="text-sm">
        <div className="font-medium text-gray-900 dark:text-white">{p.package}</div>
        <div className="text-gray-500 dark:text-gray-400">{p.agent}</div>
      </div>
    ) },
    { key: 'status', header: 'Status', sortable: true, render: (_, p) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
      </span>
    ) },
    { key: 'payment', header: 'Payment', sortable: true, render: (_, p) => (
      <div className="text-sm">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : p.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
          {p.paymentStatus.charAt(0).toUpperCase() + p.paymentStatus.slice(1)}
        </span>
        <div className="text-gray-500 dark:text-gray-400 mt-1">
          ৳{p.paidAmount.toLocaleString()} / ৳{p.totalAmount.toLocaleString()}
        </div>
      </div>
    ) },
    { key: 'actions', header: 'Actions', render: (_, p) => (
      <div className="flex items-center space-x-2">
        <button onClick={() => navigate(`/hajj-umrah/haji/${p.id}`)} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg" title="View Details">
          <Eye className="w-4 h-4" />
        </button>
        <button onClick={() => console.log('Edit', p.id)} className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg" title="Edit">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => setPilgrims(prev => prev.filter(x => x.id !== p.id))} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ) }
  ];

  const filterOptions = [
    {
      label: 'Status',
      key: 'status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'pending', label: 'Pending' }
      ]
    }
  ];

  const handleExcelDataProcessed = (processed) => {
    const rows = processed.map((row, index) => ({
      id: `U${String(Date.now() + index).slice(-3)}`,
      ...row,
      status: row.status || 'pending',
      paymentStatus: row.paymentStatus || 'pending',
      registrationDate: row.registrationDate || new Date().toISOString().split('T')[0],
      departureDate: row.departureDate || '',
      agent: row.agent || '',
      totalAmount: parseFloat(row.totalAmount) || 0,
      paidAmount: parseFloat(row.paidAmount) || 0,
      dueAmount: (parseFloat(row.totalAmount) || 0) - (parseFloat(row.paidAmount) || 0)
    }));
    setPilgrims(prev => [...prev, ...rows]);
    setShowExcelUploader(false);
    alert(`Successfully added ${rows.length} Umrah Haji from Excel!`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Umrah Haji List</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all registered Umrah pilgrims</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setShowExcelUploader(true)}
            className="flex items-center space-x-2 px-4 py-2 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>
          <Link
            to="/umrah/haji/add"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Umrah Haji</span>
          </Link>
        </div>
      </div>

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

      <DataTable
        data={filteredPilgrims}
        columns={columns}
        searchable={false}
        exportable={false}
        actions={false}
      />

      {showExcelUploader && (
        <ExcelUploader
          isOpen={showExcelUploader}
          onClose={() => setShowExcelUploader(false)}
          onDataProcessed={handleExcelDataProcessed}
          title="Upload Umrah Haji Data from Excel"
          acceptedFields={[ 'name', 'passport', 'phone', 'email', 'address', 'package', 'agent', 'totalAmount', 'paidAmount', 'status', 'paymentStatus', 'registrationDate', 'departureDate' ]}
          requiredFields={[ 'name', 'passport', 'phone', 'email', 'package' ]}
          sampleData={[
            ['Name','Passport','Phone','Email','Address','Package','Agent','Total Amount','Paid Amount','Status','Payment Status','Registration Date','Departure Date'],
            ['Abu Bakar','U1234567','+8801700000001','abu@example.com','Dhaka, Bangladesh','Standard Umrah 2024','Madina Tours','120000','60000','pending','partial','2024-10-01','2024-11-15']
          ]}
        />
      )}
    </div>
  );
};

export default UmrahHajiList;


