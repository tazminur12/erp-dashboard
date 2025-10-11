import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Building2, 
  ArrowRight, 
  Lock,
  User,
  Eye,
  EyeOff,
  HelpCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Shield
} from 'lucide-react';
import { signUpWithEmail } from '../firebase/auth';
import { validateEmail } from '../lib/validation';

const SignUp = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedBranch: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const navigate = useNavigate();

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

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      showErrorAlert('Full name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      showErrorAlert('Email address is required');
      return false;
    }
    
    // Validate email format
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      showErrorAlert(emailValidation.message);
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
    setSuccess('');

    try {
      // Create Firebase account first
      const firebaseResult = await signUpWithEmail(formData.email, formData.password, formData.displayName);
      
      if (!firebaseResult.success) {
        showErrorAlert(firebaseResult.error);
        setLoading(false);
        return;
      }

      // Now create user in backend
      const backendResult = await createUserInBackend(
        formData.email,
        firebaseResult.user.uid,
        formData.displayName,
        formData.selectedBranch
      );

      if (backendResult.success) {
        showSuccessAlert('Account created successfully! Please check your email for verification link. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        showErrorAlert(backendResult.error || 'Failed to create user in system');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      showErrorAlert('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create user in backend
  const createUserInBackend = async (email, firebaseUid, displayName, branchId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          firebaseUid,
          displayName,
          branchId,
          role: 'user' // Default role for new users
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return { success: true, user: data.user };
        } else {
          return { success: false, error: data.message };
        }
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to create user' };
      }
    } catch (error) {
      console.error('Backend user creation error:', error);
      return { success: false, error: 'Network error during user creation' };
    }
  };

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
          <h2 className="text-4xl font-bold mb-4">Join Our Team</h2>
          <p className="text-lg text-blue-100 leading-relaxed">
            Become part of our growing organization and access powerful financial management tools for your branch operations.
          </p>
        </div>
      </div>

      {/* Right Section - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Sign Up Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-sm text-gray-600">Join our ERP system and start managing your branch</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Input */}
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
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

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
                  We'll send a verification link to this email
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
                  Select the branch where you'll be working
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
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password Input */}
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
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <div className="mt-1 flex items-center text-red-600">
                    <XCircle className="w-3 h-3 mr-1" />
                    <span className="text-xs">Passwords do not match</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || loadingBranches}
                className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium"
              >
                {loading ? (
                  'Creating Account...'
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>

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

            {/* Sign In Link */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Sign in here
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

export default SignUp;
