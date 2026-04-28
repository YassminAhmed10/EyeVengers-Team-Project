// src/firebase/auth.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification
} from "firebase/auth";
import { auth } from "./config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./config";

// ============ AUTHENTICATION FUNCTIONS ============

/**
 * Register a new user with email and password
 */
export const registerUser = async (email, password, userData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const displayName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    if (displayName) {
      await updateProfile(user, { displayName: displayName });
    }
    
    try {
      await sendEmailVerification(user);
    } catch (emailError) {
      console.warn("Could not send verification email:", emailError.message);
    }
    
    const userDocData = {
      uid: user.uid,
      email: email,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      phone: userData.phone || "",
      role: userData.role || "patient",
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    
    await setDoc(doc(db, "users", user.uid), userDocData);
    const token = await user.getIdToken();
    
    return {
      success: true,
      user: user,
      token: token,
      userData: userDocData,
      error: null,
      code: null
    };
  } catch (error) {
    console.error("Registration error:", error);
    
    let errorMessage = error.message;
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "This email is already registered. Please login instead.";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password should be at least 6 characters.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Please enter a valid email address.";
    }
    
    return {
      success: false,
      user: null,
      token: null,
      userData: null,
      error: errorMessage,
      code: error.code
    };
  }
};

/**
 * Login existing user with email and password
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();
    
    const userDataResult = await getUserData(user.uid);
    
    return {
      success: true,
      user: user,
      token: token,
      userData: userDataResult.success ? userDataResult.data : null,
      error: null,
      code: null
    };
  } catch (error) {
    console.error("Login error:", error);
    
    let errorMessage = error.message;
    if (error.code === "auth/user-not-found") {
      errorMessage = "No account found with this email. Please register first.";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password. Please try again.";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Too many failed attempts. Please try again later.";
    } else if (error.code === "auth/invalid-credential") {
      errorMessage = "Invalid email or password.";
    }
    
    return {
      success: false,
      user: null,
      token: null,
      userData: null,
      error: errorMessage,
      code: error.code
    };
  }
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    
    const itemsToRemove = [
      "authToken", "userRole", "userName", "userEmail", "userId", "userPhone"
    ];
    itemsToRemove.forEach(item => localStorage.removeItem(item));
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { 
      success: true, 
      error: null,
      message: "Password reset email sent. Check your inbox."
    };
  } catch (error) {
    console.error("Password reset error:", error);
    
    let errorMessage = error.message;
    if (error.code === "auth/user-not-found") {
      errorMessage = "No account found with this email address.";
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Get user data from Firestore by UID
 */
export const getUserData = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        data: { id: docSnap.id, ...docSnap.data() }, 
        error: null 
      };
    } else {
      return { 
        success: false, 
        data: null, 
        error: "User not found in database" 
      };
    }
  } catch (error) {
    console.error("Get user data error:", error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Save or update user data in Firestore
 */
export const saveUserData = async (userId, userData, merge = true) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const docRef = doc(db, "users", userId);
    const dataToSave = {
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    if (merge) {
      await setDoc(docRef, dataToSave, { merge: true });
    } else {
      await setDoc(docRef, {
        ...dataToSave,
        uid: userId,
        createdAt: new Date().toISOString()
      });
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Save user data error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current Firebase ID token for API calls
 */
export const getCurrentToken = async (forceRefresh = false) => {
  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken(forceRefresh);
    }
    return null;
  } catch (error) {
    console.error("Get token error:", error);
    return null;
  }
};

/**
 * ✅ IMPORTANT: Listen to authentication state changes
 * This is the function that AuthContext is looking for
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken();
      const userData = await getUserData(user.uid);
      callback({ 
        user: user, 
        token: token,
        userData: userData.success ? userData.data : null,
        isAuthenticated: true 
      });
    } else {
      callback({ 
        user: null, 
        token: null, 
        userData: null,
        isAuthenticated: false 
      });
    }
  });
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Check if user is logged in
 */
export const isUserLoggedIn = () => {
  return auth.currentUser !== null;
};