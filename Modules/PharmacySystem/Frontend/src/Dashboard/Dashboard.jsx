
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Package, Users, DollarSign, AlertCircle,
  Clock, Calendar, ArrowUpRight, Activity, Zap, 
  ChevronRight, ArrowRight, FileText, Pill, AlertTriangle,
  Heart, Shield, Thermometer, Droplets, Phone, Eye,
  Target, Award, Clock3, Bell, Search, Stethoscope,
  FlaskConical, ActivitySquare, Brain, Bone, RefreshCw,
  Plus, Trash2, Edit, Check, X, Save, User, Tag
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  BarChart, Bar, ComposedChart
} from 'recharts';
import { recentActivities } from '../data/mockData';
import { useLanguage } from '../i18n/LanguageContext';

// Prescription categories
const prescriptionCategories = [
  { id: 'chronic', name: 'Chronic', color: 'bg-violet-100 text-violet-700' },
  { id: 'antibiotics', name: 'Antibiotics', color: 'bg-blue-100 text-blue-700' },
  { id: 'pain', name: 'Pain Relief', color: 'bg-red-100 text-red-700' },
  { id: 'supplements', name: 'Supplements', color: 'bg-amber-100 text-amber-700' },
  { id: 'allergies', name: 'Allergies', color: 'bg-green-100 text-green-700' },
  { id: 'digestive', name: 'Digestive', color: 'bg-cyan-100 text-cyan-700' },
];

const getCategoryInfo = (categoryId) => {
  return prescriptionCategories.find(c => c.id === categoryId) || prescriptionCategories[1];
};

const Dashboard = ({ onNavigate, medicines, customers, prescriptions, sales, addNotification, userName = 'Doha' }) => {
  const [loading, setLoading] = useState(true);
  const [activeQuickAction, setActiveQuickAction] = useState(null);
  const { language, t, isRTL } = useLanguage();

  // Translation helper
  const tr = (section, key) => t(section, key);

  // Use props data or fallback to empty arrays
  const inventory = medicines || [];
  const allCustomers = customers || [];
  const allPrescriptions = prescriptions || [];

  // Calculate real stats from props
  const stats = useMemo(() => {
    // Total Sales - sum of all sales
    const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    // Total Stock - sum of all medicine stock
    const totalStock = inventory.reduce((sum, med) => sum + med.stock, 0);
    const totalCustomers = allCustomers.length;
    const pendingRx = allPrescriptions.filter(p => p.status === 'pending').length;
    
    // Calculate expiring soon (within 60 days)
    const expiringSoon = inventory.filter(med => {
      const expiry = new Date(med.expiry);
      const days = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 60;
    }).length;
    
    const lowStock = inventory.filter(med => med.stock < 30).length;
    
    return { totalSales, totalStock, totalCustomers, pendingRx, expiringSoon, lowStock };
  }, [inventory, allCustomers, allPrescriptions, sales]);

  // Get sales data for chart
  const salesChartData = useMemo(() => {
    if (!sales || sales.length === 0) {
      return [
        { month: 'Aug', sales: 4200, transactions: 45 },
        { month: 'Sep', sales: 3800, transactions: 38 },
        { month: 'Oct', sales: 5100, transactions: 52 },
        { month: 'Nov', sales: 4600, transactions: 47 },
        { month: 'Dec', sales: 5800, transactions: 60 },
        { month: 'Jan', sales: 6200, transactions: 65 },
      ];
    }
    
    // Group sales by month
    const monthlySales = {};
    sales.forEach(sale => {
      const month = new Date(sale.date).toLocaleString('en-US', { month: 'short' });
      if (!monthlySales[month]) {
        monthlySales[month] = { sales: 0, transactions: 0 };
      }
      monthlySales[month].sales += sale.total;
      monthlySales[month].transactions += 1;
    });
    
    return Object.entries(monthlySales).map(([month, data]) => ({ 
      month, 
      sales: data.sales,
      transactions: data.transactions
    }));
  }, [sales]);

  // Get category data for pie chart
  const categoryData = useMemo(() => {
    const categories = {};
    inventory.forEach(med => {
      categories[med.category] = (categories[med.category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  // Get expiring items
  const expiringItems = useMemo(() => {
    return inventory
      .map(med => {
        const expiry = new Date(med.expiry);
        const days = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
        return { ...med, daysRemaining: days };
      })
      .filter(med => med.daysRemaining > 0 && med.daysRemaining <= 60)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5);
  }, [inventory]);

  // Get low stock items
  const lowStockItems = useMemo(() => {
    return inventory
      .filter(med => med.stock < 30)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
  }, [inventory]);

  // Drug categories
  const drugCategories = [
    { name: 'Antibiotics', count: inventory.filter(m => m.category === 'Antibiotics').length, color: 'bg-blue-100 text-blue-600' },
    { name: 'Pain Relief', count: inventory.filter(m => m.category === 'Pain Relief').length, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Supplements', count: inventory.filter(m => m.category === 'Supplements').length, color: 'bg-amber-100 text-amber-600' },
    { name: 'Chronic Care', count: inventory.filter(m => m.category === 'Chronic Care').length, color: 'bg-violet-100 text-violet-600' },
    { name: 'Allergies', count: inventory.filter(m => m.category === 'Allergies').length, color: 'bg-rose-100 text-rose-600' },
    { name: 'Digestive', count: inventory.filter(m => m.category === 'Digestive').length, color: 'bg-cyan-100 text-cyan-600' },
  ];

  // Daily targets
  const dailyTargets = useMemo(() => [
    { label: 'Sales Target', current: sales ? sales.reduce((sum, s) => sum + s.total, 0) : 0, target: 6000, unit: 'EGP' },
    { label: 'Prescriptions', current: allPrescriptions.length, target: 20, unit: 'RX' },
    { label: 'Customers', current: stats.totalCustomers, target: 50, unit: 'person' },
  ], [sales, allPrescriptions, stats.totalCustomers]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleQuickAction = (actionId) => {
    setActiveQuickAction(actionId);
    if (onNavigate) {
      switch(actionId) {
        case 'prescription':
          onNavigate('prescriptions');
          break;
        case 'sale':
          onNavigate('sales');
          break;
        case 'stock':
          onNavigate('inventory');
          break;
        case 'customer':
          onNavigate('customers');
          break;
        default:
          break;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Pharmacy Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen font-sans text-slate-800">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-2xl shadow-lg shadow-blue-200">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
              {/* Pharmacy/Medical Cross Symbol */}
              <rect x="9" y="2" width="6" height="20" rx="1" fill="currentColor" opacity="0.9"/>
              <rect x="2" y="9" width="20" height="6" rx="1" fill="currentColor" opacity="0.9"/>
              {/* Plus sign in center */}
              <rect x="10" y="10" width="4" height="4" rx="0.5" fill="white"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">PharmaFlow Dashboard</h1>
            <p className="text-slate-500 font-medium">Welcome back, <span className="text-blue-600 font-semibold">{userName}</span> 👋</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-slate-600">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <button 
            onClick={() => setLoading(true)}
            className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { id: 'prescription', label: 'New Prescription', icon: FileText, color: 'blue', desc: 'Process new Rx' },
          { id: 'sale', label: 'Quick Sale', icon: DollarSign, color: 'emerald', desc: 'Fast checkout' },
          { id: 'stock', label: 'Check Stock', icon: Package, color: 'violet', desc: 'Inventory status' },
          { id: 'customer', label: 'Add Customer', icon: Users, color: 'amber', desc: 'New patient' },
          { id: 'reports', label: 'Reports', icon: TrendingUp, color: 'cyan', desc: 'Analytics' },
          { id: 'settings', label: 'Settings', icon: Activity, color: 'slate', desc: 'Configure' },
        ].map((action) => (
          <button
            key={action.id}
            onClick={() => handleQuickAction(action.id)}
            className={`group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left`}
          >
            <div className={`w-10 h-10 rounded-xl bg-${action.color}-100 flex items-center justify-center text-${action.color}-600 mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon size={20} />
            </div>
            <p className="text-sm font-bold text-slate-800">{action.label}</p>
            <p className="text-xs text-slate-400">{action.desc}</p>
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
              <TrendingUp size={24} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total Sales</p>
            <h2 className="text-2xl font-black text-slate-800 mb-1">EGP {stats.totalSales.toLocaleString()}</h2>
            <span className="flex items-center text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
              <ArrowUpRight size={12} /> From All Sales
            </span>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <Package size={24} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total Stock</p>
            <h2 className="text-2xl font-black text-slate-800 mb-1">{stats.totalStock.toLocaleString()} units</h2>
            <span className="flex items-center text-[11px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg w-fit">
              {stats.lowStock} Low Stock Items
            </span>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-violet-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 mb-4">
              <Users size={24} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Customers</p>
            <h2 className="text-2xl font-black text-slate-800 mb-1">{stats.totalCustomers}</h2>
            <span className="flex items-center text-[11px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg w-fit">
              Active Customers
            </span>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
              <FileText size={24} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Pending RX</p>
            <h2 className="text-2xl font-black text-slate-800 mb-1">{stats.pendingRx}</h2>
            <span className="flex items-center text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
              Awaiting Processing
            </span>
          </div>
        </div>
      </div>

      {/* Daily Targets */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-[2rem] p-6 mb-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black">Daily Targets</h3>
            <p className="text-blue-200 text-sm">Track your pharmacy goals</p>
          </div>
          <Target className="w-8 h-8 text-blue-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dailyTargets.map((target, i) => (
            <div key={i} className="bg-white/10 rounded-2xl p-4 backdrop-blur">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-blue-100">{target.label}</span>
                <span className="text-xs text-blue-200">{target.current} / {target.target} {target.unit}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((target.current / target.target) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs text-blue-200">{Math.round((target.current / target.target) * 100)}% completed</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-800">Sales Trend</h3>
              <p className="text-sm font-medium text-slate-400">Monthly sales & revenue</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-xs font-medium text-slate-500">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-medium text-slate-500">Transactions</span>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 12}} 
                  dy={10} 
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 12}}
                  tickFormatter={(value) => `EGP ${(value/1000).toFixed(1)}k`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }}
                  formatter={(value, name) => [
                    name === 'sales' ? `EGP ${value.toLocaleString()}` : value,
                    name === 'sales' ? 'Revenue' : 'Transactions'
                  ]}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  name="sales"
                />
                <Bar 
                  yAxisId="right"
                  dataKey="transactions" 
                  barSize={24} 
                  fill="#34D399" 
                  radius={[4, 4, 0, 0]}
                  name="transactions"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drug Categories */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-4">By Category</h3>
          <div className="grid grid-cols-2 gap-3">
            {drugCategories.map((cat, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center`}>
                  <Pill size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">{cat.name}</p>
                  <p className="text-[10px] text-slate-400">{cat.count} items</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Low Stock */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-800">Low Stock</h3>
            <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full">{stats.lowStock} items</span>
          </div>
          <div className="space-y-3">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.stock} units left</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleQuickAction('stock')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Reorder
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">All items in stock</p>
            )}
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-800">Expiring Soon</h3>
            <AlertTriangle className="text-amber-500 w-5 h-5" />
          </div>
          <div className="space-y-3">
            {expiringItems.length > 0 ? (
              expiringItems.map((item, i) => (
                <div key={i} className={`p-3 rounded-xl flex items-center justify-between ${item.daysRemaining <= 15 ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.daysRemaining <= 15 ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`}></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.daysRemaining} days remaining</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${item.daysRemaining <= 15 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {item.daysRemaining <= 15 ? 'URGENT' : 'SOON'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No expiring items</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <h3 className="text-lg font-black mb-4 relative z-10">Recent Activity</h3>
          <div className="space-y-4 relative z-10">
            {recentActivities.slice(0, 4).map((act, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  {act.type === 'sale' ? <DollarSign size={14} className="text-emerald-400" /> : 
                   act.type === 'prescription' ? <FileText size={14} className="text-blue-400" /> :
                   act.type === 'stock' ? <Package size={14} className="text-amber-400" /> :
                   <Users size={14} className="text-violet-400" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-100">{act.description}</p>
                  <p className="text-xs text-slate-500">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => handleQuickAction('reports')}
            className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors"
          >
            View All Activity
          </button>
        </div>
      </div>

      {/* Recent Prescriptions with Patient Names & IDs */}
      <div className="mt-8 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Recent Prescriptions</h3>
              <p className="text-sm font-medium text-slate-400">Patient names, IDs & categories</p>
            </div>
          </div>
          <button 
            onClick={() => handleQuickAction('prescription')}
            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Prescription Stats by Category */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {prescriptionCategories.map((cat) => {
            const count = allPrescriptions.filter(p => p.category === cat.id).length;
            return (
              <div key={cat.id} className={`p-3 rounded-xl ${cat.color} flex items-center justify-between`}>
                <div>
                  <p className="text-xs font-bold">{cat.name}</p>
                  <p className="text-lg font-black">{count}</p>
                </div>
                <Tag className="w-5 h-5 opacity-50" />
              </div>
            );
          })}
        </div>

        {/* Prescriptions List */}
        <div className="space-y-3">
          {allPrescriptions.slice(0, 5).map((rx) => {
            const categoryInfo = getCategoryInfo(rx.category);
            return (
              <div key={rx.id} className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800">{rx.patientName || rx.patient}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryInfo.color}`}>
                        {categoryInfo.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">
                        <User className="w-3 h-3 inline mr-1" />
                        ID: {rx.patientId || 'N/A'}
                      </span>
                      <span className="text-xs text-slate-500">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {rx.id}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    rx.status === 'completed' ? 'bg-green-100 text-green-700' :
                    rx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    rx.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {rx.status}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">EGP {rx.total?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Search */}
      <div className="mt-8 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Quick search medicines, customers, prescriptions..." 
            className="flex-1 bg-transparent border-none outline-none text-slate-600 placeholder:text-slate-400"
          />
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <kbd className="px-2 py-1 bg-slate-100 rounded">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-slate-100 rounded">K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

