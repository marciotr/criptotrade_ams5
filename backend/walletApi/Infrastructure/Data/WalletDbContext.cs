using Microsoft.EntityFrameworkCore;
using walletApi.Domain.Entities;

namespace walletApi.Infrastructure.Data
{
    public class WalletDbContext : DbContext
    {
        public WalletDbContext(DbContextOptions<WalletDbContext> options) : base(options) { }
        
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
    }
}