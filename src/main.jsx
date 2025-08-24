import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Hero from './components/Hero';
import './index.css';

// Customer pages
import CustomerList from './pages/Customers/CustomerList';
import AddCustomer from './pages/Customers/AddCustomer';

// Transaction pages
import Debit from './pages/Transactions/Debit';
import Credit from './pages/Transactions/Credit';

// Vendor pages
import VendorList from './pages/Vendors/VendorList';
import AddVendor from './pages/Vendors/AddVendor';
import VendorPayment from './pages/Vendors/VendorPayment';
import VendorDueReport from './pages/Vendors/VendorDueReport';

// Hajj & Umrah pages
import AgentList from './pages/HajjUmrah/AgentList';
import AddAgent from './pages/HajjUmrah/AddAgent';

// Air Ticketing pages
import NewTicket from './pages/AirTicketing/NewTicket';
import TicketList from './pages/AirTicketing/TicketList';
import ReissueRefund from './pages/AirTicketing/ReissueRefund';
import AirlinesList from './pages/AirTicketing/AirlinesList';
import TicketInvoice from './pages/AirTicketing/TicketInvoice';

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
import OTPVerification from './pages/OTPVerification';

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
        path: "otp-verification",
        element: <OTPVerification />
      }
    ]
  },
  {
    path: "/dashboard",
    element: (
      <ThemeProvider>
        <DashboardLayout />
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
        path: "debit",
        element: <Debit />
      },
      {
        path: "credit",
        element: <Credit />
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
        path: "agents",
        element: <AgentList />
      },
      {
        path: "add-agent",
        element: <AddAgent />
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
