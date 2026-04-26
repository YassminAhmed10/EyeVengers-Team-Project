import db from "../models/db.js";
import { v4 as uuidv4 } from "uuid";

// Get all scan orders
export const getAllScanOrders = (req, res) => {
  res.json(db.scanOrders);
};

// Get scan order by ID
export const getScanOrderById = (req, res) => {
  const { scanOrderId } = req.params;

  const scanOrder = db.scanOrders.find(so => so.id === scanOrderId);

  if (!scanOrder) {
    return res.status(404).json({ message: "Scan order not found" });
  }

  res.json(scanOrder);
};

// Get scan orders for a patient
export const getPatientScanOrders = (req, res) => {
  const { patientId } = req.params;

  const scanOrders = db.scanOrders.filter(so => so.patientId === patientId);

  if (scanOrders.length === 0) {
    return res.status(404).json({ message: "No scan orders found for this patient" });
  }

  res.json(scanOrders);
};

// Create scan order
export const createScanOrder = (req, res) => {
  const { patientId, scanType, priority, notes } = req.body;

  if (!patientId || !scanType) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newScanOrder = {
    id: uuidv4(),
    patientId,
    scanType,
    status: "pending",
    orderedDate: new Date().toISOString(),
    priority: priority || "routine",
    notes: notes || ""
  };

  db.scanOrders.push(newScanOrder);

  res.status(201).json({
    message: "Scan order created successfully",
    scanOrder: newScanOrder
  });
};

// Update scan order status
export const updateScanOrderStatus = (req, res) => {
  const { scanOrderId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const scanOrder = db.scanOrders.find(so => so.id === scanOrderId);

  if (!scanOrder) {
    return res.status(404).json({ message: "Scan order not found" });
  }

  scanOrder.status = status;
  res.json({ message: "Scan order status updated successfully", scanOrder });
};

// Get worklist (all pending scans)
export const getWorklist = (req, res) => {
  const worklist = db.scanOrders.filter(so => so.status === "pending");
  res.json(worklist);
};
