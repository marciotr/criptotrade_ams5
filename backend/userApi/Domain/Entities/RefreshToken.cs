using System;

namespace userApi.Domain.Entities
{
    public class RefreshToken
    {
        public Guid Id { get; set; }
        public int UserId { get; set; }
        public string TokenHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public string? ReplacedByToken { get; set; }
        public string? RemoteIp { get; set; }
        public string? UserAgent { get; set; }
    }
}
