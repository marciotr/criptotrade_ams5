using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WalletApi.DTOs;
using WalletApi.Infrastructure.Data;
using WalletApi.Services;

namespace WalletApi.Controllers;

[ApiController]
[Authorize]
[Route("api/balance")]
public class BalanceController : WalletControllerBase
{
    private readonly WalletDbContext _db;
    private readonly ICurrencyCatalogClient _currencyClient;

    public BalanceController(WalletDbContext db, ICurrencyCatalogClient currencyClient, IConfiguration configuration) : base(configuration)
    {
        _db = db;
        _currencyClient = currencyClient;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var u = GetUserGuid();
        if (u == null) return Unauthorized();
        var userGuid = u.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null)
        {
            account = new WalletApi.Domain.Entities.Account { IdAccount = Guid.NewGuid(), IdUser = userGuid, AvailableBalance = 0, LockedBalance = 0, Status = "ACTIVE" };
            await _db.Accounts.AddAsync(account);
            await _db.SaveChangesAsync();
            Console.WriteLine($"[Wallet] Created missing account for user {userGuid} -> account {account.IdAccount}");
        }

        var positions = await _db.WalletPositions
            .Where(p => _db.Wallets.Any(w => w.IdWallet == p.IdWallet && w.IdAccount == account.IdAccount))
            .ToListAsync();

        var balances = positions
            .GroupBy(p => p.IdCurrency)
            .Select(g => new { IdCurrency = g.Key, Amount = g.Sum(x => x.Amount) })
            .ToList();

        var currenciesDict = new Dictionary<Guid, CurrencyCatalogItem?>();
        foreach (var b in balances)
        {
            currenciesDict[b.IdCurrency] = await _currencyClient.GetByIdAsync(b.IdCurrency);
        }

        var detailed = balances.Select(b =>
        {
            var related = positions.Where(p => p.IdCurrency == b.IdCurrency).ToList();
            decimal? avgPrice = null;
            var totalAmount = related.Sum(p => p.Amount);
            if (totalAmount > 0)
            {
                var weighted = related.Sum(p => p.Amount * (p.AvgPrice));
                avgPrice = weighted / totalAmount;
            }

            var currentPrice = currenciesDict[b.IdCurrency]?.CurrentPrice ?? 0m;
            var changePercent = currenciesDict[b.IdCurrency]?.PriceChangePercent ?? 0m;
            decimal prevPrice = currentPrice;
            if (changePercent != 0)
            {
                prevPrice = currentPrice / (1 + (changePercent / 100m));
            }

            var value = b.Amount * currentPrice;
            var prevValue = b.Amount * prevPrice;
            var gainPercentSincePurchase = (avgPrice.HasValue && avgPrice.Value > 0) ? ((currentPrice - avgPrice.Value) / avgPrice.Value) * 100m : 0m;

            return new
            {
                CurrencyId = b.IdCurrency,
                Symbol = currenciesDict[b.IdCurrency]?.Symbol,
                Amount = b.Amount,
                AvgPrice = avgPrice,
                CurrentPrice = currentPrice,
                ChangePercent = changePercent,
                Value = value,
                PrevValue = prevValue,
                GainPercentSincePurchase = gainPercentSincePurchase
            };
        }).ToList();

        var totalValue = detailed.Sum(x => x.Value);
        var totalCost = detailed.Sum(x => (x.AvgPrice ?? 0m) * x.Amount);
        var roiTotalPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100m : 0m;

        var dayChange = totalValue - totalCost;
        var dayChangePercent = totalCost > 0 ? (dayChange / totalCost) * 100m : 0m;

        var best = detailed.Where(d => d.GainPercentSincePurchase != 0m).OrderByDescending(d => d.GainPercentSincePurchase).FirstOrDefault()
                   ?? detailed.OrderByDescending(d => d.ChangePercent).FirstOrDefault();

        var bestPerformer = best == null ? null : new { symbol = best.Symbol, value = Math.Round(best.GainPercentSincePurchase != 0m ? best.GainPercentSincePurchase : best.ChangePercent, 2) };

        var summary = new
        {
            totalValue,
            dayChange = Math.Round(dayChange, 2),
            dayChangePercent = Math.Round(dayChangePercent, 2),
            bestPerformer,
            totalCost = Math.Round(totalCost, 2),
            roiTotalPercent = Math.Round(roiTotalPercent, 2)
        };

        return Ok(summary);
    }

    [HttpGet("asset/{assetSymbol}/lots")]
    public async Task<IActionResult> GetAssetLots(string assetSymbol, [FromQuery] string method = "fifo")
    {
        var u = GetUserGuid();
        if (u == null) return Unauthorized();
        var userGuid = u.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null) return NotFound(new { message = "Account not found for user" });

        var currency = await _currencyClient.GetBySymbolAsync(assetSymbol);
        if (currency == null) return NotFound(new { message = "Currency not found" });

        var walletIds = await _db.Wallets.Where(w => w.IdAccount == account.IdAccount).Select(w => w.IdWallet).ToListAsync();

        var persistedLots = await _db.WalletPositionLots
            .Where(l => walletIds.Contains(l.IdWallet) && l.IdCurrency == currency.Id)
            .OrderBy(l => l.CreatedAt)
            .ToListAsync();

        if (persistedLots != null && persistedLots.Count > 0)
        {
            var lotsOutput = persistedLots.Select(l => new
            {
                lotTransactionId = l.IdWalletPositionLot,
                acquiredAt = l.CreatedAt,
                amountBought = l.OriginalAmount,
                amountRemaining = l.RemainingAmount,
                unitPriceUsd = l.AvgPrice,
                totalCostUsd = Math.Round(l.OriginalAmount * l.AvgPrice, 8),
                unrealizedGainUsd = Math.Round(((currency.CurrentPrice - l.AvgPrice) * l.RemainingAmount), 8),
                realizedGainUsd = 0m
            }).ToList();

            var response = new
            {
                symbol = currency.Symbol,
                asset = currency.Name,
                assetSymbol = currency.Symbol,
                lots = lotsOutput,
                totalAmount = lotsOutput.Sum(x => (decimal)x.amountRemaining),
                totalUnrealizedGainUsd = lotsOutput.Sum(x => (decimal)x.unrealizedGainUsd),
                totalRealizedGainUsd = lotsOutput.Sum(x => (decimal)x.realizedGainUsd)
            };
            return Ok(response);
        }

        var txs = await _db.Transactions
            .Where(t => t.IdAccount == account.IdAccount)
            .OrderBy(t => t.CreatedAt)
            .ToListAsync();

        var tcList = await _db.TransactionCriptos
            .Where(tc => tc.IdCurrency == currency.Id && txs.Select(t => t.IdTransaction).Contains(tc.IdTransaction))
            .OrderBy(tc => tc.IdTransaction)
            .ToListAsync();

        var buys = tcList.Where(x => x.CriptoAmount > 0).OrderBy(x => x.IdTransaction).Select(x => new { x.IdTransaction, Amount = x.CriptoAmount, x.ExchangeRate }).ToList();
        var sells = tcList.Where(x => x.CriptoAmount < 0).OrderBy(x => x.IdTransaction).Select(x => new { x.IdTransaction, Amount = -x.CriptoAmount }).ToList();

        var lots = new List<object>();
        var remainingSellsAmounts = sells.Select(s => (decimal)s.Amount).ToList();

        foreach (var b in buys)
        {
            var available = b.Amount;
            for (int i = 0; i < remainingSellsAmounts.Count && available > 0; i++)
            {
                if (remainingSellsAmounts[i] <= 0) continue;
                var take = Math.Min(remainingSellsAmounts[i], available);
                remainingSellsAmounts[i] -= take;
                available -= take;
            }

            if (available > 0)
            {
                lots.Add(new
                {
                    lotTransactionId = b.IdTransaction,
                    acquiredAt = (DateTime?)null,
                    amountBought = available,
                    amountRemaining = available,
                    unitPriceUsd = b.ExchangeRate,
                    totalCostUsd = Math.Round(available * b.ExchangeRate, 8),
                    unrealizedGainUsd = Math.Round(((currency.CurrentPrice - b.ExchangeRate) * available), 8),
                    realizedGainUsd = 0m
                });
            }
        }

        var fallback = new
        {
            symbol = currency.Symbol,
            asset = currency.Name,
            assetSymbol = currency.Symbol,
            lots,
            totalAmount = lots.Sum(x => (decimal)((dynamic)x).amountRemaining),
            totalUnrealizedGainUsd = lots.Sum(x => (decimal)((dynamic)x).unrealizedGainUsd),
            totalRealizedGainUsd = 0m
        };
        return Ok(fallback);
    }

    [HttpGet]
    public async Task<IActionResult> GetBalance()
    {
        var u = GetUserGuid();
        if (u == null) return Unauthorized();
        var userGuid = u.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null) return NotFound(new { message = "Account not found for user" });

        var positions = await _db.WalletPositions
            .Where(p => _db.Wallets.Any(w => w.IdWallet == p.IdWallet && w.IdAccount == account.IdAccount))
            .ToListAsync();

        var balances = positions
            .GroupBy(p => p.IdCurrency)
            .Select(g => new { IdCurrency = g.Key, Amount = g.Sum(x => x.Amount) })
            .ToList();

        var currenciesDict = new Dictionary<Guid, CurrencyCatalogItem?>();
        foreach (var b in balances)
        {
            currenciesDict[b.IdCurrency] = await _currencyClient.GetByIdAsync(b.IdCurrency);
        }

        var result = balances.Select(b =>
        {
            var relatedPositions = positions.Where(p => p.IdCurrency == b.IdCurrency).ToList();
            decimal? avgPrice = null;
            var totalAmount = relatedPositions.Sum(p => p.Amount);
            if (totalAmount > 0)
            {
                var weighted = relatedPositions.Sum(p => p.Amount * (p.AvgPrice));
                avgPrice = weighted / totalAmount;
            }

            var current = currenciesDict[b.IdCurrency]?.CurrentPrice ?? 0m;
            return new
            {
                CurrencyId = b.IdCurrency,
                Symbol = currenciesDict[b.IdCurrency]?.Symbol,
                Name = currenciesDict[b.IdCurrency]?.Name,
                Amount = b.Amount,
                AvgPrice = avgPrice,
                CurrentPrice = current,
                Value = b.Amount * current,
                Change = currenciesDict[b.IdCurrency]?.PriceChangePercent ?? 0m
            };
        }).ToList();

        return Ok(result);
    }

    [HttpPatch("{assetSymbol}")]
    public async Task<IActionResult> AdjustBalance(string assetSymbol, [FromBody] AdjustBalanceRequest dto)
    {
        var u2 = GetUserGuid();
        if (u2 == null) return Unauthorized();
        var userGuid = u2.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null) return NotFound(new { message = "Account not found for user" });

        var currency = await _currencyClient.GetBySymbolAsync(assetSymbol);
        if (currency == null) return NotFound(new { message = "Currency not found" });

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.IdAccount == account.IdAccount);
        if (wallet == null)
        {
            wallet = new WalletApi.Domain.Entities.Wallet { IdWallet = Guid.NewGuid(), IdAccount = account.IdAccount, Name = "Default", CreatedAt = DateTime.UtcNow };
            await _db.Wallets.AddAsync(wallet);
        }

        var position = await _db.WalletPositions.FirstOrDefaultAsync(p => p.IdWallet == wallet.IdWallet && p.IdCurrency == currency.Id);
        var delta = dto.DeltaAmount;
        if (position == null)
        {
            position = new WalletApi.Domain.Entities.WalletPosition
            {
                IdWalletPosition = Guid.NewGuid(),
                IdWallet = wallet.IdWallet,
                IdCurrency = currency.Id,
                Amount = delta,
                AvgPrice = dto.UnitPriceUsd ?? currency.CurrentPrice,
                UpdatedAt = DateTime.UtcNow
            };
            await _db.WalletPositions.AddAsync(position);
        }
        else
        {
            var oldAmount = position.Amount;
            var oldAvg = position.AvgPrice;
            var newAmount = oldAmount + delta;
            if (dto.UnitPriceUsd.HasValue && newAmount > 0)
            {
                var totalOld = oldAmount * oldAvg;
                var totalNew = delta * dto.UnitPriceUsd.Value;
                position.AvgPrice = (totalOld + totalNew) / newAmount;
            }
            position.Amount = newAmount;
            position.UpdatedAt = DateTime.UtcNow;
            _db.WalletPositions.Update(position);
        }

        var tx = new WalletApi.Domain.Entities.Transaction
        {
            IdTransaction = Guid.NewGuid(),
            IdAccount = account.IdAccount,
            Type = "ADJUST",
            TotalAmount = Math.Abs(delta) * (dto.UnitPriceUsd ?? currency.CurrentPrice),
            Fee = 0,
            Status = "COMPLETED",
            CreatedAt = DateTime.UtcNow
        };

        await _db.Transactions.AddAsync(tx);

        var tc = new WalletApi.Domain.Entities.TransactionCripto
        {
            IdTransaction = tx.IdTransaction,
            IdCurrency = currency.Id,
            ExchangeRate = currency.CurrentPrice,
            CriptoAmount = delta
        };

        await _db.TransactionCriptos.AddAsync(tc);

        await _db.SaveChangesAsync();

        return Ok(new { txId = tx.IdTransaction, newAmount = position.Amount });
    }
}
