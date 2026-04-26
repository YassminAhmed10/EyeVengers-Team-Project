import express from "express";
import {
  getAllScanOrders,
  getScanOrderById,
  getPatientScanOrders,
  createScanOrder,
  updateScanOrderStatus,
  getWorklist
} from "../controllers/scanOrdersController.js";

const router = express.Router();

// Get worklist (all pending scans)
router.get("/worklist", getWorklist);

// Get all scan orders
router.get("/", getAllScanOrders);

// Create scan order
router.post("/", createScanOrder);

// Get scan order by ID
router.get("/:scanOrderId", getScanOrderById);

// Get patient scan orders
router.get("/patient/:patientId", getPatientScanOrders);

// Update scan order status
router.patch("/:scanOrderId/status", updateScanOrderStatus);

export default router;
