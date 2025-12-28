import React, { useState, useEffect } from 'react';
import { appointmentsAPI } from '../services/apiConfig';
import './GenderChart.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GenderChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchGenderData = async () => {
      try {
        const appointments = await appointmentsAPI.getAll();
        
        // Count gender distribution from appointments
        const maleCount = appointments.filter(a => a.patientGender === 0).length;
        const femaleCount = appointments.filter(a => a.patientGender === 1).length;
        
        setData([
          { name: 'Men', value: maleCount },
          { name: 'Women', value: femaleCount }
        ]);
      } catch (error) {
        console.error('Error fetching gender data:', error);
        setData([
          { name: 'Men', value: 0 },
          { name: 'Women', value: 0 }
        ]);
      }
    };
    fetchGenderData();
  }, []);

  const COLORS = ['#8b7ec8', '#66bb6a'];

  return (
    <div className="gender-chart-card">
      <div className="gender-chart-header">
        <h3 className="gender-chart-title">Gender</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenderChart;
