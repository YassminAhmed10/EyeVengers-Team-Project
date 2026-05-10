# FHIR/HL7 Integration Quick Start Guide
## For Developers

**System:** Radiology Center Frontend
**Standard:** FHIR R4 (HL7 FHIR Release 4)
**Last Updated:** 2025

---

## Quick Start (5 Minutes)

### 1. Import Services
```javascript
import { fhirIntegrationService } from "../../services/fhirIntegrationService";
import { fhirSegmentLogger } from "../../services/fhirSegmentLogger";
```

### 2. Fetch Patient from Clinic
```javascript
const patient = await fhirIntegrationService.getPatientFromClinic("eman@example.com");
// Terminal automatically logs PID segment
```

### 3. Get Appointments
```javascript
const appointments = await fhirIntegrationService.getAppointmentsFromClinic("P-532756");
// Terminal automatically logs SCH segments for each appointment
```

### 4. Get Test Results
```javascript
const observations = await fhirIntegrationService.getObservationsFromClinic("P-532756");
// Terminal automatically logs OBX segments for each observation
```

### 5. Send Results Back to Clinic
```javascript
const diagnosticReport = {
  resourceType: "DiagnosticReport",
  status: "final",
  subject: { reference: "Patient/P-532756" },
  conclusion: "Normal scan results"
};

await fhirIntegrationService.sendRadiologyResultToClinic(diagnosticReport);
// Terminal logs outgoing DiagnosticReport segment
```

---

## FHIR Segment Types

| Segment | Type | Direction | Purpose |
|---------|------|-----------|---------|
| **PID** | Patient Identification | Clinic → Radiology | Demographics, contact info |
| **SCH** | Appointment/Schedule | Clinic → Radiology | Appointments, bookings |
| **OBX** | Observation/Result | Clinic → Radiology | Test results, measurements |
| **DR** | DiagnosticReport | Radiology → Clinic | Radiology findings, scans |

---

## Terminal Output Guide

### Patient Load (PID Segment) 
```
✅ Color: CYAN (Incoming from Clinic)
✅ Direction: ← IN
✅ Shows: Name, DOB, Contact, Address
```

### Appointment Load (SCH Segment)
```
✅ Color: CYAN (Incoming from Clinic)  
✅ Direction: ← IN
✅ Shows: Date, Time, Status, Reason
```

### Observation Load (OBX Segment)
```
✅ Color: CYAN (Incoming from Clinic)
✅ Direction: ← IN
✅ Shows: Test Type, Result, Effective Date
```

### Send Report (DiagnosticReport)
```
✅ Color: YELLOW (Outgoing to Clinic)
✅ Direction: → OUT
✅ Shows: Report ID, Conclusion, Subject
```

---

## Common Usage Examples

### Example 1: Load Patient Profile
```javascript
// In ProfilePage.jsx
useEffect(() => {
  const loadProfile = async () => {
    const email = localStorage.getItem('patientEmail');
    
    // Fetch patient - automatically logs PID segment
    const patient = await fhirIntegrationService.getPatientFromClinic(email);
    const parsed = fhirIntegrationService.parseFhirPatient(patient);
    
    setUserData({
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      phone: parsed.phone,
      birthDate: parsed.birthDate,
      gender: parsed.gender,
    });
  };
  
  loadProfile();
}, []);
```

### Example 2: Display Appointments
```javascript
// In AppointmentsPage.jsx
useEffect(() => {
  const loadAppointments = async () => {
    const patientId = localStorage.getItem('patientId');
    
    // Fetch appointments - automatically logs SCH segments
    const appointments = await fhirIntegrationService.getAppointmentsFromClinic(patientId);
    
    setAppointments(appointments.map(apt => ({
      id: apt.id,
      date: apt.start,
      time: apt.start,
      status: apt.status,
      reason: apt.reasonCode?.[0]?.coding?.[0]?.display
    })));
  };
  
  loadAppointments();
}, []);
```

### Example 3: Submit Radiology Report
```javascript
// In ReportPage.jsx
const submitReport = async () => {
  const diagnosticReport = {
    resourceType: "DiagnosticReport",
    id: "DR-" + Date.now(),
    status: "final",
    code: {
      coding: [{
        system: "http://loinc.org",
        code: "12345-6",
        display: "Eye X-ray"
      }]
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    issued: new Date().toISOString(),
    conclusion: `Patient ${patientName} - ${findings}`
  };
  
  // Send report - automatically logs outgoing segment
  const result = await fhirIntegrationService.sendRadiologyResultToClinic(diagnosticReport);
  
  console.log('Report sent successfully!');
};
```

---

## Logging Methods

### Access Segment Logger
```javascript
import { fhirSegmentLogger } from "../../services/fhirSegmentLogger";
```

### Manual Logging
```javascript
// Log a custom segment
fhirSegmentLogger.logSegment(segment, data, 'IN');

// Log connection event
fhirSegmentLogger.logConnection('Eye Clinic', 'Radiology Center', 'SUCCESS');

// Log FHIR query
fhirSegmentLogger.logQuery('/Patient?email=test@example.com', 'GET', {});

// Get all logs
const allLogs = fhirSegmentLogger.getAllLogs();

// Export logs
const jsonLogs = fhirSegmentLogger.exportLogs('json');
const csvLogs = fhirSegmentLogger.exportLogs('csv');

// Clear logs
fhirSegmentLogger.clearLogs();
```

---

## Error Handling

### Try-Catch Pattern
```javascript
try {
  const patient = await fhirIntegrationService.getPatientFromClinic(email);
  if (!patient) {
    console.error('Patient not found in Clinic system');
    // Show error UI
  }
} catch (error) {
  console.error('FHIR API Error:', error);
  // Show error UI, log segment with ERROR status
}
```

### Connection Error
```
TERMINAL OUTPUT:
╔══════════════════════════════════════════════════════════════════╗
║ SYSTEM INTEGRATION - 01/20/2025 10:30:45
║ Connection: Eye Clinic ↔ Radiology Center
║ Status: ERROR
╚══════════════════════════════════════════════════════════════════╝
```

---

## Performance Tips

### 1. Batch Requests
```javascript
// DON'T do this:
const patient = await getPatientFromClinic(email);
const appointments = await getAppointmentsFromClinic(patientId);
const observations = await getObservationsFromClinic(patientId);

// DO this:
const [patient, appointments, observations] = await Promise.all([
  getPatientFromClinic(email),
  getAppointmentsFromClinic(patientId),
  getObservationsFromClinic(patientId)
]);
```

### 2. Cache Data
```javascript
// Store fetched data in localStorage
localStorage.setItem('radiologyPatientFirstName', parsed.firstName);
localStorage.setItem('radiologyPatientLastName', parsed.lastName);

// Retrieve on subsequent loads to reduce API calls
const cached = localStorage.getItem('radiologyPatientFirstName');
```

### 3. Conditional Fetching
```javascript
// Only fetch if not already loaded
if (!userData.firstName) {
  const patient = await getPatientFromClinic(email);
  // Process
}
```

---

## FHIR Resource Reference

### Patient Resource
```javascript
{
  "resourceType": "Patient",
  "id": "P-532756",
  "identifier": [{
    "system": "http://clinic.example.com/mrn",
    "value": "P-532756"
  }],
  "name": [{
    "given": ["Eman"],
    "family": "Sallm"
  }],
  "birthDate": "1990-05-15",
  "gender": "female",
  "telecom": [
    { "system": "phone", "value": "+20123456789" },
    { "system": "email", "value": "eman@example.com" }
  ],
  "address": [{
    "text": "Cairo, Egypt"
  }]
}
```

### Appointment Resource
```javascript
{
  "resourceType": "Appointment",
  "id": "APT-001",
  "status": "completed",
  "participant": [{
    "actor": { "reference": "Patient/P-532756" },
    "status": "accepted"
  }],
  "start": "2025-05-05T13:00:00Z",
  "reasonCode": [{
    "coding": [{
      "system": "http://snomed.info/sct",
      "display": "Clinical examination"
    }]
  }]
}
```

### Observation Resource
```javascript
{
  "resourceType": "Observation",
  "id": "OBS-001",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "display": "Visual acuity"
    }]
  },
  "subject": { "reference": "Patient/P-532756" },
  "effectiveDateTime": "2025-01-20T09:00:00Z",
  "valueString": "20/20 corrected"
}
```

---

## Debugging Checklist

- [ ] FHIR services imported correctly
- [ ] Eye Clinic API running on port 5201
- [ ] Radiology API running on port 5301
- [ ] Authentication token valid in localStorage
- [ ] Browser console shows colored FHIR segments
- [ ] No Firebase errors in console
- [ ] Patient data displays correctly in UI
- [ ] Timestamps match your timezone
- [ ] Segments show correct direction (→ OUT, ← IN)

---

## Need Help?

### Common Issues

**Q: No segments showing in console?**
A: Make sure fhirSegmentLogger is imported and check DevTools Console

**Q: Patient data not loading?**
A: Verify Eye Clinic is running and patient exists in database

**Q: Connection error?**
A: Check if Eye Clinic API is accessible and token is valid

**Q: Wrong data displayed?**
A: Review terminal logs for FHIR segment data structure

---

**For detailed documentation, see:**
- [FHIR Integration Guide](./FHIR_INTEGRATION_GUIDE.md)
- [Firebase to FHIR Migration](./FIREBASE_TO_FHIR_MIGRATION.md)
