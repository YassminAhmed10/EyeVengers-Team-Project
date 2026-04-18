import React from 'react';
import { 
  LayoutDashboard, Package, FileText, ShoppingCart, 
  Users, BarChart3, Settings, LogOut, User
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, darkMode }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'inventory', label: 'Inventory', icon: <Package size={20} /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <FileText size={20} /> },
    { id: 'sales', label: 'Point of Sale', icon: <ShoppingCart size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  return (
    <aside className={`pharmacy-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="pharmacy-logo">P</div>
        {sidebarOpen && (
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>PharmaFlow</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Management System</p>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button className="logout-button">
        <span className="nav-icon"><LogOut size={20} /></span>
        {sidebarOpen && <span className="nav-label">Logout</span>}
      </button>

      <div className="user-profile">
        <div className="user-avatar">
          <User size={24} />
        </div>
        {sidebarOpen && (
          <div className="user-info">
            <h3>Doha</h3>
            <p>Pharmacist</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
