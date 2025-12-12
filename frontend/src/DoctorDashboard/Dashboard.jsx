import React, { useState } from 'react';
import WelcomeCard from "./WelcomeCard";
import StatsCards from "./StatsCards";
import PatientsChart from "./PatientsChart";
import GenderChart from "./GenderChart";
import AppointmentsCalendar from "./AppointmentsCalendar";
import AppointmentsTable from "./AppointmentsTable";
import './Dashboard.css';

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <WelcomeCard />
      <StatsCards selectedDate={selectedDate} />
      
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