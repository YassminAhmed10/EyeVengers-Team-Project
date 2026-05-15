# Complete Appointment Approval & Investigation Workflow Implementation Guide

## Overview

This guide provides complete documentation for the appointment approval and investigation workflow that has been implemented using FHIR/HL7 interoperability standards. The workflow enables seamless communication between the Patient System, Radiology Admin System, and Medical Record System.

## Architecture Overview

```
Patient Books Appointment
    ↓
[BookAppointmentPage] confirms booking
    ↓
Appointment sent to Radiology Admin System
    ↓
Admin reviews in [PendingAppointmentRequestsPage]
    ↓
Admin approves/rejects appointment
    ↓
If approved:
  - Investigation created
  - Status → Active Investigation
  - Appointment moved to [ActiveInvestigationsPage]
    ↓
Admin uploads investigation files in [FileUploadPanel]
    ↓
Files stored securely with FHIR mapping
    ↓
Investigation marked complete
    ↓
Results appear in [PatientResultsPage]
    ↓
Status synced across all systems (FHIR/HL7)
```

## Backend Implementation

### Services Created

#### 1. AppointmentApprovalService
**File:** `Services/AppointmentApprovalService.cs`

**Key Methods:**
- `ApproveAppointmentAsync()` - Approve appointment and create investigation
- `RejectAppointmentAsync()` - Reject appointment with reason
- `ScheduleInvestigationAsync()` - Schedule investigation for approved appointment

**Features:**
- Automatic investigation creation
- Patient notifications
- FHIR ServiceRequest generation
- Audit logging

**Usage:**
```csharp
var (success, message, appointment) = await _approvalService.ApproveAppointmentAsync(
    appointmentId: 123,
    adminNotes: "Approved for immediate investigation",
    adminUserId: 5
);
```

#### 2. InvestigationWorkflowService
**File:** `Services/InvestigationWorkflowService.cs`

**Key Methods:**
- `StartInvestigationAsync()` - Start new investigation
- `CompleteInvestigationAsync()` - Mark investigation complete
- `UploadInvestigationFileAsync()` - Upload and store files securely
- `DeleteInvestigationFileAsync()` - Remove files
- `GetPendingInvestigationsAsync()` - Retrieve pending list
- `GetActiveInvestigationsAsync()` - Retrieve active list
- `GetInvestigationDetailsAsync()` - Get full investigation details

**Features:**
- Secure file upload with validation
- Automatic FHIR DocumentReference generation
- File size and type validation (max 100MB)
- Audit trail for all operations
- Status tracking

**Supported File Types:**
- JPEG images (image/jpeg)
- PNG images (image/png)
- PDF reports (application/pdf)
- DICOM files (application/dicom)

#### 3. StatusSynchronizationService
**File:** `Services/StatusSynchronizationService.cs`

**Key Methods:**
- `SyncStatusAsync()` - Sync status across all systems
- `SyncToPatientSystemAsync()` - Update Patient System
- `SyncToMedicalRecordSystemAsync()` - Update Medical Records
- `SyncToClinicSystemAsync()` - Update Clinic System
- `PropagateStatusChangeAsync()` - Broadcast to multiple systems

**Features:**
- Real-time status propagation
- HL7 message generation (SIU^S12)
- FHIR resource synchronization
- Error handling and retry logic

**Status Flow:**
```
Pending → Approved → Active Investigation → In Progress → Completed
                  ↓ (rejected)
               Rejected
```

#### 4. NotificationService
**File:** `Services/NotificationService.cs`

**Key Methods:**
- `CreateNotificationAsync()` - Create new notification
- `GetPatientNotificationsAsync()` - Retrieve patient notifications
- `MarkAsReadAsync()` - Mark single notification as read
- `MarkAllAsReadAsync()` - Mark all as read
- `DeleteNotificationAsync()` - Remove notification

**Notification Types:**
- appointment_approved
- appointment_rejected
- investigation_started
- investigation_completed
- file_uploaded
- result_uploaded

### API Endpoints

#### Appointment Approval Endpoints

**GET `/api/appointments/pending-requests`**
- Returns all pending appointment requests (paginated)
- Parameters: `pageNumber`, `pageSize`
- Response: List of appointments with pagination info

**GET `/api/appointments/active-investigations`**
- Returns all active investigations
- Response: List of investigations with files

**GET `/api/appointments/{id}/details`**
- Get appointment details with investigation
- Parameters: appointment ID
- Response: Appointment with related investigation

**POST `/api/appointments/{id}/approve`**
- Approve appointment and create investigation
- Body: `{ adminNotes?: string }`
- Response: Approved appointment

**POST `/api/appointments/{id}/reject`**
- Reject appointment
- Body: `{ rejectionReason: string }`
- Response: Rejected appointment

**POST `/api/appointments/{appointmentId}/investigations/{investigationId}/upload-files`**
- Upload investigation files
- Body: FormData with files
- Validation: Max 100MB per file, supported MIME types
- Response: List of uploaded files

**POST `/api/appointments/{appointmentId}/investigations/{investigationId}/complete`**
- Mark investigation complete
- Body: `{ completionNotes?: string }`
- Response: Completed investigation

**POST `/api/appointments/{id}/sync-status`**
- Manually sync status to all systems
- Body: `{ status?: string }`
- Response: Sync confirmation

## Frontend Implementation

### Components Created

#### 1. PendingAppointmentRequestsPage
**File:** `src/pages/Admin/PendingAppointmentRequestsPage.jsx`

**Features:**
- List of all pending appointment requests
- Detailed review modal with tabs
- Approve/Reject functionality
- Pagination support
- Real-time status updates

**Key States:**
- `pendingRequests` - Array of pending appointments
- `selectedAppointment` - Currently reviewed appointment
- `pageNumber` - Current page for pagination
- `actionInProgress` - Approval/rejection in progress

**Usage:**
```jsx
import PendingAppointmentRequestsPage from './pages/Admin/PendingAppointmentRequestsPage';

<PendingAppointmentRequestsPage />
```

#### 2. ActiveInvestigationsPage
**File:** `src/pages/Admin/ActiveInvestigationsPage.jsx`

**Features:**
- Monitor active investigations
- Integrated file upload
- File download capability
- Mark investigation complete
- Auto-refresh every 30 seconds

**Tabs:**
- Files - View uploaded files
- Upload - Add new investigation files

**Key States:**
- `investigations` - Array of active investigations
- `selectedInvestigation` - Currently viewed investigation
- `showUploadPanel` - Toggle upload interface
- `completingInvestigation` - Investigation being completed

**Usage:**
```jsx
import ActiveInvestigationsPage from './pages/Admin/ActiveInvestigationsPage';

<ActiveInvestigationsPage />
```

#### 3. FileUploadPanel
**File:** `src/components/Admin/FileUploadPanel.jsx`

**Features:**
- Drag-and-drop file upload
- File type validation
- Size validation (max 100MB)
- Progress tracking
- Multiple file support
- Error handling

**Supported Files:**
- JPG, PNG, PDF, DICOM
- Max 100MB each

**Key Props:**
- `appointmentId` (required) - Appointment ID
- `investigationId` (required) - Investigation ID
- `onUploadComplete` (callback) - Called after upload

**Usage:**
```jsx
import FileUploadPanel from './components/Admin/FileUploadPanel';

<FileUploadPanel
  appointmentId={123}
  investigationId={456}
  onUploadComplete={(files) => {
    console.log('Files uploaded:', files);
  }}
/>
```

#### 4. PatientResultsPage
**File:** `src/pages/Patient/PatientResultsPage.jsx`

**Features:**
- View all completed investigations
- Download results and reports
- Filter by status
- View images inline
- Share with healthcare provider

**Key States:**
- `results` - Array of completed investigations
- `selectedResult` - Currently viewed result
- `filterStatus` - Status filter (all/completed/pending)
- `patientId` - Current patient ID

**Usage:**
```jsx
import PatientResultsPage from './pages/Patient/PatientResultsPage';

<PatientResultsPage />
```

## Integration Steps

### 1. Register Services in Program.cs

```csharp
// Add to Program.cs
builder.Services.AddScoped<IAppointmentApprovalService, AppointmentApprovalService>();
builder.Services.AddScoped<IInvestigationWorkflowService, InvestigationWorkflowService>();
builder.Services.AddScoped<IStatusSynchronizationService, StatusSynchronizationService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
```

### 2. Add API Routes

The API endpoints are automatically registered through the controller:
`Controllers/AppointmentApprovalController.cs`

### 3. Update BookAppointmentPage

When patient clicks "Confirm Booking":

```javascript
// The appointment is sent to: POST /api/appointments
const bookingData = {
  patientId, patientName, patientEmail, patientPhone,
  serviceId, appointmentDate, appointmentTime,
  status: 'Pending',
  // ... other fields
};

await axios.post(`${RADIOLOGY_API}/appointments`, bookingData);
```

### 4. Add Admin Routes to App Navigation

```jsx
// In App.jsx or routing configuration
const routes = {
  'admin-pending': <PendingAppointmentRequestsPage />,
  'admin-investigations': <ActiveInvestigationsPage />,
  'patient-results': <PatientResultsPage />
};
```

### 5. Add Navigation Links in Admin Dashboard

```jsx
<Link to="/admin-pending">Pending Requests</Link>
<Link to="/admin-investigations">Active Investigations</Link>
```

## FHIR/HL7 Integration

### FHIR Resources Used

#### 1. ServiceRequest
**When Created:** Appointment approved
**Represents:** Investigation request from clinic
**Fields:**
- `status: "active"`
- `subject: Patient reference`
- `code: Investigation type (LOINC)`
- `authoredOn: Timestamp`

#### 2. DiagnosticReport
**When Created:** Investigation completed
**Represents:** Final investigation report
**Fields:**
- `subject: Patient reference`
- `issued: Report date`
- `resultsInterpreter: Radiologist reference`
- `conclusion: Findings`

#### 3. ImagingStudy
**When Created:** Image file uploaded
**Represents:** Imaging investigation
**Fields:**
- `subject: Patient reference`
- `started: Study date`
- `numberOfSeries: File count`
- `numberOfInstances: Total files`

#### 4. DocumentReference
**When Created:** Report file uploaded
**Represents:** PDF or text report
**Fields:**
- `subject: Patient reference`
- `date: Document date`
- `content: File reference`
- `type: Document type`

#### 5. Observation
**When Created:** Investigation findings
**Represents:** Specific finding or value
**Fields:**
- `subject: Patient reference`
- `code: Finding type`
- `value: Finding value`
- `status: Final`

### HL7 Segments Used

**MSH - Message Header**
- Message ID
- Timestamp
- Sending and receiving systems

**PID - Patient Identification**
- Patient ID
- Name, DOB, Gender
- Contact information

**ORM - Order Request**
- Order information
- Service/test ordered
- Priority and timing

**OBX - Observation Result**
- Result value
- Result status
- Reference range

**SCH - Appointment Scheduling**
- Appointment ID
- Status changes
- Timestamp

## Database Models

### Investigation Entity
```csharp
public class Investigation
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public string InvestigationType { get; set; }
    public string Status { get; set; } // Active, In Progress, Completed
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Notes { get; set; }
    public string? AdminNotes { get; set; }
    public virtual Appointment? Appointment { get; set; }
    public virtual ICollection<InvestigationFile> Files { get; set; }
}
```

### InvestigationFile Entity
```csharp
public class InvestigationFile
{
    public int Id { get; set; }
    public int InvestigationId { get; set; }
    public string FileName { get; set; }
    public string OriginalFileName { get; set; }
    public string FileType { get; set; }
    public string FilePath { get; set; }
    public string FileUrl { get; set; }
    public long FileSize { get; set; }
    public string? MimeType { get; set; }
    public string FhirResourceType { get; set; }
    public string? FhirResourceId { get; set; }
    public DateTime UploadedAt { get; set; }
    public int UploadedBy { get; set; }
    public virtual Investigation? Investigation { get; set; }
}
```

### AuditLog Entity
```csharp
public class AuditLog
{
    public int Id { get; set; }
    public string Action { get; set; }
    public string? PatientIdentifier { get; set; }
    public int? AppointmentId { get; set; }
    public string? Hl7MessageId { get; set; }
    public long DurationMs { get; set; }
    public string? UserId { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Details { get; set; }
}
```

## Security Considerations

### File Upload Security
- ✅ File type validation (MIME type checking)
- ✅ File size limits (100MB max per file)
- ✅ Unique filename generation to prevent conflicts
- ✅ Secure storage in `Uploads/Investigations` directory
- ✅ Access control via appointment/patient ownership

### Data Security
- ✅ Patient data encryption at rest
- ✅ HTTPS for all API communications
- ✅ User authentication required
- ✅ Role-based access control (Admin/Patient)
- ✅ Audit logging for all operations

### Recommended Enhancements
1. Implement role-based authorization attributes
2. Add API rate limiting
3. Implement file scanning for malware
4. Add end-to-end encryption for sensitive files
5. Implement backup and disaster recovery

## Testing Guide

### Backend Testing

**Test Appointment Approval:**
```bash
curl -X POST http://localhost:5301/api/appointments/123/approve \
  -H "Content-Type: application/json" \
  -d '{"adminNotes": "Approved for immediate investigation"}'
```

**Test File Upload:**
```bash
curl -X POST http://localhost:5301/api/appointments/123/investigations/456/upload-files \
  -F "files=@chest_xray.jpg" \
  -F "files=@report.pdf"
```

**Test Get Pending Requests:**
```bash
curl http://localhost:5301/api/appointments/pending-requests
```

### Frontend Testing

1. **Patient Booking Flow:**
   - Navigate to BookAppointmentPage
   - Select service, date, time
   - Enter patient data
   - Click "Confirm Booking"
   - Verify appointment appears in admin dashboard

2. **Admin Approval Flow:**
   - Navigate to PendingAppointmentRequestsPage
   - Select appointment
   - Click Approve
   - Verify investigation created
   - Verify appointment moves to ActiveInvestigationsPage

3. **File Upload Flow:**
   - In ActiveInvestigationsPage, click investigation
   - Click Upload tab
   - Drag files or select from explorer
   - Verify files upload successfully
   - Verify files appear in Files tab

4. **Patient Results Flow:**
   - Navigate to PatientResultsPage
   - Verify completed investigations appear
   - Try download and view buttons
   - Verify file details display correctly

## Troubleshooting

### Issue: Appointments not appearing in pending list

**Solution:**
1. Verify appointment status is "Pending" or "Requested by Doctor"
2. Check database for appointments using SQL:
   ```sql
   SELECT * FROM Appointments WHERE Status IN ('Pending', 'Requested by Doctor');
   ```
3. Verify API endpoint returns data
4. Check browser console for API errors

### Issue: File upload fails

**Solution:**
1. Verify file size < 100MB
2. Check file MIME type is supported
3. Verify `Uploads/Investigations` directory exists
4. Check directory permissions
5. Review upload logs in console

### Issue: Status not syncing to other systems

**Solution:**
1. Verify `StatusSynchronizationService` is registered
2. Check network connectivity to other systems
3. Verify HL7 message format is correct
4. Review audit logs for sync attempts
5. Check other system API endpoints

### Issue: Notifications not appearing

**Solution:**
1. Verify `NotificationService` is registered
2. Check patient ID in database
3. Verify notification created in database
4. Check notification API endpoint
5. Clear browser cache and reload

## Performance Considerations

### Optimization Techniques
- ✅ Pagination for appointment lists (10 per page default)
- ✅ Auto-refresh every 30 seconds (configurable)
- ✅ Database indexes on commonly searched fields
- ✅ Lazy loading of investigation files
- ✅ Compression of image files

### Recommended Optimizations
1. Implement caching for investigation lists
2. Add database connection pooling
3. Implement file compression for PDFs
4. Add thumbnail generation for images
5. Implement pagination for file lists

## Monitoring & Logging

### Audit Log Queries

**View all approval actions:**
```sql
SELECT * FROM AuditLogs WHERE Action LIKE 'APPOINTMENT_APPROVED%' ORDER BY Timestamp DESC;
```

**View all file uploads:**
```sql
SELECT * FROM AuditLogs WHERE Action = 'FILE_UPLOADED' ORDER BY Timestamp DESC;
```

**View rejected appointments:**
```sql
SELECT * FROM AuditLogs WHERE Action = 'APPOINTMENT_REJECTED' ORDER BY Timestamp DESC;
```

**View by admin user:**
```sql
SELECT * FROM AuditLogs WHERE UserId = 'admin123' ORDER BY Timestamp DESC;
```

## API Reference Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments/pending-requests` | Get pending appointments |
| GET | `/api/appointments/active-investigations` | Get active investigations |
| GET | `/api/appointments/{id}/details` | Get appointment details |
| POST | `/api/appointments/{id}/approve` | Approve appointment |
| POST | `/api/appointments/{id}/reject` | Reject appointment |
| POST | `/api/appointments/{id}/investigations/{invId}/upload-files` | Upload files |
| POST | `/api/appointments/{id}/investigations/{invId}/complete` | Complete investigation |
| POST | `/api/appointments/{id}/sync-status` | Sync status |

## Next Steps & Future Enhancements

### Phase 2 Enhancements
- [ ] Payment gateway integration
- [ ] Appointment rescheduling
- [ ] Email/SMS notifications
- [ ] Advanced search and filtering
- [ ] Investigation report templates
- [ ] Multi-language support
- [ ] Mobile app integration

### Phase 3 Enhancements
- [ ] AI-assisted diagnosis
- [ ] Appointment analytics
- [ ] Patient satisfaction surveys
- [ ] Integration with EHR systems
- [ ] Telemedicine consultation
- [ ] Prescription integration

## Support & Contact

For issues, questions, or feature requests related to this workflow:
1. Check the troubleshooting section
2. Review audit logs for errors
3. Contact the development team
4. Submit detailed bug reports with logs

---

**Document Version:** 1.0
**Last Updated:** May 15, 2024
**Status:** Production Ready
