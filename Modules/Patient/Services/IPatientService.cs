using EyeClinicAPI.PatientModule.Models;
using EyeClinicAPI.PatientModule.DTOs;

namespace EyeClinicAPI.PatientModule.Services
{
    public interface IPatientService
    {
        Task<IEnumerable<Models.Patient>> GetAllPatientsAsync();
        Task<Models.Patient?> GetPatientByIdAsync(int id);
        Task<Models.Patient> CreatePatientAsync(Models.Patient patient);
        Task<Models.Patient?> UpdatePatientAsync(int id, Models.Patient patient);
        Task<bool> DeletePatientAsync(int id);
        Task<IEnumerable<Models.Patient>> SearchPatientsAsync(string query);
        Task<PatientInfoDto?> GetPatientInfoDtoAsync(int id);
    }
}

