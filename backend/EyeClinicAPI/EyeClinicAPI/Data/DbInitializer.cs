using EyeClinicAPI.Data;
using EyeClinicAPI.Models;
using System;
using System.Linq;

public static class DbInitializer
{
    public static void Initialize(EyeClinicDbContext context)
    {
        context.Database.EnsureCreated();

        // Add default doctor if none exists
        if (!context.Doctors.Any())
        {
            var defaultDoctor = new Doctor
            {
                FullName = "Dr. Mohab Khairy",
                Email = "mohab.khairy@eyeclinic.com",
                PhoneNumber = "01234567890",
                Specialization = "Ophthalmology",
                LicenseNumber = "EYE-2024-001",
                YearsOfExperience = 10,
                IsActive = true,
                Gender = "Male",
                CreatedAt = DateTime.Now
            };
            context.Doctors.Add(defaultDoctor);
            context.SaveChanges();
        }
    }
}
