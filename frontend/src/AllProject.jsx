import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import SignUpPage from "./Pages/SignUpPage"; 
import DoctorLayout from "./DoctorDashboard/DoctorLayout";
import DoctorDashboard from "./DoctorDashboard/Dashboard";
import ReceptionistLayout from "./Appointment/ReceptionistLayout";
import ReceptionistDashboard from "./Appointment/ReceptionistDashboard";
import ReceptionistProfile from "./Appointment/ReceptionistProfile";
import AppointmentsPage from "./Pages/AppointmentsPage";
import BookAppointmentPage from "./Pages/BookAppointmentPage";
import AppointmentDetails from "./Pages/AppointmentDetails";
import ClinicPageNew from "./Pages/ClinicPageNew";
import SettingsPage from "./Pages/SettingsPage";
import EMRPage from "./Pages/EMRPage";
import PatientPageNew from "./Pages/PatientPageNew";
import PatientHomepage from "./Pages/PatientHomepage";
import PatientAppointments from "./Pages/PatientAppointments";
import FinancePageNew from "./Pages/FinancePageNew";
import AboutUs from "./Pages/AboutUs";
import ContactPage from "./Pages/ContactPage";

function AllProject() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} /> 
        <Route path="/book-appointment" element={<BookAppointmentPage />} /> 
        
        
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="patients" element={<PatientPageNew />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="appointment-details/:appointmentId" element={<AppointmentDetails />} />
          <Route path="clinic-system" element={<ClinicPageNew />} />
          <Route path="finance" element={<FinancePageNew />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="view-medical-record/:patientId" element={<EMRPage />} />
        </Route>

        {/* Receptionist Routes */}
        <Route path="/receptionist" element={<ReceptionistLayout />}>
          <Route index element={<ReceptionistDashboard />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="profile" element={<ReceptionistProfile />} />
          <Route path="patients" element={<PatientPageNew />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        <Route path="/appointments" element={<AppointmentsPage />} />

        
        <Route path="/patient" element={<PatientHomepage />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact" element={<ContactPage />} />
        
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default AllProject;