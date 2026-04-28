import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeFirebaseAdmin } from "./firebase-admin.js";
import { firebaseAuthMiddleware } from "./middleware/firebaseAuth.js";

// Import routes
import appointmentsRoutes from "./routes/appointments.js";
import patientsRoutes from "./routes/patients.js";
import scanOrdersRoutes from "./routes/scanOrders.js";
import reportsRoutes from "./routes/reports.js";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (public endpoint)
app.get("/health", (req, res) => {
  res.json({ message: "Radiology Center API is running ✅" });
});

// API Routes with Firebase Authentication Middleware
// Apply middleware to all routes starting with /api
app.use("/api", firebaseAuthMiddleware);

app.use("/api/appointments", appointmentsRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/scan-orders", scanOrdersRoutes);
app.use("/api/reports", reportsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Radiology Center Backend running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 API routes are protected with Firebase Authentication`);
});
