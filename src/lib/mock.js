// Mock data for the ERP dashboard

// Customers data
export const mockCustomers = [
  {
    id: 'C001',
    name: 'আহমেদ হোসেন',
    phone: '+880 1712-345678',
    email: 'ahmed@example.com',
    address: 'ঢাকা, বাংলাদেশ',
    status: 'active',
    totalTransactions: 15,
    balance: 25000,
    createdAt: '2024-01-15'
  },
  {
    id: 'C002',
    name: 'ফাতেমা বেগম',
    phone: '+880 1812-345679',
    email: 'fatema@example.com',
    address: 'চট্টগ্রাম, বাংলাদেশ',
    status: 'active',
    totalTransactions: 8,
    balance: 15000,
    createdAt: '2024-02-20'
  },
  {
    id: 'C003',
    name: 'রহমান আলী',
    phone: '+880 1912-345680',
    email: 'rahman@example.com',
    address: 'সিলেট, বাংলাদেশ',
    status: 'inactive',
    totalTransactions: 3,
    balance: 5000,
    createdAt: '2024-03-10'
  },
  {
    id: 'C004',
    name: 'সাবরিনা আক্তার',
    phone: '+880 1612-345681',
    email: 'sabrina@example.com',
    address: 'রাজশাহী, বাংলাদেশ',
    status: 'active',
    totalTransactions: 22,
    balance: 35000,
    createdAt: '2024-01-05'
  },
  {
    id: 'C005',
    name: 'ইমরান খান',
    phone: '+880 1512-345682',
    email: 'imran@example.com',
    address: 'খুলনা, বাংলাদেশ',
    status: 'active',
    totalTransactions: 12,
    balance: 18000,
    createdAt: '2024-02-15'
  }
];

// Transactions data
export const mockTransactions = [
  {
    id: 'T001',
    type: 'debit',
    amount: 15000,
    customerId: 'C001',
    customerName: 'আহমেদ হোসেন',
    description: 'টিকিট কেনা',
    date: '2024-03-15',
    status: 'completed'
  },
  {
    id: 'T002',
    type: 'credit',
    amount: 8000,
    customerId: 'C002',
    customerName: 'ফাতেমা বেগম',
    description: 'পেমেন্ট',
    date: '2024-03-14',
    status: 'completed'
  },
  {
    id: 'T003',
    type: 'debit',
    amount: 25000,
    customerId: 'C004',
    customerName: 'সাবরিনা আক্তার',
    description: 'হজ্জ প্যাকেজ',
    date: '2024-03-13',
    status: 'pending'
  },
  {
    id: 'T004',
    type: 'credit',
    amount: 12000,
    customerId: 'C001',
    customerName: 'আহমেদ হোসেন',
    description: 'রিফান্ড',
    date: '2024-03-12',
    status: 'completed'
  },
  {
    id: 'T005',
    type: 'debit',
    amount: 18000,
    customerId: 'C005',
    customerName: 'ইমরান খান',
    description: 'এয়ার টিকিট',
    date: '2024-03-11',
    status: 'completed'
  }
];

// Vendors data
export const mockVendors = [
  {
    id: 'V001',
    name: 'বাংলাদেশ বিমান',
    contactPerson: 'মাহমুদ আহমেদ',
    phone: '+880 2-955-1234',
    email: 'info@biman.com',
    address: 'ঢাকা, বাংলাদেশ',
    status: 'active',
    totalDue: 50000,
    lastPayment: '2024-02-28'
  },
  {
    id: 'V002',
    name: 'নভোএয়ার',
    contactPerson: 'রাশেদা খান',
    phone: '+880 2-955-5678',
    email: 'info@novoair.com',
    address: 'ঢাকা, বাংলাদেশ',
    status: 'active',
    totalDue: 35000,
    lastPayment: '2024-03-01'
  },
  {
    id: 'V003',
    name: 'ইউনাইটেড এয়ারওয়েজ',
    contactPerson: 'সাদমান সাকিব',
    phone: '+880 2-955-9012',
    email: 'info@unitedairways.com',
    address: 'ঢাকা, বাংলাদেশ',
    status: 'inactive',
    totalDue: 0,
    lastPayment: '2024-01-15'
  }
];

// Tickets data
export const mockTickets = [
  {
    id: 'TK001',
    customerName: 'আহমেদ হোসেন',
    from: 'ঢাকা',
    to: 'চট্টগ্রাম',
    airline: 'বাংলাদেশ বিমান',
    flightNo: 'BG-123',
    date: '2024-04-15',
    amount: 15000,
    status: 'confirmed'
  },
  {
    id: 'TK002',
    customerName: 'ফাতেমা বেগম',
    from: 'চট্টগ্রাম',
    to: 'ঢাকা',
    airline: 'নভোএয়ার',
    flightNo: 'BS-456',
    date: '2024-04-20',
    amount: 12000,
    status: 'pending'
  },
  {
    id: 'TK003',
    customerName: 'রহমান আলী',
    from: 'ঢাকা',
    to: 'সিলেট',
    airline: 'বাংলাদেশ বিমান',
    flightNo: 'BG-789',
    date: '2024-04-25',
    amount: 8000,
    status: 'confirmed'
  }
];

// Hajj & Umrah Agents
export const mockAgents = [
  {
    id: 'A001',
    name: 'আল-হাজ্জ ট্রাভেলস',
    contactPerson: 'মুহাম্মদ আলী',
    phone: '+880 1712-987654',
    email: 'info@alhajj.com',
    address: 'ঢাকা, বাংলাদেশ',
    status: 'active',
    totalBookings: 45,
    commission: 5
  },
  {
    id: 'A002',
    name: 'মক্কা মদিনা টুরস',
    contactPerson: 'আব্দুল্লাহ খান',
    phone: '+880 1812-987655',
    email: 'info@makkamadina.com',
    address: 'চট্টগ্রাম, বাংলাদেশ',
    status: 'active',
    totalBookings: 32,
    commission: 4.5
  }
];

// Dashboard widgets data
export const dashboardStats = {
  totalCustomers: 1250,
  totalDebit: 2500000,
  totalCredit: 1800000,
  vendorPaymentsDue: 150000,
  hajjUmrahAgents: 8,
  ticketsSold: 450,
  officeExpenses: 75000,
  exchangeRate: 110.50
};

// Recent activities
export const recentActivities = [
  {
    id: 1,
    type: 'transaction',
    description: 'নতুন লেনদেন: আহমেদ হোসেন - ৳১৫,০০০',
    time: '2 hours ago',
    icon: 'credit-card'
  },
  {
    id: 2,
    type: 'customer',
    description: 'নতুন গ্রাহক যোগ হয়েছে: ইমরান খান',
    time: '4 hours ago',
    icon: 'user-plus'
  },
  {
    id: 3,
    type: 'ticket',
    description: 'টিকিট বিক্রি: ঢাকা-চট্টগ্রাম - ৳১২,০০০',
    time: '6 hours ago',
    icon: 'plane'
  },
  {
    id: 4,
    type: 'payment',
    description: 'ভেন্ডর পেমেন্ট: বাংলাদেশ বিমান - ৳৫০,০০০',
    time: '1 day ago',
    icon: 'receipt'
  }
];

// Quick actions
export const quickActions = [
  { name: 'Add Customer', href: '/customers/add', icon: 'user-plus' },
  { name: 'New Transaction', href: '/transactions/debit', icon: 'credit-card' },
  { name: 'Add Vendor', href: '/vendors/add', icon: 'building' },
  { name: 'New Ticket', href: '/air-ticketing/new-ticket', icon: 'plane' }
];
