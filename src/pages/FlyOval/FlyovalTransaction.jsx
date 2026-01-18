import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign,
  ArrowRightLeft,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const FlyovalTransaction = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    transactionType: '', // 'credit', 'debit', 'transfer'
  });
  const [errors, setErrors] = useState({});

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.transactionType) {
        setErrors(prev => ({ ...prev, transactionType: 'লেনদেনের ধরন নির্বাচন করুন' }));
        return;
      }
      setErrors(prev => ({ ...prev, transactionType: '' }));
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const stepTitles = [
    'লেনদেনের ধরন',
    'বিস্তারিত তথ্য',
    'নিশ্চিতকরণ'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Helmet>
        <title>নতুন লেনদেন - FlyOval</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/flyoval')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            ফিরে যান
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            নতুন লেনদেন
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            FlyOval লেনদেন তৈরি করুন
          </p>
        </div>

        {/* Stepper */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    currentStep > index + 1
                      ? 'bg-green-500 text-white'
                      : currentStep === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {currentStep > index + 1 ? '✓' : index + 1}
                  </div>
                  <p className={`text-xs sm:text-sm mt-2 text-center ${
                    currentStep >= index + 1
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {title}
                  </p>
                </div>
                {index < stepTitles.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                    currentStep > index + 1
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Step 1: Transaction Type Selection */}
          {currentStep === 1 && (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  লেনদেনের ধরন নির্বাচন করুন
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  আপনি কোন ধরনের লেনদেন করতে চান?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-6xl mx-auto">
                {/* Credit (আয়) */}
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, transactionType: 'credit' }));
                    setErrors(prev => ({ ...prev, transactionType: '' }));
                  }}
                  className={`p-3 sm:p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.transactionType === 'credit'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-1">
                      ক্রেডিট (আয়)
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      কাস্টমার থেকে অর্থ গ্রহণ
                    </p>
                  </div>
                </button>

                {/* Debit (ব্যয়) */}
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, transactionType: 'debit' }));
                    setErrors(prev => ({ ...prev, transactionType: '' }));
                  }}
                  className={`p-3 sm:p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.transactionType === 'debit'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-red-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-1">
                      ডেবিট (ব্যয়)
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      ভেন্ডর বা সেবা প্রদানকারীকে অর্থ প্রদান
                    </p>
                  </div>
                </button>

                {/* Account to Account (ট্রান্সফার) */}
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, transactionType: 'transfer' }));
                    setErrors(prev => ({ ...prev, transactionType: '' }));
                  }}
                  className={`p-3 sm:p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.transactionType === 'transfer'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-1">
                      একাউন্ট টু একাউন্ট
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      এক একাউন্ট থেকে অন্য একাউন্টে ট্রান্সফার
                    </p>
                  </div>
                </button>
              </div>

              {errors.transactionType && (
                <p className="text-red-500 text-center mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  {errors.transactionType}
                </p>
              )}
            </div>
          )}

          {/* Step 2: Placeholder for future steps */}
          {currentStep === 2 && (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  বিস্তারিত তথ্য
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  নির্বাচিত লেনদেন: {formData.transactionType === 'credit' ? 'ক্রেডিট (আয়)' : formData.transactionType === 'debit' ? 'ডেবিট (ব্যয়)' : 'একাউন্ট টু একাউন্ট'}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Placeholder for confirmation */}
          {currentStep === 3 && (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  নিশ্চিতকরণ
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  আপনার লেনদেন নিশ্চিত করুন
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  onClick={handlePrev}
                  className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  পূর্ববর্তী
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < stepTitles.length && (
                <button
                  onClick={handleNext}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center ml-auto"
                >
                  পরবর্তী
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlyovalTransaction;
