import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Save, 
  ArrowLeft,
  User,
  DollarSign,
  AlertCircle,
  Search,
  CheckCircle,
  Download,
  Mail,
  CreditCard,
  Calendar,
  Users,
  Building,
  Globe,
  Package,
  MapPin,
  Phone,
  FileText,
  Loader2,
  Plus,
  Minus,
  Calculator,
  Receipt,
  Banknote,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import useAxiosSecure from '../../../hooks/UseAxiosSecure';
import Swal from 'sweetalert2';

const B2BSellPage = () => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAgentSearch, setShowAgentSearch] = useState(false);
  const [showPackageSearch, setShowPackageSearch] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Agent Selection
    agentId: '',
    agentName: '',
    agentTradeName: '',
    agentContact: '',
    agentLocation: '',
    
    // Step 2: Package Selection
    packageId: '',
    packageName: '',
    packageType: '', // 'haj' or 'umrah'
    packagePrice: 0,
    packageDuration: '',
    packageDescription: '',
    packageIncludes: [],
    
    // Step 3: Customer Details
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerNID: '',
    customerPassport: '',
    customerAddress: '',
    customerEmergencyContact: '',
    customerRelation: '',
    
    // Step 4: Sell Details
    sellDate: new Date().toISOString().split('T')[0],
    sellPrice: 0,
    discountAmount: 0,
    finalPrice: 0,
    commissionRate: 0,
    commissionAmount: 0,
    paymentMethod: '',
    paymentStatus: 'pending',
    notes: '',
    
    // Step 5: Payment Details
    paymentDetails: {
      paidAmount: 0,
      remainingAmount: 0,
      paymentSchedule: [],
      bankDetails: {
        bankName: '',
        accountNumber: '',
        transactionId: ''
      }
    }
  });

  // Mock data for agents, packages, and customers
  const [agents] = useState([
    {
      id: '1',
      tradeName: 'Green Line Travels',
      ownerName: 'Shahadat Hossain',
      contact: '+8801555667788',
      location: 'Sylhet, Bangladesh',
      commissionRate: 8
    },
    {
      id: '2', 
      tradeName: 'Nazmul Enterprise',
      ownerName: 'Nazmul Hasan',
      contact: '+8801911334455',
      location: 'Chattogram, Bangladesh',
      commissionRate: 10
    }
  ]);

  const [packages] = useState([
    {
      id: '1',
      name: 'Premium Haj Package 2024',
      type: 'haj',
      price: 450000,
      duration: '45 days',
      description: 'Complete Haj package with premium accommodation',
      includes: ['Visa', 'Flight', 'Accommodation', 'Food', 'Transportation']
    },
    {
      id: '2',
      name: 'Economy Umrah Package',
      type: 'umrah',
      price: 85000,
      duration: '15 days',
      description: 'Affordable Umrah package with good accommodation',
      includes: ['Visa', 'Flight', 'Accommodation', 'Transportation']
    }
  ]);

  const [customers] = useState([
    {
      id: '1',
      name: 'Abdul Rahman',
      phone: '+8801711223344',
      email: 'abdul@email.com',
      nid: '199045623411',
      passport: 'EC7654321',
      address: 'Dhaka, Bangladesh'
    }
  ]);

  // Calculate derived values
  useEffect(() => {
    const finalPrice = formData.sellPrice - formData.discountAmount;
    const commissionAmount = (finalPrice * formData.commissionRate) / 100;
    
    setFormData(prev => ({
      ...prev,
      finalPrice,
      commissionAmount,
      paymentDetails: {
        ...prev.paymentDetails,
        remainingAmount: finalPrice - prev.paymentDetails.paidAmount
      }
    }));
  }, [formData.sellPrice, formData.discountAmount, formData.commissionRate, formData.paymentDetails.paidAmount]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField, childField, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const handleAgentSelect = (agent) => {
    setFormData(prev => ({
      ...prev,
      agentId: agent.id,
      agentName: agent.ownerName,
      agentTradeName: agent.tradeName,
      agentContact: agent.contact,
      agentLocation: agent.location,
      commissionRate: agent.commissionRate
    }));
    setShowAgentSearch(false);
  };

  const handlePackageSelect = (pkg) => {
    setFormData(prev => ({
      ...prev,
      packageId: pkg.id,
      packageName: pkg.name,
      packageType: pkg.type,
      packagePrice: pkg.price,
      sellPrice: pkg.price,
      packageDuration: pkg.duration,
      packageDescription: pkg.description,
      packageIncludes: pkg.includes
    }));
    setShowPackageSearch(false);
  };

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerNID: customer.nid,
      customerPassport: customer.passport,
      customerAddress: customer.address
    }));
    setShowCustomerSearch(false);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Swal.fire({
        title: 'সফল!',
        text: 'B2B সেল সফলভাবে সম্পন্ন হয়েছে!',
        icon: 'success',
        confirmButtonColor: '#059669',
        confirmButtonText: 'ঠিক আছে'
      }).then(() => {
        navigate('/hajj-umrah/b2b-sell-list');
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'সেল সম্পন্ন করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে'
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'এজেন্ট নির্বাচন', description: 'B2B এজেন্ট নির্বাচন করুন' },
    { id: 2, title: 'প্যাকেজ নির্বাচন', description: 'হজ্জ/উমরাহ প্যাকেজ নির্বাচন করুন' },
    { id: 3, title: 'গ্রাহক তথ্য', description: 'গ্রাহকের তথ্য দিন' },
    { id: 4, title: 'বিক্রয় বিবরণ', description: 'বিক্রয়ের বিবরণ দিন' },
    { id: 5, title: 'পেমেন্ট', description: 'পেমেন্টের বিবরণ দিন' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">B2B Sell</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">হজ্জ ও উমরাহ প্যাকেজ বিক্রয়</p>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.id
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'border-gray-300 dark:border-gray-600 text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden sm:block w-12 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Step 1: Agent Selection */}
        {currentStep === 1 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              B2B এজেন্ট নির্বাচন করুন
            </h2>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  এজেন্ট অনুসন্ধান করুন
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.agentTradeName || ''}
                    onChange={(e) => setShowAgentSearch(true)}
                    placeholder="এজেন্টের ট্রেড নাম দিয়ে অনুসন্ধান করুন..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                
                {showAgentSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        onClick={() => handleAgentSelect(agent)}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{agent.tradeName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{agent.ownerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{agent.contact}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{agent.location}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formData.agentId && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300">{formData.agentTradeName}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {formData.agentName} • {formData.agentContact}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Package Selection */}
        {currentStep === 2 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              প্যাকেজ নির্বাচন করুন
            </h2>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  প্যাকেজ অনুসন্ধান করুন
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.packageName || ''}
                    onChange={(e) => setShowPackageSearch(true)}
                    placeholder="প্যাকেজ নাম দিয়ে অনুসন্ধান করুন..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                
                {showPackageSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => handlePackageSelect(pkg)}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{pkg.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{pkg.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                pkg.type === 'haj' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                              }`}>
                                {pkg.type.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{pkg.duration}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">৳{pkg.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formData.packageId && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">{formData.packageName}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{formData.packageDescription}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          formData.packageType === 'haj' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}>
                          {formData.packageType.toUpperCase()}
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">{formData.packageDuration}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-800 dark:text-blue-300">৳{formData.packagePrice.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Customer Details */}
        {currentStep === 3 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              গ্রাহকের তথ্য দিন
            </h2>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  গ্রাহক অনুসন্ধান করুন
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.customerName || ''}
                    onChange={(e) => setShowCustomerSearch(true)}
                    placeholder="গ্রাহকের নাম দিয়ে অনুসন্ধান করুন..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                
                {showCustomerSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    গ্রাহকের নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ফোন নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ইমেইল
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NID নম্বর
                  </label>
                  <input
                    type="text"
                    value={formData.customerNID}
                    onChange={(e) => handleInputChange('customerNID', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    পাসপোর্ট নম্বর
                  </label>
                  <input
                    type="text"
                    value={formData.customerPassport}
                    onChange={(e) => handleInputChange('customerPassport', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ঠিকানা
                  </label>
                  <textarea
                    value={formData.customerAddress}
                    onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Sell Details */}
        {currentStep === 4 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              বিক্রয় বিবরণ
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    বিক্রয় তারিখ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.sellDate}
                    onChange={(e) => handleInputChange('sellDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    বিক্রয় মূল্য <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.sellPrice}
                    onChange={(e) => handleInputChange('sellPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ছাড়ের পরিমাণ
                  </label>
                  <input
                    type="number"
                    value={formData.discountAmount}
                    onChange={(e) => handleInputChange('discountAmount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    কমিশন হার (%)
                  </label>
                  <input
                    type="number"
                    value={formData.commissionRate}
                    onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">বিক্রয় সারসংক্ষেপ</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">বিক্রয় মূল্য</p>
                    <p className="font-semibold text-gray-900 dark:text-white">৳{formData.sellPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ছাড়</p>
                    <p className="font-semibold text-red-600 dark:text-red-400">৳{formData.discountAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">চূড়ান্ত মূল্য</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">৳{formData.finalPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">কমিশন</p>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">৳{formData.commissionAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  নোট
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="বিক্রয় সম্পর্কিত অতিরিক্ত নোট..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Payment Details */}
        {currentStep === 5 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              পেমেন্ট বিবরণ
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    প্রদত্ত পরিমাণ
                  </label>
                  <input
                    type="number"
                    value={formData.paymentDetails.paidAmount}
                    onChange={(e) => handleNestedInputChange('paymentDetails', 'paidAmount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    অবশিষ্ট পরিমাণ
                  </label>
                  <input
                    type="number"
                    value={formData.paymentDetails.remainingAmount}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    পেমেন্ট পদ্ধতি
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">পেমেন্ট পদ্ধতি নির্বাচন করুন</option>
                    <option value="cash">নগদ</option>
                    <option value="bank_transfer">ব্যাংক ট্রান্সফার</option>
                    <option value="mobile_banking">মোবাইল ব্যাংকিং</option>
                    <option value="cheque">চেক</option>
                    <option value="installment">কিস্তিতে</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    পেমেন্ট স্ট্যাটাস
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="pending">অপেক্ষমান</option>
                    <option value="partial">আংশিক</option>
                    <option value="completed">সম্পূর্ণ</option>
                  </select>
                </div>
              </div>

              {formData.paymentMethod === 'bank_transfer' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-3">ব্যাংক বিবরণ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ব্যাংকের নাম
                      </label>
                      <input
                        type="text"
                        value={formData.paymentDetails.bankDetails.bankName}
                        onChange={(e) => handleNestedInputChange('paymentDetails', 'bankDetails', {
                          ...formData.paymentDetails.bankDetails,
                          bankName: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        একাউন্ট নম্বর
                      </label>
                      <input
                        type="text"
                        value={formData.paymentDetails.bankDetails.accountNumber}
                        onChange={(e) => handleNestedInputChange('paymentDetails', 'bankDetails', {
                          ...formData.paymentDetails.bankDetails,
                          accountNumber: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ট্রানজেকশন ID
                      </label>
                      <input
                        type="text"
                        value={formData.paymentDetails.bankDetails.transactionId}
                        onChange={(e) => handleNestedInputChange('paymentDetails', 'bankDetails', {
                          ...formData.paymentDetails.bankDetails,
                          transactionId: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentStep === 5 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Complete Sell
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Next
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BSellPage;
