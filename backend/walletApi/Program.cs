using Microsoft.EntityFrameworkCore;
using walletApi.Infrastructure.Data;
using walletApi.Domain.Interfaces;   
using walletApi.Infrastructure.Repositories;
using walletApi.Services;
using walletApi.API.Configurations;  

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy
          .WithOrigins("http://localhost:5173")   
          .AllowAnyHeader()
          .AllowAnyMethod();
    });
});

builder.Services.AddApplicationServices();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Wallet API",
        Version = "v1",
        Description = "API para gerenciamento de carteiras Fiat e Crypto"
    });
});

var app = builder.Build();

// força a criação do banco e das tabelas SQLite
using(var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<WalletDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors("AllowReactApp");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Wallet API V1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
