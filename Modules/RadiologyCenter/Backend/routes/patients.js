import express from "express";
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient
} from "../controllers/patientsController.js";

const router = express.Router();

// Get all patients
router.get("/", getAllPatients);

// Get patient by ID
router.get("/:patientId", getPatientById);

// Create patient
router.post("/", createPatient);

// Update patient
router.put("/:patientId", updatePatient);

export default router;
