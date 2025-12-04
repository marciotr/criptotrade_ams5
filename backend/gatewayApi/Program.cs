using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
          // Durante desenvolvimento permitimos qualquer origem para facilitar testes locais.
          // Em produção substitua por origens específicas e remova AllowAnyOrigin.
          policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Use CORS antes do Ocelot


// Add Ocelot services to the container
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
builder.Services.AddOcelot();
// Register request-logging middleware as a service (avoid inline lambdas to be Hot Reload safe)
builder.Services.AddTransient<RequestLoggingMiddleware>();

var app = builder.Build();

app.UseCors("AllowFrontend");

// teste
// Use typed middleware instead of inline lambda to prevent HotReload lambda deletion errors
app.UseMiddleware<RequestLoggingMiddleware>();

app.UseOcelot().Wait();

app.Run();

