import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, ArrowLeft, CheckCircle, Loader2, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import useAxiosSecure from '../hooks/UseAxiosSecure';
import { useAuth } from '../contexts/AuthContext';

const OTPLogin = () => {
  const navigate = useNavigate();
  const axios = useAxiosSecure();
  const { loginWithOTP } = useAuth();
  
  const [step, setStep] = useState(1); // 1 = phone input, 2 = OTP input
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds

  // Countdown timer
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  // Format timer (MM:SS)
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/send-otp', { phone });
      
      if (response.data.success) {
        setStep(2);
        setTimer(300);
        
        Swal.fire({
          title: 'সফল!',
          text: 'OTP পাঠানো হয়েছে আপনার ফোনে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          timer: 2000
        });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'OTP পাঠাতে সমস্যা হয়েছে';
      setError(message);
      
      Swal.fire({
        title: 'ত্রুটি!',
        text: message,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Login
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginWithOTP(phone, otp);
      
      if (result.success) {
        Swal.fire({
          title: 'সফল!',
          text: 'সফলভাবে লগইন হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          timer: 1500,
          showConfirmButton: false
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        const message = result.error || 'OTP verify করতে সমস্যা হয়েছে';
        const attemptsLeft = result.attemptsLeft;
        
        setError(message);
        setOtp(''); // Clear OTP input
        
        const errorText = attemptsLeft !== undefined 
          ? `${message}\n\nবাকি ${attemptsLeft} টি চেষ্টা`
          : message;
        
        Swal.fire({
          title: 'ত্রুটি!',
          text: errorText,
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('লগইন করতে সমস্যা হয়েছে');
      setOtp('');
      
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setOtp('');
    setError('');
    setTimer(300);
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/send-otp', { phone });
      
      if (response.data.success) {
        Swal.fire({
          title: 'সফল!',
          text: 'নতুন OTP পাঠানো হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          timer: 2000
        });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'OTP পাঠাতে সমস্যা হয়েছে';
      
      Swal.fire({
        title: 'ত্রুটি!',
        text: message,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Helmet>
        <title>OTP Login - BIN Rashid Group ERP</title>
      </Helmet>

      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Phone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">OTP Login</h1>
          <p className="text-gray-600 mt-2">ফোন নম্বর দিয়ে সহজে লগইন করুন</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 ? (
            // Step 1: Phone Input Form
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  মোবাইল নম্বর
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Bangladesh mobile number (11 digits)
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    পাঠানো হচ্ছে...
                  </>
                ) : (
                  'OTP পাঠান'
                )}
              </button>
            </form>
          ) : (
            // Step 2: OTP Verification Form
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  OTP পাঠানো হয়েছে
                </p>
                <p className="text-lg font-semibold text-gray-900">{phone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  6-digit OTP কোড
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-center text-3xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  autoFocus
                  required
                />
              </div>

              {/* Timer Display */}
              <div className="text-center">
                {timer > 0 ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">{formatTimer(timer)}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-sm font-medium text-red-600">মেয়াদ শেষ</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6 || timer === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    যাচাই করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    লগইন করুন
                  </>
                )}
              </button>

              {/* Resend / Change Phone */}
              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                    setTimer(300);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  নম্বর পরিবর্তন
                </button>
                
                {timer === 0 ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
                  >
                    পুনরায় পাঠান →
                  </button>
                ) : (
                  <span className="text-sm text-gray-500">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')} পরে
                  </span>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Alternative Login Link */}
        <div className="text-center mt-6">
          <Link 
            to="/login" 
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Email দিয়ে লগইন করুন →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;
