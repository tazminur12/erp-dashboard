import React, { useState } from 'react';
import { 
  CreditCard, 
  Save, 
  ArrowLeft,
  ArrowRight,
  User,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Tag,
  AlertCircle,
  Search,
  CheckCircle,
  Circle,
  Download,
  Mail,
  Banknote,
  CreditCard as CreditCardIcon,
  Smartphone,
  Receipt,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Swal from 'sweetalert2';

const NewTransaction = () => {
  const { isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Transaction Type
    transactionType: '',
    
    // Step 2: Customer Selection
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    
    // Step 3: Category
    category: '',
    
    // Step 4: Payment Method
    paymentMethod: '',
    paymentDetails: {
      bankName: '',
      accountNumber: '',
      chequeNumber: '',
      mobileProvider: '',
      transactionId: '',
      amount: '',
      reference: ''
    },
    
    // Step 5: Additional Info
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});

  // Mock customer data
  const customers = [
    { id: 1, name: 'আহমেদ হোসেন', phone: '+880 1712-345678', email: 'ahmed@example.com', type: 'হাজ্জ' },
    { id: 2, name: 'ফাতেমা বেগম', phone: '+880 1812-345679', email: 'fatema@example.com', type: 'ওমরাহ' },
    { id: 3, name: 'মোহাম্মদ আলী', phone: '+880 1912-345680', email: 'mohammad@example.com', type: 'এয়ার টিকেট' },
    { id: 4, name: 'আয়েশা খাতুন', phone: '+880 1612-345681', email: 'ayesha@example.com', type: 'ভিসা' },
    { id: 5, name: 'রহমান মিয়া', phone: '+880 1512-345682', email: 'rahman@example.com', type: 'হাজ্জ' },
    { id: 6, name: 'সাবরিনা আক্তার', phone: '+880 1412-345683', email: 'sabrina@example.com', type: 'ওমরাহ' }
  ];

  // Categories
  const categories = [
    { id: 'hajj', name: 'হাজ্জ & উমরাহ', icon: '🕋', description: 'হাজ্জ এবং উমরাহ প্যাকেজ' },
    { id: 'air-ticket', name: 'এয়ার টিকেট', icon: '✈️', description: 'বিমান টিকেট এবং ভ্রমণ' },
    { id: 'visa', name: 'ভিসা সার্ভিস', icon: '📋', description: 'ভিসা প্রক্রিয়াকরণ এবং সহায়তা' },
    { id: 'hotel', name: 'হোটেল বুকিং', icon: '🏨', description: 'হোটেল রিজার্ভেশন' },
    { id: 'insurance', name: 'ইনসুরেন্স', icon: '🛡️', description: 'ভ্রমণ এবং স্বাস্থ্য বীমা' },
    { id: 'other', name: 'অন্যান্য সেবা', icon: '🔧', description: 'অন্যান্য ভ্রমণ সেবা' }
  ];

  // Payment methods
  const paymentMethods = [
    { 
      id: 'bank', 
      name: 'ব্যাংক ট্রান্সফার', 
      icon: Banknote, 
      color: 'from-blue-500 to-blue-600',
      fields: ['bankName', 'accountNumber', 'reference']
    },
    { 
      id: 'cheque', 
      name: 'চেক', 
      icon: CreditCardIcon, 
      color: 'from-green-500 to-green-600',
      fields: ['chequeNumber', 'bankName', 'reference']
    },
    { 
      id: 'mobile-banking', 
      name: 'মোবাইল ব্যাংকিং', 
      icon: Smartphone, 
      color: 'from-purple-500 to-purple-600',
      fields: ['mobileProvider', 'transactionId', 'reference']
    }
  ];

  const steps = [
    { number: 1, title: 'লেনদেন টাইপ', description: 'ক্রেডিট বা ডেবিট নির্বাচন করুন' },
    { number: 2, title: 'কাস্টমার নির্বাচন', description: 'কাস্টমার সিলেক্ট করুন' },
    { number: 3, title: 'ক্যাটাগরি', description: 'সেবার ধরন নির্বাচন করুন' },
    { number: 4, title: 'পেমেন্ট মেথড', description: 'পেমেন্টের ধরন নির্বাচন করুন' },
    { number: 5, title: 'কনফার্মেশন', description: 'তথ্য যাচাই এবং সংরক্ষণ' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email
    }));
    setSearchTerm('');
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.transactionType) {
          newErrors.transactionType = 'লেনদেনের ধরন নির্বাচন করুন';
        }
        break;
      case 2:
        if (!formData.customerId) {
          newErrors.customerId = 'কাস্টমার নির্বাচন করুন';
        }
        break;
      case 3:
        if (!formData.category) {
          newErrors.category = 'ক্যাটাগরি নির্বাচন করুন';
        }
        break;
      case 4:
        if (!formData.paymentMethod) {
          newErrors.paymentMethod = 'পেমেন্ট মেথড নির্বাচন করুন';
        }
        if (!formData.paymentDetails.amount) {
          newErrors.amount = 'পরিমাণ লিখুন';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Swal.fire({
        title: 'সফল!',
        text: 'লেনদেন সফলভাবে সংরক্ষণ হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
        background: isDark ? '#1F2937' : '#F9FAFB',
        customClass: {
          title: 'text-green-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });

      // Generate and download PDF
      generatePDF();
      
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'লেনদেন সংরক্ষণ করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
    }
  };

  const generatePDF = () => {
    // Simulate PDF generation
    Swal.fire({
      title: 'PDF তৈরি হচ্ছে...',
      text: 'রিসিট ডাউনলোড হচ্ছে',
      icon: 'info',
      showConfirmButton: false,
      timer: 2000,
      background: isDark ? '#1F2937' : '#F9FAFB'
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPaymentMethod = paymentMethods.find(method => method.id === formData.paymentMethod);
  const selectedCategory = categories.find(cat => cat.id === formData.category);

  return (
    <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  নতুন লেনদেন
                </h1>
                <p className={`mt-2 text-lg transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Step-by-Step লেনদেন প্রক্রিয়া
                </p>
              </div>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <ArrowLeft className="w-4 h-4" />
              ফিরে যান
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className={`mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => goToStep(step.number)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    currentStep === step.number
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : currentStep > step.number
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  } ${currentStep >= step.number ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {currentStep > step.number ? <CheckCircle className="w-4 h-4" /> : step.number}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="font-semibold">{step.title}</div>
                    <div className="text-xs opacity-75">{step.description}</div>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className={`w-6 h-6 mx-2 transition-colors duration-300 ${
                    currentStep > step.number ? 'text-green-500' : 'text-gray-400'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          {/* Step 1: Transaction Type */}
          {currentStep === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  লেনদেনের ধরন নির্বাচন করুন
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  আপনি কোন ধরনের লেনদেন করতে চান?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, transactionType: 'credit' }));
                    setErrors(prev => ({ ...prev, transactionType: '' }));
                  }}
                  className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.transactionType === 'credit'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      ক্রেডিট (আয়)
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      কাস্টমার থেকে অর্থ গ্রহণ
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, transactionType: 'debit' }));
                    setErrors(prev => ({ ...prev, transactionType: '' }));
                  }}
                  className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.transactionType === 'debit'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-red-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      ডেবিট (ব্যয়)
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      ভেন্ডর বা সেবা প্রদানকারীকে অর্থ প্রদান
                    </p>
                  </div>
                </button>
              </div>

              {errors.transactionType && (
                <p className="text-red-500 text-center mt-4 flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {errors.transactionType}
                </p>
              )}
            </div>
          )}

          {/* Step 2: Customer Selection */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  কাস্টমার নির্বাচন করুন
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  লেনদেনের জন্য কাস্টমার সিলেক্ট করুন
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                {/* Search Bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="নাম, ফোন নম্বর বা ইমেইল দিয়ে খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Customer List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 hover:scale-102 ${
                        formData.customerId === customer.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {customer.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {customer.phone} • {customer.email}
                            </p>
                            <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full mt-1">
                              {customer.type}
                            </span>
                          </div>
                        </div>
                        {formData.customerId === customer.id && (
                          <CheckCircle className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {errors.customerId && (
                  <p className="text-red-500 text-center mt-4 flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {errors.customerId}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Category Selection */}
          {currentStep === 3 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  সেবার ক্যাটাগরি নির্বাচন করুন
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  আপনি কোন ধরনের সেবা প্রদান করছেন?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, category: category.id }));
                      setErrors(prev => ({ ...prev, category: '' }));
                    }}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      formData.category === category.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{category.icon}</div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {errors.category && (
                <p className="text-red-500 text-center mt-4 flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {errors.category}
                </p>
              )}
            </div>
          )}

          {/* Step 4: Payment Method */}
          {currentStep === 4 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  পেমেন্ট মেথড নির্বাচন করুন
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  পেমেন্টের ধরন এবং বিবরণ নির্বাচন করুন
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                {/* Payment Method Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, paymentMethod: method.id }));
                        setErrors(prev => ({ ...prev, paymentMethod: '' }));
                      }}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                        formData.paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-16 h-16 bg-gradient-to-r ${method.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                          <method.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {method.name}
                        </h3>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Payment Details Form */}
                {selectedPaymentMethod && (
                  <div className={`p-6 rounded-xl border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800`}>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <selectedPaymentMethod.icon className="w-5 h-5 text-blue-600" />
                      {selectedPaymentMethod.name} - বিবরণ
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Amount */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          পরিমাণ *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="paymentDetails.amount"
                            value={formData.paymentDetails.amount}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              isDark 
                                ? 'bg-white border-gray-300 text-gray-900' 
                                : 'border-gray-300'
                            } ${errors.amount ? 'border-red-500 focus:ring-red-500' : ''}`}
                          />
                        </div>
                        {errors.amount && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.amount}
                          </p>
                        )}
                      </div>

                      {/* Dynamic Fields based on Payment Method */}
                      {selectedPaymentMethod.fields.map((field) => (
                        <div key={field}>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {field === 'bankName' && 'ব্যাংকের নাম'}
                            {field === 'accountNumber' && 'অ্যাকাউন্ট নম্বর'}
                            {field === 'chequeNumber' && 'চেক নম্বর'}
                            {field === 'mobileProvider' && 'মোবাইল ব্যাংকিং প্রোভাইডার'}
                            {field === 'transactionId' && 'ট্রানজেকশন আইডি'}
                            {field === 'reference' && 'রেফারেন্স'}
                          </label>
                          <input
                            type="text"
                            name={`paymentDetails.${field}`}
                            value={formData.paymentDetails[field]}
                            onChange={handleInputChange}
                            placeholder={`${field === 'bankName' ? 'ব্যাংকের নাম' : 
                                         field === 'accountNumber' ? 'অ্যাকাউন্ট নম্বর' :
                                         field === 'chequeNumber' ? 'চেক নম্বর' :
                                         field === 'mobileProvider' ? 'প্রোভাইডার' :
                                         field === 'transactionId' ? 'ট্রানজেকশন আইডি' :
                                         'রেফারেন্স'} লিখুন...`}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              isDark 
                                ? 'bg-white border-gray-300 text-gray-900' 
                                : 'border-gray-300'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errors.paymentMethod && (
                  <p className="text-red-500 text-center mt-4 flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {errors.paymentMethod}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  তথ্য যাচাই এবং কনফার্মেশন
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  সব তথ্য সঠিক কিনা যাচাই করুন এবং কনফার্ম করুন
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                {/* Transaction Summary */}
                <div className={`p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 mb-6 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-600" />
                    লেনদেনের সারসংক্ষেপ
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">লেনদেনের ধরন:</span>
                        <span className={`font-semibold ${
                          formData.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formData.transactionType === 'credit' ? 'ক্রেডিট (আয়)' : 'ডেবিট (ব্যয়)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">কাস্টমার:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formData.customerName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">ক্যাটাগরি:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedCategory?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">পেমেন্ট মেথড:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedPaymentMethod?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">পরিমাণ:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ৳{formData.paymentDetails.amount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">তারিখ:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(formData.date).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    অতিরিক্ত নোট
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="লেনদেন সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Save className="w-5 h-5" />
                    লেনদেন সংরক্ষণ করুন
                  </button>
                  
                  <button
                    onClick={generatePDF}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    PDF ডাউনলোড করুন
                  </button>
                  
                  <button
                    onClick={() => {}} // Email functionality
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Mail className="w-5 h-5" />
                    ইমেইল পাঠান
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              currentStep === 1
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            আগের ধাপ
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep === 5}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              currentStep === 5
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            পরের ধাপ
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTransaction;
