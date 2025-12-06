using Microsoft.EntityFrameworkCore;
using WalletApi.Domain.Entities;

namespace WalletApi.Infrastructure.Data;

public class WalletDbContext : DbContext
{
    public WalletDbContext(DbContextOptions<WalletDbContext> options) : base(options) { }

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<WalletPosition> WalletPositions => Set<WalletPosition>();
    public DbSet<WalletPositionLot> WalletPositionLots => Set<WalletPositionLot>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<TransactionCripto> TransactionCriptos => Set<TransactionCripto>();
    public DbSet<TransactionFiat> TransactionFiats => Set<TransactionFiat>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>().HasKey(a => a.IdAccount);
        modelBuilder.Entity<Wallet>().HasKey(w => w.IdWallet);
        modelBuilder.Entity<WalletPosition>().HasKey(wp => wp.IdWalletPosition);
        modelBuilder.Entity<WalletPositionLot>().HasKey(l => l.IdWalletPositionLot);
        modelBuilder.Entity<Transaction>().HasKey(t => t.IdTransaction);
        modelBuilder.Entity<TransactionCripto>().HasKey(tc => tc.IdTransaction);
        modelBuilder.Entity<TransactionFiat>().HasKey(tf => tf.IdTransaction);

        modelBuilder.Entity<Transaction>()
            .HasOne<Transaction>()
            .WithMany()
            .HasForeignKey(t => t.RelatedTransactionId)
            .OnDelete(DeleteBehavior.Restrict);

        base.OnModelCreating(modelBuilder);
    }
}
