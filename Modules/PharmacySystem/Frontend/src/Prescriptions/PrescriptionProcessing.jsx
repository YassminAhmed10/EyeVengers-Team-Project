
import React, { useState, useMemo } from 'react';
import { FileText, Search, Filter, CheckCircle, XCircle, Clock, Eye, Printer, Plus, Tag } from 'lucide-react';
import PrescriptionCard from './PrescriptionCard';
import PrescriptionDetails from './PrescriptionDetails';
import AddPrescriptionModal from './AddPrescriptionModal';

// Prescription categories
const prescriptionCategories = [
  { id: 'chronic', name: 'Chronic (أمراض مزمنة)', color: 'bg-violet-100 text-violet-700' },
  { id: 'antibiotics', name: 'Antibiotics (مضادات حيوية)', color: 'bg-blue-100 text-blue-700' },
  { id: 'pain', name: 'Pain Relief (تسكين الألم)', color: 'bg-red-100 text-red-700' },
  { id: 'supplements', name: 'Supplements (مكملات)', color: 'bg-amber-100 text-amber-700' },
  { id: 'allergies', name: 'Allergies (حساسية)', color: 'bg-green-100 text-green-700' },
  { id: 'digestive', name: 'Digestive (هضمي)', color: 'bg-cyan-100 text-cyan-700' },
];

const PrescriptionProcessing = ({ prescriptions, onAddPrescription, onUpdateStatus, addNotification, customers }) => {
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Use prescriptions from props
  const prescriptionList = prescriptions || [];

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptionList.filter(p => {
      const matchesSearch = 
        (p.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.patientName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [prescriptionList, searchTerm, statusFilter, categoryFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: prescriptionList.length,
      pending: prescriptionList.filter(p => p.status === 'pending').length,
      processing: prescriptionList.filter(p => p.status === 'processing').length,
      completed: prescriptionList.filter(p => p.status === 'completed').length
    };
  }, [prescriptionList]);

  // Calculate category stats
  const categoryStats = useMemo(() => {
    const categories = {};
    prescriptionList.forEach(p => {
      const cat = p.category || 'other';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return categories;
  }, [prescriptionList]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusChange = (id, newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(id, newStatus);
    }
    if (addNotification) {
      addNotification(`Prescription ${id} is now ${newStatus}`);
    }
  };

  const handleAddPrescription = (newPrescription) => {
    if (onAddPrescription) {
      onAddPrescription(newPrescription);
    }
    setShowAddModal(false);
    if (addNotification) {
      addNotification(`New prescription added for ${newPrescription.patient}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Prescription Processing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and process incoming prescriptions
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-secondary">
            <Printer className="w-4 h-4" />
            Print Queue
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            New Prescription
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-blue-600">Total Today</p>
          <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-blue-600">Processing</p>
          <p className="text-2xl font-bold text-blue-700">{stats.processing}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by prescription ID or patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">All Categories</option>
            {prescriptionCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button className="btn btn-secondary">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredPrescriptions.length > 0 ? (
          filteredPrescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription.id}
              prescription={prescription}
              onView={() => setSelectedPrescription(prescription)}
              onStatusChange={handleStatusChange}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No prescriptions found</p>
          </div>
        )}
      </div>

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <PrescriptionDetails
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Add Prescription Modal */}
      {showAddModal && (
        <AddPrescriptionModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddPrescription}
          customers={customers}
        />
      )}
    </div>
  );
};

export default PrescriptionProcessing;

