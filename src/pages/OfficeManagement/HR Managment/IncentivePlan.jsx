import React, { useState } from 'react';
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';

const IncentivePlan = () => {
  const [search, setSearch] = useState('');

  const [incentives, setIncentives] = useState([
    { id: 1, name: 'Rahim Uddin', department: 'Sales', target: 100000, achieved: 120000, incentive: 5000 },
    { id: 2, name: 'Karim Hossain', department: 'Marketing', target: 80000, achieved: 70000, incentive: 0 },
    { id: 3, name: 'Rafiq Hasan', department: 'IT', target: 120000, achieved: 130000, incentive: 8000 },
  ]);

  const filteredData = incentives.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-3">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Incentive Plan</h1>
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
            <Plus size={18} /> Add Incentive
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-900 dark:text-white"
          />
        </div>

        {/* Incentive Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-700 text-left text-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Target (৳)</th>
                <th className="p-3">Achieved (৳)</th>
                <th className="p-3">Incentive (৳)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">{item.department}</td>
                    <td className="p-3">{item.target.toLocaleString()}</td>
                    <td className="p-3">{item.achieved.toLocaleString()}</td>
                    <td className="p-3">{item.incentive.toLocaleString()}</td>
                    <td className="p-3">
                      {item.achieved >= item.target ? (
                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                          <CheckCircle2 size={16} /> Eligible
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 font-semibold">
                          <XCircle size={16} /> Not Eligible
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right flex justify-end gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit size={18} />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncentivePlan;
