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
  MoreHorizontal
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import useAxiosSecure from '../../hooks/UseAxiosSecure';
import { 
  useCreateTransaction,
  useTransactions,
  useTransactionAccounts,
  useTransactionCustomers,
  useTransactionInvoices,
  useTransactionCategories,
  useSearchAgents,
  useSearchVendors
} from '../../hooks/useTransactionQueries';
import { generateTransactionPDF, generateSimplePDF } from '../../utils/pdfGenerator';
import EmployeeReferenceSearch from '../../components/common/EmployeeReferenceSearch';
import Swal from 'sweetalert2';

const NewTransaction = () => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const axiosSecure = useAxiosSecure();
  
  // React Query hooks
  const createTransactionMutation = useCreateTransaction();
  const { data: accounts = [], isLoading: accountsLoading, error: accountsError } = useTransactionAccounts();
  const { data: customers = [], isLoading: customersLoading, error: customersError } = useTransactionCustomers();
  const { data: categories = [], error: categoriesError } = useTransactionCategories();
  const { data: transactionsData } = useTransactions({}, 1, 1000); // Fetch all transactions for balance calculation

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Transaction Type
    transactionType: '',
    
    // Step 2: Customer Selection (for credit/debit)
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
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
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
  const { data: agentResults = [], isLoading: agentLoading } = useSearchAgents(searchTerm, !!searchTerm?.trim());
  const { data: vendorResults = [], isLoading: vendorLoading } = useSearchVendors(searchTerm, !!searchTerm?.trim());
  
  // Filter accounts based on search term
  const filteredAccounts = accounts.filter(account => {
    if (!accountSearchTerm) return true;
    const searchLower = accountSearchTerm.toLowerCase();
    return (
      account.name.toLowerCase().includes(searchLower) ||
      account.bankName.toLowerCase().includes(searchLower) ||
      account.accountNumber.includes(searchLower)
    );
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
  
  // Mock invoice data
  const [invoices] = useState([
    {
      id: 'INV-001',
      invoiceNumber: 'INV-2024-001',
      customerName: 'আহমেদ রহমান',
      amount: 25000,
      dueDate: '2024-02-15',
      status: 'Pending',
      description: 'এয়ার টিকেট - ঢাকা থেকে দুবাই'
    },
    {
      id: 'INV-002',
      invoiceNumber: 'INV-2024-002',
      customerName: 'ফাতিমা বেগম',
      amount: 15000,
      dueDate: '2024-02-20',
      status: 'Pending',
      description: 'ভিসা সার্ভিস - সৌদি উমরাহ ভিসা'
    },
    {
      id: 'INV-003',
      invoiceNumber: 'INV-2024-003',
      customerName: 'করিম উদ্দিন',
      amount: 450000,
      dueDate: '2024-02-25',
      status: 'Pending',
      description: 'হজ প্যাকেজ - হজ ২০২৪ প্রিমিয়াম'
    },
    {
      id: 'INV-004',
      invoiceNumber: 'INV-2024-004',
      customerName: 'রশিদা খান',
      amount: 75000,
      dueDate: '2024-02-28',
      status: 'Pending',
      description: 'এয়ার টিকেট - ঢাকা থেকে লন্ডন'
    }
  ]);

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => {
    if (!invoiceSearchTerm.trim()) return true;
    
    const searchLower = invoiceSearchTerm.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.customerName.toLowerCase().includes(searchLower) ||
      invoice.description.toLowerCase().includes(searchLower) ||
      invoice.amount.toString().includes(searchLower)
    );
  });

  // Filter accounts based on search terms
  const filteredDebitAccounts = accounts.filter(account => {
    if (!debitAccountSearchTerm.trim()) return true;
    
    const searchLower = debitAccountSearchTerm.toLowerCase();
    return (
      account.name.toLowerCase().includes(searchLower) ||
      account.bankName.toLowerCase().includes(searchLower) ||
      account.accountNumber.includes(debitAccountSearchTerm) ||
      account.type.toLowerCase().includes(searchLower)
    );
  });

  const filteredCreditAccounts = accounts.filter(account => {
    if (!creditAccountSearchTerm.trim()) return true;
    
    const searchLower = creditAccountSearchTerm.toLowerCase();
    return (
      account.name.toLowerCase().includes(searchLower) ||
      account.bankName.toLowerCase().includes(searchLower) ||
      account.accountNumber.includes(creditAccountSearchTerm) ||
      account.type.toLowerCase().includes(searchLower)
    );
  });

  // Filter account managers based on search term
  const filteredAccountManagers = accountManagers.filter(manager => {
    if (!accountManagerSearchTerm.trim()) return true;
    
    const searchLower = accountManagerSearchTerm.toLowerCase();
    return (
      manager.name.toLowerCase().includes(searchLower) ||
      manager.designation.toLowerCase().includes(searchLower) ||
      manager.phone.includes(accountManagerSearchTerm) ||
      manager.email.toLowerCase().includes(searchLower)
    );
  });

  // Customers are now fetched via React Query

  // Agent and vendor search are now handled by React Query hooks

  // State for categories to allow refreshing
  const [categoryGroups, setCategoryGroups] = useState([]);

  // Load categories from localStorage
  const loadCategories = () => {
    try {
      const savedCategories = localStorage.getItem('transactionCategories');
      if (savedCategories) {
        return JSON.parse(savedCategories);
      } else {
        // Default categories if none exist
        const defaultCategories = [
          {
            id: 'travel-tourism',
            name: 'ভ্রমণ ও পর্যটন',
            icon: '✈️',
            description: 'ভ্রমণ এবং পর্যটন সংক্রান্ত সব সেবা',
            subCategories: [
              { id: 'hajj', name: 'হাজ্জ', icon: '🕋', description: 'হাজ্জ প্যাকেজ এবং সেবা' },
              { id: 'umrah', name: 'উমরাহ', icon: '🕌', description: 'উমরাহ প্যাকেজ এবং সেবা' },
              { id: 'air-ticket', name: 'এয়ার টিকেট', icon: '✈️', description: 'বিমান টিকেট এবং ভ্রমণ' },
              { id: 'visa', name: 'ভিসা সার্ভিস', icon: '📋', description: 'ভিসা প্রক্রিয়াকরণ এবং সহায়তা' },
              { id: 'hotel', name: 'হোটেল বুকিং', icon: '🏨', description: 'হোটেল রিজার্ভেশন' },
              { id: 'insurance', name: 'ইনসুরেন্স', icon: '🛡️', description: 'ভ্রমণ এবং স্বাস্থ্য বীমা' }
            ]
          },
          {
            id: 'financial-services',
            name: 'আর্থিক সেবা',
            icon: '💰',
            description: 'আর্থিক লেনদেন এবং ব্যাংকিং সেবা',
            subCategories: [
              { id: 'loan-giving', name: 'লোন দেওয়া', icon: '💰', description: 'অন্যের কাছে ঋণ প্রদান' },
              { id: 'loan-receiving', name: 'লোন নেওয়া', icon: '💸', description: 'অন্যের কাছ থেকে ঋণ গ্রহণ' },
              { id: 'money-exchange', name: 'মানি এক্সচেঞ্জ', icon: '💱', description: 'মুদ্রা বিনিময় সেবা' },
              { id: 'investment', name: 'বিনিয়োগ', icon: '📈', description: 'বিভিন্ন বিনিয়োগ কার্যক্রম' },
              { id: 'savings', name: 'সঞ্চয়', icon: '🏦', description: 'ব্যাংক সঞ্চয় এবং জমা' }
            ]
          }
        ];
        localStorage.setItem('transactionCategories', JSON.stringify(defaultCategories));
        return defaultCategories;
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  };

  // Load categories on component mount
  useEffect(() => {
    setCategoryGroups(loadCategories());
  }, []);

  // Listen for storage changes to refresh categories
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'transactionCategories') {
        setCategoryGroups(loadCategories());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the same tab
    const handleCategoryUpdate = () => {
      setCategoryGroups(loadCategories());
    };

    window.addEventListener('categoryUpdated', handleCategoryUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('categoryUpdated', handleCategoryUpdate);
    };
  }, []);

  // Payment methods
  const paymentMethods = [
    { 
      id: 'cash', 
      name: 'ক্যাশ', 
      icon: Banknote, 
      color: 'from-green-500 to-green-600',
      fields: ['reference']
    },
    { 
      id: 'bank-transfer', 
      name: 'ব্যাংক ট্রান্সফার', 
      icon: CreditCardIcon, 
      color: 'from-blue-500 to-blue-600',
      fields: ['bankName', 'accountNumber', 'reference']
    },
    { 
      id: 'cheque', 
      name: 'চেক', 
      icon: Receipt, 
      color: 'from-orange-500 to-orange-600',
      fields: ['chequeNumber', 'bankName', 'reference']
    },
    { 
      id: 'mobile-banking', 
      name: 'মোবাইল ব্যাংকিং', 
      icon: Smartphone, 
      color: 'from-purple-500 to-purple-600',
      fields: ['mobileProvider', 'transactionId', 'reference']
    },
    { 
      id: 'others', 
      name: 'অন্যান্য', 
      icon: ArrowRightLeft, 
      color: 'from-gray-500 to-gray-600',
      fields: ['reference']
    }
  ];

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
    setFormData(prev => ({
      ...prev,
      customerId: customer.id || customer.customerId,
      customerName: customer.name,
      customerPhone: customer.mobile || customer.phone,
      customerEmail: customer.email,
      customerType: customer.customerType || 'customer',
      // Clear agent due info when selecting regular customer
      agentDueInfo: null
    }));
    setSearchTerm('');
    setSearchLoading(false); // Clear loading state
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
        umrahDue: agent.umrahDue || 0
      }
    }));
    setSearchTerm(''); // Clear search term to hide results
    setSearchLoading(false); // Clear loading state
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
    setSearchTerm(''); // Clear search term to hide results
    setSearchLoading(false); // Clear loading state
  };

  const handleInvoiceSelect = (invoice) => {
    setFormData(prev => ({
      ...prev,
      selectedInvoice: invoice,
      invoiceId: invoice.id,
      paymentDetails: {
        ...prev.paymentDetails,
        amount: invoice.amount.toString()
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
        id: manager.id,
        name: manager.name,
        phone: manager.phone,
        email: manager.email
      }
    }));
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
    setFormData(prev => ({ ...prev, category: categoryId }));
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
  const filteredCategoryGroups = categoryGroups.map(group => {
    const filteredSubCategories = group.subCategories.filter(subCategory =>
      subCategory.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
      subCategory.description.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
    
    return {
      ...group,
      subCategories: filteredSubCategories
    };
  }).filter(group => 
    group.subCategories.length > 0 ||
    group.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

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
          if (!formData.accountManager.id) {
            newErrors.accountManager = 'একাউন্ট ম্যানেজার নির্বাচন করুন';
          }
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
              // Validate destination account (where money comes to)
              if (!formData.destinationAccount.id) {
                newErrors.destinationAccount = 'ডেস্টিনেশন একাউন্ট নির্বাচন করুন';
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
            if (!formData.selectedInvoice || !formData.invoiceId) {
              newErrors.invoiceId = 'ইনভয়েস নির্বাচন করুন';
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
            // Validate destination account (where money comes to) for credit transactions
            if (!formData.destinationAccount.id) {
              newErrors.destinationAccount = 'ডেস্টিনেশন একাউন্ট নির্বাচন করুন';
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
        maxSteps = formData.customerType === 'agent' ? 6 : 6;
      }
      
      // For agents, go to step 5 (payment method) from step 4
      if (formData.transactionType === 'credit' && formData.customerType === 'agent' && currentStep === 4) {
        setCurrentStep(5); // Go to payment method
      } else {
        setCurrentStep(prev => Math.min(prev + 1, maxSteps));
      }
    }
  };

  const prevStep = () => {
    // Special handling for agent: go back from step 5 to step 4
    if (formData.transactionType === 'credit' && formData.customerType === 'agent' && currentStep === 5) {
      setCurrentStep(4); // Go back to balance display
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
    const finalStep = formData.transactionType === 'credit' && formData.customerType === 'agent' ? 6 : 6;
    if (!validateStep(finalStep)) return;

    // Validate amount is greater than 0
    const amount = parseFloat(formData.paymentDetails.amount);
    if (!amount || amount <= 0) {
      setErrors(prev => ({ ...prev, amount: 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে' }));
      return;
    }

    // Prepare transaction data for API
    const transactionData = {
      transactionType: formData.transactionType,
      customerId: formData.customerId,
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      paymentDetails: {
        bankName: formData.paymentDetails.bankName || null,
        accountNumber: formData.paymentDetails.accountNumber || null,
        chequeNumber: formData.paymentDetails.chequeNumber || null,
        mobileProvider: formData.paymentDetails.mobileProvider || null,
        transactionId: formData.paymentDetails.transactionId || null,
        amount: amount,
        reference: formData.paymentDetails.reference || null
      },
      customerBankAccount: {
        bankName: formData.customerBankAccount.bankName || null,
        accountNumber: formData.customerBankAccount.accountNumber || null
      },
      sourceAccount: {
        id: formData.sourceAccount.id,
        name: formData.sourceAccount.name,
        bankName: formData.sourceAccount.bankName,
        accountNumber: formData.sourceAccount.accountNumber,
        balance: formData.sourceAccount.balance
      },
      destinationAccount: {
        id: formData.destinationAccount.id,
        name: formData.destinationAccount.name,
        bankName: formData.destinationAccount.bankName,
        accountNumber: formData.destinationAccount.accountNumber,
        balance: formData.destinationAccount.balance
      },
      notes: formData.notes || null,
      date: formData.date,
      createdBy: userProfile?.email || 'unknown_user',
      branchId: userProfile?.branchId || 'main_branch',
      employeeReference: formData.employeeReference.id ? formData.employeeReference : null
    };

    // Log the data being sent for debugging
    console.log('Sending transaction data:', transactionData);

    // Use React Query mutation
    createTransactionMutation.mutate(transactionData, {
      onSuccess: (response) => {
      
      console.log('Transaction response:', response.data);
      
        // Success handling is now done in the mutation's onSuccess callback

        // Reset form after successful submission
        setFormData({
          transactionType: '',
          customerId: '',
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          customerBankAccount: {
            bankName: '',
            accountNumber: ''
          },
          category: '',
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
          notes: '',
          date: new Date().toISOString().split('T')[0],
          employeeReference: {
            id: '',
            name: '',
            employeeId: '',
            position: '',
            department: ''
          }
        });
        setCurrentStep(1);
        setSearchTerm('');

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
              transactionId: response.data.transaction?.transactionId || `TXN-${Date.now()}`,
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
      }
    });
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
                ) : (
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
                    {filteredCategoryGroups.map((group) => (
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

                    {filteredCategoryGroups.length === 0 && (
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
                  {/* Search Bar */}
                  <div className="relative mb-3 sm:mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    {searchLoading && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                    )}
                    <input
                      type="text"
                      placeholder="নাম, ফোন নম্বর বা ইমেইল দিয়ে খুঁজুন..."
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
                    {(searchTerm ? (agentLoading || vendorLoading || searchLoading) : customersLoading) ? (
                      <div className="flex items-center justify-center py-6 sm:py-8">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base">কাস্টমার লোড হচ্ছে...</span>
                      </div>
                    ) : searchTerm && (agentResults.length > 0 || vendorResults.length > 0) ? (
                      <>
                        {/* Agent Results */}
                        {agentResults.map((agent) => (
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
                        ))}

                        {/* Vendor Results */}
                        {vendorResults.map((vendor) => (
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
                        ))}
                      </>
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
                        {searchTerm ? 'কোন এজেন্ট/ভেন্ডর/কাস্টমার পাওয়া যায়নি' : 'কোন কাস্টমার নেই'}
                      </div>
                    )}
                  </div>

                  {errors.customerId && (
                    <p className="text-red-500 text-center mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      {errors.customerId}
                    </p>
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
                        {/* Total Balance */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট ব্যালেন্স</p>
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                ৳{formData.agentDueInfo?.totalDue?.toLocaleString() || '0'}
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
                          className={`bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            formData.selectedOption === 'hajj' 
                              ? 'border-amber-400 dark:border-amber-500 shadow-lg' 
                              : 'border-amber-200 dark:border-amber-700'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, selectedOption: 'hajj' }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">হজ্জ বাবদ</p>
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">হজ্জের জন্য পেমেন্ট</p>
                            </div>
                            <Building className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                          </div>
                        </div>
                        
                        {/* Umrah Option */}
                        <div 
                          className={`bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            formData.selectedOption === 'umrah' 
                              ? 'border-blue-400 dark:border-blue-500 shadow-lg' 
                              : 'border-blue-200 dark:border-blue-700'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, selectedOption: 'umrah' }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">উমরাহ বাবদ</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">উমরাহর জন্য পেমেন্ট</p>
                            </div>
                            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        
                        {/* Others Option */}
                        <div 
                          className={`bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            formData.selectedOption === 'others' 
                              ? 'border-gray-400 dark:border-gray-500 shadow-lg' 
                              : 'border-gray-200 dark:border-gray-600'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, selectedOption: 'others' }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">অনন্যা বাবদ</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">অন্যান্য পেমেন্ট</p>
                            </div>
                            <DollarSign className="w-6 h-6 text-gray-600 dark:text-gray-400" />
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
                        {[
                          { id: 'cash', label: 'নগদ', icon: Banknote, color: 'green' },
                          { id: 'bank-transfer', label: 'ব্যাংক ট্রান্সফার', icon: Building2, color: 'blue' },
                          { id: 'cheque', label: 'চেক', icon: FileText, color: 'purple' },
                          { id: 'mobile-banking', label: 'মোবাইল ব্যাংকিং', icon: Smartphone, color: 'indigo' },
                          { id: 'others', label: 'অন্যান্য', icon: MoreHorizontal, color: 'gray' }
                        ].map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                            className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-102 ${
                              formData.paymentMethod === method.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <method.icon className={`w-6 h-6 ${
                                formData.paymentMethod === method.id 
                                  ? 'text-blue-600' 
                                  : 'text-gray-400'
                              }`} />
                              <span className={`text-sm font-medium ${
                                formData.paymentMethod === method.id 
                                  ? 'text-blue-900 dark:text-blue-100' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {method.label}
                              </span>
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
                  </div>
                ) : (
                  // Credit: Invoice Selection
                  <div className="space-y-4 sm:space-y-6">
                    {/* Invoice Selection */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        ইনভয়েস তালিকা
                      </h3>
                      
                      <div className="space-y-3">
                        {invoices.length > 0 ? (
                          invoices.map((invoice) => (
                            <button
                              key={invoice.id}
                              type="button"
                              onClick={() => handleInvoiceSelect(invoice)}
                              className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-102 ${
                                formData.selectedInvoice?.id === invoice.id
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="text-left">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    ইনভয়েস #{invoice.invoiceNumber}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    পরিমাণ: ৳{invoice.amount.toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(invoice.date).toLocaleDateString('en-US')}
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
                      </div>
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
                    </h3>
                    
                    <div className="space-y-3">
                      {invoices.length > 0 ? (
                        invoices.map((invoice) => (
                          <button
                            key={invoice.id}
                            type="button"
                            onClick={() => handleInvoiceSelect(invoice)}
                            className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-102 ${
                              formData.selectedInvoice?.id === invoice.id
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="text-left">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  ইনভয়েস #{invoice.invoiceNumber}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  পরিমাণ: ৳{invoice.amount.toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(invoice.date).toLocaleDateString('en-US')}
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
                    </div>
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
                    <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                      {filteredAccountManagers.map((manager) => (
                        <button
                          key={manager.id}
                          onClick={() => handleAccountManagerSelect(manager)}
                          className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                            formData.accountManager?.id === manager.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                formData.accountManager?.id === manager.id
                                  ? 'bg-blue-100 dark:bg-blue-800'
                                  : 'bg-gray-100 dark:bg-gray-700'
                              }`}>
                                <User className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                  formData.accountManager?.id === manager.id
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`} />
                              </div>
                              <div className="text-left min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                  {manager.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {manager.designation}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                  📞 {manager.phone} • ✉️ {manager.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
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
                            key={invoice.id}
                            onClick={() => handleInvoiceSelect(invoice)}
                            className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                              formData.selectedInvoice?.id === invoice.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  formData.selectedInvoice?.id === invoice.id
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                  <Receipt className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                    formData.selectedInvoice?.id === invoice.id
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`} />
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                    {invoice.invoiceNumber}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {invoice.customerName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                    {invoice.description}
                                  </p>
                                </div>
                              </div>
                              <div className="text-left sm:text-right">
                                <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                                  ৳{invoice.amount.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                </p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  invoice.status === 'Pending' 
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

                  {/* Employee Reference */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      কর্মচারী রেফারেন্স (ঐচ্ছিক)
                    </label>
                    <EmployeeReferenceSearch
                      onSelect={handleEmployeeReferenceSelect}
                      placeholder="কর্মচারীর নাম লিখুন..."
                      buttonText="খুঁজুন"
                      selectedEmployee={formData.employeeReference.id ? formData.employeeReference : null}
                    />
                    {formData.employeeReference.id && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✅ কর্মচারী রেফারেন্স নির্বাচন করা হয়েছে
                      </p>
                    )}
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
                      disabled={createTransactionMutation.isPending}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      {createTransactionMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">সংরক্ষণ হচ্ছে...</span>
                          <span className="sm:hidden">সংরক্ষণ হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span className="hidden sm:inline">লেনদেন সংরক্ষণ করুন</span>
                          <span className="sm:hidden">সংরক্ষণ করুন</span>
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

                      {/* Destination Account */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          কাস্টমার (যার কাছ থেকে টাকা আসবে)
                        </label>
                        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
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
                        </div>
                      </div>
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

                {/* Employee Reference */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    কর্মচারী রেফারেন্স (ঐচ্ছিক)
                  </label>
                  <EmployeeReferenceSearch
                    onSelect={handleEmployeeReferenceSelect}
                    placeholder="কর্মচারীর নাম লিখুন..."
                    buttonText="খুঁজুন"
                    selectedEmployee={formData.employeeReference.id ? formData.employeeReference : null}
                  />
                  {formData.employeeReference.id && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✅ কর্মচারী রেফারেন্স নির্বাচন করা হয়েছে
                    </p>
                  )}
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
                    disabled={createTransactionMutation.isPending}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    {createTransactionMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">সংরক্ষণ হচ্ছে...</span>
                        <span className="sm:hidden">সংরক্ষণ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">লেনদেন সংরক্ষণ করুন</span>
                        <span className="sm:hidden">সংরক্ষণ করুন</span>
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
                    <span className="hidden sm:inline">ইমেইল পাঠান</span>
                    <span className="sm:hidden">ইমেইল</span>
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
