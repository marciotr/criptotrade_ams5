using System.Collections.Generic;
using System.Threading.Tasks;
using walletApi.Domain.Entities;

namespace walletApi.Domain.Interfaces
{
    public interface IWalletFiatRepository
    {
        Task<WalletFiat?> GetByIdAsync(int id);
        Task<IEnumerable<WalletFiat>> GetByUserAsync(int userId);
        Task<WalletFiat> CreateAsync(WalletFiat wallet);
        Task<WalletFiat> UpdateAsync(WalletFiat wallet);
    }
}