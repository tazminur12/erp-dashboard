import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  User,
  Plane,
  DollarSign,
  FileCheck,
  Loader2,
  XCircle,
  AlertCircle,
  RefreshCcw,
  CheckCircle,
  Building2
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import useTicketCheckQueries from '../../../hooks/useTicketCheckQueries';
import { useEmployees } from '../../../hooks/useHRQueries';
import Modal from '../../../components/common/Modal';
import Swal from 'sweetalert2';

const TicketCheckDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { useTicketCheck, useUpdateTicketCheck, useDeleteTicketCheck } = useTicketCheckQueries();
  
  // Fetch ticket check data
  const { data: ticketCheck, isPending: isLoading, error, refetch, isRefetching } = useTicketCheck(id);
  const updateMutation = useUpdateTicketCheck();
  const deleteMutation = useDeleteTicketCheck();
  
  // Fetch employees for reservation officers
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({
    status: 'active',
    limit: 1000
  });
  const employees = employeesData?.employees || [];
  
  // Reservation officers list
  const reservationOfficers = useMemo(() => {
    if (!employees) return [];
    return employees.map(emp => ({
      id: emp._id || emp.id || emp.employeeId,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.fullName || emp.name || emp.employeeId || 'Unknown'
    }));
  }, [employees]);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `৳${(amount || 0).toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Handle edit
  const handleEdit = () => {
    if (!ticketCheck) return;
    
    setEditFormData({
      passengerName: ticketCheck.passengerName || '',
      travellingCountry: ticketCheck.travellingCountry || '',
      passportNo: ticketCheck.passportNo || '',
      contactNo: ticketCheck.contactNo || '',
      isWhatsAppSame: ticketCheck.isWhatsAppSame !== false,
      whatsAppNo: ticketCheck.whatsAppNo || '',
      airlineName: ticketCheck.airlineName || '',
      origin: ticketCheck.origin || '',
      destination: ticketCheck.destination || '',
      airlinesPnr: ticketCheck.airlinesPnr || '',
      issuingAgentName: ticketCheck.issuingAgentName || '',
      issuingAgentContact: ticketCheck.issuingAgentContact || '',
      agentEmail: ticketCheck.agentEmail || '',
      reservationOfficerId: ticketCheck.reservationOfficerId || '',
      serviceCharge: ticketCheck.serviceCharge || ''
    });
    setShowEditModal(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get reservation officer name
      const selectedOfficer = reservationOfficers.find(officer => officer.id === editFormData.reservationOfficerId);
      const reservationOfficerName = selectedOfficer ? selectedOfficer.name : '';
      
      // Calculate profit (service charge is completely profit)
      const serviceCharge = parseFloat(editFormData.serviceCharge) || 0;
      const profit = serviceCharge;
      
      await updateMutation.mutateAsync({
        id: ticketCheck._id || ticketCheck.id,
        data: {
          ...editFormData,
          reservationOfficerName,
          profit,
          serviceCharge
        }
      });
      setShowEditModal(false);
      refetch();
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই টিকেট চেক মুছে ফেলতে চান?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল'
    });

    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync(ticketCheck._id || ticketCheck.id);
        navigate('/air-ticketing/old/ticket-check');
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">টিকেট চেক তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !ticketCheck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center space-y-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">টিকেট চেক পাওয়া যায়নি</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {error?.message || 'অনুরোধ করা টিকেট চেক তথ্য পাওয়া যায়নি।'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            আবার চেষ্টা করুন
          </button>
          <button
            onClick={() => navigate('/air-ticketing/old/ticket-check')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            তালিকায় ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Helmet>
        <title>টিকেট চেক বিবরণ - {ticketCheck.passengerName || 'N/A'}</title>
        <meta name="description" content="Ticket check details" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/air-ticketing/old/ticket-check')}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    টিকেট চেক বিবরণ
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {ticketCheck.passengerName || 'N/A'} - {formatDate(ticketCheck.formDate)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
              >
                <RefreshCcw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                রিফ্রেশ
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                সম্পাদনা
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors disabled:opacity-60"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Passenger Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">যাত্রী তথ্য</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">যাত্রীর নাম</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{ticketCheck.passengerName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">পাসপোর্ট নম্বর</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {ticketCheck.passportNo || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">যোগাযোগ নম্বর</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {ticketCheck.contactNo || 'N/A'}
                  </p>
                </div>
                {ticketCheck.whatsAppNo && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">WhatsApp নম্বর</label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {ticketCheck.whatsAppNo}
                    </p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ভ্রমণের দেশ</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {ticketCheck.travellingCountry || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Flight Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plane className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">ফ্লাইট তথ্য</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">এয়ারলাইন্স</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <Plane className="w-3 h-3" />
                    {ticketCheck.airlineName || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">এয়ারলাইন্স PNR</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {ticketCheck.airlinesPnr || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">উৎপত্তি</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {ticketCheck.origin || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">গন্তব্য</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {ticketCheck.destination || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Agent Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">এজেন্ট তথ্য</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ইস্যুকারী এজেন্টের নাম</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{ticketCheck.issuingAgentName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">এজেন্ট যোগাযোগ</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {ticketCheck.issuingAgentContact || 'N/A'}
                  </p>
                </div>
                {ticketCheck.agentEmail && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">এজেন্ট ইমেইল</label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {ticketCheck.agentEmail}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">সারসংক্ষেপ</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">তারিখ</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(ticketCheck.formDate)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">রিজার্ভেশন অফিসার</label>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {ticketCheck.reservationOfficerName || 'N/A'}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">সার্ভিস চার্জ</label>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {formatCurrency(ticketCheck.serviceCharge || 0)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">লাভ (প্রফিট)</label>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {formatCurrency(ticketCheck.profit || ticketCheck.serviceCharge || 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">সার্ভিস চার্জ = সম্পূর্ণ লাভ</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">দ্রুত কার্যক্রম</h3>
              
              <div className="space-y-2">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  সম্পাদনা করুন
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  মুছে ফেলুন
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="টিকেট চেক সম্পাদনা করুন"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                যাত্রীর নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editFormData.passengerName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, passengerName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                পাসপোর্ট নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
                value={editFormData.passportNo || ''}
                onChange={(e) => setEditFormData({ ...editFormData, passportNo: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                যোগাযোগ নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
                value={editFormData.contactNo || ''}
                onChange={(e) => setEditFormData({ ...editFormData, contactNo: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                ভ্রমণের দেশ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editFormData.travellingCountry || ''}
                onChange={(e) => setEditFormData({ ...editFormData, travellingCountry: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                এয়ারলাইন্স <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editFormData.airlineName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, airlineName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                এয়ারলাইন্স PNR <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
                value={editFormData.airlinesPnr || ''}
                onChange={(e) => setEditFormData({ ...editFormData, airlinesPnr: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                উৎপত্তি <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
                value={editFormData.origin || ''}
                onChange={(e) => setEditFormData({ ...editFormData, origin: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                গন্তব্য <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
                value={editFormData.destination || ''}
                onChange={(e) => setEditFormData({ ...editFormData, destination: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                ইস্যুকারী এজেন্টের নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editFormData.issuingAgentName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, issuingAgentName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                এজেন্ট যোগাযোগ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
                value={editFormData.issuingAgentContact || ''}
                onChange={(e) => setEditFormData({ ...editFormData, issuingAgentContact: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                এজেন্ট ইমেইল
              </label>
              <input
                type="email"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                style={{ fontFamily: "'Google Sans', sans-serif" }}
                value={editFormData.agentEmail || ''}
                onChange={(e) => setEditFormData({ ...editFormData, agentEmail: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                রিজার্ভেশন অফিসার <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                value={editFormData.reservationOfficerId || ''}
                onChange={(e) => setEditFormData({ ...editFormData, reservationOfficerId: e.target.value })}
                disabled={isLoadingEmployees}
                required
              >
                <option value="" disabled>
                  {isLoadingEmployees ? 'লোড হচ্ছে...' : 'অফিসার নির্বাচন করুন'}
                </option>
                {reservationOfficers.length > 0 ? (
                  reservationOfficers.map(officer => (
                    <option key={officer.id} value={officer.id}>{officer.name}</option>
                  ))
                ) : !isLoadingEmployees ? (
                  <option value="" disabled>কোন কর্মচারী পাওয়া যায়নি</option>
                ) : null}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                সার্ভিস চার্জ (BDT) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>৳</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full pl-7 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-english"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
                  value={editFormData.serviceCharge || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, serviceCharge: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting || updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  সংরক্ষণ করা হচ্ছে...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  সংরক্ষণ করুন
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TicketCheckDetails;
