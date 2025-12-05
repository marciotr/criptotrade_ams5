using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace userApi.Migrations
{
    public partial class AddUniqueEmail : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // cria índice único em Users.Email para garantir unicidade em nível de banco
            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");
        }
    }
}
