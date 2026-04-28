import React, { createContext, useContext, useState, useEffect } from 'react';

const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [patientData, setPatientData] = useState({
    patientId: null,
    patientName: null,
    patientEmail: null,
    patientPhone: null,
    patientDateOfBirth: null,
    isLoaded: false
  });

  useEffect(() => {
    // Load patient data from localStorage
    const loadPatientData = () => {
      const id = localStorage.getItem('patientId');
      const name = localStorage.getItem('patientName');
      const email = localStorage.getItem('patientEmail');
      const phone = localStorage.getItem('patientPhone');
      const dob = localStorage.getItem('patientDateOfBirth');

      setPatientData({
        patientId: id,
        patientName: name,
        patientEmail: email,
        patientPhone: phone,
        patientDateOfBirth: dob,
        isLoaded: true
      });
    };

    loadPatientData();
  }, []);

  const updatePatientData = (newData) => {
    setPatientData(prevData => ({
      ...prevData,
      ...newData
    }));

    // Also update localStorage
    if (newData.patientId) localStorage.setItem('patientId', newData.patientId);
    if (newData.patientName) localStorage.setItem('patientName', newData.patientName);
    if (newData.patientEmail) localStorage.setItem('patientEmail', newData.patientEmail);
    if (newData.patientPhone) localStorage.setItem('patientPhone', newData.patientPhone);
    if (newData.patientDateOfBirth) localStorage.setItem('patientDateOfBirth', newData.patientDateOfBirth);
  };

  const clearPatientData = () => {
    setPatientData({
      patientId: null,
      patientName: null,
      patientEmail: null,
      patientPhone: null,
      patientDateOfBirth: null,
      isLoaded: false
    });

    localStorage.removeItem('patientId');
    localStorage.removeItem('patientName');
    localStorage.removeItem('patientEmail');
    localStorage.removeItem('patientPhone');
    localStorage.removeItem('patientDateOfBirth');
  };

  return (
    <PatientContext.Provider value={{ patientData, updatePatientData, clearPatientData }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within PatientProvider');
  }
  return context;
};
