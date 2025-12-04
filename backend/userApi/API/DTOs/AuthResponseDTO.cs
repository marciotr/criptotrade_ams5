public class AuthResponseDTO
{
    public string Token { get; set; }
    public bool MfaRequired { get; set; } = false;
    public string? MfaType { get; set; }
    public int? UserId { get; set; }
    public string? Email { get; set; }
}
