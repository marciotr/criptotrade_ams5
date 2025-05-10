using Microsoft.EntityFrameworkCore;
using walletApi.Domain.Entities;

namespace walletApi.Infrastructure.Data
{
    public class WalletDbContext : DbContext
    {
        public WalletDbContext(DbContextOptions<WalletDbContext> opts) : base(opts) { }

        public DbSet<WalletFiat> WalletFiats { get; set; } = null!;
        public DbSet<WalletCrypto> WalletCryptos { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<WalletFiat>()
                .HasIndex(w => new { w.UserId, w.Currency })
                .IsUnique();

            modelBuilder.Entity<WalletCrypto>()
                .HasIndex(w => new { w.UserId, w.Symbol })
                .IsUnique();
        }
    }
}