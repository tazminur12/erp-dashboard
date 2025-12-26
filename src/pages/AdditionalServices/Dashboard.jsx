import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Briefcase,
  FileText,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowRight,
  Loader2,
  RefreshCw,
  Eye,
  Plus
} from 'lucide-react';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import { useQuery } from '@tanstack/react-query';

const StatCard = ({ title, value, icon: Icon, sub, accent = 'blue', onClick }) => {
  const colors = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-emerald-500 to-green-500',
    amber: 'from-amber-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500',
    indigo: 'from-indigo-500 to-purple-500',
    gray: 'from-gray-500 to-slate-500',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-2">{sub}</p>}
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors[accent] || colors.blue} flex items-center justify-center text-white shadow-lg`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ title, description, icon: Icon, color, count, onClick }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color] || colors.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{count || 0}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700 font-medium">
        <span>View Details</span>
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  // Fetch all services data
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['additionalServicesCustomers', 1, '', 'all'],
    queryFn: async () => {
      const { data } = await axiosSecure.get('/api/customers?page=1&limit=1');
      return {
        total: data?.pagination?.totalItems || 0,
        customers: data?.customers || data?.data || []
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: passportData, isLoading: passportLoading } = useQuery({
    queryKey: ['passportServices', 1, '', 'all'],
    queryFn: async () => {
      const { data } = await axiosSecure.get('/api/passport-services?page=1&limit=1');
      return {
        total: data?.pagination?.totalItems || 0,
        services: data?.services || data?.data || []
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: manpowerData, isLoading: manpowerLoading } = useQuery({
    queryKey: ['manpowerServices', 1, '', 'all'],
    queryFn: async () => {
      const { data } = await axiosSecure.get('/api/manpower-services?page=1&limit=1');
      return {
        total: data?.pagination?.totalItems || 0,
        services: data?.services || data?.data || []
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: visaData, isLoading: visaLoading } = useQuery({
    queryKey: ['visaProcessingServices', 1, '', 'all'],
    queryFn: async () => {
      const { data } = await axiosSecure.get('/api/visa-processing-services?page=1&limit=1');
      return {
        total: data?.pagination?.totalItems || 0,
        services: data?.services || data?.data || []
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: otherServicesData, isLoading: otherServicesLoading } = useQuery({
    queryKey: ['otherServices', 1, '', 'all'],
    queryFn: async () => {
      const { data } = await axiosSecure.get('/api/other-services?page=1&limit=1');
      return {
        total: data?.pagination?.totalItems || 0,
        services: data?.services || data?.data || []
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  const isLoading = customersLoading || passportLoading || manpowerLoading || visaLoading || otherServicesLoading;

  // Calculate statistics
  const stats = useMemo(() => {
    const customers = customersData?.total || 0;
    const passportServices = passportData?.total || 0;
    const manpowerServices = manpowerData?.total || 0;
    const visaServices = visaData?.total || 0;
    const otherServices = otherServicesData?.total || 0;

    const totalServices = passportServices + manpowerServices + visaServices + otherServices;

    // Get status breakdowns from actual data
    const passportServicesList = passportData?.services || [];
    const manpowerServicesList = manpowerData?.services || [];
    const visaServicesList = visaData?.services || [];
    const otherServicesList = otherServicesData?.services || [];

    const pendingCount = [
      ...passportServicesList.filter(s => s.status === 'pending'),
      ...manpowerServicesList.filter(s => s.status === 'pending'),
      ...visaServicesList.filter(s => s.status === 'pending'),
      ...otherServicesList.filter(s => s.status === 'pending')
    ].length;

    const inProcessCount = [
      ...passportServicesList.filter(s => s.status === 'in_process' || s.status === 'processing'),
      ...manpowerServicesList.filter(s => s.status === 'in_process'),
      ...visaServicesList.filter(s => s.status === 'in_process' || s.status === 'processing'),
      ...otherServicesList.filter(s => s.status === 'in_process')
    ].length;

    const completedCount = [
      ...passportServicesList.filter(s => s.status === 'completed' || s.status === 'approved'),
      ...manpowerServicesList.filter(s => s.status === 'completed'),
      ...visaServicesList.filter(s => s.status === 'completed' || s.status === 'approved'),
      ...otherServicesList.filter(s => s.status === 'completed')
    ].length;

    return {
      customers,
      passportServices,
      manpowerServices,
      visaServices,
      otherServices,
      totalServices,
      pendingCount,
      inProcessCount,
      completedCount,
    };
  }, [customersData, passportData, manpowerData, visaData, otherServicesData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Helmet>
        <title>Additional Services Dashboard</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Additional Services Dashboard</h1>
              <p className="text-gray-600 mt-2">Overview of all additional services and activities</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Customers"
            value={isLoading ? '...' : stats.customers.toLocaleString()}
            icon={Users}
            sub="All registered customers"
            accent="blue"
            onClick={() => navigate('/additional-services/customer-list')}
          />
          <StatCard
            title="Total Services"
            value={isLoading ? '...' : stats.totalServices.toLocaleString()}
            icon={Package}
            sub="All service types combined"
            accent="green"
          />
          <StatCard
            title="Pending Services"
            value={isLoading ? '...' : stats.pendingCount.toLocaleString()}
            icon={Calendar}
            sub="Awaiting processing"
            accent="amber"
          />
          <StatCard
            title="Completed Services"
            value={isLoading ? '...' : stats.completedCount.toLocaleString()}
            icon={TrendingUp}
            sub="Successfully completed"
            accent="purple"
          />
        </div>

        {/* Service Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ServiceCard
            title="Customer Management"
            description="Manage customer information and relationships"
            icon={Users}
            color="blue"
            count={stats.customers}
            onClick={() => navigate('/additional-services/customer-list')}
          />
          <ServiceCard
            title="Passport Service"
            description="Passport applications and processing services"
            icon={FileCheck}
            color="green"
            count={stats.passportServices}
            onClick={() => navigate('/additional-services/passport-service')}
          />
          <ServiceCard
            title="Manpower Service"
            description="Recruitment and placement services"
            icon={Briefcase}
            color="purple"
            count={stats.manpowerServices}
            onClick={() => navigate('/additional-services/manpower-service')}
          />
          <ServiceCard
            title="Visa Processing"
            description="Visa applications and processing"
            icon={FileText}
            color="indigo"
            count={stats.visaServices}
            onClick={() => navigate('/additional-services/visa-processing')}
          />
          <ServiceCard
            title="Other Services"
            description="Miscellaneous additional services"
            icon={Package}
            color="orange"
            count={stats.otherServices}
            onClick={() => navigate('/additional-services/others-service')}
          />
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Service Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-800">Pending</span>
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-900">{stats.pendingCount}</p>
              <p className="text-xs text-yellow-700 mt-1">Services awaiting processing</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">In Process</span>
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.inProcessCount}</p>
              <p className="text-xs text-blue-700 mt-1">Currently being processed</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">Completed</span>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.completedCount}</p>
              <p className="text-xs text-green-700 mt-1">Successfully completed</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              onClick={() => navigate('/additional-services/customer/add')}
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
            >
              <div className="bg-blue-600 p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Add Customer</span>
            </button>
            <button
              onClick={() => navigate('/additional-services/passport-service/add')}
              className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group"
            >
              <div className="bg-green-600 p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                <FileCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Add Passport</span>
            </button>
            <button
              onClick={() => navigate('/additional-services/manpower-service/add')}
              className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors group"
            >
              <div className="bg-purple-600 p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Add Manpower</span>
            </button>
            <button
              onClick={() => navigate('/additional-services/visa-processing')}
              className="flex flex-col items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors group"
            >
              <div className="bg-indigo-600 p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Visa Processing</span>
            </button>
            <button
              onClick={() => navigate('/additional-services/others-service')}
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors group"
            >
              <div className="bg-orange-600 p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Other Services</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

