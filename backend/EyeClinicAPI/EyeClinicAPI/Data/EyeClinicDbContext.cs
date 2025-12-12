using EyeClinicAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace EyeClinicAPI.Data
{
    public class EyeClinicDbContext : DbContext
    {
        public EyeClinicDbContext(DbContextOptions<EyeClinicDbContext> options)
            : base(options)
        {
        }

        // DbSets
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<DoctorSchedule> DoctorSchedules { get; set; }
        public DbSet<User> Users { get; set; }

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