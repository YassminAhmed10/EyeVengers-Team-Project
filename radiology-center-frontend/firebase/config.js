// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration - using your actual credentials
const firebaseConfig = {
  apiKey: "AIzaSyASF5uqrkD7-J98G_aya2y9FmvHj3plFNI",
  authDomain: "eye-clinic-test-ceb22.firebaseapp.com",
  projectId: "eye-clinic-test-ceb22",
  storageBucket: "eye-clinic-test-ceb22.firebasestorage.app",
  messagingSenderId: "1044899587193",
  appId: "1:1044899587193:web:76624a3439b3532a9ee0a8",
  measurementId: "G-V6PC5KZG79"
};

// Validate configuration
const validateConfig = () => {
  const requiredFields = [
    'apiKey', 'authDomain', 'projectId', 
    'storageBucket', 'messagingSenderId', 'appId'
  ];
  
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Firebase configuration error: Missing fields:', missingFields);
    return false;
  }
  
  console.log('✅ Firebase configuration loaded successfully');
  console.log('📱 Project:', firebaseConfig.projectId);
  return true;
};

validateConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export app as default
export default app;