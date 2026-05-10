using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models.EMR;
using PatientModel = EyeClinicAPI.Models.EMR.Patient;
using System.Text.Json;
namespace EyeClinicAPI.Modules.ClinicSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;
        private readonly ILogger<PatientController> _logger;

        public PatientController(EyeClinicDbContext context, ILogger<PatientController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Patient
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var patients = await _context.Patients.ToListAsync();
            return Ok(patients);
        }

        // GET: api/Patient/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound(new { message = "Patient not found" });
            return Ok(patient);
        }

        // GET: api/Patient/search?query=email
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Query is required" });

            var patients = await _context.Patients
                .Where(p => p.Email.Contains(query) ||
                            p.FirstName.Contains(query) ||
                            p.LastName.Contains(query) ||
                            (p.FirstName + " " + p.LastName).Contains(query))
                .ToListAsync();

            // ═══════════════════════════════════════════════════════════════════════════════
            // LOG FHIR PATIENT DATA — Eye Clinic sending to Radiology
            // ═══════════════════════════════════════════════════════════════════════════════
            if (patients.Count > 0)
            {
                _logger.LogInformation("\n╔════════════════════════════════════════════════════════════════╗");
                _logger.LogInformation("║ [PID] PATIENT IDENTIFICATION SEGMENT - Outgoing");
                _logger.LogInformation("║ Direction: → OUT (Eye Clinic → Radiology Center)");
                _logger.LogInformation("║ Timestamp: {Time:yyyy-MM-dd HH:mm:ss.fff}", DateTime.Now);
                _logger.LogInformation("║ Query: {Query}", query);
                _logger.LogInformation("║ Patients Found: {Count}", patients.Count);
                
                foreach (var p in patients)
                {
                    _logger.LogInformation("║ Patient ID: {Id} | Name: {Name}", p.Id, $"{p.FirstName} {p.LastName}");
                }
                
                _logger.LogInformation("╚════════════════════════════════════════════════════════════════╝");
                _logger.LogDebug("║ Payload:\n{Payload}", JsonSerializer.Serialize(patients));
            }

            return Ok(patients);
        }

        // GET: api/Patient/by-email/{email}
        [HttpGet("by-email/{email}")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Email == email);
            if (patient == null) return NotFound(new { message = "Patient not found" });
            return Ok(patient);
        }

        // POST: api/Patient
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PatientModel patient)
        {
            if (patient == null) return BadRequest(new { message = "Patient data is required" });
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = patient.Id }, patient);
        }

        // PUT: api/Patient/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PatientModel updated)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound(new { message = "Patient not found" });

            patient.FirstName = updated.FirstName ?? patient.FirstName;
            patient.LastName = updated.LastName ?? patient.LastName;
            patient.Email = updated.Email ?? patient.Email;
            patient.Phone = updated.Phone ?? patient.Phone;
            patient.Address = updated.Address ?? patient.Address;

            await _context.SaveChangesAsync();
            return Ok(patient);
        }

        // DELETE: api/Patient/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound(new { message = "Patient not found" });
            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Patient deleted" });
        }
    }
}