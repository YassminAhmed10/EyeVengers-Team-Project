import React, { useState, useEffect } from 'react';
import './WelcomeCard.css';

const WelcomeCard = () => {
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

  return (
    <div className="welcome-card-modern">
      <div className="welcome-content">
        <div className="welcome-text">
          <h1 className="welcome-greeting">Welcome back, Dr. Mohab Khairy</h1>
        </div>
        <div className="welcome-illustration">
          <div className="doctor-image-wrapper">
            <img 
              src="/assets/doctorWelcom1.png" 
              alt="Dr. Mohab Khairy"
              className="doctor-photo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="floating-elements">
            <div className="float-element circle-element purple" style={{top: '15%', left: '8%'}}></div>
            <div className="float-element circle-element yellow" style={{top: '25%', right: '12%'}}></div>
            <div className="float-element circle-element green" style={{bottom: '30%', left: '5%'}}></div>
            <div className="float-element star-element" style={{top: '45%', left: '15%'}}>👁️</div>
            <div className="float-element star-element" style={{top: '35%', right: '18%'}}>✨</div>
            <div className="float-element star-element" style={{bottom: '20%', right: '8%'}}>👓</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
