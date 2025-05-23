using Microsoft.EntityFrameworkCore;

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
                entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
                entity.Property(c => c.Description).HasMaxLength(255);
                entity.Property(c => c.Backing).IsRequired();
                entity.Property(c => c.Status).IsRequired();

                entity.HasMany(c => c.Histories)
                      .WithOne()
                      .HasForeignKey(h => h.CurrencyId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<History>(entity =>
            {
                entity.HasKey(h => h.Id);
                entity.Property(h => h.DateTime).IsRequired();
                entity.Property(h => h.Value).HasColumnType("decimal(18,2)").IsRequired();
            });
        }
    }

