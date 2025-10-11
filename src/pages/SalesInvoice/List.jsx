import React, { useMemo, useState } from 'react';

const formatBDT = (n) => new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(n || 0);

const List = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [rows] = useState([
    { id: 'INV-1001', date: '2025-09-01', customer: 'আহমেদ হাসান', service: 'Air Ticket', total: 55000, paid: 55000 },
    { id: 'INV-1002', date: '2025-09-03', customer: 'করিম উদ্দিন', service: 'Visa Processing', total: 15000, paid: 5000 },
    { id: 'INV-1003', date: '2025-09-05', customer: 'ফাতেমা খাতুন', service: 'Hotel Booking', total: 22000, paid: 22000 },
  ]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return rows.filter((r) => {
      const due = (r.total || 0) - (r.paid || 0);
      const st = due > 0 ? 'unpaid' : 'paid';
      const statusOk = status === 'all' || status === st;
      const matches = `${r.id} ${r.customer} ${r.service}`.toLowerCase().includes(s);
      return statusOk && matches;
    });
  }, [rows, search, status]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">All Invoices</h1>
          <p className="text-sm text-gray-600">Search and manage paid/unpaid invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or customer"
            className="w-64 border rounded-md px-3 py-2"
          />
          <select className="border rounded-md px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
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
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-600">No invoices found</td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const due = (r.total || 0) - (r.paid || 0);
                  const paid = due <= 0;
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="inline-flex gap-2">
                          <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50">View</button>
                          <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50">Print</button>
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

export default List;


