import React from 'react';
import { FileText } from 'lucide-react';

const TicketInvoice = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            টিকিট ইনভয়েস
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            টিকিট ইনভয়েস দেখুন এবং প্রিন্ট করুন
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          টিকিট ইনভয়েস পেজ - শীঘ্রই আসছে
        </p>
      </div>
    </div>
  );
};

export default TicketInvoice;
