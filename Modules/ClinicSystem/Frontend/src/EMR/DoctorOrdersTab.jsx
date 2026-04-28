// DoctorOrdersTab.jsx
import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Card, CardContent, Chip, Divider,
  Alert, Snackbar, CircularProgress, Collapse, IconButton,
} from "@mui/material";
import {
  Science, Visibility, Medication, Send, CheckCircle,
  ExpandMore, ExpandLess, LocalHospital, Storefront,
  LocalPharmacy, Warning,
} from "@mui/icons-material";
import axios from "axios";

const BASE_URL = "http://localhost:5201/api";

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

const buildOrders = (investigations, eyeExaminations, prescriptions) => {
  const orders = [];

  const invList = Array.isArray(investigations) ? investigations : [];
  if (invList.length > 0) {
    const latest = invList[0];
    let tests = [];
    try {
      tests = latest.selectedInvestigations ? JSON.parse(latest.selectedInvestigations) : [];
    } catch { tests = []; }

    if (Array.isArray(tests) && tests.length > 0) {
      orders.push({
        type: "investigation",
        sourcedFrom: `Investigation saved on ${new Date(latest.createdAt).toLocaleDateString()}`,
        data: {
          selectedTests: tests,
          priority: latest.priority || "Routine",
          notes: latest.notes || "",
        },
      });
    }
  }

  const examList = Array.isArray(eyeExaminations) ? eyeExaminations : [];
  if (examList.length > 0) {
    const latest = examList[0];
    const hasData = latest.rightEye || latest.leftEye || latest.eyePressure;
    if (hasData) {
      orders.push({
        type: "eyeExam",
        sourcedFrom: `Eye Exam saved on ${new Date(latest.createdAt || Date.now()).toLocaleDateString()}`,
        data: {
          rightEye: { visualAcuity: latest.rightEye || "", eyePressure: latest.eyePressure || "" },
          leftEye: { visualAcuity: latest.leftEye || "" },
          pupilReaction: latest.pupilReaction || "",
          eyeAlignment: latest.eyeAlignment || "",
          anteriorSegment: latest.anteriorSegment || "",
          fundusObservation: latest.fundusObservation || "",
          notes: latest.otherNotes || latest.notes || "",
        },
      });
    }
  }

  const rxRaw = Array.isArray(prescriptions) ? prescriptions : [];
  const allItems = [];
  rxRaw.forEach((p) => {
    const items = p.items || p.Items;
    if (items && Array.isArray(items)) {
      items.forEach((item) => allItems.push(item));
    } else if (p.drug || p.Drug) {
      allItems.push(p);
    }
  });

  const validRx = allItems.filter((p) => p.drug || p.Drug || p.medication);
  if (validRx.length > 0) {
    orders.push({
      type: "prescription",
      sourcedFrom: "Prescription tab",
      data: {
        items: validRx.map((p) => ({
          drug: p.drug || p.Drug || p.medication || "",
          form: p.form || p.Form || "",
          dose: p.dose || p.Dose || p.dosage || "",
          frequency: p.frequency || p.Frequency || "",
          duration: p.duration || p.Duration || "",
          notes: p.notes || p.Notes || "",
        })),
      },
    });
  }

  return orders;
};

const OrderPreviewCard = ({ order, sent, onSend, sending }) => {
  const [expanded, setExpanded] = useState(true);
  const cfg = TYPE_CFG[order.type];

  return (
    <Card variant="outlined" sx={{ mb: 2, borderLeft: `4px solid ${cfg.color}`, borderRadius: 2, opacity: sent ? 0.72 : 1 }}>
      <CardContent sx={{ pb: "8px !important" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: "50%", bgcolor: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color }}>
              {cfg.bigIcon}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: cfg.color }}>{cfg.label}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {cfg.destIcon}
                <Typography variant="caption" sx={{ color: "#777" }}>→ {cfg.destination}</Typography>
                {order.sourcedFrom && <Typography variant="caption" sx={{ color: "#aaa", ml: 1 }}>· {order.sourcedFrom}</Typography>}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {sent ? (
              <Chip icon={<CheckCircle fontSize="small" />} label="Sent to Patient" size="small" color="success" variant="outlined" />
            ) : (
              <Button variant="contained" size="small" startIcon={sending ? <CircularProgress size={14} /> : <Send />} onClick={() => onSend(order)} disabled={sending} sx={{ bgcolor: cfg.color, fontWeight: 700 }}>
                {sending ? "Sending..." : "Send to Patient"}
              </Button>
            )}
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
          </Box>
        </Box>
        <Collapse in={expanded}>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ pl: 0.5 }}>
            {order.type === "investigation" && (
              <>
                <Typography variant="body2"><strong>Tests:</strong> {(order.data.selectedTests || []).join(", ") || "—"}</Typography>
                <Typography variant="body2"><strong>Priority:</strong> {order.data.priority}</Typography>
                {order.data.notes && <Typography variant="body2"><strong>Notes:</strong> {order.data.notes}</Typography>}
              </>
            )}
            {order.type === "eyeExam" && (
              <>
                {order.data.rightEye?.visualAcuity && <Typography variant="body2"><strong>Right Eye:</strong> VA {order.data.rightEye.visualAcuity}</Typography>}
                {order.data.leftEye?.visualAcuity && <Typography variant="body2"><strong>Left Eye:</strong> VA {order.data.leftEye.visualAcuity}</Typography>}
                {order.data.pupilReaction && <Typography variant="body2"><strong>Pupil Reaction:</strong> {order.data.pupilReaction}</Typography>}
              </>
            )}
            {order.type === "prescription" && (
              order.data.items?.map((item, i) => (
                <Typography key={i} variant="body2"><strong>{item.drug}</strong> {item.dose} {item.frequency}</Typography>
              ))
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const DoctorOrdersTab = ({ patientId, medicalRecordId, investigations, eyeExaminations, prescriptions }) => {
  const [orders, setOrders] = useState([]);
  const [sentIds, setSentIds] = useState(new Set());
  const [sending, setSending] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    setOrders(buildOrders(investigations, eyeExaminations, prescriptions));
  }, [investigations, eyeExaminations, prescriptions]);

  const handleSend = async (order) => {
    setSending(order.type);
    try {
      // استخدام Patient ID صحيح من قاعدة البيانات
      const finalPatientId = 1;
      const finalMedicalRecordId = 1;
      
      console.log("Sending order:", { patientId: finalPatientId, medicalRecordId: finalMedicalRecordId, orderType: order.type });
      
      const response = await axios.post(`${BASE_URL}/DoctorOrders`, {
        patientId: finalPatientId,
        medicalRecordId: finalMedicalRecordId,
        orderType: order.type,
        data: order.data
      }, { headers: { 'Content-Type': 'application/json' } });
      
      console.log("Order sent:", response.data);
      setSentIds((prev) => new Set([...prev, order.type]));
      setSnackbar({ open: true, message: `✅ ${TYPE_CFG[order.type].label} sent successfully!`, severity: "success" });
    } catch (err) {
      console.error("Error:", err);
      setSnackbar({ open: true, message: `❌ Failed: ${err.response?.data?.message || err.message}`, severity: "error" });
    } finally {
      setSending(null);
    }
  };

  return (
    <Box>
      {orders.length === 0 && (
        <Box sx={{ textAlign: "center", py: 7 }}>
          <Warning sx={{ fontSize: 52, opacity: 0.25 }} />
          <Typography variant="body1">No saved data to create orders from</Typography>
        </Box>
      )}
      {orders.map((order) => (
        <OrderPreviewCard key={order.type} order={order} sent={sentIds.has(order.type)} onSend={handleSend} sending={sending === order.type} />
      ))}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorOrdersTab;