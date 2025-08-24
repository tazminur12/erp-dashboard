import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="py-20 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
            <span className="text-blue-600 dark:text-blue-400">আমার কোম্পানি</span>-এ স্বাগতম
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto transition-colors duration-200">
            আপনার ব্যবসার জন্য বিশ্বস্ত অংশীদার। আমাদের উদ্ভাবনী প্ল্যাটফর্মের মাধ্যমে 
            অপারেশন সহজ করুন, উৎপাদনশীলতা বাড়ান এবং টেকসই বৃদ্ধি অর্জন করুন।
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/signup"
              className="px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              শুরু করুন
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-600 dark:hover:bg-blue-400 hover:text-white transition-all duration-200"
            >
              আরও জানুন
            </Link>
          </div>

          
        
        </div>
      </div>
    </section>
  );
};

export default Hero;
