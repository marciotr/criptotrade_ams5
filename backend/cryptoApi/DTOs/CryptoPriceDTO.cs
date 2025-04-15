namespace cryptoApi.DTOs
{
    public class CryptoPriceDTO
    {
        public string Symbol { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}