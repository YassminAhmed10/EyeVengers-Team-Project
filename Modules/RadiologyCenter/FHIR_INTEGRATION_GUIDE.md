# FHIR/HL7 Integration Documentation
## Clinic ↔ Radiology System Mapping

**Date:** 2025
**Standard:** FHIR R4 (HL7 FHIR Release 4)
**Systems:** Eye Clinic ↔ Radiology Center
**Status:** ✅ ACTIVE (Replaces Firebase)

---

## 1. Architecture Overview

### System Communication Flow
```
┌─────────────────────────────────────────────────────────────────┐
│  EYE CLINIC SYSTEM (Port 5201)                                  │
│  - ASP.NET Core 8.0 Backend                                      │
│  - Exposes FHIR API endpoints                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                   FHIR/HL7
                   (HTTP/REST)
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│  RADIOLOGY CENTER SYSTEM (Port 5301)                            │
│  - ASP.NET Core 8.0 Backend                                      │
│  - Consumes FHIR resources                                       │
│  - Frontend: React with FHIR Integration Service                │
└─────────────────────────────────────────────────────────────────┘
```

### Key Change
```
BEFORE: Firebase ❌ (Permission errors, not HIPAA compliant for healthcare)
         └─> Causes: "Missing or insufficient permissions"

AFTER:  FHIR/HL7 ✅ (Healthcare industry standard, secure, interoperable)
         └─> Services:
             - fhirIntegrationService.js (Patient data exchange)
             - fhirSegmentLogger.js (Terminal logging of segments)
```

---

## 2. FHIR Resource Types Used

### Patient (PID Segment)
**Source:** Eye Clinic
**Usage:** Patient demographics, identification, contact info

```json
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

**Terminal Log Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║ FHIR/HL7 SEGMENT LOG - 01/20/2025 10:30:45                      ║
║ Direction: ← IN                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ Segment Type: PID (Patient Identification)                       ║
║ System: Eye Clinic → Radiology Center                           ║
║ Status: SUCCESS                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ PAYLOAD:                                                          ║
║ {                                                                 ║
║   "patient_id": "P-532756",                                       ║
║   "mrn": "P-532756",                                              ║
║   "first_name": "Eman",                                           ║
║   "last_name": "Sallm",                                           ║
║   "dob": "1990-05-15",                                            ║
║   "gender": "female",                                             ║
║   "phone": "+20123456789",                                        ║
║   "email": "eman@example.com",                                    ║
║   "address": "Cairo, Egypt"                                       ║
║ }                                                                 ║
╚══════════════════════════════════════════════════════════════════╝
```

### Appointment (SCH Segment)
**Source:** Eye Clinic
**Usage:** Appointment scheduling, history, status tracking

```json
{
  "resourceType": "Appointment",
  "id": "APT-001",
  "status": "completed",
  "participant": [{
    "actor": {
      "reference": "Patient/P-532756"
    },
    "status": "accepted"
  }],
  "start": "2025-05-05T13:00:00Z",
  "end": "2025-05-05T14:00:00Z",
  "reasonCode": [{
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "404684003",
      "display": "Clinical examination"
    }]
  }]
}
```

### Observation (OBX Segment)
**Source:** Eye Clinic (vision tests, measurements)
**Usage:** Lab results, clinical observations, measurements

```json
{
  "resourceType": "Observation",
  "id": "OBS-001",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "91886-6",
      "display": "Visual acuity"
    }]
  },
  "subject": {
    "reference": "Patient/P-532756"
  },
  "effectiveDateTime": "2025-01-20T09:00:00Z",
  "valueString": "20/20 corrected"
}
```

### DiagnosticReport (Report Segment)
**Source:** Radiology Center
**Usage:** Radiology findings, images, interpretations
**Direction:** Radiology → Clinic (reverse flow)

```json
{
  "resourceType": "DiagnosticReport",
  "id": "DR-001",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "12345-6",
      "display": "Eye X-ray imaging"
    }]
  },
  "subject": {
    "reference": "Patient/P-532756"
  },
  "issued": "2025-01-20T10:15:00Z",
  "conclusion": "No abnormalities detected"
}
```

---

## 3. Service Layer Architecture

### fhirIntegrationService.js
**Location:** `RadiologyCenter/Frontend/src/services/fhirIntegrationService.js`
**Purpose:** Handles all FHIR communication

```javascript
// Methods available:
- getPatientFromClinic(email)           // → PID segment
- getAppointmentsFromClinic(patientId)  // → SCH segments
- getObservationsFromClinic(patientId)  // → OBX segments
- sendRadiologyResultToClinic(report)   // ← DiagnosticReport
- parseFhirPatient(fhirPatient)         // Convert to UI format
```

### fhirSegmentLogger.js
**Location:** `RadiologyCenter/Frontend/src/services/fhirSegmentLogger.js`
**Purpose:** Terminal logging with color-coded output

```javascript
// Methods available:
- logSegment(segment, data, direction)  // Log FHIR segment
- logConnection(from, to, status)       // Log connection events
- logQuery(endpoint, method, filters)   // Log API queries
- formatPatientSegment(patient)         // Format PID
- formatObservationSegment(obs)         // Format OBX
- formatAppointmentSegment(apt)         // Format SCH
- getAllLogs()                          // Get all logs
- exportLogs(format)                    // Export logs (JSON/CSV)
```

---

## 4. Terminal Output Colors

```
YELLOW (OUT) ↔️ Radiology → Clinic
╔══════════════════════════════════════════════════════════════════╗
║ Direction: → OUT
║ Request being sent to Eye Clinic

CYAN (IN) ↔️ Clinic → Radiology
╔══════════════════════════════════════════════════════════════════╗
║ Direction: ← IN
║ Response received from Eye Clinic

MAGENTA (Query) 🔍 FHIR Query Logging
╔══════════════════════════════════════════════════════════════════╗
║ Endpoint: /Patient?email=eman@example.com
║ Method: GET

GREEN (Success) ✓ Connection Success
╔══════════════════════════════════════════════════════════════════╗
║ Status: SUCCESS

RED (Error) ✗ Connection Error
╔══════════════════════════════════════════════════════════════════╗
║ Status: ERROR
```

---

## 5. Data Mapping Examples

### When Radiology loads patient profile:

**Step 1: Load from localStorage**
```
localStorage.getItem('patientEmail') → "eman@example.com"
```

**Step 2: FHIR Query to Clinic**
```
GET http://localhost:5201/api/Patient/search?query=eman@example.com
```

**Step 3: Receive FHIR Patient Resource**
```json
{
  "resourceType": "Patient",
  "id": "P-532756",
  "name": [{ "given": ["Eman"], "family": "Sallm" }],
  "birthDate": "1990-05-15",
  "telecom": [
    { "system": "phone", "value": "+20123456789" }
  ]
}
```

**Step 4: Terminal Logs Segment**
```
TERMINAL OUTPUT:
═══════════════════════════════════════════════════════════════════
CLINIC → RADIOLOGY SYSTEM INTEGRATION
Using: FHIR/HL7 Healthcare Interoperability Standard
Replacing: Firebase (deprecated for healthcare systems)
═══════════════════════════════════════════════════════════════════

╔══════════════════════════════════════════════════════════════════╗
║ SYSTEM INTEGRATION - 01/20/2025 10:30:45
║ Connection: Eye Clinic ↔ Radiology Center
║ Status: SUCCESS
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║ FHIR/HL7 SEGMENT LOG - 01/20/2025 10:30:45
║ Direction: ← IN
╠══════════════════════════════════════════════════════════════════╣
║ Segment Type: PID (Patient Identification)
║ System: Eye Clinic → Radiology Center
║ Status: SUCCESS
╠══════════════════════════════════════════════════════════════════╣
║ PAYLOAD:
║ {
║   "patient_id": "P-532756",
║   "mrn": "P-532756",
║   "first_name": "Eman",
║   "last_name": "Sallm",
║   "dob": "1990-05-15",
║   "gender": "female",
║   "phone": "+20123456789",
║   "email": "eman@example.com",
║   "address": "Cairo, Egypt"
║ }
╚══════════════════════════════════════════════════════════════════╝
```

**Step 5: Parse & Display in UI**
```
Patient Profile displays:
├─ Name: Eman Sallm
├─ Email: eman@example.com
├─ Phone: +20123456789
├─ DOB: 15 May 1990
└─ Address: Cairo, Egypt
```

---

## 6. API Endpoints Mapping

### Eye Clinic (Port 5201) - Provides
```
GET  /api/Patient/search?query={email}           → FHIR Patient Bundle
GET  /api/Appointment?patient={patientId}        → FHIR Appointment Bundle
GET  /api/Observation?patient={patientId}        → FHIR Observation Bundle
POST /api/DiagnosticReport                        → Accept DiagnosticReport from Radiology
```

### Radiology Center (Port 5301) - Consumes & Provides
```
POST /api/DiagnosticReport                        → Send findings to Clinic
GET  /api/Patient/{id}                            → Get patient (local cache)
GET  /api/Appointment/{id}                        → Get appointment (local cache)
```

---

## 7. Error Handling

### Connection Error (Firebase was causing this)
```
❌ BEFORE:
   "FirebaseError: Missing or insufficient permissions"

✅ AFTER:
   "Connection refused"
   → Check if Eye Clinic API is running on port 5201
```

### Invalid Patient
```
FHIR Query Result:
{
  "resourceType": "Bundle",
  "entry": [],
  "total": 0
}
→ Patient not found in Clinic system
```

---

## 8. Security & Compliance

### FHIR/HL7 Benefits over Firebase
- ✅ **Healthcare Standard:** Designed for medical data exchange
- ✅ **Interoperable:** Works with other healthcare systems
- ✅ **HIPAA Compliant:** When properly implemented
- ✅ **Data Validation:** Built-in resource schema validation
- ✅ **Version Control:** FHIR R4 stable specification
- ❌ **Firebase:** Designed for generic data, not healthcare-specific

### Required Headers
```
Authorization: Bearer {token}
Content-Type: application/fhir+json
Accept: application/fhir+json
```

---

## 9. Testing Checklist

- [ ] Radiology ProfilePage loads without Firebase errors
- [ ] Terminal shows FHIR segments when page loads
- [ ] Patient data displays correctly from Eye Clinic
- [ ] Phone number loads from FHIR appointment endpoint
- [ ] Appointments fetch via FHIR SCH segments
- [ ] Observations display test results
- [ ] Radiology results send back to Clinic via FHIR DiagnosticReport
- [ ] Segment logging shows correct colors (yellow/cyan/magenta)
- [ ] No Firebase errors in browser console

---

## 10. Future Enhancements

- [ ] Implement FHIR STU3 backward compatibility
- [ ] Add GraphQL FHIR query support
- [ ] Implement FHIR bulk data export
- [ ] Add audit trail logging for compliance
- [ ] Implement FHIR digital signatures
- [ ] Add OAuth2 authentication for FHIR endpoints
- [ ] Create FHIR resource caching layer
- [ ] Implement batch processing for large datasets

---

**Last Updated:** 2025
**Maintained By:** EyeVengers Development Team
