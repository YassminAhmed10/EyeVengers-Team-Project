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
  };

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
};
