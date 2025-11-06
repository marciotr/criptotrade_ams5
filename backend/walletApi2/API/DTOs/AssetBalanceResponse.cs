namespace WalletApi2.API.DTOs
{
    public class AssetBalanceResponse
    {
        public string AssetSymbol { get; set; } = string.Empty;
        public decimal AvailableAmount { get; set; }
        public decimal LockedAmount { get; set; }
    }
}
