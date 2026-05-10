using System.Text.Json;
using System.Web;
using EyeClinicAPI.Controllers;

namespace EyeClinicAPI.Services
{
    public interface IRadiologyIntegrationService
    {
        Task<List<object>> GetServicesAsync();
        Task<List<object>> GetAvailableSlotsAsync(string service, string date);
        Task<object> BookAppointmentAsync(BookRadiologyAppointmentRequest request);
        Task<object> GetAppointmentStatusAsync(int appointmentId);
        Task<object> CancelAppointmentAsync(int appointmentId);
    }

    public class RadiologyIntegrationService : IRadiologyIntegrationService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<RadiologyIntegrationService> _logger;
        private readonly string _radiologyCenterBaseUrl;

        public RadiologyIntegrationService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<RadiologyIntegrationService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _radiologyCenterBaseUrl = configuration["RadiologyCenter:BaseUrl"] ?? "http://localhost:5175/api";
        }

        /// <summary>
        /// Fetch all available radiology services from the Radiology Center
        /// </summary>
        public async Task<List<object>> GetServicesAsync()
        {
            try
            {
                var url = $"{_radiologyCenterBaseUrl}/Radiology/services";
                _logger.LogInformation("Fetching services from {Url}", url);

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to fetch services. Status: {StatusCode}", response.StatusCode);
                    throw new HttpRequestException($"Radiology Center returned {response.StatusCode}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var services = JsonSerializer.Deserialize<List<object>>(content) ?? new List<object>();

                _logger.LogInformation("Retrieved {Count} services", services.Count);
                return services;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP error while fetching services");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching services");
                throw;
            }
        }

        /// <summary>
        /// Fetch available appointment slots for a service on a specific date
        /// </summary>
        public async Task<List<object>> GetAvailableSlotsAsync(string service, string date)
        {
            try
            {
                var encodedService = HttpUtility.UrlEncode(service);
                var url = $"{_radiologyCenterBaseUrl}/Radiology/slots?service={encodedService}&date={date}";
                _logger.LogInformation("Fetching slots from {Url}", url);

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to fetch slots. Status: {StatusCode}", response.StatusCode);
                    throw new HttpRequestException($"Radiology Center returned {response.StatusCode}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var slots = JsonSerializer.Deserialize<List<object>>(content) ?? new List<object>();

                _logger.LogInformation("Retrieved {Count} slots for service {Service} on {Date}", slots.Count, service, date);
                return slots;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP error while fetching slots");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching slots");
                throw;
            }
        }

        /// <summary>
        /// Book a radiology appointment in the Radiology Center
        /// </summary>
        public async Task<object> BookAppointmentAsync(BookRadiologyAppointmentRequest request)
        {
            try
            {
                // Validate request
                if (request.OrderId <= 0)
                    throw new ArgumentException("OrderId must be greater than 0");
                if (string.IsNullOrEmpty(request.AppointmentDate))
                    throw new ArgumentException("AppointmentDate is required");
                if (string.IsNullOrEmpty(request.AppointmentTime))
                    throw new ArgumentException("AppointmentTime is required");
                if (string.IsNullOrEmpty(request.ServiceCode))
                    throw new ArgumentException("ServiceCode is required");

                var url = $"{_radiologyCenterBaseUrl}/Radiology/book";
                _logger.LogInformation("Booking appointment at {Url}", url);

                var bookingRequest = new
                {
                    patientId = request.OrderId,
                    patientFirstName = "Patient",
                    patientLastName = request.OrderId.ToString(),
                    patientEmail = "",
                    serviceCode = request.ServiceCode,
                    serviceDisplay = request.ServiceDisplay ?? request.ServiceCode,
                    appointmentDate = request.AppointmentDate,
                    appointmentTime = request.AppointmentTime,
                    priority = request.Priority ?? "routine"
                };

                var jsonContent = new StringContent(
                    System.Text.Json.JsonSerializer.Serialize(bookingRequest),
                    System.Text.Encoding.UTF8,
                    "application/json");

                var response = await _httpClient.PostAsync(url, jsonContent);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to book appointment. Status: {StatusCode}, Response: {Response}", 
                        response.StatusCode, errorContent);
                    throw new HttpRequestException($"Radiology Center returned {response.StatusCode}: {errorContent}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<dynamic>(content);

                _logger.LogInformation("Appointment booked successfully. OrderId: {OrderId}", request.OrderId);
                return result ?? new { success = true };
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP error while booking appointment");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error booking appointment");
                throw;
            }
        }

        /// <summary>
        /// Get the status of a booked appointment
        /// </summary>
        public async Task<object> GetAppointmentStatusAsync(int appointmentId)
        {
            try
            {
                if (appointmentId <= 0)
                    throw new ArgumentException("AppointmentId must be greater than 0");

                var url = $"{_radiologyCenterBaseUrl}/Radiology/appointments/{appointmentId}";
                _logger.LogInformation("Fetching appointment from {Url}", url);

                var response = await _httpClient.GetAsync(url);

                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    throw new KeyNotFoundException($"Appointment {appointmentId} not found");
                }

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to fetch appointment. Status: {StatusCode}", response.StatusCode);
                    throw new HttpRequestException($"Radiology Center returned {response.StatusCode}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var appointment = JsonSerializer.Deserialize<dynamic>(content);

                _logger.LogInformation("Retrieved appointment {AppointmentId}", appointmentId);
                return appointment ?? new { };
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP error while fetching appointment");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching appointment");
                throw;
            }
        }

        /// <summary>
        /// Cancel a booked appointment
        /// </summary>
        public async Task<object> CancelAppointmentAsync(int appointmentId)
        {
            try
            {
                if (appointmentId <= 0)
                    throw new ArgumentException("AppointmentId must be greater than 0");

                var url = $"{_radiologyCenterBaseUrl}/Radiology/appointments/{appointmentId}/cancel";
                _logger.LogInformation("Cancelling appointment at {Url}", url);

                var response = await _httpClient.PostAsync(url, new StringContent(""));

                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    throw new KeyNotFoundException($"Appointment {appointmentId} not found");
                }

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to cancel appointment. Status: {StatusCode}", response.StatusCode);
                    throw new HttpRequestException($"Radiology Center returned {response.StatusCode}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<dynamic>(content);

                _logger.LogInformation("Appointment {AppointmentId} cancelled successfully", appointmentId);
                return result ?? new { success = true };
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP error while cancelling appointment");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling appointment");
                throw;
            }
        }
    }
}
