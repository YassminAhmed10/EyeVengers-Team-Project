using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models;
using EyeClinicAPI.Models.EMR;
using System.Text.RegularExpressions;
using System.Text.Json.Serialization;

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

        // ── GET patient/{patientId} ───────────────────────────────────────────
        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetMedicalRecordByPatientId(string patientId)
        {
            try
            {
                var record = await FindMedicalRecordByPatientKey(patientId);
                if (record == null)
                    return NotFound(new { message = "Medical record not found", patientId });
                var dto = await MapToDto(record);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting medical record for patient {PatientId}", patientId);
                return StatusCode(500, new { message = "Error retrieving medical record", error = ex.Message });
            }
        }

        // ── GET {id} ──────────────────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMedicalRecordById(int id)
        {
            try
            {
                var record = await _context.MedicalRecords.FindAsync(id);
                if (record == null) return NotFound(new { message = "Medical record not found" });
                var dto = await MapToDto(record);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting medical record {Id}", id);
                return StatusCode(500, new { message = "Error retrieving medical record" });
            }
        }

        // ── GET check/{patientId} ─────────────────────────────────────────────
        [HttpGet("check/{patientId}")]
        public async Task<IActionResult> CheckMedicalRecordExists(string patientId)
        {
            if (string.IsNullOrWhiteSpace(patientId))
                return BadRequest(new { message = "Patient ID is required" });

            var record = await FindMedicalRecordByPatientKey(patientId);
            return Ok(new
            {
                exists = record != null,
                recordId = record?.Id,
                patientIdentifier = record?.PatientIdentifier,
            });
        }

        // ── GET appointment-info/{patientId} ──────────────────────────────────
        [HttpGet("appointment-info/{patientId}")]
        public async Task<IActionResult> GetAppointmentInfo(string patientId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(patientId))
                    return BadRequest(new { message = "Patient ID is required" });

                _logger.LogInformation("[GetAppointmentInfo] Fetching data for patientId: {PatientId}", patientId);

                var numericId = ExtractNumericId(patientId);
                
                var appointment = await _context.Appointments
                    .Where(a => a.PatientId == patientId || a.PatientId == numericId)
                    .OrderByDescending(a => a.AppointmentDate)
                    .FirstOrDefaultAsync();

                if (appointment != null)
                {
                    var genderStr = appointment.PatientGender == PatientGender.Male ? "Male" 
                                  : appointment.PatientGender == PatientGender.Female ? "Female" 
                                  : "";

                    // ✅ Fix: Convert TimeSpan to string safely
                    string appointmentTimeStr = "";
                    if (appointment.AppointmentTime != default)
                    {
                        appointmentTimeStr = appointment.AppointmentTime.ToString();
                    }

                    return Ok(new
                    {
                        patientId = appointment.PatientId,
                        patientName = appointment.PatientName ?? "",
                        patientIdentifier = appointment.PatientId,
                        gender = genderStr,
                        patientGender = (int)appointment.PatientGender,
                        birthDate = appointment.PatientBirthDate,
                        age = appointment.Age,
                        nationalId = appointment.NationalId ?? "",
                        phone = appointment.Phone ?? "",
                        email = appointment.Email ?? "",
                        address = appointment.Address ?? "",
                        insuranceCompany = appointment.InsuranceCompany ?? "",
                        insuranceId = appointment.InsuranceId ?? "",
                        policyNumber = appointment.PolicyNumber ?? "",
                        coverage = appointment.Coverage ?? "",
                        coverageType = appointment.CoverageType ?? "",
                        emergencyContactName = appointment.EmergencyContactName ?? "",
                        emergencyContactPhone = appointment.EmergencyContactPhone ?? "",
                        reasonForVisit = appointment.ReasonForVisit ?? "",
                        appointmentDate = appointment.AppointmentDate,
                        appointmentTime = appointmentTimeStr,
                        chronicDiseases = appointment.ChronicDiseases ?? "",
                        currentMedications = appointment.CurrentMedications ?? "",
                        eyeAllergies = appointment.EyeAllergies ?? "",
                        familyEyeDiseases = appointment.FamilyEyeDiseases ?? "",
                        visionSymptoms = appointment.VisionSymptoms ?? "",
                        eyeSurgeries = appointment.EyeSurgeries ?? "",
                        otherEyeSurgeries = appointment.OtherEyeSurgeries ?? ""
                    });
                }

                return NotFound(new { message = "Patient information not found", patientId = patientId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting appointment info for patient {PatientId}", patientId);
                return StatusCode(500, new { message = "Error retrieving appointment information", error = ex.Message });
            }
        }

        // ── GET get-or-create/{patientId} ─────────────────────────────────────
        [HttpGet("get-or-create/{patientId}")]
        public async Task<IActionResult> GetOrCreateMedicalRecord(string patientId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(patientId))
                    return BadRequest(new { exists = false, message = "Patient ID is required" });

                var record = await FindMedicalRecordByPatientKey(patientId);
                if (record != null)
                    return Ok(new { exists = true, recordId = record.Id, patientIdentifier = record.PatientIdentifier });

                // Get latest appointment for VisitDate
                var latestAppointment = await _context.Appointments
                    .Where(a => a.PatientId == patientId)
                    .OrderByDescending(a => a.AppointmentDate)
                    .FirstOrDefaultAsync();

                DateTime visitDate = DateTime.Now;
                if (latestAppointment != null && latestAppointment.AppointmentDate != default)
                {
                    visitDate = latestAppointment.AppointmentDate;
                }

                record = new MedicalRecord 
                { 
                    PatientIdentifier = patientId, 
                    VisitDate = visitDate,
                    CreatedAt = DateTime.Now, 
                    UpdatedAt = DateTime.Now 
                };
                
                _context.MedicalRecords.Add(record);
                await _context.SaveChangesAsync();

                return Ok(new { exists = true, recordId = record.Id, patientIdentifier = record.PatientIdentifier });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetOrCreateMedicalRecord");
                return StatusCode(500, new { exists = false, message = ex.Message });
            }
        }

        // ── POST create-for-patient ───────────────────────────────────────────
        [HttpPost("create-for-patient")]
        public async Task<IActionResult> CreateMedicalRecordForPatient([FromBody] CreateMedicalRecordForPatientRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { success = false, message = "Request body is required" });

                if (string.IsNullOrWhiteSpace(request.PatientId))
                    return BadRequest(new { success = false, message = "Patient ID is required" });

                _logger.LogInformation("Creating medical record for patient: {PatientId}", request.PatientId);

                // Check if medical record already exists
                var record = await FindMedicalRecordByPatientKey(request.PatientId);
                if (record != null)
                {
                    return Ok(new { success = true, recordId = record.Id, patientIdentifier = record.PatientIdentifier, message = "Medical record already exists" });
                }

                // Get latest appointment for VisitDate
                var latestAppointment = await _context.Appointments
                    .Where(a => a.PatientId == request.PatientId)
                    .OrderByDescending(a => a.AppointmentDate)
                    .FirstOrDefaultAsync();

                DateTime visitDate = DateTime.Now;
                if (latestAppointment != null && latestAppointment.AppointmentDate != default)
                {
                    visitDate = latestAppointment.AppointmentDate;
                }

                // Try to find patient in Patients table
                int? resolvedPatientId = null;
                var patient = await _context.Patients
                    .FirstOrDefaultAsync(p => p.Id.ToString() == request.PatientId || 
                                              p.Email == request.PatientId || 
                                              p.Phone == request.PatientId);
                
                if (patient != null)
                {
                    resolvedPatientId = patient.Id;
                }

                // Create new medical record
                record = new MedicalRecord
                {
                    PatientIdentifier = request.PatientId,
                    PatientId = resolvedPatientId,
                    VisitDate = visitDate,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.MedicalRecords.Add(record);
                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Medical record created successfully for patient {PatientId} with ID: {RecordId}", 
                    request.PatientId, record.Id);

                return Ok(new { success = true, recordId = record.Id, patientIdentifier = record.PatientIdentifier, message = "Medical record created successfully" });
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error creating medical record for patient {PatientId}", request?.PatientId);
                return StatusCode(500, new { success = false, message = $"Database error: {ex.InnerException?.Message ?? ex.Message}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating medical record for patient {PatientId}", request?.PatientId);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ── POST (create) ─────────────────────────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> CreateMedicalRecord([FromBody] CreateMedicalRecordRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { success = false, message = "Request body is required" });

                var identifier = NormalizePatientKey(request.PatientIdentifier, request.PatientId);
                if (string.IsNullOrWhiteSpace(identifier))
                    return BadRequest(new { success = false, message = "PatientId is required" });

                var existing = await FindMedicalRecordByPatientKey(identifier);
                if (existing != null)
                    return Ok(new { message = "Medical record already exists", id = existing.Id, success = true, recordId = existing.Id, patientIdentifier = existing.PatientIdentifier });

                // Get latest appointment for VisitDate
                var latestAppointment = await _context.Appointments
                    .Where(a => a.PatientId == identifier)
                    .OrderByDescending(a => a.AppointmentDate)
                    .FirstOrDefaultAsync();

                DateTime visitDate = DateTime.Now;
                if (latestAppointment != null && latestAppointment.AppointmentDate != default)
                {
                    visitDate = latestAppointment.AppointmentDate;
                }

                var record = new MedicalRecord 
                { 
                    PatientIdentifier = identifier,
                    VisitDate = visitDate,
                    CreatedAt = DateTime.Now, 
                    UpdatedAt = DateTime.Now 
                };
                
                _context.MedicalRecords.Add(record);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetMedicalRecordById), new { id = record.Id }, new
                {
                    message = "Medical record created successfully",
                    id = record.Id,
                    success = true,
                    recordId = record.Id,
                    patientIdentifier = record.PatientIdentifier
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating medical record");
                return StatusCode(500, new { message = "Error creating medical record", error = ex.Message });
            }
        }

        // ── Helpers ───────────────────────────────────────────────────────────
        private async Task<MedicalRecord?> FindMedicalRecordByPatientKey(string patientKey)
        {
            var key = patientKey.Trim();
            var num = ExtractNumericId(key);

            var match = await _context.MedicalRecords.FirstOrDefaultAsync(m => m.PatientIdentifier == key);
            if (match != null) return match;

            if (!string.IsNullOrEmpty(num))
            {
                var candidates = await _context.MedicalRecords
                    .Where(m => m.PatientIdentifier != null && m.PatientIdentifier.Contains(num))
                    .ToListAsync();
                match = candidates.FirstOrDefault(m => ExtractNumericId(m.PatientIdentifier ?? "") == num);
                if (match != null) return match;
            }

            if (!string.IsNullOrEmpty(num) && int.TryParse(num, out var numericPatientId))
            {
                match = await _context.MedicalRecords.FirstOrDefaultAsync(m => m.PatientId == numericPatientId);
                if (match != null) return match;
            }

            return null;
        }

        private static string ExtractNumericId(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return string.Empty;
            return Regex.Replace(value, "[^0-9]", "");
        }

        private static string NormalizePatientKey(string? primary, string? fallback = null)
        {
            var p = primary?.Trim();
            return !string.IsNullOrWhiteSpace(p) ? p : (fallback?.Trim() ?? string.Empty);
        }

        private async Task<MedicalRecordDto> MapToDto(MedicalRecord record)
        {
            var complaints = await _context.PatientComplaints
                .Where(c => c.MedicalRecordId == record.Id && !c.IsArchived)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
                
            var histories = await _context.MedicalHistories
                .Where(h => h.MedicalRecordId == record.Id && !h.IsArchived)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();
                
            var investigations = await _context.Investigations
                .Where(i => i.MedicalRecordId == record.Id)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
                
            var eyeExaminations = await _context.EyeExaminations
                .Where(e => e.MedicalRecordId == record.Id && !e.IsArchived)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
                
            var operations = await _context.Operations
                .Where(o => o.MedicalRecordId == record.Id && !o.IsArchived)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
                
            var medicalTestFiles = await _context.MedicalTestFiles
                .Where(t => t.MedicalRecordId == record.Id)
                .ToListAsync();
                
            var prescriptions = await _context.Prescriptions
                .Include(p => p.Items)
                .Where(p => p.MedicalRecordId == record.Id)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
                
            var diagnoses = await _context.Diagnoses
                .Where(d => d.MedicalRecordId == record.Id)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            var appointment = await _context.Appointments
                .Where(a => a.PatientId == record.PatientIdentifier)
                .OrderByDescending(a => a.AppointmentDate)
                .FirstOrDefaultAsync();

            return new MedicalRecordDto
            {
                Id = record.Id,
                PatientId = record.PatientId,
                PatientIdentifier = record.PatientIdentifier,
                CreatedAt = record.CreatedAt,
                UpdatedAt = record.UpdatedAt ?? DateTime.Now,
                Name = appointment?.PatientName ?? "",
                Age = appointment?.Age != null ? int.Parse(appointment.Age) : null,
                Gender = appointment?.PatientGender == PatientGender.Male ? "Male" : appointment?.PatientGender == PatientGender.Female ? "Female" : null,
                ContactNumber = appointment?.Phone ?? "",
                Email = appointment?.Email ?? "",
                Address = appointment?.Address ?? "",
                BirthDate = appointment?.PatientBirthDate,
                NationalId = appointment?.NationalId ?? "",
                InsuranceCompany = appointment?.InsuranceCompany ?? "",
                InsuranceId = appointment?.InsuranceId ?? "",
                PolicyNumber = appointment?.PolicyNumber ?? "",
                Coverage = appointment?.Coverage ?? "",
                EmergencyContactName = appointment?.EmergencyContactName ?? "",
                EmergencyContactPhone = appointment?.EmergencyContactPhone ?? "",
                VisitDate = record.VisitDate.ToString("yyyy-MM-dd"),
                Complaints = complaints.Select(c => (object)new { c.Id, c.OriginalText, c.Complaint, c.TranslatedText, c.CreatedAt }).ToList(),
                Histories = histories.Select(h => (object)new { h.Id, h.PreviousEye, h.FamilyHistory, h.Allergies, h.ChronicDiseases, h.CurrentMedications, h.EyeSurgeries, h.FamilyEyeDiseases, h.VisionSymptoms, h.CreatedAt }).ToList(),
                Investigations = investigations.Select(i => (object)new { i.Id, i.MedicalRecordId, i.SelectedInvestigations, i.Notes, i.Result, i.CreatedAt }).ToList(),
                EyeExaminations = eyeExaminations.Select(e => (object)new { e.Id, e.MedicalRecordId, e.RightEye, e.LeftEye, e.EyePressure, e.PupilReaction, e.EyeAlignment, e.EyeMovements, e.AnteriorSegment, e.FundusObservation, e.VisualAcuity, e.OtherNotes, e.CreatedAt }).ToList(),
                Operations = operations.Select(o => (object)new { o.Id, o.OperationName, o.Date, o.Eye, o.Surgeon, o.Notes, o.CreatedAt }).ToList(),
                MedicalTestFiles = medicalTestFiles.Select(t => (object)new { t.Id, t.FileName, t.FilePath, t.CreatedAt }).ToList(),
                Prescriptions = prescriptions.Select(p => (object)new { p.Id, p.Notes, p.CreatedAt, Items = p.Items.Select(i => new { i.Drug, i.Form, i.Dose, i.CustomDose, i.Frequency, i.CustomFrequency, i.Duration, i.Notes }).ToList() }).ToList(),
                Diagnoses = diagnoses.Select(d => (object)new { d.Id, d.DiagnosisName, d.ICD10Code, d.Severity, d.Status, d.Notes, d.CreatedAt }).ToList()
            };
        }
    }

    // ===================== DTOs =====================

    public class CreateMedicalRecordRequest
    {
        [JsonPropertyName("patientId")]
        public string? PatientId { get; set; }
        
        [JsonPropertyName("patientIdentifier")]
        public string? PatientIdentifier { get; set; }
    }

    public class CreateMedicalRecordForPatientRequest
    {
        [JsonPropertyName("patientId")]
        public string PatientId { get; set; } = string.Empty;
    }

    public class MedicalRecordDto
    {
        public int Id { get; set; }
        public int? PatientId { get; set; }
        public string? PatientIdentifier { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? Name { get; set; }
        public int? Age { get; set; }
        public string? Gender { get; set; }
        public string? ContactNumber { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? NationalId { get; set; }
        public string? InsuranceCompany { get; set; }
        public string? InsuranceId { get; set; }
        public string? PolicyNumber { get; set; }
        public string? Coverage { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? VisitDate { get; set; }
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