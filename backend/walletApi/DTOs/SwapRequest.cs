using System.ComponentModel.DataAnnotations;

namespace WalletApi.DTOs;

public class SwapRequest
{
    [Required]
    public Guid IdAccount { get; set; }
    [Required]
    public Guid IdWallet { get; set; }
    [Required]
    public Guid IdCurrencyOut { get; set; }
    [Required]
    public Guid IdCurrencyIn { get; set; }
    [Required]
    public decimal AmountOut { get; set; }
    public decimal Fee { get; set; }
}
