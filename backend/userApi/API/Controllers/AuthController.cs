using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;
    private readonly ITokenService _tokenService;
    private readonly IRefreshTokenRepository _refreshRepo;
    public AuthController(IUserService userService, IConfiguration configuration, ITokenService tokenService, IRefreshTokenRepository refreshRepo)
    {
        _userService = userService;
        _configuration = configuration;
        _tokenService = tokenService;
        _refreshRepo = refreshRepo;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDTO loginDto)
    {
        var user = _userService.ValidateUser(loginDto.Email, loginDto.Password);
        if (user == null)
        {
            return Unauthorized(new { message = "Email ou senha inválidos." });
        }

        var fullUser = _userService.GetUserDetails(user.Id);
        if (fullUser != null && fullUser.MfaEnabled)
        {
            return Ok(new AuthResponseDTO
            {
                Token = null,
                MfaRequired = true,
                MfaType = fullUser.MfaType ?? "sms",
                UserId = fullUser.Id,
                Email = fullUser.Email
            });
        }

        var token = _tokenService.GenerateJwtToken(user);

        // gerar refresh token e persistir (cookie HttpOnly)
        var refreshCfg = _configuration["Jwt:RefreshTokenExpiryDays"];
        int refreshDays = 30;
        if (!string.IsNullOrEmpty(refreshCfg) && int.TryParse(refreshCfg, out var rparsed)) refreshDays = rparsed;
        var ts = ((TokenService)_tokenService).GenerateRefreshToken(refreshDays);

        var refreshEntity = new userApi.Domain.Entities.RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = ts.Hash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = ts.ExpiresAt,
            RemoteIp = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };
        _refreshRepo.Add(refreshEntity);

        var cookieOptions = new Microsoft.AspNetCore.Http.CookieOptions
        {
            HttpOnly = true,
            Expires = ts.ExpiresAt,
            SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict,
            Secure = false // em dev pode ser false; em produção configure para true
        };
        Response.Cookies.Append("refreshToken", ts.Token, cookieOptions);

        return Ok(new AuthResponseDTO { Token = token, MfaRequired = false });
    }

    [HttpPost("verify-mfa")]
    public IActionResult VerifyMfa([FromBody] VerifyMfaDTO verify)
    {
        if (verify == null) return BadRequest();

        var user = _userService.GetUserDetails(verify.UserId);
        if (user == null) return NotFound();

        if (verify.Code == "123456")
        {
            var token = _tokenService.GenerateJwtToken(user);

            // criar refresh token como no login
            var refreshCfg = _configuration["Jwt:RefreshTokenExpiryDays"];
            int refreshDays = 30;
            if (!string.IsNullOrEmpty(refreshCfg) && int.TryParse(refreshCfg, out var rparsed)) refreshDays = rparsed;
            var ts = ((TokenService)_tokenService).GenerateRefreshToken(refreshDays);
            var refreshEntity = new userApi.Domain.Entities.RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = ts.Hash,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = ts.ExpiresAt,
                RemoteIp = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = Request.Headers["User-Agent"].ToString()
            };
            _refreshRepo.Add(refreshEntity);
            var cookieOptions = new Microsoft.AspNetCore.Http.CookieOptions
            {
                HttpOnly = true,
                Expires = ts.ExpiresAt,
                SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict,
                Secure = false
            };
            Response.Cookies.Append("refreshToken", ts.Token, cookieOptions);

            return Ok(new AuthResponseDTO { Token = token, MfaRequired = false });
        }

        return Unauthorized(new { message = "Invalid MFA code" });
    }


    [Authorize]
    [HttpGet("profile")]
    public IActionResult GetProfile()
    {
        var email = User.Identity.Name;
        return Ok(new { message = "Rota protegida acessada!", user = email });
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { 
            status = "healthy",
            service = "auth",
            timestamp = DateTime.UtcNow
        });
    }

    [HttpPost("refresh")]
    public IActionResult Refresh()
    {
        var token = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(token)) return Unauthorized();

        var hash = ((TokenService)_tokenService).ComputeSha256(token);
        var existing = _refreshRepo.GetByTokenHash(hash);
        if (existing == null) return Unauthorized();
        if (existing.RevokedAt != null || existing.ExpiresAt <= DateTime.UtcNow) return Unauthorized();

        var user = _userService.GetUserDetails(existing.UserId);
        if (user == null) return Unauthorized();

        // rotacion: revoga token antigo e cria novo
        existing.RevokedAt = DateTime.UtcNow;

        var refreshCfg = _configuration["Jwt:RefreshTokenExpiryDays"];
        int refreshDays = 30;
        if (!string.IsNullOrEmpty(refreshCfg) && int.TryParse(refreshCfg, out var rparsed)) refreshDays = rparsed;
        var ts = ((TokenService)_tokenService).GenerateRefreshToken(refreshDays);

        existing.ReplacedByToken = ts.Hash;
        _refreshRepo.Update(existing);

        var newEntity = new userApi.Domain.Entities.RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = existing.UserId,
            TokenHash = ts.Hash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = ts.ExpiresAt,
            RemoteIp = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };
        _refreshRepo.Add(newEntity);

        var cookieOptions = new Microsoft.AspNetCore.Http.CookieOptions
        {
            HttpOnly = true,
            Expires = ts.ExpiresAt,
            SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict,
            Secure = false
        };
        Response.Cookies.Append("refreshToken", ts.Token, cookieOptions);

        var newJwt = _tokenService.GenerateJwtToken(user);
        return Ok(new { token = newJwt });
    }

    [HttpPost("revoke")]
    public IActionResult Revoke([FromBody] dynamic payload)
    {
        string? token = null;
        try
        {
            token = Request.Cookies["refreshToken"] ?? (string?)payload?.refreshToken;
        }
        catch { }

        if (string.IsNullOrEmpty(token)) return BadRequest(new { message = "No token provided" });

        var hash = ((TokenService)_tokenService).ComputeSha256(token);
        var existing = _refreshRepo.GetByTokenHash(hash);
        if (existing == null) return NotFound();
        existing.RevokedAt = DateTime.UtcNow;
        _refreshRepo.Update(existing);
        // remove cookie
        Response.Cookies.Delete("refreshToken");
        return Ok(new { revoked = true });
    }

    //agora o token vai ser operado pelo service do ITokenService

    
}
