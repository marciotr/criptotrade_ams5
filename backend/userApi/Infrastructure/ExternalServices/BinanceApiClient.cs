using System.Net.Http.Json;
using userApi.API.DTOs;

namespace userApi.Infrastructure.ExternalServices
{
    public class BinanceApiClient
    {
        private readonly HttpClient _httpClient;

        public BinanceApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri("https://api.binance.com");
        }

        public async Task<List<CryptoPriceDTO>> GetAllPricesAsync()
        {
            try
            {
                var response = await _httpClient.GetFromJsonAsync<List<CryptoPriceDTO>>("/api/v3/ticker/price");
                return response ?? new List<CryptoPriceDTO>();
            }
            catch (HttpRequestException ex)
            {
                // Log the error
                Console.WriteLine($"Error calling Binance API: {ex.Message}");
                throw;
            }
        }

        public async Task<CryptoPriceDTO> GetPriceAsync(string symbol)
        {
            try
            {
                var response = await _httpClient.GetFromJsonAsync<CryptoPriceDTO>($"/api/v3/ticker/price?symbol={symbol.ToUpper()}");
                return response ?? new CryptoPriceDTO();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error getting price for {symbol}: {ex.Message}");
                throw;
            }
        }
    }
}