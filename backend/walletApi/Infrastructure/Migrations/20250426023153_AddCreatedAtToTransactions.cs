using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace walletApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedAtToTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TransactionHash",
                table: "Transactions",
                newName: "TransactionDate");

            migrationBuilder.CreateIndex(
                name: "IX_Wallets_Currency_Type",
                table: "Wallets",
                columns: new[] { "Currency", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_Wallets_UserId_Type",
                table: "Wallets",
                columns: new[] { "UserId", "Type" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Wallets_Currency_Type",
                table: "Wallets");

            migrationBuilder.DropIndex(
                name: "IX_Wallets_UserId_Type",
                table: "Wallets");

            migrationBuilder.RenameColumn(
                name: "TransactionDate",
                table: "Transactions",
                newName: "TransactionHash");
        }
    }
}
