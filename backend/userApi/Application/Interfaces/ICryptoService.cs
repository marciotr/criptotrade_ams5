using userApi.API.DTOs;

namespace userApi.Application.Interfaces
{
    public interface ICryptoService
    {
        Task<List<CryptoPriceDTO>> GetAllPricesAsync();
        Task<CryptoPriceDTO> GetPriceAsync(string symbol);
    }
}