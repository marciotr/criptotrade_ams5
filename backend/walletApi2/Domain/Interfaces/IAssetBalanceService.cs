using System.Threading.Tasks;

namespace WalletApi2.Domain.Interfaces
{
    public interface IAssetBalanceService
    {
        Task<bool> AdjustBalanceAtomicAsync(int userId, string assetSymbol, decimal deltaAmount);
    }
}
