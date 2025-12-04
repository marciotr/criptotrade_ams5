public class UserDTO
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string Address { get; set; }
    public string? Password { get; set; }
    public string? Photo { get; set; }
    public string Role { get; set; } = "user"; 
    public bool MfaEnabled { get; set; } = false;
    public string? MfaType { get; set; }
}