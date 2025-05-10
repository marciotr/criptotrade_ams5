using System;

namespace walletApi.Domain.Entities
{
    public class WalletFiat
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Currency { get; set; } = string.Empty;  // ex: "USD", "EUR", "BRL"
        public decimal Balance { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}