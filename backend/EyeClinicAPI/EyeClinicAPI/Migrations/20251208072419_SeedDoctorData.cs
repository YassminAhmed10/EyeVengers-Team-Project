using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EyeClinicAPI.Migrations
{
    /// <inheritdoc />
    public partial class SeedDoctorData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Doctors",
                columns: new[] { "DoctorId", "FullName", "Email", "PhoneNumber", "Specialization", "LicenseNumber", "YearsOfExperience", "IsActive", "CreatedAt", "Gender" },
                values: new object[] { 1, "Dr. Mohab Khairy", "mohab.khairy@eyecare.com", "+20123456789", "Ophthalmologist", "EG-OPH-2015-001", 10, true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Male" }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Doctors",
                keyColumn: "DoctorId",
                keyValue: 1
            );
        }
    }
}
