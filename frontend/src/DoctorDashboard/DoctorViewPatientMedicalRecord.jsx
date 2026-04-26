import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../components/PatientMedicalRecord.css'; // Reuse the same CSS styling

// ─── SVG icons ───────────────────────────────────────
const Ic = {
  User:      <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  Id:        <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10h.01M8 14h8M12 10h4"/></svg>,
  Calendar:  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Phone:     <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.08 4.18 2 2 0 0 1 5.09 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 5 5l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Email:     <svg viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Home:      <svg viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  Shield:    <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Hospital:  <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  Emergency: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Complaint: <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
  History:   <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Flask:     <svg viewBox="0 0 24 24"><path d="M6 2v6l-4 9a1 1 0 0 0 .9 1.5h14.2a1 1 0 0 0 .9-1.5L14 8V2"/><line x1="6" y1="2" x2="18" y2="2"/></svg>,
  Eye:       <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Image:     <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>,
  Surgery:   <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Pill:      <svg viewBox="0 0 24 24"><path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Search:    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M8 11h6M11 8v6"/></svg>,
  ChevronUp: <svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>,
  ChevronDn: <svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>,
  Wc:        <svg viewBox="0 0 24 24"><circle cx="7.5" cy="4" r="2"/><circle cx="16.5" cy="4" r="2"/><path d="M5.5 10h4l1 10H5.5L6.5 10zM14.5 10h4l-1 10h-3l-1-10z"/></svg>,
  Back:      <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Print:     <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
};

const TABS = [
  { id: 'patient-info',   label: 'Patient Info',   icon: Ic.User },
  { id: 'complaint',      label: 'Complaint',      icon: Ic.Complaint },
  { id: 'history',        label: 'History',        icon: Ic.History },
  { id: 'investigations', label: 'Investigations', icon: Ic.Flask },
  { id: 'eye-exam',       label: 'Eye Exam',       icon: Ic.Eye },
  { id: 'images',         label: 'Images',         icon: Ic.Image },
  { id: 'operations',     label: 'Operations',     icon: Ic.Surgery },
  { id: 'prescriptions',  label: 'Prescription',   icon: Ic.Pill },
  { id: 'diagnoses',      label: 'Diagnoses',      icon: Ic.Search },
];

// ─── Data normalizer ─────────────────────────────────────────
function normalizePatient(raw) {
  if (!raw) return null;
  const genderMap = { 0: 'Male', 1: 'Female', 2: 'Other' };
  const genderRaw = raw.gender ?? raw.PatientGender ?? raw.Gender;
  const gender = typeof genderRaw === 'number' ? (genderMap[genderRaw] ?? '—') : (genderRaw || '—');
  const dob = raw.dateOfBirth || raw.birthDate || raw.PatientBirthDate || raw.BirthDate || null;
  let age = raw.age || raw.Age || null;
  if (!age && dob) {
    age = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  }
  return {
    patientId:             raw.patientId || raw.patientID || raw.id || raw.PatientId || '—',
    name:                  raw.name || raw.patientName || [raw.firstName, raw.lastName].filter(Boolean).join(' ') || '—',
    age:                   age ?? '—',
    gender,
    email:                 raw.email || raw.Email || raw.patientEmail || '—',
    phone:                 raw.phone || raw.contactNumber || raw.Phone || raw.patientPhone || '—',
    address:               raw.address || raw.Address || '—',
    birthDate:             dob,
    nationalId:            raw.nationalId || raw.NationalId || null,
    insuranceCompany:      raw.insuranceCompany || raw.InsuranceCompany || null,
    insuranceId:           raw.insuranceId || raw.InsuranceId || null,
    policyNumber:          raw.policyNumber || raw.PolicyNumber || null,
    coverage:              raw.coverage || raw.Coverage || null,
    emergencyContactName:  raw.emergencyContactName || raw.EmergencyContactName || null,
    emergencyContactPhone: raw.emergencyContactPhone || raw.EmergencyContactPhone || null,
    complaints:            raw.complaints || [],
    histories:             raw.histories || [],
    investigations:        raw.investigations || [],
    eyeExaminations:       raw.eyeExaminations || [],
    operations:            raw.operations || [],
    prescriptions:         raw.prescriptions || [],
    diagnoses:             raw.diagnoses || [],
  };
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Small UI pieces ─────────────────────────────────────────
function Field({ label, value, icon, color }) {
  const v = value || '—';
  return (
    <div className="pmr-field">
      <div className="pmr-field-label">{label}</div>
      <div className={`pmr-field-value${color ? ' ' + color : ''}`}>
        {icon && icon}
        {v}
      </div>
    </div>
  );
}

function ColTitle({ icon, label }) {
  return (
    <div className="pmr-col-title">
      {icon}
      {label}
    </div>
  );
}

function Empty({ icon }) {
  return (
    <div className="pmr-empty">
      <div className="pmr-empty-icon">{icon || Ic.Complaint}</div>
      <p>No data recorded for this section.</p>
      <small>Your doctor has not added any entries yet.</small>
    </div>
  );
}

function Timestamp({ date }) {
  return <div className="pmr-record-timestamp">{fmtDateTime(date)}</div>;
}

// ─── Patient info (4-column block) ───────────────────────────
function PatientInfoBlock({ p }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="pmr-info-block">
      <div className="pmr-info-block-header" onClick={() => setOpen(o => !o)}>
        <div className="pmr-info-block-title">
          {Ic.User} Patient Information
        </div>
        <svg className={`pmr-chevron${open ? ' open' : ''}`} viewBox="0 0 24 24">
          <polyline points="18,15 12,9 6,15"/>
        </svg>
      </div>

      {open && (
        <div className="pmr-info-columns">
          {/* Col 1 — Basic */}
          <div className="pmr-info-col">
            <ColTitle icon={Ic.User} label="Basic info" />
            <Field label="Patient ID" value={p.patientId} icon={Ic.Id} />
            <Field label="Full name"  value={p.name}      icon={Ic.User} />
            <Field label="Age"        value={String(p.age)} icon={Ic.Calendar} />
            <Field label="Gender"     value={p.gender}    icon={Ic.Wc} />
            {p.birthDate  && <Field label="Date of birth" value={fmtDate(p.birthDate)} icon={Ic.Calendar} />}
            {p.nationalId && <Field label="National ID"   value={p.nationalId}          icon={Ic.Id} />}
          </div>

          {/* Col 2 — Contact */}
          <div className="pmr-info-col">
            <ColTitle icon={Ic.Phone} label="Contact" />
            <Field label="Phone number" value={p.phone}   icon={Ic.Phone} color="blue" />
            <Field label="Email"         value={p.email}   icon={Ic.Email} />
            <Field label="Address"       value={p.address} icon={Ic.Home} />
          </div>

          {/* Col 3 — Insurance */}
          <div className="pmr-info-col">
            <ColTitle icon={Ic.Shield} label="Insurance" />
            <Field label="Insurance company" value={p.insuranceCompany} icon={Ic.Hospital} color="green" />
            {p.insuranceId  && <Field label="Insurance ID"  value={p.insuranceId}   icon={Ic.Id} />}
            {p.policyNumber && <Field label="Policy number" value={p.policyNumber}  icon={Ic.Id} />}
            {p.coverage     && <Field label="Coverage"      value={`${p.coverage}%`} icon={Ic.Shield} color="blue" />}
          </div>

          {/* Col 4 — Emergency */}
          <div className="pmr-info-col">
            <ColTitle icon={Ic.Emergency} label="Emergency contact" />
            <Field label="Name"  value={p.emergencyContactName}  icon={Ic.User}  />
            <Field label="Phone" value={p.emergencyContactPhone} icon={Ic.Phone} color="red" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab panels ───────────────────────────────────────────────
function ComplaintPanel({ p }) {
  const list = p.complaints || [];
  if (!list.length) return <Empty icon={Ic.Complaint} />;
  return list.map((item, i) => (
    <div className="pmr-record" key={item.id || i}>
      <Timestamp date={item.createdAt} />
      <div className="pmr-record-grid g1">
        <Field label="Chief complaint" value={item.originalText || item.complaint || item.OriginalText} />
      </div>
    </div>
  ));
}

function HistoryPanel({ p }) {
  const list = p.histories || [];
  if (!list.length) return <Empty icon={Ic.History} />;
  return list.map((item, i) => (
    <div className="pmr-record" key={item.id || i}>
      <Timestamp date={item.createdAt} />
      <div className="pmr-record-grid">
        {[
          ['Previous eye history',  item.previousEye],
          ['Family history',        item.familyHistory],
          ['Allergies',             item.allergies],
          ['Chronic diseases',      item.chronicDiseases],
          ['Current medications',   item.currentMedications],
          ['Eye surgeries',         item.eyeSurgeries],
          ['Family eye diseases',   item.familyEyeDiseases],
          ['Vision symptoms',       item.visionSymptoms],
        ].filter(([, v]) => v).map(([label, value]) => (
          <Field key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  ));
}

function InvestigationsPanel({ p }) {
  const list = p.investigations || [];
  if (!list.length) return <Empty icon={Ic.Flask} />;
  return list.map((item, i) => {
    let invList = [];
    try { invList = JSON.parse(item.selectedInvestigations || '[]'); } catch { invList = []; }
    return (
      <div className="pmr-record" key={item.id || i}>
        <Timestamp date={item.createdAt} />
        {invList.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div className="pmr-field-label" style={{ marginBottom: 6 }}>Investigations ordered</div>
            <div className="pmr-chips">
              {invList.map((inv, idx) => <span key={idx} className="pmr-chip">{inv}</span>)}
            </div>
          </div>
        )}
        {item.notes && <Field label="Notes" value={item.notes} />}
      </div>
    );
  });
}

function EyeExamPanel({ p }) {
  const list = p.eyeExaminations || [];
  if (!list.length) return <Empty icon={Ic.Eye} />;
  return list.map((item, i) => (
    <div className="pmr-record" key={item.id || i}>
      <Timestamp date={item.createdAt} />
      <div className="pmr-record-grid">
        {[
          ['Right eye (VA)',     item.rightEye || item.RightEye],
          ['Left eye (VA)',      item.leftEye  || item.LeftEye],
          ['Eye pressure (IOP)', item.eyePressure || item.EyePressure],
          ['Pupil reaction',     item.pupilReaction || item.PupilReaction],
          ['Eye alignment',      item.eyeAlignment || item.EyeAlignment],
          ['Eye movements',      item.eyeMovements || item.EyeMovements],
          ['Anterior segment',   item.anteriorSegment || item.AnteriorSegment],
          ['Fundus observation', item.fundusObservation || item.FundusObservation],
          ['Other notes',        item.otherNotes || item.OtherNotes],
        ].filter(([, v]) => v).map(([label, value]) => (
          <Field key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  ));
}

function ImagesPanel() {
  return <Empty icon={Ic.Image} />;
}

function OperationsPanel({ p }) {
  const list = p.operations || [];
  if (!list.length) return <Empty icon={Ic.Surgery} />;
  return list.map((item, i) => (
    <div className="pmr-record" key={item.id || i}>
      <Timestamp date={item.createdAt} />
      <div className="pmr-record-grid">
        {[
          ['Operation type', item.operationType || item.OperationType],
          ['Date',           fmtDate(item.operationDate || item.OperationDate)],
          ['Surgeon',        item.surgeon || item.Surgeon],
          ['Hospital',       item.hospital || item.Hospital],
          ['Eye',            item.eye || item.Eye],
          ['Notes',          item.notes || item.Notes],
        ].filter(([, v]) => v && v !== '—').map(([label, value]) => (
          <Field key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  ));
}

function PrescriptionsPanel({ p }) {
  const list = p.prescriptions || [];
  if (!list.length) return <Empty icon={Ic.Pill} />;
  return list.map((pres, i) => {
    const items = pres.items || pres.Items || [];
    const rows = items.length > 0 ? items : (pres.drug || pres.Drug ? [pres] : []);
    return (
      <div className="pmr-record" key={pres.id || i}>
        <Timestamp date={pres.createdAt} />
        {rows.map((row, idx) => (
          <div className="pmr-drug-row" key={idx}>
            <Field label="Drug"      value={row.drug || row.Drug || row.medication || row.Medication} />
            <Field label="Dose"      value={row.dose || row.Dose} />
            <Field label="Form"      value={row.form || row.Form} />
            <Field label="Frequency" value={row.frequency || row.Frequency || row.customFrequency} />
          </div>
        ))}
        {pres.notes && <div style={{ marginTop: 10 }}><Field label="Notes" value={pres.notes || pres.Notes} /></div>}
      </div>
    );
  });
}

function DiagnosesPanel({ p }) {
  const list = p.diagnoses || [];
  if (!list.length) return <Empty icon={Ic.Search} />;
  return list.map((item, i) => (
    <div className="pmr-record" key={item.id || i}>
      <Timestamp date={item.createdAt} />
      <div className="pmr-record-grid">
        {[
          ['Diagnosis',    item.diagnosis || item.Diagnosis],
          ['Status',       item.status    || item.Status],
          ['Severity',     item.severity  || item.Severity],
          ['Checkup date', fmtDate(item.checkupDate || item.CheckupDate)],
          ['Notes',        item.notes     || item.Notes],
        ].filter(([, v]) => v && v !== '—').map(([label, value]) => (
          <Field key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  ));
}

const PANEL_MAP = {
  'complaint':      ComplaintPanel,
  'history':        HistoryPanel,
  'investigations': InvestigationsPanel,
  'eye-exam':       EyeExamPanel,
  'images':         ImagesPanel,
  'operations':     OperationsPanel,
  'prescriptions':  PrescriptionsPanel,
  'diagnoses':      DiagnosesPanel,
};

// ─── Main component ───────────────────────────────────────────
export default function DoctorViewPatientMedicalRecord({
  patientId: propPatientId,
  patientData: initialPatientData,
  onBack,
}) {
  const [activeTab,   setActiveTab]   = useState('patient-info');
  const [patientData, setPatientData] = useState(
    initialPatientData ? normalizePatient(initialPatientData) : null
  );
  const [loading, setLoading] = useState(!initialPatientData);
  const [error,   setError]   = useState(null);

  const patientId = propPatientId || localStorage.getItem('selectedPatientId');

  useEffect(() => {
    if (initialPatientData) {
      setPatientData(normalizePatient(initialPatientData));
      setLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        setLoading(true);
        if (patientId) {
          try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`/api/patients/${patientId}`, {
              headers: { Authorization: `Bearer ${token}` }, timeout: 5000,
            });
            setPatientData(normalizePatient(data));
            setLoading(false);
            return;
          } catch { /* fall through */ }
        }
        setError('Unable to load patient data. Please select a patient.');
      } catch { setError('Unable to load patient data.'); }
      finally  { setLoading(false); }
    };
    fetch();
  }, [patientId, initialPatientData]);

  if (loading) return (
    <div className="pmr-page">
      <div className="pmr-loading">
        <div className="pmr-spinner" />
        <p>Loading medical record...</p>
      </div>
    </div>
  );

  if (error && !patientData) return (
    <div className="pmr-page">
      <div className="pmr-loading"><p style={{ color: '#c0392b' }}>{error}</p></div>
    </div>
  );

  const p = patientData || {};

  const activeTabObj = TABS.find(t => t.id === activeTab);
  const PanelComponent = PANEL_MAP[activeTab];

  const recordCount = PanelComponent && p[{
    complaint:      'complaints',
    history:        'histories',
    investigations: 'investigations',
    'eye-exam':     'eyeExaminations',
    operations:     'operations',
    prescriptions:  'prescriptions',
    diagnoses:      'diagnoses',
  }[activeTab]]?.length || 0;

  return (
    <div className="pmr-page">

      {/* ── Top bar with back button ── */}
      <div className="pmr-topbar">
        <div className="pmr-topbar-left">
          {onBack && (
            <button 
              className="pmr-back-btn" 
              onClick={onBack}
              title="Back to patient list"
            >
              {Ic.Back}
            </button>
          )}
          <div className="pmr-patient-avatar">{initials(p.name)}</div>
          <div>
            <div className="pmr-patient-name">{p.name || '—'}</div>
            <div className="pmr-patient-meta">
              <span className="pmr-meta-item">
                {Ic.Id} ID: {p.patientId}
              </span>
              <span className="pmr-meta-sep" />
              <span className="pmr-meta-item">
                {Ic.Calendar} {fmtDate(p.birthDate)}
              </span>
              <span className="pmr-meta-sep" />
              <span className="pmr-meta-item">
                {Ic.Wc} {p.gender}
              </span>
            </div>
          </div>
        </div>
        <div className="pmr-topbar-badge">Patient Record (View Only)</div>
      </div>

      {/* ── Layout ── */}
      <div className="pmr-layout">

        {/* Sidebar */}
        <aside className="pmr-sidebar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`pmr-nav-item${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="pmr-nav-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="pmr-content">

          {/* Patient info always on top */}
          <PatientInfoBlock p={p} />

          {/* Tab bar */}
          <div className="pmr-tab-bar">
            {TABS.filter(t => t.id !== 'patient-info').map(tab => (
              <button
                key={tab.id}
                className={`pmr-tab-btn${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Panel */}
          {activeTab !== 'patient-info' && PanelComponent && (
            <div className="pmr-panel">
              <div className="pmr-panel-title-bar">
                <h3>{activeTabObj?.label}</h3>
                {recordCount > 0 && (
                  <span className="pmr-record-count">{recordCount} record{recordCount > 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="pmr-panel-body">
                <PanelComponent p={p} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
