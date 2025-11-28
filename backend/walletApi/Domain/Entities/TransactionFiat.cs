using System.ComponentModel.DataAnnotations;

namespace WalletApi.Domain.Entities;

public class TransactionFiat
{
    [Key]
    public Guid IdTransaction { get; set; }
    public string? Provider { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentInfo { get; set; }
    public string? ExternalRef { get; set; }
}
