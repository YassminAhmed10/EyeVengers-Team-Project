# Backend FHIR/HL7 Logging Guide
## Radiology Center API - Console Output Configuration

**Environment:** ASP.NET Core 8.0
**Standard:** FHIR R4 + HL7 v2.5
**Logging:** Console + Debug Output
**Date:** May 2026

---

## Quick Start

### Run Backend with FHIR Segment Logging

```bash
# From: Modules/RadiologyCenter/Backend/

dotnet run
# or with verbose output:
dotnet run --verbosity detailed
```

**Expected Console Output:**
```
═══════════════════════════════════════════════════════════════════════════════
  RADIOLOGY CENTER FHIR/HL7 SERVICE STARTING
  Environment: Development
  FHIR Segments will be logged to console below
  Look for: [PID], [SCH], [OBX], [ORM^O01], [ACK^O01]
═══════════════════════════════════════════════════════════════════════════════
```

---

## Configuration Files

### appsettings.json
**Location:** `RadiologyCenter/Backend/appsettings.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information",
      "RadiologyCenterAPI.Services.FhirMappingService": "Debug",
      "RadiologyCenterAPI.Services.Hl7Service": "Debug"
    },
    "Console": {
      "IncludeScopes": true,
      "TimestampFormat": "yyyy-MM-dd HH:mm:ss.fff"
    }
  }
}
```

**Key Settings:**
- ✅ `FhirMappingService`: Debug level → Logs FHIR segments
- ✅ `Hl7Service`: Debug level → Logs HL7 messages
- ✅ `Console.IncludeScopes`: true → Shows method context
- ✅ `Console.TimestampFormat`: Includes milliseconds for precision

---

## Program.cs Configuration

### Logging Setup
```csharp
// Clear default providers and add console logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Logging.SetMinimumLevel(LogLevel.Debug);

// Custom log formatter for FHIR/HL7 segments
builder.Services.Configure<ConsoleLoggerOptions>(options =>
{
    options.TimestampFormat = "yyyy-MM-dd HH:mm:ss.fff zzz";
    options.UseUtcTimestamp = false;
    options.IncludeScopes = true;
    options.DisableColors = false; // Enable colored output
});
```

### Startup Banner
```csharp
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("\n" + new string('═', 80));
logger.LogInformation("  RADIOLOGY CENTER FHIR/HL7 SERVICE STARTING");
logger.LogInformation("  Environment: {Environment}", app.Environment.EnvironmentName);
logger.LogInformation("  FHIR Segments will be logged to console below");
logger.LogInformation("  Look for: [PID], [SCH], [OBX], [ORM^O01], [ACK^O01]");
logger.LogInformation(new string('═', 80) + "\n");
```

---

## FHIR/HL7 Segments Logged

### 1. PID (Patient Identification Segment)

**When:** Patient record is processed
**Direction:** Radiology Center → Eye Clinic (→ OUT)
**Logger:** `FhirMappingService.PatientToFhir()`

**Example Console Output:**
```
╔════════════════════════════════════════════════════════════════╗
║ [PID] PATIENT IDENTIFICATION SEGMENT - Outgoing
║ Direction: → OUT (Radiology Center → Eye Clinic)
║ Timestamp: 2026-05-06 14:30:45.123
╠════════════════════════════════════════════════════════════════╣
║ Patient ID: P-532756
║ Name: Eman Sallm
║ {"resourceType":"Patient","id":"P-532756","name":[{"family":"Sallm","given":["Eman"]}]}
╚════════════════════════════════════════════════════════════════╝
```

---

### 2. SCH (Schedule/Appointment Segment)

**When:** Appointment is created/updated
**Direction:** Radiology Center → Eye Clinic (→ OUT)
**Logger:** `FhirMappingService.AppointmentToFhir()`

**Example Console Output:**
```
╔════════════════════════════════════════════════════════════════╗
║ [SCH] APPOINTMENT/SCHEDULE SEGMENT - Outgoing
║ Direction: → OUT (Radiology Center → Eye Clinic)
║ Timestamp: 2026-05-06 14:30:46.456
╠════════════════════════════════════════════════════════════════╣
║ {"resourceType":"Appointment","id":"1","status":"booked","priority":"routine","participant":[{"actor":{"reference":"Patient/P-532756"},"status":"accepted"}],"start":"2026-05-06T14:00:00.0000000","end":"2026-05-06T15:00:00.0000000"}
╚════════════════════════════════════════════════════════════════╝
```

---

### 3. OBR (Observation Request Segment)

**When:** FHIR Bundle received from Eye Clinic
**Direction:** Eye Clinic → Radiology Center (← IN)
**Logger:** `FhirMappingService.BundleToInternal()`

**Example Console Output:**
```
╔════════════════════════════════════════════════════════════════╗
║ FHIR BUNDLE RECEIVED - 3 Entries
║ Timestamp: 2026-05-06 14:30:40.123
║ Direction: ← IN (Eye Clinic → Radiology Center)
╚════════════════════════════════════════════════════════════════╝

[OBR] Service Request Segment:
{"resourceType":"ServiceRequest","id":"SR-001","code":{"coding":[{"code":"eye-xray","display":"Eye X-ray"}]},"priority":"routine"}

[SCH] Appointment Schedule Segment:
{"resourceType":"Appointment","id":"APT-001","start":"2026-05-06T14:00:00Z","end":"2026-05-06T15:00:00Z"}

[PID] Patient Identification Segment:
{"resourceType":"Patient","id":"P-532756","name":[{"family":"Sallm","given":["Eman"]}]}
```

---

### 4. ORM^O01 (Order Message)

**When:** HL7 Order Message is built
**Direction:** Radiology Center → RIS (Radiology Information System)
**Logger:** `Hl7Service.BuildOrmO01()`

**Example Console Output:**
```
═══════════════════════════════════════════════════════════════════════════════
  HL7 v2.5 ORM^O01 MESSAGE BUILT (Order: ORD-20260506-001)
═══════════════════════════════════════════════════════════════════════════════

MSH|^~\&|EYECLINIC|CLINIC|RIS|RADCTR|20260506143045||ORM^O01|MSG20260506143045|P|2.5
PID|1||P-532756^^^EYECLINIC^MR||Sallm^Eman||19900515|F|||Cairo||+20123456789
PV1|1|O|RAD^^^RADCTR||||DR-001
ORC|NW|ORD-20260506-001|||||^^^20260506140000^20260506150000||20260506143045|||DR-001
OBR|1|ORD-20260506-001||eye-xray^Eye X-ray^LN|R||20260506140000||||||Eye examination notes||||DR-001

═══════════════════════════════════════════════════════════════════════════════
```

---

### 5. ACK^O01 (Acknowledgement)

**When:** ACK received from RIS or simulated
**Direction:** RIS → Radiology Center (← IN)
**Logger:** `Hl7Service.SendAsync()`

**Example Console Output:**
```
═══════════════════════════════════════════════════════════════════════════════
  HL7 SIMULATION MODE — message NOT sent to real RIS
  In production it would be sent to 127.0.0.1:2575 via MLLP
═══════════════════════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════════════════════
  SIMULATED ACK^O01 RECEIVED FROM RIS
═══════════════════════════════════════════════════════════════════════════════

MSH|^~\&|RIS|RADCTR|EYECLINIC|CLINIC|20260506143046||ACK^O01|ACKMSG20260506143045|P|2.5
MSA|AA|MSG20260506143045|Order accepted

═══════════════════════════════════════════════════════════════════════════════
```

---

## Logging Levels

### Debug (Most Detailed)
```
[DBG] Detailed FHIR resource parsing
[DBG] Segment field mappings
[DBG] JSON serialization output
```

### Information (Important Events)
```
[INF] FHIR Bundle received
[INF] Segment created/transmitted
[INF] Connection events
```

### Warning (Issues)
```
[WRN] Missing optional fields
[WRN] Timeout approaching
```

### Error (Failures)
```
[ERR] Invalid FHIR resource
[ERR] Connection refused
[ERR] Parsing failure
```

---

## Live Example: Full Request Flow

### Step 1: Frontend sends patient data
```
Frontend → Backend POST /api/appointment
```

### Step 2: Backend receives and logs FHIR Bundle
```
╔════════════════════════════════════════════════════════════════╗
║ FHIR BUNDLE RECEIVED - 3 Entries
║ Direction: ← IN (Eye Clinic → Radiology Center)
╚════════════════════════════════════════════════════════════════╝

[PID] Patient: P-532756 - Eman Sallm
[SCH] Appointment: APT-001 - 2026-05-06 14:00
[OBR] Service: Eye X-ray - Routine
```

### Step 3: Backend processes and logs FHIR conversion
```
╔════════════════════════════════════════════════════════════════╗
║ [PID] PATIENT IDENTIFICATION SEGMENT - Outgoing
║ Direction: → OUT (Radiology Center → Eye Clinic)
║ Patient ID: P-532756
║ Name: Eman Sallm
╚════════════════════════════════════════════════════════════════╝
```

### Step 4: Backend builds HL7 message
```
═══════════════════════════════════════════════════════════════════
  HL7 v2.5 ORM^O01 MESSAGE BUILT
═══════════════════════════════════════════════════════════════════

MSH|^~\&|...
PID|1||P-532756^^^EYECLINIC^MR||Sallm^Eman||...
ORC|NW|ORD-001|...
OBR|1|ORD-001||eye-xray^Eye X-ray^LN|R||...

═══════════════════════════════════════════════════════════════════
```

### Step 5: Backend receives ACK
```
═══════════════════════════════════════════════════════════════════
  SIMULATED ACK^O01 RECEIVED FROM RIS
═══════════════════════════════════════════════════════════════════

MSH|^~\&|RIS|RADCTR|...
MSA|AA|ORD-001|Order accepted

═══════════════════════════════════════════════════════════════════
```

---

## Troubleshooting

### Q: No FHIR segments appearing in console?
**A:** Check these steps:
1. Verify `appsettings.json` has `"Default": "Debug"`
2. Check that FhirMappingService is registered in Program.cs
3. Verify method is actually being called (add breakpoint)
4. Check if output is being redirected to another logger

### Q: HL7 message not showing?
**A:** Verify:
1. `Hl7Service` is registered in Program.cs
2. `IHL7Service.SendAsync()` is actually called
3. Simulation mode is enabled (`"Simulate": "true"` in appsettings.json)
4. RIS timeout not being hit

### Q: Colors not showing?
**A:** Check:
1. Terminal supports ANSI colors
2. `DisableColors: false` in ConsoleLoggerOptions
3. Try upgrading .NET or using different terminal

---

## Performance Considerations

### Logging Overhead
- FHIR segment logging: ~1-2ms per segment
- HL7 message logging: ~0.5-1ms per message
- Acceptable for development/debugging
- Can disable in production with: `"Default": "Information"`

### Large Batch Operations
For bulk imports, consider:
```csharp
// Disable verbose logging temporarily
if (!isProductionMode)
{
    _logger.LogInformation("Processing {Count} records", batchSize);
}
```

---

## Console Logger Options

### Recommended for FHIR/HL7

```csharp
builder.Services.Configure<ConsoleLoggerOptions>(options =>
{
    // Show full timestamp with timezone
    options.TimestampFormat = "yyyy-MM-dd HH:mm:ss.fff zzz";
    
    // Use local timezone (not UTC)
    options.UseUtcTimestamp = false;
    
    // Show which method logged the message
    options.IncludeScopes = true;
    
    // Enable colors (red for errors, yellow for warnings, etc.)
    options.DisableColors = false;
});
```

---

## Integration with Eye Clinic Frontend

### What Frontend Should See in Browser Console

When Radiology ProfilePage loads:

1. **System Integration Header**
```
═══════════════════════════════════════════════════════════════════
CLINIC → RADIOLOGY SYSTEM INTEGRATION
Using: FHIR/HL7 Healthcare Interoperability Standard
═══════════════════════════════════════════════════════════════════
```

2. **FHIR Segment Logs**
```
╔════════════════════════════════════════════════════════════════╗
║ [PID] PATIENT IDENTIFICATION SEGMENT
║ Direction: ← IN (Eye Clinic → Radiology Center)
║ Patient: P-532756 - Eman Sallm
╚════════════════════════════════════════════════════════════════╝
```

3. **Connection Status**
```
✅ Connection: Eye Clinic ↔ Radiology Center
✅ Status: SUCCESS
```

---

## Testing Segments

### Manual Test via PowerShell

```powershell
# Test FHIR Mapping Service
$payload = @{
    entry = @(
        @{
            resource = @{
                resourceType = "Patient"
                id = "P-532756"
                name = @(@{ family = "Sallm"; given = @("Eman") })
            }
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri "http://localhost:5301/api/fhir/validate" `
    -Method POST `
    -Body $payload `
    -ContentType "application/json"
```

**Expected Console Output:**
```
╔════════════════════════════════════════════════════════════════╗
║ FHIR BUNDLE RECEIVED - 1 Entries
║ Direction: ← IN
║ [PID] Patient: P-532756 - Eman Sallm
╚════════════════════════════════════════════════════════════════╝
```

---

## Next Steps

1. ✅ Run `dotnet run` and verify startup banner appears
2. ✅ Access API endpoints and watch segments appear
3. ✅ Navigate to Radiology Profile in frontend
4. ✅ Check browser console for colored segment logs
5. ✅ Verify Eye Clinic → Radiology data flow

---

**Configuration Complete!** 🎉
**FHIR/HL7 segments now visible in backend console**
