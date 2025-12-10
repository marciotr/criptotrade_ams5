using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WalletApi.API.DTOs;
using WalletApi.Application.Interfaces;
using WalletApi.Infrastructure.Data;

namespace WalletApi.API.Controllers;

[ApiController]
[Authorize]
[Route("api/wallets")]
public class WalletsController : WalletControllerBase
{
    private readonly WalletDbContext _db;
    private readonly ICurrencyCatalogClient _currencyClient;

    public WalletsController(WalletDbContext db, ICurrencyCatalogClient currencyClient, IConfiguration configuration) : base(configuration)
    {
        _db = db;
        _currencyClient = currencyClient;
    }

    [HttpGet]
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

    [HttpPost]
    public async Task<IActionResult> CreateWallet([FromBody] CreateWalletRequest dto)
    {
        var u = GetUserGuid();
        if (u == null) return Unauthorized();
        var userGuid = u.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null)
        {
            account = new WalletApi.Domain.Entities.Account
            {
                IdAccount = Guid.NewGuid(),
                IdUser = userGuid,
                AvailableBalance = 0,
                LockedBalance = 0,
                Status = "ACTIVE"
            };
            await _db.Accounts.AddAsync(account);
        }

        var wallet = new WalletApi.Domain.Entities.Wallet
        {
            IdWallet = Guid.NewGuid(),
            IdAccount = account.IdAccount,
            Name = dto?.Name ?? "Default",
            CreatedAt = DateTime.UtcNow
        };
        await _db.Wallets.AddAsync(wallet);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetWalletById), new { id = wallet.IdWallet }, wallet);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetWalletById(Guid id)
    {
        var w = await _db.Wallets.FindAsync(id);
        if (w == null) return NotFound();
        return Ok(w);
    }

    [HttpGet("{id}/balances")]
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

    [HttpGet("~/api/positions/{walletId}")]
    public async Task<IActionResult> GetPositions(Guid walletId)
    {
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
}
