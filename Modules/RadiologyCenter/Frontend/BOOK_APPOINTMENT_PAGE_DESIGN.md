# Book Appointment Page - Enhanced Design Documentation

## Overview
The Book Appointment Page implements a **dual user flow system** for the Radiology Center with complete FHIR/HL7 integration.

---

## TWO USER FLOWS

### FLOW 1: Direct Radiology Patient (Independent Entry)
**Scenario:** Patient enters radiology center directly without clinic system involvement

**Entry Points:**
- Direct URL access: `/radiology/book-appointment`
- From radiology navbar

**User Journey:**
1. **Patient Information Entry** (PatientDataForm component)
   - Manual entry of all demographics
   - Full name, phone, email
   - Gender, age, national ID, address
   - Real-time validation
   - Form errors for missing/invalid fields

2. **Service Selection** (Horizontal scrolling)
   - Browse available radiology tests (MRI, CT, X-Ray, etc.)
   - Cards with images, pricing, duration
   - Color-coded by service type

3. **Date/Time Selection** (Calendar + Time Slots)
   - Interactive calendar widget
   - Available time slots for selected date (9 AM - 8 PM, 30-min intervals)
   - Past dates disabled

4. **Appointment Summary Panel**
   - Shows all manually entered patient data
   - Selected test with pricing & duration
   - Date & time confirmation
   - Booking reference (auto-generated)
   - Data source badge: "Manually Entered" (purple)

5. **Confirmation & Booking**
   - "Confirm Booking" button
   - Button disabled until all required fields filled
   - Success message + auto-redirect to appointments list

**Data Persistence:**
- Saved to localStorage for session
- Saved to Radiology Backend API
- NOT linked to clinic system

---

### FLOW 2: Clinic System Patient (Integrated Entry)
**Scenario:** Patient comes from Clinic System either via doctor order or navbar link

**Entry Points:**
1. From Doctor Order Request (DoctorOrdersPage)
   - Doctor selects radiology test
   - Patient redirected with: `fromClinic=true`, `patientData={FHIR mapped data}`

2. From Clinic System Navbar
   - Direct link to radiology booking
   - Patient pre-authenticated + auto-loaded via FHIR

**User Journey:**
1. **Patient Information Display** (Read-Only)
   - Auto-filled from Clinic System FHIR data
   - No manual entry allowed (fields locked)
   - All demographics visible:
     - Name, ID, phone, email
     - Gender, DOB, age, national ID, address
   - Data source badge: "Data Imported from Clinic System" (blue, locked icon)

2. **Pre-Selected Test** (Optional)
   - If doctor ordered specific test, it's pre-selected
   - Patient can change if needed
   - Otherwise, free selection like Flow 1

3. **Date/Time Selection**
   - Same calendar + time slots as Flow 1
   - Patient selects appointment date/time

4. **Appointment Summary Panel**
   - Shows imported clinic patient data (read-only)
   - Selected service
   - Date & time
   - Booking reference
   - Clear indicator: "Data Imported from Clinic System" (blue badge)

5. **Confirmation & Integration**
   - Confirms booking in Radiology system
   - **Sends appointment back to Clinic System** (bidirectional FHIR sync)
   - Creates link between clinic order + radiology appointment
   - Success message with clinic order reference

**Data Persistence:**
- Patient data from Clinic System (never duplicated)
- Appointment stored in Radiology Backend
- Bidirectional FHIR mapping maintains consistency
- Clinic system receives appointment confirmation

---

## CRITICAL COMPONENTS

### 1. PatientDataForm Component
**Location:** `src/components/Radiology/PatientDataForm.jsx`

**Purpose:** Captures manual patient entry for direct radiology patients

**Features:**
- 7 form fields: Name, Phone, Email, National ID, DOB, Gender, Address
- Real-time validation with error messages
- Age auto-calculated from DOB
- Read-only mode for clinic patients
- Touch tracking for field validation
- Mobile-friendly grid layout

**Props:**
```javascript
{
  patientData,           // Current patient data object
  onDataChange,          // (name, value) => callback
  onValidationChange,    // (isValid) => callback
  isReadOnly = false     // For clinic patients
}
```

### 2. AppointmentSummaryPanel Component
**Location:** `src/components/Radiology/AppointmentSummaryPanel.jsx`

**Purpose:** CRITICAL - Dynamically displays appointment details for BOTH flows

**Dynamic Behavior:**
- **For Direct Patients:** Shows manually entered data + manual entry source badge
- **For Clinic Patients:** Shows imported data + import source badge + lock icon

**Content Sections:**
1. **Data Source Badge**
   - Color & text changes based on source
   - Lock icon for read-only clinic data

2. **Patient Information Panel**
   - Displays all patient demographics
   - Shows required field validation (red "required" text if missing)
   - Different background color for clinic patients (light blue)

3. **Radiology Service Panel**
   - Test name, specialty, pricing
   - Dynamic color matching service card
   - Duration in minutes

4. **Appointment Details Panel**
   - Date (full format)
   - Time (12-hour format)
   - Duration

5. **Booking Reference**
   - Unique reference code
   - Monospace font, dark background
   - Instructions: "Use this reference for all future inquiries"

6. **Validation Warning** (if needed)
   - Yellow banner: "Please complete all required fields to proceed"

**Props:**
```javascript
{
  patientInfo,         // Patient data object
  selectedService,     // Service object
  selectedDate,        // Date object
  selectedTime,        // Time string (HH:MM)
  bookingReference,    // String reference code
  isFromClinic,        // Boolean - controls badge & colors
  isMissingRequired,   // Boolean - shows warning
  formatTime,          // Function to format time
  lang = 'en'          // Language
}
```

### 3. FHIR Integration Service
**Location:** `src/services/FHIRIntegrationService.js`

**Purpose:** Handles data mapping between systems

**Key Functions:**

#### FHIRMapper
- `mapFHIRToRadiology(fhirData)` - Clinic → Radiology format
- `mapRadiologyToFHIR(radiologyAppointment)` - Radiology → Clinic format (FHIR R4)
- `validateConsistency(radiologyPatient, clinicPatient)` - Detects mismatches
- `detectDuplicate(patientData)` - Prevents duplicate records

#### ClinicIntegrationService
- `getPatientFromClinicOrder(orderId)` - Fetch patient by doctor order
- `getPatientFromClinicSystem(patientId)` - Fetch patient by ID
- `syncAppointmentToClinic(radiologyAppointment)` - Send confirmation back

#### LocalStorageService (fallback)
- `savePatientData(patientData)` - Save to localStorage
- `loadPatientData()` - Load from localStorage
- `clearPatientData()` - Clear stored data

---

## FHIR/HL7 DATA MAPPING

### Patient Data ([PID] Segment)
**Clinic System Format:**
```javascript
{
  patientId, name, phone, email, gender,
  birthDate, nationalId, address,
  systemId, resourceId
}
```

**Radiology System Format:**
```javascript
{
  id, name, phone, email, gender,
  dateOfBirth, nationalId, address,
  fhirResourceId, fhirSystemId,
  clinicOrderId, clinicDoctorId,
  clinicReqTest, dataSource, importedAt
}
```

### Appointment Data ([SCH] Segment)
**FHIR R4 Appointment Resource:**
```json
{
  "resourceType": "Appointment",
  "id": "booking_reference",
  "status": "proposed",
  "serviceCategory": { "coding": [...] },
  "participant": [...],
  "start": "2024-05-20T14:30:00Z",
  "end": "2024-05-20T15:30:00Z",
  "extension": [
    {
      "url": "http://radiology-system.example.com/booking-reference",
      "valueString": "AB1234"
    }
  ]
}
```

---

## DATA CONSISTENCY & DUPLICATE PREVENTION

### Validation Workflow
1. **On Clinic Data Load:**
   - Check for existing radiology records with same patient ID
   - Validate name, DOB, national ID match
   - Log consistency warnings if mismatches found

2. **Before Booking:**
   - Confirm all required fields present
   - Validate patient data format
   - Check for potential duplicates

3. **After Booking:**
   - Sync appointment FHIR data to clinic system
   - Create bidirectional link (clinic order ID → radiology appointment)
   - Log audit trail in both systems

### Duplicate Detection
**Query Parameters:**
- Name (case-insensitive)
- Date of Birth
- National ID
- Phone number

**Action:**
- If duplicates found: Ask user to confirm identity
- Never auto-merge records
- Always create new radiology patient record if clinic record doesn't exist

---

## UI/UX FEATURES

### Visual Design
- **Medical-style layout:** Clean, professional, light colors
- **Service cards:** Color-coded by test type (MRI=blue, CT=teal, X-Ray=green, etc.)
- **Appointment summary:** Grid layout for patient info, easy to read
- **Calendar:** Interactive, disabled past dates, color highlights selection
- **Badges:** Clear data source indicators (blue for imported, purple for manual)

### Responsive Design
- **Desktop:** 2-column layout (calendar left, summary right)
- **Tablet:** Stacked layout with adequate spacing
- **Mobile:** Single column, collapsible sections, larger touch targets

### Real-Time Updates
- Patient data changes → Summary updates immediately
- Service selection → Summary color changes
- Date/time selection → Summary updates
- Validation state → Button enable/disable

### Accessibility
- Clear field labels with icons
- Color + text for data sources (not color alone)
- Keyboard navigation support
- ARIA labels for form fields
- Error messages linked to fields

---

## INTEGRATION WITH CLINIC SYSTEM

### Navigation Flow
**Clinic System → Radiology System:**
```
DoctorOrdersPage 
  → Click "Book Radiology"
  → Pass: { 
      fromClinic: true,
      patientData: { ...FHIR mapped },
      selectedTest: { id, name },
      doctorId, orderId
    }
  → Navigate to BookAppointmentPage
```

**Radiology System → Clinic System:**
```
After Booking Success:
  → Call ClinicIntegrationService.syncAppointmentToClinic()
  → Send: { 
      fhirData: { ...FHIR appointment },
      radiologyData: { ...radiology booking }
    }
  → Clinic system creates appointment link to order
  → Return clinic appointment ID to radiology
```

### LocalStorage Keys (Direct Patients Only)
- `radiologyPatientId`
- `radiologyPatientName`
- `radiologyPatientPhone`
- `radiologyPatientEmail`
- `radiologyPatientGender`
- `radiologyPatientDateOfBirth`
- `radiologyPatientNationalId`
- `radiologyPatientAddress`

---

## VALIDATION RULES

### Patient Information (All Required)
- **Name:** Min 2 characters, alphabetic
- **Phone:** Valid format (numbers, +, -, (), spaces)
- **Email:** Valid email format
- **Gender:** One of (Male, Female, Other)
- **DOB:** Valid date, not future date
- **National ID:** Min 5 characters
- **Address:** Min 5 characters

### Appointment Selection
- **Service:** Must select one test
- **Date:** Must be future date, not past
- **Time:** Must be within operating hours (9 AM - 8 PM)

### All Three Required to Enable Booking
- Service selected ✓
- Date selected ✓
- Time selected ✓
- All patient data valid ✓

---

## ERROR HANDLING

### Patient Data Errors
- Display inline under each field
- Highlight invalid fields with red border
- Clear error when user corrects

### API Errors
- Graceful fallback to localStorage for clinic patients
- Show error message to user
- Offer retry option
- Log detailed error for debugging

### Duplicate Detection Errors
- Show warning if duplicates found
- Ask user to confirm identity
- Provide option to use existing record or create new

---

## TESTING SCENARIOS

### Scenario 1: Direct Radiology Patient
1. Open `/radiology/book-appointment`
2. Manually fill all patient data
3. Select test, date, time
4. Confirm booking → Success message
5. Verify data saved in localStorage

### Scenario 2: Clinic Patient (Doctor Order)
1. In Clinic System, create doctor order with radiology test
2. Click "Book Radiology" button
3. Navigate to radiology booking with auto-filled data
4. Confirm fields are locked (read-only)
5. Select date, time (test pre-selected)
6. Confirm booking → Success + sync to clinic
7. Verify appointment linked in clinic system

### Scenario 3: Clinic Patient (From Navbar)
1. In Clinic System, click "Book Radiology Test" in navbar
2. Auto-loaded with patient data
3. Free selection of test, date, time
4. Confirm booking → Success + sync to clinic

### Scenario 4: Data Mismatch
1. Manually entered clinic patient data differs
2. System detects mismatch on load
3. Show warning message
4. Ask user to confirm identity
5. Proceed or cancel

---

## Future Enhancements

### Phase 2
- Payment integration
- Appointment reminders (SMS/Email)
- Prescription integration
- Multi-language support (already has AR infrastructure)

### Phase 3
- Insurance verification
- Prior authorization workflow
- Technician assignment
- Real-time availability sync

### Phase 4
- Patient portal account
- Appointment rescheduling
- Result viewing
- Feedback/rating system

---

## Key Files
- **Page:** `/Modules/RadiologyCenter/Frontend/src/pages/Radiology/BookAppointmentPage.jsx`
- **Components:**
  - `/src/components/Radiology/PatientDataForm.jsx`
  - `/src/components/Radiology/AppointmentSummaryPanel.jsx`
- **Services:**
  - `/src/services/FHIRIntegrationService.js`
  - `/src/services/fhirIntegrationService.js` (existing)
- **API Base:** Radiology API: `http://localhost:5202/api`
- **Clinic API:** `http://localhost:5201/api`

---

## Testing & Debugging
- Use browser DevTools Console
- Monitor FHIR segment logs in backend terminal
- Check localStorage for patient data
- Verify API calls in Network tab
- Use `[FHIR]` console logs for tracing integration flow
