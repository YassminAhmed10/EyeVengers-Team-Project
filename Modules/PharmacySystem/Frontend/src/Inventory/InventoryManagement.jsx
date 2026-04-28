
import React, { useState, useMemo } from 'react';
import { 
  Package, Search, Plus, Filter, Download, 
  AlertTriangle, Edit, Trash2, Eye, TrendingUp,
  Clock, DollarSign, AlertCircle
} from 'lucide-react';
import InventoryTable from './InventoryTable';
import AddMedicineModal from './AddMedicineModal';
import StockAlerts from './StockAlerts';

const InventoryManagement = ({ medicines, onAddMedicine, onDeleteMedicine, onNavigate, addNotification }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Use props medicines or empty array
  const inventory = medicines || [];

  const categories = ['all', 'Antibiotics', 'Pain Relief', 'Chronic Care', 'Supplements', 'Allergies', 'Digestive', 'Other'];

  // Calculate stats from props
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(m => m.stock < 30).length;
    const criticalItems = inventory.filter(m => m.stock < 10).length;
    
    const today = new Date();
    const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
    const expiringSoon = inventory.filter(m => {
      const expiry = new Date(m.expiry);
      return expiry <= sixtyDaysFromNow && expiry > today;
    }).length;
    
    const totalValue = inventory.reduce((sum, m) => sum + (m.price * m.stock), 0);
    
    return { totalItems, lowStockItems, criticalItems, expiringSoon, totalValue };
  }, [inventory]);

  const filteredMedicines = useMemo(() => {
    return inventory.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (med.manufacturer && med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || med.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchTerm, filterCategory]);

  const handleAddMedicine = (newMedicine) => {
    if (onAddMedicine) {
      onAddMedicine(newMedicine);
    }
    setShowAddModal(false);
    if (addNotification) {
      addNotification(`Added: ${newMedicine.name}`);
    }
  };

  const handleDeleteMedicine = (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      if (onDeleteMedicine) {
        onDeleteMedicine(id);
      }
    }
  };

  const handleReorder = (medicine) => {
    if (addNotification) {
      addNotification(`Reorder request for ${medicine.name} submitted!`);
    }
  };

  // Get expiring items
  const getExpiringItems = useMemo(() => {
    const today = new Date();
    const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
    return inventory.filter(m => {
      const expiry = new Date(m.expiry);
      return expiry <= sixtyDaysFromNow && expiry > today;
    }).slice(0, 5);
  }, [inventory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage medicine stock, track expiry dates, and handle automatic reordering
          </p>
          {stats.lowStockItems > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 mt-2 bg-red-500 text-white text-sm font-medium rounded-full">
              ⚠️ {stats.lowStockItems} items need attention
            </span>
          )}
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </button>
          <button className="btn btn-secondary">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Items</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalItems}</p>
              <p className="text-xs text-blue-500 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" /> +5% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.lowStockItems}</p>
              <p className="text-xs text-yellow-500 flex items-center mt-1">
                <AlertTriangle className="w-3 h-3 mr-1" /> Needs attention
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.expiringSoon}</p>
              <p className="text-xs text-orange-500 flex items-center mt-1">
                <Clock className="w-3 h-3 mr-1" /> Next 60 days
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Inventory Value</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">EGP {stats.totalValue.toLocaleString()}</p>
              <p className="text-xs text-green-500 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" /> +12.5%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {stats.lowStockItems > 0 && <StockAlerts lowStockCount={stats.lowStockItems} />}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by medicine name or manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field w-48"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <button className="btn btn-secondary">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <InventoryTable 
        medicines={filteredMedicines}
        onDelete={handleDeleteMedicine}
        onReorder={handleReorder}
      />

      {/* Expiring Soon Section */}
      {getExpiringItems.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Expiring Soon (Next 60 Days)
          </h2>
          <div className="space-y-2">
            {getExpiringItems.map((medicine) => {
              const today = new Date();
              const expiry = new Date(medicine.expiry);
              const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={medicine.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-800 dark:text-white">{medicine.name}</span>
                    <span className="text-sm text-gray-500">Expires in {daysUntilExpiry} days</span>
                  </div>
                  <button 
                    onClick={() => handleReorder(medicine)}
                    className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Reorder
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddModal && (
        <AddMedicineModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMedicine}
        />
      )}
    </div>
  );
};

export default InventoryManagement;

