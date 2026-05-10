import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import './RadiologyRedirectPage.css';

const RadiologyRedirectPage = () => {
  const location = useLocation();

  const targetUrl = useMemo(() => {
    const query = new URLSearchParams(location.search);
    const target = query.get('target');
    
    // Get patient data from localStorage or state
    const patientData = {
      patientId: localStorage.getItem('patientId') || '',
      patientName: localStorage.getItem('userName') || localStorage.getItem('patientName') || '',
      patientEmail: localStorage.getItem('userEmail') || '',
      patientPhone: localStorage.getItem('patientPhone') || '',
    };
    
    // If we have a full target URL with patient data, use it as-is
    if (target) {
      return target;
    }
    
    // Construct radiology center URL with patient data as query parameters
    const baseUrl = 'http://localhost:5174/patient';
    const params = new URLSearchParams();
    
    if (patientData.patientId) params.append('patientId', patientData.patientId);
    if (patientData.patientName) params.append('patientName', patientData.patientName);
    if (patientData.patientEmail) params.append('patientEmail', patientData.patientEmail);
    if (patientData.patientPhone) params.append('patientPhone', patientData.patientPhone);
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [location.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      // Navigate to the target URL which includes patient data parameters
      window.location.href = targetUrl;
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [targetUrl]);

  return (
    <main className="rr-page" aria-live="polite">
      <section className="rr-card">
        <div className="rr-loader" aria-hidden="true">
          <div className="rr-spinner" />
          <svg className="rr-medical-icon" viewBox="0 0 64 64" role="img" aria-label="Medical loading icon">
            <circle cx="32" cy="32" r="16" />
            <path d="M32 22v20M22 32h20" />
          </svg>
        </div>
        <h1 className="rr-title">Redirecting You To The Radiology Center...</h1>
        <p className="rr-subtitle">Please wait while we securely transfer your patient details.</p>
      </section>
    </main>
  );
};

export default RadiologyRedirectPage;
