// DoctorOrdersTab.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Card, CardContent, Chip, Divider,
  Alert, Snackbar, CircularProgress, Collapse, IconButton, Grid,
} from "@mui/material";
import {
  Science, Visibility, Medication, Send, CheckCircle,
  ExpandMore, ExpandLess, LocalHospital, Storefront,
  LocalPharmacy, Warning, History,
} from "@mui/icons-material";
import axios from "axios";

const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5201/api";

// ── Token ─────────────────────────────────────────────────────────────────────
const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("accessToken") || "";

// ── Normalize to P-XXXXXX format ─────────────────────────────────────────────
const toPatientIdentifier = (raw) => {
  if (!raw) return null;
  const s = String(raw).trim();
  if (/^P-/i.test(s)) return s.toUpperCase();
  // If numeric, wrap with P-
  if (/^\d+$/.test(s)) return `P-${s}`;
  return s;
};

// ── Auth token ────────────────────────────────────────────────────────────────
  localStorage.getItem("authToken") ||
  localStorage.getItem("accessToken") || "";

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CFG = {
  investigation: {
    label: "Radiology Investigation",
    bigIcon: <Science sx={{ fontSize: 28 }} />,
    color: "#1e3a5f",
    bg: "#e8f0fe",
    destination: "Radiology Center",
    destIcon: <LocalHospital fontSize="small" />,
  },
  eyeExam: {
    label: "Vision / Eye Exam",
    bigIcon: <Visibility sx={{ fontSize: 28 }} />,
    color: "#2e7d32",
    bg: "#e8f5e9",
    destination: "Glass Store",
    destIcon: <Storefront fontSize="small" />,
  },
  prescription: {
    label: "Medication Order",
    bigIcon: <Medication sx={{ fontSize: 28 }} />,
    color: "#e65100",
    bg: "#fff3e0",
    destination: "Pharmacy",
    destIcon: <LocalPharmacy fontSize="small" />,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const parseData = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch { return {}; }
};

const normalizeTests = (tests) => {
  if (Array.isArray(tests)) return tests.map(String).filter(Boolean);
  if (typeof tests === "string") {
    try {
      const p = JSON.parse(tests);
      if (Array.isArray(p)) return p.map(String).filter(Boolean);
    } catch {}
    return tests.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

// ── Build orders from DB data (existing records) ──────────────────────────────
const buildOrders = (investigations, eyeExaminations, prescriptions) => {
  const orders = { investigation: [], eyeExam: [], prescription: [] };

  // Investigations
  (Array.isArray(investigations) ? investigations : []).forEach((inv) => {
    let tests = normalizeTests(
      inv.selectedInvestigations
        ? (() => { try { return JSON.parse(inv.selectedInvestigations); } catch { return []; } })()
        : []
    );
    if (tests.length === 0) return;
    orders.investigation.push({
      type: "investigation",
      id: inv.id || inv.createdAt || Math.random().toString(36).slice(2),
      requestName: tests.join(", "),
      data: {
        selectedTests: tests,
        priority: inv.priority || "Routine",
        notes: inv.notes || "",
        createdAt: inv.createdAt,
      },
      createdAt: new Date(inv.createdAt || Date.now()),
    });
  });

  // Eye Examinations
  (Array.isArray(eyeExaminations) ? eyeExaminations : []).forEach((exam) => {
    if (!exam.rightEye && !exam.leftEye && !exam.eyePressure) return;
    orders.eyeExam.push({
      type: "eyeExam",
      id: exam.id || Math.random().toString(36).slice(2),
      requestName: "Eye Examination",
      data: {
        rightEye: { visualAcuity: exam.rightEye || "", eyePressure: exam.eyePressure || "" },
        leftEye:  { visualAcuity: exam.leftEye  || "" },
        pupilReaction:    exam.pupilReaction    || "",
        eyeAlignment:     exam.eyeAlignment     || "",
        anteriorSegment:  exam.anteriorSegment  || "",
        fundusObservation: exam.fundusObservation || "",
        notes: exam.otherNotes || exam.notes || "",
        createdAt: exam.createdAt,
      },
      createdAt: new Date(exam.createdAt || Date.now()),
    });
  });

  // Prescriptions
  const allItems = [];
  (Array.isArray(prescriptions) ? prescriptions : []).forEach((p) => {
    const items = p.items || p.Items;
    if (items && Array.isArray(items)) {
      items.forEach((item) => allItems.push({ ...item, createdAt: p.createdAt }));
    } else if (p.drug || p.Drug) {
      allItems.push({ ...p });
    }
  });

  allItems
    .filter((p) => p.drug || p.Drug || p.medication)
    .forEach((item, idx) => {
      orders.prescription.push({
        type: "prescription",
        id: `rx-${idx}-${item.createdAt || Date.now()}`,
        requestName: item.drug || item.Drug || "Medication",
        data: {
          items: [{
            drug:      item.drug      || item.Drug      || item.medication || "",
            form:      item.form      || item.Form      || "",
            dose:      item.dose      || item.Dose      || item.dosage     || item.customDose || "",
            frequency: item.frequency || item.Frequency || item.customFrequency || "",
            duration:  item.duration  || item.Duration  || "",
            notes:     item.notes     || item.Notes     || "",
          }],
          createdAt: item.createdAt,
        },
        createdAt: new Date(item.createdAt || Date.now()),
      });
    });

  // Sort newest first
  Object.keys(orders).forEach((t) =>
    orders[t].sort((a, b) => b.createdAt - a.createdAt)
  );

  return orders;
};

// ── Order card (pending — not yet sent) ───────────────────────────────────────
const OrderCard = ({ order, onSend, sending }) => {
  const [expanded, setExpanded] = useState(true);
  const cfg = TYPE_CFG[order.type];

  return (
    <Card variant="outlined" sx={{
      mb: 1.5, borderLeft: `4px solid ${cfg.color}`, borderRadius: 1,
      "&:hover": { boxShadow: 2 },
    }}>
      <CardContent sx={{ pb: "12px !important" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: cfg.color, mb: 0.5 }}>
              {order.requestName || cfg.label}
            </Typography>
            {formatDate(order.data?.createdAt) && (
              <Typography variant="caption" sx={{ color: "#666", display: "block" }}>
                {formatDate(order.data.createdAt)}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
            <Button
              variant="contained" size="small"
              startIcon={sending ? <CircularProgress size={14} color="inherit" /> : <Send />}
              onClick={() => onSend(order)}
              disabled={!!sending}
              sx={{ bgcolor: cfg.color, fontWeight: 700, fontSize: "0.75rem" }}
            >
              {sending ? "Sending…" : "Send to Patient"}
            </Button>
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ my: 1 }} />
          {order.type === "investigation" && (
            <Box>
              {order.data.selectedTests?.length > 0 && (
                <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                  <strong>Tests:</strong> {order.data.selectedTests.join(", ")}
                </Typography>
              )}
              <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                <strong>Priority:</strong> {order.data.priority}
              </Typography>
              {order.data.notes && (
                <Typography variant="caption" sx={{ display: "block" }}>
                  <strong>Notes:</strong> {order.data.notes}
                </Typography>
              )}
            </Box>
          )}
          {order.type === "eyeExam" && (
            <Box>
              {order.data.rightEye?.visualAcuity && (
                <Typography variant="caption" sx={{ display: "block", mb: 0.3 }}>
                  <strong>Right Eye:</strong> VA {order.data.rightEye.visualAcuity}
                  {order.data.rightEye.eyePressure ? ` · Pressure ${order.data.rightEye.eyePressure}` : ""}
                </Typography>
              )}
              {order.data.leftEye?.visualAcuity && (
                <Typography variant="caption" sx={{ display: "block", mb: 0.3 }}>
                  <strong>Left Eye:</strong> VA {order.data.leftEye.visualAcuity}
                </Typography>
              )}
              {order.data.pupilReaction && (
                <Typography variant="caption" sx={{ display: "block", mb: 0.3 }}>
                  <strong>Pupils:</strong> {order.data.pupilReaction}
                </Typography>
              )}
              {order.data.notes && (
                <Typography variant="caption" sx={{ display: "block" }}>
                  <strong>Notes:</strong> {order.data.notes}
                </Typography>
              )}
            </Box>
          )}
          {order.type === "prescription" && (
            <Box>
              {(order.data.items || []).map((item, i) => (
                <Box key={i}>
                  <Typography variant="caption" sx={{ display: "block", fontWeight: 700, mb: 0.3 }}>
                    {item.drug}{item.form ? ` (${item.form})` : ""}
                  </Typography>
                  {(item.dose || item.frequency) && (
                    <Typography variant="caption" sx={{ display: "block", mb: 0.3 }}>
                      {[item.dose, item.frequency, item.duration].filter(Boolean).join(" · ")}
                    </Typography>
                  )}
                  {item.notes && (
                    <Typography variant="caption" sx={{ display: "block", color: "#666" }}>
                      {item.notes}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

// ── History entry (already sent to DB) ───────────────────────────────────────
const HistoryEntry = ({ order }) => {
  const cfg = TYPE_CFG[order.type];
  const statusColor =
    order.status === "Accepted" || order.status === "Booked" ? "#2e7d32" :
    order.status === "Rejected" ? "#d32f2f" : "#ff9800";

  return (
    <Card variant="outlined" sx={{ mb: 1, borderLeft: `3px solid ${statusColor}`, borderRadius: 1, opacity: 0.85 }}>
      <CardContent sx={{ pb: "10px !important" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>
              {order.requestName || cfg.label}
            </Typography>
            {formatDate(order.createdAt) && (
              <Typography variant="caption" sx={{ color: "#666", fontSize: "0.72rem" }}>
                {formatDate(order.createdAt)}
              </Typography>
            )}
          </Box>
          <Chip
            label={order.status || "Pending"}
            size="small"
            sx={{ bgcolor: statusColor, color: "#fff", fontWeight: 600, fontSize: "0.7rem" }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// ── Column per order type ─────────────────────────────────────────────────────
const OrdersColumn = ({ type, pendingOrders, historyOrders, onSend, sending }) => {
  const cfg = TYPE_CFG[type];
  const [historyOpen, setHistoryOpen] = useState(true);
  const isEmpty = pendingOrders.length === 0 && historyOrders.length === 0;

  return (
    <Box sx={{ flex: 1, minWidth: 280 }}>
      <Box sx={{ p: 2, bgcolor: cfg.bg, borderRadius: 2, border: `1px solid ${cfg.color}20` }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Box sx={{ color: cfg.color }}>{cfg.bigIcon}</Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: cfg.color, fontSize: "1rem" }}>
            {cfg.label}
          </Typography>
        </Box>

        {isEmpty && (
          <Typography variant="caption" sx={{ color: "#999" }}>No data yet</Typography>
        )}

        {/* Pending orders */}
        {pendingOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onSend={onSend}
            sending={sending === order.id ? order.id : null}
          />
        ))}

        {/* History */}
        {historyOrders.length > 0 && (
          <>
            <Box
              onClick={() => setHistoryOpen(!historyOpen)}
              sx={{
                display: "flex", alignItems: "center", gap: 0.75,
                mt: pendingOrders.length ? 1.5 : 0, mb: 1,
                pb: 0.75, borderBottom: `1px solid ${cfg.color}30`,
                cursor: "pointer", userSelect: "none",
                "&:hover": { opacity: 0.8 },
              }}
            >
              <History fontSize="small" sx={{ color: cfg.color }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: cfg.color, flex: 1, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Sent Orders
              </Typography>
              <Chip label={historyOrders.length} size="small"
                sx={{ height: 18, fontWeight: 700, bgcolor: cfg.color, color: "#fff", fontSize: "0.65rem" }} />
              <IconButton size="small" sx={{ p: 0, color: cfg.color }}>
                {historyOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </IconButton>
            </Box>
            <Collapse in={historyOpen}>
              {historyOrders.map((order) => (
                <HistoryEntry key={order.id} order={order} />
              ))}
            </Collapse>
          </>
        )}
      </Box>
    </Box>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const DoctorOrdersTab = ({
  patientId,
  medicalRecordId,
  investigations,
  eyeExaminations,
  prescriptions,
  navigate,
}) => {
  const [ordersGrouped, setOrdersGrouped] = useState({ investigation: [], eyeExam: [], prescription: [] });
  const [historyOrders, setHistoryOrders] = useState({ investigation: [], eyeExam: [], prescription: [] });
  const [sentIds,  setSentIds]  = useState(new Set());
  const [sending,  setSending]  = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // ── Fetch history from DB ────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    if (!medicalRecordId) return;
    try {
      const token = getToken();
      const headers = token
        ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        : { "Content-Type": "application/json" };

      const { data } = await axios.get(
        `${BASE_URL}/DoctorOrders/ByMedicalRecord/${medicalRecordId}`,
        { headers }
      );

      if (!Array.isArray(data)) return;

      const history = { investigation: [], eyeExam: [], prescription: [] };
      data.forEach((order) => {
        const d = parseData(order.dataJson || order.data);
        const entry = {
          type:        order.orderType,
          id:          `db-${order.id}`,
          dbId:        order.id,
          requestName: d.requestName || d.selectedTests?.join(", ") || d.drug ||
                       (order.orderType === "eyeExam" ? "Eye Examination" : order.orderType),
          data:        d,
          createdAt:   new Date(order.createdAt),
          status:      order.status,
        };
        if (history[order.orderType]) history[order.orderType].push(entry);
      });

      Object.keys(history).forEach((t) =>
        history[t].sort((a, b) => b.createdAt - a.createdAt)
      );
      setHistoryOrders(history);
    } catch (err) {
        }
  }, [medicalRecordId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── Build pending orders from props ──────────────────────────────────────
  useEffect(() => {
    setOrdersGrouped(buildOrders(investigations, eyeExaminations, prescriptions));
  }, [investigations, eyeExaminations, prescriptions]);

  // ── Send one order ────────────────────────────────────────────────────────
  const handleSend = async (order) => {
    // Validate IDs before sending
    const pid = toPatientIdentifier(patientId);
    const mid = parseInt(String(medicalRecordId).replace(/\D/g,""), 10) || null;

    if (!pid || pid.length < 3) {
      setSnackbar({ open: true, message: "Invalid patient ID. Please reload the page.", severity: "error" });
      return;
    }
    if (!mid || isNaN(mid)) {
      setSnackbar({ open: true, message: "Invalid medical record ID. Please reload the page.", severity: "error" });
      return;
    }

    setSending(order.id);
    try {
      const token = getToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const payload = {
        patientId:       pid,
        medicalRecordId: mid,
        orderType:       order.type,
        data:            order.data,
      };

      await axios.post(`${BASE_URL}/DoctorOrders`, payload, { headers });

      setSentIds((prev) => new Set([...prev, order.id]));
      setTimeout(fetchHistory, 600);

      if (window.refreshPatientNotifications) {
        setTimeout(() => window.refreshPatientNotifications(), 800);
      }

      setSnackbar({
        open: true,
        message: `✓ ${TYPE_CFG[order.type].label} sent to patient!`,
        severity: "success",
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to send order.";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setSending(null);
    }
  };

  const hasAnything =
    Object.values(ordersGrouped).some((a) => a.length > 0) ||
    Object.values(historyOrders).some((a) => a.length > 0);

  return (
    <Box>
      {!hasAnything && (
        <Box sx={{ textAlign: "center", py: 7, color: "#aaa" }}>
          <Warning sx={{ fontSize: 52, opacity: 0.25 }} />
          <Typography variant="body1" sx={{ mt: 1 }}>
            No saved data to create orders from yet.
          </Typography>
          <Typography variant="caption">
            Fill in the Investigations, Eye Exam, or Prescription tabs first.
          </Typography>
        </Box>
      )}

      {hasAnything && (
        <Grid container spacing={2}>
          {(["investigation", "eyeExam", "prescription"]).map((type) => (
               <Grid item xs={12} md={6} lg={4} key={type}>              <OrdersColumn
                type={type}
                pendingOrders={ordersGrouped[type].filter((o) => !sentIds.has(o.id))}
                historyOrders={historyOrders[type]}
                onSend={handleSend}
                sending={sending}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          action={
            snackbar.severity === "success" && navigate ? (
              <Button color="inherit" size="small" onClick={() => navigate("/patient/orders")} sx={{ fontWeight: 700 }}>
                View Patient Orders →
              </Button>
            ) : undefined
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorOrdersTab;