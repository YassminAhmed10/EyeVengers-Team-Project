# Frontend Development Guide

## 📁 Frontend Folder Structure

```
Frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page-level components
│   ├── services/       # API services
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── styles/         # Global styles
│   ├── App.jsx
│   └── index.jsx
├── public/             # Static assets
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 Component Structure

### Pages (`/pages`)
**Purpose**: Full page components

```
AppointmentsPage.jsx
├── PatientSearch
├── AppointmentTable
├── AppointmentModal
└── ActionButtons
```

### Components (`/components`)
**Purpose**: Reusable UI components

**Organization**:
```
/components
├── EMR/               # Medical record components
├── PatientManagement/ # Patient-related components
├── Dashboard/         # Dashboard components
├── Common/           # Reusable utilities
└── Forms/            # Form components
```

### Services (`/services`)
**Purpose**: API communication

```javascript
// appointmentService.js
export const appointmentService = {
  getAll: () => axios.get('/api/appointments'),
  getById: (id) => axios.get(`/api/appointments/${id}`),
  create: (data) => axios.post('/api/appointments', data),
  update: (id, data) => axios.put(`/api/appointments/${id}`, data),
  delete: (id) => axios.delete(`/api/appointments/${id}`)
};
```

### Hooks (`/hooks`)
**Purpose**: Custom React logic

```javascript
// useAppointments.js
export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchAppointments();
  }, []);
  
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return { appointments, loading, error, refetch: fetchAppointments };
}
```

## 🏗️ Component Design Pattern

### Basic Component
```javascript
// components/PatientCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './PatientCard.css';

function PatientCard({ patient, onEdit, onDelete }) {
  return (
    <div className="patient-card">
      <div className="patient-info">
        <h3>{patient.name}</h3>
        <p>ID: {patient.id}</p>
        <p>Gender: {patient.gender}</p>
      </div>
      <div className="patient-actions">
        <button onClick={() => onEdit(patient.id)}>Edit</button>
        <button onClick={() => onDelete(patient.id)}>Delete</button>
      </div>
    </div>
  );
}

PatientCard.propTypes = {
  patient: PropTypes.shape({
    id: PropTypes.number.required,
    name: PropTypes.string.required,
    gender: PropTypes.string
  }).required,
  onEdit: PropTypes.func.required,
  onDelete: PropTypes.func.required
};

export default PatientCard;
```

### Page with Data Fetching
```javascript
// pages/AppointmentsPage.jsx
import React, { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import AppointmentTable from '../components/PatientManagement/AppointmentTable';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function AppointmentsPage() {
  const { appointments, loading, error, refetch } = useAppointments();
  const [filters, setFilters] = useState({});
  
  const filtered = appointments.filter(apt => {
    // Apply filters
    return true;
  });
  
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error">Error: {error}</div>;
  
  return (
    <div className="appointments-page">
      <h1>Appointments</h1>
      <AppointmentTable 
        data={filtered} 
        onRefresh={refetch}
      />
    </div>
  );
}
```

## 🔄 API Service Pattern

### Service Structure
```javascript
// services/apiClient.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle auth error
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Service Implementation
```javascript
// services/medicalRecordService.js
import apiClient from './apiClient';

export const medicalRecordService = {
  getByPatientId: (patientId) => 
    apiClient.get(`/api/medicalrecord/patient/${patientId}`),
    
  getById: (id) => 
    apiClient.get(`/api/medicalrecord/${id}`),
    
  create: (data) => 
    apiClient.post('/api/medicalrecord', data),
    
  update: (id, data) => 
    apiClient.put(`/api/medicalrecord/${id}`, data),
    
  delete: (id) => 
    apiClient.delete(`/api/medicalrecord/${id}`)
};
```

## 🎨 Styling Guide

### Using Tailwind CSS
```javascript
// components/PatientForm.jsx
export default function PatientForm() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Add Patient</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input 
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
```

### CSS Modules
```javascript
// components/PatientCard.jsx
import styles from './PatientCard.module.css';

export default function PatientCard() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Patient Name</h3>
    </div>
  );
}
```

## 🔄 State Management

### Local State (useState)
```javascript
const [patients, setPatients] = useState([]);
const [selectedPatient, setSelectedPatient] = useState(null);
```

### Context API (for global state)
```javascript
// AuthContext.jsx
const AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Usage
export function useAuth() {
  return useContext(AuthContext);
}
```

## 📋 Form Handling

### Basic Form
```javascript
function AppointmentForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="patientId"
        value={formData.patientId}
        onChange={handleChange}
        placeholder="Patient ID"
      />
      <button type="submit">Create Appointment</button>
    </form>
  );
}
```

## 🧪 Best Practices

### Do's ✅
- Use functional components with hooks
- Keep components small and focused
- Use PropTypes or TypeScript
- Extract reusable logic to hooks
- Use environment variables for config
- Handle loading and error states
- Implement error boundaries
- Use semantic HTML

### Don'ts ❌
- Don't put business logic in components
- Don't make API calls in render
- Don't use inline functions in JSX
- Don't ignore error handling
- Don't mix component logic with presentation
- Don't create deeply nested components
- Don't mutate state directly

## 📚 Common Patterns

### Loading State
```javascript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <Component data={data} />;
```

### Conditional Rendering
```javascript
{isEditing && <EditForm />}
{!isEditing && <ViewMode />}
```

### List with Actions
```javascript
<ul>
  {items.map(item => (
    <li key={item.id}>
      <span>{item.name}</span>
      <button onClick={() => onEdit(item.id)}>Edit</button>
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </li>
  ))}
</ul>
```

## 📚 Related Documentation

- [API Documentation](../Documentation/API/Overview.md)
- [Workflows](../Documentation/Workflows/AppointmentFlow.md)
- [Component Library](./Components.md)

---

**Version**: 1.0  
**Last Updated**: April 2026
