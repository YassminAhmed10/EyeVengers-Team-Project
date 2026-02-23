import React, { useState, useEffect } from 'react';
import { appointmentsAPI } from '../services/apiConfig';
import './PatientsChart.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PatientsChart = ({ selectedDate, appointments }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        let appointmentsData = appointments;
        
        // If no appointments passed as prop, fetch all
        if (!appointmentsData || appointmentsData.length === 0) {
          appointmentsData = await appointmentsAPI.getAll();
        }
        
        // Count reasons for visit
        const reasonCounts = {};
        appointmentsData.forEach(appt => {
          if (appt.reasonForVisit) {
            const reason = appt.reasonForVisit.trim();
            reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
          }
        });
        
        // Convert to chart data format and sort by count
        const chartData = Object.entries(reasonCounts)
          .map(([reason, count]) => ({
            reason: reason.length > 20 ? reason.substring(0, 20) + '...' : reason,
            count: count
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8); // Top 8 reasons
        
        setData(chartData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setData([]);
      }
    };
    fetchChartData();
  }, [selectedDate, appointments]);

  return (
    <div className="patients-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Reasons for Visit</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="reason" 
            angle={-45} 
            textAnchor="end" 
            height={80}
            interval={0}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8b7ec8" name="Number of Appointments" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PatientsChart;
