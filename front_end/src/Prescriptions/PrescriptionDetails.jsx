import React from 'react';
import { X, User, Calendar, FileText, CreditCard, Printer, Download } from 'lucide-react';

const PrescriptionDetails = ({ prescription, onClose, onStatusChange }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-slide-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">Prescription Details</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Prescription Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Prescription ID</p>
              <p className="font-medium">{prescription.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{prescription.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Patient Name</p>
              <p className="font-medium">{prescription.patientName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Patient ID</p>
              <p className="font-medium">{prescription.patientId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Doctor</p>
              <p className="font-medium">{prescription.doctorName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Insurance</p>
              <p className="font-medium">{prescription.insurance}</p>
            </div>
          </div>

          {/* Medicines */}
          <div>
            <h3 className="font-semibold mb-3">Prescribed Medicines</h3>
            <div className="space-y-3">
              {prescription.medicines.map((med, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-gray-500">{med.dosage}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Qty: {med.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Instructions:</strong> Take all medications as prescribed. 
              Follow up with your doctor in 2 weeks.
            </p>
          </div>

          {/* Payment Summary */}
          <div className="border-t dark:border-gray-700 pt-4">
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₿{prescription.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Insurance Coverage</span>
                <span className="text-green-600">-₿{(prescription.total * 0.3).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total Due</span>
                <span>₿{(prescription.total * 0.7).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button className="btn btn-secondary">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button className="btn btn-secondary">
              <Download className="w-4 h-4" />
              Download
            </button>
            {prescription.status === 'pending' && (
              <button 
                onClick={() => {
                  onStatusChange(prescription.id, 'processing');
                  onClose();
                }}
                className="btn btn-primary"
              >
                <FileText className="w-4 h-4" />
                Start Processing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetails;