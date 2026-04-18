import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../i18n/LanguageContext';

const SalesChart = ({ data }) => {
  const { language } = useLanguage();
  
  // Transform data to ensure it has the correct format for the chart
  const chartData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    // Check if data has 'month' key (default format)
    if (data[0]?.month) {
      return data;
    }
    
    // Transform sales data to monthly format
    const monthlyData = {};
    data.forEach(sale => {
      const month = sale.date ? sale.date.substring(0, 7) : 'Unknown';
      if (monthlyData[month]) {
        monthlyData[month] += sale.total || 0;
      } else {
        monthlyData[month] = sale.total || 0;
      }
    });
    
    return Object.entries(monthlyData).map(([month, sales]) => ({
      month: month.substring(5), // Just show month number
      sales
    }));
  }, [data]);

  // Handle empty data
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
        No sales data available
      </div>
    );
  }

  // Custom tooltip for better visibility
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-bold text-slate-800 dark:text-white">{label}</p>
          <p className="text-blue-600 dark:text-blue-400 font-semibold">
            {language === 'ar' ? 'المبيعات: ' : 'Sales: '} 
            EGP {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        {language === 'ar' ? 'نظرة عامة على المبيعات' : 'Sales Overview'}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" vertical={false} />
          <XAxis 
            dataKey="month" 
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis 
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `EGP ${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="sales" 
            fill="#3B82F6" 
            radius={[6, 6, 0, 0]} 
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;

