import React from 'react';
import { Shield } from 'lucide-react';

const Roles = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ভূমিকা ও অনুমতি
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ব্যবহারকারীদের ভূমিকা ও অনুমতি পরিচালনা করুন
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          ভূমিকা ও অনুমতি পেজ - শীঘ্রই আসছে
        </p>
      </div>
    </div>
  );
};

export default Roles;
