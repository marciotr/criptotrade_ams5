using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CurrencyAvailables.Domain.Entities;

namespace CurrencyAvailables.Domain.Interfaces
{
    public interface IHistoryRepository
    {
        Task<History?> GetByIdAsync(Guid id);
        Task<IEnumerable<History>> GetByCurrencyIdAsync(Guid currencyId);
        Task<IEnumerable<History>> GetByDateRangeAsync(Guid currencyId, DateTime from, DateTime to);
        Task AddAsync(History history);
        Task DeleteAsync(Guid id);
    }
}
