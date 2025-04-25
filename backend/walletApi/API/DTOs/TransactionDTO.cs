using System;
using walletApi.Domain.Entities;

namespace walletApi.API.DTOs
{
    public class TransactionDTO
    {
        public int Id { get; set; }
        public int WalletId { get; set; }
        public TransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Description { get; set; }
        public string TransactionHash { get; set; }
        public TransactionStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
    public class CreateTransactionDTO
    {
        public TransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Description { get; set; }
    }
}