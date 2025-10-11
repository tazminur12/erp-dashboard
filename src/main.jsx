import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import Hero from './components/Hero';
import './index.css';

// Customer pages
import CustomerList from './pages/Customers/CustomerList';
import AddCustomer from './pages/Customers/AddCustomer';
import EditCustomer from './pages/Customers/EditCustomer';
import CustomerDetails from './pages/Customers/CustomerDetails';

// Transaction pages
import TransactionsList from './pages/Transactions/TransactionsList';
import NewTransaction from './pages/Transactions/NewTransaction';

// Vendor pages
import VendorList from './pages/Vendors/VendorList';
import AddVendor from './pages/Vendors/AddVendor';
// Removed VendorPayment, VendorDueReport
import VendorDetails from './pages/Vendors/VendorDetails';

// Hajj & Umrah pages
import HajjUmrahDashboard from './pages/HajjUmrah/HajjUmrahDashboard';
import HajiList from './pages/HajjUmrah/HajiList';
import HajiDetails from './pages/HajjUmrah/HajiDetails';
import AddHaji from './pages/HajjUmrah/AddHaji';
import Agent from './pages/HajjUmrah/Agent';
import AddAgent from './pages/HajjUmrah/AddAgent';
import PackageCreation from './pages/HajjUmrah/PackageCreation';
import PackageList from './pages/HajjUmrah/PackageList';

// Air Ticketing pages
import NewTicket from './pages/AirTicketing/NewTicket';
import TicketList from './pages/AirTicketing/TicketList';
import TicketInvoice from './pages/AirTicketing/TicketInvoice';
import AgentList from './pages/AirTicketing/AgentList';

// Visa Processing pages
import VisaProcessingLayout from './pages/VisaProcessing/VisaProcessingLayout';
import VisaOverview from './pages/VisaProcessing/VisaOverview';
import SaudiUmrahVisa from './pages/VisaProcessing/SaudiUmrahVisa';
import CreateNewVisa from './pages/VisaProcessing/CreateNewVisa';

// Loan pages
import LoanDashboard from './pages/Loan/LoanDashboard';
import LoanList from './pages/Loan/LoanList';
import LoanDetails from './pages/Loan/LoanDetails';
import NewLoanReceiving from './pages/Loan/NewLoanReceiving';
import NewLoanGiving from './pages/Loan/NewLoanGiving';

// Miraj Industries pages - Cattle Management System
import CattleDashboard from './pages/MirajIndustries/CattleDashboard';
import CattleManagement from './pages/MirajIndustries/CattleManagement';
import MilkProduction from './pages/MirajIndustries/MilkProduction';
import FeedManagement from './pages/MirajIndustries/FeedManagement';
import HealthRecords from './pages/MirajIndustries/HealthRecords';
import BreedingRecords from './pages/MirajIndustries/BreedingRecords';
import FinancialReport from './pages/MirajIndustries/FinancialReport';
import EmployeeManagement from './pages/MirajIndustries/EmployeeManagement';

// Account pages
import AccountOverview from './pages/Account/AccountOverview';
import IncomeManagement from './pages/Account/IncomeManagement';
import ExpenseManagement from './pages/Account/ExpenseManagement';
import SavingsInvestments from './pages/Account/SavingsInvestments';
import LoansCredit from './pages/Account/LoansCredit';
import BankAccounts from './pages/Account/BankAccounts';
import CreditCards from './pages/Account/CreditCards';
import FinancialReports from './pages/Account/FinancialReports';
import BudgetPlanning from './pages/Account/BudgetPlanning';
import TaxManagement from './pages/Account/TaxManagement';

// Personal pages
import PersonalIncome from './pages/Personal/Income';
import PersonalExpense from './pages/Personal/Expense';
import PersonalSavings from './pages/Personal/Savings';
import PersonalLoans from './pages/Personal/Loans';

// Fly Oval Limited pages
import FlyOvalDashboard from './pages/FlyOval/Dashboard';
import FlyOvalAgentList from './pages/FlyOval/AgentList';
import FlyOvalTopUpHistory from './pages/FlyOval/TopUpHistory';
import FlyOvalSellHistory from './pages/FlyOval/SellHistory';
import FlyOvalLedger from './pages/FlyOval/Ledger';
import FlyOvalReports from './pages/FlyOval/Reports';
import FlyOvalAudit from './pages/FlyOval/Audit';

// Other Business pages
import BusinessList from './pages/OtherBusiness/BusinessList';
import AddBusiness from './pages/OtherBusiness/AddBusiness';
import BusinessIncome from './pages/OtherBusiness/BusinessIncome';
import BusinessExpense from './pages/OtherBusiness/BusinessExpense';
import ProfitLossSummary from './pages/OtherBusiness/ProfitLossSummary';

// Office Management pages
import Salary from './pages/OfficeManagement/Salary';
import OfficeRent from './pages/OfficeManagement/OfficeRent';
import Food from './pages/OfficeManagement/Food';
import Utilities from './pages/OfficeManagement/Utilities';


// Money Exchange pages
import NewExchange from './pages/MoneyExchange/NewExchange';
import List from './pages/MoneyExchange/List';

// Sales & Invoice pages
import GenerateInvoice from './pages/SalesInvoice/Generate';
import PendingInvoices from './pages/SalesInvoice/Pending';
import AllInvoices from './pages/SalesInvoice/List';

// Settings pages
import Users from './pages/Settings/Users';
import BackupRestore from './pages/Settings/BackupRestore';

// Profile page
import Profile from './pages/Profile/Profile';

// Auth pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ThemeProvider>
        <MainLayout />
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <Hero />
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "signup",
        element: <SignUp />
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />
      },
      {
        path: "profile",
        element: <Profile />
      }

    ]
  },
  {
    path: "/dashboard",
    element: (
      <ThemeProvider>
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />
      }
    ]
  },
  // Individual dashboard routes
  {
    path: "/customers",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <CustomerList />
      },
      {
        path: "add",
        element: <AddCustomer />
      },
      {
        path: "edit",
        element: <EditCustomer />
      },
      {
        path: "details/:id",
        element: <CustomerDetails />
      }
    ]
  },
  {
    path: "/transactions",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        path: "list",
        element: <TransactionsList />
      },
      {
        path: "new",
        element: <NewTransaction />
      }
    ]
  },
  {
    path: "/vendors",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <VendorList />
      },
      {
        path: "add",
        element: <AddVendor />
      },
      {
        path: ":id",
        element: <VendorDetails />
      },
      {
        path: "payment",
        element: null
      },
      {
        path: "due-report",
        element: null
      }
    ]
  },
  {
    path: "/hajj-umrah",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <HajjUmrahDashboard />
      },
      {
        path: "haji-list",
        element: <HajiList />
      },
      {
        path: "haji/add",
        element: <AddHaji />
      },
      {
        path: "haji/:id",
        element: <HajiDetails />
      },
      {
        path: "add-haji",
        element: null
      },
      {
        path: "agent",
        element: <Agent />
      },
      {
        path: "agent/add",
        element: <AddAgent />
      },
      {
        path: "package-creation",
        element: <PackageCreation />
      },
      {
        path: "package-list",
        element: <PackageList />
      }
    ]
  },
  {
    path: "/air-ticketing",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        path: "new-ticket",
        element: <NewTicket />
      },
      {
        path: "tickets",
        element: <TicketList />
      },
      {
        path: "invoice",
        element: <TicketInvoice />
      },
      {
        path: "agent",
        element: <AgentList />
      }
    ]
  },
  {
    path: "/visa-processing",
    element: (
      <ThemeProvider>
        <ProtectedRoute>
          <VisaProcessingLayout />
        </ProtectedRoute>
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <VisaOverview />
      },
      {
        path: "saudi-umrah",
        element: <SaudiUmrahVisa />
      },
      {
        path: "create-new",
        element: <CreateNewVisa />
      }
    ]
  },
  {
    path: "/loan",
    element: (
      <ThemeProvider>
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <LoanDashboard />
      },
      {
        path: "list",
        element: <LoanList />
      },
      {
        path: "details/:id",
        element: <LoanDetails />
      },
      {
        path: "new-receiving",
        element: <NewLoanReceiving />
      },
      {
        path: "new-giving",
        element: <NewLoanGiving />
      }
    ]
  },
  {
    path: "/miraj-industries",
    element: (
      <ThemeProvider>
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      </ThemeProvider>
    ),
    children: [
      {
        path: "dashboard",
        element: <CattleDashboard />
      },
      {
        path: "cattle-management",
        element: <CattleManagement />
      },
      {
        path: "milk-production",
        element: <MilkProduction />
      },
      {
        path: "feed-management",
        element: <FeedManagement />
      },
      {
        path: "health-records",
        element: <HealthRecords />
      },
      {
        path: "breeding-records",
        element: <BreedingRecords />
      },
      {
        path: "financial-report",
        element: <FinancialReport />
      },
      {
        path: "employee-management",
        element: <EmployeeManagement />
      }
    ]
  },
  {
    path: "/account",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <AccountOverview />
      },
      {
        path: "income",
        element: <IncomeManagement />
      },
      {
        path: "expense",
        element: <ExpenseManagement />
      },
      {
        path: "savings",
        element: <SavingsInvestments />
      },
      {
        path: "loans",
        element: <LoansCredit />
      },
      {
        path: "bank-accounts",
        element: <BankAccounts />
      },
      {
        path: "credit-cards",
        element: <CreditCards />
      },
      {
        path: "financial-reports",
        element: <FinancialReports />
      },
      {
        path: "budget-planning",
        element: <BudgetPlanning />
      },
      {
        path: "tax-management",
        element: <TaxManagement />
      }
    ]
  },
  {
    path: "/personal",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        path: "income",
        element: <PersonalIncome />
      },
      {
        path: "expense",
        element: <PersonalExpense />
      },
      {
        path: "savings",
        element: <PersonalSavings />
      },
      {
        path: "loans",
        element: <PersonalLoans />
      }
    ]
  },
  {
    path: "/fly-oval",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <FlyOvalDashboard />
      },
      {
        path: "agents",
        element: <FlyOvalAgentList />
      },
      {
        path: "topup-history",
        element: <FlyOvalTopUpHistory />
      },
      {
        path: "sell-history",
        element: <FlyOvalSellHistory />
      },
      {
        path: "ledger",
        element: <FlyOvalLedger />
      },
      {
        path: "reports",
        element: <FlyOvalReports />
      },
      {
        path: "audit",
        element: <FlyOvalAudit />
      }
    ]
  },
  {
    path: "/other-business",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <BusinessList />
      },
      {
        path: "add",
        element: <AddBusiness />
      },
      {
        path: "income",
        element: <BusinessIncome />
      },
      {
        path: "expense",
        element: <BusinessExpense />
      },
      {
        path: "profit-loss",
        element: <ProfitLossSummary />
      }
    ]
  },
  {
    path: "/office-management",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        path: "salary",
        element: <Salary />
      },
      {
        path: "rent",
        element: <OfficeRent />
      },
      {
        path: "food",
        element: <Food />
      },
      {
        path: "utilities",
        element: <Utilities />
      }
    ]
  },
  {
    path: "/money-exchange",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        path: "new",
        element: <NewExchange />
      },
      {
        path: "list",
        element: <List />
      }
    ]
  },
  {
    path: "/sales-invoice",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        path: "new",
        element: <GenerateInvoice />
      },
      {
        path: "pending",
        element: <PendingInvoices />
      },
      {
        path: "list",
        element: <AllInvoices />
      }
    ]
  },
  {
    path: "/settings",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        path: "users",
        element: <Users />
      },
      {
        path: "backup",
        element: <BackupRestore />
      }
    ]
  },
  {
    path: "/profile",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <Profile />
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
