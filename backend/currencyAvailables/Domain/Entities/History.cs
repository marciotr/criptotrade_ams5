namespace Domain.Entities
{
    public class History
    {
        public Guid Id { get; set; }
        public int CurrencyId { get; set; }
        public DateTime DateTime { get; set; }
        public decimal Value { get; set; }

        public Currency Currency { get; set; } = null!;

        public History(Guid currencyId, DateTime dateTime, decimal value)
        {
            Id = Guid.NewGuid();
            setCurrencyId(currencyId);
            setDateTime(dateTime);
            setValue(value);
        }

        private void setCurrencyId(Guid currencyId)
        {
            if (currencyId == Guid.Empty)
                throw new ArgumentException("Currency ID cannot be empty.", nameof(currencyId));

            CurrencyId = currencyId;
        }

        private void setDateTime(DateTime dateTime)
        {
            if (dateTime == default)
                throw new ArgumentException("DateTime cannot be default.", nameof(dateTime));

            DateTime = dateTime;
        }

        private void setValue(decimal value)
        {
            if (value <= 0)
                throw new ArgumentException("Value must be greater than zero.", nameof(value));

            Value = value;
        }

    }
}
