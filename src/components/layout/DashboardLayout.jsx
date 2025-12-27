import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import InstallPrompt from '../InstallPrompt';

const DashboardLayout = () => {
  const location = useLocation();
  
  // Get page title from current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/sales-invoice')) return 'Sales & Invoice';
    if (path.startsWith('/transactions')) return 'Transactions';
    if (path.startsWith('/vendors')) return 'Vendors';
    if (path.startsWith('/hajj-umrah')) return 'Hajj & Umrah';
    if (path.startsWith('/air-ticketing')) return 'Air Ticketing';
    if (path.startsWith('/personal')) return 'Personal';
    if (path.startsWith('/other-business')) return 'Other Business';
    if (path.startsWith('/office-management')) return 'Office Management';
    if (path.startsWith('/money-exchange')) return 'Money Exchange';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/profile')) return 'Profile';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area - positioned to the right of sidebar */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Top bar */}
        <TopBar pageTitle={getPageTitle()} />
        
        {/* Page content */}
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
      <InstallPrompt />
    </div>
  );
};

export default DashboardLayout;
