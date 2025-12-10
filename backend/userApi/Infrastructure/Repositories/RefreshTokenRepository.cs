using System.Linq;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly UserDbContext _context;

    public RefreshTokenRepository(UserDbContext context)
    {
        _context = context;
    }

    public void Add(userApi.Domain.Entities.RefreshToken token)
    {
        _context.RefreshTokens.Add(token);
        _context.SaveChanges();
    }

    public userApi.Domain.Entities.RefreshToken? GetByTokenHash(string tokenHash)
    {
        return _context.RefreshTokens.FirstOrDefault(t => t.TokenHash == tokenHash);
    }

    public System.Collections.Generic.List<userApi.Domain.Entities.RefreshToken> GetByUserId(int userId)
    {
        return _context.RefreshTokens.Where(t => t.UserId == userId).ToList();
    }

    public void Update(userApi.Domain.Entities.RefreshToken token)
    {
        _context.RefreshTokens.Update(token);
        _context.SaveChanges();
    }
}
