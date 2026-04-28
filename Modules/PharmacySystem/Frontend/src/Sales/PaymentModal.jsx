import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Smartphone, Printer, Receipt } from 'lucide-react';

const PaymentModal = ({ total, cart, customer, onClose, onPayment }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [processing, setProcessing] = useState(false);

  const tax = total * 0.1;
  const grandTotal = total + tax;
  const change = paymentMethod === 'cash' && cashReceived 
    ? parseFloat(cashReceived) - grandTotal 
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onPayment({
      method: paymentMethod,
      amount: grandTotal,
      cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : null,
      change: change,
      timestamp: new Date().toISOString()
    });
    
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-slide-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">Payment</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Total Amount */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-3xl font-bold text-blue-600">₿{grandTotal.toFixed(2)}</p>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 border rounded-lg flex flex-col items-center space-y-1 ${
                  paymentMethod === 'cash' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span className="text-xs">Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 border rounded-lg flex flex-col items-center space-y-1 ${
                  paymentMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('mobile')}
                className={`p-3 border rounded-lg flex flex-col items-center space-y-1 ${
                  paymentMethod === 'mobile' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs">Mobile</span>
              </button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Cash Received</label>
                <input
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="input-field"
                  placeholder="Enter amount"
                  required
                />
              </div>
              {cashReceived && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between">
                    <span>Change:</span>
                    <span className="font-bold text-green-600">
                      ₿{change >= 0 ? change.toFixed(2) : 'Insufficient amount'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Receipt Options */}
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="printReceipt" className="rounded" defaultChecked />
            <label htmlFor="printReceipt" className="text-sm">Print receipt</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="emailReceipt" className="rounded" />
            <label htmlFor="emailReceipt" className="text-sm">Email receipt to customer</label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary flex-1"
              disabled={processing || (paymentMethod === 'cash' && cashReceived < grandTotal)}
            >
              {processing ? (
                <div className="loading-spinner w-4 h-4 border-2"></div>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  Complete Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;