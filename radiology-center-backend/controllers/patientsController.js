import db from "../models/db.js";
import { v4 as uuidv4 } from "uuid";

// Get all patients
export const getAllPatients = (req, res) => {
  res.json(db.patients);
};

// Get patient by ID
export const getPatientById = (req, res) => {
  const { patientId } = req.params;

  const patient = db.patients.find(p => p.id === patientId);

  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  res.json(patient);
};

// Create new patient
export const createPatient = (req, res) => {
  const { name, email, phone, age, gender, medicalHistory } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newPatient = {
    id: uuidv4(),
    name,
    email,
    phone,
    age: age || null,
    gender: gender || "Not specified",
    medicalHistory: medicalHistory || "",
    createdAt: new Date().toISOString()
  };

  db.patients.push(newPatient);

  res.status(201).json({
    message: "Patient created successfully",
    patient: newPatient
  });
};

// Update patient
export const updatePatient = (req, res) => {
  const { patientId } = req.params;
  const updates = req.body;

  const patient = db.patients.find(p => p.id === patientId);

  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  Object.assign(patient, updates);
  res.json({ message: "Patient updated successfully", patient });
};
