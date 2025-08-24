import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

// Sign up with email and password
export const signUpWithEmail = async (email, password, displayName, phoneNumber) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
    }
    
    // Store phone number in user metadata (you can also use Firestore)
    if (phoneNumber) {
      // For now, we'll store it in localStorage as a workaround
      localStorage.setItem(`user_${userCredential.user.uid}_phone`, phoneNumber);
    }
    
    // Send email verification
    await sendEmailVerification(userCredential.user);
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign in with phone number (simulated for now)
export const signInWithPhone = async (phoneNumber) => {
  try {
    // This is a simulated phone authentication
    // In real implementation, you would use Firebase Phone Auth
    // For now, we'll check if a user with this phone exists
    
    // Simulate phone verification
    if (phoneNumber && phoneNumber.length >= 11) {
      // You can implement actual phone verification logic here
      return { success: true, user: { phoneNumber } };
    } else {
      throw new Error('Invalid phone number');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send email verification
export const sendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
      return { success: true };
    }
    return { success: false, error: 'User not found or already verified' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Verify phone number with OTP (simulated)
export const verifyPhoneWithOTP = async (phoneNumber, otp) => {
  try {
    // This is a simulated OTP verification
    // In real implementation, you would use Firebase Phone Auth
    
    // Simulate OTP verification (for demo purposes)
    if (otp === '123456') { // Demo OTP
      return { success: true, verified: true };
    } else {
      throw new Error('Invalid OTP');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get user display name
export const getUserDisplayName = () => {
  const user = auth.currentUser;
  return user ? user.displayName : null;
};

// Get user email
export const getUserEmail = () => {
  const user = auth.currentUser;
  return user ? user.email : null;
};

// Check if user email is verified
export const isEmailVerified = () => {
  const user = auth.currentUser;
  return user ? user.emailVerified : false;
};

// Get user phone number from localStorage
export const getUserPhone = () => {
  const user = auth.currentUser;
  if (user) {
    return localStorage.getItem(`user_${user.uid}_phone`) || null;
  }
  return null;
};

// Check if phone number is verified
export const isPhoneVerified = () => {
  // For now, we'll assume phone is verified if it exists
  // In real implementation, you would check actual verification status
  const phone = getUserPhone();
  return phone !== null;
};
