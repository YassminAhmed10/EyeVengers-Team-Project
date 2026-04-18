
import React from 'react';
import { ShoppingCart, User, Trash2, Plus, Minus, CreditCard } from 'lucide-react';

const Cart = ({ 
  cart, 
  customer, 
  setCustomer, 
  updateQuantity, 
  removeFromCart, 
  calculateTotal, 
  onCheckout, 
  customers,
  selectedCustomer,
  setSelectedCustomer
}) => {
  
  const handleCustomerSelect = (e) => {
    const customerId = parseInt(e.target.value);
    if (customerId) {
      const selected = customers?.find(c => c.id === customerId);
      setSelectedCustomer(selected);
    } else {
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="card sticky top-6 bg-white rounded-2xl shadow-lg border border-slate-100">
      <div className="flex items-center justify-between mb-4 p-4 border-b border-slate-100">
        <h2 className="text-lg font-bold flex items-center text-slate-800">
          <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
          Cart ({cart.length})
        </h2>
      </div>

      {/* Customer Selection */}
      <div className="mb-4 px-4">
        <label className="block text-sm font-medium mb-2 text-slate-600">Customer (Optional)</label>
        <select
          value={selectedCustomer?.id || ''}
          onChange={handleCustomerSelect}
          className="input-field"
        >
          <option value="">Walk-in Customer</option>
          {customers?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Cart Items */}
      <div className="space-y-2 mb-4 px-4 max-h-80 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <ShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Cart is empty</p>
            <p className="text-sm">Add products to start sale</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex-1">
                <p className="font-medium text-sm text-slate-800">{item.name}</p>
                <p className="text-sm text-slate-500">EGP {item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-7 h-7 flex items-center justify-center bg-white rounded-lg border border-slate-200 hover:bg-slate-100"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-bold">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-7 h-7 flex items-center justify-center bg-white rounded-lg border border-slate-200 hover:bg-slate-100"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg ml-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="border-t border-slate-100 pt-4 px-4 pb-4 space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>EGP {calculateTotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Tax (14%)</span>
          <span>EGP {(calculateTotal() * 0.14).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-xl pt-2 border-t border-slate-100">
          <span className="text-slate-800">Total</span>
          <span className="text-blue-600">EGP {(calculateTotal() * 1.14).toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="px-4 pb-4">
        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CreditCard className="w-5 h-5" />
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;

