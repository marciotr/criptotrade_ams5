namespace WalletApi.API.DTOs;

public class DepositFiatRequest
{
    public string Currency { get; set; } = "USD";
    public decimal Amount { get; set; }
    public string? Method { get; set; }
    public string? ReferenceId { get; set; }
}
