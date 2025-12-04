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

    public AuthController(IUserService userService, IConfiguration configuration, ITokenService tokenService)
    {
        _userService = userService;
        _configuration = configuration;
        _tokenService = tokenService;
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

    //agora o token vai ser operado pelo service do ITokenService

    
}
