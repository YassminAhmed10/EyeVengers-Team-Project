import React, { useState, useEffect } from 'react';
import './AppointmentsCalendar.css';

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const WEEKDAYS = ["S","M","T","W","T","F","S"];
const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

// Parse appointment date without UTC shift
const getAptDateStr = (dateVal) => {
  if (!dateVal) return '';
  return typeof dateVal === 'string' ? dateVal.split('T')[0] : dateVal.toLocaleDateString('en-CA');
};

// Generate slots from start/end time with 30-min intervals
const generateSlots = (start = '09:00', end = '17:00') => {
  const slots = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let total = sh * 60 + sm;
  const endTotal = eh * 60 + em;
  while (total < endTotal) {
    slots.push(`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`);
    total += 30;
  }
  return slots;
};

// Read doctor settings from localStorage for a given YYYY-MM-DD
const getSlotsForDate = (dateStr) => {
  try {
    // Per-date settings (from Available Time Slots calendar)
    const perDate = JSON.parse(localStorage.getItem('doctorSelectedDates') || '{}');
    const dateData = perDate[dateStr];
    if (dateData) {
      if (dateData.enabled === false) return []; // marked unavailable
      if (dateData.startTime && dateData.endTime)
        return generateSlots(dateData.startTime, dateData.endTime);
    }
    // Fall back to weekly schedule
    const weekly = JSON.parse(localStorage.getItem('doctorAvailability') || '{}');
    const dayName = DAY_NAMES[new Date(dateStr + 'T12:00:00').getDay()];
    const dayConfig = weekly[dayName];
    if (dayConfig) {
      if (!dayConfig.enabled) return [];
      return generateSlots(dayConfig.start || '09:00', dayConfig.end || '17:00');
    }
  } catch {}
  return generateSlots('09:00', '17:00');
};

const AppointmentsCalendar = ({ appointments = [], onDateSelect }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [timeSlots, setTimeSlots] = useState([]);

  // Build selected date string for localStorage lookup
  const selectedDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}`;

  // Reload slots when date changes or when settings are updated
  useEffect(() => {
    setTimeSlots(getSlotsForDate(selectedDateStr));
  }, [selectedDateStr]);

  useEffect(() => {
    const handler = () => setTimeSlots(getSlotsForDate(selectedDateStr));
    window.addEventListener('availabilityUpdated', handler);
    return () => window.removeEventListener('availabilityUpdated', handler);
  }, [selectedDateStr]);

  const selectedDayAppointments = appointments.filter(a => {
    const aptStr = getAptDateStr(a.appointmentDate);
    return aptStr === selectedDateStr;
  });

  const bookedSlots = selectedDayAppointments
    .filter(a => a.status !== 2)
    .map(a => (typeof a.appointmentTime === 'string' ? a.appointmentTime.substring(0,5) : a.appointmentTime));

  const completedSlots = new Set(
    selectedDayAppointments
      .filter(a => a.status === 1)
      .map(a => (typeof a.appointmentTime === 'string' ? a.appointmentTime.substring(0,5) : a.appointmentTime))
  );

  // build calendar grid
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate();
  const firstDay   = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++)
    days.push({ day: prevMonthDays - firstDay + i + 1, current: false });
  for (let i = 1; i <= daysInMonth; i++)
    days.push({ day: i, current: true });
  while (days.length < 42)
    days.push({ day: days.length - daysInMonth - firstDay + 1, current: false });

  // which days have appointments (timezone-safe)
  const daysWithApts = new Set(
    appointments
      .filter(a => {
        const s = getAptDateStr(a.appointmentDate);
        return s.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}`);
      })
      .map(a => parseInt(getAptDateStr(a.appointmentDate).split('-')[2], 10))
  );

  const handleDayClick = (dayObj) => {
    if (!dayObj.current) return;
    setSelectedDate(dayObj.day);
    if (onDateSelect)
      onDateSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayObj.day));
  };

  const isToday = (d) =>
    d.current &&
    d.day === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  return (
    <div className="cal-card">
      {/* Header */}
      <div className="cal-header">
        <p className="cal-header-label">Appointment Calendar</p>
        <div className="cal-nav-row">
          <button className="cal-nav-btn"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()-1, 1))}>
            ‹
          </button>
          <span className="cal-month-title">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button className="cal-nav-btn"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 1))}>
            ›
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="cal-weekdays">
        {WEEKDAYS.map((d,i) => <div key={i} className="cal-weekday">{d}</div>)}
      </div>

      {/* Days */}
      <div className="cal-days-grid">
        {days.map((d, i) => {
          const selected = d.current && d.day === selectedDate;
          const todayDay = isToday(d);
          const hasApt   = d.current && daysWithApts.has(d.day);
          let cls = 'cal-day';
          if (!d.current)  cls += ' cal-day--other';
          else if (selected) cls += ' cal-day--selected';
          else if (todayDay) cls += ' cal-day--today';
          if (hasApt) cls += ' cal-day--has-apt';
          return (
            <button key={i} className={cls} onClick={() => handleDayClick(d)}>
              {d.day}
            </button>
          );
        })}
      </div>

      {/* Slots */}
      <div className="cal-slots-body">
          <p className="cal-slots-title">
            {selectedDate} {MONTH_NAMES[currentDate.getMonth()]} — Available Slots
          </p>
          <div className="cal-slots-grid">
            {timeSlots.map(slot => {
              const done   = completedSlots.has(slot);
              const booked = !done && bookedSlots.includes(slot);
              const cls = done ? 'cal-slot--done' : booked ? 'cal-slot--booked' : 'cal-slot--free';
              return (
                <div key={slot} className={`cal-slot ${cls}`}>
                  <span>{slot}</span>
                  {done
                    ? <span className="cal-slot-badge">✓ Done</span>
                    : <span className="cal-slot-badge">{booked ? 'Booked' : 'Free'}</span>
                  }
                </div>
              );
            })}
          </div>
        </div>
    </div>
  );
};

export default AppointmentsCalendar;