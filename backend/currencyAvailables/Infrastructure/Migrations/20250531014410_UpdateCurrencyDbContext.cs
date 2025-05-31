using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace currencyAvailables.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCurrencyDbContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CurrencyId1",
                table: "Histories",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Currencies",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER");

            migrationBuilder.CreateIndex(
                name: "IX_Histories_CurrencyId1",
                table: "Histories",
                column: "CurrencyId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Histories_Currencies_CurrencyId1",
                table: "Histories",
                column: "CurrencyId1",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Histories_Currencies_CurrencyId1",
                table: "Histories");

            migrationBuilder.DropIndex(
                name: "IX_Histories_CurrencyId1",
                table: "Histories");

            migrationBuilder.DropColumn(
                name: "CurrencyId1",
                table: "Histories");

            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Currencies",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");
        }
    }
}
