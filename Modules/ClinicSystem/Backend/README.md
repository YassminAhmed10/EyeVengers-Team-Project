# Backend Development Guide

## 📁 Backend Folder Structure

```
Backend/
├── Controllers/          # API Endpoints
├── Services/            # Business Logic
├── DTOs/                # Data Transfer Objects
├── Models/              # Database Models
├── Interfaces/          # Service Interfaces
├── Mappers/             # DTO ↔ Model Mapping
├── Validators/          # Data Validation
├── Fhir/                # FHIR HL7 Integration
├── Configuration/       # DI & Setup
└── README.md
```

## 🎯 Layer Responsibilities

### Controllers
**Purpose**: Handle HTTP requests/responses

**Responsibilities**:
- Accept HTTP requests
- Call appropriate services
- Return HTTP responses
- Handle routing

**Example**:
```csharp
namespace EyeClinicAPI.Modules.ClinicSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _service;
        
        [HttpGet]
        public async Task<ActionResult<List<AppointmentDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }
    }
}
```

### Services
**Purpose**: Implement business logic

**Responsibilities**:
- Process business rules
- Call repositories/database
- Orchestrate operations
- Handle exceptions

**Example**:
```csharp
namespace EyeClinicAPI.Modules.ClinicSystem.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly EyeClinicDbContext _context;
        private readonly IAppointmentValidator _validator;
        
        public async Task<AppointmentDto> CreateAsync(CreateAppointmentRequest request)
        {
            // Validate
            _validator.Validate(request);
            
            // Create model
            var appointment = new Appointment 
            { 
                PatientId = request.PatientId,
                DoctorId = request.DoctorId,
                AppointmentDate = request.AppointmentDate
            };
            
            // Save
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            
            // Map to DTO
            return _mapper.MapToDto(appointment);
        }
    }
}
```

### DTOs (Data Transfer Objects)
**Purpose**: Define request/response contracts

**Types**:
- CreateAppointmentRequest
- AppointmentDto
- UpdateAppointmentRequest
- AppointmentListDto

### Interfaces
**Purpose**: Define service contracts

**Benefits**:
- Dependency Injection
- Testing (Mock implementations)
- Loose coupling
- Clear contracts

**Example**:
```csharp
public interface IAppointmentService
{
    Task<AppointmentDto> GetByIdAsync(int id);
    Task<List<AppointmentDto>> GetAllAsync();
    Task<AppointmentDto> CreateAsync(CreateAppointmentRequest request);
    Task UpdateAsync(int id, UpdateAppointmentRequest request);
    Task DeleteAsync(int id);
}
```

### Mappers
**Purpose**: Convert between DTOs and Models

**Benefits**:
- Separation of concerns
- Type safety
- Centralized mapping logic

**Example**:
```csharp
public class AppointmentMapper
{
    public static AppointmentDto MapToDto(Appointment model)
    {
        return new AppointmentDto
        {
            Id = model.Id,
            PatientId = model.PatientId,
            DoctorId = model.DoctorId,
            AppointmentDate = model.AppointmentDate,
            Status = model.Status
        };
    }
    
    public static Appointment MapToModel(CreateAppointmentRequest dto)
    {
        return new Appointment
        {
            PatientId = dto.PatientId,
            DoctorId = dto.DoctorId,
            AppointmentDate = dto.AppointmentDate
        };
    }
}
```

### Validators
**Purpose**: Validate business logic and data

**Example**:
```csharp
public interface IAppointmentValidator
{
    void Validate(CreateAppointmentRequest request);
    void ValidateUpdate(UpdateAppointmentRequest request);
}

public class AppointmentValidator : IAppointmentValidator
{
    public void Validate(CreateAppointmentRequest request)
    {
        if (request.PatientId <= 0)
            throw new ValidationException("Invalid PatientId");
            
        if (request.AppointmentDate <= DateTime.Now)
            throw new ValidationException("Appointment date must be in future");
    }
}
```

## 🔄 Adding a New Feature

### Step 1: Create DTOs
```csharp
// DTOs/DoctorDtos.cs
public class CreateDoctorRequest
{
    public string Name { get; set; }
    public string Specialization { get; set; }
}

public class DoctorDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Specialization { get; set; }
}
```

### Step 2: Create Validator
```csharp
// Validators/DoctorValidator.cs
public class DoctorValidator : IDoctorValidator
{
    public void Validate(CreateDoctorRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ValidationException("Name is required");
    }
}
```

### Step 3: Create Interface
```csharp
// Interfaces/IDoctorService.cs
public interface IDoctorService
{
    Task<DoctorDto> GetByIdAsync(int id);
    Task<DoctorDto> CreateAsync(CreateDoctorRequest request);
}
```

### Step 4: Create Service
```csharp
// Services/DoctorService.cs
public class DoctorService : IDoctorService
{
    private readonly EyeClinicDbContext _context;
    private readonly IDoctorValidator _validator;
    
    public async Task<DoctorDto> CreateAsync(CreateDoctorRequest request)
    {
        _validator.Validate(request);
        // ... implementation
    }
}
```

### Step 5: Create Controller
```csharp
// Controllers/DoctorsController.cs
[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorService _service;
    
    [HttpPost]
    public async Task<ActionResult<DoctorDto>> Create(CreateDoctorRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
}
```

### Step 6: Register in DI
```csharp
// Configuration/ClinicSystemModule.cs
public static IServiceCollection AddClinicSystemModule(
    this IServiceCollection services)
{
    services.AddScoped<IDoctorService, DoctorService>();
    services.AddScoped<IDoctorValidator, DoctorValidator>();
    
    return services;
}
```

## 🧪 Best Practices

### Do's ✅
- Use dependency injection
- Return DTOs from controllers
- Validate input data
- Use async/await
- Handle exceptions gracefully
- Write single-responsibility methods
- Use meaningful names

### Don'ts ❌
- Don't expose database models in API responses
- Don't put business logic in controllers
- Don't skip validation
- Don't use static methods for services
- Don't hardcode configuration
- Don't ignore exceptions
- Don't create circular dependencies

## 🔧 Common Patterns

### Async Operations
```csharp
public async Task<Result> GetAsync(int id)
{
    return await _context.Items
        .FirstOrDefaultAsync(x => x.Id == id);
}
```

### Error Handling
```csharp
try
{
    await _service.ProcessAsync();
}
catch (ValidationException ex)
{
    return BadRequest(new { message = ex.Message });
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error processing request");
    return StatusCode(500, new { message = "Internal server error" });
}
```

### Pagination
```csharp
public async Task<PaginatedResult<T>> GetPagedAsync(
    int page = 1, int pageSize = 10)
{
    var query = _context.Items;
    var total = await query.CountAsync();
    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();
        
    return new PaginatedResult<T>
    {
        Items = items,
        TotalCount = total,
        Page = page,
        PageSize = pageSize
    };
}
```

## 📚 Related Documentation

- [Database Schema](../Documentation/Database/Schema.md)
- [API Endpoints](../Documentation/API/Overview.md)
- [Workflows](../Documentation/Workflows/AppointmentFlow.md)

---

**Version**: 1.0  
**Last Updated**: April 2026
