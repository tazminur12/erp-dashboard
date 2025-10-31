import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, Phone, User, MapPin, Calendar, CreditCard, FileText, ArrowLeft, Clock, Edit,
  DollarSign, TrendingUp, TrendingDown, Wallet, Receipt, AlertCircle, CheckCircle,
  Briefcase, Globe, Mail, Hash, Calendar as CalendarIcon, Star
} from 'lucide-react';
import { useVendor, useVendorFinancials, useVendorActivities } from '../../hooks/useVendorQueries';
import Swal from 'sweetalert2';



const VendorDetails = () => {
  const { id } = useParams();
  const [activities, setActivities] = useState([]);

  // Use React Query hooks to fetch vendor data
  const { 
    data: vendor, 
    isLoading: loading, 
    error: vendorError,
    refetch: refetchVendor 
  } = useVendor(id);

  const { 
    data: financialData, 
    isLoading: financialLoading,
    error: financialError 
  } = useVendorFinancials(id);

  const { 
    data: activitiesData, 
    isLoading: activitiesLoading,
    error: activitiesError 
  } = useVendorActivities(id);

  // Default financial data for fallback
  const defaultFinancialData = {
    totalOrders: 0,
    totalAmount: 0,
    outstandingAmount: 0,
    paidAmount: 0,
    lastPaymentDate: null,
    averageOrderValue: 0,
    creditLimit: 0,
    paymentTerms: 'Net 30',
    businessType: 'Unknown',
    registrationDate: null,
    rating: 0,
    status: 'Unknown'
  };

  // Use actual data merged with defaults to avoid undefined fields
  const financial = { ...defaultFinancialData, ...(financialData || {}) };

  // Icon mapping for activities
  const iconMap = {
    'Receipt': Receipt,
    'CheckCircle': CheckCircle,
    'Edit': Edit,
    'Clock': Clock,
    'AlertCircle': AlertCircle,
    'DollarSign': DollarSign
  };

  // Set activities from API or use mock data
  React.useEffect(() => {
    if (activitiesData && activitiesData.length > 0) {
      // Map string icon names to actual icon components
      const mappedActivities = activitiesData.map(activity => ({
        ...activity,
        icon: iconMap[activity.icon] || Clock
      }));
      setActivities(mappedActivities);
    } else {
      // Fallback mock activities
      const mockActivities = [
        {
          id: '1',
          type: 'order',
          title: 'No recent activity found',
          description: 'This vendor has no recent activities',
          time: new Date().toISOString(),
          icon: Clock
        }
      ];
      setActivities(mockActivities);
    }
  }, [activitiesData]);

  // Handle error state: avoid modal; rely on inline not-found UI
  React.useEffect(() => {
    if (vendorError) {
      console.error('Vendor fetch error:', vendorError);
    }
  }, [vendorError]);

  // Debug logging
  React.useEffect(() => {
    console.log('VendorDetails - ID:', id);

  }, [id, loading, vendor, vendorError, financialLoading, financialData, financialError, activitiesLoading, activitiesData, activitiesError]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <div className="text-gray-500 dark:text-gray-400">Loading vendor details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 dark:text-gray-400 text-lg">Vendor not found</div>
            <Link to="/vendors" className="text-purple-600 hover:text-purple-700 mt-2 inline-block">
              ← Back to Vendor List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{vendor.tradeName}</h1>
              <p className="text-purple-100 text-lg">{vendor.ownerName}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                  <Hash className="w-4 h-4" />
                  {vendor.vendorId}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                  <Star className="w-4 h-4" />
                  {financial.rating}/5
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {financial.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetchVendor()}
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-medium transition-colors"
            >
              <Clock className="w-4 h-4" />
              Refresh
            </button>
              <Link 
              to={`/vendors/${vendor._id || vendor.vendorId}/edit`} 
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Vendor
            </Link>
            <Link 
              to="/vendors" 
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </Link>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{financial.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{Number(financial.totalAmount ?? 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">৳{Number(financial.outstandingAmount ?? 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{Number(financial.averageOrderValue ?? 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Totals (live from vendor document) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid (Profile)</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">৳{Number(vendor?.totalPaid ?? 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Due (Profile)</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">৳{Number(vendor?.totalDue ?? 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{vendor?.updatedAt ? new Date(vendor.updatedAt).toLocaleString() : '—'}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900/20 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Vendor Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 mt-1 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Vendor ID</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.vendorId || vendor._id}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 mt-1 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Owner Name</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.ownerName}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Trade Location</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.tradeLocation}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-1 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Contact Number</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.contactNo}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-1 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.dob || 'Not provided'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 mt-1 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">NID Number</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.nid || 'Not provided'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-1 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Passport Number</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{vendor.passport || 'Not provided'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 mt-1 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Business Type</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{financial.businessType}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Paid Amount</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">৳{Number(financial.paidAmount ?? 0).toLocaleString()}</div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Outstanding Amount</div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">৳{Number(financial.outstandingAmount ?? 0).toLocaleString()}</div>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                {/* Optional breakdown if available on profile */}
                {(vendor?.hajDue !== undefined || vendor?.umrahDue !== undefined) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Hajj Due</div>
                      <div className="text-lg font-semibold text-red-600 dark:text-red-400">৳{Number(vendor?.hajDue ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Umrah Due</div>
                      <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">৳{Number(vendor?.umrahDue ?? 0).toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Credit Limit</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">৳{Number(financial.creditLimit ?? 0).toLocaleString()}</div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Payment Terms</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{financial.paymentTerms}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Last Payment Date</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {financial.lastPaymentDate ? new Date(financial.lastPaymentDate).toLocaleDateString() : 'No payments yet'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.description}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(activity.time).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;


