# Radiology Center: Complete API Reference

**Document Version**: 1.0  
**Last Updated**: April 26, 2026  
**Status**: ✅ Production Ready

---

## 📚 Table of Contents

1. [Authentication](#authentication)
2. [Radiology Backend (FHIR API)](#radiology-backend-fhir-api)
3. [Clinic Integration Endpoints](#clinic-integration-endpoints)
4. [Error Responses](#error-responses)
5. [Request/Response Examples](#request--response-examples)

---

## 🔐 Authentication

### Endpoint: GET Token

**Purpose**: Obtain a JWT Bearer token for FHIR API access

**URL**: `http://localhost:7001/fhir/token`  
**Method**: `POST`  
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "clientId": "clinic-system",
  "clientSecret": "clinic-secret"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbGluaWMtc3lzdGVtIiwib2lkYyI6ImZoaXItY2xpZW50cyIsImV4cCI6MTcxNDA4NzcwOX0.OXKdZb2R...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "scope": "fhir/*.read fhir/*.write"
}
```

**Token Expiration**: 1 hour (3600 seconds)  
**Refresh Strategy**: Cache tokens and request new one before expiration

**Error Response** (401 Unauthorized):
```json
{
  "error": "invalid_client",
  "error_description": "Invalid client credentials"
}
```

---

## 🏥 Radiology Backend (FHIR API)

### Base URL: `http://localhost:7001/fhir`

All requests require `Authorization: Bearer {accessToken}` header.

---

### 👤 Patient Resource

#### 1. Get Patient by ID

**URL**: `/fhir/Patient/{id}`  
**Method**: `GET`

**Request**:
```bash
GET /fhir/Patient/1 HTTP/1.1
Authorization: Bearer {accessToken}
Accept: application/fhir+json
```

**Response** (200 OK):
```json
{
  "resourceType": "Patient",
  "id": "1",
  "meta": {
    "lastUpdated": "2024-04-26T14:00:00Z"
  },
  "name": [
    {
      "use": "official",
      "family": "Doe",
      "given": ["John"]
    }
  ],
  "birthDate": "1980-01-15",
  "gender": "male",
  "contact": [
    {
      "relationship": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v2-0131",
              "code": "C"
            }
          ]
        }
      ],
      "name": {
        "family": "Doe",
        "given": ["Jane"]
      },
      "telecom": [
        {
          "system": "phone",
          "value": "+1-555-0101"
        }
      ]
    }
  ]
}
```

#### 2. Create Patient

**URL**: `/fhir/Patient`  
**Method**: `POST`

**Request**:
```bash
POST /fhir/Patient HTTP/1.1
Authorization: Bearer {accessToken}
Content-Type: application/fhir+json

{
  "resourceType": "Patient",
  "name": [
    {
      "family": "Smith",
      "given": ["Jane"]
    }
  ],
  "birthDate": "1985-06-20",
  "gender": "female",
  "contact": [
    {
      "name": {
        "family": "Smith",
        "given": ["John"]
      },
      "telecom": [
        {
          "system": "phone",
          "value": "+1-555-0102"
        }
      ]
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "resourceType": "Patient",
  "id": "2",
  "name": [
    {
      "family": "Smith",
      "given": ["Jane"]
    }
  ],
  "birthDate": "1985-06-20",
  "gender": "female"
}
```

#### 3. Search Patients

**URL**: `/fhir/Patient?name={searchTerm}`  
**Method**: `GET`

**Request**:
```bash
GET /fhir/Patient?name=Smith&birthdate=1985 HTTP/1.1
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 1,
  "entry": [
    {
      "fullUrl": "http://localhost:7001/fhir/Patient/2",
      "resource": {
        "resourceType": "Patient",
        "id": "2",
        "name": [{"family": "Smith", "given": ["Jane"]}]
      }
    }
  ]
}
```

---

### 📋 ServiceRequest Resource (Scan Orders)

#### 1. Create Scan Order

**URL**: `/fhir/ServiceRequest`  
**Method**: `POST`

**Request**:
```bash
POST /fhir/ServiceRequest HTTP/1.1
Authorization: Bearer {accessToken}
Content-Type: application/fhir+json

{
  "resourceType": "ServiceRequest",
  "status": "active",
  "intent": "order",
  "subject": {
    "reference": "Patient/1"
  },
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "71046-4",
        "display": "Head CT"
      }
    ]
  },
  "orderDetail": [
    {
      "text": "Evaluate for acute intracranial abnormalities"
    }
  ],
  "requester": {
    "display": "Dr. Smith"
  },
  "priority": "urgent"
}
```

**Response** (201 Created):
```json
{
  "resourceType": "ServiceRequest",
  "id": "SR-1001",
  "status": "active",
  "subject": {
    "reference": "Patient/1"
  },
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "71046-4",
        "display": "Head CT"
      }
    ]
  }
}
```

#### 2. Get Scan Order

**URL**: `/fhir/ServiceRequest/{id}`  
**Method**: `GET`

**Request**:
```bash
GET /fhir/ServiceRequest/SR-1001 HTTP/1.1
Authorization: Bearer {accessToken}
```

#### 3. Search Scan Orders by Patient

**URL**: `/fhir/ServiceRequest?subject=Patient/{patientId}`  
**Method**: `GET`

**Request**:
```bash
GET /fhir/ServiceRequest?subject=Patient/1&status=active HTTP/1.1
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 3,
  "entry": [
    {
      "resource": {
        "resourceType": "ServiceRequest",
        "id": "SR-1001",
        "status": "active",
        "subject": {"reference": "Patient/1"}
      }
    },
    {
      "resource": {
        "resourceType": "ServiceRequest",
        "id": "SR-1002",
        "status": "active",
        "subject": {"reference": "Patient/1"}
      }
    }
  ]
}
```

---

### 📄 DiagnosticReport Resource (Radiology Results)

#### 1. Create Diagnostic Report

**URL**: `/fhir/DiagnosticReport`  
**Method**: `POST`

**Request**:
```bash
POST /fhir/DiagnosticReport HTTP/1.1
Authorization: Bearer {accessToken}
Content-Type: application/fhir+json

{
  "resourceType": "DiagnosticReport",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/v2-0074",
          "code": "RAD",
          "display": "Radiology"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "71046-4",
        "display": "Head CT"
      }
    ]
  },
  "subject": {
    "reference": "Patient/1"
  },
  "issued": "2024-04-26T14:30:00Z",
  "performer": [
    {
      "display": "Dr. Jane Anderson"
    }
  ],
  "conclusion": "No acute intracranial abnormality",
  "conclusionCode": [
    {
      "coding": [
        {
          "system": "http://snomed.info/sct",
          "code": "3025009",
          "display": "Normal"
        }
      ]
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "resourceType": "DiagnosticReport",
  "id": "DR-2001",
  "status": "final",
  "subject": {"reference": "Patient/1"},
  "conclusion": "No acute intracranial abnormality",
  "issued": "2024-04-26T14:30:00Z"
}
```

#### 2. Get Diagnostic Report

**URL**: `/fhir/DiagnosticReport/{id}`  
**Method**: `GET`

**Request**:
```bash
GET /fhir/DiagnosticReport/DR-2001 HTTP/1.1
Authorization: Bearer {accessToken}
```

#### 3. Search Diagnostic Reports by Patient

**URL**: `/fhir/DiagnosticReport?subject=Patient/{patientId}`  
**Method**: `GET`

**Request**:
```bash
GET /fhir/DiagnosticReport?subject=Patient/1&status=final HTTP/1.1
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 2,
  "entry": [
    {
      "resource": {
        "resourceType": "DiagnosticReport",
        "id": "DR-2001",
        "status": "final",
        "conclusion": "No acute abnormalities detected"
      }
    },
    {
      "resource": {
        "resourceType": "DiagnosticReport",
        "id": "DR-2002",
        "status": "final",
        "conclusion": "Small lesion in left anterior temporal lobe"
      }
    }
  ]
}
```

---

### 📅 Appointment Resource

#### 1. Create Appointment

**URL**: `/fhir/Appointment`  
**Method**: `POST`

**Request**:
```bash
POST /fhir/Appointment HTTP/1.1
Authorization: Bearer {accessToken}
Content-Type: application/fhir+json

{
  "resourceType": "Appointment",
  "status": "booked",
  "serviceType": [
    {
      "coding": [
        {
          "code": "RADIOLOGY",
          "display": "Radiology"
        }
      ]
    }
  ],
  "participant": [
    {
      "actor": {
        "reference": "Patient/1"
      },
      "required": "required",
      "status": "accepted"
    }
  ],
  "start": "2024-04-28T10:00:00Z",
  "end": "2024-04-28T10:30:00Z",
  "description": "Head CT scan - Follow-up"
}
```

**Response** (201 Created):
```json
{
  "resourceType": "Appointment",
  "id": "APT-3001",
  "status": "booked",
  "start": "2024-04-28T10:00:00Z",
  "end": "2024-04-28T10:30:00Z"
}
```

#### 2. Get Appointment

**URL**: `/fhir/Appointment/{id}`  
**Method**: `GET`

#### 3. Search Appointments by Patient

**URL**: `/fhir/Appointment?actor=Patient/{patientId}`  
**Method**: `GET`

---

### 🔬 ImagingStudy Resource

#### 1. Get Imaging Study

**URL**: `/fhir/ImagingStudy/{id}`  
**Method**: `GET`

#### 2. Search by Patient

**URL**: `/fhir/ImagingStudy?subject=Patient/{patientId}`  
**Method**: `GET`

---

## 🔗 Clinic Integration Endpoints

### Base URL: `http://localhost:5201/api`

These endpoints are provided by the clinic system for sending orders to and retrieving results from the radiology center.

---

### 📤 Send Scan Order to Radiology

**URL**: `/radiologyintegration/send-scan-order`  
**Method**: `POST`  
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "patientId": 1,
  "scanType": "CT",
  "bodyPart": "Head",
  "clinicalIndication": "Headache evaluation",
  "referringDoctorName": "Dr. Smith",
  "priority": "Urgent",
  "notes": "Patient allergic to iodine contrast"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "orderId": "1",
  "radiologyOrderId": "ORD-2024-001",
  "message": "Scan order sent to Radiology Center successfully",
  "estimatedCompletionTime": "2024-04-27T14:00:00Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Patient not found in Radiology Center",
  "details": "Please ensure patient is registered first"
}
```

---

### 📥 Get Radiology Results

**URL**: `/radiologyintegration/get-results?patientId={patientId}`  
**Method**: `GET`

**Request**:
```bash
GET /radiologyintegration/get-results?patientId=1 HTTP/1.1
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "patientId": 1,
  "hasResults": true,
  "reportCount": 2,
  "reports": [
    {
      "reportId": "DR-2001",
      "status": "final",
      "scanType": "CT",
      "bodyPart": "Head",
      "issued": "2024-04-26T14:30:00Z",
      "conclusion": "No acute intracranial abnormality",
      "findings": "Normal brain parenchyma and ventricles. No mass effect or midline shift.",
      "radiologist": "Dr. Jane Anderson",
      "viewUrl": "/api/radiologyintegration/report-details?reportId=DR-2001"
    },
    {
      "reportId": "DR-2002",
      "status": "final",
      "scanType": "MRI",
      "bodyPart": "Brain",
      "issued": "2024-04-25T10:00:00Z",
      "conclusion": "Small focus of T2 hyperintensity",
      "findings": "Small non-specific focus of T2 hyperintensity in the left subcortical white matter",
      "radiologist": "Dr. Robert Chen",
      "viewUrl": "/api/radiologyintegration/report-details?reportId=DR-2002"
    }
  ]
}
```

---

### 📋 Get Scan Orders Status

**URL**: `/radiologyintegration/scan-orders?patientId={patientId}`  
**Method**: `GET`

**Response** (200 OK):
```json
{
  "patientId": 1,
  "ordersCount": 3,
  "orders": [
    {
      "orderId": "ORD-2024-001",
      "status": "completed",
      "scanType": "CT",
      "bodyPart": "Head",
      "createdDate": "2024-04-26T08:00:00Z",
      "priority": "Urgent",
      "referringDoctor": "Dr. Smith",
      "resultAvailable": true
    },
    {
      "orderId": "ORD-2024-002",
      "status": "in-progress",
      "scanType": "MRI",
      "bodyPart": "Spine",
      "createdDate": "2024-04-26T09:30:00Z",
      "priority": "Normal",
      "referringDoctor": "Dr. Johnson",
      "resultAvailable": false
    }
  ]
}
```

---

### 📄 Get Report Details

**URL**: `/radiologyintegration/report-details?reportId={reportId}`  
**Method**: `GET`

**Response** (200 OK):
```json
{
  "reportId": "DR-2001",
  "status": "final",
  "scanType": "CT",
  "bodyPart": "Head",
  "patientId": 1,
  "issued": "2024-04-26T14:30:00Z",
  "radiologist": "Dr. Jane Anderson",
  "conclusion": "No acute intracranial abnormality",
  "findings": "Normal brain parenchyma and ventricles. No mass effect or midline shift. Cerebral peduncles and brainstem normal. Fourth ventricle unremarkable.",
  "impression": "No acute intracranial abnormality.",
  "recommendations": "Clinical correlation recommended.",
  "precedingStudies": "Previous CT head from 2024-01-15 for comparison - unchanged",
  "technique": "Helical CT of the head was obtained without IV contrast",
  "downloadUrl": "/api/radiologyintegration/download-report?reportId=DR-2001"
}
```

---

## ❌ Error Responses

All error responses follow the FHIR OperationOutcome format.

### 400 Bad Request

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "invalid",
      "diagnostics": "Patient ID must be a valid integer"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "security",
      "diagnostics": "Invalid or expired token"
    }
  ]
}
```

### 404 Not Found

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "not-found",
      "diagnostics": "Patient with ID 999 not found"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "exception",
      "diagnostics": "An unexpected error occurred. Please contact support."
    }
  ]
}
```

---

## 💡 Request / Response Examples

### Example 1: Complete Scan Order Flow

#### Step 1: Create Patient

```bash
TOKEN=$(curl -s -X POST http://localhost:7001/fhir/token \
  -H "Content-Type: application/json" \
  -d '{"clientId":"clinic-system","clientSecret":"clinic-secret"}' \
  | jq -r '.accessToken')

curl -X POST http://localhost:7001/fhir/Patient \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/fhir+json" \
  -d '{
    "resourceType": "Patient",
    "name": [{"family": "Brown", "given": ["Michael"]}],
    "birthDate": "1990-05-10",
    "gender": "male"
  }' | jq .
```

#### Step 2: Create Scan Order

```bash
curl -X POST http://localhost:7001/fhir/ServiceRequest \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/fhir+json" \
  -d '{
    "resourceType": "ServiceRequest",
    "status": "active",
    "intent": "order",
    "subject": {"reference": "Patient/3"},
    "code": {"coding": [{"system": "http://loinc.org", "code": "71046-4", "display": "Head CT"}]},
    "priority": "urgent",
    "requester": {"display": "Dr. Wilson"}
  }' | jq .
```

#### Step 3: Send from Clinic

```bash
curl -X POST http://localhost:5201/api/radiologyintegration/send-scan-order \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 3,
    "scanType": "CT",
    "bodyPart": "Head",
    "clinicalIndication": "Evaluate for stroke",
    "priority": "Urgent",
    "referringDoctorName": "Dr. Wilson"
  }' | jq .
```

#### Step 4: Create Report

```bash
curl -X POST http://localhost:7001/fhir/DiagnosticReport \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/fhir+json" \
  -d '{
    "resourceType": "DiagnosticReport",
    "status": "final",
    "code": {"coding": [{"system": "http://loinc.org", "code": "71046-4"}]},
    "subject": {"reference": "Patient/3"},
    "issued": "2024-04-26T15:00:00Z",
    "performer": [{"display": "Dr. Anderson"}],
    "conclusion": "No acute stroke",
    "conclusionCode": [{"coding": [{"system": "http://snomed.info/sct", "code": "3025009"}]}]
  }' | jq .
```

#### Step 5: Retrieve Results from Clinic

```bash
curl -X GET "http://localhost:5201/api/radiologyintegration/get-results?patientId=3" | jq .
```

---

## 📖 Additional Resources

- **FHIR Specification**: https://www.hl7.org/fhir/R4/
- **LOINC Codes**: https://loinc.org/
- **SNOMED CT**: https://www.snomed.org/
- **Firely SDK Docs**: https://github.com/FirelyTeam/fhir-net-api

---

**API Version**: 1.0 FHIR R4  
**Last Updated**: April 26, 2026  
**Status**: ✅ Production Ready
