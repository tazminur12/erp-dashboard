import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Printer, RefreshCw, DollarSign } from 'lucide-react';
import { usePendingInvoices } from '../../hooks/useSalesInvoiceQueries';

const formatBDT = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT' }).format(n || 0);

const Pending = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Build filters for API
  const filters = useMemo(() => {
    const f = {
      page,
      limit: pageSize,
    };
    if (search) {
      f.search = search;
    }
    return f;
  }, [page, pageSize, search]);

  // Fetch pending invoices from API
  const { data: invoicesData, isLoading, refetch } = usePendingInvoices(filters);

  const invoices = invoicesData?.data || [];
  const pagination = invoicesData?.pagination || { page: 1, limit: 10, total: 0, pages: 0 };

  const totalPages = pagination.pages || 1;
  const currentPage = pagination.page || 1;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Pending Invoices</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Invoices generated but payment not completed</p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            value={search} 
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on search
            }} 
            placeholder="Search invoice or customer" 
            className="w-64 border rounded-md px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600" 
          />
          <button
            onClick={() => refetch()}
            className="px-3 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Service</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Paid</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Due</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-600 dark:text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                    <p className="mt-2">Loading...</p>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-600 dark:text-gray-400">No pending invoices</td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const due = invoice.due || (invoice.amount - invoice.paid);
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{invoice.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{invoice.invoiceNumber || invoice.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{invoice.customerName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{invoice.serviceName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{formatBDT(invoice.amount)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{formatBDT(invoice.paid)}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-yellow-600 dark:text-yellow-400">{formatBDT(due)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="inline-flex gap-2">
                          <button 
                            onClick={() => navigate(`/sales-invoice/details/${invoice.id}`)}
                            className="px-2 py-1 text-xs rounded border hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 flex items-center gap-1"
                            title="View"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button 
                            onClick={() => navigate(`/sales-invoice/collect/${invoice.id}`)}
                            className="px-2 py-1 text-xs rounded border hover:bg-green-50 dark:hover:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 flex items-center gap-1"
                            title="Collect Payment"
                          >
                            <DollarSign className="w-3 h-3" />
                            Collect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {!isLoading && invoices.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left">
              Showing <span className="font-medium">{pagination.total === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, pagination.total)}</span> of{' '}
              <span className="font-medium">{pagination.total}</span> results
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Rows per page:</label>
              <select
                className="px-2 py-1 text-xs sm:text-sm border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm border rounded-l-md ${
                  currentPage === 1 || isLoading
                    ? 'text-gray-400 bg-white dark:bg-gray-800 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
                }`}
              >
                Prev
              </button>
              <span className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border-t border-b bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm border rounded-r-md ${
                  currentPage === totalPages || isLoading
                    ? 'text-gray-400 bg-white dark:bg-gray-800 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pending;


