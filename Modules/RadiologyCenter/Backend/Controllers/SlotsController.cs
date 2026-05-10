using Microsoft.AspNetCore.Mvc;
using RadiologyCenterAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace RadiologyCenterAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SlotsController : ControllerBase
    {
        private readonly RadiologyDbContext _context;

        public SlotsController(RadiologyDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailableSlots([FromQuery] int serviceId, [FromQuery] string date)
        {
            if (!DateTime.TryParse(date, out var targetDate))
                return BadRequest("Invalid date");

            var startDate = targetDate.Date;
            var endDate = startDate.AddDays(1);

            var slots = await _context.Slots
                .Where(s => s.RadiologyServiceId == serviceId && s.Start >= startDate && s.Start < endDate && s.Status == "free")
                .OrderBy(s => s.Start)
                .ToListAsync();

            return Ok(slots);
        }
    }
}
