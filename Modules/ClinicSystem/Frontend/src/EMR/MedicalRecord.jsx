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
  ImageSearch,
  PlaylistAdd,          // ← new icon for Orders tab
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
import RadiologyInvestigations from "./RadiologyInvestigations";
import DoctorOrdersTab from "./DoctorOrdersTab";   // ← NEW import
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
  readOnly = false,
  userRole = "Doctor",
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

  const clearComplaint    = () => setComplaintData({ complaint: "" });
  const clearHistory      = () => setHistoryData({ previousEye: "", familyHistory: "", allergies: "", chronicDiseases: "", currentMedications: "", eyeSurgeries: "", familyEyeDiseases: "", visionSymptoms: "" });
  const clearEyeExam      = () => setEyeExamData({ rightEye: "", leftEye: "", eyePressure: "", pupilReaction: "", pupilReactionOther: "", eyeAlignment: "", eyeAlignmentOther: "", eyeMovements: "", eyeMovementsOther: "", anteriorSegment: "", fundusObservation: "", otherNotes: "" });
  const clearInvestigations = () => setInvestigationsData({});
  const clearPastImages   = () => setPastImagesData([]);
  const clearOperations   = () => setOperationsData({});
  const clearPrescriptions = () => setPrescriptionsData([{ drug: "", form: "", dose: "", frequency: "", customFrequency: "", notes: "" }]);
  const clearDiagnoses    = () => setDiagnosesData([{ diagnosis: "", status: "", severity: "", notes: "", checkupDate: "" }]);

  const handleChange = (event, newValue) => setActiveTab(newValue);

  // ── Tabs definition (tab index 9 = Orders) ───────────────────────────────
  // Tabs:  0-Complaint | 1-History | 2-Investigations | 3-Radiology |
  //        4-Eye Exam  | 5-Images  | 6-Operations     | 7-Prescription |
  //        8-Diagnoses | 9-Orders  ← NEW

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f8fafc", p: 3 }}>
      {fromAppointment && (
        <Paper elevation={1} sx={{ mb: 3, p: 2, backgroundColor: "#e8f5e9", border: "1px solid #81c784", borderRadius: 2 }}>
          <Typography sx={{ color: "#2e7d32" }}>
            <strong>Note:</strong> Patient data loaded from appointment record.
          </Typography>
        </Paper>
      )}

      {readOnly && userRole === "Patient" && (
        <Paper elevation={1} sx={{ mb: 3, p: 2, backgroundColor: "#e3f2fd", border: "1px solid #64b5f6", borderRadius: 2 }}>
          <Typography sx={{ color: "#1565c0" }}>
            <strong>📋 View Mode:</strong> You are viewing data provided by your doctor and the Radiology Center. Your medical record is read-only.
          </Typography>
        </Paper>
      )}

      <Paper elevation={2} sx={{ borderRadius: 3, border: "1px solid #cae8ff", overflow: "hidden" }}>
        <Box sx={{ p: 3, pb: 0 }}>
          <PatientInfo patient={patientData} readOnly />
        </Box>

        {/* ── Tabs ── */}
        <Tabs
          value={activeTab}
          onChange={handleChange}
          variant="scrollable"              // ← changed to scrollable to fit the extra tab
          scrollButtons="auto"
          sx={{
            borderTop: "1px solid #e0e0e0",
            borderBottom: "1px solid #e0e0e0",
            bgcolor: "#ffffff",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.9rem",
              color: "#555",
              minHeight: 68,
              "&.Mui-selected": { color: "#1e3a5f", fontWeight: 700 },
            },
            "& .MuiTabs-indicator": { backgroundColor: "#1e3a5f", height: 3 },
          }}
        >
          <Tab icon={<Assignment />}   label="Complaint"      iconPosition="start" />
          <Tab icon={<History />}      label="History"        iconPosition="start" />
          <Tab icon={<Science />}      label="Investigations" iconPosition="start" />
          <Tab icon={<ImageSearch />}  label="Radiology"      iconPosition="start" />
          <Tab icon={<Visibility />}   label="Eye Exam"       iconPosition="start" />
          <Tab icon={<CloudUpload />}  label="Images"         iconPosition="start" />
          <Tab icon={<MedicalServices />} label="Operations"  iconPosition="start" />
          <Tab icon={<Medication />}   label="Prescription"   iconPosition="start" />
          <Tab icon={<Healing />}      label="Diagnoses"      iconPosition="start" />

          {/* ── NEW Orders Tab (only visible to Doctor) ── */}
          {userRole === "Doctor" && (
            <Tab
              icon={<PlaylistAdd />}
              label="Orders"
              iconPosition="start"
              sx={{
                "&.Mui-selected": { color: "#7b1fa2 !important" },
                color: "#7b1fa2 !important",
                fontWeight: "700 !important",
              }}
            />
          )}
        </Tabs>

        {/* ── Tab content ── */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <TabPanel onClear={readOnly ? null : clearComplaint} title="Patient Complaint" icon={<Assignment />}>
              <PatientComplaint
                data={complaintData}
                setData={setComplaintData}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                existingData={initialPatientData?.complaints || []}
                onSaved={() => onSectionSaved?.("Patient Complaint")}
                readOnly={readOnly}
              />
            </TabPanel>
          )}

          {activeTab === 1 && (
            <TabPanel onClear={readOnly ? null : clearHistory} title="Medical & Family History" icon={<History />}>
              <MedicalHistory
                data={historyData}
                setData={setHistoryData}
                historyData={historyData}
                existingData={initialPatientData?.histories || []}
                patientName={patientName}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Medical & Family History")}
                readOnly={readOnly}
              />
            </TabPanel>
          )}

          {activeTab === 2 && (
            <TabPanel onClear={readOnly ? null : clearInvestigations} title="Investigations" icon={<Science />}>
              <Investigations
                existingData={initialPatientData?.investigations || []}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Investigations")}
                readOnly={readOnly}
              />
            </TabPanel>
          )}

          {activeTab === 3 && (
            <TabPanel onClear={null} title="Radiology Center Investigations" icon={<ImageSearch />}>
              <RadiologyInvestigations patientId={patientId} readOnly={true} />
            </TabPanel>
          )}

          {activeTab === 4 && (
            <TabPanel onClear={readOnly ? null : clearEyeExam} title="Eye Examination" icon={<Visibility />}>
              <EyeExaminationForm
                existingData={initialPatientData?.eyeExaminations || []}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Eye Examination")}
                readOnly={readOnly}
              />
            </TabPanel>
          )}

          {activeTab === 5 && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, pb: 1, borderBottom: "2px solid #1e3a5f" }}>
                <Typography variant="h6" sx={{ color: "#1e3a5f", fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudUpload /> Past Images & Tests
                </Typography>
                <ClearButton onClear={readOnly ? null : clearPastImages} label="Clear Images" />
              </Box>
              <PastImageTests medicalRecordId={medicalRecordId} readOnly={readOnly} />
            </Box>
          )}

          {activeTab === 6 && (
            <TabPanel onClear={readOnly ? null : clearOperations} title="Operations" icon={<MedicalServices />}>
              <Operations
                existingData={initialPatientData?.operations || []}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Operation Details")}
                readOnly={readOnly}
              />
            </TabPanel>
          )}

          {activeTab === 7 && (
            <TabPanel onClear={readOnly ? null : clearPrescriptions} title="Prescription Details" icon={<Medication />}>
              <PrescriptionForm
                data={prescriptionsData}
                setData={setPrescriptionsData}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Prescription Details")}
                readOnly={readOnly}
              />
            </TabPanel>
          )}

          {activeTab === 8 && (
            <TabPanel onClear={readOnly ? null : clearDiagnoses} title="Diagnoses" icon={<Healing />}>
              <DiagnosesTab
                existingData={initialPatientData?.diagnoses || []}
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Diagnoses")}
                readOnly={readOnly}
              />
            </TabPanel>
          )}

          {/* ── NEW: Orders tab (tab index 9, Doctor-only) ── */}
          {activeTab === 9 && userRole === "Doctor" && (
            <TabPanel onClear={null} title="Doctor Orders" icon={<PlaylistAdd />}>
              <DoctorOrdersTab
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                investigations={initialPatientData?.investigations || []}
                eyeExaminations={initialPatientData?.eyeExaminations || []}
                prescriptions={initialPatientData?.prescriptions || prescriptionsData}
                readOnly={false}
              />
            </TabPanel>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default MedicalRecord;