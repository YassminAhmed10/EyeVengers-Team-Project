import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";

/**
 * Register a new user with email and password
 * Also saves user data to Firestore
 */
export const registerUser = async (email, password, userData = {}) => {
  try {
    // 1. إنشاء الحساب في Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. تحديث الاسم في Firebase Auth
    const displayName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // 3. حفظ البيانات في Firestore
    const userDocData = {
      uid: user.uid,
      email: email,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      displayName: displayName,
      phone: userData.phone || "",
      role: userData.role || "patient",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    await setDoc(doc(db, "users", user.uid), userDocData);

    // 4. جيب الـ token
    const idToken = await user.getIdToken();

    return {
      success: true,
      user: user,
      token: idToken,
      userData: userDocData,
      code: null,
      error: null,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      user: null,
      token: null,
      userData: null,
      error: formatAuthError(error.code),
      code: error.code,
    };
  }
};

/**
 * Login user with email and password
 * Also fetches user data from Firestore
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    // جيب بيانات المستخدم من Firestore
    let userData = null;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        userData = userDoc.data();
      } else {
        // لو مش موجود في Firestore — حفظه
        userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          role: "patient",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, "users", user.uid), userData);
      }
    } catch (firestoreError) {
      console.warn("Could not fetch Firestore data:", firestoreError);
    }

    return {
      success: true,
      user: user,
      token: idToken,
      userData: userData,
      code: null,
      error: null,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      user: null,
      token: null,
      userData: null,
      error: formatAuthError(error.code),
      code: error.code,
    };
  }
};

/**
 * Logout the current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    const keysToRemove = [
      "authToken", "firebaseToken", "userRole", "userName",
      "userEmail", "userId", "userFirstName", "userLastName",
      "radiologyPatientName", "radiologyPatientId", "radiologyPatientEmail",
      "radiologyPatientFirstName", "radiologyPatientLastName",
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset email sent" };
  } catch (error) {
    return { success: false, error: formatAuthError(error.code) };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates) => {
  try {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, updates);
      return { success: true };
    }
    return { success: false, error: "No user logged in" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthState = (callback) => {
  try {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          localStorage.setItem("authToken", token);
          callback({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            token,
          });
        } catch (err) {
          console.error("Error getting auth token:", err);
          callback(null);
        }
      } else {
        localStorage.removeItem("authToken");
        callback(null);
      }
    });
    return unsubscribe;
  } catch (err) {
    console.error("Error subscribing to auth state:", err);
    return () => {};
  }
};

/**
 * Format Firebase authentication errors
 */
export const formatAuthError = (errorCode) => {
  const errorMessages = {
    "auth/email-already-in-use": "This email is already registered. Try logging in.",
    "auth/weak-password": "Password must be at least 6 characters",
    "auth/invalid-email": "Invalid email address",
    "auth/operation-not-allowed": "Email/password accounts are not enabled",
    "auth/user-disabled": "This account has been disabled",
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/too-many-requests": "Too many login attempts. Try again later.",
    "auth/account-exists-with-different-credential": "An account already exists with this email",
    "auth/invalid-credential": "Invalid email or password",
  };
  return errorMessages[errorCode] || "An authentication error occurred";
};