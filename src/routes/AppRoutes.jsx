import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Dashboard from '../pages/Dashboard/Dashboard';

// Customer pages
import CustomerList from '../pages/Customers/CustomerList';
import AddCustomer from '../pages/Customers/AddCustomer';

// Transaction pages
import Debit from '../pages/Transactions/Debit';
import Credit from '../pages/Transactions/Credit';

// Vendor pages
import VendorList from '../pages/Vendors/VendorList';
import AddVendor from '../pages/Vendors/AddVendor';
import VendorPayment from '../pages/Vendors/VendorPayment';
import VendorDueReport from '../pages/Vendors/VendorDueReport';

// Hajj & Umrah pages
import AgentList from '../pages/HajjUmrah/AgentList';
import AddAgent from '../pages/HajjUmrah/AddAgent';

// Air Ticketing pages
import NewTicket from '../pages/AirTicketing/NewTicket';
import TicketList from '../pages/AirTicketing/TicketList';
import ReissueRefund from '../pages/AirTicketing/ReissueRefund';
import AirlinesList from '../pages/AirTicketing/AirlinesList';
import TicketInvoice from '../pages/AirTicketing/TicketInvoice';

// Personal pages
import PersonalIncome from '../pages/Personal/Income';
import PersonalExpense from '../pages/Personal/Expense';
import PersonalSavings from '../pages/Personal/Savings';
import PersonalLoans from '../pages/Personal/Loans';

// Other Business pages
import BusinessList from '../pages/OtherBusiness/BusinessList';
import AddBusiness from '../pages/OtherBusiness/AddBusiness';
import BusinessIncome from '../pages/OtherBusiness/BusinessIncome';
import BusinessExpense from '../pages/OtherBusiness/BusinessExpense';
import ProfitLossSummary from '../pages/OtherBusiness/ProfitLossSummary';

// Office Management pages
import Salary from '../pages/OfficeManagement/Salary';
import OfficeRent from '../pages/OfficeManagement/OfficeRent';
import Food from '../pages/OfficeManagement/Food';
import Utilities from '../pages/OfficeManagement/Utilities';

// Money Exchange pages
import RateSetup from '../pages/MoneyExchange/RateSetup';
import NewExchange from '../pages/MoneyExchange/NewExchange';
import ExchangeHistory from '../pages/MoneyExchange/ExchangeHistory';
import ProfitLoss from '../pages/MoneyExchange/ProfitLoss';

// Settings pages
import Users from '../pages/Settings/Users';
import Roles from '../pages/Settings/Roles';
import System from '../pages/Settings/System';
import Notifications from '../pages/Settings/Notifications';
import BackupRestore from '../pages/Settings/BackupRestore';

// Profile page
import Profile from '../pages/Profile/Profile';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Dashboard Layout */}
      <Route path="/" element={<DashboardLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Customers */}
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/add" element={<AddCustomer />} />
        
        {/* Transactions */}
        <Route path="transactions/debit" element={<Debit />} />
        <Route path="transactions/credit" element={<Credit />} />
        
        {/* Vendors */}
        <Route path="vendors" element={<VendorList />} />
        <Route path="vendors/add" element={<AddVendor />} />
        <Route path="vendors/payment" element={<VendorPayment />} />
        <Route path="vendors/due-report" element={<VendorDueReport />} />
        
        {/* Hajj & Umrah */}
        <Route path="hajj-umrah/agents" element={<AgentList />} />
        <Route path="hajj-umrah/add-agent" element={<AddAgent />} />
        
        {/* Air Ticketing */}
        <Route path="air-ticketing/new-ticket" element={<NewTicket />} />
        <Route path="air-ticketing/tickets" element={<TicketList />} />
        <Route path="air-ticketing/reissue-refund" element={<ReissueRefund />} />
        <Route path="air-ticketing/airlines" element={<AirlinesList />} />
        <Route path="air-ticketing/invoice" element={<TicketInvoice />} />
        
        {/* Personal */}
        <Route path="personal/income" element={<PersonalIncome />} />
        <Route path="personal/expense" element={<PersonalExpense />} />
        <Route path="personal/savings" element={<PersonalSavings />} />
        <Route path="personal/loans" element={<PersonalLoans />} />
        
        {/* Other Business */}
        <Route path="other-business" element={<BusinessList />} />
        <Route path="other-business/add" element={<AddBusiness />} />
        <Route path="other-business/income" element={<BusinessIncome />} />
        <Route path="other-business/expense" element={<BusinessExpense />} />
        <Route path="other-business/profit-loss" element={<ProfitLossSummary />} />
        
        {/* Office Management */}
        <Route path="office-management/salary" element={<Salary />} />
        <Route path="office-management/rent" element={<OfficeRent />} />
        <Route path="office-management/food" element={<Food />} />
        <Route path="office-management/utilities" element={<Utilities />} />
        
        {/* Money Exchange */}
        <Route path="money-exchange/rate-setup" element={<RateSetup />} />
        <Route path="money-exchange/new-exchange" element={<NewExchange />} />
        <Route path="money-exchange/history" element={<ExchangeHistory />} />
        <Route path="money-exchange/profit-loss" element={<ProfitLoss />} />
        
        {/* Settings */}
        <Route path="settings/users" element={<Users />} />
        <Route path="settings/roles" element={<Roles />} />
        <Route path="settings/system" element={<System />} />
        <Route path="settings/notifications" element={<Notifications />} />
        <Route path="settings/backup" element={<BackupRestore />} />
        
        {/* Profile */}
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
