import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useUserRole from '../../hooks/useUserRole';
import { USER_ROLES, ROLE_DISPLAY_NAMES } from '../../hooks/useUserRole';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import Swal from 'sweetalert2';
import { Plus, Eye, EyeOff, Mail, Phone, User, MapPin } from 'lucide-react';
import { signUpWithEmail, signOutUser } from '../../firebase/auth';

const Users = () => {
  const navigate = useNavigate();
  const { userProfile, token, refreshToken, loading: authLoading } = useAuth();
  const userRole = useUserRole(userProfile?.role);
  

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.USER);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.USER,
    branchId: ''
  });
  const [createUserErrors, setCreateUserErrors] = useState({});
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  const axiosSecure = useAxiosSecure();

    // Fetch all users from backend
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axiosSecure.get('/users');
        
        // Check if response exists and has data
        if (!response) {
          throw new Error('No response received from server');
        }
        
        if (!response.data) {
          throw new Error('Response data is missing');
        }
        
        // Check if data is an array
        if (!Array.isArray(response.data)) {
          throw new Error('Expected array of users, got: ' + typeof response.data);
        }
        
        // Transform backend data to match frontend structure
        const transformedUsers = response.data.map(user => ({
          id: user._id || user.uniqueId,
          email: user.email,
          displayName: user.displayName || 'নাম উল্লেখ করা হয়নি',
          phone: user.phone || 'ফোন নম্বর নেই',
          branch: user.branchName || user.branchId || 'শাখা উল্লেখ করা হয়নি',
          role: user.role || USER_ROLES.USER,
          status: user.isActive ? 'active' : 'inactive',
          lastLogin: user.lastLogin || user.updatedAt || user.createdAt,
          createdAt: user.createdAt,
          isEmailVerified: user.isEmailVerified || true,
          uniqueId: user.uniqueId,
          _id: user._id
        }));
        
        setUsers(transformedUsers);
      } catch (error) {
        let errorMessage = 'ব্যবহারকারীদের তথ্য লোড করতে সমস্যা হয়েছে';
        
        if (error.message) {
          if (error.message.includes('No response received')) {
            errorMessage = 'সার্ভার থেকে কোন প্রতিক্রিয়া পাওয়া যায়নি';
          } else if (error.message.includes('Response data is missing')) {
            errorMessage = 'সার্ভার থেকে ডেটা পাওয়া যায়নি';
          } else if (error.message.includes('Expected array of users')) {
            errorMessage = 'সার্ভার থেকে ভুল ডেটা ফরম্যাট পাওয়া গেছে';
          } else if (error.message.includes('Authentication token not available')) {
            errorMessage = 'অনুমোদন টোকেন পাওয়া যায়নি';
          }
        }
        
        setError(errorMessage);
        
        // Show error with SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'লোডিং ত্রুটি!',
          text: errorMessage,
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Fetch branches for user creation
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const response = await axiosSecure.get('/api/branches/active');
        if (response.data?.success && response.data?.branches) {
          setBranches(response.data.branches);
        } else if (Array.isArray(response.data)) {
          setBranches(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error);
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if token is available
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      const response = await axiosSecure.get('/users');
      
      // Check if response exists and has data
      if (!response) {
        throw new Error('No response received from server');
      }
      
      if (!response.data) {
        throw new Error('Response data is missing');
      }
      
      // Check if data is an array
      if (!Array.isArray(response.data)) {
        throw new Error('Expected array of users, got: ' + typeof response.data);
      }
      
      // Transform backend data to match frontend structure
      const transformedUsers = response.data.map(user => ({
        id: user._id || user.uniqueId,
        email: user.email,
        displayName: user.displayName || 'নাম উল্লেখ করা হয়নি',
        phone: user.phone || 'ফোন নম্বর নেই',
        branch: user.branchName || user.branchId || 'শাখা উল্লেখ করা হয়নি',
        role: user.role || USER_ROLES.USER,
        status: user.isActive ? 'active' : 'inactive',
        lastLogin: user.lastLogin || user.updatedAt || user.createdAt,
        createdAt: user.createdAt,
        isEmailVerified: user.isEmailVerified || true,
        uniqueId: user.uniqueId,
        _id: user._id
      }));
      
      setUsers(transformedUsers);
    } catch (error) {
      let errorMessage = 'ব্যবহারকারীদের তথ্য লোড করতে সমস্যা হয়েছে';
      
      if (error.message) {
        if (error.message.includes('No response received')) {
          errorMessage = 'সার্ভার থেকে কোন প্রতিক্রিয়া পাওয়া যায়নি';
        } else if (error.message.includes('Response data is missing')) {
          errorMessage = 'সার্ভার থেকে ডেটা পাওয়া যায়নি';
        } else if (error.message.includes('Expected array of users')) {
          errorMessage = 'সার্ভার থেকে ভুল ডেটা ফরম্যাট পাওয়া গেছে';
        } else if (error.message.includes('Authentication token not available')) {
          errorMessage = 'অনুমোদন টোকেন পাওয়া যায়নি';
        }
      }
      
      setError(errorMessage);
      
      // Show error with SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'লোডিং ত্রুটি!',
        text: errorMessage,
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    Swal.fire({
      title: 'রিফ্রেশ',
      text: 'ব্যবহারকারীদের তথ্য আবার লোড করতে চান?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, রিফ্রেশ করুন',
      cancelButtonText: 'না, বাতিল করুন',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        fetchUsers();
      }
    });
  };

  const handleRoleChange = (user) => {
    // Show confirmation dialog first
    Swal.fire({
      title: 'রোল পরিবর্তন',
      text: `${user.displayName} এর রোল পরিবর্তন করতে চান?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, পরিবর্তন করুন',
      cancelButtonText: 'না, বাতিল করুন',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedUser(user);
        setSelectedRole(user.role);
        setShowModal(true);
      }
    });
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
    setCreateUserForm({
      displayName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: USER_ROLES.USER,
      branchId: ''
    });
    setCreateUserErrors({});
  };

  const validateCreateUserForm = () => {
    const errors = {};
    
    if (!createUserForm.displayName.trim()) {
      errors.displayName = 'নাম আবশ্যক';
    }
    
    if (!createUserForm.email.trim()) {
      errors.email = 'ইমেইল আবশ্যক';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createUserForm.email)) {
      errors.email = 'সঠিক ইমেইল ঠিকানা দিন';
    }
    
    if (!createUserForm.phone.trim()) {
      errors.phone = 'ফোন নম্বর আবশ্যক';
    } else if (!/^01[3-9]\d{8}$/.test(createUserForm.phone)) {
      errors.phone = 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)';
    }
    
    if (!createUserForm.password) {
      errors.password = 'পাসওয়ার্ড আবশ্যক';
    } else if (createUserForm.password.length < 6) {
      errors.password = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
    }
    
    if (createUserForm.password !== createUserForm.confirmPassword) {
      errors.confirmPassword = 'পাসওয়ার্ড মিলছে না';
    }
    
    if (!createUserForm.branchId) {
      errors.branchId = 'শাখা নির্বাচন করুন';
    }
    
    setCreateUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCreateUserForm()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে সব আবশ্যক ক্ষেত্র সঠিকভাবে পূরণ করুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }

    setIsCreatingUser(true);

    try {
      // 1. Create user in Firebase first (to get firebaseUid)
      const firebaseResult = await signUpWithEmail(
        createUserForm.email,
        createUserForm.password,
        createUserForm.displayName
      );

      if (!firebaseResult.success) {
        const errMsg = firebaseResult.error || 'Firebase এ ব্যবহারকারী তৈরি করতে ব্যর্থ';
        throw new Error(
          errMsg.includes('email-already-in-use') ? 'এই ইমেইল ইতিমধ্যে ব্যবহৃত হচ্ছে' :
          errMsg.includes('weak-password') ? 'পাসওয়ার্ড আরো শক্তিশালী করুন' : errMsg
        );
      }

      const firebaseUid = firebaseResult.user?.uid;
      if (!firebaseUid) {
        throw new Error('Firebase UID পাওয়া যায়নি');
      }

      // 2. Register in backend (email, displayName, branchId, firebaseUid required)
      const payload = {
        email: createUserForm.email.trim(),
        displayName: createUserForm.displayName.trim(),
        branchId: createUserForm.branchId,
        firebaseUid,
        role: createUserForm.role
      };
      if (createUserForm.phone?.trim()) {
        payload.phone = createUserForm.phone.trim();
      }

      const response = await axiosSecure.post('/users', payload);

      if (response.data?.success) {
        setShowCreateModal(false);
        setCreateUserForm({
          displayName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: USER_ROLES.USER,
          branchId: ''
        });
        
        await signOutUser();
        Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: 'ব্যবহারকারী তৈরি হয়েছে। নতুন অ্যাকাউন্ট দিয়ে লগইন হওয়ার কারণে আপনাকে আবার লগইন করতে হবে।',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        }).then(() => {
          navigate('/login', { state: { message: 'ব্যবহারকারী তৈরি হয়েছে। আবার লগইন করুন।' } });
        });
        return;
      } else {
        throw new Error(response.data?.message || 'ব্যবহারকারী তৈরি করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'ব্যবহারকারী তৈরি করতে সমস্যা হয়েছে';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: errorMessage,
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      
      // Make API call to update user role
      const response = await axiosSecure.patch(`/users/role/${selectedUser.uniqueId || selectedUser._id}`, {
        role: selectedRole
      });

      if (response.data.success) {
        // Update local state
        const updatedUsers = users.map(user => {
          if (user.id === selectedUser.id) {
            return { ...user, role: selectedRole };
          }
          return user;
        });

        setUsers(updatedUsers);
        setShowModal(false);
        setSelectedUser(null);
        
        // Show success message with SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'রোল আপডেট সফল!',
          text: `${selectedUser.displayName} এর রোল ${ROLE_DISPLAY_NAMES[selectedRole]} করা হয়েছে`,
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        throw new Error(response.data.message || 'রোল আপডেট করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      // Show error with SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: error.message || 'রোল আপডেট করতে সমস্যা হয়েছে',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case USER_ROLES.ADMIN:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case USER_ROLES.ACCOUNT:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case USER_ROLES.RESERVATION:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case USER_ROLES.USER:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'সক্রিয়';
      case 'inactive':
        return 'নিষ্ক্রিয়';
      case 'suspended':
        return 'স্থগিত';
      default:
        return status;
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Show loading spinner while authentication is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            অনুমোদন যাচাই করা হচ্ছে...
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            অনুগ্রহ করে অপেক্ষা করুন
          </p>
        </div>
      </div>
    );
  }

  // Show loading spinner while data is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            ব্যবহারকারীদের তথ্য লোড হচ্ছে...
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            অনুগ্রহ করে অপেক্ষা করুন
          </p>
        </div>
      </div>
    );
  }

  // Check if user has access to manage users
  const hasUserAccess = userRole?.canAccess?.manageUsers || 
                       userProfile?.role === USER_ROLES.SUPER_ADMIN || 
                       userProfile?.role === USER_ROLES.ADMIN;
  

  
  if (!hasUserAccess) {
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
          <div className="mt-4 text-sm text-gray-500">
            আপনার রোল: {userProfile?.role || 'অজানা'}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Debug: hasUserAccess = {hasUserAccess.toString()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ব্যবহারকারী ব্যবস্থাপনা
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              সমস্ত ব্যবহারকারীর তথ্য দেখুন এবং রোল পরিবর্তন করুন
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              আপনার রোল: <span className="font-medium text-blue-600 dark:text-blue-400">
                {ROLE_DISPLAY_NAMES[userProfile?.role] || 'অজানা'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleCreateUser}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              নতুন ব্যবহারকারী যোগ করুন
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center"
            >
              {loading ? (
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {loading ? 'লোড হচ্ছে...' : 'রিফ্রেশ'}
            </button>
          </div>
        </div>



        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট ব্যবহারকারী</p>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                )}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">সক্রিয় ব্যবহারকারী</p>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">অ্যাডমিন</p>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => u.role === USER_ROLES.ADMIN || u.role === USER_ROLES.SUPER_ADMIN).length}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">নতুন আজ</p>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => {
                      const today = new Date().toDateString();
                      const userDate = new Date(u.createdAt).toDateString();
                      return userDate === today;
                    }).length}
                  </p>
                )}
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
                placeholder="নাম, ইমেইল বা ফোন নম্বর দিয়ে অনুসন্ধান করুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                রোল
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                disabled={loading}
                className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="all">সব রোল</option>
                {Object.entries(ROLE_DISPLAY_NAMES).map(([role, displayName]) => (
                  <option key={role} value={role}>{displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                স্ট্যাটাস
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={loading}
                className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="active">সক্রিয়</option>
                <option value="inactive">নিষ্ক্রিয়</option>
                <option value="suspended">স্থগিত</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                ব্যবহারকারীদের তথ্য লোড হচ্ছে...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                অনুগ্রহ করে অপেক্ষা করুন
              </p>
            </div>
          ) : (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    রোল
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    শেষ লগইন
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    কর্ম
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentUsers.map((user) => (
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
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.phone}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.isEmailVerified ? 'ইমেইল যাচাইকৃত' : 'ইমেইল যাচাইকৃত নয়'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.branch}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {ROLE_DISPLAY_NAMES[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {getStatusText(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.lastLogin).toLocaleDateString('bn-BD')}
                      <br />
                      <span className="text-xs">
                        {new Date(user.lastLogin).toLocaleTimeString('bn-BD')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(userRole.isSuperAdmin || userProfile?.role === USER_ROLES.SUPER_ADMIN) && user.role !== USER_ROLES.SUPER_ADMIN && (
                        <button
                          onClick={() => handleRoleChange(user)}
                          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                        >
                          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          রোল পরিবর্তন
                        </button>
                      )}
                      {user.role === USER_ROLES.SUPER_ADMIN && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-full">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          পরিবর্তন করা যাবে না
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                দেখানো হচ্ছে {indexOfFirstUser + 1} থেকে {Math.min(indexOfLastUser, filteredUsers.length)} এর মধ্যে {filteredUsers.length} টি ব্যবহারকারী
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  পূর্ববর্তী
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      currentPage === number
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  পরবর্তী
                </button>
              </div>
            </div>
          </div>
        )}

                {/* Role Change Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm">
            <div className="relative top-20 mx-auto p-0 border-0 w-96 shadow-2xl rounded-2xl bg-white dark:bg-gray-800 overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white ml-3">
                      রোল পরিবর্তন
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedUser?.displayName?.charAt(0)}
                    </span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {selectedUser?.displayName}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    বর্তমান রোল: <span className="font-medium text-gray-700 dark:text-gray-300">{ROLE_DISPLAY_NAMES[selectedUser?.role]}</span>
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    নতুন রোল নির্বাচন করুন
                  </label>
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm font-medium appearance-none cursor-pointer transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                    >
                      {Object.entries(ROLE_DISPLAY_NAMES)
                        .filter(([role]) => role !== USER_ROLES.SUPER_ADMIN) // Super Admin role cannot be assigned
                        .map(([role, displayName]) => (
                          <option key={role} value={role} className="py-2">{displayName}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-200 hover:shadow-md"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={confirmRoleChange}
                    disabled={loading}
                    className={`flex-1 px-4 py-3 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center ${
                      loading 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        আপডেট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        রোল পরিবর্তন করুন
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm">
            <div className="relative top-10 mx-auto p-0 border-0 w-full max-w-2xl shadow-2xl rounded-2xl bg-white dark:bg-gray-800 overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white ml-3">
                      নতুন ব্যবহারকারী যোগ করুন
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreateUserSubmit} className="px-6 py-6">
                <div className="space-y-4">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createUserForm.displayName}
                      onChange={(e) => {
                        setCreateUserForm({ ...createUserForm, displayName: e.target.value });
                        if (createUserErrors.displayName) {
                          setCreateUserErrors({ ...createUserErrors, displayName: '' });
                        }
                      }}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        createUserErrors.displayName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="পূর্ণ নাম"
                    />
                    {createUserErrors.displayName && (
                      <p className="mt-1 text-sm text-red-600">{createUserErrors.displayName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      ইমেইল <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={createUserForm.email}
                      onChange={(e) => {
                        setCreateUserForm({ ...createUserForm, email: e.target.value });
                        if (createUserErrors.email) {
                          setCreateUserErrors({ ...createUserErrors, email: '' });
                        }
                      }}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        createUserErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="example@email.com"
                    />
                    {createUserErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{createUserErrors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      ফোন নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={createUserForm.phone}
                      onChange={(e) => {
                        setCreateUserForm({ ...createUserForm, phone: e.target.value });
                        if (createUserErrors.phone) {
                          setCreateUserErrors({ ...createUserErrors, phone: '' });
                        }
                      }}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        createUserErrors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="01712345678"
                    />
                    {createUserErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{createUserErrors.phone}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      পাসওয়ার্ড <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={createUserForm.password}
                        onChange={(e) => {
                          setCreateUserForm({ ...createUserForm, password: e.target.value });
                          if (createUserErrors.password) {
                            setCreateUserErrors({ ...createUserErrors, password: '' });
                          }
                        }}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-10 ${
                          createUserErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="পাসওয়ার্ড"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {createUserErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{createUserErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={createUserForm.confirmPassword}
                        onChange={(e) => {
                          setCreateUserForm({ ...createUserForm, confirmPassword: e.target.value });
                          if (createUserErrors.confirmPassword) {
                            setCreateUserErrors({ ...createUserErrors, confirmPassword: '' });
                          }
                        }}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-10 ${
                          createUserErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {createUserErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{createUserErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      রোল <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={createUserForm.role}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {Object.entries(ROLE_DISPLAY_NAMES)
                        .filter(([role]) => role !== USER_ROLES.SUPER_ADMIN)
                        .map(([role, displayName]) => (
                          <option key={role} value={role}>{displayName}</option>
                        ))}
                    </select>
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      শাখা <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={createUserForm.branchId}
                      onChange={(e) => {
                        setCreateUserForm({ ...createUserForm, branchId: e.target.value });
                        if (createUserErrors.branchId) {
                          setCreateUserErrors({ ...createUserErrors, branchId: '' });
                        }
                      }}
                      disabled={loadingBranches}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        createUserErrors.branchId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } ${loadingBranches ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">
                        {loadingBranches ? 'শাখা লোড হচ্ছে...' : 'শাখা নির্বাচন করুন'}
                      </option>
                      {branches.map((branch) => (
                        <option key={branch._id || branch.id} value={branch._id || branch.id}>
                          {branch.name || branch.branchName || branch.title}
                        </option>
                      ))}
                    </select>
                    {createUserErrors.branchId && (
                      <p className="mt-1 text-sm text-red-600">{createUserErrors.branchId}</p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-200"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingUser}
                    className={`flex-1 px-4 py-3 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center ${
                      isCreatingUser
                        ? 'bg-green-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg'
                    }`}
                  >
                    {isCreatingUser ? (
                      <>
                        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        তৈরি করা হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        ব্যবহারকারী তৈরি করুন
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
