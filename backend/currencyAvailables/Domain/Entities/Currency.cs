using System;
using System.Collections.Generic;

namespace CurrencyAvailables.Domain.Entities
{ 
    public class Currency
    {
        public Guid Id { get; private set; }
        public string Symbol { get; private set; } = null!;
        public string Name { get; private set; } = null!;
        public string Backing { get; private set; } = null!;
        public string Status { get; private set; } = null!;
        
        private readonly List<History> _histories = new();
        public IReadOnlyCollection<History> Histories => _histories.AsReadOnly();

        protected Currency() { } // Construtor vazio para EF Core

        public Currency(string symbol, string name, string backing, string status)
        {
            Id = Guid.NewGuid();
            SetSymbol(symbol);
            SetName(name);
            SetBacking(backing);
            SetStatus(status);
        }

        // Novo construtor que permite especificar o Id (útil para sincronização de catálogos)
        public Currency(Guid id, string symbol, string name, string backing, string status)
        {
            Id = id;
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

        public void AddHistories(IEnumerable<History> histories)
        {
            if (histories == null)
                throw new ArgumentNullException(nameof(histories));

            foreach (var history in histories)
            {
                AddHistory(history);
            }
        }

        // Alterando de private para public
        public void SetSymbol(string symbol)
        {
            if (string.IsNullOrWhiteSpace(symbol))
                throw new ArgumentException("Symbol is required.", nameof(symbol));

            Symbol = symbol.ToUpper();
        }

        // Alterando de private para public
        public void SetName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name cannot be null or empty.", nameof(name));

            Name = name;
        }

        // Alterando de private para public
        public void SetBacking(string backing)
        {
            if (string.IsNullOrWhiteSpace(backing))
                throw new ArgumentException("Backing cannot be null or empty.", nameof(backing));

            Backing = backing;
        }

        // Alterando de private para public
        public void SetStatus(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Status cannot be null or empty.", nameof(status));
                
            Status = status;
        }
    }
}

