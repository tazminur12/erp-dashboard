import React, { useMemo, useState } from 'react';

const formatBDT = (n) => new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(n || 0);

const Pending = () => {
  const [search, setSearch] = useState('');
  const [rows] = useState([
    { id: 'INV-1001', date: '2025-09-01', customer: 'আহমেদ হাসান', service: 'Air Ticket', total: 55000, paid: 30000 },
    { id: 'INV-1002', date: '2025-09-03', customer: 'করিম উদ্দিন', service: 'Visa Processing', total: 15000, paid: 5000 },
  ]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return rows.filter((r) => `${r.id} ${r.customer} ${r.service}`.toLowerCase().includes(s));
  }, [rows, search]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pending Invoices</h1>
          <p className="text-sm text-gray-600">Invoices generated but payment not completed</p>
        </div>
        <div className="w-64">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice or customer" className="w-full border rounded-md px-3 py-2" />
        </div>
      </header>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Service</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Paid</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Due</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-600">No pending invoices</td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const due = (r.total || 0) - (r.paid || 0);
                  return (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{r.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{r.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{r.customer}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{r.service}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatBDT(r.total)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatBDT(r.paid)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatBDT(due)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="inline-flex gap-2">
                          <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50">View</button>
                          <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50">Collect</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pending;


