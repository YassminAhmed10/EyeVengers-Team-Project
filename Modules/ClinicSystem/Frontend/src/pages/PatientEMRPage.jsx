// src/components/PatientMedicalRecord.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  CalendarMonth, Phone, Edit, Description, Science, Visibility,
  LocalHospital, Medication, Assignment, EventNote, AccessTime,
  CheckCircle, HistoryEdu, MedicalServices, Person, Email,
  Home, CreditCard, Badge, Female, Male, PermIdentity
} from '@mui/icons-material';
import { CircularProgress, Alert, Box, Tabs, Tab, Paper, Chip, Grid, Typography } from '@mui/material';
import PatientLayout from '../components/PatientLayout';

// ==================== Helpers ====================
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5201";

function fmtDate(s) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d) || d.getFullYear() < 1900) return null;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(s) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d)) return null;
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtGender(g) {
  if (g === 0 || g === "0" || g === "Male" || g === "male" || g === "M") return "Male";
  if (g === 1 || g === "1" || g === "Female" || g === "female" || g === "F") return "Female";
  return g || "Not specified";
}

function calcAge(dob) {
  if (!dob) return null;
  const b = new Date(dob), t = new Date();
  if (isNaN(b)) return null;
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a > 0 ? a : null;
}

function initials(name = "") {
  return name.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function getPatientIdentifier() {
  return localStorage.getItem("patientIdentifier") || 
         localStorage.getItem("PatientIdentifier") || 
         localStorage.getItem("patientId") || 
         localStorage.getItem("PatientId") || 
         null;
}

function isLoggedIn() {
  return !!(localStorage.getItem("authToken") || localStorage.getItem("token") || localStorage.getItem("isAuthenticated") === "true");
}

// ==================== Tab Components ====================

const InfoCard = ({ title, icon, children }) => (
  <Paper elevation={0} sx={{ borderRadius: "16px", overflow: "hidden", mb: 3, border: "1px solid #e2e8f0" }}>
    <Box sx={{ p: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 1 }}>
      {icon}
      <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e3a5f" }}>{title}</Typography>
    </Box>
    <Box sx={{ p: 2 }}>{children}</Box>
  </Paper>
);

const InfoRow = ({ label, value, icon }) => (
  <Box sx={{ display: "flex", alignItems: "center", py: 1, borderBottom: "1px solid #f1f5f9" }}>
    <Box sx={{ width: 140, display: "flex", alignItems: "center", gap: 1 }}>
      {icon && <Box sx={{ color: "#64748b", fontSize: 16 }}>{icon}</Box>}
      <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569" }}>{label}:</Typography>
    </Box>
    <Typography variant="body2" sx={{ color: value ? "#1e293b" : "#94a3b8", fontStyle: value ? "normal" : "italic" }}>
      {value || "Not recorded"}
    </Typography>
  </Box>
);

const PatientInfoTab = ({ data }) => {
  const genderIcon = data?.gender === "Male" ? <Male fontSize="small" /> : data?.gender === "Female" ? <Female fontSize="small" /> : <Person fontSize="small" />;
  
  return (
    <Box>
      <InfoCard title="Basic Information" icon={<PermIdentity sx={{ color: "#2563eb" }} />}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="Patient ID" value={data?.patientIdentifier} icon="🆔" /></Grid>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="Full Name" value={data?.name} icon="👤" /></Grid>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="Age" value={data?.age ? `${data.age} years` : null} icon="🎂" /></Grid>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="Gender" value={data?.gender} icon={genderIcon} /></Grid>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="Date of Birth" value={fmtDate(data?.birthDate)} icon="📅" /></Grid>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="National ID" value={data?.nationalId} icon="🪪" /></Grid>
        </Grid>
      </InfoCard>

      <InfoCard title="Contact Information" icon={<Phone sx={{ color: "#2563eb" }} />}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}><InfoRow label="Phone Number" value={data?.phone} icon="📞" /></Grid>
          <Grid item xs={12} sm={6}><InfoRow label="Email Address" value={data?.email} icon="✉️" /></Grid>
          <Grid item xs={12}><InfoRow label="Home Address" value={data?.address} icon="🏠" /></Grid>
        </Grid>
      </InfoCard>

      {(data?.insuranceCompany || data?.insuranceId || data?.policyNumber || data?.coverage) && (
        <InfoCard title="Insurance Information" icon={<CreditCard sx={{ color: "#2563eb" }} />}>
          <Grid container spacing={1}>
            {data?.insuranceCompany && <Grid item xs={12} sm={6}><InfoRow label="Insurance Company" value={data.insuranceCompany} icon="🏢" /></Grid>}
            {data?.insuranceId && <Grid item xs={12} sm={6}><InfoRow label="Insurance ID" value={data.insuranceId} icon="🪪" /></Grid>}
            {data?.policyNumber && <Grid item xs={12} sm={6}><InfoRow label="Policy Number" value={data.policyNumber} icon="📄" /></Grid>}
            {data?.coverage && <Grid item xs={12} sm={6}><InfoRow label="Coverage" value={`${data.coverage}%`} icon="💰" /></Grid>}
          </Grid>
        </InfoCard>
      )}

      {(data?.emergencyContactName || data?.emergencyContactPhone) && (
        <InfoCard title="Emergency Contacts" icon={<LocalHospital sx={{ color: "#2563eb" }} />}>
          <Grid container spacing={1}>
            {data?.emergencyContactName && <Grid item xs={12} sm={6}><InfoRow label="Contact Name" value={data.emergencyContactName} icon="👤" /></Grid>}
            {data?.emergencyContactPhone && <Grid item xs={12} sm={6}><InfoRow label="Contact Phone" value={data.emergencyContactPhone} icon="📞" /></Grid>}
          </Grid>
        </InfoCard>
      )}
    </Box>
  );
};

const ComplaintTab = ({ complaints }) => {
  if (!complaints || complaints.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: "16px" }}>
        <MedicalServices sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
        <Typography color="textSecondary">No complaint recorded</Typography>
      </Paper>
    );
  }
  return (
    <Paper elevation={0} sx={{ borderRadius: "16px", overflow: "hidden" }}>
      {complaints.map((c, idx) => (
        <Box key={idx} sx={{ p: 3, borderBottom: idx < complaints.length - 1 ? "1px solid #f0f0f0" : "none" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <MedicalServices sx={{ color: "#ef4444", fontSize: 20 }} />
            <Chip label={fmtDate(c.createdAt) || "No date"} size="small" sx={{ bgcolor: "#fee2e2", color: "#ef4444", fontWeight: 600 }} />
          </Box>
          <Typography sx={{ fontSize: 15, lineHeight: 1.6, color: "#374151", fontStyle: "italic" }}>
            "{c.originalText || c.complaint || c.Complaint}"
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

const HistoryTab = ({ histories }) => {
  if (!histories || histories.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: "16px" }}>
        <HistoryEdu sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
        <Typography color="textSecondary">No medical history recorded</Typography>
      </Paper>
    );
  }

  const historyItems = [
    { key: "chronicDiseases", label: "Chronic Diseases", icon: "🏥", color: "#e53935", bg: "#fce4ec" },
    { key: "currentMedications", label: "Current Medications", icon: "💊", color: "#2e7d32", bg: "#e8f5e9" },
    { key: "allergies", label: "Allergies", icon: "⚠️", color: "#f59e0b", bg: "#fef3c7" },
    { key: "eyeSurgeries", label: "Eye Surgeries", icon: "👁️", color: "#8b5cf6", bg: "#ede9fe" },
    { key: "familyHistory", label: "Family History", icon: "👨‍👩‍👧", color: "#06b6d4", bg: "#cffafe" },
    { key: "visionSymptoms", label: "Vision Symptoms", icon: "👓", color: "#3b82f6", bg: "#dbeafe" },
  ];

  return (
    <Paper elevation={0} sx={{ borderRadius: "16px", overflow: "hidden" }}>
      {histories.map((h, idx) => (
        <Box key={idx} sx={{ p: 2, borderBottom: idx < histories.length - 1 ? "1px solid #f0f0f0" : "none" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, p: 1, bgcolor: "#f8fafc", borderRadius: 1 }}>
            <HistoryEdu sx={{ color: "#2563eb", fontSize: 20 }} />
            <Typography variant="caption" color="textSecondary">Recorded on {fmtDate(h.createdAt) || "Unknown date"}</Typography>
          </Box>
          <Grid container spacing={1}>
            {historyItems.map(item => {
              const value = h[item.key] || h[item.key.charAt(0).toUpperCase() + item.key.slice(1)];
              if (!value) return null;
              return (
                <Grid item xs={12} sm={6} md={4} key={item.key}>
                  <Box sx={{ p: 1.5, bgcolor: item.bg, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: item.color, textTransform: "uppercase" }}>{item.icon} {item.label}</Typography>
                    <Typography variant="body2" sx={{ color: "#1f2937", fontWeight: 500, mt: 0.5 }}>{value}</Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Paper>
  );
};

const EyeExamTab = ({ exams }) => {
  if (!exams || exams.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: "16px" }}>
        <Visibility sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
        <Typography color="textSecondary">No eye examinations recorded</Typography>
      </Paper>
    );
  }

  const eyeFields = [
    { label: "Right Eye (OD)", key: "rightEye", icon: "👁️" },
    { label: "Left Eye (OS)", key: "leftEye", icon: "👁️" },
    { label: "Visual Acuity", key: "visualAcuity", icon: "📊" },
    { label: "Eye Pressure", key: "eyePressure", icon: "📈" },
    { label: "Anterior Segment", key: "anteriorSegment", icon: "🔬" },
    { label: "Fundus / Retina", key: "fundusObservation", icon: "👁️" },
  ];

  return (
    <Paper elevation={0} sx={{ borderRadius: "16px", overflow: "hidden" }}>
      {exams.map((ex, idx) => (
        <Box key={idx}>
          <Box sx={{ bgcolor: "#ecfdf5", p: 1.5, borderBottom: "1px solid #a7f3d0" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#065f46" }}>Examination #{idx + 1}</Typography>
            <Typography variant="caption" sx={{ color: "#059669" }}>{fmtDate(ex.createdAt)}</Typography>
          </Box>
          <Grid container spacing={0}>
            {eyeFields.map(field => {
              const value = ex[field.key] || ex[field.key.charAt(0).toUpperCase() + field.key.slice(1)];
              if (!value) return null;
              return (
                <Grid item xs={12} sm={6} md={4} key={field.key}>
                  <Box sx={{ p: 1.5, borderBottom: "1px solid #f3f4f6", borderRight: "1px solid #f3f4f6" }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#059669", textTransform: "uppercase" }}>{field.icon} {field.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: "#111827", mt: 0.5 }}>{value}</Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Paper>
  );
};

const InvestigationsTab = ({ investigations }) => {
  if (!investigations || investigations.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: "16px" }}>
        <Science sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
        <Typography color="textSecondary">No investigations ordered</Typography>
      </Paper>
    );
  }

  function parseTests(str) {
    try { const parsed = JSON.parse(str || "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: "16px", overflow: "hidden" }}>
      {investigations.map((inv, idx) => {
        const tests = parseTests(inv.selectedInvestigations);
        return (
          <Box key={idx} sx={{ p: 2, borderBottom: idx < investigations.length - 1 ? "1px solid #f0f0f0" : "none", display: "flex", gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#8b5cf6", boxShadow: "0 0 0 3px #ede9fe" }} />
              <Box sx={{ width: 2, flex: 1, bgcolor: "#ede9fe", mt: 0.5, minHeight: 20 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>{fmtDate(inv.createdAt) || "No date"}</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, my: 1 }}>
                {tests.length > 0 ? tests.map((t, ti) => (
                  <Chip key={ti} label={t} size="small" sx={{ bgcolor: "#ede9fe", color: "#5b21b6", fontWeight: 600, fontSize: 11 }} />
                )) : (
                  <Chip label={inv.type || inv.investigationType || "Investigation"} size="small" sx={{ bgcolor: "#ede9fe", color: "#5b21b6" }} />
                )}
              </Box>
              {inv.notes && <Typography variant="body2" sx={{ color: "#6b7280", mt: 1 }}>📝 {inv.notes}</Typography>}
              {inv.result && <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}><strong>Result:</strong> {inv.result}</Typography>}
            </Box>
          </Box>
        );
      })}
    </Paper>
  );
};

const PrescriptionsTab = ({ prescriptions }) => {
  if (!prescriptions || prescriptions.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: "16px" }}>
        <Medication sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
        <Typography color="textSecondary">No prescriptions recorded</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: "16px", overflow: "hidden" }}>
      {prescriptions.map((pres, idx) => {
        const items = pres.items || pres.Items || [];
        if (items.length === 0) return null;
        return items.map((item, itemIdx) => (
          <Box key={`${idx}-${itemIdx}`} sx={{ p: 2, bgcolor: "#f0fdf4", borderBottom: "1px solid #bbf7d0" }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#065f46" }}>{item.drug || item.Drug || item.medication || "Medication"}</Typography>
              {(item.form || item.Form) && <Chip label={item.form || item.Form} size="small" sx={{ bgcolor: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 600 }} />}
            </Box>
            <Grid container spacing={1} sx={{ mb: 1 }}>
              <Grid item xs={4}><Typography variant="caption" sx={{ fontWeight: 600, color: "#16a34a", textTransform: "uppercase" }}>Dose</Typography><Typography variant="body2">{item.dose || item.Dose || "Not specified"}</Typography></Grid>
              <Grid item xs={4}><Typography variant="caption" sx={{ fontWeight: 600, color: "#16a34a", textTransform: "uppercase" }}>Frequency</Typography><Typography variant="body2">{item.frequency || item.Frequency || "Not specified"}</Typography></Grid>
              <Grid item xs={4}><Typography variant="caption" sx={{ fontWeight: 600, color: "#16a34a", textTransform: "uppercase" }}>Duration</Typography><Typography variant="body2">{item.duration || item.Duration || "Not specified"}</Typography></Grid>
            </Grid>
            {(item.notes || item.Notes || pres.notes) && <Box sx={{ bgcolor: "#fff", p: 1, borderRadius: 1, fontSize: 13, color: "#6b7280" }}>📝 {item.notes || item.Notes || pres.notes}</Box>}
          </Box>
        ));
      })}
    </Paper>
  );
};

const OperationsTab = ({ operations }) => {
  if (!operations || operations.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: "16px" }}>
        <LocalHospital sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
        <Typography color="textSecondary">No operations recorded</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: "16px", overflow: "hidden" }}>
      {operations.map((op, idx) => (
        <Box key={idx} sx={{ p: 2, bgcolor: "#fff8f5", borderBottom: "1px solid #fed7aa", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#c2410c" }}>{op.operationName || op.name || op.OperationName || "Operation"}</Typography>
            <Typography variant="caption" sx={{ color: "#78716c" }}>{[op.eye || op.Eye, op.surgeon || op.Surgeon, op.anesthesia].filter(Boolean).join(" · ")}</Typography>
            {(op.notes || op.Notes) && <Typography variant="caption" sx={{ color: "#78716c", display: "block", mt: 0.5 }}>{op.notes || op.Notes}</Typography>}
          </Box>
          <Chip label={fmtDate(op.date || op.Date || op.operationDate || op.createdAt)} size="small" sx={{ bgcolor: "#ffedd5", color: "#f97316", fontWeight: 600 }} />
        </Box>
      ))}
    </Paper>
  );
};

const DiagnosesTab = ({ diagnoses }) => {
  if (!diagnoses || diagnoses.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: "16px" }}>
        <Assignment sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
        <Typography color="textSecondary">No diagnoses recorded</Typography>
      </Paper>
    );
  }

  const severityColors = {
    Mild: { bg: "#dcfce7", color: "#16a34a" },
    Moderate: { bg: "#fef9c3", color: "#a16207" },
    Severe: { bg: "#fee2e2", color: "#dc2626" }
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: "16px", overflow: "hidden" }}>
      {diagnoses.map((dx, idx) => {
        const severity = dx.severity || dx.Severity;
        const sevStyle = severityColors[severity] || { bg: "#f1f5f9", color: "#64748b" };
        return (
          <Box key={idx} sx={{ p: 2, bgcolor: "#faf5ff", borderBottom: "1px solid #e9d5ff", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#4c1d95" }}>{dx.diagnosisName || dx.diagnosis || dx.Diagnosis || "—"}</Typography>
              {(dx.icd10Code || dx.ICD10Code) && <Typography variant="caption" sx={{ color: "#7c3aed" }}>ICD-10: {dx.icd10Code || dx.ICD10Code}</Typography>}
              {(dx.notes || dx.Notes) && <Typography variant="caption" sx={{ color: "#7c3aed", display: "block", mt: 0.5 }}>{dx.notes || dx.Notes}</Typography>}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {severity && <Chip label={severity} size="small" sx={{ bgcolor: sevStyle.bg, color: sevStyle.color, fontWeight: 600 }} />}
              {(dx.status || dx.Status) && <Chip label={dx.status || dx.Status} size="small" sx={{ bgcolor: "#ede9fe", color: "#5b21b6", fontWeight: 600 }} />}
            </Box>
          </Box>
        );
      })}
    </Paper>
  );
};

// ==================== Main Component ====================
export default function PatientMedicalRecord() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [medicalRecordExists, setMedicalRecordExists] = useState(false);
  const [lastModified, setLastModified] = useState(null);

  const patientIdentifier = getPatientIdentifier();
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const tabs = [
    { label: "Patient Info", icon: <Person />, component: PatientInfoTab, dataKey: null },
    { label: "Complaint", icon: <MedicalServices />, component: ComplaintTab, dataKey: "complaints" },
    { label: "History", icon: <HistoryEdu />, component: HistoryTab, dataKey: "histories" },
    { label: "Eye Exam", icon: <Visibility />, component: EyeExamTab, dataKey: "eyeExaminations" },
    { label: "Investigations", icon: <Science />, component: InvestigationsTab, dataKey: "investigations" },
    { label: "Prescriptions", icon: <Medication />, component: PrescriptionsTab, dataKey: "prescriptions" },
    { label: "Operations", icon: <LocalHospital />, component: OperationsTab, dataKey: "operations" },
    { label: "Diagnoses", icon: <Assignment />, component: DiagnosesTab, dataKey: "diagnoses" },
  ];

  // Format medical record data
  const formatMedicalRecordData = useCallback((medicalRecord, appointment) => {
    const patientInfo = medicalRecord || {};
    
    const dbComplaints = patientInfo.complaints || [];
    const complaints = dbComplaints.length > 0
      ? dbComplaints
      : (appointment?.reasonForVisit
          ? [{ complaint: appointment.reasonForVisit, originalText: appointment.reasonForVisit, createdAt: appointment.appointmentDate }]
          : []);

    const dbHistories = patientInfo.histories || [];
    const hasAptHistory = appointment && (
      appointment.chronicDiseases || appointment.currentMedications ||
      appointment.eyeAllergies || appointment.familyEyeDiseases ||
      appointment.visionSymptoms || appointment.eyeSurgeries
    );
    const histories = dbHistories.length > 0
      ? dbHistories
      : (hasAptHistory ? [{
          chronicDiseases: appointment.chronicDiseases || "",
          currentMedications: appointment.currentMedications || "",
          allergies: appointment.eyeAllergies || "",
          familyHistory: appointment.familyEyeDiseases || "",
          eyeSurgeries: appointment.eyeSurgeries || appointment.otherEyeSurgeries || "",
          visionSymptoms: appointment.visionSymptoms || "",
          createdAt: appointment.appointmentDate
        }] : []);

    let gender = patientInfo.gender;
    if (!gender && appointment) {
      gender = appointment.patientGender === 0 ? "Male" : appointment.patientGender === 1 ? "Female" : "";
    }

    return {
      patientIdentifier: patientInfo.patientIdentifier || patientIdentifier,
      name: patientInfo.name || appointment?.patientName || "Patient",
      age: patientInfo.age || calcAge(patientInfo.birthDate || appointment?.patientBirthDate),
      gender: fmtGender(gender),
      phone: patientInfo.phone || patientInfo.contactNumber || appointment?.phone || "",
      email: patientInfo.email || appointment?.email || "",
      address: patientInfo.address || appointment?.address || "",
      birthDate: patientInfo.birthDate || patientInfo.dateOfBirth || appointment?.patientBirthDate || null,
      nationalId: patientInfo.nationalId || appointment?.nationalId || "",
      insuranceCompany: patientInfo.insuranceCompany || appointment?.insuranceCompany || "",
      insuranceId: patientInfo.insuranceId || appointment?.insuranceId || "",
      policyNumber: patientInfo.policyNumber || appointment?.policyNumber || "",
      coverage: patientInfo.coverage || appointment?.coverage || "",
      emergencyContactName: patientInfo.emergencyContactName || appointment?.emergencyContactName || "",
      emergencyContactPhone: patientInfo.emergencyContactPhone || appointment?.emergencyContactPhone || "",
      complaints,
      histories,
      investigations: patientInfo.investigations || [],
      eyeExaminations: patientInfo.eyeExaminations || [],
      operations: patientInfo.operations || [],
      prescriptions: patientInfo.prescriptions || [],
      diagnoses: patientInfo.diagnoses || [],
      medicalTestFiles: patientInfo.medicalTestFiles || [],
      visitDate: patientInfo.visitDate || appointment?.appointmentDate || patientInfo.createdAt,
      lastModified: patientInfo.updatedAt || patientInfo.createdAt
    };
  }, [patientIdentifier]);

  // Format appointment data when no medical record exists
  const formatAppointmentData = useCallback((apt) => {
    let gender = "";
    if (apt.patientGender === 0) gender = "Male";
    else if (apt.patientGender === 1) gender = "Female";
    else if (apt.gender) gender = apt.gender;

    return {
      patientIdentifier: apt.patientId,
      name: apt.patientName || "Patient",
      age: apt.age || calcAge(apt.patientBirthDate),
      gender: fmtGender(gender),
      phone: apt.phone || "",
      email: apt.email || "",
      address: apt.address || "",
      birthDate: apt.patientBirthDate || null,
      nationalId: apt.nationalId || "",
      insuranceCompany: apt.insuranceCompany || "",
      insuranceId: apt.insuranceId || "",
      policyNumber: apt.policyNumber || "",
      coverage: apt.coverage || "",
      emergencyContactName: apt.emergencyContactName || "",
      emergencyContactPhone: apt.emergencyContactPhone || "",
      complaints: apt.reasonForVisit ? [{ complaint: apt.reasonForVisit, originalText: apt.reasonForVisit, createdAt: apt.appointmentDate }] : [],
      histories: (apt.chronicDiseases || apt.currentMedications || apt.eyeAllergies || apt.familyEyeDiseases || apt.visionSymptoms || apt.eyeSurgeries) ? [{
        chronicDiseases: apt.chronicDiseases || "",
        currentMedications: apt.currentMedications || "",
        allergies: apt.eyeAllergies || "",
        familyHistory: apt.familyEyeDiseases || "",
        eyeSurgeries: apt.eyeSurgeries || apt.otherEyeSurgeries || "",
        visionSymptoms: apt.visionSymptoms || "",
        createdAt: apt.appointmentDate
      }] : [],
      investigations: [],
      eyeExaminations: [],
      operations: apt.eyeSurgeries ? [{ OperationName: apt.eyeSurgeries, Date: apt.appointmentDate, Notes: apt.otherEyeSurgeries || "", CreatedAt: apt.appointmentDate }] : [],
      prescriptions: apt.currentMedications ? [{ Instructions: apt.currentMedications, PrescriptionDate: apt.appointmentDate, CreatedAt: apt.appointmentDate, Items: [] }] : [],
      diagnoses: [],
      medicalTestFiles: [],
      visitDate: apt.appointmentDate,
      lastModified: apt.createdAt
    };
  }, []);

  // Main data fetching
  const fetchPatientData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const idToUse = patientIdentifier;
      console.log("[PatientMedicalRecord] Fetching for patient ID:", idToUse);

      if (!idToUse) {
        throw new Error("No patient identifier found");
      }

      let checkResult = { exists: false, recordId: null };
      try {
        const response = await axios.get(`${API_BASE}/api/MedicalRecord/check/${encodeURIComponent(idToUse)}`, { headers });
        checkResult = response.data;
      } catch (err) {
        console.warn("Could not check medical record:", err);
      }

      setMedicalRecordExists(checkResult.exists);

      let appointmentData = null;
      let medicalRecordData = null;

      try {
        const response = await axios.get(`${API_BASE}/api/MedicalRecord/appointment-info/${encodeURIComponent(idToUse)}`, { headers });
        appointmentData = response.data;
        console.log("[PatientMedicalRecord] Appointment info:", appointmentData);
      } catch (err) {
        console.warn("Could not load appointment info:", err);
      }

      if (checkResult.exists && checkResult.recordId) {
        try {
          const response = await axios.get(`${API_BASE}/api/MedicalRecord/patient/${encodeURIComponent(idToUse)}`, { headers });
          medicalRecordData = response.data;
        } catch (err) {
          console.warn("Could not load medical record:", err);
        }
      }

      let formattedData;
      if (medicalRecordData) {
        formattedData = formatMedicalRecordData(medicalRecordData, appointmentData);
        setLastModified(medicalRecordData.updatedAt || medicalRecordData.createdAt);
      } else if (appointmentData) {
        formattedData = formatAppointmentData(appointmentData);
        setLastModified(appointmentData.createdAt || appointmentData.appointmentDate);
      } else {
        throw new Error("No data found for patient");
      }

      setPatientData(formattedData);

    } catch (err) {
      console.error("[PatientMedicalRecord] Error:", err);
      setError(err.message || "Failed to load medical record");
      setPatientData({
        patientIdentifier,
        name: localStorage.getItem("userName") || "Patient",
        complaints: [],
        histories: [],
        investigations: [],
        eyeExaminations: [],
        operations: [],
        prescriptions: [],
        diagnoses: [],
        medicalTestFiles: []
      });
    } finally {
      setLoading(false);
    }
  }, [patientIdentifier, headers, formatMedicalRecordData, formatAppointmentData]);

  useEffect(() => {
    if (!isLoggedIn() && !patientIdentifier) {
      navigate("/login");
      return;
    }
    fetchPatientData();
  }, [patientIdentifier, navigate, fetchPatientData]);

  if (loading) {
    return (
      <PatientLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
          <Typography sx={{ ml: 2, color: "#64748b" }}>Loading your medical record...</Typography>
        </Box>
      </PatientLayout>
    );
  }

  if (error && !patientData?.name) {
    return (
      <PatientLayout>
        <Box p={4}>
          <Alert severity="error">{error}</Alert>
          <button onClick={() => navigate("/patient")} style={{ marginTop: 16, padding: "8px 16px" }}>Go Back</button>
        </Box>
      </PatientLayout>
    );
  }

  const CurrentTabComponent = tabs[tabValue].component;
  const currentDataKey = tabs[tabValue].dataKey;
  const tabData = currentDataKey ? patientData?.[currentDataKey] : patientData;

  return (
    <PatientLayout>
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f0f4f8", pt: 2 }}>

        {/* Header - Same style as EMRPage */}
        <Box sx={{ 
          background: "linear-gradient(135deg, #1e3a5f 0%, #29b6f6 100%)",
          color: "white",
          p: "24px 30px",
          borderRadius: "16px",
          mb: 3,
          mx: 2,
          boxShadow: "0 4px 16px rgba(30, 58, 95, 0.2)"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Box sx={{
              width: "52px", height: "52px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid rgba(255,255,255,0.35)"
            }}>
              <Person sx={{ fontSize: 30, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "0.3px" }}>
                {patientData?.name || "Patient"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px", mt: "6px", fontSize: "13px", opacity: 0.9 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Badge sx={{ fontSize: 14 }} />
                  ID: {patientIdentifier || "—"}
                </Box>
                {patientData?.gender && patientData.gender !== "Not specified" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: "5px", borderLeft: "1px solid rgba(255,255,255,0.35)", pl: "12px" }}>
                    {patientData.gender === "Male" ? <Male sx={{ fontSize: 14 }} /> : <Female sx={{ fontSize: 14 }} />} {patientData.gender}
                  </Box>
                )}
                {patientData?.age && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: "5px", borderLeft: "1px solid rgba(255,255,255,0.35)", pl: "12px" }}>
                    🎂 {patientData.age} years
                  </Box>
                )}
                {patientData?.visitDate && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: "5px", borderLeft: "1px solid rgba(255,255,255,0.35)", pl: "12px" }}>
                    <EventNote sx={{ fontSize: 14 }} />
                    {fmtDate(patientData.visitDate)}
                  </Box>
                )}
              </Box>
              {lastModified && (
                <Box sx={{ display: "flex", alignItems: "center", gap: "5px", mt: "8px", fontSize: "11px", opacity: 0.7, borderLeft: "1px solid rgba(255,255,255,0.35)", pl: "12px" }}>
                  <Edit sx={{ fontSize: 14 }} />
                  Last updated: {fmtDateTime(lastModified)}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ maxWidth: "1200px", margin: "0 auto", p: "0 16px 48px" }}>
          <Paper elevation={3} sx={{ borderRadius: "20px", overflow: "hidden" }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "white",
                "& .MuiTab-root": { textTransform: "none", minHeight: 56, fontSize: 14, fontWeight: 500 }
              }}
            >
              {tabs.map((tab, idx) => (
                <Tab key={idx} icon={tab.icon} label={tab.label} iconPosition="start" />
              ))}
            </Tabs>

            <Box sx={{ p: 3 }}>
              <CurrentTabComponent data={tabData} />
            </Box>
          </Paper>

          {!medicalRecordExists && (
            <Box sx={{ mt: 3, p: 2, bgcolor: "#fff3cd", borderRadius: 2, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#856404" }}>
                <strong>ℹ️ Note:</strong> Your complete medical record is being prepared. Current data is from your appointment records.
                Once your doctor completes your medical record, all information will appear here automatically.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </PatientLayout>
  );
}