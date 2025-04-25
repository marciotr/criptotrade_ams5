using System.Collections.Generic;
using System.Threading.Tasks;
using walletApi.Domain.Entities;

namespace walletApi.Domain.Interfaces
{
    public interface IWalletRepository
    {
        Task<IEnumerable<Wallet>> GetAllWalletsAsync();
        Task<Wallet> GetWalletByIdAsync(int id);
        Task<IEnumerable<Wallet>> GetWalletsByUserIdAsync(int userId);
        Task<Wallet> GetWalletByUserAndCurrencyAsync(int userId, string currency);
        Task<Wallet> CreateWalletAsync(Wallet wallet);
        Task UpdateWalletAsync(Wallet wallet);
        Task<bool> WalletExistsAsync(int id);
        
        Task<IEnumerable<Transaction>> GetTransactionsByWalletIdAsync(int walletId);
        Task<Transaction> AddTransactionAsync(Transaction transaction);
    }
}