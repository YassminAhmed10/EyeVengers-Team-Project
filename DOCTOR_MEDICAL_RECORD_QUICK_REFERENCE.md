# 🏥 Doctor Medical Record - Quick Implementation

**Copy & Paste Ready Code**

---

## 📍 File Locations

- Component: `radiology-center-frontend/src/components/DoctorMedicalRecord.jsx`
- Styles: `radiology-center-frontend/src/components/DoctorMedicalRecord.css`
- Integration: `radiology-center-frontend/src/pages/DoctorDashboard.jsx`

---

## 🚀 Quick Setup

### Option 1: Standalone Route

Add to your router configuration:

```javascript
// src/router.jsx or App.jsx
import DoctorMedicalRecord from './components/DoctorMedicalRecord';

const routes = [
  {
    path: '/doctor/patient/:patientId/medical-record',
    element: <DoctorMedicalRecord />,
    requiresAuth: true
  }
];
```

### Option 2: Doctor Dashboard Tab

Integrate into existing dashboard:

```javascript
// src/pages/DoctorDashboard.jsx
import React, { useState } from 'react';
import DoctorMedicalRecord from '../components/DoctorMedicalRecord';

export default function DoctorDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const { patientId } = useParams();

  return (
    <div className="doctor-dashboard">
      {activeView === 'medical-record' && (
        <DoctorMedicalRecord patientId={patientId} doctorName="Dr. Name" />
      )}
      {/* Other views */}
    </div>
  );
}
```

---

## 📦 With Patient Data Fetching

```javascript
import React, { useState, useEffect } from 'react';
import DoctorMedicalRecord from '../components/DoctorMedicalRecord';
import axios from 'axios';

export default function PatientMedicalRecordPage({ patientId }) {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axios.get(`/api/patients/${patientId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPatientData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DoctorMedicalRecord
      patient={patientData}
      patientId={patientId}
      doctorName="Dr. Ahmed Mohar"
    />
  );
}
```

---

## 🔌 With Investigation Modal Integration

```javascript
import React, { useState } from 'react';
import DoctorMedicalRecord from '../components/DoctorMedicalRecord';
import InvestigationsRadiologyModal from '../components/InvestigationsRadiologyModal';

export default function EnhancedMedicalRecord({ patientId }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedInvestigations, setSelectedInvestigations] = useState([]);

  const handleOpenModal = (investigations) => {
    setSelectedInvestigations(investigations);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInvestigations([]);
  };

  return (
    <>
      <DoctorMedicalRecord
        patientId={patientId}
        onSendInvestigations={handleOpenModal}
      />
      <InvestigationsRadiologyModal
        isOpen={showModal}
        onClose={handleCloseModal}
        patientId={patientId}
        investigations={selectedInvestigations}
      />
    </>
  );
}
```

---

## 🎨 Updated Component (With Modal Integration)

Replace the investigation button handler in `DoctorMedicalRecord.jsx`:

```javascript
// At the top of the component
const [showRadiologyModal, setShowRadiologyModal] = useState(false);

// In the investigations tab, update the button:
<button
  className="send-radiology-btn"
  onClick={() => {
    if (selectedInvestigations.length > 0) {
      setShowRadiologyModal(true);
    }
  }}
  disabled={selectedInvestigations.length === 0}
  title="Select at least one investigation"
>
  📤 Send to Radiology Center ({selectedInvestigations.length})
</button>

// Add this after the close of medical record div:
{showRadiologyModal && (
  <InvestigationsRadiologyModal
    patientId={patientId}
    isOpen={showRadiologyModal}
    onClose={() => setShowRadiologyModal(false)}
    doctorName={doctorName}
    selectedInvestigations={selectedInvestigations}
    onSuccess={() => {
      clearInvestigations();
      setShowRadiologyModal(false);
    }}
  />
)}
```

---

## 🔗 API Endpoints Reference

### Fetch Patient Data
```
GET /api/patients/{patientId}
Authorization: Bearer {token}

Response:
{
  "id": 1,
  "name": "Ahmed Mohar",
  "age": 41,
  "email": "ahmed@email.com",
  "phone": "01012345678",
  "address": "12 El Gomhoria St, Cairo",
  "nationalId": "28503151234556",
  "dateOfBirth": "1985-03-15",
  "insurance": { ... },
  "emergencyContact": { ... }
}
```

### Send Investigations
```
POST /api/investigationsradiology/send-multiple
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "patientId": 1,
  "investigations": [
    {
      "type": "MRI",
      "clinicalIndication": "Suspected brain tumor",
      "priority": "Urgent",
      "notes": "Patient reports frequent headaches"
    }
  ],
  "referringDoctorName": "Dr. Ahmed Mohar"
}

Response:
{
  "success": true,
  "message": "1 investigation(s) sent successfully",
  "data": { ... }
}
```

---

## 🎯 Common Modifications

### Disable Specific Tabs
```javascript
const visibleTabs = tabs.filter(tab => 
  ['patient-info', 'investigations'].includes(tab.id)
);
```

### Add Custom Investigation Types
```javascript
const investigationTypes = [
  // Built-in types
  ...builtInTypes,
  // Custom types for your clinic
  { id: 'Custom1', label: 'Custom Investigation' }
];
```

### Change Color Scheme
```css
/* In DoctorMedicalRecord.css */
:root {
  --primary: #0f3460;
  --secondary: #28a745;
  --danger: #dc3545;
}
```

### Add Loading States
```javascript
const [sendingInvestigations, setSendingInvestigations] = useState(false);

<button
  className="send-radiology-btn"
  onClick={handleSend}
  disabled={selectedInvestigations.length === 0 || sendingInvestigations}
>
  {sendingInvestigations ? '⏳ Sending...' : '📤 Send to Radiology Center'}
</button>
```

---

## ✅ Validation Checklist

Before deploying, verify:

- [ ] Component imports correctly
- [ ] CSS file is imported
- [ ] Patient data loads from API
- [ ] Investigation selection works
- [ ] Send button is disabled when no investigations selected
- [ ] Modal opens on send button click
- [ ] All tabs render without errors
- [ ] Responsive design works on mobile
- [ ] API calls use correct endpoints
- [ ] Error handling is in place
- [ ] Loading states are shown
- [ ] Success messages display

---

## 🚨 Error Handling Template

```javascript
const handleSendInvestigations = async () => {
  try {
    setSendingInvestigations(true);
    
    const response = await axios.post(
      '/api/investigationsradiology/send-multiple',
      {
        patientId,
        investigations: selectedInvestigations.map(id => ({
          type: id,
          clinicalIndication: clinicalIndication,
          priority: priority
        })),
        referringDoctorName: doctorName
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.data.success) {
      showSuccessNotification('Investigations sent successfully!');
      clearInvestigations();
    } else {
      showErrorNotification(response.data.message);
    }
  } catch (error) {
    console.error('Error sending investigations:', error);
    showErrorNotification('Failed to send investigations. Please try again.');
  } finally {
    setSendingInvestigations(false);
  }
};
```

---

## 📱 Mobile Optimization

The component is responsive by default. For additional mobile tweaks:

```css
@media (max-width: 768px) {
  .record-container {
    flex-direction: column;
  }

  .tabs-sidebar {
    max-height: 80px;
    border-bottom: 1px solid #e0e0e0;
  }

  .tabs-nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .investigations-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-buttons {
    flex-direction: column;
  }
}
```

---

## 🎓 Learning Resources

- Component Location: `radiology-center-frontend/src/components/`
- Integration Guide: `DOCTOR_MEDICAL_RECORD_INTEGRATION_GUIDE.md`
- API Reference: `RADIOLOGY_CENTER_API_REFERENCE.md`
- Investigation Workflow: `SEND_INVESTIGATIONS_TO_RADIOLOGY_GUIDE.md`

---

**Quick Start**: Copy DoctorMedicalRecord.jsx and DoctorMedicalRecord.css to your components folder, import, and integrate into your routing!
