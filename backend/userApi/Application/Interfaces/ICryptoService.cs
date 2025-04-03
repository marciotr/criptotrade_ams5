using userApi.API.DTOs;

namespace userApi.Application.Interfaces
{
    public interface ICryptoService
    {
        Task<List<CryptoPriceDTO>> GetAllPricesAsync();
        Task<List<CryptoTickerDTO>> Get24hTickersAsync();
        Task<CryptoTickerDTO> Get24hTickerAsync(string symbol);
        Task<dynamic> GetOrderBookAsync(string symbol, int limit = 100);
        Task<dynamic> GetRecentTradesAsync(string symbol, int limit = 500);
        Task<dynamic> GetKlinesAsync(string symbol, string interval, int limit = 500);
    }
}