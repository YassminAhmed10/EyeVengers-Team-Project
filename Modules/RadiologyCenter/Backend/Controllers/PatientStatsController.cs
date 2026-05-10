using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.Models;
using System;
using System.Threading.Tasks;

namespace RadiologyCenterAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    public class PatientStatsController : ControllerBase
    {
        private readonly RadiologyDbContext _context;
        private readonly ILogger<PatientStatsController> _logger;

        public PatientStatsController(RadiologyDbContext context, ILogger<PatientStatsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/patientstats/{patientId}
        // Get patient statistics (scans, appointments, reports count)
        [HttpGet("{patientId}")]
        public async Task<ActionResult<PatientStatsDto>> GetPatientStats(int patientId)
        {
            try
            {
                _logger.LogInformation($"Fetching stats for patient: {patientId}");

                var stats = await _context.PatientStats
                    .FirstOrDefaultAsync(s => s.PatientId == patientId);

                if (stats == null)
                {
                    // Create new stats record if doesn't exist
                    stats = new PatientStats
                    {
                        PatientId = patientId,
                        ScansCount = 0,
                        AppointmentsCount = 0,
                        ReportsCount = 0,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.PatientStats.Add(stats);
                    await _context.SaveChangesAsync();
                }

                return Ok(new PatientStatsDto
                {
                    PatientId = stats.PatientId,
                    ScansCount = stats.ScansCount,
                    AppointmentsCount = stats.AppointmentsCount,
                    ReportsCount = stats.ReportsCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching patient stats: {ex.Message}");
                return StatusCode(500, new { message = "Error fetching statistics" });
            }
        }

        // POST: api/patientstats/{patientId}/increment-scans
        // Increment scans count for patient
        [HttpPost("{patientId}/increment-scans")]
        public async Task<ActionResult<PatientStatsDto>> IncrementScans(int patientId)
        {
            return await IncrementStat(patientId, "ScansCount");
        }

        // POST: api/patientstats/{patientId}/increment-appointments
        // Increment appointments count for patient
        [HttpPost("{patientId}/increment-appointments")]
        public async Task<ActionResult<PatientStatsDto>> IncrementAppointments(int patientId)
        {
            return await IncrementStat(patientId, "AppointmentsCount");
        }

        // POST: api/patientstats/{patientId}/increment-reports
        // Increment reports count for patient
        [HttpPost("{patientId}/increment-reports")]
        public async Task<ActionResult<PatientStatsDto>> IncrementReports(int patientId)
        {
            return await IncrementStat(patientId, "ReportsCount");
        }

        // PUT: api/patientstats/{patientId}/set-stats
        // Directly set all statistics
        [HttpPut("{patientId}/set-stats")]
        public async Task<ActionResult<PatientStatsDto>> SetStats(int patientId, [FromBody] SetStatsRequest request)
        {
            try
            {
                _logger.LogInformation($"Setting stats for patient {patientId}: Scans={request.ScansCount}, Appointments={request.AppointmentsCount}, Reports={request.ReportsCount}");

                var stats = await _context.PatientStats
                    .FirstOrDefaultAsync(s => s.PatientId == patientId);

                if (stats == null)
                {
                    stats = new PatientStats
                    {
                        PatientId = patientId,
                        ScansCount = request.ScansCount,
                        AppointmentsCount = request.AppointmentsCount,
                        ReportsCount = request.ReportsCount,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.PatientStats.Add(stats);
                }
                else
                {
                    stats.ScansCount = request.ScansCount;
                    stats.AppointmentsCount = request.AppointmentsCount;
                    stats.ReportsCount = request.ReportsCount;
                    stats.UpdatedAt = DateTime.UtcNow;

                    _context.PatientStats.Update(stats);
                }

                await _context.SaveChangesAsync();

                return Ok(new PatientStatsDto
                {
                    PatientId = stats.PatientId,
                    ScansCount = stats.ScansCount,
                    AppointmentsCount = stats.AppointmentsCount,
                    ReportsCount = stats.ReportsCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error setting patient stats: {ex.Message}");
                return StatusCode(500, new { message = "Error updating statistics" });
            }
        }

        // Private helper method
        private async Task<ActionResult<PatientStatsDto>> IncrementStat(int patientId, string statType)
        {
            try
            {
                var stats = await _context.PatientStats
                    .FirstOrDefaultAsync(s => s.PatientId == patientId);

                if (stats == null)
                {
                    stats = new PatientStats
                    {
                        PatientId = patientId,
                        ScansCount = 0,
                        AppointmentsCount = 0,
                        ReportsCount = 0,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.PatientStats.Add(stats);
                }

                // Increment appropriate counter
                switch (statType)
                {
                    case "ScansCount":
                        stats.ScansCount++;
                        _logger.LogInformation($"Incremented scans for patient {patientId} to {stats.ScansCount}");
                        break;
                    case "AppointmentsCount":
                        stats.AppointmentsCount++;
                        _logger.LogInformation($"Incremented appointments for patient {patientId} to {stats.AppointmentsCount}");
                        break;
                    case "ReportsCount":
                        stats.ReportsCount++;
                        _logger.LogInformation($"Incremented reports for patient {patientId} to {stats.ReportsCount}");
                        break;
                }

                stats.UpdatedAt = DateTime.UtcNow;
                _context.PatientStats.Update(stats);
                await _context.SaveChangesAsync();

                return Ok(new PatientStatsDto
                {
                    PatientId = stats.PatientId,
                    ScansCount = stats.ScansCount,
                    AppointmentsCount = stats.AppointmentsCount,
                    ReportsCount = stats.ReportsCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error incrementing {statType}: {ex.Message}");
                return StatusCode(500, new { message = "Error updating statistics" });
            }
        }
    }

    // DTOs
    public class PatientStatsDto
    {
        public int PatientId { get; set; }
        public int ScansCount { get; set; }
        public int AppointmentsCount { get; set; }
        public int ReportsCount { get; set; }
    }

    public class SetStatsRequest
    {
        public int ScansCount { get; set; }
        public int AppointmentsCount { get; set; }
        public int ReportsCount { get; set; }
    }
}
