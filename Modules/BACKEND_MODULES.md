# Backend Module Layout

This backend is organized into three business modules:

## 1) Patient Module
Scope:
- Patient profile and patient-facing data
- Medical record lifecycle and EMR details

Current code map:
- Controllers:
  - `PatientModule/Controllers/PatientController.cs`
  - `Controllers/AuthController.cs`
  - `Controllers/EMRcontrol/*`
- Models and DTOs:
  - `PatientModule/Models/*`
  - `PatientModule/DTOs/*`
  - `Models/EMR/*`
  - `DTOs/EMRd/*`

DI registration entry:
- `Modules/DependencyInjection/PatientModule.cs`

## 2) Clinic System Module
Scope:
- Clinic operations, scheduling, doctor workflow, inventory, and facility tasks

Current code map:
- Controllers:
  - `Controllers/AppointmentsController.cs`
  - `Controllers/DoctorsControllers.cs`
  - `Controllers/DashboardController.cs`
  - `Controllers/Clinic/DoctorOrdersController.cs`
  - `Controllers/NotificationsController.cs`
  - `Controllers/EquipmentController.cs`
  - `Controllers/MaintenanceTasksController.cs`
  - `Controllers/MedicalSuppliesController.cs`
  - `Controllers/SanitizationScheduleController.cs`
  - `Controllers/WasteManagementController.cs`
- Models:
  - `Models/Appointment.cs`
  - `Models/Doctor.cs`
  - `Models/Clinic/*`
  - `Models/Equipment.cs`
  - `Models/MaintenanceTasks.cs`
  - `Models/MedicalSupplies.cs`
  - `Models/SanitizationSchedule.cs`
  - `Models/WasteManagement.cs`

DI registration entry:
- `Modules/ClinicSystem/ClinicSystemModule.cs`

## 3) Radiology Center Module
Scope:
- Integration with external radiology system (FHIR)
- Sending investigations and retrieving scan/report status

Current code map:
- Controllers:
  - `Controllers/RadiologyIntegrationController.cs`
  - `Controllers/InvestigationsRadiologyController.cs`
- Services:
  - `Services/RadiologyCenterFhirClient.cs`
  - `Services/InvestigationToFhirMapper.cs`

DI registration entry:
- `Modules/RadiologyCenter/RadiologyCenterModule.cs`

## Composition Root
The three modules are composed in:
- `Modules/DependencyInjection/ModuleBootstrapper.cs`

Startup flow remains unchanged in `Program.cs` through:
- `builder.Services.AddApplicationModules(builder.Configuration);`
