import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import MedicalRecord from "../EMR/MedicalRecord";
import "./EMR.css";

function EMRPage() {
  const navigate = useNavigate();
  const { patientName } = useParams();
  const location = useLocation();
  const decodedPatientName = decodeURIComponent(patientName || "");
  
  const patientId = location.state?.patientId || "0000";
  const userRole = localStorage.getItem("userRole");

  if (userRole !== "Doctor") {
    navigate("/login");
    return null;
  }

  return (
    <div className="emr-page-container">
      <div className="emr-main-content" style={{ marginLeft: 0 }}>
        <div className="emr-top-actions">
          <button
            className="action-button primary"
            onClick={() => navigate("/doctor")}
            aria-label="Back to Dashboard"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Back to Dashboard</span>
          </button>
          
          <button
            className="action-button icon-only print-btn"
            onClick={() => window.print()}
            aria-label="Print Patient Record"
            title="Print Record"
          >
            <span className="material-symbols-outlined">print</span>
          </button>
        </div>

        <section className="patient-banner">
          <div className="patient-avatar-section">
            <div className="patient-avatar">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div className="patient-main-info">
              <h2 className="patient-display-name">{decodedPatientName}</h2>
              <p className="patient-subtitle">Medical Record Overview</p>
            </div>
          </div>

          <div className="patient-stats">
            <div className="stat-item">
              <span className="material-symbols-outlined">event</span>
              <div>
                <p className="stat-label">Last Visit</p>
                <p className="stat-value">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="stat-item">
              <span className="material-symbols-outlined">badge</span>
              <div>
                <p className="stat-label">Patient ID</p>
                <p className="stat-value font-mono">{patientId}</p>
              </div>
            </div>
          </div>
        </section>

        <main className="emr-content-wrapper">
          <MedicalRecord 
            patientName={decodedPatientName} 
            patientId={patientId}
          />
        </main>
      </div>
    </div>
  );
}

export default EMRPage;