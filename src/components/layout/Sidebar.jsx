import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { navigation } from '../../constants/nav';
import { useUIStore } from '../../store/ui';
import { signOutUser } from '../../firebase/auth';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, sidebarCollapsed, mobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (itemName) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const isParentActive = (item) => {
    if (item.href) return isActive(item.href);
    if (item.children) {
      return item.children.some(child => {
        // Check if child has href and is active
        if (child.href) return isActive(child.href);
        // Check if child has nested children and any of them are active
        if (child.children) {
          return child.children.some(grandChild => grandChild.href && isActive(grandChild.href));
        }
        return false;
      });
    }
    return false;
  };

  const handleLogout = async () => {
    try {
      const result = await signOutUser();
      if (result.success) {
        navigate('/login');
      } else {
        console.error('Logout failed:', result.error);
        // Still redirect to login even if logout fails
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if logout fails
      navigate('/login');
    }
  };

  const renderNavItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.name);
    const isItemActive = isParentActive(item);

    // Handle logout action
    if (item.action === 'logout') {
      return (
        <button
          key={item.name}
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <item.icon className="w-5 h-5" />
          {!sidebarCollapsed && <span>{item.name}</span>}
        </button>
      );
    }

    return (
      <div key={item.name}>
        {hasChildren ? (
          <div>
            <button
              onClick={() => toggleExpanded(item.name)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isItemActive
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </div>
              {!sidebarCollapsed && (
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`} 
                />
              )}
            </button>
            
            {isExpanded && !sidebarCollapsed && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => {
                  // Check if child has its own children (nested structure)
                  const hasGrandChildren = child.children && child.children.length > 0;
                  const isChildExpanded = expandedItems.has(child.name);
                  
                  if (hasGrandChildren) {
                    return (
                      <div key={child.name}>
                        <button
                          onClick={() => toggleExpanded(child.name)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                            isParentActive(child)
                              ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <child.icon className="w-4 h-4" />
                            <span>{child.name}</span>
                          </div>
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isChildExpanded ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>
                        
                        {isChildExpanded && (
                          <div className="ml-6 mt-1 space-y-1">
                            {child.children.map((grandChild) => (
                              <Link
                                key={grandChild.name}
                                to={grandChild.href}
                                className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                                  isActive(grandChild.href)
                                    ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                              >
                                <grandChild.icon className="w-4 h-4" />
                                <span>{grandChild.name}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    // Regular child without nested children
                    return (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                          isActive(child.href)
                            ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <child.icon className="w-4 h-4" />
                        <span>{child.name}</span>
                      </Link>
                    );
                  }
                })}
              </div>
            )}
          </div>
        ) : (
          <Link
            to={item.href}
            className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              isActive(item.href)
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {!sidebarCollapsed && <span>{item.name}</span>}
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out flex flex-col
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}>
        {/* Sidebar header - Fixed height */}
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ERP
              </span>
            )}
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={closeMobileSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation - Scrollable area */}
        <div className="flex-1 overflow-hidden">
          <nav className="h-full px-3 py-4 space-y-2 overflow-y-auto sidebar-scrollbar">
            {navigation.map((item) => renderNavItem(item))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
