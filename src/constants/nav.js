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
  Eye
} from 'lucide-react';

export const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    current: true
  },
  {
    name: 'Customers',
    icon: Users,
    children: [
      { name: 'Customer List', href: '/customers', icon: List },
      { name: 'Add Customer', href: '/customers/add', icon: Plus },
      { name: 'Edit Customer', href: '/customers/edit', icon: Edit }
    ]
  },
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
      { name: 'Vendor List', href: '/vendors', icon: List },
      { name: 'Add Vendor', href: '/vendors/add', icon: Plus }
    ]
  },
  {
    name: 'Hajj & Umrah',
    icon: Building,
    children: [
      { name: 'Dashboard', href: '/hajj-umrah', icon: LayoutDashboard },
      {
        name: 'All Haji',
        icon: Users,
        children: [
          { name: 'Haji List', href: '/hajj-umrah/haji-list', icon: List },
          { name: 'Add New Haji', href: '/hajj-umrah/haji/add', icon: Plus }
        ]
      },
      {
        name: 'Hajj & Umrah B2B',
        icon: Building2,
        children: [
          { name: 'Hajj & Umrah Agent List', href: '/hajj-umrah/agent', icon: Users },
          { name: 'Create New Agent', href: '/hajj-umrah/agent/add', icon: Plus }
        ]
      },
      {
        name: 'Hajj Package',
        icon: Package,
        children: [
          { name: 'Hajj Package Overview', href: '/hajj-umrah/package-list', icon: List },
          { name: 'Create Hajj Package', href: '/hajj-umrah/package-creation', icon: Plus }
        ]
      }
    ]
  },
  {
    name: 'Air Ticketing',
    icon: Plane,
    children: [
      { name: 'New Ticket Sale', href: '/air-ticketing/new-ticket', icon: Plus },
      { name: 'Ticket List', href: '/air-ticketing/tickets', icon: List },
      { name: 'Ticket Invoice', href: '/air-ticketing/invoice', icon: FileText },
      { name: 'Air Ticket Agent', href: '/air-ticketing/agent', icon: Users }
    ]
  },
  {
    name: 'Visa Processing',
    icon: FileTextIcon3,
    children: [
      { name: 'Overview', href: '/visa-processing', icon: List },
      { name: 'Saudi Umrah Visa', href: '/visa-processing/saudi-umrah', icon: List },
      { name: 'Saudi Ziyarah Visa', href: '/visa-processing/saudi-ziyarah', icon: List },
      { name: 'Saudi Other Visas', href: '/visa-processing/saudi-other', icon: List },
      { name: 'Indian Tourist Visa', href: '/visa-processing/indian-tourist', icon: List },
      { name: 'Indian Medical Visa', href: '/visa-processing/indian-medical', icon: List },
      { name: 'Indian Business Visa', href: '/visa-processing/indian-business', icon: List },
      { name: 'Malaysia Tourist Visa', href: '/visa-processing/malaysia-tourist', icon: List },
      { name: 'Malaysia Other Visas', href: '/visa-processing/malaysia-other', icon: List },
      { name: 'Dubai Tourist Visa', href: '/visa-processing/dubai-tourist', icon: List },
      { name: 'Dubai Business Visa', href: '/visa-processing/dubai-business', icon: List },
      { name: 'Dubai Other Visas', href: '/visa-processing/dubai-other', icon: List },
      { name: 'Qatar Tourist Visa', href: '/visa-processing/qatar-tourist', icon: List },
      { name: 'Qatar Business Visa', href: '/visa-processing/qatar-business', icon: List },
      { name: 'Qatar Other Visas', href: '/visa-processing/qatar-other', icon: List },
      { name: 'China Tourist Visa', href: '/visa-processing/china-tourist', icon: List },
      { name: 'China Business Visa', href: '/visa-processing/china-business', icon: List },
      { name: 'China Other Visas', href: '/visa-processing/china-other', icon: List },
      { name: 'Thailand Tourist Visa', href: '/visa-processing/thailand-tourist', icon: List },
      { name: 'Thailand Business Visa', href: '/visa-processing/thailand-business', icon: List },
      { name: 'Thailand Medical Visa', href: '/visa-processing/thailand-medical', icon: List },
      { name: 'Thailand Other Visas', href: '/visa-processing/thailand-other', icon: List },
      { name: 'Create New Visa', href: '/visa-processing/create-new', icon: Plus }
    ]
  },
  {
    name: 'Short Term Loans',
    icon: Calculator,
    children: [
      { name : 'Loan Dashboard', href: '/loan', icon: LayoutDashboard },
      { name: 'Loan List', href: '/loan/list', icon: List },
      { name: 'New Loan Receiving', href: '/loan/new-receiving', icon: TrendingUp },
      { name: 'New Loan Giving', href: '/loan/new-giving', icon: TrendingDown }
    ]
  },
  {
    name: 'Fly Oval Limited',
    icon: Plane,
    children: [
      { name: 'Dashboard', href: '/fly-oval', icon: LayoutDashboard },
      { name: 'Agent List', href: '/fly-oval/agents', icon: Users },
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
      { name: 'Personal Income', href: '/personal/income', icon: TrendingUp },
      { name: 'Personal Expense', href: '/personal/expense', icon: TrendingDown },
      { name: 'Personal Savings', href: '/personal/savings', icon: PiggyBank },
      { name: 'Personal Loans', href: '/personal/loans', icon: Calculator }
    ]
  },
  {
    name: 'Other Business',
    icon: Briefcase,
    children: [
      { name: 'Business List', href: '/other-business', icon: List },
      { name: 'Add Business', href: '/other-business/add', icon: Plus },
      { name: 'Business Income', href: '/other-business/income', icon: TrendingUp },
      { name: 'Business Expense', href: '/other-business/expense', icon: TrendingDown },
      { name: 'Profit/Loss Summary', href: '/other-business/profit-loss', icon: BarChart3 }
    ]
  },
  {
    name: 'Office Management',
    icon: Home,
    children: [
      { name: 'Salary', href: '/office-management/salary', icon: DollarSign },
      { name: 'Office Rent', href: '/office-management/rent', icon: Building2 },
      { name: 'Food', href: '/office-management/food', icon: Utensils },
      { name: 'Utilities', href: '/office-management/utilities', icon: Zap }
    ]
  },
  {
    name: 'Money Exchange',
    icon: Globe,
    children: [
      { name: 'New Exchange', href: '/money-exchange/new', icon: Plus },
      { name: 'List', href: '/money-exchange/list', icon: List }
    ]
  },
  {
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'User Management', href: '/settings/users', icon: Users },
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
