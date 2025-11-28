using Microsoft.EntityFrameworkCore;
using WalletApi.Infrastructure.Data;
using WalletApi.DTOs;
using WalletApi.Domain.Entities;

namespace WalletApi.Services;

public class WalletService : IWalletService
{
    private readonly WalletDbContext _db;

    public WalletService(WalletDbContext db)
    {
        _db = db;
    }

    public async Task<OperationResult> BuyAsync(BuyRequest dto)
    {
        using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var currency = await _db.Currencies.FindAsync(dto.IdCurrency);
            if (currency == null) return OperationResult.Failure("Currency not found");

            var account = await _db.Accounts.FindAsync(dto.IdAccount);
            if (account == null) return OperationResult.Failure("Account not found");

            var tDebit = new Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = dto.IdAccount,
                Type = "BUY_DEBIT",
                TotalAmount = dto.FiatAmount,
                Fee = dto.Fee,
                Status = "COMPLETED",
                CreatedAt = DateTime.UtcNow
            };

            var criptoAmount = (dto.FiatAmount - dto.Fee) / currency.CurrentPrice;

            var tCredit = new Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = dto.IdAccount,
                Type = "BUY_CREDIT",
                TotalAmount = dto.FiatAmount,
                Fee = 0,
                Status = "COMPLETED",
                CreatedAt = DateTime.UtcNow,
                RelatedTransactionId = tDebit.IdTransaction
            };

            tDebit.RelatedTransactionId = tCredit.IdTransaction;

            await _db.Transactions.AddRangeAsync(tDebit, tCredit);

            var tc = new TransactionCripto
            {
                IdTransaction = tCredit.IdTransaction,
                IdCurrency = dto.IdCurrency,
                ExchangeRate = currency.CurrentPrice,
                CriptoAmount = criptoAmount
            };

            await _db.TransactionCriptos.AddAsync(tc);

            // update wallet position
            var position = await _db.WalletPositions
                .FirstOrDefaultAsync(p => p.IdWallet == dto.IdWallet && p.IdCurrency == dto.IdCurrency);

            if (position == null)
            {
                position = new WalletPosition
                {
                    IdWalletPosition = Guid.NewGuid(),
                    IdWallet = dto.IdWallet,
                    IdCurrency = dto.IdCurrency,
                    Amount = criptoAmount,
                    AvgPrice = currency.CurrentPrice,
                    UpdatedAt = DateTime.UtcNow
                };
                await _db.WalletPositions.AddAsync(position);
            }
            else
            {
                var totalValueOld = position.Amount * position.AvgPrice;
                var totalValueNew = criptoAmount * currency.CurrentPrice;
                var newAmount = position.Amount + criptoAmount;
                position.AvgPrice = newAmount > 0 ? (totalValueOld + totalValueNew) / newAmount : currency.CurrentPrice;
                position.Amount = newAmount;
                position.UpdatedAt = DateTime.UtcNow;
                _db.WalletPositions.Update(position);
            }

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return OperationResult.Ok(new { DebitTransaction = tDebit.IdTransaction, CreditTransaction = tCredit.IdTransaction });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return OperationResult.Failure(ex.Message);
        }
    }

    public async Task<OperationResult> SellAsync(SellRequest dto)
    {
        using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var position = await _db.WalletPositions
                .FirstOrDefaultAsync(p => p.IdWallet == dto.IdWallet && p.IdCurrency == dto.IdCurrency);
            if (position == null || position.Amount < dto.CriptoAmount)
                return OperationResult.Failure("Insufficient crypto amount");

            var currency = await _db.Currencies.FindAsync(dto.IdCurrency);
            if (currency == null) return OperationResult.Failure("Currency not found");

            var tDebit = new Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = dto.IdAccount,
                Type = "SELL_DEBIT",
                TotalAmount = dto.CriptoAmount * currency.CurrentPrice,
                Fee = dto.Fee,
                Status = "COMPLETED",
                CreatedAt = DateTime.UtcNow
            };

            var tCredit = new Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = dto.IdAccount,
                Type = "SELL_CREDIT",
                TotalAmount = dto.CriptoAmount * currency.CurrentPrice - dto.Fee,
                Fee = 0,
                Status = "COMPLETED",
                CreatedAt = DateTime.UtcNow,
                RelatedTransactionId = tDebit.IdTransaction
            };

            tDebit.RelatedTransactionId = tCredit.IdTransaction;

            await _db.Transactions.AddRangeAsync(tDebit, tCredit);

            var tc = new TransactionCripto
            {
                IdTransaction = tDebit.IdTransaction,
                IdCurrency = dto.IdCurrency,
                ExchangeRate = currency.CurrentPrice,
                CriptoAmount = -dto.CriptoAmount
            };

            await _db.TransactionCriptos.AddAsync(tc);

            // update position
            position.Amount -= dto.CriptoAmount;
            position.UpdatedAt = DateTime.UtcNow;
            _db.WalletPositions.Update(position);

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return OperationResult.Ok(new { DebitTransaction = tDebit.IdTransaction, CreditTransaction = tCredit.IdTransaction });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return OperationResult.Failure(ex.Message);
        }
    }

    public async Task<OperationResult> SwapAsync(SwapRequest dto)
    {
        using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var currencyA = await _db.Currencies.FindAsync(dto.IdCurrencyOut);
            var currencyB = await _db.Currencies.FindAsync(dto.IdCurrencyIn);
            if (currencyA == null || currencyB == null) return OperationResult.Failure("Currency not found");

            var positionA = await _db.WalletPositions
                .FirstOrDefaultAsync(p => p.IdWallet == dto.IdWallet && p.IdCurrency == dto.IdCurrencyOut);
            if (positionA == null || positionA.Amount < dto.AmountOut)
                return OperationResult.Failure("Insufficient amount for swap");

            // determine fiat-equivalent value
            var fiatValue = dto.AmountOut * currencyA.CurrentPrice;
            var amountIn = fiatValue / currencyB.CurrentPrice; // basic conversion

            var tOut = new Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = dto.IdAccount,
                Type = "SWAP_OUT",
                TotalAmount = fiatValue,
                Fee = dto.Fee,
                Status = "COMPLETED",
                CreatedAt = DateTime.UtcNow
            };

            var tIn = new Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = dto.IdAccount,
                Type = "SWAP_IN",
                TotalAmount = fiatValue,
                Fee = 0,
                Status = "COMPLETED",
                CreatedAt = DateTime.UtcNow,
                RelatedTransactionId = tOut.IdTransaction
            };

            tOut.RelatedTransactionId = tIn.IdTransaction;

            await _db.Transactions.AddRangeAsync(tOut, tIn);

            var tcOut = new TransactionCripto
            {
                IdTransaction = tOut.IdTransaction,
                IdCurrency = dto.IdCurrencyOut,
                ExchangeRate = currencyA.CurrentPrice,
                CriptoAmount = -dto.AmountOut
            };

            var tcIn = new TransactionCripto
            {
                IdTransaction = tIn.IdTransaction,
                IdCurrency = dto.IdCurrencyIn,
                ExchangeRate = currencyB.CurrentPrice,
                CriptoAmount = amountIn
            };

            await _db.TransactionCriptos.AddRangeAsync(tcOut, tcIn);

            // update positions
            positionA.Amount -= dto.AmountOut;
            positionA.UpdatedAt = DateTime.UtcNow;
            _db.WalletPositions.Update(positionA);

            var positionB = await _db.WalletPositions
                .FirstOrDefaultAsync(p => p.IdWallet == dto.IdWallet && p.IdCurrency == dto.IdCurrencyIn);

            if (positionB == null)
            {
                positionB = new WalletPosition
                {
                    IdWalletPosition = Guid.NewGuid(),
                    IdWallet = dto.IdWallet,
                    IdCurrency = dto.IdCurrencyIn,
                    Amount = amountIn,
                    AvgPrice = currencyB.CurrentPrice,
                    UpdatedAt = DateTime.UtcNow
                };
                await _db.WalletPositions.AddAsync(positionB);
            }
            else
            {
                var totalValueOld = positionB.Amount * positionB.AvgPrice;
                var totalValueNew = amountIn * currencyB.CurrentPrice;
                var newAmount = positionB.Amount + amountIn;
                positionB.AvgPrice = newAmount > 0 ? (totalValueOld + totalValueNew) / newAmount : currencyB.CurrentPrice;
                positionB.Amount = newAmount;
                positionB.UpdatedAt = DateTime.UtcNow;
                _db.WalletPositions.Update(positionB);
            }

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return OperationResult.Ok(new { OutTransaction = tOut.IdTransaction, InTransaction = tIn.IdTransaction });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return OperationResult.Failure(ex.Message);
        }
    }
}
