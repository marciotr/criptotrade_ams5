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
        private readonly IHistoryService _historyService;
        private readonly ICurrencyService _currencyService;

        public HistoryController(IHistoryService historyService, ICurrencyService currencyService)
        {
            _historyService = historyService;
            _currencyService = currencyService;
        }

        [HttpGet("{currencyId:guid}/range")]
        public async Task<IActionResult> GetByDateRange(Guid currencyId, [FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            var histories = await _historyService.GetByDateRangeAsync(currencyId, from, to);
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
            if (!await _currencyService.ExistsAsync(dto.CurrencyId))
            {
                return BadRequest($"Currency with Id {dto.CurrencyId} does not exist.");
            }

            var history = new History(dto.CurrencyId, dto.DateTimeAt, dto.Value);

            await _historyService.AddAsync(history);
            return CreatedAtAction(nameof(GetById), new { id = history.Id }, history);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _historyService.DeleteAsync(id);
            return NoContent();
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var history = await _historyService.GetByCurrencyIdAsync(id);
            if (history == null) return NotFound();

            return Ok(history);
        }
    }
}