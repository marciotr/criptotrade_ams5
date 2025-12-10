using System;

public interface ITokenService
{
    string GenerateJwtToken(UserDTO user);
}
