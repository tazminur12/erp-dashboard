import React from 'react';
import { Zap } from 'lucide-react';

const Utilities = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ইউটিলিটি
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            অফিসের ইউটিলিটি খরচ দেখুন
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          ইউটিলিটি পেজ - শীঘ্রই আসছে
        </p>
      </div>
    </div>
  );
};

export default Utilities;
