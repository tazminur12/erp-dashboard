import React from 'react';

const CardWidget = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  trendType = 'up', 
  className = '',
  onClick 
}) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md cursor-pointer h-full ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${
                trendType === 'up' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {trendType === 'up' ? '↗' : '↘'} {trendValue}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                {trend}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardWidget;
