// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDU_wUaZqvdyVRIs5m_Wm-76jpeP9IrAgQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "erp-dashboard-e7ed4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "erp-dashboard-e7ed4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "erp-dashboard-e7ed4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "198777993830",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:198777993830:web:5078be729f2a397f9dcba7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

export default app;