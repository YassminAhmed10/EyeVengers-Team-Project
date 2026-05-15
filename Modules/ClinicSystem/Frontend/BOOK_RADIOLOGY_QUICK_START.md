# Quick Start: Adding "Book at Radiology" Button to Clinic System

**For:** Clinic System Developers  
**Time:** ~30 minutes to integrate  
**Complexity:** Low

---

## 🎯 What You Need to Do

Add a "Book at Radiology Center" button to your Doctor Orders page that redirects patients to radiology with their order context.

---

## 📦 Step 1: Get the Utility File

Copy this file to your clinic system frontend:

**From:** `/Modules/RadiologyCenter/Frontend/src/utils/doctorOrderRedirect.js`  
**To:** Your clinic frontend's `src/utils/` folder

---

## 🔧 Step 2: Import & Use

In your Doctor Orders page component:

```javascript
import { buildDoctorOrderRedirectUrl } from '@/utils/doctorOrderRedirect';

function DoctorOrdersPage() {
  const handleBookRadiology = (order) => {
    const url = buildDoctorOrderRedirectUrl({
      radiologyBaseUrl: 'http://localhost:5202',  // Or your production URL
      patient: order.patient,  // { id, name, phone, email, gender, dateOfBirth, nationalId, address }
      doctor: order.doctor,    // { id, name, specialty }
      order: {
        id: order.id,
        date: order.orderDate,
        requestedTest: order.requestedTest,  // e.g., 'OCT', 'MRI'
        notes: order.notes
      },
      clinicName: 'Eye Clinic',  // Your clinic name
      clinicBackUrl: window.location.origin + '/doctor-orders'  // Return URL
    });
    
    window.location.href = url;  // Redirect
  };

  return (
    <button onClick={() => handleBookRadiology(order)}>
      📍 Book at Radiology Center
    </button>
  );
}
```

---

## 📋 Required Data Structure

Make sure your doctor order object has this structure:

```javascript
const order = {
  id: 'ORD001',  // Order ID
  orderDate: '2024-05-13',
  requestedTest: 'OCT',  // Must match radiology system test names:
                         // 'CBC', 'Blood Sugar', 'CT Scan', 'MRI Scan', 'X-Ray', 'OCT',
                         // 'Visual Field Test', 'Ultrasound', 'Corneal Topography',
                         // 'Specular Microscopy', 'ERG', 'EOG', 'Genetic Testing'
  notes: 'Check retina thickness',
  
  patient: {
    id: 'P001',
    name: 'Ahmed Hassan',
    phone: '+20123456789',
    email: 'ahmed@example.com',
    gender: 'M',
    dateOfBirth: '1990-01-15',
    nationalId: '30001011234567',
    address: 'Cairo, Egypt'
  },
  
  doctor: {
    id: 'DOC001',
    name: 'Dr. Fatima Mohamed',
    specialty: 'Ophthalmology'
  }
};
```

---

## 🎨 Optional: Create Reusable Button Component

For cleaner code, wrap in a component:

```javascript
// components/BookRadiologyButton.jsx

import { buildDoctorOrderRedirectUrl } from '@/utils/doctorOrderRedirect';

export function BookRadiologyButton({ order, radiologyUrl = 'http://localhost:5202' }) {
  const handleClick = () => {
    const url = buildDoctorOrderRedirectUrl({
      radiologyBaseUrl: radiologyUrl,
      patient: order.patient,
      doctor: order.doctor,
      order: {
        id: order.id,
        date: order.orderDate,
        requestedTest: order.requestedTest,
        notes: order.notes
      },
      clinicName: 'Eye Clinic',
      clinicBackUrl: window.location.origin + '/doctor-orders'
    });
    
    window.location.href = url;
  };

  return (
    <button onClick={handleClick} className="btn-primary">
      📍 Book at Radiology Center
    </button>
  );
}
```

Usage:
```javascript
<BookRadiologyButton order={doctorOrder} />
```

---

## ✅ Test It

1. Navigate to your Doctor Orders page
2. Click "Book at Radiology Center" button
3. Should redirect to: `http://localhost:5202/patient/book-appointment?doctorOrder=true&orderId=...&...`
4. Verify in radiology page:
   - ✅ Yellow doctor order banner appears
   - ✅ Patient data pre-filled
   - ✅ Test auto-selected
   - ✅ Test card shows lock icon

---

## 🚀 That's It!

You're done. The radiology system handles everything else:
- Auto-fills patient data
- Auto-selects test
- Shows doctor information
- Creates appointment with order linked

---

## 📝 Complete Example

```javascript
// pages/DoctorOrdersPage.jsx

import { useState } from 'react';
import { buildDoctorOrderRedirectUrl } from '@/utils/doctorOrderRedirect';

export function DoctorOrdersPage() {
  const [orders] = useState([
    {
      id: 'ORD001',
      orderDate: '2024-05-13',
      requestedTest: 'OCT',
      notes: 'Check retina urgently',
      patient: {
        id: 'P001',
        name: 'Ahmed Hassan',
        phone: '+20123456789',
        email: 'ahmed@example.com',
        gender: 'M',
        dateOfBirth: '1990-01-15',
        nationalId: '30001011234567',
        address: 'Cairo'
      },
      doctor: {
        id: 'DOC001',
        name: 'Dr. Fatima Mohamed',
        specialty: 'Ophthalmology'
      }
    }
  ]);

  const sendToRadiology = (order) => {
    const url = buildDoctorOrderRedirectUrl({
      radiologyBaseUrl: import.meta.env.VITE_RADIOLOGY_URL || 'http://localhost:5202',
      patient: order.patient,
      doctor: order.doctor,
      order: {
        id: order.id,
        date: order.orderDate,
        requestedTest: order.requestedTest,
        notes: order.notes
      },
      clinicName: 'Eye Clinic',
      clinicBackUrl: window.location.href
    });
    
    window.location.href = url;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Doctor Orders</h1>
      
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold">Order #{order.id}</h3>
                <p className="text-sm text-gray-600">Dr. {order.doctor.name}</p>
              </div>
              <span className="bg-blue-100 px-3 py-1 rounded text-sm">
                {order.requestedTest}
              </span>
            </div>
            
            <p className="text-sm mb-3">Patient: {order.patient.name}</p>
            
            <button
              onClick={() => sendToRadiology(order)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
            >
              📍 Book at Radiology Center
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 💡 Tips

- **Test Names:** Must match exactly (case-insensitive):
  - `'CBC'`, `'Blood Sugar'`, `'CT Scan'`, `'MRI Scan'`, `'X-Ray'`, `'OCT'`
  - `'Visual Field Test'`, `'Ultrasound'`, `'Corneal Topography'`
  - `'Specular Microscopy'`, `'ERG'`, `'EOG'`, `'Genetic Testing'`

- **Patient ID:** Use your clinic's internal patient ID (e.g., medical record number)

- **Back URL:** Where should "Back to Clinic" button go?
  - Doctor Orders page: `window.location.origin + '/doctor-orders'`
  - Patient Dashboard: `window.location.origin + '/patient'`

- **Environment Variable (Optional):** Add to `.env`:
  ```bash
  VITE_RADIOLOGY_URL=http://localhost:5202
  ```

---

## 🎉 Result

When patient arrives at radiology:
```
🏥 Appointment Based on Doctor Request
👨‍⚕️ Doctor: Dr. Fatima Mohamed - Ophthalmology
   Clinic: Eye Clinic
   Test Requested: OCT
   📝 Notes: Check retina urgently

[Patient data pre-filled]
[Test locked: OCT ✓ 🔒]

[User selects date and time]
[Confirms appointment]

✅ Appointment booked & linked to doctor order
```

---

**That's all! You're set to go.** 🚀
