using Microsoft.EntityFrameworkCore;
using RadiologyCenterAPI.Models;

namespace RadiologyCenterAPI.Data
{
    public class RadiologyDbContext : DbContext
    {
        public RadiologyDbContext(DbContextOptions<RadiologyDbContext> options)
            : base(options)
        {
        }

        public DbSet<Patient> Patients { get; set; }
        public DbSet<RadiologyService> RadiologyServices { get; set; }
        public DbSet<Slot> Slots { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<RadiologyReport> RadiologyReports { get; set; }
        public DbSet<RadiologyResult> RadiologyResults { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Models.AdminUser> AdminUsers { get; set; }
        public DbSet<PatientStats> PatientStats { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Patient
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasIndex(e => e.Identifier).IsUnique();
                entity.Property(e => e.Identifier).IsRequired().HasMaxLength(100);
                entity.Property(e => e.FirstName).HasMaxLength(100);
                entity.Property(e => e.LastName).HasMaxLength(100);
                entity.Property(e => e.Gender).HasMaxLength(20);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(100);
            });

            // Configure RadiologyService
            modelBuilder.Entity<RadiologyService>(entity =>
            {
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Display).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Modality).HasMaxLength(50);
            });

            // Configure Slot
            modelBuilder.Entity<Slot>(entity =>
            {
                entity.HasIndex(e => new { e.RadiologyServiceId, e.Start });
                entity.Property(e => e.Status).HasMaxLength(20);
            });

            // Configure Appointment
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.HasIndex(e => e.PatientId);
                entity.HasIndex(e => e.SlotId);
                entity.HasIndex(e => e.RadiologyServiceId);
                entity.HasIndex(e => e.Status);
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.Priority).HasMaxLength(20);
                entity.Property(e => e.ConfirmationId).HasMaxLength(100);
            });

            // Configure RadiologyReport
            modelBuilder.Entity<RadiologyReport>(entity =>
            {
                entity.HasIndex(e => e.AppointmentId);
                entity.Property(e => e.ReportText).HasColumnType("nvarchar(max)");
                entity.Property(e => e.Findings).HasColumnType("nvarchar(max)");
                entity.Property(e => e.Conclusion).HasColumnType("nvarchar(max)");
            });

            // Configure AdminUser (simple development admin account)
            modelBuilder.Entity<Models.AdminUser>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Role).HasMaxLength(50);
            });
        }
    }
}