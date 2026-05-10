// PatientManagement/PatientOrdersPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, CardContent, Chip, Button, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Snackbar, CircularProgress, Collapse,
  IconButton, Paper, Stepper, Step, StepLabel, MenuItem,
  Select, FormControl, InputLabel,
} from "@mui/material";
import {
  Science, Visibility, Medication, CheckCircle, Cancel,
  CalendarMonth, ExpandMore, ExpandLess, LocalHospital,
  Storefront, LocalPharmacy, AccessTime, EventAvailable,
  PlaylistAddCheck, MedicalInformation, InfoOutlined,
} from "@mui/icons-material";
import axios from "axios";
import PatientLayout from "../components/PatientLayout";

const _rawUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5201/api';
const BASE_URL = _rawUrl.replace('https://localhost', 'http://localhost');

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns P-XXXXXX — THE primary patient identifier
const getPatientId = () => {
  const pi = localStorage.getItem("patientIdentifier") || localStorage.getItem("PatientIdentifier");
  if (pi) return pi;
  const pid = localStorage.getItem("patientId");
  if (pid && /^P-/i.test(String(pid).trim())) return pid.trim();
  return pid || null;
};

const getToken = () => localStorage.getItem("token");

// ── Order config ──────────────────────────────────────────────────────────────

const ORDER_CONFIG = {
  investigation: {
    label: "Radiology Investigation",
    icon: <Science />,
    color: "#1e3a5f",
    bg: "#e8f0fe",
    destination: "Radiology Center",
    destIcon: <LocalHospital fontSize="small" />,
    steps: ["Doctor Request", "Your Decision", "Book Appointment", "Visit Radiology Center"],
    // Human-readable request message builder
    buildMessage: (data) => {
      const tests = (data?.selectedTests || []).join(", ");
      const priority = data?.priority && data.priority !== "Routine" ? ` (${data.priority})` : "";
      return `Your doctor has requested the following radiology test${(data?.selectedTests || []).length > 1 ? "s" : ""} for you: **${tests}**${priority}. Please review and book your appointment at the Radiology Center at your earliest convenience.`;
    },
    actionLabel: "Book at Radiology Center",
  },
  eyeExam: {
    label: "Eye Exam & Vision",
    icon: <Visibility />,
    color: "#2e7d32",
    bg: "#e8f5e9",
    destination: "Glass Store",
    destIcon: <Storefront fontSize="small" />,
    steps: ["Doctor Request", "Your Decision", "Book Appointment", "Visit Glass Store"],
    buildMessage: (data) => {
      const parts = [];
      if (data?.rightEye?.visualAcuity) parts.push(`Right Eye (OD): ${data.rightEye.visualAcuity}`);
      if (data?.leftEye?.visualAcuity)  parts.push(`Left Eye (OS): ${data.leftEye.visualAcuity}`);
      if (data?.rightEye?.eyePressure)  parts.push(`Eye Pressure: ${data.rightEye.eyePressure} mmHg`);
      return `Your doctor has completed your eye examination and recommends a visit to the Glass Store${parts.length ? ` based on your results (${parts.join(" · ")})` : ""}. Please review and book your fitting appointment.`;
    },
    actionLabel: "Book at Glass Store",
  },
  prescription: {
    label: "Medication Prescription",
    icon: <Medication />,
    color: "#e65100",
    bg: "#fff3e0",
    destination: "Pharmacy",
    destIcon: <LocalPharmacy fontSize="small" />,
    steps: ["Doctor Request", "Your Decision", "Book Pickup", "Collect at Pharmacy"],
    buildMessage: (data) => {
      const items = (data?.items || []);
      const drugs = items.map((i) => i.drug).filter(Boolean).join(", ");
      return `Your doctor has prescribed the following medication${items.length > 1 ? "s" : ""} for you: **${drugs}**. Please review the full prescription details below and proceed to the Pharmacy to collect them.`;
    },
    actionLabel: "Book Pharmacy Pickup",
  },
};

const STATUS_STEP = {
  PendingPatientApproval: 0,
  Accepted: 1,
  Booked: 2,
  Completed: 3,
  Rejected: -1,
};

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "13:00", "13:30", "14:00",
  "14:30", "15:00", "15:30", "16:00",
];

// ── Render message with **bold** support ──────────────────────────────────────

const FormattedMessage = ({ text }) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <Typography variant="body1" sx={{ lineHeight: 1.8, color: "#333" }}>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i}>{part}</strong>
          : part
      )}
    </Typography>
  );
};

// ── Order details (collapsible clinical data) ─────────────────────────────────

const ClinicalDetails = ({ order }) => {
  const data = order.data;

  if (order.orderType === "investigation") return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Typography variant="body2">
        <strong>Tests Requested:</strong>{" "}
        {(data?.selectedTests || []).map((t, i) => (
          <Chip key={i} label={t} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
        ))}
      </Typography>
      <Typography variant="body2" component="div"><strong>Priority:</strong> {data?.priority || "Routine"}</Typography>
      {data?.notes && <Typography variant="body2" component="div"><strong>Clinical Notes:</strong> {data.notes}</Typography>}
    </Box>
  );

  if (order.orderType === "eyeExam") return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      {data?.rightEye?.visualAcuity && (
        <Typography variant="body2">
          <strong>Right Eye (OD):</strong> VA {data.rightEye.visualAcuity}
          {data.rightEye.eyePressure ? ` · Pressure ${data.rightEye.eyePressure} mmHg` : ""}
        </Typography>
      )}
      {data?.leftEye?.visualAcuity && (
        <Typography variant="body2">
          <strong>Left Eye (OS):</strong> VA {data.leftEye.visualAcuity}
        </Typography>
      )}
      {data?.pupilReaction    && <Typography variant="body2" component="div"><strong>Pupil Reaction:</strong> {data.pupilReaction}</Typography>}
      {data?.eyeAlignment     && <Typography variant="body2" component="div"><strong>Eye Alignment:</strong> {data.eyeAlignment}</Typography>}
      {data?.anteriorSegment  && <Typography variant="body2" component="div"><strong>Anterior Segment:</strong> {data.anteriorSegment}</Typography>}
      {data?.fundusObservation && <Typography variant="body2" component="div"><strong>Fundus:</strong> {data.fundusObservation}</Typography>}
      {data?.notes            && <Typography variant="body2" component="div"><strong>Notes:</strong> {data.notes}</Typography>}
    </Box>
  );

  if (order.orderType === "prescription") return (
    <Box>
      {(data?.items || []).map((item, i) => (
        <Box key={i} sx={{ mb: 1.5, p: 1.5, bgcolor: "#fafafa", borderRadius: 1, border: "1px solid #eee" }}>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.3 }}>
            {item.drug}{item.form ? ` — ${item.form}` : ""}
          </Typography>
          <Typography variant="body2" sx={{ color: "#555" }}>
            {[item.dose, item.frequency, item.duration].filter(Boolean).join(" · ")}
          </Typography>
          {item.notes && (
            <Typography variant="caption" sx={{ color: "#888" }}>{item.notes}</Typography>
          )}
        </Box>
      ))}
    </Box>
  );

  return null;
};

// ── Book dialog ───────────────────────────────────────────────────────────────

const BookDialog = ({ open, order, onClose, onBooked }) => {
  const [date, setDate]       = useState("");
  const [time, setTime]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const cfg = ORDER_CONFIG[order?.orderType] || {};

  useEffect(() => { if (open) { setDate(""); setTime(""); setError(""); } }, [open]);

  const handleBook = async () => {
    if (!date || !time) { setError("Please select both date and time."); return; }
    setLoading(true);
    try {
      const { data: updated } = await axios.patch(
        `${BASE_URL}/DoctorOrders/${order.id}/Book`,
        { appointmentDate: date, appointmentTime: time },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      onBooked(updated);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: cfg.color, fontWeight: 700 }}>
        <EventAvailable /> Book your appointment — {cfg.destination}
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2.5 }}>
          Your doctor's order will be shared with <strong>{cfg.destination}</strong> automatically upon booking.
        </Alert>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          label="Preferred Date"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDateStr }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          sx={{ mb: 2.5, mt: 0.5 }}
        />
        <FormControl fullWidth>
          <InputLabel>Preferred Time</InputLabel>
          <Select value={time} label="Preferred Time" onChange={(e) => setTime(e.target.value)}>
            {TIME_SLOTS.map((t) => (
              <MenuItem key={t} value={t}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTime fontSize="small" /> {t}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: "#666" }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleBook}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <EventAvailable />}
          sx={{ bgcolor: cfg.color, "&:hover": { filter: "brightness(0.9)" }, fontWeight: 700, px: 3 }}
        >
          {loading ? "Booking..." : "Confirm Appointment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Decline dialog ────────────────────────────────────────────────────────────

const DeclineDialog = ({ open, orderId, onClose, onDeclined }) => {
  const [reason, setReason]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (open) setReason(""); }, [open]);

  const handleDecline = async () => {
    setLoading(true);
    try {
      const { data: updated } = await axios.patch(
        `${BASE_URL}/DoctorOrders/${orderId}/Respond`,
        { action: "Rejected", rejectionReason: reason },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      onDeclined(updated);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ color: "#c62828", fontWeight: 700 }}>
        <Cancel sx={{ mr: 1, verticalAlign: "middle" }} />
        Decline this request
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
          You can let your doctor know why you're declining this request (optional).
        </Typography>
        <TextField
          multiline rows={3} fullWidth
          label="Reason (optional)"
          placeholder="e.g. I already have an appointment scheduled..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: "#666" }}>Go Back</Button>
        <Button
          variant="contained" color="error"
          onClick={handleDecline} disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Cancel />}
          sx={{ fontWeight: 700 }}
        >
          {loading ? "Declining..." : "Decline Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Single order card ─────────────────────────────────────────────────────────

const PatientOrderCard = ({ order, onUpdated }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bookOpen,    setBookOpen]    = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [accepting,   setAccepting]   = useState(false);

  const cfg  = ORDER_CONFIG[order.orderType] || {};
  const step = STATUS_STEP[order.status] ?? 0;
  const isPending  = order.status === "PendingPatientApproval";
  const isAccepted = order.status === "Accepted";
  const isBooked   = order.status === "Booked" || order.status === "Completed";
  const isDeclined = order.status === "Rejected";

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const { data: updated } = await axios.patch(
        `${BASE_URL}/DoctorOrders/${order.id}/Respond`,
        { action: "Accepted" },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      onUpdated(updated);
    } catch (e) {
      console.error("Accept failed", e);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          mb: 2.5,
          borderRadius: 3,
          border: `1px solid ${cfg.color}33`,
          borderTop: `4px solid ${cfg.color}`,
          opacity: isDeclined ? 0.6 : 1,
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: `0 4px 16px ${cfg.color}22` },
        }}
      >
        <CardContent>

          {/* ── Top row: icon + type + status chip ── */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color, flexShrink: 0 }}>
                {cfg.icon}
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: cfg.color }}>
                  Doctor's Request — {cfg.label}
                </Typography>
                <Typography variant="caption" sx={{ color: "#888", display: "flex", alignItems: "center", gap: 0.5 }}>
                  {cfg.destIcon}&nbsp;{cfg.destination}
                  &nbsp;·&nbsp;
                  {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </Typography>
              </Box>
            </Box>

            <Chip
              label={
                isPending  ? "Action Required" :
                isAccepted ? "Accepted — Book Now" :
                isBooked   ? "Booked ✓" :
                isDeclined ? "Declined" : order.status
              }
              size="small"
              color={
                isBooked   ? "success" :
                isAccepted ? "primary" :
                isDeclined ? "error"   : "warning"
              }
              variant={isPending ? "filled" : "outlined"}
              sx={{ fontWeight: 700 }}
            />
          </Box>

          {/* ── Human-readable message ── */}
          <Box sx={{
            bgcolor: cfg.bg,
            borderRadius: 2,
            p: 2,
            mb: 2,
            border: `1px solid ${cfg.color}22`,
          }}>
            <FormattedMessage text={cfg.buildMessage ? cfg.buildMessage(order.data) : ""} />
          </Box>

          {/* ── Progress stepper ── */}
          {!isDeclined && (
            <Stepper activeStep={step} alternativeLabel sx={{ mb: 2 }}>
              {cfg.steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ "& .MuiStepLabel-label": { fontSize: "0.7rem" } }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          {/* ── Booked confirmation ── */}
          {isBooked && (
            <Alert severity="success" icon={<EventAvailable />} sx={{ mb: 2, borderRadius: 2 }}>
              <strong>Appointment confirmed:</strong>{" "}
              {order.appointmentDate && new Date(order.appointmentDate).toLocaleDateString("en-GB", {
                weekday: "long", day: "2-digit", month: "long", year: "numeric",
              })}{" "}
              at {order.appointmentTime}
              {order.externalSystemConfirmationId && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  Confirmation ID: <strong>{order.externalSystemConfirmationId}</strong>
                </Typography>
              )}
            </Alert>
          )}

          {/* ── Declined reason ── */}
          {isDeclined && order.rejectionReason && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              <strong>Your reason:</strong> {order.rejectionReason}
            </Alert>
          )}

          {/* ── Clinical details toggle ── */}
          <Box
            onClick={() => setDetailsOpen(!detailsOpen)}
            sx={{
              display: "flex", alignItems: "center", gap: 0.5,
              cursor: "pointer", color: "#666", mb: detailsOpen ? 1.5 : 0,
              "&:hover": { color: cfg.color },
            }}
          >
            <InfoOutlined fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {detailsOpen ? "Hide" : "View"} clinical details
            </Typography>
            {detailsOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </Box>

          <Collapse in={detailsOpen}>
            <Box sx={{ p: 1.5, bgcolor: "#fafafa", borderRadius: 2, border: "1px solid #eee", mb: 1.5 }}>
              <ClinicalDetails order={order} />
            </Box>
          </Collapse>

          {/* ── Action buttons ── */}
          {isPending && (
            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", mt: 1 }}>
              <Button
                variant="outlined" color="error" size="small"
                startIcon={<Cancel />}
                onClick={() => setDeclineOpen(true)}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Decline
              </Button>
              <Button
                variant="contained" size="small"
                startIcon={accepting ? <CircularProgress size={14} color="inherit" /> : <CheckCircle />}
                onClick={handleAccept}
                disabled={accepting}
                sx={{ bgcolor: cfg.color, "&:hover": { filter: "brightness(0.9)" }, borderRadius: 2, fontWeight: 700, px: 3 }}
              >
                {accepting ? "Accepting..." : "Accept Request"}
              </Button>
            </Box>
          )}

          {isAccepted && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                variant="contained" size="small"
                startIcon={<CalendarMonth />}
                onClick={() => setBookOpen(true)}
                sx={{ bgcolor: cfg.color, "&:hover": { filter: "brightness(0.9)" }, borderRadius: 2, fontWeight: 700, px: 3 }}
              >
                {cfg.actionLabel}
              </Button>
            </Box>
          )}

        </CardContent>
      </Card>

      <BookDialog
        open={bookOpen}
        order={order}
        onClose={() => setBookOpen(false)}
        onBooked={onUpdated}
      />
      <DeclineDialog
        open={declineOpen}
        orderId={order.id}
        onClose={() => setDeclineOpen(false)}
        onDeclined={onUpdated}
      />
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const PatientOrdersPage = () => {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [filter,      setFilter]      = useState("all");
  const [snackbar,    setSnackbar]    = useState({ open: false, message: "", severity: "success" });
  const [isNewPatient, setIsNewPatient] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    // Step 1: get patientId from localStorage (MOST RELIABLE)
    let patientId = getPatientId();
    
    // Debug log for diagnosis
    if (!patientId) {
      console.warn("⚠️ No patientId found in localStorage. Checking patient data...");
      const patientData = localStorage.getItem("patient");
      if (patientData) {
        try {
          const p = JSON.parse(patientData);
          patientId = p.id || p.Id;
          if (patientId) {
            console.log("✓ Found patientId from patient object:", patientId);
            localStorage.setItem("patientId", String(patientId));
          }
        } catch (e) {
          console.error("Failed to parse patient data:", e);
        }
      }
    }

    // Step 2: If still no patientId, lookup by email (ONLY if patientId is truly missing)
    if (!patientId) {
      const email = localStorage.getItem("userEmail") || localStorage.getItem("patientEmail");
      if (email) {
        try {
          const token = getToken();
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const res = await axios.get(`${BASE_URL}/Patient`, { headers });
          const patients = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
          
          console.log(`Searching for patient with email: ${email}`);
          const match = patients.find(p =>
            (p.email || p.Email || "").toLowerCase() === email.toLowerCase()
          );
          
          if (match) {
            patientId = match.id ?? match.Id ?? match.patientId;
            if (patientId) {
              console.log("✓ Found patientId by email lookup:", patientId);
              localStorage.setItem("patientId", String(patientId));
              
              // Also save full patient object for future use
              localStorage.setItem("patient", JSON.stringify(match));
            }
          } else {
            console.warn("⚠️ No patient found matching email:", email);
          }
        } catch (e) {
          console.error("Patient lookup error:", e);
        }
      }
    }

    if (!patientId) {
      setError("Could not identify your account. Please log in again.");
      setLoading(false);
      return;
    }

    console.log("Fetching orders for patientId:", patientId);

    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // ✅ Step 1: Check if patient has a medical record (determines if they're "new")
      try {
        const medicalCheckRes = await axios.get(`${BASE_URL}/MedicalRecord/check/${patientId}`, { headers });
        const hasRecord = medicalCheckRes.data?.exists || false;
        console.log(`Medical record check for ${patientId}: exists=${hasRecord}`);
        setIsNewPatient(!hasRecord);
      } catch (e) {
        console.warn("Could not check medical record status:", e.message);
        setIsNewPatient(true); // Assume new if we can't verify
      }
      
      // ✅ Step 2: Fetch doctor orders
      const { data } = await axios.get(`${BASE_URL}/DoctorOrders/MyOrders`, {
        params: { patientId },
        headers,
      });
      
      const ordersArray = Array.isArray(data) ? data : (data?.data ?? []);
      console.log(`✓ Fetched ${ordersArray.length} orders for patient ${patientId}`);
      setOrders(ordersArray);
    } catch (e) {
      console.error("Orders fetch error:", e);
      setError(e.response?.data?.message || "Could not load your requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Refetch orders whenever these change
    const patientId = getPatientId();
    const email = localStorage.getItem("userEmail") || localStorage.getItem("patientEmail");
    
    fetchOrders();
    
    // Set up periodic refresh every 60 seconds
    const refreshInterval = setInterval(() => fetchOrders(), 60000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchOrders]);

  const handleOrderUpdated = (updated) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    const cfg = ORDER_CONFIG[updated.orderType];
    const msg =
      updated.status === "Accepted"  ? `Request accepted! Please book your appointment at ${cfg?.destination}.` :
      updated.status === "Booked"    ? `Appointment booked successfully at ${cfg?.destination}!` :
      "Request declined.";
    setSnackbar({ open: true, message: msg, severity: updated.status === "Rejected" ? "warning" : "success" });
  };

  const filterOptions = [
    { value: "all",                    label: "All Requests" },
    { value: "PendingPatientApproval", label: "Action Required" },
    { value: "Accepted",               label: "Accepted" },
    { value: "Booked",                 label: "Booked" },
    { value: "Rejected",               label: "Declined" },
  ];

  const filtered     = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const pendingCount = orders.filter((o) => o.status === "PendingPatientApproval").length;

  return (
    <PatientLayout>
    <Box sx={{ maxWidth: 820, mx: "auto", p: 3 }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e3a5f" }}>
          <MedicalInformation />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e3a5f", lineHeight: 1.2 }}>
            My Doctor Requests
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Review requests from your doctor and book your appointments.
          </Typography>
        </Box>
      </Box>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2.5, borderRadius: 2 }}
          icon={<MedicalInformation />}
        >
          You have <strong>{pendingCount}</strong> doctor request{pendingCount > 1 ? "s" : ""} waiting for your response.
        </Alert>
      )}

      {/* Filter chips */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
        {filterOptions.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            clickable
            variant={filter === opt.value ? "filled" : "outlined"}
            color={filter === opt.value ? "primary" : "default"}
            onClick={() => setFilter(opt.value)}
            sx={{ fontWeight: filter === opt.value ? 700 : 400 }}
          />
        ))}
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchOrders}>Retry</Button>
        } sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      ) : filtered.length === 0 ? (
        <Paper sx={{ textAlign: "center", py: 9, color: "#bbb", borderRadius: 3 }}>
          <PlaylistAddCheck sx={{ fontSize: 56, mb: 1, opacity: 0.2 }} />
          {isNewPatient ? (
            <>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>No Doctor Requests Yet</Typography>
              <Typography variant="caption" sx={{ mb: 2, display: "block" }}>
                You need to complete an appointment first before your doctor can send you requests.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2, textTransform: "none", fontWeight: 600 }}
                href="/book-appointment"
              >
                Book Your First Appointment
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>No Requests Found</Typography>
              <Typography variant="caption">
                {filter !== "all"
                  ? "Try selecting a different filter."
                  : "Your doctor hasn't sent any requests yet."}
              </Typography>
            </>
          )}
        </Paper>
      ) : (
        filtered.map((order) => (
          <PatientOrderCard key={order.id} order={order} onUpdated={handleOrderUpdated} />
        ))
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
    </PatientLayout>
  );
};

export default PatientOrdersPage;