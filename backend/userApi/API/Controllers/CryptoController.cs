using Microsoft.AspNetCore.Mvc;
using userApi.Application.Interfaces;
using userApi.API.DTOs;

namespace userApi.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CryptoController : ControllerBase
    {
        private readonly ICryptoService _cryptoService;

        public CryptoController(ICryptoService cryptoService)
        {
            _cryptoService = cryptoService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPrices()
        {
            var prices = await _cryptoService.GetAllPricesAsync();
            return Ok(prices);
        }

        [HttpGet("{symbol}")]
        public async Task<IActionResult> GetPrice(string symbol)
        {
            var price = await _cryptoService.GetPriceAsync(symbol);
            return Ok(price);
        }
    }
}