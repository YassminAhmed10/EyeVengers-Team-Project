import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, Button } from "@mui/material";
import PatientInfo from "./PatientInfo";
import EyeExaminationForm from "./EyeExaminationForm";
import MedicalHistory from "./MedicalHistory";
import PrescriptionForm from "./PrescriptionForm";
import PatientComplaint from "./PatientComplaint";
import Investigations from "./Investigations";
import PastImageTests from "./PastImage-Tests";
import Operations from "./Operations";
import DiagnosesTab from "./Diagnoses";
import "./EMRComponents.css";

const TabPanel = ({ children, onClear }) => (
    <Box sx={{ position: "relative", mt: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
                variant="outlined"
                color="error"
                onClick={() => {
                    if (window.confirm("Are you sure you want to clear this tab's data?")) {
                        onClear();
                    }
                }}
            >
                Clear
            </Button>
        </Box>
        {children}
    </Box>
);

const MedicalRecord = ({ patientName, patientId, initialPatientData, fromAppointment }) => {
    const [activeTab, setActiveTab] = useState(0);

    // استخدام البيانات المرسلة من صفحة المواعيد أو البيانات الافتراضية
    const [patientData, setPatientData] = useState(
        initialPatientData || {
            name: patientName || "",
            age: "",
            gender: "",
            visitDate: "",
            patientID: patientId || "",
            contactNumber: "",
            email: "",
            address: "",
            insuranceCompany: "",
            insuranceId: "",
            policyNumber: "",
            coverage: "",
            nationalId: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            birthDate: null
        }
    );

    // تحديث بيانات المريض إذا كانت هناك بيانات أولية
    useEffect(() => {
        if (initialPatientData && fromAppointment) {
            console.log("Updating patient data from appointment:", initialPatientData);
            setPatientData(initialPatientData);
        }
    }, [initialPatientData, fromAppointment]);

    const [complaintData, setComplaintData] = useState({ complaint: "" });

    const [historyData, setHistoryData] = useState({
        previousEye: "",
        familyHistory: "",
        allergies: "",
    });

    const [prescriptionsData, setPrescriptionsData] = useState([
        {
            drug: "",
            form: "",
            dose: "",
            frequency: "",
            customFrequency: "",
            notes: "",
        },
    ]);

    // Update history data from appointment if available
    useEffect(() => {
        if (initialPatientData && initialPatientData.histories && initialPatientData.histories.length > 0) {
            const history = initialPatientData.histories[0];
            setHistoryData({
                previousEye: history.PastMedicalHistory || "",
                familyHistory: history.FamilyHistory || "",
                allergies: history.Allergies || "",
            });
        }
        
        // Update complaint data from appointment if available
        if (initialPatientData && initialPatientData.complaints && initialPatientData.complaints.length > 0) {
            setComplaintData({
                complaint: initialPatientData.complaints[0].Complaint || ""
            });
        }
        
        // Update prescription data from appointment if available
        if (initialPatientData && initialPatientData.prescriptions && initialPatientData.prescriptions.length > 0) {
            const prescription = initialPatientData.prescriptions[0];
            setPrescriptionsData([{
                drug: prescription.Instructions || "",
                form: "",
                dose: "",
                frequency: "",
                customFrequency: "",
                notes: "",
            }]);
        }
    }, [initialPatientData]);

    const [eyeExamData, setEyeExamData] = useState({
        rightEye: "",
        leftEye: "",
        eyePressure: "",
        pupilReaction: "",
        pupilReactionOther: "",
        eyeAlignment: "",
        eyeAlignmentOther: "",
        eyeMovements: "",
        eyeMovementsOther: "",
        anteriorSegment: "",
        fundusObservation: "",
        otherNotes: "",
    });

    const [investigationsData, setInvestigationsData] = useState({});
    const [pastImagesData, setPastImagesData] = useState([]);
    const [operationsData, setOperationsData] = useState({});
    const [diagnosesData, setDiagnosesData] = useState([
        { diagnosis: "", status: "", severity: "", notes: "", checkupDate: "" },
    ]);

    const handleChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const clearComplaint = () => setComplaintData({ complaint: "" });

    const clearHistory = () =>
        setHistoryData({
            previousEye: "",
            familyHistory: "",
            allergies: "",
        });

    const clearEyeExam = () =>
        setEyeExamData({
            rightEye: "",
            leftEye: "",
            eyePressure: "",
            pupilReaction: "",
            pupilReactionOther: "",
            eyeAlignment: "",
            eyeAlignmentOther: "",
            eyeMovements: "",
            eyeMovementsOther: "",
            anteriorSegment: "",
            fundusObservation: "",
            otherNotes: "",
        });

    const clearInvestigations = () => setInvestigationsData({});
    const clearPastImages = () => setPastImagesData([]);
    const clearOperations = () => setOperationsData({});

    const clearPrescriptions = () =>
        setPrescriptionsData((prev) =>
            prev.length > 0
                ? prev.map(() => ({
                    drug: "",
                    form: "",
                    dose: "",
                    frequency: "",
                    customFrequency: "",
                    notes: "",
                }))
                : [
                    {
                        drug: "",
                        form: "",
                        dose: "",
                        frequency: "",
                        customFrequency: "",
                        notes: "",
                    },
                ]
        );

    const clearDiagnoses = () =>
        setDiagnosesData([
            { diagnosis: "", status: "", severity: "", notes: "", checkupDate: "" },
        ]);

    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100vh",
                p: 4,
                boxSizing: "border-box",
            }}
        >
            {/* عرض رسالة إذا كانت البيانات من المواعيد */}
            {fromAppointment && (
                <Box sx={{
                    mb: 3,
                    p: 2,
                    backgroundColor: '#e8f5e9',
                    borderRadius: '8px',
                    border: '1px solid #66bb6a'
                }}>
                    <p style={{ margin: 0, color: '#2e7d32' }}>
                        ✅ Patient data loaded from appointment record
                    </p>
                </Box>
            )}

            <Box sx={{ mb: 2 }}>
                {/* تمرير بيانات المريض لـ PatientInfo */}
                <PatientInfo patient={patientData} setPatient={setPatientData} />
            </Box>

            <Tabs
                value={activeTab}
                onChange={handleChange}
                centered
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    "& .MuiTab-root": { fontWeight: 900, fontSize: "0.75rem" },
                }}
            >
                <Tab label="Patient Complaint" />
                <Tab label="Medical History" />
                <Tab label="Investigations" />
                <Tab label="Eye Examination" />
                <Tab label="Past Images & Tests" />
                <Tab label="Operations" />
                <Tab label="Prescription" />
                <Tab label="Diagnoses" />
            </Tabs>

            <Box sx={{ mt: 5 }}>
                {activeTab === 0 && (
                    <TabPanel onClear={clearComplaint}>
                        <PatientComplaint
                            data={complaintData}
                            setData={setComplaintData}
                            patientId={patientId}
                        />
                    </TabPanel>
                )}

                {activeTab === 1 && (
                    <TabPanel onClear={clearHistory}>
                        <MedicalHistory
                            data={historyData}
                            setData={setHistoryData}
                            historyData={historyData}
                            patientName={patientName}
                            patientId={patientId}
                        />
                    </TabPanel>
                )}

                {activeTab === 2 && (
                    <TabPanel onClear={clearInvestigations}>
                        <Investigations
                            data={investigationsData}
                            setData={setInvestigationsData}
                            patientId={patientId}
                        />
                    </TabPanel>
                )}

                {activeTab === 3 && (
                    <TabPanel onClear={clearEyeExam}>
                        <EyeExaminationForm
                            data={eyeExamData}
                            setData={setEyeExamData}
                            patientId={patientId}
                        />
                    </TabPanel>
                )}

                {activeTab === 4 && (
                    <TabPanel onClear={clearPastImages}>
                        <PastImageTests
                            files={pastImagesData}
                            setFiles={setPastImagesData}
                            patientId={patientId}
                        />
                    </TabPanel>
                )}

                {activeTab === 5 && (
                    <TabPanel onClear={clearOperations}>
                        <Operations
                            data={operationsData}
                            setData={setOperationsData}
                            patientId={patientId}
                        />
                    </TabPanel>
                )}

                {activeTab === 6 && (
                    <TabPanel onClear={clearPrescriptions}>
                        <PrescriptionForm
                            data={prescriptionsData}
                            setData={setPrescriptionsData}
                            patientId={patientId}
                        />
                    </TabPanel>
                )}

                {activeTab === 7 && (
                    <TabPanel onClear={clearDiagnoses}>
                        <DiagnosesTab
                            data={diagnosesData}
                            setData={setDiagnosesData}
                            patientId={patientId}
                        />
                    </TabPanel>
                )}
            </Box>
        </Box>
    );
};

export default MedicalRecord;