using Microsoft.Extensions.Logging;

namespace RadiologyCenterAPI.Services
{
    public interface IInvestigationToFhirMapper
    {
        object MapInvestigationToServiceRequest(int patientId, string investigationType, string clinicalIndication, string priority, string referringDoctorName, string? notes = null);
    }

    public class InvestigationToFhirMapper : IInvestigationToFhirMapper
    {
        private readonly ILogger<InvestigationToFhirMapper> _logger;

        public InvestigationToFhirMapper(ILogger<InvestigationToFhirMapper> logger)
        {
            _logger = logger;
        }

        public object MapInvestigationToServiceRequest(int patientId, string investigationType, string clinicalIndication, string priority, string referringDoctorName, string? notes = null)
        {
            return new
            {
                resourceType = "ServiceRequest",
                status = "active",
                intent = "order",
                code = new
                {
                    coding = new[]
                    {
                        new
                        {
                            system = "http://loinc.org",
                            code = "24655-1",
                            display = investigationType
                        }
                    }
                },
                subject = new { reference = $"Patient/{patientId}" },
                authoredOn = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                priority = priority?.ToLower() ?? "routine"
            };
        }
    }
}
