import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCreateExchange } from '../../hooks/useMoneyExchangeQueries';
import { useDilars } from '../../hooks/useDilarQueries';
import { Search, Building2, User, X } from 'lucide-react';


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

const CUSTOMER_TYPES = [
  { value: 'normal', labelBn: 'সাধারণ গ্রাহক (Normal Customer)' },
  { value: 'dilar', labelBn: 'ডিলার (Dilar)' },
];

const initialForm = {
  customerType: 'normal', // 'normal' or 'dilar'
  selectedDilarId: '', // For dilar selection
  date: new Date().toISOString().split('T')[0],
  fullName: '',
  mobileNumber: '',
  nid: '',
  type: 'Buy',
  currencyCode: 'USD',
  currencyName: 'মার্কিন ডলার',
  exchangeRate: '',
  quantity: '',
};

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

const NewExchange = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [dilarSearchTerm, setDilarSearchTerm] = useState('');
  const [showDilarDropdown, setShowDilarDropdown] = useState(false);
  const createExchange = useCreateExchange();
  
  // Fetch dilars for dropdown
  const { data: dilarsData, isLoading: dilarsLoading } = useDilars({
    search: dilarSearchTerm,
    page: 1,
    limit: 10
  });
  const dilars = dilarsData?.dilars || [];

  useEffect(() => {
    const c = CURRENCIES.find((x) => x.code === form.currencyCode);
    if (c && c.nameBn !== form.currencyName) {
      setForm((f) => ({ ...f, currencyName: c.nameBn }));
    }
  }, [form.currencyCode]);

  // Reset quantity and exchangeRate when type changes
  useEffect(() => {
    setForm((f) => ({ ...f, quantity: '', exchangeRate: '' }));
    setErrors((e) => ({ ...e, quantity: undefined, exchangeRate: undefined }));
  }, [form.type]);

  // Reset customer fields when customer type changes
  useEffect(() => {
    if (form.customerType === 'normal') {
      setForm((f) => ({ 
        ...f, 
        selectedDilarId: '',
        fullName: '',
        mobileNumber: '',
        nid: ''
      }));
    } else {
      setForm((f) => ({ 
        ...f, 
        fullName: '',
        mobileNumber: '',
        nid: ''
      }));
    }
    setDilarSearchTerm('');
    setShowDilarDropdown(false);
  }, [form.customerType]);

  // Handle dilar selection
  const handleDilarSelect = (dilar) => {
    const dilarId = dilar._id || dilar.contactNo;
    setForm((f) => ({
      ...f,
      selectedDilarId: dilarId,
      dilarId: dilarId, // Also set dilarId for backend
      fullName: dilar.ownerName || '',
      mobileNumber: dilar.contactNo || '',
      nid: dilar.nid || '',
    }));
    setDilarSearchTerm(dilar.ownerName || '');
    setShowDilarDropdown(false);
  };

  // Filter dilars based on search term
  const filteredDilars = useMemo(() => {
    if (!dilarSearchTerm.trim()) return dilars;
    const searchLower = dilarSearchTerm.toLowerCase();
    return dilars.filter(d => 
      (d.ownerName || '').toLowerCase().includes(searchLower) ||
      (d.contactNo || '').includes(dilarSearchTerm) ||
      (d.tradeLocation || '').toLowerCase().includes(searchLower)
    );
  }, [dilars, dilarSearchTerm]);

  const isBuy = form.type === 'Buy';

  // For Buy: quantity field stores BDT amount, calculate foreign currency
  // For Sell: quantity field stores foreign currency, calculate BDT
  const amount = useMemo(() => {
    const r = Number(form.exchangeRate);
    const q = Number(form.quantity);
    if (!Number.isFinite(r) || !Number.isFinite(q) || r <= 0 || q <= 0) return 0;
    
    if (isBuy) {
      // Buy: quantity is BDT paid, amount_bdt = quantity
      return q;
    } else {
      // Sell: quantity is foreign currency, amount_bdt = quantity * rate
      return q * r;
    }
  }, [form.exchangeRate, form.quantity, isBuy]);

  const foreignCurrencyAmount = useMemo(() => {
    const r = Number(form.exchangeRate);
    const q = Number(form.quantity);
    if (!Number.isFinite(r) || !Number.isFinite(q) || r <= 0 || q <= 0) return 0;
    
    if (isBuy) {
      // Buy: quantity is BDT, foreign currency = quantity / rate
      return q / r;
    } else {
      // Sell: quantity is foreign currency
      return q;
    }
  }, [form.exchangeRate, form.quantity, isBuy]);

  const handleChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDilarDropdown && !event.target.closest('.relative')) {
        setShowDilarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDilarDropdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).filter((k) => v[k]).length) return;

    try {
      // Prepare data for API
      // Backend expects: quantity = foreign currency amount, amount_bdt = BDT amount
      const payload = {
        ...form,
        quantity: isBuy ? foreignCurrencyAmount : Number(form.quantity), // For Buy, convert BDT to foreign currency
        amount_bdt: amount,
        // Include dilar-related fields
        customerType: form.customerType || 'normal',
        selectedDilarId: form.selectedDilarId || '',
        dilarId: form.customerType === 'dilar' ? (form.selectedDilarId || form.dilarId) : undefined,
      };
      
      await createExchange.mutateAsync(payload);
      setForm({ ...initialForm });
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Failed to create exchange:', error);
    }
  };

  const disabled = createExchange.isPending;

  return (
    <main className="p-4 md:p-6 space-y-6">
      <Helmet>
        <title>New Currency Exchange</title>
        <meta name="description" content="Create a new currency exchange transaction using the professional form." />
      </Helmet>
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
            {createExchange.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <form id="exchange-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Customer Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Type (গ্রাহকের ধরণ) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CUSTOMER_TYPES.map((ct) => (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => handleChange('customerType', ct.value)}
                      disabled={disabled}
                      className={`px-4 py-3 rounded-md border-2 font-medium transition-all ${
                        form.customerType === ct.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      } disabled:opacity-50`}
                    >
                      {ct.labelBn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type (ধরণ) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleChange('type', t.value)}
                      disabled={disabled}
                      className={`px-4 py-3 rounded-md border-2 font-medium transition-all ${
                        form.type === t.value
                          ? t.value === 'Buy'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      } disabled:opacity-50`}
                    >
                      {t.labelBn}
                    </button>
                  ))}
                </div>
                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
              </div>

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Dilar Selection or Normal Name Input */}
                {form.customerType === 'dilar' ? (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dilar (ডিলার) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="mt-1 w-full border rounded-md pl-10 pr-10 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="ডিলার খুঁজুন... (নাম, মোবাইল)"
                        value={dilarSearchTerm}
                        onChange={(e) => {
                          setDilarSearchTerm(e.target.value);
                          setShowDilarDropdown(true);
                        }}
                        onFocus={() => setShowDilarDropdown(true)}
                        disabled={disabled}
                      />
                      {form.selectedDilarId && (
                        <button
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, selectedDilarId: '', fullName: '', mobileNumber: '', nid: '' }));
                            setDilarSearchTerm('');
                          }}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>
                    {showDilarDropdown && filteredDilars.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredDilars.map((dilar) => (
                          <button
                            key={dilar._id || dilar.contactNo}
                            type="button"
                            onClick={() => handleDilarSelect(dilar)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                          >
                            {dilar.logo ? (
                              <img src={dilar.logo} alt={dilar.ownerName} className="w-8 h-8 rounded object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-purple-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{dilar.ownerName || 'N/A'}</div>
                              <div className="text-sm text-gray-500 truncate">{dilar.contactNo || ''}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {showDilarDropdown && dilarSearchTerm && filteredDilars.length === 0 && !dilarsLoading && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500">
                        কোনো ডিলার পাওয়া যায়নি
                      </div>
                    )}
                  </div>
                ) : (
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
                )}
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
                    disabled={disabled || form.customerType === 'dilar'}
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
                    disabled={disabled || form.customerType === 'dilar'}
                  />
                  {errors.nid && <p className="mt-1 text-xs text-red-600">{errors.nid}</p>}
                </div>
              </div>

              {/* Currency Selection */}
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

              {/* Type-specific Fields */}
              {isBuy ? (
                // Buy Form: Paying BDT, Receiving Foreign Currency
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-sm font-semibold text-green-800 mb-3">ক্রয় (Buy) - BDT প্রদান করে বিদেশি মুদ্রা গ্রহণ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Amount to Pay (প্রদান করতে হবে) <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 block">BDT</span>
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
                      <label className="block text-sm font-medium text-gray-700">
                        Exchange Rate (এক্সচেঞ্জ রেট) <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 block">1 {form.currencyCode} = ? BDT</span>
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
                        Foreign Currency to Receive (প্রাপ্ত হবে)
                        <span className="text-xs text-gray-500 block">{form.currencyCode}</span>
                      </label>
                      <div className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-50 text-gray-900 tabular-nums">
                        {foreignCurrencyAmount.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Sell Form: Selling Foreign Currency, Receiving BDT
                <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="text-sm font-semibold text-red-800 mb-3">বিক্রয় (Sell) - বিদেশি মুদ্রা প্রদান করে BDT গ্রহণ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Foreign Currency to Sell (বিক্রয় করতে হবে) <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 block">{form.currencyCode}</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="0.00"
                        value={form.quantity}
                        onChange={(e) => handleChange('quantity', e.target.value)}
                        disabled={disabled}
                      />
                      {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Exchange Rate (এক্সচেঞ্জ রেট) <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 block">1 {form.currencyCode} = ? BDT</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.0001"
                        className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="0.0000"
                        value={form.exchangeRate}
                        onChange={(e) => handleChange('exchangeRate', e.target.value)}
                        disabled={disabled}
                      />
                      {errors.exchangeRate && <p className="mt-1 text-xs text-red-600">{errors.exchangeRate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Amount to Receive (প্রাপ্ত হবে)
                        <span className="text-xs text-gray-500 block">BDT</span>
                      </label>
                      <div className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-50 text-gray-900 tabular-nums">
                        {formatBDT(amount)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                  {createExchange.isPending ? 'Saving…' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <aside className="space-y-4">
          <div className={`bg-white rounded-lg border p-5 shadow-sm ${isBuy ? 'border-green-200' : 'border-red-200'}`}>
            <h3 className="text-base font-semibold text-gray-900 mb-3">লেনদেনের সারাংশ</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ধরণ</span>
                <span>
                  <Pill color={isBuy ? 'green' : 'red'}>{form.type}</Pill>
                </span>
              </div>
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
              {form.nid && (
                <div className="flex justify-between">
                  <span className="text-gray-600">জাতীয় পরিচয়পত্র</span>
                  <span className="font-medium text-gray-900">{form.nid}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">কারেন্সি</span>
                <span className="font-medium text-gray-900">
                  {form.currencyCode} • {form.currencyName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">এক্সচেঞ্জ রেট</span>
                <span className="font-medium text-gray-900 tabular-nums">
                  1 {form.currencyCode} = {form.exchangeRate || '0.0000'} BDT
                </span>
              </div>
              {isBuy ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">প্রদান করতে হবে (BDT)</span>
                    <span className="font-medium text-gray-900 tabular-nums">{formatBDT(Number(form.quantity) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">প্রাপ্ত হবে ({form.currencyCode})</span>
                    <span className="font-medium text-gray-900 tabular-nums">
                      {foreignCurrencyAmount.toFixed(4)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">বিক্রয় করতে হবে ({form.currencyCode})</span>
                    <span className="font-medium text-gray-900 tabular-nums">{form.quantity || '0.00'}</span>
                  </div>
                  <div className="border-t pt-3 mt-2 flex justify-between">
                    <span className="text-gray-700 font-medium">প্রাপ্ত হবে (BDT)</span>
                    <span className="text-lg font-semibold text-gray-900">{formatBDT(amount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </section>

    </main>
  );
};

export default NewExchange;