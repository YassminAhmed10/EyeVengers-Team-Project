import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Settings, Search, Filter,
  Check, X, DollarSign, Tag, Clock3, ArrowRight, MapPin, Edit3, Plus, Trash2
} from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AppSettings from '../Settings/Settings';
import Notification from '../Common/Notification';

const defaultMenuItems = [
  { id: 'dashboard', labelEn: 'Dashboard', labelAr: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
  { id: 'catalog', labelEn: 'Catalog', labelAr: 'المنتجات', icon: <Package size={20} /> },
  { id: 'cart', labelEn: 'Cart', labelAr: 'السلة', icon: <ShoppingCart size={20} /> },
  { id: 'locations', labelEn: 'Delivery Locations', labelAr: 'عناوين التوصيل', icon: <MapPin size={20} /> },
  { id: 'settings', labelEn: 'Settings', labelAr: 'الإعدادات', icon: <Settings size={20} /> },
];

const colorStyles = {
  blue: { outer: 'bg-blue-50', inner: 'bg-blue-100 text-blue-600' },
  violet: { outer: 'bg-violet-50', inner: 'bg-violet-100 text-violet-600' },
  emerald: { outer: 'bg-emerald-50', inner: 'bg-emerald-100 text-emerald-600' },
  amber: { outer: 'bg-amber-50', inner: 'bg-amber-100 text-amber-600' },
};

const defaultLocations = [
  { id: 1, label: 'Home', address: '12 Nile Street, Cairo', note: 'Apartment 4B', preferred: true },
  { id: 2, label: 'Work', address: '88 Garden City, Cairo', note: 'Front desk reception', preferred: false },
];

const ConfirmModal = ({ total, count, onClose, onConfirm, hasLocation }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 animate-scale-in">
        <h3 className="text-2xl font-black text-slate-900 mb-2">Confirm Purchase</h3>
        <p className="text-slate-500 mb-6">Review the order before payment.</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Items</p>
            <p className="text-2xl font-black text-slate-900">{count}</p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-bold">Total</p>
            <p className="text-2xl font-black text-blue-700">EGP {total.toFixed(2)}</p>
          </div>
        </div>
        {!hasLocation && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 text-sm font-medium mb-6">
            Add a delivery location before completing checkout.
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary"><X size={16} /> Cancel</button>
          <button onClick={onConfirm} disabled={!hasLocation} className="btn btn-primary disabled:opacity-60"><Check size={16} /> Continue</button>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({ total, location, onClose, onPay }) => {
  const [method, setMethod] = useState('cash');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 animate-scale-in">
        <h3 className="text-2xl font-black text-slate-900 mb-2">Proceed to Payment</h3>
        <p className="text-slate-500 mb-6">Choose how you want to pay.</p>
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-5">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Delivery location</p>
          <p className="font-semibold text-slate-900">{location?.label || 'No delivery location selected'}</p>
          <p className="text-sm text-slate-500">{location?.address || 'Add a delivery location before checkout.'}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: 'cash', label: 'Cash' },
            { value: 'card', label: 'Card' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMethod(option.value)}
              className={`rounded-2xl border-2 p-4 font-bold transition-all ${method === option.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-slate-500 font-medium">Total</span>
          <span className="text-2xl font-black text-slate-900">EGP {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary"><X size={16} /> Back</button>
          <button onClick={() => onPay(method)} className="btn btn-primary"><Check size={16} /> Pay Now</button>
        </div>
      </div>
    </div>
  );
};

const ClientPortal = ({
  user,
  darkMode,
  setDarkMode,
  onLogout,
  notifications,
  addNotification,
  products,
  categories,
  purchases,
  setPurchases,
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [deliveryLocations, setDeliveryLocations] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmaflow-client-locations');
      return saved ? JSON.parse(saved) : defaultLocations;
    } catch {
      return defaultLocations;
    }
  });
  const [locationDraft, setLocationDraft] = useState({ label: '', address: '', note: '' });
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('pharmaflow-client-locations', JSON.stringify(deliveryLocations));
  }, [deliveryLocations]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const activeLocation = deliveryLocations.find((location) => location.preferred) || deliveryLocations[0] || null;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const stats = [
    { label: 'Products', value: products.length, icon: Package, color: 'blue' },
    { label: 'Categories', value: categories.length, icon: Tag, color: 'violet' },
    { label: 'Cart Items', value: cart.length, icon: ShoppingCart, color: 'emerald' },
  ];

  const addToCart = (product) => {
    setCart((current) => {
      const exists = current.find((item) => item.id === product.id);
      if (exists) {
        return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, quantity: 1 }];
    });
    addNotification?.(`Added ${product.name} to cart`);
    setToast({ type: 'success', message: `${product.name} added to cart successfully.` });
  };

  const confirmPurchase = () => {
    const order = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      items: cart,
      total: cartTotal,
      customer: user?.email || 'Client',
      location: activeLocation,
      paymentMethod: 'pending',
      status: 'pending',
    };

    setPendingOrder(order);
    setPurchases((current) => [order, ...current]);
    setShowConfirm(false);
    setShowPayment(true);
  };

  const completePayment = (method) => {
    if (pendingOrder) {
      setPurchases((current) => current.map((purchase) => (
        purchase.id === pendingOrder.id
          ? { ...purchase, paymentMethod: method, status: 'completed' }
          : purchase
      )));
    }

    addNotification?.(`Paid by ${method.toUpperCase()}`);
    setCart([]);
    setPendingOrder(null);
    setShowPayment(false);
  };

  const saveLocationDraft = () => {
    const label = locationDraft.label.trim();
    const address = locationDraft.address.trim();

    if (!label || !address) {
      return;
    }

    if (editingLocationId) {
      setDeliveryLocations((current) => current.map((location) => (
        location.id === editingLocationId
          ? { ...location, label, address, note: locationDraft.note.trim() }
          : location
      )));
    } else {
      setDeliveryLocations((current) => [
        ...current,
        {
          id: Date.now(),
          label,
          address,
          note: locationDraft.note.trim(),
          preferred: current.length === 0,
        },
      ]);
    }

    setLocationDraft({ label: '', address: '', note: '' });
    setEditingLocationId(null);
  };

  const editLocation = (location) => {
    setEditingLocationId(location.id);
    setLocationDraft({ label: location.label, address: location.address, note: location.note || '' });
  };

  const deleteLocation = (locationId) => {
    setDeliveryLocations((current) => current.filter((location) => location.id !== locationId));
  };

  const setPreferredLocation = (locationId) => {
    setDeliveryLocations((current) => current.map((location) => ({
      ...location,
      preferred: location.id === locationId,
    })));
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-slate-100 bg-white shadow-sm p-6 sm:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_top_right,rgba(196,181,253,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(125,211,252,0.16),transparent_30%)]" />
        <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-40 w-40 rounded-full bg-cyan-100/70 blur-3xl" />

        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.45fr_0.9fr] items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-blue-600">
              Client Portal
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Welcome back, <span className="text-blue-600">{user?.email?.split('@')[0] || 'Client'}</span>
              </h1>
              <p className="mt-3 max-w-2xl text-slate-500 leading-7">
                Browse products, manage your cart, confirm purchases, and keep delivery locations organized from one clean workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {['Fast checkout', 'Saved locations', 'Smart catalog'].map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { label: 'Products', value: products.length, icon: Package, color: 'blue' },
              { label: 'Categories', value: categories.length, icon: Tag, color: 'violet' },
              { label: 'Cart Items', value: cart.length, icon: ShoppingCart, color: 'emerald' },
            ].map((item) => {
              const Icon = item.icon;
              const styles = colorStyles[item.color] || colorStyles.blue;
              return (
                <div key={item.label} className="group rounded-[1.75rem] border border-slate-100 bg-white/90 p-4 sm:p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className={`w-11 h-11 rounded-2xl ${styles.inner} flex items-center justify-center mb-4`}>
                    <Icon size={22} />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400 mb-1">{item.label}</p>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 break-words">{item.value}</h2>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Product Categories</h3>
                <p className="text-sm text-slate-500 mt-1">A quick overview of the current catalog structure.</p>
              </div>
              <button onClick={() => setActiveTab('catalog')} className="btn btn-secondary shrink-0">
                <ArrowRight size={16} /> Open Catalog
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((category) => {
                const count = products.filter((product) => product.category === category).length;
                return (
                  <div key={category} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400 mb-2">Category</p>
                    <h4 className="text-lg font-black text-slate-900 mb-1">{category}</h4>
                    <p className="text-sm text-slate-500">{count} products</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Recent Purchases</h3>
                <p className="text-sm text-slate-500 mt-1">Local transactions displayed in a clean timeline style.</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>

            <div className="space-y-3">
              {purchases.slice(0, 3).map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 hover:bg-white transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">EGP {purchase.total.toFixed(2)}</p>
                    <p className="text-sm text-slate-500">{purchase.items.length} items • {purchase.date}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-blue-600">Completed</span>
                </div>
              ))}
              {purchases.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500 bg-slate-50/60">
                  No purchases yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-black text-slate-900">Quick Actions</h3>
                <p className="text-sm text-slate-500 mt-1">Jump directly to the feature you need.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-600 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em]">
                Interactive
              </span>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('catalog')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-200 transition-all px-4 py-4 text-left flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Package size={18} />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">View products and categories</p>
                    <p className="text-xs text-slate-500">Browse the latest catalog</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('cart')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-200 transition-all px-4 py-4 text-left flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <ShoppingCart size={18} />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">Add items and checkout</p>
                    <p className="text-xs text-slate-500">Manage cart and confirm purchases</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('locations')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-violet-200 transition-all px-4 py-4 text-left flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">Manage delivery locations</p>
                    <p className="text-xs text-slate-500">Update preferred address quickly</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-amber-200 transition-all px-4 py-4 text-left flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Settings size={18} />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">Open settings</p>
                    <p className="text-xs text-slate-500">Adjust profile and appearance</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Today</h3>
                <p className="text-sm text-slate-500 mt-1">Quick snapshot of the current session.</p>
              </div>
              <Clock3 className="w-8 h-8 text-blue-500" />
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 mb-1">Date</p>
                <p className="font-semibold text-slate-900">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 mb-1">Preferred Location</p>
                <p className="font-semibold text-slate-900">{activeLocation?.label || 'No location selected'}</p>
                <p className="text-xs text-slate-500 mt-1">{activeLocation?.address || 'Add a delivery location from the Locations tab.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCatalog = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Catalog</h2>
          <p className="text-slate-500 mt-1">Search, filter, and browse products. Editing is disabled for client accounts.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input-field pl-11" placeholder="Search products..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </div>
        <div className="flex gap-3">
          <select className="input-field w-56" value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm hover:shadow-xl transition-all">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Package size={22} />
              </div>
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-1">{product.name}</h4>
            <p className="text-sm text-slate-500 mb-3">{product.description}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">{product.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">EGP {product.price.toFixed(2)}</span>
              <button onClick={() => addToCart(product)} className="btn btn-primary"><ShoppingCart size={16} /> Add to Cart</button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-[2rem] border border-dashed border-slate-200 p-10 text-center text-slate-500">No products match the current search and filter.</div>
      )}
    </div>
  );

  const renderCart = () => (
    <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Shopping Cart</h2>
            <p className="text-slate-500 mt-1">Confirm the order, then proceed to payment.</p>
          </div>
          <button onClick={() => setShowConfirm(true)} disabled={cart.length === 0} className="btn btn-primary disabled:opacity-60"><Check size={16} /> Confirm Purchase</button>
        </div>
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">{item.category} • EGP {item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-9 h-9 rounded-lg bg-white border border-slate-200" onClick={() => setCart((current) => current.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: Math.max(1, cartItem.quantity - 1) } : cartItem))}>-</button>
                <span className="font-black text-slate-900 w-6 text-center">{item.quantity}</span>
                <button className="w-9 h-9 rounded-lg bg-white border border-slate-200" onClick={() => setCart((current) => current.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem))}>+</button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">Cart is empty. Add products from the catalog.</div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">Delivery Location</h3>
              <p className="text-sm text-slate-500">Manage where the order should be delivered.</p>
            </div>
            <MapPin className="w-8 h-8 text-blue-500" />
          </div>
          <div className="space-y-3 mb-4">
            {deliveryLocations.map((location) => (
              <div key={location.id} className={`rounded-2xl border p-4 ${location.preferred ? 'border-blue-200 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-900 flex items-center gap-2">
                      {location.label}
                      {location.preferred && <span className="text-[10px] uppercase tracking-widest text-blue-600">Preferred</span>}
                    </p>
                    <p className="text-sm text-slate-500">{location.address}</p>
                    {location.note && <p className="text-xs text-slate-400 mt-1">{location.note}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editLocation(location)} className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600"><Edit3 size={16} /></button>
                    <button onClick={() => deleteLocation(location.id)} className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
                <button onClick={() => setPreferredLocation(location.id)} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Use this location
                </button>
              </div>
            ))}
          </div>
          <div className="grid gap-3">
            <input className="input-field" placeholder="Location label (Home, Work...)" value={locationDraft.label} onChange={(event) => setLocationDraft((current) => ({ ...current, label: event.target.value }))} />
            <input className="input-field" placeholder="Full address" value={locationDraft.address} onChange={(event) => setLocationDraft((current) => ({ ...current, address: event.target.value }))} />
            <input className="input-field" placeholder="Note or delivery instructions" value={locationDraft.note} onChange={(event) => setLocationDraft((current) => ({ ...current, note: event.target.value }))} />
            <button onClick={saveLocationDraft} className="btn btn-primary">
              <Plus size={16} /> {editingLocationId ? 'Update Location' : 'Add Location'}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-200">
          <h3 className="text-xl font-black mb-2">Purchase Summary</h3>
          <p className="text-blue-100 mb-4">Your total updates as items are added or removed.</p>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="text-sm text-blue-100">Total</p>
            <p className="text-3xl font-black">EGP {cartTotal.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {purchases.slice(0, 4).map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-bold text-slate-900">EGP {purchase.total.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{purchase.date}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
            {purchases.length === 0 && <p className="text-sm text-slate-500">No orders yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocations = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Delivery Locations</h2>
            <p className="text-slate-500 mt-1">Add and manage your delivery addresses.</p>
          </div>
          <MapPin className="w-8 h-8 text-blue-500" />
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {deliveryLocations.map((location) => (
            <div key={location.id} className={`rounded-2xl border p-4 ${location.preferred ? 'border-blue-200 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}>
              <p className="font-bold text-slate-900">{location.label}</p>
              <p className="text-sm text-slate-500 mt-1">{location.address}</p>
              {location.note && <p className="text-xs text-slate-400 mt-1">{location.note}</p>}
              <div className="mt-4 flex gap-2 flex-wrap">
                <button onClick={() => editLocation(location)} className="btn btn-secondary"><Edit3 size={16} /> Edit</button>
                <button onClick={() => deleteLocation(location.id)} className="btn btn-secondary text-red-600"><Trash2 size={16} /> Delete</button>
                <button onClick={() => setPreferredLocation(location.id)} className="btn btn-secondary"><Check size={16} /> Preferred</button>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <input className="input-field" placeholder="Location label" value={locationDraft.label} onChange={(event) => setLocationDraft((current) => ({ ...current, label: event.target.value }))} />
          <input className="input-field" placeholder="Full address" value={locationDraft.address} onChange={(event) => setLocationDraft((current) => ({ ...current, address: event.target.value }))} />
          <input className="input-field" placeholder="Instructions" value={locationDraft.note} onChange={(event) => setLocationDraft((current) => ({ ...current, note: event.target.value }))} />
        </div>
        <div className="mt-4 flex justify-end gap-3">
          {editingLocationId && (
            <button onClick={() => { setEditingLocationId(null); setLocationDraft({ label: '', address: '', note: '' }); }} className="btn btn-secondary">Cancel</button>
          )}
          <button onClick={saveLocationDraft} className="btn btn-primary"><Plus size={16} /> {editingLocationId ? 'Update Location' : 'Add Location'}</button>
        </div>
      </div>
    </div>
  );

  const pageTitle = {
    dashboard: 'Client Dashboard',
    catalog: 'Catalog',
    cart: 'Shopping Cart',
    locations: 'Delivery Locations',
    settings: 'Settings',
  }[activeTab];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        menuItems={defaultMenuItems}
        userName={user?.email?.split('@')[0] || 'Client'}
        userRole="Client"
        onLogout={onLogout}
      />

      <div className="pt-[84px] min-h-screen flex flex-col transition-all duration-300">
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          notifications={notifications}
          pageTitle={pageTitle}
          pageSubtitle="Client access is limited to browsing, cart, checkout, and delivery locations."
          userName={user?.email?.split('@')[0] || 'Client'}
          userRole="Client"
          onLogout={onLogout}
          showSearch={false}
        />

        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-slate-900">
          <div className="content-wrapper w-full animate-fade-in-up">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'catalog' && renderCatalog()}
            {activeTab === 'cart' && renderCart()}
            {activeTab === 'locations' && renderLocations()}
            {activeTab === 'settings' && (
              <AppSettings
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onLogout={onLogout}
                userRole="Client"
              />
            )}
          </div>
        </main>

        <Footer />
      </div>

      {showConfirm && (
        <ConfirmModal
          total={cartTotal}
          count={cart.length}
          onClose={() => setShowConfirm(false)}
          onConfirm={confirmPurchase}
          hasLocation={Boolean(activeLocation)}
        />
      )}

      {showPayment && (
        <PaymentModal
          total={cartTotal}
          location={activeLocation}
          onClose={() => setShowPayment(false)}
          onPay={completePayment}
        />
      )}

      {toast && (
        <div className="fixed top-[96px] right-6 z-[1100] w-full max-w-sm">
          <Notification
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ClientPortal;
