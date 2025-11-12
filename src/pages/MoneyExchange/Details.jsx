import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Calendar,
  User,
  Phone,
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Printer,
  Download
} from 'lucide-react';
import { useExchange } from '../../hooks/useMoneyExchangeQueries';

const formatBDT = (value) =>
  new Intl.NumberFormat('bn-BD-u-nu-latn', { style: 'currency', currency: 'BDT', minimumFractionDigits: 2 }).format(
    Number.isFinite(value) ? value : 0
  );

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD-u-nu-latn', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('bn-BD-u-nu-latn', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: exchange, isLoading, error } = useExchange(id);

  if (isLoading) {
    return (
      <main className="p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !exchange) {
    return (
      <main className="p-4 md:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">লেনদেন লোড করতে ব্যর্থ হয়েছে</p>
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'সম্পন্ন';
      case 'pending':
        return 'মুলতবি';
      case 'cancelled':
        return 'বাতিল';
      default:
        return 'অজানা';
    }
  };

  const status = exchange.isActive ? 'completed' : 'cancelled';
  const isBuy = exchange.type === 'Buy';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = `
মুদ্রা বিনিময় লেনদেনের বিবরণ
================================

লেনদেন আইডি: ${exchange.id}
তারিখ: ${formatDate(exchange.date)}
ধরণ: ${exchange.type === 'Buy' ? 'ক্রয় (Buy)' : 'বিক্রয় (Sell)'}
স্ট্যাটাস: ${getStatusText(status)}

গ্রাহকের তথ্য:
----------------
পূর্ণ নাম: ${exchange.fullName}
মোবাইল নম্বর: ${exchange.mobileNumber}
জাতীয় পরিচয়পত্র: ${exchange.nid || 'N/A'}

মুদ্রা তথ্য:
-------------
কারেন্সি কোড: ${exchange.currencyCode}
কারেন্সির নাম: ${exchange.currencyName}
এক্সচেঞ্জ রেট: ${exchange.exchangeRate}
পরিমাণ: ${exchange.quantity} ${exchange.currencyCode}

মোট পরিমাণ:
------------
মোট (BDT): ${formatBDT(exchange.amount_bdt || 0)}

সময়:
------
তৈরি হয়েছে: ${formatDateTime(exchange.createdAt)}
আপডেট হয়েছে: ${formatDateTime(exchange.updatedAt)}
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `exchange_${exchange.id}_${new Date().toISOString().slice(0,10)}.txt`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="p-4 md:p-6 space-y-6 print:p-4">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/money-exchange/list')}
            className="p-2 rounded-md border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">লেনদেনের বিবরণ</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">মুদ্রা বিনিময় লেনদেনের সম্পূর্ণ তথ্য</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-md border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>ডাউনলোড</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-md border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট</span>
          </button>
          <button
            onClick={() => navigate(`/money-exchange/edit/${exchange.id}`)}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            <span>সম্পাদনা করুন</span>
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="xl:col-span-2 space-y-6">
          {/* Transaction Header Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                  isBuy 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {isBuy ? (
                    <ArrowDownCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowUpCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isBuy ? 'ক্রয় (Buy)' : 'বিক্রয় (Sell)'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">লেনদেন আইডি: {exchange.id}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                <span className="ml-2">{getStatusText(status)}</span>
              </span>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">মোট পরিমাণ</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatBDT(exchange.amount_bdt || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              গ্রাহকের তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  পূর্ণ নাম
                </label>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {exchange.fullName || '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  মোবাইল নম্বর
                </label>
                <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {exchange.mobileNumber || '-'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  জাতীয় পরিচয়পত্র
                </label>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {exchange.nid || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              লেনদেনের বিবরণ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  তারিখ
                </label>
                <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(exchange.date)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  ধরণ
                </label>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {exchange.type === 'Buy' ? 'ক্রয় (Buy)' : 'বিক্রয় (Sell)'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  কারেন্সি কোড
                </label>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {exchange.currencyCode || '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  কারেন্সির নাম
                </label>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {exchange.currencyName || '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  এক্সচেঞ্জ রেট
                </label>
                <p className="text-base font-medium text-gray-900 dark:text-white tabular-nums">
                  {exchange.exchangeRate?.toLocaleString('bn-BD-u-nu-latn', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) || '0.0000'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  পরিমাণ
                </label>
                <p className="text-base font-medium text-gray-900 dark:text-white tabular-nums">
                  {exchange.quantity?.toLocaleString('bn-BD-u-nu-latn', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} {exchange.currencyCode}
                </p>
              </div>
              <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  মোট পরিমাণ (BDT)
                </label>
                <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {formatBDT(exchange.amount_bdt || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              সময়ের তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  তৈরি হয়েছে
                </label>
                <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {formatDateTime(exchange.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  আপডেট হয়েছে
                </label>
                <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {formatDateTime(exchange.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <aside className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm sticky top-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">লেনদেনের সারাংশ</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">লেনদেন আইডি</span>
                <span className="font-medium text-gray-900 dark:text-white text-xs">{exchange.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">তারিখ</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatDate(exchange.date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">ধরণ</span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  isBuy 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {exchange.type}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">স্ট্যাটাস</span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                  <span className="ml-1">{getStatusText(status)}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">কারেন্সি</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {exchange.currencyCode} • {exchange.currencyName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">এক্সচেঞ্জ রেট</span>
                <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                  {exchange.exchangeRate?.toLocaleString('bn-BD-u-nu-latn', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) || '0.0000'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">পরিমাণ</span>
                <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                  {exchange.quantity?.toLocaleString('bn-BD-u-nu-latn', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 flex justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">মোট (BDT)</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white tabular-nums">
                  {formatBDT(exchange.amount_bdt || 0)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Details;

