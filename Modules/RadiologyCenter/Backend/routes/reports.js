import express from "express";
import {
  getAllReports,
  getPatientReports,
  getReportById,
  uploadReport,
  updateReport
} from "../controllers/reportsController.js";

const router = express.Router();

// Get all reports
router.get("/", getAllReports);

// Upload/Create report
router.post("/upload", uploadReport);

// Get patient reports
router.get("/patient/:patientId", getPatientReports);

// Get report by ID
router.get("/:reportId", getReportById);

// Update report
router.put("/:reportId", updateReport);

export default router;
