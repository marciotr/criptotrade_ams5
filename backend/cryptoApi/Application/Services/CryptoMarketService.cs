using cryptoApi.Application.Interfaces;
using cryptoApi.Infrastructure.ExternalServices;
using cryptoApi.DTOs;
using System.Linq;

namespace cryptoApi.Application.Services
{
    public class CryptoMarketService : ICryptoMarketService
    {
        private readonly BinanceApiClient _binanceClient;
        private readonly ICryptoService _cryptoService;

        public CryptoMarketService(BinanceApiClient binanceClient, ICryptoService cryptoService)
        {
            _binanceClient = binanceClient;
            _cryptoService = cryptoService;
        }

        public async Task<dynamic> GetMarketOverviewAsync()
        {
            // Obter dados de mercado gerais
            var tickers = await _cryptoService.Get24hTickersAsync();
            return new
            {
                TotalCoins = tickers.Count,
                TotalVolume = tickers.Sum(t => t.QuoteVolume),
                AvgChangePercent = tickers.Average(t => t.PriceChangePercent)
            };
        }

        public async Task<dynamic> GetTopGainersAsync(int limit = 10)
        {
            var tickers = await _cryptoService.Get24hTickersAsync();
            return tickers
                .Where(t => t.PriceChangePercent > 0)
                .OrderByDescending(t => t.PriceChangePercent)
                .Take(limit);
        }

        public async Task<dynamic> GetTopLosersAsync(int limit = 10)
        {
            var tickers = await _cryptoService.Get24hTickersAsync();
            return tickers
                .Where(t => t.PriceChangePercent < 0)
                .OrderBy(t => t.PriceChangePercent)
                .Take(limit);
        }

        public async Task<dynamic> GetMarketVolumeAsync()
        {
            var tickers = await _cryptoService.Get24hTickersAsync();
            return tickers
                .OrderByDescending(t => t.QuoteVolume)
                .Take(20)
                .Select(t => new { t.Symbol, t.QuoteVolume });
        }
    }
}