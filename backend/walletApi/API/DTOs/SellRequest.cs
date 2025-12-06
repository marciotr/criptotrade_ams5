using System.ComponentModel.DataAnnotations;

namespace WalletApi.API.DTOs;

public class SellRequest
{
    [Required]
    public Guid IdAccount { get; set; }
    [Required]
    public Guid IdWallet { get; set; }
    [Required]
    public Guid IdCurrency { get; set; }
    [Required]
    public decimal CriptoAmount { get; set; }
    public decimal Fee { get; set; }
    public Guid? IdWalletPositionLot { get; set; }
    public decimal? LotAmount { get; set; }
}
