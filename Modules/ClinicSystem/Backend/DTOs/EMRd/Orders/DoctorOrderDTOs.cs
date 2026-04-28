// DTOs/EMRd/Orders/DoctorOrderDTOs.cs
using System.Text.Json;

namespace EyeClinicAPI.DTOs.Orders
{
    // ── Doctor creates an order ───────────────────────────────────────────────

    public class CreateDoctorOrderDto
    {
        public int PatientId { get; set; }
        public int MedicalRecordId { get; set; }

        /// <summary>investigation | eyeExam | prescription</summary>
        public required string OrderType { get; set; }

        /// <summary>
        /// Raw JSON object from the frontend form.
        /// investigation → { selectedTests, priority, notes }
        /// eyeExam       → { laterality, rightEye, leftEye, notes }
        /// prescription  → { items }
        /// </summary>
        public required JsonElement Data { get; set; }
    }

    // ── Patient responds ──────────────────────────────────────────────────────

    public class RespondToOrderDto
    {
        /// <summary>Accepted | Rejected</summary>
        public required string Action { get; set; }

        public string? RejectionReason { get; set; }
    }

    // ── Patient books after accepting ────────────────────────────────────────

    public class BookOrderAppointmentDto
    {
        public DateTime AppointmentDate { get; set; }
        public required string AppointmentTime { get; set; }
    }

    // ── Response shape returned to clients ───────────────────────────────────

    public class DoctorOrderResponseDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int MedicalRecordId { get; set; }
        public int DoctorId { get; set; }
        public string OrderType { get; set; } = "";
        public JsonElement Data { get; set; }
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
        public string? RejectionReason { get; set; }
        public DateTime? AppointmentDate { get; set; }
        public string? AppointmentTime { get; set; }
        public string? ExternalSystemConfirmationId { get; set; }

        /// <summary>Human-readable destination: Radiology Center | Glass Store | Pharmacy</summary>
        public string Destination => OrderType switch
        {
            "investigation" => "Radiology Center",
            "eyeExam"       => "Glass Store",
            "prescription"  => "Pharmacy",
            _               => "Unknown"
        };
    }
}
