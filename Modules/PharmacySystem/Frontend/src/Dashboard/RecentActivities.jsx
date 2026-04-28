import React from 'react';
import { Clock, ShoppingCart, FileText, Users } from 'lucide-react';

const RecentActivities = () => {
  const activities = [
    {
      id: 1,
      type: 'sale',
      icon: <ShoppingCart className="w-3 h-3" />,
      color: 'text-blue-600 bg-blue-100',
      message: 'New sale completed',
      amount: '₿ 450',
      time: '5 min ago'
    },
    {
      id: 2,
      type: 'prescription',
      icon: <FileText className="w-3 h-3" />,
      color: 'text-success bg-success',
      message: 'Prescription #P-1234 processed',
      time: '10 min ago'
    },
    {
      id: 3,
      type: 'customer',
      icon: <Users className="w-3 h-3" />,
      color: 'text-purple-600 bg-purple-100',
      message: 'New customer registered',
      time: '25 min ago'
    },
    {
      id: 4,
      type: 'inventory',
      icon: <Clock className="w-3 h-3" />,
      color: 'text-warning bg-warning',
      message: 'Stock updated for 5 items',
      time: '1 hour ago'
    }
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <h3 className="section-title">Recent Activities</h3>
        </div>
        <button className="text-xs text-blue-600 hover:underline">View All</button>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`p-1.5 rounded ${activity.color}`}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{activity.message}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-400">{activity.time}</p>
                {activity.amount && (
                  <span className="text-xs font-medium text-success">{activity.amount}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;
