# Patient Data Mapping - Quick Reference

## 🎯 What Was Implemented

✅ **Patient Data Mapping**: Automatic data transfer from Eye Clinic to Radiology Center  
✅ **Global State Management**: PatientContext for centralized patient data  
✅ **Navbar Integration**: Displays patient name with welcome message  
✅ **Data Persistence**: Patient data stored in localStorage across page refreshes  
✅ **Easy Access**: Simple hook-based API for accessing patient data  

---

## 📋 Files Modified/Created

| File | Type | Purpose |
|------|------|---------|
| `src/context/PatientContext.jsx` | ✨ NEW | Global patient state management |
| `src/main.jsx` | 🔧 MODIFIED | Added PatientProvider wrapper |
| `src/layouts/PatientLayout.jsx` | 🔧 MODIFIED | Uses PatientContext for data |
| `src/components/shared/Navbar.jsx` | 🔧 MODIFIED | Displays patient name |
| `src/components/PatientProfileExample.jsx` | ✨ NEW | Usage examples |
| `frontend/src/Pages/RadiologyRedirectPage.jsx` | 🔧 MODIFIED | Improved redirect handling |

---

## 🚀 How to Use

### Access Patient Data in Any Component

```jsx
import { usePatient } from '../context/PatientContext';

function MyComponent() {
  const { patient } = usePatient();
  
  return <h1>Welcome, {patient.name}!</h1>;
}
```

### Available Patient Data

```javascript
patient = {
  id: "12345",
  name: "Mario el3beet",
  email: "mario@example.com",
  phone: "+201234567890",
  dateOfBirth: "1990-01-15"
}
```

### Update Patient Data

```jsx
const { updatePatient } = usePatient();

updatePatient({
  name: "New Name",
  email: "newemail@example.com"
});
```

### Clear Patient Data

```jsx
const { clearPatient } = usePatient();

clearPatient(); // Removes all patient data
```

---

## 📊 Data Flow Diagram

```
Eye Clinic (Patient clicks "Radiology Center")
    ↓
Eye Clinic PatientLayout.goToRadiologyCenter()
    ↓ (builds URL with patient parameters)
RadiologyRedirectPage (extracts 'target' parameter)
    ↓ (redirects with full URL)
Radiology Center PatientLayout (receives parameters)
    ↓ (passes to PatientContext)
PatientContext (stores in state & localStorage)
    ↓ (available to all components)
Navbar displays: "Welcome, {patient.name}!"
    ↓ (data persists across page navigation)
Any component can access via usePatient() hook
```

---

## ✅ Verification Checklist

After implementation, verify the following:

- [ ] Patient name appears in Navbar when redirecting from Eye Clinic
- [ ] Patient name persists when navigating between pages
- [ ] Browser console shows no errors
- [ ] localStorage contains patient data keys
- [ ] Navbar shows "Radiology Center" fallback when no patient data
- [ ] Multiple patient redirects work correctly
- [ ] Page refresh maintains patient data

---

## 🧪 Quick Test

1. **Start both systems**:
   ```bash
   # Terminal 1: Eye Clinic (port 5173)
   cd frontend && npm run dev
   
   # Terminal 2: Radiology Center (port 5174)
   cd radiology-center-frontend && npm run dev
   ```

2. **Test the flow**:
   - Login in Eye Clinic as patient
   - Click "Radiology Center" button
   - Wait for redirect
   - Verify Navbar shows "Welcome, {name}!"
   - Navigate to different pages
   - Verify name persists

3. **Check localStorage**:
   ```javascript
   // In browser console:
   localStorage.getItem('patientName')
   localStorage.getItem('patientId')
   localStorage.getItem('patientEmail')
   ```

---

## 🔒 Security Notes

⚠️ Current implementation:
- Patient data is visible in URL parameters (not encrypted)
- Stored in localStorage (accessible to any script)

🛡️ For production, consider:
- Using secure HTTP-only cookies instead
- Implementing backend API authentication
- Encrypting sensitive data
- Using HTTPS only
- Implementing CSRF protection

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Patient name not showing | Check URL parameters, verify PatientProvider in main.jsx |
| Data lost on refresh | Check localStorage enabled, verify PatientContext init |
| Context error | Ensure component is inside PatientProvider wrapper |
| Empty patient object | May still be loading - check `isLoading` state |

---

## 📚 Example Components

See `src/components/PatientProfileExample.jsx` for:
- `PatientProfile`: Display full patient details
- `PatientGreeting`: Show dynamic greeting
- `AppointmentForm`: Auto-fill with patient data
- `PatientDashboard`: Conditional patient content

---

## 🔗 Related Documentation

- Full guide: [PATIENT_DATA_MAPPING_GUIDE.md](./PATIENT_DATA_MAPPING_GUIDE.md)
- Example usage: [PatientProfileExample.jsx](./radiology-center-frontend/src/components/PatientProfileExample.jsx)
- Eye Clinic component: `frontend/src/components/PatientLayout.jsx`

---

## 💡 Next Steps

1. ✅ Test the basic flow
2. ✅ Integrate PatientContext into existing pages
3. ✅ Add more fields to patient data as needed
4. ✅ Implement error handling and loading states
5. 🔲 Add backend API integration
6. 🔲 Implement secure authentication
7. 🔲 Add audit logging for HIPAA compliance

---

## 📞 Support

For questions or issues:
1. Check the full guide: [PATIENT_DATA_MAPPING_GUIDE.md](./PATIENT_DATA_MAPPING_GUIDE.md)
2. Review example components: [PatientProfileExample.jsx](./radiology-center-frontend/src/components/PatientProfileExample.jsx)
3. Check browser console for errors
4. Verify localStorage contains expected data
