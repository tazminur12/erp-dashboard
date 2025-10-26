import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Search, Filter, TrendingUp, Award, Target, DollarSign, Users, Download } from 'lucide-react';
import Modal, { ModalFooter } from '../../../components/common/Modal';
import SmallStat from '../../../components/common/SmallStat';

const IncentivePlan = () => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIncentive, setEditingIncentive] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const itemsPerPage = 10;

  const [incentives, setIncentives] = useState([
    { id: 1, name: 'Rahim Uddin', department: 'Sales', target: 100000, achieved: 120000, incentive: 5000, month: 'January 2024', date: '2024-01-31' },
    { id: 2, name: 'Karim Hossain', department: 'Marketing', target: 80000, achieved: 70000, incentive: 0, month: 'January 2024', date: '2024-01-31' },
    { id: 3, name: 'Rafiq Hasan', department: 'IT', target: 120000, achieved: 130000, incentive: 8000, month: 'January 2024', date: '2024-01-31' },
    { id: 4, name: 'Fatima Begum', department: 'Sales', target: 90000, achieved: 95000, incentive: 3500, month: 'January 2024', date: '2024-01-31' },
    { id: 5, name: 'Ahmed Ali', department: 'Finance', target: 150000, achieved: 180000, incentive: 12000, month: 'January 2024', date: '2024-01-31' },
    { id: 6, name: 'Sumaiya Rahman', department: 'HR', target: 70000, achieved: 75000, incentive: 2000, month: 'January 2024', date: '2024-01-31' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    department: 'Sales',
    target: '',
    achieved: '',
    month: '',
    date: ''
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTarget = incentives.reduce((sum, i) => sum + i.target, 0);
    const totalAchieved = incentives.reduce((sum, i) => sum + i.achieved, 0);
    const totalIncentive = incentives.reduce((sum, i) => sum + i.incentive, 0);
    const eligibleCount = incentives.filter(i => i.achieved >= i.target).length;
    const achievementRate = totalTarget > 0 ? ((totalAchieved / totalTarget) * 100).toFixed(1) : 0;
    
    return {
      totalTarget,
      totalAchieved,
      totalIncentive,
      eligibleCount,
      achievementRate
    };
  }, [incentives]);

  // Filter and search
  const filteredData = useMemo(() => {
    let filtered = incentives.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.department.toLowerCase().includes(search.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || item.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
    return filtered;
  }, [incentives, search, departmentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate incentive based on achievement
  const calculateIncentive = (target, achieved) => {
    if (achieved < target) return 0;
    const achievementPercentage = (achieved / target) * 100;
    
    if (achievementPercentage >= 120) {
      return target * 0.1; // 10% of target for 120%+ achievement
    } else if (achievementPercentage >= 110) {
      return target * 0.08; // 8% of target for 110-119%
    } else {
      return target * 0.05; // 5% of target for 100-109%
    }
  };

  const handleAddIncentive = () => {
    const achieved = parseFloat(formData.achieved) || 0;
    const target = parseFloat(formData.target) || 0;
    const incentive = calculateIncentive(target, achieved);
    
    const newIncentive = {
      id: Math.max(...incentives.map(i => i.id)) + 1,
      name: formData.name,
      department: formData.department,
      target,
      achieved,
      incentive,
      month: formData.month,
      date: formData.date
    };
    
    setIncentives([...incentives, newIncentive]);
    handleCloseModal();
  };

  const handleEditIncentive = () => {
    const achieved = parseFloat(formData.achieved) || 0;
    const target = parseFloat(formData.target) || 0;
    const incentive = calculateIncentive(target, achieved);
    
    const updatedIncentive = {
      ...formData,
      target,
      achieved,
      incentive
    };
    
    setIncentives(incentives.map(i => i.id === editingIncentive.id ? updatedIncentive : i));
    handleCloseModal();
  };

  const handleDeleteIncentive = (id) => {
    if (window.confirm('Are you sure you want to delete this incentive record?')) {
      setIncentives(incentives.filter(i => i.id !== id));
    }
  };

  const handleEditClick = (incentive) => {
    setEditingIncentive(incentive);
    setFormData({
      name: incentive.name,
      department: incentive.department,
      target: incentive.target.toString(),
      achieved: incentive.achieved.toString(),
      month: incentive.month,
      date: incentive.date
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingIncentive(null);
    setFormData({
      name: '',
      department: 'Sales',
      target: '',
      achieved: '',
      month: '',
      date: ''
    });
  };

  const handleAddClick = () => {
    setFormData({
      name: '',
      department: 'Sales',
      target: '',
      achieved: '',
      month: '',
      date: ''
    });
    setShowAddModal(true);
  };

  const departments = ['all', 'Sales', 'Marketing', 'IT', 'Finance', 'HR'];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Incentive Plan Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage employee incentives</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition">
              <Download size={18} /> Export
            </button>
            <button onClick={handleAddClick} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
              <Plus size={18} /> Add Incentive
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <SmallStat
            label="Total Target"
            value={`৳${stats.totalTarget.toLocaleString()}`}
            icon={Target}
            color="blue"
          />
          <SmallStat
            label="Total Achieved"
            value={`৳${stats.totalAchieved.toLocaleString()}`}
            icon={TrendingUp}
            color="green"
          />
          <SmallStat
            label="Total Incentive"
            value={`৳${stats.totalIncentive.toLocaleString()}`}
            icon={Award}
            color="purple"
          />
          <SmallStat
            label="Achievement Rate"
            value={`${stats.achievementRate}%`}
            icon={DollarSign}
            color="yellow"
          />
          <SmallStat
            label="Eligible Employees"
            value={`${stats.eligibleCount}/${incentives.length}`}
            icon={Users}
            color="green"
          />
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-900 dark:text-white"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700 text-left text-gray-700 dark:text-gray-200">
                <tr>
                  <th className="p-3 font-semibold">#</th>
                  <th className="p-3 font-semibold">Employee Name</th>
                  <th className="p-3 font-semibold">Department</th>
                  <th className="p-3 font-semibold">Target (৳)</th>
                  <th className="p-3 font-semibold">Achieved (৳)</th>
                  <th className="p-3 font-semibold">Incentive (৳)</th>
                  <th className="p-3 font-semibold">Month</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <td className="p-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm">
                          {item.department}
                        </span>
                      </td>
                      <td className="p-3">{item.target.toLocaleString()}</td>
                      <td className="p-3">{item.achieved.toLocaleString()}</td>
                      <td className="p-3 font-semibold text-green-600">{item.incentive.toLocaleString()}</td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{item.month}</td>
                      <td className="p-3">
                        {item.achieved >= item.target ? (
                          <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                            <CheckCircle2 size={16} /> Eligible
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 font-semibold text-sm">
                            <XCircle size={16} /> Not Eligible
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteIncentive(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-gray-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-1 bg-green-600 text-white rounded">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={showAddModal || showEditModal} 
        onClose={handleCloseModal} 
        title={showAddModal ? 'Add Incentive' : 'Edit Incentive'}
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); showAddModal ? handleAddIncentive() : handleEditIncentive(); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Employee Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-900 dark:text-white"
                placeholder="Enter employee name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department *
                </label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-900 dark:text-white"
                >
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="IT">IT</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month *
                </label>
                <input
                  type="text"
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({...formData, month: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-900 dark:text-white"
                  placeholder="e.g., January 2024"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Amount (৳) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.target}
                  onChange={(e) => setFormData({...formData, target: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-900 dark:text-white"
                  placeholder="Enter target amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Achieved Amount (৳) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.achieved}
                  onChange={(e) => setFormData({...formData, achieved: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-900 dark:text-white"
                  placeholder="Enter achieved amount"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          <ModalFooter>
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              {showAddModal ? 'Add' : 'Update'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default IncentivePlan;
