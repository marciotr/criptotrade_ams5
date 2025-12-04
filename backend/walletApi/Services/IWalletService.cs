using WalletApi.DTOs;

namespace WalletApi.Services;

public interface IWalletService
{
    Task<OperationResult> BuyAsync(BuyRequest dto);
    Task<OperationResult> SellAsync(SellRequest dto);
    Task<OperationResult> SwapAsync(SwapRequest dto);
}
