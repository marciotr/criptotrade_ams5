using System.Collections.Generic;
using System.Threading.Tasks;
using walletApi.Domain.Entities;

namespace walletApi.Domain.Interfaces
{
    public interface IWalletService
    {
        Task<IEnumerable<Wallet>> GetAllWalletsAsync();
        Task<Wallet> GetWalletByIdAsync(int id);
        Task<IEnumerable<Wallet>> GetUserWalletsAsync(int userId);
        Task<IEnumerable<Wallet>> GetUserWalletsByTypeAsync(int userId, WalletType type);
        Task<Wallet> CreateWalletAsync(Wallet wallet);
        Task<Wallet> UpdateWalletAsync(Wallet wallet);
        Task<bool> DeleteWalletAsync(int id);
        Task<Transaction> AddTransactionAsync(int walletId, Transaction transaction);
        Task<IEnumerable<Transaction>> GetWalletTransactionsAsync(int walletId);
        Task<IEnumerable<Transaction>> GetRecentTransactionsAsync(int walletId, int count = 10);
    }
}