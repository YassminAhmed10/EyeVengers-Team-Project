import React, { useState, useEffect } from 'react';
import WelcomeCard from "./WelcomeCard";
import StatsCards from "./StatsCards";
import PatientsChart from "./PatientsChart";
import GenderChart from "./GenderChart";
import AppointmentsCalendar from "./AppointmentsCalendar";
import AppointmentsTable from "./AppointmentsTable";
import './Dashboard.css';

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch today's appointments on mount
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDate(formattedToday);
    fetchAppointments(formattedToday);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointments(selectedDate);
    }
  }, [selectedDate]);

  const fetchAppointments = async (date) => {
    try {
      setLoading(true);
      
      // Convert date to string format if it's a Date object
      let formattedDate;
      if (date instanceof Date) {
        formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else {
        formattedDate = date || new Date().toISOString().split('T')[0];
      }
      
      console.log('Dashboard: Fetching appointments for date:', formattedDate);
      
      // Fetch all appointments and filter by date
      const response = await fetch('http://localhost:5201/api/Appointments');
      if (response.ok) {
        const allData = await response.json();
        console.log('Dashboard: All appointments:', allData);
        
        // Filter by date
        const filtered = allData.filter(apt => {
          const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
          return aptDate === formattedDate;
        });
        
        console.log('Dashboard: Filtered appointments for', formattedDate, ':', filtered);
        setAppointments(filtered);
      } else {
        console.error('Dashboard: Failed to fetch appointments, status:', response.status);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Dashboard: Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <WelcomeCard />
      {console.log('Dashboard Render - appointments:', appointments)}
      <StatsCards selectedDate={selectedDate} appointments={appointments} />
      
      {/* Calendar and Table Side by Side - Calendar Left, Table Right */}
      <div className="dashboard-table-calendar-grid">
        <div className="dashboard-calendar-section">
          <AppointmentsCalendar onDateSelect={setSelectedDate} />
        </div>
        <div className="dashboard-table-section">
          <AppointmentsTable selectedDate={selectedDate} />
        </div>
      </div>
      
      {/* Charts Grid */}
      <div className="dashboard-charts-grid">
        <div className="chart-left-section">
          <PatientsChart selectedDate={selectedDate} appointments={appointments} />
        </div>
        <div className="chart-right-section">
          <GenderChart selectedDate={selectedDate} appointments={appointments} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
