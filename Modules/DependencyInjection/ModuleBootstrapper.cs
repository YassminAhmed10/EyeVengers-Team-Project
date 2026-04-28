using EyeClinicAPI.Modules.ClinicSystem;
using EyeClinicAPI.Modules.RadiologyCenter;

namespace EyeClinicAPI.Modules.DependencyInjection;

public static class ModuleBootstrapper
{
    public static IServiceCollection AddApplicationModules(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddCoreModule(configuration)
            .AddPatientModule()
            .AddClinicSystemModule()
            .AddRadiologyCenterModule();

        return services;
    }
}
