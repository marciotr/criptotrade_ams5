namespace WalletApi.DTOs;

public class AdjustBalanceRequest
{
    public decimal DeltaAmount { get; set; }
    public Guid? ReferenceId { get; set; }
    public string? Description { get; set; }
    public string? Method { get; set; }
    public decimal? UnitPriceUsd { get; set; }
}
