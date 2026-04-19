import React from "react";
import { usePatient } from "../context/PatientContext";

/**
 * Example Component: PatientProfile
 * 
 * This component demonstrates how to use the PatientContext hook
 * to access and display patient data throughout the Radiology Center System.
 * 
 * Usage in any component:
 * 1. Import the hook: import { usePatient } from '../context/PatientContext';
 * 2. Use the hook: const { patient, updatePatient, clearPatient, isLoading } = usePatient();
 * 3. Access patient data: patient.name, patient.email, patient.phone, etc.
 */

export function PatientProfile() {
  const { patient, updatePatient, clearPatient, isLoading } = usePatient();

  // Show loading state while initializing patient data
  if (isLoading) {
    return (
      <div className="patient-profile loading">
        <p>Loading patient information...</p>
      </div>
    );
  }

  // Show message if no patient is currently loaded
  if (!patient?.id) {
    return (
      <div className="patient-profile empty">
        <p>No patient currently selected.</p>
        <p>Patient data will appear here after you log in via the Eye Clinic system.</p>
      </div>
    );
  }

  return (
    <div className="patient-profile">
      <div className="profile-header">
        <h2>Patient Information</h2>
      </div>

      <div className="profile-details">
        {/* Patient ID */}
        <div className="detail-row">
          <label>Patient ID:</label>
          <span>{patient.id || "Not available"}</span>
        </div>

        {/* Patient Name */}
        <div className="detail-row">
          <label>Name:</label>
          <span>{patient.name || "Not available"}</span>
        </div>

        {/* Patient Email */}
        <div className="detail-row">
          <label>Email:</label>
          <span>{patient.email || "Not available"}</span>
        </div>

        {/* Patient Phone */}
        <div className="detail-row">
          <label>Phone:</label>
          <span>{patient.phone || "Not available"}</span>
        </div>

        {/* Patient Date of Birth */}
        <div className="detail-row">
          <label>Date of Birth:</label>
          <span>
            {patient.dateOfBirth
              ? new Date(patient.dateOfBirth).toLocaleDateString()
              : "Not available"}
          </span>
        </div>
      </div>

      {/* Example: Update patient data */}
      <div className="profile-actions">
        <button
          onClick={() => {
            updatePatient({
              name: patient.name || "Updated Name",
            });
          }}
          className="btn-primary"
        >
          Update Profile
        </button>

        {/* Example: Clear patient data */}
        <button onClick={clearPatient} className="btn-secondary">
          Clear Patient Data
        </button>
      </div>

      {/* Debug info (remove in production) */}
      <details className="debug-info">
        <summary>Debug Information</summary>
        <pre>{JSON.stringify(patient, null, 2)}</pre>
      </details>
    </div>
  );
}

/**
 * Example: Using PatientContext in a Greeting Component
 */
export function PatientGreeting() {
  const { patient, isLoading } = usePatient();

  if (isLoading) return <div>Loading...</div>;

  const greeting = patient?.name
    ? `Welcome back, ${patient.name}! 👋`
    : "Welcome to the Radiology Center! 👋";

  return <div className="greeting">{greeting}</div>;
}

/**
 * Example: Using PatientContext in an Appointment Booking Component
 */
export function AppointmentForm() {
  const { patient, isLoading } = usePatient();
  const [formData, setFormData] = React.useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
  });

  // Auto-fill form with patient data when it's available
  React.useEffect(() => {
    if (!isLoading && patient?.id) {
      setFormData({
        patientName: patient.name || "",
        patientEmail: patient.email || "",
        patientPhone: patient.phone || "",
      });
    }
  }, [patient, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Booking appointment for:", formData);
    // Submit booking...
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="appointment-form">
      <div className="form-group">
        <label htmlFor="name">Patient Name:</label>
        <input
          id="name"
          type="text"
          value={formData.patientName}
          onChange={(e) =>
            setFormData({ ...formData, patientName: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={formData.patientEmail}
          onChange={(e) =>
            setFormData({ ...formData, patientEmail: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone:</label>
        <input
          id="phone"
          type="tel"
          value={formData.patientPhone}
          onChange={(e) =>
            setFormData({ ...formData, patientPhone: e.target.value })
          }
          required
        />
      </div>

      <button type="submit" className="btn-primary">
        Book Appointment
      </button>
    </form>
  );
}

/**
 * Example: Conditional rendering based on patient data
 */
export function PatientDashboard() {
  const { patient, isLoading } = usePatient();

  if (isLoading) return <div>Loading patient dashboard...</div>;

  // Only show patient-specific content if patient is logged in
  if (!patient?.id) {
    return (
      <div className="dashboard-empty">
        <h2>Please log in to access your dashboard</h2>
        <p>Go to the Eye Clinic system to select a patient first.</p>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      <h1>Dashboard for {patient.name}</h1>

      <div className="dashboard-grid">
        <div className="card">
          <h3>My Appointments</h3>
          <p>View your upcoming scans and appointments</p>
        </div>

        <div className="card">
          <h3>My Reports</h3>
          <p>Access your radiology reports and images</p>
        </div>

        <div className="card">
          <h3>Medical Records</h3>
          <p>Review your complete medical history</p>
        </div>

        <div className="card">
          <h3>Account Settings</h3>
          <p>Update your profile and preferences</p>
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
