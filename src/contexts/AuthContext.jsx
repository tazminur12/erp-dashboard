import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import useUserRole from '../hooks/useUserRole';
import useSecureAxios from '../hooks/UseAxiosSecure';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('erp_token'));

  // Get user role information
  const userRole = useUserRole(userProfile?.role);
  
  // Get secure axios instance
  const axiosSecure = useSecureAxios();

  // Fetch user profile from backend
  const fetchUserProfile = async (email, firebaseUser) => {
    try {
      // Get current token from state or localStorage
      const currentToken = token || localStorage.getItem('erp_token');
      
      if (!currentToken) {
        console.error('No token available for profile fetch');
        return null;
      }

      const response = await axiosSecure.get(`/users/profile/${email}`);

      if (response.status === 200) {
        const profile = response.data;
        setUserProfile(profile);
        return profile;
      } else {
        console.error('Failed to fetch user profile');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Generate JWT token from backend
  const generateJWT = async (email) => {
    try {
      const response = await axiosSecure.post('/jwt', { email });

      if (response.status === 200) {
        const data = response.data;
        const newToken = data.token;
        setToken(newToken);
        localStorage.setItem('erp_token', newToken);
        return newToken;
      } else {
        console.error('Failed to generate JWT');
        return null;
      }
    } catch (error) {
      console.error('Error generating JWT:', error);
      // Temporary fallback - return null instead of crashing
      console.warn('Backend server not available. JWT generation skipped.');
      return null;
    }
  };

  // Refresh token if expired
  const refreshToken = async () => {
    if (user && user.email) {
      const newToken = await generateJWT(user.email);
      if (newToken) {
        await fetchUserProfile(user.email, user);
        return newToken;
      }
    }
    return null;
  };

  // Login with backend integration
  const loginWithBackend = async (email, firebaseUid, displayName, branchId) => {
    try {
      const response = await axiosSecure.post('/api/auth/login', {
        email,
        firebaseUid,
        displayName,
        branchId
      });

      if (response.status === 200) {
        const data = response.data;
        if (data.success) {
          setToken(data.token);
          localStorage.setItem('erp_token', data.token);
          setUserProfile(data.user);
          return { success: true, user: data.user };
        } else {
          return { success: false, error: data.error };
        }
      } else {
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error during login' };
    }
  };

  // Login with OTP (bypasses Firebase)
  const loginWithOTP = async (phone, otp) => {
    try {
      const response = await axiosSecure.post('/api/auth/verify-otp', { phone, otp });

      if (response.status === 200 && response.data.success) {
        const data = response.data;
        
        // Set token and user profile
        setToken(data.token);
        localStorage.setItem('erp_token', data.token);
        setUserProfile(data.user);
        
        // Create a pseudo Firebase user object for OTP login
        const otpUser = {
          uid: data.user._id || data.user.id,
          email: data.user.email || `${data.user.phone}@otp.login`,
          displayName: data.user.displayName || data.user.name,
          emailVerified: true, // OTP verified = email verified equivalent
          phoneNumber: data.user.phone
        };
        setUser(otpUser);
        
        return { success: true, user: data.user, token: data.token };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'OTP verification failed',
          attemptsLeft: response.data.attemptsLeft
        };
      }
    } catch (error) {
      console.error('OTP login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Network error during OTP verification',
        attemptsLeft: error.response?.data?.attemptsLeft
      };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setToken(null);
      localStorage.removeItem('erp_token');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      // Get current token from state or localStorage
      const currentToken = token || localStorage.getItem('erp_token');
      
      if (!currentToken) {
        console.error('No token available for profile update');
        return { success: false, error: 'No authentication token' };
      }

      if (!userProfile || !userProfile.email) {
        console.error('No user profile or email available for profile update');
        return { success: false, error: 'No user profile available' };
      }

      const response = await axiosSecure.patch(`/users/profile/${userProfile.email}`, updates);

      if (response.status === 200) {
        const data = response.data;
        if (data.success) {
          setUserProfile(prev => ({ ...prev, ...updates }));
          return { success: true };
        }
      }
      return { success: false, error: 'Failed to update profile' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        setUser(firebaseUser);
        
        // Check if we have a stored token
        const storedToken = localStorage.getItem('erp_token');
        if (storedToken) {
          setToken(storedToken);
          await fetchUserProfile(firebaseUser.email, firebaseUser);
        } else {
          // Generate new JWT token
          const newToken = await generateJWT(firebaseUser.email);
          if (newToken) {
            await fetchUserProfile(firebaseUser.email, firebaseUser);
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setToken(null);
        localStorage.removeItem('erp_token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Remove token dependency to prevent infinite loop

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user && !!userProfile && user.emailVerified,
    token,
    userRole,
    axiosSecure,
    loginWithBackend,
    loginWithOTP,
    signOut,
    logout: signOut,
    updateProfile,
    fetchUserProfile,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
