import React, { useState, useEffect } from 'react';
import './StatsCards.css';

const StatsCards = ({ selectedDate, appointments = [] }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    consultations: 0,
    surgeries: 0,
    upcomingPatients: 0
  });

  useEffect(() => {
    console.log('StatsCards - Received appointments:', appointments);
    console.log('StatsCards - Appointments length:', appointments?.length);
    
    // Calculate stats from appointments prop
    const totalPatients = appointments.length;
    const consultations = appointments.filter(apt => !apt.isSurgery).length;
    const surgeries = appointments.filter(apt => apt.isSurgery).length;
    const upcomingPatients = appointments.filter(apt => apt.status === 0).length; // Status 0 = Upcoming

    console.log('StatsCards - Calculated stats:', {
      totalPatients,
      consultations,
      surgeries,
      upcomingPatients
    });

    setStats({
      totalPatients,
      consultations,
      surgeries,
      upcomingPatients
    });
  }, [appointments]);

  return (
    <div className="stats-container">
      <div className="stats-grid">
        <div className="stat-card stat-card-green">
          <div className="stat-icon-wrapper">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div className="stat-number">{stats.totalPatients}</div>
          <div className="stat-label">Total Patients</div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-icon-wrapper">
            <span className="material-symbols-outlined">medical_services</span>
          </div>
          <div className="stat-number">{stats.consultations}</div>
          <div className="stat-label">Consultation</div>
        </div>

        <div className="stat-card stat-card-pink">
          <div className="stat-icon-wrapper">
            <span className="material-symbols-outlined">surgical</span>
          </div>
          <div className="stat-number">{stats.surgeries}</div>
          <div className="stat-label">Surgery</div>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="stat-icon-wrapper">
            <span className="material-symbols-outlined">calendar_today</span>
          </div>
          <div className="stat-number">{stats.upcomingPatients}</div>
          <div className="stat-label">Upcoming Patients</div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
