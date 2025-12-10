using Microsoft.AspNetCore.Mvc;
using CurrencyAvailables.Application.Interfaces;
using CurrencyAvailables.Application.DTOs;
using CurrencyAvailables.Domain.Entities;

namespace CurrencyAvailables.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CurrencyController : ControllerBase
    {
        private readonly ICurrencyService _service;

        public CurrencyController(ICurrencyService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var currencies = await _service.GetAllAsync();
            var result = currencies.Select(c => new CurrencyDto
            {
                Id = c.Id,
                Symbol = c.Symbol,
                Name = c.Name,
                Backing = c.Backing,
                Status = c.Status,
                Histories = c.Histories.Select(h => new HistoryDto
                {
                    Id = h.Id,
                    CurrencyId = h.CurrencyId,
                    DateTimeAt = h.DateTimeAt,
                    Value = h.Value
                }).ToList()
            });

            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var currency = await _service.GetByIdAsync(id);
            if (currency == null) return NotFound();

            return Ok(new CurrencyDto
            {
                Id = currency.Id,
                Symbol = currency.Symbol,
                Name = currency.Name,
                Backing = currency.Backing,
                Status = currency.Status, 
                Histories = currency.Histories.Select(h => new HistoryDto
                {
                    Id = h.Id,
                    CurrencyId = h.CurrencyId,
                    DateTimeAt = h.DateTimeAt,
                    Value = h.Value
                }).ToList()
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CurrencyDto dto)
        {
            Currency currency;
            if (dto.Id != Guid.Empty)
            {
                currency = new Currency(dto.Id, dto.Symbol, dto.Name, dto.Backing, dto.Status);
            }
            else
            {
                currency = new Currency(dto.Symbol, dto.Name, dto.Backing, dto.Status);
            }

            await _service.AddAsync(currency);
            return CreatedAtAction(nameof(GetById), new { id = currency.Id }, dto);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CurrencyDto dto)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();

            // Atualizar a entidade existente em vez de criar uma nova
            existing.SetName(dto.Name);
            existing.SetSymbol(dto.Symbol);
            existing.SetBacking(dto.Backing);
            existing.SetStatus(dto.Status);

            await _service.UpdateAsync(existing);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();

            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
