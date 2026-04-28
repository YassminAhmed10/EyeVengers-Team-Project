import React, { useState, useEffect } from 'react';
import './AnalogClock.css';

function AnalogClock() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return dateTime.toLocaleDateString('en-US', options);
  };

  const formatTime = () => {
    return dateTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="datetime-container">
      <div className="date-display">
        <span className="material-symbols-outlined date-icon">calendar_today</span>
        <span className="date-text">{formatDate()}</span>
      </div>
      <div className="time-display">
        <span className="material-symbols-outlined time-icon">schedule</span>
        <span className="time-text">{formatTime()}</span>
      </div>
    </div>
  );
}

export default AnalogClock;
