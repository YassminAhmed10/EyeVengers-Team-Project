using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models.EMR;
using EyeClinicAPI.DTOs.EMRd.EyeExamination;

namespace EyeClinicAPI.Controllers.EMRcontrol
{
    [Route("api/[controller]")]
    [ApiController]
    public class EyeExaminationController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public EyeExaminationController(EyeClinicDbContext context)
        {
            _context = context;
        }

        [HttpGet("{medicalRecordId}")]
        public async Task<ActionResult<IEnumerable<EyeExaminationDto>>> GetByRecord(int medicalRecordId)
        {
            var exams = await _context.EyeExaminations
                .Where(e => e.MedicalRecordId == medicalRecordId && !e.IsArchived)
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new EyeExaminationDto
                {
                    Id = e.Id,
                    MedicalRecordId = e.MedicalRecordId,
                    RightEye = e.RightEye,
                    LeftEye = e.LeftEye,
                    EyePressure = e.EyePressure,
                    PupilReaction = e.PupilReaction,
                    PupilReactionOther = e.PupilReactionOther,
                    EyeAlignment = e.EyeAlignment,
                    EyeAlignmentOther = e.EyeAlignmentOther,
                    EyeMovements = e.EyeMovements,
                    EyeMovementsOther = e.EyeMovementsOther,
                    AnteriorSegment = e.AnteriorSegment,
                    FundusObservation = e.FundusObservation,
                    OtherNotes = e.OtherNotes,
                    CreatedAt = e.CreatedAt
                }).ToListAsync();

            return Ok(exams);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateEyeExaminationRequest request)
        {
            if (!_context.MedicalRecords.Any(r => r.Id == request.MedicalRecordId))
                return BadRequest("MedicalRecordId not found");

            var exam = new EyeExamination
            {
                MedicalRecordId = request.MedicalRecordId,
                RightEye = request.RightEye,
                LeftEye = request.LeftEye,
                EyePressure = request.EyePressure,
                PupilReaction = request.PupilReaction,
                PupilReactionOther = request.PupilReactionOther,
                EyeAlignment = request.EyeAlignment,
                EyeAlignmentOther = request.EyeAlignmentOther,
                EyeMovements = request.EyeMovements,
                EyeMovementsOther = request.EyeMovementsOther,
                AnteriorSegment = request.AnteriorSegment,
                FundusObservation = request.FundusObservation,
                OtherNotes = request.OtherNotes,
                CreatedAt = DateTime.Now
            };

            _context.EyeExaminations.Add(exam);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Eye examination saved successfully", id = exam.Id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateEyeExaminationRequest request)
        {
            var exam = await _context.EyeExaminations.FindAsync(id);
            if (exam == null) return NotFound("Eye exam not found");

            exam.RightEye = request.RightEye;
            exam.LeftEye = request.LeftEye;
            exam.EyePressure = request.EyePressure;
            exam.PupilReaction = request.PupilReaction;
            exam.PupilReactionOther = request.PupilReactionOther;
            exam.EyeAlignment = request.EyeAlignment;
            exam.EyeAlignmentOther = request.EyeAlignmentOther;
            exam.EyeMovements = request.EyeMovements;
            exam.EyeMovementsOther = request.EyeMovementsOther;
            exam.AnteriorSegment = request.AnteriorSegment;
            exam.FundusObservation = request.FundusObservation;
            exam.OtherNotes = request.OtherNotes;
            exam.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Archive(int id)
        {
            var exam = await _context.EyeExaminations.FindAsync(id);
            if (exam == null) return NotFound("Eye exam not found");

            exam.IsArchived = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Archived successfully" });
        }
    }
}
