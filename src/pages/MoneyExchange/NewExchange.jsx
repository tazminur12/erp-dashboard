import React, { useEffect, useMemo, useState } from 'react';

const CURRENCIES = [
  { code: 'USD', nameBn: 'মার্কিন ডলার' },
  { code: 'SAR', nameBn: 'সৌদি রিয়াল' },
  { code: 'EUR', nameBn: 'ইউরো' },
  { code: 'GBP', nameBn: 'ব্রিটিশ পাউন্ড' },
  { code: 'BDT', nameBn: 'বাংলাদেশি টাকা' },
];

const TYPES = [
  { value: 'Buy', labelBn: 'ক্রয় (Buy)' },
  { value: 'Sell', labelBn: 'বিক্রয় (Sell)' },
];

const formatBDT = (value) =>
  new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 2 }).format(
    Number.isFinite(value) ? value : 0
  );

const generateVoucher = () => `EXC-${String(Date.now()).slice(-8)}`;

const mockRecent = [
  { id: 'EXC-12345678', date: '2025-09-01', type: 'Buy', code: 'USD', rate: 117.5, qty: 500 },
  { id: 'EXC-12345679', date: '2025-09-02', type: 'Sell', code: 'EUR', rate: 128.2, qty: 120 },
  { id: 'EXC-12345680', date: '2025-09-03', type: 'Buy', code: 'SAR', rate: 31.22, qty: 1000 },
];

const initialForm = {
  date: new Date().toISOString().split('T')[0],
  voucher: generateVoucher(),
  type: 'Buy',
  currencyCode: 'USD',
  currencyName: 'মার্কিন ডলার',
  exchangeRate: '',
  quantity: '',
};

const validate = (v) => {
  const e = {};
  if (!v.date) e.date = 'তারিখ নির্বাচন করুন';
  if (!v.voucher) e.voucher = 'ভাউচার নম্বর প্রয়োজন';
  if (!v.type || !TYPES.find((t) => t.value === v.type)) e.type = 'ধরণ নির্বাচন করুন';
  if (!v.currencyCode) e.currencyCode = 'কারেন্সি কোড নির্বাচন করুন';
  if (!v.currencyName) e.currencyName = 'কারেন্সির নাম নির্বাচন করুন';
  const r = Number(v.exchangeRate);
  if (!Number.isFinite(r) || r <= 0) e.exchangeRate = 'সঠিক এক্সচেঞ্জ রেট দিন (> 0)';
  const q = Number(v.quantity);
  if (!Number.isFinite(q) || q <= 0) e.quantity = 'সঠিক পরিমাণ দিন (> 0)';
  return e;
};

const Pill = ({ color = 'gray', children }) => {
  const map = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${map[color]}`}>{children}</span>;
};

const NewExchange = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [recent, setRecent] = useState(mockRecent);

  useEffect(() => {
    const c = CURRENCIES.find((x) => x.code === form.currencyCode);
    if (c && c.nameBn !== form.currencyName) {
      setForm((f) => ({ ...f, currencyName: c.nameBn }));
    }
  }, [form.currencyCode]);

  const amount = useMemo(() => {
    const r = Number(form.exchangeRate);
    const q = Number(form.quantity);
    return Number.isFinite(r) && Number.isFinite(q) ? r * q : 0;
  }, [form.exchangeRate, form.quantity]);

  const handleChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).filter((k) => v[k]).length) return;

    setSaving(true);
    try {
      // TODO: Replace with real API call (POST /exchanges)
      await new Promise((r) => setTimeout(r, 500));
      const newRow = {
        id: form.voucher,
        date: form.date,
        type: form.type,
        code: form.currencyCode,
        rate: Number(form.exchangeRate),
        qty: Number(form.quantity),
      };
      setRecent((prev) => [newRow, ...prev].slice(0, 10));
      setForm({ ...initialForm, voucher: generateVoucher() });
    } finally {
      setSaving(false);
    }
  };

  const disabled = saving;

  return (
    <main className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">নতুন মুদ্রা লেনদেন</h1>
          <p className="text-sm text-gray-600">প্রফেশনাল ফর্ম দিয়ে দ্রুত লেনদেন এন্ট্রি করুন</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setForm(initialForm)}
            className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50 text-gray-700"
          >
            Reset
          </button>
          <button
            type="submit"
            form="exchange-form"
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-70"
            disabled={disabled}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <form id="exchange-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date (তারিখ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                    value={form.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    disabled={disabled}
                  />
                  {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Transaction ID / Voucher No (লেনদেন নম্বর)
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-50"
                    value={form.voucher}
                    onChange={(e) => handleChange('voucher', e.target.value)}
                    disabled={disabled}
                  />
                  {errors.voucher && <p className="mt-1 text-xs text-red-600">{errors.voucher}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type (ধরণ) <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                    value={form.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    disabled={disabled}
                  >
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.labelBn}
                      </option>
                    ))}
                  </select>
                  {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Currency Name (কারেন্সির নাম) <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                    value={form.currencyName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const cur = CURRENCIES.find((c) => c.nameBn === name) || CURRENCIES[0];
                      handleChange('currencyName', cur.nameBn);
                      handleChange('currencyCode', cur.code);
                    }}
                    disabled={disabled}
                  >
                    {CURRENCIES.filter((c) => c.code !== 'BDT').map((c) => (
                      <option key={c.code} value={c.nameBn}>
                        {c.nameBn}
                      </option>
                    ))}
                  </select>
                  {errors.currencyName && <p className="mt-1 text-xs text-red-600">{errors.currencyName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Currency Code (কারেন্সি কোড) <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                    value={form.currencyCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      const cur = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
                      handleChange('currencyCode', cur.code);
                      handleChange('currencyName', cur.nameBn);
                    }}
                    disabled={disabled}
                  >
                    {CURRENCIES.filter((c) => c.code !== 'BDT').map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                  {errors.currencyCode && <p className="mt-1 text-xs text-red-600">{errors.currencyCode}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Exchange Rate (এক্সচেঞ্জ রেট) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.0000"
                    value={form.exchangeRate}
                    onChange={(e) => handleChange('exchangeRate', e.target.value)}
                    disabled={disabled}
                  />
                  {errors.exchangeRate && <p className="mt-1 text-xs text-red-600">{errors.exchangeRate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity (পরিমাণ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                    value={form.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    disabled={disabled}
                  />
                  {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (টাকা/BDT)</label>
                  <div className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-50 text-gray-900 tabular-nums">
                    {formatBDT(amount)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setForm(initialForm)}
                  className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50 text-gray-700"
                  disabled={disabled}
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-70"
                  disabled={disabled}
                >
                  {saving ? 'Saving…' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-3">লেনদেনের সারাংশ</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">তারিখ</span>
                <span className="font-medium text-gray-900">{form.date || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ভাউচার</span>
                <span className="font-medium text-gray-900">{form.voucher || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ধরণ</span>
                <span>
                  <Pill color={form.type === 'Buy' ? 'green' : 'red'}>{form.type}</Pill>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">কারেন্সি</span>
                <span className="font-medium text-gray-900">
                  {form.currencyCode} • {form.currencyName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">এক্সচেঞ্জ রেট</span>
                <span className="font-medium text-gray-900 tabular-nums">{form.exchangeRate || '0.0000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">পরিমাণ</span>
                <span className="font-medium text-gray-900 tabular-nums">{form.quantity || '0.00'}</span>
              </div>
              <div className="border-t pt-3 mt-2 flex justify-between">
                <span className="text-gray-700 font-medium">মোট (BDT)</span>
                <span className="text-lg font-semibold text-gray-900">{formatBDT(amount)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-3">সাম্প্রতিক লেনদেন</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" role="table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Voucher</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Currency</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Rate</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recent.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-gray-600">কোন লেনদেন নেই</td>
                    </tr>
                  ) : (
                    recent.map((r) => {
                      const amt = r.rate * r.qty;
                      return (
                        <tr key={r.id}>
                          <td className="px-3 py-2 text-sm text-gray-900">{r.date}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{r.id}</td>
                          <td className="px-3 py-2 text-sm"><Pill color={r.type === 'Buy' ? 'green' : 'red'}>{r.type}</Pill></td>
                          <td className="px-3 py-2 text-sm text-gray-900">{r.code}</td>
                          <td className="px-3 py-2 text-sm text-right tabular-nums text-gray-900">{r.rate}</td>
                          <td className="px-3 py-2 text-sm text-right tabular-nums text-gray-900">{r.qty}</td>
                          <td className="px-3 py-2 text-sm text-right tabular-nums text-gray-900">{formatBDT(amt)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </aside>
      </section>

      {/*
        TODO: Integrate with backend API
        - POST /exchanges { ...form, amount_bdt: amount }
        - Handle success/error and show toasts
        - Replace mockRecent with server-provided recent transactions
      */}
    </main>
  );
};

export default NewExchange;