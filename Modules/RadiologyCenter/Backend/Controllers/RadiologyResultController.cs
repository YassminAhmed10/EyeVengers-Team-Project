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
    public class RadiologyResultController : ControllerBase
    {
        private readonly RadiologyDbContext _context;
        private readonly ILogger<RadiologyResultController> _logger;

        public RadiologyResultController(RadiologyDbContext context, ILogger<RadiologyResultController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult> GetResultsByPatient(int patientId)
        {
            try
            {
                var results = await _context.RadiologyResults
                    .Where(r => r.Appointment.PatientId == patientId)
                    .ToListAsync();
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching results");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("patient/by-identifier/{identifier}")]
        public async Task<ActionResult> GetResultsByPatientIdentifier(string identifier)
        {
            try
            {
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.Identifier == identifier);
                if (patient == null)
                    return Ok(new List<RadiologyResult>());

                var results = await _context.RadiologyResults
                    .Where(r => r.Appointment.PatientId == patient.Id)
                    .ToListAsync();
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching results");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}