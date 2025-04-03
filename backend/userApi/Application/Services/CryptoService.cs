using userApi.Application.Interfaces;
using userApi.Infrastructure.ExternalServices;
using userApi.API.DTOs;

namespace userApi.Application.Services
{
    public class CryptoService : ICryptoService
    {
        private readonly BinanceApiClient _binanceClient;

        public CryptoService(BinanceApiClient binanceClient)
        {
            _binanceClient = binanceClient;
        }

        public async Task<List<CryptoPriceDTO>> GetAllPricesAsync()
        {
            return await _binanceClient.GetAllPricesAsync();
        }

        public async Task<List<CryptoTickerDTO>> Get24hTickersAsync()
        {
            return await _binanceClient.Get24hTickersAsync();
        }

        public async Task<CryptoTickerDTO> Get24hTickerAsync(string symbol)
        {
            return await _binanceClient.Get24hTickerAsync(symbol);
        }

        public async Task<dynamic> GetOrderBookAsync(string symbol, int limit = 100)
        {
            return await _binanceClient.GetOrderBookAsync(symbol, limit);
        }

        public async Task<dynamic> GetRecentTradesAsync(string symbol, int limit = 500)
        {
            return await _binanceClient.GetRecentTradesAsync(symbol, limit);
        }

        public async Task<dynamic> GetKlinesAsync(string symbol, string interval, int limit = 500)
        {
            return await _binanceClient.GetKlinesAsync(symbol, interval, limit);
        }
    }
}