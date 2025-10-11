import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useUserRole from '../../hooks/useUserRole';
import { USER_ROLES, ROLE_DISPLAY_NAMES } from '../../hooks/useUserRole';

const UserApprovals = () => {
  const { userProfile } = useAuth();
  const userRole = useUserRole(userProfile?.role);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.USER);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockPendingUsers = [
      {
        id: 1,
        email: 'user1@example.com',
        displayName: 'আহমেদ হাসান',
        phone: '+880 1712345678',
        branch: 'ঢাকা শাখা',
        registrationDate: '2024-01-15',
        status: 'pending',
        requestedRole: USER_ROLES.USER,
        notes: 'নতুন কর্মচারী'
      },
      {
        id: 2,
        email: 'user2@example.com',
        displayName: 'ফাতেমা বেগম',
        phone: '+880 1812345678',
        branch: 'চট্টগ্রাম শাখা',
        registrationDate: '2024-01-14',
        status: 'pending',
        requestedRole: USER_ROLES.ACCOUNT,
        notes: 'অ্যাকাউন্ট বিভাগে কাজ করবে'
      },
      {
        id: 3,
        email: 'user3@example.com',
        displayName: 'রহমান আলী',
        phone: '+880 1912345678',
        branch: 'সিলেট শাখা',
        registrationDate: '2024-01-13',
        status: 'pending',
        requestedRole: USER_ROLES.RESERVATION,
        notes: 'রিজার্ভেশন বিভাগে অভিজ্ঞ'
      }
    ];
    
    setPendingUsers(mockPendingUsers);
    setLoading(false);
  }, []);

  const handleApprove = (user) => {
    setSelectedUser(user);
    setApprovalAction('approve');
    setShowModal(true);
  };

  const handleReject = (user) => {
    setSelectedUser(user);
    setApprovalAction('reject');
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      // Here you would make an API call to update user status
      const updatedUsers = pendingUsers.map(user => {
        if (user.id === selectedUser.id) {
          if (approvalAction === 'approve') {
            return { ...user, status: 'approved', approvedRole: selectedRole };
          } else {
            return { ...user, status: 'rejected' };
          }
        }
        return user;
      });

      setPendingUsers(updatedUsers);
      setShowModal(false);
      setSelectedUser(null);
      
      // Show success message
      alert(approvalAction === 'approve' ? 'ব্যবহারকারী অনুমোদিত হয়েছে' : 'ব্যবহারকারী প্রত্যাখ্যান করা হয়েছে');
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন।');
    }
  };

  const filteredUsers = pendingUsers.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'অপেক্ষমান';
      case 'approved':
        return 'অনুমোদিত';
      case 'rejected':
        return 'প্রত্যাখ্যান';
      default:
        return status;
    }
  };

  if (!userRole.canAccess.manageUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            অ্যাক্সেস অনুমোদিত নয়
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            এই পৃষ্ঠায় প্রবেশ করার অনুমতি নেই
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ব্যবহারকারী অনুমোদন ব্যবস্থাপনা
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            নতুন ব্যবহারকারীদের অ্যাকাউন্ট অনুমোদন এবং প্রত্যাখ্যান করুন
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট অপেক্ষমান</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingUsers.filter(u => u.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">অনুমোদিত</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingUsers.filter(u => u.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">প্রত্যাখ্যান</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingUsers.filter(u => u.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট শাখা</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(pendingUsers.map(u => u.branch)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                অনুসন্ধান
              </label>
              <input
                type="text"
                placeholder="নাম বা ইমেইল দিয়ে অনুসন্ধান করুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                স্ট্যাটাস
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="pending">অপেক্ষমান</option>
                <option value="approved">অনুমোদিত</option>
                <option value="rejected">প্রত্যাখ্যান</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ব্যবহারকারী
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    যোগাযোগ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    শাখা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                    অনুরোধকৃত রোল
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    তারিখ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    কর্ম
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {user.displayName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.displayName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.branch}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {ROLE_DISPLAY_NAMES[user.requestedRole]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {getStatusText(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.registrationDate).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(user)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            অনুমোদন
                          </button>
                          <button
                            onClick={() => handleReject(user)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            প্রত্যাখ্যান
                          </button>
                        </div>
                      )}
                      {user.status === 'approved' && (
                        <span className="text-green-600 dark:text-green-400">
                          অনুমোদিত হয়েছে
                        </span>
                      )}
                      {user.status === 'rejected' && (
                        <span className="text-red-600 dark:text-red-400">
                          প্রত্যাখ্যান করা হয়েছে
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approval Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
                  {approvalAction === 'approve' ? (
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                  {approvalAction === 'approve' ? 'ব্যবহারকারী অনুমোদন' : 'ব্যবহারকারী প্রত্যাখ্যান'}
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {approvalAction === 'approve' 
                      ? `আপনি কি ${selectedUser?.displayName} কে অনুমোদন করতে চান?`
                      : `আপনি কি ${selectedUser?.displayName} কে প্রত্যাখ্যান করতে চান?`
                    }
                  </p>
                  
                  {approvalAction === 'approve' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        রোল নির্বাচন করুন
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        {Object.entries(ROLE_DISPLAY_NAMES).map(([role, displayName]) => (
                          <option key={role} value={role}>{displayName}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="items-center px-4 py-3">
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={confirmAction}
                      className={`px-4 py-2 text-white font-medium rounded-lg ${
                        approvalAction === 'approve' 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {approvalAction === 'approve' ? 'অনুমোদন করুন' : 'প্রত্যাখ্যান করুন'}
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserApprovals;
