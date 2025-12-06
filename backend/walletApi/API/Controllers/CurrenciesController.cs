using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WalletApi.Application.Interfaces;

namespace WalletApi.API.Controllers;

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
