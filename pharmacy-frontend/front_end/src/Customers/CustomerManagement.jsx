
import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import CustomerCard from './CustomerCard.jsx';
import CustomerHistory from './CustomerHistory.jsx';

const CustomerManagement = ({ customers, onAddCustomer, addNotification }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Use customers from props or empty array
  const customerList = customers || [];

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customerList.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
    );
  }, [customerList, searchQuery]);

  const handleAddCustomer = () => {
    // For demo, add a sample customer
    const newCustomer = {
      name: 'New Customer',
      email: 'new@example.com',
      phone: '01000000000'
    };
    if (onAddCustomer) {
      onAddCustomer(newCustomer);
    }
    if (addNotification) {
      addNotification('New customer added!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your customers and their purchase history
          </p>
        </div>
        <button 
          onClick={handleAddCustomer}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers by name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-blue-600">Total Customers</p>
          <p className="text-2xl font-bold text-blue-700">{customerList.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-green-600">Active This Month</p>
          <p className="text-2xl font-bold text-green-700">{customerList.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-sm text-purple-600">New This Week</p>
          <p className="text-2xl font-bold text-purple-700">3</p>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onClick={() => setSelectedCustomer(customer)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No customers found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <CustomerHistory 
          customerId={selectedCustomer.id} 
          onClose={() => setSelectedCustomer(null)} 
        />
      )}
    </div>
  );
};

export default CustomerManagement;

