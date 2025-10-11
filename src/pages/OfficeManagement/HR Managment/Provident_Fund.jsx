import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ProvidentFund = () => {
  const dummyData = [
    { id: 1, name: 'Rahim Uddin', department: 'Sales', contribution: 5000, total: 50000 },
    { id: 2, name: 'Karim Hossain', department: 'Accounts', contribution: 6000, total: 72000 },
    { id: 3, name: 'Rafiq Hasan', department: 'IT', contribution: 7000, total: 84000 },
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Provident Fund</h1>
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
            <Plus size={18} /> Add Contribution
          </button>
        </div>

        <p className="text-gray-600 dark:text-white-400 mb-4">
          Provident Fund is a fund used to provide a pension to employees after their retirement. 
          Track individual contributions and total accumulated funds here.
        </p>

        {/* PF Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-700 text-left text-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Monthly Contribution (৳)</th>
                <th className="p-3">Total Fund (৳)</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">{item.department}</td>
                  <td className="p-3">{item.contribution.toLocaleString()}</td>
                  <td className="p-3">{item.total.toLocaleString()}</td>
                  <td className="p-3 text-right flex justify-end gap-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProvidentFund;
