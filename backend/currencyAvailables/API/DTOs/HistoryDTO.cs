using System;

namespace CurrencyAvailables.Application.DTOs
{
    public class HistoryDto
    {
        public Guid Id { get; set; }
        public Guid CurrencyId { get; set; }
        public DateTime DateTimeAt { get; set; }
        public decimal Value { get; set; }
    }
}
