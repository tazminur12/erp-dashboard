import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useExchange, useUpdateExchange } from '../../hooks/useMoneyExchangeQueries';

const CURRENCIES = [
  { code: 'USD', nameBn: 'মার্কিন ডলার' },
  { code: 'SAR', nameBn: 'সৌদি রিয়াল' },
  { code: 'EUR', nameBn: 'ইউরো' },
  { code: 'GBP', nameBn: 'ব্রিটিশ পাউন্ড' },
  { code: 'AED', nameBn: 'সংযুক্ত আরব আমিরাত দিরহাম' },
  { code: 'QAR', nameBn: 'কাতারি রিয়াল' },
  { code: 'KWD', nameBn: 'কুয়েতি দিনার' },
  { code: 'OMR', nameBn: 'ওমানি রিয়াল' },
  { code: 'JPY', nameBn: 'জাপানি ইয়েন' },
  { code: 'AUD', nameBn: 'অস্ট্রেলিয়ান ডলার' },
  { code: 'CAD', nameBn: 'কানাডিয়ান ডলার' },
  { code: 'CHF', nameBn: 'সুইস ফ্রাঙ্ক' },
  { code: 'CNY', nameBn: 'চীনা ইউয়ান' },
  { code: 'INR', nameBn: 'ভারতীয় রুপি' },
  { code: 'PKR', nameBn: 'পাকিস্তানি রুপি' },
  { code: 'SGD', nameBn: 'সিঙ্গাপুর ডলার' },
  { code: 'THB', nameBn: 'থাই বাত' },
  { code: 'MYR', nameBn: 'মালয়েশিয়ান রিঙ্গিত' },
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

const validate = (v) => {
  const e = {};
  if (!v.date) e.date = 'তারিখ নির্বাচন করুন';
  if (!v.fullName || v.fullName.trim() === '') e.fullName = 'পূর্ণ নাম প্রয়োজন';
  if (!v.mobileNumber || v.mobileNumber.trim() === '') e.mobileNumber = 'মোবাইল নম্বর প্রয়োজন';
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

const EditExchange = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: exchangeData, isLoading, error } = useExchange(id);
  const updateExchange = useUpdateExchange();

  const [form, setForm] = useState({
    date: '',
    fullName: '',
    mobileNumber: '',
    nid: '',
    type: 'Buy',
    currencyCode: 'USD',
    currencyName: 'মার্কিন ডলার',
    exchangeRate: '',
    quantity: '',
  });
  const [errors, setErrors] = useState({});

  // Populate form when exchange data is loaded
  useEffect(() => {
    if (exchangeData) {
      setForm({
        date: exchangeData.date || '',
        fullName: exchangeData.fullName || '',
        mobileNumber: exchangeData.mobileNumber || '',
        nid: exchangeData.nid || '',
        type: exchangeData.type || 'Buy',
        currencyCode: exchangeData.currencyCode || 'USD',
        currencyName: exchangeData.currencyName || 'মার্কিন ডলার',
        exchangeRate: exchangeData.exchangeRate ? String(exchangeData.exchangeRate) : '',
        quantity: exchangeData.quantity ? String(exchangeData.quantity) : '',
      });
    }
  }, [exchangeData]);

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

    try {
      await updateExchange.mutateAsync({
        id,
        updates: {
          ...form,
          exchangeRate: Number(form.exchangeRate),
          quantity: Number(form.quantity),
        },
      });
      navigate('/money-exchange/list');
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Failed to update exchange:', error);
    }
  };

  const disabled = updateExchange.isPending || isLoading;

  if (isLoading) {
    return (
      <main className="p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">লোড হচ্ছে...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !exchangeData) {
    return (
      <main className="p-4 md:p-6">
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">লেনদেন লোড করতে ব্যর্থ হয়েছে</p>
            <button
              onClick={() => navigate('/money-exchange/list')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              তালিকায় ফিরে যান
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/money-exchange/list')}
            className="p-2 rounded-md border bg-white hover:bg-gray-50 text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">মুদ্রা লেনদেন সম্পাদনা</h1>
            <p className="text-sm text-gray-600">লেনদেনের তথ্য আপডেট করুন</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/money-exchange/list')}
            className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50 text-gray-700"
            disabled={disabled}
          >
            বাতিল
          </button>
          <button
            type="submit"
            form="exchange-form"
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-70"
            disabled={disabled}
          >
            {updateExchange.isPending ? 'আপডেট হচ্ছে…' : 'আপডেট করুন'}
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
                    Full Name (পূর্ণ নাম) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="পূর্ণ নাম লিখুন"
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    disabled={disabled}
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
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
                    Mobile Number (মোবাইল নম্বর) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="01XXXXXXXXX"
                    value={form.mobileNumber}
                    onChange={(e) => handleChange('mobileNumber', e.target.value)}
                    disabled={disabled}
                  />
                  {errors.mobileNumber && <p className="mt-1 text-xs text-red-600">{errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    NID (জাতীয় পরিচয়পত্র)
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="জাতীয় পরিচয়পত্র নম্বর"
                    value={form.nid}
                    onChange={(e) => handleChange('nid', e.target.value)}
                    disabled={disabled}
                  />
                  {errors.nid && <p className="mt-1 text-xs text-red-600">{errors.nid}</p>}
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
                  onClick={() => navigate('/money-exchange/list')}
                  className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50 text-gray-700"
                  disabled={disabled}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-70"
                  disabled={disabled}
                >
                  {updateExchange.isPending ? 'আপডেট হচ্ছে…' : 'আপডেট করুন'}
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
                <span className="text-gray-600">পূর্ণ নাম</span>
                <span className="font-medium text-gray-900">{form.fullName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">মোবাইল নম্বর</span>
                <span className="font-medium text-gray-900">{form.mobileNumber || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">জাতীয় পরিচয়পত্র</span>
                <span className="font-medium text-gray-900">{form.nid || '-'}</span>
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
        </aside>
      </section>
    </main>
  );
};

export default EditExchange;

