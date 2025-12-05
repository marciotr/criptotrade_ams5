    using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;
using WalletApi.DTOs;
using WalletApi.Services;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

namespace WalletApi.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public class WalletController : ControllerBase
{
    private readonly IWalletService _service;
    private readonly WalletApi.Infrastructure.Data.WalletDbContext _db;
    private readonly ICurrencyCatalogClient _currencyClient;
    private readonly IConfiguration _configuration;

    public WalletController(IWalletService service, WalletApi.Infrastructure.Data.WalletDbContext db, ICurrencyCatalogClient currencyClient, IConfiguration configuration)
    {
        _service = service;
        _db = db;
        _currencyClient = currencyClient;
        _configuration = configuration;
    }

    private Guid? GetUserGuid()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"[Wallet] User.Identity.IsAuthenticated={User?.Identity?.IsAuthenticated}; NameIdentifierClaim={userIdClaim}");
            if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var g)) return g;

            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var numericId))
            {
                var bytes = new byte[16];
                var idBytes = BitConverter.GetBytes(numericId);
                Array.Copy(idBytes, 0, bytes, 0, Math.Min(idBytes.Length, bytes.Length));
                var deterministicGuid = new Guid(bytes);
                Console.WriteLine($"[Wallet] NameIdentifier was numeric ({numericId}). Using deterministic GUID {deterministicGuid} as user id fallback.");
                return deterministicGuid;
            }

            if (Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                var auth = authHeader.ToString();
                Console.WriteLine($"[Wallet] Authorization header present (truncated)={(string.IsNullOrEmpty(auth) ? "<empty>" : auth.Length > 50 ? auth.Substring(0,50) : auth)}");
                if (auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    var token = auth.Substring("Bearer ".Length).Trim();
                    try
                    {
                        var key = _configuration["Jwt:Key"];
                        var issuer = _configuration["Jwt:Issuer"];
                        var audience = _configuration["Jwt:Audience"];
                        if (string.IsNullOrEmpty(key))
                        {
                            Console.WriteLine("[Wallet] Jwt:Key is not configured");
                            return null;
                        }
                        var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                        var validationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidateLifetime = true,
                            ValidateIssuerSigningKey = true,
                            ValidIssuer = issuer,
                            ValidAudience = audience,
                            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
                        };

                        var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
                        var claim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        Console.WriteLine($"[Wallet] Token validated; NameIdentifier from token={claim}");
                        if (!string.IsNullOrEmpty(claim) && Guid.TryParse(claim, out var g2)) return g2;

                        if (!string.IsNullOrEmpty(claim) && int.TryParse(claim, out var numeric2))
                        {
                            var bytes2 = new byte[16];
                            var idBytes2 = BitConverter.GetBytes(numeric2);
                            Array.Copy(idBytes2, 0, bytes2, 0, Math.Min(idBytes2.Length, bytes2.Length));
                            var deterministicGuid2 = new Guid(bytes2);
                            Console.WriteLine($"[Wallet] Token NameIdentifier numeric fallback -> {deterministicGuid2}");
                            return deterministicGuid2;
                        }

                        var email = principal.FindFirst(ClaimTypes.Email)?.Value;
                        if (!string.IsNullOrEmpty(email)) Console.WriteLine($"[Wallet] Token email claim={email}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Wallet] Token validation failed: {ex.Message}");
                        return null;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Wallet] GetUserGuid unexpected error: {ex.Message}");
        }

        return null;
    }

    [HttpPost("transactions/buy")]
    public async Task<IActionResult> Buy([FromBody] BuyRequest dto)
    {
        var u = GetUserGuid();
        if (u != null)
        {
            var userGuid = u.Value;
            var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
            if (account != null)
            {
                if (dto.IdAccount == Guid.Empty) dto.IdAccount = account.IdAccount;
                if (dto.IdWallet == Guid.Empty)
                {
                    var w = await _db.Wallets.FirstOrDefaultAsync(x => x.IdAccount == account.IdAccount);
                    if (w != null) dto.IdWallet = w.IdWallet;
                }
            }
        }

        var result = await _service.BuyAsync(dto);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Data);
    }

    [HttpPost("transactions/sell")]
    public async Task<IActionResult> Sell([FromBody] SellRequest dto)
    {
        var u2 = GetUserGuid();
        if (u2 != null)
        {
            var userGuid = u2.Value;
            var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
            if (account != null)
            {
                if (dto.IdAccount == Guid.Empty) dto.IdAccount = account.IdAccount;
                if (dto.IdWallet == Guid.Empty)
                {
                    var w = await _db.Wallets.FirstOrDefaultAsync(x => x.IdAccount == account.IdAccount);
                    if (w != null) dto.IdWallet = w.IdWallet;
                }
            }
        }

        var result = await _service.SellAsync(dto);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Data);
    }

    [HttpPost("transactions/swap")]
    public async Task<IActionResult> Swap([FromBody] SwapRequest dto)
    {
        var u3 = GetUserGuid();
        if (u3 != null)
        {
            var userGuid = u3.Value;
            var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
            if (account != null)
            {
                if (dto.IdAccount == Guid.Empty) dto.IdAccount = account.IdAccount;
                if (dto.IdWallet == Guid.Empty)
                {
                    var w = await _db.Wallets.FirstOrDefaultAsync(x => x.IdAccount == account.IdAccount);
                    if (w != null) dto.IdWallet = w.IdWallet;
                }
            }
        }

        var result = await _service.SwapAsync(dto);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Data);
    }

    // GET api/wallet/wallets?accountId={accountId}
    [HttpGet("wallets")]
    public async Task<IActionResult> GetWallets([FromQuery] Guid? accountId)
    {
        if (accountId == null)
        {
            var all = await _db.Wallets.ToListAsync();
            return Ok(all);
        }
        var list = await _db.Wallets.Where(w => w.IdAccount == accountId).ToListAsync();
        return Ok(list);
    }

    // POST api/wallets
    [HttpPost("wallets")]
    public async Task<IActionResult> CreateWallet([FromBody] DTOs.CreateWalletRequest dto)
    {
        var u = GetUserGuid();
        if (u == null) return Unauthorized();
        var userGuid = u.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null)
        {
            account = new Domain.Entities.Account { IdAccount = Guid.NewGuid(), IdUser = userGuid, AvailableBalance = 0, LockedBalance = 0, Status = "ACTIVE" };
            await _db.Accounts.AddAsync(account);
        }

        var wallet = new Domain.Entities.Wallet { IdWallet = Guid.NewGuid(), IdAccount = account.IdAccount, Name = dto?.Name ?? "Default", CreatedAt = DateTime.UtcNow };
        await _db.Wallets.AddAsync(wallet);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetWalletById), new { id = wallet.IdWallet }, wallet);
    }

    // GET api/wallet/wallets/{id}
    [HttpGet("wallets/{id}")]
    public async Task<IActionResult> GetWalletById(Guid id)
    {
        var w = await _db.Wallets.FindAsync(id);
        if (w == null) return NotFound();
        return Ok(w);
    }

    // GET api/wallet/positions/{walletId}
    [HttpGet("positions/{walletId}")]
    public async Task<IActionResult> GetPositions(Guid walletId)
    {
        // Buscar posições da carteira e enriquecer com dados do catálogo de moedas
        var positions = await _db.WalletPositions.Where(p => p.IdWallet == walletId).ToListAsync();
        var currencyIds = positions.Select(p => p.IdCurrency).Distinct().ToList();
        var currencies = new Dictionary<Guid, CurrencyCatalogItem?>();
        foreach (var id in currencyIds)
        {
            currencies[id] = await _currencyClient.GetByIdAsync(id);
        }

        var result = positions.Select(p => new
        {
            p.IdWalletPosition,
            p.IdWallet,
            p.IdCurrency,
            CurrencySymbol = currencies.TryGetValue(p.IdCurrency, out var c) && c != null ? c.Symbol : null,
            CurrencyName = currencies.TryGetValue(p.IdCurrency, out c) && c != null ? c.Name : null,
            p.Amount,
            p.AvgPrice,
            Change = currencies.TryGetValue(p.IdCurrency, out c) && c != null ? (c.PriceChangePercent) : 0m,
            p.UpdatedAt
        }).ToList();

        return Ok(result);
    }

    // GET api/wallet/transactions?accountId={accountId}
    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions([FromQuery] Guid? accountId)
    {
        var q = _db.Transactions.AsQueryable();
        if (accountId != null) q = q.Where(t => t.IdAccount == accountId);
        var list = await q.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return Ok(list);
    }

    // GET api/wallet/transactions/{id}
    [HttpGet("transactions/{id}")]
    public async Task<IActionResult> GetTransactionById(Guid id)
    {
        var tx = await _db.Transactions.FindAsync(id);
        if (tx == null) return NotFound();

        var cripto = await _db.TransactionCriptos.FindAsync(id);
        var fiat = await _db.TransactionFiats.FindAsync(id);

        return Ok(new { tx, cripto, fiat });
    }

    // GET api/wallet/currencies
    [AllowAnonymous]
    [HttpGet("currencies")]
    public async Task<IActionResult> GetCurrencies()
    {
        var all = await _currencyClient.GetAllAsync();
        return Ok(all);
    }

    // GET api/balance/summary
    [HttpGet("balance/summary")]
    public async Task<IActionResult> GetSummary()
    {
        var u = GetUserGuid();
        if (u == null) return Unauthorized();
        var userGuid = u.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null)
        {
            // create a default account for this user id fallback so the route behaves consistently
            account = new Domain.Entities.Account { IdAccount = Guid.NewGuid(), IdUser = userGuid, AvailableBalance = 0, LockedBalance = 0, Status = "ACTIVE" };
            await _db.Accounts.AddAsync(account);
            await _db.SaveChangesAsync();
            Console.WriteLine($"[Wallet] Created missing account for user {userGuid} -> account {account.IdAccount}");
        }

        // load positions into memory to aggregate on client side (workaround for SQLite Sum(decimal) limitation)
        var positions = await _db.WalletPositions
            .Where(p => _db.Wallets.Any(w => w.IdWallet == p.IdWallet && w.IdAccount == account.IdAccount))
            .ToListAsync();

        var balances = positions
            .GroupBy(p => p.IdCurrency)
            .Select(g => new { IdCurrency = g.Key, Amount = g.Sum(x => x.Amount) })
            .ToList();

        // buscar dados do catálogo para os ids presentes nas posições
        var currenciesDict = new Dictionary<Guid, CurrencyCatalogItem?>();
        foreach (var b in balances)
        {
            currenciesDict[b.IdCurrency] = await _currencyClient.GetByIdAsync(b.IdCurrency);
        }

        // constroi uma informação da média de compra por moeda
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
                // infer previous price 24h ago from percent (approximate)
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
        // custo total baseado nos preços médios de compra
        var totalCost = detailed.Sum(x => (x.AvgPrice ?? 0m) * x.Amount);
        var roiTotalPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100m : 0m;

        var dayChange = totalValue - totalCost;
        var dayChangePercent = totalCost > 0 ? (dayChange / totalCost) * 100m : 0m;

        // melhor performance por porcentagem não por preço
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

    [HttpGet("balance/asset/{assetSymbol}/lots")]
    public async Task<IActionResult> GetAssetLots(string assetSymbol, [FromQuery] string method = "fifo")
    {
        var u = GetUserGuid();
        
        if (u == null) return Unauthorized();
        var userGuid = u.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null) return NotFound(new { message = "Account not found for user" });

        var currency = await _currencyClient.GetBySymbolAsync(assetSymbol);
        if (currency == null) return NotFound(new { message = "Currency not found" });
        // Primeiro tenta obter lotes persistidos (WalletPositionLots). Se existirem, usa-os.
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
                // ganho não realizado baseado no preço atual do catálogo
                unrealizedGainUsd = Math.Round(((currency.CurrentPrice - l.AvgPrice) * l.RemainingAmount), 8),
                // realized gain não é calculado por lote aqui (padrão 0, pode ser melhorado)
                realizedGainUsd = 0m
            }).ToList();

            var response = new { symbol = currency.Symbol, asset = currency.Name, assetSymbol = currency.Symbol, lots = lotsOutput, totalAmount = lotsOutput.Sum(x => (decimal)x.amountRemaining), totalUnrealizedGainUsd = lotsOutput.Sum(x => (decimal)x.unrealizedGainUsd), totalRealizedGainUsd = lotsOutput.Sum(x => (decimal)x.realizedGainUsd) };
            return Ok(response);
        }

        // Fallback: calcula lotes a partir do histórico de transações (compatibilidade com implementações antigas)
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
                lots.Add(new { lotTransactionId = b.IdTransaction, acquiredAt = (DateTime?)null, amountBought = available, amountRemaining = available, unitPriceUsd = b.ExchangeRate, totalCostUsd = Math.Round(available * b.ExchangeRate, 8), unrealizedGainUsd = Math.Round(((currency.CurrentPrice - b.ExchangeRate) * available), 8), realizedGainUsd = 0m });
            }
        }

        var fallback = new { symbol = currency.Symbol, asset = currency.Name, assetSymbol = currency.Symbol, lots, totalAmount = lots.Sum(x => (decimal)((dynamic)x).amountRemaining), totalUnrealizedGainUsd = lots.Sum(x => (decimal)((dynamic)x).unrealizedGainUsd), totalRealizedGainUsd = 0m };
        return Ok(fallback);
    }

    // POST api/transactions (generic)
    [HttpPost("transactions")]
    public async Task<IActionResult> CreateTransaction([FromBody] dynamic payload)
    {
        try
        {
            Guid accountId = Guid.Empty;
            if (payload.IdAccount != null) accountId = Guid.Parse((string)payload.IdAccount.ToString());

            var tx = new Domain.Entities.Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = accountId,
                Type = payload.Type ?? "GENERIC",
                TotalAmount = payload.TotalAmount != null ? (decimal)payload.TotalAmount : 0m,
                Fee = payload.Fee != null ? (decimal)payload.Fee : 0m,
                Status = payload.Status ?? "PENDING",
                CreatedAt = DateTime.UtcNow
            };

            await _db.Transactions.AddAsync(tx);
            await _db.SaveChangesAsync();
            return Ok(new { txId = tx.IdTransaction });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // GET api/wallets/{id}/balances
    [HttpGet("wallets/{id}/balances")]
    public async Task<IActionResult> GetWalletBalances(Guid id)
    {
        var w = await _db.Wallets.FindAsync(id);
        if (w == null) return NotFound();

        var positions = await _db.WalletPositions.Where(p => p.IdWallet == id).ToListAsync();
        var currencyIds = positions.Select(p => p.IdCurrency).Distinct().ToList();
        var currencies = new Dictionary<Guid, CurrencyCatalogItem?>();
        foreach (var cid in currencyIds)
        {
            currencies[cid] = await _currencyClient.GetByIdAsync(cid);
        }

        var result = positions.Select(p => new
        {
            p.IdWalletPosition,
            p.IdWallet,
            p.IdCurrency,
            CurrencySymbol = currencies.TryGetValue(p.IdCurrency, out var c) && c != null ? c.Symbol : null,
            CurrencyName = currencies.TryGetValue(p.IdCurrency, out c) && c != null ? c.Name : null,
            p.Amount,
            p.AvgPrice,
            p.UpdatedAt
        }).ToList();

        return Ok(result);
    }

    // GET api/balance
    [HttpGet("balance")]
    public async Task<IActionResult> GetBalance()
    {
        var u = GetUserGuid();
        if (u == null) return Unauthorized();
        var userGuid = u.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null) return NotFound(new { message = "Account not found for user" });

        // load positions into memory first to avoid SQLite decimal Sum translation issues
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

    // PATCH api/balance/{assetSymbol}
    [HttpPatch("balance/{assetSymbol}")]
    public async Task<IActionResult> AdjustBalance(string assetSymbol, [FromBody] DTOs.AdjustBalanceRequest dto)
    {
        var u2 = GetUserGuid();
        if (u2 == null) return Unauthorized();
        var userGuid = u2.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null) return NotFound(new { message = "Account not found for user" });

        var currency = await _currencyClient.GetBySymbolAsync(assetSymbol);
        if (currency == null) return NotFound(new { message = "Currency not found" });

        // get or create a default wallet for the account
        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.IdAccount == account.IdAccount);
        if (wallet == null)
        {
            wallet = new Domain.Entities.Wallet { IdWallet = Guid.NewGuid(), IdAccount = account.IdAccount, Name = "Default", CreatedAt = DateTime.UtcNow };
            await _db.Wallets.AddAsync(wallet);
        }

        var position = await _db.WalletPositions.FirstOrDefaultAsync(p => p.IdWallet == wallet.IdWallet && p.IdCurrency == currency.Id);
        var delta = dto.DeltaAmount;
        if (position == null)
        {
            position = new Domain.Entities.WalletPosition
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

        // create a simple transaction record for audit
        var tx = new Domain.Entities.Transaction
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

        var tc = new Domain.Entities.TransactionCripto
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

    // POST api/transactions/deposit/fiat
    [HttpPost("transactions/deposit/fiat")]
    public async Task<IActionResult> DepositFiat([FromBody] DTOs.DepositFiatRequest dto)
    {
        var u3 = GetUserGuid();
        if (u3 == null) return Unauthorized();
        var userGuid = u3.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null)
        {
            account = new Domain.Entities.Account { IdAccount = Guid.NewGuid(), IdUser = userGuid, AvailableBalance = 0, LockedBalance = 0, Status = "ACTIVE" };
            await _db.Accounts.AddAsync(account);
        }

        // localizar moeda fiat já autorizada no catálogo, normalizando o símbolo
        var symbol = (dto.Currency ?? string.Empty).Trim().ToUpperInvariant();
        if (string.IsNullOrEmpty(symbol))
        {
            return BadRequest(new { message = "Moeda obrigatória" });
        }

        var currency = await _currencyClient.GetBySymbolAsync(symbol);
        if (currency == null)
        {
            return BadRequest(new { message = "Moeda não autorizada pela plataforma" });
        }

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.IdAccount == account.IdAccount);
        if (wallet == null)
        {
            wallet = new Domain.Entities.Wallet { IdWallet = Guid.NewGuid(), IdAccount = account.IdAccount, Name = "Default", CreatedAt = DateTime.UtcNow };
            await _db.Wallets.AddAsync(wallet);
        }

        var tx = new Domain.Entities.Transaction
        {
            IdTransaction = Guid.NewGuid(),
            IdAccount = account.IdAccount,
            Type = "DEPOSIT_FIAT",
            TotalAmount = dto.Amount,
            Fee = 0,
            Status = "COMPLETED",
            CreatedAt = DateTime.UtcNow
        };
        await _db.Transactions.AddAsync(tx);

        var tf = new Domain.Entities.TransactionFiat
        {
            IdTransaction = tx.IdTransaction,
            Provider = dto.Method ?? "INTERNAL",
            PaymentMethod = dto.Method,
            PaymentInfo = dto.ReferenceId,
            ExternalRef = dto.ReferenceId
        };
        await _db.TransactionFiats.AddAsync(tf);

        // add fiat to wallet position (use currency entry)
        var position = await _db.WalletPositions.FirstOrDefaultAsync(p => p.IdWallet == wallet.IdWallet && p.IdCurrency == currency.Id);
        if (position == null)
        {
            position = new Domain.Entities.WalletPosition { IdWalletPosition = Guid.NewGuid(), IdWallet = wallet.IdWallet, IdCurrency = currency.Id, Amount = dto.Amount, AvgPrice = 1m, UpdatedAt = DateTime.UtcNow };
            await _db.WalletPositions.AddAsync(position);
        }
        else
        {
            position.Amount += dto.Amount;
            position.UpdatedAt = DateTime.UtcNow;
            _db.WalletPositions.Update(position);
        }

        account.AvailableBalance += dto.Amount;
        _db.Accounts.Update(account);

        await _db.SaveChangesAsync();

        return Ok(new { txId = tx.IdTransaction });
    }

    // POST api/transactions/withdraw/fiat
    [HttpPost("transactions/withdraw/fiat")]
    public async Task<IActionResult> WithdrawFiat([FromBody] DTOs.WithdrawFiatRequest dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
        if (!Guid.TryParse(userIdClaim, out var userGuid)) return Unauthorized();

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null) return NotFound(new { message = "Account not found" });

        var currency = await _currencyClient.GetBySymbolAsync(dto.Currency);
        if (currency == null) return NotFound(new { message = "Currency not found" });

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.IdAccount == account.IdAccount);
        if (wallet == null) return NotFound(new { message = "Wallet not found" });

        var position = await _db.WalletPositions.FirstOrDefaultAsync(p => p.IdWallet == wallet.IdWallet && p.IdCurrency == currency.Id);
        if (position == null || position.Amount < dto.Amount) return BadRequest(new { message = "Saldo Insuficiente!" });

        // create transaction
        var tx = new Domain.Entities.Transaction
        {
            IdTransaction = Guid.NewGuid(),
            IdAccount = account.IdAccount,
            Type = "WITHDRAW_FIAT",
            TotalAmount = dto.Amount,
            Fee = 0,
            Status = "COMPLETED",
            CreatedAt = DateTime.UtcNow
        };
        await _db.Transactions.AddAsync(tx);

        var tf = new Domain.Entities.TransactionFiat
        {
            IdTransaction = tx.IdTransaction,
            Provider = dto.Method ?? "INTERNAL",
            PaymentMethod = dto.Method,
            PaymentInfo = dto.Destination,
            ExternalRef = null
        };
        await _db.TransactionFiats.AddAsync(tf);

        position.Amount -= dto.Amount;
        position.UpdatedAt = DateTime.UtcNow;
        _db.WalletPositions.Update(position);

        await _db.SaveChangesAsync();

        return Ok(new { txId = tx.IdTransaction });
    }
}
