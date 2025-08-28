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
  ChevronDown as ChevronDownIcon
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
      { name: 'Add Customer', href: '/customers/add', icon: Plus }
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
    name: 'Vendors',
    icon: Building2,
    children: [
      { name: 'Vendor List', href: '/vendors', icon: List },
      { name: 'Add Vendor', href: '/vendors/add', icon: Plus },
      { name: 'Vendor Payment', href: '/vendors/payment', icon: Receipt },
      { name: 'Vendor Due Report', href: '/vendors/due-report', icon: FileText }
    ]
  },
  {
    name: 'Hajj & Umrah',
    icon: Building,
    children: [
      { name: 'Haji List', href: '/hajj-umrah/haji-list', icon: List },
      { name: 'Add New Haji', href: '/hajj-umrah/add-haji', icon: Plus },
      { name: 'Haj and Umrah Agent', href: '/hajj-umrah/agent', icon: Users },
      { name: 'Haj and Umrah Package Creation', href: '/hajj-umrah/package-creation', icon: Plus },
      { name: 'Haj & Umrah Package List', href: '/hajj-umrah/package-list', icon: List }
    ]
  },
  {
    name: 'Air Ticketing',
    icon: Plane,
    children: [
      { name: 'New Ticket Sale', href: '/air-ticketing/new-ticket', icon: Plus },
      { name: 'Ticket List', href: '/air-ticketing/tickets', icon: List },
      { name: 'Reissue/Refund', href: '/air-ticketing/reissue-refund', icon: Receipt },
      { name: 'Airlines List', href: '/air-ticketing/airlines', icon: List },
      { name: 'Ticket Invoice', href: '/air-ticketing/invoice', icon: FileText }
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
      { name: 'Exchange Rate Setup', href: '/money-exchange/rate-setup', icon: Settings },
      { name: 'New Exchange Transaction', href: '/money-exchange/new-exchange', icon: Plus },
      { name: 'Exchange History', href: '/money-exchange/history', icon: History },
      { name: 'Profit/Loss Report', href: '/money-exchange/profit-loss', icon: BarChart3 }
    ]
  },
  {
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'User Management', href: '/settings/users', icon: Users },
      { name: 'Roles & Permissions', href: '/settings/roles', icon: Shield },
      { name: 'System Settings', href: '/settings/system', icon: Settings },
      { name: 'Notification Settings', href: '/settings/notifications', icon: Bell },
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
