import React, { useMemo } from 'react';
import './GenderChart.css';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { User, Users, Baby } from 'lucide-react';

const SEGMENTS = [
  { key: 'children', label: 'Children',  range: '2–17',  color: '#42a5f5', icon: Baby },
  { key: 'adults',   label: 'Adults',    range: '18–40', color: '#1565c0', icon: User },
  { key: 'elderly',  label: 'Elderly',   range: '41+',   color: '#0288d1', icon: Users },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div style={{
        background: '#fff', border: '1px solid #dbeafe',
        borderRadius: 8, padding: '8px 12px',
        boxShadow: '0 2px 12px rgba(21,101,192,0.12)', fontSize: 13
      }}>
        <p style={{ color: '#1e3a5f', fontWeight: 600 }}>{d.name}</p>
        <p style={{ color: d.payload.color }}>{d.value} patient{d.value !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

const GenderChart = ({ selectedDate, appointments }) => {
  // Always derive from today's appointments prop
  const { data, total } = useMemo(() => {
    let children = 0, adults = 0, elderly = 0;
    if (appointments && appointments.length > 0) {
      appointments.forEach(appt => {
        const age = appt.age || 0;
        if (age >= 2 && age <= 17)       children++;
        else if (age >= 18 && age <= 40) adults++;
        else if (age > 40)               elderly++;
      });
    }
    const d = [
      { name: 'Children (2–17)',  value: children, color: '#42a5f5' },
      { name: 'Adults (18–40)',   value: adults,   color: '#1565c0' },
      { name: 'Elderly (41+)',    value: elderly,  color: '#0288d1' },
    ];
    return { data: d, total: children + adults + elderly };
  }, [appointments, selectedDate]);

  return (
    <div className="gender-chart-card">
      <div className="gender-chart-header">
        <h3 className="gender-chart-title">Patient Age Groups</h3>
        <span className="chart-badge">{total} today</span>
      </div>

      <div className="age-chart-body">
        {/* Donut */}
        <ResponsiveContainer width="55%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={58} outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              startAngle={90} endAngle={-270}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend rows */}
        <div className="age-legend">
          {SEGMENTS.map((seg, i) => {
            const entry = data[i];
            const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
            const Icon = seg.icon;
            return (
              <div key={seg.key} className="age-legend-row">
                <div className="age-legend-icon" style={{ background: seg.color + '18', color: seg.color }}>
                  <Icon size={14} />
                </div>
                <div className="age-legend-info">
                  <span className="age-legend-label">{seg.label} <span className="age-legend-range">({seg.range})</span></span>
                  <div className="age-legend-bar-track">
                    <div
                      className="age-legend-bar-fill"
                      style={{ width: `${pct}%`, background: seg.color }}
                    />
                  </div>
                </div>
                <span className="age-legend-count" style={{ color: seg.color }}>{entry.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GenderChart;

