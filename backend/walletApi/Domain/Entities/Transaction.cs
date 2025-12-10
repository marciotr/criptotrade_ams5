using System.ComponentModel.DataAnnotations;

namespace WalletApi.Domain.Entities;

public class Transaction
{
    [Key]
    public Guid IdTransaction { get; set; }
    public Guid IdAccount { get; set; }
    public string? Type { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal Fee { get; set; }
    public string? Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? RelatedTransactionId { get; set; }
}
