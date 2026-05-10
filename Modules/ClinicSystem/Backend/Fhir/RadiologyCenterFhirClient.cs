using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Threading;
using Hl7.Fhir.Model;
using Hl7.Fhir.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
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
        Task<Patient> GetPatientAsync(string patientId);
        Task<Patient> CreatePatientAsync(Patient patient);
        Task<ServiceRequest> CreateScanOrderAsync(ServiceRequest serviceRequest);
        Task<ServiceRequest> GetScanOrderAsync(string orderId);
        Task<Bundle> GetPatientScanOrdersAsync(string patientId);
        Task<DiagnosticReport> GetDiagnosticReportAsync(string reportId);
        Task<Bundle> GetPatientDiagnosticReportsAsync(string patientId);
        Task<Bundle> GetPatientImagingStudiesAsync(string patientId);
        Task<bool> CheckConnectionAsync();
        Task<Bundle> SearchServiceRequestsAsync(string patientId, string status = null);
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
        private readonly SemaphoreSlim _tokenLock = new SemaphoreSlim(1, 1);

        public RadiologyCenterFhirClient(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<RadiologyCenterFhirClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _radiologyCenterUrl = configuration["RadiologyCenter:BaseUrl"] ?? "http://localhost:5000";
            _clientId = configuration["RadiologyCenter:ClientId"] ?? "clinic-system";
            _clientSecret = configuration["RadiologyCenter:ClientSecret"] ?? "clinic-secret";
            _tokenExpiration = DateTime.MinValue;
            
            // Set default headers
            _httpClient.DefaultRequestHeaders.Add("Accept", "application/fhir+json");
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

            await _tokenLock.WaitAsync();
            try
            {
                // Double-check after acquiring lock
                if (!string.IsNullOrEmpty(_accessToken) && DateTime.UtcNow < _tokenExpiration.AddMinutes(-5))
                {
                    return _accessToken;
                }

                _logger.LogInformation("Requesting new FHIR token from {Url}", _radiologyCenterUrl);

                var tokenRequest = new
                {
                    client_id = _clientId,
                    client_secret = _clientSecret,
                    grant_type = "client_credentials"
                };

                var response = await _httpClient.PostAsJsonAsync(
                    $"{_radiologyCenterUrl}/fhir/token",
                    tokenRequest);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Token request failed: {StatusCode} - {Error}", response.StatusCode, errorContent);
                    throw new Exception($"Token request failed: {response.StatusCode} - {errorContent}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonConvert.DeserializeObject<TokenResponse>(content);
                
                if (result?.AccessToken == null)
                {
                    throw new Exception("Invalid token response - missing access token");
                }

                _accessToken = result.AccessToken;
                _tokenExpiration = DateTime.UtcNow.AddSeconds(result.ExpiresIn ?? 3600);

                _logger.LogInformation("Successfully obtained FHIR token, expires at {Expiration}", _tokenExpiration);
                return _accessToken;
            }
            finally
            {
                _tokenLock.Release();
            }
        }

        /// <summary>
        /// Check if Radiology Center is accessible
        /// </summary>
        public async Task<bool> CheckConnectionAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_radiologyCenterUrl}/fhir/metadata");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Radiology Center connection check failed");
                return false;
            }
        }

        /// <summary>
        /// Get patient by ID
        /// </summary>
        public async Task<Patient> GetPatientAsync(string patientId)
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
        public async Task<ServiceRequest> GetScanOrderAsync(string orderId)
        {
            return await GetFhirResourceAsync<ServiceRequest>($"ServiceRequest/{orderId}");
        }

        /// <summary>
        /// Get all scan orders for patient
        /// </summary>
        public async Task<Bundle> GetPatientScanOrdersAsync(string patientId)
        {
            return await GetFhirResourceAsync<Bundle>($"ServiceRequest?subject=Patient/{patientId}&_sort=-authored");
        }

        /// <summary>
        /// Search ServiceRequests with filters
        /// </summary>
        public async Task<Bundle> SearchServiceRequestsAsync(string patientId, string status = null)
        {
            var query = $"ServiceRequest?subject=Patient/{patientId}";
            if (!string.IsNullOrEmpty(status))
            {
                query += $"&status={status}";
            }
            query += "&_sort=-authored";
            
            return await GetFhirResourceAsync<Bundle>(query);
        }

        /// <summary>
        /// Get diagnostic report (radiology findings)
        /// </summary>
        public async Task<DiagnosticReport> GetDiagnosticReportAsync(string reportId)
        {
            return await GetFhirResourceAsync<DiagnosticReport>($"DiagnosticReport/{reportId}");
        }

        /// <summary>
        /// Get all diagnostic reports for patient (radiology results)
        /// </summary>
        public async Task<Bundle> GetPatientDiagnosticReportsAsync(string patientId)
        {
            return await GetFhirResourceAsync<Bundle>($"DiagnosticReport?subject=Patient/{patientId}&_sort=-issued");
        }

        /// <summary>
        /// Get imaging studies for patient
        /// </summary>
        public async Task<Bundle> GetPatientImagingStudiesAsync(string patientId)
        {
            return await GetFhirResourceAsync<Bundle>($"ImagingStudy?subject=Patient/{patientId}&_sort=-started");
        }

        /// <summary>
        /// Generic GET request for FHIR resources
        /// </summary>
        private async Task<T?> GetFhirResourceAsync<T>(string endpoint) where T : Hl7.Fhir.Model.Base
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
                    _logger.LogWarning("FHIR GET request failed: {StatusCode} - {Endpoint} - {Content}", 
                        response.StatusCode, endpoint, content);
                    
                    if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        return null;
                    }
                    
                    throw new Exception($"FHIR request failed: {response.StatusCode} - {content}");
                }

                var jsonContent = await response.Content.ReadAsStringAsync();
                
                // Use FhirJsonParser for better FHIR parsing
                var parser = new FhirJsonParser();
                var resource = parser.Parse<T>(jsonContent);
                return resource;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting FHIR resource: {Endpoint}", endpoint);
                throw;
            }
        }

        /// <summary>
        /// Generic POST request for FHIR resources
        /// </summary>
        private async Task<T?> PostFhirResourceAsync<T>(string endpoint, object resource) where T : Hl7.Fhir.Model.Base
        {
            try
            {
                var token = await GetTokenAsync();
                var request = new HttpRequestMessage(HttpMethod.Post, $"{_radiologyCenterUrl}/fhir/{endpoint}");
                request.Headers.Add("Authorization", $"Bearer {token}");
                request.Headers.Add("Accept", "application/fhir+json");

                // Serialize using FHIR serializer
                var serializer = new FhirJsonSerializer(new SerializerSettings
                {
                    Pretty = true
                });
                
                string jsonContent;
                if (resource is Resource fhirResource)
                {
                    jsonContent = serializer.SerializeToString(fhirResource);
                }
                else
                {
                    jsonContent = JsonConvert.SerializeObject(resource);
                }
                
                request.Content = new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/fhir+json");

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("FHIR POST request failed: {StatusCode} - {Endpoint} - {Error}", 
                        response.StatusCode, endpoint, errorContent);
                    throw new Exception($"FHIR request failed: {response.StatusCode} - {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var parser = new FhirJsonParser();
                var result = parser.Parse<T>(responseContent);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error posting FHIR resource: {Endpoint}", endpoint);
                throw;
            }
        }
    }

    /// <summary>
    /// FHIR Token Response Model
    /// </summary>
    public class TokenResponse
    {
        [JsonProperty("access_token")]
        public string AccessToken { get; set; }

        [JsonProperty("token_type")]
        public string TokenType { get; set; }

        [JsonProperty("expires_in")]
        public int? ExpiresIn { get; set; }

        [JsonProperty("scope")]
        public string Scope { get; set; }
    }
}