using cryptoApi.Application.Interfaces;
using cryptoApi.Infrastructure.ExternalServices;
using cryptoApi.DTOs;

namespace cryptoApi.Application.Services
{
    public class CryptoHistoryService : ICryptoHistoryService
    {
        private readonly BinanceApiClient _binanceClient;

        public CryptoHistoryService(BinanceApiClient binanceClient)
        {
            _binanceClient = binanceClient;
        }

        public async Task<dynamic> GetHistoricalDataAsync(string symbol, string interval, DateTime startTime, DateTime endTime)
        {
            // Implemente chamando métodos apropriados do BinanceApiClient
            // Por exemplo:
            var unixStartTime = new DateTimeOffset(startTime).ToUnixTimeMilliseconds();
            var unixEndTime = new DateTimeOffset(endTime).ToUnixTimeMilliseconds();
            return await _binanceClient.GetKlinesAsync(symbol, interval, 1000, unixStartTime, unixEndTime);
        }

        public async Task<dynamic> GetRecentHistoryAsync(string symbol, string interval, int limit = 100)
        {
            // Reutilize o método existente para obter dados de klines
            return await _binanceClient.GetKlinesAsync(symbol, interval, limit);
        }
    }
}