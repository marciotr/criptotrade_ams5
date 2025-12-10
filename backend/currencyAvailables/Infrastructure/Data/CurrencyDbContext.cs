using Microsoft.EntityFrameworkCore;
using CurrencyAvailables.Domain.Entities;
using CurrencyAvailables.Domain.Interfaces;

namespace CurrencyAvailables.Infrastructure.Data
{
    public class CurrencyDbContext : DbContext
    {
        public CurrencyDbContext(DbContextOptions<CurrencyDbContext> options) : base(options) { }

        public DbSet<Currency> Currencies { get; set; }
        public DbSet<History> Histories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Currency>(entity =>
            {
                entity.HasKey(c => c.Id);

                entity.Property(c => c.Id)
                    .ValueGeneratedNever();
          
                entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
                entity.Property(c => c.Symbol).IsRequired().HasMaxLength(100);
                entity.Property(c => c.Backing).IsRequired();
                entity.Property(c => c.Status).IsRequired();

                entity.HasMany(c => c.Histories)
                      .WithOne(h => h.Currency)
                      .HasForeignKey(h => h.CurrencyId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<History>(entity =>
            {
                entity.HasKey(h => h.Id);
                entity.Property(h => h.CurrencyId).IsRequired();
                entity.Property(h => h.DateTimeAt).IsRequired();
                entity.Property(h => h.Value).HasColumnType("decimal(18,2)").IsRequired();
            });
        }
    }
}

