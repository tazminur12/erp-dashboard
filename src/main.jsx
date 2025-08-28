import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import Hero from './components/Hero';
import './index.css';

// Customer pages
import CustomerList from './pages/Customers/CustomerList';
import AddCustomer from './pages/Customers/AddCustomer';

// Transaction pages
import TransactionsList from './pages/Transactions/TransactionsList';
import NewTransaction from './pages/Transactions/NewTransaction';

// Vendor pages
import VendorList from './pages/Vendors/VendorList';
import AddVendor from './pages/Vendors/AddVendor';
import VendorPayment from './pages/Vendors/VendorPayment';
import VendorDueReport from './pages/Vendors/VendorDueReport';

// Hajj & Umrah pages
import HajiList from './pages/HajjUmrah/HajiList';
import AddNewHaji from './pages/HajjUmrah/AddNewHaji';
import Agent from './pages/HajjUmrah/Agent';
import PackageCreation from './pages/HajjUmrah/PackageCreation';
import PackageList from './pages/HajjUmrah/PackageList';

// Air Ticketing pages
import NewTicket from './pages/AirTicketing/NewTicket';
import TicketList from './pages/AirTicketing/TicketList';
import ReissueRefund from './pages/AirTicketing/ReissueRefund';
import AirlinesList from './pages/AirTicketing/AirlinesList';
import TicketInvoice from './pages/AirTicketing/TicketInvoice';

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
import RateSetup from './pages/MoneyExchange/RateSetup';
import NewExchange from './pages/MoneyExchange/NewExchange';
import ExchangeHistory from './pages/MoneyExchange/ExchangeHistory';
import ProfitLoss from './pages/MoneyExchange/ProfitLoss';

// Settings pages
import Users from './pages/Settings/Users';
import Roles from './pages/Settings/Roles';
import System from './pages/Settings/System';
import Notifications from './pages/Settings/Notifications';
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
        path: "payment",
        element: <VendorPayment />
      },
      {
        path: "due-report",
        element: <VendorDueReport />
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
        path: "haji-list",
        element: <HajiList />
      },
      {
        path: "add-haji",
        element: <AddNewHaji />
      },
      {
        path: "agent",
        element: <Agent />
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
        path: "reissue-refund",
        element: <ReissueRefund />
      },
      {
        path: "airlines",
        element: <AirlinesList />
      },
      {
        path: "invoice",
        element: <TicketInvoice />
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
        path: "rate-setup",
        element: <RateSetup />
      },
      {
        path: "new-exchange",
        element: <NewExchange />
      },
      {
        path: "history",
        element: <ExchangeHistory />
      },
      {
        path: "profit-loss",
        element: <ProfitLoss />
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
        path: "roles",
        element: <Roles />
      },
      {
        path: "system",
        element: <System />
      },
      {
        path: "notifications",
        element: <Notifications />
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
    <RouterProvider router={router} />
  </React.StrictMode>,
);
