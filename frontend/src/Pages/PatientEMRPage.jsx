import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PatientLayout from "../components/PatientLayout";
import emrService from "../services/emrService";
import { appointmentsAPI } from "../services/apiConfig";
import {
    FaUser, FaIdBadge, FaBirthdayCake, FaVenusMars, FaPhone, FaEnvelope,
    FaMapMarkerAlt, FaShieldAlt, FaHeartbeat, FaAllergies, FaPills,
    FaStethoscope, FaEye, FaMicroscope, FaSyringe, FaFileMedical,
    FaNotesMedical, FaCalendarAlt, FaClock, FaExclamationTriangle,
    FaClipboardList, FaProcedures, FaPrescriptionBottleAlt
} from "react-icons/fa";
import "./PatientEMRPage.css";

/* ── helpers ── */
const extractNumericId = (id) => {
    if (!id) return null;
    if (/^\d+$/.test(id.toString())) return id.toString();
    const m = id.toString().match(/\d+/);
    return m ? m[0] : null;
};

const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const fmtGender = (g) => {
    if (g === 0 || g === "0") return "Male";
    if (g === 1 || g === "1") return "Female";
    if (g === 2 || g === "2") return "Other";
    return g || "—";
};

const calcAge = (dob) => {
    if (!dob) return null;
    const b = new Date(dob), t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
    return a;
};

/* ── tiny read-only field ── */
const Field = ({ label, value }) => (
    <div className="pemr-field">
        <div className="pemr-field-label">{label}</div>
        <div className={`pemr-field-value${!value || value === "—" ? " empty" : ""}`}>
            {value || "—"}
        </div>
    </div>
);

/* ── section wrapper ── */
const Section = ({ icon, color, title, children, isEmpty }) => {
    if (isEmpty) return null;
    return (
        <div className="pemr-section">
            <h3 className="pemr-section-title">
                <span className="pemr-section-icon" style={{ background: `${color}18`, color }}>{icon}</span>
                {title}
            </h3>
            {children}
        </div>
    );
};

/* ══════════════════════════════════════ */
function PatientEMRPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState(null);        // full medical record from API
    const [appointment, setAppointment] = useState(null); // latest appointment data
    const [hasEMR, setHasEMR] = useState(false);
    const [resolvedPatientId, setResolvedPatientId] = useState(null); // actual P-XXXX from appointments

    const lang = localStorage.getItem("lang") || "en";
    const patientId = localStorage.getItem("patientId");       // may be null if auth didn't return it
    const userEmail = localStorage.getItem("userEmail") || "";  // always available after login
    const patientName = localStorage.getItem("patientName") || localStorage.getItem("userName") || "";

    const t = lang === "ar" ? {
        title: "السجل الطبي الإلكتروني",
        noEmrTitle: "لا يوجد سجل طبي بعد",
        noEmrDesc: "يبدو إنك مريض جديد عندنا! سجلك الطبي هيتعمل تلقائي لما تزور العيادة وتكشف عند الدكتور.",
        noEmrBtn: "حجز موعد",
        loading: "جاري تحميل السجل الطبي...",
        personalInfo: "البيانات الشخصية",
        complaint: "شكوى المريض",
        medHistory: "التاريخ الطبي",
        eyeExam: "فحص العين",
        investigations: "الفحوصات",
        operations: "العمليات",
        prescriptions: "الوصفات الطبية",
        diagnoses: "التشخيصات",
        name: "الاسم", id: "رقم المريض", age: "العمر", gender: "النوع",
        phone: "الموبايل", email: "الايميل", address: "العنوان",
        insurance: "شركة التأمين", dob: "تاريخ الميلاد",
        visitDate: "تاريخ الزيارة",
        noData: "لا توجد بيانات مسجلة",
        allergies: "الحساسية", chronic: "الأمراض المزمنة",
        medications: "الأدوية الحالية", familyHistory: "تاريخ عائلي",
        eyeSurgeries: "عمليات سابقة", visionSymptoms: "أعراض الرؤية",
        drug: "الدواء", dose: "الجرعة", freq: "التكرار", notes: "ملاحظات",
        diagnosis: "التشخيص", severity: "الشدة", status: "الحالة",
        rightEye: "العين اليمنى", leftEye: "العين اليسرى",
        pressure: "ضغط العين", pupil: "استجابة البؤبؤ",
        opName: "اسم العملية", opDate: "التاريخ",
        type: "النوع", result: "النتيجة",
    } : {
        title: "Electronic Medical Record",
        noEmrTitle: "No Medical Record Yet",
        noEmrDesc: "It looks like you're a new patient! Your medical record will be created automatically when you visit the clinic and see the doctor.",
        noEmrBtn: "Book an Appointment",
        loading: "Loading your medical record...",
        personalInfo: "Personal Information",
        complaint: "Patient Complaint",
        medHistory: "Medical History",
        eyeExam: "Eye Examination",
        investigations: "Investigations",
        operations: "Operations",
        prescriptions: "Prescriptions",
        diagnoses: "Diagnoses",
        name: "Full Name", id: "Patient ID", age: "Age", gender: "Gender",
        phone: "Phone", email: "Email", address: "Address",
        insurance: "Insurance", dob: "Date of Birth",
        visitDate: "Visit Date",
        noData: "No data recorded",
        allergies: "Allergies", chronic: "Chronic Diseases",
        medications: "Current Medications", familyHistory: "Family History",
        eyeSurgeries: "Eye Surgeries", visionSymptoms: "Vision Symptoms",
        drug: "Drug", dose: "Dose", freq: "Frequency", notes: "Notes",
        diagnosis: "Diagnosis", severity: "Severity", status: "Status",
        rightEye: "Right Eye", leftEye: "Left Eye",
        pressure: "Eye Pressure", pupil: "Pupil Reaction",
        opName: "Operation", opDate: "Date",
        type: "Type", result: "Result",
    };

    /* ── fetch data ── */
    const fetchData = useCallback(async () => {
        // We need at least an email or a patientId to look up data
        if (!patientId && !userEmail) { setLoading(false); return; }
        try {
            setLoading(true);
            const numId = extractNumericId(patientId);

            // ── Step 1: Find the patient's appointments (by email OR patientId) ──
            let apt = null;
            let foundPatientId = patientId; // will be resolved from appointments if null
            try {
                const all = await appointmentsAPI.getAll();
                const mine = all.filter(a => {
                    // Match by email (most reliable since auth always gives us email)
                    if (userEmail && a.email && a.email.toLowerCase() === userEmail.toLowerCase()) return true;
                    // Match by patientId / numericId if available
                    const aId = a.patientId?.toString();
                    const aName = a.patientName?.toString();
                    return [patientId, numId].some(x => x && (aId === x || aName === x));
                });
                if (mine.length > 0) {
                    apt = mine.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0];
                    setAppointment(apt);
                    // Resolve the actual patientId from the appointment record (e.g. "P-629904")
                    if (!foundPatientId && apt.patientId) {
                        foundPatientId = apt.patientId;
                    }
                    setResolvedPatientId(foundPatientId || apt.patientId);
                }
            } catch (e) { console.warn("Could not fetch appointments:", e); }

            // ── Step 2: Check if medical record exists ──
            const idsToTry = [foundPatientId, numId, extractNumericId(foundPatientId)].filter(Boolean);
            let check = { exists: false };
            for (const tryId of [...new Set(idsToTry)]) {
                check = await emrService.checkMedicalRecordExists(tryId);
                if (check.exists) break;
            }

            // ── Step 3: Load medical record if it exists ──
            if (check.exists) {
                setHasEMR(true);
                const idToUse = extractNumericId(foundPatientId) || foundPatientId || numId;
                const rec = await emrService.getPatientMedicalRecord(idToUse);
                setRecord(rec);
            } else {
                setHasEMR(false);
            }
        } catch (err) {
            console.error("Error loading EMR:", err);
            setHasEMR(false);
        } finally {
            setLoading(false);
        }
    }, [patientId, userEmail]);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* ── derive display data ── */
    const pi = record?.patientInfo || record || {};
    const displayId = resolvedPatientId || patientId || pi.patientId || "";
    const name = pi.name || appointment?.patientName || patientName || "Patient";
    const age = pi.age || calcAge(pi.birthDate || pi.dateOfBirth || appointment?.patientBirthDate) || "—";
    const gender = fmtGender(pi.gender ?? appointment?.patientGender);
    const phone = pi.contactNumber || pi.phone || appointment?.phone || "—";
    const email = pi.email || appointment?.email || userEmail || "—";
    const address = pi.address || "—";
    const insuranceCompany = pi.insuranceCompany || "—";
    const dob = pi.birthDate || pi.dateOfBirth || appointment?.patientBirthDate;
    const visitDate = record?.visitDate || appointment?.appointmentDate;

    const complaints = record?.complaints || [];
    const histories = record?.histories || [];
    const eyeExams = record?.eyeExaminations || [];
    const investigations = record?.investigations || [];
    const operations = record?.operations || [];
    const prescriptions = record?.prescriptions || [];
    const diagnoses = record?.diagnoses || [];

    // Fallback history from appointment if DB has none
    const historyFromApt = (!histories.length && appointment) ? {
        allergies: appointment.eyeAllergies || "",
        chronicDiseases: appointment.chronicDiseases || "",
        currentMedications: appointment.currentMedications || "",
        familyEyeDiseases: appointment.familyEyeDiseases || "",
        eyeSurgeries: appointment.eyeSurgeries || "",
        visionSymptoms: appointment.visionSymptoms || "",
    } : null;

    const hasAnyHistory = histories.length > 0 || (historyFromApt && Object.values(historyFromApt).some(v => v));
    const complaintText = complaints.length > 0
        ? complaints.map(c => c.originalText || c.complaint || c.translatedText).filter(Boolean).join("; ")
        : (appointment?.reasonForVisit || "");

    /* ══════════════════════════════════════
       RENDER
    ══════════════════════════════════════ */

    /* Loading */
    if (loading) {
        return (
            <PatientLayout>
                <div className="pemr-wrap">
                    <div className="pemr-loading">
                        <div className="pemr-spinner" />
                        <p>{t.loading}</p>
                    </div>
                </div>
            </PatientLayout>
        );
    }

    /* No EMR */
    if (!hasEMR && !appointment) {
        return (
            <PatientLayout>
                <div className="pemr-wrap">
                    <div className="pemr-empty">
                        <div className="pemr-empty-icon"><FaFileMedical /></div>
                        <h2>{t.noEmrTitle}</h2>
                        <p>{t.noEmrDesc}</p>
                        <button className="pemr-empty-btn" onClick={() => navigate("/patient/appointments")}>
                            <FaCalendarAlt /> {t.noEmrBtn}
                        </button>
                    </div>
                </div>
            </PatientLayout>
        );
    }

    /* Has data — read-only view */
    return (
        <PatientLayout>
            <div className="pemr-wrap" dir={lang === "ar" ? "rtl" : "ltr"}>

                {/* ── Header ── */}
                <div className="pemr-header">
                    <div className="pemr-avatar"><FaUser /></div>
                    <div className="pemr-header-info">
                        <h1>{name}</h1>
                        <div className="pemr-header-meta">
                            <span><FaIdBadge /> {displayId || "—"}</span>
                            <span><FaVenusMars /> {gender}</span>
                            {age !== "—" && <span><FaBirthdayCake /> {age} yrs</span>}
                            {visitDate && <span><FaCalendarAlt /> {fmtDate(visitDate)}</span>}
                        </div>
                    </div>
                </div>

                {/* ── Personal Info ── */}
                <Section icon={<FaUser />} color="#1565c0" title={t.personalInfo}>
                    <div className="pemr-grid">
                        <Field label={t.name} value={name} />
                        <Field label={t.id} value={displayId} />
                        <Field label={t.age} value={age?.toString()} />
                        <Field label={t.gender} value={gender} />
                        <Field label={t.dob} value={fmtDate(dob)} />
                        <Field label={t.phone} value={phone} />
                        <Field label={t.email} value={email} />
                        <Field label={t.address} value={address} />
                        <Field label={t.insurance} value={insuranceCompany} />
                    </div>
                </Section>

                {/* ── Complaint ── */}
                <Section icon={<FaNotesMedical />} color="#e53935" title={t.complaint} isEmpty={!complaintText}>
                    <p style={{ fontSize: ".95rem", color: "#37474f", lineHeight: 1.7, margin: 0 }}>
                        {complaintText}
                    </p>
                </Section>

                {/* ── Medical History ── */}
                <Section icon={<FaHeartbeat />} color="#1565c0" title={t.medHistory} isEmpty={!hasAnyHistory}>
                    {histories.length > 0 ? histories.map((h, i) => (
                        <div key={i} className="pemr-grid" style={{ marginBottom: i < histories.length - 1 ? "1rem" : 0 }}>
                            <Field label={t.allergies} value={h.allergies || h.Allergies} />
                            <Field label={t.chronic} value={h.chronicDiseases || h.ChronicDiseases} />
                            <Field label={t.medications} value={h.currentMedications || h.CurrentMedications} />
                            <Field label={t.familyHistory} value={h.familyHistory || h.familyEyeDiseases || h.FamilyHistory} />
                            <Field label={t.eyeSurgeries} value={h.eyeSurgeries || h.EyeSurgeries || h.previousEye || h.PreviousEye} />
                            <Field label={t.visionSymptoms} value={h.visionSymptoms || h.VisionSymptoms} />
                        </div>
                    )) : historyFromApt && (
                        <div className="pemr-grid">
                            <Field label={t.allergies} value={historyFromApt.allergies} />
                            <Field label={t.chronic} value={historyFromApt.chronicDiseases} />
                            <Field label={t.medications} value={historyFromApt.currentMedications} />
                            <Field label={t.familyHistory} value={historyFromApt.familyEyeDiseases} />
                            <Field label={t.eyeSurgeries} value={historyFromApt.eyeSurgeries} />
                            <Field label={t.visionSymptoms} value={historyFromApt.visionSymptoms} />
                        </div>
                    )}
                </Section>

                {/* ── Eye Examination ── */}
                <Section icon={<FaEye />} color="#00695c" title={t.eyeExam} isEmpty={!eyeExams.length}>
                    {eyeExams.map((ex, i) => (
                        <div key={i} className="pemr-grid" style={{ marginBottom: i < eyeExams.length - 1 ? "1rem" : 0 }}>
                            <Field label={t.rightEye} value={ex.rightEye || ex.RightEye} />
                            <Field label={t.leftEye} value={ex.leftEye || ex.LeftEye} />
                            <Field label={t.pressure} value={ex.eyePressure || ex.EyePressure} />
                            <Field label={t.pupil} value={ex.pupilReaction || ex.PupilReaction} />
                            {(ex.anteriorSegment || ex.AnteriorSegment) &&
                                <Field label="Anterior Segment" value={ex.anteriorSegment || ex.AnteriorSegment} />}
                            {(ex.fundusObservation || ex.FundusObservation) &&
                                <Field label="Fundus" value={ex.fundusObservation || ex.FundusObservation} />}
                            {(ex.otherNotes || ex.OtherNotes) &&
                                <Field label={t.notes} value={ex.otherNotes || ex.OtherNotes} />}
                        </div>
                    ))}
                </Section>

                {/* ── Investigations ── */}
                <Section icon={<FaMicroscope />} color="#6a1b9a" title={t.investigations} isEmpty={!investigations.length}>
                    <table className="pemr-table">
                        <thead>
                            <tr>
                                <th>{t.type}</th>
                                <th>{t.result}</th>
                                <th>{t.notes}</th>
                                <th>{t.visitDate}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {investigations.map((inv, i) => (
                                <tr key={i}>
                                    <td>{inv.type || inv.Type || inv.investigationType || "—"}</td>
                                    <td>{inv.result || inv.Result || "—"}</td>
                                    <td>{inv.notes || inv.Notes || "—"}</td>
                                    <td>{fmtDate(inv.date || inv.Date || inv.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Section>

                {/* ── Operations ── */}
                <Section icon={<FaSyringe />} color="#e65100" title={t.operations} isEmpty={!operations.length}>
                    <table className="pemr-table">
                        <thead>
                            <tr>
                                <th>{t.opName}</th>
                                <th>{t.opDate}</th>
                                <th>{t.notes}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operations.map((op, i) => (
                                <tr key={i}>
                                    <td>{op.operationName || op.OperationName || "—"}</td>
                                    <td>{fmtDate(op.date || op.Date || op.createdAt)}</td>
                                    <td>{op.notes || op.Notes || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Section>

                {/* ── Prescriptions ── */}
                <Section icon={<FaPrescriptionBottleAlt />} color="#2e7d32" title={t.prescriptions} isEmpty={!prescriptions.length}>
                    {prescriptions.map((p, pi2) => {
                        const items = p.items || p.Items || [];
                        return (
                            <div key={pi2} style={{ marginBottom: pi2 < prescriptions.length - 1 ? "1.5rem" : 0 }}>
                                {p.notes || p.Notes ? (
                                    <p style={{ fontSize: ".85rem", color: "#607d8b", marginBottom: ".5rem" }}>
                                        <strong>{t.notes}:</strong> {p.notes || p.Notes}
                                    </p>
                                ) : null}
                                {items.length > 0 && (
                                    <table className="pemr-table">
                                        <thead>
                                            <tr>
                                                <th>{t.drug}</th>
                                                <th>{t.dose}</th>
                                                <th>{t.freq}</th>
                                                <th>{t.notes}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, ii) => (
                                                <tr key={ii}>
                                                    <td>{item.drug || item.Drug || item.medication || "—"}</td>
                                                    <td>{item.dose || item.Dose || item.customDose || "—"}</td>
                                                    <td>{item.frequency || item.Frequency || item.customFrequency || "—"}</td>
                                                    <td>{item.notes || item.Notes || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        );
                    })}
                </Section>

                {/* ── Diagnoses ── */}
                <Section icon={<FaClipboardList />} color="#4527a0" title={t.diagnoses} isEmpty={!diagnoses.length}>
                    <table className="pemr-table">
                        <thead>
                            <tr>
                                <th>{t.diagnosis}</th>
                                <th>{t.severity}</th>
                                <th>{t.status}</th>
                                <th>{t.notes}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {diagnoses.map((d, i) => (
                                <tr key={i}>
                                    <td>{d.diagnosis || d.Diagnosis || d.diagnosisName || "—"}</td>
                                    <td>
                                        {(d.severity || d.Severity) ? (
                                            <span className={`pemr-badge ${
                                                (d.severity || d.Severity) === "Mild" ? "green"
                                                : (d.severity || d.Severity) === "Moderate" ? "orange"
                                                : "red"
                                            }`}>
                                                {d.severity || d.Severity}
                                            </span>
                                        ) : "—"}
                                    </td>
                                    <td>{d.status || d.Status || "—"}</td>
                                    <td>{d.notes || d.Notes || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Section>

                {/* ── No data at all message ── */}
                {!complaintText && !hasAnyHistory && !eyeExams.length && !investigations.length &&
                 !operations.length && !prescriptions.length && !diagnoses.length && (
                    <div className="pemr-section" style={{ textAlign: "center", padding: "3rem 2rem" }}>
                        <FaExclamationTriangle style={{ fontSize: "2rem", color: "#ffa726", marginBottom: ".75rem" }} />
                        <p style={{ color: "#607d8b", fontSize: "1rem", margin: 0 }}>
                            {t.noData}
                        </p>
                    </div>
                )}

            </div>
        </PatientLayout>
    );
}

export default PatientEMRPage;
