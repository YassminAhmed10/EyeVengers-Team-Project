// MedicalRecord.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Paper, Typography } from "@mui/material";
import axios from "axios";
import {
  Assignment, History, Science, Visibility, CloudUpload,
  MedicalServices, Medication, Healing, ImageSearch, PlaylistAdd,
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
import DoctorOrdersTab from "./DoctorOrdersTab";
import ClearButton from "./ClearButton";
import "./EMRComponents.css";

const BASE_URL = "http://localhost:5201/api";

const TabPanel = ({ children, onClear, title, icon }) => (
  <Box sx={{ mt: 3 }}>
    <Box sx={{
      position: "relative", display: "flex", justifyContent: "center",
      alignItems: "center", mb: 2, pb: 1, borderBottom: "2px solid #1e3a5f",
    }}>
      <Typography variant="h6" sx={{ color: "#1e3a5f", fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
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
  patientName, patientId, initialPatientData, fromAppointment,
  medicalRecordId, onSectionSaved, readOnly = false, userRole = "Doctor",
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [patientData, setPatientData] = useState(initialPatientData || {
    name: patientName || "", age: "", gender: "", visitDate: "",
    patientID: patientId || "", contactNumber: "", email: "", address: "",
    insuranceCompany: "", insuranceId: "", policyNumber: "", coverage: "",
    nationalId: "", emergencyContactName: "", emergencyContactPhone: "", birthDate: null,
  });

  const normalizePatientData = (data) => {
    if (!data) return null;
    return {
      name:                 data.name || data.Name || data.fullName || data.FullName || "",
      age:                  data.age  || data.Age  || "",
      gender:               data.gender || data.Gender || "",
      visitDate:            data.visitDate || data.VisitDate || "",
      patientID:            data.patientID || data.PatientID || data.patientId || data.PatientId || "",
      contactNumber:        data.contactNumber || data.ContactNumber || data.phoneNumber || data.PhoneNumber || "",
      email:                data.email || data.Email || "",
      address:              data.address || data.Address || "",
      insuranceCompany:     data.insuranceCompany || data.InsuranceCompany || "",
      insuranceId:          data.insuranceId || data.InsuranceId || "",
      policyNumber:         data.policyNumber || data.PolicyNumber || "",
      coverage:             data.coverage || data.Coverage || "",
      nationalId:           data.nationalId || data.NationalId || "",
      emergencyContactName: data.emergencyContactName || data.EmergencyContactName || "",
      emergencyContactPhone: data.emergencyContactPhone || data.EmergencyContactPhone || "",
      birthDate:            data.birthDate || data.BirthDate || data.dateOfBirth || data.DateOfBirth || null,
    };
  };

  useEffect(() => {
    if (initialPatientData) {
      const normalized = normalizePatientData(initialPatientData);
      console.log("[PatientData] Raw initialPatientData:", initialPatientData);
      console.log("[PatientData] Normalized patient data:", normalized);
      console.log("[PatientData] Gender value:", initialPatientData?.gender || initialPatientData?.Gender);
      console.log("[PatientData] National ID:", initialPatientData?.nationalId || initialPatientData?.NationalId);
      console.log("[PatientData] Address:", initialPatientData?.address || initialPatientData?.Address);
      console.log("[PatientData] Insurance Company:", initialPatientData?.insuranceCompany || initialPatientData?.InsuranceCompany);
      setPatientData(normalized);
    }
  }, [initialPatientData]);

  const [complaintData,      setComplaintData]      = useState({ complaint: "" });
  const [historyData,        setHistoryData]         = useState({ previousEye: "", familyHistory: "", allergies: "", chronicDiseases: "", currentMedications: "", eyeSurgeries: "", familyEyeDiseases: "", visionSymptoms: "" });
  const [prescriptionsData,  setPrescriptionsData]   = useState([{ drug: "", form: "", dose: "", frequency: "", customFrequency: "", notes: "" }]);
  const [eyeExamData,        setEyeExamData]         = useState({ rightEye: "", leftEye: "", eyePressure: "", pupilReaction: "", pupilReactionOther: "", eyeAlignment: "", eyeAlignmentOther: "", eyeMovements: "", eyeMovementsOther: "", anteriorSegment: "", fundusObservation: "", otherNotes: "" });
  const [investigationsData, setInvestigationsData]  = useState([]);
  const [_pastImagesData,    setPastImagesData]       = useState([]);
  const [_operationsData,    setOperationsData]       = useState({});
  const [_diagnosesData,     setDiagnosesData]        = useState([{ diagnosis: "", status: "", severity: "", notes: "", checkupDate: "" }]);

  // ── Fetch investigations ──────────────────────────────────────────────────
  const fetchInvestigations = useCallback(async () => {
    if (!medicalRecordId) { setInvestigationsData([]); return; }
    try {
      try {
        const res = await axios.get(`${BASE_URL}/Investigation/ByRecord/${medicalRecordId}`);
        if (Array.isArray(res.data)) { setInvestigationsData(res.data); return; }
      } catch (e) {
        console.log("[FETCH] Fallback investigation fetch:", e?.message);
      }
      const res = await axios.get(`${BASE_URL}/MedicalRecord/${medicalRecordId}`);
      const inv = res.data?.investigations || res.data?.Investigations || [];
      setInvestigationsData(Array.isArray(inv) ? inv : []);
    } catch (err) {
      console.error("[FETCH] investigations:", err);
      setInvestigationsData([]);
    }
  }, [medicalRecordId]);

  // ── Fetch eye exams ───────────────────────────────────────────────────────
  const fetchEyeExams = useCallback(async () => {
    if (!medicalRecordId) { setEyeExamData([]); return; }
    try {
      try {
        const res = await axios.get(`${BASE_URL}/EyeExamination/${medicalRecordId}`);
        if (Array.isArray(res.data)) { setEyeExamData(res.data); return; }
      } catch (e) {
        console.log("[FETCH] Fallback eye exam fetch:", e?.message);
      }
      const res = await axios.get(`${BASE_URL}/MedicalRecord/${medicalRecordId}`);
      const exams = res.data?.eyeExaminations || res.data?.EyeExaminations || [];
      setEyeExamData(Array.isArray(exams) ? exams : []);
    } catch (err) {
      console.error("[FETCH] eye exams:", err);
      setEyeExamData([]);
    }
  }, [medicalRecordId]);

  // ── Fetch prescriptions ───────────────────────────────────────────────────
  const mapPrescriptions = (prescriptions) => {
    const mapped = prescriptions.flatMap(p =>
      (p.items || p.Items || []).map(item => ({
        drug:            item.drug            || item.Drug            || "",
        form:            item.form            || item.Form            || "",
        dose:            item.dose            || item.Dose            || "",
        customDose:      item.customDose      || item.CustomDose      || "",
        frequency:       item.frequency       || item.Frequency       || "",
        customFrequency: item.customFrequency || item.CustomFrequency || "",
        notes:           item.notes           || item.Notes           || p.notes || "",
      }))
    );
    return mapped.length > 0 ? mapped : [{ drug: "", form: "", dose: "", frequency: "", customFrequency: "", notes: "" }];
  };

  const fetchPrescriptions = useCallback(async () => {
    if (!medicalRecordId) { setPrescriptionsData([]); return; }
    try {
      const res = await axios.get(`${BASE_URL}/Prescription/${medicalRecordId}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setPrescriptionsData(mapPrescriptions(data));
    } catch {
      try {
        const res = await axios.get(`${BASE_URL}/MedicalRecord/${medicalRecordId}`);
        const data = res.data?.prescriptions || res.data?.Prescriptions || [];
        if (Array.isArray(data) && data.length > 0) {
          setPrescriptionsData(mapPrescriptions(data));
        }
      } catch (err2) {
        console.error("[FETCH] prescriptions:", err2);
        setPrescriptionsData([]);
      }
    }
  }, [medicalRecordId]);

  // ── Section saved callback ────────────────────────────────────────────────
  const handleSectionSaved = useCallback((sectionName) => {
    if (sectionName === "Investigations")      fetchInvestigations();
    else if (sectionName === "Eye Examination") fetchEyeExams();
    else if (sectionName === "Prescription Details") fetchPrescriptions();
    onSectionSaved?.(sectionName);
  }, [fetchInvestigations, fetchEyeExams, fetchPrescriptions, onSectionSaved]);

  // ── Mount fetch ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (medicalRecordId) {
      console.log("[MOUNT] Component mounted, fetching all data for medicalRecordId:", medicalRecordId);
      fetchInvestigations();
      fetchEyeExams();
      fetchPrescriptions();
    }
  }, [medicalRecordId, fetchInvestigations, fetchEyeExams, fetchPrescriptions]);

  // ── Populate from initialPatientData ─────────────────────────────────────
  useEffect(() => {
    if (!initialPatientData) return;

    if (initialPatientData.histories?.length > 0) {
      const h = initialPatientData.histories[0];
      setHistoryData({
        previousEye:       h.previousEye       || h.pastMedicalHistory || h.PreviousEye || "",
        familyHistory:     h.familyHistory      || h.FamilyHistory     || "",
        allergies:         h.allergies          || h.Allergies          || "",
        chronicDiseases:   h.chronicDiseases    || "",
        currentMedications: h.currentMedications || "",
        eyeSurgeries:      h.eyeSurgeries       || "",
        familyEyeDiseases: h.familyEyeDiseases  || "",
        visionSymptoms:    h.visionSymptoms      || "",
      });
    } else if (initialPatientData.eyeAllergies || initialPatientData.chronicDiseases || initialPatientData.currentMedications) {
      setHistoryData({
        previousEye:        initialPatientData.eyeSurgeries        || initialPatientData.otherEyeSurgeries   || "",
        familyHistory:      initialPatientData.familyEyeDiseases   || initialPatientData.otherFamilyDiseases || "",
        allergies:          initialPatientData.eyeAllergies         || initialPatientData.otherAllergies      || "",
        chronicDiseases:    initialPatientData.chronicDiseases      || "",
        currentMedications: initialPatientData.currentMedications   || "",
        eyeSurgeries:       initialPatientData.eyeSurgeries         || initialPatientData.otherEyeSurgeries   || "",
        familyEyeDiseases:  initialPatientData.familyEyeDiseases    || initialPatientData.otherFamilyDiseases || "",
        visionSymptoms:     initialPatientData.visionSymptoms        || "",
      });
    }

    if (initialPatientData.complaints?.length > 0) {
      const c = initialPatientData.complaints[0];
      setComplaintData({ complaint: c.originalText || c.complaint || c.OriginalText || "" });
    }

    if (initialPatientData.prescriptions?.length > 0) {
      const mapped = [];
      for (const p of initialPatientData.prescriptions) {
        const items = p.items || p.Items || [];
        if (items.length > 0) {
          for (const item of items) {
            mapped.push({
              drug:            item.drug      || item.Drug      || item.medication || "",
              form:            item.form      || item.Form      || "",
              dose:            item.dose      || item.Dose      || item.dosage     || "",
              customDose:      item.customDose || item.CustomDose || "",
              frequency:       item.frequency || item.Frequency || "",
              customFrequency: item.customFrequency || item.CustomFrequency || "",
              notes:           item.notes     || item.Notes     || p.notes || "",
            });
          }
        } else if (p.drug || p.Drug) {
          mapped.push({
            drug: p.Drug || p.drug || "", form: p.Form || p.form || "",
            dose: p.Dose || p.dose || "", customDose: p.customDose || "",
            frequency: p.Frequency || p.frequency || "", customFrequency: p.customFrequency || "",
            notes: p.Notes || p.notes || "",
          });
        }
      }
      if (mapped.length > 0) setPrescriptionsData(mapped);
    }
  }, [initialPatientData]);

  // ── Clear helpers ─────────────────────────────────────────────────────────
  const clearComplaint     = () => setComplaintData({ complaint: "" });
  const clearHistory       = () => setHistoryData({ previousEye: "", familyHistory: "", allergies: "", chronicDiseases: "", currentMedications: "", eyeSurgeries: "", familyEyeDiseases: "", visionSymptoms: "" });
  const clearEyeExam       = () => setEyeExamData({ rightEye: "", leftEye: "", eyePressure: "", pupilReaction: "", pupilReactionOther: "", eyeAlignment: "", eyeAlignmentOther: "", eyeMovements: "", eyeMovementsOther: "", anteriorSegment: "", fundusObservation: "", otherNotes: "" });
  const clearInvestigations = () => setInvestigationsData([]);
  const clearPastImages    = () => setPastImagesData([]);
  const clearOperations    = () => setOperationsData({});
  const clearPrescriptions  = () => setPrescriptionsData([{ drug: "", form: "", dose: "", frequency: "", customFrequency: "", notes: "" }]);
  const clearDiagnoses     = () => setDiagnosesData([{ diagnosis: "", status: "", severity: "", notes: "", checkupDate: "" }]);

  const handleChange = (_, newValue) => setActiveTab(newValue);

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
            <strong>View Mode:</strong> Your medical record is read-only.
          </Typography>
        </Paper>
      )}

      <Paper elevation={2} sx={{ borderRadius: 3, border: "1px solid #cae8ff", overflow: "hidden" }}>
        <Box sx={{ p: 3, pb: 0 }}>
          <PatientInfo patient={patientData} readOnly />
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderTop: "1px solid #e0e0e0", borderBottom: "1px solid #e0e0e0",
            bgcolor: "#ffffff",
            "& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: "0.9rem", color: "#555", minHeight: 68, "&.Mui-selected": { color: "#1e3a5f", fontWeight: 700 } },
            "& .MuiTabs-indicator": { backgroundColor: "#1e3a5f", height: 3 },
          }}
        >
          <Tab icon={<Assignment />}      label="Complaint"      iconPosition="start" />
          <Tab icon={<History />}         label="History"        iconPosition="start" />
          <Tab icon={<Science />}         label="Investigations" iconPosition="start" />
          <Tab icon={<ImageSearch />}     label="Radiology"      iconPosition="start" />
          <Tab icon={<Visibility />}      label="Eye Exam"       iconPosition="start" />
          <Tab icon={<CloudUpload />}     label="Images"         iconPosition="start" />
          <Tab icon={<MedicalServices />} label="Operations"     iconPosition="start" />
          <Tab icon={<Medication />}      label="Prescription"   iconPosition="start" />
          <Tab icon={<Healing />}         label="Diagnoses"      iconPosition="start" />
          {userRole === "Doctor" && (
            <Tab icon={<PlaylistAdd />} label="Orders" iconPosition="start"
              sx={{ "&.Mui-selected": { color: "#7b1fa2 !important" }, color: "#7b1fa2 !important", fontWeight: "700 !important" }} />
          )}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <TabPanel onClear={readOnly ? null : clearComplaint} title="Patient Complaint" icon={<Assignment />}>
              <PatientComplaint data={complaintData} setData={setComplaintData} patientId={patientId}
                medicalRecordId={medicalRecordId} existingData={initialPatientData?.complaints || []}
                onSaved={() => onSectionSaved?.("Patient Complaint")} readOnly={readOnly} />
            </TabPanel>
          )}

          {activeTab === 1 && (
            <TabPanel onClear={readOnly ? null : clearHistory} title="Medical & Family History" icon={<History />}>
              <MedicalHistory data={historyData} setData={setHistoryData} historyData={historyData}
                existingData={initialPatientData?.histories || []} patientName={patientName}
                patientId={patientId} medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Medical & Family History")} readOnly={readOnly} />
            </TabPanel>
          )}

          {activeTab === 2 && (
            <TabPanel onClear={readOnly ? null : clearInvestigations} title="Investigations" icon={<Science />}>
              <Investigations existingData={initialPatientData?.investigations || []}
                patientId={patientId} medicalRecordId={medicalRecordId}
                onSaved={() => handleSectionSaved("Investigations")} readOnly={readOnly} />
            </TabPanel>
          )}

          {activeTab === 3 && (
            <TabPanel onClear={null} title="Radiology Center Investigations" icon={<ImageSearch />}>
              <RadiologyInvestigations patientId={patientId} readOnly={true} />
            </TabPanel>
          )}

          {activeTab === 4 && (
            <TabPanel onClear={readOnly ? null : clearEyeExam} title="Eye Examination" icon={<Visibility />}>
              <EyeExaminationForm existingData={initialPatientData?.eyeExaminations || []}
                patientId={patientId} medicalRecordId={medicalRecordId}
                onSaved={() => handleSectionSaved("Eye Examination")} readOnly={readOnly} />
            </TabPanel>
          )}

          {activeTab === 5 && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, pb: 1, borderBottom: "2px solid #1e3a5f" }}>
                <Typography variant="h6" sx={{ color: "#1e3a5f", fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                  <CloudUpload /> Past Images & Tests
                </Typography>
                <ClearButton onClear={readOnly ? null : clearPastImages} label="Clear Images" />
              </Box>
              <PastImageTests medicalRecordId={medicalRecordId} readOnly={readOnly} />
            </Box>
          )}

          {activeTab === 6 && (
            <TabPanel onClear={readOnly ? null : clearOperations} title="Operations" icon={<MedicalServices />}>
              <Operations existingData={initialPatientData?.operations || []}
                patientId={patientId} medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Operation Details")} readOnly={readOnly} />
            </TabPanel>
          )}

          {activeTab === 7 && (
            <TabPanel onClear={readOnly ? null : clearPrescriptions} title="Prescription Details" icon={<Medication />}>
              <PrescriptionForm data={prescriptionsData} setData={setPrescriptionsData}
                patientId={patientId} medicalRecordId={medicalRecordId}
                onSaved={() => handleSectionSaved("Prescription Details")} readOnly={readOnly} />
            </TabPanel>
          )}

          {activeTab === 8 && (
            <TabPanel onClear={readOnly ? null : clearDiagnoses} title="Diagnoses" icon={<Healing />}>
              <DiagnosesTab existingData={initialPatientData?.diagnoses || []}
                patientId={patientId} medicalRecordId={medicalRecordId}
                onSaved={() => onSectionSaved?.("Diagnoses")} readOnly={readOnly} />
            </TabPanel>
          )}

          {activeTab === 9 && userRole === "Doctor" && (
            <TabPanel onClear={null} title="Doctor Orders" icon={<PlaylistAdd />}>
              <DoctorOrdersTab
                patientId={patientId}
                medicalRecordId={medicalRecordId}
                investigations={Array.isArray(investigationsData) ? investigationsData : []}
                eyeExaminations={Array.isArray(eyeExamData) ? eyeExamData : []}
                prescriptions={Array.isArray(prescriptionsData) ? prescriptionsData : []}
                readOnly={false}
                navigate={navigate}
              />
            </TabPanel>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default MedicalRecord;