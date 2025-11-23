namespace WalletApi2.API.DTOs
{
    public class BuySellRequest
    {
        public int WalletId { get; set; }
        public string AssetSymbol { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}
