using System;
using System.Collections.Generic;

namespace walletApi.Domain.Entities
{
    public enum WalletType
    {
        Fiat = 0,
        Crypto = 1
    }

    public class Wallet
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Currency { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public WalletType Type { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public virtual List<Transaction> Transactions { get; set; } = new();
    }
}