import React from 'react';
import { Settings } from 'lucide-react';

const System = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            সিস্টেম সেটিংস
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            সিস্টেমের সেটিংস পরিচালনা করুন
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          সিস্টেম সেটিংস পেজ - শীঘ্রই আসছে
        </p>
      </div>
    </div>
  );
};

export default System;
