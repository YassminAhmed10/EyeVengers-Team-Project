// Complete Auth Example
// File: src/firebase/auth.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "./config";

// ✅ Register / Sign Up
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: displayName
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ Login / Sign In
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ Logout / Sign Out
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ✅ Reset Password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset email sent" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
