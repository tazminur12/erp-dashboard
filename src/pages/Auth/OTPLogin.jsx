import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../hooks/UseAxiosSecure';

const OTPLogin = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  
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
        toast.success('OTP পাঠানো হয়েছে আপনার ফোনে!');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'OTP পাঠাতে সমস্যা হয়েছে';
      toast.error(message);
    }
  };

  // ...rest of the code
};
```

This is a comprehensive guide for implementing OTP login. The user wants me to implement this feature. Let me create the OTP login component based on this guide.
</thinking>

Perfect! Let me create the OTP Login component for you. I'll implement the complete, styled version with all the features.

<function_calls>
<invoke name="Glob">
<parameter name="glob_pattern">**/Login.jsx