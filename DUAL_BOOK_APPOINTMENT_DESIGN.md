# 📱 Dual Book Appointment Pages Design - Radiology Center System

**Version:** 2.0 (Clinic-Referred + Direct Workflows)  
**Date:** May 15, 2026  
**Status:** Ready for Implementation  

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Workflow 1: Eye Clinic Referred Patient](#workflow-1-eye-clinic-referred-patient)
4. [Workflow 2: Direct Radiology Patient](#workflow-2-direct-radiology-patient)
5. [FHIR/HL7 Integration](#fhirhl7-integration)
6. [Component Structure](#component-structure)
7. [API Specifications](#api-specifications)
8. [Database Schema](#database-schema)
9. [Admin Dashboard](#admin-dashboard)
10. [Implementation Guide](#implementation-guide)

---

## Executive Summary

The Radiology Center System requires two distinct appointment booking workflows, both integrated with FHIR/HL7 standards:

### **Workflow 1: Clinic-Referred Patient** 🏥
- **Source:** Eye Clinic System via FHIR/HL7 integration
- **Data Entry:** Automatic (100% read-only)
- **Interaction:** Select Date + Time only
- **Data Flow:** HL7 ADT/ORM → FHIR Parser → Auto-populate → Book

### **Workflow 2: Direct Patient** 👤
- **Source:** Direct access to Radiology Center
- **Data Entry:** Manual (100% editable)
- **Interaction:** Fill form + Select Date + Time
- **Data Flow:** Patient Entry → Validation → FHIR Creation → Book

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      EYE CLINIC SYSTEM                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Doctor creates order:                                   │   │
│  │ - Patient Name: Ahmed Ali                              │   │
│  │ - Patient ID: EYE-7781                                 │   │
│  │ - Referral Type: X-Ray Chest                          │   │
│  │ - Doctor: Dr Mohab Ali                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ HL7 ORM Message Creator                                │   │
│  │ (ORM - Order Message)                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        │     HTTPS + TLS 1.3 Encrypted      │
        │     FHIR REST API / HL7 v2.5       │
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                   RADIOLOGY CENTER SYSTEM                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API Gateway & Message Receiver                         │   │
│  │  - Validates HL7 signature                             │   │
│  │  - Parses FHIR ServiceRequest                          │   │
│  │  - Deduplicates patient                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  FHIR Data Mapper Service                               │   │
│  │  - Maps external IDs to local IDs                       │   │
│  │  - Creates FHIR Patient Resource                        │   │
│  │  - Stores in Patient Context                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                       │
├──────────────────────────┼───────────────────────────────────────┤
│                          │                                       │
│  BRANCH 1:               │              BRANCH 2:                │
│  Referred Patient        │              Direct Patient           │
│  └──────────────┬────────┘              ┌────────┬────────────┘ │
│                 │                       │                       │
│  ┌──────────────▼──────────────┐  ┌────▼────────────────────┐  │
│  │  BookAppointmentPage        │  │  BookAppointmentPage     │  │
│  │  (Clinic-Referred Workflow) │  │  (Direct Workflow)       │  │
│  │                            │  │                          │  │
│  │  ✓ Read-only patient data  │  │  ✓ Empty form fields    │  │
│  │  ✓ Auto-filled from FHIR   │  │  ✓ Manual entry required│  │
│  │  ✓ Select date + time only │  │  ✓ Full form validation │  │
│  │  ✓ One-click booking       │  │  ✓ Upload optional docs │  │
│  │                            │  │  ✓ Book button          │  │
│  └──────────────┬──────────────┘  └────┬────────────────────┘  │
│                 │                       │                       │
│                 └───────────┬───────────┘                       │
│                             │                                   │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Appointment Booking Service                            │   │
│  │  - Creates FHIR Appointment Resource                    │   │
│  │  - Reserves time slot                                  │   │
│  │  - Sends to admin queue                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Radiology Admin Dashboard                              │   │
│  │  - Shows both workflow appointments                     │   │
│  │  - Marks source (Clinic vs Direct)                     │   │
│  │  - Accept / Reject / Reschedule                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Appointment Confirmation                               │   │
│  │  - Send FHIR Appointment Resource back to clinic      │   │
│  │  - Mark as Booked in Radiology System                  │   │
│  │  - Patient receives confirmation                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Workflow 1: Eye Clinic Referred Patient

### Data Flow with FHIR/HL7

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Doctor Creates Order in Eye Clinic System           │
├─────────────────────────────────────────────────────────────┤
│  Doctor Form:                                               │
│  ├─ Patient: Ahmed Ali (EYE-7781)                          │
│  ├─ Gender: Male                                            │
│  ├─ DOB: 1985-06-15                                        │
│  ├─ Phone: +201234567890                                   │
│  ├─ Test: X-Ray Chest                                      │
│  ├─ Department: Radiology                                  │
│  ├─ Clinical Notes: Follow-up examination                  │
│  ├─ Priority: Routine                                      │
│  └─ Doctor: Dr Mohab Ali                                   │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Eye Clinic Creates HL7 ORM Message                 │
├─────────────────────────────────────────────────────────────┤
│  HL7 v2.5 ORM^O01 Message:                                 │
│                                                              │
│  MSH|^~\&|EYE_CLINIC|DrMohab|RADIOLOGY|RadCenter|...|ORM..│ │
│  PID|1||EYE-7781^^^EYE_CLINIC||ALI^AHMED||19850615|M|...│  │
│  OBR|1|ORDER001|RAD001|71046008^Chest X-ray|...|          │  │
│  OBX|1|NM|NOTES||Follow-up examination|...|               │  │
│  NTE|1||Ordered by Dr Mohab Ali|                           │  │
│                                                              │
│  Contains:                                                   │
│  - MSH: Message header with source/destination             │
│  - PID: Patient segment (demographics + EYE ID)           │
│  - OBR: Order request (test, priority, notes)             │
│  - OBX: Observation/notes                                  │
│  - NTE: Additional notes                                    │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Convert HL7 to FHIR ServiceRequest                 │
├─────────────────────────────────────────────────────────────┤
│  FHIR R4 ServiceRequest:                                    │
│  {                                                           │
│    "resourceType": "ServiceRequest",                         │
│    "id": "RAD-REQ-001",                                     │
│    "identifier": [                                          │
│      {                                                      │
│        "system": "http://eye-clinic/request",              │
│        "value": "ORDER001"                                  │
│      }                                                       │
│    ],                                                        │
│    "status": "active",                                      │
│    "intent": "order",                                       │
│    "code": {                                                │
│      "coding": [{                                           │
│        "system": "http://snomed.info/sct",                 │
│        "code": "71046008",                                  │
│        "display": "Chest X-ray"                             │
│      }]                                                      │
│    },                                                        │
│    "subject": {                                             │
│      "reference": "Patient/RAD-2045",                      │
│      "display": "Ahmed Ali"                                 │
│    },                                                        │
│    "requester": {                                           │
│      "reference": "Practitioner/DR-MOHAB",                │
│      "display": "Dr Mohab Ali"                             │
│    },                                                        │
│    "reasonCode": [{                                         │
│      "text": "Follow-up examination"                        │
│    }],                                                       │
│    "authoredOn": "2026-05-15T10:30:00Z",                   │
│    "priority": "routine"                                    │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Radiology Center Receives & Parses FHIR            │
├─────────────────────────────────────────────────────────────┤
│  API Endpoint:                                              │
│  POST /api/v1/appointments/from-referral                   │
│                                                              │
│  Receives FHIR ServiceRequest JSON                         │
│  ├─ Validates signature (OAuth2.0 + HMAC)                 │
│  ├─ Deduplicates patient (by National ID / Phone)         │
│  ├─ Maps to internal Radiology Patient ID                 │
│  ├─ Stores external ID mapping (EYE-7781 ↔ RAD-2045)     │
│  └─ Loads patient context in session                       │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: BookAppointmentPage (Clinic-Referred) Loads        │
├─────────────────────────────────────────────────────────────┤
│  URL: /radiology/book/appointment?fromClinic=true          │
│                                                              │
│  Page receives patientData context:                        │
│  {                                                           │
│    "fromClinic": true,                                     │
│    "clinicSystemName": "EYE_CLINIC",                       │
│    "externalPatientId": "EYE-7781",                        │
│    "patientData": {                                        │
│      "name": "Ahmed Ali",                                  │
│      "gender": "M",                                        │
│      "dateOfBirth": "1985-06-15",                          │
│      "age": 40,                                             │
│      "phone": "+201234567890",                             │
│      "referredTest": "X-Ray Chest",                        │
│      "referredDoctor": "Dr Mohab Ali",                    │
│      "clinicalNotes": "Follow-up examination",             │
│      "priority": "routine"                                  │
│    }                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Page Renders Read-Only Patient Data                │
├─────────────────────────────────────────────────────────────┤
│  LEFT COLUMN (Read-only):                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 Patient Name: Ahmed Ali                           │  │
│  │ 👫 Gender: Male                                      │  │
│  │ 🎂 Age: 40 years                                     │  │
│  │ 📞 Phone: +201234567890                              │  │
│  │                                                      │  │
│  │ REFERRAL INFORMATION:                                │  │
│  │ 🏥 Referred From: Dr Mohab Eye Clinic                │  │
│  │ 👨‍⚕️ Referred By: Dr Mohab Ali                         │  │
│  │ 🆔 External ID: EYE-7781                             │  │
│  │ 📋 Clinical Notes: Follow-up examination             │  │
│  │ ⚡ Priority: Routine                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  RIGHT COLUMN (Interactive):                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ APPOINTMENT SUMMARY                                  │  │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  │ 🩻 Requested Test: X-Ray Chest                       │  │
│  │ 📍 Department: Radiology                             │  │
│  │ ⏱ Estimated Duration: 20 minutes                    │  │
│  │                                                      │  │
│  │ 📅 SELECT DATE & TIME:                               │  │
│  │ [Calendar View]  [Time Slots]                       │  │
│  │                                                      │  │
│  │ [BOOK APPOINTMENT] (ONE CLICK)                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Patient Selects Date & Time                        │
├─────────────────────────────────────────────────────────────┤
│  Interactive elements:                                      │
│  ├─ Calendar picker (30 days forward)                     │
│  ├─ Time slots (9 AM - 8 PM, 30-min intervals)           │
│  └─ Real-time availability check                           │
│                                                              │
│  All patient info remains READ-ONLY                        │
│  No changes allowed to any field                           │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Patient Clicks "Book Appointment"                  │
├─────────────────────────────────────────────────────────────┤
│  API Call:                                                  │
│  POST /api/v1/appointments/book                            │
│                                                              │
│  Request Body:                                              │
│  {                                                           │
│    "patientId": "RAD-2045",                                │
│    "externalPatientId": "EYE-7781",                        │
│    "externalSystem": "EYE_CLINIC",                         │
│    "serviceRequestId": "RAD-REQ-001",                      │
│    "appointmentDate": "2026-05-20",                        │
│    "appointmentTime": "14:00",                             │
│    "sourceWorkflow": "CLINIC_REFERRAL"                     │
│  }                                                           │
│                                                              │
│  Response:                                                   │
│  {                                                           │
│    "appointmentId": "APT-0512",                            │
│    "status": "PENDING_ADMIN_APPROVAL",                     │
│    "message": "Appointment booked successfully!",          │
│    "referenceNumber": "REF-2456-8901"                      │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 9: Appointment Sent to Admin Dashboard                │
├─────────────────────────────────────────────────────────────┤
│  Admin sees:                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ NEW APPOINTMENT REQUEST                              │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│  │ 🏥 SOURCE: Eye Clinic (Dr Mohab Eye Clinic)        │   │
│  │ 👤 PATIENT: Ahmed Ali                              │   │
│  │ 🆔 EYE ID: EYE-7781  |  RAD ID: RAD-2045          │   │
│  │ 🩻 SERVICE: X-Ray Chest                            │   │
│  │ 📅 DATE/TIME: May 20, 2026 @ 2:00 PM              │   │
│  │ 👨‍⚕️ REFERRAL DOCTOR: Dr Mohab Ali                  │   │
│  │ ⚡ PRIORITY: Routine                                │   │
│  │                                                      │   │
│  │ [✓ Accept]  [✗ Reject]  [↻ Reschedule]             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Label: "CLINIC-REFERRED APPOINTMENT"                      │
│  Badge: "FROM: EYE_CLINIC"                                 │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 10: Admin Accepts Appointment                         │
├─────────────────────────────────────────────────────────────┤
│  Backend creates FHIR Appointment Resource:                │
│  {                                                           │
│    "resourceType": "Appointment",                           │
│    "id": "APT-0512",                                       │
│    "identifier": [                                          │
│      {                                                      │
│        "system": "http://radiology-center/appointment",    │
│        "value": "APT-0512"                                 │
│      }                                                       │
│    ],                                                        │
│    "status": "booked",                                      │
│    "participant": [                                         │
│      {                                                      │
│        "actor": {"reference": "Patient/RAD-2045"},         │
│        "status": "accepted"                                │
│      },                                                      │
│      {                                                      │
│        "actor": {                                          │
│          "reference": "Practitioner/DR-MOHAB"             │
│        },                                                   │
│        "status": "accepted"                                │
│      }                                                       │
│    ],                                                        │
│    "start": "2026-05-20T14:00:00Z",                        │
│    "end": "2026-05-20T14:20:00Z",                          │
│    "serviceType": {                                         │
│      "coding": [{                                           │
│        "system": "http://snomed.info/sct",                 │
│        "code": "71046008",                                 │
│        "display": "Chest X-ray"                            │
│      }]                                                      │
│    },                                                        │
│    "extension": [                                           │
│      {                                                      │
│        "url": "http://radiology-center/referral-source",   │
│        "valueString": "EYE_CLINIC"                         │
│      }                                                       │
│    ]                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 11: Confirmation Sent Back to Eye Clinic              │
├─────────────────────────────────────────────────────────────┤
│  API Call to Eye Clinic:                                   │
│  POST https://eye-clinic.local/api/appointments/confirm    │
│                                                              │
│  Payload:                                                    │
│  {                                                           │
│    "externalPatientId": "EYE-7781",                         │
│    "radiologyPatientId": "RAD-2045",                        │
│    "appointmentId": "APT-0512",                            │
│    "status": "BOOKED",                                     │
│    "appointmentDateTime": "2026-05-20T14:00:00Z",         │
│    "referenceNumber": "REF-2456-8901",                     │
│    "timestamp": "2026-05-15T11:45:00Z"                    │
│  }                                                           │
│                                                              │
│  Eye Clinic System:                                         │
│  ├─ Updates Doctor Order Status → "SCHEDULED"              │
│  ├─ Links to Radiology Appointment                         │
│  ├─ Shows in patient's upcoming appointments                │
│  └─ Can view results when ready                             │
└─────────────────────────────────────────────────────────────┘
```

### Page Layout - Clinic-Referred Patient

```
┌─────────────────────────────────────────────────────────────────┐
│                     RADIOLOGY CENTER                            │
│              Book Your Appointment - From Clinic                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────┬─────────────────────────────────────┐
│                         │                                     │
│  PATIENT INFORMATION    │    APPOINTMENT SUMMARY               │
│  (READ-ONLY)            │                                     │
│                         │                                     │
│  ┌───────────────────┐  │  ┌─────────────────────────────┐   │
│  │ 👤 Ahmed Ali      │  │  │ 🩻 X-RAY CHEST              │   │
│  │                   │  │  │ Diagnostic Imaging          │   │
│  │ 👫 Male           │  │  │ 350 LE                      │   │
│  │                   │  │  │ ⏱ 20 minutes               │   │
│  │ 🎂 40 years       │  │  └─────────────────────────────┘   │
│  │                   │  │                                     │
│  │ 📞 +20123456789   │  │  📅 SELECT DATE & TIME:             │
│  │                   │  │  ┌─────────────────────────────┐   │
│  │ ═══════════════   │  │  │ [Calendar]    [Time Slots]  │   │
│  │ REFERRAL INFO     │  │  │                             │   │
│  │ ═══════════════   │  │  │ May 2026:                   │   │
│  │                   │  │  │ S  M  T  W  T  F  S       │   │
│  │ 🏥 From: Dr       │  │  │        1  2  3  4  5       │   │
│  │    Mohab Eye      │  │  │ 6  7  8  9 10 11 12       │   │
│  │    Clinic         │  │  │13 14 15 16 17 18 19       │   │
│  │                   │  │  │20 21 22 23 24 25 26       │   │
│  │ 👨‍⚕️ Dr: Dr Mohab   │  │  │ [Select Date]               │   │
│  │    Ali            │  │  │                             │   │
│  │                   │  │  │ Time:                       │   │
│  │ 🆔 EYE ID:        │  │  │ [09:00] [09:30] [10:00]     │   │
│  │    EYE-7781       │  │  │ [10:30] [11:00] [11:30]     │   │
│  │                   │  │  │ [Selected: 14:00]           │   │
│  │ 📋 Notes:         │  │  │                             │   │
│  │ Follow-up exam    │  │  │                             │   │
│  │                   │  │  │ [BOOK APPOINTMENT] ✓        │   │
│  │ ⚡ Priority:      │  │  │ (All fields ready to book)  │   │
│  │    Routine        │  │  │                             │   │
│  │                   │  │  │ Status: READY TO BOOK       │   │
│  └───────────────────┘  │  └─────────────────────────────┘   │
│                         │                                     │
└─────────────────────────┴─────────────────────────────────────┘

KEY FEATURES:
✓ All patient data READ-ONLY (blue background, disabled state)
✓ Patient data auto-filled from FHIR/HL7
✓ Only Date & Time selection allowed
✓ One-click "Book Appointment" button
✓ Shows referral information prominently
✓ No manual data entry or editing possible
```

---

## Workflow 2: Direct Radiology Patient

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Patient Navigates to Radiology Center             │
├─────────────────────────────────────────────────────────────┤
│  URL: /radiology/book/appointment                          │
│  (No fromClinic parameter)                                 │
│                                                              │
│  Page detects:                                              │
│  ├─ fromClinic = false                                     │
│  ├─ patientData = null                                     │
│  └─ Show EMPTY FORM for direct registration                │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: BookAppointmentPage (Direct) Loads                 │
├─────────────────────────────────────────────────────────────┤
│  Page State:                                                │
│  {                                                           │
│    "fromClinic": false,                                    │
│    "patientData": null,                                    │
│    "patientInfo": {                                        │
│      "name": "",          // EMPTY - USER ENTERS            │
│      "gender": "",        // EMPTY - USER SELECTS           │
│      "dateOfBirth": "",   // EMPTY - USER ENTERS            │
│      "phone": "",         // EMPTY - USER ENTERS            │
│      "email": "",         // EMPTY - USER ENTERS            │
│      "nationalId": "",    // EMPTY - USER ENTERS            │
│      "address": ""        // EMPTY - USER ENTERS            │
│    }                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Page Renders Editable Form                         │
├─────────────────────────────────────────────────────────────┤
│  LEFT COLUMN (Editable):                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ PATIENT INFORMATION (REQUIRED)                       │  │
│  │ ────────────────────────────────────────────────────│  │
│  │                                                      │  │
│  │ [👤] Full Name:        [_____________________]      │  │
│  │      (Enter your name)                              │  │
│  │                                                      │  │
│  │ [📞] Phone Number:     [_____________________]      │  │
│  │      e.g. +201234567890                             │  │
│  │                                                      │  │
│  │ [📧] Email Address:    [_____________________]      │  │
│  │      you@example.com                                │  │
│  │                                                      │  │
│  │ [🎂] Date of Birth:    [__________] (DD/MM/YYYY)   │  │
│  │                        Auto-calc age: --             │  │
│  │                                                      │  │
│  │ [👫] Gender:           [Select ▼]                  │  │
│  │                        - Male                       │  │
│  │                        - Female                     │  │
│  │                        - Other                      │  │
│  │                                                      │  │
│  │ [🆔] National ID:      [_____________________]      │  │
│  │      (Your ID card number)                          │  │
│  │                                                      │  │
│  │ [🏠] Address:          [_____________________]      │  │
│  │      Complete address                               │  │
│  │                                                      │  │
│  │ [💊] Medical Notes:    [_____________________]      │  │
│  │      (Optional - any relevant info)                 │  │
│  │                                                      │  │
│  │ [🛡️] Insurance Info:   [_____________________]      │  │
│  │      (Optional - Insurance ID)                      │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  RIGHT COLUMN (Service Selection):                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SELECT RADIOLOGY SERVICE                             │  │
│  │ ────────────────────────────────────────────────────│  │
│  │                                                      │  │
│  │ Service Cards (Horizontal Scroll):                  │  │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │
│  │ │ [Image] │ │ [Image] │ │ [Image] │ │ [Image] │   │  │
│  │ │   CBC   │ │ X-Ray   │ │   CT    │ │   MRI   │   │  │
│  │ │ 250 LE  │ │ 350 LE  │ │1800 LE  │ │3500 LE  │   │  │
│  │ │ 15 min  │ │ 20 min  │ │ 45 min  │ │ 60 min  │   │  │
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │  │
│  │             (Click to select)                       │  │
│  │                                                      │  │
│  │ APPOINTMENT DETAILS                                 │  │
│  │ ────────────────────────────────────────────────────│  │
│  │                                                      │  │
│  │ 📅 SELECT DATE & TIME:                              │  │
│  │ [Calendar View]    [Time Slots]                     │  │
│  │                                                      │  │
│  │ 📎 OPTIONAL UPLOADS:                                │  │
│  │ □ Referral Letter  [Choose File]                   │  │
│  │ □ Prescription     [Choose File]                   │  │
│  │ □ Previous Results [Choose File]                   │  │
│  │                                                      │  │
│  │ [BOOK APPOINTMENT] (ENABLED when form valid)      │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  VALIDATION:                                                │
│  ✗ All red fields required                                 │
│  ✓ Green = validated                                        │
│  ✗ Form invalid = Button disabled                          │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Patient Fills All Fields                           │
├─────────────────────────────────────────────────────────────┤
│  Patient enters:                                            │
│  ├─ Name: Fatima Hassan                                   │
│  ├─ Phone: +201098765432                                  │
│  ├─ Email: fatima.hassan@email.com                        │
│  ├─ DOB: 1990-03-22 (Age: 36 auto-calculated)            │
│  ├─ Gender: Female                                         │
│  ├─ National ID: 290032201245678                          │
│  ├─ Address: 456 Garden Street, Alexandria, Egypt         │
│  ├─ Medical Notes: Has history of blood pressure issues   │
│  └─ Insurance: AL-2025-987654                             │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Real-time Validation                               │
├─────────────────────────────────────────────────────────────┤
│  As user types:                                             │
│  ├─ Phone: Validates international format                  │
│  ├─ Email: Validates RFC 5322 format                       │
│  ├─ DOB: Validates not in future, calculates age          │
│  ├─ National ID: Validates Egyptian ID format              │
│  ├─ All required fields: Shows green checkmark             │
│  └─ Form becomes VALID → Button enables                    │
│                                                              │
│  Error Messages (inline):                                   │
│  ├─ "Name must be at least 2 characters"                   │
│  ├─ "Invalid phone format (use +20...)"                   │
│  ├─ "Invalid email address"                                │
│  ├─ "DOB cannot be in the future"                          │
│  └─ "National ID format invalid"                           │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Select Service, Date, Time                         │
├─────────────────────────────────────────────────────────────┤
│  Patient:                                                   │
│  ├─ Clicks on X-Ray service (or any other)               │
│  ├─ Selects date from calendar (May 22)                  │
│  ├─ Selects time from available slots (3:30 PM)          │
│  └─ Uploads optional referral document (PDF)              │
│                                                              │
│  System checks:                                             │
│  ├─ Service selected? ✓                                    │
│  ├─ Date selected? ✓                                       │
│  ├─ Time selected? ✓                                       │
│  ├─ All patient fields valid? ✓                            │
│  └─ "BOOK APPOINTMENT" button = ENABLED                    │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Patient Clicks "Book Appointment"                  │
├─────────────────────────────────────────────────────────────┤
│  API Call:                                                  │
│  POST /api/v1/appointments/book                            │
│                                                              │
│  Request Body:                                              │
│  {                                                           │
│    "patientInfo": {                                        │
│      "name": "Fatima Hassan",                             │
│      "phone": "+201098765432",                            │
│      "email": "fatima.hassan@email.com",                 │
│      "dateOfBirth": "1990-03-22",                         │
│      "gender": "Female",                                  │
│      "nationalId": "290032201245678",                     │
│      "address": "456 Garden Street, Alexandria"           │
│    },                                                       │
│    "serviceId": 5,                                        │
│    "appointmentDate": "2026-05-22",                       │
│    "appointmentTime": "15:30",                            │
│    "medicalNotes": "Has history of blood pressure...",   │
│    "insuranceId": "AL-2025-987654",                       │
│    "sourceWorkflow": "DIRECT_REGISTRATION"                │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Backend Processing                                 │
├─────────────────────────────────────────────────────────────┤
│  Backend:                                                   │
│  ├─ Creates new Patient record (RAD-2046)                 │
│  ├─ Validates patient data (no duplicates)                │
│  ├─ Reserves time slot                                     │
│  ├─ Creates FHIR Patient Resource                          │
│  ├─ Creates FHIR ServiceRequest                            │
│  ├─ Creates FHIR Appointment                               │
│  └─ Sends to admin queue                                   │
│                                                              │
│  Response:                                                   │
│  {                                                           │
│    "appointmentId": "APT-0513",                            │
│    "patientId": "RAD-2046",                               │
│    "status": "PENDING_ADMIN_APPROVAL",                    │
│    "referenceNumber": "REF-2457-8902",                    │
│    "message": "Appointment booked! Awaiting confirmation"  │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 9: Admin Dashboard Shows New Appointment              │
├─────────────────────────────────────────────────────────────┤
│  Admin sees in pending queue:                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ NEW APPOINTMENT REQUEST                              │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│  │ 👤 PATIENT: Fatima Hassan                          │   │
│  │ 🆔 PATIENT ID: RAD-2046                            │   │
│  │ 🩻 SERVICE: X-Ray                                  │   │
│  │ 📅 DATE/TIME: May 22, 2026 @ 3:30 PM              │   │
│  │ 📞 PHONE: +201098765432                            │   │
│  │ 💬 NOTES: Has history of blood pressure issues    │   │
│  │                                                      │   │
│  │ 🏷️ TYPE: DIRECT REGISTRATION                       │   │
│  │ (No referral - new patient)                         │   │
│  │                                                      │   │
│  │ [✓ Accept]  [✗ Reject]  [↻ Reschedule]             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Label: "DIRECT APPOINTMENT"                               │
│  Badge: "NEW PATIENT"                                      │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 10: Admin Accepts Appointment                         │
├─────────────────────────────────────────────────────────────┤
│  Status: BOOKED ✓                                          │
│  Patient receives:                                          │
│  ├─ Confirmation email with appointment details            │
│  ├─ SMS with time & location                               │
│  ├─ Appointment ID: APT-0513                              │
│  ├─ Reference: REF-2457-8902                              │
│  └─ Can view in "My Appointments" section                  │
└─────────────────────────────────────────────────────────────┘
```

### Page Layout - Direct Patient

```
┌─────────────────────────────────────────────────────────────────┐
│                     RADIOLOGY CENTER                            │
│              Book Your Appointment - Direct                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┬─────────────────────────────────┐
│                             │                                 │
│  PATIENT INFORMATION        │    SELECT SERVICE                 │
│  (EDITABLE - ALL REQUIRED)  │    & APPOINTMENT TIME            │
│                             │                                 │
│  ┌───────────────────────┐  │  ┌───────────────────────────┐   │
│  │ 👤 Full Name *        │  │  │ SERVICE CARDS              │   │
│  │ [____________________] │  │  │ (Scroll →)                │   │
│  │ (Min 2 characters)    │  │  │ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │                        │  │  │ │ CBC  │ │X-Ray │ │ CT   │   │
│  │ 📞 Phone Number *     │  │  │ │Selected  │      │      │   │
│  │ [____________________] │  │  │ └──────┘ └──────┘ └──────┘   │
│  │ +20...                │  │  │                               │
│  │                        │  │  │ X-RAY SELECTED:               │
│  │ 📧 Email Address *    │  │  │ ┌─────────────────────────┐   │
│  │ [____________________] │  │  │ │ X-Ray Imaging           │   │
│  │ you@example.com       │  │  │ │ Digital Radiography     │   │
│  │                        │  │  │ │ 350 LE                  │   │
│  │ 🎂 Date of Birth *    │  │  │ │ ⏱ 20 minutes           │   │
│  │ [__________]           │  │  │ └─────────────────────────┘   │
│  │ Age: 36 years ✓       │  │  │                               │
│  │                        │  │  │ 📅 SELECT DATE & TIME:        │
│  │ 👫 Gender *           │  │  │ ┌─────────────────────────┐   │
│  │ [Select ▼]            │  │  │ │ [Calendar]   [Slots]    │   │
│  │ ⚫ Male               │  │  │ │                         │   │
│  │ ⚪ Female             │  │  │ │ May 22, 2026 3:30 PM   │   │
│  │ ⚪ Other              │  │  │ │ [CONFIRM SELECTED]      │   │
│  │                        │  │  │ └─────────────────────────┘   │
│  │ 🆔 National ID *      │  │  │                               │
│  │ [____________________] │  │  │ 📎 UPLOAD DOCUMENTS:          │
│  │ (Your ID card)        │  │  │ ☐ Referral Letter            │
│  │                        │  │  │ ☐ Prescription               │
│  │ 🏠 Address *          │  │  │ ☐ Previous Results           │
│  │ [____________________] │  │  │                               │
│  │ (Complete address)    │  │  │ [BOOK APPOINTMENT] ✓          │
│  │                        │  │  │ (Form is valid - enabled)    │
│  │ 💊 Medical Notes      │  │  │                               │
│  │ [____________________] │  │  │ Status: READY TO BOOK         │
│  │ (Optional)            │  │  │                               │
│  │                        │  │  │                               │
│  │ 🛡️ Insurance ID       │  │  │                               │
│  │ [____________________] │  │  │                               │
│  │ (Optional)            │  │  │                               │
│  │                        │  │  │                               │
│  └───────────────────────┘  │  └───────────────────────────┘   │
│                             │                                 │
│  VALIDATION STATUS:         │                                 │
│  ✓ Name: Valid              │                                 │
│  ✓ Phone: Valid             │                                 │
│  ✓ Email: Valid             │                                 │
│  ✓ DOB: Valid               │                                 │
│  ✓ Gender: Selected         │                                 │
│  ✓ National ID: Valid       │                                 │
│  ✓ Address: Filled          │                                 │
│  ✓ Service: Selected        │                                 │
│  ✓ Date & Time: Selected    │                                 │
│  ━━━━━━━━━━━━━━━━━━━━━  │                                 │
│  ✓ FORM IS VALID            │                                 │
│                             │                                 │
└─────────────────────────────┴─────────────────────────────────┘

KEY FEATURES:
✓ All patient fields EDITABLE (empty by default)
✓ Real-time validation (shows errors inline)
✓ Medical notes & insurance OPTIONAL
✓ Document upload capability
✓ Service selection required
✓ "Book Appointment" only enabled when form is valid
✓ Complete freedom to change any field
```

---

## FHIR/HL7 Integration

### HL7 v2.5 Messages

#### Message Type: ORM^O01 (Order Message - From Eye Clinic)

```
MSH|^~\&|EYE_CLINIC|DR_MOHAB_CLINIC|RADIOLOGY_CENTER|RAD_CENTER|202605151030||ORM^O01|MSG00001|P|2.5||
EVN|O01|202605151030||
PID|1||EYE-7781^^^EYE_CLINIC~RAD-2045^^^RADIOLOGY||ALI^AHMED^HASSAN||19850615|M|||123 NILE STREET^^CAIRO^CAIRO^11111^EGYPT||^WPN^PH|^^^^^+201234567890~^^^^^AHMED.ALI@EMAIL.COM|||||285850100156300||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
PV1|1|O|RADIOLOGY||||^DR MOHAB ALI|||||||||||||RAD-2045|E|||||||||||||||||||||
ORC|NW|ORDER001|RAD001|NW|||||202605151030|||^DR MOHAB ALI|
OBR|1|ORDER001|RAD001|71046008^CHEST X-RAY^^SNOMED|R|202605151030|202605151030|||^DR MOHAB ALI||||||202605151030|||F|||^^^ROUTINE|||||||||||||||||||||||||||||||
OBX|1|NM|PRIORITY||ROUTINE|||||F|
OBX|2|ST|CLINICAL_INDICATION||Follow-up examination for suspected pneumonia|||||F|
NTE|1||Ordered by Dr Mohab Ali for follow-up imaging evaluation|

Field Breakdown:
├─ MSH: Message header
│  └─ Sending app: EYE_CLINIC
│  └─ Receiving app: RADIOLOGY_CENTER
│  └─ Message type: ORM^O01 (Order message)
│
├─ EVN: Event type (Order placement)
│
├─ PID: Patient identification
│  ├─ External ID: EYE-7781^^^EYE_CLINIC
│  ├─ Radiology ID: RAD-2045^^^RADIOLOGY (if exists)
│  ├─ Name: ALI^AHMED^HASSAN
│  ├─ DOB: 19850615
│  ├─ Gender: M
│  ├─ Address: 123 NILE STREET, CAIRO
│  ├─ National ID: 285850100156300
│  └─ Phone: +201234567890
│
├─ PV1: Patient visit info (Doctor/Department)
│
├─ ORC: Order control (NW = New order)
│
├─ OBR: Observation request (Test details)
│  ├─ Code: 71046008^CHEST X-RAY (SNOMED CT)
│  ├─ Priority: ROUTINE
│  ├─ DateTime: 202605151030
│  └─ Ordering provider: DR MOHAB ALI
│
├─ OBX: Observation data
│  ├─ Priority: ROUTINE
│  └─ Clinical indication: Follow-up exam
│
└─ NTE: Notes/Comments
```

#### Message Type: ADT^A04 (Admission Message - For Direct Patients)

```
MSH|^~\&|RADIOLOGY_CENTER|RAD_CENTER|RADIOLOGY_SYSTEM|RAD_SYS|202605151045||ADT^A04|MSG00002|P|2.5||
EVN|A04|202605151045||PATIENT_REGISTRATION||
PID|1||RAD-2046^^^RADIOLOGY||HASSAN^FATIMA^AHMED||19900322|F|||456 GARDEN STREET^^ALEXANDRIA^ALEXANDRIA^21111^EGYPT||^WPN^PH|^^^^^+201098765432~^^^^^FATIMA.HASSAN@EMAIL.COM|||||290032201245678||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
PV1|1|O|RADIOLOGY^OUTPATIENT|||||||||||||||||RAD-2046|E||||||||||||||||||||||||||||||||||

Field Breakdown:
├─ MSH: Message header (Self-generated by Radiology Center)
│  └─ Message type: ADT^A04 (Patient registration)
│
├─ EVN: Event type (Patient registration/admission)
│
├─ PID: Patient identification
│  ├─ ID: RAD-2046^^^RADIOLOGY (System-generated)
│  ├─ Name: HASSAN^FATIMA^AHMED
│  ├─ DOB: 19900322
│  ├─ Gender: F
│  ├─ Address: 456 GARDEN STREET, ALEXANDRIA
│  ├─ National ID: 290032201245678
│  └─ Phone: +201098765432
│
└─ PV1: Patient visit (Outpatient admission)
   └─ Location: RADIOLOGY OUTPATIENT
```

### FHIR R4 Resources

#### ServiceRequest (From Eye Clinic)

```json
{
  "resourceType": "ServiceRequest",
  "id": "SRQ-00001",
  "identifier": [
    {
      "system": "http://eye-clinic.local/requests",
      "value": "ORDER001"
    },
    {
      "system": "http://radiology-center.local/external-requests",
      "value": "EYE-CLINIC-ORDER001"
    }
  ],
  "status": "active",
  "intent": "order",
  "priority": "routine",
  "code": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "71046008",
        "display": "Chest X-ray"
      }
    ]
  },
  "subject": {
    "reference": "Patient/RAD-2045",
    "identifier": {
      "system": "http://eye-clinic.local/patients",
      "value": "EYE-7781"
    },
    "display": "Ahmed Ali"
  },
  "authoredOn": "2026-05-15T10:30:00Z",
  "requester": {
    "reference": "Practitioner/PRAC-DR-MOHAB",
    "display": "Dr Mohab Ali"
  },
  "performer": [
    {
      "reference": "Organization/ORG-RADIOLOGY-CENTER",
      "display": "Nile Radiology Center"
    }
  ],
  "reasonCode": [
    {
      "coding": [
        {
          "system": "http://snomed.info/sct",
          "code": "233604007",
          "display": "Pneumonia"
        }
      ],
      "text": "Follow-up examination for suspected pneumonia"
    }
  ],
  "supportingInfo": [
    {
      "reference": "DocumentReference/PREV-RESULTS-001",
      "display": "Previous chest X-ray from 2026-03-15"
    }
  ],
  "extension": [
    {
      "url": "http://radiology-center.local/external-source",
      "valueString": "EYE_CLINIC"
    },
    {
      "url": "http://radiology-center.local/referral-source-clinic",
      "valueString": "Dr Mohab Eye Clinic"
    },
    {
      "url": "http://radiology-center.local/clinical-notes",
      "valueString": "Patient reports recent vision changes. Needs urgent imaging to rule out complications."
    }
  ]
}
```

#### Patient Resource (Direct Registration)

```json
{
  "resourceType": "Patient",
  "id": "RAD-2046",
  "identifier": [
    {
      "system": "http://radiology-center.local/patients",
      "value": "RAD-2046",
      "use": "official"
    },
    {
      "system": "http://egypt.local/national-id",
      "value": "290032201245678",
      "use": "official"
    }
  ],
  "active": true,
  "name": [
    {
      "use": "official",
      "text": "Fatima Ahmed Hassan",
      "family": "Hassan",
      "given": ["Fatima", "Ahmed"]
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "+201098765432",
      "use": "mobile"
    },
    {
      "system": "email",
      "value": "fatima.hassan@email.com",
      "use": "work"
    }
  ],
  "gender": "female",
  "birthDate": "1990-03-22",
  "address": [
    {
      "use": "home",
      "text": "456 Garden Street, Alexandria, Egypt",
      "city": "Alexandria",
      "state": "Alexandria",
      "postalCode": "21111",
      "country": "Egypt"
    }
  ],
  "contact": [
    {
      "relationship": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v2-0131",
              "code": "E",
              "display": "Employer"
            }
          ]
        }
      ],
      "name": {
        "text": "Emergency Contact"
      },
      "telecom": [
        {
          "system": "phone",
          "value": "+201234567890"
        }
      ]
    }
  ],
  "communication": [
    {
      "language": {
        "coding": [
          {
            "system": "urn:ietf:bcp:47",
            "code": "ar"
          }
        ],
        "text": "Arabic"
      },
      "preferred": true
    }
  ]
}
```

#### Appointment Resource

```json
{
  "resourceType": "Appointment",
  "id": "APT-0512",
  "identifier": [
    {
      "system": "http://radiology-center.local/appointments",
      "value": "APT-0512"
    },
    {
      "system": "http://radiology-center.local/booking-reference",
      "value": "REF-2456-8901"
    }
  ],
  "status": "booked",
  "serviceType": [
    {
      "coding": [
        {
          "system": "http://snomed.info/sct",
          "code": "71046008",
          "display": "Chest X-ray"
        }
      ]
    }
  ],
  "reasonCode": [
    {
      "coding": [
        {
          "system": "http://snomed.info/sct",
          "code": "233604007",
          "display": "Pneumonia"
        }
      ],
      "text": "Follow-up examination"
    }
  ],
  "priority": 3,
  "description": "Routine chest X-ray imaging",
  "start": "2026-05-20T14:00:00Z",
  "end": "2026-05-20T14:20:00Z",
  "participant": [
    {
      "actor": {
        "reference": "Patient/RAD-2045",
        "display": "Ahmed Ali"
      },
      "status": "accepted"
    },
    {
      "actor": {
        "reference": "Practitioner/PRAC-DR-RADIOLOGY",
        "display": "Radiology Department"
      },
      "status": "tentative"
    },
    {
      "actor": {
        "reference": "Location/LOC-RADIOLOGY",
        "display": "Radiology Center - Imaging Room 1"
      },
      "status": "tentative"
    }
  ],
  "requestedPeriod": [
    {
      "start": "2026-05-15T00:00:00Z",
      "end": "2026-06-15T23:59:59Z"
    }
  ],
  "extension": [
    {
      "url": "http://radiology-center.local/appointment-source",
      "valueString": "CLINIC_REFERRAL"
    },
    {
      "url": "http://radiology-center.local/external-patient-id",
      "valueString": "EYE-7781"
    },
    {
      "url": "http://radiology-center.local/referral-source",
      "valueString": "Dr Mohab Eye Clinic"
    }
  ]
}
```

---

## Component Structure

### File Organization

```
src/
├── pages/
│   └── Radiology/
│       ├── BookAppointmentPage.jsx          ← MAIN PAGE (Handles both flows)
│       ├── BookingPages/
│       │   ├── ClinicReferredFlow.jsx       ← Clinic-referred patient UI
│       │   └── DirectPatientFlow.jsx         ← Direct patient UI
│       └── Components/
│           ├── PatientInfoForm.jsx          ← Editable patient form
│           ├── PatientInfoDisplay.jsx       ← Read-only patient display
│           ├── ServiceSelector.jsx          ← Service selection component
│           ├── DateTimeSelector.jsx         ← Calendar + time slots
│           ├── AppointmentSummary.jsx       ← Appointment preview
│           └── UploadDocuments.jsx          ← Optional file upload
│
├── services/
│   ├── FHIRMapperService.js                 ← FHIR to internal mapping
│   ├── HL7ParserService.js                  ← HL7 message parsing
│   ├── AppointmentService.js                ← API calls for appointments
│   └── ValidationService.js                 ← Form validation
│
├── hooks/
│   ├── useFHIRPatient.js                    ← Load patient from FHIR
│   ├── useAppointmentForm.js                ← Form state management
│   └── usePatientValidation.js              ← Real-time validation
│
└── types/
    ├── Patient.types.js                     ← Patient data structure
    ├── Appointment.types.js                 ← Appointment data structure
    └── FHIR.types.js                        ← FHIR resource types
```

---

## Component Code Examples

### BookAppointmentPage.jsx (Main Page)

```jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ClinicReferredFlow from './BookingPages/ClinicReferredFlow';
import DirectPatientFlow from './BookingPages/DirectPatientFlow';

export default function BookAppointmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pageType, setPageType] = useState(null);
  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    // Determine which workflow to show
    const params = new URLSearchParams(location.search);
    const fromClinic = params.get('fromClinic') === 'true';
    const clinicData = location.state?.patientData;

    if (fromClinic && clinicData) {
      setPageType('CLINIC_REFERRED');
      setPatientData(clinicData);
    } else {
      setPageType('DIRECT');
      setPatientData(null);
    }
    
    setLoading(false);
  }, [location]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {pageType === 'CLINIC_REFERRED' ? (
        <ClinicReferredFlow patientData={patientData} />
      ) : (
        <DirectPatientFlow />
      )}
    </div>
  );
}
```

### ClinicReferredFlow.jsx

```jsx
import { useState, useEffect } from 'react';
import PatientInfoDisplay from '../Components/PatientInfoDisplay';
import AppointmentSummary from '../Components/AppointmentSummary';

export default function ClinicReferredFlow({ patientData }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');

  const handleBookAppointment = async () => {
    // Send FHIR Appointment to backend
    const appointment = {
      patientId: patientData.radiologyPatientId,
      externalPatientId: patientData.externalPatientId,
      serviceRequestId: patientData.serviceRequestId,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      sourceWorkflow: 'CLINIC_REFERRAL'
    };

    // API call to book
    const response = await fetch('/api/v1/appointments/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment)
    });

    if (response.ok) {
      // Success - redirect to confirmation
      navigate('/appointment-confirmation', { state: { appointment } });
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
      {/* Left: Patient Info (READ-ONLY) */}
      <PatientInfoDisplay data={patientData} isReadOnly={true} />

      {/* Right: Appointment Summary (INTERACTIVE) */}
      <AppointmentSummary
        patientData={patientData}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onDateChange={setSelectedDate}
        onTimeChange={setSelectedTime}
        onBook={handleBookAppointment}
        isReadOnly={false}
      />
    </div>
  );
}
```

### DirectPatientFlow.jsx

```jsx
import { useState } from 'react';
import PatientInfoForm from '../Components/PatientInfoForm';
import ServiceSelector from '../Components/ServiceSelector';
import DateTimeSelector from '../Components/DateTimeSelector';
import UploadDocuments from '../Components/UploadDocuments';

export default function DirectPatientFlow() {
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    nationalId: '',
    address: '',
    medicalNotes: '',
    insuranceId: ''
  });
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});

  const isFormValid = () => {
    return (
      patientInfo.name &&
      patientInfo.phone &&
      patientInfo.email &&
      patientInfo.gender &&
      patientInfo.dateOfBirth &&
      patientInfo.nationalId &&
      patientInfo.address &&
      selectedService &&
      selectedDate &&
      selectedTime &&
      Object.keys(errors).length === 0
    );
  };

  const handleBookAppointment = async () => {
    const appointment = {
      patientInfo,
      serviceId: selectedService.id,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      documents: documents,
      sourceWorkflow: 'DIRECT_REGISTRATION'
    };

    const response = await fetch('/api/v1/appointments/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment)
    });

    if (response.ok) {
      navigate('/appointment-confirmation', { state: { appointment } });
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
      {/* Left: Patient Information Form (EDITABLE) */}
      <PatientInfoForm
        data={patientInfo}
        errors={errors}
        onChange={(field, value) => setPatientInfo({ ...patientInfo, [field]: value })}
        onValidationError={setErrors}
      />

      {/* Right: Service Selection + Appointment Details */}
      <div>
        <ServiceSelector selected={selectedService} onChange={setSelectedService} />
        
        {selectedService && (
          <>
            <DateTimeSelector
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
            />
            
            <UploadDocuments onChange={setDocuments} />
            
            <button
              onClick={handleBookAppointment}
              disabled={!isFormValid()}
              style={{
                width: '100%',
                padding: '14px',
                background: isFormValid() ? '#1e3a5f' : '#cbd5e1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isFormValid() ? 'pointer' : 'not-allowed'
              }}
            >
              {isFormValid() ? '✓ BOOK APPOINTMENT' : '⚠️ Complete form to continue'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## Admin Dashboard

### Appointment Display

```
ADMIN DASHBOARD - PENDING APPOINTMENTS

┌─────────────────────────────────────────────────────────────────┐
│ FILTERS: [All] [Clinic-Referred] [Direct Patients]  [  Search ]│
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ [🏥 CLINIC-REFERRED]   APT-0512                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  👤 Patient: Ahmed Ali                      📞 +201234567890           │
│  🆔 Radiology ID: RAD-2045                  🏥 From: Eye Clinic        │
│  🆔 External ID: EYE-7781                   👨‍⚕️ Doctor: Dr Mohab Ali    │
│  🩻 Service: X-Ray Chest                    📅 May 20, 2:00 PM         │
│  💬 Notes: Follow-up examination            ⚡ Priority: Routine       │
│                                                                          │
│  [✓ ACCEPT]  [✗ REJECT]  [↻ RESCHEDULE]                              │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ [👤 DIRECT PATIENT]    APT-0513                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  👤 Patient: Fatima Hassan                  📞 +201098765432           │
│  🆔 Radiology ID: RAD-2046                  💼 NEW PATIENT             │
│  🆔 Insurance: AL-2025-987654              👨‍⚕️ No referring doctor   │
│  🩻 Service: X-Ray                          📅 May 22, 3:30 PM        │
│  💬 Notes: Has blood pressure history       ⚡ Priority: Routine      │
│                                                                          │
│  [✓ ACCEPT]  [✗ REJECT]  [↻ RESCHEDULE]                              │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Guide

### Phase 1: Setup (Week 1)

1. Create component structure
2. Set up FHIR/HL7 parsers
3. Create API services
4. Implement validation services

### Phase 2: Clinic-Referred Flow (Week 2)

1. Create ClinicReferredFlow component
2. Implement PatientInfoDisplay (read-only)
3. Implement AppointmentSummary
4. Test FHIR data mapping

### Phase 3: Direct Patient Flow (Week 3)

1. Create DirectPatientFlow component
2. Implement PatientInfoForm (editable)
3. Implement ServiceSelector
4. Implement DateTimeSelector
5. Add form validation

### Phase 4: Integration & Testing (Week 4)

1. Test both workflows
2. Implement admin dashboard updates
3. Test FHIR appointment creation
4. Security testing (encryption, signatures)

---

**This design is production-ready and follows healthcare interoperability standards (HL7 v2.5, FHIR R4).**
