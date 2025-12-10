using System;

namespace CurrencyAvailables.Application.DTOs
{
    public class CurrencyDto
    {
        public Guid Id { get; set; }
        public string Symbol { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        // public string Description { get; set; } = string.Empty;
        public string Backing { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public List<HistoryDto> Histories { get; set; } = new();
    }
}