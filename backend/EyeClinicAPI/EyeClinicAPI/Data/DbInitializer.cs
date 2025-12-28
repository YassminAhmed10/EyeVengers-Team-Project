using EyeClinicAPI.Models;
using EyeClinicAPI.Data;
using System.Security.Cryptography;
using System.Text;
using System.Linq;

namespace EyeClinicAPI.Data
{
    public static class DbInitializer
    {
        public static void Initialize(EyeClinicDbContext context)
        {
            context.Database.EnsureCreated();

            // Seed Doctors first
            if (!context.Doctors.Any())
            {
                var doctors = new Doctor[]
                {
                    new Doctor
                    {
                        FullName = "Dr. Ahmed Hassan",
                        Specialization = "Ophthalmologist",
                        Email = "ahmed.hassan@eyeclinic.com",
                        PhoneNumber = "01234567890",
                        LicenseNumber = "LIC001",
                        Gender = "Male",
                        YearsOfExperience = 10,
                        Qualifications = "MD, PhD in Ophthalmology",
                        ClinicAddress = "123 Medical Street, Cairo",
                        IsAvailable = true,
                        CreatedAt = DateTime.Now
                    },
                    new Doctor
                    {
                        FullName = "Dr. Fatima Ali",
                        Specialization = "Eye Surgeon",
                        Email = "fatima.ali@eyeclinic.com",
                        PhoneNumber = "01234567891",
                        LicenseNumber = "LIC002",
                        Gender = "Female",
                        YearsOfExperience = 8,
                        Qualifications = "MD in Ophthalmology, Fellowship in Eye Surgery",
                        ClinicAddress = "456 Vision Avenue, Cairo",
                        IsAvailable = true,
                        CreatedAt = DateTime.Now
                    },
                    new Doctor
                    {
                        FullName = "Dr. Mohamed Samir",
                        Specialization = "Retina Specialist",
                        Email = "mohamed.samir@eyeclinic.com",
                        PhoneNumber = "01234567892",
                        LicenseNumber = "LIC003",
                        Gender = "Male",
                        YearsOfExperience = 12,
                        Qualifications = "MD, PhD, Retina Fellowship",
                        ClinicAddress = "789 Eye Care Road, Cairo",
                        IsAvailable = true,
                        CreatedAt = DateTime.Now
                    }
                };

                context.Doctors.AddRange(doctors);
                context.SaveChanges();
                Console.WriteLine($"✅ Added {doctors.Length} doctors");
            }

            // Seed Users
            if (!context.Users.Any())
            {
                var users = new User[]
                {
                    new User
                    {
                        Username = "Dr Mohab Khairy",
                        Email = "mohab@eyeclinic.com",
                        PasswordHash = HashPassword("mohab123"),
                        Role = "Doctor",
                        CreatedAt = DateTime.Now
                    },
                    new User
                    {
                        Username = "Reception",
                        Email = "reception@eyeclinic.com",
                        PasswordHash = HashPassword("reception123"),
                        Role = "Receptionist",
                        CreatedAt = DateTime.Now
                    }
                };

                context.Users.AddRange(users);
                context.SaveChanges();
                Console.WriteLine($"✅ Added {users.Length} users");
            }

            Console.WriteLine("✅ Database seeded successfully!");
        }

        private static string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }
    }
}