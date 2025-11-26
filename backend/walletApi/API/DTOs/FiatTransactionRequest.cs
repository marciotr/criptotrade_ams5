namespace WalletApi2.API.DTOs
{
    public class FiatTransactionRequest
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
    }
}
