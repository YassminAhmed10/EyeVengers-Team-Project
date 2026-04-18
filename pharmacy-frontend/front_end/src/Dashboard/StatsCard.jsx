import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatsCard = ({ stat }) => {
  const isPositive = stat.change.startsWith('+');

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
      style={{ borderRadius: '12px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${stat.color}15` }}
        >
          <span style={{ color: stat.color }}>{stat.icon}</span>
        </div>
        <span className="flex items-center text-sm font-bold" style={{ color: '#10B981' }}>
          ↑ {stat.change}
        </span>
      </div>
      <h3 
        className="font-bold mt-1"
        style={{ fontSize: '32px', color: stat.color }}
      >
        {stat.value}
      </h3>
      <p 
        className="text-xs mt-1" 
        style={{ 
          textTransform: 'uppercase', 
          fontWeight: 600,
          letterSpacing: '0.5px',
          color: '#6B7280'
        }}
      >
        {stat.title}
      </p>
    </div>
  );
};

export default StatsCard;
