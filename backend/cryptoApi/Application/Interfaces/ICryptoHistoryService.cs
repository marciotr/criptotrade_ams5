using cryptoApi.DTOs;

namespace cryptoApi.Application.Interfaces
{
    public interface ICryptoHistoryService
    {
        // Adicione os métodos necessários para histórico de criptomoedas
        Task<dynamic> GetHistoricalDataAsync(string symbol, string interval, DateTime startTime, DateTime endTime);
        Task<dynamic> GetRecentHistoryAsync(string symbol, string interval, int limit = 100);
    }
}