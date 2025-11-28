using System.ComponentModel.DataAnnotations;

namespace WalletApi.DTOs;

public class BuyRequest
{
    [Required]
    public Guid IdAccount { get; set; }
    [Required]
    public Guid IdWallet { get; set; }
    [Required]
    public Guid IdCurrency { get; set; }
    [Required]
    public decimal FiatAmount { get; set; }
    public decimal Fee { get; set; }
}
