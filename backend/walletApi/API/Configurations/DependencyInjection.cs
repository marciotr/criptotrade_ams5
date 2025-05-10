using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using walletApi.Domain.Interfaces;
using walletApi.Infrastructure.Data;
using walletApi.Infrastructure.Repositories;
using walletApi.Services;

namespace walletApi.API.Configurations
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddDbContext<WalletDbContext>(options =>
                options.UseSqlite("Data Source=Infrastructure/Data/walletdb.sqlite"));

            services.AddScoped<IWalletFiatRepository, WalletFiatRepository>();
            services.AddScoped<IWalletCryptoRepository, WalletCryptoRepository>();

            services.AddScoped<IWalletCryptoService, WalletCryptoService>();
            services.AddScoped<IWalletFiatService,   WalletFiatService  >();

            return services;
        }
    }
}