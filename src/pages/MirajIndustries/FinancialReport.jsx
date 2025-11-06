import React, { useState, useMemo } from 'react';
import useFinanceQueries from '../../hooks/useFinanceQueries';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download,
  Eye,
  Edit,
  Trash2,
  Receipt,
  ShoppingCart,
  Milk,
  Heart,
  Baby,
  Utensils,
  Building,
  Car,
  Zap,
  Wifi,
  Phone,
  User,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const FinancialReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Load queries
  const {
    useExpenses,
    useIncomes,
    useFinanceStats,
    useCreateExpense,
    useCreateIncome
  } = useFinanceQueries();

  // Build query params
  const expenseParams = useMemo(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (filterDate) params.date = filterDate;
    return params;
  }, [searchTerm, filterDate]);

  const incomeParams = useMemo(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (filterDate) params.date = filterDate;
    return params;
  }, [searchTerm, filterDate]);

  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses(expenseParams);
  const { data: incomes = [], isLoading: loadingIncomes } = useIncomes(incomeParams);
  const { data: stats = {}, isLoading: loadingStats } = useFinanceStats();

  const createExpenseMutation = useCreateExpense();
  const createIncomeMutation = useCreateIncome();

  const [newExpense, setNewExpense] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    vendor: '',
    notes: ''
  });

  const [newIncome, setNewIncome] = useState({
    source: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    customer: '',
    notes: ''
  });

  const expenseCategories = [
    { value: 'feed', label: 'খাদ্য', icon: Utensils, color: 'text-orange-600 bg-orange-100' },
    { value: 'veterinary', label: 'পশুচিকিৎসা', icon: Heart, color: 'text-red-600 bg-red-100' },
    { value: 'medicine', label: 'ওষুধ', icon: ShoppingCart, color: 'text-blue-600 bg-blue-100' },
    { value: 'salary', label: 'বেতন', icon: User, color: 'text-green-600 bg-green-100' },
    { value: 'utilities', label: 'বিদ্যুৎ/পানি', icon: Zap, color: 'text-yellow-600 bg-yellow-100' },
    { value: 'maintenance', label: 'মেরামত', icon: Building, color: 'text-purple-600 bg-purple-100' },
    { value: 'transport', label: 'পরিবহন', icon: Car, color: 'text-indigo-600 bg-indigo-100' },
    { value: 'communication', label: 'যোগাযোগ', icon: Phone, color: 'text-pink-600 bg-pink-100' },
    { value: 'other', label: 'অন্যান্য', icon: Receipt, color: 'text-gray-600 bg-gray-100' }
  ];

  const incomeSources = [
    { value: 'milk_sale', label: 'দুধ বিক্রয়', icon: Milk, color: 'text-blue-600 bg-blue-100' },
    { value: 'cattle_sale', label: 'গরু বিক্রয়', icon: TrendingUp, color: 'text-green-600 bg-green-100' },
    { value: 'calf_sale', label: 'বাচ্চা বিক্রয়', icon: Baby, color: 'text-purple-600 bg-purple-100' },
    { value: 'manure_sale', label: 'সার বিক্রয়', icon: Receipt, color: 'text-orange-600 bg-orange-100' },
    { value: 'breeding_service', label: 'প্রজনন সেবা', icon: Heart, color: 'text-pink-600 bg-pink-100' },
    { value: 'other', label: 'অন্যান্য', icon: DollarSign, color: 'text-gray-600 bg-gray-100' }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'নগদ' },
    { value: 'bank_transfer', label: 'ব্যাংক ট্রান্সফার' },
    { value: 'check', label: 'চেক' },
    { value: 'mobile_banking', label: 'মোবাইল ব্যাংকিং' }
  ];

  // Filter records client-side by type (backend already filters by search and date)
  const filteredExpenses = useMemo(() => {
    if (filterType === 'all' || filterType === 'expense') {
      return (expenses || []).map(expense => ({ ...expense, type: 'expense' }));
    }
    return [];
  }, [expenses, filterType]);

  const filteredIncomes = useMemo(() => {
    if (filterType === 'all' || filterType === 'income') {
      return (incomes || []).map(income => ({ ...income, type: 'income' }));
    }
    return [];
  }, [incomes, filterType]);

  const handleAddExpense = async () => {
    try {
      await createExpenseMutation.mutateAsync({
        category: newExpense.category,
        description: newExpense.description,
        amount: Number(newExpense.amount),
        date: newExpense.date,
        paymentMethod: newExpense.paymentMethod,
        vendor: newExpense.vendor || '',
        notes: newExpense.notes || ''
      });
      setShowAddExpenseModal(false);
      resetExpenseForm();
    } catch (error) {
      alert(error.message || 'খরচ যোগ করতে সমস্যা হয়েছে');
    }
  };

  const handleAddIncome = async () => {
    try {
      await createIncomeMutation.mutateAsync({
        source: newIncome.source,
        description: newIncome.description,
        amount: Number(newIncome.amount),
        date: newIncome.date,
        paymentMethod: newIncome.paymentMethod,
        customer: newIncome.customer || '',
        notes: newIncome.notes || ''
      });
      setShowAddIncomeModal(false);
      resetIncomeForm();
    } catch (error) {
      alert(error.message || 'আয় যোগ করতে সমস্যা হয়েছে');
    }
  };

  const resetExpenseForm = () => {
    setNewExpense({
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      vendor: '',
      notes: ''
    });
  };

  const resetIncomeForm = () => {
    setNewIncome({
      source: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      customer: '',
      notes: ''
    });
  };

  const getCategoryInfo = (category, type) => {
    if (type === 'expense') {
      return expenseCategories.find(cat => cat.value === category);
    } else {
      return incomeSources.find(source => source.value === category);
    }
  };

  const getPaymentMethodLabel = (method) => {
    const methodObj = paymentMethods.find(pm => pm.value === method);
    return methodObj ? methodObj.label : method;
  };

  const generateReport = () => {
    // Generate report logic
    alert('রিপোর্ট তৈরি করা হচ্ছে...');
  };

  const isLoading = loadingExpenses || loadingIncomes || loadingStats;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">আয়-খরচ রিপোর্ট</h1>
          <p className="text-gray-600 mt-2">খামারের আয় ও খরচের বিস্তারিত রেকর্ড</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddExpenseModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <TrendingDown className="w-5 h-5" />
            খরচ যোগ করুন
          </button>
          <button 
            onClick={() => setShowAddIncomeModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            আয় যোগ করুন
          </button>
          <button 
            onClick={generateReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            রিপোর্ট
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মোট আয়</p>
              <p className="text-2xl font-bold text-green-600">৳{(stats.totalIncome || 0).toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>এই মাসে: ৳{(stats.monthlyIncome || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">মোট খরচ</p>
              <p className="text-2xl font-bold text-red-600">৳{(stats.totalExpenses || 0).toLocaleString()}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>এই মাসে: ৳{(stats.monthlyExpenses || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">নিট লাভ</p>
              <p className={`text-2xl font-bold ${(stats.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ৳{(stats.netProfit || 0).toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-full ${(stats.netProfit || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {(stats.netProfit || 0) >= 0 ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
          <div className={`mt-4 flex items-center text-sm ${(stats.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <BarChart3 className="w-4 h-4 mr-1" />
            <span>{(stats.netProfit || 0) >= 0 ? 'লাভ' : 'ক্ষতি'}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">দুধ বিক্রয়</p>
              <p className="text-2xl font-bold text-blue-600">৳{(stats.milkIncome || 0).toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Milk className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <Milk className="w-4 h-4 mr-1" />
            <span>মূল আয়ের উৎস</span>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">খরচের বিভাগ</h3>
          <div className="space-y-3">
            {expenseCategories.map(category => {
              const categoryExpenses = (expenses || [])
                .filter(expense => expense.category === category.value)
                .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
              
              const percentage = (stats.totalExpenses || 0) > 0 ? (categoryExpenses / stats.totalExpenses) * 100 : 0;
              
              return (
                <div key={category.value} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${category.color}`}>
                      <category.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{category.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">৳{categoryExpenses.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">আয়ের উৎস</h3>
          <div className="space-y-3">
            {incomeSources.map(source => {
              const sourceIncome = (incomes || [])
                .filter(income => income.source === source.value)
                .reduce((sum, income) => sum + (Number(income.amount) || 0), 0);
              
              const percentage = (stats.totalIncome || 0) > 0 ? (sourceIncome / stats.totalIncome) * 100 : 0;
              
              return (
                <div key={source.value} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${source.color}`}>
                      <source.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{source.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">৳{sourceIncome.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="বিবরণ, বিক্রেতা বা ক্রেতার নাম দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">সব রেকর্ড</option>
              <option value="expense">খরচ</option>
              <option value="income">আয়</option>
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  তারিখ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ধরন
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  বিবরণ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  বিভাগ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পরিমাণ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পেমেন্ট
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্রিয়া
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Expense Records */}
              {filterType === 'all' || filterType === 'expense' ? filteredExpenses.map((expense) => {
                const categoryInfo = getCategoryInfo(expense.category, 'expense');
                return (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{new Date(expense.date).toLocaleDateString('bn-BD')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full text-red-600 bg-red-100">
                        খরচ
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{expense.description}</div>
                      {expense.vendor && (
                        <div className="text-sm text-gray-500">বিক্রেতা: {expense.vendor}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {categoryInfo && (
                          <>
                            <div className={`p-1 rounded-full ${categoryInfo.color}`}>
                              <categoryInfo.icon className="w-3 h-3" />
                            </div>
                            <span className="text-sm text-gray-900">{categoryInfo.label}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-red-600">-৳{Number(expense.amount || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getPaymentMethodLabel(expense.paymentMethod)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedRecord({ ...expense, type: 'expense' });
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              }) : null}

              {/* Income Records */}
              {filterType === 'all' || filterType === 'income' ? filteredIncomes.map((income) => {
                const sourceInfo = getCategoryInfo(income.source, 'income');
                return (
                  <tr key={income.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{new Date(income.date).toLocaleDateString('bn-BD')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                        আয়
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{income.description}</div>
                      {income.customer && (
                        <div className="text-sm text-gray-500">ক্রেতা: {income.customer}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {sourceInfo && (
                          <>
                            <div className={`p-1 rounded-full ${sourceInfo.color}`}>
                              <sourceInfo.icon className="w-3 h-3" />
                            </div>
                            <span className="text-sm text-gray-900">{sourceInfo.label}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">+৳{Number(income.amount || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getPaymentMethodLabel(income.paymentMethod)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedRecord({ ...income, type: 'income' });
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              }) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">খরচ যোগ করুন</h2>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddExpense(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">খরচের বিভাগ</label>
                <select
                  required
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">বিভাগ নির্বাচন করুন</option>
                  {expenseCategories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ</label>
                <input
                  type="text"
                  required
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="খরচের বিবরণ"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="পরিমাণ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পেমেন্ট পদ্ধতি</label>
                  <select
                    value={newExpense.paymentMethod}
                    onChange={(e) => setNewExpense({...newExpense, paymentMethod: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বিক্রেতা</label>
                  <input
                    type="text"
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="বিক্রেতার নাম"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
                <textarea
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="অতিরিক্ত তথ্য"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={createExpenseMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {createExpenseMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      {showAddIncomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">আয় যোগ করুন</h2>
              <button onClick={() => setShowAddIncomeModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddIncome(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">আয়ের উৎস</label>
                <select
                  required
                  value={newIncome.source}
                  onChange={(e) => setNewIncome({...newIncome, source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">উৎস নির্বাচন করুন</option>
                  {incomeSources.map(source => (
                    <option key={source.value} value={source.value}>{source.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ</label>
                <input
                  type="text"
                  required
                  value={newIncome.description}
                  onChange={(e) => setNewIncome({...newIncome, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="আয়ের বিবরণ"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="পরিমাণ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({...newIncome, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পেমেন্ট পদ্ধতি</label>
                  <select
                    value={newIncome.paymentMethod}
                    onChange={(e) => setNewIncome({...newIncome, paymentMethod: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ক্রেতা</label>
                  <input
                    type="text"
                    value={newIncome.customer}
                    onChange={(e) => setNewIncome({...newIncome, customer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ক্রেতার নাম"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
                <textarea
                  value={newIncome.notes}
                  onChange={(e) => setNewIncome({...newIncome, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="অতিরিক্ত তথ্য"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddIncomeModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={createIncomeMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {createIncomeMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Record Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">রেকর্ড বিস্তারিত</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ধরন:</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedRecord.type === 'expense' ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'
                  }`}>
                    {selectedRecord.type === 'expense' ? 'খরচ' : 'আয়'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">তারিখ:</p>
                  <p className="font-medium">{new Date(selectedRecord.date).toLocaleDateString('bn-BD')}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">বিবরণ:</p>
                <p className="font-medium">{selectedRecord.description}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">বিভাগ/উৎস:</p>
                <p className="font-medium">
                  {selectedRecord.type === 'expense' 
                    ? expenseCategories.find(cat => cat.value === selectedRecord.category)?.label
                    : incomeSources.find(source => source.value === selectedRecord.source)?.label
                  }
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">পরিমাণ:</p>
                  <p className={`font-bold ${selectedRecord.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedRecord.type === 'expense' ? '-' : '+'}৳{Number(selectedRecord.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">পেমেন্ট পদ্ধতি:</p>
                  <p className="font-medium">{getPaymentMethodLabel(selectedRecord.paymentMethod)}</p>
                </div>
              </div>
              
              {(selectedRecord.vendor || selectedRecord.customer) && (
                <div>
                  <p className="text-sm text-gray-600">{selectedRecord.type === 'expense' ? 'বিক্রেতা' : 'ক্রেতা'}:</p>
                  <p className="font-medium">{selectedRecord.vendor || selectedRecord.customer}</p>
                </div>
              )}
              
              {selectedRecord.notes && (
                <div>
                  <p className="text-sm text-gray-600">নোট:</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReport;
