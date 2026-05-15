using Microsoft.EntityFrameworkCore;
using RadiologyCenterAPI.Data;

namespace RadiologyCenterAPI.Services
{
    public interface IPatientIdentifierService
    {
        Task<string> GenerateUniqueIdentifierAsync();
        Task<string> GetOrCreateIdentifierAsync(string email);
    }

    public class PatientIdentifierService : IPatientIdentifierService
    {
        private readonly RadiologyDbContext _db;
        private readonly ILogger<PatientIdentifierService> _logger;
        private static readonly object _lockObject = new object();

        public PatientIdentifierService(RadiologyDbContext db, ILogger<PatientIdentifierService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<string> GenerateUniqueIdentifierAsync()
        {
            lock (_lockObject)
            {
                try
                {
                    var count = _db.Patients.Count();
                    var nextNumber = count + 1;
                    var identifier = $"RAD-{nextNumber:D5}";
                    _logger.LogInformation($"Generated new identifier: {identifier}");
                    return identifier;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error generating identifier");
                    throw;
                }
            }
        }

        public async Task<string> GetOrCreateIdentifierAsync(string email)
        {
            try
            {
                var existingPatient = await _db.Patients.FirstOrDefaultAsync(p => p.Email == email);
                
                if (existingPatient != null && !string.IsNullOrEmpty(existingPatient.Identifier))
                {
                    return existingPatient.Identifier;
                }

                var newIdentifier = await GenerateUniqueIdentifierAsync();
                return newIdentifier;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting or creating identifier for {email}");
                throw;
            }
        }
    }
}