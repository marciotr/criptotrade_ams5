using Microsoft.EntityFrameworkCore;
using WalletApi2.Domain.Entities;
using WalletApi2.Domain.Enums;

namespace WalletApi2.Infrastructure
{
    public class WalletDbContext : DbContext
    {
        public WalletDbContext(DbContextOptions<WalletDbContext> options) : base(options) { }

        public DbSet<UserAssetBalance> UserAssetBalances { get; set; }
        public DbSet<TransactionHistory> TransactionHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // UserAssetBalance configuration
            modelBuilder.Entity<UserAssetBalance>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.AssetSymbol)
                      .IsRequired()
                      .HasMaxLength(10);

                entity.Property(e => e.AvailableAmount)
                      .HasPrecision(18, 8);

                entity.Property(e => e.LockedAmount)
                      .HasPrecision(18, 8);

                entity.Property(e => e.AverageAcquisitionPrice)
                      .HasPrecision(18, 8);

                entity.Property(e => e.CreatedAt)
                      .IsRequired();

                entity.Property(e => e.UpdatedAt)
                      .IsRequired();

                // Unique composite index UserId + AssetSymbol
                entity.HasIndex(e => new { e.UserId, e.AssetSymbol })
                      .IsUnique()
                      .HasDatabaseName("IX_User_Asset_Unique");

                entity.Property(e => e.RowVersion).IsRowVersion();
            });

            // TransactionHistory configuration
            modelBuilder.Entity<TransactionHistory>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.AssetSymbol)
                      .IsRequired()
                      .HasMaxLength(10);

                entity.Property(e => e.Amount)
                      .HasPrecision(18, 8);

                entity.Property(e => e.PriceAt)
                      .HasPrecision(18, 8);

                entity.Property(e => e.CreatedAt)
                      .IsRequired();

                // Map enums to strings
                entity.Property(e => e.Type)
                      .HasConversion<string>()
                      .IsRequired();

                entity.Property(e => e.Status)
                      .HasConversion<string>()
                      .IsRequired();

                // Unique index on TransactionHash when not null (SQLite doesn't support filtered indexes in EF Core directly)
                // For SQLite we'll create a normal index; uniqueness when not null is not enforceable via filtered index in SQLite.
                // We'll create a non-unique index and enforce uniqueness in application if needed.
                entity.HasIndex(e => e.TransactionHash)
                      .HasDatabaseName("IX_TransactionHash");

                // If using SQL Server, you could use HasFilter("TransactionHash IS NOT NULL") and IsUnique()
            });
        }
    }
}
