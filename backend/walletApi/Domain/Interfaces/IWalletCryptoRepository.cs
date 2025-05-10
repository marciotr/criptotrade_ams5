using System.Collections.Generic;
using System.Threading.Tasks;
using walletApi.Domain.Entities;

namespace walletApi.Domain.Interfaces
{
    public interface IWalletCryptoRepository
    {
        Task<WalletCrypto?> GetByIdAsync(int id);
        Task<IEnumerable<WalletCrypto>> GetByUserAsync(int userId);
        Task<WalletCrypto> CreateAsync(WalletCrypto wallet);
        Task<WalletCrypto> UpdateAsync(WalletCrypto wallet);
    }
}