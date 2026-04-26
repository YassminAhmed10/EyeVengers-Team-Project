using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models.EMR;
using EyeClinicAPI.Models;
using System.Linq;

namespace EyeClinicAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public PatientController(EyeClinicDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Patient>>> GetPatients()
        {
            var patients = await _context.Patients
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
                
            return patients;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Patient>> GetPatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound();
            return patient;
        }

        [HttpGet("debug/{id}")]
        public async Task<ActionResult<object>> DebugGetPatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound(new { message = $"Patient with ID {id} not found in database" });
            }
            
            return Ok(new
            {
                patient.Id,
                patient.FirstName,
                patient.LastName,
                patient.Email,
                patient.Phone,
                DateOfBirth = patient.DateOfBirth.ToString("yyyy-MM-dd"),
                patient.Gender,
                patient.Address,
                patient.NationalId,
                patient.CreatedAt
            });
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Patient>>> SearchPatients([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return Ok(new List<Patient>());

            var q = query.ToLower().Trim();
            var patients = await _context.Patients
                .Where(p =>
                    p.FirstName.ToLower().StartsWith(q) ||
                    p.LastName.ToLower().StartsWith(q) ||
                    (p.FirstName + " " + p.LastName).ToLower().StartsWith(q) ||
                    p.Phone.StartsWith(q) ||
                    p.Email.ToLower().StartsWith(q) ||
                    p.NationalId.StartsWith(q))
                .Take(10)
                .ToListAsync();

            return Ok(patients);
        }

        [HttpPost]
        public async Task<ActionResult<Patient>> PostPatient(Patient patient)
        {
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPatient), new { id = patient.Id }, patient);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPatient(int id, Patient patient)
        {
            if (id != patient.Id) return BadRequest();
            _context.Entry(patient).State = EntityState.Modified;

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!PatientExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound();

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool PatientExists(int id) => _context.Patients.Any(e => e.Id == id);
    }
}