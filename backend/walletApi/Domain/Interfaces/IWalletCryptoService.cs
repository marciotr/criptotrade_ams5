using System.Collections.Generic;
using System.Threading.Tasks;
using walletApi.Domain.Entities;

namespace walletApi.Domain.Interfaces
{
    public interface IWalletCryptoService
    {
        Task<IEnumerable<WalletCrypto>> GetUserWallets(int userId);
        Task<WalletCrypto> Create(int userId, string symbol, string address);
        Task<WalletCrypto> AdjustBalance(int id, decimal delta);
    }
}