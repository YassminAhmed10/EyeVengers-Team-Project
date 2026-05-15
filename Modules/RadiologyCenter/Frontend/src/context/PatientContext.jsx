import React, { createContext, useState, useContext, useEffect } from "react";

const PatientContext = createContext();

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatient must be used within a PatientProvider");
  }
  return context;
};

export const PatientProvider = ({ children }) => {
  const [patient, setPatient] = useState({
    id: null,
    name: null,
    email: null,
    phone: null,
    dateOfBirth: null,
  });

  // Entry source tracking: 'clinic_system' or 'radiology_direct'
  const [entrySource, setEntrySource] = useState('radiology_direct');
  
  // Clinic system details
  const [clinicSystemInfo, setClinicSystemInfo] = useState({
    name: null,        // e.g., "Eye Clinic", "Eye Center"
    backUrl: null,     // Return URL to clinic system
    doctorId: null,    // Doctor who referred (if from doctor order)
    orderId: null,     // Doctor order ID (if from order)
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize patient data from localStorage or URL parameters
    const initializePatientData = () => {
      // First, check for incoming URL parameters (from the Eye Clinic system)
      const params = new URLSearchParams(window.location.search);
      const incomingPatientId = params.get("patientId");
      const incomingPatientName = params.get("patientName");
      const incomingPatientEmail = params.get("patientEmail");
      const incomingPatientPhone = params.get("patientPhone");
      const incomingPatientDateOfBirth = params.get("patientDateOfBirth");
      
      // ===== DETECT ENTRY SOURCE =====
      // Check for clinic system integration markers
      const fromClinic = params.get("fromClinic") === "true";
      const clinicName = params.get("clinicName") || params.get("clinicSystemName");
      const clinicBackUrl = params.get("clinicBackUrl") || params.get("returnUrl");
      const doctorId = params.get("doctorId");
      const orderId = params.get("orderId");
      
      // Check for FHIR integration flag
      const fhirSystemId = params.get("fhirSystemId");
      const clinicOrderId = params.get("clinicOrderId");
      
      // Check token for clinic system claim
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      let tokenHasClinicSource = false;
      try {
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          tokenHasClinicSource = payload.clinicSource === true || payload.fromClinic === true;
        }
      } catch (e) {
        console.warn('[Entry Source] Could not parse token claims');
      }
      
      // Determine entry source
      const isFromClinic = fromClinic || fhirSystemId || clinicOrderId || tokenHasClinicSource;
      
      if (isFromClinic) {
        setEntrySource('clinic_system');
        setClinicSystemInfo({
          name: clinicName || localStorage.getItem("clinicSystemName") || "Clinic System",
          backUrl: clinicBackUrl || localStorage.getItem("clinicBackUrl"),
          doctorId: doctorId,
          orderId: orderId || clinicOrderId
        });
        console.log('[Entry Source] Patient from clinic system:', { 
          clinicName: clinicName || localStorage.getItem("clinicSystemName"),
          doctorId,
          orderId 
        });
      } else {
        setEntrySource('radiology_direct');
        console.log('[Entry Source] Patient direct entry to radiology');
      }
      
      // Persist clinic info to localStorage for session persistence
      if (isFromClinic) {
        localStorage.setItem("entrySource", "clinic_system");
        if (clinicName) localStorage.setItem("clinicSystemName", clinicName);
        if (clinicBackUrl) localStorage.setItem("clinicBackUrl", clinicBackUrl);
      } else {
        localStorage.setItem("entrySource", "radiology_direct");
      }
      
      // If we have incoming data (even if some values are empty strings), use it
      if (incomingPatientId !== null || incomingPatientName !== null) {
        const patientData = {
          id: incomingPatientId && incomingPatientId.trim() ? incomingPatientId : localStorage.getItem("patientId"),
          name: incomingPatientName && incomingPatientName.trim() ? incomingPatientName : localStorage.getItem("patientName"),
          email: incomingPatientEmail && incomingPatientEmail.trim() ? incomingPatientEmail : localStorage.getItem("patientEmail"),
          phone: incomingPatientPhone && incomingPatientPhone.trim() ? incomingPatientPhone : localStorage.getItem("patientPhone"),
          dateOfBirth: incomingPatientDateOfBirth && incomingPatientDateOfBirth.trim() ? incomingPatientDateOfBirth : localStorage.getItem("patientDateOfBirth"),
        };

        // Persist to localStorage
        if (patientData.id) localStorage.setItem("patientId", patientData.id);
        if (patientData.name) {
          localStorage.setItem("patientName", patientData.name);
          localStorage.setItem("userName", patientData.name);
        }
        if (patientData.email) {
          localStorage.setItem("patientEmail", patientData.email);
          localStorage.setItem("userEmail", patientData.email);
        }
        if (patientData.phone) localStorage.setItem("patientPhone", patientData.phone);
        if (patientData.dateOfBirth) localStorage.setItem("patientDateOfBirth", patientData.dateOfBirth);

        setPatient(patientData);
      } else {
        // If no incoming data, load from localStorage
        const storedPatient = {
          id: localStorage.getItem("patientId"),
          name: localStorage.getItem("patientName"),
          email: localStorage.getItem("patientEmail"),
          phone: localStorage.getItem("patientPhone"),
          dateOfBirth: localStorage.getItem("patientDateOfBirth"),
        };
        setPatient(storedPatient);
      }

      setIsLoading(false);
    };

    initializePatientData();
  }, []);

  const updatePatient = (patientData) => {
    // Update state
    const updatedPatient = {
      ...patient,
      ...patientData,
    };
    setPatient(updatedPatient);

    // Persist to localStorage
    if (patientData.id) localStorage.setItem("patientId", patientData.id);
    if (patientData.name)
      localStorage.setItem("patientName", patientData.name);
    if (patientData.email)
      localStorage.setItem("patientEmail", patientData.email);
    if (patientData.phone)
      localStorage.setItem("patientPhone", patientData.phone);
    if (patientData.dateOfBirth)
      localStorage.setItem("patientDateOfBirth", patientData.dateOfBirth);
  };

  const clearPatient = () => {
    setPatient({
      id: null,
      name: null,
      email: null,
      phone: null,
      dateOfBirth: null,
    });

    // Clear localStorage
    [
      "patientId",
      "patientName",
      "patientEmail",
      "patientPhone",
      "patientDateOfBirth",
    ].forEach((key) => localStorage.removeItem(key));
  };

  const value = {
    patient,
    updatePatient,
    clearPatient,
    isLoading,
    entrySource,
    clinicSystemInfo,
    setEntrySource,
    setClinicSystemInfo
  };

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
};
