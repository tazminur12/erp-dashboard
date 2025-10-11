import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  FileText, 
  List, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';

const VisaProcessingLayout = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  const visaMenuItems = [
    {
      id: 'overview',
      name: 'Overview',
      icon: FileText,
      href: '/visa-processing'
    },
    {
      id: 'saudi',
      name: 'Saudi Arabia',
      icon: User,
      children: [
        { name: 'Umrah Visa', href: '/visa-processing/saudi-umrah', icon: List },
        { name: 'Ziyarah Visa', href: '/visa-processing/saudi-ziyarah', icon: List },
        { name: 'Other Visas', href: '/visa-processing/saudi-other', icon: List }
      ]
    },
    {
      id: 'india',
      name: 'India',
      icon: User,
      children: [
        { name: 'Tourist Visa', href: '/visa-processing/indian-tourist', icon: List },
        { name: 'Medical Visa', href: '/visa-processing/indian-medical', icon: List },
        { name: 'Business Visa', href: '/visa-processing/indian-business', icon: List }
      ]
    },
    {
      id: 'malaysia',
      name: 'Malaysia',
      icon: User,
      children: [
        { name: 'Tourist Visa', href: '/visa-processing/malaysia-tourist', icon: List },
        { name: 'Other Visas', href: '/visa-processing/malaysia-other', icon: List }
      ]
    },
    {
      id: 'dubai',
      name: 'Dubai',
      icon: User,
      children: [
        { name: 'Tourist Visa', href: '/visa-processing/dubai-tourist', icon: List },
        { name: 'Business Visa', href: '/visa-processing/dubai-business', icon: List },
        { name: 'Other Visas', href: '/visa-processing/dubai-other', icon: List }
      ]
    },
    {
      id: 'qatar',
      name: 'Qatar',
      icon: User,
      children: [
        { name: 'Tourist Visa', href: '/visa-processing/qatar-tourist', icon: List },
        { name: 'Business Visa', href: '/visa-processing/qatar-business', icon: List },
        { name: 'Other Visas', href: '/visa-processing/qatar-other', icon: List }
      ]
    },
    {
      id: 'china',
      name: 'China',
      icon: User,
      children: [
        { name: 'Tourist Visa', href: '/visa-processing/china-tourist', icon: List },
        { name: 'Business Visa', href: '/visa-processing/china-business', icon: List },
        { name: 'Other Visas', href: '/visa-processing/china-other', icon: List }
      ]
    },
    {
      id: 'thailand',
      name: 'Thailand',
      icon: User,
      children: [
        { name: 'Tourist Visa', href: '/visa-processing/thailand-tourist', icon: List },
        { name: 'Business Visa', href: '/visa-processing/thailand-business', icon: List },
        { name: 'Medical Visa', href: '/visa-processing/thailand-medical', icon: List },
        { name: 'Other Visas', href: '/visa-processing/thailand-other', icon: List }
      ]
    },
    {
      id: 'create',
      name: 'Create New Visa',
      icon: Plus,
      href: '/visa-processing/create-new'
    }
  ];

  const isActive = (href) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const isParentActive = (item) => {
    if (item.href) return isActive(item.href);
    if (item.children) {
      return item.children.some(child => isActive(child.href));
    }
    return false;
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Visa Processing
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage all visa applications
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {visaMenuItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isItemActive = isParentActive(item);

              if (hasChildren) {
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {item.name}
                    </div>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                          isActive(child.href)
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <child.icon className="w-4 h-4" />
                        <span>{child.name}</span>
                      </Link>
                    ))}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default VisaProcessingLayout; 
