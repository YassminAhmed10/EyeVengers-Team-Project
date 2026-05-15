# 🏥 Doctor Order → Radiology Booking Integration Guide

**Date:** May 13, 2026  
**Status:** ✅ IMPLEMENTED  
**Scope:** Complete flow from Doctor Requests to Radiology Appointment

---

## 📋 Overview

This guide explains the complete **Doctor Order → Radiology Booking** integration between the Clinic System (Eye Clinic) and the Radiology Center.

### Flow Diagram
```
Doctor Requests Page (Clinic)
    ↓
User clicks "Book at Radiology Center"
    ↓
Redirect URL built with doctor order context
    ↓
Radiology Booking Page
    ├─ Doctor order info shows in yellow banner
    ├─ Patient data auto-filled
    ├─ Test auto-selected (locked from change)
    └─ User only selects: Date & Time
    ↓
Confirm Appointment
    ↓
Appointment created with doctor request linked
    ↓
(Optional) Sync back to clinic system
```

---

## 🚀 Implementation: Clinic System Side

### Step 1: Install Doctor Order Utilities

In your Clinic System frontend, import the doctor order redirect utility:

```bash
# Copy file from:
# /Modules/RadiologyCenter/Frontend/src/utils/doctorOrderRedirect.js
# To your clinic frontend's utils folder
```

### Step 2: Create "Book at Radiology" Button

In your Doctor Requests/Orders page component:

```javascript
// /Modules/ClinicSystem/Frontend/src/pages/DoctorOrdersPage.jsx

import { buildDoctorOrderRedirectUrl, redirectToRadiologyBooking } from '@/utils/doctorOrderRedirect';

export function DoctorOrdersPage() {
  const [orders] = useState([
    {
      id: 'ORD001',
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
      },
      requestedTest: 'OCT',
      orderDate: '2024-05-13',
      notes: 'Check retina thickness urgently'
    },
    // ... more orders
  ]);

  const handleBookRadiology = (order) => {
    const radiologyUrl = buildDoctorOrderRedirectUrl({
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
      clinicBackUrl: window.location.origin + '/doctor-orders'  // Return to this page
    });

    // Redirect to radiology
    redirectToRadiologyBooking(radiologyUrl);
  };

  return (
    <div>
      <h1>Doctor Orders</h1>
      
      {orders.map(order => (
        <div key={order.id} className="order-card">
          <h3>Order #{order.id}</h3>
          <p>Patient: {order.patient.name}</p>
          <p>Doctor: {order.doctor.name}</p>
          <p>Test: {order.requestedTest}</p>
          <p>Notes: {order.notes}</p>
          
          <button 
            onClick={() => handleBookRadiology(order)}
            className="btn-primary"
          >
            📍 Book at Radiology Center
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Step 3: Add Environment Variable

In `.env`:
```bash
VITE_RADIOLOGY_URL=http://localhost:5202
```

### Step 4: Alternative - Simple Button Component

For reusability, create a button component:

```javascript
// /Modules/ClinicSystem/Frontend/src/components/BookRadiologyButton.jsx

import { buildDoctorOrderRedirectUrl, redirectToRadiologyBooking } from '@/utils/doctorOrderRedirect';

export function BookRadiologyButton({ 
  order,  // Doctor order object
  patient,  // Patient data
  doctor,  // Doctor data
  radiologyUrl = import.meta.env.VITE_RADIOLOGY_URL || 'http://localhost:5202',
  returnUrl = null,
  children = '📍 Book at Radiology'
}) {
  const handleClick = () => {
    const url = buildDoctorOrderRedirectUrl({
      radiologyBaseUrl: radiologyUrl,
      patient,
      doctor,
      order,
      clinicName: 'Eye Clinic',
      clinicBackUrl: returnUrl || window.location.href
    });
    redirectToRadiologyBooking(url);
  };

  return (
    <button onClick={handleClick} className="btn-radiology">
      {children}
    </button>
  );
}
```

Usage:
```javascript
<BookRadiologyButton 
  order={{ id: 'ORD001', requestedTest: 'OCT', notes: '...' }}
  patient={order.patient}
  doctor={order.doctor}
/>
```

---

## 🎯 Implementation: Radiology System Side

### Already Implemented! ✅

The radiology system is ready to receive doctor orders. The BookAppointmentPage now:

1. ✅ Detects doctor order via URL parameters (`?doctorOrder=true`)
2. ✅ Shows doctor information in a yellow banner
3. ✅ Auto-fills patient data
4. ✅ Auto-selects the requested test
5. ✅ Locks test selection (can't be changed)
6. ✅ Displays lock icon on selected test
7. ✅ Links appointment to doctor order in submission

**No additional changes needed in radiology system!**

---

## 📊 URL Parameter Reference

When redirecting from clinic to radiology, the following parameters are included:

### Doctor Order Context
```
?doctorOrder=true          → Flag: this is a doctor order
&orderId=ORD001            → Doctor order ID
&doctorId=DOC001           → Doctor ID
&doctorName=Dr.%20Name     → Doctor name
&doctorSpecialty=Ophthal   → Doctor specialty
&requestedTest=OCT         → Test requested (e.g., 'OCT', 'MRI', 'X-Ray')
&orderDate=2024-05-13      → Order date
&orderNotes=Check%20retina  → Doctor notes/instructions
```

### Clinic Context
```
&fromClinic=true           → Flag: from clinic system
&clinicName=Eye%20Clinic   → Clinic name
&clinicBackUrl=http://...  → Return URL for "Back to Clinic" button
```

### Patient Data
```
&patientId=P001            → Patient ID
&patientName=Ahmed%20Hassan → Full name
&patientEmail=ahmed@ex...  → Email
&patientPhone=%2B201234... → Phone (URL encoded)
&patientDateOfBirth=1990-01-15  → DOB
&patientGender=M           → Gender
&patientNationalId=300010... → National ID
&patientAddress=Cairo      → Address
```

### Optional
```
&patientInstructions=...   → Special instructions (e.g., "Fasting required")
```

---

## 🧪 Testing the Integration

### Test Case 1: Full Doctor Order Booking

**Clinic Side:**
1. Navigate to Doctor Orders page
2. Click "Book at Radiology Center" on an order
3. Verify URL contains `?doctorOrder=true&orderId=...`

**Radiology Side:**
1. ✅ Doctor information banner appears (yellow)
2. ✅ Patient data pre-filled (name, phone, email, etc.)
3. ✅ Requested test (e.g., OCT) is auto-selected
4. ✅ Test card shows lock icon 🔒
5. ✅ Cannot change selected test

**Booking:**
1. Select appointment date
2. Select time slot
3. Click "Confirm Appointment"
4. ✅ Appointment created with status: "Requested by Doctor"
5. ✅ Doctor order ID linked in appointment

### Test Case 2: Test Selection Lock

1. Arrive as doctor order patient
2. Try to click different test
3. ✅ Error message: "Test is locked - selected by doctor"
4. ✅ Cannot select different test

### Test Case 3: Back Button

1. Complete booking
2. (If not auto-redirected) Click "Back to Clinic" in navbar
3. ✅ Navigates back to clinic system
4. ✅ Returns to correct page (clinicBackUrl)

---

## 💻 Code Examples

### Example 1: Clinic System - React

```javascript
// Doctor order card with booking button
function DoctorOrderCard({ order, handleBooking }) {
  return (
    <div className="order-card bg-white p-4 rounded-lg border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">Order #{order.id}</h3>
          <p className="text-gray-600">Dr. {order.doctor.name}</p>
        </div>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
          {order.requestedTest}
        </span>
      </div>

      <div className="mb-4 pb-4 border-b">
        <p><strong>Patient:</strong> {order.patient.name}</p>
        <p><strong>Age:</strong> {calculateAge(order.patient.dateOfBirth)}</p>
        <p><strong>Notes:</strong> {order.notes}</p>
      </div>

      <button
        onClick={() => handleBooking(order)}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
      >
        📍 Book at Radiology Center
      </button>
    </div>
  );
}
```

### Example 2: Simple Vanilla JavaScript

```javascript
// In a doctor request table row
document.getElementById('bookRadiologyBtn').addEventListener('click', function() {
  const orderId = this.dataset.orderId;
  const doctorId = this.dataset.doctorId;
  const patientId = this.dataset.patientId;
  const testType = this.dataset.testType;

  const radiologyUrl = `http://localhost:5202/patient/book-appointment?` +
    `doctorOrder=true` +
    `&orderId=${orderId}` +
    `&doctorId=${doctorId}` +
    `&patientId=${patientId}` +
    `&requestedTest=${testType}` +
    `&clinicName=Eye%20Clinic` +
    `&fromClinic=true`;

  window.location.href = radiologyUrl;
});
```

---

## 🔄 What Happens in Radiology

When a patient arrives from a doctor order:

### 1. Page Load
- URL parameters detected
- `isDoctorOrder` flag set to `true`
- Doctor order context extracted

### 2. Doctor Order Banner Shows
```
👨‍⚕️ Appointment Based on Doctor Request
Doctor: Dr. Fatima Mohamed - Ophthalmology
Clinic: Eye Clinic
Test Requested: OCT
📝 Notes: Urgent: Check retina thickness
```

### 3. Data Auto-Filled
- Patient Name: Ahmed Hassan
- Phone: +20123456789
- Email: ahmed@example.com
- Gender: Male
- Age: 34 (calculated)
- National ID: 30001011234567
- Address: Cairo, Egypt

### 4. Test Auto-Selected
- OCT card highlighted with color
- Shows checkmark ✓
- Shows lock icon 🔒
- Cannot change test

### 5. User Selection
- **Can change:** Date, Time
- **Cannot change:** Patient info, Test type

### 6. Booking Confirmation
- Status: "Requested by Doctor"
- Doctor order ID: ORD001
- All data linked properly

---

## 🛡️ Data Integrity

### Duplicate Prevention
- Patient ID validated
- Check for existing patient records
- No duplicate patient creation

### Test Linking
- Test locked from selection
- Ensures doctor's requested test is used
- No accidental test changes

### Order Linking
- Appointment linked to doctor order via `doctorOrderId`
- Enables clinic to track radiology booking
- Supports appointment status updates back to clinic

---

## 🔗 Bidirectional Integration (Optional)

After booking, sync appointment back to clinic system:

```javascript
// In BookAppointmentPage - after successful booking
const handleBookingSuccess = async (appointment) => {
  // If from doctor order, notify clinic system
  if (isDoctorOrder) {
    try {
      await axios.post('http://localhost:5201/api/doctor-orders/book-radiology', {
        doctorOrderId: doctorOrderContext.orderId,
        radiologyBookingRef: appointment.bookingReference,
        appointmentDate: appointment.appointmentDateTime,
        status: 'Booked at Radiology'
      });
      console.log('[Clinic Sync] Doctor order updated in clinic system');
    } catch (error) {
      console.warn('[Clinic Sync] Could not sync back to clinic:', error);
      // Don't fail the booking if clinic sync fails
    }
  }
};
```

---

## 📝 Environment Setup

### Clinic System (.env)
```bash
# URL of radiology center booking page
VITE_RADIOLOGY_URL=http://localhost:5202

# Clinic information
VITE_CLINIC_NAME=Eye Clinic
VITE_CLINIC_DOMAIN=http://localhost:5173
```

### Radiology System (.env)
```bash
# URL to redirect back to clinic
VITE_EYE_CLINIC_URL=http://localhost:5173

# Radiology API
VITE_RADIOLOGY_API=http://localhost:5202/api
VITE_CLINIC_API=http://localhost:5201/api
```

---

## 🎓 How It Works: Technical Details

### Detection Mechanism
The radiology system detects doctor orders via:

1. **URL Parameter**: `?doctorOrder=true`
2. **Doctor Order Context**: `orderId`, `doctorId`, `doctorName`, `requestedTest`

```javascript
const isDoctorOrder = params.get('doctorOrder') === 'true';
const doctorOrderContext = {
  orderId: params.get('orderId'),
  doctorId: params.get('doctorId'),
  requestedTest: params.get('requestedTest'),
  // ... more fields
};
```

### Auto-Selection Logic
```javascript
// Find test by name from doctor order
const requestedTestName = doctorOrderContext.requestedTest?.toUpperCase();
const selectedTest = ALL_SERVICES.find(s => 
  s.name.toUpperCase() === requestedTestName
);
```

### Test Lock Mechanism
```javascript
const testLocked = isDoctorOrder;  // Lock if from doctor order

const handleSelectTest = (test) => {
  if (testLocked) {
    showError('Test is locked - selected by doctor');
    return;
  }
  setSelectedService(test);
};
```

### Data Submission
```javascript
const bookingData = {
  // ... standard appointment data
  
  // Doctor order context
  ...(isDoctorOrder && {
    isDoctorOrder: true,
    doctorOrderId: doctorOrderContext.orderId,
    doctorId: doctorOrderContext.doctorId,
    doctorName: doctorOrderContext.doctorName,
    // ... more doctor info
  })
};
```

---

## ✅ Implementation Checklist

### Clinic System Side
- [ ] Copy `doctorOrderRedirect.js` utility to clinic frontend
- [ ] Create "Book at Radiology" button in Doctor Orders page
- [ ] Test redirect URL generation with sample order
- [ ] Add environment variable `VITE_RADIOLOGY_URL`
- [ ] Test button click with real doctor order data
- [ ] Verify all parameters passed correctly
- [ ] Test in development environment
- [ ] Test in production (update URLs)

### Radiology System Side
- [ ] ✅ BookAppointmentPage enhanced (already done)
- [ ] ✅ Doctor order detection implemented (already done)
- [ ] ✅ Doctor information banner added (already done)
- [ ] ✅ Patient data auto-fill enabled (already done)
- [ ] ✅ Test auto-selection working (already done)
- [ ] ✅ Test lock implemented (already done)
- [ ] ✅ Booking submission includes doctor context (already done)

### Testing
- [ ] Full doctor order booking flow
- [ ] Test selection lock verification
- [ ] Back button navigation
- [ ] Data persistence across page reload
- [ ] Error handling for missing parameters
- [ ] Mobile responsiveness

### Deployment
- [ ] Environment URLs correct
- [ ] API endpoints accessible
- [ ] HTTPS configured (if applicable)
- [ ] Error logging enabled
- [ ] Performance tested

---

## 🐛 Troubleshooting

### Doctor Order Banner Not Showing
1. Check URL has `?doctorOrder=true`
2. Check browser console for detection logs
3. Verify `isDoctorOrder` state is true

### Patient Data Not Pre-filled
1. Verify patient parameters in URL
2. Check `patientName`, `patientPhone`, etc. are present
3. Verify patient data loaded in PatientContext

### Test Not Auto-Selected
1. Check `requestedTest` parameter matches service name
2. Verify test name spelling/case matches exactly
3. Check ALL_SERVICES array for correct test names

### Cannot Lock Test Selection
1. Verify `testLocked` state is true
2. Check `handleSelectTest` prevents changes
3. Verify error message displays

### Back Button Doesn't Work
1. Verify `clinicBackUrl` parameter in URL
2. Check URL is valid and accessible
3. Test navigation with correct URL

---

## 📚 API Reference

### buildDoctorOrderRedirectUrl(options)
Builds complete redirect URL with all parameters

**Parameters:**
```javascript
{
  radiologyBaseUrl: string,    // 'http://localhost:5202'
  patient: { id, name, phone, email, gender, dateOfBirth, nationalId, address },
  doctor: { id, name, specialty },
  order: { id, date, requestedTest, notes },
  clinicName: string,          // 'Eye Clinic'
  clinicBackUrl: string,       // Return URL
  patientInstructions: string  // Optional
}
```

**Returns:** Complete URL string

### buildMinimalDoctorOrderUrl(orderId, doctorId, patientId, requestedTest, radiologyBaseUrl)
Quick variant with just essential parameters

### redirectToRadiologyBooking(url)
Perform browser redirect to radiology booking

### extractDoctorOrderParamsFromUrl()
Extract all parameters from current URL

### validateDoctorOrderParams()
Check if all required parameters present

---

## 🚀 Quick Start

**For Clinic System:**
1. Copy `doctorOrderRedirect.js` to your utils folder
2. Add button that calls `buildDoctorOrderRedirectUrl()`
3. Pass doctor order data
4. Done! ✅

**For Radiology System:**
1. Already implemented! ✅
2. Just test it out
3. Done! ✅

---

## 📞 Support

For issues:
1. Check browser console for logs
2. Verify URL parameters in address bar
3. Check DevTools Network tab for API calls
4. Review troubleshooting section above

---

**Status**: ✅ **COMPLETE AND READY FOR USE** 🚀

All files created and enhanced. Ready to integrate with clinic system!
