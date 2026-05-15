using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Console;
using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.Services;
using System.Linq;
using RadiologyCenterAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// ═══════════════════════════════════════════════════════════════════════════════
// FHIR/HL7 LOGGING CONFIGURATION — Console output for segment visibility
// ═══════════════════════════════════════════════════════════════════════════════
builder.Logging.ClearProviders();
builder.Logging.AddSimpleConsole(options =>
{
    options.TimestampFormat = "yyyy-MM-dd HH:mm:ss.fff zzz";
    options.UseUtcTimestamp = false;
    options.IncludeScopes = true;
    options.ColorBehavior = Microsoft.Extensions.Logging.Console.LoggerColorBehavior.Enabled;
});
builder.Logging.AddDebug();
builder.Logging.SetMinimumLevel(LogLevel.Debug);

// ✅ Use SQLite with proper configuration
builder.Services.AddDbContext<RadiologyDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqliteOptions => sqliteOptions.MigrationsAssembly("RadiologyCenterAPI")));

// Core services
builder.Services.AddScoped<IFhirMappingService, FhirMappingService>();
builder.Services.AddScoped<IHl7Service, Hl7Service>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IPatientIdentifierService, PatientIdentifierService>();

// Appointment approval workflow services
builder.Services.AddScoped<IAppointmentApprovalService, AppointmentApprovalService>();
builder.Services.AddScoped<IInvestigationWorkflowService, InvestigationWorkflowService>();
builder.Services.AddScoped<IStatusSynchronizationService, StatusSynchronizationService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

builder.Services.AddHttpContextAccessor();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS — allow all origins for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// ═══════════════════════════════════════════════════════════════════════════════
// STARTUP BANNER
// ═══════════════════════════════════════════════════════════════════════════════
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("\n" + new string('═', 80));
logger.LogInformation("  RADIOLOGY CENTER FHIR/HL7 SERVICE STARTING");
logger.LogInformation("  Environment: {Environment}", app.Environment.EnvironmentName);
logger.LogInformation("  Using: SQLite Database");
logger.LogInformation("  FHIR Segments will be logged to console below");
logger.LogInformation("  Look for: [PID], [SCH], [OBX], [ORM^O01], [ACK^O01]");
logger.LogInformation(new string('═', 80) + "\n");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Auto-create DB with SQLite
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<RadiologyDbContext>();
    
    try
    {
        // Ensure the database is created
        db.Database.EnsureCreated();
        logger.LogInformation("✓ SQLite database created at: RadiologyCenter.db");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to create database");
    }

    // Seed admin user
    try
    {
        if (!db.AdminUsers.Any(u => u.Email == "yassmin@admin.com"))
        {
            db.AdminUsers.Add(new AdminUser
            {
                Email = "yassmin@admin.com",
                Password = "2392005",
                Role = "admin",
                CreatedAt = DateTime.UtcNow
            });
            db.SaveChanges();
            logger.LogInformation("✓ Seeded admin user: yassmin@admin.com (password: 2392005)");
        }
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "⚠ Failed to seed admin user");
    }
}

app.Run();