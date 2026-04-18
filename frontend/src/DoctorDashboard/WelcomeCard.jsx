import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Eye, Stethoscope } from 'lucide-react';
import './WelcomeCard.css';

const WelcomeCard = () => {
  const { t } = useLanguage();
  const [appointmentCount, setAppointmentCount] = useState(12);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://localhost:5201/api/Appointments');
        const data = await response.json();
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = data.filter(apt => apt.appointmentDate.startsWith(today));
        setAppointmentCount(todayAppointments.length);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    fetchAppointments();
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="welcome-card-modern">
      <div className="welcome-content">
        <div className="welcome-text">
          <p className="welcome-greeting-small">Good day, Doctor</p>
          <h1 className="welcome-greeting">{t('dashboard.welcomeDoctor')}</h1>
          <p className="welcome-subtitle">{today} &nbsp;·&nbsp; Ophthalmology Department</p>
          <div className="welcome-stats-row">
            <span className="welcome-stat-pill">
              <span className="pill-num">{appointmentCount}</span> Appointments today
            </span>
            <span className="welcome-stat-pill">
              <Eye size={13} /> Eye Clinic
            </span>
          </div>
        </div>
        <div className="welcome-illustration">
          <div className="doctor-image-wrapper">
            <img
              src="/assets/doctorWelcom1.png"
              alt="Dr. Mohab Khairy"
              className="doctor-photo"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
