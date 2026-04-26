import db from "../models/db.js";
import { v4 as uuidv4 } from "uuid";

// Get available appointment slots for a specific date
export const fetchAvailableSlots = (req, res) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  const slotData = db.appointmentSlots.find(slot => slot.date === date);
  
  if (!slotData) {
    return res.status(404).json({ message: "No slots available for this date" });
  }

  res.json({ date, times: slotData.times });
};

// Book an appointment
export const bookAppointment = (req, res) => {
  const { patientId, scanType, date, time, notes } = req.body;

  if (!patientId || !scanType || !date || !time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newAppointment = {
    id: uuidv4(),
    patientId,
    scanType,
    date,
    time,
    status: "confirmed",
    notes: notes || "",
    createdAt: new Date().toISOString()
  };

  db.appointments.push(newAppointment);

  res.status(201).json({
    message: "Appointment booked successfully",
    appointment: newAppointment
  });
};

// Get patient appointments
export const fetchPatientAppointments = (req, res) => {
  const { patientId } = req.params;

  const appointments = db.appointments.filter(apt => apt.patientId === patientId);

  if (appointments.length === 0) {
    return res.status(404).json({ message: "No appointments found for this patient" });
  }

  res.json(appointments);
};

// Get all appointments
export const getAllAppointments = (req, res) => {
  res.json(db.appointments);
};

// Update appointment status
export const updateAppointmentStatus = (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  const appointment = db.appointments.find(apt => apt.id === appointmentId);

  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  appointment.status = status;
  res.json({ message: "Appointment updated successfully", appointment });
};
