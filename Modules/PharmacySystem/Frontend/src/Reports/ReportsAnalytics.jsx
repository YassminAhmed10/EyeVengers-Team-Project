import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import SalesChart from './SalesChart.jsx';
import TopProducts from './TopProducts.jsx';
import { salesData as defaultSalesData, topProducts as defaultTopProducts } from '../data/mockData.js';
import { useLanguage } from '../i18n/LanguageContext';

const ReportsAnalytics = ({ sales, medicines, prescriptions }) => {
  const [dateRange, setDateRange] = useState('month');
  const { t } = useLanguage();

  // Translation helper
  const tr = (section, key) => t(section, key);

  // Use sales from props or default - handle undefined safely
  const salesData = useMemo(() => {
    if (!sales || !Array.isArray(sales) || sales.length === 0) {
      return defaultSalesData;
    }
    return sales;
  }, [sales]);

  // Get current date info
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentMonthName = today.toLocaleString('default', { month: 'short' });
  
  // Get start of current week (Sunday)
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    return new Date(d.setDate(d.getDate() - day));
  };

  // Calculate comprehensive stats from sales
  const stats = useMemo(() => {
    // Use default data if no sales
    if (!sales || !Array.isArray(sales) || sales.length === 0) {
      return {
        totalRevenue: defaultTopProducts.reduce((sum, p) => sum + p.revenue, 0),
        totalSales: defaultTopProducts.reduce((sum, p) => sum + p.sales, 0),
        avgOrder: 150,
        transactionCount: 0,
        todaySales: 0,
        weekSales: 0,
        monthSales: 0,
        growthRate: 0,
        previousMonthSales: 0
      };
    }

    const totalRevenue = sales.reduce((sum, s) => sum + (s.total || s.subtotal || 0), 0);
    const totalItems = sales.reduce((sum, s) => {
      return sum + (s.items ? s.items.reduce((iSum, item) => iSum + item.quantity, 0) : 0);
    }, 0);
    const transactionCount = sales.length;

    // Today's sales
    const todayStr = today.toISOString().split('T')[0];
    const todaySales = sales
      .filter(s => s.date === todayStr)
      .reduce((sum, s) => sum + (s.total || 0), 0);

    // This week's sales
    const startOfWeek = getStartOfWeek(today);
    const weekSales = sales
      .filter(s => new Date(s.date) >= startOfWeek)
      .reduce((sum, s) => sum + (s.total || 0), 0);

    // This month's sales
    const monthSales = sales
      .filter(s => {
        const saleDate = new Date(s.date);
        return saleDate.getFullYear() === currentYear && saleDate.getMonth() === currentMonth;
      })
      .reduce((sum, s) => sum + (s.total || 0), 0);

    // Previous month's sales (for growth calculation)
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const previousMonthSales = sales
      .filter(s => {
        const saleDate = new Date(s.date);
        return saleDate.getFullYear() === previousYear && saleDate.getMonth() === previousMonth;
      })
      .reduce((sum, s) => sum + (s.total || 0), 0);

    // Calculate growth rate (month-over-month)
    const growthRate = previousMonthSales > 0 
      ? ((monthSales - previousMonthSales) / previousMonthSales) * 100 
      : 0;

    return {
      totalRevenue,
      totalSales: totalItems,
      avgOrder: transactionCount > 0 ? totalRevenue / transactionCount : 0,
      transactionCount,
      todaySales,
      weekSales,
      monthSales,
      growthRate,
      previousMonthSales
    };
  }, [sales, currentYear, currentMonth]);

  // Get top products from sales data
  const topProductsData = useMemo(() => {
    if (!sales || !Array.isArray(sales) || sales.length === 0) {
      return defaultTopProducts;
    }

    // Aggregate sales by product
    const productSales = {};
    sales.forEach(sale => {
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach(item => {
          if (productSales[item.name]) {
            productSales[item.name].sales += item.quantity;
            productSales[item.name].revenue += item.price * item.quantity;
          } else {
            productSales[item.name] = {
              name: item.name,
              sales: item.quantity,
              revenue: item.price * item.quantity
            };
          }
        });
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  // Category distribution
  const categoryData = useMemo(() => {
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return [
        { name: 'Antibiotics', value: 25 },
        { name: 'Pain Relief', value: 20 },
        { name: 'Chronic Care', value: 15 },
        { name: 'Supplements', value: 18 },
        { name: 'Other', value: 22 }
      ];
    }

    const categories = {};
    medicines.forEach(med => {
      categories[med.category] = (categories[med.category] || 0) + 1;
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [medicines]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View your pharmacy performance and insights
          </p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="input-field w-40"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Today's Sales */}
        <div className="card bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20">
          <h3 className="text-sm text-cyan-600 dark:text-cyan-400">Today</h3>
          <p className="text-xl font-bold text-cyan-700 dark:text-cyan-300 mt-2">
            EGP {stats.todaySales.toLocaleString()}
          </p>
        </div>
        
        {/* This Week's Sales */}
        <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20">
          <h3 className="text-sm text-indigo-600 dark:text-indigo-400">This Week</h3>
          <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mt-2">
            EGP {stats.weekSales.toLocaleString()}
          </p>
        </div>
        
        {/* This Month's Sales */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20">
          <h3 className="text-sm text-blue-600 dark:text-blue-400">This Month</h3>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-2">
            EGP {stats.monthSales.toLocaleString()}
          </p>
        </div>
        
        {/* Growth Rate */}
        <div className={`card bg-gradient-to-br ${stats.growthRate >= 0 ? 'from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20' : 'from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20'}`}>
          <h3 className={`text-sm ${stats.growthRate >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>Growth Rate</h3>
          <p className={`text-xl font-bold mt-2 ${stats.growthRate >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
            {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
          </p>
        </div>
        
        {/* Total Transactions */}
        <div className="card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20">
          <h3 className="text-sm text-amber-600 dark:text-amber-400">Transactions</h3>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-2">
            {stats.transactionCount}
          </p>
        </div>
        
        {/* Average Order Value */}
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20">
          <h3 className="text-sm text-purple-600 dark:text-purple-400">Avg Order</h3>
          <p className="text-xl font-bold text-purple-700 dark:text-purple-300 mt-2">
            EGP {stats.avgOrder.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Sales Trend</h3>
          <SalesChart data={salesData} />
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Inventory by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <TopProducts data={topProductsData} />

      {/* Prescription Stats */}
      {prescriptions && prescriptions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Prescription Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-xl font-bold text-yellow-700">
                {prescriptions.filter(p => p.status === 'pending').length}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Processing</p>
              <p className="text-xl font-bold text-blue-700">
                {prescriptions.filter(p => p.status === 'processing').length}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Completed</p>
              <p className="text-xl font-bold text-green-700">
                {prescriptions.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Cancelled</p>
              <p className="text-xl font-bold text-red-700">
                {prescriptions.filter(p => p.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;
