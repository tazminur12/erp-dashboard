import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  PiggyBank, 
  Calculator,
  BarChart3,
  FileText,
  Receipt,
  Plus,
  Eye,
  Edit,
  Download,
  Calendar,
  Wallet,
  Building,
  Globe,
  Users,
  Briefcase
} from 'lucide-react';

const AccountOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock data for account overview
  const [accountData, setAccountData] = useState({
    totalBalance: 1250000,
    monthlyIncome: 450000,
    monthlyExpense: 320000,
    savings: 800000,
    investments: 300000,
    loans: 150000,
    creditCards: 75000,
    bankAccounts: [
      { id: 1, name: 'Sonali Bank', accountNumber: '****1234', balance: 500000, type: 'Savings' },
      { id: 2, name: 'Rupali Bank', accountNumber: '****5678', balance: 300000, type: 'Current' },
      { id: 3, name: 'Agrani Bank', accountNumber: '****9012', balance: 450000, type: 'Savings' }
    ],
    recentTransactions: [
      { id: 1, type: 'income', amount: 50000, description: 'Salary', date: '2024-01-15', category: 'Salary' },
      { id: 2, type: 'expense', amount: 15000, description: 'Grocery Shopping', date: '2024-01-14', category: 'Food' },
      { id: 3, type: 'income', amount: 25000, description: 'Freelance Work', date: '2024-01-13', category: 'Freelance' },
      { id: 4, type: 'expense', amount: 8000, description: 'Transportation', date: '2024-01-12', category: 'Transport' },
      { id: 5, type: 'expense', amount: 12000, description: 'Utility Bills', date: '2024-01-11', category: 'Utilities' }
    ],
    monthlyStats: {
      january: { income: 420000, expense: 310000, savings: 110000 },
      february: { income: 450000, expense: 320000, savings: 130000 },
      march: { income: 480000, expense: 340000, savings: 140000 },
      april: { income: 460000, expense: 330000, savings: 130000 },
      may: { income: 470000, expense: 325000, savings: 145000 },
      june: { income: 450000, expense: 320000, savings: 130000 }
    }
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const getBalanceColor = (amount) => {
    if (amount > 0) return 'text-green-600 dark:text-green-400';
    if (amount < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTransactionIcon = (type) => {
    return type === 'income' ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Salary': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Freelance': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Food': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'Transport': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'Utilities': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading account overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Account Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                আপনার আর্থিক অবস্থার সামগ্রিক বিবরণ
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            <button
              onClick={() => navigate('/account/reports')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Balance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ৳{accountData.totalBalance.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+12.5%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
            </div>
          </div>

          {/* Monthly Income */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Income</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ৳{accountData.monthlyIncome.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+8.2%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
            </div>
          </div>

          {/* Monthly Expense */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Expense</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ৳{accountData.monthlyExpense.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600 dark:text-red-400">+3.1%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
            </div>
          </div>

          {/* Net Savings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Savings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ৳{(accountData.monthlyIncome - accountData.monthlyExpense).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+15.8%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bank Accounts */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Bank Accounts
                  </h2>
                  <button
                    onClick={() => navigate('/account/bank-accounts')}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {accountData.bankAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {account.type} • {account.accountNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ৳{account.balance.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Available Balance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/account/income')}
                  className="w-full flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <Plus className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-green-700 dark:text-green-300 font-medium">Add Income</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </button>
                
                <button
                  onClick={() => navigate('/account/expense')}
                  className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <Plus className="w-5 h-5 text-red-600 mr-3" />
                    <span className="text-red-700 dark:text-red-300 font-medium">Add Expense</span>
                  </div>
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </button>
                
                <button
                  onClick={() => navigate('/account/savings')}
                  className="w-full flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <Plus className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-purple-700 dark:text-purple-300 font-medium">Add Savings</span>
                  </div>
                  <PiggyBank className="w-4 h-4 text-purple-600" />
                </button>
                
                <button
                  onClick={() => navigate('/account/loans')}
                  className="w-full flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <Plus className="w-5 h-5 text-orange-600 mr-3" />
                    <span className="text-orange-700 dark:text-orange-300 font-medium">Add Loan</span>
                  </div>
                  <Calculator className="w-4 h-4 text-orange-600" />
                </button>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Savings:</span>
                  <span className="font-medium text-gray-900 dark:text-white">৳{accountData.savings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Investments:</span>
                  <span className="font-medium text-gray-900 dark:text-white">৳{accountData.investments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Outstanding Loans:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">৳{accountData.loans.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Credit Card Debt:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">৳{accountData.creditCards.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Transactions
              </h2>
              <button
                onClick={() => navigate('/account/reports')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All Transactions
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {accountData.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(transaction.category)}`}>
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span className={getBalanceColor(transaction.type === 'income' ? transaction.amount : -transaction.amount)}>
                        {transaction.type === 'income' ? '+' : '-'}৳{transaction.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountOverview;
