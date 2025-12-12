using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EyeClinicAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddIsSurgeryField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSurgery",
                table: "Appointments",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSurgery",
                table: "Appointments");
        }
    }
}
