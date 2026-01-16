import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Hero from './components/Hero';
import './index.css';

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for server errors (5xx)
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

// Lazy loaded components for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));

// Transaction pages
const TransactionsList = React.lazy(() => import ('./pages/Transactions/TransactionsList'))
const NewTransaction = React.lazy(() => import('./pages/Transactions/NewTransaction'));
const TodayTransactions = React.lazy(() => import('./pages/Transactions/TodayTransactions'));

// Vendor pages
const VendorDashboard = React.lazy(() => import('./pages/Vendors/VendorDashboard'));
const VendorList = React.lazy(() => import('./pages/Vendors/VendorList'));
const AddVendor = React.lazy(() => import('./pages/Vendors/AddVendor'));
const EditVendor = React.lazy(() => import('./pages/Vendors/EditVendor'));
const VendorDetails = React.lazy(() => import('./pages/Vendors/VendorDetails'));
const VendorBankAccounts = React.lazy(() => import('./pages/Vendors/VendorBankAccounts'));
const VendorBillGenerate = React.lazy(() => import('./pages/Vendors/VendorBillGenerate'));

// Hajj & Umrah pages
const HajjUmrahDashboard = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.HajjUmrahDashboard })).catch(() => ({ default: () => <div>Component not found</div> })));
const HajiList = React.lazy(() => import('./pages/HajjUmrah/Haj/HajiList'));
const HajiDetails = React.lazy(() => import('./pages/HajjUmrah/Haj/HajiDetails'));
const EditHaji = React.lazy(() => import('./pages/HajjUmrah/Haj/EditHaji'));
const UmrahHajiDetails = React.lazy(() => import('./pages/HajjUmrah/Umrah/UmrahHajiDetails'));
const AddHaji = React.lazy(() => import('./pages/HajjUmrah/Haj/AddHaji'));
const Agent = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.Agent })).catch(() => ({ default: () => <div>Component not found</div> })));
const AgentPackageList = React.lazy(() => import('./pages/HajjUmrah/B2BAgent/AgentPackageList'));
const AgentPackageCreation = React.lazy(() => import('./pages/HajjUmrah/B2BAgent/AgentPackageCreation'));
const AgentPackageDetails = React.lazy(() => import('./pages/HajjUmrah/B2BAgent/AgentPackageDetails'));
const AgentPackageEdit = React.lazy(() => import('./pages/HajjUmrah/B2BAgent/AgentPackageEdit'));
const AgentPackageCosting = React.lazy(() => import('./pages/HajjUmrah/B2BAgent/AgentPackageCosting'));
const AgentDetails = React.lazy(() => import('./pages/HajjUmrah/B2BAgent/AgentDetails'));
const AddAgent = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.AddAgent })).catch(() => ({ default: () => <div>Component not found</div> })));
const EditB2BAgent = React.lazy(() => import('./pages/HajjUmrah/B2BAgent/EditAgent'));
const B2BSellPage = React.lazy(() => import('./pages/HajjUmrah/B2BAgent/B2BSellPage'));
const B2BSellList = React.lazy(() => import('./pages/HajjUmrah/B2BAgent/B2BSellList'));
const PackageDetails = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.PackageDetails })).catch(() => ({ default: () => <div>Component not found</div> })));
const PackageCustomersList = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.PackageCustomersList })).catch(() => ({ default: () => <div>Component not found</div> })));
const HajPackageList = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.HajPackageList })).catch(() => ({ default: () => <div>Component not found</div> })));
const HajPackageCreation = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.HajPackageCreation })).catch(() => ({ default: () => <div>Component not found</div> })));
const HajPackageCosting = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.HajPackageCosting })).catch(() => ({ default: () => <div>Component not found</div> })));
const HajPackageEdit = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.HajPackageEdit })).catch(() => ({ default: () => <div>Component not found</div> })));
const AddUmrahHaji = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.AddUmrahHaji })).catch(() => ({ default: () => <div>Component not found</div> })));
const EditUmrahHaji = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.EditUmrahHaji })).catch(() => ({ default: () => <div>Component not found</div> })));
const UmrahHajiList = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.UmrahHajiList })).catch(() => ({ default: () => <div>Component not found</div> })));
const UmrahPackageList = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.UmrahPackageList })).catch(() => ({ default: () => <div>Component not found</div> })));
const UmrahPackageCreation = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.UmrahPackageCreation })).catch(() => ({ default: () => <div>Component not found</div> })));
const UmrahPackageCosting = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.UmrahPackageCosting })).catch(() => ({ default: () => <div>Component not found</div> })));
const UmrahPackageEdit = React.lazy(() => import('./pages/HajjUmrah').then(module => ({ default: module.UmrahPackageEdit })).catch(() => ({ default: () => <div>Component not found</div> })));
const LicenseManagement = React.lazy(() => import('./pages/HajjUmrah/LicenseManagement'));
const HotelManagement = React.lazy(() => import('./pages/HajjUmrah/HotelManagement'));

// Air Ticketing pages
const AirTicketDashboard = React.lazy(() => import('./pages/AirTicketing/Dashboard'));
const NewTicket = React.lazy(() => import('./pages/AirTicketing/NewTicket'));
const TicketList = React.lazy(() => import('./pages/AirTicketing/TicketList'));
const TicketEdit = React.lazy(() => import('./pages/AirTicketing/TicketEdit'));
const TicketDetails = React.lazy(() => import('./pages/AirTicketing/TicketDetails'));
const TicketInvoice = React.lazy(() => import('./pages/AirTicketing/TicketInvoice'));
const PassengerList = React.lazy(() => import('./pages/AirTicketing/PassengerList'));
const NewPassenger = React.lazy(() => import('./pages/AirTicketing/NewPassenger'));
const PassengerEdit = React.lazy(() => import('./pages/AirTicketing/PassengerEdit'));
const PassengerDetails = React.lazy(() => import('./pages/AirTicketing/PassengerDetails'));
const AgentList = React.lazy(() => import('./pages/AirTicketing/B2BAirAgent/AgentList'));
const AirAgentAdd = React.lazy(() => import('./pages/AirTicketing/B2BAirAgent/AirAgentAdd'));
const AirAgentDetails = React.lazy(() => import('./pages/AirTicketing/B2BAirAgent/AirAgentDetails'));
const AirAgentEdit = React.lazy(() => import('./pages/AirTicketing/B2BAirAgent/AirAgentEdit'));
const TicketCheck = React.lazy(() => import('./pages/AirTicketing/TicketCheck'));
const TicketCheckList = React.lazy(() => import('./pages/AirTicketing/TicketCheckList'));
const OldTicketReissue = React.lazy(() => import('./pages/AirTicketing/OldTicketReissue'));
const OldTicketReissueList = React.lazy(() => import('./pages/AirTicketing/OldTicketReissueList'));
const OldTicketingDashboard = React.lazy(() => import('./pages/AirTicketing/OldTicketingDashboard'));
const AirlineList = React.lazy(() => import('./pages/AirTicketing/AirlineList'));
const AirlineDetails = React.lazy(() => import('./pages/AirTicketing/AirlineDetails'));

// Visa Processing pages
const VisaProcessingDashboard = React.lazy(() => import('./pages/VisaProcessing').then(module => ({ default: module.VisaProcessingDashboard })).catch(() => ({ default: () => <div>Component not found</div> })));
const ApplicantManagement = React.lazy(() => import('./pages/VisaProcessing').then(module => ({ default: module.ApplicantManagement })).catch(() => ({ default: () => <div>Component not found</div> })));
const VisaTracking = React.lazy(() => import('./pages/VisaProcessing').then(module => ({ default: module.VisaTracking })).catch(() => ({ default: () => <div>Component not found</div> })));
const VisaPayment = React.lazy(() => import('./pages/VisaProcessing').then(module => ({ default: module.VisaPayment })).catch(() => ({ default: () => <div>Component not found</div> })));
const VisaDocuments = React.lazy(() => import('./pages/VisaProcessing').then(module => ({ default: module.VisaDocuments })).catch(() => ({ default: () => <div>Component not found</div> })));

// Loan pages (direct file imports to surface real errors and avoid masking with catch)
const LoanDashboard = React.lazy(() => import('./pages/Loan/Dashboard'));
const ReceivingList = React.lazy(() => import('./pages/Loan/ReceivingList'));
const GivingList = React.lazy(() => import('./pages/Loan/GivingList'));
const LoanDetails = React.lazy(() => import('./pages/Loan/LoanDetails'));
const NewLoanReceiving = React.lazy(() => import('./pages/Loan/NewLoanReceiving'));
const NewLoanGiving = React.lazy(() => import('./pages/Loan/NewLoanGiving'));
const EditLoanReceiving = React.lazy(() => import('./pages/Loan/EditLoanReceiving'));
const EditLoanGiving = React.lazy(() => import('./pages/Loan/EditLoanGiving'));

// Miraj Industries pages - Cattle Management System
const CattleDashboard = React.lazy(() => import('./pages/MirajIndustries').then(module => ({ default: module.CattleDashboard })).catch(() => ({ default: () => <div>Component not found</div> })));
const CattleManagement = React.lazy(() => import('./pages/MirajIndustries').then(module => ({ default: module.CattleManagement })).catch(() => ({ default: () => <div>Component not found</div> })));
const MilkProduction = React.lazy(() => import('./pages/MirajIndustries').then(module => ({ default: module.MilkProduction })).catch(() => ({ default: () => <div>Component not found</div> })));
const FeedManagement = React.lazy(() => import('./pages/MirajIndustries').then(module => ({ default: module.FeedManagement })).catch(() => ({ default: () => <div>Component not found</div> })));
const HealthRecords = React.lazy(() => import('./pages/MirajIndustries').then(module => ({ default: module.HealthRecords })).catch(() => ({ default: () => <div>Component not found</div> })));
const BreedingRecords = React.lazy(() => import('./pages/MirajIndustries').then(module => ({ default: module.BreedingRecords })).catch(() => ({ default: () => <div>Component not found</div> })));
const FinancialReport = React.lazy(() => import('./pages/MirajIndustries').then(module => ({ default: module.FinancialReport })).catch(() => ({ default: () => <div>Component not found</div> })));
const EmployeeManagement = React.lazy(() => import('./pages/MirajIndustries').then(module => ({ default: module.EmployeeManagement })).catch(() => ({ default: () => <div>Component not found</div> })));
const ExpenseDetailsMI = React.lazy(() => import('./pages/MirajIndustries/ExpenseDetails'));
const IncomeDetailsMI = React.lazy(() => import('./pages/MirajIndustries/IncomeDetails'));
const ExpenseEditMI = React.lazy(() => import('./pages/MirajIndustries/ExpenseEdit'));
const IncomeEditMI = React.lazy(() => import('./pages/MirajIndustries/IncomeEdit'));
const CattleDetails = React.lazy(() => import('./pages/MirajIndustries/CattleDetails'));
const EmployeeDetails = React.lazy(() => import('./pages/MirajIndustries/EmployeeDetails'));
const EditEmployeeMI = React.lazy(() => import('./pages/MirajIndustries/EditEmployee'));


// Account pages
const AccountOverview = React.lazy(() => import('./pages/Account/AccountOverview'));
const IncomeManagement = React.lazy(() => import('./pages/Account/IncomeManagement'));
const ExpenseManagement = React.lazy(() => import('./pages/Account/ExpenseManagement'));
const SavingsInvestments = React.lazy(() => import('./pages/Account/SavingsInvestments'));
const LoansCredit = React.lazy(() => import('./pages/Account/LoansCredit'));
const BankAccounts = React.lazy(() => import('./pages/Account/BankAccounts'));
const BankAccountsProfile = React.lazy(() => import('./pages/Account/BankAccountsProfile'));
const AddBankAccount = React.lazy(() => import('./pages/Account/AddBankAccount'));
const EditBankAccount = React.lazy(() => import('./pages/Account/EditBankAccount'));
const CreditCards = React.lazy(() => import('./pages/Account/CreditCards'));
const FinancialReports = React.lazy(() => import('./pages/Account/FinancialReports'));
const BudgetPlanning = React.lazy(() => import('./pages/Account/BudgetPlanning'));
const TaxManagement = React.lazy(() => import('./pages/Account/TaxManagement'));

// Personal pages
const PersonalExpense = React.lazy(() => import('./pages/Personal/Expense'));
const ExpenseCategoriesPage = React.lazy(() => import('./pages/Personal/ExpenseCategories'));
const PersonalExpenseDetails = React.lazy(() => import('./pages/Personal/ExpenseDetails'));

// Fly Oval Limited pages
const FlyOvalDashboard = React.lazy(() => import('./pages/FlyOval').then(module => ({ default: module.FlyOvalDashboard })).catch(() => ({ default: () => <div>Component not found</div> })));
const FlyOvalAgentList = React.lazy(() => import('./pages/FlyOval').then(module => ({ default: module.AgentList })).catch(() => ({ default: () => <div>Component not found</div> })));
const AddFlyOvalAgent = React.lazy(() => import('./pages/FlyOval').then(module => ({ default: module.AddAgent })).catch(() => ({ default: () => <div>Component not found</div> })));
const FlyOvalAgentDetails = React.lazy(() => import('./pages/FlyOval/AgentDetails'));
const EditAgent = React.lazy(() => import('./pages/FlyOval/EditAgent'));
const FlyOvalTopUpHistory = React.lazy(() => import('./pages/FlyOval').then(module => ({ default: module.TopUpHistory })).catch(() => ({ default: () => <div>Component not found</div> })));
const FlyOvalSellHistory = React.lazy(() => import('./pages/FlyOval').then(module => ({ default: module.SellHistory })).catch(() => ({ default: () => <div>Component not found</div> })));
const FlyOvalLedger = React.lazy(() => import('./pages/FlyOval').then(module => ({ default: module.Ledger })).catch(() => ({ default: () => <div>Component not found</div> })));
const FlyOvalReports = React.lazy(() => import('./pages/FlyOval').then(module => ({ default: module.Reports })).catch(() => ({ default: () => <div>Component not found</div> })));
const FlyOvalAudit = React.lazy(() => import('./pages/FlyOval').then(module => ({ default: module.Audit })).catch(() => ({ default: () => <div>Component not found</div> })));

// Excel Upload page
const ExcelUploadPage = React.lazy(() => import('./pages/ExcelUpload/ExcelUploadPage'));

// Office Management pages
const Payroll = React.lazy(() => import('./pages/OfficeManagement/HR Managment/Payroll'));
const Provident_Fund = React.lazy(() => import('./pages/OfficeManagement/HR Managment/Provident_Fund'));
const Sale_Target = React.lazy(() => import('./pages/OfficeManagement/HR Managment/Sale_Target'));
const Attendance = React.lazy(() => import('./pages/OfficeManagement/HR Managment/Attendance'));
const IncentivePlan = React.lazy(() => import('./pages/OfficeManagement/HR Managment/IncentivePlan'));
const EmployeeList = React.lazy(() => import('./pages/OfficeManagement/HR Managment/EmployeeList'));
const AddEmployee = React.lazy(() => import('./pages/OfficeManagement/HR Managment/AddEmployee'));
const EmployeeProfile = React.lazy(() => import('./pages/OfficeManagement/HR Managment/EmployeeProfile'));
const EditEmployee = React.lazy(() => import('./pages/OfficeManagement/HR Managment/EditEmployee'));

// Operating Expenses pages
const OperatingExpenses = React.lazy(() => import('./pages/OfficeManagement/OperatingExpenses'));
const AddCategory = React.lazy(() => import('./pages/OfficeManagement/AddCategory'));
const OperatingExpenseDetails = React.lazy(() => import('./pages/OfficeManagement/OperatingExpenseDetails'));

// Money Exchange pages
const ExchangeDashboard = React.lazy(() => import('./pages/MoneyExchange/Dashboard'));
const NewExchange = React.lazy(() => import('./pages/MoneyExchange/NewExchange'));
const List = React.lazy(() => import('./pages/MoneyExchange/List'));
const EditExchange = React.lazy(() => import('./pages/MoneyExchange/EditExchange'));
const ExchangeDetails = React.lazy(() => import('./pages/MoneyExchange/Details'));

// Marketing pages
const SmsMarketing = React.lazy(() => import('./pages/Marketing/SmsMarketing'));
const AllContacts = React.lazy(() => import('./pages/Marketing/AllContacts'));
const Groups = React.lazy(() => import('./pages/Marketing/Groups'));
const EmailMarketing = React.lazy(() => import('./pages/Marketing/EmailMarketing'));

// Sales & Invoice pages
const GenerateInvoice = React.lazy(() => import('./pages/SalesInvoice/Generate'));
const PendingInvoices = React.lazy(() => import('./pages/SalesInvoice/Pending'));
const AllInvoices = React.lazy(() => import('./pages/SalesInvoice/List'));

// Settings pages
const Users = React.lazy(() => import('./pages/Settings/Users'));
const CustomerManagment = React.lazy(() => import('./pages/Settings/CustomerManagment'));

// Additional Services pages
const AdditionalServicesDashboard = React.lazy(() => import('./pages/AdditionalServices/Dashboard'));
const CustomerList = React.lazy(() => import('./pages/AdditionalServices/CustomerList'));
const AddCustomer = React.lazy(() => import('./pages/AdditionalServices/AddCustomer'));
const EditCustomer = React.lazy(() => import('./pages/AdditionalServices/EditCustomer'));
const CustomerDetails = React.lazy(() => import('./pages/AdditionalServices/CustomerDetails'));
const PassportService = React.lazy(() => import('./pages/AdditionalServices/Passport/PassportService'));
const AddPassportService = React.lazy(() => import('./pages/AdditionalServices/Passport/AddPassportService'));
const PassportServiceDetails = React.lazy(() => import('./pages/AdditionalServices/Passport/PassportServiceDetails'));
const ManpowerService = React.lazy(() => import('./pages/AdditionalServices/Manpower/ManpowerService'));
const AddManpowerService = React.lazy(() => import('./pages/AdditionalServices/Manpower/AddManpowerService'));
const ManpowerServiceDetails = React.lazy(() => import('./pages/AdditionalServices/Manpower/ManpowerServiceDetails'));
const VisaProcessing = React.lazy(() => import('./pages/AdditionalServices/visa/VisaProcessing'));
const AddVisaProcessing = React.lazy(() => import('./pages/AdditionalServices/visa/AddVisaProcessing'));
const VisaProcessingDetails = React.lazy(() => import('./pages/AdditionalServices/visa/VisaProcessingDetails'));
const OtherService = React.lazy(() => import('./pages/AdditionalServices/other/OtherService'));
const AddOtherService = React.lazy(() => import('./pages/AdditionalServices/other/AddOtherService'));
const OtherServiceDetails = React.lazy(() => import('./pages/AdditionalServices/other/OtherServiceDetails'));
const CategoryManagement = React.lazy(() => import('./pages/Settings/CategoryManagement'));
const BackupRestore = React.lazy(() => import('./pages/Settings/BackupRestore'));

// Profile page
const Profile = React.lazy(() => import('./pages/Profile/Profile'));

// Auth pages
const Login = React.lazy(() => import('./pages/Login'));
const SignUp = React.lazy(() => import('./pages/SignUp'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const OTPLogin = React.lazy(() => import('./pages/OTPLogin'));

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
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Login />
          </Suspense>
        )
      },
      {
        path: "otp-login",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <OTPLogin />
          </Suspense>
        )
      },
      {
        path: "signup",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SignUp />
          </Suspense>
        )
      },
      {
        path: "forgot-password",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ForgotPassword />
          </Suspense>
        )
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Profile />
          </Suspense>
        )
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
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        )
      }
    ]
  },
  // Individual dashboard routes
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
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TransactionsList />
          </Suspense>
        )
      },
      {
        path: "today",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TodayTransactions />
          </Suspense>
        )
      },
      {
        path: "new",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NewTransaction />
          </Suspense>
        )
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
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <VendorDashboard />
          </Suspense>
        )
      },
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <VendorList />
          </Suspense>
        )
      },
      {
        path: "add",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddVendor />
          </Suspense>
        )
      },
      {
        path: ":id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <VendorDetails />
          </Suspense>
        )
      },
      {
        path: ":id/edit",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EditVendor />
          </Suspense>
        )
      },
      {
        path: ":id/bank-accounts",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <VendorBankAccounts />
          </Suspense>
        )
      },
      {
        path: "bill",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <VendorBillGenerate />
          </Suspense>
        )
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
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HajjUmrahDashboard />
          </Suspense>
        )
      },
      {
        path: "haji-list",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HajiList />
          </Suspense>
        )
      },
      {
        path: "haji/add",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddHaji />
          </Suspense>
        )
      },
      {
        path: "haji/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HajiDetails />
          </Suspense>
        )
      },
      {
        path: "haji/:id/edit",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EditHaji />
          </Suspense>
        )
      },
      {
        path: "add-haji",
        element: null
      },
      {
        path: "agent",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Agent />
          </Suspense>
        )
      },
      {
        path: "agent/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AgentDetails />
          </Suspense>
        )
      },
      {
        path: "agent/:id/create-package",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AgentPackageCreation />
          </Suspense>
        )
      },
      {
        path: "agent/add",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddAgent />
          </Suspense>
        )
      },
      {
        path: "agent/:id/edit",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EditB2BAgent />
          </Suspense>
        )
      },
      {
        path: "agent-packages",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AgentPackageList />
          </Suspense>
        )
      },
      {
        path: "agent-packages/create",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AgentPackageCreation />
          </Suspense>
        )
      },
      {
        path: "agent-packages/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AgentPackageDetails />
          </Suspense>
        )
      },
      {
        path: "agent-packages/:id/edit",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AgentPackageEdit />
          </Suspense>
        )
      },
      {
        path: "agent-packages/:id/costing",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AgentPackageCosting />
          </Suspense>
        )
      },
      {
        path: "package-list/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PackageDetails />
          </Suspense>
        )
      },
      {
        path: "package-list/:id/customers",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PackageCustomersList />
          </Suspense>
        )
      },
      {
        path: "b2b-sell",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <B2BSellPage />
          </Suspense>
        )
      },
      {
        path: "b2b-sell-list",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <B2BSellList />
          </Suspense>
        )
      },
      {
        path: "license-management",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <LicenseManagement />
          </Suspense>
        )
      },
      {
        path: "hotel-management",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HotelManagement />
          </Suspense>
        )
      },
      {
        path: "haj-package-list",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HajPackageList />
          </Suspense>
        )
      },
      {
        path: "haj-package-creation",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HajPackageCreation />
          </Suspense>
        )
      },
      {
        path: "haj-package-list/:id/costing",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HajPackageCosting />
          </Suspense>
        )
      },
      {
        path: "haj-package-list/:id/edit",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HajPackageEdit />
          </Suspense>
        )
      }
    ]
  },
  {
    path: "/umrah",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        path: "haji-list",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <UmrahHajiList />
          </Suspense>
        )
      },
      {
        path: "haji/add",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddUmrahHaji />
          </Suspense>
        )
      },
      {
        path: "haji/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <UmrahHajiDetails />
          </Suspense>
        )
      },
      {
        path: "haji/:id/edit",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EditUmrahHaji />
          </Suspense>
        )
      },
      {
        path: "umrah-package-list",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <UmrahPackageList />
          </Suspense>
        )
      },
      {
        path: "umrah-package-creation",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <UmrahPackageCreation />
          </Suspense>
        )
      },
      {
        path: "umrah-package-list/:id/costing",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <UmrahPackageCosting />
          </Suspense>
        )
      },
      {
        path: "umrah-package-list/:id/edit",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <UmrahPackageEdit />
          </Suspense>
        )
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
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AirTicketDashboard />
          </Suspense>
        )
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AirTicketDashboard />
          </Suspense>
        )
      },
      {
        path: "new-ticket",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NewTicket />
          </Suspense>
        )
      },
      {
        path: "edit-ticket/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TicketEdit />
          </Suspense>
        )
      },
      // New Passenger page (preferred)
      {
        path: "new-passenger",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NewPassenger />
          </Suspense>
        )
      },
      {
        path: "passengers/edit/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PassengerEdit />
          </Suspense>
        )
      },
      {
        path: "tickets",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TicketList />
          </Suspense>
        )
      },
      {
        path: "tickets/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TicketDetails />
          </Suspense>
        )
      },
      {
        path: "passengers",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PassengerList />
          </Suspense>
        )
      },
      {
        path: "passengers/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PassengerDetails />
          </Suspense>
        )
      },
      {
        path: "invoice",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TicketInvoice />
          </Suspense>
        )
      },
      {
        path: "agent/add",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AirAgentAdd />
          </Suspense>
        )
      },
      {
        path: "agent/:id/edit",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AirAgentEdit />
          </Suspense>
        )
      },
      {
        path: "agent/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AirAgentDetails />
          </Suspense>
        )
      },
      {
        path: "agent",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AgentList />
          </Suspense>
        )
      },
      {
        path: "old/dashboard",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <OldTicketingDashboard />
          </Suspense>
        )
      },
      {
        path: "old/ticket-check",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TicketCheckList />
          </Suspense>
        )
      },
      {
        path: "old/ticket-check/new",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TicketCheck />
          </Suspense>
        )
      },
      {
        path: "old/ticket-reissue",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <OldTicketReissueList />
          </Suspense>
        )
      },
      {
        path: "old/ticket-reissue/new",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <OldTicketReissue />
          </Suspense>
        )
      },
      {
        path: "airline",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AirlineList />
          </Suspense>
        )
      },
      {
        path: "airline/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AirlineDetails />
          </Suspense>
        )
      }
    ]
  },
  {
    path: "/visa-processing",
    element: (
      <ThemeProvider>
          <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <VisaProcessingDashboard />
          </Suspense>
        )
      },
      {
        path: "applicants",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ApplicantManagement />
          </Suspense>
        )
      },
      {
        path: "tracking",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <VisaTracking />
          </Suspense>
        )
      },
      {
        path: "payment",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <VisaPayment />
          </Suspense>
        )
      },
      {
        path: "documents",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <VisaDocuments />
          </Suspense>
        )
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
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <LoanDashboard />
          </Suspense>
        )
      },
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <LoanDashboard />
          </Suspense>
        )
      },
      {
        path: "details/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <LoanDetails />
          </Suspense>
        )
      },
      {
        path: "edit-receiving/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EditLoanReceiving />
          </Suspense>
        )
      },
      {
        path: "edit-giving/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EditLoanGiving />
          </Suspense>
        )
      },
      {
        path: "new-receiving",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NewLoanReceiving />
          </Suspense>
        )
      },
      {
        path: "new-giving",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NewLoanGiving />
          </Suspense>
        )
      },
      {
        path: "receiving-list",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ReceivingList />
          </Suspense>
        )
      },
      {
        path: "giving-list",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <GivingList />
          </Suspense>
        )
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
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CattleDashboard />
          </Suspense>
        )
      },
      {
        path: "cattle-management",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CattleManagement />
          </Suspense>
        )
      },
      {
        path: "milk-production",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <MilkProduction />
          </Suspense>
        )
      },
      {
        path: "feed-management",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <FeedManagement />
          </Suspense>
        )
      },
      {
        path: "health-records",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HealthRecords />
          </Suspense>
        )
      },
      {
        path: "breeding-records",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <BreedingRecords />
          </Suspense>
        )
      },
      {
        path: "financial-report",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <FinancialReport />
          </Suspense>
        )
      },
      {
        path: "expense/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ExpenseDetailsMI />
          </Suspense>
        )
      },
      {
        path: "expense/:id/edit",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ExpenseEditMI />
          </Suspense>
        )
      },
      {
        path: "income/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <IncomeDetailsMI />
          </Suspense>
        )
      },
      {
        path: "income/:id/edit",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <IncomeEditMI />
          </Suspense>
        )
      },
      {
        path: "employee-management",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EmployeeManagement />
          </Suspense>
        )
      },
      {
        path: "employee/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EmployeeDetails />
          </Suspense>
        )
      },
      {
        path: "employee/:id/edit",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EditEmployeeMI />
          </Suspense>
        )
      },
      {
        path: "cattle/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CattleDetails />
          </Suspense>
        )
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
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AccountOverview />
          </Suspense>
        )
      },
      {
        path: "income",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <IncomeManagement />
          </Suspense>
        )
      },
      {
        path: "expense",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ExpenseManagement />
          </Suspense>
        )
      },
      {
        path: "savings",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SavingsInvestments />
          </Suspense>
        )
      },
      {
        path: "loans",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <LoansCredit />
          </Suspense>
        )
      },
      {
        path: "bank-accounts",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <BankAccounts />
          </Suspense>
        )
      },
      {
        path: "bank-accounts-profile/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <BankAccountsProfile />
          </Suspense>
        )
      },
      {
        path: "add-bank-account",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddBankAccount />
          </Suspense>
        )
      },
      {
        path: "edit-bank-account/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EditBankAccount />
          </Suspense>
        )
      },
      {
        path: "credit-cards",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CreditCards />
          </Suspense>
        )
      },
      {
        path: "financial-reports",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <FinancialReports />
          </Suspense>
        )
      },
      {
        path: "budget-planning",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <BudgetPlanning />
          </Suspense>
        )
      },
      {
        path: "tax-management",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TaxManagement />
          </Suspense>
        )
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
        path: "expense",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PersonalExpense />
          </Suspense>
        )
      },
      {
        path: "expense-categories",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ExpenseCategoriesPage />
          </Suspense>
        )
      },
      {
        path: "expense-categories/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PersonalExpenseDetails />
          </Suspense>
        )
      },
      
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
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <FlyOvalDashboard />
          </Suspense>
        )
      },
      {
        path: "agents",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <FlyOvalAgentList />
          </Suspense>
        )
      },
      {
        path: "agents/add",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddFlyOvalAgent />
          </Suspense>
        )
      },
      {
        path: "agents/details/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <FlyOvalAgentDetails />
          </Suspense>
        )
      },
      {
        path: "agents/edit/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EditAgent />
          </Suspense>
        )
      },
      {
        path: "topup-history",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <FlyOvalTopUpHistory />
          </Suspense>
        )
      },
      {
        path: "sell-history",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <FlyOvalSellHistory />
          </Suspense>
        )
      },
      {
        path: "ledger",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <FlyOvalLedger />
          </Suspense>
        )
      },
      {
        path: "reports",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <FlyOvalReports />
          </Suspense>
        )
      },
      {
        path: "audit",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <FlyOvalAudit />
          </Suspense>
        )
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
        path: "hr/employee/list",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EmployeeList />
          </Suspense>
        )
      },
      {
        path: "hr/employee/add",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddEmployee />
          </Suspense>
        )
      },
      {
        path: "hr/employee/profile/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EmployeeProfile />
          </Suspense>
        )
      },
      {
        path: "hr/employee/edit/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EditEmployee />
          </Suspense>
        )
      },
      {
        path: "hr/payroll",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Payroll />
          </Suspense>
        )
      },
      {
        path: "hr/provident-fund",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Provident_Fund/>
          </Suspense>
        )
      },
      {
        path: "hr/sale-target",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Sale_Target/>
          </Suspense>
        )
      },
      {
        path: "hr/attendance",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Attendance/>
          </Suspense>
        )
      },
      {
        path: "hr/incentive-plan",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <IncentivePlan/>
          </Suspense>
        )
      },
      // Operating Expenses routes
      {
        path: "operating-expenses",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <OperatingExpenses />
          </Suspense>
        )
      },
      {
        path: "operating-expenses/:categoryId",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <OperatingExpenseDetails />
          </Suspense>
        )
      },
      {
        path: "operating-expenses/add",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddCategory />
          </Suspense>
        )
      },
      
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
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ExchangeDashboard />
          </Suspense>
        )
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ExchangeDashboard />
          </Suspense>
        )
      },
      {
        path: "new",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NewExchange />
          </Suspense>
        )
      },
      {
        path: "list",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <List />
          </Suspense>
        )
      },
      {
        path: "edit/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EditExchange />
          </Suspense>
        )
      },
      {
        path: "details/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ExchangeDetails />
          </Suspense>
        )
      }
    ]
  },
  {
    path: "/marketing",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        path: "sms",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SmsMarketing />
          </Suspense>
        )
      },
      {
        path: "contacts",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AllContacts />
          </Suspense>
        )
      },
      {
        path: "groups",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Groups />
          </Suspense>
        )
      },
      {
        path: "email",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EmailMarketing />
          </Suspense>
        )
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
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <GenerateInvoice />
          </Suspense>
        )
      },
      {
        path: "pending",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PendingInvoices />
          </Suspense>
        )
      },
      {
        path: "list",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AllInvoices />
          </Suspense>
        )
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
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Users />
          </Suspense>
        )
      },
      {
        path: "customer-types",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CustomerManagment />
          </Suspense>
        )
      },
      {
        path: "categories",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CategoryManagement />
          </Suspense>
        )
      },
      {
        path: "excel-upload",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ExcelUploadPage />
          </Suspense>
        )
      },
      {
        path: "backup",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <BackupRestore />
          </Suspense>
        )
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
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Profile />
          </Suspense>
        )
      }
    ]
  },
  {
    path: "/additional-services",
    element: (
      <ThemeProvider>
        <DashboardLayout />
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AdditionalServicesDashboard />
          </Suspense>
        )
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AdditionalServicesDashboard />
          </Suspense>
        )
      },
      {
        path: "customer-list",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CustomerList />
          </Suspense>
        )
      },
      {
        path: "customer/add",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddCustomer />
          </Suspense>
        )
      },
      {
        path: "customer/edit/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <EditCustomer />
          </Suspense>
        )
      },
      {
        path: "customer/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CustomerDetails />
          </Suspense>
        )
      },
      {
        path: "passport-service",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PassportService />
          </Suspense>
        )
      },
      {
        path: "passport-service/add",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddPassportService />
          </Suspense>
        )
      },
      {
        path: "passport-service/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PassportServiceDetails />
          </Suspense>
        )
      },
      {
        path: "passport-service/edit/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddPassportService />
          </Suspense>
        )
      },
      {
        path: "manpower-service",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ManpowerService />
          </Suspense>
        )
      },
      {
        path: "manpower-service/add",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddManpowerService />
          </Suspense>
        )
      },
      {
        path: "manpower-service/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ManpowerServiceDetails />
          </Suspense>
        )
      },
      {
        path: "manpower-service/edit/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddManpowerService />
          </Suspense>
        )
      },
      {
        path: "visa-processing",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <VisaProcessing />
          </Suspense>
        )
      },
      {
        path: "visa-processing/add",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddVisaProcessing />
          </Suspense>
        )
      },
      {
        path: "visa-processing/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <VisaProcessingDetails />
          </Suspense>
        )
      },
      {
        path: "visa-processing/edit/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddVisaProcessing />
          </Suspense>
        )
      },
      {
        path: "others-service",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <OtherService />
          </Suspense>
        )
      },
      {
        path: "others-service/add",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddOtherService />
          </Suspense>
        )
      },
      {
        path: "others-service/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <OtherServiceDetails />
          </Suspense>
        )
      },
      {
        path: "others-service/edit/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AddOtherService />
          </Suspense>
        )
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
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
</React.StrictMode>,
);
