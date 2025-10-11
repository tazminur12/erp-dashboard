import React, { useState } from 'react';
import { 
  Search, Edit, Trash2, Plus, CheckCircle2, XCircle, Clock, 
  Download, Filter, Calendar, Users, TrendingUp, AlertCircle,
  CheckSquare, Square, MoreVertical, FileText, BarChart3
} from 'lucide-react';

const Attendance = () => {
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const [attendanceData, setAttendanceData] = useState([
    { 
      id: 1, 
      name: 'Rahim Uddin', 
      employeeId: 'EMP001',
      department: 'Sales', 
      date: '2025-01-10', 
      status: 'Present',
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      hoursWorked: 8,
      overtime: 0
    },
    { 
      id: 2, 
      name: 'Karim Hossain', 
      employeeId: 'EMP002',
      department: 'Accounts', 
      date: '2025-01-10', 
      status: 'Absent',
      checkIn: null,
      checkOut: null,
      hoursWorked: 0,
      overtime: 0
    },
    { 
      id: 3, 
      name: 'Rafiq Hasan', 
      employeeId: 'EMP003',
      department: 'IT', 
      date: '2025-01-10', 
      status: 'Present',
      checkIn: '08:45 AM',
      checkOut: '05:30 PM',
      hoursWorked: 8.75,
      overtime: 0.75
    },
    { 
      id: 4, 
      name: 'Fatima Begum', 
      employeeId: 'EMP004',
      department: 'HR', 
      date: '2025-01-10', 
      status: 'Late',
      checkIn: '09:15 AM',
      checkOut: '06:00 PM',
      hoursWorked: 7.75,
      overtime: 0
    },
    { 
      id: 5, 
      name: 'Mohammad Ali', 
      employeeId: 'EMP005',
      department: 'Sales', 
      date: '2025-01-10', 
      status: 'Present',
      checkIn: '09:00 AM',
      checkOut: '06:30 PM',
      hoursWorked: 8.5,
      overtime: 0.5
    }
  ]);

  const departments = ['All', 'Sales', 'Accounts', 'IT', 'HR'];
  
  const filteredData = attendanceData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || item.department === selectedDepartment;
    const matchesDate = item.date === selectedDate;
    return matchesSearch && matchesDepartment && matchesDate;
  });

  // Statistics calculation
  const totalEmployees = attendanceData.length;
  const presentCount = attendanceData.filter(item => item.status === 'Present').length;
  const absentCount = attendanceData.filter(item => item.status === 'Absent').length;
  const lateCount = attendanceData.filter(item => item.status === 'Late').length;
  const attendanceRate = totalEmployees > 0 ? ((presentCount / totalEmployees) * 100).toFixed(1) : 0;

  const handleSelectEmployee = (id) => {
    setSelectedEmployees(prev => 
      prev.includes(id) 
        ? prev.filter(empId => empId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredData.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredData.map(item => item.id));
    }
  };

  const handleBulkStatusUpdate = (status) => {
    setAttendanceData(prev => prev.map(item => 
      selectedEmployees.includes(item.id) 
        ? { ...item, status, checkIn: status === 'Present' ? '09:00 AM' : null, checkOut: status === 'Present' ? '06:00 PM' : null }
        : item
    ));
    setSelectedEmployees([]);
    setShowBulkActions(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'Absent': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'Late': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <CheckCircle2 size={16} />;
      case 'Absent': return <XCircle size={16} />;
      case 'Late': return <Clock size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Attendance Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track and manage employee attendance records
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Download size={18} /> Export Report
              </button>
              <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Plus size={18} /> Mark Attendance
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalEmployees}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Late Arrivals</p>
                <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-600">{attendanceRate}%</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or employee ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-900 dark:text-white"
                />
              </div>
              
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-900 dark:text-white"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedEmployees.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedEmployees.length} employee(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkStatusUpdate('Present')}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                  >
                    Mark Present
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate('Absent')}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                  >
                    Mark Absent
                  </button>
                  <button
                    onClick={() => setSelectedEmployees([])}
                    className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Attendance Table */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      {selectedEmployees.length === filteredData.length && filteredData.length > 0 ? (
                        <CheckSquare size={18} className="text-blue-600" />
                      ) : (
                        <Square size={18} className="text-gray-400" />
                      )}
                      Select All
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Check In
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Check Out
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hours
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleSelectEmployee(item.id)}
                          className="flex items-center gap-2"
                        >
                          {selectedEmployees.includes(item.id) ? (
                            <CheckSquare size={18} className="text-blue-600" />
                          ) : (
                            <Square size={18} className="text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{item.employeeId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {item.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {item.checkIn || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {item.checkOut || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white">{item.hoursWorked}h</div>
                          {item.overtime > 0 && (
                            <div className="text-orange-600">+{item.overtime}h OT</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)} {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText size={48} className="text-gray-400" />
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">No attendance records found</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your filters or date selection</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
