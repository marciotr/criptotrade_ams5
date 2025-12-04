using System.ComponentModel.DataAnnotations;

namespace WalletApi.Domain.Entities;

public class Currency
{
    [Key]
    public Guid IdCurrency { get; set; }
    public string? Symbol { get; set; }
    public string? Name { get; set; }
    public decimal CurrentPrice { get; set; }
}
