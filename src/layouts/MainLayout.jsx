import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import ForgotPassword from '../pages/ForgotPassword';
import CompanyInfo from '../components/CompanyInfo';
import InstallPrompt from '../components/InstallPrompt';

const MainLayout = () => {
  const location = useLocation();
  
  // Hide CompanyInfo (Footer) on auth pages (login, signup, forgot-password)
  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/signup' || 
                     location.pathname === '/forgot-password';
  
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <main>
          <Outlet />
        </main>
        {!isAuthPage && <CompanyInfo />}
        <InstallPrompt />
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;
