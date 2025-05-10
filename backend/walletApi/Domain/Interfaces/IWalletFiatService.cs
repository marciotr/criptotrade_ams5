using System.Collections.Generic;
using System.Threading.Tasks;
using walletApi.Domain.Entities;

namespace walletApi.Domain.Interfaces
{
    public interface IWalletFiatService
    {
        Task<IEnumerable<WalletFiat>> GetUserWallets(int userId);
        Task<WalletFiat> Create(int userId, string currency);
        Task<WalletFiat> AdjustBalance(int id, decimal delta);
    }
}