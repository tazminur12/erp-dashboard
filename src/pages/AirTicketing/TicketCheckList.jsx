import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Plane,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  Loader2
} from 'lucide-react';
import useTicketCheckQueries from '../../hooks/useTicketCheckQueries';
import Swal from 'sweetalert2';

const TicketCheckList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'completed', 'pending', 'cancelled'
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch ticket checks
  const { useTicketChecks, useDeleteTicketCheck } = useTicketCheckQueries();
  const { data, isLoading, refetch } = useTicketChecks({
    page,
    limit,
    q: searchTerm
  });

  const deleteMutation = useDeleteTicketCheck();

  // Get data from API
  const ticketChecks = data?.ticketChecks || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0, limit: 20 };

  // Calculate stats
  const stats = useMemo(() => {
    const totalChecks = pagination.total || ticketChecks.length;
    // Note: Status tracking will be added later when backend supports it
    return [
      { label: 'মোট চেক', value: totalChecks, color: 'blue', icon: FileCheck },
      { label: 'সম্পন্ন', value: '0', color: 'green', icon: CheckCircle },
      { label: 'অপেক্ষমাণ', value: '0', color: 'yellow', icon: Clock },
      { label: 'এই মাসে', value: totalChecks, color: 'purple', icon: Calendar }
    ];
  }, [ticketChecks, pagination.total]);

  const handleDelete = async (id) => {
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
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <>
      <Helmet>
        <title>টিকেট চেক - Bin Rashid ERP</title>
      </Helmet>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">টিকেট চেক</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  সকল টিকেট চেক রিকোয়েস্ট ব্যবস্থাপনা এবং ট্র্যাক করুন
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/air-ticketing/old/ticket-check/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন চেক যোগ করুন
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="যাত্রীর নাম, পাসপোর্ট নম্বর, বুকিং রেফ দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              disabled={isLoading}
            >
              <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="w-4 h-4" />
              আরও ফিল্টার
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4" />
              এক্সপোর্ট
            </button>
          </div>
        </div>

        {/* Ticket Checks List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">টিকেট চেক লোড হচ্ছে...</span>
            </div>
          ) : ticketChecks.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">কোন টিকেট চেক পাওয়া যায়নি</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'আপনার অনুসন্ধানের সাথে কোন ফলাফল মিলেনি।' : 'নতুন টিকেট চেক তৈরি করে শুরু করুন।'}
              </p>
              <button
                onClick={() => navigate('/air-ticketing/old/ticket-check/new')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                নতুন চেক যোগ করুন
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">তারিখ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">যাত্রী</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ভ্রমণের বিবরণ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">এয়ারলাইন ও রুট</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">যোগাযোগ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">অফিসার</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">কার্যক্রম</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {ticketChecks.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(ticket.travelDate)}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {ticket.passengerName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {ticket.passportNo}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {ticket.travellingCountry}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                              <Plane className="w-3 h-3" />
                              {ticket.airlineName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{ticket.route}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {ticket.bookingRef}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <Phone className="w-3 h-3" />
                              <span className="text-xs">{ticket.contactNo}</span>
                            </div>
                            {ticket.email && (
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Mail className="w-3 h-3" />
                                <span className="text-xs truncate max-w-[150px]">{ticket.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {ticket.reservationOfficerName || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => navigate(`/air-ticketing/old/ticket-check/${ticket._id}`)}
                              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(ticket._id)}
                              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Delete"
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    দেখানো হচ্ছে <span className="font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{((pagination.page - 1) * pagination.limit) + 1}</span> থেকে <span className="font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{Math.min(pagination.page * pagination.limit, pagination.total)}</span>, মোট <span className="font-english" style={{ fontFamily: "'Google Sans', sans-serif" }}>{pagination.total}</span> টি
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      পূর্ববর্তী
                    </button>
                    {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 rounded text-sm font-english ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          style={{ fontFamily: "'Google Sans', sans-serif" }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button 
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      পরবর্তী
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </>
  );
};

export default TicketCheckList;
