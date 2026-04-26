// src/firebase/firestore.js
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  addDoc,
  limit
} from "firebase/firestore";
import { db } from "./config";

// ============ CREATE (إضافة) Operations ============

/**
 * Save user data to Firestore
 * @param {string} userId - User UID from Firebase Auth
 * @param {Object} userData - User data to save
 * @returns {Promise<Object>} Result object
 */
export const saveUserData = async (userId, userData) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      ...userData,
      userId: userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    return { 
      success: true, 
      error: null 
    };
  } catch (error) {
    console.error("Error saving user data:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Get user data from Firestore
 * @param {string} userId - User UID from Firebase Auth
 * @returns {Promise<Object>} Result object with data
 */
export const getUserData = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { 
        success: true, 
        data: userSnap.data(), 
        error: null 
      };
    } else {
      return { 
        success: false, 
        data: null, 
        error: "User not found" 
      };
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    return { 
      success: false, 
      data: null, 
      error: error.message 
    };
  }
};

/**
 * Add a new patient
 * @param {Object} patientData - Patient information
 * @returns {Promise<Object>} Result with patient ID
 */
export const addPatient = async (patientData) => {
  try {
    const patientsRef = collection(db, "patients");
    const docRef = await addDoc(patientsRef, {
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return { 
      success: true, 
      id: docRef.id, 
      error: null 
    };
  } catch (error) {
    console.error("Error adding patient:", error);
    return { 
      success: false, 
      id: null, 
      error: error.message 
    };
  }
};

/**
 * Get all patients
 * @returns {Promise<Object>} Result with patients array
 */
export const getAllPatients = async () => {
  try {
    const patientsRef = collection(db, "patients");
    const querySnapshot = await getDocs(patientsRef);
    const patients = [];
    
    querySnapshot.forEach((doc) => {
      patients.push({ id: doc.id, ...doc.data() });
    });
    
    return { 
      success: true, 
      data: patients, 
      error: null 
    };
  } catch (error) {
    console.error("Error getting patients:", error);
    return { 
      success: false, 
      data: [], 
      error: error.message 
    };
  }
};

/**
 * Get patient by ID
 * @param {string} patientId - Patient document ID
 * @returns {Promise<Object>} Result with patient data
 */
export const getPatientById = async (patientId) => {
  try {
    const patientRef = doc(db, "patients", patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (patientSnap.exists()) {
      return { 
        success: true, 
        data: { id: patientSnap.id, ...patientSnap.data() }, 
        error: null 
      };
    } else {
      return { 
        success: false, 
        data: null, 
        error: "Patient not found" 
      };
    }
  } catch (error) {
    console.error("Error getting patient:", error);
    return { 
      success: false, 
      data: null, 
      error: error.message 
    };
  }
};

/**
 * Update patient information
 * @param {string} patientId - Patient document ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Result object
 */
export const updatePatient = async (patientId, updateData) => {
  try {
    const patientRef = doc(db, "patients", patientId);
    await updateDoc(patientRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    return { 
      success: true, 
      error: null 
    };
  } catch (error) {
    console.error("Error updating patient:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Delete patient
 * @param {string} patientId - Patient document ID
 * @returns {Promise<Object>} Result object
 */
export const deletePatient = async (patientId) => {
  try {
    const patientRef = doc(db, "patients", patientId);
    await deleteDoc(patientRef);
    
    return { 
      success: true, 
      error: null 
    };
  } catch (error) {
    console.error("Error deleting patient:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ============ APPOINTMENTS (المواعيد) Operations ============

/**
 * Add new appointment
 * @param {Object} appointmentData - Appointment information
 * @returns {Promise<Object>} Result with appointment ID
 */
export const addAppointment = async (appointmentData) => {
  try {
    const appointmentsRef = collection(db, "appointments");
    const docRef = await addDoc(appointmentsRef, {
      ...appointmentData,
      status: appointmentData.status || "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return { 
      success: true, 
      id: docRef.id, 
      error: null 
    };
  } catch (error) {
    console.error("Error adding appointment:", error);
    return { 
      success: false, 
      id: null, 
      error: error.message 
    };
  }
};

/**
 * Get appointments by patient ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<Object>} Result with appointments array
 */
export const getAppointmentsByPatient = async (patientId) => {
  try {
    const appointmentsRef = collection(db, "appointments");
    const q = query(
      appointmentsRef, 
      where("patientId", "==", patientId),
      orderBy("date", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const appointments = [];
    
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    
    return { 
      success: true, 
      data: appointments, 
      error: null 
    };
  } catch (error) {
    console.error("Error getting appointments:", error);
    return { 
      success: false, 
      data: [], 
      error: error.message 
    };
  }
};

/**
 * Update appointment status
 * @param {string} appointmentId - Appointment document ID
 * @param {string} status - New status (pending, confirmed, cancelled, completed)
 * @returns {Promise<Object>} Result object
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await updateDoc(appointmentRef, {
      status: status,
      updatedAt: new Date().toISOString()
    });
    
    return { 
      success: true, 
      error: null 
    };
  } catch (error) {
    console.error("Error updating appointment:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Delete appointment
 * @param {string} appointmentId - Appointment document ID
 * @returns {Promise<Object>} Result object
 */
export const deleteAppointment = async (appointmentId) => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await deleteDoc(appointmentRef);
    
    return { 
      success: true, 
      error: null 
    };
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ============ SCAN ORDERS (أوامر الفحص) Operations ============

/**
 * Add new scan order
 * @param {Object} orderData - Scan order information
 * @returns {Promise<Object>} Result with order ID
 */
export const addScanOrder = async (orderData) => {
  try {
    const ordersRef = collection(db, "scanOrders");
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      status: orderData.status || "pending",
      orderedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return { 
      success: true, 
      id: docRef.id, 
      error: null 
    };
  } catch (error) {
    console.error("Error adding scan order:", error);
    return { 
      success: false, 
      id: null, 
      error: error.message 
    };
  }
};

/**
 * Get scan orders by patient ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<Object>} Result with orders array
 */
export const getScanOrdersByPatient = async (patientId) => {
  try {
    const ordersRef = collection(db, "scanOrders");
    const q = query(
      ordersRef, 
      where("patientId", "==", patientId),
      orderBy("orderedDate", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return { 
      success: true, 
      data: orders, 
      error: null 
    };
  } catch (error) {
    console.error("Error getting scan orders:", error);
    return { 
      success: false, 
      data: [], 
      error: error.message 
    };
  }
};

/**
 * Update scan order status
 * @param {string} orderId - Order document ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Result object
 */
export const updateScanOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, "scanOrders", orderId);
    await updateDoc(orderRef, {
      status: status,
      updatedAt: new Date().toISOString()
    });
    
    return { 
      success: true, 
      error: null 
    };
  } catch (error) {
    console.error("Error updating scan order:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ============ REPORTS (التقارير) Operations ============

/**
 * Add new report
 * @param {Object} reportData - Report information
 * @returns {Promise<Object>} Result with report ID
 */
export const addReport = async (reportData) => {
  try {
    const reportsRef = collection(db, "reports");
    const docRef = await addDoc(reportsRef, {
      ...reportData,
      uploadedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return { 
      success: true, 
      id: docRef.id, 
      error: null 
    };
  } catch (error) {
    console.error("Error adding report:", error);
    return { 
      success: false, 
      id: null, 
      error: error.message 
    };
  }
};

/**
 * Get reports by patient ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<Object>} Result with reports array
 */
export const getReportsByPatient = async (patientId) => {
  try {
    const reportsRef = collection(db, "reports");
    const q = query(
      reportsRef, 
      where("patientId", "==", patientId),
      orderBy("uploadedDate", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const reports = [];
    
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() });
    });
    
    return { 
      success: true, 
      data: reports, 
      error: null 
    };
  } catch (error) {
    console.error("Error getting reports:", error);
    return { 
      success: false, 
      data: [], 
      error: error.message 
    };
  }
};

/**
 * Get report by scan order ID
 * @param {string} scanOrderId - Scan order ID
 * @returns {Promise<Object>} Result with report data
 */
export const getReportByScanOrder = async (scanOrderId) => {
  try {
    const reportsRef = collection(db, "reports");
    const q = query(reportsRef, where("scanOrderId", "==", scanOrderId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { 
        success: true, 
        data: { id: doc.id, ...doc.data() }, 
        error: null 
      };
    } else {
      return { 
        success: false, 
        data: null, 
        error: "Report not found" 
      };
    }
  } catch (error) {
    console.error("Error getting report:", error);
    return { 
      success: false, 
      data: null, 
      error: error.message 
    };
  }
};

// Export all functions
export default {
  saveUserData,
  getUserData,
  addPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  addAppointment,
  getAppointmentsByPatient,
  updateAppointmentStatus,
  deleteAppointment,
  addScanOrder,
  getScanOrdersByPatient,
  updateScanOrderStatus,
  addReport,
  getReportsByPatient,
  getReportByScanOrder
};