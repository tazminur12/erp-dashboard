import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  useFarmExpenses,
  useFarmIncomes,
  useCreateFarmExpense,
  useCreateFarmIncome
} from '../../hooks/useFinanceQueries';
import { 
  Plus, 
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
  // Mutations
  const { mutateAsync: createExpense, isPending: creatingExpense } = useCreateFarmExpense();
  const { mutateAsync: createIncome, isPending: creatingIncome } = useCreateFarmIncome();

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

  // Remote lists via hooks
  const { data: expenses = [] } = useFarmExpenses(expenseParams);
  const { data: incomes = [] } = useFarmIncomes(incomeParams);

  // Data already coming from hooks

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
      await createExpense({
        category: newExpense.category,
        description: newExpense.description,
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
      await createIncome({
        source: newIncome.source,
        description: newIncome.description,
        amount: Number(newIncome.amount) || 0,
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
    alert('রিপোর্ট তৈরি করা হচ্ছে...');
  };

  // No remote loading state

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

      {/* Cards for created items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">সাম্প্রতিক খরচ</h3>
          <div className="space-y-3">
            {expenses.map(item => {
              const categoryInfo = expenseCategories.find(cat => cat.value === item.category);
              return (
                <div key={item.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    {categoryInfo && (
                      <div className={`p-2 rounded-full ${categoryInfo.color}`}>
                        <categoryInfo.icon className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{item.vendor || 'খরচ'}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link to={`/miraj-industries/expense/${item.id}`} className="px-3 py-1.5 rounded-lg border text-xs text-gray-700 hover:bg-gray-50">View</Link>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-red-600">-৳{Number(item.amount || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {expenses.length === 0 && (
              <div className="text-sm text-gray-500">কোনো খরচ যুক্ত করা হয়নি</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">সাম্প্রতিক আয়</h3>
          <div className="space-y-3">
            {incomes.map(item => {
              const sourceInfo = incomeSources.find(src => src.value === item.source);
              return (
                <div key={item.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    {sourceInfo && (
                      <div className={`p-2 rounded-full ${sourceInfo.color}`}>
                        <sourceInfo.icon className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{item.customer || 'আয়'}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link to={`/miraj-industries/income/${item.id}`} className="px-3 py-1.5 rounded-lg border text-xs text-gray-700 hover:bg-gray-50">View</Link>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">+৳{Number(item.amount || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {incomes.length === 0 && (
              <div className="text-sm text-gray-500">কোনো আয় যুক্ত করা হয়নি</div>
            )}
          </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">খরচের নাম</label>
                <input
                  type="text"
                  value={newExpense.vendor}
                  onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="খরচের নাম"
                />
              </div>
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
                  disabled={creatingExpense}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {creatingExpense ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">আয়ের নাম</label>
                <input
                  type="text"
                  value={newIncome.customer}
                  onChange={(e) => setNewIncome({...newIncome, customer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="আয়ের নাম"
                />
              </div>
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
                  disabled={creatingIncome}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {creatingIncome ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default FinancialReport;
