// MedicalRecord.jsx
import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, Paper, Typography } from "@mui/material";
import {
  Assignment,
  History,
  Science,
  Visibility,
  CloudUpload,
  MedicalServices,
  Medication,
  Healing,
} from "@mui/icons-material";
import PatientInfo from "./PatientInfo";
import EyeExaminationForm from "./EyeExaminationForm";
import MedicalHistory from "./MedicalHistory";
import PrescriptionForm from "./PrescriptionForm";
import PatientComplaint from "./PatientComplaint";
import Investigations from "./Investigations";
import PastImageTests from "./PastImage-Tests";
import Operations from "./Operations";
import DiagnosesTab from "./Diagnoses";
import ClearButton from "./ClearButton";
import "./EMRComponents.css";

const TabPanel = ({ children, onClear, title, icon }) => (
  <Box sx={{ mt: 3 }}>
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mb: 2,
        pb: 1,
        borderBottom: "2px solid #1e3a5f",
      }}
    >
      <Typography variant="h6" sx={{ color: "#1e3a5f", fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon} {title}
      </Typography>
      <Box sx={{ position: "absolute", right: 0 }}>
        <ClearButton onClear={onClear} label={`Clear ${title}`} />
      </Box>
    </Box>
    {children}
  </Box>
);

const MedicalRecord = ({
  patientName,
  patientId,
  initialPatientData,
  fromAppointment,
  medicalRecordId,
  onSectionSaved,
}) => {
  const [activeTab, setActiveTab] = useState(0);
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
      birthDate: null,
    }
  );

  useEffect(() => {
    if (initialPatientData) {
      setPatientData(initialPatientData);
    }
  }, [initialPatientData]);

  const [complaintData, setComplaintData] = useState({ complaint: "" });
  const [historyData, setHistoryData] = useState({
    previousEye: "",
    familyHistory: "",
    allergies: "",
    chronicDiseases: "",
    currentMedications: "",
    eyeSurgeries: "",
    familyEyeDiseases: "",
    visionSymptoms: "",
  });
  const [prescriptionsData, setPrescriptionsData] = useState([
    { drug: "", form: "", dose: "", frequency: "", customFrequency: "", notes: "" },
  ]);
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

  useEffect(() => {
    if (!initialPatientData) return;

    if (initialPatientData.histories?.length > 0) {
      const h = initialPatientData.histories[0];
      setHistoryData({
        previousEye: h.previousEye || h.pastMedicalHistory || h.PreviousEye || h.PastMedicalHistory || "",
        familyHistory: h.familyHistory || h.FamilyHistory || "",
        allergies: h.allergies || h.Allergies || "",
        chronicDiseases: h.chronicDiseases || "",
        currentMedications: h.currentMedications || "",
        eyeSurgeries: h.eyeSurgeries || "",
        familyEyeDiseases: h.familyEyeDiseases || "",
        visionSymptoms: h.visionSymptoms || "",
      });
    } else if (
      initialPatientData.eyeAllergies ||
      initialPatientData.chronicDiseases ||
      initialPatientData.currentMedications
    ) {
      setHistoryData({
        previousEye: initialPatientData.eyeSurgeries || initialPatientData.otherEyeSurgeries || "",
        familyHistory: initialPatientData.familyEyeDiseases || initialPatientData.otherFamilyDiseases || "",
        allergies: initialPatientData.eyeAllergies || initialPatientData.otherAllergies || "",
        chronicDiseases: initialPatientData.chronicDiseases || "",
        currentMedications: initialPatientData.currentMedications || "",
        eyeSurgeries: initialPatientData.eyeSurgeries || initialPatientData.otherEyeSurgeries || "",
        familyEyeDiseases: initialPatientData.familyEyeDiseases || initialPatientData.otherFamilyDiseases || "",
        visionSymptoms: initialPatientData.visionSymptoms || "",
      });
    }

    if (initialPatientData.complaints?.length > 0) {
      const c = initialPatientData.complaints[0];
      setComplaintData({
        complaint: c.originalText || c.complaint || c.OriginalText || c.Complaint || "",
      });
    }

    if (initialPatientData.prescriptions?.length > 0) {
      const mapped = [];
      for (const p of initialPatientData.prescriptions) {
        const items = p.items || p.Items || [];
        if (items.length > 0) {
          for (const item of items) {
            mapped.push({
              drug: item.drug || item.Drug || item.medication || item.Medication || "",
              form: item.form || item.Form || "",
              dose: item.dose || item.Dose || item.dosage || item.Dosage || "",
              customDose: item.customDose || item.CustomDose || "",
              frequency: item.frequency || item.Frequency || "",
              customFrequency: item.customFrequency || item.CustomFrequency || "",
              notes: item.notes || item.Notes || p.notes || p.Notes || "",
            });
          }
        } else if (p.drug || p.Drug) {
          mapped.push({
            drug: p.Drug || p.drug || p.Instructions || p.instructions || "",
            form: p.Form || p.form || "",
            dose: p.Dose || p.dose || "",
            customDose: p.customDose || "",
            frequency: p.Frequency || p.frequency || "",
            customFrequency: p.customFrequency || "",
            notes: p.Notes || p.notes || "",
          });
        }
      }
      setPrescriptionsData(mapped.length > 0 ? mapped : prescriptionsData);
    }
  }, [initialPatientData]);

  const clearComplaint = () => setComplaintData({ complaint: "" });
  const clearHistory = () =>
    setHistoryData({
      previousEye: "",
      familyHistory: "",
      allergies: "",
      chronicDiseases: "",
      currentMedications: "",
      eyeSurgeries: "",
      familyEyeDiseases: "",
      visionSymptoms: "",
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
    setPrescriptionsData([
      { drug: "", form: "", dose: "", frequency: "", customFrequency: "", notes: "" },
    ]);
  const clearDiagnoses = () =>
    setDiagnosesData([{ diagnosis: "", status: "", severity: "", notes: "", checkupDate: "" }]);

  const handleChange = (event, newValue) => setActiveTab(newValue);

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f8fafc", p: 3 }}>
      {fromAppointment && (
        <Paper
          elevation={1}
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "#e8f5e9",
            border: "1px solid #81c784",
            borderRadius: 2,
          }}
        >
          <Typography sx={{ color: "#2e7d32" }}>
            <strong>Note:</strong> Patient data loaded from appointment record.
          </Typography>
        </Paper>
      )}

      {/* Box واحد بحدود واحدة */}
      <Paper elevation={2} sx={{ borderRadius: 3, border: "1px solid #cae8ff", overflow: "hidden" }}>
        {/* PatientInfo داخل نفس الـ Box بدون حدود إضافية */}
        <Box sx={{ p: 3, pb: 0 }}>
          <PatientInfo patient={patientData} readOnly />
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleChange}
          variant="fullWidth"
          sx={{
            borderTop: "1px solid #e0e0e0",
            borderBottom: "1px solid #e0e0e0",
            bgcolor: "#ffffff",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "1rem",
              color: "#555",
              minHeight: 68,
              "&.Mui-selected": {
                color: "#1e3a5f",
                fontWeight: 700,
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#1e3a5f",
              height: 3,
            },
          }}
        >
          <Tab icon={<Assignment />} label="Complaint" iconPosition="start" />
          <Tab icon={<History />} label="History" iconPosition="start" />
          <Tab icon={<Science />} label="Investigations" iconPosition="start" />
          <Tab icon={<Visibility />} label="Eye Exam" iconPosition="start" />
          <Tab icon={<CloudUpload />} label="Images" iconPosition="start" />
          <Tab icon={<MedicalServices />} label="Operations" iconPosition="start" />
          <Tab icon={<Medication />} label="Prescription" iconPosition="start" />
          <Tab icon={<Healing />} label="Diagnoses" iconPosition="start" />
        </Tabs>

        {/* محتوى التبويبات */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <TabPanel onClear={clearComplaint} title="Patient Complaint" icon={<Assignment />}>
              <PatientComplaint
                data={complaintData}
                setData={setComplaintData}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                existingData={initialPatientData?.complaints || []}
                onSaved={() => onSectionSaved?.("Patient Complaint")}
              />
            </TabPanel>
          )}

          {activeTab === 1 && (
            <TabPanel onClear={clearHistory} title="Medical & Family History" icon={<History />}>
              <MedicalHistory
                data={historyData}
                setData={setHistoryData}
                historyData={historyData}
                existingData={initialPatientData?.histories || []}
                patientName={patientName}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Medical & Family History")}
              />
            </TabPanel>
          )}

          {activeTab === 2 && (
            <TabPanel onClear={clearInvestigations} title="Investigations" icon={<Science />}>
              <Investigations
                existingData={initialPatientData?.investigations || []}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Investigations")}
              />
            </TabPanel>
          )}

          {activeTab === 3 && (
            <TabPanel onClear={clearEyeExam} title="Eye Examination" icon={<Visibility />}>
              <EyeExaminationForm
                existingData={initialPatientData?.eyeExaminations || []}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Eye Examination")}
              />
            </TabPanel>
          )}

          {activeTab === 4 && (
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  pb: 1,
                  borderBottom: "2px solid #1e3a5f",
                }}
              >
                <Typography variant="h6" sx={{ color: "#1e3a5f", fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudUpload /> Past Images & Tests
                </Typography>
                <ClearButton onClear={clearPastImages} label="Clear Images" />
              </Box>
              <PastImageTests medicalRecordId={medicalRecordId} />
            </Box>
          )}

          {activeTab === 5 && (
            <TabPanel onClear={clearOperations} title="Operations" icon={<MedicalServices />}>
              <Operations
                existingData={initialPatientData?.operations || []}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Operation Details")}
              />
            </TabPanel>
          )}

          {activeTab === 6 && (
            <TabPanel onClear={clearPrescriptions} title="Prescription Details" icon={<Medication />}>
              <PrescriptionForm
                data={prescriptionsData}
                setData={setPrescriptionsData}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Prescription Details")}
              />
            </TabPanel>
          )}

          {activeTab === 7 && (
            <TabPanel onClear={clearDiagnoses} title="Diagnoses" icon={<Healing />}>
              <DiagnosesTab
                existingData={initialPatientData?.diagnoses || []}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Diagnoses")}
              />
            </TabPanel>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default MedicalRecord;