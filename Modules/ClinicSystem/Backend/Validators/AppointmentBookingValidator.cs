using System;
using System.Collections.Generic;
using System.Linq;

namespace EyeClinicAPI.Validators
{
    /// <summary>
    /// APPOINTMENT BOOKING VALIDATOR
    /// =============================
    /// Validates patient booking form data to ensure all required fields are provided.
    /// Ensures data integrity for:
    /// - Receptionist workflow (appointment scheduling)
    /// - Doctor workflow (patient consultation & EMR)
    /// - EMR creation (patient data population)
    /// </summary>
    public class AppointmentBookingValidator
    {
        /// <summary>
        /// Validation result object
        /// </summary>
        public class ValidationResult
        {
            public bool IsValid { get; set; }
            public List<string> Errors { get; set; } = new List<string>();
            public List<string> Warnings { get; set; } = new List<string>();

            public ValidationResult()
            {
                IsValid = true;
                Errors = new List<string>();
                Warnings = new List<string>();
            }

            public ValidationResult(string error) : this()
            {
                IsValid = false;
                Errors.Add(error);
            }
        }

        /// <summary>
        /// REQUIRED FIELDS FOR BOOKING
        /// All these fields MUST be provided by the patient
        /// </summary>
        public static readonly Dictionary<string, string> RequiredPersonalInfoFields = new()
        {
            { "PatientName", "Patient name is required" },
            { "Phone", "Phone number is required" },
            { "Email", "Email address is required" },
            { "PatientBirthDate", "Date of birth is required" },
            { "PatientGender", "Gender selection is required" },
            { "NationalId", "National ID is required" },
            { "Address", "Address is required" }
        };

        public static readonly Dictionary<string, string> RequiredAppointmentFields = new()
        {
            { "DoctorId", "Doctor selection is required" },
            { "AppointmentDate", "Appointment date is required" },
            { "AppointmentTime", "Appointment time is required" },
            { "ReasonForVisit", "Reason for visit is required" }
        };

        public static readonly Dictionary<string, string> OptionalButRecommendedFields = new()
        {
            { "EyeAllergies", "Eye allergies" },
            { "ChronicDiseases", "Chronic diseases" },
            { "VisionSymptoms", "Vision symptoms" },
            { "EyeSurgeries", "Previous eye surgeries" },
            { "FamilyEyeDiseases", "Family eye disease history" },
            { "InsuranceCompany", "Insurance provider" }
        };

        /// <summary>
        /// Validate appointment booking data
        /// Ensures all required fields are provided
        /// </summary>
        public static ValidationResult Validate(dynamic request)
        {
            var result = new ValidationResult();

            if (request == null)
            {
                result.IsValid = false;
                result.Errors.Add("Appointment booking data is required");
                return result;
            }

            // ===== VALIDATE REQUIRED PERSONAL INFO =====
            ValidateRequiredFields(request, RequiredPersonalInfoFields, result, "Personal Information");

            // ===== VALIDATE REQUIRED APPOINTMENT DETAILS =====
            ValidateRequiredFields(request, RequiredAppointmentFields, result, "Appointment Details");

            // ===== VALIDATE SPECIFIC FIELDS =====
            ValidateEmail(request, result);
            ValidatePhone(request, result);
            ValidateDates(request, result);
            ValidateDoctorId(request, result);

            // ===== CHECK FOR OPTIONAL BUT RECOMMENDED FIELDS =====
            CheckOptionalFields(request, result);

            result.IsValid = result.Errors.Count == 0;
            return result;
        }

        /// <summary>
        /// Validate all required fields are present
        /// </summary>
        private static void ValidateRequiredFields(
            dynamic request,
            Dictionary<string, string> requiredFields,
            ValidationResult result,
            string sectionName)
        {
            foreach (var field in requiredFields)
            {
                var fieldName = field.Key;
                var errorMessage = field.Value;

                try
                {
                    var value = GetPropertyValue(request, fieldName);
                    
                    if (string.IsNullOrWhiteSpace(value?.ToString()))
                    {
                        result.IsValid = false;
                        result.Errors.Add($"[{sectionName}] {errorMessage}");
                    }
                }
                catch
                {
                    result.IsValid = false;
                    result.Errors.Add($"[{sectionName}] {fieldName} is missing or invalid");
                }
            }
        }

        /// <summary>
        /// Validate email format
        /// </summary>
        private static void ValidateEmail(dynamic request, ValidationResult result)
        {
            try
            {
                var email = GetPropertyValue(request, "Email")?.ToString();
                if (!string.IsNullOrWhiteSpace(email))
                {
                    if (!IsValidEmail(email))
                    {
                        result.IsValid = false;
                        result.Errors.Add("Invalid email format. Please provide a valid email address (e.g., user@example.com)");
                    }
                }
            }
            catch { /* Skip if field doesn't exist */ }
        }

        /// <summary>
        /// Validate phone number format
        /// </summary>
        private static void ValidatePhone(dynamic request, ValidationResult result)
        {
            try
            {
                var phone = GetPropertyValue(request, "Phone")?.ToString();
                if (!string.IsNullOrWhiteSpace(phone))
                {
                    if (!IsValidPhone(phone))
                    {
                        result.IsValid = false;
                        result.Errors.Add("Invalid phone format. Please provide at least 10 digits");
                    }
                }
            }
            catch { /* Skip if field doesn't exist */ }
        }

        /// <summary>
        /// Validate appointment and birth dates
        /// </summary>
        private static void ValidateDates(dynamic request, ValidationResult result)
        {
            try
            {
                // Validate birth date (must be in past)
                var birthDateStr = GetPropertyValue(request, "PatientBirthDate")?.ToString();
                if (!string.IsNullOrWhiteSpace(birthDateStr))
                {
                    if (DateTime.TryParse(birthDateStr, out DateTime birthDate))
                    {
                        if (birthDate > DateTime.Now)
                        {
                            result.IsValid = false;
                            result.Errors.Add("Date of birth cannot be in the future");
                        }

                        var age = DateTime.Now.Year - birthDate.Year;
                        if (age < 1)
                        {
                            result.IsValid = false;
                            result.Errors.Add("Patient must be at least 1 year old");
                        }
                    }
                }

                // Validate appointment date (must be in future)
                var appointmentDateStr = GetPropertyValue(request, "AppointmentDate")?.ToString();
                if (!string.IsNullOrWhiteSpace(appointmentDateStr))
                {
                    if (DateTime.TryParse(appointmentDateStr, out DateTime appointmentDate))
                    {
                        var today = DateTime.Now.Date;
                        if (appointmentDate.Date <= today)
                        {
                            result.IsValid = false;
                            result.Errors.Add("Appointment date must be in the future");
                        }
                    }
                }
            }
            catch { /* Skip if dates are invalid */ }
        }

        /// <summary>
        /// Validate doctor ID is positive
        /// </summary>
        private static void ValidateDoctorId(dynamic request, ValidationResult result)
        {
            try
            {
                var doctorId = GetPropertyValue(request, "DoctorId");
                int id = 0; if (doctorId != null && int.TryParse(doctorId.ToString(), out id))
                {
                    if (id <= 0)
                    {
                        result.IsValid = false;
                        result.Errors.Add("Invalid doctor selection");
                    }
                }
            }
            catch { /* Skip if field doesn't exist */ }
        }

        /// <summary>
        /// Check for optional but recommended fields
        /// Adds warnings if missing
        /// </summary>
        private static void CheckOptionalFields(dynamic request, ValidationResult result)
        {
            var missingRecommendedFields = new List<string>();

            foreach (var field in OptionalButRecommendedFields)
            {
                var value = GetPropertyValue(request, field.Key);
                if (string.IsNullOrWhiteSpace(value?.ToString()))
                {
                    missingRecommendedFields.Add(field.Value);
                }
            }

            if (missingRecommendedFields.Count > 0)
            {
                result.Warnings.Add(
                    $"Recommended information not provided: {string.Join(", ", missingRecommendedFields)}. " +
                    "Please provide this information for better medical record and consultation."
                );
            }
        }

        /// <summary>
        /// Helper: Get property value from object (supports dynamic types)
        /// </summary>
        private static object? GetPropertyValue(dynamic obj, string propertyName)
        {
            try
            {
                if (obj is System.Collections.Generic.IDictionary<string, object> dict)
                {
                    return dict.ContainsKey(propertyName) ? dict[propertyName] : null;
                }

                var property = obj?.GetType()?.GetProperty(propertyName);
                return property?.GetValue(obj);
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Email validation
        /// </summary>
        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Phone validation (at least 10 digits)
        /// </summary>
        private static bool IsValidPhone(string phone)
        {
            var digitsOnly = new string(phone.Where(char.IsDigit).ToArray());
            return digitsOnly.Length >= 10;
        }

        /// <summary>
        /// Format validation result for API response
        /// </summary>
        public static object FormatErrorResponse(ValidationResult result)
        {
            return new
            {
                message = "Booking validation failed. Please ensure all required fields are filled.",
                isValid = result.IsValid,
                errors = result.Errors,
                warnings = result.Warnings.Count > 0 ? result.Warnings : null,
                requiredFields = new
                {
                    personalInfo = RequiredPersonalInfoFields.Keys.ToList(),
                    appointmentDetails = RequiredAppointmentFields.Keys.ToList()
                },
                dataMapping = new
                {
                    receptionist = "Displays appointment details, patient contact info, scheduling status",
                    doctor = "Displays full patient info, medical history, appointment details for EMR",
                    medicalRecord = "Auto-populates patient info card with name, age, insurance, contact, allergies, etc."
                }
            };
        }
    }
}
