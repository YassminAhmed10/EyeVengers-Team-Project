using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models;
using EyeClinicAPI.Models.EMR;
using EyeClinicAPI.DTOs;
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
                exists            = record != null,
                recordId          = record?.Id,
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

                var numericId = ExtractNumericId(patientId);
                Patient? patient = null;

                if (!string.IsNullOrEmpty(numericId))
                    patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id.ToString() == numericId);
                if (patient == null)
                    patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id.ToString() == patientId);

                if (patient != null)
                {
                    var mr = await _context.MedicalRecords
                        .Where(m => m.PatientId == patient.Id)
                        .OrderByDescending(m => m.CreatedAt)
                        .FirstOrDefaultAsync();

                    return Ok(new
                    {
                        patientId              = patient.Id,
                        patientIdentifier      = mr?.PatientIdentifier,
                        medicalRecordId        = mr?.Id,
                        name                   = $"{patient.FirstName} {patient.LastName}".Trim(),
                        firstName              = patient.FirstName,
                        lastName               = patient.LastName,
                        email                  = patient.Email,
                        phone                  = patient.Phone,
                        address                = patient.Address,
                        gender                 = patient.Gender,
                        birthDate              = patient.DateOfBirth,
                        age                    = CalcAge(patient.DateOfBirth),
                        nationalId             = patient.NationalId,
                        insuranceCompany       = patient.InsuranceCompany,
                        insuranceId            = patient.InsuranceId,
                        emergencyContactName   = patient.EmergencyContactName,
                        emergencyContactPhone  = patient.EmergencyContactPhone,
                    });
                }

                var appointment = await _context.Appointments
                    .Where(a => a.PatientId == patientId || a.PatientId == numericId)
                    .OrderByDescending(a => a.AppointmentDate)
                    .FirstOrDefaultAsync();

                if (appointment != null)
                {
                    return Ok(new
                    {
                        patientId              = appointment.PatientId,
                        patientIdentifier      = appointment.PatientId,
                        medicalRecordId        = (int?)null,
                        name                   = appointment.PatientName,
                        email                  = appointment.Email,
                        phone                  = appointment.Phone,
                        address                = appointment.Address,
                        gender                 = appointment.PatientGender == PatientGender.Male ? "Male" : appointment.PatientGender == PatientGender.Female ? "Female" : "",
                        birthDate              = appointment.PatientBirthDate,
                        age                    = CalcAge(appointment.PatientBirthDate),
                        nationalId             = appointment.NationalId,
                        emergencyContactName   = appointment.EmergencyContactName,
                        emergencyContactPhone  = appointment.EmergencyContactPhone,
                        // Insurance Info
                        insuranceCompany       = appointment.InsuranceCompany,
                        insuranceId            = appointment.InsuranceId,
                        policyNumber           = appointment.PolicyNumber,
                        coverage               = appointment.Coverage,
                        coverageType           = appointment.CoverageType,
                        insuranceExpiryDate    = appointment.InsuranceExpiryDate,
                        insuranceContact       = appointment.InsuranceContact,
                        // Appointment Info
                        reasonForVisit         = appointment.ReasonForVisit,
                        appointmentDate        = appointment.AppointmentDate,
                        appointmentTime        = appointment.AppointmentTime,
                        finalPrice             = appointment.FinalPrice
                    });
                }

                return NotFound(new { message = "Patient information not found" });
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

                record = new MedicalRecord { PatientIdentifier = patientId, CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now };
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
                if (string.IsNullOrWhiteSpace(request.PatientId))
                    return BadRequest(new { success = false, message = "Patient ID is required" });

                var record = await FindMedicalRecordByPatientKey(request.PatientId);
                if (record != null)
                    return Ok(new { success = true, recordId = record.Id, patientIdentifier = record.PatientIdentifier });

                record = new MedicalRecord { PatientIdentifier = request.PatientId, CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now };
                _context.MedicalRecords.Add(record);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, recordId = record.Id, patientIdentifier = record.PatientIdentifier });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating medical record");
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

                var record = new MedicalRecord { PatientIdentifier = identifier, CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now };
                _context.MedicalRecords.Add(record);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetMedicalRecordById), new { id = record.Id }, new
                {
                    message = "Medical record created successfully",
                    id = record.Id, success = true, recordId = record.Id, patientIdentifier = record.PatientIdentifier
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

        private static int? CalcAge(DateTime? dob)
        {
            if (!dob.HasValue || dob.Value == default) return null;
            var today = DateTime.Today;
            var age = today.Year - dob.Value.Year;
            if (dob.Value.Date > today.AddYears(-age)) age--;
            return age;
        }

        private async Task<MedicalRecordDto> MapToDto(MedicalRecord record)
        {
            var complaints       = await _context.PatientComplaints.Where(c => c.MedicalRecordId == record.Id && !c.IsArchived).OrderByDescending(c => c.CreatedAt).ToListAsync();
            var histories        = await _context.MedicalHistories.Where(h => h.MedicalRecordId == record.Id && !h.IsArchived).OrderByDescending(h => h.CreatedAt).ToListAsync();
            var investigations   = await _context.Investigations.Where(i => i.MedicalRecordId == record.Id).OrderByDescending(i => i.CreatedAt).ToListAsync();
            var eyeExaminations  = await _context.EyeExaminations.Where(e => e.MedicalRecordId == record.Id && !e.IsArchived).OrderByDescending(e => e.CreatedAt).ToListAsync();
            var operations       = await _context.Operations.Where(o => o.MedicalRecordId == record.Id && !o.IsArchived).OrderByDescending(o => o.CreatedAt).ToListAsync();
            var medicalTestFiles = await _context.MedicalTestFiles.Where(t => t.MedicalRecordId == record.Id).ToListAsync();
            var prescriptions    = await _context.Prescriptions.Include(p => p.Items).Where(p => p.MedicalRecordId == record.Id).OrderByDescending(p => p.CreatedAt).ToListAsync();
            var diagnoses        = await _context.Diagnoses.Where(d => d.MedicalRecordId == record.Id).OrderByDescending(d => d.CreatedAt).ToListAsync();

            // ── Patient info: Patients table → Appointments fallback ──────────
            Patient? patient = null;
            if (record.PatientId.HasValue)
                patient = await _context.Patients.FindAsync(record.PatientId.Value);

            // Also try by PatientIdentifier → Patients.PatientIdentifier
            if (patient == null && !string.IsNullOrEmpty(record.PatientIdentifier))
                patient = await _context.Patients
                    .FirstOrDefaultAsync(p => p.PatientIdentifier == record.PatientIdentifier);

            Appointment? appointment = null;
            if (patient == null && !string.IsNullOrEmpty(record.PatientIdentifier))
                appointment = await _context.Appointments
                    .Where(a => a.PatientId == record.PatientIdentifier)
                    .OrderByDescending(a => a.AppointmentDate)
                    .FirstOrDefaultAsync();

            // ── Derive fields ─────────────────────────────────────────────────
            DateTime? birthDate = patient?.DateOfBirth ?? appointment?.PatientBirthDate;
            int? age = CalcAge(birthDate);

            string? gender = null;
            if (patient != null && !string.IsNullOrEmpty(patient.Gender))
                gender = patient.Gender;
            else if (appointment != null)
                gender = appointment.PatientGender == PatientGender.Male ? "Male"
                       : appointment.PatientGender == PatientGender.Female ? "Female"
                       : null;

            string? address = !string.IsNullOrEmpty(patient?.Address)
                ? patient.Address
                : appointment?.Address;

            string? emergencyName  = patient?.EmergencyContactName  ?? appointment?.EmergencyContactName;
            string? emergencyPhone = patient?.EmergencyContactPhone ?? appointment?.EmergencyContactPhone;

            return new MedicalRecordDto
            {
                Id                = record.Id,
                PatientId         = record.PatientId,
                PatientIdentifier = record.PatientIdentifier,
                CreatedAt         = record.CreatedAt,
                UpdatedAt         = record.UpdatedAt ?? DateTime.Now,

                Name                  = patient != null ? $"{patient.FirstName} {patient.LastName}".Trim() : appointment?.PatientName ?? "",
                Age                   = age,
                Gender                = gender,
                ContactNumber         = patient?.Phone ?? appointment?.Phone,
                Email                 = patient?.Email ?? appointment?.Email,
                Address               = address,
                BirthDate             = birthDate,
                NationalId            = patient?.NationalId ?? appointment?.NationalId,
                InsuranceCompany      = patient?.InsuranceCompany ?? appointment?.InsuranceCompany,
                InsuranceId           = patient?.InsuranceId ?? appointment?.InsuranceId,
                PolicyNumber          = appointment?.PolicyNumber,
                Coverage              = appointment?.Coverage,
                EmergencyContactName  = emergencyName,
                EmergencyContactPhone = emergencyPhone,
                VisitDate = record.VisitDate != default
                    ? record.VisitDate.ToString("yyyy-MM-dd")
                    : DateTime.Now.ToString("yyyy-MM-dd"),

                // ── Medical data — full mapping with all fields ───────────────
                Complaints = complaints.Select(c => (object)new {
                    id = c.Id, complaint = c.OriginalText ?? c.Complaint ?? "",
                    originalText = c.OriginalText, translatedText = c.TranslatedText,
                    createdAt = c.CreatedAt
                }).ToList(),

                Histories = histories.Select(h => (object)new {
                    id = h.Id, previousEye = h.PreviousEye, familyHistory = h.FamilyHistory,
                    allergies = h.Allergies, chronicDiseases = h.ChronicDiseases,
                    currentMedications = h.CurrentMedications, eyeSurgeries = h.EyeSurgeries,
                    familyEyeDiseases = h.FamilyEyeDiseases, visionSymptoms = h.VisionSymptoms,
                    pastMedicalHistory = h.PreviousEye, createdAt = h.CreatedAt
                }).ToList(),

                Investigations = investigations.Select(i => (object)new {
                    id = i.Id, medicalRecordId = i.MedicalRecordId,
                    selectedInvestigations = i.SelectedInvestigations,
                    notes = i.Notes, result = i.Result ?? "",
                    createdAt = i.CreatedAt, updatedAt = i.UpdatedAt
                }).ToList(),

                EyeExaminations = eyeExaminations.Select(e => (object)new {
                    id = e.Id, medicalRecordId = e.MedicalRecordId,
                    rightEye = e.RightEye, leftEye = e.LeftEye,
                    eyePressure = e.EyePressure, pupilReaction = e.PupilReaction,
                    pupilReactionOther = e.PupilReactionOther,
                    eyeAlignment = e.EyeAlignment, eyeAlignmentOther = e.EyeAlignmentOther,
                    eyeMovements = e.EyeMovements, eyeMovementsOther = e.EyeMovementsOther,
                    anteriorSegment = e.AnteriorSegment, fundusObservation = e.FundusObservation,
                    posteriorSegment = e.PosteriorSegment ?? "",
                    visualAcuity = e.VisualAcuity ?? "",
                    otherNotes = e.OtherNotes, createdAt = e.CreatedAt
                }).ToList(),

                Operations = operations.Select(o => (object)new {
                    id = o.Id, name = o.Name ?? o.OperationName,
                    operationName = o.OperationName ?? o.Name,
                    date = o.Date, eye = o.Eye ?? "",
                    surgeon = o.Surgeon ?? "", anesthesia = o.Anesthesia ?? "",
                    status = o.Status ?? "", complications = o.Complications ?? "",
                    notes = o.Notes ?? o.SpecialInstructions ?? "",
                    createdAt = o.CreatedAt
                }).ToList(),

                MedicalTestFiles = medicalTestFiles.Select(t => (object)new {
                    id = t.Id, fileName = t.FileName, fileUrl = t.FileUrl,
                    filePath = t.FilePath ?? "", createdAt = t.CreatedAt
                }).ToList(),

                Prescriptions = prescriptions.Select(p => (object)new {
                    id = p.Id, notes = p.Notes, createdAt = p.CreatedAt,
                    items = p.Items != null
                        ? p.Items.Select(item => (object)new {
                            drug = item.Drug, form = item.Form,
                            dose = item.Dose, customDose = item.CustomDose ?? "",
                            frequency = item.Frequency, customFrequency = item.CustomFrequency ?? "",
                            duration = item.Duration ?? "", notes = item.Notes
                          }).ToList()
                        : new List<object>()
                }).ToList(),

                Diagnoses = diagnoses.Select(d => (object)new {
                    id = d.Id, diagnosisName = d.DiagnosisName,
                    diagnosis = d.DiagnosisName,
                    icd10Code = d.ICD10Code ?? "",
                    severity = d.Severity, status = d.Status ?? "",
                    notes = d.Notes ?? "", checkupDate = d.CheckupDate,
                    createdAt = d.CreatedAt
                }).ToList(),
            };
        }
    }

    public class CreateMedicalRecordRequest
    {
        [JsonPropertyName("patientId")]         public string? PatientId { get; set; }
        [JsonPropertyName("patientIdentifier")]  public string? PatientIdentifier { get; set; }
    }

    public class CreateMedicalRecordForPatientRequest { public string PatientId { get; set; } = ""; }

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