# 🔗 Clinic to Radiology Navigation - Implementation Guide

**Date:** May 13, 2026  
**Status:** ✅ IMPLEMENTATION COMPLETE  
**Target:** Clinic System ↔ Radiology Center Integration

---

## 📋 Overview

This guide explains how the **Eye Clinic System** navigates patients to the **Radiology Center** with proper entry source tracking and how radiology can send patients back to the clinic system.

---

## 🔄 Navigation Flow

```
Eye Clinic System
  ↓
  Patient Book Appointment (from doctor order)
  ↓
  [Send to Radiology] button
  ↓
  URL: http://localhost:5202/patient/book-appointment?fromClinic=true&clinicName=Eye%20Clinic&...
  ↓
Radiology Center
  ├─ Navbar shows "Back to Eye Clinic"
  └─ Patient data auto-filled
      ↓
      Book Appointment
      ↓
      [Back to Eye Clinic] button (in navbar)
      ↓
Eye Clinic System
```

---

## 🚀 Implementation Steps

### Step 1: Update Eye Clinic - Navigation Function

In your Eye Clinic component (e.g., DoctorOrderPage, PatientDashboard):

```javascript
// /Modules/ClinicSystem/Frontend/src/pages/DoctorOrderPage.jsx

import { useNavigate } from 'react-router-dom';

export function DoctorOrderPage() {
  const navigate = useNavigate();
  
  /**
   * Redirect patient to Radiology Center for imaging tests
   * @param {Object} patient - Patient data from clinic
   * @param {string} doctorId - ID of requesting doctor
   * @param {string} orderId - ID of doctor order
   * @param {string} testType - Type of imaging test (optional)
   */
  const sendPatientToRadiology = (patient, doctorId, orderId, testType = null) => {
    const radiologyCenterUrl = import.meta.env.VITE_RADIOLOGY_URL || 'http://localhost:5202';
    const clinicBaseUrl = window.location.origin;
    
    // Build URL with all required parameters
    const radiologyUrl = new URL(`${radiologyCenterUrl}/patient/book-appointment`);
    
    // Entry source markers
    radiologyUrl.searchParams.set('fromClinic', 'true');
    radiologyUrl.searchParams.set('clinicName', 'Eye Clinic');
    radiologyUrl.searchParams.set('clinicBackUrl', `${clinicBaseUrl}/patient`);
    
    // Patient information
    radiologyUrl.searchParams.set('patientId', patient.id);
    radiologyUrl.searchParams.set('patientName', patient.name);
    radiologyUrl.searchParams.set('patientEmail', patient.email || '');
    radiologyUrl.searchParams.set('patientPhone', patient.phone || '');
    radiologyUrl.searchParams.set('patientDateOfBirth', patient.dateOfBirth || '');
    
    // Doctor & Order context
    radiologyUrl.searchParams.set('doctorId', doctorId);
    radiologyUrl.searchParams.set('orderId', orderId);
    
    // Optional: Test type
    if (testType) {
      radiologyUrl.searchParams.set('requestedTest', testType); // e.g., 'OCT', 'MRI'
    }
    
    // Optional: FHIR system ID
    radiologyUrl.searchParams.set('fhirSystemId', 'clinic-system-001');
    
    console.log('[Clinic Navigation] Redirecting to radiology:', radiologyUrl.toString());
    
    // Redirect
    window.location.href = radiologyUrl.toString();
  };
  
  return (
    <div>
      {/* Doctor Order Details */}
      <div className="order-details">
        <h2>Doctor Order #{order.id}</h2>
        <p>Patient: {order.patient.name}</p>
        <p>Test: {order.testType}</p>
      </div>
      
      {/* Send to Radiology Button */}
      <button
        onClick={() => sendPatientToRadiology(
          order.patient,
          order.doctorId,
          order.id,
          order.testType
        )}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Send to Radiology Center
      </button>
    </div>
  );
}
```

### Step 2: Environment Variables

Add to your `.env` files:

```bash
# .env (Eye Clinic System)
VITE_RADIOLOGY_URL=http://localhost:5202

# Optional: Clinic system name for display
VITE_CLINIC_NAME=Eye Clinic
VITE_CLINIC_ID=clinic-001
```

### Step 3: Update Clinic Router (Optional)

Create a dedicated redirect component:

```javascript
// /Modules/ClinicSystem/Frontend/src/components/RadiologyRedirectButton.jsx

import { useCallback } from 'react';
import { FaArrowRight } from 'react-icons/fa';

/**
 * Reusable button to send patient to radiology
 * Usage: <RadiologyRedirectButton patient={patient} doctorId={doc.id} orderId={order.id} />
 */
export function RadiologyRedirectButton({ 
  patient, 
  doctorId, 
  orderId, 
  testType = null,
  className = '',
  children = 'Send to Radiology'
}) {
  
  const handleRedirect = useCallback(() => {
    const radiologyUrl = import.meta.env.VITE_RADIOLOGY_URL || 'http://localhost:5202';
    const clinicBase = window.location.origin;
    
    const url = new URL(`${radiologyUrl}/patient/book-appointment`);
    
    // Entry source
    url.searchParams.set('fromClinic', 'true');
    url.searchParams.set('clinicName', 'Eye Clinic');
    url.searchParams.set('clinicBackUrl', `${clinicBase}/patient`);
    
    // Patient data
    url.searchParams.set('patientId', patient.id);
    url.searchParams.set('patientName', patient.name);
    url.searchParams.set('patientEmail', patient.email || '');
    url.searchParams.set('patientPhone', patient.phone || '');
    url.searchParams.set('patientDateOfBirth', patient.dateOfBirth || '');
    
    // Order context
    url.searchParams.set('doctorId', doctorId);
    url.searchParams.set('orderId', orderId);
    if (testType) url.searchParams.set('requestedTest', testType);
    
    window.location.href = url.toString();
  }, [patient, doctorId, orderId, testType]);
  
  return (
    <button
      onClick={handleRedirect}
      className={`flex items-center gap-2 ${className}`}
    >
      {children}
      <FaArrowRight size={16} />
    </button>
  );
}
```

---

## 📊 URL Parameters Explained

When redirecting from clinic to radiology, include these parameters:

### Entry Source Markers (Required)
```
?fromClinic=true              → Indicates patient from clinic system
&clinicName=Eye%20Clinic      → Name of clinic (for navbar label)
&clinicBackUrl=http://...     → Where to send patient when clicking "Back"
```

### Patient Information (Optional but Recommended)
```
&patientId=P12345             → Patient ID in clinic system
&patientName=John%20Doe       → Full name
&patientEmail=john@example.com → Email
&patientPhone=%2B1234567890   → Phone (URL encoded)
&patientDateOfBirth=1990-01-15 → DOB
```

### Doctor/Order Context (Optional)
```
&doctorId=DOC001              → ID of requesting doctor
&orderId=ORD001               → ID of doctor order
&requestedTest=OCT            → Specific test type
&fhirSystemId=clinic-001      → FHIR system identifier
```

### Complete Example URL
```
http://localhost:5202/patient/book-appointment?
  fromClinic=true
  &clinicName=Eye%20Clinic
  &clinicBackUrl=http://localhost:5173/patient
  &patientId=P12345
  &patientName=John%20Doe
  &patientEmail=john@example.com
  &patientPhone=%2B19876543210
  &patientDateOfBirth=1990-01-15
  &doctorId=DOC001
  &orderId=ORD001
  &requestedTest=OCT
  &fhirSystemId=clinic-001
```

---

## 🔐 Clinic Data in Radiology

Once the patient arrives at radiology, the data is:
1. **Received** via URL parameters or token
2. **Extracted** by PatientContext in entrySourceDetector
3. **Stored** in localStorage for persistence
4. **Accessed** throughout the radiology app via usePatient() hook

### In BookAppointmentPage
```javascript
import { usePatient } from '../context/PatientContext';
import { getDoctorOrderContext } from '../utils/entrySourceDetector';

export function BookAppointmentPage() {
  const { patient, entrySource, clinicSystemInfo } = usePatient();
  const { doctorId, orderId } = getDoctorOrderContext();
  
  // Data available:
  console.log('Patient:', patient);           // {id, name, email, phone, dateOfBirth}
  console.log('From clinic:', clinicSystemInfo.name);  // "Eye Clinic"
  console.log('Doctor:', doctorId);           // "DOC001"
  console.log('Order:', orderId);             // "ORD001"
}
```

---

## 🔄 Return Navigation (Back to Clinic)

### In Navbar
The patient sees a "Back to Eye Clinic" button:
```javascript
// PatientLayout passes to Navbar:
backToUrl={clinicSystemInfo.backUrl}        // Clinic return URL
isFromClinic={entrySource === 'clinic_system'}
clinicName={clinicSystemInfo.name}          // "Eye Clinic"
```

### The Back Button
```jsx
<a href={backToUrl} className="text-amber-600">
  <ArrowLeft size={16} />
  Back to {clinicName}
</a>
```

When clicked, navigates back to: `http://localhost:5173/patient`

---

## 🧪 Testing the Integration

### Test Case 1: Complete Clinic Redirect
1. **In Eye Clinic**: Navigate to doctor order page
2. Click "Send to Radiology Center"
3. **In Radiology**: Verify:
   - ✅ Navbar shows "Back to Eye Clinic" button
   - ✅ Patient data pre-filled
   - ✅ Lock icon shows "Clinic Referral - Data Imported"
4. Click "Back to Eye Clinic"
5. **Back in Clinic**: Verify navigation successful

### Test Case 2: Minimal Parameters
1. Manually navigate with: `?fromClinic=true&clinicName=Eye%20Clinic`
2. Verify:
   - ✅ Back button shows with clinic name
   - ✅ Falls back to default clinic URL

### Test Case 3: Without Clinic Parameters
1. Navigate to: `http://localhost:5202/patient/book-appointment`
2. Verify:
   - ✅ No back button in navbar
   - ✅ Standard radiology interface

### Test Case 4: Session Persistence
1. Arrive as clinic patient (with parameters)
2. Reload page
3. Verify:
   - ✅ Back button still visible
   - ✅ Clinic data still in context

---

## 🛠️ Environment Setup

### For Development

**Clinic System (.env)**
```bash
VITE_RADIOLOGY_URL=http://localhost:5202
VITE_CLINIC_NAME=Eye Clinic
```

**Radiology System (.env)**
```bash
VITE_EYE_CLINIC_URL=http://localhost:5173
```

### For Production

**Clinic System (.env.production)**
```bash
VITE_RADIOLOGY_URL=https://radiology.yourdomain.com
VITE_CLINIC_NAME=Your Eye Clinic
```

**Radiology System (.env.production)**
```bash
VITE_EYE_CLINIC_URL=https://clinic.yourdomain.com
```

---

## 📝 Security Best Practices

### 1. URL Parameter Validation
Validate parameters on the radiology side:
```javascript
// In PatientContext
const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    // Allowlist clinic domains
    const allowedDomains = [
      'localhost:5173',
      'clinic.yourdomain.com',
      'yourdomain.com'
    ];
    return allowedDomains.some(domain => urlObj.host.includes(domain));
  } catch {
    return false;
  }
};
```

### 2. Token-Based Authentication (Recommended)
Instead of URL parameters, use JWT tokens:
```javascript
// Clinic issues token:
const token = jwt.sign({
  patientId: patient.id,
  clinicSource: true,
  clinicName: 'Eye Clinic',
  doctorId: doctor.id,
  orderId: order.id
}, process.env.SHARED_SECRET, {expiresIn: '1h'});

// Radiology receives token in Authorization header
// PatientContext validates token signature
```

### 3. Whitelist Clinic Domains
```javascript
// utils/clinicWhitelist.js
export const ALLOWED_CLINIC_DOMAINS = [
  'localhost:5173',
  'clinic.yourdomain.com',
  'eye-clinic.yourdomain.com'
];

export function isAllowedClinicBackUrl(url) {
  try {
    const urlObj = new URL(url);
    return ALLOWED_CLINIC_DOMAINS.some(domain => 
      urlObj.hostname.includes(domain) || urlObj.host.includes(domain)
    );
  } catch {
    return false;
  }
}
```

### 4. Sensitive Data in Token Only
Keep sensitive data (patient SSN, medical history) in token, not URL parameters.

---

## 🔍 Debugging

### Browser Console Logs
Enable logging to see entry source detection:
```javascript
// Logs appear as [Entry Source] prefixed
[Entry Source] Detecting patient entry source...
[Entry Source] Detected from URL parameters: {source: 'clinic_system', ...}
[Entry Source] Persisted clinic system entry to localStorage
```

### Check localStorage
```javascript
// Console
localStorage.getItem('entrySource')        // Should be 'clinic_system'
localStorage.getItem('clinicSystemName')   // Should be clinic name
localStorage.getItem('clinicBackUrl')      // Should be clinic URL
```

### Network Tab (DevTools)
Monitor navigation:
1. Check redirect URL in Network tab
2. Verify all parameters encoded correctly
3. Check response from radiology server

---

## 🎯 Common Issues & Solutions

### Issue: Back Button Not Showing
**Cause**: Entry source not detected  
**Solution**:
1. Verify `fromClinic=true` in URL
2. Check localStorage for `entrySource` = "clinic_system"
3. Check console for `[Entry Source]` logs

### Issue: Patient Data Not Pre-filled
**Cause**: Parameters not passed correctly  
**Solution**:
1. Check URL for patient parameters
2. Verify parameter names match exactly (case-sensitive)
3. Check if parameters are URL-encoded correctly

### Issue: Clinic Name Wrong in Back Button
**Cause**: `clinicName` parameter not set  
**Solution**:
1. Add `&clinicName=Your%20Clinic%20Name` to URL
2. URL encode special characters (spaces = %20)
3. Check localStorage for stored clinic name

### Issue: Page Reload Loses Clinic Context
**Cause**: Entry source not persisted  
**Solution**:
1. Ensure `persistEntrySource()` called in PatientContext
2. Check browser localStorage is enabled
3. Check browser privacy settings allow localStorage

---

## 📚 Code Examples

### Example 1: Simple Clinic Link
```html
<!-- In Eye Clinic HTML -->
<a href="http://localhost:5202/patient/book-appointment?fromClinic=true&clinicName=Eye%20Clinic&clinicBackUrl=http://localhost:5173/patient">
  Send to Radiology
</a>
```

### Example 2: React Router Navigation
```javascript
// In Eye Clinic React component
const handleRedirect = () => {
  const url = new URL('http://localhost:5202/patient/book-appointment');
  url.searchParams.set('fromClinic', 'true');
  url.searchParams.set('clinicName', 'Eye Clinic');
  window.location.href = url.toString();
};
```

### Example 3: Using Environment Variables
```javascript
// React component with .env
const RADIOLOGY_URL = import.meta.env.VITE_RADIOLOGY_URL;
const CLINIC_NAME = import.meta.env.VITE_CLINIC_NAME;

const url = new URL(`${RADIOLOGY_URL}/patient/book-appointment`);
url.searchParams.set('fromClinic', 'true');
url.searchParams.set('clinicName', CLINIC_NAME);
```

---

## ✅ Implementation Checklist

### Clinic System Side
- [ ] Add VITE_RADIOLOGY_URL to .env
- [ ] Create navigation function (sendPatientToRadiology)
- [ ] Add "Send to Radiology" button to doctor order page
- [ ] Test URL generation with console.log
- [ ] Include all required parameters
- [ ] Test in development (localhost)
- [ ] Test in production (domain)

### Radiology System Side
- [ ] PatientContext detects entry source ✅
- [ ] PatientLayout conditionally shows back button ✅
- [ ] Navbar displays dynamic clinic name ✅
- [ ] Entry source detector utility available ✅
- [ ] Persistence to localStorage working ✅
- [ ] Back button navigates correctly ✅

### Testing
- [ ] Test clinic to radiology redirect
- [ ] Test radiology back to clinic
- [ ] Test page reload persistence
- [ ] Test with different clinic names
- [ ] Test with missing parameters (fallback)
- [ ] Test direct entry (no back button)

### Security
- [ ] Validate back URL before redirect
- [ ] Use HTTPS in production
- [ ] Consider token-based authentication
- [ ] Whitelist clinic domains
- [ ] Sanitize URL parameters

---

## 📞 Support

For issues or questions:
1. Check console logs for `[Entry Source]` messages
2. Verify URL parameters in browser address bar
3. Check localStorage in DevTools
4. Review this guide's troubleshooting section

---

**Status**: ✅ Complete and Ready for Integration  
**Last Updated**: May 13, 2026  
**Implementation**: ~2 hours to integrate into clinic system
