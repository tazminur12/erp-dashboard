import React, { useMemo, useState } from 'react';
import { Building2, Search, Plus, Phone, User, MapPin, Calendar, CreditCard, FileText, MoreVertical, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal, { ModalFooter } from '../../components/common/Modal';
import Swal from 'sweetalert2';

const DEMO_VENDORS = [
  {
    id: 'VND-0001',
    tradeName: 'Miraj Traders',
    tradeLocation: 'Dhaka, Bangladesh',
    ownerName: 'Abdul Karim',
    contactNo: '+8801711223344',
    dob: '1984-05-12',
    nid: '197845623412',
    passport: 'BA1234567'
  },
  {
    id: 'VND-0002',
    tradeName: 'Nazmul Enterprise',
    tradeLocation: 'Chattogram',
    ownerName: 'Nazmul Hasan',
    contactNo: '+8801911334455',
    dob: '1990-08-21',
    nid: '199045623411',
    passport: 'EC7654321'
  },
  {
    id: 'VND-0003',
    tradeName: 'Green Line Supplies',
    tradeLocation: 'Sylhet',
    ownerName: 'Shahadat Hossain',
    contactNo: '+8801555667788',
    dob: '1988-12-01',
    nid: '188845623499',
    passport: 'ZP1122334'
  },
  {
    id: 'VND-0004',
    tradeName: 'City Hardware',
    tradeLocation: 'Khulna',
    ownerName: 'Rubel Mia',
    contactNo: '+8801311223344',
    dob: '1982-03-30',
    nid: '198245623477',
    passport: 'AA9988776'
  },
  {
    id: 'VND-0005',
    tradeName: 'Delta Foods',
    tradeLocation: 'Rajshahi',
    ownerName: 'Sajid Khan',
    contactNo: '+8801811227788',
    dob: '1992-10-15',
    nid: '199245623401',
    passport: 'PK5566778'
  }
];

const VendorList = () => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ vendorId: '', orderType: '', amount: '' });
  const [touched, setTouched] = useState({});
  const [orderVendorQuery, setOrderVendorQuery] = useState('');
  const [showVendorList, setShowVendorList] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEMO_VENDORS;
    return DEMO_VENDORS.filter((v) =>
      [v.tradeName, v.tradeLocation, v.ownerName, v.contactNo, v.nid, v.passport]
        .filter(Boolean)
        .some((x) => x.toLowerCase().includes(q))
    );
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  // Modal vendor list filtering (independent from page search)
  const modalVendors = useMemo(() => {
    const q = orderVendorQuery.trim().toLowerCase();
    if (!q) return DEMO_VENDORS;
    return DEMO_VENDORS.filter((v) => v.tradeName.toLowerCase().includes(q));
  }, [orderVendorQuery]);

  const orderErrors = useMemo(() => {
    const e = {};
    if (!orderForm.vendorId) e.vendorId = 'Vendor is required';
    if (!orderForm.orderType) e.orderType = 'Order type is required';
    const amt = parseFloat(orderForm.amount);
    if (!orderForm.amount) e.amount = 'Amount is required';
    else if (Number.isNaN(amt) || amt <= 0) e.amount = 'Enter a valid amount';
    return e;
  }, [orderForm]);

  const hasOrderError = (name) => touched[name] && orderErrors[name];

  const resetOrderForm = () => {
    setOrderForm({ vendorId: '', orderType: '', amount: '' });
    setTouched({});
    setOrderVendorQuery('');
    setShowVendorList(false);
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    setTouched({ vendorId: true, orderType: true, amount: true });
    if (Object.keys(orderErrors).length) return;
    // TODO: Send to API
    const vendor = DEMO_VENDORS.find((v) => v.id === orderForm.vendorId);
    const details = `${vendor?.tradeName || ''} • ${orderForm.orderType} • ৳${Number(orderForm.amount).toFixed(2)}`;
    resetOrderForm();
    setIsCreateOpen(false);
    Swal.fire({
      icon: 'success',
      title: 'Order created',
      text: details,
      confirmButtonColor: '#7c3aed'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Vendor List</h1>
            <p className="text-gray-600 dark:text-gray-400">Browse all vendors</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => { setPage(1); setQuery(e.target.value); }}
              className="w-full sm:w-72 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Search vendors..."
            />
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 px-3.5 py-2.5"
          >
            <Receipt className="w-4 h-4" /> Create Order
          </button>
          <Link
            to="/vendors/add"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2.5"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Trade Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Trade Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">DOB</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden xl:table-cell">NID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden xl:table-cell">Passport</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paged.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{v.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center justify-center h-9 w-9 rounded-md bg-purple-100 dark:bg-purple-900/30">
                        <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <Link to={`/vendors/${v.id}`} className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline">{v.tradeName}</Link>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {v.tradeLocation}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{v.tradeLocation}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" /> {v.ownerName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" /> {v.contactNo}</div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" /> {v.dob}</div>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><CreditCard className="w-4 h-4 text-gray-500" /> {v.nid}</div>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500" /> {v.passport}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">No vendors found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-medium">{paged.length}</span> of <span className="font-medium">{filtered.length}</span> vendors
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-200">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      {/* Create Order Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); resetOrderForm(); }} title="Create Order" size="lg">
        <div className="max-h-[70vh] overflow-y-auto pr-1">
        <form onSubmit={handleOrderSubmit} className="space-y-5">
          {/* Vendor Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                value={orderForm.vendorId ? (DEMO_VENDORS.find(v => v.id === orderForm.vendorId)?.tradeName || '') : orderVendorQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setOrderVendorQuery(val);
                  setShowVendorList(true);
                  setTouched((t) => ({ ...t, vendorId: true }));
                  setOrderForm((f) => ({ ...f, vendorId: '' }));
                }}
                onFocus={() => setShowVendorList(true)}
                placeholder="Search vendor by name..."
                className={`w-full rounded-lg border px-3 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${hasOrderError('vendorId') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              />
              {showVendorList && (
                <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg max-h-56 overflow-auto">
                  {modalVendors.slice(0, 50).map((v) => (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => {
                        setOrderForm((f) => ({ ...f, vendorId: v.id }));
                        setOrderVendorQuery(v.tradeName);
                        setShowVendorList(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${orderForm.vendorId === v.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{v.tradeName}</div>
                      <div className="text-xs text-gray-500">{v.ownerName} • {v.tradeLocation}</div>
                    </button>
                  ))}
                  {modalVendors.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">No vendors found</div>
                  )}
                </div>
              )}
            </div>
            {hasOrderError('vendorId') && (
              <p className="mt-1 text-sm text-red-600">{orderErrors.vendorId}</p>
            )}
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Type <span className="text-red-500">*</span></label>
            <select
              value={orderForm.orderType}
              onChange={(e) => setOrderForm((f) => ({ ...f, orderType: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, orderType: true }))}
              className={`w-full rounded-lg border px-3 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${hasOrderError('orderType') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
            >
              <option value="">Select type</option>
              <option value="Air Ticket">Air Ticket</option>
              <option value="Hajj">Hajj</option>
              <option value="Umrah">Umrah</option>
              <option value="Visa">Visa</option>
              <option value="Other">Other</option>
            </select>
            {hasOrderError('orderType') && (
              <p className="mt-1 text-sm text-red-600">{orderErrors.orderType}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Amount <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 text-sm">৳</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={orderForm.amount}
                onChange={(e) => setOrderForm((f) => ({ ...f, amount: e.target.value }))}
                onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
                placeholder="0.00"
                className={`w-full rounded-lg border pl-7 pr-3 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${hasOrderError('amount') ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              />
            </div>
            {hasOrderError('amount') && (
              <p className="mt-1 text-sm text-red-600">{orderErrors.amount}</p>
            )}
          </div>

          <ModalFooter>
            <button
              type="button"
              onClick={() => { setIsCreateOpen(false); resetOrderForm(); }}
              className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2"
            >
              Create Order
            </button>
          </ModalFooter>
        </form>
      </div>
      </Modal>
    </div>
  );
};

export default VendorList;
