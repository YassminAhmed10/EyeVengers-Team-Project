using EyeClinicAPI.Data;
using EyeClinicAPI.DTOs.EMRd.MedicalHistory;
using EyeClinicAPI.Models.EMR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EyeClinicAPI.Controllers.EMRcontrol
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicalHistoryController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public MedicalHistoryController(EyeClinicDbContext context)
        {
            _context = context;
        }

        // GET: api/MedicalHistory
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicalHistoryDto>>> GetAll()
        {
            var histories = await _context.MedicalHistories
                .Select(h => new MedicalHistoryDto
                {
                    Id = h.Id,
                    MedicalRecordId = h.MedicalRecordId,
                    PreviousEye = h.PreviousEye,
                    FamilyHistory = h.FamilyHistory,
                    Allergies = h.Allergies,
                    CreatedAt = h.CreatedAt,
                    UpdatedAt = h.UpdatedAt,
                    IsArchived = h.IsArchived
                })
                .ToListAsync();

            return Ok(histories);
        }

        // GET: api/MedicalHistory/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MedicalHistoryDto>> GetById(int id)
        {
            var h = await _context.MedicalHistories.FindAsync(id);
            if (h == null) return NotFound();

            var dto = new MedicalHistoryDto
            {
                Id = h.Id,
                MedicalRecordId = h.MedicalRecordId,
                PreviousEye = h.PreviousEye,
                FamilyHistory = h.FamilyHistory,
                Allergies = h.Allergies,
                CreatedAt = h.CreatedAt,
                UpdatedAt = h.UpdatedAt,
                IsArchived = h.IsArchived
            };
            return Ok(dto);
        }

        // POST: api/MedicalHistory
        [HttpPost]
        public async Task<ActionResult<MedicalHistoryDto>> Create(CreateMedicalHistoryRequest request)
        {
            var record = await _context.MedicalRecords.FindAsync(request.MedicalRecordId);
            if (record == null) return BadRequest("Invalid MedicalRecordId");

            var history = new MedicalHistory
            {
                MedicalRecordId = request.MedicalRecordId,
                PreviousEye = request.PreviousEye,
                FamilyHistory = request.FamilyHistory,
                Allergies = request.Allergies,
                CreatedAt = DateTime.Now
            };

            _context.MedicalHistories.Add(history);
            await _context.SaveChangesAsync();

            var dto = new MedicalHistoryDto
            {
                Id = history.Id,
                MedicalRecordId = history.MedicalRecordId,
                PreviousEye = history.PreviousEye,
                FamilyHistory = history.FamilyHistory,
                Allergies = history.Allergies,
                CreatedAt = history.CreatedAt,
                UpdatedAt = history.UpdatedAt,
                IsArchived = history.IsArchived
            };

            return CreatedAtAction(nameof(GetById), new { id = history.Id }, dto);
        }

        // PUT: api/MedicalHistory/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateMedicalHistoryRequest request)
        {
            var existing = await _context.MedicalHistories.FindAsync(id);
            if (existing == null) return NotFound();

            existing.PreviousEye = request.PreviousEye;
            existing.FamilyHistory = request.FamilyHistory;
            existing.Allergies = request.Allergies;
            existing.UpdatedAt = DateTime.Now;

            _context.Entry(existing).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/MedicalHistory/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Archive(int id)
        {
            var existing = await _context.MedicalHistories.FindAsync(id);
            if (existing == null) return NotFound();

            existing.IsArchived = true;
            existing.UpdatedAt = DateTime.Now;

            _context.Entry(existing).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
