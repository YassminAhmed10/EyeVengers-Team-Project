using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EyeClinicAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorOrdersTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Investigations_MedicalRecords_MedicalRecordId1",
                table: "Investigations");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicalHistories_MedicalRecords_MedicalRecordId1",
                table: "MedicalHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientComplaints_MedicalRecords_MedicalRecordId1",
                table: "PatientComplaints");

            migrationBuilder.DropForeignKey(
                name: "FK_PrescriptionItem_Prescriptions_PrescriptionId",
                table: "PrescriptionItem");

            migrationBuilder.DropForeignKey(
                name: "FK_Prescriptions_MedicalRecords_MedicalRecordId1",
                table: "Prescriptions");

            migrationBuilder.DropIndex(
                name: "IX_Prescriptions_MedicalRecordId1",
                table: "Prescriptions");

            migrationBuilder.DropIndex(
                name: "IX_PatientComplaints_MedicalRecordId1",
                table: "PatientComplaints");

            migrationBuilder.DropIndex(
                name: "IX_MedicalHistories_MedicalRecordId1",
                table: "MedicalHistories");

            migrationBuilder.DropIndex(
                name: "IX_Investigations_MedicalRecordId1",
                table: "Investigations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PrescriptionItem",
                table: "PrescriptionItem");

            migrationBuilder.DropColumn(
                name: "MedicalRecordId1",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "MedicalRecordId1",
                table: "PatientComplaints");

            migrationBuilder.DropColumn(
                name: "MedicalRecordId1",
                table: "MedicalHistories");

            migrationBuilder.DropColumn(
                name: "MedicalRecordId1",
                table: "Investigations");

            migrationBuilder.RenameTable(
                name: "PrescriptionItem",
                newName: "PrescriptionItems");

            migrationBuilder.RenameIndex(
                name: "IX_PrescriptionItem_PrescriptionId",
                table: "PrescriptionItems",
                newName: "IX_PrescriptionItems_PrescriptionId");

            migrationBuilder.AlterColumn<string>(
                name: "Complaint",
                table: "PatientComplaints",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChronicDiseases",
                table: "MedicalHistories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentMedications",
                table: "MedicalHistories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EyeSurgeries",
                table: "MedicalHistories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FamilyEyeDiseases",
                table: "MedicalHistories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VisionSymptoms",
                table: "MedicalHistories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PrescriptionItems",
                table: "PrescriptionItems",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "DoctorOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    MedicalRecordId = table.Column<int>(type: "int", nullable: false),
                    DoctorId = table.Column<int>(type: "int", nullable: false),
                    OrderType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DataJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "PendingPatientApproval"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AppointmentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AppointmentTime = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    ExternalSystemConfirmationId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorOrders_MedicalRecords_MedicalRecordId",
                        column: x => x.MedicalRecordId,
                        principalTable: "MedicalRecords",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DoctorOrders_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DoctorOrders_MedicalRecordId",
                table: "DoctorOrders",
                column: "MedicalRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorOrders_PatientId",
                table: "DoctorOrders",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorOrders_Status",
                table: "DoctorOrders",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_PrescriptionItems_Prescriptions_PrescriptionId",
                table: "PrescriptionItems",
                column: "PrescriptionId",
                principalTable: "Prescriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PrescriptionItems_Prescriptions_PrescriptionId",
                table: "PrescriptionItems");

            migrationBuilder.DropTable(
                name: "DoctorOrders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PrescriptionItems",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "ChronicDiseases",
                table: "MedicalHistories");

            migrationBuilder.DropColumn(
                name: "CurrentMedications",
                table: "MedicalHistories");

            migrationBuilder.DropColumn(
                name: "EyeSurgeries",
                table: "MedicalHistories");

            migrationBuilder.DropColumn(
                name: "FamilyEyeDiseases",
                table: "MedicalHistories");

            migrationBuilder.DropColumn(
                name: "VisionSymptoms",
                table: "MedicalHistories");

            migrationBuilder.RenameTable(
                name: "PrescriptionItems",
                newName: "PrescriptionItem");

            migrationBuilder.RenameIndex(
                name: "IX_PrescriptionItems_PrescriptionId",
                table: "PrescriptionItem",
                newName: "IX_PrescriptionItem_PrescriptionId");

            migrationBuilder.AddColumn<int>(
                name: "MedicalRecordId1",
                table: "Prescriptions",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Complaint",
                table: "PatientComplaints",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "MedicalRecordId1",
                table: "PatientComplaints",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MedicalRecordId1",
                table: "MedicalHistories",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MedicalRecordId1",
                table: "Investigations",
                type: "int",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PrescriptionItem",
                table: "PrescriptionItem",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_MedicalRecordId1",
                table: "Prescriptions",
                column: "MedicalRecordId1");

            migrationBuilder.CreateIndex(
                name: "IX_PatientComplaints_MedicalRecordId1",
                table: "PatientComplaints",
                column: "MedicalRecordId1");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalHistories_MedicalRecordId1",
                table: "MedicalHistories",
                column: "MedicalRecordId1");

            migrationBuilder.CreateIndex(
                name: "IX_Investigations_MedicalRecordId1",
                table: "Investigations",
                column: "MedicalRecordId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Investigations_MedicalRecords_MedicalRecordId1",
                table: "Investigations",
                column: "MedicalRecordId1",
                principalTable: "MedicalRecords",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicalHistories_MedicalRecords_MedicalRecordId1",
                table: "MedicalHistories",
                column: "MedicalRecordId1",
                principalTable: "MedicalRecords",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PatientComplaints_MedicalRecords_MedicalRecordId1",
                table: "PatientComplaints",
                column: "MedicalRecordId1",
                principalTable: "MedicalRecords",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PrescriptionItem_Prescriptions_PrescriptionId",
                table: "PrescriptionItem",
                column: "PrescriptionId",
                principalTable: "Prescriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Prescriptions_MedicalRecords_MedicalRecordId1",
                table: "Prescriptions",
                column: "MedicalRecordId1",
                principalTable: "MedicalRecords",
                principalColumn: "Id");
        }
    }
}
