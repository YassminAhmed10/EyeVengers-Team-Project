import React, { useState, useEffect } from 'react';
import './PatientsChart.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PatientsChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Get appointments data and create chart
        const response = await fetch('http://localhost:5201/api/Appointments');
        const appointments = await response.json();
        
        // Create last 7 days data
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-CA');
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          const dayAppointments = appointments.filter(a => {
            const apptDate = new Date(a.appointmentDate).toLocaleDateString('en-CA');
            return apptDate === dateStr;
          });
          
          last7Days.push({
            day: dayName,
            appointments: dayAppointments.length,
            patients: dayAppointments.length
          });
        }
        
        setData(last7Days);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setData([]);
      }
    };
    fetchChartData();
  }, []);

  return (
    <div className="patients-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Patients</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="appointments" stroke="#8b7ec8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="patients" stroke="#66bb6a" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PatientsChart;
