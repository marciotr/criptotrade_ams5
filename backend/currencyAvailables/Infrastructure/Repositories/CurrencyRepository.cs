using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CurrencyAvailables.Domain.Entities;
using CurrencyAvailables.Domain.Interfaces;
using CurrencyAvailables.Infrastructure.Data;

namespace CurrencyAvailables.Infrastructure.Repositories
{
    public class CurrencyRepository : ICurrencyRepository
    {
        private readonly CurrencyDbContext _context;

        public CurrencyRepository(CurrencyDbContext context)
        {
            _context = context;
        }

        public async Task<Currency?> GetByIdAsync(Guid id)
        {
            return await _context.Currencies
                .Include(c => c.Histories)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Currency?> GetBySymbolAsync(string symbol)
        {
            return await _context.Currencies
                .Include(c => c.Histories)
                .FirstOrDefaultAsync(c => c.Symbol == symbol.ToUpper());
        }

        public async Task<IEnumerable<Currency>> GetAllAsync()
        {
            return await _context.Currencies
                .Include(c => c.Histories)
                .ToListAsync();
        }

        public async Task AddAsync(Currency currency)
        {
            await _context.Currencies.AddAsync(currency);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Currency currency)
        {
            var existingEntity = await _context.Currencies.FindAsync(currency.Id);
            if (existingEntity != null)
            {
                _context.Entry(existingEntity).CurrentValues.SetValues(currency);
            }
            else
            {
                _context.Currencies.Update(currency);
            }
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var currency = await _context.Currencies.FindAsync(id);
            if (currency != null)
            {
                _context.Currencies.Remove(currency);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Currencies.AnyAsync(c => c.Id == id);
        }
    }
}
