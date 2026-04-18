using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EyeClinicAPI.Migrations
{
    /// <inheritdoc />
    public partial class MakePatientIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Doctors_DoctorId",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicalRecords_Patients_PatientId",
                table: "MedicalRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_PrescriptionItems_Prescriptions_PrescriptionId",
                table: "PrescriptionItems");

            migrationBuilder.DropTable(
                name: "Equipments");

            migrationBuilder.DropTable(
                name: "Sanitizations");

            migrationBuilder.DropTable(
                name: "Supplies");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PrescriptionItems",
                table: "PrescriptionItems");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DropColumn(
                name: "Category",
                table: "MaintenanceTasks");

            migrationBuilder.DropColumn(
                name: "Task",
                table: "MaintenanceTasks");

            migrationBuilder.RenameTable(
                name: "PrescriptionItems",
                newName: "PrescriptionItem");

            migrationBuilder.RenameColumn(
                name: "DueDate",
                table: "MaintenanceTasks",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "MaintenanceTasks",
                newName: "TaskId");

            migrationBuilder.RenameIndex(
                name: "IX_PrescriptionItems_PrescriptionId",
                table: "PrescriptionItem",
                newName: "IX_PrescriptionItem_PrescriptionId");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<int>(
                name: "MedicalRecordId1",
                table: "Prescriptions",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "InsuranceId",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "InsuranceCompany",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "EmergencyContactPhone",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "EmergencyContactName",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "MedicalRecordId1",
                table: "PatientComplaints",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OperationName",
                table: "Operations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "Operations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<int>(
                name: "PatientId",
                table: "MedicalRecords",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "MedicalRecordId1",
                table: "MedicalHistories",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "MaintenanceTasks",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Priority",
                table: "MaintenanceTasks",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "AssignedTo",
                table: "MaintenanceTasks",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<decimal>(
                name: "ActualCost",
                table: "MaintenanceTasks",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EquipmentId",
                table: "MaintenanceTasks",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedCost",
                table: "MaintenanceTasks",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "MaintenanceTasks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledDate",
                table: "MaintenanceTasks",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ServiceProvider",
                table: "MaintenanceTasks",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaskDescription",
                table: "MaintenanceTasks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaskType",
                table: "MaintenanceTasks",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "MedicalRecordId1",
                table: "Investigations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DoctorId1",
                table: "DoctorSchedules",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AppointmentType",
                table: "Appointments",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PrescriptionItem",
                table: "PrescriptionItem",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Equipment",
                columns: table => new
                {
                    EquipmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquipmentName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EquipmentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Manufacturer = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ModelNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SerialNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PurchaseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WarrantyExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastMaintenanceDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextMaintenanceDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MaintenanceFrequencyDays = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Equipment", x => x.EquipmentId);
                });

            migrationBuilder.CreateTable(
                name: "MedicalSupplies",
                columns: table => new
                {
                    SupplyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SupplyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CurrentQuantity = table.Column<int>(type: "int", nullable: false),
                    ReorderLevel = table.Column<int>(type: "int", nullable: false),
                    MaxStockLevel = table.Column<int>(type: "int", nullable: true),
                    UnitPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    Supplier = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SupplierContact = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastRestockDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BatchNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    StorageLocation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalSupplies", x => x.SupplyId);
                });

            migrationBuilder.CreateTable(
                name: "SanitizationSchedule",
                columns: table => new
                {
                    SanitizationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AreaName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AreaType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CleaningFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LastCleanedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastCleanedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    NextScheduledCleaning = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CleaningMethod = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ProductsUsed = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SanitizationSchedule", x => x.SanitizationId);
                });

            migrationBuilder.CreateTable(
                name: "WasteManagement",
                columns: table => new
                {
                    WasteId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WasteType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    Unit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    GeneratedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DisposalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DisposalMethod = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DisposalCompany = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Cost = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CollectedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CertificateNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WasteManagement", x => x.WasteId);
                });

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
                name: "IX_MaintenanceTasks_EquipmentId",
                table: "MaintenanceTasks",
                column: "EquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Investigations_MedicalRecordId1",
                table: "Investigations",
                column: "MedicalRecordId1");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSchedules_DoctorId1",
                table: "DoctorSchedules",
                column: "DoctorId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Doctors_DoctorId",
                table: "Appointments",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "DoctorId");

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorSchedules_Doctors_DoctorId1",
                table: "DoctorSchedules",
                column: "DoctorId1",
                principalTable: "Doctors",
                principalColumn: "DoctorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Investigations_MedicalRecords_MedicalRecordId1",
                table: "Investigations",
                column: "MedicalRecordId1",
                principalTable: "MedicalRecords",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceTasks_Equipment_EquipmentId",
                table: "MaintenanceTasks",
                column: "EquipmentId",
                principalTable: "Equipment",
                principalColumn: "EquipmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicalHistories_MedicalRecords_MedicalRecordId1",
                table: "MedicalHistories",
                column: "MedicalRecordId1",
                principalTable: "MedicalRecords",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicalRecords_Patients_PatientId",
                table: "MedicalRecords",
                column: "PatientId",
                principalTable: "Patients",
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Doctors_DoctorId",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorSchedules_Doctors_DoctorId1",
                table: "DoctorSchedules");

            migrationBuilder.DropForeignKey(
                name: "FK_Investigations_MedicalRecords_MedicalRecordId1",
                table: "Investigations");

            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceTasks_Equipment_EquipmentId",
                table: "MaintenanceTasks");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicalHistories_MedicalRecords_MedicalRecordId1",
                table: "MedicalHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicalRecords_Patients_PatientId",
                table: "MedicalRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientComplaints_MedicalRecords_MedicalRecordId1",
                table: "PatientComplaints");

            migrationBuilder.DropForeignKey(
                name: "FK_PrescriptionItem_Prescriptions_PrescriptionId",
                table: "PrescriptionItem");

            migrationBuilder.DropForeignKey(
                name: "FK_Prescriptions_MedicalRecords_MedicalRecordId1",
                table: "Prescriptions");

            migrationBuilder.DropTable(
                name: "Equipment");

            migrationBuilder.DropTable(
                name: "MedicalSupplies");

            migrationBuilder.DropTable(
                name: "SanitizationSchedule");

            migrationBuilder.DropTable(
                name: "WasteManagement");

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
                name: "IX_MaintenanceTasks_EquipmentId",
                table: "MaintenanceTasks");

            migrationBuilder.DropIndex(
                name: "IX_Investigations_MedicalRecordId1",
                table: "Investigations");

            migrationBuilder.DropIndex(
                name: "IX_DoctorSchedules_DoctorId1",
                table: "DoctorSchedules");

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
                name: "ActualCost",
                table: "MaintenanceTasks");

            migrationBuilder.DropColumn(
                name: "EquipmentId",
                table: "MaintenanceTasks");

            migrationBuilder.DropColumn(
                name: "EstimatedCost",
                table: "MaintenanceTasks");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "MaintenanceTasks");

            migrationBuilder.DropColumn(
                name: "ScheduledDate",
                table: "MaintenanceTasks");

            migrationBuilder.DropColumn(
                name: "ServiceProvider",
                table: "MaintenanceTasks");

            migrationBuilder.DropColumn(
                name: "TaskDescription",
                table: "MaintenanceTasks");

            migrationBuilder.DropColumn(
                name: "TaskType",
                table: "MaintenanceTasks");

            migrationBuilder.DropColumn(
                name: "MedicalRecordId1",
                table: "Investigations");

            migrationBuilder.DropColumn(
                name: "DoctorId1",
                table: "DoctorSchedules");

            migrationBuilder.RenameTable(
                name: "PrescriptionItem",
                newName: "PrescriptionItems");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "MaintenanceTasks",
                newName: "DueDate");

            migrationBuilder.RenameColumn(
                name: "TaskId",
                table: "MaintenanceTasks",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "IX_PrescriptionItem_PrescriptionId",
                table: "PrescriptionItems",
                newName: "IX_PrescriptionItems_PrescriptionId");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "InsuranceId",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "InsuranceCompany",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "EmergencyContactPhone",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "EmergencyContactName",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "OperationName",
                table: "Operations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "Operations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<int>(
                name: "PatientId",
                table: "MedicalRecords",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "MaintenanceTasks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Priority",
                table: "MaintenanceTasks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AssignedTo",
                table: "MaintenanceTasks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "MaintenanceTasks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Task",
                table: "MaintenanceTasks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "AppointmentType",
                table: "Appointments",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PrescriptionItems",
                table: "PrescriptionItems",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Equipments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastMaintenance = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NextMaintenance = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SerialNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Equipments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sanitizations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Area = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CleanedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Frequency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastCleaned = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NextCleaning = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sanitizations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Supplies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastRestocked = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    ReorderLevel = table.Column<int>(type: "int", nullable: false),
                    Supplier = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Supplies", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "PasswordHash", "Role", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 12, 8, 0, 0, 0, 0, DateTimeKind.Utc), "mohab@eyeclinic.com", "$2a$11$I5sDH4p8l2a/mGBM8hfPAe.E18svY1aaDco91sU7a9ZA.EKrAXz/.", "Doctor", "Dr. Mohab Khairy" },
                    { 2, new DateTime(2025, 12, 8, 0, 0, 0, 0, DateTimeKind.Utc), "reception@eyeclinic.com", "$2a$11$1Ov1AN/4vidto4EKX.rmkuwY.CKjjtOVPLtUVspWYnROXSFgTb6K6", "Receptionist", "Receptionist" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Doctors_DoctorId",
                table: "Appointments",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "DoctorId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicalRecords_Patients_PatientId",
                table: "MedicalRecords",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PrescriptionItems_Prescriptions_PrescriptionId",
                table: "PrescriptionItems",
                column: "PrescriptionId",
                principalTable: "Prescriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
