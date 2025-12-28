using EyeClinicAPI.Data;
using EyeClinicAPI.DTOs.EMRd.Operations;
using EyeClinicAPI.Models.EMR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EyeClinicAPI.Controllers.EMRcontrol
{
    [Route("api/[controller]")]
    [ApiController]
    public class OperationsController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public OperationsController(EyeClinicDbContext context)
        {
            _context = context;
        }

        // GET: api/Operations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OperationDto>>> GetAll()
        {
            var ops = await _context.Operations
                .Select(o => new OperationDto
                {
                    Id = o.Id,
                    MedicalRecordId = o.MedicalRecordId,
                    Name = o.Name,
                    Date = o.Date,
                    Eye = o.Eye,
                    Surgeon = o.Surgeon,
                    Diagnosis = o.Diagnosis,
                    PreMedications = o.PreMedications,
                    SpecialInstructions = o.SpecialInstructions,
                    PostMedications = o.PostMedications,
                    FollowUp = o.FollowUp,
                    Complications = o.Complications,
                    Status = o.Status,
                    Anesthesia = o.Anesthesia,
                    Duration = o.Duration,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    IsArchived = o.IsArchived
                })
                .ToListAsync();

            return Ok(ops);
        }

        // GET: api/Operations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OperationDto>> GetById(int id)
        {
            var o = await _context.Operations.FindAsync(id);
            if (o == null) return NotFound();

            var dto = new OperationDto
            {
                Id = o.Id,
                MedicalRecordId = o.MedicalRecordId,
                Name = o.Name,
                Date = o.Date,
                Eye = o.Eye,
                Surgeon = o.Surgeon,
                Diagnosis = o.Diagnosis,
                PreMedications = o.PreMedications,
                SpecialInstructions = o.SpecialInstructions,
                PostMedications = o.PostMedications,
                FollowUp = o.FollowUp,
                Complications = o.Complications,
                Status = o.Status,
                Anesthesia = o.Anesthesia,
                Duration = o.Duration,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
                IsArchived = o.IsArchived
            };

            return Ok(dto);
        }

        // POST: api/Operations
        [HttpPost]
        public async Task<ActionResult<OperationDto>> Create(CreateOperationRequest request)
        {
            var record = await _context.MedicalRecords.FindAsync(request.MedicalRecordId);
            if (record == null)
                return BadRequest("Invalid MedicalRecordId");

            var o = new Operation
            {
                MedicalRecordId = request.MedicalRecordId,
                Name = request.Name,
                Date = request.Date,
                Eye = request.Eye,
                Surgeon = request.Surgeon,
                Diagnosis = request.Diagnosis,
                PreMedications = request.PreMedications,
                SpecialInstructions = request.SpecialInstructions,
                PostMedications = request.PostMedications,
                FollowUp = request.FollowUp,
                Complications = request.Complications,
                Status = request.Status,
                Anesthesia = request.Anesthesia,
                Duration = request.Duration,
                CreatedAt = DateTime.Now
            };

            _context.Operations.Add(o);
            await _context.SaveChangesAsync();

            var dto = new OperationDto
            {
                Id = o.Id,
                MedicalRecordId = o.MedicalRecordId,
                Name = o.Name,
                Date = o.Date,
                Eye = o.Eye,
                Surgeon = o.Surgeon,
                Diagnosis = o.Diagnosis,
                PreMedications = o.PreMedications,
                SpecialInstructions = o.SpecialInstructions,
                PostMedications = o.PostMedications,
                FollowUp = o.FollowUp,
                Complications = o.Complications,
                Status = o.Status,
                Anesthesia = o.Anesthesia,
                Duration = o.Duration,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
                IsArchived = o.IsArchived
            };

            return CreatedAtAction(nameof(GetById), new { id = o.Id }, dto);
        }

        // PUT: api/Operations/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateOperationRequest request)
        {
            var o = await _context.Operations.FindAsync(id);
            if (o == null) return NotFound();

            o.Name = request.Name;
            o.Date = request.Date.HasValue ? request.Date.Value : o.Date;
            o.Eye = request.Eye;
            o.Surgeon = request.Surgeon;
            o.Diagnosis = request.Diagnosis;
            o.PreMedications = request.PreMedications;
            o.SpecialInstructions = request.SpecialInstructions;
            o.PostMedications = request.PostMedications;
            o.FollowUp = request.FollowUp;
            o.Complications = request.Complications;
            o.Status = request.Status;
            o.Anesthesia = request.Anesthesia;
            o.Duration = request.Duration;

            o.UpdatedAt = DateTime.Now;

            _context.Entry(o).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Operations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Archive(int id)
        {
            var o = await _context.Operations.FindAsync(id);
            if (o == null) return NotFound();

            o.IsArchived = true;
            o.UpdatedAt = DateTime.Now;

            _context.Entry(o).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
