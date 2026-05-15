# Patient Medical Record Data Mapping - Quick Reference Card

## 🎯 Quick Field Lookup

```
FRONTEND                    →    API FIELD                  →    DATABASE TABLE
──────────────────────────────────────────────────────────────────────────────

Patient ID                  →    patientIdentifier          →    Patients / Appointments
Full Name                   →    name, firstName, lastName  →    Patients / Appointments
Age                         →    age (calculated)           →    Calculated from birthDate
Gender                      →    gender                     →    Patients.Gender / Appointments.PatientGender
Date of Birth               →    birthDate                  →    Patients.DateOfBirth / Appointments.PatientBirthDate
National ID                 →    nationalId                 →    Patients.NationalId / Appointments.NationalId
Phone                       →    phone                      →    Patients.Phone / Appointments.Phone
Email                       →    email                      →    Patients.Email / Appointments.Email
Address                     →    address                    →    Patients.Address / Appointments.Address

Insurance Company           →    insuranceCompany          →    Patients.InsuranceCompany / Appointments.InsuranceCompany
Insurance ID                →    insuranceId               →    Patients.InsuranceId / Appointments.InsuranceId
Policy Number               →    policyNumber              →    Appointments.PolicyNumber
Coverage                    →    coverage                  →    Appointments.Coverage
Coverage Type               →    coverageType              →    Appointments.CoverageType
Insurance Expiry            →    insuranceExpiryDate       →    Appointments.InsuranceExpiryDate

Emergency Contact Name      →    emergencyContactName      →    Patients / Appointments
Emergency Contact Phone     →    emergencyContactPhone     →    Patients / Appointments
```

---

## 🔌 API Endpoints

### Primary Endpoint (What Frontend Uses)
```
GET /api/MedicalRecord/appointment-info/{patientId}
Base URL: http://localhost:5201

Example:
  GET http://localhost:5201/api/MedicalRecord/appointment-info/P-000123

Returns: Complete patient data from Patients OR Appointments table
```

### Other Endpoints
```
GET /api/MedicalRecord/patient/{patientId}
  → Full medical record with all medical history

GET /api/MedicalRecord/check/{patientId}
  → Check if medical record exists
  → Returns: { exists, recordId, patientIdentifier }

GET /api/MedicalRecord/get-or-create/{patientId}
  → Get existing or create new medical record
```

---

## 📊 API Response Structure

```json
{
  "patientId": "P-000123",
  "patientIdentifier": "P-000123",
  "name": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  
  // ── Personal Information ──
  "gender": "Male",                          // Male | Female | Other
  "birthDate": "1990-01-15",                // ISO format
  "age": 34,                                 // Calculated
  "nationalId": "1234567890",              // 10 digits
  
  // ── Contact Information ──
  "phone": "+966501234567",
  "email": "john@example.com",
  "address": "123 Main Street, Riyadh",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+966509876543",
  
  // ── Insurance Information ──
  "insuranceCompany": "BUPA Arabia",
  "insuranceId": "INS-2024-001",
  "policyNumber": "POL-2024-12345",
  "coverage": "85",                         // Percentage
  "coverageType": "Premium",
  "insuranceExpiryDate": "2025-12-31",
  "insuranceContact": "+966112345678",
  
  // ── Medical Record ──
  "medicalRecordId": 1,
  
  // ── Appointment Information ──
  "reasonForVisit": "Regular checkup",
  "appointmentDate": "2026-05-12",
  "appointmentTime": "14:30:00",
  "finalPrice": 500.00
}
```

---

## 🛠️ Development Checklist

### Adding a New Field to Patient Medical Record

- [ ] **1. Database Level**
  - [ ] Add column to Patients table (EMR.Patient model)
  - [ ] Add column to Appointments table
  - [ ] Run migration: `dotnet ef migrations add AddNewField`
  - [ ] Update database: `dotnet ef database update`

- [ ] **2. Backend API**
  - [ ] Add property to Patient/Appointment model
  - [ ] Add field to GetAppointmentInfo response object
  - [ ] Add logging for the new field
  - [ ] Test with Postman/curl

- [ ] **3. Frontend Display**
  - [ ] Add field variable: `const newField = d.newField || "";`
  - [ ] Add to PatientEMRPage.jsx display
  - [ ] Add console logging: `console.log("[PatientEMRPage] ✓ NewField:", info?.newField);`
  - [ ] Update DoctorViewPatientMedicalRecord.jsx if needed

- [ ] **4. Documentation**
  - [ ] Update COMPLETE_DATA_MAPPING_GUIDE.md
  - [ ] Add to this Quick Reference Card
  - [ ] Add test case to TEST_API_DATA_MAPPING.ps1

---

## 🐛 Debugging: Where to Look

### Issue: Field is null/empty in frontend

**Check in this order:**

1. **Browser Console (F12)**
   ```javascript
   // Look for these logs in console
   [PatientEMRPage] API Response from appointment-info:
   [PatientEMRPage] ✓ Gender: (should show value)
   [PatientEMRPage] ✓ Full API Response: (JSON with all fields)
   ```

2. **Database**
   ```sql
   -- Check if patient record has data
   SELECT * FROM Appointments WHERE PatientId = 'P-000123'
   -- Look for: PatientGender, NationalId, Address, InsuranceCompany
   ```

3. **Backend Logs**
   ```
   Look for: [GetAppointmentInfo] 
   Should show which table was queried and values
   ```

4. **API Response**
   ```bash
   curl http://localhost:5201/api/MedicalRecord/appointment-info/P-000123
   # Copy JSON response to https://jsonformatter.org/ for validation
   ```

---

## 💾 Database Field Mappings

### Patients Table (EMR.Patient)
```sql
PatientId              INT PRIMARY KEY
PatientIdentifier      VARCHAR(50)         -- Unique identifier
FirstName              VARCHAR(100)        -- Required
LastName               VARCHAR(100)        -- Required
DateOfBirth            DATETIME
Gender                 VARCHAR(20)         -- Male | Female | Other
Phone                  VARCHAR(20)         -- Required
Email                  VARCHAR(100)        -- Required
Address                VARCHAR(200)        -- Required
NationalId             VARCHAR(50)         -- Required
InsuranceCompany       VARCHAR(100)        -- Required
InsuranceId            VARCHAR(50)         -- Required
EmergencyContactName   VARCHAR(100)        -- Required
EmergencyContactPhone  VARCHAR(20)         -- Required
CreatedAt              DATETIME
```

### Appointments Table
```sql
AppointmentId          INT PRIMARY KEY
PatientId              VARCHAR(50)         -- Patient identifier
PatientName            VARCHAR(100)        -- Full name
PatientGender          INT                 -- 0=Male, 1=Female
Phone                  VARCHAR(20)
Email                  VARCHAR(100)
PatientBirthDate       DATETIME
NationalId             VARCHAR(20)
Address                VARCHAR(200)
InsuranceCompany       VARCHAR(100)
InsuranceId            VARCHAR(50)
PolicyNumber           VARCHAR(50)
Coverage               VARCHAR(10)         -- Percentage
CoverageType           VARCHAR(50)
InsuranceExpiryDate    DATETIME
InsuranceContact       VARCHAR(20)
EmergencyContactName   VARCHAR(100)
EmergencyContactPhone  VARCHAR(20)
AppointmentDate        DATETIME
AppointmentTime        TIME
FinalPrice             DECIMAL(18,2)
CreatedAt              DATETIME
UpdatedAt              DATETIME
```

---

## 🔍 Common Patterns

### Pattern 1: Null Coalescing (API)
```csharp
// Always return something, even if empty
return Ok(new {
    gender = patient?.Gender ?? "",
    nationalId = patient?.NationalId ?? "",
    address = patient?.Address ?? ""
});
```

### Pattern 2: Null Checking (Frontend)
```javascript
// Check multiple sources, use fallback
const gender = d.gender || d.Gender || d.patientGender || "";
const natId = d.nationalId || d.NationalId || "";
const address = d.address || d.Address || "";
```

### Pattern 3: Logging for Debugging
```javascript
console.log("[ComponentName] Field Name:", value);
console.log("[ComponentName] Full Response:", JSON.stringify(data, null, 2));
```

### Pattern 4: Fallback Chain
```
Try Patients Table 
  → If not found, try Appointments Table 
    → If not found, try LocalStorage 
      → If not found, use empty string ""
```

---

## 📋 Testing Checklist

After making changes:

- [ ] Run TEST_API_DATA_MAPPING.ps1
- [ ] Check browser console has all expected logs
- [ ] Verify database has test data
- [ ] Check API endpoint returns complete JSON
- [ ] Frontend displays all fields
- [ ] No console errors
- [ ] Data matches database values

---

## 🎓 Key Concepts

### Patient Identifier
- **Purpose**: Unique key to find patient across tables
- **Format**: Can be "P-000123" or just "123"
- **Storage**: localStorage → patientIdentifier

### Data Source Priority
1. **Patients Table** (EMR) - Primary source, most complete
2. **Appointments Table** - Fallback, when patient not in Patients table
3. **LocalStorage** - Last resort when API fails

### Gender Handling
```
Database     API Response    Frontend Display
0 (int)      "Male"          "Male"
1 (int)      "Female"        "Female"
"Male" (str) "Male"          "Male"
"Female"(str)"Female"        "Female"
```

---

## ⚡ Quick Fixes

### Field not showing?
→ Check API response in browser console

### API returns null?
→ Populate database with test data

### Data in wrong format?
→ Check Gender handling and date formatting

### Still stuck?
→ Run TEST_API_DATA_MAPPING.ps1 and compare output

---

## 📞 Support Resources

- **Comprehensive Guide**: `COMPLETE_DATA_MAPPING_GUIDE.md`
- **Issue Details**: `FIX_SUMMARY_DATA_MAPPING.md`
- **Test Script**: `TEST_API_DATA_MAPPING.ps1`
- **API Docs**: In code comments in MedicalRecordController.cs

---

**Last Updated**: May 12, 2026  
**Version**: 1.0  
**Status**: Production Ready ✅
