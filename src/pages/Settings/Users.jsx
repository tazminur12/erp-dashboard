import React from 'react';
import { Users } from 'lucide-react';

const UsersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ব্যবহারকারী পরিচালনা
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            সিস্টেমের ব্যবহারকারীদের পরিচালনা করুন
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          ব্যবহারকারী পরিচালনা পেজ - শীঘ্রই আসছে
        </p>
      </div>
    </div>
  );
};

export default UsersPage;
