import React from 'react';
import { User, Phone, Mail } from 'lucide-react';

const CustomerCard = ({ customer, onClick }) => {
  return (
    <div 
      className="card cursor-pointer hover-lift" 
      onClick={() => onClick && onClick(customer)}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {customer?.name || 'Customer Name'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {customer?.email || 'email@example.com'}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-1">
          <Phone className="w-4 h-4" />
          <span>{customer?.phone || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;

