using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Hl7.Fhir.Model;
using Newtonsoft.Json;

namespace EyeClinicAPI.Services
{
    /// <summary>
    /// FHIR Client Service for communicating with RadiologyCenter.Backend.Net
    /// Enables clinic system to send scan orders and receive radiology results
    /// </summary>
    public interface IRadiologyCenterFhirClient
    {
        Task<string> GetTokenAsync();
        Task<Patient> GetPatientAsync(int patientId);
        Task<Patient> CreatePatientAsync(Patient patient);
        Task<ServiceRequest> CreateScanOrderAsync(ServiceRequest serviceRequest);
        Task<ServiceRequest> GetScanOrderAsync(int orderId);
        Task<Bundle> GetPatientScanOrdersAsync(int patientId);
        Task<DiagnosticReport> GetDiagnosticReportAsync(int reportId);
        Task<Bundle> GetPatientDiagnosticReportsAsync(int patientId);
        Task<Bundle> GetPatientImagingStudiesAsync(int patientId);
    }

    public class RadiologyCenterFhirClient : IRadiologyCenterFhirClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _radiologyCenterUrl;
        private readonly string _clientId;
        private readonly string _clientSecret;
        private string _accessToken;
        private DateTime _tokenExpiration;
        private readonly ILogger<RadiologyCenterFhirClient> _logger;

        public RadiologyCenterFhirClient(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<RadiologyCenterFhirClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _radiologyCenterUrl = configuration["RadiologyCenter:BaseUrl"] ?? "http://localhost:7001";
            _clientId = configuration["RadiologyCenter:ClientId"] ?? "clinic-system";
            _clientSecret = configuration["RadiologyCenter:ClientSecret"] ?? "clinic-secret";
            _tokenExpiration = DateTime.MinValue;
        }

        /// <summary>
        /// Get or refresh access token from FHIR server
        /// </summary>
        public async Task<string> GetTokenAsync()
        {
            // Return existing token if still valid
            if (!string.IsNullOrEmpty(_accessToken) && DateTime.UtcNow < _tokenExpiration.AddMinutes(-5))
            {
                return _accessToken;
            }

            try
            {
                var tokenRequest = new
                {
                    clientId = _clientId,
                    clientSecret = _clientSecret,
                    grantType = "client_credentials"
                };

                var response = await _httpClient.PostAsJsonAsync(
                    $"{_radiologyCenterUrl}/fhir/token",
                    tokenRequest);

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Token request failed: {response.StatusCode}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonConvert.DeserializeObject<TokenResponse>(content);
                _accessToken = result.AccessToken;
                _tokenExpiration = DateTime.UtcNow.AddSeconds(result.ExpiresIn ?? 3600);

                _logger.LogInformation("Successfully obtained FHIR token");
                return _accessToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to obtain FHIR token");
                throw;
            }
        }

        /// <summary>
        /// Get patient by ID
        /// </summary>
        public async Task<Patient> GetPatientAsync(int patientId)
        {
            return await GetFhirResourceAsync<Patient>($"Patient/{patientId}");
        }

        /// <summary>
        /// Create patient in radiology system
        /// </summary>
        public async Task<Patient> CreatePatientAsync(Patient patient)
        {
            return await PostFhirResourceAsync<Patient>("Patient", patient);
        }

        /// <summary>
        /// Create scan order (ServiceRequest) in radiology system
        /// </summary>
        public async Task<ServiceRequest> CreateScanOrderAsync(ServiceRequest serviceRequest)
        {
            return await PostFhirResourceAsync<ServiceRequest>("ServiceRequest", serviceRequest);
        }

        /// <summary>
        /// Get scan order by ID
        /// </summary>
        public async Task<ServiceRequest> GetScanOrderAsync(int orderId)
        {
            return await GetFhirResourceAsync<ServiceRequest>($"ServiceRequest/{orderId}");
        }

        /// <summary>
        /// Get all scan orders for patient
        /// </summary>
        public async Task<Bundle> GetPatientScanOrdersAsync(int patientId)
        {
            return await GetFhirResourceAsync<Bundle>($"ServiceRequest?subject=Patient/{patientId}");
        }

        /// <summary>
        /// Get diagnostic report (radiology findings)
        /// </summary>
        public async Task<DiagnosticReport> GetDiagnosticReportAsync(int reportId)
        {
            return await GetFhirResourceAsync<DiagnosticReport>($"DiagnosticReport/{reportId}");
        }

        /// <summary>
        /// Get all diagnostic reports for patient (radiology results)
        /// </summary>
        public async Task<Bundle> GetPatientDiagnosticReportsAsync(int patientId)
        {
            return await GetFhirResourceAsync<Bundle>($"DiagnosticReport?subject=Patient/{patientId}");
        }

        /// <summary>
        /// Get imaging studies for patient
        /// </summary>
        public async Task<Bundle> GetPatientImagingStudiesAsync(int patientId)
        {
            return await GetFhirResourceAsync<Bundle>($"ImagingStudy?subject=Patient/{patientId}");
        }

        /// <summary>
        /// Generic GET request for FHIR resources
        /// </summary>
        private async Task<T> GetFhirResourceAsync<T>(string endpoint) where T : class
        {
            try
            {
                var token = await GetTokenAsync();
                var request = new HttpRequestMessage(HttpMethod.Get, $"{_radiologyCenterUrl}/fhir/{endpoint}");
                request.Headers.Add("Authorization", $"Bearer {token}");
                request.Headers.Add("Accept", "application/fhir+json");

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning($"FHIR GET request failed: {response.StatusCode} - {content}");
                    throw new Exception($"FHIR request failed: {response.StatusCode}");
                }

                var jsonContent = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<T>(jsonContent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting FHIR resource: {endpoint}");
                throw;
            }
        }

        /// <summary>
        /// Generic POST request for FHIR resources
        /// </summary>
        private async Task<T> PostFhirResourceAsync<T>(string endpoint, object resource) where T : class
        {
            try
            {
                var token = await GetTokenAsync();
                var request = new HttpRequestMessage(HttpMethod.Post, $"{_radiologyCenterUrl}/fhir/{endpoint}");
                request.Headers.Add("Authorization", $"Bearer {token}");
                request.Headers.Add("Accept", "application/fhir+json");

                var jsonContent = JsonConvert.SerializeObject(resource);
                request.Content = new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/fhir+json");

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning($"FHIR POST request failed: {response.StatusCode} - {content}");
                    throw new Exception($"FHIR request failed: {response.StatusCode}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<T>(responseContent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error posting FHIR resource: {endpoint}");
                throw;
            }
        }
    }

    /// <summary>
    /// FHIR Token Response Model
    /// </summary>
    public class TokenResponse
    {
        [JsonProperty("accessToken")]
        public string AccessToken { get; set; }

        [JsonProperty("tokenType")]
        public string TokenType { get; set; }

        [JsonProperty("expiresIn")]
        public int? ExpiresIn { get; set; }

        [JsonProperty("scope")]
        public string Scope { get; set; }
    }
}
