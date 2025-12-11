import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  User, 
  Search, 
  Sun, 
  Moon, 
  X,
  LogOut
} from 'lucide-react';
import { useUIStore } from '../../store/ui';
import { useTheme } from '../../contexts/ThemeContext';
import { signOutUser, getCurrentUser, onAuthStateChange } from '../../firebase/auth';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/UseAxiosSecure';

const TopBar = ({ pageTitle = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { toggleMobileSidebar } = useUIStore();
  const { isDark, toggleTheme } = useTheme();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid;

  useEffect(() => {
    // Check if user is logged in
    const checkAuthState = () => {
      const user = getCurrentUser();
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email);
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
      }
    };

    // Initial check
    checkAuthState();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email);
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
        // Redirect to login if user is not authenticated
        navigate('/login');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setIsLoggedIn(false);
      setUserEmail('');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    isError: notificationsError,
  } = useQuery({
    queryKey: ['notifications', currentUserId],
    enabled: !!currentUserId,
    queryFn: async () => {
      const response = await axiosSecure.get('/api/notifications', {
        params: {
          userId: currentUserId,
          limit: 20,
        },
      });

      if (response?.data?.success) {
        return response.data;
      }

      throw new Error(response?.data?.message || 'Failed to fetch notifications');
    },
    refetchOnWindowFocus: false,
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosSecure.patch('/api/notifications/read-all', {
        userId: currentUserId,
      });

      if (response?.data?.success) return response.data;
      throw new Error(response?.data?.message || 'Failed to mark all as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', currentUserId]);
    },
  });

  const markSingleReadMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axiosSecure.patch(`/api/notifications/${id}/read`);
      if (response?.data?.success) return response.data;
      throw new Error(response?.data?.message || 'Failed to mark as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', currentUserId]);
    },
  });

  const handleMarkAllRead = () => {
    if (!currentUserId || unreadCount === 0 || markAllReadMutation.isLoading) return;
    markAllReadMutation.mutate();
  };

  const handleMarkSingleRead = (id, isRead) => {
    if (!id || isRead || markSingleReadMutation.isLoading) return;
    markSingleReadMutation.mutate(id);
  };

  const renderNotificationTime = useMemo(() => {
    return (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleString();
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-30 w-full">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and page title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {pageTitle}
            </h1>
            {/* User Email Display in TopBar */}
            {isLoggedIn && userEmail && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {userEmail}
              </p>
            )}
          </div>
        </div>

        {/* Right side - Search, theme toggle, notifications, user */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </form>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <button
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
                      onClick={handleMarkAllRead}
                      disabled={unreadCount === 0 || markAllReadMutation.isLoading}
                    >
                      Mark all as read
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notificationsLoading && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
                    )}
                    {notificationsError && (
                      <p className="text-sm text-red-500">Failed to load notifications</p>
                    )}
                    {!notificationsLoading && notifications.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                    )}
                    {notifications.map((notification) => (
                      <button
                        key={notification._id}
                        type="button"
                        onClick={() => handleMarkSingleRead(notification._id, notification.isRead)}
                        className={`w-full text-left p-3 rounded-lg ${
                          notification.isRead 
                            ? 'bg-gray-50 dark:bg-gray-700'
                            : 'bg-blue-50 dark:bg-blue-900/20'
                        }`}
                      >
                        <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                          {notification.type || 'Info'}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {renderNotificationTime(notification.createdAt)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {isLoggedIn && userEmail ? userEmail.split('@')[0] : 'Admin User'}
              </span>
            </button>
            
            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-1">
                  {isLoggedIn && userEmail && (
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Logged in as:</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {userEmail}
                      </p>
                    </div>
                  )}
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Settings
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
