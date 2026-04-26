import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Save user data to Firestore
 * @param {string} uid - User ID
 * @param {Object} userData - User data object
 * @returns {Promise<Object>} Success or error
 */
export const saveUserData = async (uid, userData) => {
  try {
    const userRef = doc(db, "users", uid);
    
    // Check if user already exists
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new user
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return { success: true, message: "User data saved" };
  } catch (error) {
    console.error("Error saving user data:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user data from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object>} User data or error
 */
export const getUserData = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return {
        success: true,
        data: { id: userSnap.id, ...userSnap.data() },
      };
    } else {
      return {
        success: false,
        error: "User data not found",
      };
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Update user data in Firestore
 * @param {string} uid - User ID
 * @param {Object} updates - Data to update
 * @returns {Promise<Object>} Success or error
 */
export const updateUserData = async (uid, updates) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, message: "User data updated" };
  } catch (error) {
    console.error("Error updating user data:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Add a new patient
 * @param {Object} patientData - Patient data
 * @returns {Promise<Object>} Patient ID or error
 */
export const addPatient = async (patientData) => {
  try {
    const patientsRef = collection(db, "patients");
    const newPatientRef = doc(patientsRef);
    
    await setDoc(newPatientRef, {
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      id: newPatientRef.id,
      message: "Patient added successfully",
    };
  } catch (error) {
    console.error("Error adding patient:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all patients for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Array of patients or error
 */
export const getUserPatients = async (userId) => {
  try {
    const q = query(
      collection(db, "patients"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    
    const patients = [];
    querySnapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, data: patients };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all appointments for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Array of appointments or error
 */
export const getUserAppointments = async (userId) => {
  try {
    const q = query(
      collection(db, "appointments"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    
    const appointments = [];
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, data: appointments };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all reports for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Array of reports or error
 */
export const getUserReports = async (userId) => {
  try {
    const q = query(
      collection(db, "reports"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    
    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, data: reports };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { success: false, error: error.message };
  }
};
