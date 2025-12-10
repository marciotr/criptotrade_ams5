using WalletApi.API.DTOs;

namespace WalletApi.Application.Interfaces;

public interface IWalletService
{
    Task<OperationResult> BuyAsync(BuyRequest dto);
    Task<OperationResult> SellAsync(SellRequest dto);
    Task<OperationResult> SwapAsync(SwapRequest dto);
}
