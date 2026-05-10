using EyeClinicAPI.Services;

namespace EyeClinicAPI.Modules.DependencyInjection;
public static class IntegrationsModule
{
    public static IServiceCollection AddIntegrationsModule(this IServiceCollection services, IConfiguration configuration)
    {
        // Register Radiology Integration Service
        services.AddHttpClient<IRadiologyIntegrationService, RadiologyIntegrationService>();
        
        return services;
    }
}
