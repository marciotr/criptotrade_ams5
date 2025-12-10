using System.ComponentModel.DataAnnotations;

namespace WalletApi.API.DTOs;

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
    // Se verdadeiro, cria um novo lote para essa compra; caso contrário, apenas atualiza a posição consolidada
    public bool CreateNewLot { get; set; } = true;
}
