using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.PatientModule.Models;
using PatientModel = EyeClinicAPI.PatientModule.Models.Patient;

namespace EyeClinicAPI.PatientModule.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;
        public PatientController(EyeClinicDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientModel>>> GetPatients()
            => await _context.Patients.OrderByDescending(p => p.CreatedAt).ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientModel>> GetPatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound();
            return patient;
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<PatientModel>>> SearchPatients([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return Ok(new List<PatientModel>());
            var q = query.ToLower().Trim();
            var patients = await _context.Patients
                .Where(p => p.FirstName.ToLower().StartsWith(q) ||
                            p.LastName.ToLower().StartsWith(q) ||
                            p.Phone.StartsWith(q) ||
                            p.NationalId.StartsWith(q))
                .Take(10).ToListAsync();
            return Ok(patients);
        }

        [HttpPost]
        public async Task<ActionResult<PatientModel>> PostPatient(PatientModel patient)
        {
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();
            
            // Generate PatientIdentifier with P- prefix if not already set
            if (string.IsNullOrWhiteSpace(patient.PatientIdentifier))
            {
                patient.PatientIdentifier = "P-" + patient.Id.ToString().PadLeft(6, '0');
                _context.Patients.Update(patient);
                await _context.SaveChangesAsync();
            }
            
            return CreatedAtAction(nameof(GetPatient), new { id = patient.Id }, patient);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPatient(int id, PatientModel patient)
        {
            if (id != patient.Id) return BadRequest();
            _context.Entry(patient).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Patients.Any(e => e.Id == id)) return NotFound();
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
    }
}

