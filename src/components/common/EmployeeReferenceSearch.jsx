import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, Building, Loader2, X } from 'lucide-react';
import { useEmployeeSearch } from '../../hooks/useHRQueries';
import { useTheme } from '../../contexts/ThemeContext';

const EmployeeReferenceSearch = ({ 
  onSelect, 
  placeholder = "কর্মচারীর নাম লিখুন...", 
  buttonText = "খুঁজুন",
  showModal = false,
  onClose,
  selectedEmployee = null,
  disabled = false
}) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  // Use the employee search hook
  const { 
    data: searchResults = [], 
    isLoading: searchLoading, 
    error: searchError 
  } = useEmployeeSearch(searchTerm, showModal);

  // Handle search term changes
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchTerm]);

  // Handle employee selection
  const handleEmployeeSelect = (employee) => {
    onSelect(employee);
    setSearchTerm('');
    setShowResults(false);
    if (onClose) onClose();
  };

  // Clear selection
  const clearSelection = () => {
    onSelect(null);
    setSearchTerm('');
    setShowResults(false);
  };

  // Format employee name
  const getEmployeeName = (employee) => {
    if (employee.firstName && employee.lastName) {
      return `${employee.firstName} ${employee.lastName}`;
    }
    return employee.name || employee.employeeId || 'Unknown Employee';
  };

  // Format employee details
  const getEmployeeDetails = (employee) => {
    const details = [];
    if (employee.position) details.push(employee.position);
    if (employee.department) details.push(employee.department);
    if (employee.employeeId) details.push(`ID: ${employee.employeeId}`);
    return details.join(' • ');
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => setShowResults(!showResults)}
          disabled={disabled || searchTerm.trim().length < 2}
          className={`px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 ${
            isDark ? 'hover:bg-blue-600' : ''
          } ${disabled || searchTerm.trim().length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Employee Display */}
      {selectedEmployee && (
        <div className={`mt-2 p-3 rounded-lg border ${
          isDark 
            ? 'bg-green-900/20 border-green-600' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                isDark ? 'bg-green-800' : 'bg-green-100'
              }`}>
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {getEmployeeName(selectedEmployee)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {getEmployeeDetails(selectedEmployee)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {showResults && searchTerm.trim().length >= 2 && (
        <div className={`absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto`}>
          {searchLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">খুঁজছি...</span>
            </div>
          ) : searchError ? (
            <div className="p-4 text-center text-red-600 dark:text-red-400">
              <p>খুঁজতে সমস্যা হয়েছে। আবার চেষ্টা করুন।</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-1">
              {searchResults.map((employee) => (
                <div
                  key={employee.id || employee.employeeId}
                  onClick={() => handleEmployeeSelect(employee)}
                  className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      isDark ? 'bg-blue-800' : 'bg-blue-100'
                    }`}>
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {getEmployeeName(employee)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {getEmployeeDetails(employee)}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        {employee.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {employee.phone}
                            </span>
                          </div>
                        )}
                        {employee.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {employee.email}
                            </span>
                          </div>
                        )}
                        {employee.department && (
                          <div className="flex items-center space-x-1">
                            <Building className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {employee.department}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p>কোন কর্মচারী পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close results when clicking outside */}
      {showResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default EmployeeReferenceSearch;
