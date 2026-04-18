// Mock data for the Pharmacy application

export const medicines = [
  { id: 1, name: 'Aspirin', category: 'Pain Relief', price: 9.99, stock: 150, expiry: '2025-12-31', manufacturer: 'PharmaCo' },
  { id: 2, name: 'Vitamin C', category: 'Supplements', price: 12.99, stock: 80, expiry: '2025-06-30', manufacturer: 'Vitapharm' },
  { id: 3, name: 'Amoxicillin', category: 'Antibiotics', price: 24.99, stock: 45, expiry: '2025-03-31', manufacturer: 'MediCorp' },
  { id: 4, name: 'Ibuprofen', category: 'Pain Relief', price: 11.99, stock: 120, expiry: '2025-09-30', manufacturer: 'PainAway' },
  { id: 5, name: 'Paracetamol', category: 'Pain Relief', price: 8.99, stock: 200, expiry: '2026-01-31', manufacturer: 'MediCorp' },
  { id: 6, name: 'Lisinopril', category: 'Chronic Care', price: 35.99, stock: 75, expiry: '2025-08-15', manufacturer: 'HealthPharm' },
  { id: 7, name: 'Metformin', category: 'Chronic Care', price: 28.50, stock: 60, expiry: '2025-11-20', manufacturer: 'DiabeCare' },
  { id: 8, name: 'Cetirizine', category: 'Allergies', price: 15.99, stock: 90, expiry: '2025-07-10', manufacturer: 'AllergyRelief' },
  { id: 9, name: 'Omeprazole', category: 'Digestive', price: 22.99, stock: 55, expiry: '2025-04-25', manufacturer: 'GastroCare' },
  { id: 10, name: 'Azithromycin', category: 'Antibiotics', price: 45.00, stock: 25, expiry: '2025-05-30', manufacturer: 'PharmaCo' },
  // Expiring Soon - within 60 days
  { id: 11, name: 'Panadol Extra', category: 'Pain Relief', price: 18.99, stock: 65, expiry: '2025-02-15', manufacturer: 'GSK' },
  { id: 12, name: 'Voltaren', category: 'Pain Relief', price: 32.50, stock: 40, expiry: '2025-02-20', manufacturer: 'Novartis' },
  { id: 13, name: 'Augmentin', category: 'Antibiotics', price: 55.00, stock: 30, expiry: '2025-02-28', manufacturer: 'GSK' },
  { id: 14, name: 'Zyrtec', category: 'Allergies', price: 24.99, stock: 85, expiry: '2025-03-05', manufacturer: 'Pfizer' },
  { id: 15, name: 'Dolo', category: 'Pain Relief', price: 12.50, stock: 100, expiry: '2025-03-10', manufacturer: 'MediCorp' },
  // Low stock items
  { id: 16, name: 'Nurofen', category: 'Pain Relief', price: 28.99, stock: 15, expiry: '2025-12-01', manufacturer: 'Reckitt' },
  { id: 17, name: 'Ventolin', category: 'Respiratory', price: 45.00, stock: 12, expiry: '2025-11-15', manufacturer: 'GSK' },
  { id: 18, name: 'Glucophage', category: 'Chronic Care', price: 38.50, stock: 20, expiry: '2026-01-20', manufacturer: 'Merck' },
];

export const customers = [
  { id: 1, name: 'Doha', email: 'doha@example.com', phone: '555-0101', totalPurchases: 5 },
  { id: 2, name: 'Waleed', email: 'waleed@example.com', phone: '555-0102', totalPurchases: 3 },
  { id: 3, name: 'Myrna', email: 'myrna@example.com', phone: '555-0103', totalPurchases: 8 },
  { id: 4, name: 'Ahmed', email: 'ahmed@example.com', phone: '555-0104', totalPurchases: 2 },
  { id: 5, name: 'Maysoun', email: 'maysoun@example.com', phone: '555-0105', totalPurchases: 6 },
  { id: 6, name: 'Hassan', email: 'hassan@example.com', phone: '555-0106', totalPurchases: 4 },
  { id: 7, name: 'Zeina', email: 'zeina@example.com', phone: '555-0107', totalPurchases: 7 },
  { id: 8, name: 'Mohamed', email: 'mohamed@example.com', phone: '555-0108', totalPurchases: 9 },
  { id: 9, name: 'Yasmmin', email: 'yasmmin@example.com', phone: '555-0109', totalPurchases: 1 },
  { id: 10, name: 'Hassan', email: 'hassan2@example.com', phone: '555-0110', totalPurchases: 3 },
];

export const salesData = [
  { month: 'Jan', sales: 4200 },
  { month: 'Feb', sales: 3800 },
  { month: 'Mar', sales: 5100 },
  { month: 'Apr', sales: 4600 },
  { month: 'May', sales: 5800 },
  { month: 'Jun', sales: 6200 },
];

export const topProducts = [
  { name: 'Aspirin', sales: 245, revenue: 2449.55 },
  { name: 'Vitamin C', sales: 189, revenue: 2455.11 },
  { name: 'Ibuprofen', sales: 156, revenue: 1870.44 },
  { name: 'Paracetamol', sales: 142, revenue: 1277.58 },
  { name: 'Amoxicillin', sales: 98, revenue: 2449.02 },
];

export const recentActivities = [
  { id: 1, type: 'sale', description: 'New sale - John Doe', amount: 45.99, time: '5 min ago' },
  { id: 2, type: 'prescription', description: 'Prescription processed', amount: 120.00, time: '15 min ago' },
  { id: 3, type: 'stock', description: 'Stock updated - Aspirin', amount: 0, time: '1 hour ago' },
  { id: 4, type: 'sale', description: 'New sale - Jane Smith', amount: 25.50, time: '2 hours ago' },
  { id: 5, type: 'customer', description: 'New customer registered', amount: 0, time: '3 hours ago' },
];

export const prescriptions = [
  { id: 1, customer: 'John Doe', medication: 'Amoxicillin', dosage: '500mg', status: 'pending', date: '2024-01-15' },
  { id: 2, customer: 'Jane Smith', medication: 'Aspirin', dosage: '100mg', status: 'processed', date: '2024-01-14' },
  { id: 3, customer: 'Bob Johnson', medication: 'Ibuprofen', dosage: '400mg', status: 'pending', date: '2024-01-14' },
];

// Medicine alternatives mapping - key medicine name -> array of alternatives
export const medicineAlternatives = {
  'Amoxicillin 500mg': [
    { name: 'Azithromycin 250mg', reason: 'Same antibiotic class - treats bacterial infections' },
    { name: 'Cetirizine 10mg', reason: 'Different class - for allergies if needed' }
  ],
  'Amoxicillin': [
    { name: 'Azithromycin', reason: 'Same antibiotic class - treats bacterial infections' },
    { name: 'Cetirizine', reason: 'Different class - for allergies if needed' }
  ],
  'Paracetamol 500mg': [
    { name: 'Ibuprofen 400mg', reason: 'Same pain relief effect - anti-inflammatory' },
    { name: 'Aspirin', reason: 'Alternative pain reliever - check for allergies' }
  ],
  'Paracetamol': [
    { name: 'Ibuprofen', reason: 'Same pain relief effect - anti-inflammatory' },
    { name: 'Aspirin', reason: 'Alternative pain reliever - check for allergies' }
  ],
  'Lisinopril 10mg': [
    { name: 'Metformin 500mg', reason: 'Different class - consult doctor for alternatives' }
  ],
  'Lisinopril': [
    { name: 'Metformin', reason: 'Different class - consult doctor for alternatives' }
  ],
  'Metformin 500mg': [
    { name: 'Lisinopril 10mg', reason: 'Different class - consult doctor for alternatives' }
  ],
  'Metformin': [
    { name: 'Lisinopril', reason: 'Different class - consult doctor for alternatives' }
  ],
  'Ibuprofen 400mg': [
    { name: 'Paracetamol 500mg', reason: 'Same pain relief effect' },
    { name: 'Aspirin', reason: 'Alternative anti-inflammatory' }
  ],
  'Ibuprofen': [
    { name: 'Paracetamol', reason: 'Same pain relief effect' },
    { name: 'Aspirin', reason: 'Alternative anti-inflammatory' }
  ],
  'Azithromycin 250mg': [
    { name: 'Amoxicillin 500mg', reason: 'Same antibiotic class' }
  ],
  'Azithromycin': [
    { name: 'Amoxicillin', reason: 'Same antibiotic class' }
  ],
  'Omeprazole 20mg': [
    { name: 'Cetirizine 10mg', reason: 'Different class - consult doctor' }
  ],
  'Omeprazole': [
    { name: 'Cetirizine', reason: 'Different class - consult doctor' }
  ],
  'Cetirizine 10mg': [
    { name: 'Azithromycin 250mg', reason: 'Different class - for infections if needed' }
  ],
  'Cetirizine': [
    { name: 'Azithromycin', reason: 'Different class - for infections if needed' }
  ],
  'Aspirin': [
    { name: 'Paracetamol', reason: 'Alternative pain reliever' },
    { name: 'Ibuprofen', reason: 'Alternative anti-inflammatory' }
  ],
  'Vitamin C': [
    { name: 'Cetirizine', reason: 'Different - for allergies' },
    { name: 'Aspirin', reason: 'Alternative for pain/fever' }
  ]
};

// Drug categories and therapeutic effects
export const drugInfo = {
  'Amoxicillin 500mg': { category: 'Antibiotics', effect: 'Treats bacterial infections', dosage: '500mg' },
  'Paracetamol 500mg': { category: 'Pain Relief', effect: 'Pain and fever reducer', dosage: '500mg' },
  'Lisinopril 10mg': { category: 'Chronic Care', effect: 'Blood pressure medication', dosage: '10mg' },
  'Metformin 500mg': { category: 'Chronic Care', effect: 'Diabetes management', dosage: '500mg' },
  'Ibuprofen 400mg': { category: 'Pain Relief', effect: 'Anti-inflammatory pain reliever', dosage: '400mg' },
  'Cetirizine 10mg': { category: 'Allergies', effect: 'Antihistamine for allergies', dosage: '10mg' },
  'Azithromycin 250mg': { category: 'Antibiotics', effect: 'Treats respiratory infections', dosage: '250mg' },
  'Omeprazole 20mg': { category: 'Digestive', effect: 'Acid reducer for GERD', dosage: '20mg' }
};

export const stockAlerts = [
  { id: 1, medicine: 'Amoxicillin', currentStock: 45, minStock: 50, severity: 'warning' },
  { id: 2, medicine: 'Vitamin C', currentStock: 80, minStock: 30, severity: 'normal' },
  { id: 3, medicine: 'Aspirin', currentStock: 150, minStock: 50, severity: 'normal' },
];

