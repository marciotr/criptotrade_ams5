using Microsoft.EntityFrameworkCore;

public class UserDbContext : DbContext
{
    public UserDbContext(DbContextOptions<UserDbContext> options) : base(options) { }
    public DbSet<User> Users { get; set; }
    public DbSet<userApi.Domain.Entities.RefreshToken> RefreshTokens { get; set; }

}