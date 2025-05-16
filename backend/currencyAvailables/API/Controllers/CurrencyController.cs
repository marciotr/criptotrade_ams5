using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class CurrencyController : ControllerBase
{
    private readonly ICurrencyService _service;

    public CurrencyController(ICurrencyService service)
    {
        _service = service;
    }

    [HttpPost]
    public IActionResult RegisterCurrency(CurrencyDTO currencyDto)
    {
        var result = _service.RegisterCurrency(currencyDto);
        return Ok(result);
    }

    [HttpGet]
    public IActionResult GetAllCurrencies()
    {
        var currencies = _service.GetAllCurrencies();
        return Ok(currencies);
    }

    [HttpGet("{id}")]
    public IActionResult GetCurrencyById(int id)
    {
        var currency = _service.GetCurrencyById(id);
        return currency != null ? Ok(currency) : NotFound();
    }

    [HttpPut("{id}")]
    public IActionResult UpdateCurrency(int id, CurrencyDTO currencyDto)
    {
        var updatedCurrency = _service.UpdateCurrency(id, currencyDto);
        return updatedCurrency != null ? Ok(updatedCurrency) : NotFound();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteCurrency(int id)
    {
        var result = _service.DeleteCurrency(id);
        return result ? NoContent() : NotFound();
    }
}
