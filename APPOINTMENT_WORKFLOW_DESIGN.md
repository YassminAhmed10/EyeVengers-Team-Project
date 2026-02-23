# Appointment Booking Workflow System Design

## System Overview

A synchronized two-system appointment management workflow between Patient Portal and Receptionist Dashboard with real-time status updates.

---

## Database Status Codes

```
Status 0: PENDING
- Initial state when patient books an appointment
- Awaiting receptionist approval
- Visible in: Receptionist Dashboard (Online Requests)

Status 1: CONFIRMED
- Receptionist has approved the appointment
- Patient notified of confirmation
- Visible in: Patient Appointment History (Confirmed filter)

Status 2: COMPLETED
- Appointment visit has been finished
- Final state for successful appointments
- Visible in: Patient Appointment History (Completed filter)

Status 3: CANCELLED
- Appointment has been cancelled
- Can be cancelled by: Patient or Receptionist
- Stores: cancelledBy (patient/receptionist)
- Visible in: Patient Appointment History (Cancelled filter)
```

---

## API Endpoints

### Patient Endpoints

#### 1. Create Appointment
```
POST /api/Appointments/create
Body: {
  patientId: string
  patientName: string
  phone: string
  email: string
  appointmentDate: DateTime
  appointmentTime: string
  doctorId: number
  reasonForVisit: string
  status: 0 (PENDING)
  paymentStatus: "Pending"
  finalPrice: number
  insuranceCompany?: string
  ...other fields
}
Response: { appointmentId, status: 0 }
```

#### 2. Get Patient's Appointments
```
GET /api/Appointments/ByPatient/{patientId}
Response: [
  {
    appointmentId: number
    patientName: string
    appointmentDate: DateTime
    appointmentTime: string
    status: 0|1|2|3
    cancelledBy?: "patient"|"receptionist"
    ...other fields
  }
]
```

#### 3. Cancel Appointment (Patient)
```
PATCH /api/Appointments/{appointmentId}
Body: {
  status: 3 (CANCELLED)
  cancelledBy: "patient"
}
Response: { success: true, appointmentId, status: 3 }
```

### Receptionist Endpoints

#### 1. Get All Pending Requests
```
GET /api/Appointments
Query: ?status=0
Response: [
  { appointmentId, patientName, status: 0, ... }
]
```

#### 2. Confirm Appointment (Pending → Confirmed)
```
PATCH /api/Appointments/{appointmentId}
Body: {
  status: 1 (CONFIRMED)
  confirmedBy: "receptionist"
  confirmationTime: DateTime
}
Response: { 
  success: true
  appointmentId
  status: 1
  message: "Appointment confirmed"
}
```

#### 3. Mark as Completed (Confirmed → Completed)
```
PATCH /api/Appointments/{appointmentId}
Body: {
  status: 2 (COMPLETED)
  completedTime: DateTime
  doctorNotes?: string
}
Response: {
  success: true
  appointmentId
  status: 2
  message: "Appointment marked as completed"
}
```

#### 4. Cancel Appointment (Receptionist)
```
PATCH /api/Appointments/{appointmentId}
Body: {
  status: 3 (CANCELLED)
  cancelledBy: "receptionist"
  cancellationReason?: string
}
Response: {
  success: true
  appointmentId
  status: 3
}
```

---

## Role-Based Access Control

### Patient Role
**Permissions:**
- ✅ Create new appointment
- ✅ View own appointments (all statuses)
- ✅ Cancel Pending/Confirmed appointments
- ✅ View appointment details
- ❌ Cannot modify other patients' appointments
- ❌ Cannot confirm/complete appointments
- ❌ Cannot access receptionist features

**Access Control:**
```javascript
// In PatientAppointments.jsx
const patientId = localStorage.getItem('patientId');
// Only fetch appointments where ByPatient/{patientId}

// Cancel button visible only for status 0 and 1
{(appointment.status === 0 || appointment.status === 1) && (
  <button onClick={() => handleCancelAppointment(appointmentId)}>
    Cancel
  </button>
)}
```

### Receptionist Role
**Permissions:**
- ✅ View all pending appointments (status = 0)
- ✅ Confirm appointments (0 → 1)
- ✅ Mark appointments as completed (1 → 2)
- ✅ Cancel appointments (0/1 → 3)
- ✅ View appointment details
- ✅ Access dashboard statistics
- ❌ Cannot create appointments (patient-only)
- ❌ Cannot view other patient's data directly
- ❌ Cannot modify patient personal information

**Access Control:**
```javascript
// Verify user role from localStorage/token
const userRole = localStorage.getItem('userRole'); // 'receptionist'
if (userRole !== 'receptionist') {
  navigate('/unauthorized');
}

// API calls restricted to PATCH with status updates only
```

---

## System Components

### 1. BookAppointmentPage (Patient Portal)
**Functionality:**
- Multi-step form for appointment booking
- Collects patient, appointment, medical, insurance info
- Creates appointment with status = 0 (PENDING)
- Stores patientId in localStorage
- Shows success confirmation
- Provides link to Appointment History

**Key Functions:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const appointmentData = {
    patientId: formData.patientId,
    status: 0, // PENDING
    ...allFormData
  };
  
  const response = await appointmentsAPI.create(appointmentData);
  
  if (response) {
    // Store patientId for future reference
    localStorage.setItem('patientId', appointmentData.patientId);
    
    // Show success and navigation options
    setBookingSuccess(true);
    // Links to Appointment History where patient can track status
  }
};
```

### 2. PatientAppointments (Appointment History)
**Functionality:**
- Displays all appointments for logged-in patient
- Filters by status: All, Pending, Confirmed, Completed, Cancelled
- Shows status labels with icons
- Allows cancellation of Pending/Confirmed appointments
- Shows who cancelled (patient or clinic)
- Manual refresh button (no auto-polling)

**Status Display:**
```javascript
const getStatusLabel = (status, appointment) => {
  switch(status) {
    case 0: return 'Pending'; // Awaiting receptionist approval
    case 1: return 'Confirmed'; // Receptionist approved
    case 2: return 'Completed'; // Appointment finished
    case 3: 
      const cancelledBy = appointment?.cancelledBy;
      return cancelledBy === 'patient' 
        ? 'Cancelled by You' 
        : 'Cancelled by Clinic';
  }
};
```

**Manual Refresh:**
- Fetch button: "Refresh Appointments"
- One-time load on page open
- No automatic polling
- Patient controls refresh timing

### 3. OnlineRequestsPage (Receptionist Dashboard)
**Functionality:**
- Lists all pending appointments (status = 0)
- Search by patient name, ID, phone
- Filter by doctor
- Shows: Patient info, appointment date/time, reason for visit
- Two action buttons: Confirm, Reject
- Modal for detailed view before confirming

**Confirmation Flow:**
```javascript
const handleConfirm = async (appointmentId) => {
  const response = await fetch(`/api/Appointments/${appointmentId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 1, // CONFIRMED
      confirmedBy: 'receptionist'
    })
  });
  
  // Appointment automatically moves out of this list
  // Patient sees update in their history (after refresh)
  // Notification sent to patient (optional)
};
```

**Rejection Flow:**
```javascript
const handleReject = async (appointmentId) => {
  const response = await fetch(`/api/Appointments/${appointmentId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 3, // CANCELLED
      cancelledBy: 'receptionist'
    })
  });
  
  // Appointment moves to Cancelled section
  // Patient sees in their Cancelled filter
};
```

### 4. ReceptionistDashboard (Status Overview)
**Functionality:**
- Shows statistics for selected date
- Cards displaying:
  - Total Online Appointments
  - Total Offline Appointments
  - All Appointments
  - Pending Online Requests (clickable → goes to Online Requests page)
- Recent appointments (Today's list)
- Upcoming appointments (future dates)

**Statistics Calculation:**
```javascript
// Backend should return:
// - totalOnlineAppointments (all online bookings)
// - totalOfflineAppointments (manual bookings)
// - totalAppointments (sum of both)
// - pendingOnlineRequests (status = 0 count)
```

---

## Synchronization Flow

### Scenario 1: Patient Books → Receptionist Confirms

```
1. PATIENT BOOKS APPOINTMENT
   ↓
   POST /api/Appointments/create
   - Status: 0 (PENDING)
   - Stored in database
   - patientId saved in localStorage
   ↓
   Appointment visible in Patient History (Pending filter)

2. RECEPTIONIST SEES PENDING REQUEST
   ↓
   GET /api/Appointments (status=0 filter)
   - Shows in Online Requests page
   - Receptionist reviews details

3. RECEPTIONIST CONFIRMS
   ↓
   PATCH /api/Appointments/{id}
   - Status: 0 → 1 (CONFIRMED)
   - confirmedBy: 'receptionist'
   - confirmationTime recorded
   ↓
   Notification sent to patient (email/SMS)

4. PATIENT SEES UPDATE
   ↓
   Patient refreshes Appointment History
   - Appointment moved from Pending → Confirmed
   - Status label shows "Confirmed"
   - Cancel button still available
```

### Scenario 2: Receptionist Marks as Completed

```
1. APPOINTMENT CONFIRMED
   - Status: 1 (CONFIRMED)
   - Visible in patient's Confirmed filter

2. APPOINTMENT DATE ARRIVES
   - Patient attends visit
   - Doctor completes examination

3. RECEPTIONIST MARKS COMPLETE
   ↓
   PATCH /api/Appointments/{id}
   - Status: 1 → 2 (COMPLETED)
   - completedTime recorded
   - optionally: doctorNotes
   ↓
   Status updated in database

4. PATIENT SEES UPDATE
   ↓
   Patient refreshes Appointment History
   - Appointment moved from Confirmed → Completed
   - Status shows "Completed"
   - Cancel button disappears
```

### Scenario 3: Patient or Receptionist Cancels

```
PATIENT CANCELS (Status 0 or 1):
  PATCH /api/Appointments/{id}
  - Status: 0/1 → 3 (CANCELLED)
  - cancelledBy: 'patient'
  - Visible in Appointment History as "Cancelled by You"

RECEPTIONIST CANCELS (Status 0 or 1):
  PATCH /api/Appointments/{id}
  - Status: 0/1 → 3 (CANCELLED)
  - cancelledBy: 'receptionist'
  - Visible in Appointment History as "Cancelled by Clinic"
  - Appointment removed from Online Requests
```

---

## Notifications System (Optional)

### When to Notify Patient

1. **Appointment Confirmed**
   - Trigger: Status 0 → 1
   - Message: "Your appointment on [DATE] at [TIME] has been confirmed. Clinic: [CLINIC]. Doctor: [DOCTOR]"
   - Channels: Email, SMS (if available)

2. **Appointment Cancelled (by clinic)**
   - Trigger: Status 0/1 → 3 (cancelledBy='receptionist')
   - Message: "Your appointment on [DATE] has been cancelled. Please call to reschedule."
   - Channels: Email, SMS

3. **Appointment Completed**
   - Trigger: Status 1 → 2
   - Message: "Thank you for visiting! Your appointment has been completed."
   - Channels: Email

**Notification Implementation:**
```javascript
// After successful status update
if (newStatus === 1) {
  // Send confirmation notification
  await fetch('/api/Notifications/send', {
    method: 'POST',
    body: JSON.stringify({
      appointmentId,
      patientEmail,
      type: 'CONFIRMED',
      data: { date, time, doctor }
    })
  });
}
```

---

## Frontend Implementation Details

### PatientAppointments.jsx - Filter Logic

```javascript
const filteredAppointments = appointments.filter(apt => {
  if (filter === 'all') return true;
  if (filter === 'pending') return apt.status === 0;
  if (filter === 'confirmed') return apt.status === 1;
  if (filter === 'completed') return apt.status === 2;
  if (filter === 'cancelled') return apt.status === 3;
  return true;
});

// Display filter buttons with counts
<button onClick={() => setFilter('pending')}>
  Pending ({appointments.filter(a => a.status === 0).length})
</button>
```

### OnlineRequestsPage.jsx - Pending Requests

```javascript
// Fetch all appointments with status = 0
const response = await fetch('https://localhost:7071/api/Appointments');
const data = await response.json();
const pending = data.filter(apt => apt.status === 0);
setOnlineRequests(pending);

// After confirm/reject, remove from list
setOnlineRequests(prev => 
  prev.filter(req => req.appointmentId !== appointmentId)
);
```

---

## Database Schema Considerations

### Appointments Table

```sql
CREATE TABLE Appointments (
  AppointmentId INT PRIMARY KEY,
  PatientId VARCHAR(50) NOT NULL,
  PatientName NVARCHAR(255),
  AppointmentDate DATETIME,
  AppointmentTime VARCHAR(5),
  DoctorId INT,
  Status INT, -- 0=Pending, 1=Confirmed, 2=Completed, 3=Cancelled
  CancelledBy VARCHAR(50), -- 'patient' or 'receptionist'
  CancellationReason NVARCHAR(MAX),
  ConfirmedTime DATETIME,
  CompletedTime DATETIME,
  ConfirmedBy VARCHAR(50),
  PaymentStatus VARCHAR(50),
  FinalPrice DECIMAL(10,2),
  CreatedAt DATETIME,
  UpdatedAt DATETIME,
  ...other fields
);
```

### Key Indexes
```sql
CREATE INDEX idx_patient_id ON Appointments(PatientId);
CREATE INDEX idx_status ON Appointments(Status);
CREATE INDEX idx_appointment_date ON Appointments(AppointmentDate);
```

---

## Security & Validation

### Input Validation

```javascript
// Patient creating appointment
if (!patientId || !patientName || !appointmentDate) {
  return { error: 'Missing required fields' };
}

if (appointmentDate < new Date()) {
  return { error: 'Cannot book appointment in the past' };
}
```

### Authorization Checks

```javascript
// Receptionist updating status
const userRole = getUserRole(); // from token/session
if (userRole !== 'receptionist') {
  return { statusCode: 403, error: 'Unauthorized' };
}

// Patient cancelling own appointment
const appointmentPatientId = getAppointmentById(id).patientId;
const currentPatientId = getCurrentUserId();
if (appointmentPatientId !== currentPatientId) {
  return { statusCode: 403, error: 'Cannot cancel other patient appointments' };
}
```

---

## Implementation Checklist

- [x] Status codes defined (0, 1, 2, 3)
- [x] API endpoints for create, read, update
- [x] Patient Portal (BookAppointmentPage + PatientAppointments)
- [x] Receptionist Dashboard (OnlineRequestsPage)
- [x] Status filtering on both systems
- [x] Cancel functionality with role checks
- [x] Role-based access control
- [ ] Email notifications on status change
- [ ] SMS notifications (optional)
- [ ] Audit logging for all status changes
- [ ] Rate limiting on API endpoints
- [ ] Error handling and user feedback
- [ ] Performance optimization for large datasets

---

## Testing Scenarios

### Test Case 1: Full Booking → Confirmation → Completion
1. Patient books appointment (status = 0)
2. Verify appears in Receptionist Dashboard
3. Receptionist confirms (status = 1)
4. Patient refreshes and sees Confirmed
5. Receptionist marks complete (status = 2)
6. Patient refreshes and sees Completed

### Test Case 2: Patient Cancellation
1. Patient books appointment (status = 0)
2. Patient cancels from Appointment History
3. Status changes to 3 (Cancelled)
4. Shows "Cancelled by You"
5. Appointment removed from Receptionist Dashboard

### Test Case 3: Receptionist Rejection
1. Patient books appointment (status = 0)
2. Receptionist rejects from Online Requests
3. Status changes to 3 (Cancelled)
4. Patient sees "Cancelled by Clinic"
5. Notification sent to patient

---

## Performance Considerations

1. **Database Queries**
   - Index on Status field for quick filtering
   - Index on PatientId for patient queries
   - Index on AppointmentDate for date range queries

2. **API Response Time**
   - Limit results with pagination
   - Cache common queries (doctor list, statistics)
   - Use async/await for parallel requests

3. **Frontend Optimization**
   - Load only necessary appointment fields
   - Implement virtual scrolling for large lists
   - Use React.memo for list items
   - Lazy load modal content

4. **Caching Strategy**
   - Cache patient's appointment list (refresh on action)
   - Cache doctor list (stable, refresh daily)
   - Cache statistics (refresh on date change)

---

## Future Enhancements

1. Real-time updates using WebSockets
2. Automatic SMS/Email notifications
3. Appointment reminders (24h, 1h before)
4. Rescheduling functionality
5. Bulk appointment operations
6. Analytics dashboard
7. Payment processing integration
8. Video consultation support
