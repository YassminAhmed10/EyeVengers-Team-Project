import React, { useState, useEffect } from 'react';
import { 
    FaTools, FaBoxes, FaTasks, FaBroom, FaChartBar,
    FaPlus, FaEdit, FaTrash, FaExclamationTriangle, FaCheckCircle
} from 'react-icons/fa';
import './ClinicPageNew.css';

const ClinicPageNew = () => {
    const [activeSection, setActiveSection] = useState('equipment');
    const [equipment, setEquipment] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // Equipment Form Data
    const [equipmentForm, setEquipmentForm] = useState({
        name: '',
        type: '',
        status: 'Working',
        lastMaintenance: '',
        nextMaintenance: '',
        location: '',
        serialNumber: ''
    });

    // Supply Form Data
    const [supplyForm, setSupplyForm] = useState({
        name: '',
        quantity: 0,
        reorderLevel: 0,
        supplier: '',
        unit: '',
        unitPrice: 0
    });

    useEffect(() => {
        fetchData();
    }, [activeSection]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeSection === 'equipment') {
                const response = await fetch('http://localhost:5201/api/Equipment');
                const data = await response.json();
                setEquipment(data);
            } else if (activeSection === 'supplies') {
                const response = await fetch('http://localhost:5201/api/Supply');
                const data = await response.json();
                setSupplies(data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEquipment = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5201/api/Equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(equipmentForm)
            });

            if (response.ok) {
                fetchData();
                setShowAddModal(false);
                resetEquipmentForm();
                alert('Equipment added successfully!');
            }
        } catch (error) {
            console.error('Error adding equipment:', error);
            alert('Failed to add equipment');
        }
    };

    const handleUpdateEquipment = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5201/api/Equipment/${editItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...equipmentForm, id: editItem.id, createdAt: editItem.createdAt })
            });

            if (response.ok) {
                fetchData();
                setShowAddModal(false);
                setEditItem(null);
                resetEquipmentForm();
                alert('Equipment updated successfully!');
            }
        } catch (error) {
            console.error('Error updating equipment:', error);
            alert('Failed to update equipment');
        }
    };

    const handleDeleteEquipment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this equipment?')) return;

        try {
            const response = await fetch(`http://localhost:5201/api/Equipment/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchData();
                alert('Equipment deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting equipment:', error);
            alert('Failed to delete equipment');
        }
    };

    const handleAddSupply = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5201/api/Supply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplyForm)
            });

            if (response.ok) {
                fetchData();
                setShowAddModal(false);
                resetSupplyForm();
                alert('Supply added successfully!');
            }
        } catch (error) {
            console.error('Error adding supply:', error);
            alert('Failed to add supply');
        }
    };

    const handleUpdateSupply = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5201/api/Supply/${editItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...supplyForm, id: editItem.id, createdAt: editItem.createdAt, lastRestocked: editItem.lastRestocked })
            });

            if (response.ok) {
                fetchData();
                setShowAddModal(false);
                setEditItem(null);
                resetSupplyForm();
                alert('Supply updated successfully!');
            }
        } catch (error) {
            console.error('Error updating supply:', error);
            alert('Failed to update supply');
        }
    };

    const handleDeleteSupply = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supply?')) return;

        try {
            const response = await fetch(`http://localhost:5201/api/Supply/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchData();
                alert('Supply deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting supply:', error);
            alert('Failed to delete supply');
        }
    };

    const resetEquipmentForm = () => {
        setEquipmentForm({
            name: '',
            type: '',
            status: 'Working',
            lastMaintenance: '',
            nextMaintenance: '',
            location: '',
            serialNumber: ''
        });
    };

    const resetSupplyForm = () => {
        setSupplyForm({
            name: '',
            quantity: 0,
            reorderLevel: 0,
            supplier: '',
            unit: '',
            unitPrice: 0
        });
    };

    const handleEditEquipment = (item) => {
        setEditItem(item);
        setEquipmentForm({
            name: item.name,
            type: item.type,
            status: item.status,
            lastMaintenance: item.lastMaintenance.split('T')[0],
            nextMaintenance: item.nextMaintenance.split('T')[0],
            location: item.location || '',
            serialNumber: item.serialNumber || ''
        });
        setShowAddModal(true);
    };

    const handleEditSupply = (item) => {
        setEditItem(item);
        setSupplyForm({
            name: item.name,
            quantity: item.quantity,
            reorderLevel: item.reorderLevel,
            supplier: item.supplier || '',
            unit: item.unit || '',
            unitPrice: item.unitPrice || 0
        });
        setShowAddModal(true);
    };

    const renderEquipmentTable = () => (
        <div className="clinic-table-container">
            <div className="table-header">
                <h3><FaTools /> Ophthalmic Equipment</h3>
                <button className="add-btn" onClick={() => { setEditItem(null); resetEquipmentForm(); setShowAddModal(true); }}>
                    <FaPlus /> Add Equipment
                </button>
            </div>
            <table className="clinic-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Serial Number</th>
                        <th>Location</th>
                        <th>Last Maintenance</th>
                        <th>Next Maintenance</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {equipment.length > 0 ? (
                        equipment.map((item) => (
                            <tr key={item.id} className={item.status !== 'Working' ? 'alert-row' : ''}>
                                <td>{item.name}</td>
                                <td>{item.type}</td>
                                <td>
                                    <span className={`status-badge ${item.status === 'Working' ? 'success' : 'warning'}`}>
                                        {item.status === 'Working' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                        {item.status}
                                    </span>
                                </td>
                                <td>{item.serialNumber || 'N/A'}</td>
                                <td>{item.location || 'N/A'}</td>
                                <td>{new Date(item.lastMaintenance).toLocaleDateString()}</td>
                                <td>{new Date(item.nextMaintenance).toLocaleDateString()}</td>
                                <td className="actions">
                                    <button className="action-btn edit" onClick={() => handleEditEquipment(item)}>
                                        <FaEdit />
                                    </button>
                                    <button className="action-btn delete" onClick={() => handleDeleteEquipment(item.id)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="no-data">No equipment found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderSuppliesTable = () => (
        <div className="clinic-table-container">
            <div className="table-header">
                <h3><FaBoxes /> Medical Supplies</h3>
                <button className="add-btn" onClick={() => { setEditItem(null); resetSupplyForm(); setShowAddModal(true); }}>
                    <FaPlus /> Add Supply
                </button>
            </div>
            <table className="clinic-table">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Reorder Level</th>
                        <th>Supplier</th>
                        <th>Unit Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {supplies.length > 0 ? (
                        supplies.map((item) => (
                            <tr key={item.id} className={item.quantity <= item.reorderLevel ? 'alert-row' : ''}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>{item.unit || 'N/A'}</td>
                                <td>{item.reorderLevel}</td>
                                <td>{item.supplier || 'N/A'}</td>
                                <td>${item.unitPrice?.toFixed(2) || '0.00'}</td>
                                <td>
                                    {item.quantity <= item.reorderLevel ? (
                                        <span className="status-badge warning">
                                            <FaExclamationTriangle /> Low Stock
                                        </span>
                                    ) : (
                                        <span className="status-badge success">
                                            <FaCheckCircle /> In Stock
                                        </span>
                                    )}
                                </td>
                                <td className="actions">
                                    <button className="action-btn edit" onClick={() => handleEditSupply(item)}>
                                        <FaEdit />
                                    </button>
                                    <button className="action-btn delete" onClick={() => handleDeleteSupply(item.id)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="no-data">No supplies found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderReports = () => (
        <div className="reports-container">
            <h3><FaChartBar /> System Reports</h3>
            <div className="report-cards">
                <div className="report-card">
                    <div className="report-icon warning">
                        <FaExclamationTriangle />
                    </div>
                    <div className="report-info">
                        <h4>Equipment Alerts</h4>
                        <p className="report-number">{equipment.filter(e => e.status !== 'Working').length}</p>
                        <span>Needs attention</span>
                    </div>
                </div>
                <div className="report-card">
                    <div className="report-icon danger">
                        <FaBoxes />
                    </div>
                    <div className="report-info">
                        <h4>Low Supplies</h4>
                        <p className="report-number">{supplies.filter(s => s.quantity <= s.reorderLevel).length}</p>
                        <span>Below reorder level</span>
                    </div>
                </div>
                <div className="report-card">
                    <div className="report-icon success">
                        <FaTools />
                    </div>
                    <div className="report-info">
                        <h4>Total Equipment</h4>
                        <p className="report-number">{equipment.length}</p>
                        <span>Registered items</span>
                    </div>
                </div>
                <div className="report-card">
                    <div className="report-icon primary">
                        <FaBoxes />
                    </div>
                    <div className="report-info">
                        <h4>Total Supplies</h4>
                        <p className="report-number">{supplies.length}</p>
                        <span>Inventory items</span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="clinic-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="clinic-page-new">
            <div className="clinic-header">
                <h1>Clinic System Management</h1>
                <p>Manage equipment, supplies, and clinic operations</p>
            </div>

            <div className="clinic-nav">
                <button 
                    className={`nav-btn ${activeSection === 'equipment' ? 'active' : ''}`}
                    onClick={() => setActiveSection('equipment')}
                >
                    <FaTools /> Equipment
                </button>
                <button 
                    className={`nav-btn ${activeSection === 'supplies' ? 'active' : ''}`}
                    onClick={() => setActiveSection('supplies')}
                >
                    <FaBoxes /> Supplies
                </button>
                <button 
                    className={`nav-btn ${activeSection === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveSection('reports')}
                >
                    <FaChartBar /> Reports
                </button>
            </div>

            <div className="clinic-content">
                {activeSection === 'equipment' && renderEquipmentTable()}
                {activeSection === 'supplies' && renderSuppliesTable()}
                {activeSection === 'reports' && renderReports()}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {activeSection === 'equipment' 
                                    ? (editItem ? 'Edit Equipment' : 'Add New Equipment')
                                    : (editItem ? 'Edit Supply' : 'Add New Supply')
                                }
                            </h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
                        </div>

                        {activeSection === 'equipment' ? (
                            <form onSubmit={editItem ? handleUpdateEquipment : handleAddEquipment}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Equipment Name *</label>
                                        <input
                                            type="text"
                                            value={equipmentForm.name}
                                            onChange={(e) => setEquipmentForm({...equipmentForm, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Type *</label>
                                        <input
                                            type="text"
                                            value={equipmentForm.type}
                                            onChange={(e) => setEquipmentForm({...equipmentForm, type: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Status *</label>
                                        <select
                                            value={equipmentForm.status}
                                            onChange={(e) => setEquipmentForm({...equipmentForm, status: e.target.value})}
                                            required
                                        >
                                            <option value="Working">Working</option>
                                            <option value="Needs Maintenance">Needs Maintenance</option>
                                            <option value="Under Repair">Under Repair</option>
                                            <option value="Out of Service">Out of Service</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Serial Number</label>
                                        <input
                                            type="text"
                                            value={equipmentForm.serialNumber}
                                            onChange={(e) => setEquipmentForm({...equipmentForm, serialNumber: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input
                                            type="text"
                                            value={equipmentForm.location}
                                            onChange={(e) => setEquipmentForm({...equipmentForm, location: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Maintenance *</label>
                                        <input
                                            type="date"
                                            value={equipmentForm.lastMaintenance}
                                            onChange={(e) => setEquipmentForm({...equipmentForm, lastMaintenance: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Next Maintenance *</label>
                                        <input
                                            type="date"
                                            value={equipmentForm.nextMaintenance}
                                            onChange={(e) => setEquipmentForm({...equipmentForm, nextMaintenance: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">
                                        {editItem ? 'Update' : 'Add'} Equipment
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={editItem ? handleUpdateSupply : handleAddSupply}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Supply Name *</label>
                                        <input
                                            type="text"
                                            value={supplyForm.name}
                                            onChange={(e) => setSupplyForm({...supplyForm, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Quantity *</label>
                                        <input
                                            type="number"
                                            value={supplyForm.quantity}
                                            onChange={(e) => setSupplyForm({...supplyForm, quantity: parseInt(e.target.value)})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Unit</label>
                                        <input
                                            type="text"
                                            value={supplyForm.unit}
                                            onChange={(e) => setSupplyForm({...supplyForm, unit: e.target.value})}
                                            placeholder="e.g., boxes, pieces"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Reorder Level *</label>
                                        <input
                                            type="number"
                                            value={supplyForm.reorderLevel}
                                            onChange={(e) => setSupplyForm({...supplyForm, reorderLevel: parseInt(e.target.value)})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Supplier</label>
                                        <input
                                            type="text"
                                            value={supplyForm.supplier}
                                            onChange={(e) => setSupplyForm({...supplyForm, supplier: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Unit Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={supplyForm.unitPrice}
                                            onChange={(e) => setSupplyForm({...supplyForm, unitPrice: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">
                                        {editItem ? 'Update' : 'Add'} Supply
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicPageNew;
