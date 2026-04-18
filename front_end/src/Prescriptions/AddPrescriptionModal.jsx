import React, { useState } from 'react';
import { X, Plus, Trash2, User, Tag } from 'lucide-react';

// Prescription categories
const prescriptionCategories = [
  { id: 'chronic', name: 'Chronic (أمراض مزمنة)', color: 'bg-violet-100 text-violet-700' },
  { id: 'antibiotics', name: 'Antibiotics (مضادات حيوية)', color: 'bg-blue-100 text-blue-700' },
  { id: 'pain', name: 'Pain Relief (تسكين الألم)', color: 'bg-red-100 text-red-700' },
  { id: 'supplements', name: 'Supplements (مكملات)', color: 'bg-amber-100 text-amber-700' },
  { id: 'allergies', name: 'Allergies (حساسية)', color: 'bg-green-100 text-green-700' },
  { id: 'digestive', name: 'Digestive (هضمي)', color: 'bg-cyan-100 text-cyan-700' },
];

const AddPrescriptionModal = ({ onClose, onSave, customers = [] }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    doctorName: '',
    date: new Date().toISOString().split('T')[0],
    insurance: 'Self Pay',
    category: 'antibiotics',
    medicines: [{ name: '', dosage: '', quantity: 1, price: 0 }],
    selectedCustomerId: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index][field] = value;
    setFormData(prev => ({ ...prev, medicines: updatedMedicines }));
  };

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', quantity: 1, price: 0 }]
    }));
  };

  const removeMedicine = (index) => {
    if (formData.medicines.length > 1) {
      const updatedMedicines = formData.medicines.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, medicines: updatedMedicines }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = formData.medicines.reduce((sum, med) => {
      return sum + (med.price || 0) * (med.quantity || 0);
    }, 0);
    
    // Get customer ID if customer is selected
    const customerId = formData.selectedCustomerId ? parseInt(formData.selectedCustomerId) : null;
    
    onSave({
      ...formData,
      customerId: customerId,
      id: `RX-${Date.now()}`,
      status: 'pending',
      total
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Add New Prescription
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Select Existing Customer
            </label>
            <select
              name="selectedCustomerId"
              value={formData.selectedCustomerId}
              onChange={(e) => {
                const customerId = e.target.value;
                if (customerId) {
                  const customer = customers.find(c => c.id === parseInt(customerId));
                  if (customer) {
                    setFormData(prev => ({
                      ...prev,
                      selectedCustomerId: customerId,
                      patientName: customer.name,
                      patientId: `CUST-${customer.id}`
                    }));
                  }
                } else {
                  setFormData(prev => ({
                    ...prev,
                    selectedCustomerId: '',
                    patientName: '',
                    patientId: ''
                  }));
                }
              }}
              className="input-field w-full"
            >
              <option value="">-- Select Existing Customer (Optional) --</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Or leave blank to register a new patient
            </p>
          </div>

          {/* Patient Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Patient Name
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                className="input-field w-full"
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Patient ID
              </label>
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
                className="input-field w-full"
                placeholder="P-XXXXX"
              />
            </div>
          </div>

          {/* Doctor & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Doctor Name
              </label>
              <input
                type="text"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                required
                className="input-field w-full"
                placeholder="Dr. Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Insurance & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Insurance
              </label>
              <select
                name="insurance"
                value={formData.insurance}
                onChange={handleChange}
                className="input-field w-full"
              >
                <option value="Self Pay">Self Pay</option>
                <option value="MediCare">MediCare</option>
                <option value="HealthNet">HealthNet</option>
                <option value="BlueCross">BlueCross</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Prescription Category (الرشة)
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field w-full"
              >
                {prescriptionCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Medicines
              </label>
              <button
                type="button"
                onClick={addMedicine}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Medicine
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.medicines.map((medicine, index) => (
                <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={medicine.name}
                        onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                        required
                        className="input-field w-full"
                        placeholder="Medicine name"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={medicine.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        required
                        className="input-field w-full"
                        placeholder="Dosage"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={medicine.quantity}
                        onChange={(e) => handleMedicineChange(index, 'quantity', parseInt(e.target.value))}
                        min="1"
                        required
                        className="input-field w-full"
                        placeholder="Qty"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={medicine.price}
                        onChange={(e) => handleMedicineChange(index, 'price', parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                        className="input-field w-full"
                        placeholder="Price"
                      />
                      {formData.medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicine(index)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPrescriptionModal;

