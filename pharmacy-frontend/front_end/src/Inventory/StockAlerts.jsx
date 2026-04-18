import React from 'react';
import { AlertTriangle, Package, Clock } from 'lucide-react';

const StockAlerts = ({ lowStockCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Low Stock Alert Card */}
      <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="w-6 h-6 text-amber-500 mr-3" />
          <div>
            <p className="font-medium text-amber-700 dark:text-amber-400">
              Low Stock Alert
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-500">
              {lowStockCount} items below minimum threshold
            </p>
          </div>
        </div>
      </div>

      {/* Expiring Soon Card */}
      <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 p-4 rounded-lg">
        <div className="flex items-center">
          <Clock className="w-6 h-6 text-blue-500 mr-3" />
          <div>
            <p className="font-medium text-blue-700 dark:text-blue-400">
              Expiring Soon
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-500">
              3 items expire in 30 days
            </p>
          </div>
        </div>
      </div>

      {/* Pending Orders Card */}
      <div className="bg-purple-50 border border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 p-4 rounded-lg">
        <div className="flex items-center">
          <Package className="w-6 h-6 text-purple-500 mr-3" />
          <div>
            <p className="font-medium text-purple-700 dark:text-purple-400">
              Pending Orders
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-500">
              2 orders awaiting delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAlerts;