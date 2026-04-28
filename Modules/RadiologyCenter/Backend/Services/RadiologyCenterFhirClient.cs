using Hl7.Fhir.Model;
using Hl7.Fhir.Rest;
using Microsoft.Extensions.Logging;

namespace EyeClinicAPI.Services
{
    public interface IRadiologyCenterFhirClient
    {
        Task<Bundle> GetPatientScanOrdersAsync(int patientId);
        Task<Bundle> GetPatientDiagnosticReportsAsync(int patientId);
        Task<Resource> CreateScanOrderAsync(ServiceRequest serviceRequest);
        Task<DiagnosticReport?> GetDiagnosticReportAsync(int reportId);
    }

    public class RadiologyCenterFhirClient : IRadiologyCenterFhirClient
    {
        private readonly FhirClient _client;
        private readonly ILogger<RadiologyCenterFhirClient> _logger;

        public RadiologyCenterFhirClient(string baseUrl, ILogger<RadiologyCenterFhirClient> logger)
        {
            _client = new FhirClient(baseUrl);
            _logger = logger;
        }

        public async Task<Bundle> GetPatientScanOrdersAsync(int patientId)
        {
            try
            {
                // example search: ServiceRequest?subject=Patient/{patientId}
                var bundle = await _client.SearchAsync<ServiceRequest>("ServiceRequest", new[] { $"subject=Patient/{patientId}" });
                return bundle;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching patient scan orders from FHIR server");
                throw;
            }
        }

        public async Task<Bundle> GetPatientDiagnosticReportsAsync(int patientId)
        {
            try
            {
                var bundle = await _client.SearchAsync<DiagnosticReport>("DiagnosticReport", new[] { $"subject=Patient/{patientId}" });
                return bundle;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching diagnostic reports from FHIR server");
                throw;
            }
        }

        public async Task<Resource> CreateScanOrderAsync(ServiceRequest serviceRequest)
        {
            try
            {
                var created = await _client.CreateAsync(serviceRequest);
                return created;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating scan order on FHIR server");
                throw;
            }
        }

        public async Task<DiagnosticReport?> GetDiagnosticReportAsync(int reportId)
        {
            try
            {
                var report = await _client.ReadAsync<DiagnosticReport>($"DiagnosticReport/{reportId}");
                return report;
            }
            catch (FhirOperationException fex) when (fex.Status == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading DiagnosticReport from FHIR server");
                throw;
            }
        }
    }
}
