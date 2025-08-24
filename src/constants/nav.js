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
  ChevronDown
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
      { name: 'Debit', href: '/transactions/debit', icon: TrendingDown },
      { name: 'Credit', href: '/transactions/credit', icon: TrendingUp }
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
      { name: 'Agent List', href: '/hajj-umrah/agents', icon: List },
      { name: 'Add Agent', href: '/hajj-umrah/add-agent', icon: Plus }
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
    href: '/logout',
    icon: LogOut
  }
];
