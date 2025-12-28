using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models;
using Microsoft.Extensions.Logging;

namespace EyeClinicAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(EyeClinicDbContext context, ILogger<DashboardController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("Stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var today = DateTime.Today;
                var tomorrow = today.AddDays(1);

                var stats = new
                {
                    TotalAppointments = await _context.Appointments.CountAsync(),
                    CompletedAppointments = await _context.Appointments
                        .CountAsync(a => a.Status == AppointmentStatus.Completed),
                    TodayAppointments = await _context.Appointments
                        .CountAsync(a => a.AppointmentDate >= today && a.AppointmentDate < tomorrow),
                    UpcomingAppointments = await _context.Appointments
                        .CountAsync(a => a.Status == AppointmentStatus.Upcoming &&
                               a.AppointmentDate >= today),
                    CancelledAppointments = await _context.Appointments
                        .CountAsync(a => a.Status == AppointmentStatus.Cancelled)
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard stats");
                return StatusCode(500, "Error loading dashboard statistics");
            }
        }

        [HttpGet("Today")]
        public async Task<IActionResult> GetTodayAppointments()
        {
            try
            {
                var today = DateTime.Today;
                var tomorrow = today.AddDays(1);
                var appointments = await _context.Appointments
                    .Where(a => a.AppointmentDate >= today && a.AppointmentDate < tomorrow)
                    .Include(a => a.Doctor)
                    .OrderBy(a => a.AppointmentTime)
                    .Select(a => new
                    {
                        Time = a.AppointmentTime.ToString(@"hh\:mm"),
                        a.PatientName,
                        a.PatientId,
                        Status = a.Status.ToString(),
                        Doctor = a.Doctor != null ? a.Doctor.FullName : "N/A"
                    })
                    .ToListAsync();

                return Ok(appointments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting today's appointments");
                return StatusCode(500, "Error loading today's appointments");
            }
        }

        [HttpGet("Gender")]
        public async Task<IActionResult> GetGenderStats()
        {
            try
            {
                var maleCount = await _context.Appointments
                    .CountAsync(a => a.PatientGender == PatientGender.Male);

                var femaleCount = await _context.Appointments
                    .CountAsync(a => a.PatientGender == PatientGender.Female);

                return Ok(new
                {
                    Male = maleCount,
                    Female = femaleCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting gender stats");
                return StatusCode(500, "Error loading gender statistics");
            }
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAllAppointments()
        {
            try
            {
                var appointments = await _context.Appointments
                    .Include(a => a.Doctor)
                    .OrderBy(a => a.AppointmentDate)
                    .ThenBy(a => a.AppointmentTime)
                    .Select(a => new
                    {
                        a.AppointmentId,
                        Date = a.AppointmentDate.ToString("yyyy-MM-dd"),
                        Time = a.AppointmentTime.ToString(@"hh\:mm"),
                        a.PatientName,
                        a.PatientId,
                        a.Phone,
                        a.Email,
                        Status = a.Status.ToString(),
                        Gender = a.PatientGender.ToString(),
                        Doctor = a.Doctor != null ? a.Doctor.FullName : "N/A"
                    })
                    .ToListAsync();

                return Ok(appointments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all appointments");
                return StatusCode(500, "Error loading appointments");
            }
        }
    }
}