using Microsoft.AspNetCore.Mvc;
using CurrencyAvailables.Application.Interfaces;
using CurrencyAvailables.Application.DTOs;
using CurrencyAvailables.Domain.Entities;

namespace CurrencyAvailables.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistoryController : ControllerBase
    {
        private readonly IHistoryService _service;

        public HistoryController(IHistoryService service)
        {
            _service = service;
        }

        [HttpGet("{currencyId:guid}")]
        public async Task<IActionResult> GetByCurrency(Guid currencyId)
        {
            var histories = await _service.GetByCurrencyIdAsync(currencyId);
            var result = histories.Select(h => new HistoryDto
            {
                Id = h.Id,
                CurrencyId = h.CurrencyId,
                DateTimeAt = h.DateTimeAt,
                Value = h.Value
            });

            return Ok(result);
        }

        [HttpGet("{currencyId:guid}/range")]
        public async Task<IActionResult> GetByDateRange(Guid currencyId, [FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            var histories = await _service.GetByDateRangeAsync(currencyId, from, to);
            var result = histories.Select(h => new HistoryDto
            {
                Id = h.Id,
                CurrencyId = h.CurrencyId,
                DateTimeAt = h.DateTimeAt,
                Value = h.Value
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] HistoryDto dto)
        {
            var history = new History(dto.CurrencyId, dto.DateTimeAt, dto.Value);
            if (history.CurrencyId == Guid.Empty)
            {
                return BadRequest("Currency ID is required.");
            }
            await _service.AddAsync(history);
            return Created("", dto);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
