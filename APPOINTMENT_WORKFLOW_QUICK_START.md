# Appointment Approval Workflow - Quick Start Guide

## 5-Minute Setup

### Backend Setup (3 steps)

#### Step 1: Register Services
Add to `Program.cs` in the service registration section:

```csharp
builder.Services.AddScoped<IAppointmentApprovalService, AppointmentApprovalService>();
builder.Services.AddScoped<IInvestigationWorkflowService, InvestigationWorkflowService>();
builder.Services.AddScoped<IStatusSynchronizationService, StatusSynchronizationService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
```

#### Step 2: Create Uploads Directory
Create directory if it doesn't exist:
```
Modules/RadiologyCenter/Backend/Uploads/Investigations/
```

#### Step 3: Run Database Migration
```bash
dotnet ef database update
```

### Frontend Setup (3 steps)

#### Step 1: Import Components
```jsx
import PendingAppointmentRequestsPage from './pages/Admin/PendingAppointmentRequestsPage';
import ActiveInvestigationsPage from './pages/Admin/ActiveInvestigationsPage';
import PatientResultsPage from './pages/Patient/PatientResultsPage';
```

#### Step 2: Add Routes
```jsx
// In your routing configuration
<Route path="/admin/pending-requests" element={<PendingAppointmentRequestsPage />} />
<Route path="/admin/investigations" element={<ActiveInvestigationsPage />} />
<Route path="/patient/results" element={<PatientResultsPage />} />
```

#### Step 3: Update Navigation
Add links in your admin/patient navigation menus.

## Key Features Overview

### 1. Patient Books Appointment
- User visits `/book-appointment`
- Enters patient data and confirms
- Appointment created with status "Pending"

### 2. Admin Reviews Request
- Visit `/admin/pending-requests`
- See list of all pending appointments
- Click appointment to review details
- Approve → Creates investigation
- Reject → Sends notification to patient

### 3. Admin Uploads Results
- Visit `/admin/investigations`
- See active investigations
- Click investigation to expand
- Click "Upload" tab
- Drag-drop files or select from computer
- Files automatically validated and stored

### 4. Patient Views Results
- Visit `/patient/results`
- See all completed investigations
- Click result to expand
- Download or view files
- Share with healthcare provider

## API Endpoints Reference

### Get Pending Requests
```bash
curl http://localhost:5301/api/appointments/pending-requests
```

### Approve Appointment
```bash
curl -X POST http://localhost:5301/api/appointments/123/approve \
  -H "Content-Type: application/json" \
  -d '{"adminNotes": "Approved"}'
```

### Upload Files
```bash
curl -X POST http://localhost:5301/api/appointments/123/investigations/456/upload-files \
  -F "files=@image.jpg"
```

### Complete Investigation
```bash
curl -X POST http://localhost:5301/api/appointments/123/investigations/456/complete \
  -H "Content-Type: application/json" \
  -d '{"completionNotes": "Complete"}'
```

## Common Tasks

### Task 1: Find Pending Requests
```javascript
const response = await axios.get(
  `${RADIOLOGY_API}/appointments/pending-requests?pageNumber=1&pageSize=10`
);
console.log(response.data.data);
```

### Task 2: Approve an Appointment
```javascript
const result = await axios.post(
  `${RADIOLOGY_API}/appointments/${appointmentId}/approve`,
  { adminNotes: "Ready for investigation" }
);
```

### Task 3: Upload Investigation Files
```javascript
const formData = new FormData();
formData.append('files', fileInput.files[0]);
formData.append('files', fileInput.files[1]);

await axios.post(
  `${RADIOLOGY_API}/appointments/${appointmentId}/investigations/${investigationId}/upload-files`,
  formData
);
```

### Task 4: Get Patient Results
```javascript
// Patient results are automatically fetched from completed appointments
const patientId = localStorage.getItem('radiologyPatientId');
// PatientResultsPage fetches and displays automatically
```

## File Upload Guide

### Supported Files
- ✅ JPEG images (.jpg, .jpeg)
- ✅ PNG images (.png)
- ✅ PDF documents (.pdf)
- ✅ DICOM files (.dcm)

### File Requirements
- Maximum size: 100MB per file
- Accepted MIME types: image/jpeg, image/png, application/pdf, application/dicom
- Multiple files can be uploaded at once

### Upload Process
1. Admin selects investigation
2. Clicks "Upload" tab
3. Drags files into upload area OR
4. Clicks to select files
5. Confirms upload
6. System validates files
7. Files stored securely
8. FHIR resources generated automatically

## Database Inspection

### Check Pending Appointments
```sql
SELECT * FROM Appointments 
WHERE Status IN ('Pending', 'Requested by Doctor')
ORDER BY CreatedAt DESC;
```

### Check Active Investigations
```sql
SELECT i.*, a.PatientId, a.ServiceId
FROM Investigations i
JOIN Appointments a ON i.AppointmentId = a.Id
WHERE i.Status != 'Completed'
ORDER BY i.StartedAt DESC;
```

### Check Uploaded Files
```sql
SELECT if.*, i.InvestigationType
FROM InvestigationFiles if
JOIN Investigations i ON if.InvestigationId = i.Id
ORDER BY if.UploadedAt DESC;
```

### Check Audit Trail
```sql
SELECT * FROM AuditLogs
WHERE Action LIKE '%APPOINTMENT%' OR Action LIKE '%FILE%'
ORDER BY Timestamp DESC
LIMIT 20;
```

## Component Props Reference

### PendingAppointmentRequestsPage
No props required. Automatically fetches pending appointments.

### ActiveInvestigationsPage
No props required. Auto-refreshes every 30 seconds.

### FileUploadPanel
```jsx
<FileUploadPanel
  appointmentId={123}           // Required: Appointment ID
  investigationId={456}         // Required: Investigation ID
  onUploadComplete={(files) => {}}  // Optional: Callback on success
/>
```

### PatientResultsPage
No props required. Automatically fetches patient ID from localStorage.

## Troubleshooting Quick Fixes

### "Pending requests not showing"
```javascript
// Check if API is working
fetch('http://localhost:5301/api/appointments/pending-requests')
  .then(r => r.json())
  .then(d => console.log(d));
```

### "File upload fails"
1. Check file size < 100MB
2. Check file extension is supported
3. Verify `/Uploads/Investigations` directory exists
4. Check browser console for specific error

### "Notifications not appearing"
1. Verify patient ID in localStorage
2. Check NotificationService registered in Program.cs
3. Clear browser localStorage and reload

### "Status not syncing"
1. Verify StatusSynchronizationService is registered
2. Check other systems are accessible
3. Review console logs for HTTP errors

## Performance Tips

### For Large Appointment Lists
Use pagination:
```javascript
const response = await axios.get(
  '/api/appointments/pending-requests?pageNumber=1&pageSize=50'
);
```

### For Multiple File Uploads
Upload in batches rather than all at once:
```javascript
for (let file of files) {
  const formData = new FormData();
  formData.append('files', file);
  await uploadFile(formData);
}
```

### For Faster Response Times
The pages auto-refresh at 30-second intervals. To change:
```javascript
// In component, modify useEffect
const interval = setInterval(fetchData, 60000); // 60 seconds
```

## Integration Checklist

- [ ] Services registered in Program.cs
- [ ] Database migrations applied
- [ ] Routes configured in React app
- [ ] Navigation links added
- [ ] Components imported in App.jsx
- [ ] API base URL configured correctly
- [ ] Uploads directory created
- [ ] Test pending appointment flow
- [ ] Test approval workflow
- [ ] Test file upload
- [ ] Test patient results view
- [ ] Verify audit logs created

## API Response Examples

### Pending Requests Response
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "patientName": "John Doe",
      "patientEmail": "john@example.com",
      "radiologyService": { "name": "Chest X-Ray" },
      "status": "Pending",
      "createdAt": "2024-05-15T10:30:00Z"
    }
  ],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 45
}
```

### File Upload Response
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "originalFileName": "chest_xray.jpg",
      "fileSize": 2048576,
      "mimeType": "image/jpeg",
      "uploadedAt": "2024-05-15T11:00:00Z",
      "fhirResourceType": "ImagingStudy"
    }
  ],
  "message": "2 files uploaded successfully"
}
```

## Next Steps

1. **Complete Setup** - Follow the 5-minute setup above
2. **Test Workflow** - Try booking → approve → upload → view
3. **Configure Notifications** - Set up email/SMS (optional)
4. **Monitor Logs** - Watch audit trail as operations occur
5. **Go Live** - Deploy to production when ready

## Support Commands

### Test API Health
```bash
curl http://localhost:5301/api/appointments/pending-requests
```

### View Server Logs
```bash
dotnet watch run
```

### Test Frontend Components
Open browser DevTools and check for console errors

### Database Connection Test
```bash
# In dotnet cli
dotnet ef dbcontext info
```

---

**Quick Start Version:** 1.0
**Status:** Ready to Use
**Estimated Setup Time:** 5 minutes
