using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.Models;
using System.Linq;

namespace RadiologyCenterAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    public class PatientController : ControllerBase
    {
        private readonly RadiologyDbContext _db;
        private readonly ILogger<PatientController> _logger;

        public PatientController(RadiologyDbContext db, ILogger<PatientController> logger)
        {
            _db = db;
            _logger = logger;
        }

        /// <summary>
        /// Register a new patient in Radiology system
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<PatientRegistrationResponse>> Register([FromBody] PatientRegistrationRequest req)
        {
            try
            {
                if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.FirstName))
                {
                    return BadRequest(new { error = "Email and FirstName are required" });
                }

                // Check if patient already exists
                var existing = await _db.Patients.FirstOrDefaultAsync(p => p.Email == req.Email);
                if (existing != null)
                {
                    return BadRequest(new { error = "Patient with this email already exists" });
                }

                // Generate RAD-##### ID (RAD- prefix with 5-digit random number)
                var radId = $"RAD-{new Random().Next(10000, 99999)}";
                
                // Ensure uniqueness
                while (await _db.Patients.AnyAsync(p => p.Identifier == radId))
                {
                    radId = $"RAD-{new Random().Next(10000, 99999)}";
                }

                // Create new patient
                var patient = new Patient
                {
                    Identifier = radId,
                    FirstName = req.FirstName,
                    LastName = req.LastName ?? "",
                    Email = req.Email,
                    Phone = req.Phone ?? "",
                    Gender = req.Gender ?? "",
                    Address = req.Address ?? "",
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

        /// <summary>
        /// Get patient by email
        /// </summary>
        [HttpGet("by-email/{email}")]
        public async Task<ActionResult<PatientDto>> GetByEmail(string email)
        {
            try
            {
                var patient = await _db.Patients.FirstOrDefaultAsync(p => p.Email == email);
                if (patient == null)
                    return NotFound(new { error = "Patient not found" });

                return Ok(new PatientDto
                {
                    id = patient.Id,
                    identifier = patient.Identifier,
                    firstName = patient.FirstName,
                    lastName = patient.LastName,
                    email = patient.Email,
                    phone = patient.Phone,
                    gender = patient.Gender,
                    address = patient.Address,
                    birthDate = patient.BirthDate?.ToString("yyyy-MM-dd") ?? ""
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching patient");
                return StatusCode(500, new { error = "Failed to fetch patient", details = ex.Message });
            }
        }

        /// <summary>
        /// Get patient by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PatientDto>> GetById(int id)
        {
            try
            {
                var patient = await _db.Patients.FindAsync(id);
                if (patient == null)
                    return NotFound(new { error = "Patient not found" });

                return Ok(new PatientDto
                {
                    id = patient.Id,
                    identifier = patient.Identifier,
                    firstName = patient.FirstName,
                    lastName = patient.LastName,
                    email = patient.Email,
                    phone = patient.Phone,
                    gender = patient.Gender,
                    address = patient.Address,
                    birthDate = patient.BirthDate?.ToString("yyyy-MM-dd") ?? ""
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching patient");
                return StatusCode(500, new { error = "Failed to fetch patient", details = ex.Message });
            }
        }

        /// <summary>
        /// Update patient phone number
        /// </summary>
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

                return Ok(new PatientDto
                {
                    id = patient.Id,
                    identifier = patient.Identifier,
                    firstName = patient.FirstName,
                    lastName = patient.LastName,
                    email = patient.Email,
                    phone = patient.Phone,
                    gender = patient.Gender,
                    address = patient.Address,
                    birthDate = patient.BirthDate?.ToString("yyyy-MM-dd") ?? ""
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating patient phone");
                return StatusCode(500, new { error = "Failed to update phone", details = ex.Message });
            }
        }
    }

    // DTOs
    public class PatientRegistrationRequest
    {
        public string FirstName { get; set; } = "";
        public string? LastName { get; set; }
        public string Email { get; set; } = "";
        public string? Phone { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
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
    }

    public class UpdatePhoneRequest
    {
        public string Phone { get; set; } = "";
    }
}
