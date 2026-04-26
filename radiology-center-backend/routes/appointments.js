import express from "express";
import {
  fetchAvailableSlots,
  bookAppointment,
  fetchPatientAppointments,
  getAllAppointments,
  updateAppointmentStatus
} from "../controllers/appointmentsController.js";

const router = express.Router();

// Get available slots
router.get("/slots", fetchAvailableSlots);

// Book appointment
router.post("/book", bookAppointment);

// Get all appointments
router.get("/", getAllAppointments);

// Get patient appointments
router.get("/patient/:patientId", fetchPatientAppointments);

// Update appointment status
router.patch("/:appointmentId/status", updateAppointmentStatus);

export default router;
