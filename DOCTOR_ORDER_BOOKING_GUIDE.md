# Doctor Orders → Radiology Booking - Complete Flow Guide

## ✅ New Feature: Seamless Doctor Order to Booking Flow

The system now provides a complete end-to-end flow where:
1. Doctor requests radiology test for patient from Eye Clinic
2. Patient views request on "My Doctor Requests" page
3. Patient clicks "BOOK AT RADIOLOGY CENTER"
4. Booking page auto-fills ALL patient and test data
5. Patient only selects DATE, TIME, and PAYMENT METHOD
6. Booking confirmed and synced back to Eye Clinic

---

## 📋 Data Mapping & Auto-Fill

### Fields Auto-Filled from Database

```
From Eye Clinic Backend (FHIR/HL7):
├─ Patient Name          → Pre-filled (read-only)
├─ Email                 → Pre-filled (read-only)
├─ Phone                 → Auto-fetched from Patient table
├─ Address               → Auto-fetched from Patient table
├─ Gender                → Auto-fetched from Patient table
├─ Date of Birth         → Auto-fetched from Patient table
├─ Insurance Company     → Auto-fetched from Patient table
└─ Insurance ID          → Auto-fetched from Patient table

From Doctor Order (DataJson):
├─ Test Name             → Pre-filled, auto-matches to Radiology Service
├─ Test Code             → Displayed for reference
└─ Description           → Shown to patient as context
```

### Fields User Must Select

```
User Input Required:
├─ Appointment Date      ← User selects (calendar)
├─ Time Slot             ← User selects from available
├─ Payment Method        ← User chooses (Cash, Insurance, Card)
└─ Terms Agreement       ← User confirms checkbox
```

---

## 🔄 Architecture & Data Flow

### Page 1: My Doctor Requests (New)
**URL**: `http://localhost:5173/patient/orders`
**File**: `src/pages/patient/MyDoctorRequestsPage.jsx`

```
┌─────────────────────────────────────────┐
│   My Doctor Requests                    │
├─────────────────────────────────────────┤
│                                         │
│  [All Requests] [Action Required]       │
│  [Accepted] [Booked] [Declined]         │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ Doctor's Request — MRI           │ ✓ │
│  │ 📅 03 May 2026  🏥 Eye Clinic    │   │
│  │ [✓ Accept] [✗ Decline]           │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ Doctor's Request — CT Scan       │📅 │
│  │ Status: Accepted                 │   │
│  │ [📅 BOOK AT RADIOLOGY CENTER]    │   │
│  └──────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Features**:
- Fetches orders from: `GET /api/DoctorOrders/MyOrders?patientId={id}`
- Filter by status: All, Action Required, Accepted, Booked, Declined
- Accept/Decline orders: `PATCH /api/DoctorOrders/{id}/Respond`
- Click "BOOK AT RADIOLOGY CENTER" → Navigate to BookFromOrderPage with order data

---

### Page 2: Book From Order (New)
**URL**: `http://localhost:5173/patient/book-from-order`
**File**: `src/pages/patient/BookFromOrderPage.jsx`

```
┌──────────────────────────────────────────────┐
│ Book Appointment at Radiology Center         │
│ For: MRI                                     │
├──────────────────────────────────────────────┤
│                                              │
│  1️⃣  Test Type (Auto-selected)              │
│  └─ 🔬 MRI - Modality: XR                   │
│                                              │
│  👤 Patient Information (Auto-filled)        │
│  ├─ Name: Hazem Ahmed                       │
│  ├─ Email: hazem@gmail.com                  │
│  ├─ Phone: 010022123344                     │
│  ├─ Gender: Male                            │
│  ├─ Insurance: UNITED INS                   │
│  └─ DOB: May 6, 1990                        │
│                                              │
│  2️⃣  Select Date                            │
│  └─ [📅 calendar input]                     │
│                                              │
│  3️⃣  Select Time Slot                       │
│  ├─ [09:00] [10:00] [11:00] [14:00]        │
│  └─ [15:00] [16:00] [17:00] [18:00]        │
│                                              │
│  4️⃣  Payment & Confirmation                 │
│  ├─ Payment Method:                         │
│  │  [💵 Cash] [🏥 Insurance] [💳 Card]      │
│  ├─ Notes (Optional): [textarea]            │
│  ├─ ☐ I agree to terms                      │
│  └─ [Cancel] [✓ Confirm Booking]            │
│                                              │
└──────────────────────────────────────────────┘
```

**Features**:
- Auto-fills patient info from: `GET /api/Patient/{patientId}`
- Service auto-selected based on testName matching
- Fetches slots from: `GET /api/radiologyservices` + `GET /api/slots?serviceId={id}&date={date}`
- Books appointment: `POST /api/radiologycontroller/bookappointment`
- Updates order status: `PATCH /api/DoctorOrders/{orderId}/Book`

---

## 🔗 API Endpoints Used

### Eye Clinic Backend (Port 5201)

```
GET  /api/DoctorOrders/MyOrders?patientId={id}
     └─ Returns: List of DoctorOrder objects
        {
          id, patientId, status, orderType, dataJson,
          createdAt, respondedAt, appointmentDate, appointmentTime
        }

PATCH /api/DoctorOrders/{id}/Respond
      └─ Body: { action: "Accepted|Rejected", rejectionReason? }
      └─ Returns: Updated order

PATCH /api/DoctorOrders/{id}/Book
      └─ Body: { appointmentDate, appointmentTime, externalSystemConfirmationId? }
      └─ Returns: Updated order with status "Booked"

GET  /api/Patient/{patientId}
     └─ Returns: Patient with phone, address, gender, dateOfBirth, insurance
```

### Radiology Center Backend (Port 5301)

```
GET  /api/radiologyservices
     └─ Returns: List of available services
        { id, code, display, modality, durationMin, price, isActive }

GET  /api/slots?serviceId={id}&date={YYYY-MM-DD}
     └─ Returns: Available time slots
        { id, start, end, status }

POST /api/radiologycontroller/bookappointment
     └─ Body: {
          orderId, patientId, patientName, patientEmail,
          patientPhone, serviceId, serviceName,
          appointmentDate, appointmentTime,
          paymentMethod, notes, testName
        }
     └─ Returns: { success: true, appointmentId }
```

---

## 🗂️ Files Created/Modified

### Created
1. **`src/pages/patient/MyDoctorRequestsPage.jsx`** (560 lines)
   - Displays list of doctor orders
   - Allows Accept/Decline/Book actions
   - Filters by status

2. **`src/pages/patient/BookFromOrderPage.jsx`** (650 lines)
   - Auto-fills patient and test data
   - 4-step booking wizard
   - Sync back to clinic after booking

### Modified
1. **`src/App.jsx`**
   - Added React Router Routes
   - New patient routes: `/patient/orders`, `/patient/book-from-order`
   - Imported new components

---

## 🚀 How to Test

### Prerequisites
- All 3 services running:
  ```bash
  # Terminal 1: Eye Clinic
  cd Modules/ClinicSystem/Backend && dotnet run
  
  # Terminal 2: Radiology
  cd Modules/RadiologyCenter/Backend && dotnet run
  
  # Terminal 3: Frontend
  cd Modules/RadiologyCenter/Frontend && npm run dev
  ```

- Patient logged in (stored in localStorage)

### Test Flow

**Step 1**: Navigate to doctor requests
```
http://localhost:5173/patient/orders
```

**Step 2**: View your doctor orders
- Should show list of requests from Eye Clinic
- Status: "Action Required", "Accepted", "Booked", etc.

**Step 3**: Accept a request
- Click "Accept" button
- Order status changes to "Accepted"
- "BOOK AT RADIOLOGY CENTER" button appears

**Step 4**: Click booking button
- Redirects to: `/patient/book-from-order`
- Patient info auto-filled ✓
- Test type auto-selected ✓

**Step 5**: Select date
- Calendar opens
- Choose any date in future

**Step 6**: Select time
- 8 time slots appear
- Choose one

**Step 7**: Select payment
- Choose: Cash, Insurance (if has insurance), or Card

**Step 8**: Confirm booking
- Accept terms checkbox
- Click "✓ Confirm Booking"
- Success message appears
- Redirects back to `/patient/orders`
- Order status now "Booked" ✓

---

## 🔐 FHIR/HL7 Integration

### Auto-filled fields use FHIR mapping:

```
FHIR Patient Resource → UI Fields
├─ Patient.name[0].family       → Last Name
├─ Patient.name[0].given[0]     → First Name
├─ Patient.telecom[phone]       → Phone
├─ Patient.telecom[email]       → Email
├─ Patient.address[0].text      → Address
├─ Patient.birthDate            → Date of Birth
├─ Patient.gender               → Gender
└─ Patient.contact              → Insurance Info

FHIR ServiceRequest → Booking Data
├─ ServiceRequest.code          → testCode
├─ ServiceRequest.subject       → patientId
└─ ServiceRequest.authoredOn    → createdAt
```

### Backend logs FHIR segments during booking:

```
[PID] PATIENT IDENTIFICATION SEGMENT
[OBX] OBSERVATION SEGMENT
[ORM^O01] ORDER MESSAGE
[ACK^O01] ACKNOWLEDGEMENT
```

---

## 🎯 User Journey

```
1. Patient logs in to Radiology Portal
   ↓
2. Navigates to http://localhost:5173/patient/orders
   ↓
3. Sees list of doctor requests from Eye Clinic
   ├─ Test name (MRI, CT, X-Ray, etc.)
   ├─ Doctor name
   ├─ Request date
   └─ Action buttons (Accept/Decline/Book)
   ↓
4. Clicks "Accept" on a request
   ├─ Status changes to "Accepted"
   └─ "BOOK" button becomes available
   ↓
5. Clicks "BOOK AT RADIOLOGY CENTER"
   ↓
6. Booking form opens with AUTO-FILLED data:
   ├─ Patient name ✓
   ├─ Email ✓
   ├─ Phone ✓
   ├─ Address ✓
   ├─ Test type ✓
   └─ Service already selected ✓
   ↓
7. Patient only needs to:
   ├─ SELECT: Date
   ├─ SELECT: Time slot
   ├─ SELECT: Payment method
   └─ CONFIRM: Terms agreement
   ↓
8. Click "✓ Confirm Booking"
   ↓
9. Appointment confirmed and synced to Eye Clinic
   ├─ Order status: "Booked"
   ├─ Radiology backend logs [ORM^O01] message
   └─ Eye Clinic updated via PATCH /DoctorOrders/{id}/Book
   ↓
10. Success message + redirect to /patient/orders
    └─ Patient sees "✓ Appointment Booked" status
```

---

## 🐛 Troubleshooting

### Issue: "No doctor requests found"
- **Cause**: No orders in clinic database for this patient
- **Fix**: Create order from Eye Clinic doctor interface first

### Issue: "Unable to load services"
- **Cause**: Radiology backend not running on 5301
- **Fix**: Start radiology backend: `cd Modules/RadiologyCenter/Backend && dotnet run`

### Issue: "Patient fields empty"
- **Cause**: Patient not found in clinic database
- **Fix**: Ensure patientId stored in localStorage matches clinic database

### Issue: "No available slots"
- **Cause**: No slots configured for selected service/date
- **Fix**: Radiology admin needs to add slots in database

### Issue: "Booking fails with CORS error"
- **Status**: Already fixed - CORS enabled in Program.cs

---

## ✨ Key Features

✅ **End-to-end order to booking workflow**
✅ **Auto-fill from FHIR/HL7 database**
✅ **Minimal user input required** (only Date, Time, Payment)
✅ **Real-time order status sync**
✅ **Comprehensive data validation**
✅ **Error handling & user feedback**
✅ **Mobile responsive design**
✅ **Terminal logging** (FHIR segments visible)

---

## 📊 Expected Terminal Output

### Terminal 2 (Radiology Backend) - When Booking

```
║ INCOMING ORDERREquest - Book Appointment
║ From: Frontend (5173) → Radiology (5301)  
║ Timestamp: 2026-05-06 14:30:40.500
║ Patient: Hazem Ahmed (P-000001)
║ Test: MRI
║ Date: 2026-05-15 10:00 AM
║ Payment: Cash

[ORM^O01] ORDER MESSAGE BUILT
[PID] PATIENT SEGMENT: P-000001 Hazem Ahmed
[OBR] ORDER DETAIL SEGMENT: MRI Service
[NTE] NOTE SEGMENT: Booking from patient portal
```

---

## 🎉 Success Indicators

When testing, you should see:
- ✓ Doctor requests list loads
- ✓ Accept button works
- ✓ Booking page opens
- ✓ Patient info pre-filled
- ✓ Test type auto-selected
- ✓ Date/time slots load
- ✓ Booking succeeds
- ✓ Order status changes to "Booked"
- ✓ Terminal shows FHIR/HL7 segments
- ✓ Eye Clinic backend updates order status

---

**Status**: ✅ **COMPLETE & READY TO TEST**
