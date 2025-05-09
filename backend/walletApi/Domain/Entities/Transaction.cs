using System;

namespace walletApi.Domain.Entities
{
    public enum TransactionType
    {
        Deposit = 0,
        Withdrawal = 1,
        Transfer = 2,
        Purchase = 3,
        Sale = 4,
        Fee = 5
    }

    public enum TransactionStatus
    {
        Pending = 0,
        Completed = 1,
        Failed = 2,
        Cancelled = 3
    }

    public class Transaction
    {
        public int Id { get; set; }
        public int WalletId { get; set; }
        public TransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TransactionStatus Status { get; set; }
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Relacionamento com a carteira
        public virtual Wallet Wallet { get; set; }
    }
}