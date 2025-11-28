using System.ComponentModel.DataAnnotations;

namespace WalletApi.Domain.Entities;

public class Account
{
    [Key]
    public Guid IdAccount { get; set; }
    public Guid IdUser { get; set; }
    public decimal AvailableBalance { get; set; }
    public decimal LockedBalance { get; set; }
    public string? Status { get; set; }
}
