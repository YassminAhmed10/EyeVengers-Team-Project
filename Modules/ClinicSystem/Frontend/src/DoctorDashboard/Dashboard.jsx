import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Stethoscope, Scissors, CalendarDays } from 'lucide-react';
import AppointmentsCalendar from "./AppointmentsCalendar";
import AppointmentsTable from "./AppointmentsTable";
import PatientsChart from "./PatientsChart";
import GenderChart from "./GenderChart";
import './Dashboard.css';

const STAT_CONFIG = [
  {
    key: 'totalPatients',
    label: 'Total Patients',
    icon: <Users size={28} color="#2563EB" />,
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    key: 'consultation',
    label: 'Consultations',
    icon: <Stethoscope size={28} color="#059669" />,
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    key: 'surgery',
    label: 'Surgeries',
    icon: <Scissors size={28} color="#D97706" />,
    color: '#D97706',
    bg: '#FFFBEB',
  },
  {
    key: 'upcoming',
    label: 'Upcoming',
    icon: <CalendarDays size={28} color="#7C3AED" />,
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
];

function Dashboard() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toLocaleDateString('en-CA') // YYYY-MM-DD
  );
  const [allAppointments, setAllAppointments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch ALL appointments once and refresh every 30s
  const fetchAll = async () => {
    try {
      const res = await fetch('http://localhost:5201/api/Appointments');
      if (res.ok) setAllAppointments(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 30000);
    return () => clearInterval(iv);
  }, []);

  // Filter by selectedDate whenever allAppointments or selectedDate changes
  useEffect(() => {
    const formatted = selectedDate instanceof Date
      ? selectedDate.toLocaleDateString('en-CA')
      : selectedDate;
    const filtered = allAppointments.filter(a => {
      // Use string split to avoid UTC timezone shift
      const aptDate = typeof a.appointmentDate === 'string'
        ? a.appointmentDate.split('T')[0]
        : a.appointmentDate.toLocaleDateString('en-CA');
      return aptDate === formatted;
    });
    setAppointments(filtered);
    setLoading(false);
  }, [selectedDate, allAppointments]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };
  const totalPatients  = appointments.length;
  const consultations  = appointments.filter(a => !a.appointmentType || a.appointmentType?.toLowerCase().includes('consult')).length;
  const surgeries      = appointments.filter(a => a.appointmentType?.toLowerCase().includes('surg')).length;
  const upcoming       = appointments.filter(a => a.status === 0).length;

  const statValues = {
    totalPatients,
    consultation: consultations,
    surgery: surgeries,
    upcoming,
  };

  const fmtTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const GREETINGS = {
    morning: [
      "Good morning",
      "Rise and shine",
      "Hope your morning is great",
      "Starting the day strong",
      "A great morning to save lives",
    ],
    afternoon: [
      "Good afternoon",
      "Hope your day is going well",
      "Keep up the great work",
      "Halfway through the day",
      "Still going strong",
    ],
    evening: [
      "Good evening",
      "Almost done for today",
      "What a day it's been",
      "Wrapping up the day",
      "Evening, Doctor",
    ],
    night: [
      "Working late tonight",
      "Good night",
      "Burning the midnight oil",
      "Take care of yourself too",
      "Late-night dedication",
    ],
  };

  const getGreeting = (d) => {
    const h = d.getHours();
    const period = h >= 5 && h < 12 ? 'morning'
      : h >= 12 && h < 17 ? 'afternoon'
      : h >= 17 && h < 21 ? 'evening'
      : 'night';
    const phrases = GREETINGS[period];
    // rotate phrase based on current minute so it changes every minute
    const idx = d.getMinutes() % phrases.length;
    return phrases[idx];
  };

  const [greetingKey, setGreetingKey] = useState(0);
  const [greeting, setGreeting] = useState(() => getGreeting(new Date()));

  useEffect(() => {
    const check = setInterval(() => {
      const next = getGreeting(new Date());
      setGreeting(prev => {
        if (prev !== next) { setGreetingKey(k => k + 1); return next; }
        return prev;
      });
    }, 15000);
    return () => clearInterval(check);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard-root">

      {/* ── Welcome Banner ── */}
      <div className="dashboard-banner">
        <div className="dashboard-banner-circle3" />
        <div className="dashboard-banner-anim-circle dashboard-banner-anim-circle--1" />
        <div className="dashboard-banner-anim-circle dashboard-banner-anim-circle--2" />
        <div className="dashboard-banner-anim-circle dashboard-banner-anim-circle--3" />
        <div className="dashboard-banner-text">
          <h1 className="dashboard-banner-name">
            <span key={greetingKey} className="dashboard-banner-greeting-anim">{greeting},</span>{' '}<span>Dr. Mohab Khairy</span>
          </h1>
        </div>
        <div className="dashboard-banner-datetime">
          <div className="dashboard-banner-date">{fmtDate(time)}</div>
          <div className="dashboard-banner-time">{fmtTime(time)}</div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="dashboard-stats-grid">
        {STAT_CONFIG.map((s) => (
          <div className="dashboard-stat-card" key={s.key}>
            <div className="dashboard-stat-top-bar" style={{ background: s.color }} />
            <div className="dashboard-stat-side">
              <div className="dashboard-stat-icon-wrap" style={{ background: s.bg }}>
                {s.icon}
              </div>
              <div className="dashboard-stat-info">
                <div className="dashboard-stat-value">{statValues[s.key] ?? 0}</div>
                <div className="dashboard-stat-label">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Calendar + Table ── */}
      <div className="dashboard-main-grid">
        <div className="dashboard-cal-col">
          <AppointmentsCalendar
            appointments={allAppointments}
            onDateSelect={handleDateSelect}
          />
        </div>
        <div>
          <AppointmentsTable selectedDate={selectedDate} />
        </div>
      </div>

      {/* ── Charts ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem',
        marginBottom: '1.25rem',
      }}>
        <PatientsChart selectedDate={selectedDate} appointments={appointments} />
        <GenderChart selectedDate={selectedDate} appointments={appointments} />
      </div>

    </div>
  );
}

export default Dashboard;