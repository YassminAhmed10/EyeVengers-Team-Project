import React, { useState, useEffect } from 'react';
import './StatsCards.css';

const StatsCards = ({ selectedDate }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    consultations: 0,
    surgeries: 0,
    upcomingPatients: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5201/api/Appointments');
        const data = await response.json();
        
        // Filter by selectedDate or today
        const filterDate = selectedDate || new Date();
        const dateStr = filterDate.toLocaleDateString('en-CA');
        const filteredData = data.filter(apt => {
          const apptDate = new Date(apt.appointmentDate).toLocaleDateString('en-CA');
          return apptDate === dateStr;
        });
        
        // Status mapping: 0=Upcoming, 1=Completed, 2=Cancelled, 3=In Progress, 4=No Show
        const completedCount = filteredData.filter(apt => apt.status === 1).length;
        const upcomingCount = filteredData.filter(apt => apt.status === 0).length;
        const surgeriesCount = filteredData.filter(apt => apt.isSurgery === true).length;
        
        setStats({
          totalPatients: filteredData.length,
          consultations: completedCount,
          surgeries: surgeriesCount,
          upcomingPatients: upcomingCount
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default values on error
        setStats({
          totalPatients: 0,
          consultations: 0,
          surgeries: 0,
          upcomingPatients: 0
        });
      }
    };

    fetchStats();
  }, [selectedDate]);

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h2 className="stats-title-main">Report</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-card stat-card-green">
          <div className="stat-icon-wrapper">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Patients</p>
            <p className="stat-number">{stats.totalPatients}</p>
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-icon-wrapper">
            <span className="material-symbols-outlined">stethoscope</span>
          </div>
          <div className="stat-info">
            <p className="stat-label">Consultation</p>
            <p className="stat-number">{stats.consultations}</p>
          </div>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="stat-icon-wrapper">
            <span className="material-symbols-outlined">surgical</span>
          </div>
          <div className="stat-info">
            <p className="stat-label">Surgery</p>
            <p className="stat-number">{stats.surgeries}</p>
          </div>
        </div>

        <div className="stat-card stat-card-pink">
          <div className="stat-icon-wrapper">
            <span className="material-symbols-outlined">event_upcoming</span>
          </div>
          <div className="stat-info">
            <p className="stat-label">Upcoming Patients</p>
            <p className="stat-number">{stats.upcomingPatients}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;