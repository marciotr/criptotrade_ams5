namespace WalletApi2.API.DTOs
{
    public class TransferRequest
    {
        public int FromWalletId { get; set; }
        public int ToWalletId { get; set; }
        public string AssetSymbol { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}
