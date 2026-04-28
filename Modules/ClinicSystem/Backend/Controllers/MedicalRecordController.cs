using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models;
using EyeClinicAPI.Models.EMR;
using EyeClinicAPI.DTOs;

using System.Text.RegularExpressions;

namespace EyeClinicAPI.Modules.ClinicSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicalRecordController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;
        private readonly ILogger<MedicalRecordController> _logger;

        public MedicalRecordController(EyeClinicDbContext context, ILogger<MedicalRecordController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetMedicalRecordByPatientId(int patientId)
        {
            try
            {
                _logger.LogInformation("Getting medical record for patient ID: {PatientId}", patientId);

                var record = await _context.MedicalRecords
                    .FirstOrDefaultAsync(m => m.PatientIdentifier == patientId.ToString());

                if (record == null)
                {
                    _logger.LogWarning("No medical record found for patient {PatientId}", patientId);
                    return NotFound(new { message = "Medical record not found" });
                }

                var dto = await MapToDto(record);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting medical record for patient {PatientId}", patientId);
                return StatusCode(500, new { message = "Error retrieving medical record", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMedicalRecordById(int id)
        {
            try
            {
                var record = await _context.MedicalRecords.FindAsync(id);
                if (record == null)
                    return NotFound(new { message = "Medical record not found" });

                var dto = await MapToDto(record);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting medical record {Id}", id);
                return StatusCode(500, new { message = "Error retrieving medical record" });
            }
        }

        [HttpGet("check/{patientId}")]
        public async Task<IActionResult> CheckMedicalRecordExists(int patientId)
        {
            var exists = await _context.MedicalRecords
                .AnyAsync(m => m.PatientIdentifier == patientId.ToString());

            return Ok(new { exists = exists });
        }

        [HttpGet("patient/{patientId}/history")]
        public async Task<IActionResult> GetPatientMedicalHistory(int patientId)
        {
            try
            {
                var record = await _context.MedicalRecords
                    .FirstOrDefaultAsync(m => m.PatientIdentifier == patientId.ToString());

                if (record == null)
                {
                    _logger.LogWarning("No medical record found for patient {PatientId}", patientId);
                    return NotFound(new { message = "Medical record not found" });
                }

                var dto = await MapToDto(record);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting patient medical history for {PatientId}", patientId);
                return StatusCode(500, new { message = "Error retrieving medical history" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateMedicalRecord([FromBody] CreateMedicalRecordRequest request)
        {
            try
            {
                _logger.LogInformation("Creating medical record for patient {PatientId}", request.PatientId);

                if (string.IsNullOrWhiteSpace(request.PatientId))
                {
                    return BadRequest(new { message = "PatientId is required" });
                }

                int? patientId = await ResolvePatientId(request.PatientId);

                if (patientId == null)
                {
                    _logger.LogWarning("Could not resolve patient ID: {PatientId}", request.PatientId);
                    return BadRequest(new { message = "Patient not found or invalid PatientId" });
                }

                var existingRecord = await _context.MedicalRecords
                    .FirstOrDefaultAsync(m => m.PatientIdentifier == patientId.ToString());

                if (existingRecord != null)
                {
                    _logger.LogWarning("Medical record already exists for patient {PatientId}", patientId);
                    return BadRequest(new { message = "Medical record already exists for this patient" });
                }

                var record = new MedicalRecord
                {
                    PatientIdentifier = patientId.ToString(),
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.MedicalRecords.Add(record);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Medical record created with ID {RecordId} for patient {PatientId}", record.Id, patientId);

                var dto = await MapToDto(record);
                return CreatedAtAction(nameof(GetMedicalRecordById), new { id = record.Id }, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating medical record");
                return StatusCode(500, new { message = "Error creating medical record", error = ex.Message });
            }
        }

        [HttpPost("from-appointment")]
        public async Task<IActionResult> CreateMedicalRecordFromAppointment([FromBody] CreateMedicalRecordFromAppointmentRequest request)
        {
            try
            {
                _logger.LogInformation("Creating medical record from appointment {AppointmentId}", request.AppointmentId);

                var appointment = await _context.Appointments.FindAsync(request.AppointmentId);
                if (appointment == null)
                    return NotFound(new { message = "Appointment not found" });

                string? patientId = appointment.PatientId;
                if (string.IsNullOrEmpty(patientId))
                {
                    _logger.LogError("Appointment {AppointmentId} has invalid PatientId", request.AppointmentId);
                    return BadRequest(new { message = "Appointment has no valid PatientId" });
                }

                var existingRecord = await _context.MedicalRecords
                    .FirstOrDefaultAsync(m => m.PatientIdentifier == patientId.ToString());

                if (existingRecord != null)
                {
                    _logger.LogInformation("Medical record already exists for patient {PatientId}", patientId);
                    return Ok(new { message = "Medical record already exists", recordId = existingRecord.Id });
                }

                var record = new MedicalRecord
                {
                    PatientIdentifier = patientId.ToString(),
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.MedicalRecords.Add(record);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Medical record created with ID {RecordId} from appointment {AppointmentId}", record.Id, request.AppointmentId);

                var dto = await MapToDto(record);
                return Ok(new { message = "Medical record created", record = dto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating medical record from appointment {AppointmentId}", request.AppointmentId);
                return StatusCode(500, new { message = "Error creating medical record", error = ex.Message });
            }
        }

        [HttpGet("patient-info/from-appointments")]
        public async Task<IActionResult> GetPatientInfoFromAppointments([FromQuery] string searchValue)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchValue))
                    return BadRequest(new { message = "Search value is required" });

                int? patientId = await ResolvePatientId(searchValue);

                if (patientId == null)
                {
                    _logger.LogWarning("Could not find patient for search value: {SearchValue}", searchValue);
                    return NotFound(new { message = "Patient not found" });
                }

                var appointments = await _context.Appointments
                    .Where(a => a.PatientId == patientId.ToString())
                    .OrderByDescending(a => a.AppointmentDate)
                    .ToListAsync();

                if (!appointments.Any())
                {
                    return NotFound(new { message = "No appointments found for patient" });
                }

                var patientInfo = new
                {
                    PatientIdentifier = patientId.ToString(),
                    appointmentCount = appointments.Count,
                    firstAppointment = appointments.LastOrDefault()?.AppointmentDate,
                    lastAppointment = appointments.FirstOrDefault()?.AppointmentDate,
                    appointments = appointments.Select(a => new
                    {
                        appointmentId = a.AppointmentId,
                        date = a.AppointmentDate,
                        time = a.AppointmentTime,
                        status = a.Status.ToString(),
                        doctorId = a.DoctorId
                    })
                };

                return Ok(patientInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting patient info from appointments");
                return StatusCode(500, new { message = "Error retrieving patient appointments" });
            }
        }

        private async Task<int?> ResolvePatientId(string searchValue)
        {
            if (string.IsNullOrWhiteSpace(searchValue))
                return null;

            if (int.TryParse(searchValue, out var parsedId) && parsedId > 0)
            {
                var patientById = await _context.Patients.FindAsync(parsedId);
                if (patientById != null)
                {
                    _logger.LogInformation("Patient found by ID: {PatientId}", parsedId);
                    return parsedId;
                }
            }

            var emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            if (Regex.IsMatch(searchValue, emailPattern))
            {
                var patientByEmail = await _context.Patients
                    .FirstOrDefaultAsync(p => p.Email == searchValue);
                if (patientByEmail != null)
                {
                    _logger.LogInformation("Patient found by email: {Email}", searchValue);
                    return patientByEmail.Id;
                }
            }

            var phonePattern = @"^\+?1?\d{9,15}$";
            if (Regex.IsMatch(searchValue, phonePattern))
            {
                var patientByPhone = await _context.Patients
                    .FirstOrDefaultAsync(p => p.Phone == searchValue);
                if (patientByPhone != null)
                {
                    _logger.LogInformation("Patient found by phone: {Phone}", searchValue);
                    return patientByPhone.Id;
                }
            }

            var nationalIdPattern = @"^\d{10,14}$";
            if (Regex.IsMatch(searchValue, nationalIdPattern))
            {
                var patientByNationalId = await _context.Patients
                    .FirstOrDefaultAsync(p => p.NationalId == searchValue);
                if (patientByNationalId != null)
                {
                    _logger.LogInformation("Patient found by national ID: {NationalId}", searchValue);
                    return patientByNationalId.Id;
                }
            }

            _logger.LogWarning("Patient not found for search value: {SearchValue}", searchValue);
            return null;
        }

        private async Task<MedicalRecordDto> MapToDto(MedicalRecord record)
        {
            var complaints = await _context.PatientComplaints
                .Where(c => c.MedicalRecordId == record.Id && !c.IsArchived)
                .ToListAsync();

            var histories = await _context.MedicalHistories
                .Where(h => h.MedicalRecordId == record.Id && !h.IsArchived)
                .ToListAsync();

            var investigations = await _context.Investigations
                .Where(i => i.MedicalRecordId == record.Id)
                .ToListAsync();

            var eyeExaminations = await _context.EyeExaminations
                .Where(e => e.MedicalRecordId == record.Id)
                .ToListAsync();

            var operations = await _context.Operations
                .Where(o => o.MedicalRecordId == record.Id && !o.IsArchived)
                .ToListAsync();

            var medicalTestFiles = await _context.MedicalTestFiles
                .Where(t => t.MedicalRecordId == record.Id)
                .ToListAsync();

            var prescriptions = await _context.Prescriptions
                .Include(p => p.Items)
                .Where(p => p.MedicalRecordId == record.Id)
                .ToListAsync();

            var diagnoses = await _context.Diagnoses
                .Where(d => d.MedicalRecordId == record.Id)
                .ToListAsync();

            return new MedicalRecordDto
            {
                Id = record.Id,
                PatientId = record.PatientId,
                CreatedAt = record.CreatedAt,
                UpdatedAt = record.UpdatedAt ?? DateTime.Now,
                Complaints = complaints.Select(c => (object)new { c.Id, c.OriginalText, c.TranslatedText }).ToList(),
                Histories = histories.Select(h => (object)new { h.Id, h.PreviousEye, h.FamilyHistory, h.Allergies }).ToList(),
                Investigations = investigations.Select(i => (object)new { i.Id, i.SelectedInvestigations }).ToList(),
                EyeExaminations = eyeExaminations.Select(e => (object)new { e.Id, e.RightEye }).ToList(),
                Operations = operations.Select(o => (object)new { o.Id, o.Name, o.Date }).ToList(),
                MedicalTestFiles = medicalTestFiles.Select(t => (object)new { t.Id, t.FileName, t.FileUrl }).ToList(),
                Prescriptions = prescriptions.Select(p => (object)new { p.Id, p.Notes, ItemCount = p.Items.Count }).ToList(),
                Diagnoses = diagnoses.Select(d => (object)new { d.Id, d.DiagnosisName, d.Severity }).ToList()
            };
        }
    }

    public class CreateMedicalRecordRequest
    {
        public string PatientId { get; set; } = "";
    }

    public class CreateMedicalRecordFromAppointmentRequest
    {
        public int AppointmentId { get; set; }
    }

    public class MedicalRecordDto
    {
        public int Id { get; set; }
        public int? PatientId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<object> Complaints { get; set; } = new();
        public List<object> Histories { get; set; } = new();
        public List<object> Investigations { get; set; } = new();
        public List<object> EyeExaminations { get; set; } = new();
        public List<object> Operations { get; set; } = new();
        public List<object> MedicalTestFiles { get; set; } = new();
        public List<object> Prescriptions { get; set; } = new();
        public List<object> Diagnoses { get; set; } = new();
    }
}














