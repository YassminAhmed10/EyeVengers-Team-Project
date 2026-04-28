using EyeClinicAPI.Modules.RadiologyCenter;

namespace EyeClinicAPI.Modules.DependencyInjection;

public static class IntegrationsModule
{
    public static IServiceCollection AddIntegrationsModule(this IServiceCollection services)
    {
        // Backward-compatibility alias to the dedicated radiology module.
        return services.AddRadiologyCenterModule();
    }
}
