# FHIR/HL7 Terminal Logging - Complete Setup Guide
## Eye Clinic + Radiology Center Integration

**Status:** ✅ COMPLETE
**Standard:** FHIR R4 + HL7 v2.5
**Port 5201:** Eye Clinic Backend
**Port 5301:** Radiology Center Backend
**Date:** May 2026

---

## 🚀 Quick Start (5 Minutes)

### Terminal 1: Run Eye Clinic Backend
```bash
cd Modules/ClinicSystem/Backend
dotnet run
```

**Expected Output:**
```
════════════════════════════════════════════════════════════════════════════════
  EYE CLINIC FHIR/HL7 API SERVICE STARTING
  Environment: Development
  FHIR Segments will be logged to console below
  Integration with Radiology Center enabled
════════════════════════════════════════════════════════════════════════════════
```

### Terminal 2: Run Radiology Center Backend
```bash
cd Modules/RadiologyCenter/Backend
dotnet run
```

**Expected Output:**
```
════════════════════════════════════════════════════════════════════════════════
  RADIOLOGY CENTER FHIR/HL7 SERVICE STARTING
  Environment: Development
  FHIR Segments will be logged to console below
  Look for: [PID], [SCH], [OBX], [ORM^O01], [ACK^O01]
════════════════════════════════════════════════════════════════════════════════
```

### Terminal 3: Run Frontend
```bash
cd Modules/RadiologyCenter/Frontend
npm run dev
```

---

## 📊 Data Flow with Terminal Logging

```
┌──────────────────────────────────┐
│  Frontend (5173)                 │
│  - PatientProfilePage            │
└──────────────┬──────────────────┘
               │ Browser Console
               │ (cyan/yellow FHIR logs)
               │
┌──────────────▼──────────────────┐
│  Radiology Frontend Services     │
│  - fhirIntegrationService        │
│  - fhirSegmentLogger             │
└──────────────┬──────────────────┘
               │
               │ HTTP FHIR REST
               │
┌──────────────▼──────────────────┐
│  Radiology Backend (5301)        │  ◄─── TERMINAL 2
│  - FhirMappingService ✅         │  Shows: [PID], [SCH], [OBX]
│  - Hl7Service ✅                 │  Shows: [ORM^O01], [ACK^O01]
│  Console: [Timestamps] FHIR logs │
└──────────────┬──────────────────┘
               │
               │ HTTP FHIR REST
               │
┌──────────────▼──────────────────┐
│  Eye Clinic Backend (5201)       │  ◄─── TERMINAL 1
│  - FHIR API Endpoints ✅         │  Shows: Patient data sent
│  - FHIR Services ✅              │  Shows: [PID], [SCH] responses
│  Console: [Timestamps] FHIR logs │
└──────────────────────────────────┘
```

---

## 🔍 What You'll See in Each Terminal

### Terminal 1: Eye Clinic (Port 5201)

When Radiology Frontend loads a patient:

```
════════════════════════════════════════════════════════════════════════════════
  EYE CLINIC FHIR/HL7 API SERVICE STARTING
  Environment: Development
  FHIR Segments will be logged to console below
  Integration with Radiology Center enabled
════════════════════════════════════════════════════════════════════════════════

info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5201
      
GET http://localhost:5201/api/Patient/search?query=eman@example.com
→ Returns FHIR Patient Bundle

[PID] Patient segment queried:
{
  "resourceType": "Patient",
  "id": "P-532756",
  "name": [{ "family": "Sallm", "given": ["Eman"] }],
  "birthDate": "1990-05-15",
  "telecom": [
    { "system": "phone", "value": "+20123456789" },
    { "system": "email", "value": "eman@example.com" }
  ]
}

GET http://localhost:5201/api/Appointment?patient=P-532756
→ Returns FHIR Appointment Bundle

[SCH] Schedule segments queried:
[
  {
    "resourceType": "Appointment",
    "id": "APT-001",
    "status": "completed",
    "start": "2026-05-05T13:00:00Z"
  }
]
```

### Terminal 2: Radiology Center (Port 5301)

When patient data is fetched from Clinic:

```
════════════════════════════════════════════════════════════════════════════════
  RADIOLOGY CENTER FHIR/HL7 SERVICE STARTING
  Environment: Development
  FHIR Segments will be logged to console below
  Look for: [PID], [SCH], [OBX], [ORM^O01], [ACK^O01]
════════════════════════════════════════════════════════════════════════════════

info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5301

╔════════════════════════════════════════════════════════════════╗
║ FHIR BUNDLE RECEIVED - 1 Entries
║ Timestamp: 2026-05-06 14:30:40.123
║ Direction: ← IN (Eye Clinic → Radiology Center)
╚════════════════════════════════════════════════════════════════╝

[PID] Patient Identification Segment:
{"resourceType":"Patient","id":"P-532756","name":[{"family":"Sallm","given":["Eman"]}]}

╔════════════════════════════════════════════════════════════════╗
║ [PID] PATIENT IDENTIFICATION SEGMENT - Outgoing
║ Direction: → OUT (Radiology Center → Eye Clinic)
║ Timestamp: 2026-05-06 14:30:46.456
║ Patient ID: P-532756
║ Name: Eman Sallm
╠════════════════════════════════════════════════════════════════╣
║ {"resourceType":"Patient","id":"P-532756","name":[{"family":"Sallm","given":["Eman"]}]}
╚════════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════════════════════════
  HL7 v2.5 ORM^O01 MESSAGE BUILT (Order: ORD-20260506-001)
════════════════════════════════════════════════════════════════════════════════

MSH|^~\&|EYECLINIC|CLINIC|RIS|RADCTR|20260506143045||ORM^O01|MSG20260506143045|P|2.5
PID|1||P-532756^^^EYECLINIC^MR||Sallm^Eman||19900515|F|||Cairo||+20123456789
PV1|1|O|RAD^^^RADCTR||||DR-001
ORC|NW|ORD-20260506-001|||||^^^20260506140000^20260506150000||20260506143045|||DR-001
OBR|1|ORD-20260506-001||eye-xray^Eye X-ray^LN|R||20260506140000||||||||||DR-001

════════════════════════════════════════════════════════════════════════════════

════════════════════════════════════════════════════════════════════════════════
  HL7 SIMULATION MODE — message NOT sent to real RIS
  In production it would be sent to 127.0.0.1:2575 via MLLP
════════════════════════════════════════════════════════════════════════════════

════════════════════════════════════════════════════════════════════════════════
  SIMULATED ACK^O01 RECEIVED FROM RIS
════════════════════════════════════════════════════════════════════════════════

MSH|^~\&|RIS|RADCTR|EYECLINIC|CLINIC|20260506143046||ACK^O01|ACKMSG20260506143045|P|2.5
MSA|AA|MSG20260506143045|Order accepted

════════════════════════════════════════════════════════════════════════════════
```

### Terminal 3: Frontend DevTools Console

When profile loads:

```
═══════════════════════════════════════════════════════════════════════════════
CLINIC → RADIOLOGY SYSTEM INTEGRATION
Using: FHIR/HL7 Healthcare Interoperability Standard
Replacing: Firebase (deprecated for healthcare systems)
═════════════════════════════════════════════════════════════════════════════════

[RADIOLOGY] Fetching patient from Eye Clinic via FHIR...

╔════════════════════════════════════════════════════════════════╗
║ SYSTEM INTEGRATION - 2026-05-06 14:30:40
║ Connection: Eye Clinic ↔ Radiology Center
║ Status: SUCCESS
╚════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════╗
║ FHIR/HL7 SEGMENT LOG - 2026-05-06 14:30:40
║ Direction: ← IN
╠════════════════════════════════════════════════════════════════╣
║ Segment Type: PID
║ System: Eye Clinic → Radiology Center
║ Status: SUCCESS
╠════════════════════════════════════════════════════════════════╣
║ {
║   "patient_id": "P-532756",
║   "mrn": "P-532756",
║   "first_name": "Eman",
║   "last_name": "Sallm",
║   "phone": "+20123456789",
║   "email": "eman@example.com"
║ }
╚════════════════════════════════════════════════════════════════╝

✓ Diagnostic Report sent to Clinic
```

---

## 🔧 Configuration Files Updated

### ✅ Radiology Backend
- **File:** `Modules/RadiologyCenter/Backend/appsettings.json`
- **File:** `Modules/RadiologyCenter/Backend/Program.cs`
- **Services:** FhirMappingService, Hl7Service
- **Segments:** [PID], [SCH], [OBX], [ORM^O01], [ACK^O01]

### ✅ Eye Clinic Backend
- **File:** `Modules/ClinicSystem/Backend/Configuration/appsettings.json`
- **File:** `Modules/ClinicSystem/Backend/Program.cs`
- **Endpoint:** FHIR API endpoints for Patient, Appointment, Observation

### ✅ Radiology Frontend
- **File:** `src/services/fhirIntegrationService.js`
- **File:** `src/services/fhirSegmentLogger.js`
- **Component:** ProfilePage.jsx with FHIR integration

---

## 📋 Logging Configuration Summary

### Log Levels

```json
"Logging": {
  "LogLevel": {
    "Default": "Debug",                              // Show all debug messages
    "Microsoft.AspNetCore": "Information",           // Less verbose for framework
    "RadiologyCenterAPI.Services": "Debug",          // FHIR services verbose
    "EyeClinicAPI.Services": "Debug"                 // Eye Clinic services verbose
  }
}
```

### Console Options

```csharp
{
  "TimestampFormat": "yyyy-MM-dd HH:mm:ss.fff",    // Precise timestamps
  "IncludeScopes": true,                            // Show method context
  "DisableColors": false                            // Color-coded output
}
```

---

## 🎯 Segment Types Reference

| Segment | Type | System | Color | Log |
|---------|------|--------|-------|-----|
| **PID** | Patient ID | Clinic/Radiology | 🟣 | `[PID]` |
| **SCH** | Schedule | Clinic → Radiology | 🟣 | `[SCH]` |
| **OBX** | Observation | Clinic → Radiology | 🟣 | `[OBX]` |
| **ORM^O01** | Order | Radiology → RIS | 🟠 | `[ORM^O01]` |
| **ACK^O01** | Acknowledgement | RIS → Radiology | 🟢 | `[ACK^O01]` |

---

## ✅ Verification Checklist

- [ ] **Terminal 1 (Eye Clinic):**
  - Startup banner appears
  - Port 5201 listening
  - No errors in console

- [ ] **Terminal 2 (Radiology):**
  - Startup banner appears
  - Port 5301 listening
  - FHIR segments logged

- [ ] **Terminal 3 (Frontend):**
  - npm run dev successful
  - Port 5173 running
  - Profile page loads

- [ ] **Integration Test:**
  - Navigate to Radiology Profile
  - Patient data displays
  - Terminal 1: Shows FHIR queries
  - Terminal 2: Shows [PID], [ORM^O01] logs
  - Terminal 3: Shows colored segments

---

## 🧪 Testing Steps

### Step 1: Start All Services
```bash
# Terminal 1
cd Modules/ClinicSystem/Backend && dotnet run

# Terminal 2
cd Modules/RadiologyCenter/Backend && dotnet run

# Terminal 3
cd Modules/RadiologyCenter/Frontend && npm run dev
```

### Step 2: Login to Radiology
1. Go to `http://localhost:5173/radiology`
2. Login with test credentials
3. Navigate to Profile page

### Step 3: Observe Segment Logging

**Expected in Terminal 1 (Eye Clinic):**
```
GET /api/Patient/search?query=eman@example.com
GET /api/Appointment?patient=P-532756
```

**Expected in Terminal 2 (Radiology):**
```
╔════════════════════════════════════════════════════════════════╗
║ FHIR BUNDLE RECEIVED - Entries
║ [PID] Patient segment logged
╚════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════
  HL7 v2.5 ORM^O01 MESSAGE BUILT
═══════════════════════════════════════════════════════════════════
```

**Expected in Terminal 3 (Browser DevTools):**
```
═════════════════════════════════════════
CLINIC → RADIOLOGY SYSTEM INTEGRATION
═════════════════════════════════════════

╔════════════════════════════════════════╗
║ [PID] PATIENT IDENTIFICATION SEGMENT
║ Direction: ← IN
╚════════════════════════════════════════╝
```

---

## 🔍 Troubleshooting

### No FHIR segments in Radiology console?
```bash
# Check log level in appsettings.json
"Default": "Debug"  # Should be Debug, not Information

# Check Program.cs has:
builder.Logging.SetMinimumLevel(LogLevel.Debug);
```

### Eye Clinic not responding?
```bash
# Check if running on correct port
netstat -ano | findstr :5201

# If port taken, stop service
Get-Process -Name dotnet | Stop-Process -Force
```

### Frontend segments not appearing?
```javascript
// Open DevTools → Console
// Should see colored FHIR segments

// If not, check:
console.log('Test'); // Should appear
fhirTests.runAll();  // Run test utility
```

---

## 📈 Performance Notes

### Expected Latency
- FHIR query: 10-50ms
- Patient parsing: 2-5ms
- Segment logging: 1-2ms
- **Total:** 20-60ms per patient load

### Console Overhead
- Logging adds minimal overhead
- Safe to use in production with `"Default": "Information"`
- Can disable with log level config

---

## 🚀 Production Considerations

### For Production Deployment

Change log levels:
```json
"Logging": {
  "LogLevel": {
    "Default": "Information",                    // Less verbose
    "RadiologyCenterAPI.Services": "Information" // Only important events
  }
}
```

Result: Only shows:
- ✅ System startup
- ✅ Errors and warnings
- ✅ Important events
- ❌ Debug details

---

## 📚 Related Documentation

- `RadiologyCenter/FHIR_INTEGRATION_GUIDE.md` - Full FHIR architecture
- `RadiologyCenter/FIREBASE_TO_FHIR_MIGRATION.md` - Migration details
- `RadiologyCenter/Backend/FHIR_HL7_LOGGING_GUIDE.md` - Backend logging details
- `RadiologyCenter/FHIR_QUICK_START.md` - Quick developer reference

---

## 🎉 Success Indicators

You've successfully configured FHIR/HL7 logging when you see:

1. ✅ **Terminal 1 (Eye Clinic):**
   ```
   ════════════════════════════════════════════════════════════════════════════════
     EYE CLINIC FHIR/HL7 API SERVICE STARTING
   ════════════════════════════════════════════════════════════════════════════════
   ```

2. ✅ **Terminal 2 (Radiology):**
   ```
   ╔════════════════════════════════════════════════════════════════╗
   ║ [PID] PATIENT IDENTIFICATION SEGMENT
   ║ Direction: ← IN (Eye Clinic → Radiology Center)
   ╚════════════════════════════════════════════════════════════════╝
   ```

3. ✅ **Terminal 3 (Browser Console):**
   ```
   ═════════════════════════════════════════════════════════════════
   CLINIC → RADIOLOGY SYSTEM INTEGRATION
   ═════════════════════════════════════════════════════════════════
   ```

---

**Setup Complete! 🎉**
**FHIR/HL7 logging is now visible across all terminals**
