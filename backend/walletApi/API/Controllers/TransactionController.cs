using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WalletApi2.API.DTOs;

namespace WalletApi2.API.Controllers
{
    [ApiController]
    [Route("api/transactions")]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        [HttpPost("deposit/fiat")]
        public IActionResult DepositFiat([FromBody] FiatTransactionRequest request)
        {
            if (request == null) return BadRequest();
            return Ok(new { message = "Fiat deposited", request.Amount, request.Currency });
        }

        [HttpPost("withdraw/fiat")]
        public IActionResult WithdrawFiat([FromBody] FiatTransactionRequest request)
        {
            if (request == null) return BadRequest();
            return Ok(new { message = "Fiat withdrawn", request.Amount, request.Currency });
        }

        [HttpPost("buy")]
        public IActionResult Buy([FromBody] BuySellRequest request)
        {
            if (request == null) return BadRequest();
            return Ok(new { message = "Buy executed (mock)", request.WalletId, request.AssetSymbol, request.Amount });
        }

        [HttpPost("swap")]
        public IActionResult Swap([FromBody] SwapRequest request)
        {
            if (request == null) return BadRequest();
            return Ok(new { message = "Swap executed (mock)", request.WalletId, request.FromAsset, request.ToAsset, request.Amount });
        }

        [HttpPost("sell")]
        public IActionResult Sell([FromBody] BuySellRequest request)
        {
            if (request == null) return BadRequest();
            return Ok(new { message = "Sell executed (mock)", request.WalletId, request.AssetSymbol, request.Amount });
        }

        [HttpGet]
        public IActionResult History()
        {
            var list = new List<object>
            {
                new { id = 1, type = "deposit", asset = "USD", amount = 100m },
                new { id = 2, type = "buy", asset = "BTC", amount = 0.001m }
            };

            return Ok(list);
        }
    }
}
