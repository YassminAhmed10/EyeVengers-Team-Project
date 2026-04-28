import React, { useState } from 'react';
import axios from 'axios';

/**
 * InvestigationsRadiologyModal
 * Allows doctors to send investigations to the Radiology Center
 * from the EMR patient dashboard
 */
export default function InvestigationsRadiologyModal({ 
  patientId, 
  isOpen, 
  onClose, 
  doctorName,
  onSuccess 
}) {
  const [selectedInvestigations, setSelectedInvestigations] = useState([]);
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [priority, setPriority] = useState('Routine');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Available investigation types (matching the dashboard)
  const investigationTypes = [
    { id: 'CBC', label: 'CBC (Complete Blood Count)', category: 'Lab' },
    { id: 'Blood Sugar', label: 'Blood Sugar', category: 'Lab' },
    { id: 'CT Scan', label: 'CT Scan', category: 'Imaging' },
    { id: 'MRI', label: 'MRI', category: 'Imaging' },
    { id: 'X-Ray', label: 'X-Ray', category: 'Imaging' },
    { id: 'OCT', label: 'OCT (Optical Coherence Tomography)', category: 'Eye' },
    { id: 'Visual Field Test', label: 'Visual Field Test', category: 'Eye' },
    { id: 'Fluorescein Angiography', label: 'Fluorescein Angiography', category: 'Eye' },
    { id: 'Ultrasound B-Scan', label: 'Ultrasound B-Scan', category: 'Eye' },
    { id: 'Electroencephalography (ERG)', label: 'ERG', category: 'Eye' },
    { id: 'Electro-Oculography (EOG)', label: 'EOG', category: 'Eye' },
    { id: 'Corneal Topography', label: 'Corneal Topography', category: 'Eye' },
    { id: 'Genetic Testing', label: 'Genetic Testing', category: 'Lab' },
    { id: 'Tear Film Analysis', label: 'Tear Film Analysis', category: 'Eye' },
    { id: 'Specular Microscopy', label: 'Specular Microscopy', category: 'Eye' },
  ];

  const handleInvestigationToggle = (investigationType) => {
    setSelectedInvestigations(prev =>
      prev.includes(investigationType)
        ? prev.filter(item => item !== investigationType)
        : [...prev, investigationType]
    );
  };

  const handleSendSingle = async (investigationType) => {
    if (!clinicalIndication.trim()) {
      setError('Clinical indication is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'https://localhost:5201'}/api/investigationsradiology/send-single`,
        {
          patientId,
          investigationType,
          clinicalIndication,
          priority,
          referringDoctorName: doctorName,
          notes
        }
      );

      setSuccessMessage(`✓ ${investigationType} sent to Radiology Center successfully!`);
      
      // Clear after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to send investigation. Please try again.'
      );
      console.error('Error sending investigation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSelected = async () => {
    if (selectedInvestigations.length === 0) {
      setError('Please select at least one investigation');
      return;
    }

    if (!clinicalIndication.trim()) {
      setError('Clinical indication is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'https://localhost:5201'}/api/investigationsradiology/send-multiple`,
        {
          patientId,
          investigationTypes: selectedInvestigations,
          clinicalIndication,
          priority,
          referringDoctorName: doctorName,
          notes
        }
      );

      setSuccessMessage(`✓ ${selectedInvestigations.length} investigations sent to Radiology Center!`);
      setSelectedInvestigations([]);
      setClinicalIndication('');
      setNotes('');
      setPriority('Routine');

      // Clear after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to send investigations. Please try again.'
      );
      console.error('Error sending investigations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  // Group investigations by category
  const groupedByCategory = {};
  investigationTypes.forEach(inv => {
    if (!groupedByCategory[inv.category]) {
      groupedByCategory[inv.category] = [];
    }
    groupedByCategory[inv.category].push(inv);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold">Send Investigations to Radiology Center</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
              <p className="font-semibold">{successMessage}</p>
            </div>
          )}

          {/* Patient Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Patient ID:</span> {patientId}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Referring Doctor:</span> {doctorName || 'Not specified'}
            </p>
          </div>

          {/* Clinical Indication */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Clinical Indication * <span className="text-red-500">Required</span>
            </label>
            <textarea
              value={clinicalIndication}
              onChange={(e) => setClinicalIndication(e.target.value)}
              placeholder="Why is this investigation needed? (e.g., 'Rule out retinal detachment', 'Follow-up on diabetic retinopathy')"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          {/* Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Routine">Routine</option>
                <option value="ASAP">ASAP</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for the radiologist (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
            />
          </div>

          {/* Investigation Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Investigations to Send
            </label>
            
            <div className="space-y-4">
              {Object.entries(groupedByCategory).map(([category, investigations]) => (
                <div key={category} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {investigations.map(inv => (
                      <div key={inv.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={inv.id}
                          checked={selectedInvestigations.includes(inv.id)}
                          onChange={() => handleInvestigationToggle(inv.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor={inv.id} className="ml-3 text-sm text-gray-700 cursor-pointer">
                          {inv.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Count */}
            {selectedInvestigations.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 font-semibold">
                  {selectedInvestigations.length} investigation{selectedInvestigations.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 border-t p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSendSelected}
            disabled={loading || selectedInvestigations.length === 0 || !clinicalIndication.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Sending...' : `Send ${selectedInvestigations.length} Investigation${selectedInvestigations.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
