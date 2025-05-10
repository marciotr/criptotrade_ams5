using System;

namespace walletApi.Domain.Entities
{
    public class WalletCrypto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Symbol { get; set; } = string.Empty;    // ex: "BTC", "ETH"
        public string Address { get; set; } = string.Empty;   // opcional: endereço on‐chain
        public decimal Balance { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}