# 🏥 Eye Clinic ↔ Radiology Center Integration Workflow

**Last Updated:** May 15, 2026  
**Version:** 1.0 (Final Design)  
**Status:** Ready for Implementation  

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Patient Identity Handling](#patient-identity-handling)
4. [Integration Flow Diagram](#integration-flow-diagram)
5. [Data Models & Mapping](#data-models--mapping)
6. [Database Schema](#database-schema)
7. [FHIR/HL7 Compliance](#fhirhl7-compliance)
8. [API Specifications](#api-specifications)
9. [Error Handling & Validation](#error-handling--validation)
10. [Security & Data Privacy](#security--data-privacy)
11. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

This document defines the technical architecture for seamless patient referral integration between **Dr Mohab Eye Clinic System** and **Radiology Center System**. The integration ensures:

✅ **Dual Patient ID System** - Each patient has both an Eye Clinic ID and a Radiology ID  
✅ **Referral Tracking** - Full audit trail of where patient came from  
✅ **Data Consistency** - No duplicate records, automated deduplication  
✅ **FHIR/HL7 Compliance** - Healthcare interoperability standards  
✅ **Multi-Clinic Support** - Can integrate with multiple clinic systems  
✅ **Data Privacy** - HIPAA-compliant with proper access controls  

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Eye Clinic System                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Patient Registry (EYE-####)                        │   │
│  │  - Patient Demographics                            │   │
│  │  - Medical History                                 │   │
│  │  - Eye Clinic Patient ID                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          │ HL7 ADT / FHIR API               │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Referral Service                                  │   │
│  │  - Prepares referral request                       │   │
│  │  - Encrypts patient data                           │   │
│  │  - Sends to Radiology Center                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS + OAuth2.0
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               Radiology Center System                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Referral Receiver Service                         │   │
│  │  - Receives HL7/FHIR message                       │   │
│  │  - Validates patient data                          │   │
│  │  - Checks for duplicates                           │   │
│  │  - Maps to local patient ID                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Patient Service                                   │   │
│  │  - Find or Create Patient                          │   │
│  │  - Link External ID (EYE-####)                     │   │
│  │  - Generate Radiology ID (RAD-####)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Patient Database                                  │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │ Patient (RAD-#### PRIMARY)                   │  │   │
│  │  │ ExternalPatientIdentifier (EYE-#### LINK)    │  │   │
│  │  │ ReferralInformation                          │  │   │
│  │  │ PatientAppointments                          │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Appointment Booking System                        │   │
│  │  - Patient selects service                         │   │
│  │  - Schedules appointment                           │   │
│  │  - Sends result back to Eye Clinic (Optional)     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Patient Identity Handling

### Scenario: Patient Transfer Flow

```
┌──────────────────────────────────────────────────────────────┐
│ Step 1: Doctor Refers Patient (Eye Clinic System)            │
├──────────────────────────────────────────────────────────────┤
│  Patient: Ahmed Ali                                          │
│  Eye Clinic Patient ID: EYE-7781                             │
│  Doctor: Dr Mohab Ali                                        │
│  Referral Type: X-Ray Chest                                  │
│  Reason: Follow-up examination                               │
└──────────────────────────────────────────────────────────────┘
              │
              │ HL7 ADT Message (A04 - Register Patient)
              │ or FHIR Referral Request
              ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 2: Radiology System Receives Referral                   │
├──────────────────────────────────────────────────────────────┤
│  Extract Fields:                                             │
│  - Name: Ahmed Ali ✓                                         │
│  - Date of Birth: 1985-06-15 ✓                              │
│  - Phone: +201234567890 ✓                                    │
│  - National ID: 285850100156300 ✓                            │
│  - External ID: EYE-7781 (from Eye Clinic) ✓               │
│  - Referred From: Dr Mohab Eye Clinic ✓                     │
└──────────────────────────────────────────────────────────────┘
              │
              │ Validate & Deduplicate
              ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 3: Check if Patient Exists                              │
├──────────────────────────────────────────────────────────────┤
│  Deduplication Logic:                                        │
│  1. Search by National ID (285850100156300)                  │
│  2. Search by Phone + DOB (+201234567890 + 1985-06-15)      │
│  3. Search by Exact Name + DOB (Ahmed Ali + 1985-06-15)    │
│                                                              │
│  Result:                                                     │
│  ❌ NOT FOUND in Radiology System                            │
│  → CREATE NEW PATIENT RECORD                                 │
└──────────────────────────────────────────────────────────────┘
              │
              │ Generate New IDs
              ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 4: Create Patient in Radiology System                   │
├──────────────────────────────────────────────────────────────┤
│  Generate Radiology Patient ID: RAD-2045 (auto-increment)   │
│                                                              │
│  Save Records:                                               │
│  Patient Table:                                              │
│  ├─ RadiologyPatientId: RAD-2045 ✓                          │
│  ├─ Name: Ahmed Ali                                         │
│  ├─ DOB: 1985-06-15                                         │
│  ├─ NationalId: 285850100156300                             │
│  ├─ Phone: +201234567890                                    │
│  └─ CreatedFrom: EYE_CLINIC_REFERRAL                        │
│                                                              │
│  ExternalPatientIdentifier Table:                           │
│  ├─ RadiologyPatientId: RAD-2045 (FK)                       │
│  ├─ ExternalSystemName: EYE_CLINIC                          │
│  ├─ ExternalPatientId: EYE-7781                             │
│  └─ ReferralTimestamp: 2026-05-15 10:30:00                  │
│                                                              │
│  ReferralInformation Table:                                 │
│  ├─ RadiologyPatientId: RAD-2045 (FK)                       │
│  ├─ ReferredFromClinic: Dr Mohab Eye Clinic                │
│  ├─ ReferredByDoctor: Dr Mohab Ali                          │
│  ├─ ReferralType: X-Ray Chest                               │
│  ├─ ReferralReason: Follow-up examination                   │
│  └─ ReferralDate: 2026-05-15 10:30:00                       │
└──────────────────────────────────────────────────────────────┘
              │
              │ Ready for Booking
              ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 5: Display in Radiology System                          │
├──────────────────────────────────────────────────────────────┤
│  ┌─ Patient Profile Page ─────────────────────────────────┐  │
│  │  👤 Patient Name: Ahmed Ali                           │  │
│  │  🆔 Radiology Patient ID: RAD-2045                    │  │
│  │  🏥 Referred From: Dr Mohab Eye Clinic                │  │
│  │  👨‍⚕️ Referral Doctor: Dr Mohab Ali                    │  │
│  │  📋 Referral Type: X-Ray Chest                        │  │
│  │  📝 Referral Reason: Follow-up examination            │  │
│  │                                                        │  │
│  │  External System Reference:                           │  │
│  │  🔗 Eye Clinic Patient ID: EYE-7781                   │  │
│  │  📅 Referred On: 2026-05-15 10:30 AM                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Patient can now book appointment for X-Ray service         │
│  with system showing referral context                       │
└──────────────────────────────────────────────────────────────┘
```

### ID Mapping Example

| System | Patient ID | Patient Name | DOB | National ID | Status |
|--------|-----------|--------------|-----|------------|--------|
| **Eye Clinic** | EYE-7781 | Ahmed Ali | 1985-06-15 | 285850100156300 | Original |
| **Radiology** | RAD-2045 | Ahmed Ali | 1985-06-15 | 285850100156300 | Linked |

**Mapping stored in:** `ExternalPatientIdentifier` table with `ExternalSystemName = 'EYE_CLINIC'`

---

## Integration Flow Diagram

### Complete Referral Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    EYE CLINIC SYSTEM                            │
│                                                                 │
│  1. Doctor selects "Refer to Radiology"                        │
│     └─ Patient: Ahmed Ali (EYE-7781)                           │
│     └─ Service: X-Ray Chest                                    │
│                          │                                     │
│                          ▼                                     │
│  2. Referral Service prepares message                          │
│     └─ Collects: Name, DOB, National ID, Phone, etc          │
│     └─ Adds: Referral Reason, Doctor, Timestamp               │
│     └─ Encrypts data with public key                          │
│                          │                                     │
│                          ▼                                     │
│  3. Creates HL7 ADT Message or FHIR Referral                  │
│     └─ Standard healthcare format                             │
│     └─ Includes external patient ID (EYE-7781)                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    │        HTTPS + TLS 1.3 Encrypted         │
    │        OAuth2.0 Bearer Token             │
    │                     │                     │
    ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  RADIOLOGY CENTER SYSTEM                        │
│                                                                 │
│  4. API Gateway receives referral                              │
│     └─ Validates request signature                             │
│     └─ Verifies OAuth2.0 token                                 │
│     └─ Rate limiting check                                     │
│                          │                                     │
│                          ▼                                     │
│  5. Message Queue stores referral (async)                      │
│     └─ RabbitMQ / Kafka for reliability                        │
│     └─ Retry mechanism if processing fails                     │
│                          │                                     │
│                          ▼                                     │
│  6. ReferralProcessor Service                                  │
│     └─ Parses HL7/FHIR message                                 │
│     └─ Decrypts private data                                   │
│     └─ Extracts patient demographics                           │
│                          │                                     │
│                          ▼                                     │
│  7. PatientDeduplicationService                                │
│     └─ Search Query 1: WHERE NationalId = '285850100156300'   │
│        Result: ❌ Not found                                    │
│     └─ Search Query 2: WHERE Phone = '+201234567890'          │
│                              AND DOB = '1985-06-15'           │
│        Result: ❌ Not found                                    │
│     └─ Search Query 3: WHERE Name LIKE 'Ahmed Ali'            │
│                              AND DOB = '1985-06-15'           │
│        Result: ❌ Not found                                    │
│     └─ Decision: CREATE NEW PATIENT                            │
│                          │                                     │
│                          ▼                                     │
│  8. PatientIdentifierService                                   │
│     └─ SELECT MAX(PatientId) FROM Patient                      │
│     └─ Last ID: RAD-2044                                       │
│     └─ Generate: RAD-2045 (thread-safe increment)             │
│                          │                                     │
│                          ▼                                     │
│  9. Create Patient Record (Transaction)                        │
│     ├─ INSERT INTO Patient (RAD-2045, Ahmed Ali, ...)         │
│     ├─ INSERT INTO ExternalPatientIdentifier                   │
│     │  └─ (RAD-2045, 'EYE_CLINIC', 'EYE-7781')              │
│     ├─ INSERT INTO ReferralInformation                         │
│     │  └─ (RAD-2045, 'Dr Mohab Eye Clinic', ...)             │
│     └─ Commit all at once (ACID)                              │
│                          │                                     │
│                          ▼                                     │
│  10. Send Acknowledgment (ACK)                                 │
│     └─ Message: "Patient registered as RAD-2045"              │
│     └─ Timestamp: 2026-05-15 10:30:15 UTC                    │
│     └─ Send back to Eye Clinic System                         │
│                          │                                     │
│                          ▼                                     │
│  11. Patient Can Now:                                          │
│     ✓ View profile page (shows referral info)                 │
│     ✓ Book appointment for X-Ray service                      │
│     ✓ See their Radiology Patient ID (RAD-2045)              │
│     ✓ See original Eye Clinic ID (EYE-7781)                  │
│     ✓ View referral doctor and reason                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models & Mapping

### Patient Data Model

#### Eye Clinic System → Radiology System Mapping

```javascript
// Input from Eye Clinic (HL7 ADT / FHIR)
{
  "externalSystem": "EYE_CLINIC",
  "externalPatientId": "EYE-7781",
  "patient": {
    "firstName": "Ahmed",
    "lastName": "Ali",
    "dateOfBirth": "1985-06-15",
    "gender": "M",
    "nationalId": "285850100156300",
    "phone": "+201234567890",
    "email": "ahmed.ali@email.com",
    "address": "123 Nile Street, Cairo, Egypt"
  },
  "referral": {
    "referredBy": "Dr Mohab Ali",
    "referralType": "X-Ray Chest",
    "reason": "Follow-up examination",
    "timestamp": "2026-05-15T10:30:00Z"
  }
}

         ⬇️ MAPPING ⬇️

// Radiology System Internal Format
{
  "radiologyPatientId": "RAD-2045",  // Generated
  "name": "Ahmed Ali",
  "dateOfBirth": "1985-06-15",
  "gender": "M",
  "nationalId": "285850100156300",
  "phone": "+201234567890",
  "email": "ahmed.ali@email.com",
  "address": "123 Nile Street, Cairo, Egypt",
  "externalIdentifiers": [
    {
      "system": "EYE_CLINIC",
      "value": "EYE-7781",
      "assignedDate": "2026-05-15T10:30:00Z"
    }
  ],
  "referralInfo": {
    "clinic": "Dr Mohab Eye Clinic",
    "doctor": "Dr Mohab Ali",
    "referralType": "X-Ray Chest",
    "reason": "Follow-up examination",
    "referralDate": "2026-05-15T10:30:00Z",
    "status": "ACTIVE"
  },
  "createdFrom": "EXTERNAL_REFERRAL",
  "createdAt": "2026-05-15T10:30:15Z"
}
```

---

## Database Schema

### Core Tables

#### 1. Patient Table

```sql
CREATE TABLE Patient (
  PatientId NVARCHAR(10) PRIMARY KEY,        -- RAD-0001, RAD-0002, etc
  FirstName NVARCHAR(100) NOT NULL,
  LastName NVARCHAR(100) NOT NULL,
  FullName NVARCHAR(200) NOT NULL,           -- Calculated column
  DateOfBirth DATE NOT NULL,
  Gender NVARCHAR(10),                       -- M, F, Other
  NationalId NVARCHAR(20) UNIQUE,            -- Egyptian ID
  Phone NVARCHAR(20) UNIQUE,
  Email NVARCHAR(100),
  Address NVARCHAR(255),
  CreatedFrom NVARCHAR(50),                  -- DIRECT_REGISTRATION, EYE_CLINIC_REFERRAL, etc
  CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
  UpdatedAt DATETIME DEFAULT GETUTCDATE(),
  IsActive BIT DEFAULT 1
);

-- Indexes for fast lookup
CREATE INDEX IX_Patient_NationalId ON Patient(NationalId);
CREATE INDEX IX_Patient_Phone_DOB ON Patient(Phone, DateOfBirth);
CREATE INDEX IX_Patient_FullName_DOB ON Patient(FullName, DateOfBirth);
CREATE INDEX IX_Patient_CreatedAt ON Patient(CreatedAt);
```

#### 2. ExternalPatientIdentifier Table

```sql
CREATE TABLE ExternalPatientIdentifier (
  ExternalPatientIdentifierId INT PRIMARY KEY IDENTITY(1,1),
  PatientId NVARCHAR(10) NOT NULL,
  ExternalSystemName NVARCHAR(50) NOT NULL,  -- EYE_CLINIC, HOSPITAL_A, CLINIC_B
  ExternalPatientId NVARCHAR(50) NOT NULL,   -- EYE-7781
  AssignedDate DATETIME NOT NULL DEFAULT GETUTCDATE(),
  IsActive BIT DEFAULT 1,
  
  FOREIGN KEY (PatientId) REFERENCES Patient(PatientId) ON DELETE CASCADE,
  UNIQUE (ExternalSystemName, ExternalPatientId)
);

-- Indexes
CREATE INDEX IX_ExternalPatientId_System_Id 
  ON ExternalPatientIdentifier(ExternalSystemName, ExternalPatientId);
CREATE INDEX IX_ExternalPatientId_PatientId 
  ON ExternalPatientIdentifier(PatientId);
```

#### 3. ReferralInformation Table

```sql
CREATE TABLE ReferralInformation (
  ReferralId INT PRIMARY KEY IDENTITY(1,1),
  PatientId NVARCHAR(10) NOT NULL,
  ExternalSystemName NVARCHAR(50) NOT NULL,  -- EYE_CLINIC
  ReferredFromClinic NVARCHAR(100),          -- Dr Mohab Eye Clinic
  ReferredByDoctor NVARCHAR(100),            -- Dr Mohab Ali
  ReferralType NVARCHAR(100),                -- X-Ray Chest, Ultrasound, etc
  ReferralReason NVARCHAR(500),              -- Medical reason
  ReferralStatus NVARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, CANCELLED
  ReferralDate DATETIME NOT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
  UpdatedAt DATETIME DEFAULT GETUTCDATE(),
  
  FOREIGN KEY (PatientId) REFERENCES Patient(PatientId) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IX_ReferralInformation_PatientId 
  ON ReferralInformation(PatientId);
CREATE INDEX IX_ReferralInformation_Status 
  ON ReferralInformation(ReferralStatus);
```

#### 4. PatientAppointment Table (Enhanced)

```sql
CREATE TABLE PatientAppointment (
  AppointmentId INT PRIMARY KEY IDENTITY(1,1),
  PatientId NVARCHAR(10) NOT NULL,
  ServiceId INT NOT NULL,
  AppointmentDate DATE NOT NULL,
  AppointmentTime TIME NOT NULL,
  Status NVARCHAR(20) DEFAULT 'SCHEDULED',   -- SCHEDULED, COMPLETED, CANCELLED
  ReferralId INT NULL,                       -- Link to external referral
  Notes NVARCHAR(500),
  CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
  UpdatedAt DATETIME DEFAULT GETUTCDATE(),
  
  FOREIGN KEY (PatientId) REFERENCES Patient(PatientId),
  FOREIGN KEY (ServiceId) REFERENCES Service(ServiceId),
  FOREIGN KEY (ReferralId) REFERENCES ReferralInformation(ReferralId)
);

-- Indexes
CREATE INDEX IX_PatientAppointment_PatientId 
  ON PatientAppointment(PatientId);
CREATE INDEX IX_PatientAppointment_Date 
  ON PatientAppointment(AppointmentDate);
```

#### 5. PatientSyncLog Table (Audit Trail)

```sql
CREATE TABLE PatientSyncLog (
  SyncLogId INT PRIMARY KEY IDENTITY(1,1),
  PatientId NVARCHAR(10),
  ExternalSystemName NVARCHAR(50),
  ExternalPatientId NVARCHAR(50),
  SyncDirection NVARCHAR(20),                 -- INBOUND, OUTBOUND
  SyncType NVARCHAR(30),                      -- CREATE, UPDATE, DELETE
  SyncStatus NVARCHAR(20),                    -- SUCCESS, FAILED, PENDING
  ErrorMessage NVARCHAR(500) NULL,
  Payload NVARCHAR(MAX),                      -- JSON data synced
  SyncedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
  
  FOREIGN KEY (PatientId) REFERENCES Patient(PatientId)
);

-- Indexes
CREATE INDEX IX_SyncLog_PatientId ON PatientSyncLog(PatientId);
CREATE INDEX IX_SyncLog_SyncedAt ON PatientSyncLog(SyncedAt);
```

---

## FHIR/HL7 Compliance

### HL7 ADT Message (A04 - Register Patient)

```
MSH|^~\&|EYE_CLINIC|DrMohab|RADIOLOGY|RadCenter|20260515103000||ADT^A04|MSG001|P|2.5|
EVN|A04|20260515103000||REFERRAL||Dr Mohab Ali|
PID|1||EYE-7781^^^EYE_CLINIC||ALI^AHMED||19850615|M|||123 NILE STREET^CAIRO^CAIRO^EGYPT||^WPN^PH|^^^^^+201234567890~^^^^^AHMED.ALI@EMAIL.COM|||||285850100156300||
OBR|1|X-RAY-001|RAD-REF-001|71046008^Chest X-ray|||20260515|||||||||20260515103000|||F|||||||||||||^X-RAY^CHEST|
OBX|1|NM|REASON||Follow-up examination|||||

Fields Explained:
├─ MSH: Message Header (System info)
├─ EVN: Event Type (A04 = Register Patient for Referral)
├─ PID: Patient ID Segment
│  ├─ Field 3: EYE-7781^^^EYE_CLINIC (External ID & System)
│  ├─ Field 5: ALI^AHMED (Last Name^First Name)
│  ├─ Field 7: 19850615 (DOB)
│  ├─ Field 8: M (Gender)
│  ├─ Field 11: Address
│  ├─ Field 13: Phone
│  └─ Field 19: 285850100156300 (National ID)
├─ OBR: Observation Request (Referral Type)
│  └─ SNOMED Code: 71046008 (Chest X-ray)
└─ OBX: Observation Result (Referral Reason)
```

### FHIR Referral Resource (JSON)

```json
{
  "resourceType": "ServiceRequest",
  "id": "RAD-REF-001",
  "identifier": [
    {
      "system": "http://eye-clinic.local/referral",
      "value": "REF-001"
    }
  ],
  "status": "active",
  "intent": "order",
  "subject": {
    "reference": "Patient/RAD-2045",
    "display": "Ahmed Ali"
  },
  "patientIdentifier": {
    "system": "http://eye-clinic.local/patient",
    "value": "EYE-7781"
  },
  "code": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "71046008",
        "display": "Chest X-ray"
      }
    ]
  },
  "requester": {
    "reference": "Practitioner/DR-MOHAB",
    "display": "Dr Mohab Ali"
  },
  "performer": [
    {
      "reference": "Organization/RADCENTER",
      "display": "Radiology Center"
    }
  ],
  "authoredOn": "2026-05-15T10:30:00Z",
  "reasonCode": [
    {
      "text": "Follow-up examination"
    }
  ],
  "extension": [
    {
      "url": "http://radiology-center.local/referral-source",
      "valueString": "Dr Mohab Eye Clinic"
    }
  ]
}
```

---

## API Specifications

### 1. Receive Referral Endpoint

```
POST /api/v1/referrals/receive
Content-Type: application/json
Authorization: Bearer {OAuth2Token}

Request Body:
{
  "externalSystem": "EYE_CLINIC",
  "externalPatientId": "EYE-7781",
  "messageFormat": "FHIR|HL7",
  "message": "{HL7_or_FHIR_payload}",
  "signature": "{HMAC_SHA256_signature}"
}

Response (201 Created):
{
  "success": true,
  "radiologyPatientId": "RAD-2045",
  "externalPatientId": "EYE-7781",
  "message": "Patient registered successfully",
  "timestamp": "2026-05-15T10:30:15Z"
}

Error Response (409 Conflict - Duplicate):
{
  "success": false,
  "error": "PATIENT_ALREADY_EXISTS",
  "radiologyPatientId": "RAD-2000",
  "message": "Patient with National ID already exists",
  "timestamp": "2026-05-15T10:30:15Z"
}
```

### 2. Get Patient by External ID

```
GET /api/v1/patients/external/{externalSystem}/{externalPatientId}
Authorization: Bearer {OAuth2Token}

Response (200 OK):
{
  "radiologyPatientId": "RAD-2045",
  "externalPatientId": "EYE-7781",
  "name": "Ahmed Ali",
  "dateOfBirth": "1985-06-15",
  "nationalId": "285850100156300",
  "phone": "+201234567890",
  "email": "ahmed.ali@email.com",
  "referralInfo": {
    "clinic": "Dr Mohab Eye Clinic",
    "doctor": "Dr Mohab Ali",
    "referralType": "X-Ray Chest",
    "reason": "Follow-up examination",
    "referralDate": "2026-05-15T10:30:00Z"
  }
}

Response (404 Not Found):
{
  "error": "PATIENT_NOT_FOUND",
  "externalPatientId": "EYE-7781"
}
```

### 3. Get Patient by Radiology ID

```
GET /api/v1/patients/{radiologyPatientId}
Authorization: Bearer {OAuth2Token}

Response (200 OK):
{
  "radiologyPatientId": "RAD-2045",
  "name": "Ahmed Ali",
  "dateOfBirth": "1985-06-15",
  "gender": "M",
  "nationalId": "285850100156300",
  "phone": "+201234567890",
  "email": "ahmed.ali@email.com",
  "address": "123 Nile Street, Cairo, Egypt",
  "externalIdentifiers": [
    {
      "system": "EYE_CLINIC",
      "value": "EYE-7781",
      "assignedDate": "2026-05-15T10:30:00Z"
    }
  ],
  "referralInfo": {
    "clinic": "Dr Mohab Eye Clinic",
    "doctor": "Dr Mohab Ali",
    "referralType": "X-Ray Chest",
    "reason": "Follow-up examination",
    "status": "ACTIVE"
  },
  "createdFrom": "EXTERNAL_REFERRAL",
  "appointments": [
    {
      "appointmentId": 1,
      "serviceName": "X-Ray",
      "appointmentDate": "2026-05-20",
      "appointmentTime": "14:00"
    }
  ]
}
```

### 4. Create Appointment from Referral

```
POST /api/v1/appointments
Content-Type: application/json
Authorization: Bearer {OAuth2Token}

Request Body:
{
  "radiologyPatientId": "RAD-2045",
  "serviceId": 5,
  "appointmentDate": "2026-05-20",
  "appointmentTime": "14:00",
  "notes": "Follow-up X-Ray from referral"
}

Response (201 Created):
{
  "appointmentId": 1,
  "radiologyPatientId": "RAD-2045",
  "serviceName": "X-Ray",
  "appointmentDate": "2026-05-20",
  "appointmentTime": "14:00",
  "status": "SCHEDULED",
  "message": "Appointment created successfully"
}
```

---

## Error Handling & Validation

### Deduplication Logic

```csharp
// C# Implementation
public class PatientDeduplicationService
{
    public async Task<(bool Found, Patient Patient)> FindDuplicateAsync(
        string firstName, string lastName, DateTime dateOfBirth, 
        string nationalId = null, string phone = null)
    {
        // Strategy 1: National ID (Most reliable)
        if (!string.IsNullOrEmpty(nationalId))
        {
            var patient = await _context.Patients
                .Where(p => p.NationalId == nationalId)
                .FirstOrDefaultAsync();
            
            if (patient != null)
                return (true, patient);
        }
        
        // Strategy 2: Phone + DOB
        if (!string.IsNullOrEmpty(phone))
        {
            var patient = await _context.Patients
                .Where(p => p.Phone == phone && p.DateOfBirth == dateOfBirth)
                .FirstOrDefaultAsync();
            
            if (patient != null)
                return (true, patient);
        }
        
        // Strategy 3: Name + DOB (fuzzy match)
        var fullName = $"{firstName} {lastName}".ToUpper();
        var patient = await _context.Patients
            .Where(p => p.FullName == fullName && p.DateOfBirth == dateOfBirth)
            .FirstOrDefaultAsync();
        
        return patient != null ? (true, patient) : (false, null);
    }
}
```

### Validation Rules

```
Referral Reception Validation:
├─ Message Format
│  ├─ Valid HL7 or FHIR structure
│  └─ Required fields present (name, DOB, gender)
├─ Patient Data
│  ├─ Name: Not empty, max 100 characters
│  ├─ DOB: Valid date, not in future
│  ├─ National ID: Valid format (if provided)
│  ├─ Phone: Valid international format
│  └─ Gender: M, F, or Other
├─ Referral Data
│  ├─ Referred By Doctor: Not empty
│  ├─ Referral Type: Valid service exists
│  └─ Referral Date: Valid timestamp
└─ Security
   ├─ Message signature valid
   ├─ OAuth2 token valid
   └─ Source system authorized
```

---

## Security & Data Privacy

### Authentication & Authorization

```
┌─────────────────────────────────────────────────┐
│ OAuth2.0 Flow (Client Credentials Grant)        │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. Eye Clinic requests token:                  │
│     POST /auth/token                            │
│     client_id: eye_clinic_001                   │
│     client_secret: {SECURE_SECRET}              │
│     grant_type: client_credentials              │
│                                                 │
│  2. Radiology Center issues JWT token:          │
│     access_token: {JWT_TOKEN}                   │
│     expires_in: 3600 seconds                    │
│                                                 │
│  3. Eye Clinic includes token in header:        │
│     Authorization: Bearer {JWT_TOKEN}           │
│                                                 │
│  4. Radiology validates token:                  │
│     ├─ Check signature (HS256)                 │
│     ├─ Check expiration                        │
│     ├─ Check permissions                       │
│     └─ Allow or reject request                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Data Encryption

```
┌─ In Transit ─────────────────────────────────┐
│ HTTPS/TLS 1.3                                │
│ ├─ Encrypt all API communication            │
│ ├─ Certificate pinning (optional)            │
│ └─ Cipher suites: AEAD (ChaCha20, AES-GCM)  │
└───────────────────────────────────────────────┘

┌─ At Rest ─────────────────────────────────────┐
│ Database Encryption                           │
│ ├─ Transparent Data Encryption (TDE)         │
│ ├─ Column-level encryption for PII           │
│ │  └─ NationalId, Phone, Email, Address      │
│ └─ Key management via Azure Key Vault        │
└───────────────────────────────────────────────┘

┌─ Message Signing ─────────────────────────────┐
│ HMAC-SHA256 for message integrity            │
│ ├─ Secret key shared between systems         │
│ ├─ Sign: HMAC(payload, secret)               │
│ ├─ Verify: Ensure signature matches          │
│ └─ Prevents tampering and replay attacks     │
└───────────────────────────────────────────────┘
```

### HIPAA Compliance

```
Compliance Checklist:
✓ Access Controls: OAuth2.0 + Role-based access
✓ Audit Logging: All data access logged (PatientSyncLog)
✓ Data Integrity: Message signing + encryption
✓ Authentication: JWT tokens + credentials
✓ Accountability: Sync logs track who accessed what
✓ Confidentiality: Encryption in transit & at rest
✓ De-identification: Support for removing PII
✓ Breach Notification: Alert mechanisms in place
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

- [x] Design database schema
- [x] Create Patient & ExternalPatientIdentifier tables
- [x] Create ReferralInformation table
- [x] Create PatientSyncLog for audit trail
- [ ] Implement PatientIdentifierService (thread-safe)
- [ ] Implement PatientDeduplicationService

### Phase 2: Integration Layer (Weeks 3-4)

- [ ] Create ReferralReceiverService
  - [ ] Parse HL7/FHIR messages
  - [ ] Validate incoming data
  - [ ] Deduplicate patients
- [ ] Implement PatientService (Find or Create)
- [ ] Create audit logging service
- [ ] Set up message queue (RabbitMQ/Kafka)

### Phase 3: API Endpoints (Weeks 5-6)

- [ ] POST /api/v1/referrals/receive
- [ ] GET /api/v1/patients/{radiologyPatientId}
- [ ] GET /api/v1/patients/external/{system}/{externalId}
- [ ] POST /api/v1/appointments
- [ ] Implement OAuth2.0 token validation

### Phase 4: Security & Testing (Weeks 7-8)

- [ ] Implement HTTPS/TLS encryption
- [ ] Add HMAC-SHA256 message signing
- [ ] Implement database encryption (TDE)
- [ ] Create comprehensive unit tests
- [ ] Create integration tests with mock Eye Clinic
- [ ] Perform security audit

### Phase 5: Deployment (Week 9+)

- [ ] Deploy to staging environment
- [ ] Integration testing with real Eye Clinic system
- [ ] User acceptance testing (UAT)
- [ ] Deploy to production
- [ ] Monitor and optimize performance

---

## Example: Complete Referral Request

### Request JSON

```json
{
  "externalSystem": "EYE_CLINIC",
  "externalPatientId": "EYE-7781",
  "messageFormat": "FHIR",
  "message": {
    "resourceType": "ServiceRequest",
    "id": "RAD-REF-001",
    "status": "active",
    "subject": {
      "reference": "Patient/EYE-7781",
      "display": "Ahmed Ali"
    },
    "patient": {
      "firstName": "Ahmed",
      "lastName": "Ali",
      "dateOfBirth": "1985-06-15",
      "gender": "M",
      "nationalId": "285850100156300",
      "phone": "+201234567890",
      "email": "ahmed.ali@email.com",
      "address": "123 Nile Street, Cairo, Egypt"
    },
    "code": {
      "coding": [
        {
          "system": "http://snomed.info/sct",
          "code": "71046008",
          "display": "Chest X-ray"
        }
      ]
    },
    "requester": {
      "reference": "Practitioner/DR-MOHAB",
      "display": "Dr Mohab Ali"
    },
    "authoredOn": "2026-05-15T10:30:00Z",
    "reasonCode": [
      {
        "text": "Follow-up examination"
      }
    ],
    "extension": [
      {
        "url": "http://radiology-center.local/referral-source-clinic",
        "valueString": "Dr Mohab Eye Clinic"
      }
    ]
  },
  "signature": "a3c5e9f1b2d4g6h8j0k2m4n6p8q0r2s4t6u8v0w2x4y6z8"
}
```

### Response JSON

```json
{
  "success": true,
  "radiologyPatientId": "RAD-2045",
  "externalPatientId": "EYE-7781",
  "patient": {
    "name": "Ahmed Ali",
    "dateOfBirth": "1985-06-15",
    "gender": "M",
    "nationalId": "285850100156300",
    "phone": "+201234567890"
  },
  "referralInfo": {
    "clinic": "Dr Mohab Eye Clinic",
    "doctor": "Dr Mohab Ali",
    "referralType": "Chest X-ray",
    "referralReason": "Follow-up examination",
    "referralDate": "2026-05-15T10:30:00Z",
    "status": "ACTIVE"
  },
  "externalIdentifiers": [
    {
      "system": "EYE_CLINIC",
      "value": "EYE-7781",
      "assignedDate": "2026-05-15T10:30:15Z"
    }
  ],
  "message": "Patient registered successfully. Ready for appointment booking.",
  "nextSteps": [
    "Patient can view profile with referral information",
    "Patient can book appointment for referred service",
    "System will maintain link to original Eye Clinic record"
  ],
  "timestamp": "2026-05-15T10:30:15Z"
}
```

---

## Multi-Clinic Support Example

The system can easily integrate with multiple clinics:

```sql
-- Example: Radiology Center receives referrals from multiple sources
INSERT INTO ExternalPatientIdentifier (PatientId, ExternalSystemName, ExternalPatientId)
VALUES 
  ('RAD-2045', 'EYE_CLINIC', 'EYE-7781'),      -- Eye Clinic
  ('RAD-2045', 'CAIRO_HOSPITAL', 'CRH-1234'),  -- Cairo Hospital
  ('RAD-2045', 'HELWAN_CLINIC', 'HLC-5678');   -- Helwan Clinic

-- Query: Find all external systems that have reference to this patient
SELECT 
  ExternalSystemName,
  ExternalPatientId,
  AssignedDate
FROM ExternalPatientIdentifier
WHERE PatientId = 'RAD-2045'
ORDER BY AssignedDate;

-- Result:
-- EYE_CLINIC        | EYE-7781      | 2026-05-15 10:30:00
-- CAIRO_HOSPITAL    | CRH-1234      | 2026-05-15 11:45:00
-- HELWAN_CLINIC     | HLC-5678      | 2026-05-15 13:20:00
```

---

## Summary

This integration design provides:

✅ **Seamless Patient Transfer** from Eye Clinic to Radiology Center  
✅ **Unified Patient ID System** with external ID linking  
✅ **Complete Referral Tracking** with audit trail  
✅ **FHIR/HL7 Compliance** for healthcare interoperability  
✅ **Security & Privacy** with encryption and access control  
✅ **Multi-Clinic Support** for multiple external systems  
✅ **Scalable Architecture** ready for production deployment  

The implementation follows healthcare industry standards and best practices, ensuring data integrity, security, and compliance with regulations like HIPAA.

---

**Document Version:** 1.0  
**Last Updated:** May 15, 2026  
**Status:** Ready for Development Team Review
