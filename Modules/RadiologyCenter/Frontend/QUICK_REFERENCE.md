# Quick Reference - Appointment Workflow System

## Status Codes

```
0 = PENDING    (Waiting for receptionist approval)
1 = CONFIRMED  (Receptionist approved)
2 = COMPLETED  (Appointment finished)
3 = CANCELLED  (Cancelled by patient or receptionist)
```

---

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **BookAppointmentPage** | `/Pages/BookAppointmentPage.jsx` | Patient books appointment |
| **PatientAppointments** | `/Pages/PatientAppointments.jsx` | Patient views history with filters |
| **OnlineRequestsPage** | `/Appointment/OnlineRequestsPage.jsx` | Receptionist sees pending requests |
| **ReceptionistDashboard** | `/Appointment/ReceptionistDashboard.jsx` | Receptionist overview & statistics |

---

## Important Functions

### BookAppointmentPage - Create Appointment
```javascript
const handleSubmit = async (appointmentData) => {
  appointmentData.status = 0; // PENDING
  const response = await appointmentsAPI.create(appointmentData);
  if (response) {
    localStorage.setItem('patientId', appointmentData.patientId);
    setBookingSuccess(true); // Show confirmation
  }
};
```

### PatientAppointments - Filter & Cancel
```javascript
// Filter by status
const filteredAppointments = appointments.filter(apt => 
  apt.status === filterValue
);

// Cancel appointment (patient)
const handleCancelAppointment = async (appointmentId) => {
  await fetch(`/api/Appointments/${appointmentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 3, cancelledBy: 'patient' })
  });
};
```

### OnlineRequestsPage - Confirm/Reject
```javascript
// Confirm pending appointment
const handleConfirm = async (appointmentId) => {
  await fetch(`/api/Appointments/${appointmentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 1, confirmedBy: 'receptionist' })
  });
};

// Reject pending appointment
const handleReject = async (appointmentId) => {
  await fetch(`/api/Appointments/${appointmentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 3, cancelledBy: 'receptionist' })
  });
};
```

---

## API Endpoints Cheat Sheet

### Patient
```
POST   /api/Appointments/create                  → Create appointment (status=0)
GET    /api/Appointments/ByPatient/{patientId}   → Get patient's appointments
PATCH  /api/Appointments/{appointmentId}         → Cancel appointment (status=3)
```

### Receptionist
```
GET    /api/Appointments                         → Get all appointments (filter status=0)
PATCH  /api/Appointments/{appointmentId}         → Confirm (status=1) or Mark complete (status=2)
PATCH  /api/Appointments/{appointmentId}         → Reject (status=3)
```

---

## Status Transitions

```
Patient Books
     ↓
Status 0: PENDING
├─ Receptionist confirms → Status 1: CONFIRMED
├─ Receptionist rejects  → Status 3: CANCELLED
└─ Patient cancels       → Status 3: CANCELLED

Status 1: CONFIRMED
├─ Receptionist completes → Status 2: COMPLETED
└─ Patient/Receptionist cancels → Status 3: CANCELLED

Status 2: COMPLETED (Final)
Status 3: CANCELLED (Final)
```

---

## Frontend Data Flow

```
PATIENT SIDE:
Patient Books → Store patientId → Show Confirmation → Link to History
     ↓
PatientAppointments → Fetch appointments → Filter by status → Display cards

RECEPTIONIST SIDE:
ReceptionistDashboard → Click "Pending Requests" → OnlineRequestsPage
     ↓
OnlineRequestsPage → Fetch status=0 → Show pending requests → Confirm/Reject
     ↓
Status updates in database → Patient sees change after refresh
```

---

## Database Query Examples

```sql
-- Get pending appointments
SELECT * FROM Appointments WHERE Status = 0;

-- Get patient's appointments
SELECT * FROM Appointments WHERE PatientId = 'P-0912345';

-- Get appointments by status and date
SELECT * FROM Appointments 
WHERE Status = 1 AND DATE(AppointmentDate) = '2026-02-15';

-- Count appointments by status
SELECT Status, COUNT(*) as Count 
FROM Appointments 
GROUP BY Status;

-- Show cancellation source
SELECT AppointmentId, PatientName, Status, CancelledBy 
FROM Appointments 
WHERE Status = 3;
```

---

## Testing Quick Commands

### Test Booking
1. Navigate to `/book-appointment`
2. Fill all 5 steps
3. Click "Book Appointment"
4. Should see "Booking Request Sent Successfully!"
5. Note the Patient ID shown in confirmation

### Test Patient History
1. Navigate to `/patient/appointments`
2. Should see appointment under "Pending" filter
3. Click "Refresh" button (if added)
4. Verify appointment appears

### Test Receptionist
1. Navigate to receptionist pending requests page
2. Should see pending appointments
3. Click "Confirm" on any appointment
4. Should disappear from list
5. Patient refreshes → sees "Confirmed" status

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Appointment not appearing in patient history | PatientId mismatch | Check localStorage['patientId'] |
| Receptionist can't see pending requests | Status filter wrong | Ensure filtering by status=0 |
| Status doesn't update | API error | Check network tab, verify request body |
| Page keeps refreshing | Polling not removed | Check for setInterval in useEffect |
| Full width not working | CSS width constraint | Check appointment-container width |

---

## Key Files Changed

1. **BookAppointmentPage.jsx** - Added patientId storage
2. **PatientAppointments.jsx** - Updated status codes, removed polling
3. **OnlineRequestsPage.jsx** - Changed to filter status=0 for all appointments
4. **BookAppointment.css** - Full-width layout updates

---

## Important Notes

✅ **Already Done**:
- Patient can book appointments
- Receptionist can see pending requests
- Receptionist can confirm/reject
- Patient can cancel anytime
- Both systems show correct status
- Full-width responsive design

⏳ **Not Yet Implemented** (Future):
- Email notifications on status change
- SMS notifications
- Real-time updates (WebSocket)
- Appointment reminders
- Payment processing

---

## Contact & Support

For documentation:
- Full design: `APPOINTMENT_WORKFLOW_DESIGN.md`
- Implementation: `IMPLEMENTATION_SUMMARY.md`
- Complete guide: `WORKFLOW_COMPLETE_GUIDE.md`
- This file: `QUICK_REFERENCE.md`
