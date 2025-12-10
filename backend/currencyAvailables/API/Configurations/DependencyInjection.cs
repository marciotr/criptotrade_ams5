using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using CurrencyAvailables.Domain.Interfaces;
using CurrencyAvailables.Infrastructure.Data;
using CurrencyAvailables.Infrastructure.Repositories;
using CurrencyAvailables.Application.Interfaces;
using CurrencyAvailables.Application.Services;



    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<ICurrencyRepository, CurrencyRepository>();
            services.AddScoped<ICurrencyService, CurrencyService>();
            services.AddScoped<IHistoryRepository, HistoryRepository>();
            services.AddScoped<IHistoryService, HistoryService>();

            services.AddDbContext<CurrencyDbContext>(options =>
                options.UseSqlite("Data Source=Infrastructure/Data/currencydb.sqlite"));

            return services;
        }
    }

