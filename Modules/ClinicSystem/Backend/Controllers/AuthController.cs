#nullable disable
using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.DTOs;
using EyeClinicAPI.Models;
using EyeClinicAPI.Services;
using PatientModel = EyeClinicAPI.Models.EMR.Patient;

namespace EyeClinicAPI.Modules.ClinicSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;
        private readonly ILogger<AuthController> _logger;
        private readonly IEmailService _emailService;

        public AuthController(EyeClinicDbContext context, ILogger<AuthController> logger, IEmailService emailService)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                _logger.LogInformation("Login attempt for email: {Email}", request.Email);

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                    return Unauthorized(new { message = "Invalid email or password" });

                bool passwordValid;
                if (!string.IsNullOrWhiteSpace(user.PasswordHash) && user.PasswordHash.StartsWith("$2"))
                    passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
                else
                    passwordValid = user.PasswordHash == request.Password;

                if (!passwordValid)
                    return Unauthorized(new { message = "Invalid email or password" });

                object patientInfo = null;

                if (user.Role == "Patient")
                {
                    // ── Get or create Patient record ──────────────────────────
                    var patients = await _context.Patients
                        .Where(p => p.Email == user.Email)
                        .OrderBy(p => p.CreatedAt)
                        .ToListAsync();

                    PatientModel patient = null;

                    if (patients.Count > 0)
                    {
                        patient = patients.First();
                    }
                    else
                    {
                        var nameParts = (user.Username ?? "").Split(' ');
                        patient = new PatientModel
                        {
                            FirstName  = nameParts.Length > 0 ? nameParts[0] : "Patient",
                            LastName   = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "",
                            Email      = user.Email,
                            DateOfBirth = DateTime.Now.AddYears(-30),
                            Gender     = "Not Specified",
                            Phone      = "",
                            Address    = "",
                            NationalId = "",
                            InsuranceCompany  = "",
                            InsuranceId       = "",
                            EmergencyContactName  = "",
                            EmergencyContactPhone = "",
                            CreatedAt  = DateTime.UtcNow
                        };
                        _context.Patients.Add(patient);
                        await _context.SaveChangesAsync();
                    }

                    if (patient != null)
                    {
                        // ── Look up the PatientIdentifier from Patient or MedicalRecords ──
                        // PatientIdentifier (P-XXXXXX) is the PRIMARY display ID
                        string patientIdentifier = patient.PatientIdentifier;  // Try Patient.PatientIdentifier first
                        
                        var medicalRecord = await _context.MedicalRecords
                            .Where(mr => mr.PatientId == patient.Id)
                            .OrderByDescending(mr => mr.CreatedAt)
                            .FirstOrDefaultAsync();

                        // If not found in Patient, look in MedicalRecords
                        if (string.IsNullOrWhiteSpace(patientIdentifier) && medicalRecord != null)
                        {
                            patientIdentifier = medicalRecord.PatientIdentifier;
                        }

                        // If still not found by PatientId, try by email via Appointments
                        if (string.IsNullOrWhiteSpace(patientIdentifier) && medicalRecord == null)
                        {
                            var appointment = await _context.Appointments
                                .Where(a => a.Email == user.Email)
                                .OrderByDescending(a => a.AppointmentDate)
                                .FirstOrDefaultAsync();

                            if (appointment != null)
                            {
                                medicalRecord = await _context.MedicalRecords
                                    .Where(mr => mr.PatientIdentifier == appointment.PatientId)
                                    .OrderByDescending(mr => mr.CreatedAt)
                                    .FirstOrDefaultAsync();
                            }
                        }

                        // Ensure MedicalRecord.PatientId is linked to this patient
                        if (medicalRecord != null && medicalRecord.PatientId != patient.Id)
                        {
                            medicalRecord.PatientId = patient.Id;
                            await _context.SaveChangesAsync();
                        }

                        // Calculate age
                        int? age = null;
                        if (patient.DateOfBirth != default)
                        {
                            var today = DateTime.Today;
                            age = today.Year - patient.DateOfBirth.Year;
                            if (patient.DateOfBirth.Date > today.AddYears(-age.Value)) age--;
                        }

                        patientInfo = new
                        {
                            // Numeric DB primary key — used for DoctorOrders, internal joins
                            id = patient.Id,

                            // P-XXXXXX — THE primary display & EMR lookup ID
                            patientIdentifier = patientIdentifier,

                            // MedicalRecord numeric ID — used by DoctorOrdersTab history
                            medicalRecordId = medicalRecord?.Id,

                            firstName   = patient.FirstName,
                            lastName    = patient.LastName,
                            fullName    = $"{patient.FirstName} {patient.LastName}".Trim(),
                            email       = patient.Email,
                            phone       = patient.Phone,
                            dateOfBirth = patient.DateOfBirth,
                            gender      = patient.Gender,
                            address     = patient.Address,
                            age         = age,
                        };

                        _logger.LogInformation(
                            "LOGIN Patient — numericId: {Id}, identifier: {Identifier}, medRecordId: {MrId}",
                            patient.Id,
                            patientIdentifier ?? "NULL",
                            medicalRecord?.Id.ToString() ?? "NULL");
                    }
                }

                _ = _emailService.SendLoginEmailAsync(user.Email, user.Username);

                return Ok(new
                {
                    user = new
                    {
                        id       = user.Id,
                        username = user.Username,
                        email    = user.Email,
                        role     = user.Role
                    },
                    patient = patientInfo,
                    token   = "mock-jwt-token"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.Password) ||
                    string.IsNullOrWhiteSpace(request.Username) ||
                    string.IsNullOrWhiteSpace(request.Role))
                    return BadRequest(new { message = "All fields are required" });

                var normalizedEmail = request.Email.Trim();

                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

                if (existingUser != null)
                    return BadRequest(new { message = "User with this email already exists" });

                var newUser = new User
                {
                    Username     = request.Username.Trim(),
                    Email        = normalizedEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    Role         = request.Role.Trim(),
                    CreatedAt    = DateTime.UtcNow
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                int? patientId = null;

                if (request.Role.Trim().Equals("Patient", StringComparison.OrdinalIgnoreCase))
                {
                    string firstName = request.FirstName ?? "";
                    string lastName  = request.LastName  ?? "";

                    if (string.IsNullOrWhiteSpace(firstName) && !string.IsNullOrWhiteSpace(request.Username))
                    {
                        var nameParts = request.Username.Trim().Split(' ');
                        firstName = nameParts.Length > 0 ? nameParts[0] : "";
                        lastName  = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "";
                    }

                    var newPatient = new PatientModel
                    {
                        FirstName             = firstName,
                        LastName              = lastName,
                        DateOfBirth           = request.DateOfBirth ?? DateTime.Now.AddYears(-30),
                        Gender                = request.Gender ?? "Not Specified",
                        Phone                 = request.Phone ?? "",
                        Email                 = normalizedEmail,
                        Address               = request.Address ?? "",
                        NationalId            = request.NationalId ?? "",
                        InsuranceCompany      = request.InsuranceCompany ?? "",
                        InsuranceId           = request.InsuranceId ?? "",
                        EmergencyContactName  = request.EmergencyContactName ?? "",
                        EmergencyContactPhone = request.EmergencyContactPhone ?? "",
                        CreatedAt             = DateTime.UtcNow
                    };

                    _context.Patients.Add(newPatient);
                    await _context.SaveChangesAsync();
                    patientId = newPatient.Id;
                    
                    // Generate PatientIdentifier with P- prefix
                    newPatient.PatientIdentifier = "P-" + patientId.ToString().PadLeft(6, '0');
                    _context.Patients.Update(newPatient);
                    await _context.SaveChangesAsync();
                }

                _ = _emailService.SendWelcomeEmailAsync(newUser.Email, newUser.Username);

                return Ok(new
                {
                    user = new
                    {
                        id        = newUser.Id,
                        username  = newUser.Username,
                        email     = newUser.Email,
                        role      = newUser.Role,
                        patientId = patientId
                    },
                    patient = request.Role.Trim().Equals("Patient", StringComparison.OrdinalIgnoreCase) ? new
                    {
                        id = patientId,
                        patientIdentifier = "P-" + patientId.ToString().PadLeft(6, '0'),
                        firstName = request.FirstName ?? "",
                        lastName = request.LastName ?? ""
                    } : null,
                    message = "Registration successful"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for email: {Email}", request.Email);
                return StatusCode(500, new { message = "An error occurred during registration" });
            }
        }
    }
}