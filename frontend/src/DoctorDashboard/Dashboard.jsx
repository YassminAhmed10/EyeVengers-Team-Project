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

  useEffect(() => {
    if (selectedDate) {
      fetchAppointments(selectedDate);
    }
  }, [selectedDate]);

  const fetchAppointments = async (date) => {
    try {
      const formattedDate = date || new Date().toISOString().split('T')[0];
      const response = await fetch(`http://localhost:5201/api/Appointments/ByDate/${formattedDate}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <WelcomeCard />
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
          <PatientsChart />
        </div>
        <div className="chart-right-section">
          <GenderChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;