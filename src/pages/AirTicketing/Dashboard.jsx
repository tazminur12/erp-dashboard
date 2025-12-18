import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  LayoutDashboard,
  Plane,
  Users,
  Ticket,
  TrendingUp,
  RefreshCw,
  CalendarRange,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useAirTicketDashboardSummary } from '../../hooks/useAirTicketQueries';

const StatCard = ({ title, value, icon: Icon, sub, accent = 'blue' }) => {
  const colors = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-emerald-500 to-green-500',
    amber: 'from-amber-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500',
    gray: 'from-gray-500 to-slate-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {sub ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>
          ) : null}
        </div>
        <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${colors[accent] || colors.blue} flex items-center justify-center text-white`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const BreakdownList = ({ title, items, valueKey = 'count' }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
    <div className="flex items-center gap-2 mb-3">
      <BarChart3 className="w-4 h-4 text-indigo-500" />
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
    </div>
    {items.length === 0 ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">কোন ডাটা পাওয়া যায়নি</p>
    ) : (
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-200">{item.label}</span>
            <div className="flex items-center gap-3 text-right">
              <span className="text-gray-900 dark:text-white font-medium">
                {item[valueKey]}
              </span>
              {'revenue' in item ? (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ৳{item.revenue?.toLocaleString()}
                </span>
              ) : null}
              {'profit' in item ? (
                <span className={`text-xs ${item.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {item.profit >= 0 ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}৳
                  {Math.abs(item.profit).toLocaleString()}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const AirTicketDashboard = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    airline: '',
    agentId: '',
    status: '',
    flightType: '',
    tripType: '',
  });

  const cleanedFilters = useMemo(() => {
    const entries = Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined);
    return Object.fromEntries(entries);
  }, [filters]);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useAirTicketDashboardSummary(cleanedFilters);

  const loading = isLoading || isFetching;
  const summary = data || {};
  const totals = summary.totals || {
    tickets: 0,
    segments: 0,
    passengers: { adults: 0, children: 0, infants: 0 },
    averageProfitPerTicket: 0,
  };

  const financials = summary.financials || {
    revenue: 0,
    customerPaid: 0,
    customerDue: 0,
    vendorAmount: 0,
    vendorPaid: 0,
    vendorDue: 0,
    profit: 0,
    netMarginPct: 0,
  };

  const statusBreakdown = summary.statusBreakdown || {};
  const flightTypeBreakdown = summary.flightTypeBreakdown || [];
  const tripTypeBreakdown = summary.tripTypeBreakdown || [];
  const topAirlines = summary.topAirlines || [];
  const topAgents = summary.topAgents || [];
  const recentTickets = summary.recentTickets || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <Helmet>
        <title>Air Ticketing Dashboard</title>
        <meta name="description" content="Overview of air ticketing performance and analytics." />
      </Helmet>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">এয়ার টিকেটিং ড্যাশবোর্ড</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">প্রফিট/লস, ট্রেন্ড ও টপ পারফর্মার</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters({ dateFrom: '', dateTo: '', airline: '', agentId: '', status: '', flightType: '', tripType: '' })}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              রিসেট
            </button>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              রিফ্রেশ
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            <CalendarRange className="w-4 h-4" />
            ফিল্টার
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">শুরু তারিখ</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">শেষ তারিখ</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">এয়ারলাইন</label>
              <input
                type="text"
                placeholder="e.g. Qatar Airways"
                value={filters.airline}
                onChange={(e) => setFilters((prev) => ({ ...prev, airline: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">এজেন্ট আইডি</label>
              <input
                type="text"
                placeholder="Agent ID"
                value={filters.agentId}
                onChange={(e) => setFilters((prev) => ({ ...prev, agentId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">স্ট্যাটাস</label>
              <input
                type="text"
                placeholder="Issued/Cancelled"
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">ফ্লাইট টাইপ</label>
              <input
                type="text"
                placeholder="Domestic/International"
                value={filters.flightType}
                onChange={(e) => setFilters((prev) => ({ ...prev, flightType: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">ট্রিপ টাইপ</label>
              <input
                type="text"
                placeholder="One Way/Round/Multicity"
                value={filters.tripType}
                onChange={(e) => setFilters((prev) => ({ ...prev, tripType: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error.message}</span>
          </div>
        ) : null}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="মোট টিকেট"
            value={loading ? '...' : totals.tickets.toLocaleString()}
            icon={Ticket}
            sub={`সেগমেন্ট: ${totals.segments || 0}`}
            accent="blue"
          />
          <StatCard
            title="মোট যাত্রী"
            value={
              loading
                ? '...'
                : (totals.passengers?.adults || 0) +
                  (totals.passengers?.children || 0) +
                  (totals.passengers?.infants || 0)
            }
            icon={Users}
            sub={`এডাল্ট ${totals.passengers?.adults || 0}, চিলড্রেন ${totals.passengers?.children || 0}, ইনফ্যান্ট ${totals.passengers?.infants || 0}`}
            accent="green"
          />
          <StatCard
            title="নেট প্রফিট"
            value={loading ? '...' : `৳${financials.profit?.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            icon={TrendingUp}
            sub={`এভারেজ ৳${totals.averageProfitPerTicket?.toLocaleString(undefined, { maximumFractionDigits: 2 })}/টিকেট`}
            accent="amber"
          />
          <StatCard
            title="রাজস্ব"
            value={loading ? '...' : `৳${financials.revenue?.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            icon={Plane}
            sub={`নেট মার্জিন ${financials.netMarginPct || 0}%`}
            accent="purple"
          />
        </div>

        {/* Financials */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              ফাইন্যান্সিয়াল ওভারভিউ
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">কাস্টমার ডিল</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">৳{financials.revenue?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">কাস্টমার পেইড</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">৳{financials.customerPaid?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">কাস্টমার ডিউ</p>
                <p className="text-lg font-semibold text-amber-600">৳{financials.customerDue?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">ভেন্ডর এমাউন্ট</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">৳{financials.vendorAmount?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">ভেন্ডর পেইড</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">৳{financials.vendorPaid?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">ভেন্ডর ডিউ</p>
                <p className="text-lg font-semibold text-red-500">৳{financials.vendorDue?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <BreakdownList
            title="স্ট্যাটাস ব্রেকডাউন"
            items={Object.entries(statusBreakdown).map(([key, val]) => ({
              label: key,
              count: val.count || 0,
              revenue: val.revenue || 0,
              profit: val.profit || 0,
            }))}
          />

          <div className="grid grid-cols-1 gap-4">
            <BreakdownList
              title="ফ্লাইট টাইপ"
              items={flightTypeBreakdown.map((item) => ({
                label: item.flightType || 'unknown',
                count: item.count || 0,
                revenue: item.revenue || 0,
                profit: item.profit || 0,
              }))}
            />
            <BreakdownList
              title="ট্রিপ টাইপ"
              items={tripTypeBreakdown.map((item) => ({
                label: item.tripType || 'unknown',
                count: item.count || 0,
                revenue: item.revenue || 0,
                profit: item.profit || 0,
              }))}
            />
          </div>
        </div>

        {/* Top performers and recent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Plane className="w-4 h-4 text-blue-500" />
              টপ এয়ারলাইন
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {topAirlines.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">কোন ডাটা নেই</p>
              ) : (
                topAirlines.map((airline) => (
                  <div key={airline.airline} className="py-2 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{airline.airline || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">টিকেট: {airline.count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 dark:text-white">৳{airline.revenue?.toLocaleString()}</p>
                      <p className={`text-xs ${airline.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        প্রফিট: ৳{airline.profit?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              টপ এজেন্ট
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {topAgents.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">কোন ডাটা নেই</p>
              ) : (
                topAgents.map((agent) => (
                  <div key={agent.agentId || agent.agent} className="py-2 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{agent.agent || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID: {agent.agentId || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 dark:text-white">৳{agent.revenue?.toLocaleString()}</p>
                      <p className={`text-xs ${agent.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        প্রফিট: ৳{agent.profit?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Ticket className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">রিসেন্ট টিকেট</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-2 pr-4">বুকিং আইডি</th>
                  <th className="py-2 pr-4">এয়ারলাইন</th>
                  <th className="py-2 pr-4">এজেন্ট</th>
                  <th className="py-2 pr-4">স্ট্যাটাস</th>
                  <th className="py-2 pr-4 text-right">প্রফিট</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-3 text-gray-500 dark:text-gray-400">কোন টিকেট নেই</td>
                  </tr>
                ) : (
                  recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 pr-4 text-gray-900 dark:text-white">{ticket.bookingId || 'N/A'}</td>
                      <td className="py-2 pr-4 text-gray-700 dark:text-gray-200">{ticket.airline || '-'}</td>
                      <td className="py-2 pr-4 text-gray-700 dark:text-gray-200">{ticket.agent || '-'}</td>
                      <td className="py-2 pr-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200">
                          {ticket.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right font-semibold">
                        <span className={ticket.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                          ৳{ticket.profit?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirTicketDashboard;
