import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Users, ArrowLeft, Pencil, UserCheck, Calendar, DollarSign, 
  TrendingUp, MapPin, Phone, Mail, CreditCard, FileText,
  Building, Globe, Award, Target, BarChart3, PieChart, Package,
  ChevronDown, ChevronUp, Eye, Edit, Trash2, Plus
} from 'lucide-react';
import { useAgent } from '../../../hooks/useAgentQueries';
import { useAgentPackageList, useDeleteAgentPackage } from '../../../hooks/UseAgentPacakageQueries';
import { useHajiList } from '../../../hooks/UseHajiQueries';
import { useUmrahList } from '../../../hooks/UseUmrahQuries';
import Swal from 'sweetalert2';

const AgentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for yearly packages section
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedYears, setExpandedYears] = useState(new Set([new Date().getFullYear()]));
  
  // React Query hook for fetching agent details
  const { data: agent, isLoading, error } = useAgent(id);
  

  // Fetch agent packages
  const { data: packagesData, isLoading: packagesLoading } = useAgentPackageList({
    agentId: id,
    limit: 1000
  });
  const packages = packagesData?.data || [];

  // Fetch all Hajj and Umrah customers to calculate counts
  const { data: hajiData } = useHajiList({ limit: 1000 });
  const { data: umrahData } = useUmrahList({ limit: 1000 });
  
  // Calculate customer counts from assigned packages
  const calculateCustomerCounts = () => {
    if (!packages.length) return { totalCustomers: 0, hajCustomers: 0, umrahCustomers: 0 };
    
    let totalCustomers = 0;
    let hajCustomers = 0;
    let umrahCustomers = 0;
    
    packages.forEach(pkg => {
      if (pkg.assignedCustomers && Array.isArray(pkg.assignedCustomers)) {
        totalCustomers += pkg.assignedCustomers.length;
        
        // Check if this is a Hajj or Umrah package
        const isHajj = pkg.packageType === 'Hajj' || pkg.packageType === 'হজ্জ' || 
                      pkg.customPackageType === 'Custom Hajj' || pkg.customPackageType === 'Hajj';
        const isUmrah = pkg.packageType === 'Umrah' || pkg.packageType === 'উমরাহ' || 
                       pkg.customPackageType === 'Custom Umrah' || pkg.customPackageType === 'Umrah';
        
        if (isHajj) {
          hajCustomers += pkg.assignedCustomers.length;
        } else if (isUmrah) {
          umrahCustomers += pkg.assignedCustomers.length;
        }
      }
    });
    
    return { totalCustomers, hajCustomers, umrahCustomers };
  };
  
  const customerCounts = calculateCustomerCounts();

  // Delete package mutation
  const deletePackageMutation = useDeleteAgentPackage();

  // Handle package deletion
  const handleDeletePackage = async (packageId, packageName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the package "${packageName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deletePackageMutation.mutateAsync(packageId);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };
  

  // Use real packages data
  const displayPackages = packages;

  // Helper functions
  const groupPackagesByYear = (packages) => {
    return packages.reduce((acc, pkg) => {
      const year = pkg.packageYear || new Date().getFullYear();
      if (!acc[year]) {
        acc[year] = { hajj: [], umrah: [] };
      }
      
      // Check both packageType and customPackageType for package categorization
      const isHajj = pkg.packageType === 'Hajj' || pkg.packageType === 'হজ্জ' || 
                     pkg.customPackageType === 'Custom Hajj' || pkg.customPackageType === 'Hajj';
      const isUmrah = pkg.packageType === 'Umrah' || pkg.packageType === 'উমরাহ' || 
                      pkg.customPackageType === 'Custom Umrah' || pkg.customPackageType === 'Umrah';
      
      if (isHajj) {
        acc[year].hajj.push(pkg);
      } else if (isUmrah) {
        acc[year].umrah.push(pkg);
      } else {
        // If no specific type, add to umrah by default
        acc[year].umrah.push(pkg);
      }
      
      return acc;
    }, {});
  };

  const toggleYearExpansion = (year) => {
    const newExpandedYears = new Set(expandedYears);
    if (newExpandedYears.has(year)) {
      newExpandedYears.delete(year);
    } else {
      newExpandedYears.add(year);
    }
    setExpandedYears(newExpandedYears);
  };

  const getAvailableYears = () => {
    const years = Object.keys(groupPackagesByYear(displayPackages))
      .map(year => parseInt(year))
      .sort((a, b) => b - a);
    return years;
  };

  const packagesByYear = groupPackagesByYear(displayPackages);
  const availableYears = getAvailableYears();

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">B2B Haj Agent Details</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive agent information & statistics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/hajj-umrah/agent/${id}/create-package`)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-sm"
          >
            <Package className="w-3.5 h-3.5" /> Create Package
          </button>
          <button
            type="button"
            onClick={() => navigate(`/hajj-umrah/agent/${id}/edit`)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-sm"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading agent details...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-2 text-sm">Failed to load agent details</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{error?.message || 'An error occurred'}</p>
          </div>
        </div>
      ) : !agent ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300">No agent found</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Customer Statistics Cards */}
          <div className="space-y-3">
            {/* First Row - 3 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-90">Total Customers</p>
                    <p className="text-lg font-semibold">{customerCounts.totalCustomers}</p>
                  </div>
                  <UserCheck className="w-6 h-6 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-90">Haj Customers</p>
                    <p className="text-lg font-semibold">{customerCounts.hajCustomers}</p>
                  </div>
                  <Building className="w-6 h-6 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-90">Umrah Customers</p>
                    <p className="text-lg font-semibold">{customerCounts.umrahCustomers}</p>
                  </div>
                  <Globe className="w-6 h-6 opacity-80" />
                </div>
              </div>
            </div>

            {/* Second Row - Due Amounts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-90">Total Due</p>
                    <p className="text-lg font-semibold">৳{(agent?.totalDue || 0).toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-6 h-6 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-90">Haj Due</p>
                    <p className="text-lg font-semibold">৳{(agent?.hajDue || 0).toLocaleString()}</p>
                  </div>
                  <Building className="w-6 h-6 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-90">Umrah Due</p>
                    <p className="text-lg font-semibold">৳{(agent?.umrahDue || 0).toLocaleString()}</p>
                  </div>
                  <Globe className="w-6 h-6 opacity-80" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <Building className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Trade Name</label>
                  <p className="text-5 font-bold text-gray-900 dark:text-white">{agent.tradeName || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Trade Location</label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {agent.tradeLocation || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Owner Name</label>
                  <p className="text-sm text-gray-900 dark:text-white">{agent.ownerName || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contact No</label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {agent.contactNo || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    agent.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Personal Details</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date of Birth</label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {agent.dob ? new Date(agent.dob).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">NID Number</label>
                  <p className="text-sm text-gray-900 dark:text-white">{agent.nid || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Passport Number</label>
                  <p className="text-sm text-gray-900 dark:text-white">{agent.passport || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {agent.email || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">License Number</label>
                  <p className="text-sm text-gray-900 dark:text-white">{agent.licenseNumber || '-'}</p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Financial Information</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Revenue</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ৳{agent.totalRevenue?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Commission Rate</label>
                  <p className="text-sm text-gray-900 dark:text-white">{agent.commissionRate || '0'}%</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pending Payments</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    ৳{agent.pendingPayments?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Bank Account</label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center">
                    <CreditCard className="w-3 h-3 mr-1" />
                    {agent.bankAccount || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Method</label>
                  <p className="text-sm text-gray-900 dark:text-white">{agent.paymentMethod || '-'}</p>
                </div>
              </div>
            </div>
          </div>


          {/* Additional Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Additional Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Created At</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {agent.updatedAt ? new Date(agent.updatedAt).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Last Activity</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {agent.lastActivity ? new Date(agent.lastActivity).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Agent ID</label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">{agent.agentId || id}</p>
              </div>
            </div>
          </div>

          {/* Yearly Packages Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Yearly Packages</h3>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <button
                  onClick={() => navigate(`/hajj-umrah/agent/${id}/create-package`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Package
                </button>
              </div>
            </div>

            {packagesLoading && packages.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Loading packages...</p>
                </div>
              </div>
            ) : availableYears.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">No packages found</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create your first package to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableYears.map(year => {
                  const yearPackages = packagesByYear[year];
                  const isExpanded = expandedYears.has(year);
                  const totalPackages = yearPackages.hajj.length + yearPackages.umrah.length;

                  return (
                    <div key={year} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => toggleYearExpansion(year)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{year}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {totalPackages} packages • {yearPackages.hajj.length} Hajj • {yearPackages.umrah.length} Umrah
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            year === selectedYear 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' 
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                          }`}>
                            {year === selectedYear ? 'Current' : 'View'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 space-y-4">
                          {/* Hajj Packages */}
                          {yearPackages.hajj.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-2 mb-3">
                                <Building className="w-4 h-4 text-green-600" />
                                <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Hajj Packages ({yearPackages.hajj.length})</h5>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {yearPackages.hajj.map((pkg) => (
                                  <div key={pkg._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-2">
                                      <h6 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                        {pkg.packageName}
                                      </h6>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        pkg.isActive 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                      }`}>
                                        {pkg.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                      <p>Total Price: ৳{pkg.totals?.subtotal?.toLocaleString() || pkg.totalPrice?.toLocaleString() || '0'}</p>
                                      <p>Status: {pkg.status || 'Draft'}</p>
                                    </div>
                                    <div className="flex items-center justify-end space-x-1 mt-3">
                                      <button
                                        onClick={() => navigate(`/hajj-umrah/agent-packages/${pkg._id}`)}
                                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                        title="View Details"
                                      >
                                        <Eye className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => navigate(`/hajj-umrah/agent-packages/${pkg._id}/edit`)}
                                        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                        title="Edit Package"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeletePackage(pkg._id, pkg.packageName)}
                                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                        title="Delete Package"
                                        disabled={deletePackageMutation.isPending}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Umrah Packages */}
                          {yearPackages.umrah.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-2 mb-3">
                                <Globe className="w-4 h-4 text-blue-600" />
                                <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Umrah Packages ({yearPackages.umrah.length})</h5>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {yearPackages.umrah.map((pkg) => (
                                  <div key={pkg._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-2">
                                      <h6 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                        {pkg.packageName}
                                      </h6>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        pkg.isActive 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                      }`}>
                                        {pkg.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                      <p>Total Price: ৳{pkg.totals?.subtotal?.toLocaleString() || pkg.totalPrice?.toLocaleString() || '0'}</p>
                                      <p>Status: {pkg.status || 'Draft'}</p>
                                    </div>
                                    <div className="flex items-center justify-end space-x-1 mt-3">
                                      <button
                                        onClick={() => navigate(`/hajj-umrah/agent-packages/${pkg._id}`)}
                                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                        title="View Details"
                                      >
                                        <Eye className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => navigate(`/hajj-umrah/agent-packages/${pkg._id}/edit`)}
                                        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                        title="Edit Package"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeletePackage(pkg._id, pkg.packageName)}
                                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                        title="Delete Package"
                                        disabled={deletePackageMutation.isPending}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* No packages message for this year */}
                          {totalPackages === 0 && (
                            <div className="text-center py-6">
                              <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 dark:text-gray-300">No packages for {year}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDetails;


