import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { signUpWithEmail, verifyPhoneWithOTP } from '../firebase';

const SignUp = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user types
    if (error) setError('');
    if (success) setSuccess('');
  };

  const showSuccessAlert = (message) => {
    setSuccess(message);
    setError('');
    // Auto hide after 4 seconds
    setTimeout(() => setSuccess(''), 4000);
  };

  const showErrorAlert = (message) => {
    setError(message);
    setSuccess('');
    // Auto hide after 6 seconds
    setTimeout(() => setError(''), 6000);
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      showErrorAlert('নাম প্রয়োজন');
      return false;
    }
    
    if (!formData.email.trim()) {
      showErrorAlert('ইমেইল প্রয়োজন');
      return false;
    }
    
    if (!formData.phone.trim()) {
      showErrorAlert('ফোন নম্বর প্রয়োজন');
      return false;
    }
    
    if (formData.phone.length < 11) {
      showErrorAlert('ফোন নম্বর কমপক্ষে ১১ ডিজিট হতে হবে');
      return false;
    }
    
    if (!formData.password) {
      showErrorAlert('পাসওয়ার্ড প্রয়োজন');
      return false;
    }
    
    if (formData.password.length < 6) {
      showErrorAlert('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      showErrorAlert('পাসওয়ার্ড মিলছে না');
      return false;
    }
    
    return true;
  };

  const handlePhoneVerification = async () => {
    if (!formData.phone.trim()) {
      showErrorAlert('ফোন নম্বর দিন');
      return;
    }
    
    if (formData.phone.length < 11) {
      showErrorAlert('ফোন নম্বর কমপক্ষে ১১ ডিজিট হতে হবে');
      return;
    }

    setOtpLoading(true);
    setError('');
    
    try {
      // Simulate sending OTP
      showSuccessAlert('OTP পাঠানো হয়েছে: 123456 (Demo)');
      setShowOTPInput(true);
    } catch {
      showErrorAlert('OTP পাঠানো যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (!otp.trim()) {
      showErrorAlert('OTP দিন');
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      const result = await verifyPhoneWithOTP(formData.phone, otp);
      
      if (result.success) {
        setPhoneVerified(true);
        showSuccessAlert('ফোন নম্বর ভেরিফাই হয়েছে! এখন সাইন আপ করতে পারেন।');
        setShowOTPInput(false);
      } else {
        showErrorAlert(result.error);
      }
    } catch {
      showErrorAlert('OTP ভেরিফিকেশনে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!phoneVerified) {
      showErrorAlert('ফোন নম্বর ভেরিফাই করুন');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signUpWithEmail(formData.email, formData.password, formData.displayName, formData.phone);
      
      if (result.success) {
        showSuccessAlert('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! ইমেইল ভেরিফিকেশন চেক করুন। ড্যাশবোর্ডে যাচ্ছি...');
        setEmailVerified(true);
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        showErrorAlert(result.error);
      }
    } catch {
      showErrorAlert('সাইন আপে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">নতুন অ্যাকাউন্ট তৈরি করুন</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
            আপনার ব্যবসার জন্য অ্যাকাউন্ট তৈরি করুন
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="space-y-6">
              {/* Success SweetAlert */}
              {success && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100 animate-fade-in">
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        সফল!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        {success}
                      </p>
                      <button
                        onClick={() => setSuccess('')}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                      >
                        ঠিক আছে
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error SweetAlert */}
              {error && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100 animate-fade-in">
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        ত্রুটি!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        {error}
                      </p>
                      <button
                        onClick={() => setError('')}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                      >
                        ঠিক আছে
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Name Field */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  পূর্ণ নাম
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.displayName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                    placeholder="আপনার পূর্ণ নাম দিন"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  ইমেইল ঠিকানা
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                    placeholder="আপনার ইমেইল দিন"
                  />
                </div>
                {emailVerified && (
                  <div className="mt-1 flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs">ইমেইল ভেরিফাই হয়েছে</span>
                  </div>
                )}
              </div>

              {/* Phone Number Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  ফোন নম্বর
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                    placeholder="০১১১১১১১১১১"
                  />
                  <button
                    type="button"
                    onClick={handlePhoneVerification}
                    disabled={otpLoading}
                    className="absolute inset-y-0 right-0 px-3 flex items-center bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400"
                  >
                    {otpLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
                {phoneVerified && (
                  <div className="mt-1 flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs">ফোন নম্বর ভেরিফাই হয়েছে</span>
                  </div>
                )}
              </div>

              {/* OTP Input Field */}
              {showOTPInput && !phoneVerified && (
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                    OTP কোড
                  </label>
                  <div className="flex space-x-2">
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                      placeholder="123456"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={handleOTPVerification}
                      disabled={otpLoading}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400"
                    >
                      {otpLoading ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Demo OTP: 123456
                  </p>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  পাসওয়ার্ড
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                    placeholder="পাসওয়ার্ড দিন"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  পাসওয়ার্ড নিশ্চিত করুন
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                    placeholder="পাসওয়ার্ড আবার দিন"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <div className="mt-1 flex items-center text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs">পাসওয়ার্ড মিলছে না</span>
                    </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !phoneVerified}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'সাইন আপ করুন'}
              </button>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
              >
                সাইন ইন করুন
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
