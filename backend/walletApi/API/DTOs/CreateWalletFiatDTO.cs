namespace walletApi.API.DTOs
{
    public class CreateWalletFiatDTO
    {
        public int UserId { get; set; }
        public string Currency { get; set; } = string.Empty;
    }
}