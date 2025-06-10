using System;
using System.Collections.Generic;

namespace CurrencyAvailables.Domain.Entities
{ 
    public class Currency
    {
        public Guid Id { get; set; }
        public string Symbol { get; set; } = null!;
        public string Name { get; set; } = null!;
        // public string Description { get; set; } = null!;
        public string Backing { get; set; } = null!;
        public string Status { get; set; } = null!;
        
        private readonly List<History> _histories = new();
        public IReadOnlyCollection<History> Histories => _histories.AsReadOnly();

        public Currency(string symbol, string name, /*string description, */ string backing, string status)
        {
            Id = Guid.NewGuid();
            // SetDescription(description);
            SetSymbol(symbol);
            SetName(name);
            SetBacking(backing);
            SetStatus(status);
        }

        public void AddHistory(History history)
        {
            if (history == null)
                throw new ArgumentNullException(nameof(history));
            
            if (history.CurrencyId != Id)
                throw new InvalidOperationException("History currency ID mismatch.");

            _histories.Add(history);
        }

        private void SetSymbol(string symbol)
        {
            if (string.IsNullOrWhiteSpace(symbol))
                throw new ArgumentException("Symbol is required.");

            Symbol = symbol.ToUpper();
        }

        public void SetName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name cannot be null or empty.", nameof(name));

            Name = name;
        }

        // public void SetDescription(string description)
        // {
        //     if (string.IsNullOrWhiteSpace(description))
        //         throw new ArgumentException("Description cannot be null or empty.", nameof(description));

        //     Description = description;
        // }

        public void SetBacking(string backing)
        {
            if (string.IsNullOrWhiteSpace(backing))
                throw new ArgumentException("Backing cannot be null or empty.", nameof(backing));

            Backing = backing;
        }

        public void SetStatus(string status)
        {
            Status = status;
        }
    }
}

