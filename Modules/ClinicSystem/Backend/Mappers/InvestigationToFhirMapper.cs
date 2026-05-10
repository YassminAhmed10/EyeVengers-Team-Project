using Hl7.Fhir.Model;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EyeClinicAPI.Services
{
    /// <summary>
    /// Maps clinic investigations to FHIR ServiceRequest resources
    /// for sending to Radiology Center
    /// </summary>
    public interface IInvestigationToFhirMapper
    {
        ServiceRequest MapInvestigationToServiceRequest(
            int patientId,
            string investigationType,
            string clinicalIndication,
            string priority,
            string referringDoctorName,
            string notes = null);

        List<ServiceRequest> MapMultipleInvestigationsToServiceRequests(
            int patientId,
            List<string> investigationTypes,
            string clinicalIndication,
            string priority,
            string referringDoctorName,
            string notes = null);
    }

    public class InvestigationToFhirMapper : IInvestigationToFhirMapper
    {
        private readonly ILogger<InvestigationToFhirMapper> _logger;

        public InvestigationToFhirMapper(ILogger<InvestigationToFhirMapper> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Map a single investigation to FHIR ServiceRequest
        /// </summary>
        public ServiceRequest MapInvestigationToServiceRequest(
            int patientId,
            string investigationType,
            string clinicalIndication,
            string priority,
            string referringDoctorName,
            string notes = null)
        {
            try
            {
                var serviceRequest = new ServiceRequest
                {
                    Status = RequestStatus.Active,
                    Intent = RequestIntent.Order,
                    Category = new List<CodeableConcept>
                    {
                        new CodeableConcept
                        {
                            Coding = new List<Coding>
                            {
                                new Coding
                                {
                                    System = "http://snomed.info/sct",
                                    Code = GetInvestigationSnomedCode(investigationType),
                                    Display = investigationType
                                }
                            },
                            Text = investigationType
                        }
                    },
                    Code = new CodeableConcept
                    {
                        Coding = new List<Coding>
                        {
                            new Coding
                            {
                                System = "http://loinc.org",
                                Code = GetInvestigationLoincCode(investigationType),
                                Display = investigationType
                            }
                        },
                        Text = investigationType
                    },
                    Subject = new ResourceReference($"Patient/{patientId}"),
                    AuthoredOn = DateTime.UtcNow.ToString("O"),
                    Priority = MapPriority(priority),
                    ReasonCode = new List<CodeableConcept>
                    {
                        new CodeableConcept
                        {
                            Text = clinicalIndication ?? "Routine investigation"
                        }
                    },
                    OrderDetail = new List<CodeableConcept>
                    {
                        new CodeableConcept
                        {
                            Text = clinicalIndication ?? "Routine investigation"
                        }
                    }
                };

                // Add requester
                if (!string.IsNullOrEmpty(referringDoctorName))
                {
                    serviceRequest.Requester = new ResourceReference
                    {
                        Display = referringDoctorName
                    };
                }

                // Add notes if provided
                if (!string.IsNullOrEmpty(notes))
                {
                    serviceRequest.Note = new List<Annotation>
                    {
                        new Annotation
                        {
                            Text = $"{notes} (From: {referringDoctorName ?? "Clinic System"})",
                            TimeElement = new FhirDateTime(DateTime.UtcNow)
                        }
                    };
                }

                _logger.LogInformation($"Mapped investigation '{investigationType}' to FHIR ServiceRequest for patient {patientId}");
                return serviceRequest;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error mapping investigation '{investigationType}' to FHIR ServiceRequest");
                throw;
            }
        }

        /// <summary>
        /// Map multiple investigations to FHIR ServiceRequest resources
        /// </summary>
        public List<ServiceRequest> MapMultipleInvestigationsToServiceRequests(
            int patientId,
            List<string> investigationTypes,
            string clinicalIndication,
            string priority,
            string referringDoctorName,
            string notes = null)
        {
            var serviceRequests = new List<ServiceRequest>();

            foreach (var investigationType in investigationTypes)
            {
                var serviceRequest = MapInvestigationToServiceRequest(
                    patientId,
                    investigationType,
                    clinicalIndication,
                    priority,
                    referringDoctorName,
                    notes);

                serviceRequests.Add(serviceRequest);
            }

            _logger.LogInformation($"Mapped {investigationTypes.Count} investigations to FHIR ServiceRequests for patient {patientId}");
            return serviceRequests;
        }

        /// <summary>
        /// Map investigation type to SNOMED CT code
        /// </summary>
        private string GetInvestigationSnomedCode(string investigationType)
        {
            return investigationType?.ToUpper() switch
            {
                "MRI" => "73569-6",
                "CT SCAN" or "CT" => "36801-0",
                "X-RAY" or "XRAY" => "36801-0",
                "CBC" => "57021-8",
                "BLOOD SUGAR" => "2345-7",
                "OCT" => "37034-6",
                "VISUAL FIELD TEST" => "37034-6",
                "FLUORESCEIN ANGIOGRAPHY" => "37034-6",
                "ULTRASOUND B-SCAN" => "82670-6",
                "ELECTROENCEPHALOGRAPHY (ERG)" => "37034-6",
                "ELECTRO-OCULOGRAPHY (EOG)" => "37034-6",
                "CORNEAL TOPOGRAPHY" => "37034-6",
                "GENETIC TESTING" => "36905-9",
                "TEAR FILM ANALYSIS" => "37034-6",
                "SPECULAR MICROSCOPY" => "37034-6",
                _ => "37034-6" // Default to general imaging
            };
        }

        /// <summary>
        /// Map investigation type to LOINC code
        /// </summary>
        private string GetInvestigationLoincCode(string investigationType)
        {
            return investigationType?.ToUpper() switch
            {
                "MRI" => "71046-4", // MRI of head
                "CT SCAN" or "CT" => "71046-4", // CT of head
                "X-RAY" or "XRAY" => "71046-4", // Radiograph
                "CBC" => "57021-8", // Complete blood count
                "BLOOD SUGAR" => "2345-7", // Glucose
                "OCT" => "37034-6", // Ophthalmic imaging
                "VISUAL FIELD TEST" => "37034-6", // Visual field
                "FLUORESCEIN ANGIOGRAPHY" => "37034-6", // Fundus imaging
                "ULTRASOUND B-SCAN" => "82670-6", // Ultrasound
                "ELECTROENCEPHALOGRAPHY (ERG)" => "37034-6", // ERG
                "ELECTRO-OCULOGRAPHY (EOG)" => "37034-6", // EOG
                "CORNEAL TOPOGRAPHY" => "37034-6", // Corneal imaging
                "GENETIC TESTING" => "36905-9", // Genetic test
                "TEAR FILM ANALYSIS" => "37034-6", // Tear analysis
                "SPECULAR MICROSCOPY" => "37034-6", // Corneal microscopy
                _ => "37034-6" // Default to general test
            };
        }

        /// <summary>
        /// Map priority string to FHIR RequestPriority
        /// </summary>
        private RequestPriority MapPriority(string priority)
        {
            return priority?.ToUpper() switch
            {
                "URGENT" => RequestPriority.Urgent,
                "HIGH" => RequestPriority.Urgent,
                "ROUTINE" => RequestPriority.Routine,
                "NORMAL" => RequestPriority.Routine,
                "ASAP" => RequestPriority.Asap,
                _ => RequestPriority.Routine
            };
        }
    }
}