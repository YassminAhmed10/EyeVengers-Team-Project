import React, { useState } from 'react';
import { appointmentsAPI } from '../services/apiConfig';
import './AppointmentsCalendar.css';

const AppointmentsCalendar = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [appointments, setAppointments] = useState([]);

  // Generate time slots (every 30 minutes from 9:00 AM to 5:00 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Fetch appointments for the current month
  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentsAPI.getAll();
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setAppointments([]);
      }
    };
    fetchAppointments();
  }, [currentDate]);

  // Filter appointments for the selected day
  const selectedDayAppointments = appointments.filter(appt => {
    const apptDate = new Date(appt.appointmentDate);
    return (
      apptDate.getFullYear() === currentDate.getFullYear() &&
      apptDate.getMonth() === currentDate.getMonth() &&
      apptDate.getDate() === selectedDate
    );
  });

  // Get booked time slots for the selected day (exclude Cancelled)
  const bookedTimeSlots = selectedDayAppointments
    .filter(appt => appt.status !== 2) // 2 = Cancelled
    .map(appt => {
      // Convert TimeSpan format "09:00:00" to "09:00"
      const timeStr = appt.appointmentTime;
      return typeof timeStr === 'string' ? timeStr.substring(0, 5) : timeStr;
    });
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  
  const days = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    const prevMonthDays = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    ).getDate();
    days.push({
      day: prevMonthDays - firstDayOfMonth + i + 1,
      isCurrentMonth: false
    });
  }
  
  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true
    });
  }
  
  // Add empty cells to complete the grid
  const remainingCells = 35 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      day: i,
      isCurrentMonth: false
    });
  }
  
  const handleDateClick = (dayObj) => {
    if (dayObj.isCurrentMonth) {
      setSelectedDate(dayObj.day);
      // Create a date object and pass it to parent
      const selectedDateObj = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        dayObj.day
      );
      if (onDateSelect) {
        onDateSelect(selectedDateObj);
      }
    }
  };

  return (
    <div className="dashboard-calendar-wrapper">
      <div className="appointments-calendar-card">
        <h3 className="calendar-title">Your Appointments</h3>
        <div className="calendar-header">
          <div className="calendar-navigation">
            <button className="nav-btn" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="nav-btn" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <h4 className="calendar-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
        </div>
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          <span>S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
        </div>
        <div className="calendar-days">
          {days.map((dayObj, index) => (
            <button
              key={index}
              className={`calendar-day ${
                !dayObj.isCurrentMonth ? 'other-month' : ''
              } ${
                dayObj.day === selectedDate && dayObj.isCurrentMonth ? 'selected' : ''
              }`}
              onClick={() => handleDateClick(dayObj)}
            >
              {dayObj.day}
            </button>
          ))}
        </div>
      </div>
      <div className="calendar-appointments">
        <h4 className="time-slots-title">Available Time Slots</h4>
        <div className="time-slots-grid">
          {timeSlots.map((slot) => {
            const isBooked = bookedTimeSlots.includes(slot);
            const appointment = selectedDayAppointments.find(
              appt => {
                const timeStr = appt.appointmentTime;
                const formattedTime = typeof timeStr === 'string' ? timeStr.substring(0, 5) : timeStr;
                return formattedTime === slot && appt.status !== 2; // 2 = Cancelled
              }
            );
            
            return (
              <div
                key={slot}
                className={`time-slot ${isBooked ? 'booked' : 'available'}`}
              >
                <div className="time-slot-time">
                  <span className="material-symbols-outlined">schedule</span>
                  {slot}
                </div>
                {isBooked && appointment ? (
                  <div className="time-slot-patient">
                    <span className="material-symbols-outlined">person</span>
                    {appointment.patientName}
                  </div>
                ) : (
                  <div className="time-slot-status">Available</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
};

export default AppointmentsCalendar;
