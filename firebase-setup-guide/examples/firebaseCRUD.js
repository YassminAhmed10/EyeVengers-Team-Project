// Complete CRUD Example
// File: src/firebase/firestore.js

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "./config";

// ✅ CREATE
export const addPatient = async (patientData) => {
  try {
    const docRef = await addDoc(collection(db, "patients"), {
      ...patientData,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ✅ READ ALL
export const getAllPatients = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "patients"));
    const patients = [];
    querySnapshot.forEach((doc) => {
      patients.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: patients };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ✅ READ ONE
export const getPatientById = async (patientId) => {
  try {
    const docSnap = await getDoc(doc(db, "patients", patientId));
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: "Patient not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ✅ UPDATE
export const updatePatient = async (patientId, updatedData) => {
  try {
    await updateDoc(doc(db, "patients", patientId), {
      ...updatedData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ✅ DELETE
export const deletePatient = async (patientId) => {
  try {
    await deleteDoc(doc(db, "patients", patientId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
