# Patient Data Mapping Implementation Guide

## Overview
This document describes the implementation of patient data mapping between the Eye Clinic System and the Radiology Center System, including Navbar updates to display patient names.

## Architecture

### 1. Data Flow

```
Eye Clinic System (Patient)
    ↓
    └─→ PatientLayout.jsx (goToRadiologyCenter function)
         └─→ Builds URL with patient parameters:
             - patientId
             - patientName
             - patientEmail
             - patientPhone
             - patientDateOfBirth
         └─→ Navigates to RadiologyRedirectPage
             └─→ RadiologyRedirectPage extracts 'target' parameter
                 └─→ Redirects to Radiology Center with patient data in URL
                     └─→ Radiology Center PatientLayout receives parameters
                         └─→ PatientContext initializes with patient data
                             └─→ Navbar displays patient name
```

### 2. Components Created/Modified

#### A. New: PatientContext (`src/context/PatientContext.jsx`)
- **Purpose**: Global state management for patient data
- **Features**:
  - Initializes patient data from URL parameters (highest priority) or localStorage
  - Persists patient data to localStorage for cross-page persistence
  - Provides `usePatient()` hook for accessing patient data
  - Methods:
    - `updatePatient()`: Update patient data and persist to localStorage
    - `clearPatient()`: Clear all patient data
    - `isLoading`: Loading state for initialization

#### B. Modified: `src/main.jsx`
- Added `PatientProvider` wrapper around the app
- Ensures patient context is available to all components

#### C. Modified: `src/layouts/PatientLayout.jsx`
- Now imports and uses `PatientContext`
- Automatically extracts patient data from URL parameters on mount
- Passes `patientName` to Navbar component

#### D. Modified: `src/components/shared/Navbar.jsx`
- Now accepts `patientName` prop
- Displays "Welcome, {patientName}!" when patient is logged in
- Falls back to "Radiology Center" if no patient name is available
- Updates subtitle dynamically based on patient name

#### E. Modified: `frontend/src/Pages/RadiologyRedirectPage.jsx`
- Improved to properly handle target URL with patient parameters
- Ensures patient data is preserved during redirect

## Usage

### Accessing Patient Data in Components

To access patient data from any component within the Radiology Center System:

```jsx
import { usePatient } from '../context/PatientContext';

function MyComponent() {
  const { patient, updatePatient, clearPatient, isLoading } = usePatient();

  if (isLoading) return <div>Loading patient data...</div>;

  return (
    <div>
      <p>Patient: {patient.name}</p>
      <p>Email: {patient.email}</p>
      <p>Phone: {patient.phone}</p>
      <button onClick={() => clearPatient()}>Clear Patient</button>
    </div>
  );
}
```

### Patient Data Properties

The `patient` object contains:
- `id`: Unique patient identifier (string)
- `name`: Patient's full name (string)
- `email`: Patient's email address (string)
- `phone`: Patient's phone number (string)
- `dateOfBirth`: Patient's date of birth (string)

## Data Persistence

Patient data is persisted using localStorage keys:
- `patientId`
- `patientName`
- `patientEmail`
- `patientPhone`
- `patientDateOfBirth`

This ensures patient data remains available even if the user refreshes the page or navigates away and back.

## Integration Flow

### Step 1: Patient Selection in Eye Clinic
1. Patient logs in or is selected in Eye Clinic System
2. User clicks "Radiology Center" button in PatientLayout
3. `goToRadiologyCenter()` function builds redirect URL with patient parameters

### Step 2: Redirect to Radiology Center
1. Navigate to RadiologyRedirectPage with 'target' parameter containing full URL with patient data
2. RadiologyRedirectPage extracts target URL
3. Redirect to Radiology Center System (http://localhost:5174/patient?patientId=...&patientName=...)

### Step 3: Patient Data Initialization
1. Radiology Center's PatientLayout receives URL parameters
2. PatientContext extracts and stores patient data
3. Data is persisted to localStorage

### Step 4: Navbar Display
1. Navbar receives patientName from PatientLayout
2. Displays "Welcome, {patientName}!" greeting
3. Patient name persists across all pages in Radiology Center

## Features

✅ **Automatic Mapping**: Patient data is automatically extracted and mapped from Eye Clinic to Radiology Center
✅ **Persistent Storage**: Patient data is stored in localStorage for cross-page persistence
✅ **Global State**: PatientContext provides centralized access to patient data
✅ **Navbar Integration**: Navbar automatically displays patient name
✅ **Fallback Handling**: System gracefully handles missing patient data
✅ **Type Safety**: Clear data structure with defined properties

## Testing the Implementation

### 1. Local Testing
1. Start Eye Clinic System on `http://localhost:5173`
2. Start Radiology Center System on `http://localhost:5174`
3. Login as a patient in Eye Clinic
4. Navigate to "Radiology Center" button
5. Verify patient name appears in Navbar as "Welcome, {name}!"
6. Navigate between pages and verify name persists

### 2. URL Parameter Verification
Check the URL when redirecting:
```
http://localhost:5174/patient?patientId=123&patientName=Mario%20el3beet&patientEmail=mario@example.com&patientPhone=201234567&patientDateOfBirth=1990-01-15
```

### 3. Browser Console Verification
```javascript
// In browser console:
const context = usePatient();
console.log(context.patient); // View patient data
```

## Future Enhancements

1. **Add more patient fields**: Medical history, allergies, insurance info, etc.
2. **Real-time sync**: Synchronize patient data changes across systems
3. **Encryption**: Encrypt patient data in localStorage for security
4. **API integration**: Fetch patient data from backend API instead of URL parameters
5. **Audit logging**: Track patient data access for compliance
6. **Role-based access**: Different data visibility based on user roles

## Security Considerations

⚠️ **Current Implementation Notes**:
- Patient data in URL parameters is visible (not encrypted)
- Consider using secure tokens for production environments
- Sensitive data should be fetched from backend API with authentication
- Implement HTTPS for all data transfers
- Use secure, HttpOnly cookies for session management

## Troubleshooting

### Patient name not showing in Navbar
1. Check browser console for errors
2. Verify URL parameters are being passed: Open Network tab and check the redirect URL
3. Check localStorage: Open DevTools → Application → Local Storage
4. Ensure PatientProvider is wrapping the entire app in main.jsx

### Data lost on page refresh
1. Verify localStorage is not disabled
2. Check if patientName/patientId keys exist in localStorage
3. Ensure PatientContext initialization logic is correct

### Context error "usePatient must be used within a PatientProvider"
1. Verify PatientProvider wraps all components that use usePatient
2. Check that main.jsx includes PatientProvider wrapper
3. Ensure import statement is correct: `import { usePatient } from '../context/PatientContext'`

## File Locations

- PatientContext: `radiology-center-frontend/src/context/PatientContext.jsx`
- PatientLayout: `radiology-center-frontend/src/layouts/PatientLayout.jsx`
- Navbar: `radiology-center-frontend/src/components/shared/Navbar.jsx`
- Main entry: `radiology-center-frontend/src/main.jsx`
- Redirect page: `frontend/src/Pages/RadiologyRedirectPage.jsx`
- Eye Clinic PatientLayout: `frontend/src/components/PatientLayout.jsx`
