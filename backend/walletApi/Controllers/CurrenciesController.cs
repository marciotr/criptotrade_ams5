using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WalletApi.Services;

namespace WalletApi.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/currencies")]
public class CurrenciesController : ControllerBase
{
    private readonly ICurrencyCatalogClient _currencyClient;

    public CurrenciesController(ICurrencyCatalogClient currencyClient)
    {
        _currencyClient = currencyClient;
    }

    [HttpGet]
    public async Task<IActionResult> GetCurrencies()
    {
        var all = await _currencyClient.GetAllAsync();
        return Ok(all);
    }
}
