// src/components/PatientMedicalRecord.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PatientMedicalRecord.css";

// ─── SVG Icons ───────────────────────────────────────────────
const Ic = {
  User:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  Id:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10h.01M8 14h8M12 10h4"/></svg>,
  Calendar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Phone:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.72-3.11 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Email:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Home:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  Shield:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Alert:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Doc:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
  Clock:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Flask:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v6l-4 9a1 1 0 0 0 .9 1.5h14.2a1 1 0 0 0 .9-1.5L14 8V2"/><line x1="6" y1="2" x2="18" y2="2"/></svg>,
  Eye:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Img:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>,
  Heart:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Pill:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Search:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Wc:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="4" r="2"/><circle cx="16.5" cy="4" r="2"/><path d="M5.5 10h4l1 10H5.5L6.5 10zM14.5 10h4l-1 10h-3l-1-10z"/></svg>,
  Back:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>,
  ChevUp:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18,15 12,9 6,15"/></svg>,
  ChevDn:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 12,15 18,9"/></svg>,
};

const TABS = [
  { id: "patient-info",   label: "Patient Info",   Icon: Ic.User   },
  { id: "complaint",      label: "Complaint",      Icon: Ic.Doc    },
  { id: "history",        label: "History",        Icon: Ic.Clock  },
  { id: "investigations", label: "Investigations", Icon: Ic.Flask  },
  { id: "eye-exam",       label: "Eye Exam",       Icon: Ic.Eye    },
  { id: "images",         label: "Images",         Icon: Ic.Img    },
  { id: "operations",     label: "Operations",     Icon: Ic.Heart  },
  { id: "prescriptions",  label: "Prescription",   Icon: Ic.Pill   },
  { id: "diagnoses",      label: "Diagnoses",      Icon: Ic.Search },
];

const RECORD_KEY = {
  complaint: "complaints", history: "histories",
  investigations: "investigations", "eye-exam": "eyeExaminations",
  images: "medicalTestFiles", operations: "operations",
  prescriptions: "prescriptions", diagnoses: "diagnoses",
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5201";

// ─── Get the PatientIdentifier (e.g. P-532756) — the ONE true ID ─────────────
// Priority:
//   1. localStorage "patientIdentifier"  (set at login if available)
//   2. localStorage "patientId" if it looks like P-XXXXXX
//   3. Fall back to numeric patientId for the check endpoint
function getPatientIdentifier() {
  // Explicit P-XXXXXX style identifier saved at login
  const pi = localStorage.getItem("patientIdentifier") ||
             localStorage.getItem("PatientIdentifier");
  if (pi) return pi;

  // patientId that already looks like P-XXXXXX
  const pid = localStorage.getItem("patientId") ||
              localStorage.getItem("PatientId");
  if (pid && /^P-/i.test(String(pid).trim())) return pid.trim();

  // Numeric fallback (will be used with check endpoint)
  return pid || null;
}

function getNumericPatientId() {
  const raw = localStorage.getItem("patientId") ||
              localStorage.getItem("PatientId") ||
              localStorage.getItem("patient_id");
  if (!raw) return null;
  const n = parseInt(String(raw).replace(/\D/g, ""), 10);
  return isNaN(n) ? null : n;
}

function isLoggedIn() {
  return !!(
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("isAuthenticated") === "true"
  );
}

function initials(name = "") {
  return name.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function fmtDate(s) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d) || d.getFullYear() < 1900) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(s) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d) || d.getFullYear() < 1900) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── UI helpers ───────────────────────────────────────────────
function Field({ label, value, Icon, color }) {
  return (
    <div className="pmr-field">
      {label && <div className="pmr-field-label">{label}</div>}
      <div className={`pmr-field-value${color ? " " + color : ""}`}>
        {Icon && <span className="pmr-fv-icon"><Icon /></span>}
        <span>{value || "—"}</span>
      </div>
    </div>
  );
}

function ColTitle({ Icon, label }) {
  return (
    <div className="pmr-col-title">
      <span className="pmr-col-title-icon"><Icon /></span>
      {label}
    </div>
  );
}

function Stamp({ date }) {
  return <div className="pmr-record-timestamp">{fmtDateTime(date)}</div>;
}

function Empty({ Icon }) {
  return (
    <div className="pmr-empty">
      <div className="pmr-empty-icon">{Icon && <Icon />}</div>
      <p>No data recorded for this section.</p>
      <small>Your doctor has not added any entries yet.</small>
    </div>
  );
}

// ─── Patient info block ───────────────────────────────────────
function PatientInfoBlock({ d }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="pmr-info-block">
      <div className="pmr-info-block-header" onClick={() => setOpen(o => !o)}>
        <div className="pmr-info-block-title">
          <span className="pmr-info-block-icon"><Ic.User /></span>
          Patient Information
        </div>
        <span className="pmr-chevron">{open ? <Ic.ChevUp /> : <Ic.ChevDn />}</span>
      </div>
      {open && (
        <div className="pmr-info-columns">
          <div className="pmr-info-col">
            <ColTitle Icon={Ic.User} label="Basic Info" />
            <Field label="Patient ID"    value={d.patientIdentifier || d.patientId || d.patientID} Icon={Ic.Id} />
            <Field label="Full Name"     value={d.name}                      Icon={Ic.User} />
            <Field label="Age"           value={d.age ? String(d.age) : null} Icon={Ic.Calendar} />
            <Field label="Gender"        value={d.gender}                    Icon={Ic.Wc} />
            {d.birthDate   && <Field label="Date of Birth" value={fmtDate(d.birthDate)}   Icon={Ic.Calendar} />}
            <Field label="National ID" value={d.nationalId || d.NationalId || d.national_id || "—"} Icon={Ic.Id} />
          </div>
          <div className="pmr-info-col">
            <ColTitle Icon={Ic.Phone} label="Contact" />
            <Field label="Phone"   value={d.contactNumber || d.phone} Icon={Ic.Phone} color="blue" />
            <Field label="Email"   value={d.email}                    Icon={Ic.Email} />
            <Field label="Address" value={d.address}                  Icon={Ic.Home} />
          </div>
          <div className="pmr-info-col">
            <ColTitle Icon={Ic.Shield} label="Insurance" />
            <Field label="Insurance Company" value={d.insuranceCompany} Icon={Ic.Shield} color="green" />
            {d.insuranceId  && <Field label="Insurance ID"  value={d.insuranceId}    Icon={Ic.Id} />}
            {d.policyNumber && <Field label="Policy Number" value={d.policyNumber}   Icon={Ic.Id} />}
            {d.coverage     && <Field label="Coverage"      value={`${d.coverage}%`} Icon={Ic.Shield} color="blue" />}
          </div>
          <div className="pmr-info-col">
            <ColTitle Icon={Ic.Alert} label="Emergency Contact" />
            <Field label="Name"  value={d.emergencyContactName}  Icon={Ic.User} />
            <Field label="Phone" value={d.emergencyContactPhone} Icon={Ic.Phone} color="red" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab panels ───────────────────────────────────────────────
function ComplaintPanel({ d }) {
  const list = d.complaints || [];
  
  // If no complaints recorded, show reasonForVisit from appointment as the chief complaint
  if (!list.length) {
    if (d.reasonForVisit) {
      return (
        <div className="pmr-record">
          <Stamp date={d.appointmentDate} />
          <div className="pmr-record-grid g1">
            <Field label="Chief Complaint" value={d.reasonForVisit} />
            <Field label="Appointment Date" value={fmtDate(d.appointmentDate)} />
          </div>
        </div>
      );
    }
    return <Empty Icon={Ic.Doc} />;
  }
  
  return list.map((item, i) => (
    <div className="pmr-record" key={item.id || i}>
      <Stamp date={item.createdAt} />
      <div className="pmr-record-grid g1">
        <Field label="Chief Complaint" value={item.originalText || item.complaint || item.OriginalText} />
        {(item.duration || item.Duration) && <Field label="Duration" value={item.duration || item.Duration} />}
      </div>
    </div>
  ));
}

function HistoryPanel({ d }) {
  const list = d.histories || [];
  if (!list.length) return <Empty Icon={Ic.Clock} />;
  return list.map((item, i) => (
    <div className="pmr-record" key={item.id || i}>
      <Stamp date={item.createdAt} />
      <div className="pmr-record-grid">
        {[
          ["Previous Eye History", item.previousEye || item.pastMedicalHistory],
          ["Family History",       item.familyHistory],
          ["Allergies",            item.allergies],
          ["Chronic Diseases",     item.chronicDiseases],
          ["Current Medications",  item.currentMedications],
          ["Eye Surgeries",        item.eyeSurgeries],
          ["Family Eye Diseases",  item.familyEyeDiseases],
          ["Vision Symptoms",      item.visionSymptoms],
        ].filter(([, val]) => val).map(([label, value]) => (
          <Field key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  ));
}

function InvestigationsPanel({ d }) {
  const list = d.investigations || [];
  if (!list.length) return <Empty Icon={Ic.Flask} />;
  return list.map((item, i) => {
    let invList = [];
    try { invList = JSON.parse(item.selectedInvestigations || "[]"); } catch { invList = []; }
    return (
      <div className="pmr-record" key={item.id || i}>
        <Stamp date={item.createdAt} />
        {invList.length > 0 && (
          <>
            <div className="pmr-field-label" style={{ marginBottom: 8 }}>Investigations Ordered</div>
            <div className="pmr-chips" style={{ marginBottom: 14 }}>
              {invList.map((inv, idx) => <span key={idx} className="pmr-chip">{inv}</span>)}
            </div>
          </>
        )}
        {item.testName && <Field label="Test Name" value={item.testName} />}
        {item.result   && <Field label="Result"    value={item.result} />}
        {item.notes    && <Field label="Notes"     value={item.notes} />}
      </div>
    );
  });
}

function EyeExamPanel({ d }) {
  const list = d.eyeExaminations || [];
  if (!list.length) return <Empty Icon={Ic.Eye} />;
  return list.map((item, i) => (
    <div className="pmr-record" key={item.id || i}>
      <Stamp date={item.createdAt} />
      <div className="pmr-record-grid">
        {[
          ["Right Eye (VA)",     item.rightEye],
          ["Left Eye (VA)",      item.leftEye],
          ["Eye Pressure",       item.eyePressure || item.intraocularPressure],
          ["Pupil Reaction",     item.pupilReaction],
          ["Eye Alignment",      item.eyeAlignment],
          ["Eye Movements",      item.eyeMovements],
          ["Anterior Segment",   item.anteriorSegment],
          ["Posterior Segment",  item.posteriorSegment],
          ["Fundus Observation", item.fundusObservation],
          ["Visual Acuity",      item.visualAcuity],
          ["Other Notes",        item.otherNotes],
        ].filter(([, val]) => val).map(([label, value]) => (
          <Field key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  ));
}

function ImagesPanel({ d }) {
  const list = d.medicalTestFiles || [];
  if (!list.length) return <Empty Icon={Ic.Img} />;
  return (
    <div className="pmr-images-grid">
      {list.map((file, i) => (
        <div key={file.id || i} className="pmr-image-card">
          <div className="pmr-image-icon"><Ic.Img /></div>
          <div className="pmr-image-name">{file.fileName || "File"}</div>
          <div className="pmr-image-date">{fmtDate(file.createdAt || file.uploadDate)}</div>
          {file.filePath && (
            <a href={`${API_BASE}/${file.filePath}`} target="_blank" rel="noopener noreferrer" className="pmr-image-link">
              View file
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function OperationsPanel({ d }) {
  const list = d.operations || [];
  if (!list.length) return <Empty Icon={Ic.Heart} />;
  return list.map((item, i) => (
    <div className="pmr-record" key={item.id || i}>
      <Stamp date={item.createdAt} />
      <div className="pmr-record-grid">
        {[
          ["Operation",        item.operationName || item.name],
          ["Date",             fmtDate(item.date || item.operationDate)],
          ["Eye",              item.eye],
          ["Surgeon",          item.surgeon],
          ["Anesthesia",       item.anesthesia],
          ["Duration",         item.duration],
          ["Status",           item.status],
          ["Diagnosis",        item.diagnosis],
          ["Complications",    item.complications],
          ["Pre Medications",  item.preMedications],
          ["Post Medications", item.postMedications],
          ["Follow Up",        item.followUp],
          ["Notes",            item.notes],
        ].filter(([, val]) => val && val !== "—").map(([label, value]) => (
          <Field key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  ));
}

function PrescriptionsPanel({ d }) {
  const list = d.prescriptions || [];
  if (!list.length) return <Empty Icon={Ic.Pill} />;
  return list.map((pres, i) => {
    const items = pres.items || pres.Items || [];
    const rows  = items.length > 0 ? items : (pres.drug || pres.Drug ? [pres] : []);
    return (
      <div className="pmr-record" key={pres.id || i}>
        <Stamp date={pres.createdAt} />
        {rows.length > 0 && (
          <div className="pmr-drug-table">
            <div className="pmr-drug-header">
              <span>Drug</span><span>Dose</span><span>Form</span><span>Frequency</span>
            </div>
            {rows.map((row, idx) => (
              <div className="pmr-drug-row" key={idx}>
                <Field label="" value={row.drug || row.medication || row.Drug || row.Medication} />
                <Field label="" value={row.dose || row.dosage || row.Dose || row.Dosage} />
                <Field label="" value={row.form || row.Form} />
                <Field label="" value={row.frequency || row.customFrequency || row.Frequency} />
              </div>
            ))}
          </div>
        )}
        {(pres.notes || pres.instructions) && (
          <div style={{ marginTop: 12 }}>
            <Field label="Notes / Instructions" value={pres.notes || pres.instructions || pres.Notes || pres.Instructions} />
          </div>
        )}
      </div>
    );
  });
}

function DiagnosesPanel({ d }) {
  const list = d.diagnoses || [];
  if (!list.length) return <Empty Icon={Ic.Search} />;
  return list.map((item, i) => (
    <div className="pmr-record" key={item.id || i}>
      <Stamp date={item.createdAt} />
      <div className="pmr-record-grid">
        {[
          ["Diagnosis",    item.diagnosisName || item.diagnosisText || item.diagnosis],
          ["ICD-10 Code",  item.icd10Code || item.ICD10Code],
          ["Status",       item.status],
          ["Severity",     item.severity],
          ["Checkup Date", fmtDate(item.checkupDate)],
          ["Notes",        item.notes],
        ].filter(([, val]) => val && val !== "—").map(([label, value]) => (
          <Field key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  ));
}

const PANEL_MAP = {
  complaint: ComplaintPanel, history: HistoryPanel,
  investigations: InvestigationsPanel, "eye-exam": EyeExamPanel,
  images: ImagesPanel, operations: OperationsPanel,
  prescriptions: PrescriptionsPanel, diagnoses: DiagnosesPanel,
};

// ─── Fallback ─────────────────────────────────────────────────
function getLocalFallback(patientIdentifier) {
  return {
    patientIdentifier,
    name:      localStorage.getItem("patientName") || localStorage.getItem("userName") || "Patient",
    email:     localStorage.getItem("patientEmail") || localStorage.getItem("userEmail") || "",
    phone:     localStorage.getItem("patientPhone") || "",
    birthDate: localStorage.getItem("patientDateOfBirth") || null,
    complaints: [], histories: [], investigations: [],
    eyeExaminations: [], operations: [], prescriptions: [],
    diagnoses: [], medicalTestFiles: [],
  };
}

// ─── Main component ───────────────────────────────────────────
export default function PatientMedicalRecord() {
  const navigate    = useNavigate();
  const [activeTab, setActiveTab] = useState("patient-info");
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [isNewPatient, setIsNewPatient] = useState(false); // Track if patient has no medical record

  // ── The ONE true identifier: P-XXXXXX ──────────────────────
  const patientIdentifier = getPatientIdentifier();
  const numericPatientId  = getNumericPatientId();
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!isLoggedIn() && !patientIdentifier && !numericPatientId) {
      navigate("/login");
      return;
    }
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      // ── Strategy: use PatientIdentifier (P-XXXXXX) as primary key ──
      // The backend check/patient endpoints accept both numeric ID and PatientIdentifier
      const idToUse = patientIdentifier || numericPatientId;

      if (!idToUse) {
        setData(getLocalFallback(null));
        return;
      }

      // Step 1: Check if medical record exists using the identifier
      let checkData = { exists: false, recordId: null, patientIdentifier: null };
      try {
        const { data: check } = await axios.get(
          `${API_BASE}/api/MedicalRecord/check/${encodeURIComponent(idToUse)}`,
          { headers }
        );
        checkData = check;
      } catch (err) {
        setData(getLocalFallback(patientIdentifier));
        setError("Could not reach the server. Showing basic information.");
        return;
      }

      if (checkData.exists) {
        // Step 2: Fetch full record using the PatientIdentifier from the check result
        // This ensures we always use the correct identifier the server knows about
        const fetchId = checkData.patientIdentifier || idToUse;

        try {
          const { data: rec } = await axios.get(
            `${API_BASE}/api/MedicalRecord/patient/${encodeURIComponent(fetchId)}`,
            { headers }
          );

          const pi = rec.patientInfo || rec.PatientInfo || {};

          // Merge and ensure patientIdentifier is always set correctly
          setData({
    ...pi,
    ...rec,
    patientIdentifier:    checkData.patientIdentifier || patientIdentifier || fetchId,
    nationalId:           rec.nationalId || pi.nationalId || "",
    gender:               rec.gender     || pi.gender     || "",
    emergencyContactName: rec.emergencyContactName  || pi.emergencyContactName  || "",
    emergencyContactPhone:rec.emergencyContactPhone || pi.emergencyContactPhone || "",
    address:              rec.address    || pi.address    || "",
});

          // Cache the PatientIdentifier for future use
          if (checkData.patientIdentifier) {
            localStorage.setItem("patientIdentifier", checkData.patientIdentifier);
          }

        } catch (err) {
          setError("Could not load full record.");
          setData(getLocalFallback(patientIdentifier));
        }

      } else {
        // Step 3: No record — try appointment-info
        setIsNewPatient(true); // Mark as new patient with no medical record
        try {
          const { data: info } = await axios.get(
            `${API_BASE}/api/MedicalRecord/appointment-info/${encodeURIComponent(idToUse)}`,
            { headers }
          );
          setData({
            ...info,
            patientIdentifier: patientIdentifier || idToUse,
            complaints: [], histories: [], investigations: [],
            eyeExaminations: [], operations: [], prescriptions: [],
            diagnoses: [], medicalTestFiles: [],
          });
        } catch {
          setData(getLocalFallback(patientIdentifier));
        }
      }

    } catch (err) {
      setError("Could not load full record. Showing basic information.");
      setData(getLocalFallback(patientIdentifier));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="pmr-page">
      <div className="pmr-loading">
        <div className="pmr-spinner" />
        <p>Loading your medical record...</p>
      </div>
    </div>
  );

  // ── New Patient View: No medical record yet ──────────────────
  if (isNewPatient) {
    const name = localStorage.getItem("patientName") || localStorage.getItem("userName") || "Patient";
    const displayId = patientIdentifier || numericPatientId || "—";
    return (
      <div className="pmr-page">
        {/* Top bar */}
        <div className="pmr-topbar">
          <div className="pmr-topbar-left">
            <button className="pmr-back-btn" onClick={() => navigate("/patient")}>
              <Ic.Back /> Back
            </button>
            <div className="pmr-patient-avatar">{initials(name)}</div>
            <div>
              <div className="pmr-patient-name">{name}</div>
              <div className="pmr-patient-meta">
                <span className="pmr-meta-item"><Ic.Id /> ID: {displayId}</span>
                <span className="pmr-meta-sep" />
                <span className="pmr-meta-item"><Ic.Calendar /> {fmtDate(localStorage.getItem("patientDateOfBirth"))}</span>
              </div>
            </div>
          </div>
          <div className="pmr-topbar-badge">Read-Only View</div>
        </div>

        {/* New Patient Message */}
        <div className="pmr-layout">
          <div className="pmr-new-patient-container">
            <div className="pmr-new-patient-icon">
              <Ic.Doc />
            </div>
            <h2 className="pmr-new-patient-title">No Medical Record Yet</h2>
            <p className="pmr-new-patient-text">
              Welcome to our clinic! You don't have a medical record yet.
            </p>
            <div className="pmr-new-patient-steps">
              <div className="pmr-step">
                <div className="pmr-step-number">1</div>
                <div className="pmr-step-content">
                  <h4>Book an Appointment</h4>
                  <p>Schedule your first appointment with our doctor</p>
                </div>
              </div>
              <div className="pmr-step-arrow">→</div>
              <div className="pmr-step">
                <div className="pmr-step-number">2</div>
                <div className="pmr-step-content">
                  <h4>Complete Your Visit</h4>
                  <p>Attend your appointment and complete the examination</p>
                </div>
              </div>
              <div className="pmr-step-arrow">→</div>
              <div className="pmr-step">
                <div className="pmr-step-number">3</div>
                <div className="pmr-step-content">
                  <h4>Access Your Record</h4>
                  <p>Your medical record will be available after your visit</p>
                </div>
              </div>
            </div>
            <div className="pmr-new-patient-action">
              <button 
                className="pmr-btn-primary"
                onClick={() => navigate("/patient/appointments")}
              >
                Book an Appointment Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const d    = data || getLocalFallback(patientIdentifier);
  const name = d.name || d.patientName || "Patient";
  const PanelComponent = PANEL_MAP[activeTab];
  const recordList     = RECORD_KEY[activeTab] ? (d[RECORD_KEY[activeTab]] || []) : [];

  // Display ID: always prefer P-XXXXXX format
  const displayId = d.patientIdentifier || patientIdentifier || d.patientId || d.patientID || "—";

  return (
    <div className="pmr-page">

      {/* Top bar */}
      <div className="pmr-topbar">
        <div className="pmr-topbar-left">
          <button className="pmr-back-btn" onClick={() => navigate("/patient")}>
            <Ic.Back /> Back
          </button>
          <div className="pmr-patient-avatar">{initials(name)}</div>
          <div>
            <div className="pmr-patient-name">{name}</div>
            <div className="pmr-patient-meta">
              <span className="pmr-meta-item"><Ic.Id /> ID: {displayId}</span>
              <span className="pmr-meta-sep" />
              <span className="pmr-meta-item"><Ic.Calendar /> {fmtDate(d.birthDate)}</span>
              <span className="pmr-meta-sep" />
              <span className="pmr-meta-item"><Ic.Wc /> {d.gender || "—"}</span>
            </div>
          </div>
        </div>
        <div className="pmr-topbar-badge">Read-Only View</div>
      </div>

      {error && <div className="pmr-error-bar">{error}</div>}

      <div className="pmr-layout">

        {/* Sidebar */}
        <aside className="pmr-sidebar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`pmr-nav-item${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="pmr-nav-icon"><tab.Icon /></span>
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="pmr-content">
          <PatientInfoBlock d={{ ...d, patientId: displayId }} />

          <div className="pmr-tab-bar">
            {TABS.filter(t => t.id !== "patient-info").map(tab => (
              <button
                key={tab.id}
                className={`pmr-tab-btn${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="pmr-tab-icon"><tab.Icon /></span>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab !== "patient-info" && PanelComponent && (
            <div className="pmr-panel">
              <div className="pmr-panel-title-bar">
                <h3>{TABS.find(t => t.id === activeTab)?.label}</h3>
                {recordList.length > 0 && (
                  <span className="pmr-record-count">
                    {recordList.length} record{recordList.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="pmr-panel-body">
                <PanelComponent d={d} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}