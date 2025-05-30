using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CurrencyAvailables.Application.Interfaces;
using CurrencyAvailables.Domain.Entities;
using CurrencyAvailables.Domain.Interfaces;

namespace CurrencyAvailables.Application.Services
{
    public class HistoryService : IHistoryService
    {
        private readonly IHistoryRepository _repository;

        public HistoryService(IHistoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<History>> GetByCurrencyIdAsync(Guid currencyId)
        {
            return await _repository.GetByCurrencyIdAsync(currencyId);
        }

        public async Task<IEnumerable<History>> GetByDateRangeAsync(Guid currencyId, DateTime from, DateTime to)
        {
            return await _repository.GetByDateRangeAsync(currencyId, from, to);
        }

        public async Task AddAsync(History history)
        {
            await _repository.AddAsync(history);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id);
        }
    }
}
