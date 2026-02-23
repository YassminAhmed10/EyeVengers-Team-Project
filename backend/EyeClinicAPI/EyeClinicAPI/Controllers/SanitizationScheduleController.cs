using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models;

namespace EyeClinicAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SanitizationScheduleController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public SanitizationScheduleController(EyeClinicDbContext context)
        {
            _context = context;
        }

        // GET: api/SanitizationSchedule
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SanitizationSchedule>>> GetSanitizationSchedules()
        {
            return await _context.SanitizationSchedule.OrderBy(s => s.NextScheduledCleaning).ToListAsync();
        }

        // GET: api/SanitizationSchedule/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SanitizationSchedule>> GetSanitizationSchedule(int id)
        {
            var schedule = await _context.SanitizationSchedule.FindAsync(id);
            
            if (schedule == null)
            {
                return NotFound();
            }
            
            return schedule;
        }

        // GET: api/SanitizationSchedule/Pending
        [HttpGet("Pending")]
        public async Task<ActionResult<IEnumerable<SanitizationSchedule>>> GetPendingSchedules()
        {
            return await _context.SanitizationSchedule
                .Where(s => s.Status == "Pending")
                .OrderBy(s => s.NextScheduledCleaning)
                .ToListAsync();
        }

        // PUT: api/SanitizationSchedule/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSanitizationSchedule(int id, SanitizationSchedule schedule)
        {
            if (id != schedule.SanitizationId)
            {
                return BadRequest();
            }

            schedule.UpdatedAt = DateTime.Now;
            _context.Entry(schedule).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SanitizationScheduleExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/SanitizationSchedule
        [HttpPost]
        public async Task<ActionResult<SanitizationSchedule>> PostSanitizationSchedule(SanitizationSchedule schedule)
        {
            schedule.CreatedAt = DateTime.Now;
            schedule.UpdatedAt = DateTime.Now;
            
            _context.SanitizationSchedule.Add(schedule);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSanitizationSchedule), new { id = schedule.SanitizationId }, schedule);
        }

        // DELETE: api/SanitizationSchedule/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSanitizationSchedule(int id)
        {
            var schedule = await _context.SanitizationSchedule.FindAsync(id);
            if (schedule == null)
            {
                return NotFound();
            }

            _context.SanitizationSchedule.Remove(schedule);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SanitizationScheduleExists(int id)
        {
            return _context.SanitizationSchedule.Any(e => e.SanitizationId == id);
        }
    }
}
