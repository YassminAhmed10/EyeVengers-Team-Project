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
            // Get only patients who have completed appointments
            var patientsWithCompletedAppointments = await _context.Patients
                .Where(p => _context.Appointments.Any(a => 
                    a.PatientName == (p.FirstName + " " + p.LastName) && 
                    a.Status == AppointmentStatus.Completed))
                .ToListAsync();
                
            return patientsWithCompletedAppointments;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Patient>> GetPatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound();
            return patient;
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