using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.Models;

namespace RadiologyCenterAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    public class PatientController : ControllerBase
    {
        private readonly RadiologyDbContext _db;
        private readonly ILogger<PatientController> _logger;

        // FIXED: Removed IPatientIdentifierService dependency
        public PatientController(RadiologyDbContext db, ILogger<PatientController> logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<PatientRegistrationResponse>> Register([FromBody] PatientRegistrationRequest req)
        {
            try
            {
                if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.FirstName))
                {
                    return BadRequest(new { error = "Email and FirstName are required" });
                }

                var existing = await _db.Patients.FirstOrDefaultAsync(p => p.Email == req.Email);
                if (existing != null)
                {
                    return BadRequest(new { error = "Patient with this email already exists" });
                }

                var radId = $"RAD-{new Random().Next(10000, 99999)}";
                
                while (await _db.Patients.AnyAsync(p => p.Identifier == radId))
                {
                    radId = $"RAD-{new Random().Next(10000, 99999)}";
                }

                var patient = new Patient
                {
                    Identifier = radId,
                    FirstName = req.FirstName,
                    LastName = req.LastName ?? "",
                    Email = req.Email,
                    Phone = req.Phone ?? "",
                    Gender = req.Gender ?? "",
                    Address = req.Address ?? "",
                    NationalId = req.NationalId ?? "",
                    InsuranceCompany = req.InsuranceCompany ?? "",
                    InsuranceId = req.InsuranceId ?? "",
                    InsurancePolicyNumber = req.InsurancePolicyNumber ?? "",
                    EmergencyContactName = req.EmergencyContactName ?? "",
                    EmergencyContactPhone = req.EmergencyContactPhone ?? "",
                    EmergencyContactRelation = req.EmergencyContactRelation ?? "",
                    CreatedAt = DateTime.UtcNow
                };

                _db.Patients.Add(patient);
                await _db.SaveChangesAsync();

                _logger.LogInformation($"Patient registered: {patient.Email} with ID: {patient.Identifier}");

                return Ok(new PatientRegistrationResponse
                {
                    success = true,
                    message = "Patient registered successfully",
                    patientId = patient.Id,
                    identifier = patient.Identifier,
                    email = patient.Email,
                    firstName = patient.FirstName,
                    lastName = patient.LastName,
                    phone = patient.Phone
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering patient");
                return StatusCode(500, new { error = "Failed to register patient", details = ex.Message });
            }
        }

        [HttpGet("by-email/{email}")]
        public async Task<ActionResult<PatientDto>> GetByEmail(string email)
        {
            try
            {
                var patient = await _db.Patients.FirstOrDefaultAsync(p => p.Email == email);
                if (patient == null)
                    return NotFound(new { error = "Patient not found" });

                return Ok(MapToDto(patient));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching patient");
                return StatusCode(500, new { error = "Failed to fetch patient", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientDto>> GetById(int id)
        {
            try
            {
                var patient = await _db.Patients.FindAsync(id);
                if (patient == null)
                    return NotFound(new { error = "Patient not found" });

                return Ok(MapToDto(patient));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching patient");
                return StatusCode(500, new { error = "Failed to fetch patient", details = ex.Message });
            }
        }

        [HttpGet("by-identifier/{identifier}")]
        public async Task<ActionResult<PatientDto>> GetByIdentifier(string identifier)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(identifier))
                    return BadRequest(new { error = "Identifier is required" });

                var patient = await _db.Patients.FirstOrDefaultAsync(p => p.Identifier == identifier);
                if (patient == null)
                    return NotFound(new { error = $"Patient with identifier {identifier} not found" });

                return Ok(MapToDto(patient));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching patient by identifier");
                return StatusCode(500, new { error = "Failed to fetch patient", details = ex.Message });
            }
        }

        [HttpPut("{id}/phone")]
        public async Task<ActionResult<PatientDto>> UpdatePhone(int id, [FromBody] UpdatePhoneRequest req)
        {
            try
            {
                var patient = await _db.Patients.FindAsync(id);
                if (patient == null)
                    return NotFound(new { error = "Patient not found" });

                patient.Phone = req.Phone;
                _db.Patients.Update(patient);
                await _db.SaveChangesAsync();

                return Ok(MapToDto(patient));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating patient phone");
                return StatusCode(500, new { error = "Failed to update phone", details = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetAllPatients()
        {
            try
            {
                var patients = await _db.Patients
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                return Ok(patients.Select(MapToDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all patients");
                return StatusCode(500, new { error = "Failed to fetch patients", details = ex.Message });
            }
        }

        private PatientDto MapToDto(Patient p)
        {
            return new PatientDto
            {
                id = p.Id,
                identifier = p.Identifier,
                firstName = p.FirstName,
                lastName = p.LastName,
                email = p.Email,
                phone = p.Phone,
                gender = p.Gender,
                address = p.Address,
                birthDate = p.BirthDate?.ToString("yyyy-MM-dd") ?? "",
                nationalId = p.NationalId ?? "",
                insuranceCompany = p.InsuranceCompany ?? "",
                insuranceId = p.InsuranceId ?? "",
                insurancePolicyNumber = p.InsurancePolicyNumber ?? "",
                emergencyContactName = p.EmergencyContactName ?? "",
                emergencyContactPhone = p.EmergencyContactPhone ?? "",
                emergencyContactRelation = p.EmergencyContactRelation ?? ""
            };
        }
    }

    public class PatientRegistrationRequest
    {
        public string FirstName { get; set; } = "";
        public string? LastName { get; set; }
        public string Email { get; set; } = "";
        public string? Phone { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? NationalId { get; set; }
        public string? InsuranceCompany { get; set; }
        public string? InsuranceId { get; set; }
        public string? InsurancePolicyNumber { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? EmergencyContactRelation { get; set; }
    }

    public class PatientRegistrationResponse
    {
        public bool success { get; set; }
        public string message { get; set; } = "";
        public int patientId { get; set; }
        public string identifier { get; set; } = "";
        public string email { get; set; } = "";
        public string firstName { get; set; } = "";
        public string lastName { get; set; } = "";
        public string phone { get; set; } = "";
    }

    public class PatientDto
    {
        public int id { get; set; }
        public string identifier { get; set; } = "";
        public string firstName { get; set; } = "";
        public string lastName { get; set; } = "";
        public string email { get; set; } = "";
        public string phone { get; set; } = "";
        public string gender { get; set; } = "";
        public string address { get; set; } = "";
        public string birthDate { get; set; } = "";
        public string nationalId { get; set; } = "";
        public string insuranceCompany { get; set; } = "";
        public string insuranceId { get; set; } = "";
        public string insurancePolicyNumber { get; set; } = "";
        public string emergencyContactName { get; set; } = "";
        public string emergencyContactPhone { get; set; } = "";
        public string emergencyContactRelation { get; set; } = "";
    }

    public class UpdatePhoneRequest
    {
        public string Phone { get; set; } = "";
    }
}