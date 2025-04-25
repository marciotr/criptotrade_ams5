using System.Collections.Generic;
using System.Threading.Tasks;
using walletApi.Domain.Entities;

namespace walletApi.Domain.Interfaces
{
    public interface IWalletService
    {
        Task<IEnumerable<Wallet>> GetAllWalletsAsync();
        Task<Wallet> GetWalletByIdAsync(int id);
        Task<IEnumerable<Wallet>> GetWalletsByUserIdAsync(int userId);
        Task<Wallet> CreateWalletAsync(Wallet wallet);
        Task<bool> UpdateWalletBalanceAsync(int walletId, decimal amount);
        
        Task<IEnumerable<Transaction>> GetTransactionsByWalletIdAsync(int walletId);
        Task<Transaction> AddTransactionAsync(int walletId, Transaction transaction);
    }
}