import {
  LayoutDashboard,
  Users,
  CreditCard,
  Building2,
  Plane,
  User,
  Briefcase,
  Building,
  DollarSign,
  Settings,
  UserCircle,
  LogOut,
  Plus,
  List,
  Receipt,
  FileText,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calculator,
  Home,
  Utensils,
  Zap,
  Globe,
  History,
  BarChart3,
  Shield,
  Bell,
  Database,
  ChevronDown,
  Wallet,
  CreditCard as CreditCardIcon,
  Banknote,
  PiggyBank as PiggyBankIcon,
  Calculator as CalculatorIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FileText as FileTextIcon,
  BarChart3 as BarChart3Icon,
  Settings as SettingsIcon,
  Bell as BellIcon,
  Database as DatabaseIcon,
  Shield as ShieldIcon,
  Users as UsersIcon,
  UserCircle as UserCircleIcon,
  LogOut as LogOutIcon,
  Plus as PlusIcon,
  List as ListIcon,
  Receipt as ReceiptIcon,
  FileSpreadsheet,
  FileText as FileTextIcon2,
  TrendingUp as TrendingUpIcon2,
  TrendingDown as TrendingDownIcon2,
  PiggyBank as PiggyBankIcon2,
  Calculator as CalculatorIcon2,
  Home as HomeIcon,
  Utensils as UtensilsIcon,
  Zap as ZapIcon,
  Globe as GlobeIcon,
  History as HistoryIcon,
  BarChart3 as BarChart3Icon2,
  Shield as ShieldIcon2,
  Bell as BellIcon2,
  Database as DatabaseIcon2,
  ChevronDown as ChevronDownIcon,
  FileText as FileTextIcon3,
  Edit,
  Package,
  Search,
  ClipboardList,
  BookOpen,
  FileCheck,
  Eye,
  Scale,
  Megaphone,
  Laptop,
  RotateCcw,
  ShoppingCart
} from 'lucide-react';

export const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    current: true
  },
  // {
  //   name: 'Customers',
  //   icon: Users,
  //   children: [
  //     { name: 'Customer List', href: '/customers', icon: List },
  //     { name: 'Add Customer', href: '/customers/add', icon: Plus },
  //   ]
  // },
  {
    name: 'Transactions',
    icon: CreditCard,
    children: [
      { name: 'Transactions List', href: '/transactions/list', icon: List },
      { name: 'New Transaction', href: '/transactions/new', icon: Plus }
    ]
  },
  {
    name: 'Sales & Invoice',
    icon: Receipt,
    children: [
      { name: 'Create Invoice', href: '/sales-invoice/new', icon: Plus },
      { name: 'Pending Invoices', href: '/sales-invoice/pending', icon: FileText },
      { name: 'All Invoices', href: '/sales-invoice/list', icon: List }
    ]
  },
  {
    name: 'Vendors',
    icon: Building2,
    children: [
      { name: 'Vendor Dashboard', href: '/vendors/dashboard', icon: LayoutDashboard },
      { name: 'Vendor List', href: '/vendors', icon: List },
      { name: 'Vendor Bill Genarate', href: '/vendors/bill', icon: Plus }
    ]
  },
  {
    name: 'Hajj & Umrah',
    icon: '🕋',
    children: [
      { name: 'Dashboard', href: '/hajj-umrah', icon: LayoutDashboard },
      {
        name: 'Hajj',
        icon: Users,
        children: [
          { name: 'Haji List', href: '/hajj-umrah/haji-list', icon: List },
          { name: 'Add New Haji', href: '/hajj-umrah/haji/add', icon: Plus },
          { name: 'License Management', href: '/hajj-umrah/license-management', icon: Eye }
        ]
      },
      {
        name: 'Umrah',
        icon: Users,
        children: [
          { name: 'Umrah Haji List', href: '/umrah/haji-list', icon: List },
          { name: 'Add New Umrah Haji', href: '/umrah/haji/add', icon: Plus }
        ]
      },
      {
        name: 'Hajj & Umrah B2B',
        icon: Building2,
        children: [
          { name: 'Hajj & Umrah Agent List', href: '/hajj-umrah/agent', icon: Users },
          { name: 'Create New Agent', href: '/hajj-umrah/agent/add', icon: Plus },
          { name: 'B2B Sell', href: '/hajj-umrah/b2b-sell', icon: ShoppingCart },
          { name: 'B2B Sell List', href: '/hajj-umrah/b2b-sell-list', icon: List }
        ]
      },
      {
        name: 'Package',
        icon: Package,
        children: [
          { name: 'Package Overview', href: '/hajj-umrah/package-list', icon: List },
          { name: 'Create Package', href: '/hajj-umrah/package-creation', icon: Plus }
        ]
      }
    ]
  },
  {
    name: 'Air Ticketing',
    icon: Plane,
    children: [
      { name: 'Dashboard', href: '/air-ticketing', icon: LayoutDashboard },
      { name: 'New Passenger', href: '/air-ticketing/new-passenger', icon: Plus },
      { name: 'Passenger List', href: '/air-ticketing/passengers', icon: Users },
      { name: 'New Ticket Sale', href: '/air-ticketing/new-ticket', icon: Plus },
      { name: 'Manage Booking', href: '/air-ticketing/tickets', icon: List },
      { name: 'Ticket Invoice', href: '/air-ticketing/invoice', icon: FileText },
      { name: 'B2B Agent', href: '/air-ticketing/agent', icon: Users },
      {
        name: 'Old Ticketing Service',
        icon: History,
        children: [
          { name: 'Ticket Check', href: '/air-ticketing/old/ticket-check', icon: FileCheck },
          { name: 'Old Ticket Reissue', href: '/air-ticketing/old/ticket-reissue', icon: RotateCcw }
        ]
      },
      { name: 'Airline List', href: '/air-ticketing/airline', icon: List },
    ]
  },

  {
    name: 'Visa Management',
    icon: FileTextIcon3,
    children: [
      { name: 'Dashboard', href: '/visa-processing', icon: LayoutDashboard },
      { name: 'Applicant Management', href: '/visa-processing/applicants', icon: Users },
      { name: 'Visa Tracking', href: '/visa-processing/tracking', icon: Search },
      { name: 'Payment', href: '/visa-processing/payment', icon: CreditCard },
      { name: 'Documents', href: '/visa-processing/documents', icon: FileText },
    ]
  },
  {
    name: 'Short Term Loans',
    icon: Calculator,
    children: [
      { name: 'Loan List', href: '/loan/list', icon: List },
    ]
  },
  {
    name: 'Fly Oval Limited',
    icon: Plane,
    children: [
      { name: 'Dashboard', href: '/fly-oval', icon: LayoutDashboard },
      { name: 'Agent List', href: '/fly-oval/agents', icon: Users },
      { name: 'Add Agent', href: '/fly-oval/agents/add', icon: Plus },
      { name: 'TopUp History', href: '/fly-oval/topup-history', icon: TrendingUp },
      { name: 'Sell History', href: '/fly-oval/sell-history', icon: TrendingDown },
      { name: 'Ledger', href: '/fly-oval/ledger', icon: BookOpen },
      { name: 'Reports', href: '/fly-oval/reports', icon: BarChart3 },
      { name: 'Audit', href: '/fly-oval/audit', icon: Eye }
    ]
  },
  {
    name: 'মিরাজ ইন্ডাস্ট্রিজ',
    icon: Building,
    children: [
      { name: 'ড্যাশবোর্ড', href: '/miraj-industries/dashboard', icon: LayoutDashboard },
      { name: 'গবাদি পশু ব্যবস্থাপনা', href: '/miraj-industries/cattle-management', icon: Users },
      { name: 'দুধ উৎপাদন রেকর্ড', href: '/miraj-industries/milk-production', icon: TrendingUp },
      { name: 'খাদ্য ব্যবস্থাপনা', href: '/miraj-industries/feed-management', icon: Utensils },
      { name: 'স্বাস্থ্য ও পশুচিকিৎসা', href: '/miraj-industries/health-records', icon: Shield },
      { name: 'প্রজনন ও বাচ্চা প্রসব', href: '/miraj-industries/breeding-records', icon: Plus },
      { name: 'আয়-খরচ রিপোর্ট', href: '/miraj-industries/financial-report', icon: BarChart3 },
      { name: 'কর্মচারী ব্যবস্থাপনা', href: '/miraj-industries/employee-management', icon: Users }
    ]
  },
  {
    name: 'Account',
    icon: Wallet,
    children: [
      { name: 'Account Overview', href: '/account', icon: BarChart3 },
      { name: 'Income Management', href: '/account/income', icon: TrendingUp },
      { name: 'Expense Management', href: '/account/expense', icon: TrendingDown },
      { name: 'Savings & Investments', href: '/account/savings', icon: PiggyBank },
      { name: 'Loans & Credit', href: '/account/loans', icon: Calculator },
      { name: 'Bank Accounts', href: '/account/bank-accounts', icon: CreditCard },
      { name: 'Credit Cards', href: '/account/credit-cards', icon: CreditCardIcon },
      { name: 'Financial Reports', href: '/account/reports', icon: FileText },
      { name: 'Budget Planning', href: '/account/budget', icon: BarChart3Icon },
      { name: 'Tax Management', href: '/account/tax', icon: Receipt }
    ]
  },
  {
    name: 'Personal',
    icon: User,
    children: [
      { name: 'Personal Expense', href: '/personal/expense', icon: TrendingDown }
    ]
  },
  {
  name: 'Office Management',
  icon: Home,
  children: [
    {
      name: 'HR Management',
      icon: Users,
      children: [
        { name: 'Employeers', href: '/office-management/hr/employee/list', icon: Users }, 
        { name: 'Payroll', href: '/office-management/hr/payroll', icon: Receipt },
        { name: 'Incentive Plan', href: '/office-management/hr/incentive-plan', icon: TrendingUp },
        { name: 'Provident Fund', href: '/office-management/hr/provident-fund', icon: PiggyBank },
        { name: 'Employee Sale Target', href: '/office-management/hr/sale-target', icon: BarChart3 },
        { name: 'Employee Attendance', href: '/office-management/hr/attendance', icon: ClipboardList }
      ]
      
    },
    { name: 'Operating Expenses', href: '/office-management/operating-expenses', icon: DollarSign },
  ]
},
  {
    name: 'Money Exchange',
    icon: Globe,
    children: [
      { name: 'Dashboard', href: '/money-exchange/dashboard', icon: LayoutDashboard },
      { name: 'New Exchange', href: '/money-exchange/new', icon: Plus },
      { name: 'List', href: '/money-exchange/list', icon: List }
    ]
  },
  {
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'User Management', href: '/settings/users', icon: Users },
      { name: 'Customer Managment', href: '/settings/customer-types', icon: Package },
      { name: 'Category Management', href: '/settings/categories', icon: Package },
      { name: 'Excel Upload', href: '/settings/excel-upload', icon: FileSpreadsheet },
      { name: 'Backup & Restore', href: '/settings/backup', icon: Database }
    ]
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserCircle
  },
  {
    name: 'Logout',
    href: null,
    icon: LogOut,
    action: 'logout'
  }
];
