# Book Appointment Page - Implementation Integration Guide

## Quick Integration Steps

### Step 1: Import New Components and Services
Add to the top of `BookAppointmentPage.jsx`:

```javascript
import PatientDataForm from '../../components/Radiology/PatientDataForm';
import AppointmentSummaryPanel from '../../components/Radiology/AppointmentSummaryPanel';
import { FHIRMapper, ClinicIntegrationService } from '../../services/FHIRIntegrationService';
```

### Step 2: Update State Management

Current state already has:
```javascript
const [patientInfo, setPatientInfo] = useState({...});
const [selectedService, setSelectedService] = useState(...);
const [selectedDate, setSelectedDate] = useState(null);
const [selectedTime, setSelectedTime] = useState('');
```

Add these new states:
```javascript
const [isPatientDataValid, setIsPatientDataValid] = useState(false);
const [dataSourceBadge, setDataSourceBadge] = useState(null);
const [consistencyIssues, setConsistencyIssues] = useState([]);
const [showDataMismatchWarning, setShowDataMismatchWarning] = useState(false);
```

### Step 3: Update useEffect for Patient Data Loading

Replace the existing `useEffect` for patient data with:

```javascript
useEffect(() => {
  const loadPatientData = () => {
    // Priority 1: FHIR data from clinic system
    if (clinicPatientData && fromClinic) {
      console.log('[Radiology] Loading patient data from FHIR/Clinic System:', clinicPatientData);
      
      // Use FHIR mapper to standardize data
      const mappedData = FHIRMapper.mapFHIRToRadiology(clinicPatientData);
      
      setPatientInfo(mappedData);
      setDataSourceBadge({
        isFromClinic: true,
        text: 'Data from Clinic System',
        color: '#0ea5e9'
      });
      
      // Data from clinic is automatically valid (pre-validated)
      setIsPatientDataValid(true);
      
      // Log for audit trail
      console.log('[Integration] Patient loaded from clinic with ID:', mappedData.id);
      return;
    }
    
    // Priority 2: localStorage (for returning direct patients)
    const storedPatient = {
      id: localStorage.getItem('radiologyPatientId') || '',
      name: localStorage.getItem('radiologyPatientName') || '',
      phone: localStorage.getItem('radiologyPatientPhone') || '',
      email: localStorage.getItem('radiologyPatientEmail') || '',
      gender: localStorage.getItem('radiologyPatientGender') || '',
      dateOfBirth: localStorage.getItem('radiologyPatientDateOfBirth') || '',
      nationalId: localStorage.getItem('radiologyPatientNationalId') || '',
      address: localStorage.getItem('radiologyPatientAddress') || '',
      appointmentId: ''
    };
    
    setPatientInfo({
      ...storedPatient,
      age: storedPatient.dateOfBirth ? calculateAge(storedPatient.dateOfBirth) : null,
    });
    
    setDataSourceBadge({
      isFromClinic: false,
      text: 'Manually Entered',
      color: '#8b5cf6'
    });
    
    // Direct patient data needs validation
    const validation = validatePatientData(storedPatient);
    setIsPatientDataValid(validation.isValid);
  };
  
  loadPatientData();
}, [clinicPatientData, fromClinic]);
```

### Step 4: Add Patient Data Change Handler (For Direct Patients)

```javascript
const handlePatientDataChange = (fieldName, value) => {
  const updatedPatient = { ...patientInfo, [fieldName]: value };
  setPatientInfo(updatedPatient);
  
  // Validate on change
  const validation = validatePatientData(updatedPatient);
  setIsPatientDataValid(validation.isValid);
};
```

### Step 5: Update handleConfirmBooking for Bidirectional Sync

```javascript
const handleConfirmBooking = async () => {
  // Existing validation
  if (!selectedService) { setError('Please select a radiology service'); return; }
  if (!selectedDate) { setError('Please select a date'); return; }
  if (!selectedTime) { setError('Please select a time slot'); return; }
  
  // NEW: Validate patient data for direct patients
  if (!fromClinic) {
    const validation = validatePatientData(patientInfo);
    if (!validation.isValid) {
      setError(`Please complete: ${validation.missingFields.join(', ')}`);
      return;
    }
  }

  setBooking(true);
  setError('');

  const appointmentDateTime = new Date(selectedDate);
  const [hours, minutes] = selectedTime.split(':');
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

  const bookingData = {
    bookingReference,
    patientId: patientInfo.id || `RAD-${Date.now()}`,
    patientName: patientInfo.name,
    patientPhone: patientInfo.phone,
    patientEmail: patientInfo.email,
    patientGender: patientInfo.gender,
    patientDateOfBirth: patientInfo.dateOfBirth,
    patientAge: patientInfo.age || calculateAge(patientInfo.dateOfBirth),
    patientNationalId: patientInfo.nationalId,
    patientAddress: patientInfo.address,
    serviceId: selectedService.id,
    serviceName: selectedService.name,
    servicePrice: selectedService.range,
    appointmentDate: selectedDate.toISOString().split('T')[0],
    appointmentTime: selectedTime,
    appointmentDateTime: appointmentDateTime.toISOString(),
    status: 'Pending',
    // NEW: Add source and clinic metadata
    dataSource: fromClinic ? 'clinic-fhir' : 'radiology-direct',
    clinicOrderId: patientInfo.clinicOrderId || null,
    clinicDoctorId: patientInfo.clinicDoctorId || null,
    fhirResourceId: patientInfo.fhirResourceId || null
  };

  try {
    // Save locally for direct patients
    if (!fromClinic) {
      localStorage.setItem('radiologyPatientId', patientInfo.id);
      localStorage.setItem('radiologyPatientName', patientInfo.name);
      // ... save all patient fields
    }
    
    // Send to Radiology Backend API
    try {
      const response = await axios.post(`${RADIOLOGY_API}/appointments`, bookingData);
      console.log('[Radiology] Appointment created:', response.data);
    } catch (apiErr) {
      console.warn('Backend API not available:', apiErr.message);
    }
    
    // NEW: If from clinic, sync back to clinic system for bidirectional link
    if (fromClinic && patientInfo.clinicOrderId) {
      try {
        const syncResult = await ClinicIntegrationService.syncAppointmentToClinic(bookingData);
        if (syncResult.success) {
          console.log('[Integration] Appointment synced to clinic:', syncResult.clinicAppointmentId);
        }
      } catch (syncErr) {
        console.warn('[Integration] Could not sync to clinic:', syncErr.message);
        // Don't fail the booking if sync fails
      }
    }
    
    setSuccess(true);
    setTimeout(() => navigate('/patient/appointments'), 3000);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to book appointment');
  } finally {
    setBooking(false);
  }
};
```

### Step 6: Update the Right Panel (Appointment Summary)

Replace the existing appointment summary section with:

```javascript
{/* RIGHT: Appointment Summary - Dynamic for both flows */}
<AppointmentSummaryPanel
  patientInfo={patientInfo}
  selectedService={selectedService}
  selectedDate={selectedDate}
  selectedTime={selectedTime}
  bookingReference={bookingReference}
  isFromClinic={fromClinic}
  isMissingRequired={!fromClinic && !isPatientDataValid}
  formatTime={formatTime}
  lang={lang}
/>
```

### Step 7: Update the Left Panel (Patient Info Input)

Replace the patient information display section with:

```javascript
{/* LEFT SIDE: Either Calendar OR Patient Form */}
{!fromClinic ? (
  // FLOW 1: Direct Radiology Patient - Show Patient Form
  <>
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        background: 'white',
        borderRadius: 24,
        padding: 28,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        marginBottom: 32
      }}
    >
      <PatientDataForm
        patientData={patientInfo}
        onDataChange={handlePatientDataChange}
        onValidationChange={setIsPatientDataValid}
        isReadOnly={false}
      />
    </motion.div>
    
    {/* Calendar below patient form */}
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        background: 'white',
        borderRadius: 24,
        padding: 28,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
      }}
    >
      {/* Calendar code here (same as before) */}
    </motion.div>
  </>
) : (
  // FLOW 2: Clinic System Patient - Show Calendar Only
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    style={{
      background: 'white',
      borderRadius: 24,
      padding: 28,
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
    }}
  >
    {/* Calendar code here (same as before) */}
  </motion.div>
)}
```

---

## Validation Helper Functions

Add these to the top of the component:

```javascript
/**
 * Validates required patient fields for booking
 */
const validatePatientData = (patientInfo) => {
  const required = ['name', 'phone', 'email', 'gender', 'dateOfBirth', 'nationalId', 'address'];
  const missingFields = required.filter(field => 
    !patientInfo[field] || patientInfo[field].trim() === ''
  );
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Returns badge configuration based on data source
 */
const getDataSourceBadge = (isFromClinic) => {
  if (isFromClinic) {
    return {
      icon: FaCloudDownloadAlt,
      text: 'Data Imported from Clinic System',
      color: '#0ea5e9',
      bgColor: '#e0f2fe'
    };
  }
  return {
    icon: FaUser,
    text: 'Manually Entered',
    color: '#8b5cf6',
    bgColor: '#f3e8ff'
  };
};
```

---

## Layout Structure for Both Flows

### FLOW 1: Direct Patient (Desktop)
```
┌─────────────────────────────────────────────────────────┐
│  Service Cards (Horizontal Scroll)                      │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│  Patient Form        │  Appointment Summary             │
│  (Editable)          │  - Patient Info (manual)         │
│  - Name              │  - Service Details              │
│  - Phone             │  - Date/Time                     │
│  - Email             │  - Badge: "Manually Entered"     │
│  - etc.              │  - Confirm Button                │
│                      │                                  │
│  Calendar            │                                  │
│  (Date Selection)    │                                  │
│  (Time Slots)        │                                  │
│                      │                                  │
└──────────────────────┴──────────────────────────────────┘
```

### FLOW 2: Clinic Patient (Desktop)
```
┌─────────────────────────────────────────────────────────┐
│  Service Cards (Horizontal Scroll)                      │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│  Calendar            │  Appointment Summary             │
│  (Date Selection)    │  - Patient Info (read-only)     │
│  (Time Slots)        │  - Data Badge: "Imported"       │
│                      │  - Service Details              │
│                      │  - Date/Time                     │
│                      │  - Confirm Button                │
│                      │                                  │
└──────────────────────┴──────────────────────────────────┘
```

---

## Error Handling

Add error boundaries and specific error messages:

```javascript
// Patient validation error
if (!fromClinic && !isPatientDataValid) {
  // Show warning in appointment summary
  // Button remains disabled
}

// Appointment validation error  
if (!selectedService || !selectedDate || !selectedTime) {
  // Button disabled
  // Show visual indication in summary
}

// Booking error
if (error) {
  // Display error banner below appointment summary
}
```

---

## Testing Checklist

### Flow 1: Direct Patient
- [ ] Open `/radiology/book-appointment`
- [ ] Patient form appears (editable)
- [ ] Can select test, date, time
- [ ] Form validation works (errors show)
- [ ] All fields required before booking
- [ ] Booking succeeds, data saved to localStorage
- [ ] Appointment summary updates in real-time

### Flow 2: Clinic Patient
- [ ] Navigate from clinic system with state
- [ ] Patient data auto-fills
- [ ] Patient form is read-only (locked)
- [ ] Blue "Data Imported" badge visible
- [ ] Can select date, time
- [ ] Test may be pre-selected
- [ ] Booking succeeds, syncs back to clinic
- [ ] Appointment linked in clinic system

### Data Consistency
- [ ] Same patient data in clinic and radiology
- [ ] No duplicate patient records created
- [ ] Booking reference matches between systems
- [ ] Clinic order ID linked to radiology appointment

---

## Key Differences Between Flows

| Aspect | Flow 1 (Direct) | Flow 2 (Clinic) |
|--------|-----------------|-----------------|
| **Entry** | Direct URL | From doctor order or navbar |
| **State Passed** | None | `{fromClinic, patientData, ...}` |
| **Patient Form** | Editable, required | Read-only, pre-filled |
| **Validation** | Manual entry validated | Pre-validated from clinic |
| **Data Badge** | "Manually Entered" (purple) | "Data Imported" (blue) |
| **Service Selection** | Free choice | May be pre-selected |
| **Integration** | None (local only) | Bidirectional FHIR sync |
| **Data Storage** | localStorage + API | API + clinic system link |
| **Success Redirect** | Appointments list | Appointments list |

---

## Component Dependencies

```
BookAppointmentPage
├── PatientDataForm
│   ├── react-icons (FaUser, FaPhone, etc.)
│   └── react (motion from framer-motion)
├── AppointmentSummaryPanel
│   ├── react-icons
│   └── framer-motion
├── FHIRIntegrationService
│   ├── fhirSegmentLogger (existing)
│   └── API calls (axios)
└── All_SERVICES (test data)
```

---

## Configuration

The page uses these environment variables:

```javascript
VITE_API_URL = "http://localhost:5201"        // Clinic API
VITE_RADIOLOGY_API = "http://localhost:5202"  // Radiology API
```

Set in `.env` or `vite.config.js`:
```javascript
export default defineConfig({
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:5201'),
    'import.meta.env.VITE_RADIOLOGY_API': JSON.stringify('http://localhost:5202/api')
  }
})
```

---

## Known Limitations & Future Improvements

### Current Limitations
- No payment integration yet
- Calendar shows 30-minute slots (could be configurable)
- No technician assignment
- No appointment history on same page

### Future Enhancements
- Real-time availability from backend
- Payment gateway integration
- Appointment modifications (reschedule, cancel)
- Instant appointment confirmation email/SMS
- Multi-language support completion (AR already in place)
- Insurance pre-auth workflow
- Patient portal account system
