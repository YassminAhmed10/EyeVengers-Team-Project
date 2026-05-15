# Patient Medical Record - Complete Data Mapping

## 📋 Overview
This document outlines the complete data flow from the doctor's medical record view to the patient's medical record page, including all field mappings and API endpoints.

---

## 🔗 Routes

| Route | Purpose | Component | User Type |
|-------|---------|-----------|-----------|
| `/patient/medical-record` | Patient views their medical record | `PatientEMRPage.jsx` | Patient |
| `/doctor/view-medical-record/{patientId}` | Doctor views patient's medical record | `DoctorViewPatientMedicalRecord.jsx` | Doctor |

---

## 🔑 Patient Identifier Flow

### Primary Identifier: `patientIdentifier` (P-XXXXXX format)

The system uses a **unique patient identifier** (`PatientIdentifier`) stored in the database and localStorage:

```javascript
// How to get the patient identifier from localStorage
const patientId = localStorage.getItem("patientIdentifier") || 
                 localStorage.getItem("PatientIdentifier") ||
                 localStorage.getItem("patientId");
```

**Storage Locations:**
- Backend Database: `Patient.PatientIdentifier` (e.g., "P-000123")
- Frontend LocalStorage: `patientIdentifier`
- Alternative keys: `PatientIdentifier`, `patientId`

---

## 📊 Complete Data Structure

### Patient Information (Core Fields)

#### Basic Information
| Field | Backend DTO | Backend Model | Frontend Display | Type | Required |
|-------|------------|---------------|------------------|------|----------|
| **Patient ID** | `PatientId` | `Id` | `patientId` | Integer | ✓ |
| **Full Name** | `Name` (computed) | `FirstName + LastName` | `name` | String | ✓ |
| **Age** | `Age` (computed) | Calculated from `DateOfBirth` | `age` | Integer | ✓ |
| **Gender** | `Gender` | `Gender` (Male/Female) | `gender` | String | ✓ |
| **Date of Birth** | `BirthDate` | `DateOfBirth` | `birthDate` | DateTime | ✓ |
| **National ID** | `NationalId` | `NationalId` | `nationalId` | String | ✓ |

#### Contact Information
| Field | Backend DTO | Backend Model | Frontend Display | Type | Required |
|-------|------------|---------------|------------------|------|----------|
| **Phone** | `ContactNumber` | `Phone` | `phone` | String | ✓ |
| **Email** | `Email` | `Email` | `email` | String | ✓ |
| **Address** | `Address` | `Address` | `address` | String | ✓ |

#### Insurance Information
| Field | Backend DTO | Backend Model | Frontend Display | Type | Required |
|-------|------------|---------------|------------------|------|----------|
| **Insurance Company** | `InsuranceCompany` | `InsuranceCompany` | `insuranceCompany` | String | ✓ |
| **Insurance ID** | `InsuranceId` | `InsuranceId` | `insuranceId` | String | ✗ |
| **Policy Number** | `PolicyNumber` | (N/A - add to model) | `policyNumber` | String | ✗ |
| **Coverage %** | `Coverage` | (N/A - add to model) | `coverage` | Integer | ✗ |

#### Emergency Contact
| Field | Backend DTO | Backend Model | Frontend Display | Type | Required |
|-------|------------|---------------|------------------|------|----------|
| **Emergency Contact Name** | `EmergencyContactName` | `EmergencyContactName` | `emergencyContactName` | String | ✓ |
| **Emergency Contact Phone** | `EmergencyContactPhone` | `EmergencyContactPhone` | `emergencyContactPhone` | String | ✓ |

---

## 🏥 Medical Record Data

### Medical Records Associated with Patient

Each patient can have multiple medical records. These are fetched using the **patient identifier** and include:

#### 1. **Complaint** Records
```javascript
{
  id: string,
  patientId: integer,
  originalText: string,        // Chief complaint
  createdAt: DateTime
}
```

#### 2. **History** Records
```javascript
{
  id: string,
  patientId: integer,
  previousEye: string,          // Previous eye history
  familyHistory: string,        // Family medical history
  allergies: string,            // Known allergies
  chronicDiseases: string,      // Chronic conditions
  currentMedications: string,   // Current medications
  eyeSurgeries: string,         // Past eye surgeries
  familyEyeDiseases: string,    // Hereditary eye conditions
  visionSymptoms: string,       // Vision-related symptoms
  createdAt: DateTime
}
```

#### 3. **Investigations** Records
```javascript
{
  id: string,
  patientId: integer,
  selectedInvestigations: JSON.stringify([...]), // Array of investigation types
  notes: string,                // Additional notes
  createdAt: DateTime
}
```

#### 4. **Eye Examination** Records
```javascript
{
  id: string,
  patientId: integer,
  rightEye: string,             // Right eye visual acuity (VA)
  leftEye: string,              // Left eye visual acuity (VA)
  eyePressure: string,          // Intraocular pressure (IOP)
  pupilReaction: string,        // Pupil light reaction
  eyeAlignment: string,         // Ocular alignment
  eyeMovements: string,         // Extraocular movements
  anteriorSegment: string,      // Anterior segment findings
  fundusObservation: string,    // Fundus/retina observations
  otherNotes: string,           // Additional findings
  createdAt: DateTime
}
```

#### 5. **Operations** Records
```javascript
{
  id: string,
  patientId: integer,
  operationType: string,        // Type of surgical procedure
  operationDate: DateTime,      // Date of surgery
  surgeon: string,              // Surgeon name
  hospital: string,             // Hospital/facility
  eye: string,                  // OD (right), OS (left), or OU (both)
  notes: string,                // Surgical notes
  createdAt: DateTime
}
```

#### 6. **Prescriptions** Records
```javascript
{
  id: string,
  patientId: integer,
  medicationName: string,       // Drug name (e.g., Ciprofloxacin)
  form: string,                 // Form (drops, tablet, etc.)
  dose: string,                 // Dosage strength
  frequency: string,            // Frequency (1-2-3-4 times daily)
  duration: string,             // Duration (e.g., 7 days)
  notes: string,                // Special instructions
  createdAt: DateTime
}
```

#### 7. **Diagnoses** Records
```javascript
{
  id: string,
  patientId: integer,
  diagnosisName: string,        // ICD-10 diagnosis
  severity: string,             // mild | moderate | severe
  status: string,               // active | resolved | suspected
  notes: string,                // Clinical notes
  createdAt: DateTime
}
```

#### 8. **Images** Records
```javascript
{
  id: string,
  patientId: integer,
  imageUrl: string,             // CDN or file server URL
  imageType: string,            // fundus | anterior | OCT | etc.
  description: string,          // Image description
  createdAt: DateTime
}
```

---

## 🔌 API Endpoints

### Patient Module Endpoints

#### Get Patient Information
```
GET /api/patient/{patientIdentifier}
or
GET /api/patient?id={patientId}
or
GET /api/patient/info/{patientIdentifier}

Response: PatientInfoDto
{
  "patientId": 123,
  "name": "Ahmed Ali",
  "age": 45,
  "gender": "Male",
  "birthDate": "1979-05-15T00:00:00",
  "nationalId": "29505091234567",
  "contactNumber": "+966501234567",
  "email": "patient@example.com",
  "address": "Riyadh, Saudi Arabia",
  "insuranceCompany": "SAADA",
  "insuranceId": "INS-12345",
  "emergencyContactName": "Fatima Ali",
  "emergencyContactPhone": "+966502222222"
}
```

#### Get Patient Medical Records
```
GET /api/patient/{patientIdentifier}/medical-records
or
GET /api/patient/{patientId}/records

Response: Array of MedicalRecordDto
[
  {
    "id": "uuid",
    "patientId": 123,
    "recordType": "complaint|history|investigation|exam|operation|prescription|diagnosis|image",
    "data": {...},
    "createdAt": "2026-05-12T10:30:00"
  },
  ...
]
```

#### Get Specific Record Type
```
GET /api/patient/{patientIdentifier}/complaints
GET /api/patient/{patientIdentifier}/histories
GET /api/patient/{patientIdentifier}/investigations
GET /api/patient/{patientIdentifier}/eye-exams
GET /api/patient/{patientIdentifier}/operations
GET /api/patient/{patientIdentifier}/prescriptions
GET /api/patient/{patientIdentifier}/diagnoses
GET /api/patient/{patientIdentifier}/images
```

---

## 🎯 Frontend Data Normalization

### normalizePatient() Function

This function in `DoctorViewPatientMedicalRecord.jsx` maps backend data to frontend format:

```javascript
function normalizePatient(raw) {
  if (!raw) return null;
  
  const genderMap = { 0: 'Male', 1: 'Female', 2: 'Other' };
  const gender = typeof raw.gender === 'number' 
    ? (genderMap[raw.gender] ?? '—') 
    : (raw.gender || '—');
  
  const dob = raw.dateOfBirth || raw.birthDate || raw.PatientBirthDate || raw.BirthDate || null;
  
  let age = raw.age || raw.Age || null;
  if (!age && dob) {
    age = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  }
  
  return {
    // Patient info
    patientId:             raw.patientId || raw.patientID || raw.id || raw.PatientId || '—',
    name:                  raw.name || raw.patientName || [raw.firstName, raw.lastName].filter(Boolean).join(' ') || '—',
    age:                   age ?? '—',
    gender:                gender,
    email:                 raw.email || raw.Email || raw.patientEmail || '—',
    phone:                 raw.phone || raw.contactNumber || raw.Phone || raw.patientPhone || '—',
    address:               raw.address || raw.Address || '—',
    birthDate:             dob,
    nationalId:            raw.nationalId || raw.NationalId || null,
    
    // Insurance
    insuranceCompany:      raw.insuranceCompany || raw.InsuranceCompany || null,
    insuranceId:           raw.insuranceId || raw.InsuranceId || null,
    policyNumber:          raw.policyNumber || raw.PolicyNumber || null,
    coverage:              raw.coverage || raw.Coverage || null,
    
    // Emergency contact
    emergencyContactName:  raw.emergencyContactName || raw.EmergencyContactName || null,
    emergencyContactPhone: raw.emergencyContactPhone || raw.EmergencyContactPhone || null,
    
    // Medical records
    complaints:            raw.complaints || [],
    histories:             raw.histories || [],
    investigations:        raw.investigations || [],
    eyeExaminations:       raw.eyeExaminations || [],
    operations:            raw.operations || [],
    prescriptions:         raw.prescriptions || [],
    diagnoses:             raw.diagnoses || [],
  };
}
```

---

## 📱 Frontend Display Structure

### Tabs in Patient Medical Record

| Tab | Component | Data Source | Fields |
|-----|-----------|-------------|--------|
| **Patient Info** | `PatientInfoBlock` | `normalizePatient()` | 4-column layout (Basic, Contact, Insurance, Emergency) |
| **Complaint** | `ComplaintPanel` | `p.complaints[]` | Chief complaint with timestamps |
| **History** | `HistoryPanel` | `p.histories[]` | Medical/family/allergy history |
| **Investigations** | `InvestigationsPanel` | `p.investigations[]` | Ordered tests with notes |
| **Eye Exam** | `EyeExamPanel` | `p.eyeExaminations[]` | Visual acuity, pressure, fundus findings |
| **Images** | `ImagesPanel` | `p.images[]` | Diagnostic images (fundus, OCT, etc.) |
| **Operations** | `OperationsPanel` | `p.operations[]` | Surgical procedures |
| **Prescriptions** | `PrescriptionsPanel` | `p.prescriptions[]` | Medications with dosage and frequency |
| **Diagnoses** | `DiagnosesPanel` | `p.diagnoses[]` | ICD-10 diagnoses with severity |

---

## 🔄 Data Flow Diagram

```
Doctor View → Navigate to Patient Record
    ↓
Access patientIdentifier from URL/localStorage
    ↓
API Call: GET /api/patient/{patientIdentifier}
    ↓
Fetch Patient Info (PatientInfoDto)
Fetch All Medical Records (MedicalRecordDto[])
    ↓
normalizePatient() function
    ↓
Patient object with all fields populated
    ↓
Render UI:
  - PatientInfoBlock (4 columns)
  - Tab Navigation
  - Dynamic Panels based on selected tab
    ↓
Patient Medical Record Page Displays
```

---

## ✅ Checklist for Complete Implementation

### Backend Requirements
- [ ] `PatientInfoDto` includes all required fields
- [ ] `Patient` model has `PatientIdentifier` field
- [ ] API endpoint returns patient info + medical records
- [ ] Medical records are associated with patientIdentifier
- [ ] All fields are populated in response

### Frontend Requirements
- [ ] `normalizePatient()` maps all backend fields
- [ ] localStorage stores `patientIdentifier`
- [ ] `PatientEMRPage.jsx` fetches using patientIdentifier
- [ ] `DoctorViewPatientMedicalRecord.jsx` passes patientIdentifier
- [ ] All tabs render correctly with data
- [ ] Date formatting is consistent
- [ ] Gender normalization works (0=Male, 1=Female)

### Field Validation
- [ ] Patient ID is unique and persistent
- [ ] Age is calculated correctly from DOB
- [ ] Phone number format is validated
- [ ] Email format is validated
- [ ] Insurance company is populated
- [ ] All contact fields are displayed

---

## 🐛 Common Issues & Solutions

### Issue: Patient data not loading
**Solution:** Check if `patientIdentifier` is stored correctly in localStorage before page navigation.

### Issue: Medical records missing
**Solution:** Verify API endpoint includes all record types in response. May need to fetch separately if not included.

### Issue: Gender showing as number
**Solution:** Ensure `normalizePatient()` gender mapping is applied: 0→Male, 1→Female, 2→Other.

### Issue: Insurance Company not displaying
**Solution:** Verify backend API includes `insuranceCompany` field in response. May require additional API call if separate endpoint.

---

## 📝 Notes

- All dates should be formatted as: `DD MMM YYYY` (e.g., "12 May 2026")
- All datetimes should be formatted as: `DD MMM YYYY, HH:MM` (e.g., "12 May 2026, 10:30")
- Patient identifier is the primary key for fetching all related data
- Medical records should be fetched on component mount and cached in state
- Consider pagination if patient has > 50 records

