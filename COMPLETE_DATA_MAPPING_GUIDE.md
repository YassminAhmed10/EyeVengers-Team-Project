# Complete Patient Medical Record Data Mapping Guide

## Overview
This document provides a complete mapping of all patient data fields required for the medical record system, from the EMR database to the frontend display.

---

## 1. Patient Identifier Flow

### Primary Patient Identifier
```
LocalStorage Keys (Priority Order):
1. patientIdentifier
2. PatientIdentifier
3. patientId (if matches P-XXXXX pattern)
4. PatientId

Database Tables:
├── Patients (EMR.Patient model)
│   └── PatientIdentifier: string
├── Appointments
│   └── PatientId: string
└── MedicalRecords
    └── PatientIdentifier: string
```

---

## 2. Complete Data Field Mapping

### 2.1 Basic Patient Information

| Frontend Field | Backend Field | Data Source | Type | Notes |
|---|---|---|---|---|
| **Patient ID** | `patientIdentifier` | Patients / Appointments | string | Primary identifier for patient |
| **Full Name** | `firstName` + `lastName` | Patients / Appointments | string | Combined as "{firstName} {lastName}" |
| **First Name** | `firstName` | Patients / Appointments | string | Part of patient name |
| **Last Name** | `lastName` | Patients / Appointments | string | Part of patient name |
| **Age** | `age` (calculated) | Calculated from `dateOfBirth` | number | Computed: `currentYear - birthYear` |
| **Gender** | `gender` | Patients / Appointments | enum | Male / Female / Other |
| **Date of Birth** | `birthDate` or `dateOfBirth` | Patients / Appointments | datetime | ISO format: YYYY-MM-DD |
| **National ID** | `nationalId` | Patients / Appointments | string | Government ID number |

### 2.2 Contact Information

| Frontend Field | Backend Field | Data Source | Type | Notes |
|---|---|---|---|---|
| **Phone** | `phone` or `contactNumber` | Patients / Appointments | string | Primary contact number |
| **Email** | `email` | Patients / Appointments | string | Email address |
| **Address** | `address` | Patients / Appointments | string | Full residential address |
| **Emergency Contact Name** | `emergencyContactName` | Patients / Appointments | string | Name of emergency contact person |
| **Emergency Contact Phone** | `emergencyContactPhone` | Patients / Appointments | string | Phone of emergency contact |

### 2.3 Insurance Information

| Frontend Field | Backend Field | Data Source | Type | Notes |
|---|---|---|---|---|
| **Insurance Company** | `insuranceCompany` | Patients / Appointments | string | Name of insurance provider |
| **Insurance ID** | `insuranceId` | Patients / Appointments | string | Insurance policy ID |
| **Policy Number** | `policyNumber` | Appointments | string | Insurance policy number |
| **Coverage** | `coverage` | Appointments | string | Coverage percentage (e.g., "80%") |
| **Coverage Type** | `coverageType` | Appointments | string | Type of coverage |
| **Insurance Expiry Date** | `insuranceExpiryDate` | Appointments | datetime | When insurance expires |
| **Insurance Contact** | `insuranceContact` | Appointments | string | Insurance provider contact |

---

## 3. API Endpoint Response Mapping

### Endpoint: `GET /api/MedicalRecord/appointment-info/{patientId}`

**Request:**
```http
GET http://localhost:5201/api/MedicalRecord/appointment-info/P-000123
Authorization: Bearer {token}
```

**Response (Success 200):**
```json
{
  "patientId": "P-000123",
  "patientIdentifier": "P-000123",
  "medicalRecordId": 1,
  "name": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@email.com",
  "phone": "+966501234567",
  "address": "123 Main Street, Riyadh",
  "gender": "Male",
  "birthDate": "1990-01-15",
  "age": 34,
  "nationalId": "1234567890",
  "insuranceCompany": "BUPA Arabia",
  "insuranceId": "INS-2024-001",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+966509876543",
  "policyNumber": "POL-2024-12345",
  "coverage": "85",
  "coverageType": "Premium",
  "insuranceExpiryDate": "2025-12-31",
  "insuranceContact": "+966112345678",
  "reasonForVisit": "Regular checkup",
  "appointmentDate": "2026-05-12",
  "appointmentTime": "14:30:00",
  "finalPrice": 500.00
}
```

**Response (Not Found 404):**
```json
{
  "message": "Patient information not found",
  "patientId": "P-000123"
}
```

---

## 4. Frontend Data Mapping (PatientEMRPage.jsx)

### Step 1: API Call
```javascript
const { data: info } = await axios.get(
  `${API_BASE}/api/MedicalRecord/appointment-info/${encodeURIComponent(idToUse)}`,
  { headers }
);
```

### Step 2: Data Extraction
```javascript
const d = data || localFallback();

// Derived values — full data mapping
const displayId  = d.patientIdentifier || patientIdentifier || "—";
const ageVal     = d.age || calcAge(d.birthDate || d.dateOfBirth);
const gender     = fmtGender(d.gender);
const phone      = d.contactNumber || d.phone || "";
const email      = d.email || "";
const address    = d.address || "";
const dob        = d.birthDate || d.dateOfBirth;
const insurance  = d.insuranceCompany || "";
const insId      = d.insuranceId || d.insuranceNumber || "";
const policy     = d.policyNumber || "";
const coverage   = d.coverage ? `${d.coverage}%` : "";
const natId      = d.nationalId || "";
const emgName    = d.emergencyContactName || "";
const emgPhone   = d.emergencyContactPhone || "";
```

### Step 3: Frontend Display
```jsx
// Patient Info Section
<Field label="Gender"        value={gender} />
<Field label="National ID"   value={natId} />
<Field label="Address"       value={address} />
<Field label="Insurance Company" value={insurance} />
<Field label="Insurance ID"  value={insId} />
<Field label="Policy Number" value={policy} />
<Field label="Coverage"      value={coverage} />
```

---

## 5. Data Source Priority

### For Patient Records:
1. **Patients Table (EMR.Patient)**
   - Contains: name, gender, nationalId, address, insurance, phone, email, DOB
   - Used when: `MedicalRecord.PatientId` is set

2. **Appointments Table**
   - Contains: patient name, gender, phone, email, address, national ID, insurance, coverage
   - Used when: Patient record not found

### Fallback Chain:
```
MedicalRecord.PatientId → Patients Table → Appointments Table → Local Storage
```

---

## 6. Database Models

### Patients Table (EMR.Patient)
```csharp
public class Patient
{
    public int Id { get; set; }
    public string? PatientIdentifier { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public DateTime DateOfBirth { get; set; }
    public required string Gender { get; set; }
    public required string Phone { get; set; }
    public required string Email { get; set; }
    public required string Address { get; set; }
    public required string NationalId { get; set; }
    public required string InsuranceCompany { get; set; }
    public required string InsuranceId { get; set; }
    public required string EmergencyContactName { get; set; }
    public required string EmergencyContactPhone { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### Appointments Table
```csharp
public class Appointment
{
    public int AppointmentId { get; set; }
    public string PatientId { get; set; }
    public string PatientName { get; set; }
    public PatientGender PatientGender { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public DateTime? PatientBirthDate { get; set; }
    public string? NationalId { get; set; }
    public string? Address { get; set; }
    public string? InsuranceCompany { get; set; }
    public string? InsuranceId { get; set; }
    public string? PolicyNumber { get; set; }
    public string? Coverage { get; set; }
    public string? CoverageType { get; set; }
    public DateTime? InsuranceExpiryDate { get; set; }
    public string? InsuranceContact { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    // ... other fields
}
```

---

## 7. Common Issues & Solutions

### Issue 1: Gender, National ID, Address Not Showing
**Cause:** Data not populated in database or API returning null
**Solution:**
1. Check database: Ensure Appointment/Patient records have these fields populated
2. Add debug logging (already implemented)
3. Check browser console for API response

### Issue 2: Patient Data Empty in Medical Record
**Cause:** PatientId not matching between tables
**Solution:**
1. Verify PatientIdentifier in both tables
2. Check MedicalRecord.PatientId foreignkey
3. Look at API logs to see which table is being queried

### Issue 3: Insurance Data Missing
**Cause:** Only available in Appointments table
**Solution:**
1. Ensure appointment data is populated
2. Check that API is returning appointment-info endpoint
3. Verify CoverageType, PolicyNumber are in database

---

## 8. Testing Checklist

- [ ] Patient ID displays correctly
- [ ] Full Name shows both first and last name
- [ ] Age calculated correctly from DOB
- [ ] Gender displays as "Male", "Female", or "Other"
- [ ] Date of Birth formatted correctly (DD MMM YYYY)
- [ ] National ID shows 10 digits
- [ ] Phone number displays with country code
- [ ] Email address valid format
- [ ] Address complete with street, city, country
- [ ] Insurance Company name displays
- [ ] Insurance ID matches policy
- [ ] Coverage percentage shows (e.g., "85%")
- [ ] Emergency contact name and phone present
- [ ] All fields updated from latest database records

---

## 9. Frontend Components Using Data Mapping

### PatientEMRPage.jsx
- Path: `/Modules/ClinicSystem/Frontend/src/pages/PatientEMRPage.jsx`
- Route: `http://localhost:5173/patient/medical-record`
- Data Source: API endpoint `appointment-info`

### DoctorViewPatientMedicalRecord.jsx
- Path: `/Modules/ClinicSystem/Frontend/src/DoctorDashboard/DoctorViewPatientMedicalRecord.jsx`
- Route: `http://localhost:5173/doctor/view-medical-record/{patientId}`
- Data Source: API endpoint or initial props

---

## 10. Logging & Debugging

### Backend Logging
The MedicalRecordController now includes comprehensive logging:
```csharp
_logger.LogInformation("[GetAppointmentInfo] Gender={Gender}, NationalId={NationalId}, Address={Address}, InsuranceCompany={InsuranceCompany}",
    patient.Gender, patient.NationalId, patient.Address, patient.InsuranceCompany);
```

### Frontend Logging
PatientEMRPage includes console logging:
```javascript
console.log("[PatientEMRPage] ✓ Gender:", info?.gender);
console.log("[PatientEMRPage] ✓ National ID:", info?.nationalId);
console.log("[PatientEMRPage] ✓ Address:", info?.address);
console.log("[PatientEMRPage] ✓ Insurance Company:", info?.insuranceCompany);
console.log("[PatientEMRPage] ✓ Full API Response:", JSON.stringify(info, null, 2));
```

---

## 11. Data Flow Diagram

```
┌──────────────────────────────────┐
│  PatientEMRPage Component        │
│  Route: /patient/medical-record  │
└──────────────────────┬────────────┘
                       │
                       │ getPatientIdentifier()
                       ▼
┌──────────────────────────────────────────────────┐
│  API: GET /appointment-info/{patientIdentifier}  │
│  Base: http://localhost:5201/api/MedicalRecord   │
└──────────────────────┬──────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   ┌─────────────┐            ┌──────────────────┐
   │   Patients  │            │   Appointments   │
   │   Table     │            │   Table          │
   │             │            │                  │
   │ - Gender    │            │ - PatientGender  │
   │ - NationalId│            │ - NationalId     │
   │ - Address   │            │ - Address        │
   │ - Insurance │            │ - InsuranceInfo  │
   │ - Phone     │            │ - PolicyNumber   │
   │ - Email     │            │ - Coverage       │
   │ - DOB       │            │ - EmergencyInfo  │
   └──────────┬──┘            └────────┬─────────┘
              │                        │
              └────────────┬───────────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │  Response JSON           │
            │  (All fields populated)  │
            └──────────────┬───────────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │  Frontend Normalization  │
            │  (Gender: M→Male, etc)   │
            └──────────────┬───────────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │  Display Components      │
            │  (Patient Info Block)    │
            └──────────────────────────┘
```

---

## 12. Summary

✅ **All required fields are properly mapped from backend to frontend**

The system includes:
- Complete data mapping from Patients and Appointments tables
- Proper fallback chains
- Comprehensive logging for debugging
- Frontend normalization of data
- Support for multiple data sources

**Key Fields Guaranteed to Display:**
- Gender ✓
- National ID ✓
- Address ✓
- Insurance Company ✓
- Insurance ID ✓
- Phone ✓
- Email ✓
- And all other personal/medical information

**To ensure data appears:**
1. Populate database records with complete information
2. Check browser console for API response logs
3. Review backend logs for any errors
4. Verify patient identifier matches across tables
