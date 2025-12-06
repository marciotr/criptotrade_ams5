using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace WalletApi.API.Controllers;

[ApiController]
public abstract class WalletControllerBase : ControllerBase
{
    protected readonly IConfiguration _configuration;

    protected WalletControllerBase(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    protected Guid? GetUserGuid()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"[Wallet] User.Identity.IsAuthenticated={User?.Identity?.IsAuthenticated}; NameIdentifierClaim={userIdClaim}");
            if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var g)) return g;

            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var numericId))
            {
                var bytes = new byte[16];
                var idBytes = BitConverter.GetBytes(numericId);
                Array.Copy(idBytes, 0, bytes, 0, Math.Min(idBytes.Length, bytes.Length));
                var deterministicGuid = new Guid(bytes);
                Console.WriteLine($"[Wallet] NameIdentifier was numeric ({numericId}). Using deterministic GUID {deterministicGuid} as user id fallback.");
                return deterministicGuid;
            }

            if (Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                var auth = authHeader.ToString();
                Console.WriteLine($"[Wallet] Authorization header present (truncated)={(string.IsNullOrEmpty(auth) ? "<empty>" : auth.Length > 50 ? auth.Substring(0,50) : auth)}");
                if (auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    var token = auth.Substring("Bearer ".Length).Trim();
                    try
                    {
                        var key = _configuration["Jwt:Key"];
                        var issuer = _configuration["Jwt:Issuer"];
                        var audience = _configuration["Jwt:Audience"];
                        if (string.IsNullOrEmpty(key))
                        {
                            Console.WriteLine("[Wallet] Jwt:Key is not configured");
                            return null;
                        }
                        var tokenHandler = new JwtSecurityTokenHandler();
                        var validationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidateLifetime = true,
                            ValidateIssuerSigningKey = true,
                            ValidIssuer = issuer,
                            ValidAudience = audience,
                            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
                        };

                        var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                        var claim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        Console.WriteLine($"[Wallet] Token validated; NameIdentifier from token={claim}");
                        if (!string.IsNullOrEmpty(claim) && Guid.TryParse(claim, out var g2)) return g2;

                        if (!string.IsNullOrEmpty(claim) && int.TryParse(claim, out var numeric2))
                        {
                            var bytes2 = new byte[16];
                            var idBytes2 = BitConverter.GetBytes(numeric2);
                            Array.Copy(idBytes2, 0, bytes2, 0, Math.Min(idBytes2.Length, bytes2.Length));
                            var deterministicGuid2 = new Guid(bytes2);
                            Console.WriteLine($"[Wallet] Token NameIdentifier numeric fallback -> {deterministicGuid2}");
                            return deterministicGuid2;
                        }

                        var email = principal.FindFirst(ClaimTypes.Email)?.Value;
                        if (!string.IsNullOrEmpty(email)) Console.WriteLine($"[Wallet] Token email claim={email}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Wallet] Token validation failed: {ex.Message}");
                        return null;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Wallet] GetUserGuid unexpected error: {ex.Message}");
        }

        return null;
    }
}
