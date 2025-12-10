namespace WalletApi.API.DTOs;

public class WithdrawFiatRequest
{
    public string Currency { get; set; } = "USD";
    public decimal Amount { get; set; }
    public string? Method { get; set; }
    public string? Destination { get; set; }
}
