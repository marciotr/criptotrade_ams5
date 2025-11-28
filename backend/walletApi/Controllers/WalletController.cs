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
    private readonly IConfiguration _configuration;

    public WalletController(IWalletService service, WalletApi.Infrastructure.Data.WalletDbContext db, IConfiguration configuration)
    {
        _service = service;
        _db = db;
        _configuration = configuration;
    }

    private Guid? GetUserGuid()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var g)) return g;

        if (Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            var auth = authHeader.ToString();
            if (auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                var token = auth.Substring("Bearer ".Length).Trim();
                try
                {
                    var key = _configuration["Jwt:Key"];
                    var issuer = _configuration["Jwt:Issuer"];
                    var audience = _configuration["Jwt:Audience"];
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
                    if (!string.IsNullOrEmpty(claim) && Guid.TryParse(claim, out var g2)) return g2;
                }
                catch
                {
                    return null;
                }
            }
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
        var positions = await _db.WalletPositions
            .Where(p => p.IdWallet == walletId)
            .Join(_db.Currencies, p => p.IdCurrency, c => c.IdCurrency, (p, c) => new {
                p.IdWalletPosition,
                p.IdWallet,
                p.IdCurrency,
                CurrencySymbol = c.Symbol,
                CurrencyName = c.Name,
                p.Amount,
                p.AvgPrice,
                p.UpdatedAt
            }).ToListAsync();
        return Ok(positions);
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
        var list = await _db.Currencies.ToListAsync();
        return Ok(list);
    }

    // GET api/balance/summary
    [HttpGet("balance/summary")]
    public async Task<IActionResult> GetSummary()
    {
        var u = GetUserGuid();
        if (u == null) return Unauthorized();
        var userGuid = u.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null) return NotFound(new { message = "Account not found for user" });

        var balances = await _db.WalletPositions
            .Where(p => _db.Wallets.Any(w => w.IdWallet == p.IdWallet && w.IdAccount == account.IdAccount))
            .GroupBy(p => p.IdCurrency)
            .Select(g => new { IdCurrency = g.Key, Amount = g.Sum(x => x.Amount) })
            .ToListAsync();

        var detailed = (from b in balances
                        join c in _db.Currencies on b.IdCurrency equals c.IdCurrency
                        select new
                        {
                            CurrencyId = b.IdCurrency,
                            Symbol = c.Symbol,
                            Amount = b.Amount,
                            CurrentPrice = c.CurrentPrice,
                            Value = b.Amount * c.CurrentPrice
                        }).ToList();

        var totalValue = detailed.Sum(x => x.Value);

        var summary = new
        {
            totalValue,
            dayChange = 0m,
            dayChangePercent = 0m,
            bestPerformer = detailed.OrderByDescending(x => x.Value).FirstOrDefault()
        };

        return Ok(summary);
    }

    // GET api/balance/asset/{assetSymbol}/lots
    [HttpGet("balance/asset/{assetSymbol}/lots")]
    public async Task<IActionResult> GetAssetLots(string assetSymbol, [FromQuery] string method = "fifo")
    {
        var u = GetUserGuid();
        if (u == null) return Unauthorized();
        var userGuid = u.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null) return NotFound(new { message = "Account not found for user" });

        var currency = await _db.Currencies.FirstOrDefaultAsync(c => c.Symbol.ToUpper() == assetSymbol.ToUpper());
        if (currency == null) return NotFound(new { message = "Currency not found" });

        // gather transaction cripto entries for user's transactions
        var txs = await _db.Transactions
            .Where(t => t.IdAccount == account.IdAccount)
            .OrderBy(t => t.CreatedAt)
            .ToListAsync();

        var tcList = await _db.TransactionCriptos
            .Where(tc => tc.IdCurrency == currency.IdCurrency && txs.Select(t => t.IdTransaction).Contains(tc.IdTransaction))
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
                lots.Add(new { TxId = b.IdTransaction, Amount = available, UnitPrice = b.ExchangeRate });
            }
        }

        return Ok(new { symbol = currency.Symbol, lots });
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

        var positions = await _db.WalletPositions
            .Where(p => p.IdWallet == id)
            .Join(_db.Currencies, p => p.IdCurrency, c => c.IdCurrency, (p, c) => new {
                p.IdWalletPosition,
                p.IdWallet,
                p.IdCurrency,
                CurrencySymbol = c.Symbol,
                CurrencyName = c.Name,
                p.Amount,
                p.AvgPrice,
                p.UpdatedAt
            }).ToListAsync();

        return Ok(positions);
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

        var balances = await _db.WalletPositions
            .Where(p => _db.Wallets.Any(w => w.IdWallet == p.IdWallet && w.IdAccount == account.IdAccount))
            .GroupBy(p => p.IdCurrency)
            .Select(g => new {
                IdCurrency = g.Key,
                Amount = g.Sum(x => x.Amount)
            })
            .ToListAsync();

        var result = from b in balances
                     join c in _db.Currencies on b.IdCurrency equals c.IdCurrency
                     select new {
                         CurrencyId = b.IdCurrency,
                         Symbol = c.Symbol,
                         Name = c.Name,
                         Amount = b.Amount,
                         AvgPrice = (decimal?)null,
                         CurrentPrice = c.CurrentPrice,
                         Value = b.Amount * c.CurrentPrice
                     };

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

        var currency = await _db.Currencies.FirstOrDefaultAsync(c => c.Symbol.ToUpper() == assetSymbol.ToUpper());
        if (currency == null) return NotFound(new { message = "Currency not found" });

        // get or create a default wallet for the account
        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.IdAccount == account.IdAccount);
        if (wallet == null)
        {
            wallet = new Domain.Entities.Wallet { IdWallet = Guid.NewGuid(), IdAccount = account.IdAccount, Name = "Default", CreatedAt = DateTime.UtcNow };
            await _db.Wallets.AddAsync(wallet);
        }

        var position = await _db.WalletPositions.FirstOrDefaultAsync(p => p.IdWallet == wallet.IdWallet && p.IdCurrency == currency.IdCurrency);
        var delta = dto.DeltaAmount;
        if (position == null)
        {
            position = new Domain.Entities.WalletPosition
            {
                IdWalletPosition = Guid.NewGuid(),
                IdWallet = wallet.IdWallet,
                IdCurrency = currency.IdCurrency,
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
            IdCurrency = currency.IdCurrency,
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

        // find or create currency (fiat)
        var currency = await _db.Currencies.FirstOrDefaultAsync(c => c.Symbol.ToUpper() == dto.Currency.ToUpper());
        if (currency == null)
        {
            currency = new Domain.Entities.Currency { IdCurrency = Guid.NewGuid(), Symbol = dto.Currency.ToUpper(), Name = dto.Currency.ToUpper(), CurrentPrice = 1m };
            await _db.Currencies.AddAsync(currency);
        }

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.IdAccount == account.IdAccount);
        if (wallet == null)
        {
            wallet = new Domain.Entities.Wallet { IdWallet = Guid.NewGuid(), IdAccount = account.IdAccount, Name = "Default", CreatedAt = DateTime.UtcNow };
            await _db.Wallets.AddAsync(wallet);
        }

        // create transaction
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
        var position = await _db.WalletPositions.FirstOrDefaultAsync(p => p.IdWallet == wallet.IdWallet && p.IdCurrency == currency.IdCurrency);
        if (position == null)
        {
            position = new Domain.Entities.WalletPosition { IdWalletPosition = Guid.NewGuid(), IdWallet = wallet.IdWallet, IdCurrency = currency.IdCurrency, Amount = dto.Amount, AvgPrice = 1m, UpdatedAt = DateTime.UtcNow };
            await _db.WalletPositions.AddAsync(position);
        }
        else
        {
            position.Amount += dto.Amount;
            position.UpdatedAt = DateTime.UtcNow;
            _db.WalletPositions.Update(position);
        }

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

        var currency = await _db.Currencies.FirstOrDefaultAsync(c => c.Symbol.ToUpper() == dto.Currency.ToUpper());
        if (currency == null) return NotFound(new { message = "Currency not found" });

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.IdAccount == account.IdAccount);
        if (wallet == null) return NotFound(new { message = "Wallet not found" });

        var position = await _db.WalletPositions.FirstOrDefaultAsync(p => p.IdWallet == wallet.IdWallet && p.IdCurrency == currency.IdCurrency);
        if (position == null || position.Amount < dto.Amount) return BadRequest(new { message = "Insufficient balance" });

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
