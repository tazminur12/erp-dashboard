import React from 'react';
import { Receipt } from 'lucide-react';

const ReissueRefund = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
          <Receipt className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            টিকিট পুনরায় ইস্যু/রিফান্ড
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            টিকিট পুনরায় ইস্যু বা রিফান্ড করুন
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          টিকিট পুনরায় ইস্যু/রিফান্ড পেজ - শীঘ্রই আসছে
        </p>
      </div>
    </div>
  );
};

export default ReissueRefund;
