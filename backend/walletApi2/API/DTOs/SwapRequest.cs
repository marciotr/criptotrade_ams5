namespace WalletApi2.API.DTOs
{
    public class SwapRequest
    {
        public int WalletId { get; set; }
        public string FromAsset { get; set; } = string.Empty;
        public string ToAsset { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}
