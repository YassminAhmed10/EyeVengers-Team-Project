// src/pages/Admin/InvestigationManagementPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaClipboardList, FaMicroscope, FaCheckCircle, FaPlayCircle, FaUndo } from 'react-icons/fa';
import { appointmentService } from '../../services/appointmentService';

const statusStages = [
  { value: 'Scheduled', label: 'Scheduled', icon: FaClipboardList, color: '#0068b3' },
  { value: 'In Progress', label: 'In Progress', icon: FaMicroscope, color: '#f59e0b' },
  { value: 'Completed', label: 'Completed', icon: FaCheckCircle, color: '#10b981' }
];

export default function InvestigationManagementPage({ setPage }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('Scheduled');

  useEffect(() => {
    loadAppointments();
  }, [selectedStatus]);

  const loadAppointments = async () => {
    setLoading(true);
    const result = await appointmentService.getAppointments('Accepted', selectedStatus);
    if (result.success) {
      setAppointments(result.data);
    }
    setLoading(false);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    const result = await appointmentService.updateInvestigationStatus(appointmentId, newStatus);
    if (result.success) {
      await loadAppointments();
      alert(`Investigation status updated to ${newStatus}`);
    } else {
      alert('Failed to update status');
    }
  };

  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'Scheduled') return 'In Progress';
    if (currentStatus === 'In Progress') return 'Completed';
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading investigations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-ink mb-2">
          Investigation Management
        </h1>
        <p className="text-gray-500">
          Track and manage radiology investigation status
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-3 mb-8 bg-white p-2 rounded-xl shadow-sm">
        {statusStages.map((stage) => {
          const Icon = stage.icon;
          const isActive = selectedStatus === stage.value;
          return (
            <motion.button
              key={stage.value}
              onClick={() => setSelectedStatus(stage.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-transparent border border-primary text-primary hover:bg-primary/5'
              }`}
            >
              <Icon size={16} /> {stage.label}
            </motion.button>
          );
        })}
      </div>

      {/* Investigations Grid */}
      {appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((apt, idx) => {
            const currentStage = statusStages.find(s => s.value === apt.investigationStatus);
            const nextStatus = getNextStatus(apt.investigationStatus);
            
            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl shadow-sm border-l-4 overflow-hidden"
                style={{ borderLeftColor: currentStage?.color || '#9ca3af' }}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {apt.patientName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {apt.serviceName}
                      </p>
                    </div>
                    <span 
                      className="text-xs font-medium px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${currentStage?.color}15`,
                        color: currentStage?.color
                      }}
                    >
                      {apt.investigationStatus}
                    </span>
                  </div>

                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-gray-500">Appointment Date</span>
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(apt.slotDateTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Results</span>
                      <span className="text-sm font-medium text-success">
                        {apt.resultCount || 0} uploaded
                      </span>
                    </div>
                  </div>

                  {/* Status Progression Indicator */}
                  <div className="flex items-center justify-between mb-5">
                    {statusStages.map((stage, idx) => {
                      const isCompleted = apt.investigationStatus === 'Completed' || 
                                        (apt.investigationStatus === 'In Progress' && stage.value === 'Scheduled') ||
                                        (apt.investigationStatus === stage.value);
                      const isCurrent = apt.investigationStatus === stage.value;
                      const Icon = stage.icon;
                      
                      return (
                        <div key={stage.value} className="flex-1 text-center">
                          <div 
                            className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center transition-all ${
                              isCompleted 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200 text-gray-400'
                            } ${isCurrent ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                          >
                            <Icon size={16} />
                          </div>
                          <p className="text-xs text-gray-500 mt-2 hidden sm:block">
                            {stage.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  {nextStatus && (
                    <motion.button
                      onClick={() => handleStatusChange(apt.id, nextStatus)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 rounded-lg font-medium text-white flex items-center justify-center gap-2 mb-2 transition-colors"
                      style={{ backgroundColor: currentStage?.color }}
                    >
                      {apt.investigationStatus === 'Scheduled' && <FaPlayCircle size={14} />}
                      {apt.investigationStatus === 'In Progress' && <FaCheckCircle size={14} />}
                      {nextStatus === 'In Progress' ? 'Start Investigation' : 'Mark as Completed'}
                    </motion.button>
                  )}

                  {apt.investigationStatus === 'In Progress' && (
                    <motion.button
                      onClick={() => handleStatusChange(apt.id, 'Scheduled')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 transition-colors"
                    >
                      <FaUndo size={14} /> Revert to Scheduled
                    </motion.button>
                  )}

                  {apt.investigationStatus === 'Completed' && (
                    <div className="w-full py-2.5 rounded-lg font-medium text-success bg-success/10 text-center">
                      Investigation Complete
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <FaClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No investigations with status: {selectedStatus}</p>
        </div>
      )}
    </div>
  );
}