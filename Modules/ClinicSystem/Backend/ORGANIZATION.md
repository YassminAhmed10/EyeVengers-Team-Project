# ClinicSystem Backend - File Organization

## Overview
All files from the main EyeClinicAPI project have been consolidated and organized into a clean, modular structure within the ClinicSystem Backend module.

## Directory Structure

```
Backend/
├── Configuration/
│   ├── appsettings.json
│   └── appsettings.Development.json
├── ProjectFiles/
│   ├── EyeClinicAPI.csproj
│   ├── EyeClinicAPI.csproj.user
│   └── Directory.Packages.props
├── Properties/
│   └── launchSettings.json
├── Controllers/                (21 clinic system controllers)
│   ├── AppointmentsController.cs
│   ├── AuthController.cs
│   ├── DashboardController.cs
│   ├── DiagnosisController.cs
│   ├── DoctorOrdersController.cs
│   ├── DoctorsController.cs
│   ├── DrugsController.cs
│   ├── EquipmentController.cs
│   ├── InvestigationController.cs
│   ├── MaintenanceTasksController.cs
│   ├── MedicalHistoryController.cs
│   ├── MedicalRecordController.cs
│   ├── MedicalSuppliesController.cs
│   ├── MedicalTestFilesController.cs
│   ├── NotificationsController.cs
│   ├── OperationsController.cs
│   ├── PatientComplaintController.cs
│   ├── PrescriptionController.cs
│   ├── SanitizationScheduleController.cs
│   ├── WasteManagementController.cs
│   └── EyeExaminationController.cs
├── Data/
│   ├── EyeClinicDbContext.cs      (Database context)
│   └── (Migrations - EF Core migration files)
├── Models/                         (18+ models organized by domain)
│   ├── Appointment.cs
│   ├── AppointmentStatus.cs
│   ├── Doctor.cs
│   ├── User.cs
│   ├── DoctorSchedule.cs
│   ├── Equipment.cs
│   ├── MaintenanceTasks.cs
│   ├── MedicalSupplies.cs
│   ├── SanitizationSchedule.cs
│   ├── WasteManagement.cs
│   ├── EMR/                        (Electronic Medical Records)
│   │   ├── Diagnosis.cs
│   │   ├── EyeExamination.cs
│   │   ├── Investigation.cs
│   │   ├── MedicalRecord.cs
│   │   ├── MedicalHistory.cs
│   │   ├── PatientComplaint.cs
│   │   ├── Operation.cs
│   │   ├── Prescription.cs
│   │   ├── PrescriptionItem.cs
│   │   └── MedicalTestFile.cs
│   └── Clinic/                     (Clinic-specific models)
│       ├── DoctorOrder.cs
│       └── Notification.cs
├── DTOs/                           (Data Transfer Objects)
│   ├── LoginRequest.cs
│   └── EMRd/                       (EMR DTOs organized by entity)
│       ├── Complaints/
│       ├── Diagnosis/
│       ├── EyeExamination/
│       ├── Investigation/
│       ├── MedicalHistory/
│       ├── MedicalRecord/
│       ├── Operations/
│       ├── Orders/
│       ├── Prescription/
│       └── TestImages/
├── Services/
│   └── EmailService.cs             (Email notification service)
├── Interfaces/                     (Service abstractions)
├── Mappers/                        (DTO to Model mappers)
├── Validators/                     (Entity validators)
├── Fhir/                           (FHIR HL7 integration)
├── Uploads/                        (Medical file uploads directory)
├── Program.cs                      (Application entry point with modular DI)
├── README.md                       (Module documentation)
└── ORGANIZATION.md                 (This file)
```

## File Organization by Category

### Configuration Files
- **appsettings.json** - Production configuration
- **appsettings.Development.json** - Development configuration
- **launchSettings.json** - Launch profiles for IIS/Kestrel

### Project Files
- **EyeClinicAPI.csproj** - Main project file with dependencies
- **EyeClinicAPI.csproj.user** - User-specific project settings
- **Directory.Packages.props** - Centralized NuGet package versions

### Application Entry Point
- **Program.cs** - WebAPI bootstrap with modular DI setup
  - Registers ClinicSystemModule via `AddApplicationModules(configuration)`
  - Configures middleware pipeline

### Controllers (21 Total)
Organized by feature:
- **Appointment Management**: AppointmentsController
- **User Authentication**: AuthController
- **Analytics**: DashboardController
- **Medical Records**: MedicalRecordController, DiagnosisController, InvestigationController, EyeExaminationController
- **Clinic Operations**: DoctorsController, EquipmentController, MaintenanceTasksController
- **Inventory**: MedicalSuppliesController, DrugsController
- **Sanitation**: SanitizationScheduleController
- **Waste Management**: WasteManagementController
- **Patient Services**: NotificationsController, PatientComplaintController
- **Pharmacy**: PrescriptionController
- **Workflow**: DoctorOrdersController
- **Medical Tests**: MedicalTestFilesController
- **History**: MedicalHistoryController

### Models (18+ Classes)
**Core Clinic Models:**
- Appointment, Doctor, DoctorSchedule, User

**Clinic Management:**
- Equipment, MaintenanceTasks, MedicalSupplies, SanitizationSchedule, WasteManagement

**Electronic Medical Records (EMR):**
- MedicalRecord (aggregate root), Diagnosis, EyeExamination, Investigation, MedicalHistory, PatientComplaint, Operation, Prescription, PrescriptionItem, MedicalTestFile

**Clinic-Specific:**
- DoctorOrder, Notification

### Database
- **EyeClinicDbContext.cs** - Entity Framework Core context with 27+ DbSets
- **Migrations/** - Database version history (10+ migration files)

### Services
- **EmailService.cs** - Handles patient and staff notifications via email

### Data Transfer Objects (DTOs)
Organized by EMR domain:
- Complaints, Diagnosis, EyeExamination, Investigation, MedicalHistory, MedicalRecord, Operations, Orders, Prescription, TestImages

### Integration
- **Fhir/** - FHIR HL7 mappers for radiology center integration

### Utilities
- **Interfaces/** - Service abstractions for dependency injection
- **Mappers/** - DTO ↔ Model conversion logic
- **Validators/** - Entity validation logic

## Namespace Structure
```
EyeClinicAPI
├── Models                     (Core models)
│   ├── EMR                   (Electronic Medical Records)
│   └── Clinic                (Clinic-specific)
├── Controllers               (API endpoints)
├── Services                  (Business logic)
├── DTOs                      (API contracts)
├── Data                      (Database context)
├── Interfaces                (Abstractions)
├── Mappers                   (Converters)
├── Validators                (Validation)
└── Fhir                      (Healthcare integration)
```

## Build & Configuration
- **Target Framework**: .NET 8.0
- **ORM**: Entity Framework Core with SQL Server
- **Database**: LocalDB (MSSQLLocalDB) or SQL Server
- **Architecture**: Modular Dependency Injection pattern
- **API Routing**: Attribute-based routing preserves URLs despite folder reorganization

## Key Features
✅ **Modular Architecture** - Each domain (Clinic, Patient, Radiology) is a separate module
✅ **FHIR/HL7 Integration** - Radiology center communication via FHIR standard
✅ **Electronic Medical Records** - Comprehensive EMR system for patient data
✅ **Multi-User Support** - Doctor, Receptionist, Admin roles
✅ **Appointment Management** - Online/offline appointments with scheduling
✅ **Inventory Management** - Equipment, supplies, waste tracking
✅ **Payment Processing** - Insurance and payment tracking
✅ **Notifications** - Email and in-app notifications

## Next Steps
1. Update project references to point to new ProjectFiles location
2. Review and update any hardcoded file paths in configuration
3. Run migrations: `dotnet ef database update`
4. Build project: `dotnet build -nologo /clp:ErrorsOnly`
5. Test API endpoints from Frontend module

---
*Organization completed on 2026-04-28*
*All files consolidated from EyeClinicAPI into modular ClinicSystem Backend*
