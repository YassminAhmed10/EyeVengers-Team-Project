import db from "../models/db.js";
import { v4 as uuidv4 } from "uuid";

// Get all reports
export const getAllReports = (req, res) => {
  res.json(db.reports);
};

// Get reports for a patient
export const getPatientReports = (req, res) => {
  const { patientId } = req.params;

  const reports = db.reports.filter(r => r.patientId === patientId);

  if (reports.length === 0) {
    return res.status(404).json({ message: "No reports found for this patient" });
  }

  res.json(reports);
};

// Get report by ID
export const getReportById = (req, res) => {
  const { reportId } = req.params;

  const report = db.reports.find(r => r.id === reportId);

  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  res.json(report);
};

// Create/Upload report
export const uploadReport = (req, res) => {
  const { scanOrderId, patientId, radiologistName, findings, impression, notes } = req.body;

  if (!scanOrderId || !patientId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newReport = {
    id: uuidv4(),
    scanOrderId,
    patientId,
    radiologistName: radiologistName || "Pending",
    findings: findings || "",
    impression: impression || "",
    notes: notes || "",
    uploadedDate: new Date().toISOString(),
    status: "completed"
  };

  db.reports.push(newReport);

  // Update scan order status to completed
  const scanOrder = db.scanOrders.find(so => so.id === scanOrderId);
  if (scanOrder) {
    scanOrder.status = "completed";
  }

  res.status(201).json({
    message: "Report uploaded successfully",
    report: newReport
  });
};

// Update report
export const updateReport = (req, res) => {
  const { reportId } = req.params;
  const updates = req.body;

  const report = db.reports.find(r => r.id === reportId);

  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  Object.assign(report, updates);
  res.json({ message: "Report updated successfully", report });
};
