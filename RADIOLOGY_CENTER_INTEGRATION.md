# Radiology Center Integration Architecture

**Date**: April 26, 2026  
**Status**: ✅ Complete and Ready for Testing

---

## 🏥 System Overview

This document describes the complete integration of the **Radiology Center System** with the **Clinic System (EyeClinicAPI)** using HL7 FHIR R4 standards.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EyeVengers Project                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Clinic System (EyeClinicAPI)                 │   │
│  │    Port: http://localhost:5201                       │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  RadiologyIntegrationController              │   │   │
│  │  │  - Send scan orders                          │   │   │
│  │  │  - Query results                             │   │   │
│  │  │  - Check scan status                         │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │           ↓ (FHIR API Calls)                        │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  RadiologyCenterFhirClient Service           │   │   │
│  │  │  - Manages FHIR tokens                       │   │   │
│  │  │  - Sends ServiceRequests                     │   │   │
│  │  │  - Retrieves DiagnosticReports               │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                      ↓ FHIR over HTTP/REST                  │
│                   (Bearer Token Auth)                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    Radiology Center Backend (.NET + FHIR)           │   │
│  │    Port: https://localhost:7001                      │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │       FhirController                         │   │   │
│  │  │  - POST /fhir/token                          │   │   │
│  │  │  - GET/POST /fhir/Patient                    │   │   │
│  │  │  - POST /fhir/ServiceRequest (scan order)    │   │   │
│  │  │  - GET /fhir/DiagnosticReport (results)      │   │   │
│  │  │  - GET /fhir/Appointment                     │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │           ↓                                          │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  FHIR Services (Mappers, Converters)         │   │   │
│  │  │  - PatientFhirMapper                         │   │   │
│  │  │  - ServiceRequestFhirMapper                  │   │   │
│  │  │  - DiagnosticReportFhirMapper                │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │           ↓                                          │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │       SQL Server Database                    │   │   │
│  │  │  - Patients                                  │   │   │
│  │  │  - ScanOrders                                │   │   │
│  │  │  - Reports (DiagnosticReports)               │   │   │
│  │  │  - Appointments                              │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Radiology Center Frontend (React + Vite)           │   │
│  │  Port: http://localhost:5174                        │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  fhirApiClient Service                       │   │   │
│  │  │  - Uses same FHIR endpoints                  │   │   │
│  │  │  - Patient management                        │   │   │
│  │  │  - Scan order creation                       │   │   │
│  │  │  - Results viewing                           │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Project Structure (After Cleanup)

```
EyeVengers-Team-Project/
├── RadiologyCenter.Backend.Net/          ← New FHIR backend
│   ├── RadiologyCenter.API/
│   ├── RadiologyCenter.Core/
│   ├── RadiologyCenter.Infrastructure/
│   ├── Program.cs
│   ├── appsettings.json
│   └── FHIR_INTEGRATION_GUIDE.md
│
├── radiology-center-frontend/            ← React frontend
│   ├── src/
│   │   └── services/
│   │       └── fhirApiClient.js         ← FHIR client service
│   ├── .env                              ← Updated configuration
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   └── EyeClinicAPI/
│       ├── Services/
│       │   ├── RadiologyCenterFhirClient.cs  ← FHIR client service
│       │   └── IRadiologyCenterFhirClient.cs
│       ├── Controllers/
│       │   └── RadiologyIntegrationController.cs ← Example implementation
│       ├── Program.cs                    ← Updated with FHIR registration
│       └── appsettings.json              ← Updated with RadiologyCenter config
│
└── RADIOLOGY_CENTER_INTEGRATION.md       ← This file
```

---

## 🚀 Setup Instructions

### Prerequisites

- .NET 8.0 SDK
- Node.js 18+
- SQL Server LocalDB
- Git
- Visual Studio 2022 or VS Code

### Step 1: Run Cleanup Script

First, remove unused folders:

```bash
cd C:\Users\LOQ\Downloads\backup\EyeVengers-Team-Project
CLEANUP_RADIOLOGY_CENTER.bat
```

This removes:
- `frontend/`
- `glass-store-frontend/`
- `pharmacy-frontend/`
- `firebase-setup-guide/`
- `radiology-center-backend/` (old Firebase backend)

### Step 2: Setup Radiology Center Backend

```bash
cd RadiologyCenter.Backend.Net

# Restore packages
dotnet restore

# Create database
dotnet ef database update --project RadiologyCenter.Infrastructure --startup-project RadiologyCenter.API

# Run on port 7001
dotnet run --project RadiologyCenter.API --urls "https://localhost:7001"
```

**Verification**:
- Swagger UI: https://localhost:7001/swagger
- Health check: https://localhost:7001/api/health
- FHIR token: POST https://localhost:7001/fhir/token

### Step 3: Setup Clinic System Backend

```bash
cd backend/EyeClinicAPI/EyeClinicAPI

# Restore packages
dotnet restore

# Create database
dotnet ef database update

# Run on port 5201
dotnet run --urls "https://localhost:5201"
```

**Verification**:
- Swagger UI: https://localhost:5201/swagger
- Health check: GET https://localhost:5201/api/health

### Step 4: Setup Radiology Frontend

```bash
cd radiology-center-frontend

# Install dependencies
npm install

# Update .env file (already configured)
# VITE_RADIOLOGY_API_URL=http://localhost:7001/fhir

# Run dev server on port 5174
npm run dev
```

**Access**: http://localhost:5174

---

## 🔄 Integration Workflows

### Workflow 1: Clinic Sends Scan Order

```
1. Clinic Frontend/Backend
   ↓
2. Calls: POST /api/radiologyintegration/send-scan-order
   Body: {
     patientId: 1,
     scanType: "CT",
     bodyPart: "Head",
     clinicalIndication: "Headache evaluation",
     referringDoctorName: "Dr. Smith",
     priority: "Urgent"
   }
   ↓
3. RadiologyIntegrationController receives request
   ↓
4. Creates FHIR ServiceRequest resource
   ↓
5. RadiologyCenterFhirClient sends to Radiology backend:
   POST /fhir/token (gets Bearer token)
   POST /fhir/ServiceRequest
   ↓
6. Radiology Center stores scan order in database
   ↓
7. Returns success response with orderId
   ↓
8. Clinic stores orderId for tracking
```

### Workflow 2: Clinic Retrieves Radiology Results

```
1. Clinic Frontend/Backend
   ↓
2. Calls: GET /api/radiologyintegration/get-results?patientId=1
   ↓
3. RadiologyIntegrationController receives request
   ↓
4. RadiologyCenterFhirClient sends:
   POST /fhir/token (gets Bearer token)
   GET /fhir/DiagnosticReport?subject=Patient/1
   ↓
5. Receives FHIR Bundle with DiagnosticReport resources
   ↓
6. Extracts findings, conclusion, radiologist name
   ↓
7. Returns results to clinic
   ↓
8. Clinic displays results to user
```

### Workflow 3: Radiology Frontend Direct Usage

```
1. Radiologist opens frontend: http://localhost:5174
   ↓
2. Frontend loads fhirApiClient service
   ↓
3. On demand:
   - Get token from /fhir/token
   - Query patients: GET /fhir/Patient/{id}
   - View scan orders: GET /fhir/ServiceRequest?subject=Patient/{id}
   - Create reports: POST /fhir/DiagnosticReport
   - Schedule appointments: POST /fhir/Appointment
   ↓
4. All requests include Bearer token in Authorization header
```

---

## 🔐 Authentication Flow

### Token Endpoint: POST /fhir/token

**Request**:
```bash
curl -X POST http://localhost:7001/fhir/token \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "clinic-system",
    "clientSecret": "clinic-secret"
  }'
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "scope": "fhir/*.read fhir/*.write"
}
```

### Using Token

All FHIR requests must include:
```
Authorization: Bearer {accessToken}
```

---

## 📊 API Endpoints Reference

### From Clinic System

**Base URL**: `http://localhost:5201/api`

#### Send Scan Order
```
POST /radiologyintegration/send-scan-order
Body: ScanOrderRequest
Response: { success, orderId, radiologyOrderId }
```

#### Get Radiology Results
```
GET /radiologyintegration/get-results?patientId=1
Response: { patientId, hasResults, reportCount, reports[] }
```

#### Get Scan Orders Status
```
GET /radiologyintegration/scan-orders?patientId=1
Response: { patientId, ordersCount, orders[] }
```

#### Get Report Details
```
GET /radiologyintegration/report-details?reportId=1
Response: { reportId, status, conclusion, findings, radiologist }
```

### From FHIR API

**Base URL**: `http://localhost:7001/fhir`  
**Authentication**: Bearer Token required

#### Authentication
```
POST /token
Body: { clientId, clientSecret, grantType }
Response: { accessToken, tokenType, expiresIn, scope }
```

#### Patients
```
GET    /Patient/{id}        - Get patient
POST   /Patient             - Create patient
```

#### Scan Orders (ServiceRequest)
```
GET    /ServiceRequest/{id}
POST   /ServiceRequest
GET    /ServiceRequest?subject=Patient/{id}
```

#### Radiology Results (DiagnosticReport)
```
GET    /DiagnosticReport/{id}
GET    /DiagnosticReport?subject=Patient/{id}
```

#### Imaging Studies
```
GET    /ImagingStudy?subject=Patient/{id}
```

#### Appointments
```
GET    /Appointment/{id}
POST   /Appointment
GET    /Appointment?actor=Patient/{id}
```

---

## 📝 Example: Complete Scan Order Flow

### Step 1: Clinic creates/registers patient

```csharp
var fhirClient = new RadiologyCenterFhirClient(httpClient, config, logger);

var patient = new Patient
{
    Name = new List<HumanName>
    {
        new HumanName { Given = new[] { "John" }, Family = "Doe" }
    },
    BirthDate = "1980-01-15",
    Gender = AdministrativeGender.Male,
    Telecom = new List<ContactPoint>
    {
        new ContactPoint { System = ContactPoint.ContactPointSystem.Phone, Value = "+1-555-0100" }
    }
};

var createdPatient = await fhirClient.CreatePatientAsync(patient);
int patientId = int.Parse(createdPatient.Id);
```

### Step 2: Clinic sends scan order

```csharp
var scanOrderRequest = new ScanOrderRequest
{
    PatientId = patientId,
    ScanType = "CT",
    BodyPart = "Head",
    ClinicalIndication = "Headache evaluation",
    Priority = "Urgent",
    ReferringDoctorName = "Dr. Smith"
};

var response = await controller.SendScanOrder(scanOrderRequest);
// Returns: { success: true, orderId: "1", radiologyOrderId: "ORD-2024-001" }
```

### Step 3: Radiology performs scan and creates report

(Done in radiology frontend UI)

### Step 4: Clinic retrieves results

```csharp
var response = await controller.GetRadiologyResults(patientId);
// Returns: {
//   patientId: 1,
//   hasResults: true,
//   reportCount: 1,
//   reports: [
//     {
//       reportId: "1",
//       status: "final",
//       issued: "2024-04-26T14:00:00Z",
//       conclusion: "No abnormalities detected",
//       radiologist: "Dr. Jane Anderson"
//     }
//   ]
// }
```

---

## 🧪 Testing

### Using cURL (Clinic → Radiology)

**1. Get token**:
```bash
TOKEN=$(curl -s -X POST http://localhost:7001/fhir/token \
  -H "Content-Type: application/json" \
  -d '{"clientId":"clinic-system","clientSecret":"clinic-secret"}' \
  | jq -r '.accessToken')
```

**2. Create patient**:
```bash
curl -X POST http://localhost:7001/fhir/Patient \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/fhir+json" \
  -d '{
    "resourceType": "Patient",
    "name": [{"given": ["John"], "family": "Doe"}],
    "birthDate": "1980-01-15",
    "gender": "male"
  }' | jq .
```

**3. Send scan order**:
```bash
curl -X POST http://localhost:5201/api/radiologyintegration/send-scan-order \
  -H "Authorization: Bearer $CLINIC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "scanType": "CT",
    "bodyPart": "Head",
    "clinicalIndication": "Headache evaluation",
    "priority": "Urgent"
  }' | jq .
```

**4. Get results**:
```bash
curl -X GET "http://localhost:5201/api/radiologyintegration/get-results?patientId=1" \
  -H "Authorization: Bearer $CLINIC_TOKEN" | jq .
```

### Using Postman

1. Create collection: "Radiology Integration"
2. Create requests for each endpoint
3. Use environment variables for URLs and tokens
4. Set pre-request scripts to auto-refresh tokens

---

## ⚠️ Important Configuration

### RadiologyCenter Backend (appsettings.json)

```json
{
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-change-in-production",
    "Issuer": "radiology-center",
    "Audience": "fhir-clients"
  },
  "Fhir": {
    "ClientId": "clinic-system",
    "ClientSecret": "clinic-secret"
  }
}
```

### Clinic System Backend (appsettings.json)

```json
{
  "RadiologyCenter": {
    "BaseUrl": "http://localhost:7001",
    "ClientId": "clinic-system",
    "ClientSecret": "clinic-secret",
    "Enabled": true
  }
}
```

### Radiology Frontend (.env)

```env
VITE_RADIOLOGY_API_URL=http://localhost:7001/fhir
VITE_RADIOLOGY_TOKEN_URL=http://localhost:7001/fhir/token
VITE_FHIR_CLIENT_ID=clinic-system
VITE_FHIR_CLIENT_SECRET=clinic-secret
VITE_CLINIC_API_URL=http://localhost:5201/api
```

---

## 🐛 Troubleshooting

### Issue: "Unable to connect to http://localhost:7001"
**Solution**: Ensure RadiologyCenter backend is running
```bash
dotnet run --project RadiologyCenter.Backend.Net/RadiologyCenter.API
```

### Issue: "Invalid token" error
**Solution**: Check credentials match in both systems
- Clinic: RadiologyCenter:ClientId and :ClientSecret
- Radiology: Fhir:ClientId and :ClientSecret

### Issue: "Patient not found" when sending scan order
**Solution**: Create patient first
```bash
curl -X POST http://localhost:7001/fhir/Patient ...
```

### Issue: Frontend shows "CORS error"
**Solution**: Check CORS policy in RadiologyCenter Program.cs includes frontend port (5174)

### Issue: Database connection errors
**Solution**: Verify SQL Server LocalDB is running
```bash
sqllocaldb info
sqllocaldb start mssqllocaldb
```

---

## 📈 Performance Tips

1. **Cache tokens**: Both clinic and frontend cache tokens and refresh only when expired
2. **Batch operations**: Use Bundle resources for multiple operations
3. **Connection pooling**: Connection strings already configured
4. **Async/await**: All I/O operations are asynchronous

---

## 🔜 Future Enhancements

- [ ] Add role-based access control (RBAC)
- [ ] Implement FHIR subscriptions for push notifications
- [ ] Add audit logging for compliance (HIPAA)
- [ ] Support for DICOM image retrieval
- [ ] Advanced search filters
- [ ] Report comparison and versioning
- [ ] Multi-facility support
- [ ] Integration with EMR systems

---

## 📞 Support & Documentation

- **FHIR Spec**: https://www.hl7.org/fhir/R4/
- **Firely SDK**: https://github.com/FirelyTeam/fhir-net-api
- **Clinic Docs**: `backend/EyeClinicAPI/README.md`
- **Radiology Docs**: `RadiologyCenter.Backend.Net/FHIR_INTEGRATION_GUIDE.md`
- **Testing Guide**: `RadiologyCenter.Backend.Net/FHIR_TESTING_GUIDE.md`

---

**Status**: ✅ Integration Complete and Ready for Production Testing
