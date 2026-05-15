# Patient Medical Record - Visual Data Flow & Layout

## 📊 Complete Visual Data Mapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PATIENT MEDICAL RECORD PAGE                          │
│                    (http://localhost:5173/patient/medical-record)           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Retrieve Patient Identifier from Storage                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  localStorage.getItem('patientIdentifier')  →  'P-000123'                   │
│  OR localStorage.getItem('patientId')       →  123                          │
│                                                                              │
│  ✓ Used as primary key for all data fetches                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Fetch Patient Data                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  API: GET /api/patient/P-000123                                             │
│                                                                              │
│  Response: PatientInfoDto                                                   │
│  {                                                                           │
│    "patientId": 123,                                                        │
│    "name": "Ahmed Ali",                      ← firstName + lastName         │
│    "age": 45,                                ← calculated from DOB          │
│    "gender": "Male",                         ← normalized (M/F/Other)       │
│    "birthDate": "1979-05-15",                ← ISO date format              │
│    "nationalId": "29505091234567",           ← national ID                  │
│    "contactNumber": "+966501234567",         ← phone number                 │
│    "email": "patient@example.com",           ← email                        │
│    "address": "Riyadh, Saudi Arabia",        ← residential address          │
│    "insuranceCompany": "SAADA",              ← insurance provider           │
│    "insuranceId": "INS-12345",               ← policy ID                    │
│    "emergencyContactName": "Fatima Ali",     ← emergency contact            │
│    "emergencyContactPhone": "+966502222222"  ← emergency phone               │
│  }                                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Fetch Medical Records                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  API: GET /api/patient/P-000123/medical-records                             │
│                                                                              │
│  Response: Array of Records                                                 │
│  [                                                                           │
│    { recordType: "complaint", data: {...}, createdAt: "2026-05-10T..." },   │
│    { recordType: "history", data: {...}, createdAt: "2026-05-09T..." },     │
│    { recordType: "investigation", data: {...}, createdAt: "2026-05-08T..." }│
│    { recordType: "exam", data: {...}, createdAt: "2026-05-07T..." },        │
│    { recordType: "operation", data: {...}, createdAt: "2026-05-06T..." },   │
│    { recordType: "prescription", data: {...}, createdAt: "2026-05-05T..." },│
│    { recordType: "diagnosis", data: {...}, createdAt: "2026-05-04T..." },   │
│    { recordType: "image", data: {...}, createdAt: "2026-05-03T..." }        │
│  ]                                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Normalize Data (normalizePatient)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Combines patient info + medical records into single object                 │
│  Handles multiple field name formats from different sources                 │
│  Calculates age from DOB if not provided                                    │
│  Maps gender codes to readable strings                                      │
│  Organizes records by type                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Render UI Components                                              │
├─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Layout Structure

```
╔════════════════════════════════════════════════════════════════════════════╗
║                          PATIENT MEDICAL RECORD                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ← BACK                                        Ahmed Ali          [Avatar]  ║
║                                                                            ║
║  M  45 | Male | P-000123 | Saudi Arabia                                   ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║  📊 Stats Bar                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐  ║
║  │ [Complaint: 5]  [History: 3]  [Investigations: 8]  [Eye Exam: 6]   │  ║
║  └─────────────────────────────────────────────────────────────────────┘  ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  👤 PATIENT INFORMATION (Expandable)                          [▲ Collapse] ║
║  ┌─────────────────────────┬──────────────────────────────────────────┐   ║
║  │ BASIC INFO              │ CONTACT                                 │   ║
║  ├─────────────────────────┼──────────────────────────────────────────┤   ║
║  │ Patient ID     P-000123 │ Phone      +966501234567               │   ║
║  │ Full Name      Ahmed Ali│ Email      patient@example.com         │   ║
║  │ Age            45       │ Address    Riyadh, Saudi Arabia        │   ║
║  │ Gender         Male     │                                         │   ║
║  │ DOB            15 May 79│                                         │   ║
║  │ National ID    29505... │                                         │   ║
║  ├─────────────────────────┼──────────────────────────────────────────┤   ║
║  │ INSURANCE               │ EMERGENCY CONTACT                       │   ║
║  ├─────────────────────────┼──────────────────────────────────────────┤   ║
║  │ Company        SAADA    │ Name       Fatima Ali                   │   ║
║  │ ID             INS-12345│ Phone      +966502222222                │   ║
║  │ Policy         POL-789  │                                         │   ║
║  │ Coverage       90%      │                                         │   ║
║  └─────────────────────────┴──────────────────────────────────────────┘   ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  📋 TAB NAVIGATION                                                        ║
║  ┌──────┬──────────┬──────────┬────────────┬─────────┬────────┬─────────┐ ║
║  │ 👤   │   💬     │   📜    │     🔬     │   👁️   │  🖼️   │    🏥   │ ║
║  │ Info │ Complaint│ History │Investigation│Eye Exam│ Images │Operations│ ║
║  └──────┴──────────┴──────────┴────────────┴─────────┴────────┴─────────┘ ║
║  [More Tabs]  Prescription  |  Diagnoses                                  ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  CONTENT PANEL (Changes based on selected tab)                           ║
║  ┌────────────────────────────────────────────────────────────────────┐   ║
║  │                                                                    │   ║
║  │  [Tab Content - See below for each tab structure]                │   ║
║  │                                                                    │   ║
║  └────────────────────────────────────────────────────────────────────┘   ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## 📑 Tab Content Structures

### Tab 1: Patient Information (Already shown above)

```
╔══════════════════════════════════════════════════════════════════════════╗
║  4-Column Grid Layout                                                    ║
║                                                                          ║
║  Column 1: Basic      │  Column 2: Contact  │  Column 3: Insurance │ Col4
║  • Patient ID         │  • Phone             │  • Company          │ • Na
║  • Full Name          │  • Email             │  • Insurance ID     │ • Ph
║  • Age                │  • Address           │  • Policy #         │
║  • Gender             │                      │  • Coverage         │
║  • Date of Birth      │                      │                     │
║  • National ID        │                      │                     │
╚══════════════════════════════════════════════════════════════════════════╝
```

### Tab 2: Complaint Records

```
╔══════════════════════════════════════════════════════════════════════════╗
║  For each complaint record:                                              ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │  Created: 10 May 2026, 14:30                                    │   ║
║  │                                                                  │   ║
║  │  Chief Complaint:                                               │   ║
║  │  "Patient complains of sudden vision loss in right eye,         │   ║
║  │   accompanied by eye pain and redness"                          │   ║
║  │                                                                  │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Tab 3: History Records

```
╔══════════════════════════════════════════════════════════════════════════╗
║  For each history record:                                                ║
║                                                                          ║
║  Created: 09 May 2026, 10:15                                            ║
║                                                                          ║
║  ┌──────────────────────────────┬──────────────────────────────────┐   ║
║  │ Previous Eye History          │ Family History                   │   ║
║  │ Patient had LASIK in 2015,    │ Father: Hypertension           │   ║
║  │ 6/6 vision post-surgery       │ Mother: Glaucoma               │   ║
║  ├──────────────────────────────┼──────────────────────────────────┤   ║
║  │ Allergies                     │ Chronic Diseases               │   ║
║  │ Penicillin, Aspirin          │ Diabetes Type 2                 │   ║
║  ├──────────────────────────────┼──────────────────────────────────┤   ║
║  │ Current Medications           │ Eye Surgeries                   │   ║
║  │ • Metformin 500mg (BID)      │ • LASIK (Right) - 2015         │   ║
║  │ • Amlodipine 5mg (OD)        │ • Cataract (Left) - 2018       │   ║
║  ├──────────────────────────────┼──────────────────────────────────┤   ║
║  │ Family Eye Diseases           │ Vision Symptoms                 │   ║
║  │ • Glaucoma (maternal side)    │ • Floaters                     │   ║
║  │ • Myopia (paternal side)      │ • Blurred vision               │   ║
║  └──────────────────────────────┴──────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Tab 4: Investigations

```
╔══════════════════════════════════════════════════════════════════════════╗
║  Timeline view:                                                          ║
║                                                                          ║
║  ● 08 May 2026, 09:00 - Investigations ordered                          ║
║  │                                                                       ║
║  │  Tests ordered:                                                       ║
║  │  [OCT] [Visual Field] [Fundus Photography] [IOP Measurement]         ║
║  │                                                                       ║
║  │  Notes: Urgent - Rule out retinal detachment                         ║
║  │                                                                       ║
║  ├─ ● 07 May 2026, 15:30 - Investigations ordered                       ║
║  │  │                                                                    ║
║  │  │  Tests ordered:                                                    ║
║  │  │  [Corneal Topography] [Anterior Segment OCT]                      ║
║  │  │                                                                    ║
║  │  │  Notes: Follow-up for corneal evaluation                          ║
║  │  │                                                                    ║
║  │  ● 05 May 2026, 11:00 - Investigations ordered                       ║
║  │                                                                       ║
║  │  Tests ordered:                                                       ║
║  │  [Refraction] [Color Vision Test]                                    ║
║  │                                                                       ║
║  │  Notes: Routine eye exam                                             ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Tab 5: Eye Examination

```
╔══════════════════════════════════════════════════════════════════════════╗
║  For each eye exam record:                                               ║
║                                                                          ║
║  Created: 08 May 2026, 14:30                                            ║
║                                                                          ║
║  ┌─────────────────────────────────────────────────────────────────┐   ║
║  │ RIGHT EYE                                                       │   ║
║  ├─────────────────────────────────────────────────────────────────┤   ║
║  │ VA (Visual Acuity)     6/9        │ Pupil Reaction    Brisk    │   ║
║  │ IOP (Eye Pressure)     15 mmHg    │ Eye Alignment     Normal   │   ║
║  │ Anterior Segment       Clear      │ Eye Movements     Full     │   ║
║  ├─────────────────────────────────────────────────────────────────┤   ║
║  │ Fundus Observation     Normal, vertical cup/disc 0.3            │   ║
║  └─────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
║  ┌─────────────────────────────────────────────────────────────────┐   ║
║  │ LEFT EYE                                                        │   ║
║  ├─────────────────────────────────────────────────────────────────┤   ║
║  │ VA (Visual Acuity)     6/12       │ Pupil Reaction    Sluggish │   ║
║  │ IOP (Eye Pressure)     18 mmHg    │ Eye Alignment     Phoria   │   ║
║  │ Anterior Segment       Mild cata..│ Eye Movements     Limited  │   ║
║  ├─────────────────────────────────────────────────────────────────┤   ║
║  │ Fundus Observation     Early cataract, no other abnormalities   │   ║
║  └─────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
║  Other Notes:                                                           ║
║  "Patient needs spectacle correction. Refer for cataract surgery"       ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Tab 6: Operations

```
╔══════════════════════════════════════════════════════════════════════════╗
║  For each operation:                                                     ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────┬──────────┐   ║
║  │ LASIK Eye Surgery - Refractive Correction            │ 2015    │   ║
║  │ Surgeon: Dr. Mohammed Al-Dosari                      │          │   ║
║  │ Eye: Both                                            │          │   ║
║  │ Hospital: Vision Center, Riyadh                      │          │   ║
║  │ Notes: Uneventful procedure. Post-op 6/6 vision      │          │   ║
║  └──────────────────────────────────────────────────────┴──────────┘   ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────┬──────────┐   ║
║  │ Cataract Surgery - Left Eye                          │ 2018    │   ║
║  │ Surgeon: Dr. Fatima Al-Rashid                        │          │   ║
║  │ Eye: Left (OS)                                       │          │   ║
║  │ Hospital: King Fahad Medical City                    │          │   ║
║  │ Notes: Phacoemulsification with IOL implantation     │          │   ║
║  └──────────────────────────────────────────────────────┴──────────┘   ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Tab 7: Prescriptions

```
╔══════════════════════════════════════════════════════════════════════════╗
║  For each prescription:                                                  ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │ CIPROFLOXACIN                                                    │   ║
║  │ [Eye Drops]                                                      │   ║
║  │                                                                  │   ║
║  │  Dose: 0.3%              Frequency: 3-4 times daily            │   ║
║  │  Duration: 7 days        Instructions: Use in both eyes         │   ║
║  │                                                                  │   ║
║  │  Notes: For bacterial conjunctivitis. Avoid contact lenses     │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │ METFORMIN                                                        │   ║
║  │ [Tablet]                                                         │   ║
║  │                                                                  │   ║
║  │  Dose: 500mg              Frequency: Twice daily                │   ║
║  │  Duration: Ongoing        Instructions: Take with food          │   ║
║  │                                                                  │   ║
║  │  Notes: For Diabetes Type 2. Monitor blood glucose levels       │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Tab 8: Diagnoses

```
╔══════════════════════════════════════════════════════════════════════════╗
║  For each diagnosis:                                                     ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │ Refractive Error (Myopia)              [Mild] [Active]          │   ║
║  │ ICD-10: H52.1                                                    │   ║
║  │ Notes: Moderate myopia, corrected with spectacles              │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │ Cataract - Left Eye (Age-related)      [Moderate] [Active]     │   ║
║  │ ICD-10: H25.91                                                   │   ║
║  │ Notes: Early nuclear sclerosis. May require surgery in 6 months │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │ Dry Eye Syndrome (Bilateral)           [Mild] [Active]         │   ║
║  │ ICD-10: H04.12                                                   │   ║
║  │ Notes: Seasonal exacerbation. Use preservative-free drops       │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │ Hypertension                           [Severe] [Active]        │   ║
║  │ ICD-10: I10                                                      │   ║
║  │ Notes: Systemic disease. Monitor ocular complications            │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 🔄 Data Transformation Example

```javascript
// RAW API RESPONSE
{
  "patientId": 123,
  "name": "Ahmed Ali",
  "birthDate": "1979-05-15T00:00:00",
  "gender": 0,                    // 0 = Male, 1 = Female
  "phone": "+966501234567",
  "email": "patient@example.com",
  "address": "Riyadh, Saudi Arabia",
  "nationalId": "29505091234567",
  "insuranceCompany": "SAADA",
  "insuranceId": "INS-12345",
  "emergencyContactName": "Fatima Ali",
  "emergencyContactPhone": "+966502222222"
}

        ↓↓↓ normalizePatient() ↓↓↓

// NORMALIZED STATE
{
  patientId: "123",
  name: "Ahmed Ali",
  age: 46,                        // Calculated from DOB
  gender: "Male",                 // Mapped from 0
  birthDate: "1979-05-15T00:00:00",
  nationalId: "29505091234567",
  phone: "+966501234567",
  email: "patient@example.com",
  address: "Riyadh, Saudi Arabia",
  insuranceCompany: "SAADA",
  insuranceId: "INS-12345",
  emergencyContactName: "Fatima Ali",
  emergencyContactPhone: "+966502222222",
  complaints: [],
  histories: [],
  investigations: [],
  eyeExaminations: [],
  operations: [],
  prescriptions: [],
  diagnoses: [],
  images: []
}

        ↓↓↓ Render UI ↓↓↓

// DISPLAYED IN UI
Patient ID          : P-000123
Full Name           : Ahmed Ali
Age                 : 46 years old
Gender              : Male
Date of Birth       : 15 May 1979
National ID         : 29505091234567
Phone               : +966501234567
Email               : patient@example.com
Address             : Riyadh, Saudi Arabia
Insurance Company   : SAADA
Insurance ID        : INS-12345
Emergency Contact   : Fatima Ali (+966502222222)
```

---

## 🔐 Security Considerations

```
┌─────────────────────────────────────────────────────────────────┐
│  PATIENT DATA FLOW SECURITY                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Authentication Check                                        │
│     ✓ Verify authToken exists in localStorage                  │
│     ✓ Verify user is logged in                                 │
│     ✓ Verify user role (patient/doctor)                        │
│                                                                 │
│  2. Authorization Check                                         │
│     ✓ Patients can only view their own medical record          │
│     ✓ Doctors can view assigned patients' records              │
│     ✓ Backend validates patientId matches auth context         │
│                                                                 │
│  3. Data Encryption                                             │
│     ✓ HTTPS/TLS for all API calls                              │
│     ✓ Sensitive data (nationalId, insurance) encrypted at rest │
│     ✓ Clear sensitive data from localStorage on logout         │
│                                                                 │
│  4. API Validation                                              │
│     ✓ Validate patientIdentifier format (P-XXXXXX)             │
│     ✓ Sanitize all input data                                  │
│     ✓ Rate limit API requests                                  │
│     ✓ Log all access to patient records                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

