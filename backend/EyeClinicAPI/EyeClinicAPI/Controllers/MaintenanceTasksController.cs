using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models;

namespace EyeClinicAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaintenanceTasksController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public MaintenanceTasksController(EyeClinicDbContext context)
        {
            _context = context;
        }

        // GET: api/MaintenanceTasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MaintenanceTasks>>> GetMaintenanceTasks()
        {
            return await _context.MaintenanceTasks
                .Include(t => t.Equipment)
                .OrderBy(t => t.ScheduledDate)
                .ToListAsync();
        }

        // GET: api/MaintenanceTasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MaintenanceTasks>> GetMaintenanceTask(int id)
        {
            var task = await _context.MaintenanceTasks
                .Include(t => t.Equipment)
                .FirstOrDefaultAsync(t => t.TaskId == id);
            
            if (task == null)
            {
                return NotFound();
            }
            
            return task;
        }

        // GET: api/MaintenanceTasks/Scheduled
        [HttpGet("Scheduled")]
        public async Task<ActionResult<IEnumerable<MaintenanceTasks>>> GetScheduledTasks()
        {
            return await _context.MaintenanceTasks
                .Include(t => t.Equipment)
                .Where(t => t.Status == "Scheduled" || t.Status == "In Progress")
                .OrderBy(t => t.ScheduledDate)
                .ToListAsync();
        }

        // PUT: api/MaintenanceTasks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMaintenanceTask(int id, MaintenanceTasks task)
        {
            if (id != task.TaskId)
            {
                return BadRequest();
            }

            task.UpdatedAt = DateTime.Now;
            _context.Entry(task).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MaintenanceTaskExists(id))
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

        // POST: api/MaintenanceTasks
        [HttpPost]
        public async Task<ActionResult<MaintenanceTasks>> PostMaintenanceTask(MaintenanceTasks task)
        {
            task.CreatedAt = DateTime.Now;
            task.UpdatedAt = DateTime.Now;
            
            _context.MaintenanceTasks.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMaintenanceTask), new { id = task.TaskId }, task);
        }

        // DELETE: api/MaintenanceTasks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMaintenanceTask(int id)
        {
            var task = await _context.MaintenanceTasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            _context.MaintenanceTasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MaintenanceTaskExists(int id)
        {
            return _context.MaintenanceTasks.Any(e => e.TaskId == id);
        }
    }
}
