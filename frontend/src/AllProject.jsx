import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import SignUpPage from "./Pages/SignUpPage"; 
import DoctorLayout from "./DoctorDashboard/DoctorLayout";
import DoctorDashboard from "./DoctorDashboard/Dashboard";
import ReceptionistLayout from "./Appointment/ReceptionistLayout";
import ReceptionistDashboard from "./Pages/ReceptionistDashboard";
import AppointmentsPage from "./Pages/AppointmentsPage";
import ClinicPage from "./Pages/ClinicPage";
import SettingsPage from "./Pages/SettingsPage";
import EMRPage from "./Pages/EMRPage";
import PatientPage from "./Pages/PatientPage";
import FinancePage from "./Pages/FinancePage";
import AboutUs from "./Pages/AboutUs";
import ContactPage from "./Pages/ContactPage";

function AllProject() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} /> 
        
        
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="patients" element={<PatientPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="clinic-system" element={<ClinicPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="view-medical-record/:patientName" element={<EMRPage />} />
        </Route>

        {/* Receptionist Routes */}
        <Route path="/receptionist" element={<ReceptionistLayout />}>
          <Route index element={<ReceptionistDashboard />} />
          <Route path="patients" element={<PatientPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        <Route path="/appointments" element={<AppointmentsPage />} />

        
        <Route path="/patient" element={<PatientPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact" element={<ContactPage />} />
        
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default AllProject;