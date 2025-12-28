using EyeClinicAPI.Data;
using EyeClinicAPI.DTOs.EMRd.Complaints;
using EyeClinicAPI.Models.EMR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EyeClinicAPI.Controllers.EMRcontrol
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientComplaintController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public PatientComplaintController(EyeClinicDbContext context)
        {
            _context = context;
        }

        // GET: api/PatientComplaint
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientComplaintDto>>> GetAll()
        {
            var complaints = await _context.PatientComplaints
                .Select(c => new PatientComplaintDto
                {
                    Id = c.Id,
                    MedicalRecordId = c.MedicalRecordId,
                    OriginalText = c.OriginalText,
                    TranslatedText = c.TranslatedText,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    IsArchived = c.IsArchived,
                    PreviousText = c.PreviousText
                })
                .ToListAsync();

            return Ok(complaints);
        }

        // GET: api/PatientComplaint/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PatientComplaintDto>> GetById(int id)
        {
            var c = await _context.PatientComplaints.FindAsync(id);
            if (c == null) return NotFound();

            var dto = new PatientComplaintDto
            {
                Id = c.Id,
                MedicalRecordId = c.MedicalRecordId,
                OriginalText = c.OriginalText,
                TranslatedText = c.TranslatedText,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                IsArchived = c.IsArchived,
                PreviousText = c.PreviousText
            };

            return Ok(dto);
        }

        // POST: api/PatientComplaint
        [HttpPost]
        public async Task<ActionResult<PatientComplaintDto>> Create(CreatePatientComplaintRequest request)
        {
            var record = await _context.MedicalRecords.FindAsync(request.MedicalRecordId);
            if (record == null) return BadRequest("Invalid MedicalRecordId");

            var complaint = new PatientComplaint
            {
                MedicalRecordId = request.MedicalRecordId,
                OriginalText = request.OriginalText,
                TranslatedText = request.TranslatedText,
                CreatedAt = DateTime.Now
            };

            _context.PatientComplaints.Add(complaint);
            await _context.SaveChangesAsync();

            var dto = new PatientComplaintDto
            {
                Id = complaint.Id,
                MedicalRecordId = complaint.MedicalRecordId,
                OriginalText = complaint.OriginalText,
                TranslatedText = complaint.TranslatedText,
                CreatedAt = complaint.CreatedAt,
                UpdatedAt = complaint.UpdatedAt,
                IsArchived = complaint.IsArchived,
                PreviousText = complaint.PreviousText
            };

            return CreatedAtAction(nameof(GetById), new { id = complaint.Id }, dto);
        }

        // PUT: api/PatientComplaint/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdatePatientComplaintRequest request)
        {
            var existing = await _context.PatientComplaints.FindAsync(id);
            if (existing == null) return NotFound();

            existing.PreviousText = existing.OriginalText;
            existing.OriginalText = request.OriginalText;
            existing.TranslatedText = request.TranslatedText;
            existing.UpdatedAt = DateTime.Now;

            _context.Entry(existing).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/PatientComplaint/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Archive(int id)
        {
            var existing = await _context.PatientComplaints.FindAsync(id);
            if (existing == null) return NotFound();

            existing.IsArchived = true;
            existing.UpdatedAt = DateTime.Now;

            _context.Entry(existing).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
