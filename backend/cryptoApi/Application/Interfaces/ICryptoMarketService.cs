using cryptoApi.DTOs;

namespace cryptoApi.Application.Interfaces
{
    public interface ICryptoMarketService
    {
        // Adicione os métodos necessários para informações de mercado
        Task<dynamic> GetMarketOverviewAsync();
        Task<dynamic> GetTopGainersAsync(int limit = 10);
        Task<dynamic> GetTopLosersAsync(int limit = 10);
        Task<dynamic> GetMarketVolumeAsync();
    }
}