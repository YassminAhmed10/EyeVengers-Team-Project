# Radiology Center - Clinic System Integration Documentation

## Overview
This document describes the complete integration between the Eye Clinic System and the Radiology Center for booking and managing radiology appointments with FHIR/HL7 data mapping support.

## Architecture

### System Components

#### 1. **Clinic System Backend** (Port: 5201)
- **Controller**: `RadiologyIntegrationController` - Proxies requests to Radiology Center
- **Service**: `RadiologyIntegrationService` - Handles HTTP communication and data transformation
- **Configuration**: Radiology Center base URL in `appsettings.json`

#### 2. **Radiology Center Backend** (Port: 5301)
- **Controller**: `RadiologyController` - Core radiology operations
- **Services**:
  - `AppointmentService` - Appointment management
  - `FhirMappingService` - FHIR/HL7 data transformation
  - `Hl7Service` - HL7 message handling
- **Database**: Local SQL Server with FHIR-compliant schema

#### 3. **Frontend - Radiology Center** (Port: 5174)
- **Page**: `BookAppointmentPage.jsx` - Multi-step booking wizard
- **Service**: `radiologyIntegrationService.js` - FHIR/API utilities
- **Context**: `PatientContext` - Patient data management

## Data Flow

### Booking Appointment Flow

```
Eye Clinic Frontend
       ↓
RadiologyRedirectPage (transfers patient data)
       ↓
Radiology Center Frontend (BookAppointmentPage)
       ↓
[Step 1] Load Patient Info + Order Details
       ↓
[Step 2] Fetch Services from RadiologyIntegration API
       ↓
[Step 3] Select Service → Fetch Available Slots
       ↓
[Step 4] Pick Date & Time
       ↓
[Step 5] Review & Confirm Booking
       ↓
RadiologyIntegration.book() API Call
       ↓
Clinic System Backend (RadiologyIntegrationService)
       ↓
Radiology Center Backend (RadiologyController)
       ↓
Appointment Service + FHIR Mapping
       ↓
Database + HL7 Message Generation
       ↓
Confirmation Response
```

## API Endpoints

### Clinic System (Proxy Endpoints)

#### GET `/api/RadiologyIntegration/services`
Fetches all available radiology services from the Radiology Center.

**Response:**
```json
[
  {
    "id": 1,
    "code": "CT-ABDOMEN",
    "display": "CT Abdomen",
    "modality": "CT",
    "durationMin": 30,
    "price": 250.00,
    "isActive": true
  }
]
```

#### GET `/api/RadiologyIntegration/slots`
Fetches available appointment slots for a service on a specific date.

**Query Parameters:**
- `service`: Service code (e.g., "CT-ABDOMEN")
- `date`: Date in YYYY-MM-DD format

**Response:**
```json
[
  {
    "id": 1,
    "start": "2024-05-15T09:00:00Z",
    "end": "2024-05-15T09:30:00Z",
    "status": "free"
  }
]
```

#### POST `/api/RadiologyIntegration/book`
Books a radiology appointment.

**Request Body:**
```json
{
  "orderId": 123,
  "appointmentDate": "2024-05-15",
  "appointmentTime": "09:00",
  "serviceCode": "CT-ABDOMEN",
  "serviceDisplay": "CT Abdomen",
  "priority": "routine"
}
```

**Response:**
```json
{
  "appointmentId": 5,
  "confirmationId": "RAD-2024-001",
  "hl7MessageId": "msg-12345",
  "appointment": {
    "id": 5,
    "status": "Pending",
    "createdAt": "2024-05-10T10:00:00Z"
  }
}
```

#### GET `/api/RadiologyIntegration/appointments/{appointmentId}`
Gets appointment status and details.

#### POST `/api/RadiologyIntegration/appointments/{appointmentId}/cancel`
Cancels a booked appointment.

### Radiology Center Backend Endpoints

#### GET `/api/Radiology/services`
Core endpoint returning radiology services.

#### GET `/api/Radiology/slots`
Core endpoint returning available slots.

#### POST `/api/Radiology/book`
Core booking endpoint with FHIR mapping.

**Request Mapping:**
- Extracts patient data from orderId
- Creates FHIR Patient resource
- Creates FHIR ServiceRequest resource
- Creates FHIR Appointment resource
- Generates HL7 message
- Stores appointment in database

## Frontend Integration

### BookAppointmentPage.jsx

A 4-step wizard component for booking appointments:

1. **Step 0: Patient Information**
   - Loads patient data from URL params or localStorage
   - Allows editing of patient details
   - Displays order information

2. **Step 1: Select Service**
   - Displays all available services
   - Shows service details (code, modality, duration)
   - Supports service selection with visual feedback

3. **Step 2: Choose Date & Time**
   - Calendar date picker (minimum 1 day in advance)
   - Dynamic slot loading based on selected date
   - Time slot selection as chips

4. **Step 3: Confirm Booking**
   - Summary of all booking details
   - Patient information review
   - Service details review
   - Appointment details review
   - Confirmation dialog before final booking

### Patient Data Loading

Patient data is loaded from (in order of priority):
1. URL search parameters (from RadiologyRedirectPage)
2. localStorage keys:
   - `patientId`
   - `patientFirstName`
   - `patientLastName`
   - `userEmail`
   - `patientPhone`
   - `patientDateOfBirth`
   - `patientGender`

### Service Integration

The page uses axios for HTTP requests with:
- Authorization header from localStorage token
- Error handling with user-friendly messages
- Loading states and progress indicators
- Automatic data persistence to localStorage

## FHIR/HL7 Integration

### FHIR Resources Created

1. **Patient Resource**
   - Identifier: Patient ID from clinic system
   - Name: First name + Last name
   - Telecom: Email and phone
   - BirthDate: Patient DOB
   - Gender: Mapped from patient data

2. **ServiceRequest Resource**
   - Code: Service code from selected service
   - Subject: Reference to Patient
   - Priority: Mapped from order priority
   - Status: "active"
   - OrderedOn: Current timestamp

3. **Appointment Resource**
   - ServiceType: Service code and display
   - Start/End: Appointment date/time
   - Participant: Patient reference
   - Slot: Slot reference from selected slot

### HL7 Message Generation

The Radiology Center backend automatically generates:
- HL7 ORM (Order Message) for the appointment booking
- HL7 SIU (Schedule Information Unsolicited) for appointment confirmation
- Message headers with clinic and radiology center identifiers

## Configuration

### Clinic System - appsettings.json

```json
{
  "RadiologyCenter": {
    "BaseUrl": "http://localhost:5301/api"
  }
}
```

### Radiology Center - appsettings.json

```json
{
  "Urls": "http://localhost:5301",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=(localdb)\\RadiologyCenterDB;Initial Catalog=RadiologyCenterCatalog;..."
  },
  "Fhir": {
    "BaseUrl": "http://localhost:5301/fhir",
    "ClientId": "radiology-center",
    "ClientSecret": "radiology-secret",
    "TokenExpiryMinutes": 60
  }
}
```

### Frontend - Environment Variables

```env
VITE_CLINIC_API_URL=http://localhost:5201/api
VITE_RADIOLOGY_API_URL=http://localhost:5301/api
```

## Database Schema

### RadiologyCenter Database Tables

- **Patient** - Patient records synced from clinic
- **RadiologyService** - Available services (CT, MRI, X-Ray, etc.)
- **Slot** - Available appointment slots
- **Appointment** - Booked appointments with FHIR references
- **RadiologyReport** - Generated radiology reports

## Error Handling

### Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error description",
  "details": "Additional information if available"
}
```

### HTTP Status Codes

- `200 OK` - Successful request
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Radiology Center offline

### Frontend Error Handling

- User-friendly error messages in snackbar notifications
- Automatic retry for transient failures
- Detailed logging for debugging
- Graceful degradation if Radiology Center is offline

## Testing the Integration

### 1. Build RadiologyCenter Backend

```bash
cd Modules/RadiologyCenter/Backend
dotnet build
dotnet run
# Server runs on http://localhost:5301
```

### 2. Build ClinicSystem Backend

```bash
cd Modules/ClinicSystem/Backend
dotnet build
dotnet run
# Server runs on http://localhost:5201
```

### 3. Start Radiology Center Frontend

```bash
cd Modules/RadiologyCenter/Frontend
npm install
npm run dev
# Frontend runs on http://localhost:5174
```

### 4. Test the Booking Flow

1. Navigate to Clinic System
2. Access patient orders
3. Click "Book at Radiology Center"
4. Complete the 4-step booking wizard
5. Verify confirmation message and appointment appears in Radiology Center

## Troubleshooting

### Issue: "Radiology Center is unavailable"

**Cause**: RadiologyCenter backend not running or incorrect URL

**Solution**:
1. Verify RadiologyCenter backend is running on port 5301
2. Check `appsettings.json` RadiologyCenter BaseUrl
3. Verify network connectivity between services

### Issue: "Could not load radiology services"

**Cause**: Services not created in RadiologyCenter database or API error

**Solution**:
1. Check RadiologyCenter database has data seeded
2. Review backend logs for specific error
3. Verify authentication tokens are valid

### Issue: "No available slots"

**Cause**: No slots defined for selected service/date

**Solution**:
1. Add slots to RadiologyService in database
2. Ensure slot dates are in future
3. Check slot status is "free"

### Issue: "Appointment booking failed"

**Cause**: Invalid patient data or service mapping

**Solution**:
1. Verify all required fields are filled
2. Check patient ID matches clinic system
3. Review FHIR mapping for errors
4. Check backend logs for validation errors

## Performance Considerations

- Service list is cached on first load
- Slots are fetched on-demand for selected date
- Patient data is persisted to localStorage
- No unnecesary API calls when data hasn't changed
- Confirmation dialog prevents accidental bookings

## Security Considerations

- JWT token passed in Authorization header
- CORS configured for clinic and radiology domains
- Patient data encrypted in transit (HTTPS)
- HL7 messages include security audit trails
- Database access restricted to backend services

## Future Enhancements

1. SMS/Email notifications on appointment booking
2. Appointment rescheduling support
3. Radiology report viewing in clinic system
4. Integration with PACS (Picture Archiving System)
5. Real-time availability updates via WebSocket
6. Multi-language support
7. Accessibility improvements (WCAG 2.1 AA compliance)

## Support & Contact

For issues or questions regarding the integration, please review:
- Backend logs in RadiologyCenter backend console
- Browser console for frontend errors
- HTTP network requests in browser DevTools
- Database tables for data consistency
