import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import MedicalRecord from "../EMR/MedicalRecord";
import { CircularProgress, Alert, Box } from "@mui/material";
import { 
    CalendarMonth, Phone, Edit, Description, Science, Visibility,
    LocalHospital, Medication, Assignment, EventNote, AccessTime,
    CheckCircle, HistoryEdu, MedicalServices, Person, Email,
    Home, CreditCard, ExpandMore, Badge, CloudDownload
} from '@mui/icons-material';
import emrService from '../services/emrService';
import { appointmentsAPI } from '../services/apiConfig';

// ===== History Timeline Component (GitHub-style) =====
function HistoryTimeline({ entries }) {
    if (!entries || entries.length === 0) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return "Unknown date";
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const typeConfig = {
        complaint: { color: "#e53935", bg: "#fce4ec", IconComponent: MedicalServices, label: "Complaint" },
        history: { color: "#1565c0", bg: "#e3f2fd", IconComponent: Description, label: "Medical History" },
        investigation: { color: "#6a1b9a", bg: "#f3e5f5", IconComponent: Science, label: "Investigation" },
        eyeExamination: { color: "#00695c", bg: "#e0f2f1", IconComponent: Visibility, label: "Eye Examination" },
        operation: { color: "#e65100", bg: "#fff3e0", IconComponent: LocalHospital, label: "Operation" },
        prescription: { color: "#2e7d32", bg: "#e8f5e9", IconComponent: Medication, label: "Prescription" },
        diagnosis: { color: "#4527a0", bg: "#ede7f6", IconComponent: Assignment, label: "Diagnosis" },
        appointment: { color: "#0277bd", bg: "#e1f5fe", IconComponent: CalendarMonth, label: "Appointment" },
    };

    return (
        <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            marginBottom: "24px"
        }}>
            <h2 style={{
                margin: "0 0 24px 0",
                fontSize: "20px",
                fontWeight: "700",
                color: "#1e3a5f",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                borderBottom: "2px solid #e8f0fe",
                paddingBottom: "14px"
            }}>
                <HistoryEdu /> Patient History Timeline
            </h2>

            <div style={{ position: "relative" }}>
                {/* Vertical line */}
                <div style={{
                    position: "absolute",
                    left: "20px",
                    top: "0",
                    bottom: "0",
                    width: "2px",
                    background: "linear-gradient(to bottom, #29b6f6, #e0e0e0)",
                    borderRadius: "2px"
                }} />

                {entries.map((entry, idx) => {
                    const cfg = typeConfig[entry.type] || typeConfig.appointment;
                    return (
                        <div key={idx} style={{
                            display: "flex",
                            gap: "20px",
                            marginBottom: idx < entries.length - 1 ? "24px" : "0",
                            position: "relative"
                        }}>
                            {/* Icon bubble */}
                            <div style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                background: cfg.bg,
                                border: `2px solid ${cfg.color}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                                flexShrink: 0,
                                zIndex: 1,
                                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                            }}>
                                <cfg.IconComponent sx={{ fontSize: 20, color: cfg.color }} />
                            </div>

                            {/* Content card */}
                            <div style={{
                                flex: 1,
                                background: cfg.bg,
                                borderRadius: "12px",
                                padding: "14px 18px",
                                border: `1px solid ${cfg.color}30`,
                                transition: "box-shadow 0.2s",
                            }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "8px",
                                    flexWrap: "wrap",
                                    gap: "6px"
                                }}>
                                    <span style={{
                                        background: cfg.color,
                                        color: "white",
                                        padding: "3px 10px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        letterSpacing: "0.5px"
                                    }}>
                                        {cfg.label}
                                    </span>
                                    <span style={{
                                        fontSize: "12px",
                                        color: "#666",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px"
                                    }}>
                                        <CalendarMonth sx={{ fontSize: 14 }} /> {formatDate(entry.date)} · <AccessTime sx={{ fontSize: 14 }} /> {formatTime(entry.date)}
                                    </span>
                                </div>
                                <p style={{
                                    margin: 0,
                                    fontSize: "14px",
                                    color: "#2c3e50",
                                    lineHeight: "1.6",
                                    whiteSpace: "pre-wrap"
                                }}>
                                    {entry.summary}
                                </p>
                                {entry.details && (
                                    <p style={{
                                        margin: "6px 0 0 0",
                                        fontSize: "13px",
                                        color: "#555",
                                        lineHeight: "1.5",
                                        borderTop: `1px solid ${cfg.color}20`,
                                        paddingTop: "6px"
                                    }}>
                                        {entry.details}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ===== Appointment Info Card =====


// ===== Main EMRPage =====
function EMRPage() {
    const navigate = useNavigate();
    const { patientId } = useParams();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [patientData, setPatientData] = useState(null);
    const [medicalRecordExists, setMedicalRecordExists] = useState(false);
    const [medicalRecordId, setMedicalRecordId] = useState(null);
    const [appointmentRawData, setAppointmentRawData] = useState(null);
    const [numericPatientId, setNumericPatientId] = useState(null); // ✅ الـ ID الرقمي الصحيح
    const numericPatientIdRef = React.useRef(null); // ✅ ref for stable callbacks
    const [lastModified, setLastModified] = useState(null); // ✅ تاريخ آخر تعديل
    const [loadingFromDB, setLoadingFromDB] = useState(false); // ✅ تحميل من الداتا بيز
    const [lastSaved, setLastSaved] = useState(null); // ✅ آخر save: { section, timestamp }

    const userRole = localStorage.getItem("userRole");
    const currentPatientId = localStorage.getItem("patientId");

    // ===== استخراج الـ numeric ID من أي صيغة =====
    const extractNumericId = React.useCallback((id) => {
        if (!id) return null;
        // لو رقم بالفعل
        if (/^\d+$/.test(id.toString())) return id.toString();
        // لو صيغة زي "P-629904" أو "PAT-123"
        const match = id.toString().match(/\d+/);
        return match ? match[0] : null;
    }, []);

    // ===== بناء timeline من بيانات السجل الطبي =====
    // التحقق من الصلاحيات
    React.useEffect(() => {
        if (userRole !== "Doctor" && userRole !== "Patient") {
            navigate("/login");
        }
        if (userRole === "Patient" && patientId && patientId !== currentPatientId) {
            navigate("/patient");
        }
    }, [userRole, navigate, patientId, currentPatientId]);

    // ===== Format Functions (defined before useEffect) =====
    const calculateAge = React.useCallback((dob) => {
        if (!dob) return null;
        try {
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
            return age;
        } catch { return null; }
    }, []);

    const formatGender = React.useCallback((genderCode) => {
        if (genderCode === 0 || genderCode === "0") return "Male";
        if (genderCode === 1 || genderCode === "1") return "Female";
        if (genderCode === 2 || genderCode === "2") return "Other";
        return genderCode || "Not specified";
    }, []);

    const formatMedicalRecordData = React.useCallback((medicalRecord, appointment) => {
        // Support both nested patientInfo and flat structure
        const patientInfo = medicalRecord.patientInfo || medicalRecord;

        // ── complaints: DB first, fall back to appointment reasonForVisit ──
        const dbComplaints = medicalRecord.complaints || [];
        const complaints = dbComplaints.length > 0
            ? dbComplaints
            : (appointment?.reasonForVisit
                ? [{ complaint: appointment.reasonForVisit, originalText: appointment.reasonForVisit, createdAt: appointment.appointmentDate }]
                : []);

        // ── histories: DB first, fall back to appointment medical history fields ──
        const dbHistories = medicalRecord.histories || [];
        const hasAptHistory = appointment && (
            appointment.chronicDiseases || appointment.currentMedications ||
            appointment.eyeAllergies || appointment.familyEyeDiseases ||
            appointment.visionSymptoms || appointment.eyeSurgeries ||
            appointment.otherEyeSurgeries
        );
        const histories = dbHistories.length > 0
            ? dbHistories
            : (hasAptHistory ? [{
                previousEye: appointment.eyeSurgeries || appointment.otherEyeSurgeries || "",
                familyHistory: appointment.familyEyeDiseases || "",
                allergies: appointment.eyeAllergies || "",
                chronicDiseases: appointment.chronicDiseases || "",
                currentMedications: appointment.currentMedications || "",
                eyeSurgeries: appointment.eyeSurgeries || appointment.otherEyeSurgeries || "",
                familyEyeDiseases: appointment.familyEyeDiseases || "",
                visionSymptoms: appointment.visionSymptoms || "",
                createdAt: appointment.appointmentDate
            }] : []);

        return {
            name: patientInfo.name || appointment?.patientName || "Patient",
            patientID: patientInfo.patientId || numericPatientIdRef.current || patientId || "Unknown",
            age: patientInfo.age || calculateAge(patientInfo.birthDate || patientInfo.dateOfBirth) || null,
            gender: formatGender(patientInfo.gender),
            contactNumber: patientInfo.contactNumber || patientInfo.phone || appointment?.phone || "",
            email: patientInfo.email || appointment?.email || "",
            address: patientInfo.address || "",
            insuranceCompany: patientInfo.insuranceCompany || "",
            birthDate: patientInfo.birthDate || patientInfo.dateOfBirth || null,
            visitDate: medicalRecord.visitDate
                ? new Date(medicalRecord.visitDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            nationalId: patientInfo.nationalId || "",
            insuranceId: patientInfo.insuranceId || "",
            policyNumber: patientInfo.policyNumber || "",
            coverage: patientInfo.coverage || "",
            emergencyContactName: patientInfo.emergencyContactName || "",
            emergencyContactPhone: patientInfo.emergencyContactPhone || "",
            complaints,
            histories,
            investigations: medicalRecord.investigations || [],
            eyeExaminations: medicalRecord.eyeExaminations || [],
            operations: medicalRecord.operations || [],
            medicalTestFiles: medicalRecord.medicalTestFiles || [],
            prescriptions: medicalRecord.prescriptions || [],
            diagnoses: medicalRecord.diagnoses || []
        };
    }, [patientId, calculateAge, formatGender]);

    const formatAppointmentData = React.useCallback((a) => {
        // ✅ Fix swapped PatientId/PatientName in database
        // Check if patientId contains a name (has spaces/letters) instead of ID
        let actualPatientId = a.patientId;
        let actualPatientName = a.patientName;
        
        // If patientId looks like a name (contains space or doesn't start with P-/PAT-)
        if (actualPatientId && (actualPatientId.includes(' ') || 
            (!actualPatientId.startsWith('P-') && !actualPatientId.startsWith('PAT-')))) {
            // Swap them - the values are reversed in DB
            const temp = actualPatientId;
            actualPatientId = actualPatientName || numericPatientIdRef.current || patientId;
            actualPatientName = temp;
        }

        let ageValue = a.age;
        const ageNum = parseInt(ageValue, 10);
        if (!ageValue || ageValue === 'null' || isNaN(ageNum) || ageNum === 0) {
            ageValue = calculateAge(a.patientBirthDate);
        }

        return {
            name: actualPatientName || `Patient ${actualPatientId}`,
            patientID: actualPatientId || numericPatientIdRef.current || patientId || "Unknown",
            age: ageValue || "Not specified",
            gender: formatGender(a.patientGender ?? a.gender),
            contactNumber: a.phone || a.contactNumber || "",
            email: a.email || "",
            address: a.address || "",
            insuranceCompany: a.insuranceCompany || "",
            birthDate: a.patientBirthDate || null,
            visitDate: a.appointmentDate
                ? new Date(a.appointmentDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            nationalId: a.nationalId || "",
            insuranceId: a.insuranceId || "",
            policyNumber: a.policyNumber || "",
            coverage: a.coverage || "",
            emergencyContactName: a.emergencyContactName || "",
            emergencyContactPhone: a.emergencyContactPhone || "",
            complaints: a.reasonForVisit ? [{ complaint: a.reasonForVisit, originalText: a.reasonForVisit, createdAt: a.appointmentDate }] : [],
            histories: (a.chronicDiseases || a.currentMedications || a.eyeAllergies || a.familyEyeDiseases || a.visionSymptoms || a.eyeSurgeries) ? [{
                previousEye: a.eyeSurgeries || a.otherEyeSurgeries || "",
                familyHistory: a.familyEyeDiseases || "",
                allergies: a.eyeAllergies || "",
                chronicDiseases: a.chronicDiseases || "",
                currentMedications: a.currentMedications || "",
                eyeSurgeries: a.eyeSurgeries || a.otherEyeSurgeries || "",
                familyEyeDiseases: a.familyEyeDiseases || "",
                visionSymptoms: a.visionSymptoms || "",
                createdAt: a.appointmentDate
            }] : [],
            investigations: [],
            eyeExaminations: [],
            operations: a.eyeSurgeries ? [{ OperationName: a.eyeSurgeries, Date: a.appointmentDate, Notes: a.otherEyeSurgeries || "", CreatedAt: a.appointmentDate }] : [],
            medicalTestFiles: [],
            prescriptions: a.currentMedications ? [{ Instructions: a.currentMedications, PrescriptionDate: a.appointmentDate, CreatedAt: a.appointmentDate, Items: [] }] : [],
            diagnoses: []
        };
    }, [patientId, calculateAge, formatGender]);

    const getFallbackData = React.useCallback((id) => ({
        name: "Patient",
        patientID: id || "Unknown",
        age: null,
        gender: "Not specified",
        contactNumber: "", email: "", address: "", insuranceCompany: "",
        birthDate: null, visitDate: new Date().toISOString().split('T')[0],
        nationalId: "", insuranceId: "", policyNumber: "", coverage: "",
        emergencyContactName: "", emergencyContactPhone: ""
    }), []);

    // ===== Main data fetching effect =====
    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                setLoading(true);
                setError("");

                // ✅ استخراج الـ ID الرقمي الصحيح
                const rawId = patientId || (userRole === "Patient" ? currentPatientId : null);
                console.log("🔍 Raw ID:", rawId);
                if (!rawId) throw new Error("No patient ID found");

                const numId = extractNumericId(rawId);
                console.log("🔢 Numeric ID:", numId);
                numericPatientIdRef.current = numId;
                setNumericPatientId(numId);

                // ✅ Keep original rawId for matching (e.g. "P-012") and numId for DB lookups
                const idToFetch = numId || rawId;
                console.log("🎯 ID to Fetch:", idToFetch, "| Raw ID:", rawId);

                // Step 1: (history no longer displayed in UI, skip)
                console.log("📋 Step 1: Skipping history fetch (not used in UI).");

                // التحقق من وجود سجل طبي — try rawId first (e.g. "P-012"), then numId
                console.log("📋 Step 2: Checking if medical record exists...");
                let checkResult = await emrService.checkMedicalRecordExists(rawId);
                if (!checkResult.exists && numId && numId !== rawId) {
                    checkResult = await emrService.checkMedicalRecordExists(numId);
                }
                console.log("✅ Check result:", checkResult);
                setMedicalRecordExists(checkResult.exists);

                let appointmentData = null;
                let medicalRecord = null;

                // ✅ جلب بيانات الـ appointment دايمًا (إن وجدت)
                console.log("📋 Step 3: Fetching appointments...");
                let correctedPatientId = null; // ✅ متغير محلي لتخزين الـ ID الصحيح
                
                try {
                    const appointments = await appointmentsAPI.getAll();
                    console.log("✅ All appointments count:", appointments.length);
                    const patientAppointments = appointments.filter(a => {
                        // Check both patientId and patientName (in case they're swapped in DB)
                        const aPatientId = a.patientId?.toString();
                        const aPatientName = a.patientName?.toString();
                        const searchId = idToFetch?.toString();
                        const originalId = rawId?.toString(); // ✅ Keep original e.g. "P-012"
                        
                        return aPatientId === searchId || 
                               aPatientId === originalId ||
                               aPatientName === searchId ||
                               aPatientName === originalId ||
                               // Also check if patientName field contains the ID we're looking for
                               (aPatientName && (aPatientName.startsWith('P-') || aPatientName.startsWith('PAT-')) && (aPatientName === searchId || aPatientName === originalId));
                    });
                    console.log("✅ Patient appointments count:", patientAppointments.length);
                    
                    if (patientAppointments.length > 0) {
                        // أحدث appointment
                        appointmentData = patientAppointments.sort(
                            (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
                        )[0];
                        console.log("✅ Selected appointment:", appointmentData);
                        setAppointmentRawData(appointmentData);
                        
                        // ✅ استخدام الـ patientId الصحيح من الـ appointment
                        if (appointmentData.patientId || appointmentData.patientName) {
                            // Check which field has the actual ID
                            const correctId = (appointmentData.patientId && 
                                (appointmentData.patientId.startsWith('P-') || 
                                 appointmentData.patientId.startsWith('PAT-') || 
                                 /^\d+$/.test(appointmentData.patientId)))
                                ? appointmentData.patientId
                                : (appointmentData.patientName && 
                                   (appointmentData.patientName.startsWith('P-') || 
                                    appointmentData.patientName.startsWith('PAT-') || 
                                    /^\d+$/.test(appointmentData.patientName)))
                                ? appointmentData.patientName
                                : null;
                            
                            if (correctId) {
                                console.log("🔧 Correcting ID from appointment:", correctId);
                                const correctedNumId = extractNumericId(correctId);
                                if (correctedNumId) {
                                    correctedPatientId = correctedNumId; // ✅ حفظ في متغير محلي
                                    numericPatientIdRef.current = correctedNumId;
                                    setNumericPatientId(correctedNumId);
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn("⚠️ Could not fetch appointments:", e);
                }

                console.log("📋 Step 4: Loading patient data...");
                
                // ✅ استخدام الـ ID الصحيح (من appointment إن وُجد، أو من الأصلي)
                const finalIdToFetch = correctedPatientId || numId || idToFetch;
                const finalRawId = rawId; // ✅ Keep original for fallback
                console.log("🎯 Final ID to use:", finalIdToFetch, "| Raw:", finalRawId);

                // ✅ إعادة جلب التاريخ والتحقق باستخدام الـ ID الصحيح إذا تغير
                if (correctedPatientId && correctedPatientId !== rawId && correctedPatientId !== numId) {
                    console.log("🔄 Re-checking existence with corrected ID:", correctedPatientId);
                    const correctedCheck = await emrService.checkMedicalRecordExists(correctedPatientId);
                    console.log("✅ Corrected check result:", correctedCheck);
                    checkResult.exists = correctedCheck.exists;
                    checkResult.recordId = correctedCheck.recordId;
                }
                
                if (checkResult.exists) {
                    console.log("✅ Medical record exists, loading from database...");
                    setMedicalRecordId(checkResult.recordId);
                    medicalRecord = await emrService.getPatientMedicalRecord(finalIdToFetch);
                    console.log("📋 Medical Record from API:", medicalRecord);
                    const formattedData = formatMedicalRecordData(medicalRecord, appointmentData);
                    console.log("✅ Formatted Data:", formattedData);
                    setPatientData(formattedData);
                    // ✅ حفظ آخر تاريخ تعديل
                    if (medicalRecord.updatedAt) {
                        setLastModified(medicalRecord.updatedAt);
                    } else if (medicalRecord.createdAt) {
                        setLastModified(medicalRecord.createdAt);
                    }
                } else if (appointmentData) {
                    console.log("📅 No medical record, using appointment data...");
                    console.log("📅 Appointment Data:", appointmentData);
                    const appointmentFormatted = formatAppointmentData(appointmentData);
                    console.log("✅ Formatted Appointment Data:", appointmentFormatted);
                    setPatientData(appointmentFormatted);
                } else {
                    console.log("⚠️ No data available, using fallback...");
                    setPatientData(getFallbackData(idToFetch));
                }

                console.log("✅ All done! Patient data loaded successfully.");

            } catch (err) {
                console.error("❌ Full Error:", err);
                console.error("❌ Error Message:", err.message);
                console.error("❌ Error Stack:", err.stack);
                if (err.response) {
                    console.error("❌ API Response:", err.response);
                    console.error("❌ API Status:", err.response.status);
                    console.error("❌ API Data:", err.response.data);
                }
                setError(`Failed to load patient data: ${err.message || 'Unknown error'}`);
                const rawId = patientId || currentPatientId;
                const numId = extractNumericId(rawId);
                setPatientData(getFallbackData(numId || rawId));
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [patientId, location, currentPatientId, userRole, extractNumericId, formatAppointmentData, formatMedicalRecordData, getFallbackData]);

    const handleCreateMedicalRecord = async () => {
        try {
            setLoading(true);
            const idToUse = patientId || numericPatientId; // ✅ prefer original "P-012" format
            const response = await emrService.createMedicalRecord(idToUse);

            if (response && response.success) {
                const newRecordId = response.recordId;
                setMedicalRecordId(newRecordId);
                setMedicalRecordExists(true);
                const now = new Date().toISOString();
                setLastModified(now);

                // ✅ Reload from DB to get real patient info (name, age, etc.)
                try {
                    const medicalRecord = await emrService.getMedicalRecordById(newRecordId);
                    const formattedData = formatMedicalRecordData(medicalRecord, appointmentRawData);
                    setPatientData(prev => ({
                        ...prev,
                        // Overwrite with DB data but keep appointment values as fallback
                        name: formattedData.name || prev?.name || "Patient",
                        patientID: formattedData.patientID || prev?.patientID || idToUse,
                        age: formattedData.age || prev?.age || null,
                        gender: formattedData.gender || prev?.gender || "Not specified",
                        contactNumber: formattedData.contactNumber || prev?.contactNumber || "",
                        email: formattedData.email || prev?.email || "",
                        address: formattedData.address || prev?.address || "",
                        birthDate: formattedData.birthDate || prev?.birthDate || null,
                        nationalId: formattedData.nationalId || prev?.nationalId || "",
                        insuranceCompany: formattedData.insuranceCompany || prev?.insuranceCompany || "",
                        insuranceId: formattedData.insuranceId || prev?.insuranceId || "",
                        emergencyContactName: formattedData.emergencyContactName || prev?.emergencyContactName || "",
                        emergencyContactPhone: formattedData.emergencyContactPhone || prev?.emergencyContactPhone || "",
                        visitDate: new Date().toISOString().split('T')[0],
                        // ✅ Keep appointment sub-arrays as pre-fill (DB is empty after fresh create)
                        complaints: prev?.complaints || [],
                        histories: prev?.histories || [],
                        investigations: prev?.investigations || [],
                        eyeExaminations: prev?.eyeExaminations || [],
                        operations: prev?.operations || [],
                        medicalTestFiles: prev?.medicalTestFiles || [],
                        prescriptions: prev?.prescriptions || [],
                        diagnoses: prev?.diagnoses || []
                    }));
                } catch (reloadErr) {
                    console.warn("Could not reload patient info after create:", reloadErr);
                    setPatientData(prev => ({
                        ...prev,
                        visitDate: new Date().toISOString().split('T')[0],
                    }));
                }

                alert("Medical record created successfully! You can now save each section.");
            } else {
                throw new Error(response?.message || "Failed to create medical record");
            }
        } catch (err) {
            console.error("Error creating medical record:", err);
            alert("Failed to create medical record: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ تحميل كل بيانات السجل الطبي من الداتا بيز
    const handleLoadFromDatabase = async () => {
        if (!medicalRecordId) return;
        try {
            setLoadingFromDB(true);
            setError("");
            const medicalRecord = await emrService.getMedicalRecordById(medicalRecordId);
            const formattedData = formatMedicalRecordData(medicalRecord, appointmentRawData);
            // ✅ تحميل كل البيانات مع الحفاظ على بيانات المريض الأساسية
            setPatientData(prev => ({
                ...formattedData,
                name: formattedData.name || prev?.name || "Patient",
                patientID: formattedData.patientID || prev?.patientID || "",
                age: formattedData.age || prev?.age || null,
                gender: formattedData.gender || prev?.gender || "Not specified",
                contactNumber: formattedData.contactNumber || prev?.contactNumber || "",
                email: formattedData.email || prev?.email || "",
                address: formattedData.address || prev?.address || "",
                birthDate: formattedData.birthDate || prev?.birthDate || null,
                nationalId: formattedData.nationalId || prev?.nationalId || "",
                insuranceCompany: formattedData.insuranceCompany || prev?.insuranceCompany || "",
                insuranceId: formattedData.insuranceId || prev?.insuranceId || "",
                policyNumber: formattedData.policyNumber || prev?.policyNumber || "",
                coverage: formattedData.coverage || prev?.coverage || "",
                emergencyContactName: formattedData.emergencyContactName || prev?.emergencyContactName || "",
                emergencyContactPhone: formattedData.emergencyContactPhone || prev?.emergencyContactPhone || "",
            }));
            if (medicalRecord.updatedAt) setLastModified(medicalRecord.updatedAt);
            else if (medicalRecord.createdAt) setLastModified(medicalRecord.createdAt);
            // (history list no longer needed in UI)
        } catch (err) {
            console.error("Error loading from database:", err);
            setError("Failed to load data from database: " + err.message);
        } finally {
            setLoadingFromDB(false);
        }
    };

    const handleBack = () => {
        navigate(userRole === "Patient" ? "/patient" : "/doctor");
    };

    // ✅ callback بيتفعل بعد كل save بدون reload - بيجيب أحدث بيانات من DB
    const onSectionSaved = async (sectionName) => {
        const now = new Date().toISOString();
        setLastSaved({ section: sectionName, timestamp: now });
        setLastModified(now);
        // ✅ Re-fetch من DB عشان كل الفورمز تتحدث بأحدث بيانات محفوظة
        if (medicalRecordId) {
            try {
                const medicalRecord = await emrService.getMedicalRecordById(medicalRecordId);
                const formattedData = formatMedicalRecordData(medicalRecord, appointmentRawData);
                setPatientData(prev => ({
                    ...formattedData,
                    // ✅ الحفاظ على بيانات المريض الشخصية (ممكن تكون فاضية في الـ medical record)
                    name: formattedData.name || prev?.name || "Patient",
                    patientID: formattedData.patientID || prev?.patientID || "",
                    age: formattedData.age || prev?.age || null,
                    gender: formattedData.gender || prev?.gender || "Not specified",
                    contactNumber: formattedData.contactNumber || prev?.contactNumber || "",
                    email: formattedData.email || prev?.email || "",
                    address: formattedData.address || prev?.address || "",
                    birthDate: formattedData.birthDate || prev?.birthDate || null,
                    nationalId: formattedData.nationalId || prev?.nationalId || "",
                    insuranceCompany: formattedData.insuranceCompany || prev?.insuranceCompany || "",
                    insuranceId: formattedData.insuranceId || prev?.insuranceId || "",
                    policyNumber: formattedData.policyNumber || prev?.policyNumber || "",
                    coverage: formattedData.coverage || prev?.coverage || "",
                    emergencyContactName: formattedData.emergencyContactName || prev?.emergencyContactName || "",
                    emergencyContactPhone: formattedData.emergencyContactPhone || prev?.emergencyContactPhone || "",
                }));
            } catch (err) {
                console.warn("Could not re-fetch after save:", err);
            }
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div style={{ width: "100%", minHeight: "100vh", padding: "20px", backgroundColor: "#f0f4f8" }}>

            {/* Navigation Bar */}
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                <button
                    onClick={handleBack}
                    style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "10px 20px", backgroundColor: "#29b6f6",
                        color: "white", border: "none", borderRadius: "8px",
                        cursor: "pointer", fontWeight: "500", fontSize: "14px"
                    }}
                >
                    ← Back to {userRole === "Patient" ? "Home" : "Dashboard"}
                </button>

                {userRole === "Doctor" && !medicalRecordExists && (
                    <button
                        onClick={handleCreateMedicalRecord}
                        style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "10px 20px", backgroundColor: "#4caf50",
                            color: "white", border: "none", borderRadius: "8px",
                            cursor: "pointer", fontWeight: "500", fontSize: "14px"
                        }}
                    >
                        ➕ Create Medical Record
                    </button>
                )}

                {/* ✅ بعد ال Create - يتحول لزر آخر save ولو دوستيه يحمل من DB */}
                {userRole === "Doctor" && medicalRecordExists && lastSaved && (
                    <button
                        onClick={handleLoadFromDatabase}
                        disabled={loadingFromDB}
                        title="Click to reload latest data from database"
                        style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "8px 16px",
                            backgroundColor: "#1b5e20",
                            color: "white", border: "2px solid #4caf50",
                            borderRadius: "10px",
                            cursor: loadingFromDB ? "not-allowed" : "pointer",
                            fontWeight: "500", fontSize: "13px",
                            opacity: loadingFromDB ? 0.7 : 1,
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { if (!loadingFromDB) e.currentTarget.style.backgroundColor = "#2e7d32"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1b5e20"; }}
                    >
                        <CheckCircle sx={{ fontSize: 18, color: "#a5d6a7" }} />
                        <div style={{ textAlign: "left", lineHeight: 1.3 }}>
                            <div style={{ fontSize: "10px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Last Saved</div>
                            <div style={{ fontWeight: 700, fontSize: "13px" }}>{lastSaved.section}</div>
                            <div style={{ fontSize: "11px", opacity: 0.75 }}>
                                {new Date(lastSaved.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </button>
                )}
            </div>

            {error && <Alert severity="error" style={{ marginBottom: "20px" }}>{error}</Alert>}

            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #1e3a5f 0%, #29b6f6 100%)",
                color: "white",
                padding: "24px 30px",
                borderRadius: "16px",
                marginBottom: "25px",
                boxShadow: "0 4px 16px rgba(30, 58, 95, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px"
            }}>
                {/* Patient Name + ID + Last Updated */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                        width: "52px", height: "52px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "2px solid rgba(255,255,255,0.35)",
                        flexShrink: 0
                    }}>
                        <Person sx={{ fontSize: 30, color: "white" }} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700", letterSpacing: "0.3px" }}>
                            {patientData?.name || "Patient"}
                        </h1>
                        <div style={{
                            display: "flex", alignItems: "center", flexWrap: "wrap",
                            gap: "12px", marginTop: "6px", fontSize: "13px", opacity: 0.9
                        }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <Badge sx={{ fontSize: 14 }} />
                                ID: {numericPatientId || patientData?.patientID || "—"}
                            </span>
                            {lastModified && (
                                <span style={{
                                    display: "flex", alignItems: "center", gap: "5px",
                                    borderLeft: "1px solid rgba(255,255,255,0.35)", paddingLeft: "12px"
                                }}>
                                    <Edit sx={{ fontSize: 14 }} />
                                    {lastSaved?.section ? `${lastSaved.section} · ` : ""}
                                    {new Date(lastModified).toLocaleString('en-US', {
                                        year: 'numeric', month: 'short', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                                    })}
                                </span>
                            )}
                            {patientData?.visitDate && (
                                <span style={{
                                    display: "flex", alignItems: "center", gap: "5px",
                                    borderLeft: "1px solid rgba(255,255,255,0.35)", paddingLeft: "12px"
                                }}>
                                    <EventNote sx={{ fontSize: 14 }} />
                                    {new Date(patientData.visitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Warning for doctors */}
            {!medicalRecordExists && userRole === "Doctor" && (
                <div style={{
                    marginBottom: "20px", padding: "15px",
                    backgroundColor: "#fff3cd", border: "1px solid #ffeaa7",
                    borderRadius: "8px", color: "#856404"
                }}>
                    <strong>Note:</strong> No permanent medical record yet.
                    Data is from appointment records. Click "Create Medical Record" to start a permanent record.
                </div>
            )}



            {/* Main Medical Record */}
            <main>
                {patientData && (
                    <MedicalRecord
                        patientName={patientData.name}
                        patientId={numericPatientId || patientData.patientID}
                        initialPatientData={patientData}
                        fromAppointment={!medicalRecordExists}
                        medicalRecordId={medicalRecordId}
                        onSectionSaved={onSectionSaved}
                        readOnly={userRole === 'Patient'}
                        userRole={userRole}
                    />
                )}
            </main>
        </div>
    );
}

export default EMRPage;