using System;
using System.Collections.Generic;
using EyeClinicAPI.Models;
using EyeClinicAPI.Models.EMR;
using PatientModel = EyeClinicAPI.Models.EMR.Patient;


using Microsoft.EntityFrameworkCore;

namespace EyeClinicAPI.Data;
public partial class EyeClinicDbContext : DbContext
{
    public EyeClinicDbContext()
    {
    }

    public EyeClinicDbContext(DbContextOptions<EyeClinicDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Appointment> Appointments { get; set; }

    public virtual DbSet<Diagnosis> Diagnoses { get; set; }

    public virtual DbSet<Doctor> Doctors { get; set; }

    public virtual DbSet<DoctorSchedule> DoctorSchedules { get; set; }

    public virtual DbSet<EyeExamination> EyeExaminations { get; set; }

    public virtual DbSet<Investigation> Investigations { get; set; }

    public virtual DbSet<MedicalHistory> MedicalHistories { get; set; }

    public virtual DbSet<MedicalRecord> MedicalRecords { get; set; }

    public virtual DbSet<MedicalTestFile> MedicalTestFiles { get; set; }

    public virtual DbSet<Operation> Operations { get; set; }

    public virtual DbSet<PatientModel> Patients { get; set; }

    public virtual DbSet<PatientComplaint> PatientComplaints { get; set; }

    public virtual DbSet<Prescription> Prescriptions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    // Clinic Management
    public virtual DbSet<Equipment> Equipment { get; set; }

    public virtual DbSet<MedicalSupplies> MedicalSupplies { get; set; }

    public virtual DbSet<SanitizationSchedule> SanitizationSchedule { get; set; }

    public virtual DbSet<MaintenanceTasks> MaintenanceTasks { get; set; }

    public virtual DbSet<WasteManagement> WasteManagement { get; set; }

    public virtual DbSet<EyeClinicAPI.Models.Clinic.Notification> Notifications { get; set; }

    // Doctor Orders
    public virtual DbSet<EyeClinicAPI.Models.Clinic.DoctorOrder> DoctorOrders { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=EyeClinicDB;Integrated Security=True;Connect Timeout=30;Encrypt=False;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasIndex(e => new { e.DoctorId, e.AppointmentDate, e.AppointmentTime }, "IX_Appointments_DoctorId_AppointmentDate_AppointmentTime");

            entity.Property(e => e.Address).HasMaxLength(200);
            entity.Property(e => e.Age).HasMaxLength(3);
            entity.Property(e => e.AppointmentType)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("");
            entity.Property(e => e.ChronicDiseases).HasMaxLength(500);
            entity.Property(e => e.Coverage).HasMaxLength(10);
            entity.Property(e => e.CoverageType).HasMaxLength(50);
            entity.Property(e => e.CurrentMedications).HasMaxLength(500);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.EmergencyContactName).HasMaxLength(100);
            entity.Property(e => e.EmergencyContactPhone).HasMaxLength(20);
            entity.Property(e => e.EyeAllergies).HasMaxLength(500);
            entity.Property(e => e.EyeSurgeries).HasMaxLength(500);
            entity.Property(e => e.FamilyEyeDiseases).HasMaxLength(500);
            entity.Property(e => e.FinalPrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.InsuranceCompany).HasMaxLength(100);
            entity.Property(e => e.InsuranceContact).HasMaxLength(20);
            entity.Property(e => e.InsuranceId).HasMaxLength(50);
            entity.Property(e => e.NationalId).HasMaxLength(20);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.OtherAllergies).HasMaxLength(500);
            entity.Property(e => e.OtherEyeSurgeries).HasMaxLength(500);
            entity.Property(e => e.OtherFamilyDiseases).HasMaxLength(500);
            entity.Property(e => e.PatientId)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.PatientName)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.PaymentMethod).HasMaxLength(50);
            entity.Property(e => e.PaymentStatus).HasMaxLength(50);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.PolicyNumber).HasMaxLength(50);
            entity.Property(e => e.ReasonForVisit).HasMaxLength(200);
            entity.Property(e => e.VisionSymptoms).HasMaxLength(500);

            entity.HasOne(d => d.Doctor).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.DoctorId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Diagnosis>(entity =>
        {
            entity.HasIndex(e => e.CheckupDate, "IX_Diagnoses_CheckupDate");
            entity.HasIndex(e => e.MedicalRecordId, "IX_Diagnoses_MedicalRecordId");
            entity.Property(e => e.ICD10Code).HasColumnName("ICD10Code");
            entity.HasOne(d => d.MedicalRecord).WithMany(p => p.Diagnoses).HasForeignKey(d => d.MedicalRecordId);
        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasIndex(e => e.Email, "IX_Doctors_Email").IsUnique();
            entity.HasIndex(e => e.LicenseNumber, "IX_Doctors_LicenseNumber").IsUnique();
            entity.Property(e => e.ClinicAddress).HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.EmergencyContact).HasMaxLength(20);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Gender).IsRequired();
            entity.Property(e => e.LicenseNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Qualifications).HasMaxLength(500);
            entity.Property(e => e.Specialization).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<DoctorSchedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId);
            entity.HasIndex(e => new { e.DoctorId, e.DayOfWeek }, "IX_DoctorSchedules_DoctorId_DayOfWeek");
            entity.HasOne(d => d.Doctor).WithMany().HasForeignKey(d => d.DoctorId);
        });

        modelBuilder.Entity<EyeExamination>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.MedicalRecordId, "IX_EyeExaminations_MedicalRecordId");
            entity.HasOne(d => d.MedicalRecord).WithMany(p => p.EyeExaminations).HasForeignKey(d => d.MedicalRecordId);
        });

        modelBuilder.Entity<Investigation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.MedicalRecordId, "IX_Investigations_MedicalRecordId");
            entity.HasOne(d => d.MedicalRecord).WithMany(p => p.Investigations).HasForeignKey(d => d.MedicalRecordId);
        });

        modelBuilder.Entity<MedicalHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.MedicalRecordId, "IX_MedicalHistories_MedicalRecordId");
            entity.HasOne(d => d.MedicalRecord).WithMany(p => p.MedicalHistories).HasForeignKey(d => d.MedicalRecordId);
        });

        modelBuilder.Entity<MedicalRecord>(entity =>
        {
            entity.HasIndex(e => e.PatientId, "IX_MedicalRecords_PatientId");
            entity.HasOne(d => d.Patient).WithMany().HasForeignKey(d => d.PatientId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MedicalTestFile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.MedicalRecordId, "IX_MedicalTestFiles_MedicalRecordId");
            entity.HasOne(d => d.MedicalRecord).WithMany(p => p.MedicalTestFiles).HasForeignKey(d => d.MedicalRecordId);
        });

        modelBuilder.Entity<Operation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.MedicalRecordId, "IX_Operations_MedicalRecordId");
            entity.HasOne(d => d.MedicalRecord).WithMany(p => p.Operations).HasForeignKey(d => d.MedicalRecordId);
        });

        modelBuilder.Entity<PatientComplaint>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.MedicalRecordId, "IX_PatientComplaints_MedicalRecordId");
            entity.HasOne(d => d.MedicalRecord).WithMany(p => p.PatientComplaints).HasForeignKey(d => d.MedicalRecordId);
        });

        modelBuilder.Entity<Prescription>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.MedicalRecordId, "IX_Prescriptions_MedicalRecordId");
            entity.HasOne(d => d.MedicalRecord).WithMany(p => p.Prescriptions).HasForeignKey(d => d.MedicalRecordId);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}






