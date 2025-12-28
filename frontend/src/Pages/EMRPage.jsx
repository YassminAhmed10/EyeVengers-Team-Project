// EMRPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import MedicalRecord from "../EMR/MedicalRecord";
import { CircularProgress, Alert, Box } from "@mui/material";
import emrService from '../services/emrService';
import { appointmentsAPI } from '../services/apiConfig';

function EMRPage() {
    const navigate = useNavigate();
    const { patientId } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [patientData, setPatientData] = useState(null);
    const [medicalRecordExists, setMedicalRecordExists] = useState(false);

    const userRole = localStorage.getItem("userRole");

    if (userRole !== "Doctor") {
        navigate("/login");
        return null;
    }

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                setLoading(true);
                setError("");

                // أولاً: حاول الحصول على البيانات من location.state
                const stateData = location.state?.patientData;
                if (stateData && location.state?.fromAppointment) {
                    console.log("Using data from appointment state:", stateData);
                    const formattedData = formatAppointmentData(stateData);
                    setPatientData(formattedData);
                    setLoading(false);
                    return;
                }

                // ثانياً: تحقق إذا كان السجل الطبي موجود
                const checkResult = await emrService.checkMedicalRecordExists(patientId);
                setMedicalRecordExists(checkResult.exists);

                if (checkResult.exists) {
                    // إذا السجل الطبي موجود، احصل على بياناته
                    const medicalRecord = await emrService.getPatientMedicalRecord(patientId);
                    const formattedData = formatMedicalRecordData(medicalRecord);
                    setPatientData(formattedData);
                } else {
                    // إذا السجل الطبي غير موجود، احصل على بيانات من المواعيد
                    try {
                        // حاول جلب جميع المواعيد والبحث عن مواعيد هذا المريض
                        const appointments = await appointmentsAPI.getAll();
                        const patientAppointments = appointments.filter(a => 
                            a.patientId.toString() === patientId || 
                            a.patientName.toLowerCase() === patientId.toLowerCase()
                        );
                        
                        if (patientAppointments.length > 0) {
                            const appointmentData = formatAppointmentData(patientAppointments[0]);
                            setPatientData(appointmentData);
                            
                            // إنشاء السجل الطبي تلقائياً
                            try {
                                await emrService.createMedicalRecordFromAppointment(patientId, appointmentData.name);
                            } catch (createError) {
                                console.log("Could not create medical record:", createError);
                            }
                        } else {
                            throw new Error("No appointments found");
                        }
                    } catch (appointmentError) {
                        // إذا فشل الحصول من المواعيد، استخدم البيانات الأساسية
                        console.warn("Could not fetch appointment data, using basic info");
                        setPatientData({
                            name: "Patient",
                            patientID: patientId || "Unknown",
                            age: "Not specified",
                            gender: "Not specified",
                            contactNumber: "",
                            email: "",
                            address: "",
                            insuranceCompany: "",
                            birthDate: null,
                            visitDate: new Date().toISOString().split('T')[0],
                            nationalId: "",
                            insuranceId: "",
                            policyNumber: "",
                            coverage: "",
                            emergencyContactName: "",
                            emergencyContactPhone: ""
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching patient data:", err);
                setError("Failed to load patient data. Please try again.");
                setPatientData(getFallbackData(patientId));
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [patientId, location]);

    // تنسيق بيانات السجل الطبي
    const formatMedicalRecordData = (medicalRecord) => {
        return {
            name: medicalRecord.patientInfo?.name || "Patient",
            patientID: medicalRecord.patientInfo?.patientId || patientId || "Unknown",
            age: medicalRecord.patientInfo?.age || null,
            gender: medicalRecord.patientInfo?.gender || "Not specified",
            contactNumber: medicalRecord.patientInfo?.contactNumber || "",
            email: medicalRecord.patientInfo?.email || "",
            address: medicalRecord.patientInfo?.address || "",
            insuranceCompany: medicalRecord.patientInfo?.insuranceCompany || "",
            birthDate: medicalRecord.patientInfo?.birthDate || null,
            visitDate: medicalRecord.visitDate ? new Date(medicalRecord.visitDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            nationalId: medicalRecord.patientInfo?.nationalId || "",
            insuranceId: medicalRecord.patientInfo?.insuranceId || "",
            policyNumber: medicalRecord.patientInfo?.policyNumber || "",
            coverage: medicalRecord.patientInfo?.coverage || "",
            emergencyContactName: medicalRecord.patientInfo?.emergencyContactName || "",
            emergencyContactPhone: medicalRecord.patientInfo?.emergencyContactPhone || "",
            // بيانات EMR الأخرى
            complaints: medicalRecord.complaints || [],
            histories: medicalRecord.histories || [],
            investigations: medicalRecord.investigations || [],
            eyeExaminations: medicalRecord.eyeExaminations || [],
            operations: medicalRecord.operations || [],
            medicalTestFiles: medicalRecord.medicalTestFiles || [],
            prescriptions: medicalRecord.prescriptions || [],
            diagnoses: medicalRecord.diagnoses || []
        };
    };

    // تنسيق بيانات الموعد
    const formatAppointmentData = (appointmentData) => {
        // Handle both appointment objects and appointment-info objects
        const patientName = appointmentData.patientName || `Patient ${appointmentData.patientId}`;
        
        // استخراج العمر من البيانات أو حسابه من تاريخ الميلاد
        let ageValue = appointmentData.age;
        
        // Check if age is valid (not empty, not '0', not 'null')
        const ageNum = parseInt(ageValue, 10);
        if (!ageValue || ageValue === 'null' || ageValue === null || isNaN(ageNum) || ageNum === 0) {
            // Try to calculate from birth date
            ageValue = calculateAge(appointmentData.patientBirthDate);
        }
        if (!ageValue) {
            ageValue = "Not specified";
        }
        
        return {
            name: patientName,
            patientID: appointmentData.patientId || patientId || "Unknown",
            age: ageValue,
            gender: formatGender(appointmentData.patientGender || appointmentData.gender),
            contactNumber: appointmentData.phone || appointmentData.contactNumber || "",
            email: appointmentData.email || "",
            address: appointmentData.address || "",
            insuranceCompany: appointmentData.insuranceCompany || "",
            birthDate: appointmentData.patientBirthDate || null,
            visitDate: appointmentData.appointmentDate ? new Date(appointmentData.appointmentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            nationalId: appointmentData.nationalId || "",
            insuranceId: appointmentData.insuranceId || "",
            policyNumber: appointmentData.policyNumber || "",
            coverage: appointmentData.coverage || "",
            emergencyContactName: appointmentData.emergencyContactName || "",
            emergencyContactPhone: appointmentData.emergencyContactPhone || "",
            // Medical history from appointment
            complaints: appointmentData.reasonForVisit ? [{
                Complaint: appointmentData.reasonForVisit,
                Duration: "",
                CreatedAt: appointmentData.appointmentDate
            }] : [],
            histories: [{
                PastMedicalHistory: appointmentData.chronicDiseases || "",
                FamilyHistory: appointmentData.otherFamilyDiseases || "",
                Allergies: appointmentData.otherAllergies || "",
                CreatedAt: appointmentData.appointmentDate
            }],
            investigations: [],
            eyeExaminations: [],
            operations: appointmentData.eyeSurgeries ? [{
                OperationName: appointmentData.eyeSurgeries,
                Date: appointmentData.appointmentDate,
                Notes: appointmentData.otherEyeSurgeries || "",
                CreatedAt: appointmentData.appointmentDate
            }] : [],
            medicalTestFiles: [],
            prescriptions: appointmentData.currentMedications ? [{
                Instructions: appointmentData.currentMedications,
                PrescriptionDate: appointmentData.appointmentDate,
                CreatedAt: appointmentData.appointmentDate,
                Items: []
            }] : [],
            diagnoses: []
        };
    };

    // بيانات افتراضية عند الفشل
    const getFallbackData = (id) => ({
        name: "Patient",
        patientID: id || "Unknown",
        age: null,
        gender: "Not specified",
        contactNumber: "",
        email: "",
        address: "",
        insuranceCompany: "",
        birthDate: null,
        visitDate: new Date().toISOString().split('T')[0],
        nationalId: "",
        insuranceId: "",
        policyNumber: "",
        coverage: "",
        emergencyContactName: "",
        emergencyContactPhone: ""
    });

    // دالة لحساب العمر
    const calculateAge = (dob) => {
        if (!dob) return null;
        try {
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        } catch {
            return null;
        }
    };

    // دالة لتنسيق الجنس
    const formatGender = (genderCode) => {
        if (genderCode === 0 || genderCode === "0") return "Male";
        if (genderCode === 1 || genderCode === "1") return "Female";
        if (genderCode === 2 || genderCode === "2") return "Other";
        return genderCode || "Not specified";
    };

    const handleCreateMedicalRecord = async () => {
        try {
            setLoading(true);
            await emrService.createMedicalRecord(patientId);
            const checkResult = await emrService.checkMedicalRecordExists(patientId);
            setMedicalRecordExists(checkResult.exists);
            alert("Medical record created successfully!");
        } catch (err) {
            console.error("Error creating medical record:", err);
            alert("Failed to create medical record");
        } finally {
            setLoading(false);
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
        <div style={{
            width: "100%",
            minHeight: "100vh",
            padding: "20px",
            backgroundColor: "#f5f5f5"
        }}>
            {/* زر الرجوع */}
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                    onClick={() => navigate("/doctor")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        backgroundColor: "#29b6f6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "500",
                        fontSize: "14px"
                    }}
                >
                    ← Back to Dashboard
                </button>

                {!medicalRecordExists && (
                    <button
                        onClick={handleCreateMedicalRecord}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 20px",
                            backgroundColor: "#4caf50",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "500",
                            fontSize: "14px"
                        }}
                    >
                        📋 Create Medical Record
                    </button>
                )}
            </div>

            {error && (
                <Alert severity="error" style={{ marginBottom: "20px" }}>
                    {error}
                </Alert>
            )}

            {/* عنوان الصفحة */}
            <div style={{
                background: "linear-gradient(135deg, #1e3a5f 0%, #29b6f6 100%)",
                color: "white",
                padding: "25px",
                borderRadius: "12px",
                marginBottom: "25px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div>
                    <h1 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>
                        {patientData?.name || "Patient"}
                    </h1>
                    <p style={{ margin: 0, opacity: 0.9 }}>
                        Medical Record - Patient ID: {patientData?.patientID || patientId || "Unknown"}
                        {medicalRecordExists ? " (Medical Record Exists)" : " (From Appointment)"}
                    </p>
                </div>
                <div style={{
                    display: "flex",
                    gap: "20px",
                    fontSize: "14px"
                }}>
                    <div>
                        <p style={{ margin: "0 0 5px 0", opacity: 0.8 }}>Last Visit</p>
                        <p style={{ margin: 0, fontWeight: "600" }}>
                            {patientData?.visitDate || "N/A"}
                        </p>
                    </div>
                    <div>
                        <p style={{ margin: "0 0 5px 0", opacity: 0.8 }}>Contact</p>
                        <p style={{ margin: 0, fontWeight: "600" }}>
                            {patientData?.contactNumber || "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* رسالة توضيحية */}
            {!medicalRecordExists && (
                <div style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffeaa7",
                    borderRadius: "8px",
                    color: "#856404"
                }}>
                    <strong>Note:</strong> This patient does not have a medical record yet.
                    Data is loaded from appointment records. Click "Create Medical Record" to start a permanent record.
                </div>
            )}

            {/* المحتوى الرئيسي */}
            <main>
                {patientData && (
                    <MedicalRecord
                        patientName={patientData.name}
                        patientId={patientData.patientID}
                        initialPatientData={patientData}
                        fromAppointment={!medicalRecordExists}
                    />
                )}
            </main>
        </div>
    );
}

export default EMRPage;