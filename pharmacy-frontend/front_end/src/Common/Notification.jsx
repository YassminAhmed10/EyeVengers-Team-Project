import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Notification = ({ type = 'info', message, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900',
    error: 'bg-red-50 dark:bg-red-900',
    info: 'bg-blue-50 dark:bg-blue-900'
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg ${bgColors[type]} animate-slide-in`}>
      {icons[type]}
      <p className="flex-1 text-sm text-gray-700 dark:text-gray-200">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Notification;

