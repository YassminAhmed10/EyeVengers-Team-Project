namespace EyeClinicAPI.Modules.DependencyInjection;

public static class PatientModule
{
    public static IServiceCollection AddPatientModule(this IServiceCollection services)
    {
        // Keep patient-specific registrations here as the module grows.
        return services;
    }
}
