import React, { useState } from 'react';
import { 
  Search, Edit, Trash2, Plus, DollarSign, CheckCircle2, XCircle, Clock,
  Download, Filter, Calendar, Users, TrendingUp, AlertCircle, Eye,
  CheckSquare, Square, MoreVertical, FileText, BarChart3, CreditCard,
  Minus, Plus as PlusIcon, Receipt, Banknote, Calculator, History
} from 'lucide-react';

const Payroll = () => {
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showSalaryBreakdown, setShowSalaryBreakdown] = useState(null);
  const [showProcessPayroll, setShowProcessPayroll] = useState(false);
  const [processMonth, setProcessMonth] = useState(new Date().toISOString().slice(0, 7));
  const [processEmployees, setProcessEmployees] = useState([]);
  const [processingPayroll, setProcessingPayroll] = useState(false);
  
  // Enhanced payroll data with detailed breakdown
  const [payrollData, setPayrollData] = useState([
    { 
      id: 1, 
      name: 'Rahim Uddin', 
      employeeId: 'EMP001',
      department: 'Sales', 
      month: '2025-01', 
      basicSalary: 30000,
      allowances: 5000,
      bonuses: 2000,
      overtime: 1500,
      grossSalary: 38500,
      deductions: {
        tax: 3850,
        providentFund: 1925,
        loan: 0,
        others: 0
      },
      netSalary: 32725,
      status: 'Paid',
      paymentDate: '2025-01-31',
      paymentMethod: 'Bank Transfer'
    },
    { 
      id: 2, 
      name: 'Karim Hossain', 
      employeeId: 'EMP002',
      department: 'Accounts', 
      month: '2025-01', 
      basicSalary: 35000,
      allowances: 4000,
      bonuses: 1500,
      overtime: 0,
      grossSalary: 40500,
      deductions: {
        tax: 4050,
        providentFund: 2025,
        loan: 5000,
        others: 0
      },
      netSalary: 29425,
      status: 'Pending',
      paymentDate: null,
      paymentMethod: null
    },
    { 
      id: 3, 
      name: 'Rafiq Hasan', 
      employeeId: 'EMP003',
      department: 'IT', 
      month: '2025-01', 
      basicSalary: 40000,
      allowances: 6000,
      bonuses: 3000,
      overtime: 2000,
      grossSalary: 51000,
      deductions: {
        tax: 5100,
        providentFund: 2550,
        loan: 0,
        others: 0
      },
      netSalary: 43350,
      status: 'Paid',
      paymentDate: '2025-01-31',
      paymentMethod: 'Bank Transfer'
    },
    { 
      id: 4, 
      name: 'Fatima Begum', 
      employeeId: 'EMP004',
      department: 'HR', 
      month: '2025-01', 
      basicSalary: 32000,
      allowances: 3000,
      bonuses: 1000,
      overtime: 0,
      grossSalary: 36000,
      deductions: {
        tax: 3600,
        providentFund: 1800,
        loan: 0,
        others: 500
      },
      netSalary: 30100,
      status: 'Paid',
      paymentDate: '2025-01-31',
      paymentMethod: 'Cash'
    },
    { 
      id: 5, 
      name: 'Mohammad Ali', 
      employeeId: 'EMP005',
      department: 'Sales', 
      month: '2025-01', 
      basicSalary: 28000,
      allowances: 4000,
      bonuses: 2500,
      overtime: 1000,
      grossSalary: 35500,
      deductions: {
        tax: 3550,
        providentFund: 1775,
        loan: 2000,
        others: 0
      },
      netSalary: 28175,
      status: 'Processing',
      paymentDate: null,
      paymentMethod: null
    }
  ]);

  const departments = ['All', 'Sales', 'Accounts', 'IT', 'HR'];
  const statusOptions = ['All', 'Paid', 'Pending', 'Processing'];

  // Mock employee data for payroll processing
  const employeeData = [
    { id: 1, name: 'Rahim Uddin', employeeId: 'EMP001', department: 'Sales', basicSalary: 30000, allowances: 5000, position: 'Sales Executive' },
    { id: 2, name: 'Karim Hossain', employeeId: 'EMP002', department: 'Accounts', basicSalary: 35000, allowances: 4000, position: 'Accountant' },
    { id: 3, name: 'Rafiq Hasan', employeeId: 'EMP003', department: 'IT', basicSalary: 40000, allowances: 6000, position: 'Software Developer' },
    { id: 4, name: 'Fatima Begum', employeeId: 'EMP004', department: 'HR', basicSalary: 32000, allowances: 3000, position: 'HR Executive' },
    { id: 5, name: 'Mohammad Ali', employeeId: 'EMP005', department: 'Sales', basicSalary: 28000, allowances: 4000, position: 'Sales Representative' },
    { id: 6, name: 'Ayesha Khatun', employeeId: 'EMP006', department: 'IT', basicSalary: 45000, allowances: 7000, position: 'Senior Developer' },
    { id: 7, name: 'Abdul Rahman', employeeId: 'EMP007', department: 'Accounts', basicSalary: 38000, allowances: 5000, position: 'Senior Accountant' },
    { id: 8, name: 'Nusrat Jahan', employeeId: 'EMP008', department: 'HR', basicSalary: 35000, allowances: 4000, position: 'HR Manager' }
  ];
  
  const filteredData = payrollData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || item.department === selectedDepartment;
    const matchesMonth = item.month === selectedMonth;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesMonth && matchesStatus;
  });

  // Statistics calculation
  const totalEmployees = filteredData.length;
  const paidCount = filteredData.filter(item => item.status === 'Paid').length;
  const pendingCount = filteredData.filter(item => item.status === 'Pending').length;
  const processingCount = filteredData.filter(item => item.status === 'Processing').length;
  const totalGrossSalary = filteredData.reduce((sum, item) => sum + item.grossSalary, 0);
  const totalNetSalary = filteredData.reduce((sum, item) => sum + item.netSalary, 0);
  const totalDeductions = filteredData.reduce((sum, item) => 
    sum + item.deductions.tax + item.deductions.providentFund + item.deductions.loan + item.deductions.others, 0);

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
    setPayrollData(prev => prev.map(item => 
      selectedEmployees.includes(item.id) 
        ? { ...item, status, paymentDate: status === 'Paid' ? new Date().toISOString().split('T')[0] : null }
        : item
    ));
    setSelectedEmployees([]);
  };

  // Calculate salary components
  const calculateSalary = (employee) => {
    const basicSalary = employee.basicSalary;
    const allowances = employee.allowances;
    const bonuses = Math.floor(Math.random() * 3000) + 1000; // Random bonus
    const overtime = Math.floor(Math.random() * 2000); // Random overtime
    const grossSalary = basicSalary + allowances + bonuses + overtime;
    
    // Calculate deductions (10% tax, 5% provident fund)
    const tax = Math.floor(grossSalary * 0.10);
    const providentFund = Math.floor(grossSalary * 0.05);
    const loan = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0; // 30% chance of loan deduction
    const others = Math.random() > 0.8 ? Math.floor(Math.random() * 1000) : 0; // 20% chance of other deductions
    
    const totalDeductions = tax + providentFund + loan + others;
    const netSalary = grossSalary - totalDeductions;

    return {
      basicSalary,
      allowances,
      bonuses,
      overtime,
      grossSalary,
      deductions: { tax, providentFund, loan, others },
      netSalary
    };
  };

  // Handle process payroll
  const handleProcessPayroll = async () => {
    setProcessingPayroll(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate payroll for selected employees
      const newPayrollRecords = processEmployees.map(employee => {
        const salaryData = calculateSalary(employee);
        return {
          id: Date.now() + Math.random(), // Generate unique ID
          name: employee.name,
          employeeId: employee.employeeId,
          department: employee.department,
          month: processMonth,
          ...salaryData,
          status: 'Pending',
          paymentDate: null,
          paymentMethod: null
        };
      });

      // Add new payroll records to existing data
      setPayrollData(prev => [...prev, ...newPayrollRecords]);
      
      // Reset form
      setProcessEmployees([]);
      setShowProcessPayroll(false);
      
      // Show success message (you can add a toast notification here)
      alert('Payroll processed successfully!');
      
    } catch (error) {
      console.error('Error processing payroll:', error);
      alert('Error processing payroll. Please try again.');
    } finally {
      setProcessingPayroll(false);
    }
  };

  // Handle employee selection for payroll processing
  const handleEmployeeSelection = (employee) => {
    setProcessEmployees(prev => 
      prev.find(emp => emp.id === employee.id)
        ? prev.filter(emp => emp.id !== employee.id)
        : [...prev, employee]
    );
  };

  // Select all employees for processing
  const handleSelectAllEmployees = () => {
    if (processEmployees.length === employeeData.length) {
      setProcessEmployees([]);
    } else {
      setProcessEmployees([...employeeData]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'Pending': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'Processing': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return <CheckCircle2 size={16} />;
      case 'Pending': return <Clock size={16} />;
      case 'Processing': return <AlertCircle size={16} />;
      default: return <XCircle size={16} />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                Payroll Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage employee salaries, deductions, and payroll processing
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Download size={18} /> Export Payroll
              </button>
              <button 
                onClick={() => setShowProcessPayroll(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={18} /> Process Payroll
              </button>
            </div>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gross Salary</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalGrossSalary)}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDeductions)}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Minus className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Payable</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalNetSalary)}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Banknote className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid</p>
                <p className="text-2xl font-bold text-green-600">{paidCount}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{processingCount}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600" />
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none dark:bg-gray-900 dark:text-white"
                />
              </div>
              
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none dark:bg-gray-900 dark:text-white"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none dark:bg-gray-900 dark:text-white"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedEmployees.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  {selectedEmployees.length} employee(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkStatusUpdate('Paid')}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                  >
                    Mark as Paid
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate('Processing')}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    Mark Processing
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

        {/* Payroll Table */}
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
                        <CheckSquare size={18} className="text-green-600" />
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
                    Basic Salary
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gross Salary
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Net Salary
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
                            <CheckSquare size={18} className="text-green-600" />
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
                        {formatCurrency(item.basicSalary)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {formatCurrency(item.grossSalary)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(item.netSalary)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)} {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setShowSalaryBreakdown(item)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors">
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
                        <Receipt size={48} className="text-gray-400" />
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">No payroll records found</p>
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

        {/* Salary Breakdown Modal */}
        {showSalaryBreakdown && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Salary Breakdown - {showSalaryBreakdown.name}
                  </h3>
                  <button
                    onClick={() => setShowSalaryBreakdown(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Earnings */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <PlusIcon className="w-5 h-5 text-green-600" />
                    Earnings
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Basic Salary</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(showSalaryBreakdown.basicSalary)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Allowances</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(showSalaryBreakdown.allowances)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Bonuses</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(showSalaryBreakdown.bonuses)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Overtime</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(showSalaryBreakdown.overtime)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-900/20 rounded-lg px-4">
                      <span className="font-semibold text-green-800 dark:text-green-200">Total Gross Salary</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(showSalaryBreakdown.grossSalary)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Minus className="w-5 h-5 text-red-600" />
                    Deductions
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Tax</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(showSalaryBreakdown.deductions.tax)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Provident Fund</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(showSalaryBreakdown.deductions.providentFund)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Loan</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(showSalaryBreakdown.deductions.loan)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Others</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(showSalaryBreakdown.deductions.others)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-red-50 dark:bg-red-900/20 rounded-lg px-4">
                      <span className="font-semibold text-red-800 dark:text-red-200">Total Deductions</span>
                      <span className="font-bold text-red-600 text-lg">
                        {formatCurrency(
                          showSalaryBreakdown.deductions.tax + 
                          showSalaryBreakdown.deductions.providentFund + 
                          showSalaryBreakdown.deductions.loan + 
                          showSalaryBreakdown.deductions.others
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex justify-between items-center py-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-6">
                    <span className="text-xl font-bold text-blue-800 dark:text-blue-200">Net Salary</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(showSalaryBreakdown.netSalary)}
                    </span>
                  </div>
                </div>

                {/* Payment Info */}
                {showSalaryBreakdown.paymentDate && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Payment Information</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Payment Date:</span>
                        <span className="text-gray-900 dark:text-white">{showSalaryBreakdown.paymentDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                        <span className="text-gray-900 dark:text-white">{showSalaryBreakdown.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Process Payroll Modal */}
        {showProcessPayroll && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-green-600" />
                    Process Payroll
                  </h3>
                  <button
                    onClick={() => setShowProcessPayroll(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Month Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Month
                  </label>
                  <input
                    type="month"
                    value={processMonth}
                    onChange={(e) => setProcessMonth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none dark:bg-gray-900 dark:text-white"
                  />
                </div>

                {/* Employee Selection */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      Select Employees
                    </h4>
                    <button
                      onClick={handleSelectAllEmployees}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      {processEmployees.length === employeeData.length ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                      {processEmployees.length === employeeData.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {employeeData.map((employee) => (
                      <div
                        key={employee.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          processEmployees.find(emp => emp.id === employee.id)
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => handleEmployeeSelection(employee)}
                      >
                        <div className="flex items-center gap-3">
                          {processEmployees.find(emp => emp.id === employee.id) ? (
                            <CheckSquare size={20} className="text-green-600" />
                          ) : (
                            <Square size={20} className="text-gray-400" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {employee.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {employee.employeeId} • {employee.position}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {employee.department} • {formatCurrency(employee.basicSalary)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Employees Summary */}
                {processEmployees.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h5 className="font-medium text-green-800 dark:text-green-200 mb-3">
                      Selected Employees ({processEmployees.length})
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {processEmployees.map((employee) => {
                        const salaryData = calculateSalary(employee);
                        return (
                          <div key={employee.id} className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {employee.name}:
                            </span>
                            <span className="ml-2 text-green-600 font-semibold">
                              {formatCurrency(salaryData.netSalary)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-800 dark:text-green-200">
                          Total Payroll Amount:
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(
                            processEmployees.reduce((sum, emp) => {
                              const salaryData = calculateSalary(emp);
                              return sum + salaryData.netSalary;
                            }, 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowProcessPayroll(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessPayroll}
                    disabled={processEmployees.length === 0 || processingPayroll}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {processingPayroll ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Calculator size={16} />
                        Process Payroll
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payroll;
