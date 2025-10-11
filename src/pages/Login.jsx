import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Building2, 
  ArrowRight, 
  Lock,
  HelpCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Shield
} from 'lucide-react';
import { signInWithEmail, sendVerificationEmail } from '../firebase/auth';
import { validateEmail } from '../lib/validation';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    selectedBranch: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, loginWithBackend } = useAuth();

  // Fetch branches from backend
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/branches/active`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setBranches(data.branches);
          }
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error);
        // Fallback to default branches if API fails
        setBranches([
          { branchId: 'main', branchName: 'Main Office', branchLocation: 'Dhaka, Bangladesh', branchCode: 'DH' },
          { branchId: 'bogra', branchName: 'Bogra Branch', branchLocation: 'Bogra, Bangladesh', branchCode: 'BOG' },
          { branchId: 'dupchanchia', branchName: 'Dupchanchia Branch', branchLocation: 'Dupchanchia, Bangladesh', branchCode: 'DUP' },
          { branchId: 'chittagong', branchName: 'Chittagong Branch', branchLocation: 'Chittagong, Bangladesh', branchCode: 'CTG' },
          { branchId: 'sylhet', branchName: 'Sylhet Branch', branchLocation: 'Sylhet, Bangladesh', branchCode: 'SYL' },
          { branchId: 'rajshahi', branchName: 'Rajshahi Branch', branchLocation: 'Rajshahi, Bangladesh', branchCode: 'RAJ' },
          { branchId: 'khulna', branchName: 'Khulna Branch', branchLocation: 'Khulna, Bangladesh', branchCode: 'KHU' },
          { branchId: 'barisal', branchName: 'Barisal Branch', branchLocation: 'Barisal, Bangladesh', branchCode: 'BAR' },
          { branchId: 'rangpur', branchName: 'Rangpur Branch', branchLocation: 'Rangpur, Bangladesh', branchCode: 'RAN' },
          { branchId: 'mymensingh', branchName: 'Mymensingh Branch', branchLocation: 'Mymensingh, Bangladesh', branchCode: 'MYM' }
        ]);
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const showSuccessAlert = (message) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const showErrorAlert = (message) => {
    setError(message);
    setSuccess('');
    setTimeout(() => setError(''), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email.trim()) {
        showErrorAlert('Email address is required');
        setLoading(false);
        return;
      }
      
      if (!formData.password.trim()) {
        showErrorAlert('Password is required');
        setLoading(false);
        return;
      }

      if (!formData.selectedBranch) {
        showErrorAlert('Please select a branch');
        setLoading(false);
        return;
      }
      
      // Validate email format
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        showErrorAlert(emailValidation.message);
        setLoading(false);
        return;
      }

      // First, authenticate with Firebase
      const firebaseResult = await signInWithEmail(formData.email, formData.password);
      
      if (!firebaseResult.success) {
        showErrorAlert(firebaseResult.error);
        setLoading(false);
        return;
      }

      if (!firebaseResult.user.emailVerified) {
        // Email not verified, send verification email
        const verificationResult = await sendVerificationEmail();
        if (verificationResult.success) {
          showErrorAlert('Please verify your email first. A new verification email has been sent.');
        } else {
          showErrorAlert('Please verify your email first. Check your inbox for verification link.');
        }
        setLoading(false);
        return;
      }

      // Now authenticate with backend
      const backendResult = await loginWithBackend(
        formData.email,
        firebaseResult.user.uid,
        firebaseResult.user.displayName || formData.email.split('@')[0],
        formData.selectedBranch
      );

      if (backendResult.success) {
        showSuccessAlert('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        showErrorAlert(backendResult.error || 'Backend authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      showErrorAlert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Promotional Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 via-teal-500 to-blue-600 p-12 items-center justify-center">
        <div className="text-center text-white max-w-lg">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold">Bin Rashid Group</h1>
              <p className="text-sm text-blue-100">Excellence in Service</p>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="bg-white rounded-xl p-4 shadow-2xl">
                {/* Mock Dashboard Content */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-blue-500 h-8 rounded"></div>
                  <div className="bg-blue-400 h-8 rounded"></div>
                  <div className="bg-blue-600 h-6 rounded"></div>
                  <div className="bg-blue-300 h-6 rounded"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="bg-blue-500 h-4 w-16 rounded"></div>
                    <div className="bg-blue-400 h-4 w-12 rounded"></div>
                  </div>
                  <div className="bg-yellow-400 h-12 w-12 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl font-bold mb-4">Financial Management</h2>
          <p className="text-lg text-blue-100 leading-relaxed">
            Advanced accounting, transaction management, and financial reporting tools for complete business oversight.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Login Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Login</h2>
              <p className="text-sm text-gray-600">Access your ERP dashboard securely</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="employee@company.com"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter your registered email address
                </p>
              </div>

              {/* Branch Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Branch
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    name="selectedBranch"
                    value={formData.selectedBranch}
                    onChange={handleChange}
                    className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm"
                    required
                    disabled={loadingBranches}
                  >
                    <option value="">
                      {loadingBranches ? 'Loading branches...' : 'Choose your branch'}
                    </option>
                    {branches.map((branch) => (
                      <option key={branch.branchId} value={branch.branchId}>
                        {branch.branchName} - {branch.branchLocation}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Select the branch where you work
                </p>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || loadingBranches}
                className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium"
              >
                {loading ? (
                  'Signing In...'
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Need Help Link */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto"
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Need Help?
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>

          {/* Help Button */}
          <div className="fixed bottom-4 right-4">
            <button className="bg-purple-500 text-white p-2.5 rounded-full shadow-lg hover:bg-purple-600 transition-colors duration-200">
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
              <p className="text-sm text-gray-600 mb-6">{success}</p>
              <button
                onClick={() => setSuccess('')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error!</h3>
              <p className="text-sm text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => setError('')}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
