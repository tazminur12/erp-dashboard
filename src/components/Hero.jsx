import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, BarChart3, Users, CheckCircle, Sparkles, Download } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const Hero = () => {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();

  const handleInstallClick = async () => {
    await promptInstall();
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800" />
      <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/20 -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">মডার্ন ERP প্ল্যাটফর্ম</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white transition-colors duration-200 pd-2">
              <span className="text-blue-600 dark:text-blue-400">BIN Rashid Group ERP</span> – আপনার ব্যবসার স্মার্ট নিয়ন্ত্রণ
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl transition-colors duration-200">
              অপারেশন সহজ করুন, রিয়েল-টাইম ড্যাশবোর্ডে সিদ্ধান্ত নিন এবং টিমকে সক্ষম করুন।
              সুরক্ষিত, দ্রুত এবং স্কেলেবল সিস্টেমের মাধ্যমে ব্যবসার উন্নতি আনুন।
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
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
                লগইন
              </Link>
              {isInstallable && !isInstalled && (
                <button
                  onClick={handleInstallClick}
                  className="px-8 py-3 border-2 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 font-semibold rounded-lg hover:bg-green-600 dark:hover:bg-green-400 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  App ইনস্টল করুন
                </button>
              )}
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">ডেটা নিরাপত্তা</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">রোল-বেসড অ্যাক্সেস ও সুরক্ষিত স্টোরেজ</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">রিয়েল-টাইম রিপোর্টিং</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ড্যাশবোর্ডে তাত্ক্ষণিক অন্তর্দৃষ্টি</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">টিম-ফ্রেন্ডলি</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">সহজ ব্যবহার ও সহযোগিতা</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
              <span>বাংলা ও ইংরেজি সাপোর্ট</span>
              <span className="mx-2">•</span>
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
              <span>ডার্ক মোড রেডি</span>
              <span className="mx-2">•</span>
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
              <span>মডিউলার আর্কিটেকচার</span>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">সিস্টেম স্ট্যাটাস</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Operational</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-gray-50 dark:bg-gray-700 p-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Modules</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">Multiple</p>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-700 p-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Performance</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">Optimized</p>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-700 p-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Support</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
