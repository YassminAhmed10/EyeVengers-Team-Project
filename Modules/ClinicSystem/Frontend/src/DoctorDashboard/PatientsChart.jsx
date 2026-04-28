import React, { useState, useEffect } from 'react';
import './PatientsChart.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const CHART_COLORS = [
  '#1565c0', '#1976d2', '#1e88e5', '#2196f3',
  '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb'
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff', border: '1px solid #dbeafe',
        borderRadius: 8, padding: '8px 12px',
        boxShadow: '0 2px 12px rgba(21,101,192,0.12)',
        fontSize: 13
      }}>
        <p style={{ color: '#1e3a5f', fontWeight: 600, marginBottom: 2 }}>{label}</p>
        <p style={{ color: '#1565c0' }}>{payload[0].value} appointment{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

const PatientsChart = ({ selectedDate, appointments }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const buildChart = () => {
      try {
        const aptData = appointments || [];
        const reasonCounts = {};
        aptData.forEach(appt => {
          if (appt.reasonForVisit) {
            const r = appt.reasonForVisit.trim();
            reasonCounts[r] = (reasonCounts[r] || 0) + 1;
          }
        });
        const chartData = Object.entries(reasonCounts)
          .map(([reason, count]) => ({
            reason: reason.length > 18 ? reason.substring(0, 18) + '…' : reason,
            count
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);
        setData(chartData);
      } catch (e) {
        setData([]);
      }
    };
    buildChart();
  }, [selectedDate, appointments]);

  return (
    <div className="patients-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Reasons for Visit</h3>
        <span className="chart-badge">{data.length} types</span>
      </div>
      {data.length === 0 ? (
        <div className="chart-empty">No visit data for selected date</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 12, left: -10, bottom: 60 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8f0fe" vertical={false} />
            <XAxis
              dataKey="reason"
              angle={-40}
              textAnchor="end"
              height={75}
              interval={0}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(21,101,192,0.06)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PatientsChart;
