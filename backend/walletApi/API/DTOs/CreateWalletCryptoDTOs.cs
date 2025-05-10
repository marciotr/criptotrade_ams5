namespace walletApi.API.DTOs
{
    public class CreateWalletCryptoDTO
    {
        public int UserId { get; set; }
        public string Symbol { get; set; } = string.Empty;
        public string? Address { get; set; }
    }
}