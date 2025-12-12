import React, { useState } from 'react';
import './EmergencyCases.css';

const EmergencyCases = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [emergencyCases] = useState([
    {
      id: 1,
      patientName: 'Ahmed Hassan',
      age: 45,
      condition: 'Acute Glaucoma',
      severity: 'critical',
      arrivalTime: '10 min ago',
      status: 'waiting'
    },
    {
      id: 2,
      patientName: 'Sara Mohamed',
      age: 32,
      condition: 'Eye Injury',
      severity: 'urgent',
      arrivalTime: '25 min ago',
      status: 'in-progress'
    }
  ]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#ef4444';
      case 'urgent':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  return (
    <div className="emergency-cases">
      <div className="emergency-header">
        <div className="emergency-title-wrapper">
          <span className="material-symbols-outlined emergency-icon">emergency</span>
          <h3>Emergency Cases</h3>
          {emergencyCases.length > 0 && (
            <span className="emergency-badge">{emergencyCases.length}</span>
          )}
        </div>
        <button className="expand-toggle-btn" onClick={toggleExpand}>
          <span className={`material-symbols-outlined ${isExpanded ? 'expanded' : ''}`}>
            expand_more
          </span>
        </button>
      </div>
      
      {isExpanded && (
        <>
          {emergencyCases.length > 0 ? (
            <div className="emergency-list">
              {emergencyCases.map((case_) => (
                <div key={case_.id} className="emergency-card">
                  <div className="emergency-card-header">
                    <div className="patient-info">
                      <h4>{case_.patientName}</h4>
                      <span className="patient-age">{case_.age} years</span>
                    </div>
                    <div 
                      className="severity-badge"
                      style={{ 
                        background: `${getSeverityColor(case_.severity)}20`,
                        color: getSeverityColor(case_.severity)
                      }}
                    >
                      {case_.severity.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="emergency-card-body">
                    <p className="condition">{case_.condition}</p>
                    <div className="emergency-footer">
                      <span className="arrival-time">
                        <span className="material-symbols-outlined">schedule</span>
                        {case_.arrivalTime}
                      </span>
                      <span className={`status-badge ${case_.status}`}>
                        {case_.status === 'waiting' ? 'Waiting' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-emergencies">
              <span className="material-symbols-outlined">check_circle</span>
              <p>No emergency cases at the moment</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmergencyCases;
