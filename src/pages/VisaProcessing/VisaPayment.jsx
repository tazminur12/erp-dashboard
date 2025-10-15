import React, { useMemo, useState } from 'react';
import { CreditCard, Wallet, Banknote, FileText, CheckCircle2, X, Search, Download, Printer } from 'lucide-react';
import CardWidget from '../../components/common/CardWidget';
import SmallStat from '../../components/common/SmallStat';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import Modal, { ModalFooter } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../lib/format';

const MOCK_PAYMENTS = [
  { id: 'VP-P-1001', applicationId: 'VP-2025-0001', applicantName: 'Md. Rahim Uddin', method: 'Cash', amount: 8500, feeType: 'Processing Fee', date: '2025-10-01', status: 'Completed', reference: 'CASH-2025-1001' },
  { id: 'VP-P-1002', applicationId: 'VP-2025-0002', applicantName: 'Shahida Akter', method: 'Card', amount: 12000, feeType: 'Embassy Fee', date: '2025-10-02', status: 'Completed', reference: 'CARD-7845' },
  { id: 'VP-P-1003', applicationId: 'VP-2025-0003', applicantName: 'Nazmul Hasan', method: 'Bank', amount: 15000, feeType: 'Visa Fee', date: '2025-10-03', status: 'Pending', reference: 'BANK-NEFT-3344' },
];

const statusBadge = (status) => {
  const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium';
  if (status === 'Completed') return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300`;
  if (status === 'Pending') return `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300`;
  if (status === 'Cancelled') return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300`;
  return `${base} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
};

export default function VisaPayment() {
  const [filters, setFilters] = useState({});
  const [query, setQuery] = useState('');
  const [receiptItem, setReceiptItem] = useState(null);
  const [form, setForm] = useState({ applicationId: '', applicantName: '', feeType: 'Processing Fee', method: 'Cash', amount: '', reference: '', note: '' });
  const [errors, setErrors] = useState({});

  const totals = useMemo(() => {
    const completed = MOCK_PAYMENTS.filter(p => p.status === 'Completed');
    const pending = MOCK_PAYMENTS.filter(p => p.status === 'Pending');
    const totalCollected = completed.reduce((s, p) => s + p.amount, 0);
    return { totalCollected, completed: completed.length, pending: pending.length };
  }, []);

  const filteredPayments = useMemo(() => {
    let data = [...MOCK_PAYMENTS];
    if (filters.method) data = data.filter(d => d.method === filters.method);
    if (filters.status) data = data.filter(d => d.status === filters.status);
    if (filters.dateFrom) data = data.filter(d => new Date(d.date) >= new Date(filters.dateFrom));
    if (filters.dateTo) data = data.filter(d => new Date(d.date) <= new Date(filters.dateTo));
    if (query) {
      const q = query.toLowerCase().trim();
      data = data.filter(d => d.id.toLowerCase().includes(q) || d.applicationId.toLowerCase().includes(q) || d.applicantName.toLowerCase().includes(q) || String(d.amount).includes(q));
    }
    return data;
  }, [filters, query]);

  const columns = useMemo(() => [
    { key: 'id', header: 'Receipt ID', sortable: true },
    { key: 'applicationId', header: 'Application ID', sortable: true, render: (v) => (
      <span className="font-medium text-gray-900 dark:text-white">{v}</span>
    ) },
    { key: 'applicantName', header: 'Applicant', sortable: true },
    { key: 'feeType', header: 'Fee Type', sortable: true },
    { key: 'method', header: 'Method', sortable: true, render: (v) => (
      <span className="inline-flex items-center">{v === 'Cash' ? <Banknote className="w-4 h-4 mr-1 text-gray-400" /> : v === 'Card' ? <CreditCard className="w-4 h-4 mr-1 text-gray-400" /> : <Wallet className="w-4 h-4 mr-1 text-gray-400" />}{v}</span>
    ) },
    { key: 'amount', header: 'Amount', sortable: true, render: (v) => (
      <span className="font-semibold">{formatCurrency(v)}</span>
    ) },
    { key: 'date', header: 'Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'status', header: 'Status', sortable: true, render: (v) => (
      <span className={statusBadge(v)}>{v}</span>
    ) },
    { key: 'reference', header: 'Reference', sortable: true },
  ], []);

  const filterDefs = [
    { key: 'method', label: 'Payment Method', type: 'select', options: [
      { value: 'Cash', label: 'Cash' },
      { value: 'Card', label: 'Card' },
      { value: 'Bank', label: 'Bank Transfer' },
    ]},
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'Completed', label: 'Completed' },
      { value: 'Pending', label: 'Pending' },
      { value: 'Cancelled', label: 'Cancelled' },
    ]},
    { key: 'date', label: 'Payment Date', type: 'dateRange' },
  ];

  const validate = () => {
    const e = {};
    if (!form.applicationId) e.applicationId = 'Required';
    if (!form.applicantName) e.applicantName = 'Required';
    if (!form.amount || Number.isNaN(Number(form.amount))) e.amount = 'Valid amount required';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    // Normally submit to API; here we'll just open a receipt modal
    const fake = {
      id: 'VP-P-NEW',
      applicationId: form.applicationId,
      applicantName: form.applicantName,
      method: form.method,
      amount: Number(form.amount),
      feeType: form.feeType,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      reference: form.reference || 'N/A',
      note: form.note,
    };
    setReceiptItem(fake);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Visa Payment</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Collect fees, record payments, and generate receipts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardWidget title="Total Collected" value={formatCurrency(totals.totalCollected)} icon={Wallet} trend="this month" trendValue="+9%" trendType="up" />
        <CardWidget title="Completed" value={totals.completed} icon={CheckCircle2} trend="receipts issued" trendValue={totals.completed} trendType="up" />
        <CardWidget title="Pending" value={totals.pending} icon={FileText} trend="awaiting confirmation" trendValue={totals.pending} trendType="up" />
        <CardWidget title="Methods" value={'Cash / Card / Bank'} icon={CreditCard} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Record Payment</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Enter details to create a receipt</p>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Application ID</label>
            <input
              type="text"
              value={form.applicationId}
              onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
              placeholder="e.g., VP-2025-0001"
              className={`w-full px-3 py-2 border ${errors.applicationId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm`}
            />
            {errors.applicationId && <p className="text-xs text-red-500 mt-1">{errors.applicationId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Applicant Name</label>
            <input
              type="text"
              value={form.applicantName}
              onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
              placeholder="Full name"
              className={`w-full px-3 py-2 border ${errors.applicantName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm`}
            />
            {errors.applicantName && <p className="text-xs text-red-500 mt-1">{errors.applicantName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fee Type</label>
            <select
              value={form.feeType}
              onChange={(e) => setForm({ ...form, feeType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option>Processing Fee</option>
              <option>Embassy Fee</option>
              <option>Visa Fee</option>
              <option>Service Charge</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option>Cash</option>
              <option>Card</option>
              <option>Bank</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0"
              className={`w-full px-3 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm`}
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reference</label>
            <input
              type="text"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              placeholder="Transaction reference (optional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Note</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={3}
              placeholder="Any additional notes (optional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setForm({ applicationId: '', applicantName: '', feeType: 'Processing Fee', method: 'Cash', amount: '', reference: '', note: '' }); setErrors({}); }} className="px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center">
              <X className="w-4 h-4 mr-2" /> Reset
            </button>
            <button type="submit" className="px-3 py-2 rounded-lg text-sm border border-blue-600 text-white bg-blue-600 hover:bg-blue-700 inline-flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Save Payment
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search receipts by ID, Application, Applicant or Amount..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <button onClick={() => setQuery('')} className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
            <X className="w-4 h-4 mr-2" /> Clear
          </button>
        </div>

        <FilterBar
          filters={filterDefs}
          onFilterChange={(values) => setFilters(values)}
        />

        <div className="mt-4">
          <DataTable
            data={filteredPayments}
            columns={columns}
            customActions={(item) => (
              <div className="flex items-center gap-2">
                <button onClick={() => setReceiptItem(item)} className="px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View</button>
                <button onClick={() => setReceiptItem(item)} className="px-2 py-1 text-xs rounded-lg border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 inline-flex items-center"><Download className="w-3 h-3 mr-1" /> PDF</button>
                <button onClick={() => window.print()} className="px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center"><Printer className="w-3 h-3 mr-1" /> Print</button>
              </div>
            )}
          />
        </div>
      </div>

      <Modal isOpen={!!receiptItem} onClose={() => setReceiptItem(null)} title={receiptItem ? `Receipt ${receiptItem.id}` : ''} size="lg">
        {receiptItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SmallStat label="Application ID" value={receiptItem.applicationId} />
              <SmallStat label="Applicant" value={receiptItem.applicantName} />
              <SmallStat label="Fee Type" value={receiptItem.feeType} />
              <SmallStat label="Method" value={receiptItem.method} />
              <SmallStat label="Amount" value={formatCurrency(receiptItem.amount)} />
              <SmallStat label="Date" value={formatDate(receiptItem.date)} />
              <SmallStat label="Status" value={receiptItem.status} />
              <SmallStat label="Reference" value={receiptItem.reference} />
            </div>
            {receiptItem.note && (
              <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Note</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{receiptItem.note}</p>
              </div>
            )}
            <ModalFooter>
              <button onClick={() => setReceiptItem(null)} className="px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
              <button onClick={() => window.print()} className="px-3 py-2 rounded-lg text-sm border border-blue-600 text-white bg-blue-600 hover:bg-blue-700">Print Receipt</button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}

