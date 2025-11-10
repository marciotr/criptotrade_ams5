using System.Threading.Tasks;
using WalletApi2.Domain.Entities;

namespace WalletApi2.Domain.Interfaces
{
    public interface IWalletService
    {
        Task<Wallet> CreateWalletForUserAsync(int userId);
        Task<Wallet> GetWalletByUserIdAsync(int userId);
    }
}
