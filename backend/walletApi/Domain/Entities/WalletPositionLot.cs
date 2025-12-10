using System.ComponentModel.DataAnnotations;

namespace WalletApi.Domain.Entities;

public class WalletPositionLot
{
    [Key]
    public Guid IdWalletPositionLot { get; set; }
    public Guid IdWallet { get; set; }
    public Guid IdCurrency { get; set; }
    // quantidade originalmente comprada
    public decimal OriginalAmount { get; set; }
    // quantidade restante não vendida/executada
    public decimal RemainingAmount { get; set; }
    // preço unitário em USD no momento da compra
    public decimal AvgPrice { get; set; }
    public DateTime CreatedAt { get; set; }
}
