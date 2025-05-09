using System.Collections.Generic;
using System.Threading.Tasks;
using walletApi.Domain.Entities;

namespace walletApi.Domain.Interfaces
{
    public interface IWalletRepository
    {
        Task<IEnumerable<Wallet>> GetAllAsync();
        Task<Wallet> GetByIdAsync(int id);
        Task<IEnumerable<Wallet>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Wallet>> GetByUserIdAndTypeAsync(int userId, WalletType type);
        Task<Wallet> AddAsync(Wallet wallet);
        Task<Wallet> UpdateAsync(Wallet wallet);
        Task<bool> DeleteAsync(int id);
        Task<Transaction> AddTransactionAsync(Transaction transaction);
        Task<IEnumerable<Transaction>> GetTransactionsAsync(int walletId);
        Task<IEnumerable<Transaction>> GetRecentTransactionsAsync(int walletId, int count = 10);
    }
}