using EyeClinicAPI.Data;
using EyeClinicAPI.Modules.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Console;

var builder = WebApplication.CreateBuilder(args);

// ═════════════════════════════════════════════════════════════════════════════
// FHIR/HL7 LOGGING CONFIGURATION — Console output for segment visibility
// ═════════════════════════════════════════════════════════════════════════════
builder.Logging.ClearProviders();
builder.Logging.AddSimpleConsole(options =>
{
    options.TimestampFormat = "yyyy-MM-dd HH:mm:ss.fff zzz";
    options.UseUtcTimestamp = false;
    options.IncludeScopes = true;
    options.ColorBehavior = LoggerColorBehavior.Enabled;
});
builder.Logging.AddDebug();
builder.Logging.SetMinimumLevel(LogLevel.Debug);

builder.Services.AddApplicationModules(builder.Configuration);

var app = builder.Build();

// ═════════════════════════════════════════════════════════════════════════════
// STARTUP BANNER — Shows Eye Clinic + FHIR/HL7 Integration
// ═════════════════════════════════════════════════════════════════════════════
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("\n" + new string('═', 80));
logger.LogInformation("  EYE CLINIC FHIR/HL7 API SERVICE STARTING");
logger.LogInformation("  Environment: {Environment}", app.Environment.EnvironmentName);
logger.LogInformation("  FHIR Segments will be logged to console below");
logger.LogInformation("  Integration with Radiology Center enabled");
logger.LogInformation(new string('═', 80) + "\n");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<EyeClinicDbContext>();
        // DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var dbLogger = services.GetRequiredService<ILogger<Program>>();
        dbLogger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// ===== Uploads Folder Configuration =====
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");

if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/Uploads"
});


app.UseCoreModule();
app.Run();


