
import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, Search, User, Trash2, 
  Plus, Minus, CreditCard, Printer, Receipt, Package
} from 'lucide-react';
import Cart from './Cart';
import PaymentModal from './PaymentModal';

const PointOfSale = ({ medicines, customers, onAddSale, onUpdateStock, onNavigate, addNotification }) => {
  const [cart, setCart] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Use medicines from props
  const inventory = medicines || [];

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    return inventory.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    if (addNotification) {
      addNotification(`Added ${product.name} to cart`);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    const item = cart.find(i => i.id === id);
    setCart(cart.filter(item => item.id !== id));
    if (addNotification && item) {
      addNotification(`Removed ${item.name} from cart`);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePayment = (paymentDetails) => {
    const sale = {
      customerId: selectedCustomer?.id,
      customer: selectedCustomer?.name || customer?.name || 'Guest',
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: calculateTotal(),
      tax: calculateTotal() * 0.14,
      total: calculateTotal() * 1.14,
      paymentMethod: paymentDetails.method,
      date: new Date().toISOString().split('T')[0]
    };
    
    if (onAddSale) {
      onAddSale(sale);
    }
    
    // Clear cart
    setCart([]);
    setCustomer(null);
    setSelectedCustomer(null);
    setShowPayment(false);
    
    if (addNotification) {
      addNotification(`Sale completed! Total: EGP ${sale.total.toFixed(2)}`);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Point of Sale
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Process sales and manage transactions
          </p>
        </div>
      </div>

      <div className="flex-1 flex gap-6">
        {/* Products Section */}
        <div className="flex-1">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="card cursor-pointer hover-lift"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">Stock: {product.stock} units</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      EGP {product.price.toFixed(2)}
                    </span>
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96">
          <Cart
            cart={cart}
            customer={customer}
            setCustomer={setCustomer}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            calculateTotal={calculateTotal}
            onCheckout={() => setShowPayment(true)}
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
          />
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={calculateTotal() * 1.14}
          cart={cart}
          customer={selectedCustomer || customer}
          onClose={() => setShowPayment(false)}
          onPayment={handlePayment}
        />
      )}
    </div>
  );
};

export default PointOfSale;

