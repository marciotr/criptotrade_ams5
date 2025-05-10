using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using walletApi.API.DTOs;
using walletApi.Domain.Interfaces;

namespace walletApi.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WalletCryptoController : ControllerBase
    {
        private readonly IWalletCryptoService _service;
        public WalletCryptoController(IWalletCryptoService service)
        {
            _service = service;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var list = await _service.GetUserWallets(userId);
            var dto = list.Select(w => new WalletCryptoDTO {
                Id = w.Id,
                UserId = w.UserId,
                Symbol = w.Symbol,
                Address = w.Address,
                Balance = w.Balance
            });
            return Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateWalletCryptoDTO input)
        {
            var w = await _service.Create(input.UserId, input.Symbol, input.Address);
            return CreatedAtAction(nameof(GetByUser), new { userId = w.UserId }, new WalletCryptoDTO {
                Id = w.Id,
                UserId = w.UserId,
                Symbol = w.Symbol,
                Address = w.Address,
                Balance = w.Balance
            });
        }

        [HttpPatch("{id}/balance")]
        public async Task<IActionResult> Adjust(int id, [FromQuery] decimal delta)
        {
            var w = await _service.AdjustBalance(id, delta);
            return Ok(new { w.Id, w.Balance });
        }
    }
}