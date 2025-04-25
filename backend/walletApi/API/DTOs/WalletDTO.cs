using System;
using walletApi.Domain.Entities;

namespace walletApi.API.DTOs
{
    public class WalletDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Currency { get; set; }
        public decimal Balance { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
    
    public class CreateWalletDTO
    {
        public int UserId { get; set; }
        public string Currency { get; set; }
        public decimal InitialBalance { get; set; } = 0;
    }
}