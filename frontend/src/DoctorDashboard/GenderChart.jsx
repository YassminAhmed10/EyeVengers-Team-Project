import React, { useState, useEffect } from 'react';
import './GenderChart.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GenderChart = ({ selectedDate, appointments }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgeGroupData = async () => {
      try {
        setLoading(true);
        
        // Use filtered appointments if available
        let patientsData = appointments;
        
        // If no appointments passed, fetch from API
        if (!patientsData || patientsData.length === 0) {
          const response = await fetch('http://localhost:5201/api/Dashboard/AgeGroups');
          const ageGroups = await response.json();
          
          setData([
            { name: 'Children (2-17)', value: ageGroups.children || 0 },
            { name: 'Adults (18-40)', value: ageGroups.adults || 0 },
            { name: 'Elderly (41+)', value: ageGroups.elderly || 0 }
          ]);
        } else {
          // Calculate age groups from appointments
          let children = 0, adults = 0, elderly = 0;
          
          patientsData.forEach(appt => {
            const age = appt.age || 0;
            if (age >= 2 && age <= 17) children++;
            else if (age >= 18 && age <= 40) adults++;
            else if (age > 40) elderly++;
          });
          
          setData([
            { name: 'Children (2-17)', value: children },
            { name: 'Adults (18-40)', value: adults },
            { name: 'Elderly (41+)', value: elderly }
          ]);
        }
      } catch (error) {
        console.error('Error fetching age group data:', error);
        setData([
          { name: 'Children (2-17)', value: 0 },
          { name: 'Adults (18-40)', value: 0 },
          { name: 'Elderly (41+)', value: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAgeGroupData();
  }, [selectedDate, appointments]);

  const COLORS = ['#66bb6a', '#42a5f5', '#ef5350'];

  if (loading) {
    return (
      <div className="gender-chart-card">
        <div className="gender-chart-header">
          <h3 className="gender-chart-title">Age Groups</h3>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gender-chart-card">
      <div className="gender-chart-header">
        <h3 className="gender-chart-title">Patient Age Groups</h3>
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
            label={({ value }) => value > 0 ? value : ''}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [value, name]}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenderChart;
