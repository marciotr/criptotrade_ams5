namespace Domain.Entities
{
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