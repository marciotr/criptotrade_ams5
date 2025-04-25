using walletApi.Domain.Interfaces;
using walletApi.Infrastructure.Data;
using walletApi.Infrastructure.Repositories;
using walletApi.Application.Services;
using Microsoft.EntityFrameworkCore;

namespace walletApi.API.Configurations
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IWalletRepository, WalletRepository>();
            services.AddScoped<IWalletService, WalletService>();
            services.AddDbContext<WalletDbContext>(options =>
                options.UseSqlite("Data Source=Infrastructure/Data/walletdb.sqlite"));
            return services;
        }
    }
}