import React, { useState } from 'react';
import './DoctorMedicalRecord.css';

/**
 * Doctor Medical Record Component
 * Matches the design of patient system's medical record
 * Located at: /doctor/patient/{patientId}/medical-record
 */
export default function DoctorMedicalRecord({ patient, patientId, doctorName }) {
  const [activeTab, setActiveTab] = useState('patient-info');
  const [selectedInvestigations, setSelectedInvestigations] = useState([]);

  const tabs = [
    { id: 'patient-info', label: 'Patient Information', icon: '👤' },
    { id: 'complaint', label: 'Complaint', icon: '🔍' },
    { id: 'history', label: 'History', icon: '📋' },
    { id: 'investigations', label: 'Investigations', icon: '⚕️' },
    { id: 'eye-exam', label: 'Eye Exam', icon: '👁️' },
    { id: 'images', label: 'Images', icon: '🖼️' },
    { id: 'operations', label: 'Operations', icon: '🏥' },
    { id: 'prescriptions', label: 'Prescription', icon: '💊' },
    { id: 'diagnoses', label: 'Diagnoses', icon: '🔬' },
  ];

  const investigationTypes = [
    { id: 'CBC', label: 'CBC' },
    { id: 'Blood Sugar', label: 'Blood Sugar' },
    { id: 'CT Scan', label: 'CT Scan' },
    { id: 'MRI', label: 'MRI' },
    { id: 'X-Ray', label: 'X-Ray' },
    { id: 'OCT', label: 'OCT' },
    { id: 'Visual Field Test', label: 'Visual Field Test' },
    { id: 'Fluorescein Angiography', label: 'Fluorescein Angiography' },
    { id: 'Ultrasound B-Scan', label: 'Ultrasound B-Scan' },
    { id: 'Electroencephalography (ERG)', label: 'Electroencephalography (ERG)' },
    { id: 'Electro-Oculography (EOG)', label: 'Electro-Oculography (EOG)' },
    { id: 'Corneal Topography', label: 'Corneal Topography' },
    { id: 'Specular Microscopy', label: 'Specular Microscopy' },
    { id: 'Tear Film Analysis', label: 'Tear Film Analysis' },
    { id: 'Genetic Testing', label: 'Genetic Testing' },
  ];

  const toggleInvestigation = (id) => {
    setSelectedInvestigations(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const clearInvestigations = () => {
    setSelectedInvestigations([]);
  };

  return (
    <div className="doctor-medical-record">
      {/* Header */}
      <div className="medical-record-header">
        <h1>📋 Medical Record</h1>
      </div>

      {/* Main Content */}
      <div className="record-container">
        {/* Left Sidebar - Tabs */}
        <div className="tabs-sidebar">
          <nav className="tabs-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="content-area">
          {/* Patient Information Tab */}
          {activeTab === 'patient-info' && (
            <div className="tab-content">
              <h2>Patient Information</h2>

              <div className="info-grid">
                {/* Basic Info Section */}
                <div className="info-section">
                  <h3>👤 BASIC INFO</h3>
                  <div className="info-fields">
                    <div className="info-field">
                      <label>Patient ID</label>
                      <span>1</span>
                    </div>
                    <div className="info-field">
                      <label>Full Name</label>
                      <span>Ahmed Mohar</span>
                    </div>
                    <div className="info-field">
                      <label>Age</label>
                      <span>41</span>
                    </div>
                    <div className="info-field">
                      <label>Gender</label>
                      <span>Male</span>
                    </div>
                    <div className="info-field">
                      <label>Date of Birth</label>
                      <span>03/15/1985</span>
                    </div>
                    <div className="info-field">
                      <label>National ID</label>
                      <span>28503151234556</span>
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="info-section">
                  <h3>☎️ CONTACT</h3>
                  <div className="info-fields">
                    <div className="info-field">
                      <label>Phone Number</label>
                      <span>01012345678</span>
                    </div>
                    <div className="info-field">
                      <label>Address</label>
                      <span>12 El Gomhoria St, Downtown, Cairo</span>
                    </div>
                  </div>
                </div>

                {/* Insurance Section */}
                <div className="info-section">
                  <h3>🛡️ INSURANCE</h3>
                  <div className="info-fields">
                    <div className="info-field">
                      <label>Insurance Company</label>
                      <span>Universal Health Insurance</span>
                    </div>
                    <div className="info-field">
                      <label>Insurance ID</label>
                      <span>INS-2024-001</span>
                    </div>
                    <div className="info-field">
                      <label>Policy Number</label>
                      <span>INS-2024-001</span>
                    </div>
                    <div className="info-field">
                      <label>Coverage</label>
                      <span>Universal Health Insurance</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="info-section">
                  <h3>🚨 EMERGENCY CONTACT</h3>
                  <div className="info-fields">
                    <div className="info-field">
                      <label>Emergency Contact Name</label>
                      <span>Fatma Mohamed</span>
                    </div>
                    <div className="info-field">
                      <label>Emergency Phone</label>
                      <span>01098765432</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Investigations Tab */}
          {activeTab === 'investigations' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>⚕️ Investigations</h2>
                <button
                  className="clear-btn"
                  onClick={clearInvestigations}
                >
                  🗑️ Clear Investigations
                </button>
              </div>

              <p className="tab-description">Select or add investigations requested for the patient.</p>

              {/* Investigation Selection Grid */}
              <div className="investigations-grid">
                {investigationTypes.map(investigation => (
                  <button
                    key={investigation.id}
                    onClick={() => toggleInvestigation(investigation.id)}
                    className={`investigation-btn ${selectedInvestigations.includes(investigation.id) ? 'selected' : ''}`}
                  >
                    {investigation.label}
                  </button>
                ))}
              </div>

              {/* Custom Investigation Input */}
              <div className="custom-investigation">
                <input
                  type="text"
                  placeholder="Add Custom Investigation"
                  className="custom-input"
                />
                <button className="add-btn">➕ Add</button>
              </div>

              {/* Selected Investigations Display */}
              {selectedInvestigations.length > 0 && (
                <div className="selected-investigations">
                  <h3>Selected Investigations:</h3>
                  <div className="selected-tags">
                    {selectedInvestigations.map(id => (
                      <span
                        key={id}
                        className="selected-tag"
                        onClick={() => toggleInvestigation(id)}
                      >
                        {investigationTypes.find(i => i.id === id)?.label}
                        <button className="remove-tag">✕</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className="notes-section">
                <h3>📝 Notes</h3>
                <textarea
                  placeholder="Add any special notes or comments about the investigations..."
                  className="notes-textarea"
                  rows="4"
                />
              </div>

              {/* Send to Radiology Button */}
              <div className="action-buttons">
                <button
                  className="send-radiology-btn"
                  disabled={selectedInvestigations.length === 0}
                >
                  📤 Send to Radiology Center
                </button>
                <button className="save-btn">💾 Save</button>
              </div>
            </div>
          )}

          {/* Other Tabs - Placeholder Content */}
          {['complaint', 'history', 'eye-exam', 'images', 'operations', 'prescriptions', 'diagnoses'].includes(activeTab) && (
            <div className="tab-content">
              <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
              <div className="placeholder-content">
                <p>📝 Content for {tabs.find(t => t.id === activeTab)?.label} will be displayed here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
