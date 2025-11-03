import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Save, 
  ArrowLeft,
  User,
  DollarSign,
  AlertCircle,
  Search,
  CheckCircle,
  Download,
  Mail,
  Banknote,
  CreditCard as CreditCardIcon,
  Smartphone,
  Receipt,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Loader2,
  ArrowRightLeft,
  Building,
  Info,
  FileText,
  Calendar,
  Building2, 
  Globe,
  MoreHorizontal,
  X
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import { 
  useCreateTransaction,
  useCompleteTransaction,
  useTransactions,
  useTransactionAccounts,
  useTransactionCustomers,
  useTransactionInvoices,
  useTransactionCategories,
  useSearchAgents,
  useSearchVendors,
  useTransactionStats,
  useBankAccountTransfer
} from '../../hooks/useTransactionQueries';
import { transactionKeys } from '../../hooks/useTransactionQueries';
import { useQueryClient } from '@tanstack/react-query';
import { vendorKeys } from '../../hooks/useVendorQueries';
import { useAccountQueries } from '../../hooks/useAccountQueries';
import { useEmployeeSearch } from '../../hooks/useHRQueries';
import { useCategoryQueries } from '../../hooks/useCategoryQueries';
import { useHajiList } from '../../hooks/UseHajiQueries';
import { useUmrahList } from '../../hooks/UseUmrahQuries';
import { useLoans } from '../../hooks/useLoanQueries';
import { generateTransactionPDF, generateSimplePDF } from '../../utils/pdfGenerator';
import Swal from 'sweetalert2';

const NewTransaction = () => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  
  // React Query hooks
  const createTransactionMutation = useCreateTransaction();
  const completeTransactionMutation = useCompleteTransaction();
  const bankAccountTransferMutation = useBankAccountTransfer();
  const { data: accounts = [], isLoading: accountsLoading, error: accountsError } = useTransactionAccounts();
  const { data: customers = [], isLoading: customersLoading, error: customersError } = useTransactionCustomers();
  

  
  // Fallback demo customers if API fails
  const demoCustomers = [
    {
      id: 'DEMO-CUST-001',
      customerId: 'DEMO-CUST-001',
      name: 'আহমেদ আলী',
      mobile: '01712345678',
      phone: '01712345678',
      email: 'ahmed@example.com',
      customerType: 'customer'
    },
    {
      id: 'DEMO-CUST-002',
      customerId: 'DEMO-CUST-002',
      name: 'ফাতেমা খাতুন',
      mobile: '01876543210',
      phone: '01876543210',
      email: 'fatema@example.com',
      customerType: 'customer'
    },
    {
      id: 'DEMO-CUST-003',
      customerId: 'DEMO-CUST-003',
      name: 'করিম উদ্দিন',
      mobile: '01987654321',
      phone: '01987654321',
      email: 'karim@example.com',
      customerType: 'customer'
    }
  ];
  
  // Use demo customers if API customers are empty
  const effectiveCustomers = customers && customers.length > 0 ? customers : demoCustomers;
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useTransactionCategories();
  const { data: transactionsData } = useTransactions({}, 1, 1000); // Fetch all transactions for balance calculation
  
  // Haji and Umrah queries
  const { data: hajiData, isLoading: hajiLoading, error: hajiError } = useHajiList({ page: 1, limit: 1000 });
  const { data: umrahData, isLoading: umrahLoading, error: umrahError } = useUmrahList({ page: 1, limit: 1000 });
  
  // Bank account queries for account-to-account transfers
  const accountQueries = useAccountQueries();
  const createBankAccountTransactionMutation = accountQueries.useCreateBankAccountTransaction();
  const transferBetweenAccountsMutation = accountQueries.useTransferBetweenAccounts();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Transaction Type
    transactionType: '',
    
    // Step 2: Customer Selection (for credit/debit)
    customerType: 'customer', // 'customer', 'vendor', 'agent', 'haji', 'umrah'
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    
    // Customer Bank Account Details
    customerBankAccount: {
      bankName: '',
      accountNumber: ''
    },
    
    // Step 3: Category (for credit/debit)
    category: '',
    // Slug for backend detection (e.g., 'hajj', 'umrah')
    serviceCategory: '',
    
    // Step 4: Invoice Selection (for credit/debit)
    selectedInvoice: null,
    invoiceId: '',
    
    // Step 5: Payment Method (for credit/debit)
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
    
    // Account Selection for Credit/Debit transactions
    sourceAccount: {
      id: '',
      name: '',
      bankName: '',
      accountNumber: '',
      balance: 0
    },
    destinationAccount: {
      id: '',
      name: '',
      bankName: '',
      accountNumber: '',
      balance: 0
    },
    
    // Account Manager for Credit/Debit transactions
    debitAccountManager: {
      id: '',
      name: '',
      phone: '',
      email: ''
    },
    creditAccountManager: {
      id: '',
      name: '',
      phone: '',
      email: ''
    },
    
    // Account Transfer Fields
    // Step 2: Debit Account (for transfer)
    debitAccount: {
      id: '',
      name: '',
      bankName: '',
      accountNumber: '',
      balance: 0
    },
    
    // Step 3: Credit Account (for transfer)
    creditAccount: {
      id: '',
      name: '',
      bankName: '',
      accountNumber: '',
      balance: 0
    },
    
    // Step 4: Account Manager (for transfer)
    accountManager: {
      id: '',
      name: '',
      phone: '',
      email: ''
    },
    
    // Transfer Details
    transferAmount: '',
    transferReference: '',
    transferNotes: '',
    
    // Step 5: Additional Info
    notes: '',
    date: new Date().toISOString().split('T')[0],
    
    // Employee Reference
    employeeReference: {
      id: '',
      name: '',
      employeeId: '',
      position: '',
      department: ''
    },
    // Selected Loan info (when picking from Loans tab)
    loanInfo: {
      id: '',
      name: '',
      direction: '' // 'giving' | 'receiving'
    }
  });

  // Invoice query hook (after formData is initialized)
  const { data: invoices = [], isLoading: invoicesLoading, error: invoicesError } = useTransactionInvoices(formData.customerId);

  // Loans for selected customer (to show loan IDs under customer selection)
  const { data: customerLoansData, isLoading: customerLoansLoading } = useLoans(
    formData.customerId ? { customerId: formData.customerId } : {},
    1,
    100
  );
  const customerLoans = (customerLoansData && (customerLoansData.loans || customerLoansData.data || [])) || [];

  // Loans search list for the "Loans" selector tab - moved below where selectedSearchType/searchTerm are declared

  // Demo invoices fallback when API has no data
  const demoInvoices = [
    {
      id: 'DEMO-INV-001',
      invoiceNumber: 'INV-2025-001',
      customerName: 'ডেমো কাস্টমার ১',
      amount: 12500,
      dueDate: '2025-11-05',
      status: 'Pending',
      description: 'এয়ার টিকেট - ঢাকা থেকে দুবাই'
    },
    {
      id: 'DEMO-INV-002',
      invoiceNumber: 'INV-2025-002',
      customerName: 'ডেমো কাস্টমার ২',
      amount: 28900,
      dueDate: '2025-11-12',
      status: 'Pending',
      description: 'উমরাহ প্যাকেজ - স্ট্যান্ডার্ড'
    },
    {
      id: 'DEMO-INV-003',
      invoiceNumber: 'INV-2025-003',
      customerName: 'ডেমো কাস্টমার ৩',
      amount: 7600,
      dueDate: '2025-11-20',
      status: 'Paid',
      description: 'ভিসা সার্ভিস - সৌদি ভিসা'
    }
  ];

  // Choose effective invoices (API data first, then demo)
  // Show demo invoices when no customer is selected, API is loading, or API has no data
  const shouldShowDemoInvoices = !formData.customerId || invoicesLoading || (invoices && invoices.length === 0);
  const effectiveInvoices = shouldShowDemoInvoices ? demoInvoices : invoices;
  const isUsingDemoInvoices = shouldShowDemoInvoices;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchType, setSelectedSearchType] = useState('customer');
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
  const [debitAccountSearchTerm, setDebitAccountSearchTerm] = useState('');
  const [creditAccountSearchTerm, setCreditAccountSearchTerm] = useState('');
  const [accountManagerSearchTerm, setAccountManagerSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [errors, setErrors] = useState({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  
  // Search hooks (after searchTerm state declaration)
  const { data: agentResults = [], isLoading: agentLoading } = useSearchAgents(
    searchTerm,
    selectedSearchType === 'agent' && !!searchTerm?.trim()
  );
  const { data: vendorResults = [], isLoading: vendorLoading } = useSearchVendors(
    searchTerm,
    selectedSearchType === 'vendor' && !!searchTerm?.trim()
  );
  const { data: employeeSearchResults = [], isLoading: employeeLoading, error: employeeSearchError } = useEmployeeSearch(accountManagerSearchTerm, !!accountManagerSearchTerm?.trim());

  // Loans search list for the "Loans" selector tab
  const { data: loansSearchData, isLoading: loansSearchLoading } = useLoans(
    selectedSearchType === 'loans' && searchTerm ? { search: searchTerm } : {},
    1,
    50
  );
  const loansSearch = (loansSearchData && (loansSearchData.loans || loansSearchData.data || [])) || [];
  
  // Payment methods
  const paymentMethods = [
    { 
      id: 'cash', 
      name: 'ক্যাশ', 
      icon: Banknote, 
      color: 'from-green-500 to-green-600',
      fields: ['reference'],
      accountCategory: 'cash'
    },
    { 
      id: 'bank-transfer', 
      name: 'ব্যাংক ট্রান্সফার', 
      icon: CreditCardIcon, 
      color: 'from-blue-500 to-blue-600',
      fields: ['bankName', 'accountNumber', 'reference'],
      accountCategory: 'bank'
    },
    { 
      id: 'cheque', 
      name: 'চেক', 
      icon: Receipt, 
      color: 'from-orange-500 to-orange-600',
      fields: ['chequeNumber', 'bankName', 'reference'],
      accountCategory: 'bank'
    },
    { 
      id: 'mobile-banking', 
      name: 'মোবাইল ব্যাংকিং', 
      icon: Smartphone, 
      color: 'from-purple-500 to-purple-600',
      fields: ['mobileProvider', 'transactionId', 'reference'],
      accountCategory: 'mobile_banking'
    },
    { 
      id: 'others', 
      name: 'অন্যান্য', 
      icon: ArrowRightLeft, 
      color: 'from-gray-500 to-gray-600',
      fields: ['reference'],
      accountCategory: 'others'
    }
  ];

  // Helper: Avoid "false" showing in placeholders by mapping field → text
  const getPaymentFieldPlaceholder = (field) => {
    switch (field) {
      case 'bankName':
        return 'ব্যাংকের নাম লিখুন...';
      case 'accountNumber':
        return 'অ্যাকাউন্ট নম্বর লিখুন...';
      case 'cardNumber':
        return 'কার্ড নম্বর লিখুন...';
      case 'chequeNumber':
        return 'চেক নম্বর লিখুন...';
      case 'mobileProvider':
        return 'মোবাইল প্রোভাইডার লিখুন...';
      case 'transactionId':
        return 'ট্রানজেকশন আইডি লিখুন...';
      case 'reference':
        return 'রেফারেন্স লিখুন...';
      default:
        return 'তথ্য লিখুন...';
    }
  };
  
  // Filter accounts based on search term and payment method
  const filteredAccounts = accounts.filter(account => {
    // Filter by payment method if selected
    if (formData.paymentMethod) {
      const selectedPaymentMethod = paymentMethods.find(
        method => method.id === formData.paymentMethod
      );

      // Only show accounts that match the method's category (cash/bank/mobile_banking/other)
      if (
        selectedPaymentMethod &&
        account.accountType !== selectedPaymentMethod.accountCategory
      ) {
        return false;
      }
    }

    // Filter by search term
    if (accountSearchTerm) {
      const lowerSearch = accountSearchTerm.toLowerCase();
      return (
        account.name?.toLowerCase().includes(lowerSearch) ||
        account.bankName?.toLowerCase().includes(lowerSearch) ||
        account.accountNumber?.toLowerCase().includes(lowerSearch)
      );
    }

    return true;
  });

  
  // Bank accounts are now fetched via React Query
  
  // Mock account managers
  const [accountManagers] = useState([
    {
      id: 'AM-001',
      name: 'মোঃ রফিকুল ইসলাম',
      phone: '+8801712345678',
      email: 'rafiqul@company.com',
      designation: 'সিনিয়র একাউন্ট ম্যানেজার'
    },
    {
      id: 'AM-002',
      name: 'মোসাঃ ফাতেমা খাতুন',
      phone: '+8801812345678',
      email: 'fatema@company.com',
      designation: 'একাউন্ট ম্যানেজার'
    },
    {
      id: 'AM-003',
      name: 'মোঃ করিম উদ্দিন',
      phone: '+8801912345678',
      email: 'karim@company.com',
      designation: 'এসোসিয়েট একাউন্ট ম্যানেজার'
    }
  ]);
  
  // Filter invoices based on search term
  const filteredInvoices = effectiveInvoices.filter(invoice => {
    if (!invoiceSearchTerm.trim()) return true;
    
    const searchLower = invoiceSearchTerm.toLowerCase();
    return (
      (invoice.invoiceNumber || '').toLowerCase().includes(searchLower) ||
      (invoice.customerName || '').toLowerCase().includes(searchLower) ||
      (invoice.description || '').toLowerCase().includes(searchLower) ||
      (invoice.amount || 0).toString().includes(searchLower)
    );
  });

  // Filter accounts based on search terms
  const filteredDebitAccounts = accounts.filter(account => {
    if (!debitAccountSearchTerm.trim()) return true;
    
    const searchLower = debitAccountSearchTerm.toLowerCase();
    return (
      (account.name || '').toLowerCase().includes(searchLower) ||
      (account.bankName || '').toLowerCase().includes(searchLower) ||
      String(account.accountNumber || '').includes(debitAccountSearchTerm) ||
      (account.type || '').toLowerCase().includes(searchLower)
    );
  });

  const filteredCreditAccounts = accounts.filter(account => {
    if (!creditAccountSearchTerm.trim()) return true;
    
    const searchLower = creditAccountSearchTerm.toLowerCase();
    return (
      (account.name || '').toLowerCase().includes(searchLower) ||
      (account.bankName || '').toLowerCase().includes(searchLower) ||
      String(account.accountNumber || '').includes(creditAccountSearchTerm) ||
      (account.type || '').toLowerCase().includes(searchLower)
    );
  });

  // Use employee search results for account managers
  const filteredAccountManagers = employeeSearchResults;

  // Customers are now fetched via React Query

  // Agent and vendor search are now handled by React Query hooks

  // Transform categories data to match the expected structure
  const categoryGroups = categories.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    icon: category.icon,
    subCategories: category.subCategories || []
  }));

  // Dynamic steps based on transaction type
  const getSteps = () => {
    if (formData.transactionType === 'transfer') {
      return [
        { number: 1, title: 'লেনদেন টাইপ', description: 'একাউন্ট টু একাউন্ট ট্রান্সফার' },
        { number: 2, title: 'ডেবিট একাউন্ট', description: 'ডেবিট একাউন্ট নির্বাচন করুন' },
        { number: 3, title: 'ক্রেডিট একাউন্ট', description: 'ক্রেডিট একাউন্ট নির্বাচন করুন' },
        { number: 4, title: 'ট্রান্সফার বিবরণ', description: 'ট্রান্সফার পরিমাণ ও একাউন্ট ম্যানেজার নির্বাচন' },
        { number: 5, title: 'কনফার্মেশন', description: 'এসএমএস কনফার্মেশন এবং সংরক্ষণ' }
      ];
    } else if (formData.transactionType === 'debit') {
      return [
        { number: 1, title: 'লেনদেন টাইপ', description: 'ডেবিট (ব্যয়) নির্বাচন করুন' },
        { number: 2, title: 'ক্যাটাগরি', description: 'সেবার ধরন নির্বাচন করুন' },
        { number: 3, title: 'কাস্টমার নির্বাচন', description: 'কাস্টমার সিলেক্ট করুন' },
        { number: 4, title: 'পেমেন্ট মেথড', description: 'পেমেন্টের ধরন নির্বাচন করুন' },
        { number: 5, title: 'কনফার্মেশন', description: 'তথ্য যাচাই এবং সংরক্ষণ' }
      ];
    } else {
      // Credit transaction - check if agent is selected
      if (formData.customerType === 'agent') {
        return [
          { number: 1, title: 'লেনদেন টাইপ', description: 'ক্রেডিট (আয়) নির্বাচন করুন' },
          { number: 2, title: 'ক্যাটাগরি', description: 'সেবার ধরন নির্বাচন করুন' },
          { number: 3, title: 'এজেন্ট নির্বাচন', description: 'এজেন্ট সিলেক্ট করুন' },
          { number: 4, title: 'এজেন্ট ব্যালেন্স', description: 'এজেন্টের ব্যালেন্স তথ্য দেখুন' },
          { number: 5, title: 'পেমেন্ট মেথড', description: 'পেমেন্টের ধরন নির্বাচন করুন' },
          { number: 6, title: 'কনফার্মেশন', description: 'তথ্য যাচাই এবং সংরক্ষণ' }
        ];
      } else {
        return [
          { number: 1, title: 'লেনদেন টাইপ', description: 'ক্রেডিট (আয়) নির্বাচন করুন' },
          { number: 2, title: 'ক্যাটাগরি', description: 'সেবার ধরন নির্বাচন করুন' },
          { number: 3, title: 'কাস্টমার নির্বাচন', description: 'কাস্টমার সিলেক্ট করুন' },
          { number: 4, title: 'ইনভয়েস নির্বাচন', description: 'ইনভয়েস সিলেক্ট করুন' },
          { number: 5, title: 'পেমেন্ট মেথড', description: 'পেমেন্টের ধরন নির্বাচন করুন' },
          { number: 6, title: 'কনফার্মেশন', description: 'তথ্য যাচাই এবং সংরক্ষণ' }
        ];
      }
    }
  };

  const steps = getSteps();

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
    const resolvedType = customer.customerType || customer.type || customer._type || 'customer';
    const autoCategory = resolvedType === 'haji' ? 'হাজ্জ প্যাকেজ' : (resolvedType === 'umrah' ? 'ওমরাহ প্যাকেজ' : undefined);
    const autoSelectedOption = resolvedType === 'haji' ? 'hajj' : (resolvedType === 'umrah' ? 'umrah' : undefined);
    const autoServiceCategory = resolvedType === 'haji' ? 'hajj' : (resolvedType === 'umrah' ? 'umrah' : undefined);

    setFormData(prev => ({
      ...prev,
      customerId: (customer.id || customer.customerId) ? String(customer.id || customer.customerId) : '',
      customerName: customer.name,
      customerPhone: customer.mobile || customer.phone,
      customerEmail: customer.email,
      customerType: resolvedType,
      // Autofill fields for proper Umrah/Hajj backend mapping
      ...(autoCategory ? { category: autoCategory } : {}),
      ...(autoSelectedOption ? { selectedOption: autoSelectedOption } : {}),
      ...(autoServiceCategory ? { serviceCategory: autoServiceCategory } : {}),
      selectedInvoice: null,
      invoiceId: '',
      agentDueInfo: null
    }));
    setSearchLoading(false);
  };

  const handleAgentSelect = (agent) => {
    setFormData(prev => ({
      ...prev,
      customerId: agent._id || agent.id,
      customerName: agent.tradeName || agent.ownerName || '',
      customerPhone: agent.contactNo || '',
      customerEmail: '',
      customerType: 'agent',
      // Store agent due amounts
      agentDueInfo: {
        totalDue: agent.totalDue || 0,
        hajDue: agent.hajDue || 0,
        umrahDue: agent.umrahDue || 0,
        totalDeposit: agent.totalDeposit || 0
      }
    }));
    setSearchLoading(false);
  };

  const handleVendorSelect = (vendor) => {
    setFormData(prev => ({
      ...prev,
      customerId: vendor._id || vendor.id,
      customerName: vendor.tradeName || vendor.vendorName || vendor.name || '',
      customerPhone: vendor.contactNo || vendor.phone || '',
      customerEmail: vendor.email || '',
      customerType: 'vendor',
      // Clear agent due info when selecting vendor
      agentDueInfo: null
    }));
    setSearchLoading(false);
  };

  const handleLoanSelect = (loan) => {
    setFormData(prev => ({
      ...prev,
      // Treat loan as a selectable party
      customerType: 'loan',
      customerId: (loan._id || loan.id || loan.loanId) ? String(loan._id || loan.id || loan.loanId) : '',
      customerName: loan.customerName || loan.borrowerName || loan.fullName || loan.businessName || loan.tradeName || loan.ownerName || loan.name || 'Unknown',
      loanInfo: {
        id: loan._id || loan.id || loan.loanId,
        name: loan.customerName || loan.borrowerName || loan.fullName || loan.businessName || loan.tradeName || loan.ownerName || loan.name || 'Unknown',
        direction: loan.loanDirection || loan.direction || ''
      }
    }));
  };

  const handleInvoiceSelect = (invoice) => {
    setFormData(prev => ({
      ...prev,
      selectedInvoice: invoice,
      invoiceId: invoice.id || invoice._id,
      paymentDetails: {
        ...prev.paymentDetails,
        amount: (invoice.amount || 0).toString()
      }
    }));
  };

  const handleAccountSelect = (account, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        id: account.id,
        name: account.name,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        balance: account.balance
      }
    }));
  };

  const handleAccountManagerSelect = (manager) => {
    setFormData(prev => ({
      ...prev,
      accountManager: {
        id: manager.id || manager.employeeId,
        name: manager.name || manager.fullName,
        phone: manager.phone || manager.phoneNumber,
        email: manager.email || manager.emailAddress
      }
    }));
    // Clear search term after selection
    setAccountManagerSearchTerm('');
  };

  const handleEmployeeReferenceSelect = (employee) => {
    setFormData(prev => ({
      ...prev,
      employeeReference: {
        id: employee.id || employee.employeeId,
        name: employee.firstName && employee.lastName 
          ? `${employee.firstName} ${employee.lastName}` 
          : employee.name || 'Unknown Employee',
        employeeId: employee.employeeId || employee.id,
        position: employee.position || '',
        department: employee.department || ''
      }
    }));
  };

  const toggleCategoryGroup = (groupId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({ ...prev, category: prev.category === categoryId ? '' : categoryId }));
    setErrors(prev => ({ ...prev, category: '' }));
  };
  const handleAccountSelectForTransaction = (account, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        id: account.id,
        name: account.name,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        balance: account.balance
      }
    }));
    // Clear search term after selection
    setAccountSearchTerm('');
  };

  // Filter categories based on search term
  const filteredCategoryGroups = categoryGroups
    .map(group => {
      const filteredSubCategories = (group.subCategories || []).filter(subCategory =>
        ((subCategory.name || '').toLowerCase().includes(categorySearchTerm.toLowerCase())) ||
        ((subCategory.description || '').toLowerCase().includes(categorySearchTerm.toLowerCase()))
      );
      
      return {
        ...group,
        subCategories: filteredSubCategories
      };
    })
    .filter(group => 
      (group.subCategories || []).length > 0 ||
      (group.name || '').toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
      (group.description || '').toLowerCase().includes(categorySearchTerm.toLowerCase())
    );

  // When a category is selected, hide all other categories and show only the selected one
  const visibleCategoryGroups = formData.category
    ? categoryGroups
        .map(group => ({
          ...group,
          subCategories: group.subCategories.filter(subCategory => subCategory.id === formData.category)
        }))
        .filter(group => group.subCategories.length > 0)
    : filteredCategoryGroups;
  const validateStep = (step) => {
    const newErrors = {};

    if (formData.transactionType === 'transfer') {
      // Transfer validation flow
      switch (step) {
        case 1:
          if (!formData.transactionType) {
            newErrors.transactionType = 'লেনদেনের ধরন নির্বাচন করুন';
          } else if (!['credit', 'debit', 'transfer'].includes(formData.transactionType)) {
            newErrors.transactionType = 'লেনদেনের ধরন অবৈধ';
          }
          break;
        case 2:
          if (!formData.debitAccount.id) {
            newErrors.debitAccount = 'ডেবিট একাউন্ট নির্বাচন করুন';
          }
          break;
        case 3:
          if (!formData.creditAccount.id) {
            newErrors.creditAccount = 'ক্রেডিট একাউন্ট নির্বাচন করুন';
          } else if (formData.debitAccount.id === formData.creditAccount.id) {
            newErrors.creditAccount = 'ডেবিট এবং ক্রেডিট একাউন্ট একই হতে পারে না';
          }
          break;
        case 4:
          if (!formData.transferAmount) {
            newErrors.transferAmount = 'ট্রান্সফার পরিমাণ লিখুন';
          } else if (isNaN(parseFloat(formData.transferAmount)) || parseFloat(formData.transferAmount) <= 0) {
            newErrors.transferAmount = 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে';
          } else if (parseFloat(formData.transferAmount) > formData.debitAccount.balance) {
            newErrors.transferAmount = 'পরিমাণ একাউন্ট ব্যালেন্সের চেয়ে বেশি হতে পারে না';
          }
          break;
        case 5:
          // Final confirmation step
          break;
      }
    } else {
      // Regular credit/debit validation flow
      if (formData.transactionType === 'debit') {
        // Debit flow: skip invoice step
        switch (step) {
          case 1:
            if (!formData.transactionType) {
              newErrors.transactionType = 'লেনদেনের ধরন নির্বাচন করুন';
            } else if (!['credit', 'debit', 'transfer'].includes(formData.transactionType)) {
              newErrors.transactionType = 'লেনদেনের ধরন অবৈধ';
            }
            break;
          case 2:
            if (!formData.category) {
              newErrors.category = 'ক্যাটাগরি নির্বাচন করুন';
            }
            break;
          case 3:
            if (!formData.customerId) {
              newErrors.customerId = 'কাস্টমার নির্বাচন করুন';
            }
            break;
          case 4:
            if (!formData.paymentMethod) {
              newErrors.paymentMethod = 'পেমেন্ট মেথড নির্বাচন করুন';
            } else if (!['cash', 'bank-transfer', 'cheque', 'mobile-banking', 'others'].includes(formData.paymentMethod)) {
              newErrors.paymentMethod = 'পেমেন্ট মেথড অবৈধ';
            }
            // Only validate amount and accounts if payment method is selected
            if (formData.paymentMethod) {
              if (!formData.paymentDetails.amount) {
                newErrors.amount = 'পরিমাণ লিখুন';
              } else if (isNaN(parseFloat(formData.paymentDetails.amount)) || parseFloat(formData.paymentDetails.amount) <= 0) {
                newErrors.amount = 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে';
              }
              // Validate source account (where money goes from)
              if (!formData.sourceAccount.id) {
                newErrors.sourceAccount = 'সোর্স একাউন্ট নির্বাচন করুন';
              }
              // Validate customer bank account details for bank transfer
              if (formData.paymentMethod === 'bank-transfer') {
                if (!formData.customerBankAccount.bankName) {
                  newErrors.customerBankName = 'কাস্টমারের ব্যাংকের নাম লিখুন';
                }
                if (!formData.customerBankAccount.accountNumber) {
                  newErrors.customerAccountNumber = 'কাস্টমারের একাউন্ট নম্বর লিখুন';
                }
              }
            }
            break;
          case 5:
            // Final confirmation step for debit
            break;
        }
      } else {
        // Credit flow: include invoice step
        switch (step) {
          case 1:
            if (!formData.transactionType) {
              newErrors.transactionType = 'লেনদেনের ধরন নির্বাচন করুন';
            } else if (!['credit', 'debit', 'transfer'].includes(formData.transactionType)) {
              newErrors.transactionType = 'লেনদেনের ধরন অবৈধ';
            }
            break;
          case 2:
          if (!formData.category) {
            newErrors.category = 'ক্যাটাগরি নির্বাচন করুন';
          }
          break;
          case 3:
            if (!formData.customerId) {
              newErrors.customerId = 'কাস্টমার নির্বাচন করুন';
          }
          break;
        case 4:
          // Agent balance step - no validation needed, just display
          if (formData.customerType === 'agent') {
            // For agents, validate selectedOption
            if (!formData.selectedOption) {
              newErrors.selectedOption = 'পেমেন্টের ধরন নির্বাচন করুন';
            }
          }
          break;
        case 5:
          // Invoice selection - only for non-agent customers
          if (formData.customerType !== 'agent') {
            // Require invoice only when real API invoices are available
            if (!isUsingDemoInvoices) {
              if (!formData.selectedInvoice || !formData.invoiceId) {
                newErrors.invoiceId = 'ইনভয়েস নির্বাচন করুন';
              }
            }
          }
          break;
        case 6:
          if (!formData.paymentMethod) {
            newErrors.paymentMethod = 'পেমেন্ট মেথড নির্বাচন করুন';
          } else if (!['cash', 'bank-transfer', 'cheque', 'mobile-banking', 'others'].includes(formData.paymentMethod)) {
            newErrors.paymentMethod = 'পেমেন্ট মেথড অবৈধ';
          }
          // Only validate amount if payment method is selected
          if (formData.paymentMethod) {
            if (!formData.paymentDetails.amount) {
              newErrors.amount = 'পরিমাণ লিখুন';
            } else if (isNaN(parseFloat(formData.paymentDetails.amount)) || parseFloat(formData.paymentDetails.amount) <= 0) {
              newErrors.amount = 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে';
            }
            // For non-agent credit transactions, destination account can fallback to business account
            // So only require explicit destination/manager for agent flows
            if (formData.customerType === 'agent') {
              if (!formData.destinationAccount.id) {
                newErrors.destinationAccount = 'ডেস্টিনেশন একাউন্ট নির্বাচন করুন';
              }
              if (!formData.creditAccountManager.id) {
                newErrors.creditAccountManager = 'একাউন্ট ম্যানেজার নির্বাচন করুন';
              }
            } else {
              // If there is no business/account fallback available, require destination account explicitly
              const hasAnyAccount = Array.isArray(accounts) && accounts.length > 0;
              if (!hasAnyAccount && !formData.destinationAccount.id) {
                newErrors.destinationAccount = 'ডেস্টিনেশন একাউন্ট নির্বাচন করুন (কোন ডিফল্ট একাউন্ট নেই)';
              }
            }
            // Validate customer bank account details for bank transfer
            if (formData.paymentMethod === 'bank-transfer') {
              if (!formData.customerBankAccount.bankName) {
                newErrors.customerBankName = 'কাস্টমারের ব্যাংকের নাম লিখুন';
              }
              if (!formData.customerBankAccount.accountNumber) {
                newErrors.customerAccountNumber = 'কাস্টমারের একাউন্ট নম্বর লিখুন';
              }
            }
          }
          break;
        case 7:
          // Final confirmation step for agent transactions
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const nextStep = () => {
    if (validateStep(currentStep)) {
      let maxSteps;
      if (formData.transactionType === 'transfer') {
        maxSteps = 5;
      } else if (formData.transactionType === 'debit') {
        maxSteps = 5;
      } else {
        // Credit flow: for agents, skip invoice selection (step 5)
        maxSteps = formData.customerType === 'agent' ? 7 : 6;
      }
      
      // For agents, go to step 5 (payment method) from step 4
      if (formData.transactionType === 'credit' && formData.customerType === 'agent' && currentStep === 4) {
        setCurrentStep(5); // Go to payment method
      } else if (formData.transactionType === 'debit' && currentStep === 4) {
        // For debit, go directly to step 5 (confirmation) from step 4
        setCurrentStep(5);
      } else {
        setCurrentStep(prev => Math.min(prev + 1, maxSteps));
      }
    }
  };

  const prevStep = () => {
    // Special handling for agent: go back from step 5 to step 4
    if (formData.transactionType === 'credit' && formData.customerType === 'agent' && currentStep === 5) {
      setCurrentStep(4); // Go back to balance display
    } else if (formData.transactionType === 'debit' && currentStep === 5) {
      // For debit, go back from step 5 to step 4
      setCurrentStep(4);
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  };

  const goToStep = (step) => {
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = () => {
    console.log('TXN Save clicked', {
      currentStep,
      transactionType: formData.transactionType,
      customerType: formData.customerType,
      customerId: formData.customerId,
      paymentMethod: formData.paymentMethod,
      amount: formData?.paymentDetails?.amount,
    });
    const finalStep = formData.transactionType === 'credit' && formData.customerType === 'agent' ? 7 : 6;
    const isValid = validateStep(finalStep);
    if (!isValid) {
      console.warn('TXN validation failed at final step', { finalStep, errors });
      return;
    }

    // Handle account-to-account transfer
    if (formData.transactionType === 'transfer') {
      const transferAmount = parseFloat(formData.transferAmount);
      if (!transferAmount || transferAmount <= 0) {
        setErrors(prev => ({ ...prev, transferAmount: 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে' }));
        return;
      }

      // Validate debit account has sufficient balance
      if (transferAmount > formData.debitAccount.balance) {
        setErrors(prev => ({ ...prev, transferAmount: 'পরিমাণ একাউন্ট ব্যালেন্সের চেয়ে বেশি হতে পারে না' }));
        return;
      }
      
      // Call new backend transfer API using the dedicated transfer hook
      const transferPayload = {
        fromAccountId: formData.debitAccount.id,
        toAccountId: formData.creditAccount.id,
        amount: transferAmount,
        reference: formData.transferReference || `TXN-${Date.now()}`,
        notes: formData.transferNotes || `Transfer from ${formData.debitAccount.bankName} (${formData.debitAccount.accountNumber}) to ${formData.creditAccount.bankName} (${formData.creditAccount.accountNumber})`,
        createdBy: userProfile?.email || 'unknown_user',
        branchId: userProfile?.branchId || 'main_branch',
        accountManager: formData.accountManager || null
      };

      // Use the dedicated bank account transfer mutation
      bankAccountTransferMutation.mutate(transferPayload, {
        onSuccess: (response) => {
          console.log('Transfer completed:', response);
          
          // Reset form after successful submission
          resetForm();
        }
      });

      return;
    }

    // Handle regular transactions (credit/debit)
    // Basic final guards for credit/debit
    if (!formData.customerId) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কাস্টমার নির্বাচন করুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
      console.warn('TXN blocked: no customerId');
      return;
    }

    if (!formData.paymentMethod) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'পেমেন্ট মেথড নির্বাচন করুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
      console.warn('TXN blocked: no paymentMethod');
      return;
    }

    const amount = parseFloat(formData.paymentDetails.amount);
    if (!amount || amount <= 0) {
      setErrors(prev => ({ ...prev, amount: 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে' }));
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
      console.warn('TXN blocked: invalid amount', { amountRaw: formData.paymentDetails.amount });
      return;
    }

    // Map customerType to partyType for backend compatibility
    const mapPartyType = (customerType) => {
      if (customerType === 'vendor') return 'vendor';
      if (customerType === 'agent') return 'agent';
      if (customerType === 'haji') return 'haji';
      if (customerType === 'umrah') return 'umrah';
      if (customerType === 'loan') return 'loan';
      return 'customer';
    };

    // Choose account based on transaction type
    const isDebit = formData.transactionType === 'debit';
    const isCredit = formData.transactionType === 'credit';
    const isAgent = formData.customerType === 'agent';
    // Fallback when nothing is selected
    const businessFallback = accounts.find(a => a.type === 'business') || accounts[0];
    // For credit: use the selected company account input (sourceAccount) as the receiving/target account.
    // If not selected, try destinationAccount (agent flow), else fallback.
    const selectedAccount = isDebit
      ? formData.sourceAccount
      : (isCredit
          ? (formData.sourceAccount?.id
              ? formData.sourceAccount
              : (formData.destinationAccount?.id ? formData.destinationAccount : businessFallback))
          : undefined);

    // Validate required account selection for credit/debit
    if (isDebit && !selectedAccount?.id) {
      const msg = isDebit ? 'সোর্স একাউন্ট নির্বাচন করুন' : 'ডেস্টিনেশন একাউন্ট নির্বাচন করুন';
      setErrors(prev => ({
        ...prev,
        [isDebit ? 'sourceAccount' : 'destinationAccount']: msg
      }));
      Swal.fire({
        title: 'ত্রুটি!',
        text: msg,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
      return;
    }

    // Prepare transaction data for the unified createTransaction mutation
    const resolvedServiceCategory =
      // Prefer explicit serviceCategory if provided (e.g., 'hajj' | 'umrah')
      (formData.serviceCategory && String(formData.serviceCategory).trim()) ||
      // For agents, use selectedOption slug
      ((formData.customerType === 'agent' && formData.selectedOption) ? formData.selectedOption :
      // For haji/umrah customers, enforce slug
      (formData.customerType === 'haji' ? 'hajj' : (formData.customerType === 'umrah' ? 'umrah' :
      // For loans, map by transaction type
      (formData.customerType === 'loan' ? (isDebit ? 'loan-giving' : 'loan-repayment') : formData.category))));

    const unifiedTransactionData = {
      transactionType: formData.transactionType,
      // Add partyType and partyId for backend API compatibility
      partyType: mapPartyType(formData.customerType),
      partyId: formData.customerId ? String(formData.customerId) : undefined,
      // Keep customerId for backward compatibility
      customerId: formData.customerId ? String(formData.customerId) : undefined,
      // Add targetAccountId for backend API (for credit/debit transactions)
      targetAccountId: selectedAccount?.id || null,
      // Only set debitAccount for debit transactions
      debitAccount: isDebit ? {
        id: formData.sourceAccount.id,
        name: formData.sourceAccount.name,
        bankName: formData.sourceAccount.bankName,
        accountNumber: formData.sourceAccount.accountNumber
      } : null,
      // Only set creditAccount for credit transactions
      creditAccount: isCredit && formData.destinationAccount?.id ? {
        id: formData.destinationAccount.id,
        name: formData.destinationAccount.name,
        bankName: formData.destinationAccount.bankName,
        accountNumber: formData.destinationAccount.accountNumber
      } : null,
      paymentDetails: {
        amount: amount,
        bankName: formData.paymentDetails.bankName || null,
        accountNumber: formData.paymentDetails.accountNumber || null,
        chequeNumber: formData.paymentDetails.chequeNumber || null,
        mobileProvider: formData.paymentDetails.mobileProvider || null,
        transactionId: formData.paymentDetails.transactionId || null,
        reference: formData.paymentDetails.reference || null
      },
      serviceCategory: resolvedServiceCategory,
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      customerBankAccount: {
        bankName: formData.customerBankAccount.bankName || null,
        accountNumber: formData.customerBankAccount.accountNumber || null
      },
      // Provide display fields so list can show name for Haji/Umrah too
      customerName: formData.customerName || undefined,
      customerPhone: formData.customerPhone || undefined,
      customerEmail: formData.customerEmail || undefined,
      // Some backends use partyName for generic parties
      partyName: formData.customerName || undefined,
      // Pass meta to backend for better categorization (agent: hajj/umrah/others)
      meta: formData.selectedOption ? { selectedOption: formData.selectedOption } : undefined,
      notes: formData.notes || null,
      invoiceId: formData.invoiceId || null,
      accountManagerId: formData.accountManager?.id || null,
      date: new Date().toISOString().split('T')[0],
      createdBy: userProfile?.email || 'unknown_user',
      branchId: userProfile?.branchId || 'main_branch',
      employeeReference: formData.employeeReference?.id ? formData.employeeReference : null
    };

    // Log the data being sent for debugging
    console.log('Submitting credit/debit transaction payload:', unifiedTransactionData);

    createTransactionMutation.mutate(unifiedTransactionData, {
      onSuccess: async (response) => {
        console.log('Transaction response:', response);
        
        const txId =
          response?.transaction?._id ||
          response?.transaction?.transactionId ||
          response?.data?.transaction?._id ||
          response?.data?.transaction?.transactionId ||
          response?.data?.transactionId ||
          response?.transactionId;
        if (!txId) {
          console.error('No transaction ID found in response');
          resetForm();
          return;
        }

        // Complete the transaction atomically on backend (idempotent)
        // This will update accounts, parties (agent/customer/vendor), and invoices
        completeTransactionMutation.mutate(txId, {
          onSuccess: (completeData) => {
            console.log('Transaction completed successfully:', completeData);
            
            // Additional cache invalidation for invoice if present
            if (unifiedTransactionData.invoiceId) {
              queryClient.invalidateQueries({ queryKey: [...transactionKeys.invoices(), unifiedTransactionData.invoiceId] });
            }
            // Ensure vendor caches refresh even if backend didn't return vendor snapshot
            const partyType = unifiedTransactionData.partyType;
            const partyId = unifiedTransactionData.partyId || unifiedTransactionData.customerId;
            if (partyType === 'vendor' && partyId) {
              queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
              queryClient.invalidateQueries({ queryKey: vendorKeys.detail(partyId) });
              queryClient.invalidateQueries({ queryKey: [...vendorKeys.detail(partyId), 'financials'] });
            }
          },
          onError: (error) => {
            console.error('Transaction completion failed:', error);
            Swal.fire({
              title: 'সতর্কতা!',
              text: 'লেনদেন তৈরি হয়েছে কিন্তু সম্পূর্ণ করতে সমস্যা হয়েছে। পরবর্তীতে আবার সম্পূর্ণ করার চেষ্টা করুন।',
              icon: 'warning',
              confirmButtonText: 'ঠিক আছে',
              confirmButtonColor: '#F59E0B',
              background: isDark ? '#1F2937' : '#FEF2F2'
            });
          }
        });

        // Reset form after successful submission
        resetForm();

        // Ask if user wants to download PDF
        Swal.fire({
          title: 'PDF ডাউনলোড করুন?',
          text: 'আপনি কি লেনদেনের রিসিট PDF হিসেবে ডাউনলোড করতে চান?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'হ্যাঁ, ডাউনলোড করুন',
          cancelButtonText: 'না, পরে করব',
          confirmButtonColor: '#10B981',
          cancelButtonColor: '#6B7280',
          background: isDark ? '#1F2937' : '#F9FAFB',
          customClass: {
            title: 'text-blue-600 font-bold text-xl',
            popup: 'rounded-2xl shadow-2xl'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            // Generate PDF with the created transaction data
            const pdfData = {
              transactionId: response.transaction?.transactionId || `TXN-${Date.now()}`,
              transactionType: formData.transactionType,
              customerId: formData.customerId,
              customerName: formData.customerName,
              customerPhone: formData.customerPhone,
              customerEmail: formData.customerEmail,
              customerBankAccount: formData.customerBankAccount,
              category: formData.category,
              paymentMethod: formData.paymentMethod,
              paymentDetails: formData.paymentDetails,
              notes: formData.notes,
              date: formData.date,
              createdBy: userProfile?.email || 'unknown_user',
              branchId: userProfile?.branchId || 'main_branch'
            };
            
            generateTransactionPDF(pdfData, isDark).then(result => {
              if (result.success) {
                Swal.fire({
                  title: 'সফল!',
                  text: `PDF সফলভাবে ডাউনলোড হয়েছে: ${result.filename}`,
                  icon: 'success',
                  confirmButtonText: 'ঠিক আছে',
                  confirmButtonColor: '#10B981',
                  background: isDark ? '#1F2937' : '#F9FAFB'
                });
              }
            }).catch(error => {
              console.error('PDF generation error:', error);
            });
          }
        });
      },
      onError: (error) => {
        console.error('Create transaction failed:', error);
        const message = error?.response?.data?.message || error?.message || 'লেনদেন তৈরি করতে সমস্যা হয়েছে।';
        Swal.fire({
          title: 'ত্রুটি!',
          text: message,
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
          background: isDark ? '#1F2937' : '#FEF2F2'
        });
      },
      onSettled: () => {
        console.log('Create transaction settled');
      }
    });
  };
  // Helper function to reset form
  const resetForm = () => {
    setFormData({
      transactionType: '',
      customerType: 'customer',
      customerId: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerBankAccount: {
        bankName: '',
        accountNumber: ''
      },
      category: '',
      serviceCategory: '',
      selectedInvoice: null,
      invoiceId: '',
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
      sourceAccount: {
        id: '',
        name: '',
        bankName: '',
        accountNumber: '',
        balance: 0
      },
      destinationAccount: {
        id: '',
        name: '',
        bankName: '',
        accountNumber: '',
        balance: 0
      },
      debitAccount: {
        id: '',
        name: '',
        bankName: '',
        accountNumber: '',
        balance: 0
      },
      creditAccount: {
        id: '',
        name: '',
        bankName: '',
        accountNumber: '',
        balance: 0
      },
      transferAmount: '',
      transferReference: '',
      transferNotes: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      employeeReference: {
        id: '',
        name: '',
        employeeId: '',
        position: '',
        department: ''
      },
      loanInfo: {
        id: '',
        name: '',
        direction: ''
      }
    });
    setCurrentStep(1);
    setSearchTerm('');
    setSelectedSearchType('customer');
    setDebitAccountSearchTerm('');
    setCreditAccountSearchTerm('');
  };

  const generatePDF = async () => {
    try {
      // Show loading alert
      Swal.fire({
        title: 'PDF তৈরি হচ্ছে...',
        text: 'রিসিট ডাউনলোড হচ্ছে',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        background: isDark ? '#1F2937' : '#F9FAFB'
      });

      // Prepare transaction data for PDF
      const pdfData = {
        transactionId: `TXN-${Date.now()}`,
        transactionType: formData.transactionType,
        customerId: formData.customerId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentDetails,
        notes: formData.notes,
        date: formData.date,
        createdBy: userProfile?.email || 'unknown_user',
        branchId: userProfile?.branchId || 'main_branch'
      };

      // Try to generate PDF with HTML rendering first
      let result = await generateTransactionPDF(pdfData, isDark);
      
      // If HTML rendering fails, fallback to simple PDF
      if (!result.success) {
        console.log('HTML PDF generation failed, trying simple PDF...');
        result = generateSimplePDF(pdfData);
      }

      // Close loading alert
      Swal.close();

      if (result.success) {
        Swal.fire({
          title: 'সফল!',
          text: `PDF সফলভাবে ডাউনলোড হয়েছে: ${result.filename}`,
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          background: isDark ? '#1F2937' : '#F9FAFB',
          customClass: {
            title: 'text-green-600 font-bold text-xl',
            popup: 'rounded-2xl shadow-2xl'
          }
        });
      } else {
        throw new Error(result.error || 'PDF generation failed');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Swal.close();
      
      Swal.fire({
        title: 'ত্রুটি!',
        text: `PDF তৈরি করতে সমস্যা হয়েছে: ${error.message}`,
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

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile?.includes(searchTerm) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  const selectedPaymentMethod = paymentMethods.find(method => method.id === formData.paymentMethod);
  
  // Find selected category from all sub-categories
  const selectedCategory = categoryGroups
    .flatMap(group => group.subCategories)
    .find(cat => cat.id === formData.category);

  // Get default business account (main business account)
  const defaultBusinessAccount = accounts.find(account => account.type === 'business') || accounts[0];

  // Calculate customer balance from transactions
  const calculateCustomerBalance = (customerId) => {
    if (!customerId || !transactionsData?.transactions) return 0;
    
    const customerTransactions = transactionsData.transactions.filter(transaction => 
      transaction.customerId === customerId
    );
    
    let balance = 0;
    customerTransactions.forEach(transaction => {
      const amount = transaction.paymentDetails?.amount || transaction.amount || 0;
      if (transaction.transactionType === 'credit') {
        balance += amount;
      } else if (transaction.transactionType === 'debit') {
        balance -= amount;
      }
    });
    
    return balance;
  };
  const customerBalance = formData.customerId ? calculateCustomerBalance(formData.customerId) : 0;
  return (
    <div className={`min-h-screen p-2 sm:p-4 lg:p-6 transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900' 
        : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  নতুন লেনদেন
                </h1>
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Step-by-Step লেনদেন প্রক্রিয়া
                </p>
              </div>
            </div>
            
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 self-start sm:self-auto">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">ফিরে যান</span>
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className={`mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-4 border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          {/* Mobile Steps */}
          <div className="flex md:hidden items-center justify-between overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center min-w-0">
                <button
                  onClick={() => goToStep(step.number)}
                  className={`flex items-center gap-1 p-1 sm:p-2 rounded-lg transition-all duration-300 ${
                    currentStep === step.number
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : currentStep > step.number
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  } ${currentStep >= step.number ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {currentStep > step.number ? <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3" /> : step.number}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold truncate max-w-16">{step.title.split(' ')[0]}</div>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 mx-0.5 sm:mx-1 transition-colors duration-300 ${
                    currentStep > step.number ? 'text-green-500' : 'text-gray-400'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Desktop Steps */}
          <div className="hidden md:flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => goToStep(step.number)}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
                    currentStep === step.number
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : currentStep > step.number
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  } ${currentStep >= step.number ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {currentStep > step.number ? <CheckCircle className="w-3 h-3" /> : step.number}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{step.title}</div>
                    <div className="text-xs opacity-75">{step.description}</div>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className={`w-4 h-4 mx-1 transition-colors duration-300 ${
                    currentStep > step.number ? 'text-green-500' : 'text-gray-400'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          {/* Step 1: Transaction Type */}
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

          {/* Step 2: Category Selection (for credit/debit) or Debit Account Selection (for transfer) */}
          {currentStep === 2 && (
            <div className="p-3 sm:p-4 lg:p-6">
              {formData.transactionType === 'transfer' ? (
                // Transfer: Debit Account Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ডেবিট একাউন্ট নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    অর্থ উত্তোলনের জন্য একাউন্ট সিলেক্ট করুন
                  </p>
                </div>
              ) : (
                // Credit/Debit: Category Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    সেবার ক্যাটাগরি নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    আপনি কোন ধরনের সেবা প্রদান করছেন?
                  </p>
                </div>
              )}

                {formData.transactionType === 'transfer' ? (
                  // Transfer: Debit Account List
                <div className="max-w-4xl mx-auto">
                    {/* Debit Account Search Bar */}
                    <div className="relative mb-3 sm:mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="ডেবিট একাউন্ট খুঁজুন... (নাম, ব্যাংক, একাউন্ট নম্বর)"
                        value={debitAccountSearchTerm}
                        onChange={(e) => setDebitAccountSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                    {filteredDebitAccounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => handleAccountSelect(account, 'debitAccount')}
                        className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                          formData.debitAccount?.id === account.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              formData.debitAccount?.id === account.id
                                ? 'bg-blue-100 dark:bg-blue-800'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <CreditCardIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                formData.debitAccount?.id === account.id
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </div>
                            <div className="text-left min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                {account.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                {account.bankName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                A/C: {account.accountNumber}
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                              ৳{account.balance.toLocaleString()}
                            </p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              account.type === 'business' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : account.type === 'hajj'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : account.type === 'umrah'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {account.type === 'business' ? 'ব্যবসায়িক' : 
                               account.type === 'hajj' ? 'হজ্জ' : 
                               account.type === 'umrah' ? 'উমরাহ' :
                               account.type === 'airline' ? 'এয়ারলাইন' :
                               account.type === 'visa' ? 'ভিসা' : 'সঞ্চয়'}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                    </div>
                </div>
                ) : null}
                
                {formData.transactionType !== 'transfer' && (
                // Credit/Debit: Category Selection
                  <>
                  {/* Category Search Bar */}
                  <div className="relative mb-4 sm:mb-6 max-w-md mx-auto">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                      placeholder="ক্যাটাগরি খুঁজুন..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>

                  {/* Category Groups */}
                  <div className="max-w-6xl mx-auto space-y-3 sm:space-y-4">
                    {categoriesLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                        <p className="text-gray-500 dark:text-gray-400">ক্যাটাগরি লোড হচ্ছে...</p>
                      </div>
                    ) : (
                      <>
                        {visibleCategoryGroups.map((group) => (
                          <div key={group.id} className={`rounded-lg border transition-all duration-200 ${
                            isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                          }`}>
                            {/* Main Category Header */}
                            <button
                              onClick={() => toggleCategoryGroup(group.id)}
                              className={`w-full p-3 sm:p-4 rounded-lg transition-all duration-200 hover:bg-opacity-80 ${
                                expandedCategories[group.id] 
                                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl sm:text-3xl">{group.icon}</div>
                                  <div className="text-left">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                      {group.name}
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {group.description}
                                    </p>
                                  </div>
                                </div>
                                <div className={`transform transition-transform duration-200 ${
                                  expandedCategories[group.id] ? 'rotate-180' : ''
                                }`}>
                                  <ChevronDown className="w-5 h-5 text-gray-500" />
                                </div>
                              </div>
                            </button>

                            {/* Sub Categories */}
                            {expandedCategories[group.id] && (
                              <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                  {group.subCategories.map((subCategory) => (
                                    <button
                                      key={subCategory.id}
                                      onClick={() => handleCategorySelect(subCategory.id)}
                                      className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 text-left ${
                                        formData.category === subCategory.id
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                    }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="text-lg sm:text-xl">{subCategory.icon}</div>
                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                            {subCategory.name}
                                          </h4>
                                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                            {subCategory.description}
                                          </p>
                                        </div>
                                        {formData.category === subCategory.id && (
                                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        )}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {visibleCategoryGroups.length === 0 && (
                          <div className="text-center py-8">
                            <div className="text-4xl mb-3">🔍</div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                              {categorySearchTerm ? 'কোন ক্যাটাগরি পাওয়া যায়নি' : 'কোন ক্যাটাগরি নেই'}
                            </p>
                            {categorySearchTerm && (
                              <button
                                onClick={() => setCategorySearchTerm('')}
                                className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                              >
                                সব ক্যাটাগরি দেখুন
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {errors.category && (
                    <p className="text-red-500 text-center mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      {errors.category}
                    </p>
                  )}
                </>
                )}
            </div>
          )}
          {/* Step 3: Customer Selection (for credit/debit) or Credit Account Selection (for transfer) */}
          {currentStep === 3 && (
            <div className="p-3 sm:p-4 lg:p-6">
              {formData.transactionType === 'transfer' ? (
                // Transfer: Credit Account Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ক্রেডিট একাউন্ট নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    অর্থ জমা করার জন্য একাউন্ট সিলেক্ট করুন
                  </p>
                </div>
              ) : (
                // Credit/Debit: Customer Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    কাস্টমার নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    লেনদেনের জন্য কাস্টমার সিলেক্ট করুন
                  </p>
                </div>
              )}

              {formData.transactionType === 'transfer' ? (
                // Transfer: Credit Account List
                <div className="max-w-4xl mx-auto">
                  {/* Credit Account Search Bar */}
                  <div className="relative mb-3 sm:mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ক্রেডিট একাউন্ট খুঁজুন... (নাম, ব্যাংক, একাউন্ট নম্বর)"
                      value={creditAccountSearchTerm}
                      onChange={(e) => setCreditAccountSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                    {filteredCreditAccounts
                      .filter(account => account.id !== formData.debitAccount?.id) // Exclude selected debit account
                      .map((account) => (
                        <button
                          key={account.id}
                          onClick={() => handleAccountSelect(account, 'creditAccount')}
                          className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                            formData.creditAccount?.id === account.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                formData.creditAccount?.id === account.id
                                  ? 'bg-blue-100 dark:bg-blue-800'
                                  : 'bg-gray-100 dark:bg-gray-700'
                              }`}>
                                <CreditCardIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                  formData.creditAccount?.id === account.id
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`} />
                              </div>
                              <div className="text-left min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                  {account.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {account.bankName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                  A/C: {account.accountNumber}
                                </p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                                ৳{account.balance.toLocaleString()}
                              </p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                account.type === 'business' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                  : account.type === 'hajj'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : account.type === 'umrah'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                              }`}>
                                {account.type === 'business' ? 'ব্যবসায়িক' : 
                                 account.type === 'hajj' ? 'হজ্জ' : 
                                 account.type === 'umrah' ? 'উমরাহ' :
                                 account.type === 'airline' ? 'এয়ারলাইন' :
                                 account.type === 'visa' ? 'ভিসা' : 'সঞ্চয়'}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>

                  {errors.creditAccount && (
                    <p className="text-red-500 text-center mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      {errors.creditAccount}
                    </p>
                  )}
                </div>
              ) : (
                // Credit/Debit: Customer Selection
                <div className="max-w-4xl mx-auto">
                  {/* Type Selector */}
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                    {['customer','vendor','agent','haji','umrah','loans'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => { setSelectedSearchType(type); setSearchTerm(''); }}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          selectedSearchType === type
                            ? 'bg-blue-600 text-white border-blue-600'
                            : (isDark ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-300 hover:border-blue-400')
                        }`}
                      >
                        {type === 'customer' ? 'Customer' : 
                         type === 'vendor' ? 'Vendor' : 
                         type === 'agent' ? 'Agent' :
                         type === 'haji' ? 'Haji' :
                         type === 'umrah' ? 'Umrah' : 'Loans'}
                      </button>
                    ))}
                  </div>
                  {/* Search Bar */}
                  <div className="relative mb-3 sm:mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    {searchLoading && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                    )}
                    <input
                      type="text"
                      placeholder={
                        selectedSearchType === 'customer'
                          ? 'কাস্টমার খুঁজুন... (নাম/ফোন/ইমেইল)'
                          : selectedSearchType === 'vendor'
                          ? 'ভেন্ডর খুঁজুন... (নাম/ফোন)'
                          : selectedSearchType === 'agent'
                          ? 'এজেন্ট খুঁজুন... (নাম/ফোন)'
                          : selectedSearchType === 'haji'
                          ? 'হাজি খুঁজুন... (নাম/ফোন/পাসপোর্ট)'
                          : selectedSearchType === 'umrah'
                          ? 'উমরাহ খুঁজুন... (নাম/ফোন/পাসপোর্ট)'
                          : 'লোন খুঁজুন... (আইডি/নাম)'
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                    />
                  </div>

                  {/* Customer / Agent / Vendor List */}
                  <div className="space-y-2 max-h-60 sm:max-h-80 overflow-y-auto">
                    {(selectedSearchType === 'agent' && (agentLoading || searchLoading)) ||
                     (selectedSearchType === 'vendor' && (vendorLoading || searchLoading)) ||
                     (selectedSearchType === 'customer' && (customersLoading || searchLoading)) ||
                     (selectedSearchType === 'haji' && (hajiLoading || searchLoading)) ||
                     (selectedSearchType === 'umrah' && (umrahLoading || searchLoading)) ||
                     (selectedSearchType === 'loans' && (loansSearchLoading || searchLoading)) ? (
                      <div className="flex items-center justify-center py-6 sm:py-8">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                          {selectedSearchType === 'customer' ? 'কাস্টমার লোড হচ্ছে...' : 
                           selectedSearchType === 'vendor' ? 'ভেন্ডর লোড হচ্ছে...' : 
                           selectedSearchType === 'agent' ? 'এজেন্ট লোড হচ্ছে...' :
                           selectedSearchType === 'haji' ? 'হাজি লোড হচ্ছে...' :
                           selectedSearchType === 'umrah' ? 'উমরাহ লোড হচ্ছে...' : 'লোন লোড হচ্ছে...'}
                        </span>
                      </div>
                    ) : selectedSearchType === 'haji' ? (
                      // Haji Results
                      hajiData?.data?.length > 0 ? (
                        hajiData.data
                          .filter(haji => 
                            !searchTerm || 
                            haji.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            haji.mobile?.includes(searchTerm) ||
                            haji.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((haji) => (
                            <button
                              key={`haji-${haji._id || haji.id}`}
                              onClick={() => handleCustomerSelect({
                                id: haji._id || haji.id,
                                name: haji.name,
                                phone: haji.mobile,
                                email: haji.email,
                                customerType: 'haji'
                              })}
                              className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                                formData.customerId === (haji._id || haji.id)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  formData.customerId === (haji._id || haji.id)
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'bg-green-100 dark:bg-green-800'
                                }`}>
                                  <span className="text-lg">🕋</span>
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                    {haji.name}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {haji.mobile}
                                  </p>
                                  {haji.passportNumber && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                      পাসপোর্ট: {haji.passportNumber}
                                    </p>
                                  )}
                                </div>
                                {formData.customerId === (haji._id || haji.id) && (
                                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                          {searchTerm ? 'কোন হাজি পাওয়া যায়নি' : 'কোন হাজি নেই'}
                        </div>
                      )
                    ) : selectedSearchType === 'umrah' ? (
                      // Umrah Results
                      umrahData?.data?.length > 0 ? (
                        umrahData.data
                          .filter(umrah => 
                            !searchTerm || 
                            umrah.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            umrah.mobile?.includes(searchTerm) ||
                            umrah.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((umrah) => (
                            <button
                              key={`umrah-${umrah._id || umrah.id}`}
                              onClick={() => handleCustomerSelect({
                                id: umrah._id || umrah.id,
                                name: umrah.name,
                                phone: umrah.mobile,
                                email: umrah.email,
                                customerType: 'umrah'
                              })}
                              className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                                formData.customerId === (umrah._id || umrah.id)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  formData.customerId === (umrah._id || umrah.id)
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'bg-purple-100 dark:bg-purple-800'
                                }`}>
                                  <span className="text-lg">🕌</span>
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                    {umrah.name}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {umrah.mobile}
                                  </p>
                                  {umrah.passportNumber && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                      পাসপোর্ট: {umrah.passportNumber}
                                    </p>
                                  )}
                                </div>
                                {formData.customerId === (umrah._id || umrah.id) && (
                                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                          {searchTerm ? 'কোন উমরাহ পাওয়া যায়নি' : 'কোন উমরাহ নেই'}
                        </div>
                      )
                    ) : selectedSearchType === 'agent' ? (
                        agentResults.length > 0 ? (
                        agentResults.map((agent) => (
                          <button
                            key={`agent-${agent._id || agent.id}`}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAgentSelect(agent);
                            }}
                            className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-102 ${
                              formData.customerId === (agent._id || agent.id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                      {agent.tradeName || agent.ownerName}
                                    </h3>
                                    <span className="inline-block px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                                      Agent
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {agent.ownerName} • {agent.contactNo}
                                  </p>
                                  {agent.tradeLocation && (
                                    <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full mt-1">
                                      {agent.tradeLocation}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {formData.customerId === (agent._id || agent.id) && (
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))) : (
                          <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">কোন এজেন্ট পাওয়া যায়নি</div>
                        )
                    ) : selectedSearchType === 'vendor' ? (
                        vendorResults.length > 0 ? (
                        vendorResults.map((vendor) => (
                          <button
                            key={`vendor-${vendor._id || vendor.id}`}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleVendorSelect(vendor);
                            }}
                            className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-102 ${
                              formData.customerId === (vendor._id || vendor.id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                      {vendor.tradeName || vendor.vendorName || vendor.name}
                                    </h3>
                                    <span className={`inline-block px-1.5 py-0.5 text-xs rounded-full ${
                                      vendor._type === 'agent' 
                                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                        : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                    }`}>
                                      {vendor._type === 'agent' ? 'Agent' : 'Vendor'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {vendor.ownerName} • {vendor.contactNo}
                                  </p>
                                  {vendor.tradeLocation && (
                                    <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs rounded-full mt-1">
                                      {vendor.tradeLocation}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {formData.customerId === (vendor._id || vendor.id) && (
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))) : (
                          <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">কোন ভেন্ডর পাওয়া যায়নি</div>
                        )
                        ) : selectedSearchType === 'loans' ? (
                      loansSearch.length > 0 ? (
                        loansSearch.map((loan) => (
                          <button
                            key={`loan-${loan._id || loan.id || loan.loanId}`}
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLoanSelect(loan); }}
                            className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 text-left hover:scale-[1.01] ${
                              (formData.loanInfo?.id && (formData.loanInfo.id === (loan._id || loan.id || loan.loanId)))
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : (isDark ? 'border-gray-600 bg-gray-800 hover:border-blue-300' : 'border-gray-200 bg-white hover:border-blue-300')
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                      {loan.customerName || loan.borrowerName || loan.fullName || loan.businessName || loan.tradeName || loan.ownerName || loan.name || 'Unknown'}
                                    </h3>
                                    <span className={`inline-block px-1.5 py-0.5 text-xs rounded-full ${
                                      (loan.loanDirection || loan.direction) === 'giving'
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                    }`}>
                                      {(loan.loanDirection || loan.direction) === 'giving' ? 'Giving' : 'Receiving'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">কোন লোন পাওয়া যায়নি</div>
                      )
                    ) : filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                      <button
                          key={customer.id || customer.customerId}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCustomerSelect(customer);
                          }}
                          className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-102 ${
                            formData.customerId === (customer.id || customer.customerId)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                        }`}
                      >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="text-left min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                    {customer.name}
                                  </h3>
                                  {customer.customerType === 'vendor' || customer.customerType === 'Vendor' ? (
                                    <span className="inline-block px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                                      Vendor
                                    </span>
                                  ) : customer.customerType === 'agent' || customer.customerType === 'Agent' ? (
                                    <span className="inline-block px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                                      Agent
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {customer.mobile || customer.phone} • {customer.email}
                                </p>
                                {customer.customerType && customer.customerType !== 'vendor' && customer.customerType !== 'Vendor' && customer.customerType !== 'agent' && customer.customerType !== 'Agent' && (
                                  <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full mt-1">
                                    {customer.customerType}
                                  </span>
                                )}
                              </div>
                            </div>
                            {formData.customerId === (customer.id || customer.customerId) && (
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                            )}
                        </div>
                      </button>
                      ))
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                        {selectedSearchType === 'customer' ? (searchTerm ? 'কোন কাস্টমার পাওয়া যায়নি' : 'কোন কাস্টমার নেই') : 
                         selectedSearchType === 'vendor' ? 'কোন ভেন্ডর পাওয়া যায়নি' : 
                         selectedSearchType === 'agent' ? 'কোন এজেন্ট পাওয়া যায়নি' :
                         selectedSearchType === 'haji' ? (searchTerm ? 'কোন হাজি পাওয়া যায়নি' : 'কোন হাজি নেই') :
                         (searchTerm ? 'কোন উমরাহ পাওয়া যায়নি' : 'কোন উমরাহ নেই')}
                      </div>
                    )}
                  </div>

                  {errors.customerId && (
                    <p className="text-red-500 text-center mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      {errors.customerId}
                    </p>
                  )}

                {/* Selected customer's Loan IDs (hidden as per requirement) */}
                {false && formData.customerId && (
                  <div className="mt-4">
                    <h3 className={`text-sm sm:text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-2`}>
                      নির্বাচিত কাস্টমারের লোন আইডি
                    </h3>
                    {customerLoansLoading ? (
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>লোড হচ্ছে...</span>
                      </div>
                    ) : customerLoans.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {customerLoans.map((loan) => (
                          <span
                            key={loan._id || loan.id || loan.loanId}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            <Receipt className="w-3 h-3" />
                            {loan.loanId || loan.id || loan._id}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">কোনো লোন পাওয়া যায়নি</p>
                    )}
                  </div>
                )}
                </div>
              )}
            </div>
          )}
          {/* Step 4: Agent Balance Display (for credit with agent) or Invoice Selection (for credit with customer) or Account Manager Selection (for transfer) or Payment Method (for debit) */}
          {currentStep === 4 && (
            <div className="p-3 sm:p-4 lg:p-6">
              {formData.transactionType === 'credit' && formData.customerType === 'agent' ? (
                // Agent Balance Display
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    এজেন্টের ব্যালেন্স তথ্য
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    এজেন্টের বর্তমান ব্যালেন্স এবং বকেয়া পরিমাণ দেখুন
                  </p>
                </div>
              ) : formData.transactionType === 'transfer' ? (
                // Transfer: Transfer Details and Account Manager Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ট্রান্সফার বিবরণ ও একাউন্ট ম্যানেজার নির্বাচন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    ট্রান্সফার পরিমাণ লিখুন এবং অনুমোদনের জন্য একাউন্ট ম্যানেজার সিলেক্ট করুন
                  </p>
                </div>
              ) : formData.transactionType === 'debit' ? (
                // Debit: Payment Method Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    পেমেন্ট মেথড নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    পেমেন্টের ধরন এবং বিবরণ নির্বাচন করুন
                  </p>
                </div>
              ) : (
                // Credit: Invoice Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ইনভয়েস নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    পেমেন্টের জন্য ইনভয়েস সিলেক্ট করুন
                  </p>
                </div>
              )}

              <div className="max-w-6xl mx-auto">
                {formData.transactionType === 'credit' && formData.customerType === 'agent' ? (
                  // Agent Balance Display
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        {formData.customerName} - ব্যালেন্স তথ্য
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Deposit */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট ডিপোজিট</p>
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                ৳{formData.agentDueInfo?.totalDeposit?.toLocaleString() || '0'}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                        </div>

                        {/* Total Due */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট বকেয়া</p>
                              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                ৳{formData.agentDueInfo?.totalDue?.toLocaleString() || '0'}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                              <AlertCircle className="w-6 h-6 text-orange-600" />
                            </div>
                          </div>
                        </div>

                        {/* Umrah Due */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">উমরাহ বকেয়া</p>
                              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                ৳{formData.agentDueInfo?.umrahDue?.toLocaleString() || '0'}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                          </div>
                        </div>

                        {/* Hajj Due */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">হজ্জ বকেয়া</p>
                              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                ৳{formData.agentDueInfo?.hajDue?.toLocaleString() || '0'}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                              <Building className="w-6 h-6 text-red-600" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-medium mb-1">ব্যালেন্স তথ্য সম্পর্কে:</p>
                            <ul className="space-y-1 text-xs">
                              <li>• মোট ব্যালেন্স: এজেন্টের সামগ্রিক ব্যালেন্স</li>
                              <li>• মোট বকেয়া: সমস্ত বকেয়া পরিমাণের যোগফল</li>
                              <li>• উমরাহ বকেয়া: উমরাহ প্যাকেজের জন্য বকেয়া</li>
                              <li>• হজ্জ বকেয়া: হজ্জ প্যাকেজের জন্য বকেয়া</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Selection Options */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                          <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          নির্বাচন করুন
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        {/* Hajj Option */}
                        <div 
                          className={`rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            formData.selectedOption === 'hajj' 
                              ? 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-400 dark:border-amber-500 shadow-lg' 
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, selectedOption: 'hajj' }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-sm font-medium ${
                                formData.selectedOption === 'hajj' 
                                  ? 'text-amber-700 dark:text-amber-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>হজ্জ বাবদ</p>
                              <p className={`text-xs mt-1 ${
                                formData.selectedOption === 'hajj' 
                                  ? 'text-amber-600 dark:text-amber-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>হজ্জের জন্য পেমেন্ট</p>
                            </div>
                            <Building className={`w-6 h-6 ${
                              formData.selectedOption === 'hajj' 
                                ? 'text-amber-600 dark:text-amber-400' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                        </div>
                        
                        {/* Umrah Option */}
                        <div 
                          className={`rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            formData.selectedOption === 'umrah' 
                              ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-400 dark:border-blue-500 shadow-lg' 
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, selectedOption: 'umrah' }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-sm font-medium ${
                                formData.selectedOption === 'umrah' 
                                  ? 'text-blue-700 dark:text-blue-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>উমরাহ বাবদ</p>
                              <p className={`text-xs mt-1 ${
                                formData.selectedOption === 'umrah' 
                                  ? 'text-blue-600 dark:text-blue-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>উমরাহর জন্য পেমেন্ট</p>
                            </div>
                            <Globe className={`w-6 h-6 ${
                              formData.selectedOption === 'umrah' 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                        </div>
                        
                        {/* Others Option */}
                        <div 
                          className={`rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            formData.selectedOption === 'others' 
                              ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-gray-400 dark:border-gray-500 shadow-lg' 
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, selectedOption: 'others' }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-sm font-medium ${
                                formData.selectedOption === 'others' 
                                  ? 'text-gray-700 dark:text-gray-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>অনন্যা বাবদ</p>
                              <p className={`text-xs mt-1 ${
                                formData.selectedOption === 'others' 
                                  ? 'text-gray-600 dark:text-gray-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>অন্যান্য পেমেন্ট</p>
                            </div>
                            <DollarSign className={`w-6 h-6 ${
                              formData.selectedOption === 'others' 
                                ? 'text-gray-600 dark:text-gray-400' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                        </div>
                      </div>
                      
                      {/* Error Display */}
                      {errors.selectedOption && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.selectedOption}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : formData.transactionType === 'transfer' ? (
                  // Transfer: Transfer Details first, then Account Manager Selection
                  <div className="space-y-4 sm:space-y-6">
                    {/* Transfer Amount Input */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        ট্রান্সফার বিবরণ
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            ট্রান্সফার পরিমাণ *
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="number"
                              name="transferAmount"
                              value={formData.transferAmount}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-white border-gray-300 text-gray-900' 
                                  : 'border-gray-300'
                              } ${errors.transferAmount ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                          </div>
                          {errors.transferAmount && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.transferAmount}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          একাউন্ট ম্যানেজার নির্বাচন
                          </label>
                          
                          {/* Account Manager Search Bar */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="একাউন্ট ম্যানেজার খুঁজুন... (নাম, পদবী, ফোন, ইমেইল)"
                              value={accountManagerSearchTerm}
                              onChange={(e) => setAccountManagerSearchTerm(e.target.value)}
                              className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'border-gray-300'
                              }`}
                            />
                          </div>

                          {/* Account Manager List */}
                          {accountManagerSearchTerm && (
                            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                              {employeeLoading ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                  <span className="ml-2 text-gray-600 dark:text-gray-400">খুঁজছি...</span>
                                </div>
                              ) : employeeSearchError ? (
                                <div className="text-center py-4 text-red-500 dark:text-red-400 text-sm">
                                  <div className="flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>খোঁজার সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।</span>
                                  </div>
                                </div>
                              ) : employeeSearchResults.length === 0 ? (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                                  {accountManagerSearchTerm ? 'কোনো একাউন্ট ম্যানেজার পাওয়া যায়নি' : 'একাউন্ট ম্যানেজার খুঁজতে টাইপ করুন'}
                                </div>
                              ) : (
                                employeeSearchResults.map((employee) => (
                                  <button
                                    key={employee._id || employee.id}
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        accountManager: {
                                          id: employee._id || employee.id,
                                          name: employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
                                          phone: employee.phone || employee.phoneNumber,
                                          email: employee.email || employee.emailAddress,
                                          designation: employee.designation || employee.position
                                        }
                                      }));
                                      setAccountManagerSearchTerm('');
                                    }}
                                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.01] ${
                                      formData.accountManager?.id === employee._id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        formData.accountManager?.id === employee._id
                                          ? 'bg-blue-100 dark:bg-blue-800'
                                          : 'bg-gray-100 dark:bg-gray-700'
                                      }`}>
                                        <User className={`w-5 h-5 ${
                                          formData.accountManager?.id === employee._id
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                        }`} />
                                      </div>
                                      <div className="flex-1 text-left">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                          {employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'নাম নেই'}
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                          {employee.designation || employee.position || 'পদবী নেই'}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {(employee.phone || employee.phoneNumber) && (
                                            <span className="text-xs text-blue-600 dark:text-blue-400">
                                              📞 {employee.phone || employee.phoneNumber}
                                            </span>
                                          )}
                                          {(employee.email || employee.emailAddress) && (
                                            <span className="text-xs text-green-600 dark:text-green-400">
                                              ✉️ {employee.email || employee.emailAddress}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {formData.accountManager?.id === employee._id && (
                                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                      )}
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          )}

                          {/* Selected Account Manager Display */}
                          {formData.accountManager?.name && !accountManagerSearchTerm && (
                            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                    <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                      {formData.accountManager.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {formData.accountManager.designation}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setFormData(prev => ({ ...prev, accountManager: { id: '', name: '', phone: '', email: '' } }))}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : formData.transactionType === 'debit' ? (
                  // Debit: Payment Method Selection
                  <div className="space-y-4 sm:space-y-6">
                    {/* Payment Method Selection */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        পেমেন্ট মেথড
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                            className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                              formData.paymentMethod === method.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                            }`}
                          >
                            <div className="text-center">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${method.color} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                                <method.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                                {method.name}
                              </h3>
                            </div>
                          </button>
                        ))}
                      </div>
                      {errors.paymentMethod && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.paymentMethod}
                        </p>
                      )}
                    </div>

                    {/* Account Selection */}
                    {selectedPaymentMethod && (
                      <div className="mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          অ্যাকাউন্ট নির্বাচন
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {/* Source Account */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              আমাদের অ্যাকাউন্ট (যেখান থেকে টাকা পাঠানো হবে) *
                            </label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="অ্যাকাউন্ট খুঁজুন..."
                                value={accountSearchTerm}
                                onChange={(e) => setAccountSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                  isDark 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                    : 'border-gray-300'
                                }`}
                              />
                            </div>
                            
                            {/* Account Selection Dropdown */}
                            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                              {accountsLoading ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">অ্যাকাউন্ট লোড হচ্ছে...</span>
                                </div>
                              ) : filteredAccounts.length > 0 ? (
                                filteredAccounts.map((account) => (
                                  <button
                                    key={account.id}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        sourceAccount: {
                                          id: account.id,
                                          name: account.name,
                                          bankName: account.bankName,
                                          accountNumber: account.accountNumber,
                                          balance: account.balance
                                        }
                                      }));
                                      setErrors(prev => ({ ...prev, sourceAccount: '' }));
                                    }}
                                    className={`w-full p-3 text-left rounded-lg border transition-all duration-200 hover:scale-102 ${
                                      formData.sourceAccount.id === account.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                          {account.name}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                          {account.bankName} - {account.accountNumber}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                          ৳{account.balance.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="text-center py-4">
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">কোন অ্যাকাউন্ট পাওয়া যায়নি</p>
                                </div>
                              )}
                            </div>
                            
                            {errors.sourceAccount && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.sourceAccount}
                              </p>
                            )}
                          </div>

                          {/* Customer Bank Details */}
                          {formData.paymentMethod !== 'cash' && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              কাস্টমার অ্যাকাউন্ট (যেখানে টাকা পাঠানো হবে)
                            </label>
                            <div className="space-y-3">
                            {/* Bank Name or Mobile Provider (conditional) */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {formData.paymentMethod === 'mobile-banking' ? 'মোবাইল প্রোভাইডার' : 'ব্যাংকের নাম'}
                              </label>
                                <input
                                  type="text"
                                  name="customerBankAccount.bankName"
                                  value={formData.customerBankAccount.bankName}
                                  onChange={handleInputChange}
                                placeholder={formData.paymentMethod === 'mobile-banking' ? 'মোবাইল প্রোভাইডার লিখুন...' : 'ব্যাংকের নাম লিখুন...'}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                    isDark 
                                      ? 'bg-white border-gray-300 text-gray-900' 
                                      : 'border-gray-300'
                                  } ${errors.customerBankName ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {errors.customerBankName && (
                                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.customerBankName}
                                  </p>
                                )}
                              </div>
                              
                            {/* Account Number or Mobile Number (conditional) */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {formData.paymentMethod === 'mobile-banking' ? 'মোবাইল নম্বর' : 'একাউন্ট নম্বর'}
                              </label>
                                <input
                                  type="text"
                                  name="customerBankAccount.accountNumber"
                                  value={formData.customerBankAccount.accountNumber}
                                  onChange={handleInputChange}
                                placeholder={formData.paymentMethod === 'mobile-banking' ? 'মোবাইল নম্বর লিখুন...' : 'একাউন্ট নম্বর লিখুন...'}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                    isDark 
                                      ? 'bg-white border-gray-300 text-gray-900' 
                                      : 'border-gray-300'
                                  } ${errors.customerAccountNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {errors.customerAccountNumber && (
                                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.customerAccountNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Account Manager Selection for Debit - Shown only at Step 5 (confirmation) */}

                    {/* Payment Details */}
                    {selectedPaymentMethod && formData.sourceAccount.id && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <selectedPaymentMethod.icon className="w-5 h-5 text-blue-600" />
                          {selectedPaymentMethod.name}
                        </h3>
                        
                        <div className="space-y-4">
                          {/* Amount */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              পরিমাণ *
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="number"
                                placeholder="পরিমাণ লিখুন..."
                                value={formData.paymentDetails.amount}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  paymentDetails: { ...prev.paymentDetails, amount: e.target.value }
                                }))}
                                className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                  isDark 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                    : 'border-gray-300'
                                }`}
                              />
                            </div>
                            {errors.amount && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
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
                                {field === 'cardNumber' && 'কার্ড নম্বর'}
                                {field === 'chequeNumber' && 'চেক নম্বর'}
                                {field === 'mobileProvider' && 'মোবাইল প্রোভাইডার'}
                                {field === 'transactionId' && 'ট্রানজেকশন আইডি'}
                                {field === 'reference' && 'রেফারেন্স'}
                                {field !== 'reference' && ' *'}
                              </label>
                              <input
                                type="text"
                                placeholder={getPaymentFieldPlaceholder(field)}
                                value={formData.paymentDetails[field] || ''}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  paymentDetails: { ...prev.paymentDetails, [field]: e.target.value }
                                }))}
                                className={`w-full px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                  isDark 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                    : 'border-gray-300'
                                }`}
                              />
                              {errors[field] && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors[field]}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Credit: Invoice Selection
                  <div className="space-y-4 sm:space-y-6">
                    {/* Invoice Selection */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        ইনভয়েস তালিকা
                        {isUsingDemoInvoices && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                            ডেমো ডেটা
                          </span>
                        )}
                      </h3>
                      
                      <div className="space-y-3">
                        {invoicesError ? (
                          <div className="text-center py-8 text-red-500">
                            <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                            <p>ইনভয়েস লোড করতে সমস্যা হয়েছে</p>
                          </div>
                        ) : (
                          <>
                            {invoicesLoading && formData.customerId && (
                              <div className="text-center py-2 text-blue-500 dark:text-blue-400">
                                <Loader2 className="w-4 h-4 mx-auto mb-1 animate-spin inline" />
                                <p className="text-sm">লাইভ ডেটা লোড হচ্ছে...</p>
                              </div>
                            )}
                            {filteredInvoices.length > 0 ? (
                          filteredInvoices.map((invoice) => (
                            <button
                              key={invoice.id || invoice._id}
                              type="button"
                              onClick={() => handleInvoiceSelect(invoice)}
                              className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-102 ${
                                formData.selectedInvoice?.id === (invoice.id || invoice._id)
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="text-left">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    ইনভয়েস #{invoice.invoiceNumber || invoice.invoiceId}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    পরিমাণ: ৳{(invoice.amount || 0).toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US') : 
                                     invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-US') : 
                                     'তারিখ নেই'}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                            ) : (
                              <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">কোন ইনভয়েস পাওয়া যায়নি</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      {isUsingDemoInvoices && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            <span>
                              <strong>ডেমো ডেটা:</strong> এই ইনভয়েসগুলো শুধুমাত্র প্রদর্শনের জন্য। 
                              {formData.customerId ? ' নির্বাচিত কাস্টমারের জন্য কোন ইনভয়েস পাওয়া যায়নি।' : ' কোন কাস্টমার নির্বাচন করা হয়নি।'}
                            </span>
                          </p>
                        </div>
                      )}
                      {errors.invoiceId && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.invoiceId}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Invoice Selection (for credit with agent) - HIDDEN FOR AGENTS */}
          {false && currentStep === 5 && formData.transactionType === 'credit' && formData.customerType === 'agent' && (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  ইনভয়েস নির্বাচন করুন
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  পেমেন্টের জন্য ইনভয়েস সিলেক্ট করুন
                </p>
              </div>

              <div className="max-w-6xl mx-auto">
                <div className="space-y-4 sm:space-y-6">
                  {/* Invoice Selection */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      ইনভয়েস তালিকা
                      {isUsingDemoInvoices && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                          ডেমো ডেটা
                        </span>
                      )}
                    </h3>
                    
                    <div className="space-y-3">
                      {invoicesError ? (
                        <div className="text-center py-8 text-red-500">
                          <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                          <p>ইনভয়েস লোড করতে সমস্যা হয়েছে</p>
                        </div>
                      ) : (
                        <>
                          {invoicesLoading && formData.customerId && (
                            <div className="text-center py-2 text-blue-500 dark:text-blue-400">
                              <Loader2 className="w-4 h-4 mx-auto mb-1 animate-spin inline" />
                              <p className="text-sm">লাইভ ডেটা লোড হচ্ছে...</p>
                            </div>
                          )}
                          {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice) => (
                          <button
                            key={invoice.id || invoice._id}
                            type="button"
                            onClick={() => handleInvoiceSelect(invoice)}
                            className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-102 ${
                              formData.selectedInvoice?.id === (invoice.id || invoice._id)
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="text-left">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  ইনভয়েস #{invoice.invoiceNumber || invoice.invoiceId}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  পরিমাণ: ৳{(invoice.amount || 0).toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US') : 
                                   invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-US') : 
                                   'তারিখ নেই'}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                          ) : (
                            <div className="text-center py-8">
                              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500 dark:text-gray-400">কোন ইনভয়েস পাওয়া যায়নি</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {isUsingDemoInvoices && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          <span>
                            <strong>ডেমো ডেটা:</strong> এই ইনভয়েসগুলো শুধুমাত্র প্রদর্শনের জন্য। 
                            {formData.customerId ? ' নির্বাচিত কাস্টমারের জন্য কোন ইনভয়েস পাওয়া যায়নি।' : ' কোন কাস্টমার নির্বাচন করা হয়নি।'}
                          </span>
                        </p>
                      </div>
                    )}
                    {errors.invoiceId && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.invoiceId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Step 5: Invoice Selection (for credit with customer) or Account Manager Selection (for transfer) or Payment Method (for debit) - REMOVED - DUPLICATE */}
          {false && currentStep === 5 && !(formData.transactionType === 'credit' && formData.customerType === 'agent') && (
            <div className="p-3 sm:p-4 lg:p-6">
              {formData.transactionType === 'transfer' ? (
                // Transfer: Transfer Details and Account Manager Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ট্রান্সফার বিবরণ ও একাউন্ট ম্যানেজার নির্বাচন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    ট্রান্সফার পরিমাণ লিখুন এবং অনুমোদনের জন্য একাউন্ট ম্যানেজার সিলেক্ট করুন
                  </p>
                </div>
              ) : formData.transactionType === 'debit' ? (
                // Debit: Payment Method Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    পেমেন্ট মেথড নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    পেমেন্টের ধরন এবং বিবরণ নির্বাচন করুন
                  </p>
                </div>
              ) : (
                // Credit: Invoice Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ইনভয়েস নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    পেমেন্টের জন্য ইনভয়েস সিলেক্ট করুন
                  </p>
                </div>
              )}

              <div className="max-w-6xl mx-auto">
                {formData.transactionType === 'transfer' ? (
                  // Transfer: Transfer Details first, then Account Manager Selection
                  <div className="space-y-4 sm:space-y-6">
                    {/* Transfer Amount Input */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        ট্রান্সফার বিবরণ
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            ট্রান্সফার পরিমাণ *
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="number"
                              name="transferAmount"
                              value={formData.transferAmount}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-white border-gray-300 text-gray-900' 
                                  : 'border-gray-300'
                              } ${errors.transferAmount ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                          </div>
                          {errors.transferAmount && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.transferAmount}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            রেফারেন্স নোট
                          </label>
                          <input
                            type="text"
                            name="transferReference"
                            value={formData.transferReference}
                            onChange={handleInputChange}
                            placeholder="ট্রান্সফার রেফারেন্স..."
                            className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                              isDark 
                                ? 'bg-white border-gray-300 text-gray-900' 
                                : 'border-gray-300'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          ট্রান্সফার নোট
                        </label>
                        <textarea
                          name="transferNotes"
                          value={formData.transferNotes}
                          onChange={handleInputChange}
                          placeholder="ট্রান্সফার সম্পর্কে অতিরিক্ত নোট..."
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm resize-none ${
                            isDark 
                              ? 'bg-white border-gray-300 text-gray-900' 
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Account Manager Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="একাউন্ট ম্যানেজার খুঁজুন... (নাম, পদবী, ফোন, ইমেইল)"
                        value={accountManagerSearchTerm}
                        onChange={(e) => setAccountManagerSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>

                    {/* Account Manager List */}
                    {accountManagerSearchTerm && (
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                        {employeeLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-600 dark:text-gray-400">খুঁজছি...</span>
                          </div>
                        ) : employeeSearchResults.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                            {accountManagerSearchTerm ? 'কোনো একাউন্ট ম্যানেজার পাওয়া যায়নি' : 'একাউন্ট ম্যানেজার খুঁজতে টাইপ করুন'}
                          </div>
                        ) : (
                          employeeSearchResults.map((employee) => (
                            <button
                              key={employee._id}
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  accountManager: {
                                    id: employee._id,
                                    name: employee.name,
                                    phone: employee.phone,
                                    email: employee.email,
                                    designation: employee.designation
                                  }
                                }));
                                setAccountManagerSearchTerm('');
                              }}
                              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.01] ${
                                formData.accountManager?.id === employee._id
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  formData.accountManager?.id === employee._id
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                  <User className={`w-5 h-5 ${
                                    formData.accountManager?.id === employee._id
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`} />
                                </div>
                                <div className="flex-1 text-left">
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {employee.name}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {employee.designation}
                                  </p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {employee.phone && (
                                      <span className="text-xs text-blue-600 dark:text-blue-400">
                                        📞 {employee.phone}
                                      </span>
                                    )}
                                    {employee.email && (
                                      <span className="text-xs text-green-600 dark:text-green-400">
                                        ✉️ {employee.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {formData.accountManager?.id === employee._id && (
                                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    {/* Selected Account Manager Display */}
                    {formData.accountManager?.name && !accountManagerSearchTerm && (
                      <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {formData.accountManager.name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {formData.accountManager.designation}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, accountManager: { id: '', name: '', phone: '', email: '' } }))}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : formData.transactionType === 'debit' ? (
                  // Debit: Payment Method Selection
                  <>

                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, paymentMethod: method.id }));
                          setErrors(prev => ({ ...prev, paymentMethod: '' }));
                        }}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          formData.paymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${method.color} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                            <method.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                            {method.name}
                          </h3>
                        </div>
                      </button>
                    ))}
                  </div>


                  {/* Account Selection */}
                  {selectedPaymentMethod && (
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        অ্যাকাউন্ট নির্বাচন
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Source Account */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            আমাদের অ্যাকাউন্ট (যেখান থেকে টাকা যাবে) *
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="অ্যাকাউন্ট খুঁজুন..."
                              value={accountSearchTerm}
                              onChange={(e) => setAccountSearchTerm(e.target.value)}
                              className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'border-gray-300'
                              }`}
                            />
                          </div>
                          
                          {/* Account Selection Dropdown */}
                          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                            {accountsLoading ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">অ্যাকাউন্ট লোড হচ্ছে...</span>
                              </div>
                            ) : accountsError ? (
                              <div className="text-center py-4 text-red-500 dark:text-red-400">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm">
                                  অ্যাকাউন্ট লোড করতে সমস্যা হয়েছে
                                </p>
                                <p className="text-xs mt-1">
                                  {accountsError.message || 'আবার চেষ্টা করুন'}
                                </p>
                              </div>
                            ) : filteredAccounts.length === 0 ? (
                              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">
                                  {accountSearchTerm ? 'খোঁজার সাথে মিলে যাওয়া কোন অ্যাকাউন্ট পাওয়া যায়নি' : 'কোন অ্যাকাউন্ট পাওয়া যায়নি'}
                                </p>
                                <p className="text-xs mt-1">
                                  {accountSearchTerm ? 'অন্য নাম দিয়ে খুঁজুন' : 'ব্যাংক অ্যাকাউন্ট সেটিংস থেকে অ্যাকাউন্ট যোগ করুন'}
                                </p>
                              </div>
                            ) : (
                              filteredAccounts.map((account) => (
                              <button
                                key={account.id}
                                onClick={() => handleAccountSelectForTransaction(account, 'sourceAccount')}
                                className={`w-full p-2 rounded-lg border-2 transition-all duration-200 text-left ${
                                  formData.sourceAccount.id === account.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                        {account.name}
                                      </h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        {account.bankName} - {account.accountNumber}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                      ৳{account.balance.toLocaleString()}
                                    </p>
                                    {formData.sourceAccount.id === account.id && (
                                      <CheckCircle className="w-4 h-4 text-blue-500 mt-1" />
                                    )}
                                  </div>
                                </div>
                              </button>
                              ))
                            )}
                          </div>
                          {errors.sourceAccount && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.sourceAccount}
                            </p>
                          )}
                        </div>

                        {/* Destination Account - Our Company Account */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          আমাদের অ্যাকাউন্ট (যেখান টাকা জমা হবে) 
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="অ্যাকাউন্ট খুঁজুন..."
                              value={accountSearchTerm}
                              onChange={(e) => setAccountSearchTerm(e.target.value)}
                              className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'border-gray-300'
                              }`}
                            />
                          </div>
                          
                          {/* Destination Account Selection Dropdown */}
                          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                            {accountsLoading ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">অ্যাকাউন্ট লোড হচ্ছে...</span>
                              </div>
                            ) : accountsError ? (
                              <div className="text-center py-4 text-red-500 dark:text-red-400">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm">
                                  অ্যাকাউন্ট লোড করতে সমস্যা হয়েছে
                                </p>
                                <p className="text-xs mt-1">
                                  {accountsError.message || 'আবার চেষ্টা করুন'}
                                </p>
                              </div>
                            ) : filteredAccounts.length === 0 ? (
                              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">
                                  {accountSearchTerm ? 'খোঁজার সাথে মিলে যাওয়া কোন অ্যাকাউন্ট পাওয়া যায়নি' : 'কোন অ্যাকাউন্ট পাওয়া যায়নি'}
                                </p>
                                <p className="text-xs mt-1">
                                  {accountSearchTerm ? 'অন্য নাম দিয়ে খুঁজুন' : 'ব্যাংক অ্যাকাউন্ট সেটিংস থেকে অ্যাকাউন্ট যোগ করুন'}
                                </p>
                              </div>
                            ) : (
                              filteredAccounts.map((account) => (
                              <button
                                key={account.id}
                                onClick={() => handleAccountSelectForTransaction(account, 'destinationAccount')}
                                className={`w-full p-2 rounded-lg border-2 transition-all duration-200 text-left ${
                                  formData.destinationAccount.id === account.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                        {account.name}
                                      </h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        {account.bankName} - {account.accountNumber}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                      ৳{account.balance.toLocaleString()}
                                    </p>
                                    {formData.destinationAccount.id === account.id && (
                                      <CheckCircle className="w-4 h-4 text-blue-500 mt-1" />
                                    )}
                                  </div>
                                </div>
                              </button>
                              ))
                            )}
                          </div>
                          {errors.destinationAccount && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.destinationAccount}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Customer Information Section */}
                      <div className="mt-4 sm:mt-6">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          কাস্টমার (যার কাছে টাকা যাবে)
                        </h4>
                        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-blue-600" />
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {formData.customerName}
                                </h4>
                                {formData.customerPhone && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    📞 {formData.customerPhone}
                                  </p>
                                )}
                              </div>
                            </div>
                          
                          {/* Customer Bank Account Details */}
                          {formData.paymentMethod === 'bank-transfer' && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                কাস্টমারের ব্যাংক একাউন্ট বিবরণ *
                              </h4>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  ব্যাংকের নাম
                                </label>
                                <input
                                  type="text"
                                  name="customerBankAccount.bankName"
                                  value={formData.customerBankAccount.bankName}
                                  onChange={handleInputChange}
                                  placeholder="ব্যাংকের নাম লিখুন..."
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                    isDark 
                                      ? 'bg-white border-gray-300 text-gray-900' 
                                      : 'border-gray-300'
                                  } ${errors.customerBankName ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {errors.customerBankName && (
                                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.customerBankName}
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  একাউন্ট নম্বর
                                </label>
                                <input
                                  type="text"
                                  name="customerBankAccount.accountNumber"
                                  value={formData.customerBankAccount.accountNumber}
                                  onChange={handleInputChange}
                                  placeholder="একাউন্ট নম্বর লিখুন..."
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                    isDark 
                                      ? 'bg-white border-gray-300 text-gray-900' 
                                      : 'border-gray-300'
                                  } ${errors.customerAccountNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {errors.customerAccountNumber && (
                                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.customerAccountNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Account Manager Selection for Credit */}
                  {formData.destinationAccount.id && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-green-600" />
                        একাউন্ট ম্যানেজার নির্বাচন
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          একাউন্ট ম্যানেজার নির্বাচন
                        </label>
                        
                        {/* Account Manager Search Bar */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="একাউন্ট ম্যানেজার খুঁজুন... (নাম, পদবী, ফোন, ইমেইল)"
                            value={accountManagerSearchTerm}
                            onChange={(e) => setAccountManagerSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'border-gray-300'
                            }`}
                          />
                        </div>

                        {/* Account Manager List */}
                        {accountManagerSearchTerm && (
                          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                            {employeeLoading ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                <span className="ml-2 text-gray-600 dark:text-gray-400">খুঁজছি...</span>
                              </div>
                            ) : employeeSearchError ? (
                              <div className="text-center py-4 text-red-500 dark:text-red-400 text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>খোঁজার সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।</span>
                                </div>
                              </div>
                            ) : employeeSearchResults.length === 0 ? (
                              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                                {accountManagerSearchTerm ? 'কোনো একাউন্ট ম্যানেজার পাওয়া যায়নি' : 'একাউন্ট ম্যানেজার খুঁজতে টাইপ করুন'}
                              </div>
                            ) : (
                              employeeSearchResults.map((employee) => (
                                <button
                                  key={employee._id || employee.id}
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      creditAccountManager: {
                                        id: employee._id || employee.id,
                                        name: employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
                                        phone: employee.phone || employee.phoneNumber,
                                        email: employee.email || employee.emailAddress,
                                        designation: employee.designation || employee.position
                                      }
                                    }));
                                    setAccountManagerSearchTerm('');
                                  }}
                                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.01] ${
                                    formData.creditAccountManager?.id === employee._id
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      formData.creditAccountManager?.id === employee._id
                                        ? 'bg-blue-100 dark:bg-blue-800'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                      <User className={`w-5 h-5 ${
                                        formData.creditAccountManager?.id === employee._id
                                          ? 'text-blue-600 dark:text-blue-400'
                                          : 'text-gray-600 dark:text-gray-400'
                                      }`} />
                                    </div>
                                    <div className="flex-1 text-left">
                                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'নাম নেই'}
                                      </h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {employee.designation || employee.position || 'পদবী নেই'}
                                      </p>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {(employee.phone || employee.phoneNumber) && (
                                          <span className="text-xs text-blue-600 dark:text-blue-400">
                                            📞 {employee.phone || employee.phoneNumber}
                                          </span>
                                        )}
                                        {(employee.email || employee.emailAddress) && (
                                          <span className="text-xs text-green-600 dark:text-green-400">
                                            ✉️ {employee.email || employee.emailAddress}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {formData.creditAccountManager?.id === employee._id && (
                                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    )}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}

                        {/* Selected Account Manager Display */}
                        {formData.creditAccountManager?.name && !accountManagerSearchTerm && (
                          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                  <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {formData.creditAccountManager.name}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {formData.creditAccountManager.designation}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setFormData(prev => ({ ...prev, creditAccountManager: { id: '', name: '', phone: '', email: '', designation: '' } }))}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Details Form */}
                  {selectedPaymentMethod && (
                    <div className={`p-3 sm:p-4 rounded-lg border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800`}>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <selectedPaymentMethod.icon className="w-4 h-4 text-blue-600" />
                        {selectedPaymentMethod.name}
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Amount */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            পরিমাণ *
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="number"
                              name="paymentDetails.amount"
                              value={formData.paymentDetails.amount}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-white border-gray-300 text-gray-900' 
                                  : 'border-gray-300'
                              } ${errors.amount ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                          </div>
                          {errors.amount && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.amount}
                            </p>
                          )}
                        </div>

                        {/* Dynamic Fields based on Payment Method */}
                        {selectedPaymentMethod.fields.map((field) => (
                          <div key={field}>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
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
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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

                    {errors.paymentMethod && 
                      <p className="text-red-500 text-center mt-4 flex items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {errors.paymentMethod}
                      </p>
                    }
                  </>
                ) : (
                  // Credit: Invoice Selection
                  <>
                    {/* Customer Balance Display */}
                    {formData.customerId && (
                      <div className="mb-4 sm:mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                  {formData.customerName}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {formData.customerPhone}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                বর্তমান ব্যালেন্স
                              </p>
                              <p className={`text-lg sm:text-xl font-bold ${
                                customerBalance >= 0 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {customerBalance >= 0 ? '+' : ''}৳{Math.abs(customerBalance).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {customerBalance >= 0 ? 'আমাদের কাছে পাওনা' : 'আমাদের কাছে ঋণ'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Agent Due Amounts Display */}
                    {formData.customerType === 'agent' && formData.agentDueInfo && (
                      <div className="mb-4 sm:mb-6">
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4 sm:p-6 border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                              এজেন্টের বকেয়া পরিমাণ
                            </h3>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            {/* Total Due */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-300">মোট বকেয়া</p>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">৳{formData.agentDueInfo.totalDue?.toLocaleString() || '0'}</p>
                                </div>
                                <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                              </div>
                            </div>
                            
                            {/* Hajj Due */}
                            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-amber-700 dark:text-amber-300">হাজ্জ বকেয়া</p>
                                  <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">৳{formData.agentDueInfo.hajDue?.toLocaleString() || '0'}</p>
                                </div>
                                <Building className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                              </div>
                            </div>
                            
                            {/* Umrah Due */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-blue-700 dark:text-blue-300">ওমরাহ বকেয়া</p>
                                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">৳{formData.agentDueInfo.umrahDue?.toLocaleString() || '0'}</p>
                                </div>
                                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Invoice Search - Only show for non-agent customers */}
                    {formData.customerType !== 'agent' && (
                      <>
                        <div className="mb-4 sm:mb-6">
                      <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type="text"
                          placeholder="ইনভয়েস সার্চ করুন... (নাম্বার, কাস্টমার, বর্ণনা)"
                          value={invoiceSearchTerm}
                          onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg border-2 transition-colors text-sm sm:text-base ${
                            isDark 
                              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                      </div>
                      {invoiceSearchTerm && (
                        <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {filteredInvoices.length} টি ইনভয়েস পাওয়া গেছে
                        </p>
                      )}
                        </div>

                        {/* Invoice List */}
                    <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-96 overflow-y-auto">
                      {filteredInvoices.length === 0 ? (
                        <div className="text-center py-8">
                          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            {invoiceSearchTerm ? 'কোন ইনভয়েস পাওয়া যায়নি' : 'কোন ইনভয়েস নেই'}
                          </p>
                          {invoiceSearchTerm && (
                            <button
                              onClick={() => setInvoiceSearchTerm('')}
                              className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                            >
                              সব ইনভয়েস দেখুন
                            </button>
                          )}
                        </div>
                      ) : (
                        filteredInvoices.map((invoice) => (
                          <button
                            key={invoice.id || invoice._id}
                            onClick={() => handleInvoiceSelect(invoice)}
                            className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                              formData.selectedInvoice?.id === (invoice.id || invoice._id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  formData.selectedInvoice?.id === (invoice.id || invoice._id)
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                  <Receipt className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                    formData.selectedInvoice?.id === (invoice.id || invoice._id)
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`} />
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                    {invoice.invoiceNumber || invoice.invoiceId}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {invoice.customerName || 'কাস্টমার নাম নেই'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                    {invoice.description || 'বিবরণ নেই'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-left sm:text-right">
                                <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                                  ৳{(invoice.amount || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 
                                        invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 
                                        'তারিখ নেই'}
                                </p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  (invoice.status || 'Pending') === 'Pending' 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                }`}>
                                  {invoice.status}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                        {errors.invoiceId && (
                          <p className="text-red-500 text-center mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            {errors.invoiceId}
                          </p>
                        )}
                      </>
                    )}

                    {/* Error Messages for Transfer */}
                    {formData.transactionType === 'transfer' && errors.accountManager && (
                      <p className="text-red-500 text-center mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        {errors.accountManager}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Payment Method (for credit with agent) */}
          {currentStep === 5 && formData.transactionType === 'credit' && formData.customerType === 'agent' && (
            <div className="p-3 sm:p-4 lg:p-6">

              <div className="max-w-6xl mx-auto">
                <div className="space-y-4 sm:space-y-6">
                </div>
              </div>
            </div>
          )}
          {/* Step 5: Payment Method (for credit with customer) or Confirmation with SMS (for transfer) or Confirmation (for debit) or Payment Method (for credit with agent) */}
          {currentStep === 5 && (
            <div className="p-3 sm:p-4 lg:p-6">
              {formData.transactionType === 'transfer' ? (
                // Transfer: Confirmation with SMS
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ট্রান্সফার কনফার্মেশন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    এসএমএস কনফার্মেশন এবং ট্রান্সফার সম্পূর্ণ করুন
                  </p>
                </div>
              ) : formData.transactionType === 'debit' ? (
                // Debit: Confirmation
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    তথ্য যাচাই এবং কনফার্মেশন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    সব তথ্য সঠিক কিনা যাচাই করুন এবং কনফার্ম করুন
                  </p>
                </div>
              ) : (
                // Credit: Payment Method Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    পেমেন্ট মেথড নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    পেমেন্টের ধরন এবং বিবরণ নির্বাচন করুন
                  </p>
                </div>
              )}

              {formData.transactionType === 'transfer' ? (
                // Transfer: Confirmation with SMS
                <div className="max-w-4xl mx-auto">
                  {/* Transfer Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                      ট্রান্সফার সারাংশ
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">ডেবিট একাউন্ট</h4>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.debitAccount?.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{formData.debitAccount?.bankName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">A/C: {formData.debitAccount?.accountNumber}</p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">ক্রেডিট একাউন্ট</h4>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.creditAccount?.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{formData.creditAccount?.bankName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">A/C: {formData.creditAccount?.accountNumber}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ট্রান্সফার পরিমাণ:</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">৳{parseFloat(formData.transferAmount || 0).toLocaleString()}</span>
                      </div>
                      {formData.transferReference && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">রেফারেন্স:</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{formData.transferReference}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Manager Info */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-green-600" />
                      নির্বাচিত একাউন্ট ম্যানেজার
                    </h3>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{formData.accountManager?.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{formData.accountManager?.designation}</p>
                      <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>📞 {formData.accountManager?.phone}</span>
                        <span>✉️ {formData.accountManager?.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* SMS Confirmation */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 sm:p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-orange-600" />
                      এসএমএস কনফার্মেশন
                    </h3>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        ট্রান্সফার সম্পূর্ণ করার জন্য নির্বাচিত একাউন্ট ম্যানেজার ({formData.accountManager?.name}) এর কাছে এসএমএস পাঠানো হবে।
                      </p>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                          এসএমএস বার্তা:
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          ট্রান্সফার অনুমোদন প্রয়োজন: {formData.debitAccount?.name} থেকে {formData.creditAccount?.name} এ ৳{parseFloat(formData.transferAmount || 0).toLocaleString()}। 
                          রেফারেন্স: {formData.transferReference || 'N/A'}। দয়া করে অনুমোদন করুন।
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span>এসএমএস পাঠানো হবে: {formData.accountManager?.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Transfer Notes */}
                  {formData.transferNotes && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">ট্রান্সফার নোট</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{formData.transferNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons for Transfer */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mt-6">
                    <button
                      onClick={handleSubmit}
                      disabled={createTransactionMutation.isPending || createBankAccountTransactionMutation.isPending || bankAccountTransferMutation.isPending}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      {(createTransactionMutation.isPending || createBankAccountTransactionMutation.isPending || bankAccountTransferMutation.isPending) ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">ট্রান্সফার হচ্ছে...</span>
                          <span className="sm:hidden">ট্রান্সফার...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span className="hidden sm:inline">ট্রান্সফার সম্পন্ন করুন</span>
                          <span className="sm:hidden">ট্রান্সফার সম্পন্ন</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={generatePDF}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">PDF ডাউনলোড করুন</span>
                      <span className="sm:hidden">PDF ডাউনলোড</span>
                    </button>
                    
                    <button
                      onClick={() => {}} // SMS functionality
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="hidden sm:inline">SMS পাঠান</span>
                      <span className="sm:hidden">SMS</span>
                    </button>
                  </div>
                </div>
              ) : formData.transactionType === 'debit' ? (
                // Debit: Confirmation
                <div className="max-w-6xl mx-auto">
                  {/* Transaction Summary */}
                  <div className={`p-3 sm:p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 mb-3 sm:mb-4 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      লেনদেনের সারসংক্ষেপ
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">লেনদেনের ধরন:</span>
                          <span className="font-semibold text-red-600">
                            ডেবিট (ব্যয়)
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">কাস্টমার:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formData.customerName}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">ক্যাটাগরি:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {selectedCategory?.name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">পেমেন্ট মেথড:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {selectedPaymentMethod?.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">পরিমাণ:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ৳{formData.paymentDetails.amount}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Date:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {new Date(formData.date).toLocaleDateString('en-US')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Manager Selection */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-green-600" />
                      একাউন্ট ম্যানেজার নির্বাচন
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        একাউন্ট ম্যানেজার নির্বাচন
                      </label>
                      
                      {/* Account Manager Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="একাউন্ট ম্যানেজার খুঁজুন... (নাম, পদবী, ফোন, ইমেইল)"
                          value={accountManagerSearchTerm}
                          onChange={(e) => setAccountManagerSearchTerm(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'border-gray-300'
                          }`}
                        />
                      </div>

                      {/* Account Manager List */}
                      {accountManagerSearchTerm && (
                        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                          {employeeLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                              <span className="ml-2 text-gray-600 dark:text-gray-400">খুঁজছি...</span>
                            </div>
                          ) : employeeSearchError ? (
                            <div className="text-center py-4 text-red-500 dark:text-red-400 text-sm">
                              <div className="flex items-center justify-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>খোঁজার সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।</span>
                              </div>
                            </div>
                          ) : employeeSearchResults.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                              {accountManagerSearchTerm ? 'কোনো একাউন্ট ম্যানেজার পাওয়া যায়নি' : 'একাউন্ট ম্যানেজার খুঁজতে টাইপ করুন'}
                            </div>
                          ) : (
                            employeeSearchResults.map((employee) => (
                              <button
                                key={employee._id || employee.id}
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    employeeReference: {
                                      id: employee._id || employee.id,
                                      name: employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
                                      employeeId: employee.employeeId || employee.id,
                                      position: employee.designation || employee.position || '',
                                      department: employee.department || ''
                                    }
                                  }));
                                  setAccountManagerSearchTerm('');
                                }}
                                className={`w-full p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.01] ${
                                  formData.employeeReference?.id === employee._id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    formData.employeeReference?.id === employee._id
                                      ? 'bg-blue-100 dark:bg-blue-800'
                                      : 'bg-gray-100 dark:bg-gray-700'
                                  }`}>
                                    <User className={`w-5 h-5 ${
                                      formData.employeeReference?.id === employee._id
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`} />
                                  </div>
                                  <div className="flex-1 text-left">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                      {employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'নাম নেই'}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {employee.designation || employee.position || 'পদবী নেই'}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {(employee.phone || employee.phoneNumber) && (
                                        <span className="text-xs text-blue-600 dark:text-blue-400">
                                          📞 {employee.phone || employee.phoneNumber}
                                        </span>
                                      )}
                                      {(employee.email || employee.emailAddress) && (
                                        <span className="text-xs text-green-600 dark:text-green-400">
                                          ✉️ {employee.email || employee.emailAddress}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {formData.employeeReference?.id === employee._id && (
                                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}

                      {/* Selected Account Manager Display */}
                      {formData.employeeReference?.name && !accountManagerSearchTerm && (
                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {formData.employeeReference.name}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {formData.employeeReference.position}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setFormData(prev => ({ ...prev, employeeReference: { id: '', name: '', employeeId: '', position: '', department: '' } }))}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      অতিরিক্ত নোট
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="লেনদেন সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                    <button
                      onClick={handleSubmit}
                      disabled={createTransactionMutation.isPending || createBankAccountTransactionMutation.isPending || bankAccountTransferMutation.isPending}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      {(createTransactionMutation.isPending || createBankAccountTransactionMutation.isPending || bankAccountTransferMutation.isPending) ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">
                            {formData.transactionType === 'transfer' ? 'ট্রান্সফার হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                          </span>
                          <span className="sm:hidden">
                            {formData.transactionType === 'transfer' ? 'ট্রান্সফার...' : 'সংরক্ষণ...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {formData.transactionType === 'transfer' ? 'ট্রান্সফার সম্পন্ন করুন' : 'লেনদেন সংরক্ষণ করুন'}
                          </span>
                          <span className="sm:hidden">
                            {formData.transactionType === 'transfer' ? 'ট্রান্সফার' : 'সংরক্ষণ'}
                          </span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={generatePDF}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">PDF ডাউনলোড করুন</span>
                      <span className="sm:hidden">PDF ডাউনলোড</span>
                    </button>
                    
                    <button
                      onClick={() => {}} // Email functionality
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="hidden sm:inline">SMS পাঠান</span>
                      <span className="sm:hidden">SMS</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Credit: Payment Method Selection
                <div className="max-w-6xl mx-auto">

                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, paymentMethod: method.id }));
                        setErrors(prev => ({ ...prev, paymentMethod: '' }));
                      }}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                        formData.paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${method.color} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                          <method.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                          {method.name}
                        </h3>
                      </div>
                    </button>
                  ))}
                </div>


                {/* Account Selection */}
                {selectedPaymentMethod && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      অ্যাকাউন্ট নির্বাচন
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Source Account */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          আমাদের অ্যাকাউন্ট (যেখানে টাকা আসবে) *
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="অ্যাকাউন্ট খুঁজুন..."
                            value={accountSearchTerm}
                            onChange={(e) => setAccountSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'border-gray-300'
                            }`}
                          />
                        </div>
                        
                        {/* Account Selection Dropdown */}
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                          {accountsLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">অ্যাকাউন্ট লোড হচ্ছে...</span>
                            </div>
                          ) : filteredAccounts.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">
                                {accountSearchTerm ? 'খোঁজার সাথে মিলে যাওয়া কোন অ্যাকাউন্ট পাওয়া যায়নি' : 'কোন অ্যাকাউন্ট পাওয়া যায়নি'}
                              </p>
                              <p className="text-xs mt-1">
                                {accountSearchTerm ? 'অন্য নাম দিয়ে খুঁজুন' : 'ব্যাংক অ্যাকাউন্ট সেটিংস থেকে অ্যাকাউন্ট যোগ করুন'}
                              </p>
                            </div>
                          ) : (
                            filteredAccounts.map((account) => (
                            <button
                              key={account.id}
                              onClick={() => handleAccountSelectForTransaction(account, 'sourceAccount')}
                              className={`w-full p-2 rounded-lg border-2 transition-all duration-200 text-left ${
                                formData.sourceAccount.id === account.id
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                      {account.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                      {account.bankName} - {account.accountNumber}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                    ৳{account.balance.toLocaleString()}
                                  </p>
                                  {formData.sourceAccount.id === account.id && (
                                    <CheckCircle className="w-4 h-4 text-blue-500 mt-1" />
                                  )}
                                </div>
                              </div>
                            </button>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Customer Bank Details */}
                      {formData.paymentMethod !== 'cash' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          কাস্টমার অ্যাকাউন্ট (যেখান থেকে টাকা পাঠানো হবে)
                        </label>
                        <div className="space-y-3">
                        {/* Bank Name or Mobile Provider (conditional) */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {formData.paymentMethod === 'mobile-banking' ? 'মোবাইল প্রোভাইডার' : 'ব্যাংকের নাম'}
                          </label>
                            <input
                              type="text"
                              name="customerBankAccount.bankName"
                              value={formData.customerBankAccount.bankName}
                              onChange={handleInputChange}
                            placeholder={formData.paymentMethod === 'mobile-banking' ? 'মোবাইল প্রোভাইডার লিখুন...' : 'ব্যাংকের নাম লিখুন...'}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                isDark 
                                  ? 'bg-white border-gray-300 text-gray-900' 
                                  : 'border-gray-300'
                              } ${errors.customerBankName ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {errors.customerBankName && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.customerBankName}
                              </p>
                            )}
                          </div>
                          
                        {/* Account Number or Mobile Number (conditional) */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {formData.paymentMethod === 'mobile-banking' ? 'মোবাইল নম্বর' : 'একাউন্ট নম্বর'}
                          </label>
                            <input
                              type="text"
                              name="customerBankAccount.accountNumber"
                              value={formData.customerBankAccount.accountNumber}
                              onChange={handleInputChange}
                            placeholder={formData.paymentMethod === 'mobile-banking' ? 'মোবাইল নম্বর লিখুন...' : 'একাউন্ট নম্বর লিখুন...'}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                isDark 
                                  ? 'bg-white border-gray-300 text-gray-900' 
                                  : 'border-gray-300'
                              } ${errors.customerAccountNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {errors.customerAccountNumber && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.customerAccountNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Details Form */}
                {selectedPaymentMethod && (
                  <div className={`p-3 sm:p-4 rounded-lg border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800`}>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <selectedPaymentMethod.icon className="w-4 h-4 text-blue-600" />
                      {selectedPaymentMethod.name} - বিবরণ
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Amount */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          পরিমাণ *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            name="paymentDetails.amount"
                            value={formData.paymentDetails.amount}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                              isDark 
                                ? 'bg-white border-gray-300 text-gray-900' 
                                : 'border-gray-300'
                            } ${errors.amount ? 'border-red-500 focus:ring-red-500' : ''}`}
                          />
                        </div>
                        {errors.amount && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.amount}
                          </p>
                        )}
                      </div>

                      {/* Dynamic Fields based on Payment Method */}
                      {selectedPaymentMethod.fields.map((field) => (
                        <div key={field}>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
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
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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

                  {errors.paymentMethod && 
                    <p className="text-red-500 text-center mt-4 flex items-center justify-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {errors.paymentMethod}
                    </p>
                  }
                </div>
              )}
            </div>
          )}

          {/* Step 7: Confirmation (for credit with agent) */}
          {currentStep === 7 && formData.transactionType === 'credit' && formData.customerType === 'agent' && (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  তথ্য যাচাই এবং কনফার্মেশন
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  সমস্ত তথ্য সঠিক হলে কনফার্ম করুন
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    লেনদেনের বিবরণ
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">লেনদেনের ধরন:</span>
                        <p className="text-gray-900 dark:text-white font-medium">ক্রেডিট</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">এজেন্ট:</span>
                        <p className="text-gray-900 dark:text-white font-medium">{formData.customerName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ইনভয়েস:</span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          #{formData.selectedInvoice?.invoiceNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">পরিমাণ:</span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          ৳{formData.paymentDetails.amount ? parseFloat(formData.paymentDetails.amount).toLocaleString() : '0'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">পেমেন্ট মেথড:</span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {formData.paymentMethod === 'cash' ? 'নগদ' :
                           formData.paymentMethod === 'bank-transfer' ? 'ব্যাংক ট্রান্সফার' :
                           formData.paymentMethod === 'cheque' ? 'চেক' :
                           formData.paymentMethod === 'mobile-banking' ? 'মোবাইল ব্যাংকিং' :
                           formData.paymentMethod === 'others' ? 'অন্যান্য' : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date:</span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {new Date().toLocaleDateString('en-US')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Confirmation (for credit with customer) or Confirmation (for credit with agent) */}
          {currentStep === 6 && (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  তথ্য যাচাই এবং কনফার্মেশন
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  সব তথ্য সঠিক কিনা যাচাই করুন এবং কনফার্ম করুন
                </p>
              </div>

              <div className="max-w-6xl mx-auto">
                {/* Transaction Summary */}
                <div className={`p-3 sm:p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 mb-3 sm:mb-4 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    লেনদেনের সারসংক্ষেপ
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">লেনদেনের ধরন:</span>
                        <span className={`font-semibold ${
                          formData.transactionType === 'credit' ? 'text-green-600' : 
                          formData.transactionType === 'debit' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {formData.transactionType === 'credit' ? 'ক্রেডিট (আয়)' : 
                           formData.transactionType === 'debit' ? 'ডেবিট (ব্যয়)' : 'একাউন্ট টু একাউন্ট ট্রান্সফার'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">কাস্টমার:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formData.customerName}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">ক্যাটাগরি:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedCategory?.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">ইনভয়েস:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formData.selectedInvoice?.invoiceNumber || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">পেমেন্ট মেথড:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedPaymentMethod?.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">পরিমাণ:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ৳{formData.paymentDetails.amount}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Date:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(formData.date).toLocaleDateString('en-US')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Manager Selection */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    একাউন্ট ম্যানেজার নির্বাচন
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      একাউন্ট ম্যানেজার নির্বাচন
                    </label>
                    
                    {/* Account Manager Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="একাউন্ট ম্যানেজার খুঁজুন... (নাম, পদবী, ফোন, ইমেইল)"
                        value={accountManagerSearchTerm}
                        onChange={(e) => setAccountManagerSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>

                    {/* Account Manager List */}
                    {accountManagerSearchTerm && (
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                        {employeeLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-600 dark:text-gray-400">খুঁজছি...</span>
                          </div>
                        ) : employeeSearchError ? (
                          <div className="text-center py-4 text-red-500 dark:text-red-400 text-sm">
                            <div className="flex items-center justify-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              <span>খোঁজার সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।</span>
                            </div>
                          </div>
                        ) : employeeSearchResults.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                            {accountManagerSearchTerm ? 'কোনো একাউন্ট ম্যানেজার পাওয়া যায়নি' : 'একাউন্ট ম্যানেজার খুঁজতে টাইপ করুন'}
                          </div>
                        ) : (
                          employeeSearchResults.map((employee) => (
                            <button
                              key={employee._id || employee.id}
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  employeeReference: {
                                    id: employee._id || employee.id,
                                    name: employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
                                    employeeId: employee.employeeId || employee.id,
                                    position: employee.designation || employee.position || '',
                                    department: employee.department || ''
                                  }
                                }));
                                setAccountManagerSearchTerm('');
                              }}
                              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.01] ${
                                formData.employeeReference?.id === employee._id
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  formData.employeeReference?.id === employee._id
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                  <User className={`w-5 h-5 ${
                                    formData.employeeReference?.id === employee._id
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`} />
                                </div>
                                <div className="flex-1 text-left">
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'নাম নেই'}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {employee.designation || employee.position || 'পদবী নেই'}
                                  </p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {(employee.phone || employee.phoneNumber) && (
                                      <span className="text-xs text-blue-600 dark:text-blue-400">
                                        📞 {employee.phone || employee.phoneNumber}
                                      </span>
                                    )}
                                    {(employee.email || employee.emailAddress) && (
                                      <span className="text-xs text-green-600 dark:text-green-400">
                                        ✉️ {employee.email || employee.emailAddress}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {formData.employeeReference?.id === employee._id && (
                                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    {/* Selected Account Manager Display */}
                    {formData.employeeReference?.name && !accountManagerSearchTerm && (
                      <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {formData.employeeReference.name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {formData.employeeReference.position}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, employeeReference: { id: '', name: '', employeeId: '', position: '', department: '' } }))}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    অতিরিক্ত নোট
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="লেনদেন সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <button
                    onClick={handleSubmit}
                    disabled={createTransactionMutation.isPending || createBankAccountTransactionMutation.isPending}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    {(createTransactionMutation.isPending || createBankAccountTransactionMutation.isPending) ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">
                          {formData.transactionType === 'transfer' ? 'ট্রান্সফার হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                        </span>
                        <span className="sm:hidden">
                          {formData.transactionType === 'transfer' ? 'ট্রান্সফার...' : 'সংরক্ষণ...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {formData.transactionType === 'transfer' ? 'ট্রান্সফার সম্পন্ন করুন' : 'লেনদেন সংরক্ষণ করুন'}
                        </span>
                        <span className="sm:hidden">
                          {formData.transactionType === 'transfer' ? 'ট্রান্সফার' : 'সংরক্ষণ'}
                        </span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={generatePDF}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">PDF ডাউনলোড করুন</span>
                    <span className="sm:hidden">PDF ডাউনলোড</span>
                  </button>
               
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4 sm:mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
              currentStep === 1
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">আগের ধাপ</span>
            <span className="sm:hidden">পেছনে</span>
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep === (formData.transactionType === 'credit' ? (formData.customerType === 'agent' ? 7 : 6) : 5)}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
              currentStep === (formData.transactionType === 'credit' ? (formData.customerType === 'agent' ? 7 : 6) : 5)
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <span className="hidden sm:inline">পরের ধাপ</span>
            <span className="sm:hidden">আগে</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTransaction;