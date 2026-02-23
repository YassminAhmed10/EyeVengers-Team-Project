using EyeClinicAPI.Data;
using EyeClinicAPI.DTOs.EMRd.TestImages;
using EyeClinicAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Models.EMR;

namespace EyeClinicAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicalTestFilesController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public MedicalTestFilesController(EyeClinicDbContext context)
        {
            _context = context;
        }



        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadFile([FromForm] UploadMedicalTestFileDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest("No file uploaded");

            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");

            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            var fileName = $"{Guid.NewGuid()}_{dto.File.FileName}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            var fileRecord = new MedicalTestFile
            {
                MedicalRecordId = dto.MedicalRecordId,
                FileName = dto.File.FileName,
                FileUrl = $"/Uploads/{fileName}",
                FileType = dto.File.ContentType,
                CreatedAt = DateTime.Now
            };

            _context.MedicalTestFiles.Add(fileRecord);
            await _context.SaveChangesAsync();

            return Ok(new { message = "File uploaded successfully", file = fileRecord });
        }



        // GET FILES FOR MEDICAL RECORD
        [HttpGet("{medicalRecordId}")]
        public async Task<IActionResult> GetFiles(int medicalRecordId)
        {
            var files = await _context.MedicalTestFiles
                .Where(f => f.MedicalRecordId == medicalRecordId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            return Ok(files);
        }

        // DELETE FILE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFile(int id)
        {
            var file = await _context.MedicalTestFiles.FindAsync(id);
            if (file == null)
                return NotFound();

            var fullPath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "Uploads",
                file.FileUrl.Replace("/Uploads/", "")
            );

            if (System.IO.File.Exists(fullPath))
                System.IO.File.Delete(fullPath);

            _context.MedicalTestFiles.Remove(file);
            await _context.SaveChangesAsync();

            return Ok(new { message = "File deleted successfully" });
        }
    }
}

