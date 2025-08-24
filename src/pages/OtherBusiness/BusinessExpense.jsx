import React from 'react';
import { TrendingDown } from 'lucide-react';

const BusinessExpense = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
          <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ব্যবসার খরচ
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ব্যবসার খরচের তালিকা দেখুন
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          ব্যবসার খরচ পেজ - শীঘ্রই আসছে
        </p>
      </div>
    </div>
  );
};

export default BusinessExpense;
