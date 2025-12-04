using System.ComponentModel.DataAnnotations;

namespace WalletApi.Domain.Entities;

public class TransactionCripto
{
    [Key]
    public Guid IdTransaction { get; set; }
    public Guid IdCurrency { get; set; }
    public decimal ExchangeRate { get; set; }
    public decimal CriptoAmount { get; set; }
}
