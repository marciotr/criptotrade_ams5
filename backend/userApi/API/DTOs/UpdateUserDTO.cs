namespace userApi.API.DTOs
{
    public class UpdateUserDTO
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? Photo { get; set; }
        public string? Role { get; set; }
        public bool? MfaEnabled { get; set; }
        public string? MfaType { get; set; }

        public string? Password { get; set; }
    }
}