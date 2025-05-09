using Microsoft.EntityFrameworkCore;
using walletApi.Domain.Entities;

namespace walletApi.Infrastructure.Data
{
    public class WalletDbContext : DbContext
    {
        public WalletDbContext(DbContextOptions<WalletDbContext> options)
            : base(options)
        {
        }

        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<Transaction> Transactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Wallet entity
            modelBuilder.Entity<Wallet>(entity =>
            {
                // Don't enforce foreign key constraint for UserId since it's in another database
                entity.HasIndex(w => new { w.UserId, w.Type });
                entity.HasIndex(w => new { w.Currency, w.Type });
            });

            // Configure Transaction entity
            modelBuilder.Entity<Transaction>(entity =>
            {
                // Keep the relationship between Transaction and Wallet within this database
                entity.HasOne(t => t.Wallet)
                      .WithMany(w => w.Transactions)
                      .HasForeignKey(t => t.WalletId)
                      .OnDelete(DeleteBehavior.Cascade); // This is safe since it's in the same DB
            });
        }
    }
}