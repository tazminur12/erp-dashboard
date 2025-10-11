import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  Edit,
  Trash2,
  Camera,
  FileText,
  TrendingUp,
  Calendar as CalendarIcon,
  Briefcase,
  CreditCard
} from 'lucide-react';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    phone: '',
    email: '',
    address: '',
    joinDate: new Date().toISOString().split('T')[0],
    salary: '',
    workHours: '',
    status: 'active',
    notes: ''
  });

  const [newAttendance, setNewAttendance] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present',
    notes: ''
  });

  const positionOptions = [
    'খামার ম্যানেজার',
    'গরু যত্নকারী',
    'দুধ সংগ্রহকারী',
    'খাদ্য ব্যবস্থাপক',
    'সিকিউরিটি গার্ড',
    'ড্রাইভার',
    'ক্লিনার',
    'অন্যান্য'
  ];

  const statusOptions = [
    { value: 'active', label: 'সক্রিয়', color: 'text-green-600 bg-green-100' },
    { value: 'inactive', label: 'নিষ্ক্রিয়', color: 'text-gray-600 bg-gray-100' },
    { value: 'on_leave', label: 'ছুটিতে', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'terminated', label: 'চাকরি ছাড়া', color: 'text-red-600 bg-red-100' }
  ];

  const attendanceStatusOptions = [
    { value: 'present', label: 'উপস্থিত', color: 'text-green-600 bg-green-100' },
    { value: 'absent', label: 'অনুপস্থিত', color: 'text-red-600 bg-red-100' },
    { value: 'late', label: 'দেরিতে', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'half_day', label: 'আধা দিন', color: 'text-blue-600 bg-blue-100' },
    { value: 'leave', label: 'ছুটি', color: 'text-purple-600 bg-purple-100' }
  ];

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalSalary: 0,
    monthlyAttendance: 0,
    presentToday: 0,
    absentToday: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEmployees();
    calculateStats();
  }, [employees, attendanceRecords, searchTerm, filterStatus, filterDate]);

  const loadData = () => {
    // Mock employee data
    const mockEmployees = [
      {
        id: 'EMP001',
        name: 'আবুল কালাম',
        position: 'খামার ম্যানেজার',
        phone: '01712345678',
        email: 'abul.kalam@example.com',
        address: 'ঢাকা, বাংলাদেশ',
        joinDate: '2023-01-15',
        salary: 25000,
        workHours: '8',
        status: 'active',
        notes: 'অভিজ্ঞ খামার ম্যানেজার'
      },
      {
        id: 'EMP002',
        name: 'করিম উদ্দিন',
        position: 'গরু যত্নকারী',
        phone: '01787654321',
        email: 'karim.uddin@example.com',
        address: 'গাজীপুর, বাংলাদেশ',
        joinDate: '2023-03-20',
        salary: 15000,
        workHours: '8',
        status: 'active',
        notes: 'গরুর যত্নে অভিজ্ঞ'
      },
      {
        id: 'EMP003',
        name: 'রহিম উদ্দিন',
        position: 'দুধ সংগ্রহকারী',
        phone: '01755555555',
        email: 'rahim.uddin@example.com',
        address: 'নারায়ণগঞ্জ, বাংলাদেশ',
        joinDate: '2023-02-10',
        salary: 12000,
        workHours: '6',
        status: 'active',
        notes: 'দুধ সংগ্রহে দক্ষ'
      },
      {
        id: 'EMP004',
        name: 'মালেক উদ্দিন',
        position: 'সিকিউরিটি গার্ড',
        phone: '01766666666',
        email: 'malek.uddin@example.com',
        address: 'টাঙ্গাইল, বাংলাদেশ',
        joinDate: '2023-04-05',
        salary: 10000,
        workHours: '12',
        status: 'on_leave',
        notes: 'নাইট শিফ্টে কাজ করেন'
      }
    ];
    setEmployees(mockEmployees);

    // Mock attendance data
    const mockAttendance = [
      {
        id: 'ATT001',
        employeeId: 'EMP001',
        employeeName: 'আবুল কালাম',
        date: '2024-01-15',
        checkIn: '08:00',
        checkOut: '17:00',
        status: 'present',
        notes: 'নিয়মিত উপস্থিত'
      },
      {
        id: 'ATT002',
        employeeId: 'EMP002',
        employeeName: 'করিম উদ্দিন',
        date: '2024-01-15',
        checkIn: '08:30',
        checkOut: '16:30',
        status: 'present',
        notes: 'নিয়মিত উপস্থিত'
      },
      {
        id: 'ATT003',
        employeeId: 'EMP003',
        employeeName: 'রহিম উদ্দিন',
        date: '2024-01-15',
        checkIn: '09:00',
        checkOut: '15:00',
        status: 'late',
        notes: 'এক ঘণ্টা দেরিতে এসেছেন'
      },
      {
        id: 'ATT004',
        employeeId: 'EMP004',
        employeeName: 'মালেক উদ্দিন',
        date: '2024-01-15',
        checkIn: '',
        checkOut: '',
        status: 'leave',
        notes: 'ছুটিতে'
      }
    ];
    setAttendanceRecords(mockAttendance);
  };

  const filterEmployees = () => {
    let filtered = employees.filter(employee => 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.includes(searchTerm)
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(employee => employee.status === filterStatus);
    }

    setFilteredEmployees(filtered);
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    
    const totalSalary = employees
      .filter(emp => emp.status === 'active')
      .reduce((sum, emp) => sum + emp.salary, 0);

    const todayAttendance = attendanceRecords.filter(att => att.date === today);
    const presentToday = todayAttendance.filter(att => att.status === 'present').length;
    const absentToday = todayAttendance.filter(att => att.status === 'absent').length;

    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyAttendance = attendanceRecords
      .filter(att => att.date.startsWith(thisMonth) && att.status === 'present').length;

    setStats({
      totalEmployees: employees.length,
      activeEmployees,
      totalSalary,
      monthlyAttendance,
      presentToday,
      absentToday
    });
  };

  const handleAddEmployee = () => {
    const employee = {
      ...newEmployee,
      id: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      salary: parseFloat(newEmployee.salary),
      workHours: parseFloat(newEmployee.workHours)
    };
    setEmployees([...employees, employee]);
    setShowAddModal(false);
    resetForm();
  };

  const handleAddAttendance = () => {
    const attendance = {
      ...newAttendance,
      id: `ATT${String(attendanceRecords.length + 1).padStart(3, '0')}`,
      employeeName: employees.find(emp => emp.id === newAttendance.employeeId)?.name || ''
    };
    setAttendanceRecords([attendance, ...attendanceRecords]);
    setShowAttendanceModal(false);
    resetAttendanceForm();
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm('আপনি কি এই কর্মচারীকে মুছে ফেলতে চান?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
      setAttendanceRecords(attendanceRecords.filter(att => att.employeeId !== id));
    }
  };

  const resetForm = () => {
    setNewEmployee({
      name: '',
      position: '',
      phone: '',
      email: '',
      address: '',
      joinDate: new Date().toISOString().split('T')[0],
      salary: '',
      workHours: '',
      status: 'active',
      notes: ''
    });
  };

  const resetAttendanceForm = () => {
    setNewAttendance({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      checkIn: '',
      checkOut: '',
      status: 'present',
      notes: ''
    });
  };

  const getStatusClass = (status) => {
    const statusObj = statusOptions.find(opt => opt.value === status);
    return statusObj ? statusObj.color : 'text-gray-600 bg-gray-100';
  };

  const getAttendanceStatusClass = (status) => {
    const statusObj = attendanceStatusOptions.find(opt => opt.value === status);
    return statusObj ? statusObj.color : 'text-gray-600 bg-gray-100';
  };

  const generateReport = () => {
    // Generate report logic
    alert('রিপোর্ট তৈরি করা হচ্ছে...');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">কর্মচারী ব্যবস্থাপনা</h1>
          <p className="text-gray-600 mt-2">খামারের কর্মচারীদের তথ্য ও উপস্থিতি ব্যবস্থাপনা</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            কর্মচারী যোগ করুন
          </button>
          <button 
            onClick={() => setShowAttendanceModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Clock className="w-5 h-5" />
            উপস্থিতি রেকর্ড
          </button>
          <button 
            onClick={generateReport}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            রিপোর্ট
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মোট কর্মচারী</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <User className="w-4 h-4 mr-1" />
            <span>{stats.activeEmployees} সক্রিয়</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মাসিক বেতন</p>
              <p className="text-2xl font-bold text-gray-900">৳{stats.totalSalary.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <CreditCard className="w-4 h-4 mr-1" />
            <span>সব কর্মচারীর</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">আজ উপস্থিত</p>
              <p className="text-2xl font-bold text-green-600">{stats.presentToday}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>{stats.absentToday} অনুপস্থিত</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মাসিক উপস্থিতি</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyAttendance}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-600">
            <Calendar className="w-4 h-4 mr-1" />
            <span>এই মাসে</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="নাম, পদ বা ফোন নম্বর দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">সব অবস্থা</option>
              <option value="active">সক্রিয়</option>
              <option value="inactive">নিষ্ক্রিয়</option>
              <option value="on_leave">ছুটিতে</option>
              <option value="terminated">চাকরি ছাড়া</option>
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  কর্মচারী
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পদ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  যোগাযোগ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  বেতন
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  যোগদান তারিখ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  অবস্থা
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্রিয়া
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">ID: {employee.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{employee.position}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-900">{employee.phone}</span>
                      </div>
                      {employee.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-500">{employee.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">৳{employee.salary.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-500">{employee.workHours} ঘণ্টা/দিন</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{new Date(employee.joinDate).toLocaleDateString('bn-BD')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(employee.status)}`}>
                      {statusOptions.find(opt => opt.value === employee.status)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">সাম্প্রতিক উপস্থিতি</h3>
          <button 
            onClick={() => setShowAttendanceModal(true)}
            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm"
          >
            উপস্থিতি রেকর্ড
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  কর্মচারী
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  তারিখ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  সময়
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  অবস্থা
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.slice(0, 5).map((attendance) => (
                <tr key={attendance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{attendance.employeeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{new Date(attendance.date).toLocaleDateString('bn-BD')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attendance.checkIn && attendance.checkOut ? (
                      <div className="text-sm text-gray-900">
                        {attendance.checkIn} - {attendance.checkOut}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">-</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAttendanceStatusClass(attendance.status)}`}>
                      {attendanceStatusOptions.find(opt => opt.value === attendance.status)?.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">নতুন কর্মচারী যোগ করুন</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddEmployee(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="কর্মচারীর নাম"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পদ</label>
                  <select
                    required
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">পদ নির্বাচন করুন</option>
                    {positionOptions.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর</label>
                  <input
                    type="tel"
                    required
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ফোন নম্বর"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ইমেইল ঠিকানা"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা</label>
                  <input
                    type="text"
                    value={newEmployee.address}
                    onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ঠিকানা"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">যোগদান তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newEmployee.joinDate}
                    onChange={(e) => setNewEmployee({...newEmployee, joinDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বেতন (৳)</label>
                  <input
                    type="number"
                    required
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="মাসিক বেতন"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">কাজের সময় (ঘণ্টা)</label>
                  <input
                    type="number"
                    required
                    value={newEmployee.workHours}
                    onChange={(e) => setNewEmployee({...newEmployee, workHours: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="প্রতিদিনের কাজের সময়"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">অবস্থা</label>
                  <select
                    value={newEmployee.status}
                    onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
                <textarea
                  value={newEmployee.notes}
                  onChange={(e) => setNewEmployee({...newEmployee, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="অতিরিক্ত তথ্য"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">উপস্থিতি রেকর্ড</h2>
              <button onClick={() => setShowAttendanceModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddAttendance(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">কর্মচারী নির্বাচন করুন</label>
                <select
                  required
                  value={newAttendance.employeeId}
                  onChange={(e) => setNewAttendance({...newAttendance, employeeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">কর্মচারী নির্বাচন করুন</option>
                  {employees.filter(emp => emp.status === 'active').map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name} ({employee.position})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ</label>
                <input
                  type="date"
                  required
                  value={newAttendance.date}
                  onChange={(e) => setNewAttendance({...newAttendance, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">অবস্থা</label>
                <select
                  required
                  value={newAttendance.status}
                  onChange={(e) => setNewAttendance({...newAttendance, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {attendanceStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              {newAttendance.status === 'present' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">আসার সময়</label>
                    <input
                      type="time"
                      value={newAttendance.checkIn}
                      onChange={(e) => setNewAttendance({...newAttendance, checkIn: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">যাওয়ার সময়</label>
                    <input
                      type="time"
                      value={newAttendance.checkOut}
                      onChange={(e) => setNewAttendance({...newAttendance, checkOut: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
                <textarea
                  value={newAttendance.notes}
                  onChange={(e) => setNewAttendance({...newAttendance, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="অতিরিক্ত তথ্য"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">কর্মচারী বিস্তারিত</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedEmployee.name}</h3>
                  <p className="text-gray-600">{selectedEmployee.position}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClass(selectedEmployee.status)}`}>
                      {statusOptions.find(opt => opt.value === selectedEmployee.status)?.label}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">যোগাযোগের তথ্য</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedEmployee.phone}</span>
                    </div>
                    {selectedEmployee.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{selectedEmployee.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedEmployee.address}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">কাজের তথ্য</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">বেতন:</span>
                      <span className="font-medium">৳{selectedEmployee.salary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">কাজের সময়:</span>
                      <span className="font-medium">{selectedEmployee.workHours} ঘণ্টা/দিন</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">যোগদান তারিখ:</span>
                      <span className="font-medium">{new Date(selectedEmployee.joinDate).toLocaleDateString('bn-BD')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedEmployee.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">নোট</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedEmployee.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
