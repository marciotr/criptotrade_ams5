using System;

namespace walletApi.Domain.Entities
{
    public class Transaction
    {
        public int Id { get; set; }
        public int WalletId { get; set; }
        public Wallet Wallet { get; set; }
        public TransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Description { get; set; }
        public string TransactionHash { get; set; }
        public TransactionStatus Status { get; set; } = TransactionStatus.Completed;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
    
    public enum TransactionType
    {
        Deposit,
        Withdrawal,
        Transfer,
        Purchase,
        Sale,
        Fee
    }
    
    public enum TransactionStatus
    {
        Pending,
        Completed,
        Failed,
        Canceled
    }
}