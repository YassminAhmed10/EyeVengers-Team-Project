import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import MedicalRecord from "../EMR/MedicalRecord";
import { CircularProgress, Alert, Box } from "@mui/material";
import { 
    CalendarMonth, Phone, Edit, Description, Science, Visibility,
    LocalHospital, Medication, Assignment, EventNote, AccessTime,
    CheckCircle, HistoryEdu, MedicalServices, Person, Email,
    Home, CreditCard, ExpandMore, Badge, CloudDownload, Add
} from '@mui/icons-material';
import emrService from '../services/emrService';
import { appointmentsAPI } from '../services/apiConfig';

// ===== History Timeline Component =====
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
    const [numericPatientId, setNumericPatientId] = useState(null);
    const numericPatientIdRef = React.useRef(null);
    const [lastModified, setLastModified] = useState(null);
    const [loadingFromDB, setLoadingFromDB] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    const userRole = localStorage.getItem("userRole");
    const currentPatientId = localStorage.getItem("patientId");

    const extractNumericId = React.useCallback((id) => {
        if (!id) return null;
        // Remove 'P-' or 'PAT-' prefix first
        const cleaned = String(id).replace(/^(P-|PAT-)/i, '').trim();
        // If it's pure numeric, return it
        if (/^\d+$/.test(cleaned)) return cleaned;
        // Otherwise try to extract first numeric sequence
        const match = cleaned.match(/(\d+)/);
        const extracted = match ? match[1] : null;
        console.log(`[EXTRACT ID] Input: "${id}" → Cleaned: "${cleaned}" → Extracted: "${extracted}"`);
        return extracted;
    }, []);

    // التحقق من الصلاحيات
    React.useEffect(() => {
        if (userRole !== "Doctor" && userRole !== "Patient") {
            navigate("/login");
        }
        if (userRole === "Patient" && patientId && patientId !== currentPatientId) {
            navigate("/patient");
        }
    }, [userRole, navigate, patientId, currentPatientId]);

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
        // Patient info is at root level of API response
        const patientInfo = medicalRecord;

        console.log("[FORMAT] API Response Patient Fields:", {
            name: medicalRecord.name,
            age: medicalRecord.age,
            gender: medicalRecord.gender,
            contactNumber: medicalRecord.contactNumber,
            email: medicalRecord.email,
            address: medicalRecord.address,
            birthDate: medicalRecord.birthDate,
            insuranceCompany: medicalRecord.insuranceCompany,
            emergencyContactName: medicalRecord.emergencyContactName
        });

        const dbComplaints = medicalRecord.complaints || [];
        const complaints = dbComplaints.length > 0
            ? dbComplaints
            : (appointment?.reasonForVisit
                ? [{ complaint: appointment.reasonForVisit, originalText: appointment.reasonForVisit, createdAt: appointment.appointmentDate }]
                : []);

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

        // Format age to string, ensuring it's not null
        const ageValue = patientInfo.age 
            ? String(patientInfo.age).trim() 
            : (appointment?.age 
                ? String(appointment.age).trim() 
                : calculateAge(patientInfo.birthDate || patientInfo.dateOfBirth || appointment?.patientBirthDate) || "");

        // Format gender - handle null/empty cases
        const genderValue = patientInfo.gender 
            ? patientInfo.gender.trim() 
            : (appointment?.patientGender === 0 ? "Male" : appointment?.patientGender === 1 ? "Female" : "");

        // Format address - handle null/empty cases
        const addressValue = patientInfo.address 
            ? patientInfo.address.trim() 
            : (appointment?.address ? appointment.address.trim() : "");

        const formattedResult = {
            name: patientInfo.name || appointment?.patientName || "Patient",
            patientID: medicalRecord.patientIdentifier || patientInfo.patientIdentifier || patientInfo.patientId || numericPatientIdRef.current || patientId || "Unknown",
            age: ageValue,
            gender: genderValue,
            contactNumber: patientInfo.contactNumber || patientInfo.phone || appointment?.phone || "",
            email: patientInfo.email || appointment?.email || "",
            address: addressValue,
            insuranceCompany: patientInfo.insuranceCompany || appointment?.insuranceCompany || "",
            birthDate: patientInfo.birthDate || patientInfo.dateOfBirth || appointment?.patientBirthDate || null,
            visitDate: medicalRecord.visitDate
                ? new Date(medicalRecord.visitDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            nationalId: patientInfo.nationalId || appointment?.nationalId || "",
            insuranceId: patientInfo.insuranceId || appointment?.insuranceId || "",
            policyNumber: patientInfo.policyNumber || appointment?.policyNumber || "",
            coverage: patientInfo.coverage || appointment?.coverage || "",
            emergencyContactName: patientInfo.emergencyContactName || appointment?.emergencyContactName || "",
            emergencyContactPhone: patientInfo.emergencyContactPhone || appointment?.emergencyContactPhone || "",
            complaints,
            histories,
            investigations: medicalRecord.investigations || [],
            eyeExaminations: medicalRecord.eyeExaminations || [],
            operations: medicalRecord.operations || [],
            medicalTestFiles: medicalRecord.medicalTestFiles || [],
            prescriptions: medicalRecord.prescriptions || [],
            diagnoses: medicalRecord.diagnoses || []
        };

        console.log("[FORMAT] Final Formatted Result:", formattedResult);
        return formattedResult;
    }, [patientId, calculateAge, formatGender]);

    const formatAppointmentData = React.useCallback((a) => {
        let actualPatientId = a.patientId;
        let actualPatientName = a.patientName;
        
        if (actualPatientId && (actualPatientId.includes(' ') || 
            (!actualPatientId.startsWith('P-') && !actualPatientId.startsWith('PAT-')))) {
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

                const rawId = patientId || (userRole === "Patient" ? currentPatientId : null);
                console.log("[SEARCH] 🔍 Raw ID from URL/localStorage:", rawId);
                if (!rawId) throw new Error("No patient ID found");

                const numId = rawId; // Keep P-XXXXXX as-is, don't strip prefix
                console.log("[SEARCH] ✅ Extracted Numeric ID:", numId);
                if (!numId) {
                    console.error("[SEARCH] ❌ CRITICAL: Could not extract numeric ID from:", rawId);
                    throw new Error("Invalid patient ID format");
                }
                
                numericPatientIdRef.current = numId;
                setNumericPatientId(numId);
                console.log("[SEARCH] 📌 Set as PRIMARY authoritative patientId:", numId);

                // ✓ MODIFIED: Use numId as the primary ID
                const cleanId = numId; // Use extracted numeric ID, not the P- prefixed version
                const idToFetch = numId;
                console.log("[TARGET] 🎯 ID to Fetch (AUTHORITATIVE):", idToFetch);

                console.log("[STEP] Step 2: Checking if medical record exists...");
                let checkResult = await emrService.checkMedicalRecordExists(cleanId || rawId);
                if (!checkResult.exists && numId && numId !== rawId) {
                    checkResult = await emrService.checkMedicalRecordExists(numId);
                }
                console.log("[SUCCESS] Check result:", checkResult);
                setMedicalRecordExists(checkResult.exists);

                let appointmentData = null;
                
                console.log("[STEP] Step 3: Fetching appointments...");
                let correctedPatientId = null;
                
                try {
                    const appointments = await appointmentsAPI.getAll();
                    console.log("[SUCCESS] All appointments count:", appointments.length);
                    const patientAppointments = appointments.filter(a => {
                        const aPatientId = a.patientId?.toString();
                        const aPatientName = a.patientName?.toString();
                        const searchId = idToFetch?.toString();
                        const originalId = rawId?.toString();
                        
                        return aPatientId === searchId || 
                               aPatientId === originalId ||
                               aPatientName === searchId ||
                               aPatientName === originalId ||
                               (aPatientName && (aPatientName.startsWith('P-') || aPatientName.startsWith('PAT-')) && (aPatientName === searchId || aPatientName === originalId));
                    });
                    console.log("[SUCCESS] Patient appointments count:", patientAppointments.length);
                    
                    if (patientAppointments.length > 0) {
                        appointmentData = patientAppointments.sort(
                            (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
                        )[0];
                        console.log("[SUCCESS] Selected appointment:", appointmentData);
                        setAppointmentRawData(appointmentData);
                        
                        if (appointmentData.patientId || appointmentData.patientName) {
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
                                console.log("[FIX] Correcting ID from appointment:", correctId);
                                const correctedNumId = extractNumericId(correctId);
                                if (correctedNumId) {
                                    correctedPatientId = correctedNumId;
                                    numericPatientIdRef.current = correctedNumId;
                                    setNumericPatientId(correctedNumId);
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn("[WARNING] Could not fetch appointments:", e);
                }

                console.log("[STEP] Step 4: Loading patient data...");
                
                const finalIdToFetch = correctedPatientId || numId || idToFetch;
                console.log("[TARGET] Final ID to use:", finalIdToFetch);

                if (correctedPatientId && correctedPatientId !== rawId && correctedPatientId !== numId) {
                    console.log("🔄 Re-checking existence with corrected ID:", correctedPatientId);
                    const correctedCheck = await emrService.checkMedicalRecordExists(correctedPatientId);
                    console.log("[SUCCESS] Corrected check result:", correctedCheck);
                    checkResult.exists = correctedCheck.exists;
                    checkResult.recordId = correctedCheck.recordId;
                }
                
                if (checkResult.exists && checkResult.recordId) {
                    console.log("[SUCCESS] Medical record exists, loading from database...");
                    setMedicalRecordId(checkResult.recordId);
                    const medicalRecord = await emrService.getPatientMedicalRecord(finalIdToFetch);
                    console.log("[DATA] Medical Record from API:", medicalRecord);
                    const formattedData = formatMedicalRecordData(medicalRecord, appointmentData);
                    console.log("[SUCCESS] Formatted Data:", formattedData);
                    setPatientData(formattedData);
                    if (medicalRecord.updatedAt) {
                        setLastModified(medicalRecord.updatedAt);
                    } else if (medicalRecord.createdAt) {
                        setLastModified(medicalRecord.createdAt);
                    }
                } else if (appointmentData) {
                    console.log("[INFO] No medical record, using appointment data...");
                    const appointmentFormatted = formatAppointmentData(appointmentData);
                    console.log("[SUCCESS] Formatted Appointment Data:", appointmentFormatted);
                    setPatientData(appointmentFormatted);
                } else {
                    console.log("[WARNING] No data available, using fallback...");
                    setPatientData(getFallbackData(idToFetch));
                }

                console.log("[SUCCESS] All done! Patient data loaded successfully.");

            } catch (err) {
                console.error("[ERROR] Full Error:", err);
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
            const idToUse = patientId || numericPatientId;
            const cleanId = idToUse ? idToUse.replace(/^P-/, '') : '';
            const response = await emrService.createMedicalRecord(cleanId);

            if (response && response.success) {
                const newRecordId = response.recordId;
                setMedicalRecordId(newRecordId);
                setMedicalRecordExists(true);
                const now = new Date().toISOString();
                setLastModified(now);

                try {
                    const medicalRecord = await emrService.getMedicalRecordById(newRecordId);
                    const formattedData = formatMedicalRecordData(medicalRecord, appointmentRawData);
                    setPatientData(prev => ({
                        ...formattedData,
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
                }

                alert("Medical record created successfully!");
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

    const handleLoadFromDatabase = async () => {
        if (!medicalRecordId) return;
        try {
            setLoadingFromDB(true);
            setError("");
            const medicalRecord = await emrService.getMedicalRecordById(medicalRecordId);
            const formattedData = formatMedicalRecordData(medicalRecord, appointmentRawData);
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

    const onSectionSaved = async (sectionName) => {
        const now = new Date().toISOString();
        setLastSaved({ section: sectionName, timestamp: now });
        setLastModified(now);
        if (medicalRecordId) {
            try {
                const medicalRecord = await emrService.getMedicalRecordById(medicalRecordId);
                const formattedData = formatMedicalRecordData(medicalRecord, appointmentRawData);
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
                        <Add sx={{ fontSize: '1rem' }} /> Create Medical Record
                    </button>
                )}

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
                                ID: {patientData?.patientID || numericPatientId || "—"}
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
                    <>
                        {console.log("[RENDER] MedicalRecord - numericPatientId (authoritative from URL):", numericPatientId, "patientData.patientID:", patientData.patientID)}
                        <MedicalRecord
                            patientName={patientData.name}
                            patientId={numericPatientId}
                            initialPatientData={patientData}
                            fromAppointment={!medicalRecordExists}
                            medicalRecordId={medicalRecordId}
                            onSectionSaved={onSectionSaved}
                            readOnly={userRole === 'Patient'}
                            userRole={userRole}
                        />
                    </>
                )}
            </main>
        </div>
    );
}

export default EMRPage;