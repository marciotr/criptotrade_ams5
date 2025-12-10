using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/auth-fallback")]
public class VerifyMfaController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;
    private readonly ITokenService _tokenService;

    public VerifyMfaController(IUserService userService, IConfiguration configuration, ITokenService tokenService)
    {
        _userService = userService;
        _configuration = configuration;
        _tokenService = tokenService;
    }

    [HttpPost("verify-mfa")]
    public IActionResult VerifyMfa([FromBody] VerifyMfaDTO verify)
    {
        if (verify == null) return BadRequest();

        var user = _userService.GetUserDetails(verify.UserId);
        if (user == null) return NotFound();

        // verificação atual vai ser 123456 mesmo só pra funcionar
        if (verify.Code == "123456")
        {
            var token = _tokenService.GenerateJwtToken(user);
            return Ok(new AuthResponseDTO { Token = token, MfaRequired = false });
        }

        return Unauthorized(new { message = "Invalid MFA code" });
    }

    //agora o token vai ser operado pelo service do ITokenService
}
