import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Mail, 
  Lock,
  User,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  ArrowRight
} from 'lucide-react';
import { signUpWithEmail } from '../firebase/auth';
import { validateEmail } from '../lib/validation';

const SignUp = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    selectedBranch: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/branches/active`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.branches && data.branches.length > 0) {
            setBranches(data.branches);
          } else {
            // Fallback if no branches returned
            console.warn('No active branches found');
            setBranches([]);
          }
        } else {
          console.error('Failed to fetch branches:', response.status);
          setBranches([]);
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error);
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const showErrorAlert = (message) => {
    setError(message);
    setTimeout(() => setError(''), 4000);
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      showErrorAlert('Full name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      showErrorAlert('Email address is required');
      return false;
    }
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      showErrorAlert(emailValidation.message);
      return false;
    }

    if (!formData.phone.trim()) {
      showErrorAlert('Mobile number is required');
      return false;
    }

    // Validate Bangladesh mobile number (11 digits, starts with 01)
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      showErrorAlert('Please enter a valid Bangladesh mobile number (e.g., 01712345678)');
      return false;
    }
    
    if (!formData.password) {
      showErrorAlert('Password is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      showErrorAlert('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      showErrorAlert('Passwords do not match');
      return false;
    }

    if (!formData.selectedBranch) {
      showErrorAlert('Please select a branch');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const firebaseResult = await signUpWithEmail(formData.email, formData.password, formData.displayName);
      
      if (!firebaseResult.success) {
        showErrorAlert(firebaseResult.error);
        setLoading(false);
        return;
      }

      const backendResult = await createUserInBackend(
        formData.email,
        firebaseResult.user.uid,
        formData.displayName,
        formData.phone,
        formData.selectedBranch
      );

      if (backendResult.success) {
        navigate('/login', { 
          state: { 
            message: 'Account created! Check email for verification.' 
          } 
        });
      } else {
        showErrorAlert(backendResult.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      showErrorAlert('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createUserInBackend = async (email, firebaseUid, displayName, phone, branchId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          firebaseUid,
          displayName,
          phone,
          branchId,
          role: 'user'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return { success: data.success };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Helmet>
        <title>Sign Up - ERP Dashboard</title>
        <meta name="description" content="Create a new account to access the ERP Dashboard." />
      </Helmet>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600 text-sm">Sign up to continue to ERP</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="01712345678"
                  maxLength={11}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Bangladesh mobile number (11 digits)
              </p>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  name="selectedBranch"
                  value={formData.selectedBranch}
                  onChange={handleChange}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none"
                  required
                  disabled={loadingBranches || branches.length === 0}
                >
                  <option value="">
                    {loadingBranches 
                      ? 'Loading branches...' 
                      : branches.length === 0 
                        ? 'No branches available' 
                        : 'Select your branch'}
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.branchId || branch._id} value={branch.branchId || branch._id}>
                      {branch.branchName}
                      {branch.branchLocation && ` - ${branch.branchLocation}`}
                      {branch.branchCode && ` (${branch.branchCode})`}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords don't match</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || loadingBranches}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By signing up, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default SignUp;