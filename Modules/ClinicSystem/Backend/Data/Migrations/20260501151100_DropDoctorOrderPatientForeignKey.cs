using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EyeClinicAPI.Migrations
{
    /// <inheritdoc />
    public partial class DropDoctorOrderPatientForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the FK constraint that prevents PatientId from being NULL
            migrationBuilder.Sql(@"
                IF OBJECT_ID('FK_DoctorOrders_Patients_PatientId', 'F') IS NOT NULL
                    ALTER TABLE [DoctorOrders] DROP CONSTRAINT [FK_DoctorOrders_Patients_PatientId];
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Recreate the FK constraint if rolling back
            migrationBuilder.Sql(@"
                IF OBJECT_ID('FK_DoctorOrders_Patients_PatientId', 'F') IS NULL
                    ALTER TABLE [DoctorOrders]
                    ADD CONSTRAINT [FK_DoctorOrders_Patients_PatientId]
                    FOREIGN KEY ([PatientId]) REFERENCES [Patients]([Id]) ON DELETE NO ACTION;
            ");
        }
    }
}
