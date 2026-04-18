import React, { useState } from 'react';
import { Edit, Trash2, Eye, AlertTriangle, History, RotateCcw } from 'lucide-react';

const InventoryTable = ({ medicines, onDelete, onReorder }) => {
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Stock': 
        return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
      case 'Low Stock': 
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
      case 'Critical': 
        return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
      default: 
        return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
    }
  };

  const getExpiryColor = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600 line-through'; // Expired
    if (diffDays <= 30) return 'text-red-500'; // Less than 30 days - red
    if (diffDays <= 60) return 'text-orange-500'; // 30-60 days - orange
    return 'text-green-500'; // More than 60 days - green
  };

  const getExpiryBadge = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Expired', bg: 'bg-red-100', textColor: 'text-red-700' };
    if (diffDays <= 30) return { text: `${diffDays} days`, bg: 'bg-red-100', textColor: 'text-red-700' };
    if (diffDays <= 60) return { text: `${diffDays} days`, bg: 'bg-orange-100', textColor: 'text-orange-700' };
    return { text: `${diffDays} days`, bg: 'bg-green-100', textColor: 'text-green-700' };
  };

  const isExpired = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  return (
    <div className="card overflow-hidden">
      <div className="table-container">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Medicine Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Expiry Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Manufacturer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {medicines.map((medicine) => {
              const statusColors = getStatusColor(medicine.status);
              const expiryBadge = getExpiryBadge(medicine.expiry);
              const expired = isExpired(medicine.expiry);
              
              return (
                <tr key={medicine.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                          {medicine.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800 dark:text-white">{medicine.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      {medicine.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${
                      medicine.status === 'Critical' ? 'text-red-600' : 
                      medicine.status === 'Low Stock' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {medicine.stock} units
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-800 dark:text-white">
                      EGP {medicine.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className={getExpiryColor(medicine.expiry)}>
                        {medicine.expiry}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block w-fit ${expiryBadge.bg} ${expiryBadge.textColor}`}>
                        {expiryBadge.text}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {medicine.manufacturer}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full ${statusColors.dot} mr-2`}></span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                        {medicine.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => setSelectedMedicine(medicine)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button 
                        className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-green-600" />
                      </button>
                      <button 
                        onClick={() => onReorder && onReorder(medicine)}
                        className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                        title="Reorder"
                      >
                        <RotateCcw className="w-4 h-4 text-purple-600" />
                      </button>
                      <button 
                        onClick={() => onDelete(medicine.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {medicines.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No medicines found</p>
        </div>
      )}
      
      {/* Pagination */}
      {medicines.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-4 pb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing 1 to {medicines.length} of {medicines.length} entries
          </p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">Previous</button>
            <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">1</button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">2</button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">3</button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;

