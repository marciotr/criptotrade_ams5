using System.ComponentModel.DataAnnotations;

namespace WalletApi.Domain.Entities;

public class Wallet
{
    [Key]
    public Guid IdWallet { get; set; }
    public Guid IdAccount { get; set; }
    public string? Name { get; set; }
    public DateTime CreatedAt { get; set; }
}
