using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace walletApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWalletPositionLot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WalletPositionLots",
                columns: table => new
                {
                    IdWalletPositionLot = table.Column<Guid>(type: "TEXT", nullable: false),
                    IdWallet = table.Column<Guid>(type: "TEXT", nullable: false),
                    IdCurrency = table.Column<Guid>(type: "TEXT", nullable: false),
                    OriginalAmount = table.Column<decimal>(type: "TEXT", nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "TEXT", nullable: false),
                    AvgPrice = table.Column<decimal>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WalletPositionLots", x => x.IdWalletPositionLot);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WalletPositionLots");
        }
    }
}
