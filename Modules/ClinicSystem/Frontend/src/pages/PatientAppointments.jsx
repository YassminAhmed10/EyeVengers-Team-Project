import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt, FaClock, FaPhone, FaCheckCircle, FaTimesCircle,
    FaHourglassHalf, FaTrash, FaEye, FaChevronRight,
    FaHeartbeat, FaUserSlash, FaSync, FaNotesMedical, FaMoneyBillWave,
    FaIdCard, FaCalendarCheck, FaBan, FaTimes, FaUser,
    FaFileMedical, FaExclamationTriangle, FaFilter
} from 'react-icons/fa';
import { MdLocalHospital, MdEventAvailable } from 'react-icons/md';
import PatientLayout from '../components/PatientLayout';
import './PatientAppointments.css';

// ✅ Matches backend AppointmentStatus enum:
// Upcoming=0, Completed=1, Cancelled=2, InProgress=3, NoShow=4
const STATUS_CONFIG = {
    0: { label: 'Upcoming',    icon: FaCalendarCheck, colorClass: 'upcoming',   color: '#0066cc', bg: 'rgba(0,102,204,0.1)',    border: 'rgba(0,102,204,0.3)'   },
    1: { label: 'Completed',   icon: FaCheckCircle,   colorClass: 'completed',  color: '#48bb78', bg: 'rgba(72,187,120,0.1)',   border: 'rgba(72,187,120,0.3)'  },
    2: { label: 'Cancelled',   icon: FaBan,           colorClass: 'cancelled',  color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)' },
    3: { label: 'In Progress', icon: FaHeartbeat,     colorClass: 'inprogress', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)'  },
    4: { label: 'No Show',     icon: FaUserSlash,     colorClass: 'noshow',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)'  },
};

const formatTime = (t) => {
    if (!t) return '—';
    const parts = t.split(':');
    if (parts.length < 2) return t;
    let h = parseInt(parts[0]);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
};

const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

/* ══════════════════════════════════════════
   DETAIL MODAL
══════════════════════════════════════════ */
const AppointmentModal = ({ apt, onClose }) => {
    if (!apt) return null;
    const cfg = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG[0];
    const StatusIcon = cfg.icon;

    // ✅ Auto: if appointment is Completed, show payment as Paid
    const displayPayment = apt.status === 1 ? 'Paid' : (apt.paymentStatus || 'Pending');

    const Field = ({ label, value }) =>
        value ? (
            <div className="mf-field">
                <span className="mf-label">{label}</span>
                <span className="mf-value">{value}</span>
            </div>
        ) : null;

    const Section = ({ title, children }) => {
        const hasContent = React.Children.toArray(children).some(c => c);
        if (!hasContent) return null;
        return (
            <div className="mf-section">
                <div className="mf-section-title">{title}</div>
                <div className="mf-section-body">{children}</div>
            </div>
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className="modal-hosp-icon"><MdLocalHospital /></div>
                        <div>
                            <h2 className="modal-title">Appointment Details</h2>
                            <span className="modal-id">#{apt.appointmentId}</span>
                        </div>
                    </div>
                    <div className="modal-header-right">
                        <span className="modal-status-pill" style={{ background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}` }}>
                            <StatusIcon /> {cfg.label}
                        </span>
                        <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
                    </div>
                </div>

                {/* Body */}
                <div className="modal-body">
                    <Section title="Patient Information">
                        <Field label="Full Name"   value={apt.patientName} />
                        <Field label="Phone"       value={apt.phone} />
                        <Field label="Email"       value={apt.email} />
                        <Field label="Age"         value={apt.age} />
                        <Field label="Gender"      value={apt.patientGender === 0 ? 'Male' : apt.patientGender === 1 ? 'Female' : null} />
                        <Field label="National ID" value={apt.nationalId} />
                        <Field label="Address"     value={apt.address} />
                    </Section>

                    <Section title="Appointment Details">
                        <Field label="Date"     value={formatDate(apt.appointmentDate)} />
                        <Field label="Time"     value={formatTime(apt.appointmentTime)} />
                        <Field label="Duration" value={apt.durationMinutes ? `${apt.durationMinutes} min` : null} />
                        <Field label="Type"     value={apt.appointmentType === 'online' ? 'Online' : 'In-Clinic'} />
                        <Field label="Reason"   value={apt.reasonForVisit} />
                        <Field label="Notes"    value={apt.notes} />
                    </Section>

                    <Section title="Medical History">
                        <Field label="Chronic Diseases"     value={apt.chronicDiseases} />
                        <Field label="Current Medications"  value={apt.currentMedications} />
                        <Field label="Allergies"            value={apt.otherAllergies} />
                        <Field label="Vision Symptoms"      value={apt.visionSymptoms} />
                        <Field label="Eye Allergies"        value={apt.eyeAllergies} />
                        <Field label="Eye Surgeries"        value={apt.eyeSurgeries} />
                        <Field label="Family Eye Diseases"  value={apt.familyEyeDiseases} />
                    </Section>

                    <Section title="Payment & Insurance">
                        <Field label="Payment Method" value={apt.paymentMethod} />
                        <div className="mf-field">
                            <span className="mf-label">Payment Status</span>
                            <span className={`payment-badge payment-${displayPayment.toLowerCase()}`}>{displayPayment}</span>
                        </div>
                        <Field label="Final Price"       value={apt.finalPrice ? `EGP ${apt.finalPrice}` : null} />
                        <Field label="Insurance Company" value={apt.insuranceCompany} />
                        <Field label="Insurance ID"      value={apt.insuranceId} />
                        <Field label="Coverage"          value={apt.coverage} />
                    </Section>

                    {(apt.emergencyContactName || apt.emergencyContactPhone) && (
                        <Section title="Emergency Contact">
                            <Field label="Name"  value={apt.emergencyContactName} />
                            <Field label="Phone" value={apt.emergencyContactPhone} />
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
const PatientAppointments = () => {
    const navigate = useNavigate();
    const [userName, setUserName]       = useState('Guest');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [refreshing, setRefreshing]   = useState(false);
    const [filter, setFilter]           = useState('all');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [modalApt, setModalApt]       = useState(null);

    const patientId = localStorage.getItem('patientId') || 'P-000001';

    const fetchAppointments = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);
            const res = await fetch(`http://localhost:5201/api/Appointments/ByPatient/${patientId}`);
            if (res.ok) {
                setAppointments(await res.json());
                setLastUpdated(new Date());
            } else if (res.status === 404) {
                setAppointments([]);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    }, [patientId]);

    useEffect(() => {
        const u = localStorage.getItem('userName');
        if (u) setUserName(u);
        fetchAppointments(false);
        const iv = setInterval(() => fetchAppointments(true), 30000);
        return () => clearInterval(iv);
    }, [fetchAppointments]);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            const res = await fetch(`http://localhost:5201/api/Appointments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 2 }),
            });
            if (res.ok) fetchAppointments(true);
            else alert('Failed to cancel appointment.');
        } catch { alert('Error cancelling appointment.'); }
    };

    const FILTER_MAP = { all: null, upcoming: 0, completed: 1, cancelled: 2, inprogress: 3, noshow: 4 };
    const filtered   = appointments.filter(a => { const s = FILTER_MAP[filter]; return s === null || a.status === s; });
    const count      = (s) => appointments.filter(a => a.status === s).length;

    const tabs = [
        { key: 'all',        label: 'All',         cnt: appointments.length },
        { key: 'upcoming',   label: 'Upcoming',    cnt: count(0) },
        { key: 'inprogress', label: 'In Progress', cnt: count(3) },
        { key: 'completed',  label: 'Completed',   cnt: count(1) },
        { key: 'cancelled',  label: 'Cancelled',   cnt: count(2) },
        { key: 'noshow',     label: 'No Show',     cnt: count(4) },
    ];

    return (
        <PatientLayout>
            <div className="patient-appointments-page">
                <div className="appointments-container">

                    {/* ── Header ── */}
                    <div className="page-top-header">
                        <div className="page-top-left">
                            <h1 className="page-title">My Appointments</h1>
                            <div className="page-meta">
                                <span className="patient-chip"><FaIdCard /> {userName}</span>
                                {lastUpdated && (
                                    <span className="updated-chip">
                                        <FaSync className={refreshing ? 'spin-icon' : ''} />
                                        Updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button className="book-new-btn" onClick={() => navigate('/book-appointment')}>
                            <FaNotesMedical /> Book New Appointment
                        </button>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="appointments-filters">
                        {tabs.map(({ key, label, cnt }) => (
                            <button key={key} className={`filter-btn ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
                                {label}
                                {cnt > 0 && <span className="tab-count">{cnt}</span>}
                            </button>
                        ))}
                    </div>

                    {/* ── List ── */}
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner" /><p>Loading appointments...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="no-appointments">
                            <FaCalendarAlt className="no-apt-icon" />
                            <h2>No Appointments Found</h2>
                            <p>You don't have any {filter !== 'all' ? filter : ''} appointments yet.</p>
                            <button className="book-btn" onClick={() => navigate('/book-appointment')}>Book New Appointment</button>
                        </div>
                    ) : (
                        <div className="appointments-timeline">
                            {filtered.map((apt, idx) => {
                                const cfg = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG[0];
                                const StatusIcon = cfg.icon;
                                const canCancel  = apt.status === 0;

                                // ✅ Auto: Completed → Paid
                                const displayPayment = apt.status === 1 ? 'Paid' : (apt.paymentStatus || 'Pending');

                                return (
                                    <div key={apt.appointmentId} className={`timeline-item status-${apt.status}`} style={{ animationDelay: `${idx * 0.08}s` }}>
                                        <div className="timeline-marker">
                                            <span className="marker-status"><StatusIcon /></span>
                                        </div>

                                        <div className="timeline-content">
                                            <div className="appointment-card-modern">
                                                {/* Status pill */}
                                                <span className="card-status-pill" style={{ background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}` }}>
                                                    <StatusIcon /> {cfg.label}
                                                </span>

                                                <div className="appointment-table">
                                                    {/* Row 1 */}
                                                    <div className="table-row">
                                                        <div className="table-cell">
                                                            <span className="cell-label">Patient Name</span>
                                                            {/* ✅ from Appointment.PatientName */}
                                                            <span className="cell-value">{apt.patientName || userName}</span>
                                                        </div>
                                                        <div className="table-cell">
                                                            <span className="cell-label">Appointment Date</span>
                                                            <span className="cell-value">{formatDate(apt.appointmentDate)}</span>
                                                        </div>
                                                        <div className="table-cell">
                                                            <span className="cell-label">Appointment Slot</span>
                                                            <span className="cell-value">{formatTime(apt.appointmentTime)}</span>
                                                        </div>
                                                    </div>
                                                    {/* Row 2 */}
                                                    <div className="table-row">
                                                        <div className="table-cell">
                                                            <span className="cell-label">Phone Number</span>
                                                            {/* ✅ from Appointment.Phone */}
                                                            <span className="cell-value">{apt.phone || '—'}</span>
                                                        </div>
                                                        <div className="table-cell">
                                                            <span className="cell-label">Payment</span>
                                                            {/* ✅ Auto Paid when Completed */}
                                                            <span className={`payment-badge payment-${displayPayment.toLowerCase()}`}>{displayPayment}</span>
                                                        </div>
                                                        <div className="table-cell">
                                                            <span className="cell-label">Appointment Status</span>
                                                            <span className="status-badge-inline" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                                                {cfg.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="card-footer-modern">
                                                    {/* ✅ Opens modal */}
                                                    <button className="modern-btn view-details-btn" onClick={() => setModalApt(apt)}>
                                                        <FaEye /> View Details <FaChevronRight className="btn-arrow" />
                                                    </button>
                                                    {canCancel && (
                                                        <button className="modern-btn cancel-modern-btn" onClick={() => handleCancel(apt.appointmentId)}>
                                                            <FaTrash /> Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ Appointment Detail Modal */}
            {modalApt && <AppointmentModal apt={modalApt} onClose={() => setModalApt(null)} />}
        </PatientLayout>
    );
};

export default PatientAppointments;