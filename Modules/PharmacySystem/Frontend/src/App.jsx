
import React, { useState, useEffect, useCallback } from 'react';
import TopNavbar from './components/layout/TopNavbar.jsx';
import Header from './components/layout/Header.jsx';
import Dashboard from './Dashboard/Dashboard.jsx';
import InventoryManagement from './Inventory/InventoryManagement.jsx';
import PrescriptionProcessing from './Prescriptions/PrescriptionProcessing.jsx';
import PointOfSale from './Sales/PointOfSale.jsx';
import CustomerManagement from './Customers/CustomerManagement.jsx';
import ReportsAnalytics from './Reports/ReportsAnalytics.jsx';
import Settings from './Settings/Settings.jsx';
import Footer from './components/layout/Footer.jsx';
import { LanguageProvider } from './i18n/LanguageContext.jsx';
import AuthPage from './Auth/AuthPage.jsx';
import ClientPortal from './Client/ClientPortal.jsx';

// Initial data
const initialMedicines = [
  { id: 1, name: 'Amoxicillin 500mg', category: 'Antibiotics', stock: 150, price: 85.00, expiry: '2025-12-31', manufacturer: 'PharmaCo', status: 'In Stock', description: '', dosage: '500mg', batchNumber: 'BATCH-001', location: 'Shelf A-1' },
  { id: 2, name: 'Paracetamol 500mg', category: 'Pain Relief', stock: 45, price: 15.00, expiry: '2025-06-30', manufacturer: 'MediCorp', status: 'Low Stock', description: '', dosage: '500mg', batchNumber: 'BATCH-002', location: 'Shelf A-2' },
  { id: 3, name: 'Lisinopril 10mg', category: 'Chronic Care', stock: 200, price: 120.00, expiry: '2025-10-15', manufacturer: 'HealthPharm', status: 'In Stock', description: '', dosage: '10mg', batchNumber: 'BATCH-003', location: 'Shelf B-1' },
  { id: 4, name: 'Metformin 500mg', category: 'Chronic Care', stock: 12, price: 95.00, expiry: '2025-02-20', manufacturer: 'DiabeCare', status: 'Critical', description: '', dosage: '500mg', batchNumber: 'BATCH-004', location: 'Shelf B-2' },
  { id: 5, name: 'Ibuprofen 400mg', category: 'Pain Relief', stock: 85, price: 25.00, expiry: '2025-03-10', manufacturer: 'PainAway', status: 'In Stock', description: '', dosage: '400mg', batchNumber: 'BATCH-005', location: 'Shelf A-3' },
  { id: 6, name: 'Cetirizine 10mg', category: 'Supplements', stock: 200, price: 35.00, expiry: '2025-08-15', manufacturer: 'Vitapharm', status: 'In Stock', description: '', dosage: '10mg', batchNumber: 'BATCH-006', location: 'Shelf C-1' },
  { id: 7, name: 'Azithromycin 250mg', category: 'Antibiotics', stock: 25, price: 145.00, expiry: '2025-04-01', manufacturer: 'PharmaCo', status: 'Low Stock', description: '', dosage: '250mg', batchNumber: 'BATCH-007', location: 'Shelf A-4' },
  { id: 8, name: 'Omeprazole 20mg', category: 'Digestive', stock: 8, price: 110.00, expiry: '2025-01-15', manufacturer: 'GastroCare', status: 'Critical', description: '', dosage: '20mg', batchNumber: 'BATCH-008', location: 'Shelf D-1' }
];

const initialCustomers = [
  { id: 1, name: 'Doha Ahmed', email: 'doha@example.com', phone: '01012345678', totalPurchases: 5, joinDate: '2024-01-01' },
  { id: 2, name: 'Waleed Mohamed', email: 'waleed@example.com', phone: '01023456789', totalPurchases: 3, joinDate: '2024-01-15' },
  { id: 3, name: 'Myrna Samir', email: 'myrna@example.com', phone: '01034567890', totalPurchases: 8, joinDate: '2024-02-01' },
  { id: 4, name: 'Ahmed Hassan', email: 'ahmed@example.com', phone: '01045678901', totalPurchases: 2, joinDate: '2024-02-15' },
  { id: 5, name: 'Maysoun Ali', email: 'maysoun@example.com', phone: '01056789012', totalPurchases: 6, joinDate: '2024-03-01' }
];

// Prescription categories
export const prescriptionCategories = [
  { id: 'chronic', name: 'Chronic (أمراض مزمنة)', color: 'bg-violet-100 text-violet-700' },
  { id: 'antibiotics', name: 'Antibiotics (مضادات حيوية)', color: 'bg-blue-100 text-blue-700' },
  { id: 'pain', name: 'Pain Relief (تسكين الألم)', color: 'bg-red-100 text-red-700' },
  { id: 'supplements', name: 'Supplements (مكملات)', color: 'bg-amber-100 text-amber-700' },
  { id: 'allergies', name: 'Allergies (حساسية)', color: 'bg-green-100 text-green-700' },
  { id: 'digestive', name: 'Digestive (هضمي)', color: 'bg-cyan-100 text-cyan-700' },
];

const initialPrescriptions = [
  { id: 'RX-001', patient: 'Ahmed Hassan', patientId: 'P-1001', phone: '01045678901', doctor: 'Dr. Sarah Ahmed', date: '2024-01-15', medicines: [{ name: 'Amoxicillin 500mg', dosage: '1 capsule 3x daily', quantity: 21 }], status: 'pending', total: 85.00, category: 'antibiotics' },
  { id: 'RX-002', patient: 'Sarah Mohamed', patientId: 'P-1002', phone: '01098765432', doctor: 'Dr. Mohamed Ali', date: '2024-01-14', medicines: [{ name: 'Cetirizine 10mg', dosage: '1 tablet daily', quantity: 10 }], status: 'completed', total: 35.00, category: 'allergies' },
  { id: 'RX-003', patient: 'Omar Khaled', patientId: 'P-1003', phone: '01087654321', doctor: 'Dr. Noha Said', date: '2024-01-14', medicines: [{ name: 'Metformin 500mg', dosage: '1 tablet twice daily', quantity: 60 }], status: 'pending', total: 190.00, category: 'chronic' },
  { id: 'RX-004', patient: 'Doha Ahmed', patientId: 'P-1004', phone: '01011223344', doctor: 'Dr. Ahmed Samir', date: '2024-01-15', medicines: [{ name: 'Ibuprofen 400mg', dosage: '1 tablet when needed', quantity: 20 }], status: 'processing', total: 50.00, category: 'pain' },
  { id: 'RX-005', patient: 'Waleed Mohamed', patientId: 'P-1005', phone: '01055667788', doctor: 'Dr. Fatima Ali', date: '2024-01-15', medicines: [{ name: 'Vitamin C 1000mg', dosage: '1 tablet daily', quantity: 30 }], status: 'completed', total: 120.00, category: 'supplements' },
  { id: 'RX-006', patient: 'Myrna Samir', patientId: 'P-1006', phone: '01099887766', doctor: 'Dr. Hany Mahmoud', date: '2024-01-13', medicines: [{ name: 'Omeprazole 20mg', dosage: '1 tablet before breakfast', quantity: 30 }], status: 'pending', total: 330.00, category: 'digestive' }
];

// Enhanced sample sales data spanning multiple months for better analytics
const initialSales = [
  // August 2024
  { id: 1, date: '2024-08-01', items: [{ name: 'Paracetamol 500mg', quantity: 3, price: 15 }, { name: 'Aspirin 500mg', quantity: 2, price: 12 }], total: 69, customer: 'Ahmed Hassan', paymentMethod: 'cash' },
  { id: 2, date: '2024-08-02', items: [{ name: 'Amoxicillin 500mg', quantity: 1, price: 85 }], total: 85, customer: 'Sarah Mohamed', paymentMethod: 'card' },
  { id: 3, date: '2024-08-05', items: [{ name: 'Ibuprofen 400mg', quantity: 2, price: 25 }, { name: 'Cetirizine 10mg', quantity: 1, price: 35 }], total: 85, customer: 'Omar Khaled', paymentMethod: 'cash' },
  { id: 4, date: '2024-08-10', items: [{ name: 'Metformin 500mg', quantity: 2, price: 95 }], total: 190, customer: 'Doha Ahmed', paymentMethod: 'card' },
  { id: 5, date: '2024-08-15', items: [{ name: 'Vitamin C 1000mg', quantity: 3, price: 40 }], total: 120, customer: 'Waleed Mohamed', paymentMethod: 'cash' },
  { id: 6, date: '2024-08-20', items: [{ name: 'Lisinopril 10mg', quantity: 1, price: 120 }], total: 120, customer: 'Myrna Samir', paymentMethod: 'card' },
  { id: 7, date: '2024-08-25', items: [{ name: 'Omeprazole 20mg', quantity: 1, price: 110 }, { name: 'Paracetamol 500mg', quantity: 2, price: 15 }], total: 140, customer: 'Ahmed Hassan', paymentMethod: 'cash' },
  
  // September 2024
  { id: 8, date: '2024-09-01', items: [{ name: 'Amoxicillin 500mg', quantity: 2, price: 85 }], total: 170, customer: 'Maysoun Ali', paymentMethod: 'card' },
  { id: 9, date: '2024-09-05', items: [{ name: 'Ibuprofen 400mg', quantity: 3, price: 25 }], total: 75, customer: 'Tarek', paymentMethod: 'cash' },
  { id: 10, date: '2024-09-10', items: [{ name: 'Cetirizine 10mg', quantity: 2, price: 35 }, { name: 'Vitamin C 1000mg', quantity: 1, price: 40 }], total: 110, customer: 'Nadia', paymentMethod: 'card' },
  { id: 11, date: '2024-09-15', items: [{ name: 'Paracetamol 500mg', quantity: 5, price: 15 }], total: 75, customer: 'Yousef', paymentMethod: 'cash' },
  { id: 12, date: '2024-09-20', items: [{ name: 'Metformin 500mg', quantity: 1, price: 95 }, { name: 'Lisinopril 10mg', quantity: 1, price: 120 }], total: 215, customer: 'Hanan', paymentMethod: 'card' },
  { id: 13, date: '2024-09-25', items: [{ name: 'Azithromycin 250mg', quantity: 1, price: 145 }], total: 145, customer: 'Rami', paymentMethod: 'cash' },
  
  // October 2024
  { id: 14, date: '2024-10-01', items: [{ name: 'Aspirin 500mg', quantity: 4, price: 12 }], total: 48, customer: 'Lina', paymentMethod: 'cash' },
  { id: 15, date: '2024-10-05', items: [{ name: 'Amoxicillin 500mg', quantity: 1, price: 85 }, { name: 'Paracetamol 500mg', quantity: 2, price: 15 }], total: 115, customer: 'Sara', paymentMethod: 'card' },
  { id: 16, date: '2024-10-10', items: [{ name: 'Ibuprofen 400mg', quantity: 2, price: 25 }, { name: 'Cetirizine 10mg', quantity: 1, price: 35 }], total: 85, customer: 'Khalid', paymentMethod: 'cash' },
  { id: 17, date: '2024-10-15', items: [{ name: 'Vitamin C 1000mg', quantity: 2, price: 40 }], total: 80, customer: 'Mona', paymentMethod: 'card' },
  { id: 18, date: '2024-10-20', items: [{ name: 'Metformin 500mg', quantity: 2, price: 95 }], total: 190, customer: 'Fadi', paymentMethod: 'cash' },
  { id: 19, date: '2024-10-25', items: [{ name: 'Omeprazole 20mg', quantity: 1, price: 110 }, { name: 'Lisinopril 10mg', quantity: 1, price: 120 }], total: 230, customer: 'Rania', paymentMethod: 'card' },
  
  // November 2024
  { id: 20, date: '2024-11-01', items: [{ name: 'Paracetamol 500mg', quantity: 4, price: 15 }], total: 60, customer: 'Hossam', paymentMethod: 'cash' },
  { id: 21, date: '2024-11-05', items: [{ name: 'Amoxicillin 500mg', quantity: 2, price: 85 }], total: 170, customer: 'Dina', paymentMethod: 'card' },
  { id: 22, date: '2024-11-10', items: [{ name: 'Ibuprofen 400mg', quantity: 1, price: 25 }, { name: 'Aspirin 500mg', quantity: 3, price: 12 }], total: 61, customer: 'Amir', paymentMethod: 'cash' },
  { id: 23, date: '2024-11-15', items: [{ name: 'Cetirizine 10mg', quantity: 2, price: 35 }, { name: 'Vitamin C 1000mg', quantity: 1, price: 40 }], total: 110, customer: 'Layla', paymentMethod: 'card' },
  { id: 24, date: '2024-11-20', items: [{ name: 'Azithromycin 250mg', quantity: 1, price: 145 }, { name: 'Paracetamol 500mg', quantity: 2, price: 15 }], total: 175, customer: 'Basel', paymentMethod: 'cash' },
  { id: 25, date: '2024-11-25', items: [{ name: 'Lisinopril 10mg', quantity: 2, price: 120 }], total: 240, customer: 'Samia', paymentMethod: 'card' },
  
  // December 2024
  { id: 26, date: '2024-12-01', items: [{ name: 'Metformin 500mg', quantity: 1, price: 95 }, { name: 'Vitamin C 1000mg', quantity: 2, price: 40 }], total: 175, customer: 'Tariq', paymentMethod: 'cash' },
  { id: 27, date: '2024-12-05', items: [{ name: 'Amoxicillin 500mg', quantity: 3, price: 85 }], total: 255, customer: 'Noor', paymentMethod: 'card' },
  { id: 28, date: '2024-12-10', items: [{ name: 'Ibuprofen 400mg', quantity: 4, price: 25 }], total: 100, customer: 'Ziad', paymentMethod: 'cash' },
  { id: 29, date: '2024-12-15', items: [{ name: 'Paracetamol 500mg', quantity: 6, price: 15 }, { name: 'Cetirizine 10mg', quantity: 1, price: 35 }], total: 125, customer: 'Jana', paymentMethod: 'card' },
  { id: 30, date: '2024-12-20', items: [{ name: 'Omeprazole 20mg', quantity: 2, price: 110 }], total: 220, customer: 'Omar', paymentMethod: 'cash' },
  { id: 31, date: '2024-12-25', items: [{ name: 'Aspirin 500mg', quantity: 5, price: 12 }, { name: 'Vitamin C 1000mg', quantity: 3, price: 40 }], total: 180, customer: 'Leen', paymentMethod: 'card' },
  
  // January 2025
  { id: 32, date: '2025-01-01', items: [{ name: 'Amoxicillin 500mg', quantity: 2, price: 85 }, { name: 'Paracetamol 500mg', quantity: 3, price: 15 }], total: 235, customer: 'Mazen', paymentMethod: 'cash' },
  { id: 33, date: '2025-01-05', items: [{ name: 'Lisinopril 10mg', quantity: 1, price: 120 }], total: 120, customer: 'Salma', paymentMethod: 'card' },
  { id: 34, date: '2025-01-10', items: [{ name: 'Ibuprofen 400mg', quantity: 2, price: 25 }, { name: 'Cetirizine 10mg', quantity: 2, price: 35 }], total: 120, customer: 'Adel', paymentMethod: 'cash' },
  { id: 35, date: '2025-01-15', items: [{ name: 'Paracetamol 500mg', quantity: 2, price: 15 }, { name: 'Aspirin 500mg', quantity: 1, price: 12 }], total: 42, customer: 'Ahmed', paymentMethod: 'cash' },
  { id: 36, date: '2025-01-15', items: [{ name: 'Ibuprofen 400mg', quantity: 1, price: 25 }], total: 25, customer: 'Doha', paymentMethod: 'card' },
  { id: 37, date: '2025-01-14', items: [{ name: 'Cetirizine 10mg', quantity: 1, price: 35 }], total: 35, customer: 'Waleed', paymentMethod: 'cash' }
];

const STORAGE_KEYS = {
  users: 'pharmaflow-users',
  session: 'pharmaflow-session',
  clientProducts: 'pharmaflow-client-products',
  clientCategories: 'pharmaflow-client-categories',
  clientPurchases: 'pharmaflow-client-purchases',
};

const defaultUsers = [
  { email: 'pharmacist@pharmaflow.com', password: '123456', role: 'pharmacist', name: 'Doha' },
  { email: 'client@pharmaflow.com', password: '123456', role: 'client', name: 'Client' },
];

const defaultClientCategories = ['Medicine', 'Skin Care', 'Hair Care'];

const defaultClientProducts = [
  { id: 1, name: 'Daily Pain Relief', category: 'Medicine', price: 35, stock: 50, description: 'Fast relief for everyday pain.' },
  { id: 2, name: 'Hydra Cleanse Face Wash', category: 'Skin Care', price: 120, stock: 32, description: 'Gentle cleanser for daily use.' },
  { id: 3, name: 'Repair Hair Serum', category: 'Hair Care', price: 145, stock: 18, description: 'Smooth and strengthen hair.' },
  { id: 4, name: 'Vitamin C Tablets', category: 'Medicine', price: 55, stock: 48, description: 'Daily immune support.' },
  { id: 5, name: 'Soothing Moisturizer', category: 'Skin Care', price: 98, stock: 24, description: 'Hydrating skin care cream.' },
  { id: 6, name: 'Nourish Shampoo', category: 'Hair Care', price: 76, stock: 30, description: 'Cleansing shampoo with shine support.' },
];

const loadJSON = (key, fallback) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    return fallback;
  }
};

const saveJSON = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => loadJSON(STORAGE_KEYS.session, null));
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const savedUsers = loadJSON(STORAGE_KEYS.users, null);
    if (savedUsers && Array.isArray(savedUsers) && savedUsers.length > 0) {
      return savedUsers;
    }
    return defaultUsers;
  });

  // Centralized data state
  const [medicines, setMedicines] = useState(initialMedicines);
  const [customers, setCustomers] = useState(initialCustomers);
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [sales, setSales] = useState(initialSales);
  const [clientProducts, setClientProducts] = useState(() => loadJSON(STORAGE_KEYS.clientProducts, defaultClientProducts));
  const [clientCategories, setClientCategories] = useState(() => loadJSON(STORAGE_KEYS.clientCategories, defaultClientCategories));
  const [clientPurchases, setClientPurchases] = useState(() => loadJSON(STORAGE_KEYS.clientPurchases, []));

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.users, registeredUsers);
  }, [registeredUsers]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.session, currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.clientProducts, clientProducts);
  }, [clientProducts]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.clientCategories, clientCategories);
  }, [clientCategories]);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.clientPurchases, clientPurchases);
  }, [clientPurchases]);

  // Add notification
  const addNotification = useCallback((message) => {
    const newNotif = { id: Date.now(), message, time: 'Just now' };
    setNotifications(prev => [newNotif, ...prev].slice(0, 5));
  }, []);

  const getUserName = useCallback((user) => {
    if (!user) {
      return 'Doha';
    }

    return user.name || user.email?.split('@')[0] || 'User';
  }, []);

  const handleLogin = useCallback(({ email, password, role }) => {
    setAuthLoading(true);
    setAuthError('');

    const matchedUser = registeredUsers.find((user) =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password &&
      user.role === role
    );

    if (!matchedUser) {
      setAuthError('Invalid credentials or role.');
      setAuthLoading(false);
      return;
    }

    setCurrentUser(matchedUser);
    setAuthLoading(false);
  }, [registeredUsers]);

  const handleSignUp = useCallback(({ email, password, role }) => {
    setAuthLoading(true);
    setAuthError('');

    const existingUser = registeredUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      setAuthError('An account with this email already exists.');
      setAuthLoading(false);
      return;
    }

    const newUser = {
      email,
      password,
      role,
      name: email.split('@')[0],
    };

    setRegisteredUsers((current) => [...current, newUser]);
    setCurrentUser(newUser);
    setAuthLoading(false);
  }, [registeredUsers]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    setAuthError('');
    setSearchQuery('');
  }, []);

  // Medicine functions
  const addMedicine = useCallback((medicine) => {
    const newMed = { 
      ...medicine, 
      id: medicines.length + 1,
      status: medicine.stock > 50 ? 'In Stock' : medicine.stock > 20 ? 'Low Stock' : 'Critical'
    };
    setMedicines(prev => [...prev, newMed]);
    addNotification(`Added: ${medicine.name}`);
  }, [medicines.length, addNotification]);

  const updateMedicineStock = useCallback((medicineId, quantity, isSale = true) => {
    setMedicines(prev => prev.map(med => {
      if (med.id === medicineId) {
        const newStock = isSale ? med.stock - quantity : med.stock + quantity;
        return { 
          ...med, 
          stock: newStock,
          status: newStock > 50 ? 'In Stock' : newStock > 20 ? 'Low Stock' : 'Critical'
        };
      }
      return med;
    }));
  }, []);

  const deleteMedicine = useCallback((id) => {
    const med = medicines.find(m => m.id === id);
    setMedicines(prev => prev.filter(m => m.id !== id));
    if (med) addNotification(`Deleted: ${med.name}`);
  }, [medicines, addNotification]);

  // Customer functions
  const addCustomer = useCallback((customer) => {
    const newCust = { 
      ...customer, 
      id: customers.length + 1,
      totalPurchases: 0,
      joinDate: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [...prev, newCust]);
    addNotification(`New customer: ${customer.name}`);
  }, [customers.length, addNotification]);

  const updateCustomerPurchases = useCallback((customerId, amount) => {
    setCustomers(prev => prev.map(cust => 
      cust.id === customerId 
        ? { ...cust, totalPurchases: cust.totalPurchases + amount }
        : cust
    ));
  }, []);

  // Prescription functions
  const addPrescription = useCallback((prescription) => {
    // Check if this is a new customer (not selected from existing customers)
    const existingCustomer = customers.find(c => c.name.toLowerCase() === prescription.patientName?.toLowerCase());
    let customerId = prescription.customerId;
    
    if (!existingCustomer && prescription.patientName) {
      // Auto-add new customer
      const newCustomer = {
        name: prescription.patientName,
        email: `${prescription.patientName.toLowerCase().replace(/\s+/g, '.')}@patient.com`,
        phone: prescription.phone || '01000000000',
        totalPurchases: 0,
        joinDate: new Date().toISOString().split('T')[0]
      };
      const newCustId = customers.length + 1;
      const customerWithId = { ...newCustomer, id: newCustId };
      setCustomers(prev => [...prev, customerWithId]);
      customerId = newCustId;
      addNotification(`New customer added: ${prescription.patientName}`);
    }
    
    const newRx = { 
      ...prescription,
      customerId: customerId,
      patient: prescription.patientName, // For backward compatibility
      id: `RX-${String(prescriptions.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setPrescriptions(prev => [newRx, ...prev]);
    addNotification(`New prescription: ${prescription.patientName}`);
  }, [prescriptions.length, customers, addNotification]);

  const updatePrescriptionStatus = useCallback((id, status) => {
    setPrescriptions(prev => prev.map(rx => 
      rx.id === id ? { ...rx, status } : rx
    ));
    addNotification(`Prescription ${id} is now ${status}`);
  }, [addNotification]);

  // Sales functions
  const addSale = useCallback((sale) => {
    const newSale = {
      ...sale,
      id: sales.length + 1,
      date: new Date().toISOString().split('T')[0]
    };
    setSales(prev => [newSale, ...prev]);
    
    // Update medicine stock for each item - use functional update to get latest state
    setMedicines(prevMedicines => {
      return prevMedicines.map(med => {
        const saleItem = sale.items.find(item => item.name === med.name);
        if (saleItem) {
          const newStock = med.stock - saleItem.quantity;
          return { 
            ...med, 
            stock: newStock,
            status: newStock > 50 ? 'In Stock' : newStock > 20 ? 'Low Stock' : 'Critical'
          };
        }
        return med;
      });
    });
    
    // Update customer purchases if customer selected
    if (sale.customerId) {
      updateCustomerPurchases(sale.customerId, sale.total);
    }
    
    addNotification(`Sale completed: EGP ${sale.total}`);
  }, [sales.length, addNotification, updateCustomerPurchases]);

  const clientView = (
    <ClientPortal
      user={currentUser}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      onLogout={handleLogout}
      notifications={notifications}
      addNotification={addNotification}
      products={clientProducts}
      setProducts={setClientProducts}
      categories={clientCategories}
      setCategories={setClientCategories}
      purchases={clientPurchases}
      setPurchases={setClientPurchases}
    />
  );

  const authView = (
    <AuthPage
      onLogin={handleLogin}
      onSignUp={handleSignUp}
      loading={authLoading}
      error={authError}
      demoAccounts={defaultUsers}
    />
  );

  // Render active component with props
  const renderContent = () => {
    const commonProps = {
      medicines,
      customers,
      prescriptions,
      sales,
      onNavigate: setActiveTab,
      addNotification,
      userName: getUserName(currentUser)
    };

    switch(activeTab) {
      case 'dashboard':
        return <Dashboard 
          {...commonProps}
          onNavigate={setActiveTab}
        />;
      case 'inventory':
        return <InventoryManagement 
          {...commonProps}
          onAddMedicine={addMedicine}
          onDeleteMedicine={deleteMedicine}
        />;
      case 'prescriptions':
        return <PrescriptionProcessing 
          {...commonProps}
          onAddPrescription={addPrescription}
          onUpdateStatus={updatePrescriptionStatus}
        />;
      case 'sales':
        return <PointOfSale 
          {...commonProps}
          onAddSale={addSale}
          onUpdateStock={updateMedicineStock}
        />;
      case 'customers':
        return <CustomerManagement 
          {...commonProps}
          onAddCustomer={addCustomer}
        />;
      case 'reports':
        return <ReportsAnalytics 
          {...commonProps}
        />;
      case 'settings':
        return <Settings darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} userRole="Pharmacist" />;
      default:
        return <Dashboard {...commonProps} onNavigate={setActiveTab} />;
    }
  };

  // Get page title
  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      inventory: 'Inventory Management',
      prescriptions: 'Prescription Processing',
      sales: 'Point of Sale',
      customers: 'Customer Management',
      reports: 'Reports & Analytics',
      settings: 'Settings'
    };
    return titles[activeTab] || 'Dashboard';
  };

  if (!currentUser) {
    return (
      <LanguageProvider>
        {authView}
      </LanguageProvider>
    );
  }

  if (currentUser.role === 'client') {
    return (
      <LanguageProvider>
        {clientView}
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        {/* Top Navigation Bar */}
        <TopNavbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          userName={getUserName(currentUser)}
          userRole="Pharmacist"
          onLogout={handleLogout}
        />

        {/* Main Layout */}
        <div className="pt-[84px] min-h-screen flex flex-col transition-all duration-300">
          {/* Header with Search */}
          <Header 
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            notifications={notifications}
            onNavigate={setActiveTab}
            pageTitle={getPageTitle()}
            pageSubtitle={`Welcome back, ${getUserName(currentUser)}. Here's what's happening today.`}
            userName={getUserName(currentUser)}
            userRole="Pharmacist"
            onLogout={handleLogout}
            showSearch={true}
          />

          {/* Main Content with Animation */}
          <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-slate-900">
            <div className="content-wrapper w-full animate-fade-in-up">
              {renderContent()}
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </LanguageProvider>
  );
}

export default App;

