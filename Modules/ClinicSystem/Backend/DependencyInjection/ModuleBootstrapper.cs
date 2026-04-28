using EyeClinicAPI.Modules.ClinicSystem;
namespace EyeClinicAPI.Modules.DependencyInjection;
public static class ModuleBootstrapper
{
    public static IServiceCollection AddApplicationModules(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddCoreModule(configuration)
            ;
        return services;
    }
}

