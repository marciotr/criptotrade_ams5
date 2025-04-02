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

        public async Task<CryptoPriceDTO> GetPriceAsync(string symbol)
        {
            return await _binanceClient.GetPriceAsync(symbol);
        }
    }
}