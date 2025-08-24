import React from 'react';
import { Database } from 'lucide-react';

const BackupRestore = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
          <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ব্যাকআপ ও পুনরুদ্ধার
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            সিস্টেমের ব্যাকআপ ও পুনরুদ্ধার করুন
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          ব্যাকআপ ও পুনরুদ্ধার পেজ - শীঘ্রই আসছে
        </p>
      </div>
    </div>
  );
};

export default BackupRestore;
