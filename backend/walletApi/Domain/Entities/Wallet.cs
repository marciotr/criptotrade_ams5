using System;
using System.Collections.Generic;

namespace walletApi.Domain.Entities
{
    public class Wallet
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Currency { get; set; }
        public decimal Balance { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}