using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateJwtToken(UserDTO user)
    {
        var jwtKey = _configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey))
        {
            throw new Exception("JWT Key is missing in appsettings.json");
        }

        var key = Encoding.ASCII.GetBytes(jwtKey);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            new Claim(ClaimTypes.Name, user.Name ?? string.Empty),
            new Claim(ClaimTypes.Role, user.Role ?? "user")
        };

        // Ler expiração configurável (minutos). Se ausente, usa 120 minutos por padrão.
        int expiryMinutes = 120;
        var expiryConfig = _configuration["Jwt:ExpiryMinutes"];
        if (!string.IsNullOrEmpty(expiryConfig) && int.TryParse(expiryConfig, out var parsed))
        {
            expiryMinutes = parsed;
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
