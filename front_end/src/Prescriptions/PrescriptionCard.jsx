import React from 'react';
import { FileText, Calendar, User, Shield, Pill, CheckCircle, XCircle, Tag } from 'lucide-react';

// Prescription categories
const prescriptionCategories = [
  { id: 'chronic', name: 'Chronic (أمراض مزمنة)', color: 'bg-violet-100 text-violet-700' },
  { id: 'antibiotics', name: 'Antibiotics (مضادات حيوية)', color: 'bg-blue-100 text-blue-700' },
  { id: 'pain', name: 'Pain Relief (تسكين الألم)', color: 'bg-red-100 text-red-700' },
  { id: 'supplements', name: 'Supplements (مكملات)', color: 'bg-amber-100 text-amber-700' },
  { id: 'allergies', name: 'Allergies (حساسية)', color: 'bg-green-100 text-green-700' },
  { id: 'digestive', name: 'Digestive (هضمي)', color: 'bg-cyan-100 text-cyan-700' },
];

// Helper function to get category info
const getCategoryInfo = (categoryId) => {
  return prescriptionCategories.find(c => c.id === categoryId) || prescriptionCategories[1];
};

const PrescriptionCard = ({ prescription, onView, onStatusChange, getStatusIcon, getStatusColor }) => {
  const categoryInfo = getCategoryInfo(prescription.category);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Header - Prescription ID & Date */}
      <div className="bg-gray-50 dark:bg-slate-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-bold text-gray-800 dark:text-white text-lg">
            {prescription.id}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{prescription.date}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Patient Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-blue-500" />
            <span className="text-blue-500 text-sm font-medium">Patient</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white ml-7">
            {prescription.patientName || prescription.patient}
          </h3>
          <div className="flex gap-4 ml-7 mt-1">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              ID: {prescription.patientId || 'N/A'}
            </p>
            {prescription.customerId && (
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                Customer ID: {prescription.customerId}
              </p>
            )}
          </div>
        </div>

        {/* Category Badge */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-5 h-5 text-violet-500" />
            <span className="text-violet-500 text-sm font-medium">Category (الرشة)</span>
          </div>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ml-7 ${categoryInfo.color}`}>
            {categoryInfo.name}
          </span>
        </div>

        {/* Medicines */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-5 h-5 text-blue-500" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              Medicines ({prescription.medicines.length})
            </span>
          </div>
          
          <div className="space-y-3 ml-7">
            {prescription.medicines.map((med, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {med.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      {med.dosage}
                    </p>
                  </div>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full">
                    Qty: {med.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Total & Insurance & Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {prescription.insurance}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Total:</span>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                EGP {prescription.total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {prescription.status === 'pending' && (
            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => onStatusChange && onStatusChange(prescription.id, 'completed')}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm
              </button>
              <button
                onClick={() => onStatusChange && onStatusChange(prescription.id, 'cancelled')}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Cancel
              </button>
            </div>
          )}

          {prescription.status === 'processing' && (
            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => onStatusChange && onStatusChange(prescription.id, 'completed')}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Complete
              </button>
            </div>
          )}

          {/* Status Badge */}
          {prescription.status !== 'pending' && prescription.status !== 'processing' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                prescription.status === 'completed' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {prescription.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCard;

