import React from 'react';
import { Package, FileText, Users, ArrowRight, Pill } from 'lucide-react';

const GlobalSearchResults = ({ results, onNavigate, onClose }) => {
  const { medicines = [], customers = [], prescriptions = [] } = results;
  
  const hasResults = medicines.length > 0 || customers.length > 0 || prescriptions.length > 0;

  if (!hasResults) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-50 p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No results found</p>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-50 max-h-96 overflow-y-auto">
      {/* Medicines Section */}
      {medicines.length > 0 && (
        <div className="border-b border-gray-200 dark:border-slate-700">
          <div className="px-4 py-2 bg-gray-50 dark:bg-slate-700/50 flex items-center gap-2">
            <Pill className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Medicines ({medicines.length})
            </span>
          </div>
          <div className="py-1">
            {medicines.slice(0, 5).map((medicine) => (
              <button
                key={medicine.id}
                onClick={() => onNavigate('inventory', medicine)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-blue-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {medicine.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {medicine.category} • EGP {medicine.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
            {medicines.length > 5 && (
              <button
                onClick={() => onNavigate('inventory')}
                className="w-full px-4 py-2 text-sm text-blue-500 hover:bg-gray-50 dark:hover:bg-slate-700/50"
              >
                View all {medicines.length} medicines →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Customers Section */}
      {customers.length > 0 && (
        <div className="border-b border-gray-200 dark:border-slate-700">
          <div className="px-4 py-2 bg-gray-50 dark:bg-slate-700/50 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Customers ({customers.length})
            </span>
          </div>
          <div className="py-1">
            {customers.slice(0, 5).map((customer) => (
              <button
                key={customer.id}
                onClick={() => onNavigate('customers', customer)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-green-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {customer.email} • {customer.phone}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
            {customers.length > 5 && (
              <button
                onClick={() => onNavigate('customers')}
                className="w-full px-4 py-2 text-sm text-blue-500 hover:bg-gray-50 dark:hover:bg-slate-700/50"
              >
                View all {customers.length} customers →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Prescriptions Section */}
      {prescriptions.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-gray-50 dark:bg-slate-700/50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Prescriptions ({prescriptions.length})
            </span>
          </div>
          <div className="py-1">
            {prescriptions.slice(0, 5).map((prescription) => (
              <button
                key={prescription.id}
                onClick={() => onNavigate('prescriptions', prescription)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {prescription.patientName || prescription.customer}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {prescription.id} • {prescription.medication || prescription.medicines?.[0]?.name}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
            {prescriptions.length > 5 && (
              <button
                onClick={() => onNavigate('prescriptions')}
                className="w-full px-4 py-2 text-sm text-blue-500 hover:bg-gray-50 dark:hover:bg-slate-700/50"
              >
                View all {prescriptions.length} prescriptions →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearchResults;

