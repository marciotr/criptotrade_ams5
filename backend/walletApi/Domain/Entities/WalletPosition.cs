using System.ComponentModel.DataAnnotations;

namespace WalletApi.Domain.Entities;

public class WalletPosition
{
    [Key]
    public Guid IdWalletPosition { get; set; }
    public Guid IdWallet { get; set; }
    public Guid IdCurrency { get; set; }
    public decimal Amount { get; set; }
    public decimal AvgPrice { get; set; }
    public DateTime UpdatedAt { get; set; }
}
