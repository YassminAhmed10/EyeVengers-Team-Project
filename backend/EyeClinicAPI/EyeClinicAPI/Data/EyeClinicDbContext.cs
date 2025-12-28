// Data/EyeClinicDbContext.cs
using EyeClinicAPI.Models;
using EyeClinicAPI.Models.EMR;
using EyeClinicAPI.Models.Clinic;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace EyeClinicAPI.Data
{
    public class EyeClinicDbContext : DbContext
    {
        public EyeClinicDbContext(DbContextOptions<EyeClinicDbContext> options)
            : base(options) { }

        // ===== Existing Models =====
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<DoctorSchedule> DoctorSchedules { get; set; }
        public DbSet<User> Users { get; set; }

        // ===== EMR Models =====
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<PatientComplaint> PatientComplaints { get; set; }
        public DbSet<MedicalHistory> MedicalHistories { get; set; }
        public DbSet<Investigation> Investigations { get; set; }
        public DbSet<EyeExamination> EyeExaminations { get; set; }
        public DbSet<Operation> Operations { get; set; }
        public DbSet<MedicalTestFile> MedicalTestFiles { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<PrescriptionItem> PrescriptionItems { get; set; }
        public DbSet<Diagnosis> Diagnoses { get; set; }
        public DbSet<Patient> Patients { get; set; }

        // ===== Clinic System Models =====
        public DbSet<Equipment> Equipments { get; set; }
        public DbSet<Supply> Supplies { get; set; }
        public DbSet<MaintenanceTask> MaintenanceTasks { get; set; }
        public DbSet<Sanitization> Sanitizations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Doctor Configuration
            modelBuilder.Entity<Doctor>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.LicenseNumber).IsUnique();
            });

            // Appointment Configuration
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.HasOne(a => a.Doctor)
                      .WithMany(d => d.Appointments)
                      .HasForeignKey(a => a.DoctorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.DoctorId, e.AppointmentDate, e.AppointmentTime });
            });

            // DoctorSchedule Configuration
            modelBuilder.Entity<DoctorSchedule>(entity =>
            {
                entity.HasOne(s => s.Doctor)
                      .WithMany(d => d.Schedules)
                      .HasForeignKey(s => s.DoctorId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.DoctorId, e.DayOfWeek });
            });

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // EMR Models Configuration

            // MedicalRecord Configuration
            modelBuilder.Entity<MedicalRecord>(entity =>
            {
                entity.HasIndex(e => e.PatientId);
                entity.HasIndex(e => e.Id);

                entity.HasMany(m => m.Complaints)
                      .WithOne(c => c.MedicalRecord)
                      .HasForeignKey(c => c.MedicalRecordId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(m => m.Histories)
                      .WithOne(h => h.MedicalRecord)
                      .HasForeignKey(h => h.MedicalRecordId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(m => m.Investigations)
                      .WithOne(i => i.MedicalRecord)
                      .HasForeignKey(i => i.MedicalRecordId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(m => m.EyeExaminations)
                      .WithOne(e => e.MedicalRecord)
                      .HasForeignKey(e => e.MedicalRecordId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(m => m.Operations)
                      .WithOne(o => o.MedicalRecord)
                      .HasForeignKey(o => o.MedicalRecordId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(m => m.MedicalTestFiles)
                      .WithOne(f => f.MedicalRecord)
                      .HasForeignKey(f => f.MedicalRecordId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(m => m.Prescriptions)
                      .WithOne(p => p.MedicalRecord)
                      .HasForeignKey(p => p.MedicalRecordId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(m => m.Diagnoses)
                      .WithOne(d => d.MedicalRecord)
                      .HasForeignKey(d => d.MedicalRecordId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Prescription - PrescriptionItem Relationship
            modelBuilder.Entity<PrescriptionItem>(entity =>
            {
                entity.HasOne(pi => pi.Prescription)
                      .WithMany(p => p.Items)
                      .HasForeignKey(pi => pi.PrescriptionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // PatientComplaint Configuration
            modelBuilder.Entity<PatientComplaint>(entity =>
            {
                entity.HasIndex(e => e.MedicalRecordId);
                entity.HasIndex(e => e.IsArchived);
            });

            // MedicalHistory Configuration
            modelBuilder.Entity<MedicalHistory>(entity =>
            {
                entity.HasIndex(e => e.MedicalRecordId);
                entity.HasIndex(e => e.IsArchived);
            });

            // Investigation Configuration
            modelBuilder.Entity<Investigation>(entity =>
            {
                entity.HasIndex(e => e.MedicalRecordId);
            });

            // EyeExamination Configuration
            modelBuilder.Entity<EyeExamination>(entity =>
            {
                entity.HasIndex(e => e.MedicalRecordId);
                entity.HasIndex(e => e.IsArchived);
            });

            // Operation Configuration
            modelBuilder.Entity<Operation>(entity =>
            {
                entity.HasIndex(e => e.MedicalRecordId);
                entity.HasIndex(e => e.IsArchived);
                entity.HasIndex(e => e.Date);
            });

            // MedicalTestFile Configuration
            modelBuilder.Entity<MedicalTestFile>(entity =>
            {
                entity.HasIndex(e => e.MedicalRecordId);
                entity.HasIndex(e => e.FileType);
            });

            // Diagnosis Configuration
            modelBuilder.Entity<Diagnosis>(entity =>
            {
                entity.HasIndex(e => e.MedicalRecordId);
                entity.HasIndex(e => e.CheckupDate);
            });

            // Patient Configuration (if you have Patient model)
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasIndex(e => e.Id).IsUnique();
                entity.HasIndex(e => e.Email);
                entity.HasIndex(e => e.Phone);
            });

            // Seed Doctor and Receptionist accounts with pre-hashed passwords
            // Password for Dr. Mohab: "mohab123"
            // Password for Receptionist: "reception123"
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "Dr. Mohab Khairy",
                    Email = "mohab@eyeclinic.com",
                    PasswordHash = "$2a$11$I5sDH4p8l2a/mGBM8hfPAe.E18svY1aaDco91sU7a9ZA.EKrAXz/.",
                    Role = "Doctor",
                    CreatedAt = new DateTime(2025, 12, 8, 0, 0, 0, DateTimeKind.Utc)
                },
                new User
                {
                    Id = 2,
                    Username = "Receptionist",
                    Email = "reception@eyeclinic.com",
                    PasswordHash = "$2a$11$1Ov1AN/4vidto4EKX.rmkuwY.CKjjtOVPLtUVspWYnROXSFgTb6K6",
                    Role = "Receptionist",
                    CreatedAt = new DateTime(2025, 12, 8, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}